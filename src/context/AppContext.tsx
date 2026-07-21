import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AppData, Job, Worker, Material, InspectionData, ExecutionData, PropertyType } from '../types';
import * as db from '../lib/storage';
import { supabase } from '../lib/supabase';

interface AppContextValue {
  data: AppData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addJob: (job: { clientName: string; clientPhone: string; propertyType: PropertyType; city: string; estimatedArea: number }) => Promise<Job>;
  updateJob: (id: string, patch: Partial<Job>) => Promise<void>;
  getJobByTracking: (code: string) => Promise<Job | null>;
  addBid: (jobId: string, bid: { workerId: string; workerName: string; earliestInspection: string; proposedStart: string; note?: string }) => Promise<void>;
  assignWorker: (jobId: string, workerId: string, workerName: string) => Promise<void>;
  saveInspection: (jobId: string, data: InspectionData) => Promise<void>;
  saveExecution: (jobId: string, data: ExecutionData) => Promise<void>;
  addWorker: (worker: Omit<Worker, 'id' | 'rating' | 'jobsCompleted'>) => Promise<void>;
  addMaterial: (m: Omit<Material, 'id'>) => Promise<void>;
  updateMaterial: (id: string, patch: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  toggleBoxOpened: (materialId: string, jobId?: string) => Promise<void>;
  setAdminProfitSplit: (v: number) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const EMPTY_DATA: AppData = { jobs: [], workers: [], materials: [], adminProfitSplit: 60 };

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await db.loadAppData();
      setData(next);
      setError(null);
    } catch (e) {
      console.error('[AppContext] loadAppData failed:', e);
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: refetch on any change to operational tables.
  useEffect(() => {
    const channel = supabase
      .channel('app-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_bids' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_photos' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_measurements' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => refresh())
      .subscribe((status, err) => {
        if (err) console.error('[AppContext] realtime error:', err);
        if (status === 'CHANNEL_ERROR') console.error('[AppContext] realtime channel error');
      });
    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  const addJob = useCallback<AppContextValue['addJob']>(async (job) => {
    return db.createProject(job);
  }, []);

  const updateJob = useCallback<AppContextValue['updateJob']>(async (id, patch) => {
    await db.updateProject(id, patch);
  }, []);

  const getJobByTracking = useCallback<AppContextValue['getJobByTracking']>(async (code) => {
    return db.getProjectByTracking(code);
  }, []);

  const addBid = useCallback<AppContextValue['addBid']>(async (jobId, bid) => {
    await db.addBid(jobId, bid);
  }, []);

  const assignWorker = useCallback<AppContextValue['assignWorker']>(async (jobId, workerId, workerName) => {
    await db.updateProject(jobId, {
      assignedWorkerId: workerId,
      assignedWorkerName: workerName,
      status: 'inspecting',
    });
  }, []);

  const saveInspection = useCallback<AppContextValue['saveInspection']>(async (jobId, d) => {
    await db.saveInspection(jobId, d);
  }, []);

  const saveExecution = useCallback<AppContextValue['saveExecution']>(async (jobId, d) => {
    await db.saveExecution(jobId, d);
  }, []);

  const addWorker = useCallback<AppContextValue['addWorker']>(async (worker) => {
    await db.createWorker(worker);
  }, []);

  const addMaterial = useCallback<AppContextValue['addMaterial']>(async (m) => {
    await db.createMaterial(m);
  }, []);

  const updateMaterial = useCallback<AppContextValue['updateMaterial']>(async (id, patch) => {
    await db.updateMaterial(id, patch);
  }, []);

  const deleteMaterial = useCallback<AppContextValue['deleteMaterial']>(async (id) => {
    await db.deleteMaterial(id);
  }, []);

  const toggleBoxOpened = useCallback<AppContextValue['toggleBoxOpened']>(async (materialId) => {
    const mat = data.materials.find((m) => m.id === materialId);
    if (!mat) return;
    await db.updateMaterial(materialId, {
      boxOpened: !mat.boxOpened,
      boxOpenedForJobId: !mat.boxOpened ? materialId : undefined,
    });
  }, [data.materials]);

  const setAdminProfitSplit = useCallback<AppContextValue['setAdminProfitSplit']>(async (v) => {
    await db.setAdminProfitSplit(v);
  }, []);

  const value: AppContextValue = {
    data, loading, error, refresh,
    addJob, updateJob, getJobByTracking, addBid, assignWorker,
    saveInspection, saveExecution, addWorker,
    addMaterial, updateMaterial, deleteMaterial, toggleBoxOpened,
    setAdminProfitSplit,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
