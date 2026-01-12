import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, ShieldCheck, User, CreditCard, ChevronRight, ChevronLeft, Camera, X, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { submitKYC, uploadKYCDocument, getKYCStatus } from '@/services/kyc.service';

const KYCPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [kycStatus, setKycStatus] = useState<string | null>(null);

    // Form States
    const [panNumber, setPanNumber] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');

    // Document States
    const [aadharFront, setAadharFront] = useState<File | null>(null);
    const [aadharBack, setAadharBack] = useState<File | null>(null);
    const [panCard, setPanCard] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            if (user) {
                try {
                    const status = await getKYCStatus(user.id);
                    if (status) {
                        setKycStatus(status.status);
                        if (status.status === 'APPROVED') {
                            toast({ title: "KYC Verified", description: "Your account is already verified." });
                            navigate('/home');
                        }
                    }
                } catch (error) {
                    console.error("Error checking KYC:", error);
                } finally {
                    setCheckingStatus(false);
                }
            } else {
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, [user, navigate, toast]);

    const handleNext = () => {
        if (step === 1) {
            if (!dob || !gender) {
                toast({ title: "Missing details", description: "Please fill in all fields", variant: "destructive" });
                return;
            }
        }
        if (step === 2) {
            if (!panNumber || !aadharNumber) {
                toast({ title: "Missing details", description: "Please provide valid ID numbers", variant: "destructive" });
                return;
            }
            if (!aadharFront || !aadharBack || !panCard || !selfie) {
                toast({ title: "Documents Missing", description: "Please upload all required photos", variant: "destructive" });
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Upload Documents
            const afPath = await uploadKYCDocument(user.id, aadharFront!, 'aadhar_front');
            const abPath = await uploadKYCDocument(user.id, aadharBack!, 'aadhar_back');
            const panPath = await uploadKYCDocument(user.id, panCard!, 'pan_card');
            const selfiePath = await uploadKYCDocument(user.id, selfie!, 'selfie');

            // 2. Submit Data
            await submitKYC(user.id, {
                pan_number: panNumber,
                aadhar_number: aadharNumber,
                dob,
                gender,
                document_urls: {
                    aadhar_front: afPath,
                    aadhar_back: abPath,
                    pan_card: panPath,
                    selfie: selfiePath
                }
            });

            toast({
                title: "KYC Submitted",
                description: "Your documents are under review. You can now access the dashboard.",
            });
            navigate('/home');
        } catch (error: any) {
            console.error("KYC Submission Error:", error);
            toast({
                title: "Submission Failed",
                description: error.message || "Failed to submit KYC. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper for file upload UI
    const DocumentUpload = ({
        label,
        file,
        setFile,
        captureMode = "environment"
    }: {
        label: string,
        file: File | null,
        setFile: (f: File | null) => void,
        captureMode?: "user" | "environment"
    }) => {
        const inputRef = useRef<HTMLInputElement>(null);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const selectedFile = e.target.files[0];
                // Simple validation
                if (selectedFile.size > 5 * 1024 * 1024) {
                    toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
                    return;
                }
                setFile(selectedFile);
            }
        };

        const triggerUpload = (mode: 'camera' | 'gallery') => {
            if (inputRef.current) {
                if (mode === 'camera') {
                    inputRef.current.setAttribute('capture', captureMode);
                } else {
                    inputRef.current.removeAttribute('capture');
                }
                inputRef.current.click();
            }
        };

        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                {file ? (
                    <div className="relative border rounded-xl p-3 flex items-center gap-3 bg-blue-50 border-blue-200">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={() => setFile(null)} className="p-2 hover:bg-blue-100 rounded-full transition-colors">
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => triggerUpload('gallery')}
                            className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all gap-2"
                        >
                            <div className="p-2 bg-slate-100 rounded-full">
                                <Upload className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="text-xs font-medium text-slate-600">Upload</span>
                        </button>
                        <button
                            onClick={() => triggerUpload('camera')}
                            className="flex flex-col items-center justify-center p-4 border border-blue-100 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-all gap-2"
                        >
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Camera className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-xs font-medium text-blue-700">Take Photo</span>
                        </button>
                        <input
                            type="file"
                            ref={inputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                )}
            </div>
        );
    };

    if (checkingStatus) {
        return (
            <Layout hideHeader>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (kycStatus === 'PENDING') {
        return (
            <Layout hideHeader>
                <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                        <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">KYC Under Review</h1>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">
                        We have received your documents and they are currently being processed. This usually takes 24-48 hours.
                    </p>
                    <Button onClick={() => navigate('/home')}>Go to Dashboard</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout hideHeader>
            <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 px-4 pb-24">
                {/* Stepper */}
                <div className="w-full max-w-md mb-8 flex justify-between items-center relative px-2">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0 rounded-full" />
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 transition-all duration-300 -z-0 rounded-full"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />

                    {[1, 2, 3].map((num) => (
                        <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step >= num ? 'bg-green-600 text-white shadow-green-200 scale-110' : 'bg-white text-slate-400 border border-slate-200'
                            }`}>
                            {step > num ? <CheckCircle className="w-6 h-6" /> : num}
                        </div>
                    ))}
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Complete KYC</h1>
                    <p className="text-slate-500 text-sm">Verify your identity to unlock full wallet features</p>
                </div>

                <Card className="w-full max-w-md shadow-xl border-slate-100 overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            {step === 1 && <User className="w-5 h-5 text-blue-500" />}
                            {step === 2 && <CreditCard className="w-5 h-5 text-blue-500" />}
                            {step === 3 && <ShieldCheck className="w-5 h-5 text-blue-500" />}

                            {step === 1 && "Personal Details"}
                            {step === 2 && "Identity Proof"}
                            {step === 3 && "Final Verification"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-6 min-h-[300px] flex flex-col">

                        {/* Step 1: Personal Details */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Male', 'Female', 'Other'].map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(g)}
                                                className={`py-2 rounded-lg border text-sm font-medium transition-all ${gender === g
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Identity Proof */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Numbers Section */}
                                <div className="grid grid-cols-1 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">PAN Number</Label>
                                        <Input
                                            placeholder="ABCDE1234F"
                                            uppercase
                                            maxLength={10}
                                            value={panNumber}
                                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                            className="font-mono bg-white border-slate-200 uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Aadhaar Number</Label>
                                        <Input
                                            placeholder="1234 5678 9012"
                                            maxLength={12}
                                            type="number"
                                            value={aadharNumber}
                                            onChange={(e) => setAadharNumber(e.target.value)}
                                            className="font-mono bg-white border-slate-200"
                                        />
                                    </div>
                                </div>

                                {/* Uploads Section */}
                                <div className="space-y-6">
                                    <DocumentUpload
                                        label="Aadhaar Front Photo"
                                        file={aadharFront}
                                        setFile={setAadharFront}
                                    />
                                    <DocumentUpload
                                        label="Aadhaar Back Photo"
                                        file={aadharBack}
                                        setFile={setAadharBack}
                                    />
                                    <DocumentUpload
                                        label="PAN Card Photo"
                                        file={panCard}
                                        setFile={setPanCard}
                                    />

                                    <div className="pt-2 border-t border-slate-100">
                                        <DocumentUpload
                                            label="Live Selfie Verification"
                                            file={selfie}
                                            setFile={setSelfie}
                                            captureMode="user"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Verification */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
                                    <ShieldCheck className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Confirm Details</h3>
                                    <p className="text-slate-500 mt-2 text-sm">
                                        Please verify that all uploaded documents are clear and readable.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm border border-slate-100">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">PAN Number</span>
                                        <span className="font-mono font-medium">{panNumber}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Aadhaar</span>
                                        <span className="font-mono font-medium">XXXX-XXXX-{aadharNumber.slice(-4)}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 pt-1">
                                        {[aadharFront, aadharBack, panCard, selfie].map((f, i) => (
                                            <div key={i} className={`aspect-square rounded-lg flex items-center justify-center ${f ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {f ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-left p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <input type="checkbox" className="mt-1 accent-blue-600" id="terms" />
                                    <label htmlFor="terms" className="text-xs text-blue-800 font-medium">
                                        I hereby declare that the proofs submitted are valid and belong to me.
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-8 flex gap-3">
                            {step > 1 && (
                                <Button variant="outline" onClick={handleBack} className="flex-1 h-11">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                            )}
                            <Button
                                onClick={step === 3 ? handleSubmit : handleNext}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 h-11"
                                disabled={loading}
                            >
                                {step === 3 ? (loading ? 'Submitting...' : 'Submit Verification') : (
                                    <>Next <ChevronRight className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default KYCPage;
