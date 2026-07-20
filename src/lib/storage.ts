import type { AppData, Job, Worker, Material } from '../types';

const STORAGE_KEY = 'deco_marketplace_v1';

const DEFAULT_WORKERS: Worker[] = [
  { id: 'w1', name: 'ياسين بن علي', phone: '0551234567', city: 'الجزائر', rating: 4.8, jobsCompleted: 23 },
  { id: 'w2', name: 'كريم زيدان', phone: '0661234567', city: 'وهران', rating: 4.6, jobsCompleted: 15 },
  { id: 'w3', name: 'سمير بوزيد', phone: '0771234567', city: 'الجزائر', rating: 4.9, jobsCompleted: 41 },
];

const DEFAULT_MATERIALS: Material[] = [
  { id: 'm1', name: 'لوح بلاكو بلاطر 1.2x2.5م', category: 'placo', unit: 'لوح', unitCost: 850, stock: 120, boxOpened: false },
  { id: 'm2', name: 'لوح بلاكو بلاطر مقاوم للرطوبة', category: 'placo', unit: 'لوح', unitCost: 1100, stock: 40, boxOpened: false },
  { id: 'm3', name: 'لوح PVC ديكوري أبيض', category: 'pvc', unit: 'لوح', unitCost: 1450, stock: 60, boxOpened: false },
  { id: 'm4', name: 'سبوت LED مدمج 7 واط', category: 'spotlight', unit: 'قطعة', unitCost: 180, stock: 300, boxOpened: false },
  { id: 'm5', name: 'سبوت LED مدمج 12 واط', category: 'spotlight', unit: 'قطعة', unitCost: 260, stock: 150, boxOpened: false },
  { id: 'm6', name: 'علبة براغي 1000 قطعة', category: 'consumable', unit: 'علبة', unitCost: 1200, stock: 8, boxOpened: false },
  { id: 'm7', name: 'علبة مسامير 500 قطعة', category: 'consumable', unit: 'علبة', unitCost: 800, stock: 12, boxOpened: false },
];

function generateTrackingCode(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  return `DEC-${ts}`;
}

function seedJobs(): Job[] {
  const now = Date.now();
  return [
    {
      id: 'j1',
      trackingCode: 'DEC-SEED1',
      clientName: 'أحمد بومدين',
      clientPhone: '0551987654',
      propertyType: 'home',
      city: 'الجزائر',
      estimatedArea: 25,
      status: 'new',
      createdAt: new Date(now - 86400000).toISOString(),
      bids: [],
    },
    {
      id: 'j2',
      trackingCode: 'DEC-SEED2',
      clientName: 'فاطمة حمداني',
      clientPhone: '0661987654',
      propertyType: 'shop',
      city: 'وهران',
      estimatedArea: 8,
      status: 'new',
      createdAt: new Date(now - 43200000).toISOString(),
      bids: [
        {
          id: 'b1',
          workerId: 'w2',
          workerName: 'كريم زيدان',
          earliestInspection: new Date(now + 86400000).toISOString(),
          proposedStart: new Date(now + 3 * 86400000).toISOString().slice(0, 10),
          createdAt: new Date(now - 3600000).toISOString(),
          note: 'متوفر خلال هذا الأسبوع',
        },
        {
          id: 'b2',
          workerId: 'w3',
          workerName: 'سمير بوزيد',
          earliestInspection: new Date(now + 43200000).toISOString(),
          proposedStart: new Date(now + 2 * 86400000).toISOString().slice(0, 10),
          createdAt: new Date(now - 1800000).toISOString(),
        },
      ],
    },
  ];
}

function defaultData(): AppData {
  return {
    jobs: seedJobs(),
    workers: DEFAULT_WORKERS,
    materials: DEFAULT_MATERIALS,
    adminProfitSplit: 60,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const d = defaultData();
      saveData(d);
      return d;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.jobs) parsed.jobs = [];
    if (!parsed.workers) parsed.workers = DEFAULT_WORKERS;
    if (!parsed.materials) parsed.materials = DEFAULT_MATERIALS;
    if (typeof parsed.adminProfitSplit !== 'number') parsed.adminProfitSplit = 60;
    return parsed;
  } catch {
    const d = defaultData();
    saveData(d);
    return d;
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function resetData(): AppData {
  const d = defaultData();
  saveData(d);
  return d;
}

export { generateTrackingCode };
