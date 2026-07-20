import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AppData, Job, Worker, Material, Role, JobBid } from '../types';
import { loadData, saveData, resetData, generateTrackingCode } from '../lib/storage';

interface AppContextValue {
  data: AppData;
  role: Role | null;
  setRole: (r: Role) => void;
  exitPortal: () => void;
  addJob: (job: Omit<Job, 'id' | 'trackingCode' | 'status' | 'createdAt' | 'bids'>) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  getJob: (id: string) => Job | undefined;
  getJobByTracking: (code: string) => Job | undefined;
  addBid: (jobId: string, bid: Omit<JobBid, 'id' | 'createdAt'>) => void;
  assignWorker: (jobId: string, workerId: string, workerName: string) => void;
  addWorker: (worker: Omit<Worker, 'id' | 'rating' | 'jobsCompleted'>) => void;
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, patch: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  toggleBoxOpened: (materialId: string, jobId?: string) => void;
  setAdminProfitSplit: (v: number) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [role, setRole] = useState<Role | null>(null);

  const exitPortal = useCallback(() => setRole(null), []);

  const addJob: AppContextValue['addJob'] = useCallback((job) => {
    const newJob: Job = {
      ...job,
      id: uid(),
      trackingCode: generateTrackingCode(),
      status: 'new',
      createdAt: new Date().toISOString(),
      bids: [],
    };
    setData((prev) => {
      const next = { ...prev, jobs: [newJob, ...prev.jobs] };
      saveData(next);
      return next;
    });
    return newJob;
  }, []);

  const updateJob: AppContextValue['updateJob'] = useCallback((id, patch) => {
    setData((prev) => {
      const next = {
        ...prev,
        jobs: prev.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
      };
      saveData(next);
      return next;
    });
  }, []);

  const getJob = useCallback((id: string) => data.jobs.find((j) => j.id === id), [data.jobs]);
  const getJobByTracking = useCallback(
    (code: string) => data.jobs.find((j) => j.trackingCode.toUpperCase() === code.toUpperCase()),
    [data.jobs],
  );

  const addBid: AppContextValue['addBid'] = useCallback((jobId, bid) => {
    setData((prev) => {
      const next = {
        ...prev,
        jobs: prev.jobs.map((j) =>
          j.id === jobId
            ? { ...j, bids: [...j.bids, { ...bid, id: uid(), createdAt: new Date().toISOString() }] }
            : j,
        ),
      };
      saveData(next);
      return next;
    });
  }, []);

  const assignWorker: AppContextValue['assignWorker'] = useCallback((jobId, workerId, workerName) => {
    setData((prev) => {
      const next = {
        ...prev,
        jobs: prev.jobs.map((j) =>
          j.id === jobId
            ? { ...j, assignedWorkerId: workerId, assignedWorkerName: workerName, status: 'inspecting' as const }
            : j,
        ),
      };
      saveData(next);
      return next;
    });
  }, []);

  const addWorker: AppContextValue['addWorker'] = useCallback((worker) => {
    setData((prev) => {
      const next = {
        ...prev,
        workers: [...prev.workers, { ...worker, id: uid(), rating: 5.0, jobsCompleted: 0 }],
      };
      saveData(next);
      return next;
    });
  }, []);

  const addMaterial: AppContextValue['addMaterial'] = useCallback((m) => {
    setData((prev) => {
      const next = { ...prev, materials: [...prev.materials, { ...m, id: uid() }] };
      saveData(next);
      return next;
    });
  }, []);

  const updateMaterial: AppContextValue['updateMaterial'] = useCallback((id, patch) => {
    setData((prev) => {
      const next = {
        ...prev,
        materials: prev.materials.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      };
      saveData(next);
      return next;
    });
  }, []);

  const deleteMaterial: AppContextValue['deleteMaterial'] = useCallback((id) => {
    setData((prev) => {
      const next = { ...prev, materials: prev.materials.filter((m) => m.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  const toggleBoxOpened: AppContextValue['toggleBoxOpened'] = useCallback((materialId, jobId) => {
    setData((prev) => {
      const next = {
        ...prev,
        materials: prev.materials.map((m) =>
          m.id === materialId
            ? { ...m, boxOpened: !m.boxOpened, boxOpenedForJobId: !m.boxOpened ? jobId : undefined }
            : m,
        ),
      };
      saveData(next);
      return next;
    });
  }, []);

  const setAdminProfitSplit: AppContextValue['setAdminProfitSplit'] = useCallback((v) => {
    setData((prev) => {
      const next = { ...prev, adminProfitSplit: v };
      saveData(next);
      return next;
    });
  }, []);

  const resetAll: AppContextValue['resetAll'] = useCallback(() => {
    const d = resetData();
    setData(d);
  }, []);

  const value: AppContextValue = {
    data, role, setRole, exitPortal,
    addJob, updateJob, getJob, getJobByTracking,
    addBid, assignWorker, addWorker,
    addMaterial, updateMaterial, deleteMaterial, toggleBoxOpened,
    setAdminProfitSplit, resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
