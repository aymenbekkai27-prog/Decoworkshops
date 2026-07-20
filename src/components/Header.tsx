import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { Role } from '../types';
import { useApp } from '../context/AppContext';

const ROLES: { key: Role; label: string }[] = [
  { key: 'customer', label: 'بوابة الزبون' },
  { key: 'worker', label: 'لوحة العامل' },
  { key: 'admin', label: 'مركز الإدارة' },
];

export function Header() {
  const { role, setRole } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles size={22} className="text-navy-800" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight">صالون الديكور الفاخر</h1>
              <p className="text-[10px] sm:text-xs text-navy-200">سوق الديكور الداخلي الفاخر</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-navy-700/50 rounded-xl p-1">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  role === r.key ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-100 hover:text-white hover:bg-navy-500/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </nav>

          <button className="md:hidden p-2 rounded-lg hover:bg-navy-500/50" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden flex flex-col gap-1 pb-4 animate-fade-in">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => { setRole(r.key); setMobileOpen(false); }}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-right transition-all ${
                  role === r.key ? 'bg-white text-navy-700' : 'text-navy-100 hover:bg-navy-500/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
