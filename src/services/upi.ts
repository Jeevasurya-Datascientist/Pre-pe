import { supabase } from "@/integrations/supabase/client";

// MOCK CONSTANTS
const UPI_HANDLE = "merchant@upi"; // Placeholder
const MERCHANT_NAME = "Prepe Recharge";

export interface UPIIntentParams {
    amount: number;
    note?: string;
    name?: string;
}

export const upiService = {
    /**
     * Generates a UPI Intent String (upi://pay?...)
     * @param params 
     * @returns 
     */
    async createPaymentIntent(params: UPIIntentParams) {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error("User not logged in");

        // 1. Create a pending record in `upi_transactions`
        const upiRef = `TXN${Date.now()}`; // Simple unique ref
        const { data, error } = await supabase.from('upi_transactions').insert({
            user_id: user.data.user.id,
            amount: params.amount,
            upi_ref_id: upiRef,
            gateway_status: 'PENDING',
            app_used: 'N/A'
        }).select().single();

        if (error) throw error;

        // 2. Construct UPI URL
        // Format: upi://pay?pa=<id>&pn=<name>&tr=<ref>&tn=<note>&am=<amount>&cu=INR
        const upiUrl = new URL("upi://pay");
        upiUrl.searchParams.append("pa", UPI_HANDLE);
        upiUrl.searchParams.append("pn", params.name || MERCHANT_NAME);
        upiUrl.searchParams.append("tr", upiRef);
        upiUrl.searchParams.append("tn", params.note || "Wallet Topup");
        upiUrl.searchParams.append("am", params.amount.toString());
        upiUrl.searchParams.append("cu", "INR");

        const intentUrl = upiUrl.toString();

        // 3. Update record with intent (optional, for record keeping)
        await supabase.from('upi_transactions').update({ intent_url: intentUrl }).eq('id', data.id);

        return {
            intentUrl,
            upiRef,
            transactionId: data.id,
            qrData: intentUrl // QR libraries can encode this string directly
        };
    },

    /**
     * MOCK Status Check
     * In a real system, this would call `UPI_STATUS_ENDPOINT`
     */
    async checkPaymentStatus(upiRefId: string) {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 800));

        // Fetch current status
        const { data: txn } = await supabase.from('upi_transactions').select('*').eq('upi_ref_id', upiRefId).single();

        if (!txn) return { status: 'FAILED', message: "Transaction not found" };
        if (txn.gateway_status === 'SUCCESS') return { status: 'SUCCESS', message: "Already successful" };

        // RANDOMIZED MOCK RESULT (For testing: 80% Success if checking)
        // In production, we'd fetch from provider.
        const isSuccess = Math.random() > 0.2;

        if (isSuccess) {
            await this.handleSuccess(txn);
            return { status: 'SUCCESS' };
        } else {
            return { status: 'PENDING', message: "Waiting for bank confirmation" };
        }
    },

    /**
     * Handles the success logic: Credit Wallet, Mark TXN Success
     */
    async handleSuccess(txn: any) {
        // 1. Mark UPI TXN Success
        await supabase.from('upi_transactions').update({ gateway_status: 'SUCCESS' }).eq('id', txn.id);

        // 2. Check if wallet ledger already has this credit (Idempotency)
        // (Skipped for brevity/mock, but crucial in prod)

        // 3. Credit Wallet
        const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', txn.user_id).single();
        if (wallet) {
            const newBal = wallet.balance + txn.amount;
            await supabase.from('wallets').update({ balance: newBal }).eq('id', wallet.id);

            await supabase.from('wallet_ledger').insert({
                wallet_id: wallet.id,
                type: 'CREDIT',
                amount: txn.amount,
                balance_after: newBal,
                description: `UPI Topup: ${txn.upi_ref_id}`,
                // transaction_id: (optional link if we had a generic transaction record too)
            });
        }
    }
};
