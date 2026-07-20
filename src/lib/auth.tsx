import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { RoutePath } from './router';
import { navigate } from './router';

export type AuthRole = 'worker' | 'admin' | null;

interface AuthContextValue {
  role: AuthRole;
  workerId: string | null;
  loginWorker: (phone: string, code: string) => boolean;
  loginAdmin: (username: string, password: string) => boolean;
  logout: () => void;
}

const WORKER_CODE = 'WORKER-2026';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AuthRole>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);

  const loginWorker = useCallback((phone: string, code: string) => {
    if (code.trim().toUpperCase() === WORKER_CODE) {
      setRole('worker');
      setWorkerId(phone.trim() || 'worker');
      navigate('/worker');
      return true;
    }
    return false;
  }, []);

  const loginAdmin = useCallback((username: string, password: string) => {
    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      setRole('admin');
      navigate('/admin');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setWorkerId(null);
    navigate('/track');
  }, []);

  return (
    <AuthContext.Provider value={{ role, workerId, loginWorker, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
