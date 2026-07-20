import { Sparkles, ShieldCheck, HardHat, Search, ArrowLeft } from 'lucide-react';
import type { Role } from '../types';

interface PortalSelectorProps {
  onSelect: (role: Role) => void;
}

const PORTALS: { key: Role; title: string; subtitle: string; icon: typeof ShieldCheck; accent: string; ring: string }[] = [
  {
    key: 'admin',
    title: 'مركز الإدارة',
    subtitle: 'إدارة المشاريع والعمّال والحسابات',
    icon: ShieldCheck,
    accent: 'from-navy-600 to-navy-800',
    ring: 'group-hover:ring-navy-400',
  },
  {
    key: 'worker',
    title: 'بوابة العامل',
    subtitle: 'متابعة المهام ورفع الصور وتحديث القياسات',
    icon: HardHat,
    accent: 'from-gold-500 to-gold-700',
    ring: 'group-hover:ring-gold-400',
  },
  {
    key: 'customer',
    title: 'بوابة العميل',
    subtitle: 'تتبّع المشروع برمز التتبع — عرض فقط',
    icon: Search,
    accent: 'from-slate-600 to-slate-800',
    ring: 'group-hover:ring-slate-400',
  },
];

export function PortalSelector({ onSelect }: PortalSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-navy-50 to-slate-100 flex flex-col">
      <header className="bg-white/70 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-600 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles size={22} className="text-gold-400" />
          </div>
          <div>
            <h1 className="font-bold text-navy-800 leading-tight">صالون الديكور الفاخر</h1>
            <p className="text-[11px] text-slate-500">سوق الديكور الداخلي الفاخر</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-white border border-slate-200 text-navy-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 shadow-sm">
              <Sparkles size={15} className="text-gold-500" /> اختر البوابة للدخول
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 mb-3">مرحباً بك في المنصة</h2>
            <p className="text-slate-500 max-w-xl mx-auto">ثلاث بوابات منفصلة مصممة لكل فئة من المستخدمين. اختر البوابة المناسبة لمتابعة عملك.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PORTALS.map((p) => (
              <button
                key={p.key}
                onClick={() => onSelect(p.key)}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 ring-2 ring-transparent text-right"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-4 shadow-md`}>
                  <p.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-1.5">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{p.subtitle}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 group-hover:text-navy-800">
                  دخول <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-slate-400">
        © 2026 صالون الديكور الفاخر — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
