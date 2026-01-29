import { Layout } from '@/components/layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <Layout hideHeader>
                <div className="container py-8 flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (user) {
        return <Navigate to="/home" replace />;
    }

    return (
        <Layout hideHeader>
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <img src="/logo.png" alt="PrePe Logo" className="h-16 w-16 mb-4 mx-auto object-contain shadow-xl rounded-2xl bg-white p-1" />
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500">Sign in to continue your secure payments.</p>
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
                        <CardContent className="pt-6">
                            <LoginForm />
                        </CardContent>
                    </Card>

                    <p className="text-center text-sm text-slate-400">
                        By continuing, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default LoginPage;
