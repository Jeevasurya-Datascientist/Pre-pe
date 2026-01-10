import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CommissionManager = () => {
    const [slabs, setSlabs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        operator_id: "",
        service_type: "MOBILE_PREPAID",
        commission_type: "PERCENTAGE",
        commission_value: "0",
        min_amount: "0",
        max_amount: "10000"
    });

    useEffect(() => {
        fetchSlabs();
    }, []);

    const fetchSlabs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('commission_slabs')
            .select('*')
            .order('service_type');

        if (error) {
            toast.error("Failed to load commissions");
        } else {
            setSlabs(data || []);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        const payload = {
            operator_id: formData.operator_id || 'ALL', // Simple 'ALL' handling
            service_type: formData.service_type,
            commission_type: formData.commission_type,
            commission_value: Number(formData.commission_value),
            min_amount: Number(formData.min_amount),
            max_amount: Number(formData.max_amount),
            is_active: true
        };

        let error;
        if (editingId) {
            const { error: e } = await supabase.from('commission_slabs').update(payload).eq('id', editingId);
            error = e;
        } else {
            const { error: e } = await supabase.from('commission_slabs').insert(payload);
            error = e;
        }

        if (error) {
            toast.error("Failed to save commission slab");
            console.error(error);
        } else {
            toast.success("Commission Saved");
            setDialogOpen(false);
            fetchSlabs();
            resetForm();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this slab?")) return;
        const { error } = await supabase.from('commission_slabs').delete().eq('id', id);
        if (error) toast.error("Delete failed");
        else {
            toast.success("Deleted");
            fetchSlabs();
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            operator_id: "",
            service_type: "MOBILE_PREPAID",
            commission_type: "PERCENTAGE",
            commission_value: "0",
            min_amount: "0",
            max_amount: "10000"
        });
    };

    const openEdit = (slab: any) => {
        setEditingId(slab.id);
        setFormData({
            operator_id: slab.operator_id,
            service_type: slab.service_type,
            commission_type: slab.commission_type,
            commission_value: slab.commission_value.toString(),
            min_amount: slab.min_amount.toString(),
            max_amount: slab.max_amount.toString()
        });
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Commission Management</h2>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Slab
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Operator</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Range</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={6}><Loader2 className="animate-spin" /></TableCell></TableRow>}
                            {!loading && slabs.length === 0 && <TableRow><TableCell colSpan={6}>No slabs found.</TableCell></TableRow>}
                            {slabs.map((slab) => (
                                <TableRow key={slab.id}>
                                    <TableCell>{slab.service_type}</TableCell>
                                    <TableCell>{slab.operator_id === 'ALL' ? 'All Operators' : slab.operator_id}</TableCell>
                                    <TableCell>{slab.commission_type}</TableCell>
                                    <TableCell className="font-bold text-green-600">
                                        {slab.commission_type === 'PERCENTAGE' ? `${slab.commission_value}%` : `₹${slab.commission_value}`}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        ₹{slab.min_amount} - ₹{slab.max_amount}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(slab)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(slab.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit' : 'Add'} Commission Slab</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Service</Label>
                            <Select
                                value={formData.service_type}
                                onValueChange={(v) => setFormData({ ...formData, service_type: v })}
                            >
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MOBILE_PREPAID">Prepaid</SelectItem>
                                    <SelectItem value="MOBILE_POSTPAID">Postpaid</SelectItem>
                                    <SelectItem value="DTH">DTH</SelectItem>
                                    <SelectItem value="WALLET">Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <Select
                                value={formData.commission_type}
                                onValueChange={(v) => setFormData({ ...formData, commission_type: v })}
                            >
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                    <SelectItem value="FLAT">Flat (₹)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Value</Label>
                            <Input
                                type="number"
                                className="col-span-3"
                                value={formData.commission_value}
                                onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Operator ID</Label>
                            <Input
                                className="col-span-3"
                                placeholder="Details or 'ALL'"
                                value={formData.operator_id}
                                onChange={(e) => setFormData({ ...formData, operator_id: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CommissionManager;
