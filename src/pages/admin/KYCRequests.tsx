import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, CheckCircle, XCircle, ChevronRight, Calendar, User, FileText, Shield, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export const KYCRequests = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const [loadingImages, setLoadingImages] = useState(false);

    // Fetch Pending Requests
    const { data: requests, isLoading } = useQuery<any[]>({
        queryKey: ['admin_kyc_requests'],
        queryFn: async () => {
            // 1. Fetch KYC Requests (Raw)
            const { data: kycData, error: kycError } = await (supabase as any)
                .from('kyc_verifications')
                .select('*')
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false });

            if (kycError) throw kycError;
            if (!kycData || kycData.length === 0) return [];

            // 2. Fetch Profiles for these users
            const userIds = kycData.map((req: any) => req.user_id);
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', userIds);

            if (profilesError) {
                console.error("Error fetching profiles:", profilesError);
                return kycData;
            }

            // 3. Merge Data
            const enrichedData = kycData.map((req: any) => {
                const profile = profilesData?.find((p: any) => p.id === req.user_id);
                return {
                    ...req,
                    profiles: profile
                };
            });

            return enrichedData;
        }
    });

    // Load Signed URLs when a request is selected
    useEffect(() => {
        const loadImages = async () => {
            if (!selectedRequest?.document_urls) return;

            setLoadingImages(true);
            const urls: Record<string, string> = {};
            const keys = ['aadhar_front', 'aadhar_back', 'pan_card', 'selfie'];

            try {
                await Promise.all(keys.map(async (key) => {
                    const path = selectedRequest.document_urls[key];
                    if (path) {
                        const { data } = await supabase.storage
                            .from('kyc-documents')
                            .createSignedUrl(path, 3600); // 1 hour expiry
                        if (data?.signedUrl) {
                            urls[key] = data.signedUrl;
                        }
                    }
                }));
                setImageUrls(urls);
            } catch (error) {
                console.error("Error loading images:", error);
                toast({ title: "Image Load Error", description: "Failed to load secure images", variant: "destructive" });
            } finally {
                setLoadingImages(false);
            }
        };

        loadImages();
    }, [selectedRequest]);

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

    if (isLoading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-20 text-slate-400" />;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">KYC Verification</h1>
                    <p className="text-slate-500 mt-1">Review and manage pending identity verification requests.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-white">
                    {requests?.length || 0} Pending
                </Badge>
            </div>

            <div className="grid gap-4">
                {requests?.length === 0 ? (
                    <Card className="p-12 text-center text-slate-500 border-dashed">
                        <Shield className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-semibold text-lg text-slate-700">All Caught Up</h3>
                        <p>No pending KYC requests to review.</p>
                    </Card>
                ) : (
                    requests?.map((req) => (
                        <Card key={req.id} className="group hover:shadow-md transition-all border-slate-200">
                            <div className="flex flex-col md:flex-row items-center p-5 gap-6">
                                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>

                                <div className="flex-1 min-w-0 grid md:grid-cols-3 gap-6 w-full">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">Applicant</p>
                                        <h3 className="font-bold text-slate-900 truncate">
                                            {req.profiles?.full_name || 'Unknown Name'}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{req.profiles?.email || 'No Email'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">Documents</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="font-mono text-xs">PAN: {req.pan_number}</Badge>
                                            <Badge variant="secondary" className="font-mono text-xs">AADHAAR: {req.aadhar_number}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            DOB: {new Date(req.dob).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
                                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                                            Pending Review
                                        </Badge>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Submitted {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <Button onClick={() => setSelectedRequest(req)} className="shrink-0 bg-slate-900 text-white hover:bg-slate-800">
                                    Review Request <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Enterprise Grade Review Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-slate-50/50">
                    <DialogDescription className="sr-only">Review Application Details</DialogDescription>
                    {/* Header */}
                    <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Review Application
                            </DialogTitle>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                ID: <span className="font-mono">{selectedRequest?.id}</span>
                            </p>
                        </div>
                        <Badge variant="outline" className="px-3 py-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                            Action Required
                        </Badge>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedRequest && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left: User Bio Data */}
                                <div className="space-y-6">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-500" /> Personal Details
                                        </h4>
                                        <Separator />
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                                                <p className="font-medium text-slate-900">{selectedRequest.profiles?.full_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                                                <p className="font-medium text-slate-900">{selectedRequest.profiles?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mobile:hidden">Date of Birth</label>
                                                <p className="font-medium text-slate-900">{selectedRequest.dob}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</label>
                                                <p className="font-medium text-slate-900 capitalize">{selectedRequest.gender}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-500" /> Identity Numbers
                                        </h4>
                                        <Separator />
                                        <div className="space-y-4">
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PAN Number</label>
                                                <p className="font-mono text-lg font-bold text-slate-900">{selectedRequest.pan_number}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aadhaar Number</label>
                                                <p className="font-mono text-lg font-bold text-slate-900">{selectedRequest.aadhar_number}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Document Proofs */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h4 className="font-semibold text-slate-900 ml-1">Document Verification</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['aadhar_front', 'aadhar_back', 'pan_card', 'selfie'].map((key) => (
                                            <div key={key} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider replace-underscore">
                                                        {key.replace('_', ' ')}
                                                    </span>
                                                    <Badge variant="outline" className="bg-white text-[10px] text-slate-400">IMAGE</Badge>
                                                </div>
                                                <div className="aspect-[4/3] relative bg-slate-100 flex items-center justify-center group">
                                                    {loadingImages ? (
                                                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                                    ) : imageUrls[key] ? (
                                                        <a href={imageUrls[key]} target="_blank" rel="noreferrer" className="block w-full h-full relative cursor-zoom-in">
                                                            <img
                                                                src={imageUrls[key]}
                                                                alt={key}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-md">View Full</span>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <XCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                            <span className="text-xs text-slate-400">Failed to load</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
                        <Button
                            variant="outline"
                            className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700 w-32"
                            onClick={() => updateStatus.mutate({ id: selectedRequest.id, status: 'REJECTED' })}
                            disabled={updateStatus.isPending}
                        >
                            {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" /> Reject</>}
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white w-40"
                            onClick={() => updateStatus.mutate({ id: selectedRequest.id, status: 'APPROVED' })}
                            disabled={updateStatus.isPending}
                        >
                            {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Approve</>}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
