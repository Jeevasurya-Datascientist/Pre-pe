
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/services/admin";
import { Loader2, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVolume: 0,
        pendingTxns: 0,
        successRate: 0
    });
    const [recentTxns, setRecentTxns] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
        // Simple polling for dashboard
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            // Parallel fetches for summary
            // In a real app, use a dedicated RPC function "get_admin_stats" for performance
            const users = await adminService.getUsers(1, 1);
            const allTxns = await adminService.getTransactions();

            const txns = allTxns.data || [];
            const successful = txns.filter(t => t.status === 'SUCCESS');
            const pending = txns.filter(t => t.status === 'PENDING');

            const totalVol = successful.reduce((sum, t) => sum + Number(t.amount), 0);
            const rate = txns.length ? (successful.length / txns.length) * 100 : 0;

            setStats({
                totalUsers: users.count || 0,
                totalVolume: totalVol,
                pendingTxns: pending.length,
                successRate: Math.round(rate)
            });

            setRecentTxns(txns.slice(0, 5));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div><Loader2 className="animate-spin" /> Loading stats...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <span className="text-2xl font-bold">₹{stats.totalVolume.toLocaleString()}</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground flex items-center text-green-600">
                            <ArrowUpRight className="h-4 w-4 mr-1" /> Lifetime volume
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <span className="text-2xl font-bold">{stats.pendingTxns}</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground flex items-center text-yellow-600">
                            <Clock className="h-4 w-4 mr-1" /> Action required
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <span className="text-2xl font-bold">{stats.successRate}%</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Based on {recentTxns.length} transactions
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <span className="text-2xl font-bold">{stats.totalUsers}</span>
                    </CardHeader>
                </Card>
            </div>

            {/* Recent Transactions List */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentTxns.map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-full ${txn.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : txn.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {txn.status === 'SUCCESS' ? <CheckCircle2 className="h-5 w-5" /> : txn.status === 'FAILED' ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{txn.service_type} - {txn.operator_name || 'Wallet'}</p>
                                        <p className="text-sm text-muted-foreground">{txn.mobile_number || txn.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{txn.amount}</p>
                                    <Badge variant={txn.status === 'SUCCESS' ? 'default' : txn.status === 'FAILED' ? 'destructive' : 'secondary'}>
                                        {txn.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
