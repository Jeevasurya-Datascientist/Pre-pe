import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useKYC } from '@/hooks/useKYC';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

export const ProtectedRoute = () => {
    const { user, loading: authLoading } = useAuth();
    const { status: kycStatus, isLoading: kycLoading } = useKYC();
    const location = useLocation();

    // If data is still loading (or user exists but data undefined), show loader
    // derived from useKYC's hardened isLoading
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
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}

