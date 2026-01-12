import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        setLoading(false);

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } else {
            setSuccess(true);
            toast({
                title: "Email Sent",
                description: "Check your inbox for the password reset link.",
            });
        }
    };

    return (
        <Layout hideHeader>
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <Card className="w-full max-w-md shadow-xl border-none">
                    <CardHeader>
                        <Button variant="ghost" className="w-fit p-0 h-auto mb-4 hover:bg-transparent" onClick={() => navigate('/auth')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>
                            Enter your email address and we'll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Check your email</h3>
                                <p className="text-slate-500 mb-6">
                                    We have sent a password reset link to <span className="font-medium text-slate-900">{email}</span>.
                                </p>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                                    Return to Sign In
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full bg-slate-900" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ForgotPasswordPage;
