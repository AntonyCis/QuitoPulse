import { useState } from 'react';
import { useCategories } from '../../hooks/use-categories';
import { useCreateReport } from '../../hooks/use-reports';
import { useAuth } from '../../contexts/auth-context';
import { Q } from '../../lib/colors';

interface CreateReportProps {
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateReport({ onClose, onCreated }: CreateReportProps) {
  const { data: categories } = useCategories();
  const createMutation = useCreateReport();
  const { user } = useAuth();

  const [step, setStep] = useState<'category' | 'location' | 'details'>('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [latitude, setLatitude] = useState(-0.1807);
  const [longitude, setLongitude] = useState(-78.4678);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');

  const steps = [
    { key: 'category', label: 'Categoria' },
    { key: 'location', label: 'Ubicacion' },
    { key: 'details', label: 'Detalles' },
  ];
  const currentIdx = steps.findIndex((s) => s.key === step);

  const inputStyle = {
    borderColor: `${Q.white}15`,
    backgroundColor: `${Q.white}08`,
    color: 'white' as const,
    ['--tw-ring-color' as string]: `${Q.terracotta}40`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) { setError('Debes iniciar sesion'); return; }
    try {
      await createMutation.mutateAsync({ title, description, categoryId: selectedCategoryId, latitude, longitude, priority });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reporte');
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${Q.charcoal}CC` }}>
        <div className="rounded-2xl p-8 text-center shadow-2xl" style={{ backgroundColor: Q.charcoal }}>
          <p className="mb-5 text-sm" style={{ color: Q.stoneDark }}>Debes iniciar sesion para crear un reporte</p>
          <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: Q.terracotta }}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${Q.charcoal}CC` }}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl" style={{ backgroundColor: Q.charcoal }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${Q.white}10` }}>
          <h2 className="text-lg font-bold text-white">Nuevo Reporte</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10">
            <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all"
                  style={{ backgroundColor: i <= currentIdx ? Q.terracotta : `${Q.white}10`, color: i <= currentIdx ? 'white' : Q.warmGray }}>
                  {i + 1}
                </div>
                <span className="text-xs font-medium" style={{ color: i <= currentIdx ? 'white' : Q.warmGray }}>{s.label}</span>
                {i < steps.length - 1 && <div className="mx-1 h-px w-4" style={{ backgroundColor: `${Q.white}15` }} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: Q.errorLight, color: Q.error }}>{error}</div>
          )}

          {step === 'category' && (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: Q.warmGray }}>Selecciona la categoria del incidente:</p>
              <div className="grid grid-cols-2 gap-2">
                {categories?.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCategoryId(cat.id); setStep('location'); }}
                    className="flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all hover:opacity-80"
                    style={{ borderColor: `${cat.color}40`, backgroundColor: `${cat.color}10` }}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium" style={{ color: cat.color }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'location' && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: Q.warmGray }}>Selecciona la ubicacion del incidente:</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: Q.warmGray }}>Latitud</label>
                    <input type="number" step="0.0001" value={latitude} onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-2" style={inputStyle} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: Q.warmGray }}>Longitud</label>
                    <input type="number" step="0.0001" value={longitude} onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-2" style={inputStyle} />
                  </div>
                </div>
                <button onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
                      () => { setLatitude(-0.1807); setLongitude(-78.4678); },
                    );
                  }
                }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm transition-all hover:opacity-80"
                  style={{ borderColor: `${Q.sage}50`, color: Q.sage, backgroundColor: `${Q.sage}10` }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Usar mi ubicacion actual
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setStep('category')} className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10" style={{ color: Q.warmGray }}>Atras</button>
                <button onClick={() => setStep('details')} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: Q.terracotta }}>Siguiente</button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">Titulo</label>
                <input type="text" required minLength={3} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Describe brevemente el incidente"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={inputStyle} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">Descripcion</label>
                <textarea required minLength={10} maxLength={2000} rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Proporciona detalles del incidente..."
                  className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={inputStyle} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">Prioridad</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={{ ...inputStyle, appearance: 'none' as const }}>
                  <option value="LOW" style={{ backgroundColor: Q.charcoal, color: 'white' }}>Baja</option>
                  <option value="MEDIUM" style={{ backgroundColor: Q.charcoal, color: 'white' }}>Media</option>
                  <option value="HIGH" style={{ backgroundColor: Q.charcoal, color: 'white' }}>Alta</option>
                  <option value="URGENT" style={{ backgroundColor: Q.charcoal, color: 'white' }}>Urgente</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStep('location')} className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10" style={{ color: Q.warmGray }}>Atras</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: Q.sage }}>
                  {createMutation.isPending ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
