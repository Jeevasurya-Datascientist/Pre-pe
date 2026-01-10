import { ShieldCheck } from "lucide-react";

export const BottomBanner = () => {
    return (
        <div className="mx-4 mt-6 mb-24 bg-orange-500 rounded-xl p-4 flex items-center gap-4 text-white relative overflow-hidden shadow-lg">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-orange-600 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 10%)', backgroundSize: '10px 10px' }}>
            </div>

            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center shrink-0 relative z-10 border-2 border-white/30">
                <ShieldCheck className="w-10 h-10 text-white" />
            </div>

            <div className="flex flex-col relative z-10">
                <h3 className="font-bold text-sm">Fast. Safe. Hassle-Free</h3>
                <p className="font-bold text-base">Pay Your Insurance Premium Online!</p>
            </div>
        </div>
    );
};
