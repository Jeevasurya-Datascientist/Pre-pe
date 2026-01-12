import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useKYC } from '@/hooks/useKYC';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

export const ProtectedRoute = () => {
    const { user, loading: authLoading } = useAuth();
    const { status: kycStatus, isLoading: kycLoading } = useKYC();
    const location = useLocation();

    if (authLoading || kycLoading) {
        return (
            <Layout hideHeader>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Logic Update:
    // If Status is NULL (Not started) -> Force to KYC page
    // If Status is PENDING/REJECTED/APPROVED -> Allow access (Banner will handle warnings)

    // Exception: If on KYC page, don't redirect (avoids loop)
    const isKYCPage = location.pathname === '/kyc' || location.pathname === '/profile/kyc';

    if (!kycStatus && !isKYCPage) {
        return <Navigate to="/kyc" replace />;
    }

    return <Outlet />;
};

