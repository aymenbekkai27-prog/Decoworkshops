import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle2 size={20} className="text-green-600" />,
    error: <AlertCircle size={20} className="text-red-600" />,
    info: <Info size={20} className="text-blue-600" />,
  };
  const borders = { success: 'border-green-200', error: 'border-red-200', info: 'border-blue-200' };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[60] flex flex-col gap-2 sm:w-96">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 bg-white ${borders[t.type]} border rounded-xl shadow-lg px-4 py-3 animate-slide-up`}>
            {icons[t.type]}
            <p className="flex-1 text-sm font-semibold text-navy-800">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-navy-700"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
