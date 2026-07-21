import { supabase, JOB_PHOTOS_BUCKET } from './supabase';
import type {
  AppData, Job, Worker, Material, JobBid, InspectionData, ExecutionData,
  PropertyType, JobComplexity, JobStatus, ReturnMethod,
} from '../types';

// Centralized error logger so every Supabase failure is visible in the console.
function logError(context: string, error: unknown): void {
  console.error(`[storage] ${context}:`, error);
}

// ============ Row types (from Supabase) ============
interface ProjectRow {
  id: string;
  tracking_code: string;
  client_name: string;
  client_phone: string;
  property_type: PropertyType;
  city: string;
  estimated_area: number;
  status: JobStatus;
  assigned_worker_id: string | null;
  assigned_worker_name: string | null;
  manual_override: Record<string, number | undefined> | null;
  ledger_locked: boolean;
  created_at: string;
  job_bids?: BidRow[];
  job_photos?: PhotoRow[];
  job_measurements?: MeasurementRow[];
}

interface BidRow {
  id: string;
  worker_id: string | null;
  worker_name: string;
  earliest_inspection: string | null;
  proposed_start: string | null;
  note: string | null;
  created_at: string;
}

interface PhotoRow {
  id: string;
  kind: 'site_visit' | 'before' | 'after';
  storage_path: string;
  url: string;
}

interface MeasurementRow {
  id: string;
  kind: 'initial' | 'final';
  verified_area: number | null;
  spotlights_count: number | null;
  complexity: JobComplexity | null;
  deposit_received: boolean;
  final_payment_received: boolean;
  return_method: ReturnMethod | null;
  final_measurements_confirmed: boolean;
  inspected_by: string | null;
  inspected_at: string | null;
  completed_at: string | null;
}

interface MaterialRow {
  id: string;
  name: string;
  category: Material['category'];
  unit: string;
  unit_cost: number;
  stock: number;
  box_opened: boolean;
  box_opened_for_job_id: string | null;
  consumption_per_sqm: number | null;
}

interface WorkerRow {
  id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  city: string | null;
  rating: number;
  jobs_completed: number;
}

interface SettingsRow {
  admin_profit_split: number;
}

// ============ Mapping ============
function mapBids(rows: BidRow[] | undefined): JobBid[] {
  return (rows ?? []).map((b) => ({
    id: b.id,
    workerId: b.worker_id ?? '',
    workerName: b.worker_name,
    earliestInspection: b.earliest_inspection ?? '',
    proposedStart: b.proposed_start ?? '',
    createdAt: b.created_at,
    note: b.note ?? undefined,
  }));
}

function mapInspection(photos: PhotoRow[], m: MeasurementRow[]): InspectionData | undefined {
  const initial = m.find((x) => x.kind === 'initial');
  if (!initial) return undefined;
  const siteVisit = photos.filter((p) => p.kind === 'site_visit').map((p) => p.url);
  return {
    verifiedArea: Number(initial.verified_area ?? 0),
    spotlightsCount: initial.spotlights_count ?? 0,
    complexity: initial.complexity ?? 'normal',
    depositReceived: initial.deposit_received,
    inspectedAt: initial.inspected_at ?? '',
    inspectedBy: initial.inspected_by ?? '',
    siteVisitPhotos: siteVisit.length > 0 ? siteVisit : undefined,
  };
}

function mapExecution(photos: PhotoRow[], m: MeasurementRow[]): ExecutionData | undefined {
  const final = m.find((x) => x.kind === 'final');
  const before = photos.filter((p) => p.kind === 'before').map((p) => p.url);
  const after = photos.filter((p) => p.kind === 'after').map((p) => p.url);
  if (!final && before.length === 0 && after.length === 0) return undefined;
  return {
    beforePhotos: before,
    afterPhotos: after,
    returnMethod: final?.return_method ?? 'truck',
    finalPaymentReceived: final?.final_payment_received ?? false,
    completedAt: final?.completed_at ?? '',
    finalMeasurementsConfirmed: final?.final_measurements_confirmed ?? false,
  };
}

function mapJob(row: ProjectRow): Job {
  const measurements = row.job_measurements ?? [];
  const photos = row.job_photos ?? [];
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    propertyType: row.property_type,
    city: row.city,
    estimatedArea: Number(row.estimated_area),
    status: row.status,
    createdAt: row.created_at,
    bids: mapBids(row.job_bids),
    assignedWorkerId: row.assigned_worker_id ?? undefined,
    assignedWorkerName: row.assigned_worker_name ?? undefined,
    inspection: mapInspection(photos, measurements),
    execution: mapExecution(photos, measurements),
    manualOverride: row.manual_override ?? undefined,
    ledgerLocked: row.ledger_locked,
  };
}

