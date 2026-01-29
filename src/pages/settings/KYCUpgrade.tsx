
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKYC } from "@/hooks/useKYC";
import { useEffect } from "react";

const KYCUpgrade = () => {
    const navigate = useNavigate();
    const { status, kycData, isLoading } = useKYC();

    useEffect(() => {
        if (!isLoading && status !== 'APPROVED') {
            navigate('/kyc', { replace: true });
        }
    }, [status, isLoading, navigate]);

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Checking status...</div>;
    if (status !== 'APPROVED') return null;

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white min-h-screen relative flex flex-col">
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10 border-b border-slate-100">
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 h-10 w-10 text-slate-600" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold text-slate-800">KYC Verification</h1>
                </div>

                <div className="p-6 flex flex-col items-center text-center space-y-6">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-pulse">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Account Verified!</h2>
                        <p className="text-slate-500 mt-2">Your KYC documents have been approved. You have full access to all features.</p>
                    </div>

                    <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 text-left space-y-3">
                        <div className="flex items-center gap-3">
                            <FileCheck className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="font-semibold text-slate-800">Aadhaar Card</p>
                                <p className="text-xs text-green-600 font-bold">
                                    VERIFIED • •••• {kycData?.decrypted_aadhar ? kycData.decrypted_aadhar.slice(-4) : 'XXXX'}
                                </p>
                            </div>
                        </div>
                        <div className="h-px bg-slate-200"></div>
                        <div className="flex items-center gap-3">
                            <FileCheck className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="font-semibold text-slate-800">PAN Card</p>
                                <p className="text-xs text-green-600 font-bold">
                                    VERIFIED • •••• {kycData?.decrypted_pan ? kycData.decrypted_pan.slice(-4) : 'XXXX'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 text-left leading-relaxed">
                            <strong>Note:</strong> If you need to update your documents or re-verify, please contact our support team.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KYCUpgrade;
