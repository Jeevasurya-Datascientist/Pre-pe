import { ApiResponse } from '@/types/recharge.types';

const BASE_URL = import.meta.env.DEV ? '/kwik-api' : 'https://www.kwikapi.com/api/v2';
const API_KEY = import.meta.env.VITE_KWIK_API_KEY;

export interface KwikOperator {
    operator_name: string;
    operator_id: string;
    service_type: string;
    status: string;
    biller_status: string;
    bill_fetch: string;
    supportValidation: string;
    bbps_enabled: string;
    message: string;
    description: string;
    amount_minimum: string;
    amount_maximum: string;
}

export interface KwikResponse {
    status: string;
    response: KwikOperator[];
}

export const fetchKwikOperators = async (): Promise<KwikOperator[]> => {
    try {
        console.log('[KwikAPI] Fetching operators...');
        console.log('[KwikAPI] Key Status:', API_KEY ? `Present (${API_KEY.substring(0, 4)}...)` : 'MISSING');
        const url = `${BASE_URL}/operator_codes.php?api_key=${API_KEY}`;
        console.log('[KwikAPI] Request URL:', url);

        const response = await fetch(url);
        console.log('[KwikAPI] Response Status:', response.status);

        const text = await response.text();
        console.log('[KwikAPI] Response Text (First 200 chars):', text.substring(0, 200));

        let data: KwikResponse;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('[KwikAPI] JSON Parse Error:', e);
            return [];
        }

        if (data.status === 'SUCCESS') {
            console.log('[KwikAPI] Operators Fetched:', data.response.length);
            // Log first operator type to verify mapping
            if (data.response.length > 0) {
                console.log('[KwikAPI] Sample Op Type:', data.response[0].service_type);
            }
            return data.response;
        } else {
            console.error('Kwik API Error:', data);
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch operators:', error);
        return [];
    }
};

export interface KwikBalanceResponse {
    response: {
        balance: string;
        plan_credit: string;
    };
}

export const fetchWalletBalance = async (): Promise<{ balance: string; plan_credit: string } | null> => {
    try {
        const response = await fetch(`${BASE_URL}/balance.php?api_key=${API_KEY}`);
        const data: KwikBalanceResponse = await response.json();
        return data.response;
    } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
        return null;
    }
};

export interface KwikRechargeRequest {
    number: string;
    amount: number;
    operator_id: string;
    circle_id?: string;
    client_id: string;
}

export interface KwikRechargeResponse {
    status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'ERROR';
    message: string;
    response?: {
        order_id: string;
        operator_id: string;
        balance: string;
        status: string;
        message: string;
    };
}

export const performRecharge = async (request: KwikRechargeRequest): Promise<KwikRechargeResponse> => {
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            number: request.number,
            amount: request.amount.toString(),
            opid: request.operator_id,
            order_id: request.client_id,
            state_code: request.circle_id || '0'
        });

        const response = await fetch(`${BASE_URL}/recharge.php?${params.toString()}`);
        const data: KwikRechargeResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to perform recharge:', error);
        return {
            status: 'FAILED',
            message: 'Network or Server Error',
        };
    }
};

export interface KwikStatusResponse {
    response: {
        order_id: string;
        operator_ref: string;
        opr_id: string;
        status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
        number: string;
        amount: string;
        service: string;
        charged_amount: string;
        closing_balance: string;
        available_balance: string;
        pid: string;
        date: string;
        message?: string; // Sometimes present in error cases
    };
}

export const fetchTransactionStatus = async (orderId: string): Promise<KwikStatusResponse | null> => {
    try {
        const response = await fetch(`${BASE_URL}/status.php?api_key=${API_KEY}&order_id=${orderId}`);
        const data: KwikStatusResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch transaction status:', error);
        return null;
    }
};

export interface KwikTransaction {
    trx_id: string;
    your_id: string | null;
    number: string;
    number2: string | null;
    ref_id: string; // The operator ID or response message
    amount: string;
    charged_amount: string;
    date: string; // Format: 2020-07-06 18:52:53
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' | 'CREDIT' | 'REVERSAL';
    service: string;
}

export const fetchRecentTransactions = async (): Promise<KwikTransaction[]> => {
    try {
        const response = await fetch(`${BASE_URL}/transactions.php?api_key=${API_KEY}`);
        const data: KwikTransaction[] = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Failed to fetch recent transactions:', error);
        return [];
    }
};

export interface KwikOperatorFetchResponse {
    success: boolean;
    message: string;
    response?: {
        operator: string;
        circle: string;
        operator_code?: string;
        circle_code?: string;
    };
}

export const fetchOperatorDetails = async (mobileNumber: string): Promise<KwikOperatorFetchResponse> => {
    try {
        const formData = new FormData();
        formData.append('api_key', API_KEY);
        formData.append('number', mobileNumber);

        const response = await fetch(`${BASE_URL}/operator_fetch_v2.php`, {
            method: 'POST',
            body: formData,
        });

        const data: KwikOperatorFetchResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch operator details:', error);
        return {
            success: false,
            message: 'Network Error'
        };
    }
};

export interface KwikPlan {
    Type: string;
    rs: number;
    validity: string;
    desc: string;
}

export interface KwikPlansResponse {
    success: boolean;
    hit_credit?: string;
    api_started?: string;
    api_expiry?: string;
    operator?: string;
    circle?: string;
    message?: string;
    plans?: Record<string, KwikPlan[]>;
}

