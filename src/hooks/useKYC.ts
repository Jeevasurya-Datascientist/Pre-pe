import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getKYCStatus } from '@/services/kyc.service';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { decryptSensitiveData } from '@/lib/crypto';
import { useToast } from './use-toast';

export const useKYC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const prevStatusRef = useRef<string | null>(null);

    const { data: kycData, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['kycStatus', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const data = await getKYCStatus(user.id) as any;
            if (!data) return null;

            // Decrypt numbers for convenience if data exists
            try {
                const [pan, aadhar] = await Promise.all([
                    decryptSensitiveData(data.pan_number),
                    decryptSensitiveData(data.aadhar_number)
                ]);
                return { ...data, decrypted_pan: pan, decrypted_aadhar: aadhar };
            } catch (err) {
                console.warn("[useKYC] Failed to decrypt data:", err);
                return data;
            }
        },
        enabled: !!user,
        staleTime: 0,
    });

    const status = kycData?.status || null; // 'APPROVED' | 'PENDING' | 'REJECTED' | null

    // Notify on approval
    useEffect(() => {
        if (prevStatusRef.current === 'PENDING' && status === 'APPROVED') {
            toast({
                title: "KYC Approved! 🎉",
                description: "Your account is now verified. You can now add up to ₹5,000 to your wallet and access full services.",
            });
        }
        prevStatusRef.current = status;
    }, [status, toast]);

    // REAL-TIME: Listen for changes to current user's KYC record
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`kyc_status_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'kyc_verifications',
                    filter: `user_id=eq.${user.id}`
                },
                () => {
                    console.log('[useKYC] State change detected, refetching...');
                    refetch();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, refetch]);

    const isApproved = status === 'APPROVED';
    const isPending = status === 'PENDING';
    const isRejected = status === 'REJECTED';

    console.log('[useKYC] Hook State:', { userId: user?.id, status, isLoading, kycData });

    return {
        kycData,
        status,
        isApproved,
        isPending,
        isRejected,
        // Consolidate loading state:
        // If user exists, but we don't have data or error, consider it loading.
        // This prevents early redirects before the query fires or returns.
        isLoading: !!user && (isLoading || (kycData === undefined && !error)),
        error,
        refetch
    };
};
