import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KYCNudgeDialog } from "@/components/kyc/KYCNudgeDialog";
import { ArrowLeft, Landmark, Info, HandCoins, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKYC } from "@/hooks/useKYC";

const DNPLPage = () => {
    const [amount, setAmount] = useState<string>("");
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { isApproved } = useKYC();
    const [showKYCNudge, setShowKYCNudge] = useState(false);

    const borrowAmount = parseInt(amount) || 0;

    const repaymentDate = new Date();
    repaymentDate.setDate(repaymentDate.getDate() + 15);
    const bounceCharges = 50;

    const { data: balance } = useQuery({
        queryKey: ["wallet-balance"],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/wallet`, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                },
            });
            return response.json();
        },
    });

    const borrowMutation = useMutation({
        mutationFn: async (amt: number) => {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/loans/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ amount: amt }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to borrow funds");
            }
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Successfully Borrowed!",
                description: `₹${borrowAmount} has been added to your wallet.`,
            });
            queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
            navigate("/home");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleBorrow = () => {
        if (!isApproved) {
            setShowKYCNudge(true);
            return;
        }

        if (borrowAmount <= 0) {
            toast({ title: "Invalid Amount", description: "Please enter an amount to borrow.", variant: "destructive" });
            return;
        }
        if (borrowAmount > 1000) {
            toast({ title: "Limit Exceeded", description: "You can borrow up to ₹1,000 only.", variant: "destructive" });
            return;
        }
        borrowMutation.mutate(borrowAmount);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white shadow-2xl min-h-screen relative flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-center gap-4 bg-white border-b sticky top-0 z-10">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Do Now Pay Later</h1>
                </div>

                <div className="flex-1 p-6 space-y-8">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-sm font-medium opacity-80 mb-1">Maximum Borrow Limit</h2>
                            <div className="text-4xl font-bold mb-4">₹1,000.00</div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs w-fit">
                                <Landmark className="w-3 h-3" />
                                <span>Powered by NBFC Partners</span>
                            </div>
                        </div>
                        <HandCoins className="absolute -bottom-4 -right-4 w-32 h-32 opacity-15 rotate-12" />
                    </div>

                    {/* Input Section */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-700 block ml-1">Enter Borrow Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-10 h-16 text-2xl font-bold border-2 border-slate-100 rounded-2xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                                max={1000}
                                min={1}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {[100, 200, 500, 1000].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val.toString())}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${amount === val.toString()
                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                        }`}
                                >
                                    ₹{val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary Card */}
                    {borrowAmount > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-500" />
                                Borrowing Summary
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Repayment Date
                                    </span>
                                    <span className="font-semibold text-slate-900">{repaymentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-500" /> Bounce Charges
                                    </span>
                                    <span className="font-semibold text-slate-900">₹{bounceCharges}.00</span>
                                </div>
                                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-slate-800 font-bold">Total Dues</span>
                                    <span className="text-indigo-600 font-extrabold">₹{borrowAmount}.00</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                * Borrowing funds may affect your credit score. Please repay on or before the due date to avoid charges.
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Action */}
                <div className="p-6 bg-white border-t mt-auto">
                    <Button
                        onClick={handleBorrow}
                        disabled={borrowMutation.isPending || borrowAmount <= 0}
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {borrowMutation.isPending ? "Connecting to Bank..." : "Connect & Borrow Now"}
                    </Button>
                </div>
            </div>

            <KYCNudgeDialog
                isOpen={showKYCNudge}
                onClose={() => setShowKYCNudge(false)}
                featureName="Borrow Funds"
                reason="Lending services require mandatory KYC verification."
            />
        </div>
    );
};

export default DNPLPage;
