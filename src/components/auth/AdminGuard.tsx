import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const AdminGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    // Strict Email Check
    if (user.email !== 'connect.prepe@gmail.com') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                <p className="text-slate-600 mb-4">You do not have permission to view this page.</p>
                <a href="/home" className="text-blue-600 hover:underline">Return to Dashboard</a>
            </div>
        );
    }

    return <Outlet />;
};
