import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ComplaintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionId: string;
}

export function ComplaintDialog({ open, onOpenChange, transactionId }: ComplaintDialogProps) {
    const { toast } = useToast();
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            toast({ title: "Error", description: "Please select a reason for the complaint.", variant: "destructive" });
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({
            title: "Complaint Raised Successfully",
            description: `Ticket #TC-${Math.floor(Math.random() * 10000)} created for transaction ${transactionId.substring(0, 8)}...`,
        });

        setLoading(false);
        onOpenChange(false);
        setReason("");
        setDetails("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Raise a Complaint</DialogTitle>
                    <DialogDescription>
                        Submit a ticket for Transaction ID: <span className="font-mono text-xs bg-slate-100 p-1 rounded">{transactionId}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Issue Type</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select issue type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recharge_failed">Recharge Failed but Amount Deducted</SelectItem>
                                <SelectItem value="wrong_amount">Wrong Amount Credited</SelectItem>
                                <SelectItem value="service_not_active">Service Not Activated</SelectItem>
                                <SelectItem value="other">Other Issue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="details">Additional Details</Label>
                        <Textarea
                            id="details"
                            placeholder="Describe your issue..."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Ticket
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
