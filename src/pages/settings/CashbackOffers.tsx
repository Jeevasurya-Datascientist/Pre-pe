
import { Button } from "@/components/ui/button";
import { ChevronLeft, Tag, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CashbackOffers = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const offers = [
        { id: 1, code: 'PREPE50', desc: 'Get 50% Cashback on first recharge', color: 'bg-orange-50 border-orange-200 text-orange-800' },
        { id: 2, code: 'BILL20', desc: 'Flat ₹20 off on Electricity Bill', color: 'bg-blue-50 border-blue-200 text-blue-800' },
        { id: 3, code: 'JIO100', desc: '₹100 Cashback on Jio Annual Plan', color: 'bg-green-50 border-green-200 text-green-800' },
    ];

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: `Code ${code} copied.` });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white min-h-screen relative flex flex-col">
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10 border-b border-slate-100">
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 h-10 w-10 text-slate-600" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold text-slate-800">My Offers</h1>
                </div>

                <div className="p-4 space-y-4">
                    {offers.map((offer) => (
                        <div key={offer.id} className={`p-5 rounded-2xl border-2 border-dashed ${offer.color}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Tag className="h-6 w-6" />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 bg-white/50 hover:bg-white text-xs font-bold uppercase tracking-wider"
                                    onClick={() => copyCode(offer.code)}
                                >
                                    <Copy className="h-3 w-3 mr-1" /> {offer.code}
                                </Button>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{offer.desc}</h3>
                            <p className="text-xs opacity-70">Valid till 31st Dec 2025</p>
                        </div>
                    ))}
                    <div className="text-center p-8 text-slate-400 text-sm">
                        No more active offers. Check back later!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashbackOffers;
