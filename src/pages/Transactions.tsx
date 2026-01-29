import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { History, Wallet, FileBarChart, ChevronRight, FileText, Banknote, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { getTransactionHistory } from '@/services/recharge.service';
import { useKYC } from '@/hooks/useKYC';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isApproved, isLoading: kycLoading } = useKYC();
  const [stats, setStats] = useState({ count: 0, cashback: 0 });

  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        // Fetch recent transactions to get a count (Approximation for demo)
        // In a real app, we would have a specific /stats endpoint
        const txns = await getTransactionHistory(user.id, 100);
        const successCount = txns.filter(t => t.status === 'SUCCESS').length;
        // Mocking cashback calculation based on success count for now, or 0
        setStats({
          count: successCount,
          cashback: 0 // Backend doesn't support cashback tracking yet
        });
      }
    };
    loadStats();
  }, [user]);

  const reportModules = [
    {
      title: "Transaction History",
      description: "View all mobile recharges, DTH, and bill payment records.",
      icon: History,
      color: "bg-blue-100 text-blue-600",
      path: "/reports/history"
    },
    {
      title: "Wallet Ledger",
      description: "Detailed track of wallet credits, debits, and refunds.",
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-600",
      path: "/wallet/ledger"
    },
    {
      title: "Account Statement",
      description: "Download monthly statements for your account activity.",
      icon: FileBarChart,
      color: "bg-purple-100 text-purple-600",
      path: "/wallet/ledger",
    }
  ];

  return (
    <Layout title="Reports" showBottomNav>
      <div className="container py-8 pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Reports & Activity</h1>
          <p className="text-slate-500 mt-2">
            Overview of your financial activity and transaction records.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg">
            <CardContent className="p-5">
              <div className="p-2 bg-white/10 w-fit rounded-lg mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-300 mb-1">Transactions Completed</p>
              <p className="text-2xl font-bold">{stats.count}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <div className="p-2 bg-orange-100 w-fit rounded-lg mb-3">
                <Banknote className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Cashback Earned</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{kycLoading ? "..." : (isApproved ? stats.cashback.toFixed(2) : "**.**")}
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-4">Detailed Reports</h2>
        <div className="space-y-4">
          {reportModules.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="group flex items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-blue-100 cursor-pointer active:scale-[0.99]"
            >
              <div className={`p-4 rounded-xl ${item.color} mr-4 transition-colors group-hover:bg-opacity-80`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 pr-4">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default TransactionsPage;
