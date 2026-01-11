
import { Button } from "@/components/ui/button";
import { ChevronLeft, Tag, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/home/BottomNav";

const CashbackOffers = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Mock Data organized by category
    const categories = {
        recharge: [
            { id: 1, code: 'PREPE50', desc: 'Get 50% Cashback on first recharge', color: 'bg-orange-50 border-orange-200 text-orange-800', valid: '31 Dec 2025' },
            { id: 3, code: 'JIO100', desc: '₹100 Cashback on Jio Annual Plan', color: 'bg-green-50 border-green-200 text-green-800', valid: '31 Mar 2026' },
        ],
        utility: [
            { id: 2, code: 'BILL20', desc: 'Flat ₹20 off on Electricity Bill', color: 'bg-blue-50 border-blue-200 text-blue-800', valid: '28 Feb 2026' },
            { id: 4, code: 'GASBOOK', desc: '₹50 Cashback on Cylinder Booking', color: 'bg-red-50 border-red-200 text-red-800', valid: '30 Jun 2026' },
        ],
        shopping: [
            { id: 5, code: 'AMAZON10', desc: '10% Cashback on Amazon Gift Cards', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', valid: 'Always Valid' },
        ]
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: `Code ${code} copied.` });
    };

    const OfferCard = ({ offer }: { offer: any }) => (
        <div className={`p-5 rounded-2xl border-2 border-dashed ${offer.color}`}>
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
            <p className="text-xs opacity-70">Valid till {offer.valid}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white min-h-screen relative flex flex-col">
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10 border-b border-slate-100">
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 h-10 w-10 text-slate-600" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold text-slate-800">Bank Offers & Coupons</h1>
                </div>

                <div className="p-4 pb-24 flex-1">
                    <Tabs defaultValue="recharge">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 rounded-xl p-1">
                            <TabsTrigger value="recharge" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Recharge</TabsTrigger>
                            <TabsTrigger value="utility" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Utility</TabsTrigger>
                            <TabsTrigger value="shopping" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Shopping</TabsTrigger>
                        </TabsList>

                        <TabsContent value="recharge" className="space-y-4">
                            {categories.recharge.map(offer => <OfferCard key={offer.id} offer={offer} />)}
                        </TabsContent>
                        <TabsContent value="utility" className="space-y-4">
                            {categories.utility.map(offer => <OfferCard key={offer.id} offer={offer} />)}
                        </TabsContent>
                        <TabsContent value="shopping" className="space-y-4">
                            {categories.shopping.map(offer => <OfferCard key={offer.id} offer={offer} />)}
                        </TabsContent>
                    </Tabs>
                </div>
                <BottomNav />
            </div>
        </div>
    );
};

export default CashbackOffers;
