import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Ban, CheckCircle, CreditCard, History } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [walletDialog, setWalletDialog] = useState(false);

    // Wallet Adjustment Form
    const [adjType, setAdjType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
    const [adjAmount, setAdjAmount] = useState("");
    const [adjReason, setAdjReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Logic to debounce search should be added in real app
            const { data, error } = await adminService.getUsers(page, 20, search);
            if (error) throw error;
            setUsers(data || []);
        } catch (e) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleWalletAdjustment = async () => {
        if (!selectedUser || !adjAmount || !adjReason) return;
        setSubmitting(true);
        try {
            await adminService.adjustWallet(selectedUser.user_id, adjType, Number(adjAmount), adjReason);
            toast.success("Wallet adjusted successfully");
            setWalletDialog(false);
            fetchUsers(); // Refresh data
            // Reset form
            setAdjAmount("");
            setAdjReason("");
        } catch (e: any) {
            toast.error(e.message || "Adjustment failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                        placeholder="Search by name, email, phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button size="icon" onClick={() => fetchUsers()}>
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User Details</TableHead>
                                <TableHead>Wallet Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.full_name || 'N/A'}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold">₹{user.wallets?.balance || 0}</div>
                                            {user.wallets?.locked_balance > 0 && (
                                                <div className="text-xs text-yellow-600">Locked: ₹{user.wallets.locked_balance}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                Active
                                            </Badge>
                                            {/* TODO: Real status check */}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => { setSelectedUser(user); setWalletDialog(true); }}
                                                >
                                                    <CreditCard className="h-4 w-4 mr-1" /> Money
                                                </Button>
                                                {/* <Button variant="ghost" size="sm">
                          <History className="h-4 w-4" />
                        </Button> */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Wallet Adjustment Dialog */}
            <Dialog open={walletDialog} onOpenChange={setWalletDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Wallet Balance</DialogTitle>
                        <DialogDescription>
                            Manually credit or debit funds for {selectedUser?.full_name || selectedUser?.email}.
                            This action will be logged.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <Select value={adjType} onValueChange={(v: any) => setAdjType(v)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CREDIT">Credit (Add Money)</SelectItem>
                                    <SelectItem value="DEBIT">Debit (Remove Money)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Amount</Label>
                            <Input
                                type="number"
                                value={adjAmount}
                                onChange={(e) => setAdjAmount(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Reason</Label>
                            <Textarea
                                value={adjReason}
                                onChange={(e) => setAdjReason(e.target.value)}
                                placeholder="e.g. Refund for stalled transaction"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setWalletDialog(false)}>Cancel</Button>
                        <Button onClick={handleWalletAdjustment} disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Adjustment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
