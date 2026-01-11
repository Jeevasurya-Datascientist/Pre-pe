import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ChevronLeft, Share2, AlertTriangle, CheckCircle, XCircle, Clock, Copy, Download, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateInvoice } from "@/utils/invoiceGenerator";
import { ComplaintDialog } from "@/components/transactions/ComplaintDialog";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Transaction } from "@/types/recharge.types";

export default function TransactionDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [complaintOpen, setComplaintOpen] = useState(false);

    // In a real app, fetch data using React Query or a service. 
    // For now, we expect data passed via state, or we fallback to mock/loading
    const [transaction, setTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        if (location.state?.transaction) {
            setTransaction(location.state.transaction);
        } else {
            console.warn("Transaction data expected in state");
        }
    }, [id, location.state]);

    if (!transaction) {
        return <div className="p-8 text-center">Loading transaction details...</div>;
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Copied to clipboard" });
    };

    const StatusHero = ({ status }: { status: string }) => {
        const isSuccess = status === 'SUCCESS';
        const isFailed = status === 'FAILED';
        const isPending = status === 'PENDING';

        return (
            <div className="flex flex-col items-center justify-center py-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl ${isSuccess ? 'bg-green-500 text-white' :
                        isFailed ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'
                    }`}>
                    {isSuccess && <CheckCircle className="w-10 h-10" strokeWidth={3} />}
                    {isFailed && <XCircle className="w-10 h-10" strokeWidth={3} />}
                    {isPending && <Clock className="w-10 h-10" strokeWidth={3} />}
                </div>
                <h2 className={`text-xl font-bold ${isSuccess ? 'text-green-600' :
                        isFailed ? 'text-red-600' : 'text-amber-600'
                    }`}>
                    Transaction {isSuccess ? 'Successful!' : isFailed ? 'Failed' : 'Processing'}
                </h2>
                {isSuccess && <p className="text-slate-400 text-sm mt-1">Payment has been processed</p>}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex justify-center w-full font-sans">
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative">
                {/* Navbar */}
                <div className="bg-white px-4 h-16 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-50">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-100 -ml-2" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6 text-slate-700" />
                    </Button>
                    <h1 className="text-lg font-bold text-slate-800">Transaction Details</h1>
                </div>

                <div className="flex-1 overflow-y-auto pb-24">
                    {/* Content Card */}
                    <div className="mx-4 mt-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                        <StatusHero status={transaction.status} />

                        <div className="px-6 pb-6 space-y-6">
                            {/* Amount & Cashback Row */}
                            <div className="flex gap-4">
                                <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Amount</p>
                                    <p className="text-lg font-bold text-slate-900">₹{Number(transaction.amount).toFixed(2)}</p>
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Cashback</p>
                                    <p className="text-lg font-bold text-green-600">₹{transaction.commission ? Number(transaction.commission).toFixed(2) : '0.00'}</p>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-4 pt-2">
                                {/* Mobile/ID */}
                                <div>
                                    <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                                        <Smartphone className="w-3 h-3" /> Mobile Number
                                    </p>
                                    <div className="flex items-center justify-between group">
                                        <p className="text-slate-700 font-semibold text-[15px]">{transaction.mobile_number || transaction.dth_id || 'N/A'}</p>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(transaction.mobile_number || transaction.dth_id || '')}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Transaction ID */}
                                <div>
                                    <p className="text-xs text-slate-400 font-medium mb-1">Transaction ID</p>
                                    <div className="flex items-center justify-between group">
                                        <p className="text-slate-700 font-semibold text-[15px]">{transaction.id}</p>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(transaction.id)}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Operator Ref */}
                                {transaction.reference_id && (
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium mb-1">Operator Ref</p>
                                        <div className="flex items-center justify-between group">
                                            <p className="text-slate-700 font-semibold text-[15px]">{transaction.reference_id}</p>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(transaction.reference_id || '')}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Date Time */}
                                <div>
                                    <p className="text-xs text-slate-400 font-medium mb-1">Time</p>
                                    <p className="text-slate-700 font-semibold text-[15px]">
                                        {format(new Date(transaction.created_at), 'd MMM yyyy, h:mm a')}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs ring-4 ring-white">
                                            {transaction.service_type === 'MOBILE_PREPAID' ? 'PRE' : 'DTH'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">
                                                {transaction.operator_name || transaction.service_type.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {transaction.service_type.split('_')[0]}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex items-center gap-3 pb-8">
                    <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl text-base font-medium shadow-lg shadow-indigo-200"
                        onClick={() => setComplaintOpen(true)}
                    >
                        Complaint
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                        onClick={() => generateInvoice(transaction)}
                    >
                        <Download className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                        onClick={() => {
                            // Dummy share - normally uses Web Share API
                            if (navigator.share) {
                                navigator.share({
                                    title: 'Transaction Receipt',
                                    text: `Transaction of ₹${transaction.amount} for ${transaction.mobile_number} was ${transaction.status}`,
                                    url: window.location.href,
                                }).catch(console.error);
                            } else {
                                toast({ title: "Shared", description: "Link copied to clipboard" });
                            }
                        }}
                    >
                        <Share2 className="h-5 w-5" />
                    </Button>
                </div>

                {/* Modals */}
                <ComplaintDialog
                    open={complaintOpen}
                    onOpenChange={setComplaintOpen}
                    transactionId={transaction.id}
                />
            </div>
        </div>
    );
}
