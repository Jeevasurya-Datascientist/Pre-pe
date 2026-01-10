
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upiService, UPIIntentParams } from "@/services/upi";
import { toast } from "sonner";
import { Loader2, ArrowRight, Wallet as WalletIcon, CheckCircle2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const TopUpPage = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [paymentState, setPaymentState] = useState<{
        intentUrl: string;
        upiRef: string;
        qrData: string;
    } | null>(null);
    const [polling, setPolling] = useState(false);

    const handleInitiatePayment = async () => {
        if (!amount || Number(amount) < 1) {
            toast.error("Enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            const res = await upiService.createPaymentIntent({
                amount: Number(amount),
                name: "Prepe Recharge",
                note: "Wallet Topup"
            });
            setPaymentState(res);
            startPolling(res.upiRef);
        } catch (e: any) {
            toast.error(e.message || "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    const startPolling = async (refId: string) => {
        setPolling(true);
        let attempts = 0;
        const maxAttempts = 20; // 1 minute (assuming 3s interval)

        const poll = async () => {
            if (attempts >= maxAttempts) {
                setPolling(false);
                toast.error("Payment status check timed out. Please check history.");
                return;
            }

            try {
                const status = await upiService.checkPaymentStatus(refId);
                if (status.status === 'SUCCESS') {
                    setPolling(false);
                    setPaymentState(null);
                    setAmount("");
                    toast.success("Payment Successful! Wallet updated.");
                    // Navigate to home to show updated balance
                    navigate('/home');
                } else if (status.status === 'FAILED') {
                    setPolling(false);
                    toast.error("Payment Failed");
                } else {
                    attempts++;
                    setTimeout(poll, 3000);
                }
            } catch (e) {
                console.error("Poll error", e);
                // Continue polling even on temp error
                attempts++;
                setTimeout(poll, 3000);
            }
        };

        poll();
    };

    return (
        <div className="container max-w-md mx-auto py-8 space-y-6">
            <h1 className="text-2xl font-bold text-center">Add Money to Wallet</h1>

            {!paymentState ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Amount</CardTitle>
                        <CardDescription>Enter amount to add via UPI</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-lg font-bold">₹</span>
                            <Input
                                type="number"
                                className="pl-8 text-lg font-bold"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            {[100, 500, 1000].map(amt => (
                                <Button
                                    key={amt}
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setAmount(amt.toString())}
                                >
                                    ₹{amt}
                                </Button>
                            ))}
                        </div>

                        <Button
                            className="w-full h-12 text-lg"
                            onClick={handleInitiatePayment}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <WalletIcon className="mr-2 h-5 w-5" />}
                            Proceed to Pay
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="text-center">
                        <CardTitle>Scan & Pay</CardTitle>
                        <CardDescription>Scan QR code with any UPI App</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-6">
                        <div className="p-4 bg-white rounded-xl shadow-sm border">
                            <QRCodeSVG value={paymentState.qrData} size={200} />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="font-medium text-lg">₹{amount}</p>
                            <div className="flex items-center justify-center text-sm text-blue-600 animate-pulse">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Waiting for payment...
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                                <a href={paymentState.intentUrl}>
                                    Open UPI App <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full text-muted-foreground"
                                onClick={() => setPaymentState(null)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TopUpPage;
