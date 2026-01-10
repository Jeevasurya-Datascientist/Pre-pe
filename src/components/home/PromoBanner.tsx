import { Button } from "@/components/ui/button";

export const PromoBanner = () => {
    return (
        <div className="mx-4 my-2 relative overflow-hidden rounded-xl bg-gradient-to-r from-green-900 to-green-800 text-white shadow-lg">
            <div className="p-6 relative z-10">
                <div className="w-2/3">
                    <h3 className="text-sm font-medium text-green-200 mb-1">GET CASHBACK</h3>
                    <h2 className="text-xl font-bold mb-1">UPTO 4% ON</h2>
                    <h2 className="text-xl font-bold mb-4">MOBILE RECHARGE</h2>
                    <Button size="sm" variant="secondary" className="bg-transparent border border-white text-white hover:bg-white/10 rounded-full px-6">
                        Recharge Now
                    </Button>
                </div>
            </div>
            {/* Abstract background shapes to mimic the design */}
            <div className="absolute right-0 bottom-0 h-full w-1/3 bg-[url('/placeholder.svg')] opacity-50 bg-cover bg-center mix-blend-overlay">
                {/* Placeholder for the image of the person holding phone */}
            </div>
            <div className="absolute top-1/2 right-4 w-24 h-24 bg-green-500 rounded-full blur-2xl opacity-40"></div>
        </div>
    );
};
