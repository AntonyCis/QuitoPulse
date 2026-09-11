import { useState, useRef } from 'react';
import { useCategories } from '../../hooks/use-categories';
import { useCreateReport } from '../../hooks/use-reports';
import { useAuth } from '../../contexts/auth-context';
import { apiClient } from '../../lib/api-client';
import { uploadPhoto, MAX_PHOTOS, MAX_PHOTO_MB } from '../../lib/upload';
import { Q } from '../../lib/colors';
import { LocationPicker } from './location-picker';

interface CreateReportProps {
  onClose: () => void;
  onCreated?: () => void;
}

interface PhotoItem {
  file: File;
  preview: string;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
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
  const [address, setAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [incidentDate, setIncidentDate] = useState(todayISO());
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [photoWarning, setPhotoWarning] = useState('');
  const resolveTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { key: 'category', label: 'Categoria' },
    { key: 'location', label: 'Ubicacion' },
    { key: 'details', label: 'Detalles' },
  ];
  const currentIdx = steps.findIndex((s) => s.key === step);

  const inputStyle = {
    borderColor: '#ffffff15',
    backgroundColor: '#ffffff08',
    color: 'white' as const,
    ['--tw-ring-color' as string]: `${Q.primaryContainer}40`,
  };

  const handleResolveAddress = (lat: number, lng: number) => {
    if (resolveTimer.current) window.clearTimeout(resolveTimer.current);
    resolveTimer.current = window.setTimeout(async () => {
      setAddressLoading(true);
      try {
        const res = await apiClient.get<{ address: string | null }>('/geocode/reverse', {
          lat: String(lat),
          lng: String(lng),
        });
        if (res.address && !res.address.includes('null')) {
          setAddress(res.address);
        }
      } catch {
        // ignorar: la direccion queda vacia para editar manualmente
      } finally {
        setAddressLoading(false);
      }
    }, 500);
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    setPhotoWarning('');
    setPhotos((prev) => {
      const remaining = Math.max(0, MAX_PHOTOS - prev.length);
      const accepted: PhotoItem[] = [];
      for (const file of Array.from(files).slice(0, remaining)) {
        if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
          setPhotoWarning(`La imagen "${file.name}" supera los ${MAX_PHOTO_MB}MB`);
          continue;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setPhotoWarning(`El archivo "${file.name}" no es una imagen valida`);
          continue;
        }
        accepted.push({ file, preview: URL.createObjectURL(file) });
      }
      return [...prev, ...accepted];
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) { setError('Debes iniciar sesion'); return; }

    setSending(true);
    setPhotoWarning('');
    try {
      const created = await createMutation.mutateAsync({
        title,
        description,
        categoryId: selectedCategoryId,
        latitude,
        longitude,
        priority,
        address: address.trim() || undefined,
        incidentDate: incidentDate ? new Date(`${incidentDate}T12:00:00`).toISOString() : undefined,
      });

      if (photos.length > 0) {
        try {
          for (const photo of photos) {
            const uploaded = await uploadPhoto(photo.file);
            await apiClient.post(`/reports/${created.id}/images`, {
              key: uploaded.key,
              filename: uploaded.filename,
              mimeType: uploaded.mimeType,
              fileSize: uploaded.fileSize,
            });
          }
        } catch (err) {
          setPhotoWarning(
            `El reporte se creo, pero no se pudieron subir las imagenes: ${
              err instanceof Error ? err.message : 'error al subir'
            }. Podras intentar despues.`,
          );
        }
      }

      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reporte');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ backgroundColor: `${Q.bg}CC` }}>
        <div className="w-full rounded-t-3xl p-8 text-center shadow-2xl sm:w-auto sm:rounded-2xl" style={{ backgroundColor: Q.surfaceLowest }}>
          <p className="mb-5 text-sm" style={{ color: Q.outline }}>Debes iniciar sesion para crear un reporte</p>
          <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: Q.primaryContainer }}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ backgroundColor: `${Q.bg}CC` }}>
      <div className="flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:max-h-[85svh] sm:max-w-lg sm:rounded-2xl" style={{ backgroundColor: Q.surfaceLowest }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #ffffff10' }}>
          <h2 className="text-lg font-bold text-white">Nuevo Reporte</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10">
            <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="mb-6 flex items-center gap-1 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={s.key} className="flex shrink-0 items-center gap-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all"
                  style={{ backgroundColor: i <= currentIdx ? Q.primaryContainer : '#ffffff10', color: i <= currentIdx ? 'white' : Q.onSurfaceVariant }}>
                  {i + 1}
                </div>
                <span className="text-xs font-medium" style={{ color: i <= currentIdx ? 'white' : Q.onSurfaceVariant }}>{s.label}</span>
                {i < steps.length - 1 && <div className="mx-1 h-px w-4" style={{ backgroundColor: '#ffffff15' }} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: `${Q.errorContainer}40`, color: Q.error }}>{error}</div>
          )}

          {step === 'category' && (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: Q.onSurfaceVariant }}>Selecciona la categoria del incidente:</p>
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
              <p className="text-sm" style={{ color: Q.onSurfaceVariant }}>Selecciona la ubicacion del incidente:</p>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  setLocationError('');
                }}
                onResolveAddress={handleResolveAddress}
              />
              <p className="text-center text-[11px]" style={{ color: Q.outline }}>
                © OpenStreetMap contributors · Nominatim
              </p>
              <div className="space-y-3">
                <button onClick={() => {
                  if (!navigator.geolocation) {
                    setLocationError('Tu navegador no soporta geolocalizacion');
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(
                    (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); setLocationError(''); handleResolveAddress(pos.coords.latitude, pos.coords.longitude); },
                    () => {
                      setLatitude(-0.1807);
                      setLongitude(-78.4678);
                      setLocationError('No se pudo obtener tu ubicacion. Revisa los permisos o desactiva bloqueadores de localizacion.');
                    },
                  );
                }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm transition-all hover:opacity-80"
                  style={{ borderColor: `${Q.tertiary}50`, color: Q.tertiary, backgroundColor: `${Q.tertiary}10` }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Usar mi ubicacion actual
                </button>
                {locationError && (
                  <p className="text-xs font-medium" style={{ color: Q.warning }}>{locationError}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setStep('category')} className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10" style={{ color: Q.onSurfaceVariant }}>Atras</button>
                <button onClick={() => setStep('details')} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: Q.primaryContainer }}>Siguiente</button>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white">Fecha del incidente</label>
                  <input type="date" value={incidentDate} max={todayISO()} onChange={(e) => setIncidentDate(e.target.value)}
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
                <div className="relative">
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={500}
                    placeholder="Direccion del incidente (opcional)"
                    className="w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-2" style={inputStyle} />
                  {addressLoading && (
                    <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: `${Q.primary}88`, borderTopColor: 'transparent' }} />
                  )}
                </div>
                <p className="mt-1 text-[11px]" style={{ color: Q.outline }}>
                  Se autocompleta con tu ubicacion en el mapa. Puedes editarlo.
                </p>
              </div>

              {/* Photos */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">Fotografias (opcional, hasta {MAX_PHOTOS})</label>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, i) => (
                    <div key={photo.preview} className="relative h-20 overflow-hidden rounded-xl border border-white/10">
                      <img src={photo.preview} alt={photo.file.name} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 items-center justify-center rounded-xl border border-dashed text-2xl transition-all hover:opacity-70"
                      style={{ borderColor: `${Q.primary}55`, color: Q.secondary, backgroundColor: `${Q.primary}0D` }}>
                      +
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
                  className="hidden" onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} />
                {photoWarning && (
                  <p className="mt-2 rounded-xl px-3 py-2 text-xs font-medium" style={{ backgroundColor: `${Q.warning}18`, color: Q.warning }}>{photoWarning}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStep('location')} className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10" style={{ color: Q.onSurfaceVariant }}>Atras</button>
                <button type="submit" disabled={sending}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: Q.tertiary }}>
                  {sending ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}