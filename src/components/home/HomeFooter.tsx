import { Heart } from "lucide-react";

export const HomeFooter = () => {
    return (
        <div className="py-8 flex flex-col items-center justify-center text-center opacity-70">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <span>Made With</span>
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Powered by Shashtika Innovations</p>
            <p className="text-[20px] text-blue-300 mt-2 font-semibold tracking-widest uppercase">Pre Pe India</p>
        </div>
    );
};
