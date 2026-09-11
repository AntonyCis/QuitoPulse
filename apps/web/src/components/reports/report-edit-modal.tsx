import { useState } from 'react';
import { useCategories } from '../../hooks/use-categories';
import { useUpdateReport } from '../../hooks/use-reports';
import type { ReportDetail } from '../../hooks/use-report-detail';
import { Q } from '../../lib/colors';

interface ReportEditModalProps {
  report: ReportDetail;
  onClose: () => void;
}

const inputStyle = {
  borderColor: '#ffffff15',
  backgroundColor: '#ffffff08',
  color: 'white' as const,
  ['--tw-ring-color' as string]: `${Q.primaryContainer}40`,
};

export function ReportEditModal({ report, onClose }: ReportEditModalProps) {
  const { data: categories } = useCategories();
  const updateMutation = useUpdateReport();

  const [title, setTitle] = useState(report.title);
  const [description, setDescription] = useState(report.description);
  const [categoryId, setCategoryId] = useState(report.categoryId);
  const [priority, setPriority] = useState(report.priority);
  const [address, setAddress] = useState(report.address ?? '');
  const [incidentDate, setIncidentDate] = useState(
    report.incidentDate ? report.incidentDate.slice(0, 10) : '',
  );
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await updateMutation.mutateAsync({
        id: report.id,
        data: {
          title,
          description,
          categoryId,
          priority,
          address: address.trim() || undefined,
          incidentDate: incidentDate ? new Date(`${incidentDate}T12:00:00`).toISOString() : undefined,
        },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar reporte');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ backgroundColor: `${Q.bg}CC` }}>
      <div className="flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:max-h-[85svh] sm:max-w-lg sm:rounded-2xl" style={{ backgroundColor: Q.surfaceLowest }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #ffffff10' }}>
          <h2 className="text-lg font-bold text-white">Editar Reporte</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]" style={{ color: 'rgba(255,255,255,0.5)' }}>close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: `${Q.errorContainer}40`, color: Q.error }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Categoria</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={{ ...inputStyle, appearance: 'none' as const }}>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id} style={{ backgroundColor: Q.surfaceLowest, color: 'white' }}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Titulo</label>
              <input type="text" required minLength={3} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={inputStyle} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Descripcion</label>
              <textarea required minLength={10} maxLength={2000} rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={inputStyle} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">Fecha del incidente</label>
                <input type="date" value={incidentDate} max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={{ ...inputStyle, colorScheme: 'dark' as const }} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">Prioridad</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={{ ...inputStyle, appearance: 'none' as const }}>
                  <option value="LOW" style={{ backgroundColor: Q.surfaceLowest, color: 'white' }}>Baja</option>
                  <option value="MEDIUM" style={{ backgroundColor: Q.surfaceLowest, color: 'white' }}>Media</option>
                  <option value="HIGH" style={{ backgroundColor: Q.surfaceLowest, color: 'white' }}>Alta</option>
                  <option value="URGENT" style={{ backgroundColor: Q.surfaceLowest, color: 'white' }}>Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Direccion</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={500}
                placeholder="Direccion del incidente"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2" style={inputStyle} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10" style={{ color: Q.onSurfaceVariant }}>Cancelar</button>
              <button type="submit" disabled={updateMutation.isPending}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: Q.tertiary }}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}