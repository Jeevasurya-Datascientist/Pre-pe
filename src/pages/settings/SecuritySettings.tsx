
import { Button } from "@/components/ui/button";
import { ChevronLeft, Lock, Fingerprint, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

const SecuritySettings = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white min-h-screen relative flex flex-col">
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10 border-b border-slate-100">
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 h-10 w-10 text-slate-600" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold text-slate-800">Security</h1>
                </div>

                <div className="p-4 space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">App Lock</p>
                                    <p className="text-xs text-slate-500">Secure app with screen lock</p>
                                </div>
                            </div>
                            <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Fingerprint className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Biometric Login</p>
                                    <p className="text-xs text-slate-500">Enable fingerprint/face ID</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="h-6 w-6 text-orange-600 mt-1" />
                            <div>
                                <h3 className="font-bold text-orange-800">Change M-PIN</h3>
                                <p className="text-xs text-orange-700 mt-1 mb-3">Regularly changing your PIN helps keep your account secure.</p>
                                <Button size="sm" variant="outline" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100">
                                    Update PIN
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
