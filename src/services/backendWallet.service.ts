import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = "http://localhost:3000";

async function getAuthHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
    };
}

export const backendWalletService = {
    /**
     * Create a Razorpay Order
     */
    async createOrder(amount: number) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/wallet/create-order`, {
            method: "POST",
            headers,
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create order");
        }

        return await response.json();
    },

    /**
     * Verify Razorpay Payment and Credit Wallet
     */
    async verifyPayment(paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        amount: number;
    }) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/wallet/verify-payment`, {
            method: "POST",
            headers,
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Payment verification failed");
        }

        return await response.json();
    }
};
