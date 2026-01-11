import { Home, FileText, Tag, Settings, CreditCard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: Home, label: "Home", path: "/home" },
        { icon: FileText, label: "History", path: "/transactions" },
        { icon: Tag, label: "Offers", path: "/offers" },
        { icon: Settings, label: "Settings", path: "/profile" },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white rounded-full py-3 px-6 shadow-2xl flex justify-between items-center ring-1 ring-white/10">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                                active ? "text-white" : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {active && (
                                <span className="absolute -top-1 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                            )}
                            <item.icon
                                className={cn(
                                    "w-6 h-6 transition-transform duration-300",
                                    active ? "scale-110" : "scale-100"
                                )}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            {/* Optional: Tooltip or Label - Keeping it icon-only for cleaner 'island' look, or minimal label */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
