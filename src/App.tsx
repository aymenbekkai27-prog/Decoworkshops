import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { Header } from './components/Header';
import { CustomerPortal } from './components/CustomerPortal';
import { WorkerDashboard } from './components/WorkerDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function AppContent() {
  const { role } = useApp();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        {role === 'customer' && <CustomerPortal />}
        {role === 'worker' && <WorkerDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
