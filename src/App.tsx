import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './components/ui/Toast';
import { Header, FullScreenLoader } from './components/Header';
import { CustomerPortal } from './components/CustomerPortal';
import { WorkerDashboard } from './components/WorkerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginScreen } from './components/LoginScreen';
import { useHashRoute, navigate } from './lib/router';
import type { RoutePath } from './lib/router';

function GuardedRoute({ path, children }: { path: Extract<RoutePath, '/worker' | '/admin'>; children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (role !== path.slice(1)) {
    return <LoginScreen redirectTo={path} />;
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>{children}</main>
    </div>
  );
}

function AppContent() {
  const path = useHashRoute();

  if (path === '/track') {
    return (
      <div className="min-h-screen bg-slate-50">
        <CustomerPortal />
      </div>
    );
  }

  if (path === '/worker') {
    return (
      <GuardedRoute path="/worker">
        <WorkerDashboard />
      </GuardedRoute>
    );
  }

  if (path === '/admin') {
    return (
      <GuardedRoute path="/admin">
        <AdminDashboard />
      </GuardedRoute>
    );
  }

  navigate('/track');
  return null;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
