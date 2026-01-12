import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UpdatePasswordPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        setLoading(false);

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Success",
                description: "Your password has been updated. Please sign in.",
            });
            navigate('/auth');
        }
    };

    return (
        <Layout hideHeader>
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <Card className="w-full max-w-md shadow-xl border-none">
                    <CardHeader>
                        <CardTitle className="text-2xl">Set New Password</CardTitle>
                        <CardDescription>
                            Please create a new password for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="pl-10"
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button className="w-full bg-slate-900" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default UpdatePasswordPage;
