export type PropertyType = 'home' | 'workshop' | 'shop';
export type JobComplexity = 'simple' | 'normal' | 'high';
export type JobStatus = 'new' | 'inspecting' | 'executing' | 'completed';
export type ReturnMethod = 'truck' | 'motorcycle';
export type MaterialCategory = 'placo' | 'pvc' | 'spotlight' | 'consumable';

export interface JobBid {
  id: string;
  workerId: string;
  workerName: string;
  earliestInspection: string;
  proposedStart: string;
  createdAt: string;
  note?: string;
}

export interface InspectionData {
  verifiedArea: number;
  spotlightsCount: number;
  complexity: JobComplexity;
  depositReceived: boolean;
  inspectedAt: string;
  inspectedBy: string;
  siteVisitPhotos?: string[];
}

export interface ExecutionData {
  beforePhotos: string[];
  afterPhotos: string[];
  returnMethod: ReturnMethod;
  finalPaymentReceived: boolean;
  completedAt: string;
  finalMeasurementsConfirmed?: boolean;
}

export interface Job {
  id: string;
  trackingCode: string;
  clientName: string;
  clientPhone: string;
  propertyType: PropertyType;
  city: string;
  estimatedArea: number;
  status: JobStatus;
  createdAt: string;
  bids: JobBid[];
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  inspection?: InspectionData;
  execution?: ExecutionData;
  manualOverride?: {
    areaRate?: number;
    spotlightRate?: number;
    workerAreaRate?: number;
    workerSpotlightRate?: number;
    deliveryFee?: number;
  };
  ledgerLocked?: boolean;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  unitCost: number;
  stock: number;
  boxOpened: boolean;
  boxOpenedForJobId?: string;
  consumptionPerSqm?: number;
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  city: string;
  rating: number;
  jobsCompleted: number;
}

export interface AppData {
  jobs: Job[];
  workers: Worker[];
  materials: Material[];
  adminProfitSplit: number;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  home: 'منزل',
  workshop: 'ورشة',
  shop: 'محل تجاري',
};

export const JOB_COMPLEXITY_LABELS: Record<JobComplexity, string> = {
  simple: 'بسيط',
  normal: 'عادي',
  high: 'عالي',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  new: 'طلب جديد',
  inspecting: 'قيد المعاينة والتسعير',
  executing: 'قيد التنفيذ',
  completed: 'مكتمل ومسوّى',
};

export const RETURN_METHOD_LABELS: Record<ReturnMethod, string> = {
  truck: 'شاحنة',
  motorcycle: 'دراجة نارية',
};

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  placo: 'ألواح البلاكو',
  pvc: 'البولي كلوريد (PVC)',
  spotlight: 'الأضواء / السبوتات',
  consumable: 'مواد مستهلكة / براغي',
};
