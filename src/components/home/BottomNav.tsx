import { Home, FileText, Headphones, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-6 flex justify-between items-center z-50 rounded-t-xl mb-safe mx-auto max-w-md w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
                onClick={() => navigate('/home')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/home') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Home className={`w-6 h-6 ${isActive('/home') ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">Home</span>
            </button>
            <button
                onClick={() => navigate('/transactions')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/transactions') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <FileText className={`w-6 h-6 ${isActive('/transactions') ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">Reports</span>
            </button>
            <button
                onClick={() => navigate('/contact')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/contact') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Headphones className={`w-6 h-6 ${isActive('/contact') ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">Support</span>
            </button>
            <button
                onClick={() => navigate('/profile')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Settings className={`w-6 h-6 ${isActive('/profile') ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">Settings</span>
            </button>
        </div>
    );
};
