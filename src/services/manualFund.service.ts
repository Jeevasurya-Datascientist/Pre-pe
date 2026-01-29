import { supabase } from "@/integrations/supabase/client";

export const manualFundService = {
    /**
     * Submit a manual fund request for admin approval
     */
    async submitRequest(userId: string, amount: number, transactionId: string) {
        const { data, error } = await (supabase as any)
            .from('manual_fund_requests')
            .insert([
                {
                    user_id: userId,
                    amount: amount,
                    transaction_id: transactionId,
                    status: 'PENDING'
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get user's manual requests
     */
    async getUserRequests(userId: string) {
        const { data, error } = await (supabase as any)
            .from('manual_fund_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
