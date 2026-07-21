import { Sparkles, LogOut, ShieldCheck, HardHat, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { navigate } from '../lib/router';

const PORTAL_META = {
  admin: { label: 'مركز الإدارة', icon: ShieldCheck },
  worker: { label: 'بوابة العامل', icon: HardHat },
} as const;

export function Header() {
  const { role, user, signOut } = useAuth();
  if (!role) return null;
  const meta = PORTAL_META[role];
  const Icon = meta.icon;

  return (
    <header className="sticky top-0 z-40 bg-navy-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles size={22} className="text-navy-800" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Icon size={14} className="text-gold-300" />
                <span className="text-xs font-semibold text-gold-200">{meta.label}</span>
              </div>
              <h1 className="font-bold text-base sm:text-lg leading-tight">صالون الديكور الفاخر</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden sm:inline text-xs text-navy-200" dir="ltr">{user.email}</span>
            )}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-navy-700/50 hover:bg-red-500/70 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 size={32} className="animate-spin text-navy-500" />
    </div>
  );
}

export { navigate };
