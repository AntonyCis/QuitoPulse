import { useState } from 'react';
import { useCategories } from '../../hooks/use-categories';
import { useCreateReport } from '../../hooks/use-reports';
import { useAuth } from '../../contexts/auth-context';

interface CreateReportProps {
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateReport({ onClose, onCreated }: CreateReportProps) {
  const { data: categories } = useCategories();
  const createMutation = useCreateReport();
  const { user } = useAuth();

  const [step, setStep] = useState<'category' | 'location' | 'details'>('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(-0.1807);
  const [longitude, setLongitude] = useState<number>(-78.4678);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');

  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setStep('location');
  };

  const handleLocationConfirm = () => {
    setStep('details');
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          // Fallback to Quito center
          setLatitude(-0.1807);
          setLongitude(-78.4678);
        },
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Debes iniciar sesión');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title,
        description,
        categoryId: selectedCategoryId,
        latitude,
        longitude,
        priority,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reporte');
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-6 text-center shadow-xl">
          <p className="mb-4 text-gray-700">Debes iniciar sesión para crear un reporte</p>
          <button onClick={onClose} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold text-gray-900">Nuevo Reporte</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Step indicator */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className={step === 'category' ? 'font-bold text-blue-600' : 'text-gray-400'}>
              1. Categoría
            </span>
            <span className="text-gray-300">→</span>
            <span className={step === 'location' ? 'font-bold text-blue-600' : 'text-gray-400'}>
              2. Ubicación
            </span>
            <span className="text-gray-300">→</span>
            <span className={step === 'details' ? 'font-bold text-blue-600' : 'text-gray-400'}>
              3. Detalles
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {/* Step 1: Category */}
          {step === 'category' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Selecciona la categoría del incidente:</p>
              <div className="grid grid-cols-2 gap-2">
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex items-center gap-2 rounded-lg border p-3 text-left transition hover:bg-gray-50"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 'location' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecciona la ubicación del incidente:
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Latitud</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Longitud</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUseMyLocation}
                  className="w-full rounded-lg border border-dashed border-gray-300 py-3 text-sm text-gray-600 transition hover:border-blue-400 hover:text-blue-600"
                >
                  📍 Usar mi ubicación actual
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setStep('category')}
                  className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Atrás
                </button>
                <button
                  onClick={handleLocationConfirm}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Describe brevemente el incidente"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Proporciona detalles del incidente..."
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStep('location')}
                  className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
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
