import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const KYCRequests = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Fetch Pending Requests
    const { data: requests, isLoading } = useQuery<any[]>({
        queryKey: ['admin_kyc_requests'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('kyc_verifications')
                .select('*, user:user_id(email, id)')
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    // Approve/Reject Mutation
    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'APPROVED' | 'REJECTED' }) => {
            const { error } = await supabase
                .from('kyc_verifications' as any)
                .update({ status })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_kyc_requests'] });
            setSelectedRequest(null);
            toast({ title: "Status Updated", description: "KYC request processed successfully." });
        },
        onError: (err) => {
            toast({ title: "Error", description: (err as any).message, variant: "destructive" });
        }
    });

    if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-20" />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Pending KYC Requests</h1>

            <div className="grid gap-4">
                {requests?.length === 0 ? (
                    <Card className="p-8 text-center text-slate-500">
                        No pending requests found.
                    </Card>
                ) : (
                    requests?.map((req) => (
                        <Card key={req.id} className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{req.pan_number || 'Unknown User'}</h3>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                                </div>
                                <p className="text-sm text-slate-500">Aadhaar: {req.aadhar_number}</p>
                                <p className="text-xs text-slate-400 mt-1">Submitted: {new Date(req.created_at).toLocaleString()}</p>
                            </div>

                            <Button size="sm" onClick={() => setSelectedRequest(req)}>
                                <Eye className="w-4 h-4 mr-2" /> Review
                            </Button>
                        </Card>
                    ))
                )}
            </div>

            {/* Review Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review KYC Request</DialogTitle>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                                <div><span className="text-slate-500">PAN:</span> <span className="font-mono font-bold">{selectedRequest.pan_number}</span></div>
                                <div><span className="text-slate-500">Aadhaar:</span> <span className="font-mono font-bold">{selectedRequest.aadhar_number}</span></div>
                                <div><span className="text-slate-500">DOB:</span> <span>{selectedRequest.dob}</span></div>
                                <div><span className="text-slate-500">Gender:</span> <span>{selectedRequest.gender}</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {['aadhar_front', 'aadhar_back', 'pan_card', 'selfie'].map((key) => (
                                    <div key={key} className="space-y-1">
                                        <p className="text-xs uppercase font-semibold text-slate-500">{key.replace('_', ' ')}</p>
                                        <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden">
                                            {selectedRequest.document_urls?.[key] ? (
                                                <img
                                                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedRequest.document_urls[key]}`}
                                                    alt={key}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : <span className="text-xs text-slate-400">No Image</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    onClick={() => updateStatus.mutate({ id: selectedRequest.id, status: 'REJECTED' })}
                                    disabled={updateStatus.isPending}
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => updateStatus.mutate({ id: selectedRequest.id, status: 'APPROVED' })}
                                    disabled={updateStatus.isPending}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
