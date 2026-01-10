import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TransactionStatus } from "@/types/recharge.types";

const TransactionsAdmin = () => {
    const [txns, setTxns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<TransactionStatus | "ALL">("ALL");

    // Refund Dialog
    const [refundDialog, setRefundDialog] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState<any>(null);
    const [refundReason, setRefundReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchTxns();
    }, [filterStatus]);

    const fetchTxns = async () => {
        setLoading(true);
        try {
            const status = filterStatus === "ALL" ? undefined : filterStatus;
            const res = await adminService.getTransactions(status);
            setTxns(res.data || []);
        } catch (e) {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async () => {
        if (!selectedTxn || !refundReason) return;
        setProcessing(true);
        try {
            await adminService.refundTransaction(selectedTxn.id, refundReason);
            toast.success("Refund Processed");
            setRefundDialog(false);
            fetchTxns();
        } catch (e: any) {
            toast.error(e.message || "Refund failed");
        } finally {
            setProcessing(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const variants: any = {
            SUCCESS: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
            FAILED: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
            PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
            REFUNDED: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100"
        };
        return <Badge className={variants[status] || ""} variant="outline">{status}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground">Monitor and manage all system transactions</p>
                </div>
                <div className="w-[200px]">
                    <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                        <SelectTrigger><SelectValue placeholder="Filter Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="SUCCESS">Success</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Transaction Ref</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                            ) : txns.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">No transactions found</TableCell></TableRow>
                            ) : (
                                txns.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="font-mono text-xs">{t.id.slice(0, 8)}...</div>
                                            <div className="text-xs text-muted-foreground">{t.reference_id || 'N/A'}</div>
                                        </TableCell>
                                        <TableCell>
                                            {t.service_type}
                                            <div className="text-xs text-muted-foreground">{t.mobile_number}</div>
                                        </TableCell>
                                        <TableCell className="font-bold">₹{t.amount}</TableCell>
                                        <TableCell><StatusBadge status={t.status} /></TableCell>
                                        <TableCell className="text-right">
                                            {(t.status === 'FAILED' || t.status === 'PENDING') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => { setSelectedTxn(t); setRefundDialog(true); }}
                                                >
                                                    <RotateCcw className="h-3 w-3 mr-1" /> Refund
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Refund</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to refund this transaction? The amount will be credited back to the user's wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="bg-slate-50 p-3 rounded-md text-sm">
                            <p><strong>Ref:</strong> {selectedTxn?.id}</p>
                            <p><strong>Amount:</strong> ₹{selectedTxn?.amount}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Reason for Refund</Label>
                            <Textarea
                                placeholder="e.g. Transaction timed out / Customer request"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRefundDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRefund} disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TransactionsAdmin;
