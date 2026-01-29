import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ChevronRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KYCNudgeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
    reason?: string;
}

export const KYCNudgeDialog = ({
    isOpen,
    onClose,
    featureName = "this feature",
    reason = "RBI regulations require KYC verification for financial transactions.",
}: KYCNudgeDialogProps) => {
    const navigate = useNavigate();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[calc(100%-2rem)] w-full rounded-2xl p-6 sm:max-w-md bg-white border-none shadow-2xl">
                <DialogHeader className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center border-4 border-amber-100 shadow-sm animate-pulse">
                        <ShieldAlert className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            KYC Verification Required
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 leading-relaxed">
                            To use {featureName}, you need to complete your video KYC. {reason}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="bg-slate-50/80 rounded-xl p-4 space-y-3 border border-slate-100/50">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span>Faster Payments & Higher Limits</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span>Secure Digital Identity</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span>Unlock Rewards & Cashback</span>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 text-slate-500 font-bold hover:bg-slate-50 rounded-xl order-2 sm:order-1"
                    >
                        NOT NOW
                    </Button>
                    <Button
                        onClick={() => {
                            onClose();
                            navigate("/kyc");
                        }}
                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 group transition-all active:scale-[0.98] order-1 sm:order-2"
                    >
                        VERIFY NOW
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
