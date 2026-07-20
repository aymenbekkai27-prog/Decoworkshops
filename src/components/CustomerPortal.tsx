import { useState } from 'react';
import {
  Sparkles, Phone, Home, Factory, Store, Ruler, CheckCircle2, Search,
  Palette, Layers, Lightbulb, ShieldCheck, Clock, Award, ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './ui/Toast';
import { Modal } from './ui/Modal';
import { StatusPill } from './ui/StatusPill';
import type { PropertyType, Job } from '../types';
import { PROPERTY_TYPE_LABELS, JOB_STATUS_LABELS } from '../types';

const GALLERY_IMAGES = [
  { url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'ديكور بلاكو فاخر - صالون عصري', tag: 'بلاكو بلاطر' },
  { url: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'أسقف معلقة بإضاءة سبوت', tag: 'إضاءة سبوت' },
  { url: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'جدران PVC ديكورية', tag: 'بولي كلوريد' },
  { url: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'مدخل فاخر بلمسة خشبية', tag: 'خشب صناعي' },
  { url: 'https://images.pexels.com/photos/2029662/pexels-photo-2029662.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'غرفة نوم بأسقف جبس', tag: 'أسقف جبس' },
  { url: 'https://images.pexels.com/photos/3032078/pexels-photo-3032078.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'محل تجاري بديكور متكامل', tag: 'محل تجاري' },
];

const SERVICES = [
  { icon: Layers, title: 'البلاكو بلاطر', desc: 'أسقف معلقة وجدران فاصلة بألواح البلاكو الفاخرة' },
  { icon: Palette, title: 'البولي كلوريد (PVC)', desc: 'جدران ديكورية مقاومة للرطوبة بتصاميم راقية' },
  { icon: Lightbulb, title: 'الأضواء والسبوتات', desc: 'تركيب إضاءة LED مدمجة بتقنيات حديثة' },
  { icon: Award, title: 'خشب ورخام صناعي', desc: 'بدائل فاخرة للخشب والرخام بلمسات احترافية' },
];

const PROPERTY_OPTIONS: { value: PropertyType; icon: typeof Home; label: string }[] = [
  { value: 'home', icon: Home, label: PROPERTY_TYPE_LABELS.home },
  { value: 'workshop', icon: Factory, label: PROPERTY_TYPE_LABELS.workshop },
  { value: 'shop', icon: Store, label: PROPERTY_TYPE_LABELS.shop },
];

const CITIES = ['الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'بجاية', 'تلمسان', 'البليدة'];

export function CustomerPortal() {
  const { addJob, getJobByTracking } = useApp();
  const showToast = useToast();

  const [form, setForm] = useState({ clientName: '', clientPhone: '', propertyType: 'home' as PropertyType, city: CITIES[0], estimatedArea: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successJob, setSuccessJob] = useState<{ trackingCode: string; clientName: string } | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<Job | null | undefined>(undefined);
  const [activeGallery, setActiveGallery] = useState(0);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.clientName.trim()) e.clientName = 'الرجاء إدخال الاسم الكامل';
    if (!form.clientPhone.trim()) e.clientPhone = 'الرجاء إدخال رقم الهاتف';
    else if (!/^0[5-7]\d{8}$/.test(form.clientPhone.trim())) e.clientPhone = 'رقم هاتف غير صحيح (مثال: 0551234567)';
    const area = parseFloat(form.estimatedArea);
    if (!form.estimatedArea || isNaN(area) || area <= 0) e.estimatedArea = 'الرجاء إدخال مساحة صحيحة';
    else if (area > 10000) e.estimatedArea = 'المساحة كبيرة جداً، يرجى التحقق';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    const job = addJob({
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim(),
      propertyType: form.propertyType,
      city: form.city,
      estimatedArea: parseFloat(form.estimatedArea),
    });
    setSuccessJob({ trackingCode: job.trackingCode, clientName: form.clientName.trim() });
    setForm({ clientName: '', clientPhone: '', propertyType: 'home', city: CITIES[0], estimatedArea: '' });
    showToast('تم تسجيل طلبك بنجاح', 'success');
  }

  function handleTrack(ev: React.FormEvent) {
    ev.preventDefault();
    if (!trackingInput.trim()) return;
    const job = getJobByTracking(trackingInput.trim());
    setTrackingResult(job ?? null);
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${GALLERY_IMAGES[0].url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-gold-400/20 text-gold-200 border border-gold-400/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <Sparkles size={16} /> ديكور داخلي فاخر بأيدي محترفين
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
              نحوّل مساحاتك إلى تحف فنية<br />
              <span className="text-gold-300">بالبلاكو والبولي كلوريد والديكور الراقي</span>
            </h2>
            <p className="text-navy-100 text-base sm:text-lg leading-relaxed mb-8">
              منصة متكاملة تربطك بفريق فني متخصص في أعمال الديكور الداخلي الفاخر.
              سجّل طلبك واحصل على معاينة ميدانية دقيقة وتنفيذ احترافي.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#lead-form" className="btn-gold">سجّل طلبك الآن <ArrowLeft size={18} /></a>
              <a href="#gallery" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20">تصفّح أعمالنا</a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-navy-800 mb-2">خدماتنا الفاخرة</h3>
          <p className="text-slate-500">حلول ديكورية متكاملة بأعلى معايير الجودة</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s) => (
            <div key={s.title} className="card p-6 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mb-4">
                <s.icon size={24} className="text-navy-600" />
              </div>
              <h4 className="font-bold text-navy-800 mb-1.5">{s.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="gallery" className="bg-slate-100 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-navy-800 mb-2">معرض الأعمال الفاخرة</h3>
            <p className="text-slate-500">نماذج من إنجازاتنا في الديكور الداخلي</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4 group h-64 sm:h-96">
            <img src={GALLERY_IMAGES[activeGallery].url} alt={GALLERY_IMAGES[activeGallery].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 right-0 p-6 text-white">
              <span className="inline-block bg-gold-400 text-navy-900 text-xs font-bold px-3 py-1 rounded-full mb-2">{GALLERY_IMAGES[activeGallery].tag}</span>
              <h4 className="text-lg sm:text-xl font-bold">{GALLERY_IMAGES[activeGallery].title}</h4>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {GALLERY_IMAGES.map((img, i) => (
              <button key={i} onClick={() => setActiveGallery(i)} className={`relative rounded-xl overflow-hidden h-20 sm:h-24 transition-all ${activeGallery === i ? 'ring-2 ring-navy-600 ring-offset-2' : 'opacity-70 hover:opacity-100'}`}>
                <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="lead-form" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="card p-6 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ruler size={28} className="text-gold-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-navy-800 mb-2">نموذج تسجيل الطلب</h3>
            <p className="text-slate-500">املأ النموذج وسيتواصل معك فريقنا الفني لتحديد موعد المعاينة</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">الاسم الكامل *</label>
              <input className="input-field" placeholder="مثال: أحمد بن محمد" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
              {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
            </div>
            <div>
              <label className="label-field">رقم الهاتف *</label>
              <div className="relative">
                <Phone size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input-field pr-10" placeholder="0551234567" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} inputMode="tel" />
              </div>
              {errors.clientPhone && <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>}
            </div>
            <div>
              <label className="label-field">نوع العقار *</label>
              <div className="grid grid-cols-3 gap-3">
                {PROPERTY_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setForm({ ...form, propertyType: opt.value })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.propertyType === opt.value ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-slate-200 hover:border-navy-300 text-slate-600'}`}>
                    <opt.icon size={22} />
                    <span className="text-sm font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">المدينة *</label>
                <select className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label-field">المساحة التقديرية بالـ م² *</label>
                <input type="number" className="input-field" placeholder="مثال: 25" value={form.estimatedArea} onChange={(e) => setForm({ ...form, estimatedArea: e.target.value })} min="1" />
                {errors.estimatedArea && <p className="text-red-500 text-xs mt-1">{errors.estimatedArea}</p>}
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 text-base">تسجيل الطلب</button>
          </form>
        </div>
      </section>

      <section className="bg-slate-100 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center"><Search size={20} className="text-navy-600" /></div>
              <div>
                <h3 className="text-xl font-bold text-navy-800">تتبّع طلبك</h3>
                <p className="text-sm text-slate-500">أدخل رمز التتبع الذي حصلت عليه</p>
              </div>
            </div>
            <form onSubmit={handleTrack} className="flex gap-2">
              <input className="input-field flex-1" placeholder="مثال: DEC-XXXXXX" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} />
              <button type="submit" className="btn-primary">تتبّع</button>
            </form>
            {trackingResult === null && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">لم يتم العثور على طلب بهذا الرمز. يرجى التحقق والمحاولة مرة أخرى.</div>
            )}
            {trackingResult && (
              <div className="mt-4 p-5 bg-navy-50 border border-navy-200 rounded-xl animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-navy-800">طلب رقم: {trackingResult.trackingCode}</span>
                  <StatusPill status={trackingResult.status} />
                </div>
                <p className="text-sm text-slate-600">العميل: {trackingResult.clientName}</p>
                <p className="text-sm text-slate-600">نوع العقار: {PROPERTY_TYPE_LABELS[trackingResult.propertyType]}</p>
                <p className="text-sm text-slate-600">الحالة الحالية: {JOB_STATUS_LABELS[trackingResult.status]}</p>
                {trackingResult.assignedWorkerName && <p className="text-sm text-slate-600">العامل المسؤول: {trackingResult.assignedWorkerName}</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: ShieldCheck, title: 'ضمان الجودة', desc: 'نضمن جودة التنفيذ بمعاينة ميدانية دقيقة' },
            { icon: Clock, title: 'تنفيذ سريع', desc: 'فريق فني متاح في الوقت الذي يناسبك' },
            { icon: Award, title: 'خبرة احترافية', desc: 'سنوات من الخبرة في الديكور الفاخر' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-4 p-5 card">
              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center shrink-0"><b.icon size={24} className="text-gold-600" /></div>
              <div><h4 className="font-bold text-navy-800">{b.title}</h4><p className="text-sm text-slate-500">{b.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-navy-800 text-navy-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3"><Sparkles size={20} className="text-gold-400" /><span className="font-bold text-white">صالون الديكور الفاخر</span></div>
          <p className="text-sm text-navy-300">© 2026 جميع الحقوق محفوظة - سوق الديكور الداخلي الفاخر</p>
        </div>
      </footer>

      <Modal open={!!successJob} onClose={() => setSuccessJob(null)} title="تم تسجيل طلبك" size="sm">
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-scale-in"><CheckCircle2 size={44} className="text-green-600" /></div>
          <p className="text-navy-800 text-lg font-bold mb-2">شكراً لطلبك يا {successJob?.clientName}!</p>
          <p className="text-slate-600 leading-relaxed mb-5">تم تسجيل معلوماتك بنجاح. سيقوم فريقنا الفني بالتواصل معك هاتفياً لمناقشة التفاصيل وتحديد موعد المعاينة الميدانية بدقة.</p>
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 mb-5">
            <p className="text-xs text-slate-500 mb-1">رمز التتبع الخاص بك</p>
            <p className="text-2xl font-bold text-navy-700 tracking-wider">{successJob?.trackingCode}</p>
            <p className="text-xs text-slate-400 mt-2">احتفظ بهذا الرمز لتتبع حالة طلبك</p>
          </div>
          <button className="btn-primary w-full" onClick={() => setSuccessJob(null)}>تم</button>
        </div>
      </Modal>
    </div>
  );
}
