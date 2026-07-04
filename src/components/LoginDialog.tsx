import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, X } from 'lucide-react';

export default function LoginDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const nav = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">Sign in to Subidha</h2>
            <p className="mt-1 text-sm text-slate-500">Choose the right portal for your account.</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <button
            onClick={() => {
              onClose();
              nav('/student/login');
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-100"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-white">
              <GraduationCap size={20} />
            </span>
            <span>
              <span className="block font-black text-slate-950">Student Login</span>
              <span className="block text-sm text-slate-600">Payments, leave, and personal dashboard</span>
            </span>
          </button>
          <button
            onClick={() => {
              onClose();
              nav('/admin/login');
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <ShieldCheck size={20} />
            </span>
            <span>
              <span className="block font-black text-slate-950">Admin Login</span>
              <span className="block text-sm text-slate-600">Applications, students, billing, and settings</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
