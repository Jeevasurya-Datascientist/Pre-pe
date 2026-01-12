import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, User, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export function AuthForm() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string; phone?: string } = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (tab === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Please enter your full name';
      }
      if (!phone.trim() || phone.length < 10) {
        newErrors.phone = 'Please enter a valid 10-digit mobile number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have signed in successfully',
      });
      navigate('/home');
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await signUp(email, password, fullName, phone);
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Account exists',
          description: 'This email is already registered. Please sign in instead.',
          variant: 'destructive',
        });
        setTab('signin');
      } else {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });
      // Redirect to Verify Email page
      navigate('/auth/verify-email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30">
      <div className="w-full max-w-md space-y-8">

        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 shadow-lg shadow-slate-200 mb-2">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pre Pe</h1>
          <p className="text-slate-500">Fast, secure, and rewarding payments.</p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100/50">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-0">
            {tab === 'signin' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3" /> {errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>

                  <Button onClick={handleSignIn} disabled={loading} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => navigate('/auth/magic-link')}
                  >
                  </Button>
                </div>
              </div>
            )}

            {tab === 'signup' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        placeholder="John Doe"
                        className="pl-10 bg-slate-50"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative group">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        placeholder="9876543210"
                        type="tel"
                        maxLength={10}
                        className="pl-10 bg-slate-50"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-slate-50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <Button onClick={handleSignUp} disabled={loading} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-base font-medium mt-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-400">
          By continuing, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
