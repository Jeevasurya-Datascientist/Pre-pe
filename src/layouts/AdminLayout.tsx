import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/kyc', icon: FileText, label: 'KYC Requests' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight">PrePe Admin</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                    <div className="mt-4 px-4 text-xs text-slate-600">
                        v1.0.0 Admin Panel
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                <Outlet />
            </div>
        </div>
    );
};
