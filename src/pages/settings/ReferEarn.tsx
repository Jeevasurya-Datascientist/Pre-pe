
import { Button } from "@/components/ui/button";
import { ChevronLeft, Copy, Share2, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const ReferEarn = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const referralCode = "JEEVA2025";

    const copyCode = () => {
        navigator.clipboard.writeText(referralCode);
        toast({ title: "Copied!", description: "Referral code copied to clipboard." });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white min-h-screen relative flex flex-col">
                <div className="bg-transparent absolute top-0 left-0 right-0 p-4 z-10">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/20 backdrop-blur-md h-10 w-10 text-white hover:bg-white/30" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 h-80 w-full rounded-b-[40px] flex flex-col items-center justify-center text-white px-6 text-center space-y-4 pt-10">
                    <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/10 shadow-xl">
                        <Gift className="h-10 w-10 text-yellow-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">Refer & Earn</h1>
                        <p className="text-indigo-100 mt-2 text-sm/relaxed">Invite your friends to Prepe and earn ₹50 cashback for every successful referral.</p>
                    </div>
                </div>

                <div className="px-6 -mt-10 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-50 text-center space-y-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Referral Code</p>
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                <span className="text-xl font-black text-slate-800 tracking-wider">{referralCode}</span>
                                <Button variant="ghost" size="sm" onClick={copyCode} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Copy className="h-4 w-4 mr-1" /> Copy
                                </Button>
                            </div>
                        </div>

                        <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold rounded-xl shadow-lg shadow-indigo-200">
                            <Share2 className="mr-2 h-5 w-5" /> Share Now
                        </Button>
                    </div>
                </div>

                <div className="px-6 pb-10 space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg">How it works?</h3>
                    <div className="space-y-6 relative pl-4 border-l-2 border-slate-100 ml-2">
                        {[
                            { title: 'Invite Friends', desc: 'Share your unique referral link with friends.' },
                            { title: 'They Sign Up', desc: 'Friends register using your code.' },
                            { title: 'You Earn', desc: 'Get cashback instantly in your wallet.' }
                        ].map((step, i) => (
                            <div key={i} className="relative pl-6">
                                <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
                                <h4 className="font-bold text-slate-800">{step.title}</h4>
                                <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferEarn;
