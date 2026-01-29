import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Loader2,
    Eye,
    CheckCircle,
    XCircle,
    ChevronRight,
    Calendar,
    User,
    FileText,
    Shield,
    Mail,
    ExternalLink,
    ShieldAlert,
    ShieldCheck,
    Clock,
    AlertTriangle,
    Check,
    X,
    Maximize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { decryptSensitiveData, maskAadhaar } from '@/lib/crypto';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const KYCRequests = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const [loadingImages, setLoadingImages] = useState(false);
    const [decryptedData, setDecryptedData] = useState<{ pan: string, aadhar: string } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectDialog, setShowRejectDialog] = useState(false);

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
                .select('user_id, full_name, email')
                .in('user_id', userIds);

            if (profilesError) {
                console.error("Error fetching profiles:", profilesError);
                return kycData;
            }

            // 3. Merge Data
            const enrichedData = kycData.map((req: any) => {
                const profile = profilesData?.find((p: any) => p.user_id === req.user_id);
                return {
                    ...req,
                    profiles: profile
                };
            });

            return enrichedData;
        }
    });

    // Load Signed URLs and Decrypt data when a request is selected
    useEffect(() => {
        const loadRequestDetails = async () => {
            if (!selectedRequest) {
                setDecryptedData(null);
                setImageUrls({});
                return;
            };

            setLoadingImages(true);

            // 1. Decrypt Sensitive Numbers
            try {
                const [pan, aadhar] = await Promise.all([
                    decryptSensitiveData(selectedRequest.pan_number),
                    decryptSensitiveData(selectedRequest.aadhar_number)
                ]);
                setDecryptedData({ pan, aadhar });
            } catch (err) {
                console.error("Decryption error:", err);
                toast({ title: "Decryption Failed", description: "Could not safely decrypt sensitive data", variant: "destructive" });
            }

            // 2. Load Images
            if (!selectedRequest?.document_urls) {
                setLoadingImages(false);
                return;
            }

            const urls: Record<string, string> = {};
            const keys = ['aadhar_front', 'aadhar_back', 'pan_card', 'selfie'];

            try {
                await Promise.all(keys.map(async (key) => {
                    const path = selectedRequest.document_urls[key];
                    if (path) {
                        const { data, error } = await supabase.storage
                            .from('kyc-documents')
                            .createSignedUrl(path, 3600); // 1 hour expiry
                        if (error) {
                            console.error(`Error creating signed URL for ${key}:`, error);
                        } else if (data?.signedUrl) {
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

        loadRequestDetails();
    }, [selectedRequest]);

    // Approve/Reject Mutation
    const updateStatus = useMutation({
        mutationFn: async ({ id, status, userId, reason }: { id: string, status: 'APPROVED' | 'REJECTED', userId: string, reason?: string }) => {
            const { error: updateError } = await supabase
                .from('kyc_verifications' as any)
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;

            // Log Audit
            const { data: { user: adminUser } } = await supabase.auth.getUser();
            if (adminUser) {
                await (supabase as any).from('admin_audit_logs').insert({
                    admin_id: adminUser.id,
                    action_type: `KYC_${status}`,
                    target_id: userId,
                    details: { kyc_id: id, reason: reason || null }
                });
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin_kyc_requests'] });
            setSelectedRequest(null);
            setShowRejectDialog(false);
            setRejectReason("");
            toast({
                title: variables.status === 'APPROVED' ? "Application Approved" : "Application Rejected",
                description: `Successfully processed the KYC for ${selectedRequest?.profiles?.full_name || 'the user'}.`,
            });
        },
        onError: (err) => {
            toast({ title: "Operation Failed", description: (err as any).message, variant: "destructive" });
        }
    });

    const handleApprove = () => {
        if (!selectedRequest) return;
        updateStatus.mutate({
            id: selectedRequest.id,
            status: 'APPROVED',
            userId: selectedRequest.user_id
        });
    };

    const handleRejectSubmit = () => {
        if (!selectedRequest || !rejectReason.trim()) {
            toast({ title: "Reason Required", description: "Please provide a reason for rejection", variant: "destructive" });
            return;
        }
        updateStatus.mutate({
            id: selectedRequest.id,
            status: 'REJECTED',
            userId: selectedRequest.user_id,
            reason: rejectReason
        });
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-slate-500 font-medium">Loading applications...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">KYC Queue</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Manage and verify new applicant identities.</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">{requests?.length || 0} Pending Requests</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {requests?.length === 0 ? (
                    <Card className="p-20 text-center border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="font-bold text-2xl text-slate-800 mb-2">Queue is Clear</h3>
                        <p className="text-slate-500 max-w-md mx-auto">All pending KYC applications have been processed. You'll be notified when new ones arrive.</p>
                    </Card>
                ) : (
                    requests?.map((req) => (
                        <Card key={req.id} className="overflow-hidden border border-slate-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group rounded-3xl bg-white">
                            <div className="flex flex-col md:flex-row items-stretch p-2">
                                <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                                        <User className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors duration-300" />
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applicant</p>
                                            <h3 className="text-lg font-bold text-slate-900 truncate">
                                                {req.profiles?.full_name || 'Anonymous User'}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 mt-1">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate">{req.profiles?.email || 'No email associated'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Documents Submitted</p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 font-mono text-[9px] py-0.5 px-2">PAN</Badge>
                                                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 font-mono text-[9px] py-0.5 px-2">AADHAAR</Badge>
                                                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 font-mono text-[9px] py-0.5 px-2">SELFIE</Badge>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Submitted</p>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-semibold">{new Date(req.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 md:border-l border-slate-100 bg-slate-50/50 flex items-center justify-center">
                                    <Button
                                        onClick={() => setSelectedRequest(req)}
                                        className="w-full md:w-auto px-8 h-12 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 border-none transition-all duration-300 font-bold shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                                    >
                                        Review <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Premium Review Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-[95vw] md:max-w-6xl h-[95vh] md:h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-slate-50 border-none shadow-2xl rounded-[32px]">
                    <DialogDescription className="sr-only">Verify Identity for {selectedRequest?.profiles?.full_name}</DialogDescription>

                    {/* Header */}
                    <div className="p-6 md:p-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <ShieldCheck className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                    Identity Verification
                                </DialogTitle>
                                <p className="text-sm font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                                    Application <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{selectedRequest?.id.slice(0, 8)}</span>
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-4 py-1.5 rounded-full text-xs font-bold flex gap-2 items-center">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                MANUAL REVIEW REQUIRED
                            </Badge>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Sidebar: Details */}
                        <div className="w-full md:w-80 border-r border-slate-200 bg-white/50 backdrop-blur-xl p-6 md:p-8 overflow-y-auto space-y-8 shrink-0">
                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Basic Info
                                </h4>
                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Applicant Name</p>
                                        <p className="text-sm font-black text-slate-800">{selectedRequest?.profiles?.full_name || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</p>
                                        <p className="text-sm font-bold text-slate-800 break-all">{selectedRequest?.profiles?.email || 'N/A'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</p>
                                            <p className="text-sm font-bold text-slate-800 capitalize">{selectedRequest?.gender || '-'}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Age</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedRequest?.dob ? new Date().getFullYear() - new Date(selectedRequest.dob).getFullYear() : '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Identity Records
                                </h4>
                                <div className="space-y-4">
                                    <div className="group bg-slate-900 p-5 rounded-[24px] shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.02]">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">PAN Number</p>
                                            <Badge className="bg-blue-500/20 text-blue-400 border-none text-[8px] px-1.5 h-4">SECURE</Badge>
                                        </div>
                                        <p className="text-lg font-mono font-black text-white tracking-widest uppercase">
                                            {decryptedData ? decryptedData.pan : '••••••••••'}
                                        </p>
                                    </div>

                                    <div className="group bg-white p-5 rounded-[24px] border border-slate-200 transition-all hover:scale-[1.02] hover:border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Aadhaar Number</p>
                                            <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] px-1.5 h-4">MASKED</Badge>
                                        </div>
                                        <p className="text-lg font-mono font-black text-slate-800 tracking-widest">
                                            {decryptedData ? maskAadhaar(decryptedData.aadhar) : '••••-••••-••••'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-tight">
                                        Ensure document numbers match the details on the images provided.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Stage: Documents */}
                        <div className="flex-1 bg-slate-100/50 p-6 md:p-8 overflow-y-auto">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 md:ml-1">Proof Verification</h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {['aadhar_front', 'aadhar_back', 'pan_card', 'selfie'].map((key) => (
                                    <div key={key} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-200/60 group/card relative flex flex-col">
                                        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                                    {key.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {imageUrls[key] && (
                                                <a
                                                    href={imageUrls[key]}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                                                >
                                                    <Maximize2 className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex-1 aspect-video relative bg-slate-50 flex items-center justify-center overflow-hidden">
                                            {loadingImages ? (
                                                <div className="w-full h-full p-4 space-y-3">
                                                    <Skeleton className="w-full h-full rounded-2xl" />
                                                </div>
                                            ) : imageUrls[key] ? (
                                                <img
                                                    src={imageUrls[key]}
                                                    alt={key}
                                                    className="w-full h-full object-contain transition-all duration-700 group-hover/card:scale-110"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 text-slate-300 p-8 text-center">
                                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <ShieldAlert className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image Unavailable</p>
                                                        <p className="text-[10px] text-slate-400 mt-1 max-w-[140px]">Document could not be retrieved from secure storage.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Overlay */}
                                            {imageUrls[key] && (
                                                <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                                    <Badge className="bg-black/40 backdrop-blur-md text-white border-none text-[8px] font-bold">STRICTLY CONFIDENTIAL</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 bg-amber-50 rounded-3xl p-6 border border-amber-100">
                                <h5 className="text-xs font-black text-amber-800 uppercase mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Checklist for Reviewer
                                </h5>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        "Numbers on documents match the digital entry",
                                        "Photos are clear and text is readable",
                                        "Selfie matches the photo on ID proofs",
                                        "Documents are not expired or damaged"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-amber-900/70 font-medium">
                                            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                                                <div className="w-1 h-1 bg-amber-600 rounded-full" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-end gap-3 md:gap-4 shrink-0">
                        <Button
                            variant="outline"
                            className="h-14 md:w-48 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all text-base"
                            onClick={() => setShowRejectDialog(true)}
                            disabled={updateStatus.isPending}
                        >
                            <XCircle className="w-5 h-5 mr-2 text-rose-500" /> Reject Application
                        </Button>
                        <Button
                            className="h-14 md:w-64 rounded-2xl bg-slate-900 text-white hover:bg-emerald-600 border-none font-black shadow-2xl shadow-slate-900/20 transition-all duration-300 text-base"
                            onClick={handleApprove}
                            disabled={updateStatus.isPending || loadingImages}
                        >
                            {updateStatus.isPending ? (
                                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                            ) : (
                                <><CheckCircle className="w-5 h-5 mr-2" /> Approve Application</>
                            )}
                        </Button>
                    </div>

                    {/* Error Overlay if images fail */}
                    {!loadingImages && Object.keys(imageUrls).length === 0 && selectedRequest?.document_urls && (
                        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-rose-100 flex flex-col items-center gap-4 pointer-events-auto max-w-sm text-center">
                                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6 text-rose-600" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-900">Security Access Issue</h5>
                                    <p className="text-sm text-slate-500 mt-1">Admin lacks permission to view these secure assets. Please check storage RLS policies.</p>
                                </div>
                                <Button size="sm" variant="outline" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => window.location.reload()}>
                                    Refresh Session
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="max-w-md rounded-[32px] p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Reject Application</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Please provide a reason. This will be shared with the applicant to help them correct their documents.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        <textarea
                            className="w-full h-32 rounded-2xl border-2 border-slate-100 p-4 font-medium text-slate-800 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none transition-all resize-none"
                            placeholder="e.g. Aadhar back photo is blurry, Please retake..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" className="rounded-xl font-bold text-slate-500" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="rounded-xl bg-rose-600 text-white font-bold px-8 hover:bg-rose-700 shadow-lg shadow-rose-600/20"
                            onClick={handleRejectSubmit}
                            disabled={updateStatus.isPending || !rejectReason.trim()}
                        >
                            {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
