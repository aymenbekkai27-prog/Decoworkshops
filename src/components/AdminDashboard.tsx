import { useState } from 'react';
import {
  LayoutGrid, Package, Calculator, Phone, CheckCircle2, Award, Clock,
  Calendar, MapPin, Home, Factory, Store, Edit3, TrendingUp,
  Wallet, Receipt, Lock, AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './ui/Toast';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { StatusPill } from './ui/StatusPill';
import {
  calculateJobPricing, calculateSettlement, generateBOM, formatDZD,
  SPOTLIGHT_CLIENT_RATE, SPOTLIGHT_WORKER_RATE, SPOTLIGHT_ADMIN_DIRECT_PROFIT, WORKER_AREA_RATE,
} from '../lib/pricing';
import type { Job, JobStatus } from '../types';
import { PROPERTY_TYPE_LABELS, JOB_STATUS_LABELS } from '../types';
import { MaterialsInventory } from './MaterialsInventory';

type Tab = 'kanban' | 'materials';
const PROPERTY_ICONS = { home: Home, workshop: Factory, shop: Store } as const;

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('kanban');

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-2">
          <button onClick={() => setTab('kanban')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'kanban' ? 'bg-navy-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <LayoutGrid size={18} /> لوحة الورشات
          </button>
          <button onClick={() => setTab('materials')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'materials' ? 'bg-navy-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Package size={18} /> المخزون والحسابات
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'kanban' ? <KanbanBoard /> : <MaterialsInventory />}
      </div>
    </div>
  );
}

