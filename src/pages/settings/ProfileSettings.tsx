import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Mail, Phone, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileSettings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
    const [uploading, setUploading] = useState(false);

    // Create a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state with user data when it becomes available
    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');
        }
    }, [user]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            // Upload the file to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get the public URL
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);

            toast({
                title: "Image uploaded",
                description: "Your new profile picture is ready to save.",
            });

        } catch (error: any) {
            toast({
                title: "Error uploading image",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    // We don't update phone here typically as it requires verification,
                    // but if we wanted to support it, we'd add it here.
                }
            });

            if (error) throw error;

            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });

            // Refresh logic or navigation could go here if needed
            navigate(0); // Reload to reflect changes globally if useAuth doesn't auto-update immediately in all contexts

        } catch (error: any) {
            toast({
                title: "Error updating profile",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white min-h-screen relative flex flex-col pb-10">
                {/* Header */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10 border-b border-slate-100">
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 h-10 w-10 text-slate-600" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold text-slate-800">Edit Profile</h1>
                </div>

                <div className="p-6 space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            <Avatar className="h-28 w-28 border-4 border-slate-100">
                                <AvatarImage src={avatarUrl} />
                                <AvatarFallback className="text-3xl bg-blue-50 text-blue-600">
                                    {(fullName?.[0] || 'U').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-2 border-white shadow-md">
                                <Camera className="h-4 w-4" />
                            </button>
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        {uploading && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-600">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-600">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    value={user?.email || ''}
                                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                                    readOnly
                                />
                            </div>
                            <p className="text-xs text-orange-500">* Email cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-600">Mobile Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="phone"
                                    value={user?.phone || user?.user_metadata?.phone || ''}
                                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleUpdateProfile}
                        disabled={loading || uploading}
                        className="w-full h-12 mt-6 bg-blue-600 hover:bg-blue-700 text-lg font-bold"
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
