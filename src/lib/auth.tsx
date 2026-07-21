import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { navigate } from './router';

export type AuthRole = 'worker' | 'admin' | null;

interface AuthContextValue {
  role: AuthRole;
  user: User | null;
  workerId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

function roleFromUser(user: User | null): AuthRole {
  const r = user?.app_metadata?.role;
  return r === 'admin' || r === 'worker' ? r : null;
}

function workerIdFromUser(user: User | null): string | null {
  return (user?.app_metadata?.worker_id as string | undefined) ?? null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate('/track');
  }, []);

  const user = session?.user ?? null;
  const role = roleFromUser(user);
  const workerId = workerIdFromUser(user);

  return (
    <AuthContext.Provider value={{ role, user, workerId, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
