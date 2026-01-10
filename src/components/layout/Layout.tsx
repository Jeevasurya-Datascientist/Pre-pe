import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export const Layout = ({ children, title, showBack }: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50/30 flex justify-center w-full">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative flex flex-col">
        {title ? (
          <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50 border-b border-gray-100">
            {showBack && (
              <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
            )}
            <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          </div>
        ) : (
          <Header />
        )}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