export const fetchRechargePlans = async (stateCode: string, operatorId: string): Promise<KwikPlansResponse> => {
    try {
        const formData = new FormData();
        formData.append('api_key', API_KEY);
        formData.append('state_code', stateCode);
        formData.append('opid', operatorId);

        const response = await fetch(`${BASE_URL}/recharge_plans.php`, {
            method: 'POST',
            body: formData,
        });

        const data: KwikPlansResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch recharge plans:', error);
        return {
            success: false,
            message: 'Network Error'
        };
    }
};

export const fetchDTHPlans = async (operatorId: string): Promise<KwikPlansResponse> => {
    try {
        const formData = new FormData();
        formData.append('api_key', API_KEY);
        formData.append('opid', operatorId);

        const response = await fetch(`${BASE_URL}/DTH_plans.php`, {
            method: 'POST',
            body: formData,
        });

        const data: KwikPlansResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch DTH plans:', error);
        return {
            success: false,
            message: 'Network Error'
        };
    }
};

export interface DTHCustomerInfoResponse {
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    message: string;
    response?: {
        operator_id: string;
        customer_id: string;
        info: {
            balance: string;
            customerName: string;
            status: string;
            NextRechargeDate: string;
            lastrechargeamount: string;
            lastrechargedate: string;
            planname: string;
            monthlyRecharge: string;
        }[];
    };
}

export const fetchDTHCustomerDetails = async (operatorId: string, customerId: string): Promise<DTHCustomerInfoResponse> => {
    try {
        const formData = new FormData();
        formData.append('api_key', API_KEY);
        formData.append('opid', operatorId);
        formData.append('customer_id', customerId);

        const response = await fetch(`${BASE_URL}/dth_customer_info.php`, {
            method: 'POST',
            body: formData,
        });

        const data: DTHCustomerInfoResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch DTH customer details:', error);
        return {
            status: 'FAILED',
            message: 'Network Error'
        };
    }
};

export const fetchROffer = async (operatorId: string, mobileNumber: string): Promise<KwikPlansResponse> => {
    try {
        const formData = new FormData();
        formData.append('api_key', API_KEY);
        formData.append('opid', operatorId);
        formData.append('mobile', mobileNumber);

        const response = await fetch(`${BASE_URL}/R-OFFER_check.php`, {
            method: 'POST',
            body: formData,
        });

        const data: KwikPlansResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch R-Offer:', error);
        return {
            success: false,
            message: 'Network Error'
        };
    }
};

export interface KwikBillPaymentRequest {
    number: string;
    amount: number;
    operator_id: string;
    order_id: string;
    mobile: string;
    reference_id?: string;
}

export const payBill = async (request: KwikBillPaymentRequest): Promise<KwikRechargeResponse> => {
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            number: request.number,
            amount: request.amount.toString(),
            opid: request.operator_id,
            order_id: request.order_id,
            mobile: request.mobile,
            opt8: 'Bills'
        });

        if (request.reference_id) {
            params.append('refrence_id', request.reference_id);
        }

        const response = await fetch(`${BASE_URL}/bills/payments.php?${params.toString()}`);
        const data: KwikRechargeResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to pay bill:', error);
        return {
            status: 'FAILED',
            message: 'Network or Server Error',
        };
    }
};

export interface KwikPayoutRequest {
    account_no: string;
    amount: number;
    order_id: string; // Max 14 digits
    ifsc_code: string;
    bene_name: string;
}

export interface KwikPayoutResponse {
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'ERROR';
    message: string;
    response?: any;
}

export const processPayout = async (request: KwikPayoutRequest): Promise<KwikPayoutResponse> => {
    try {
        const formData = new FormData();
        formData.append('api_key', API_KEY);
        formData.append('account_no', request.account_no);
        formData.append('amount', request.amount.toString());
        formData.append('order_id', request.order_id);
        formData.append('ifsc_code', request.ifsc_code);
        formData.append('bene_name', request.bene_name);

        const response = await fetch('https://kwikapi.com/api/v2/payments/index.php', {
            method: 'POST',
            body: formData,
        });

        const data: KwikPayoutResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to process payout:', error);
        return {
            status: 'FAILED',
            message: 'Network or Server Error'
        };
    }
};

export interface KwikValidationRequest {
    number: string;
    account: string;
    ifsc: string;
    order_id: string; // Max 20 digits
}

export interface KwikValidationResponse {
    success: boolean;
    status: string;
    message: string;
    order_id: string;
    utr?: string;
    ben_name?: string;
    verify_status?: string;
}

export const validateBankAccount = async (request: KwikValidationRequest): Promise<KwikValidationResponse> => {
    try {
        const formData = new FormData();
        formData.append('api_key', API_KEY);
        formData.append('number', request.number);
        formData.append('account', request.account);
        formData.append('ifsc', request.ifsc);
        formData.append('order_id', request.order_id);

        const response = await fetch(`${BASE_URL}/dmt/account_validate_route2`, {
            method: 'POST',
            body: formData,
        });

        const data: KwikValidationResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to validate bank account:', error);
        return {
            success: false,
            status: 'FAILED',
            message: 'Network Error',
            order_id: request.order_id
        };
    }
};
