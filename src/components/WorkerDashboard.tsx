import { useState } from 'react';
import {
  ClipboardList, MapPin, Home, Factory, Store, Ruler, Calendar, Clock,
  CheckCircle2, Camera, Truck, Bike, Upload, Star, Lightbulb, Gauge,
  Lock, ArrowLeft, Search, User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './ui/Toast';
import { Modal } from './ui/Modal';
import { StatusPill } from './ui/StatusPill';
import type { Job, PropertyType, JobComplexity, ReturnMethod } from '../types';
import { PROPERTY_TYPE_LABELS, JOB_COMPLEXITY_LABELS } from '../types';

const PROPERTY_ICONS: Record<PropertyType, typeof Home> = { home: Home, workshop: Factory, shop: Store };
const CITIES = ['الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'بجاية', 'تلمسان', 'البليدة'];

export function WorkerDashboard() {
  const { data, addBid, updateJob } = useApp();
  const showToast = useToast();
  const [activeWorkerId, setActiveWorkerId] = useState(data.workers[0]?.id ?? '');
  const [cityFilter, setCityFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [bidModalJob, setBidModalJob] = useState<Job | null>(null);
  const [inspectionJob, setInspectionJob] = useState<Job | null>(null);
  const [executionJob, setExecutionJob] = useState<Job | null>(null);

  const worker = data.workers.find((w) => w.id === activeWorkerId);

  const availableJobs = data.jobs.filter(
    (j) => j.status === 'new' && !j.bids.some((b) => b.workerId === activeWorkerId) &&
      (!cityFilter || j.city === cityFilter) && (!propertyFilter || j.propertyType === propertyFilter),
  );

  const myJobs = data.jobs.filter(
    (j) => j.assignedWorkerId === activeWorkerId && (j.status === 'inspecting' || j.status === 'executing'),
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <User size={18} className="text-navy-600 shrink-0" />
          <span className="text-sm font-semibold text-navy-700 shrink-0">العامل:</span>
          <select className="input-field !py-1.5 !w-auto min-w-[140px]" value={activeWorkerId} onChange={(e) => setActiveWorkerId(e.target.value)}>
            {data.workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {worker && (
            <div className="flex items-center gap-1 text-sm text-slate-500 shrink-0">
              <Star size={14} className="text-gold-500 fill-gold-500" /> {worker.rating} · {worker.jobsCompleted} عمل
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {myJobs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy-800 mb-4 flex items-center gap-2"><ClipboardList size={20} /> مهامي الحالية</h2>
            <div className="space-y-3">
              {myJobs.map((job) => (
                <div key={job.id} className="card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-navy-800">{job.clientName}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1"><MapPin size={14} /> {job.city} · {PROPERTY_TYPE_LABELS[job.propertyType]}</p>
                    </div>
                    <StatusPill status={job.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.status === 'inspecting' && (
                      <button className="btn-primary !py-2 text-sm" onClick={() => setInspectionJob(job)}><Ruler size={16} /> أدخل القياسات الميدانية</button>
                    )}
                    {job.status === 'executing' && (
                      <button className="btn-gold !py-2 text-sm" onClick={() => setExecutionJob(job)}><Camera size={16} /> تصفية نهاية العمل</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-bold text-navy-800 mb-4 flex items-center gap-2"><ClipboardList size={20} /> الورشات المتاحة</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="input-field !py-2 pr-9" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                <option value="">كل المدن</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <select className="input-field !py-2 !w-auto min-w-[140px]" value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}>
              <option value="">كل الأنواع</option>
              <option value="home">{PROPERTY_TYPE_LABELS.home}</option>
              <option value="workshop">{PROPERTY_TYPE_LABELS.workshop}</option>
              <option value="shop">{PROPERTY_TYPE_LABELS.shop}</option>
            </select>
          </div>

          {availableJobs.length === 0 ? (
            <div className="card p-10 text-center text-slate-400">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
              <p>لا توجد ورشات متاحة بهذه المعايير حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableJobs.map((job) => {
                const Icon = PROPERTY_ICONS[job.propertyType];
                return (
                  <div key={job.id} className="card p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center"><Icon size={20} className="text-navy-600" /></div>
                        <div>
                          <h3 className="font-bold text-navy-800">{job.clientName}</h3>
                          <p className="text-xs text-slate-400">{job.trackingCode}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{job.bids.length} عرض</span>
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-600 mb-4">
                      <p className="flex items-center gap-2"><MapPin size={14} /> {job.city}</p>
                      <p className="flex items-center gap-2"><Ruler size={14} /> المساحة التقديرية: {job.estimatedArea} م²</p>
                      <p className="flex items-center gap-2"><Home size={14} /> {PROPERTY_TYPE_LABELS[job.propertyType]}</p>
                    </div>
                    <button className="btn-primary w-full !py-2.5" onClick={() => setBidModalJob(job)}>التقدم للمعاينة <ArrowLeft size={16} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {bidModalJob && (
        <BidModal job={bidModalJob} workerName={worker?.name ?? ''} onClose={() => setBidModalJob(null)}
          onSubmit={(earliestInspection, proposedStart, note) => {
            addBid(bidModalJob.id, { workerId: activeWorkerId, workerName: worker?.name ?? '', earliestInspection, proposedStart, note });
            showToast('تم تسجيل تقدمك للمعاينة بنجاح', 'success');
            setBidModalJob(null);
          }} />
      )}

      {inspectionJob && (
        <InspectionModal job={inspectionJob} workerName={worker?.name ?? ''} onClose={() => setInspectionJob(null)}
          onSubmit={(d) => {
            updateJob(inspectionJob.id, { inspection: { ...d, inspectedBy: worker?.name ?? '' }, status: 'executing' });
            showToast('تم تسجيل القياسات الميدانية بنجاح', 'success');
            setInspectionJob(null);
          }} />
      )}

      {executionJob && (
        <ExecutionModal job={executionJob} onClose={() => setExecutionJob(null)}
          onSubmit={(d) => {
            updateJob(executionJob.id, { execution: d, status: 'completed' });
            showToast('تم تصفية العمل بنجاح', 'success');
            setExecutionJob(null);
          }} />
      )}
    </div>
  );
}

function BidModal({ job, workerName, onClose, onSubmit }: {
  job: Job; workerName: string; onClose: () => void;
  onSubmit: (earliestInspection: string, proposedStart: string, note: string) => void;
}) {
  const [earliestInspection, setEarliestInspection] = useState('');
  const [proposedStart, setProposedStart] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!earliestInspection || !proposedStart) { setError('الرجاء إدخال تاريخ المعاينة وتاريخ بدء العمل'); return; }
    onSubmit(earliestInspection, proposedStart, note);
  }

  return (
    <Modal open onClose={onClose} title="التقدم للمعاينة" size="sm">
      <div className="mb-4 p-3 bg-slate-50 rounded-xl text-sm">
        <p className="font-semibold text-navy-700">{job.clientName}</p>
        <p className="text-slate-500">{job.city} · {PROPERTY_TYPE_LABELS[job.propertyType]} · {job.estimatedArea} م²</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field flex items-center gap-1.5"><Clock size={15} /> أقرب توقيت للمعاينة *</label>
          <input type="datetime-local" className="input-field" value={earliestInspection} onChange={(e) => setEarliestInspection(e.target.value)} />
        </div>
        <div>
          <label className="label-field flex items-center gap-1.5"><Calendar size={15} /> تاريخ بدء التنفيذ المقترح *</label>
          <input type="date" className="input-field" value={proposedStart} onChange={(e) => setProposedStart(e.target.value)} />
        </div>
        <div>
          <label className="label-field">ملاحظات (اختياري)</label>
          <textarea className="input-field min-h-[80px] resize-none" placeholder="أي ملاحظات إضافية..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full">تأكيد التقدم</button>
      </form>
    </Modal>
  );
}

function InspectionModal({ job, workerName, onClose, onSubmit }: {
  job: Job; workerName: string; onClose: () => void;
  onSubmit: (data: { verifiedArea: number; spotlightsCount: number; complexity: JobComplexity; depositReceived: boolean; inspectedAt: string }) => void;
}) {
  const [verifiedArea, setVerifiedArea] = useState('');
  const [spotlightsCount, setSpotlightsCount] = useState('');
  const [complexity, setComplexity] = useState<JobComplexity>('normal');
  const [depositReceived, setDepositReceived] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const area = parseFloat(verifiedArea);
    const spots = parseInt(spotlightsCount) || 0;
    if (!area || area <= 0) { setError('الرجاء إدخال المساحة الحقيقية المقاسة'); return; }
    if (spots < 0) { setError('عدد الأضواء لا يمكن أن يكون سالباً'); return; }
    if (!depositReceived) { setError('يجب تأكيد استلام الدفعة الأولى 50% للمتابعة'); return; }
    onSubmit({ verifiedArea: area, spotlightsCount: spots, complexity, depositReceived, inspectedAt: new Date().toISOString() });
  }

  return (
    <Modal open onClose={onClose} title="أخذ القياسات الميدانية" size="md">
      <div className="mb-4 p-3 bg-navy-50 rounded-xl text-sm">
        <p className="font-semibold text-navy-700">{job.clientName} · {job.city}</p>
        <p className="text-slate-500">المساحة التقديرية الأولى للعميل: <strong>{job.estimatedArea} م²</strong> (سجل غير قابل للتعديل)</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field flex items-center gap-1.5"><Ruler size={15} /> المساحة الحقيقية المقاسة بالـ م² *</label>
          <input type="number" className="input-field" placeholder="مثال: 28" value={verifiedArea} onChange={(e) => setVerifiedArea(e.target.value)} min="0" step="0.1" />
          <p className="text-xs text-slate-400 mt-1">جميع الحسابات المالية ستُبنى على هذه المساحة</p>
        </div>
        <div>
          <label className="label-field flex items-center gap-1.5"><Lightbulb size={15} /> عدد الأضواء / السبوتات *</label>
          <input type="number" className="input-field" placeholder="مثال: 12" value={spotlightsCount} onChange={(e) => setSpotlightsCount(e.target.value)} min="0" />
        </div>
        <div>
          <label className="label-field flex items-center gap-1.5"><Gauge size={15} /> درجة تعقيد العمل *</label>
          <select className="input-field" value={complexity} onChange={(e) => setComplexity(e.target.value as JobComplexity)}>
            <option value="simple">{JOB_COMPLEXITY_LABELS.simple}</option>
            <option value="normal">{JOB_COMPLEXITY_LABELS.normal}</option>
            <option value="high">{JOB_COMPLEXITY_LABELS.high}</option>
          </select>
        </div>
        <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-5 h-5 accent-navy-600" checked={depositReceived} onChange={(e) => setDepositReceived(e.target.checked)} />
            <div>
              <span className="font-bold text-navy-800 flex items-center gap-1.5"><Lock size={15} /> تأكيد استلام الدفعة الأولى 50%</span>
              <p className="text-xs text-slate-500 mt-0.5">لا يمكن المتابعة دون تأكيد استلام الدفعة المقدمة من العميل</p>
            </div>
          </label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full">تأكيد القياسات وقفل الورشة</button>
      </form>
    </Modal>
  );
}

function ExecutionModal({ job, onClose, onSubmit }: {
  job: Job; onClose: () => void;
  onSubmit: (data: { beforePhotos: string[]; afterPhotos: string[]; returnMethod: ReturnMethod; finalPaymentReceived: boolean; completedAt: string }) => void;
}) {
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [returnMethod, setReturnMethod] = useState<ReturnMethod | ''>('');
  const [finalPaymentReceived, setFinalPaymentReceived] = useState(false);
  const [error, setError] = useState('');

  function handleFileUpload(files: FileList | null, setter: (v: string[]) => void, current: string[]) {
    if (!files) return;
    const newUrls = Array.from(files).slice(0, 4).map((f) => URL.createObjectURL(f));
    setter([...current, ...newUrls].slice(0, 4));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (beforePhotos.length === 0 || afterPhotos.length === 0) { setError('الرجاء رفع صور قبل وبعد التنفيذ'); return; }
    if (!returnMethod) { setError('الرجاء اختيار طريقة إرجاع السلع المتبقية'); return; }
    if (!finalPaymentReceived) { setError('يجب تأكيد استلام الدفعة النهائية 50%'); return; }
    onSubmit({ beforePhotos, afterPhotos, returnMethod: returnMethod as ReturnMethod, finalPaymentReceived, completedAt: new Date().toISOString() });
  }

  return (
    <Modal open onClose={onClose} title="تصفية نهاية العمل" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-field flex items-center gap-1.5"><Camera size={15} /> صور قبل التنفيذ *</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {beforePhotos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={url} alt={`قبل ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setBeforePhotos(beforePhotos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
              </div>
            ))}
          </div>
          {beforePhotos.length < 4 && (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-4 cursor-pointer hover:border-navy-400 transition-colors text-sm text-slate-500">
              <Upload size={16} /> رفع صور
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files, setBeforePhotos, beforePhotos)} />
            </label>
          )}
        </div>

        <div>
          <label className="label-field flex items-center gap-1.5"><Camera size={15} /> صور بعد التنفيذ *</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {afterPhotos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={url} alt={`بعد ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setAfterPhotos(afterPhotos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
              </div>
            ))}
          </div>
          {afterPhotos.length < 4 && (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-4 cursor-pointer hover:border-navy-400 transition-colors text-sm text-slate-500">
              <Upload size={16} /> رفع صور
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files, setAfterPhotos, afterPhotos)} />
            </label>
          )}
        </div>

        <div>
          <label className="label-field">طريقة إرجاع السلع المتبقية *</label>
          <div className="grid grid-cols-2 gap-3">
            {([['truck', Truck, 'شاحنة'], ['motorcycle', Bike, 'دراجة نارية']] as const).map(([val, Icon, label]) => (
              <button key={val} type="button" onClick={() => setReturnMethod(val)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${returnMethod === val ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-slate-200 text-slate-600 hover:border-navy-300'}`}>
                <Icon size={24} /><span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-5 h-5 accent-green-600" checked={finalPaymentReceived} onChange={(e) => setFinalPaymentReceived(e.target.checked)} />
            <div>
              <span className="font-bold text-navy-800 flex items-center gap-1.5"><CheckCircle2 size={15} /> تأكيد استلام الدفعة النهائية 50%</span>
              <p className="text-xs text-slate-500 mt-0.5">تأكيد استلام المبلغ المتبقي من العميل</p>
            </div>
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full">تصفية وإغلاق العمل</button>
      </form>
    </Modal>
  );
}