function KanbanBoard() {
  const { data, assignWorker, updateJob } = useApp();
  const showToast = useToast();
  const [bidJob, setBidJob] = useState<Job | null>(null);
  const [pricingJob, setPricingJob] = useState<Job | null>(null);
  const [ledgerJob, setLedgerJob] = useState<Job | null>(null);

  const columns: { status: JobStatus; label: string; color: string }[] = [
    { status: 'new', label: JOB_STATUS_LABELS.new, color: 'border-blue-400' },
    { status: 'inspecting', label: JOB_STATUS_LABELS.inspecting, color: 'border-gold-400' },
    { status: 'executing', label: JOB_STATUS_LABELS.executing, color: 'border-purple-400' },
    { status: 'completed', label: JOB_STATUS_LABELS.completed, color: 'border-green-400' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {columns.map((col) => {
          const count = data.jobs.filter((j) => j.status === col.status).length;
          return (
            <div key={col.status} className={`card p-4 border-t-4 ${col.color}`}>
              <p className="text-2xl font-extrabold text-navy-800">{count}</p>
              <p className="text-sm text-slate-500">{col.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const jobs = data.jobs.filter((j) => j.status === col.status);
          return (
            <div key={col.status} className="bg-slate-100 rounded-2xl p-3 min-h-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-navy-800 text-sm">{col.label}</h3>
                <span className="bg-white text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">{jobs.length}</span>
              </div>
              <div className="space-y-3">
                {jobs.map((job) => {
                  const Icon = PROPERTY_ICONS[job.propertyType];
                  const hasBids = job.bids.length > 0;
                  return (
                    <div key={job.id} className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-navy-50 rounded-lg flex items-center justify-center"><Icon size={16} className="text-navy-600" /></div>
                          <div>
                            <p className="font-bold text-navy-800 text-sm">{job.clientName}</p>
                            <p className="text-[10px] text-slate-400">{job.trackingCode}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1 mb-3">
                        <p className="flex items-center gap-1"><MapPin size={11} /> {job.city} · {PROPERTY_TYPE_LABELS[job.propertyType]}</p>
                        <p className="flex items-center gap-1"><Calendar size={11} /> {new Date(job.createdAt).toLocaleDateString('ar-DZ')}</p>
                        {job.inspection && (
                          <p className="flex items-center gap-1 text-navy-600 font-semibold"><CheckCircle2 size={11} /> مساحة مؤكدة: {job.inspection.verifiedArea} م² · {job.inspection.spotlightsCount} سبوت</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {hasBids && job.status === 'new' && (
                          <button className="btn-gold !py-1.5 !px-3 text-xs flex-1" onClick={() => setBidJob(job)}><Award size={13} /> مقارنة العروض ({job.bids.length})</button>
                        )}
                        {job.status === 'inspecting' && job.inspection && (
                          <button className="btn-primary !py-1.5 !px-3 text-xs flex-1" onClick={() => setPricingJob(job)}><Calculator size={13} /> محرك التسعير</button>
                        )}
                        {job.status === 'executing' && (
                          <button className="btn-primary !py-1.5 !px-3 text-xs flex-1" onClick={() => setPricingJob(job)}><Calculator size={13} /> التسعير والحسابات</button>
                        )}
                        {job.status === 'completed' && !job.ledgerLocked && (
                          <button className="btn-gold !py-1.5 !px-3 text-xs flex-1" onClick={() => setLedgerJob(job)}><Receipt size={13} /> تصفية الحسابات</button>
                        )}
                        {job.ledgerLocked && (
                          <span className="text-xs text-green-600 font-bold flex items-center gap-1 w-full justify-center py-1.5"><Lock size={13} /> تمت التصفية</span>
                        )}
                        {job.status === 'new' && !hasBids && (
                          <span className="text-xs text-slate-400 w-full text-center py-1.5">بانتظار عروض العمال</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {jobs.length === 0 && <p className="text-center text-slate-400 text-xs py-8">لا توجد طلبات</p>}
              </div>
            </div>
          );
        })}
      </div>

      {bidJob && (
        <BidComparisonModal job={bidJob} onClose={() => setBidJob(null)}
          onAssign={(workerId, workerName) => {
            assignWorker(bidJob.id, workerId, workerName);
            showToast('تم تعيين العامل بنجاح', 'success');
            setBidJob(null);
          }} />
      )}
      {pricingJob && (
        <PricingEngineModal job={pricingJob} onClose={() => setPricingJob(null)}
          onSave={(patch) => {
            updateJob(pricingJob.id, patch);
            showToast('تم حفظ التعديلات', 'success');
            setPricingJob(null);
          }} />
      )}
      {ledgerJob && (
        <LedgerModal job={ledgerJob} onClose={() => setLedgerJob(null)}
          onLock={() => {
            updateJob(ledgerJob.id, { ledgerLocked: true });
            showToast('تمت تصفية وإغلاق الحسابات نهائياً', 'success');
            setLedgerJob(null);
          }} />
      )}
    </>
  );
}

function BidComparisonModal({ job, onClose, onAssign }: {
  job: Job; onClose: () => void; onAssign: (workerId: string, workerName: string) => void;
}) {
  const sortedBids = [...job.bids].sort((a, b) => new Date(a.earliestInspection).getTime() - new Date(b.earliestInspection).getTime());

  return (
    <Modal open onClose={onClose} title="مقارنة عروض العمال" size="lg">
      <div className="mb-4 p-3 bg-slate-50 rounded-xl text-sm">
        <p className="font-semibold text-navy-700">{job.clientName}</p>
        <p className="text-slate-500">{job.city} · {PROPERTY_TYPE_LABELS[job.propertyType]} · {job.estimatedArea} م²</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="text-right py-2 px-2 font-semibold">العامل</th>
              <th className="text-right py-2 px-2 font-semibold">أقرب معاينة</th>
              <th className="text-right py-2 px-2 font-semibold">بدء التنفيذ</th>
              <th className="text-right py-2 px-2 font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {sortedBids.map((bid, i) => (
              <tr key={bid.id} className={`border-b border-slate-100 ${i === 0 ? 'bg-gold-50' : ''}`}>
                <td className="py-3 px-2">
                  <p className="font-bold text-navy-800">{bid.workerName}</p>
                  {bid.note && <p className="text-xs text-slate-400 mt-0.5">{bid.note}</p>}
                </td>
                <td className="py-3 px-2 text-slate-600">{new Date(bid.earliestInspection).toLocaleString('ar-DZ', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="py-3 px-2 text-slate-600">{new Date(bid.proposedStart).toLocaleDateString('ar-DZ')}</td>
                <td className="py-3 px-2">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 bg-gold-400 text-navy-900 text-[10px] font-bold px-2 py-1 rounded-full mb-1"><Clock size={10} /> الوقت الأقرب والمقترح تلقائياً</span>
                  )}
                  <div className="flex gap-1.5 mt-1">
                    <a href={`tel:${bid.workerName}`} className="btn-secondary !py-1 !px-2 text-xs"><Phone size={12} /> اتصال</a>
                    <button className="btn-primary !py-1 !px-2 text-xs" onClick={() => onAssign(bid.workerId, bid.workerName)}><CheckCircle2 size={12} /> تعيين</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedBids.length === 0 && <p className="text-center text-slate-400 py-8">لا توجد عروض بعد</p>}
    </Modal>
  );
}

function PricingEngineModal({ job, onClose, onSave }: {
  job: Job; onClose: () => void; onSave: (patch: Partial<Job>) => void;
}) {
  const pricing = calculateJobPricing(job);
  const [editing, setEditing] = useState(false);
  const [override, setOverride] = useState(job.manualOverride ?? {});

  const displayAreaRate = override.areaRate ?? pricing.areaRate;
  const displaySpotlightRate = override.spotlightRate ?? SPOTLIGHT_CLIENT_RATE;
  const displayWorkerAreaRate = override.workerAreaRate ?? WORKER_AREA_RATE;
  const displayWorkerSpotlightRate = override.workerSpotlightRate ?? SPOTLIGHT_WORKER_RATE;

  const area = job.inspection?.verifiedArea ?? job.estimatedArea;
  const spotlights = job.inspection?.spotlightsCount ?? 0;

  const totalClientBill = area * displayAreaRate + spotlights * displaySpotlightRate;
  const workerPayout = area * displayWorkerAreaRate + spotlights * displayWorkerSpotlightRate;
  const adminDirectProfit = spotlights * SPOTLIGHT_ADMIN_DIRECT_PROFIT;

  return (
    <Modal open onClose={onClose} title="محرك الحسابات الآلي" size="lg">
      {!job.inspection ? (
        <div className="p-6 text-center text-slate-500">
          <AlertTriangle size={36} className="mx-auto mb-3 text-gold-500" />
          <p>لم يتم إدخال القياسات الميدانية بعد. الحسابات مبنية على المساحة التقديرية للعميل.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-navy-50 rounded-xl p-3"><p className="text-xs text-slate-500">المساحة المؤكدة</p><p className="text-lg font-bold text-navy-800">{area} م²</p></div>
            <div className="bg-navy-50 rounded-xl p-3"><p className="text-xs text-slate-500">عدد السبوتات</p><p className="text-lg font-bold text-navy-800">{spotlights}</p></div>
            <div className="bg-navy-50 rounded-xl p-3"><p className="text-xs text-slate-500">سعر المتر</p><p className="text-lg font-bold text-navy-800">{formatDZD(displayAreaRate)}</p></div>
            <div className="bg-navy-50 rounded-xl p-3"><p className="text-xs text-slate-500">العامل</p><p className="text-sm font-bold text-navy-800 truncate">{job.assignedWorkerName ?? 'غير معين'}</p></div>
          </div>

          <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-xl">
            <span className="text-sm font-semibold text-navy-700 flex items-center gap-2"><Edit3 size={16} /> تعديل يدوي للأسعار</span>
            <button onClick={() => setEditing(!editing)} className={`relative w-12 h-6 rounded-full transition-colors ${editing ? 'bg-navy-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${editing ? 'right-0.5' : 'right-6'}`} />
            </button>
          </div>

          {editing && (
            <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-gold-50 border border-gold-200 rounded-xl animate-fade-in">
              <div>
                <label className="label-field text-xs">سعر المتر للعميل</label>
                <input type="number" className="input-field !py-2" value={override.areaRate ?? ''} onChange={(e) => setOverride({ ...override, areaRate: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="label-field text-xs">سعر السبوت للعميل</label>
                <input type="number" className="input-field !py-2" value={override.spotlightRate ?? ''} onChange={(e) => setOverride({ ...override, spotlightRate: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="label-field text-xs">أجرة العامل/متر</label>
                <input type="number" className="input-field !py-2" value={override.workerAreaRate ?? ''} onChange={(e) => setOverride({ ...override, workerAreaRate: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="label-field text-xs">أجرة العامل/سبوت</label>
                <input type="number" className="input-field !py-2" value={override.workerSpotlightRate ?? ''} onChange={(e) => setOverride({ ...override, workerSpotlightRate: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div className="col-span-2">
                <label className="label-field text-xs">رسوم التوصيل/اللوجستيك</label>
                <input type="number" className="input-field !py-2" value={override.deliveryFee ?? ''} onChange={(e) => setOverride({ ...override, deliveryFee: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="p-4 bg-navy-600 text-white rounded-xl">
              <div className="flex items-center justify-between mb-1"><span className="text-navy-100 text-sm">إجمالي فاتورة العميل</span><TrendingUp size={18} /></div>
              <p className="text-2xl font-extrabold">{formatDZD(totalClientBill)}</p>
              <p className="text-xs text-navy-200 mt-1">({area} م² × {formatDZD(displayAreaRate)}) + ({spotlights} × {formatDZD(displaySpotlightRate)})</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-1"><span className="text-green-700 text-sm font-semibold">إجمالي أجرة العامل</span><Wallet size={18} className="text-green-600" /></div>
                <p className="text-xl font-bold text-green-800">{formatDZD(workerPayout)}</p>
                <p className="text-xs text-green-600 mt-1">({area} × {formatDZD(displayWorkerAreaRate)}) + ({spotlights} × {formatDZD(displayWorkerSpotlightRate)})</p>
              </div>
              <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl">
                <div className="flex items-center justify-between mb-1"><span className="text-gold-700 text-sm font-semibold">ربح الإدارة المباشر (سبوتات)</span><Receipt size={18} className="text-gold-600" /></div>
                <p className="text-xl font-bold text-gold-800">{formatDZD(adminDirectProfit)}</p>
                <p className="text-xs text-gold-600 mt-1">{spotlights} × {formatDZD(SPOTLIGHT_ADMIN_DIRECT_PROFIT)}</p>
              </div>
            </div>
          </div>

          <button className="btn-primary w-full mt-5" onClick={() => onSave({ manualOverride: override })}>حفظ التعديلات</button>
        </>
      )}
    </Modal>
  );
}

function LedgerModal({ job, onClose, onLock }: {
  job: Job; onClose: () => void; onLock: () => void;
}) {
  const { data, setAdminProfitSplit } = useApp();
  const [deliveryFee, setDeliveryFee] = useState(job.manualOverride?.deliveryFee ?? 0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const bom = generateBOM(job.inspection?.verifiedArea ?? job.estimatedArea, data.materials);
  const settlement = calculateSettlement(job, bom, data.adminProfitSplit, deliveryFee);

  return (
    <Modal open onClose={onClose} title="تصفية الحسابات النهائية" size="lg">
      <div className="mb-5">
        <h4 className="font-bold text-navy-800 mb-2 flex items-center gap-2"><Package size={18} /> قائمة المواد (BOM)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs">
                <th className="text-right py-2 px-2">المادة</th>
                <th className="text-center py-2 px-2">الكمية</th>
                <th className="text-center py-2 px-2">سعر الوحدة</th>
                <th className="text-center py-2 px-2">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {bom.map((m, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 px-2 font-semibold text-navy-700">{m.materialName}</td>
                  <td className="py-2 px-2 text-center text-slate-600">{m.quantity}</td>
                  <td className="py-2 px-2 text-center text-slate-600">{m.unitCost === 0 ? <span className="text-green-600 font-bold">مجاني</span> : formatDZD(m.unitCost)}</td>
                  <td className="py-2 px-2 text-center font-bold text-navy-800">{formatDZD(m.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bom.some((m) => m.unitCost === 0) && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle2 size={12} /> المواد المجانية: علبة براغي مفتوحة مسبقاً - التكلفة 0 دج لهذا المشروع</p>
        )}
      </div>

      <div className="mb-5">
        <label className="label-field">رسوم التوصيل / اللوجستيك (دج)</label>
        <input type="number" className="input-field" value={deliveryFee} onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)} min="0" />
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex justify-between py-2 px-3 bg-slate-50 rounded-lg text-sm"><span className="text-slate-600">إجمالي الإيرادات (فاتورة العميل)</span><span className="font-bold text-navy-800">{formatDZD(settlement.totalRevenue)}</span></div>
        <div className="flex justify-between py-2 px-3 bg-red-50 rounded-lg text-sm"><span className="text-slate-600">- تكلفة المواد</span><span className="font-bold text-red-700">{formatDZD(settlement.materialCosts)}</span></div>
        <div className="flex justify-between py-2 px-3 bg-red-50 rounded-lg text-sm"><span className="text-slate-600">- أجرة العامل</span><span className="font-bold text-red-700">{formatDZD(settlement.workerPayout)}</span></div>
        <div className="flex justify-between py-2 px-3 bg-red-50 rounded-lg text-sm"><span className="text-slate-600">- رسوم اللوجستيك</span><span className="font-bold text-red-700">{formatDZD(settlement.deliveryFee)}</span></div>
        <div className="flex justify-between py-3 px-4 bg-navy-600 text-white rounded-xl"><span className="font-bold">صافي الربح</span><span className="text-xl font-extrabold">{formatDZD(settlement.netProfit)}</span></div>
      </div>

      <div className="mb-5 p-4 bg-gold-50 border border-gold-200 rounded-xl">
        <label className="label-field flex items-center justify-between">
          <span>تقسيم الربح: الإدارة / الشريك المنصة</span>
          <span className="text-navy-700 font-bold">{data.adminProfitSplit}% / {100 - data.adminProfitSplit}%</span>
        </label>
        <input type="range" min="0" max="100" value={data.adminProfitSplit} onChange={(e) => setAdminProfitSplit(Number(e.target.value))} className="w-full accent-navy-600" />
        <div className="flex justify-between text-sm mt-2">
          <span className="text-navy-700 font-semibold">الإدارة: {formatDZD(settlement.adminShare)}</span>
          <span className="text-slate-600 font-semibold">الشريك: {formatDZD(settlement.partnerShare)}</span>
        </div>
      </div>

      <button className="btn-danger w-full" onClick={() => setConfirmOpen(true)}><Lock size={18} /> تصفية وإغلاق الحسابات نهائياً</button>

      <ConfirmDialog open={confirmOpen} title="تأكيد التصفية النهائية" danger
        message="سيتم قفل السجل المالي نهائياً وصرف إيصالات العامل. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="تأكيد القفل النهائي"
        onConfirm={() => { onLock(); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)} />
    </Modal>
  );
}
