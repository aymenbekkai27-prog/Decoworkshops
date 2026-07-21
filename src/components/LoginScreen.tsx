import { useState } from 'react';
import { Sparkles, HardHat, ShieldCheck, ArrowLeft, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from './ui/Toast';
import type { RoutePath } from '../lib/router';
import { navigate } from '../lib/router';

interface LoginScreenProps {
  redirectTo: Extract<RoutePath, '/worker' | '/admin'>;
}

const DEMO_ACCOUNTS = {
  admin: { email: 'admin@deco.dz', pass: 'admin123' },
  worker: { email: 'yacine@deco.dz', pass: 'worker123' },
};

export function LoginScreen({ redirectTo }: LoginScreenProps) {
  const { signIn } = useAuth();
  const showToast = useToast();
  const isAdmin = redirectTo === '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await signIn(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'فشل تسجيل الدخول');
      showToast('فشل تسجيل الدخول', 'error');
    } else {
      showToast('تم تسجيل الدخول بنجاح', 'success');
    }
  }

  function fillDemo() {
    const d = DEMO_ACCOUNTS[isAdmin ? 'admin' : 'worker'];
    setEmail(d.email);
    setPassword(d.pass);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-navy-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-7">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md ${isAdmin ? 'bg-navy-600' : 'bg-gold-500'}`}>
              {isAdmin ? <ShieldCheck size={32} className="text-white" /> : <HardHat size={32} className="text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-navy-800 mb-1">
              {isAdmin ? 'دخول المركز الإداري' : 'دخول بوابة العامل'}
            </h2>
            <p className="text-sm text-slate-500">
              {isAdmin ? 'هذه المنطقة محمية - يرجى إدخال بيانات الاعتماد' : 'أدخل بريدك الإلكتروني وكلمة المرور'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input-field pr-10" placeholder={isAdmin ? 'admin@deco.dz' : 'yacine@deco.dz'} value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="label-field">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" className="input-field pr-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

            <button type="submit" disabled={busy} className={`btn-primary w-full py-3 flex items-center justify-center gap-2 ${isAdmin ? '' : 'bg-gold-500 hover:bg-gold-600'} disabled:opacity-60`}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : 'تسجيل الدخول'}
            </button>
          </form>

          <button
            onClick={fillDemo}
            className="mt-3 w-full text-xs text-slate-400 hover:text-navy-600 font-semibold transition-colors"
          >
            ملء بيانات العرض التجريبي تلقائياً
          </button>

          <button
            onClick={() => navigate('/track')}
            className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 font-semibold transition-colors"
          >
            <ArrowLeft size={16} /> العودة إلى بوابة العميل
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-slate-400">
          <Sparkles size={16} className="text-gold-500" />
          <span className="text-sm">صالون الديكور الفاخر</span>
        </div>
      </div>
    </div>
  );
}
