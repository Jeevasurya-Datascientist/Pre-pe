import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MagicLinkPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/home`,
            },
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
                title: "Magic Link Sent",
                description: "Check your email for the login link.",
            });
        }
    };

    return (
        <Layout hideHeader>
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <Card className="w-full max-w-md shadow-xl border-none">
                    <CardHeader>
                        <Button variant="ghost" className="w-fit p-0 h-auto mb-4 hover:bg-transparent" onClick={() => navigate('/auth')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                        </Button>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Wand2 className="w-6 h-6 text-purple-600" />
                            Magic Link Login
                        </CardTitle>
                        <CardDescription>
                            Sign in without a password. We'll send a magic link to your email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Check your email</h3>
                                <p className="text-slate-500 mb-6">
                                    We have sent a magic link to <span className="font-medium text-slate-900">{email}</span>.
                                </p>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                                    Return to Sign In
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleMagicLink} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                            value={email}
                                            className="pl-10"
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Magic Link"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default MagicLinkPage;