// ============ Load all ============
export async function loadAppData(): Promise<AppData> {
  const [projectsRes, workersRes, materialsRes, settingsRes] = await Promise.all([
    supabase
      .from('projects')
      .select('*, job_bids(*), job_photos(*), job_measurements(*)')
      .order('created_at', { ascending: false }),
    supabase.from('workers').select('*').order('name'),
    supabase.from('materials').select('*').order('name'),
    supabase.from('app_settings').select('admin_profit_split').limit(1).maybeSingle(),
  ]);

  if (projectsRes.error) { logError('loadAppData.projects', projectsRes.error); throw projectsRes.error; }
  if (workersRes.error) { logError('loadAppData.workers', workersRes.error); throw workersRes.error; }
  if (materialsRes.error) { logError('loadAppData.materials', materialsRes.error); throw materialsRes.error; }
  if (settingsRes.error) { logError('loadAppData.settings', settingsRes.error); throw settingsRes.error; }

  return {
    jobs: (projectsRes.data as ProjectRow[]).map(mapJob),
    workers: (workersRes.data as WorkerRow[]).map((w) => ({
      id: w.id,
      name: w.name,
      phone: w.phone ?? '',
      city: w.city ?? '',
      rating: Number(w.rating),
      jobsCompleted: w.jobs_completed,
    })),
    materials: (materialsRes.data as MaterialRow[]).map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      unit: m.unit,
      unitCost: Number(m.unit_cost),
      stock: m.stock,
      boxOpened: m.box_opened,
      boxOpenedForJobId: m.box_opened_for_job_id ?? undefined,
      consumptionPerSqm: m.consumption_per_sqm ?? undefined,
    })),
    adminProfitSplit: (settingsRes.data as SettingsRow | null)?.admin_profit_split ?? 60,
  };
}

// ============ Jobs ============
export function generateTrackingCode(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  return `DEC-${ts}`;
}

export async function createProject(input: {
  clientName: string; clientPhone: string; propertyType: PropertyType;
  city: string; estimatedArea: number;
}): Promise<Job> {
  const trackingCode = generateTrackingCode();
  const insertPayload = {
    tracking_code: trackingCode,
    client_name: input.clientName,
    client_phone: input.clientPhone,
    property_type: input.propertyType,
    city: input.city,
    estimated_area: input.estimatedArea,
    status: 'new',
  };
  console.log('[storage] createProject inserting:', insertPayload);

  // Insert with a plain .select() (no nested relations) — nested selects
  // right after an INSERT can fail in postgREST's schema cache.
  const { data, error } = await supabase
    .from('projects')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    logError('createProject.insert', error);
    throw error;
  }
  console.log('[storage] createProject success:', data);

  // A freshly-created project has no bids/photos/measurements yet, so
  // mapJob with empty arrays is correct.
  return mapJob(data as ProjectRow);
}

export async function updateProject(id: string, patch: Partial<Job>): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.status) update.status = patch.status;
  if (patch.assignedWorkerId !== undefined) update.assigned_worker_id = patch.assignedWorkerId ?? null;
  if (patch.assignedWorkerName !== undefined) update.assigned_worker_name = patch.assignedWorkerName ?? null;
  if (patch.manualOverride !== undefined) update.manual_override = patch.manualOverride ?? null;
  if (patch.ledgerLocked !== undefined) update.ledger_locked = patch.ledgerLocked;
  if (Object.keys(update).length === 0) return;
  const { error } = await supabase.from('projects').update(update).eq('id', id);
  if (error) { logError('updateProject', error); throw error; }
}

export async function getProjectByTracking(code: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, job_bids(*), job_photos(*), job_measurements(*)')
    .ilike('tracking_code', code)
    .maybeSingle();
  if (error) { logError('getProjectByTracking', error); throw error; }
  return data ? mapJob(data as ProjectRow) : null;
}

// ============ Bids ============
export async function addBid(jobId: string, bid: {
  workerId: string; workerName: string; earliestInspection: string;
  proposedStart: string; note?: string;
}): Promise<void> {
  const { error } = await supabase.from('job_bids').insert({
    project_id: jobId,
    worker_id: bid.workerId,
    worker_name: bid.workerName,
    earliest_inspection: bid.earliestInspection || null,
    proposed_start: bid.proposedStart || null,
    note: bid.note ?? null,
  });
  if (error) { logError('addBid', error); throw error; }
}

// ============ Workers ============
export async function createWorker(input: {
  name: string; phone: string; city: string;
}): Promise<void> {
  const { error } = await supabase.from('workers').insert({
    name: input.name, phone: input.phone, city: input.city,
    rating: 5.0, jobs_completed: 0,
  });
  if (error) { logError('createWorker', error); throw error; }
}

// ============ Materials ============
export async function createMaterial(input: Omit<Material, 'id'>): Promise<void> {
  const { error } = await supabase.from('materials').insert({
    name: input.name, category: input.category, unit: input.unit,
    unit_cost: input.unitCost, stock: input.stock,
    box_opened: input.boxOpened, box_opened_for_job_id: input.boxOpenedForJobId ?? null,
    consumption_per_sqm: input.consumptionPerSqm ?? null,
  });
  if (error) { logError('createMaterial', error); throw error; }
}

