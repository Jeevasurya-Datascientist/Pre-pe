import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";

export const WalletCard = () => {
    const { availableBalance, loading, refetch } = useWallet();

    return (
        <div className="px-4 py-2">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Your Balance</p>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                            ₹{loading ? "..." : availableBalance.toFixed(2)}
                        </h2>
                        <button
                            onClick={() => refetch()}
                            disabled={loading}
                            className="text-gray-400 hover:text-primary transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <Link to="/wallet/topup">
                    <Button
                        variant="outline"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-none rounded-lg px-4 gap-2 font-semibold h-10"
                    >
                        <Plus className="w-4 h-4" />
                        ADD MONEY
                    </Button>
                </Link>
            </div>
        </div>
    );
};
