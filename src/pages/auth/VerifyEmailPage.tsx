import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // If user is logged in and email is verified, redirect
        if (user && user.email_confirmed_at) {
            navigate('/home');
        } else {
            setChecking(false);
        }
    }, [user, navigate]);


    return (
        <Layout hideHeader>
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-blue-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
                    <p className="text-slate-500 mb-8">
                        We've sent a verification link to your email address. Please click the link to confirm your account.
                    </p>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-8 text-sm text-slate-600">
                        Top Tip: Check your Spam folder if you don't see the email in your inbox within a few minutes.
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.location.href = '/auth'}
                        >
                            Back to Sign In
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VerifyEmailPage;
