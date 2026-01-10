
import { Button } from "@/components/ui/button";
import { ChevronLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ThemeSettings = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

    const themes = [
        { id: 'light', name: 'Light Mode', color: 'bg-white border-slate-200' },
        { id: 'dark', name: 'Dark Mode', color: 'bg-slate-900 border-slate-700 text-white' },
        { id: 'system', name: 'System Default', color: 'bg-gradient-to-br from-white to-slate-900 border-slate-300' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center w-full">
            <div className="w-full max-w-md bg-white min-h-screen relative flex flex-col">
                <div className="bg-white px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-10 border-b border-slate-100">
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 h-10 w-10 text-slate-600" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold text-slate-800">Theme Settings</h1>
                </div>

                <div className="p-6 space-y-4">
                    {themes.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => setTheme(t.id as any)}
                            className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${theme === t.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-lg border shadow-sm ${t.color}`}></div>
                                <span className="font-semibold text-slate-700">{t.name}</span>
                            </div>
                            {theme === t.id && (
                                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;
