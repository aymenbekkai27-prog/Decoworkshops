import { useState } from 'react';
import {
  Package, Plus, Edit3, Trash2, Layers, Palette, Lightbulb, Wrench,
  Box, CheckCircle2, AlertTriangle, RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './ui/Toast';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { formatDZD } from '../lib/pricing';
import type { Material, MaterialCategory } from '../types';
import { MATERIAL_CATEGORY_LABELS } from '../types';

const CATEGORY_ICONS: Record<MaterialCategory, typeof Layers> = {
  placo: Layers, pvc: Palette, spotlight: Lightbulb, consumable: Wrench,
};

export function MaterialsInventory() {
  const { data, addMaterial, updateMaterial, deleteMaterial, toggleBoxOpened, resetAll } = useApp();
  const showToast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-navy-800 flex items-center gap-2"><Package size={22} /> قاعدة بيانات المخزون</h2>
          <p className="text-sm text-slate-500 mt-0.5">إدارة المواد الخام وتتبع المخزون</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary !py-2 text-sm" onClick={() => setResetConfirm(true)}><RotateCcw size={16} /> إعادة تعيين</button>
          <button className="btn-primary !py-2 text-sm" onClick={() => setAddOpen(true)}><Plus size={16} /> مادة جديدة</button>
        </div>
      </div>

      {(Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[]).map((cat) => {
        const items = data.materials.filter((m) => m.category === cat);
        if (items.length === 0) return null;
        const Icon = CATEGORY_ICONS[cat];
        return (
          <div key={cat} className="mb-6">
            <h3 className="font-bold text-navy-700 mb-3 flex items-center gap-2">
              <Icon size={18} /> {MATERIAL_CATEGORY_LABELS[cat]}
              <span className="text-xs text-slate-400 font-normal">({items.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((m) => (
                <div key={m.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <div className="w-9 h-9 bg-navy-50 rounded-lg flex items-center justify-center shrink-0"><Icon size={18} className="text-navy-600" /></div>
                      <div>
                        <p className="font-bold text-navy-800 text-sm leading-tight">{m.name}</p>
                        <p className="text-xs text-slate-400">لكل {m.unit}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditMaterial(m)} className="p-1.5 rounded-lg text-slate-400 hover:bg-navy-50 hover:text-navy-600"><Edit3 size={15} /></button>
                      <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-500">السعر: <span className="font-bold text-navy-700">{formatDZD(m.unitCost)}</span></p>
                      <p className="text-slate-500">المخزون: <span className={`font-bold ${m.stock < 5 ? 'text-red-600' : 'text-navy-700'}`}>{m.stock} {m.unit}</span></p>
                    </div>
                  </div>

                  {m.category === 'consumable' && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <button onClick={() => toggleBoxOpened(m.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${m.boxOpened ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                        <span className="flex items-center gap-1.5"><Box size={14} />{m.boxOpened ? 'علبة مفتوحة - التكلفة 0 دج للمشاريع التالية' : 'علبة مغلقة'}</span>
                        {m.boxOpened ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      </button>
                      {!m.boxOpened && <p className="text-[10px] text-slate-400 mt-1">عند الفتح: تُحسب التكلفة الكاملة لأول مشروع</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {addOpen && (
        <MaterialFormModal onClose={() => setAddOpen(false)}
          onSubmit={(d) => { addMaterial(d); showToast('تمت إضافة المادة بنجاح', 'success'); setAddOpen(false); }} />
      )}
      {editMaterial && (
        <MaterialFormModal material={editMaterial} onClose={() => setEditMaterial(null)}
          onSubmit={(d) => { updateMaterial(editMaterial.id, d); showToast('تم تحديث المادة', 'success'); setEditMaterial(null); }} />
      )}

      <ConfirmDialog open={!!deleteId} title="حذف المادة" danger
        message="هل أنت متأكد من حذف هذه المادة من المخزون؟ لا يمكن التراجع." confirmLabel="حذف"
        onConfirm={() => { if (deleteId) deleteMaterial(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} />

      <ConfirmDialog open={resetConfirm} title="إعادة تعيين البيانات" danger
        message="سيتم حذف جميع البيانات وإعادة تعيين النظام إلى الحالة الأولية. لا يمكن التراجع." confirmLabel="إعادة التعيين"
        onConfirm={() => { resetAll(); setResetConfirm(false); showToast('تمت إعادة تعيين البيانات', 'info'); }}
        onCancel={() => setResetConfirm(false)} />
    </div>
  );
}

function MaterialFormModal({ material, onClose, onSubmit }: {
  material?: Material; onClose: () => void; onSubmit: (data: Omit<Material, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    name: material?.name ?? '',
    category: material?.category ?? ('placo' as MaterialCategory),
    unit: material?.unit ?? 'لوح',
    unitCost: material?.unitCost?.toString() ?? '',
    stock: material?.stock?.toString() ?? '0',
  });
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('الرجاء إدخال اسم المادة'); return; }
    const cost = parseFloat(form.unitCost);
    if (isNaN(cost) || cost < 0) { setError('الرجاء إدخال سعر صحيح'); return; }
    onSubmit({
      name: form.name.trim(), category: form.category,
      unit: form.unit.trim() || 'وحدة', unitCost: cost,
      stock: parseInt(form.stock) || 0,
      boxOpened: material?.boxOpened ?? false,
      boxOpenedForJobId: material?.boxOpenedForJobId,
    });
  }

  return (
    <Modal open onClose={onClose} title={material ? 'تعديل المادة' : 'مادة جديدة'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">اسم المادة *</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: لوح بلاكو 1.2x2.5م" />
        </div>
        <div>
          <label className="label-field">الفئة *</label>
          <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MaterialCategory })}>
            {(Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[]).map((c) => <option key={c} value={c}>{MATERIAL_CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label-field">الوحدة</label>
            <input className="input-field" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="لوح / قطعة / علبة" />
          </div>
          <div>
            <label className="label-field">السعر (دج) *</label>
            <input type="number" className="input-field" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} min="0" />
          </div>
          <div>
            <label className="label-field">المخزون</label>
            <input type="number" className="input-field" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full">{material ? 'حفظ التعديلات' : 'إضافة المادة'}</button>
      </form>
    </Modal>
  );
}
