import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getKYCStatus } from '@/services/kyc.service';

export const useKYC = () => {
    const { user } = useAuth();

    const { data: kycData, isLoading, isFetching, error, refetch } = useQuery({
        queryKey: ['kycStatus', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const data = await getKYCStatus(user.id);
            return data ? (data as any) : null;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const status = kycData?.status || null; // 'APPROVED' | 'PENDING' | 'REJECTED' | null
    const isApproved = status === 'APPROVED';
    const isPending = status === 'PENDING';
    const isRejected = status === 'REJECTED';

    return {
        kycData,
        status,
        isApproved,
        isPending,
        isRejected,
        isLoading: isLoading || isFetching,
        error,
        refetch
    };
};