export async function updateMaterial(id: string, patch: Partial<Material>): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.unit !== undefined) update.unit = patch.unit;
  if (patch.unitCost !== undefined) update.unit_cost = patch.unitCost;
  if (patch.stock !== undefined) update.stock = patch.stock;
  if (patch.boxOpened !== undefined) {
    update.box_opened = patch.boxOpened;
    update.box_opened_for_job_id = patch.boxOpened ? (patch.boxOpenedForJobId ?? null) : null;
  }
  if (patch.consumptionPerSqm !== undefined) update.consumption_per_sqm = patch.consumptionPerSqm;
  if (Object.keys(update).length === 0) return;
  const { error } = await supabase.from('materials').update(update).eq('id', id);
  if (error) { logError('updateMaterial', error); throw error; }
}

export async function deleteMaterial(id: string): Promise<void> {
  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) { logError('deleteMaterial', error); throw error; }
}

// ============ Settings ============
export async function setAdminProfitSplit(value: number): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .update({ admin_profit_split: value })
    .eq('id', '00000000-0000-0000-0000-000000000001');
  if (error) { logError('setAdminProfitSplit', error); throw error; }
}

// ============ Photos (Supabase Storage) ============
export async function uploadPhoto(
  projectId: string, kind: 'site_visit' | 'before' | 'after', file: File,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${projectId}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(JOB_PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) { logError('uploadPhoto.storage', upErr); throw upErr; }
  const { data: pub } = supabase.storage.from(JOB_PHOTOS_BUCKET).getPublicUrl(path);
  const { error: dbErr } = await supabase.from('job_photos').insert({
    project_id: projectId, kind, storage_path: path, url: pub.publicUrl,
  });
  if (dbErr) { logError('uploadPhoto.db', dbErr); throw dbErr; }
  return pub.publicUrl;
}

export async function deletePhoto(storagePath: string): Promise<void> {
  await Promise.all([
    supabase.storage.from(JOB_PHOTOS_BUCKET).remove([storagePath]),
    supabase.from('job_photos').delete().eq('storage_path', storagePath),
  ]);
}

export async function replaceProjectPhotos(
  projectId: string, kind: 'site_visit' | 'before' | 'after', newFiles: File[],
  keepUrls: string[],
): Promise<string[]> {
  const { data: existing } = await supabase
    .from('job_photos')
    .select('id, storage_path, url')
    .eq('project_id', projectId)
    .eq('kind', kind);
  const toRemove = (existing ?? []).filter((p) => !keepUrls.includes(p.url));
  await Promise.all(toRemove.map((p) => deletePhoto(p.storage_path)));
  const uploaded: string[] = [];
  for (const file of newFiles) {
    uploaded.push(await uploadPhoto(projectId, kind, file));
  }
  return [...keepUrls, ...uploaded];
}

// ============ Measurements ============
export async function saveInspection(
  projectId: string, data: InspectionData,
): Promise<void> {
  const { data: existing } = await supabase
    .from('job_measurements')
    .select('id')
    .eq('project_id', projectId)
    .eq('kind', 'initial')
    .maybeSingle();
  const payload = {
    project_id: projectId,
    kind: 'initial' as const,
    verified_area: data.verifiedArea,
    spotlights_count: data.spotlightsCount,
    complexity: data.complexity,
    deposit_received: data.depositReceived,
    inspected_by: data.inspectedBy,
    inspected_at: data.inspectedAt,
  };
  if (existing) {
    const { error } = await supabase.from('job_measurements').update(payload).eq('id', existing.id);
    if (error) { logError('saveInspection.update', error); throw error; }
  } else {
    const { error } = await supabase.from('job_measurements').insert(payload);
    if (error) { logError('saveInspection.insert', error); throw error; }
  }
}

export async function saveExecution(
  projectId: string, data: ExecutionData,
): Promise<void> {
  const { data: existing } = await supabase
    .from('job_measurements')
    .select('id')
    .eq('project_id', projectId)
    .eq('kind', 'final')
    .maybeSingle();
  const payload = {
    project_id: projectId,
    kind: 'final' as const,
    final_payment_received: data.finalPaymentReceived,
    return_method: data.returnMethod,
    final_measurements_confirmed: data.finalMeasurementsConfirmed ?? false,
    completed_at: data.completedAt,
  };
  if (existing) {
    const { error } = await supabase.from('job_measurements').update(payload).eq('id', existing.id);
    if (error) { logError('saveExecution.update', error); throw error; }
  } else {
    const { error } = await supabase.from('job_measurements').insert(payload);
    if (error) { logError('saveExecution.insert', error); throw error; }
  }
}
