import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const WhatsAppBanner = () => {
    return (
        <div className="mx-4 mt-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 text-white shadow-lg border border-emerald-700/50">
            {/* Background Image / Texture Effect */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>

            <div className="p-5 flex items-center justify-between relative z-10">
                <div className="flex-1 pr-2">
                    <h3 className="text-base font-semibold text-white mb-1 leading-tight">
                        Be A Part Of <br /> Our WhatsApp Community.
                    </h3>
                    <p className="text-[10px] text-emerald-100 mb-3 opacity-90 line-clamp-2">
                        Stay Connected, Stay Ahead With @Pre Pe Updates
                    </p>
                    <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white border-none rounded-full px-6 h-8 text-xs font-bold shadow-md transition-all hover:scale-105"
                    >
                        JOIN NOW
                    </Button>
                </div>

                {/* Image Placeholder - User can replace with actual image */}
                <div className="w-24 h-24 flex-shrink-0 relative">
                    <div className="absolute -right-2 -bottom-2">
                        <MessageCircle className="w-8 h-8 text-green-400 fill-green-400 drop-shadow-lg" />
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
                        alt="Community"
                        className="w-full h-full object-cover rounded-full border-2 border-emerald-400/30"
                    />
                </div>
            </div>

            {/* Decorative blurs */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20"></div>
        </div>
    );
};
