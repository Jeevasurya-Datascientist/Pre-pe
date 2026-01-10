/**
 * Recharge Service - Core recharge processing logic
 * Uses explicit types for DB operations
 */

import { supabase } from '@/integrations/supabase/client';
import type { RechargeRequest, ApiResponse, Transaction, BillDetails } from '@/types/recharge.types';
import * as walletService from './wallet.service';
import { performRecharge, fetchTransactionStatus } from './kwikApiService';

interface TransactionRow {
  id: string;
  user_id: string;
  type: string;
  service_type: string;
  amount: number;
  status: string;
  operator_id: string | null;
  operator_name: string | null;
  mobile_number: string | null;
  dth_id: string | null;
  reference_id: string | null;
  api_transaction_id: string | null;
  commission: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Process a recharge request
 */
export async function processRecharge(
  userId: string,
  request: RechargeRequest
): Promise<ApiResponse<Transaction | null>> {
  // Step 1: Validate input
  if (!request.operator_id || !request.amount) {
    return {
      status: 'FAILED',
      transaction_id: '',
      message: 'Invalid request: operator and amount are required',
      data: null,
    };
  }

  if (!request.mobile_number && !request.dth_id) {
    return {
      status: 'FAILED',
      transaction_id: '',
      message: 'Mobile number or DTH ID is required',
      data: null,
    };
  }

  // Step 2: Check wallet balance
  const wallet = await walletService.getWalletBalance(userId);
  if (!wallet) {
    return {
      status: 'FAILED',
      transaction_id: '',
      message: 'Wallet not found',
      data: null,
    };
  }

  const availableBalance = wallet.balance - wallet.locked_balance;
  if (availableBalance < request.amount) {
    return {
      status: 'FAILED',
      transaction_id: '',
      message: 'Insufficient wallet balance',
      data: null,
    };
  }

  // Create transaction record
  const { data: transaction, error: txError } = await supabase
    .from('transactions' as never)
    .insert({
      user_id: userId,
      type: 'RECHARGE',
      service_type: request.dth_id ? 'DTH' : 'MOBILE_PREPAID',
      amount: request.amount,
      status: 'PENDING',
      operator_id: request.operator_id,
      mobile_number: request.mobile_number,
      dth_id: request.dth_id,
      metadata: { plan_id: request.plan_id, offer_code: request.offer_code },
    } as never)
    .select()
    .single();

  if (txError || !transaction) {
    console.error('Error creating transaction:', txError);
    return {
      status: 'FAILED',
      transaction_id: '',
      message: 'Failed to create transaction',
      data: null,
    };
  }

  const txRow = transaction as unknown as TransactionRow;

  // Step 3: Lock amount in wallet
  const locked = await walletService.lockAmount(userId, request.amount, txRow.id);
  if (!locked) {
    await updateTransactionStatus(txRow.id, 'FAILED', 'Failed to lock wallet amount');
    return {
      status: 'FAILED',
      transaction_id: txRow.id,
      message: 'Failed to lock wallet amount',
      data: null,
    };
  }

  // Step 4: Call Recharge API (placeholder)
  const apiResponse = await processRechargeApi(request, txRow.id);

  // Step 5: Handle response
  if (apiResponse.status === 'SUCCESS') {
    await walletService.confirmDebit(userId, request.amount, txRow.id);
    await updateTransactionStatus(txRow.id, 'SUCCESS', apiResponse.message, apiResponse.transaction_id);

    return {
      status: 'SUCCESS',
      transaction_id: txRow.id,
      message: 'Recharge successful',
      data: { ...txRow, status: 'SUCCESS' } as unknown as Transaction,
    };
  } else if (apiResponse.status === 'PENDING') {
    await updateTransactionStatus(txRow.id, 'PENDING', 'Recharge is being processed', apiResponse.transaction_id);

    return {
      status: 'PENDING',
      transaction_id: txRow.id,
      message: 'Recharge is being processed. Please check status later.',
      data: { ...txRow, status: 'PENDING' } as unknown as Transaction,
    };
  } else {
    await walletService.refundAmount(userId, request.amount, txRow.id);
    await updateTransactionStatus(txRow.id, 'FAILED', apiResponse.message);

    return {
      status: 'FAILED',
      transaction_id: txRow.id,
      message: apiResponse.message || 'Recharge failed',
      data: null,
    };
  }
}

/**
 * Process bill payment
 */
export async function processPostpaidBill(
  userId: string,
  billDetails: BillDetails
): Promise<ApiResponse<Transaction | null>> {
  const wallet = await walletService.getWalletBalance(userId);
  if (!wallet || wallet.balance - wallet.locked_balance < billDetails.amount) {
    return {
      status: 'FAILED',
      transaction_id: '',
      message: 'Insufficient wallet balance',
      data: null,
    };
  }

  const { data: transaction, error } = await supabase
    .from('transactions' as never)
    .insert({
      user_id: userId,
      type: 'BILL_PAYMENT',
      service_type: 'MOBILE_POSTPAID',
      amount: billDetails.amount,
      status: 'PENDING',
      operator_id: billDetails.operator_id,
      mobile_number: billDetails.mobile_number,
      reference_id: billDetails.bill_number,
    } as never)
    .select()
    .single();

  if (error || !transaction) {
    return {
      status: 'FAILED',
      transaction_id: '',
      message: 'Failed to create transaction',
      data: null,
    };
  }

  const txRow = transaction as unknown as TransactionRow;

  await walletService.lockAmount(userId, billDetails.amount, txRow.id);

  // Create numeric order ID for API
  const numericOrderId = `${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const apiResult = await import('./kwikApiService').then(m => m.payBill({
    number: billDetails.mobile_number, // Postpaid uses mobile number as consumer number
    amount: billDetails.amount,
    operator_id: billDetails.operator_id,
    order_id: numericOrderId,
    mobile: billDetails.mobile_number, // Customer mobile
    reference_id: billDetails.bill_number !== 'NA' ? billDetails.bill_number : undefined
  }));

  if (apiResult.status === 'SUCCESS' || apiResult.status === 'PENDING') {
    await walletService.confirmDebit(userId, billDetails.amount, txRow.id);
    await updateTransactionStatus(
      txRow.id,
      apiResult.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
      apiResult.message || 'Bill payment processing',
      apiResult.response?.order_id
    );

    return {
      status: apiResult.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
      transaction_id: txRow.id,
      message: apiResult.message || 'Bill payment processing',
      data: { ...txRow, status: apiResult.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING' } as unknown as Transaction,
    };
  } else {
    // Reverse wallet transaction if API failed
    // Note: confirmDebit was not called yet, so we just need to unlock/refund relative to the lock.
    // Actually lockAmount subtracts from available balance. refundAmount adds it back.
    await walletService.refundAmount(userId, billDetails.amount, txRow.id);
    await updateTransactionStatus(txRow.id, 'FAILED', apiResult.message || 'Bill payment failed');

    return {
      status: 'FAILED',
      transaction_id: txRow.id,
      message: apiResult.message || 'Bill payment failed',
      data: null,
    };
  }
}

/**
 * Fetch bill details for postpaid
 */
export async function fetchBillDetails(
  operatorId: string,
  mobileNumber: string
): Promise<ApiResponse<BillDetails | null>> {
  // TODO: Replace with real API call
  return {
    status: 'SUCCESS',
    transaction_id: '',
    message: 'Bill fetched successfully',
    data: {
      bill_number: `BILL${Date.now()}`,
      bill_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 500) + 200,
      customer_name: 'John Doe',
      operator_id: operatorId,
      mobile_number: mobileNumber,
    },
  };
}

/**
 * PLACEHOLDER: Call external recharge API
 */
/**
 * Call external recharge API via KwikAPI
 */
async function processRechargeApi(
  request: RechargeRequest,
  transactionId: string
): Promise<ApiResponse<{ api_ref: string }>> {
  if ((!request.mobile_number && !request.dth_id) || !request.amount) {
    return {
      status: 'FAILED',
      transaction_id: '',
      message: 'Invalid recharge request data',
      data: { api_ref: '' },
    };
  }

  // Generate numeric order ID (max 20 chars) for Kwik API
  // Timestamp (13 chars) + Random (4 chars) = 17 chars, safely within limit
  const numericOrderId = `${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const result = await performRecharge({
    number: request.dth_id || request.mobile_number!, // Prioritize DTH ID, fallback to mobile
    amount: request.amount,
    operator_id: request.operator_id,
    circle_id: request.circle_id,
    client_id: numericOrderId,
  });

  if (result.status === 'SUCCESS' && result.response) {
    return {
      status: 'SUCCESS',
      transaction_id: result.response.order_id,
      message: result.response.message || 'Recharge successful',
      data: { api_ref: result.response.operator_id },
    };
  } else if (result.status === 'PENDING') {
    return {
      status: 'PENDING',
      transaction_id: result.response?.order_id || transactionId,
      message: 'Recharge is processing',
      data: { api_ref: '' },
    };
  } else {
    return {
      status: 'FAILED',
      transaction_id: '',
      message: result.message || 'Recharge failed',
      data: { api_ref: '' },
    };
  }
}

/**
 * Update transaction status
 */
async function updateTransactionStatus(
  transactionId: string,
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED',
  message: string,
  apiTransactionId?: string
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (apiTransactionId) {
    updateData.api_transaction_id = apiTransactionId;
  }

  const { error } = await supabase
    .from('transactions' as never)
    .update(updateData as never)
    .eq('id', transactionId);

  if (error) {
    console.error('Error updating transaction:', error);
  }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit = 50,
  serviceType?: string
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions' as never)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (serviceType) {
    query = query.eq('service_type', serviceType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return (data as unknown as Transaction[]) || [];
}

/**
 * Check pending transaction status
 */
export async function checkTransactionStatus(
  transactionId: string
): Promise<ApiResponse<Transaction | null>> {
  const { data, error } = await supabase
    .from('transactions' as never)
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error || !data) {
    return {
      status: 'FAILED',
      transaction_id: transactionId,
      message: 'Transaction not found',
      data: null,
    };
  }

  const tx = data as unknown as TransactionRow;

  // If already final, return as is
  if (tx.status === 'SUCCESS' || tx.status === 'FAILED') {
    return {
      status: tx.status,
      transaction_id: transactionId,
      message: `Transaction is ${tx.status}`,
      data: tx as unknown as Transaction,
    };
  }

  // Only check API if api_transaction_id (order_id) exists and status is PENDING
  if (tx.status === 'PENDING' && tx.api_transaction_id) {
    const statusData = await fetchTransactionStatus(tx.api_transaction_id);

    if (statusData && statusData.response) {
      const apiStatus = statusData.response.status;
      let newStatus: 'SUCCESS' | 'FAILED' | 'PENDING' = 'PENDING';

      if (apiStatus === 'SUCCESS') {
        newStatus = 'SUCCESS';
      } else if (apiStatus === 'FAILED' || apiStatus === 'REFUNDED') {
        newStatus = 'FAILED';
      }

      if (newStatus !== 'PENDING') {
        await updateTransactionStatus(tx.id, newStatus, statusData.response.message || `Transaction ${newStatus}`);

        // Update local object
        tx.status = newStatus;

        // Handle refunds if failed
        if (newStatus === 'FAILED') {
          await walletService.refundAmount(tx.user_id, tx.amount, tx.id);
        }
      }
    }
  }

  return {
    status: tx.status as 'SUCCESS' | 'FAILED' | 'PENDING',
    transaction_id: transactionId,
    message: `Transaction is ${tx.status}`,
    data: tx as unknown as Transaction,
  };
}
