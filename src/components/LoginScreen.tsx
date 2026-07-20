import { useState } from 'react';
import { Sparkles, HardHat, ShieldCheck, ArrowLeft, Lock, User, KeyRound } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from './ui/Toast';
import type { RoutePath } from '../lib/router';
import { navigate } from '../lib/router';

interface LoginScreenProps {
  redirectTo: Extract<RoutePath, '/worker' | '/admin'>;
}

export function LoginScreen({ redirectTo }: LoginScreenProps) {
  const { loginWorker, loginAdmin } = useAuth();
  const showToast = useToast();
  const isAdmin = redirectTo === '/admin';
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const ok = isAdmin ? loginAdmin(username, password) : loginWorker(phone, code);
    if (!ok) {
      setError(isAdmin ? 'بيانات الدخول غير صحيحة' : 'رمز الدخول غير صحيح');
      showToast('فشل تسجيل الدخول', 'error');
    } else {
      showToast('تم تسجيل الدخول بنجاح', 'success');
    }
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
              {isAdmin ? 'هذه المنطقة محمية — يرجى إدخال بيانات الاعتماد' : 'أدخل رقم هاتفك ورمز الدخول المخصص'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdmin ? (
              <>
                <div>
                  <label className="label-field">اسم المستخدم</label>
                  <div className="relative">
                    <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input-field pr-10" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label-field">كلمة المرور</label>
                  <div className="relative">
                    <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" className="input-field pr-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label-field">رقم الهاتف</label>
                  <div className="relative">
                    <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input-field pr-10" placeholder="0551234567" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
                  </div>
                </div>
                <div>
                  <label className="label-field">رمز الدخول</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input-field pr-10" placeholder="WORKER-XXXX" value={code} onChange={(e) => setCode(e.target.value)} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">رمز تجريبي: WORKER-2026</p>
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

            <button type="submit" className={`btn-primary w-full py-3 ${isAdmin ? '' : 'bg-gold-500 hover:bg-gold-600'}`}>
              تسجيل الدخول
            </button>
          </form>

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
