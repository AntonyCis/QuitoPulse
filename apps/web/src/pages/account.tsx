import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useMyReports, useDeleteReport } from '../hooks/use-reports';
import { useReportDetail } from '../hooks/use-report-detail';
import { useProfile, useUpdateProfile } from '../hooks/use-profile';
import { ReportEditModal } from '../components/reports/report-edit-modal';
import { Q } from '../lib/colors';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: Q.warning },
  IN_REVIEW: { label: 'En revision', color: Q.secondary },
  APPROVED: { label: 'Aprobado', color: Q.tertiary },
  REJECTED: { label: 'Rechazado', color: Q.error },
  RESOLVED: { label: 'Resuelto', color: Q.primary },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
  return `hace ${Math.floor(seconds / 86400)}d`;
}

const inputStyle = {
  borderColor: '#ffffff15',
  backgroundColor: '#ffffff08',
  color: 'white' as const,
  ['--tw-ring-color' as string]: `${Q.primaryContainer}40`,
};

function EditReportLauncher({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const { data: report, isLoading } = useReportDetail(reportId);
  if (isLoading || !report) return null;
  return <ReportEditModal report={report} onClose={onClose} />;
}

export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<'reports' | 'profile'>('reports');
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: myReports, isFetching } = useMyReports(page, 10);
  const deleteMutation = useDeleteReport();

  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setDisplayName((prev) => (prev === '' && profile.displayName ? profile.displayName : prev));
    setBio((prev) => (prev === '' && profile.bio ? profile.bio : prev));
    setPhone((prev) => (prev === '' && profile.phone ? profile.phone : prev));
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSaved(false);
    try {
      await updateProfile.mutateAsync({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setProfileDirty(false);
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Error al guardar perfil');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este reporte? Esta accion no se puede deshacer.')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Error al eliminar el reporte');
    }
  };

  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: Q.bg }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl sm:px-6"
        style={{ backgroundColor: `${Q.bg}D9`, borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Link to="/map" className="flex items-center gap-2">
          <span
            className="material-symbols-outlined rounded-lg p-0.5 text-[24px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            radar
          </span>
          <span className="font-display text-headline-md font-bold tracking-tight text-on-surface">Mi Cuenta</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/map"
            className="rounded-lg px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-white/10 hover:text-secondary"
          >
            Mapa
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-xl p-1" style={{ backgroundColor: `${Q.surfaceLow}80` }}>
          {(
            [
              { key: 'reports', label: 'Mis reportes' },
              { key: 'profile', label: 'Perfil' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 rounded-lg px-4 py-2.5 text-label-md transition-all"
              style={{
                backgroundColor: tab === t.key ? Q.primaryContainer : 'transparent',
                color: tab === t.key ? 'white' : Q.onSurfaceVariant,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'reports' && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: Q.onSurfaceVariant }}>
              {user?.email ?? ''}
            </p>

            {isFetching && myReports === undefined ? (
              <div className="py-10 text-center text-body-md text-on-surface-variant">Cargando...</div>
            ) : (myReports?.items.length ?? 0) === 0 ? (
              <div className="py-10 text-center">
                <p className="mb-3 text-body-md text-on-surface-variant">Aun no has creado reportes.</p>
                <Link
                  to="/map"
                  className="btn-gradient inline-block rounded-xl px-5 py-2.5 text-label-md text-white"
                >
                  Crear el primero
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {myReports?.items.map((r) => {
                    const status = STATUS_MAP[r.status] ?? { label: r.status, color: Q.outline };
                    return (
                      <div
                        key={r.id}
                        className="rounded-2xl p-4"
                        style={{ backgroundColor: `${Q.surfaceLow}CC`, border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.categoryColor }} />
                            <span className="truncate font-mono-data text-mono-data uppercase tracking-wider" style={{ color: r.categoryColor }}>
                              {r.categoryLabel}
                            </span>
                          </div>
                          <span
                            className="shrink-0 rounded-lg px-2.5 py-0.5 font-mono-data text-xs uppercase tracking-wider"
                            style={{
                              backgroundColor: `${status.color}1A`,
                              color: status.color,
                              border: `1px solid ${status.color}44`,
                            }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <h3 className="mb-1 font-display text-body-lg font-semibold text-on-surface">{r.title}</h3>
                        <div className="mb-3 flex items-center gap-3 font-mono-data text-xs text-outline">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                            {r.confirmationCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {timeAgo(r.createdAt)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/map?report=${r.id}&lat=${r.latitude}&lng=${r.longitude}`)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-label-sm transition-all hover:opacity-85"
                            style={{ backgroundColor: `${Q.secondary}18`, color: Q.secondary }}
                          >
                            <span className="material-symbols-outlined text-[16px]">map</span>
                            Ver en mapa
                          </button>
                          {r.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => setEditId(r.id)}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-label-sm transition-all hover:opacity-85"
                                style={{ backgroundColor: `${Q.primary}18`, color: Q.primary }}
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={deleteMutation.isPending}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-label-sm transition-all hover:opacity-85 disabled:opacity-40"
                                style={{ backgroundColor: `${Q.error}18`, color: Q.error }}
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(myReports?.totalPages ?? 0) > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-lg px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-white/10 disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="font-mono-data text-sm text-outline">
                      Pagina {page} de {myReports?.totalPages ?? 1}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(myReports?.totalPages ?? 1, p + 1))}
                      disabled={page >= (myReports?.totalPages ?? 1)}
                      className="rounded-lg px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-white/10 disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold"
                style={{ backgroundColor: `${Q.primaryContainer}40`, color: Q.primary, border: `1px solid ${Q.primaryContainer}55` }}
              >
                {displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-display text-body-lg font-semibold text-on-surface">
                  {displayName || 'Sin nombre'}
                </p>
                <p className="font-mono-data text-sm text-outline">{user?.email}</p>
              </div>
            </div>

            {profileError && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: `${Q.errorContainer}40`, color: Q.error }}>
                {profileError}
              </div>
            )}
            {profileSaved && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: `${Q.success}18`, color: Q.success }}>
                Perfil actualizado
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Nombre</label>
              <input
                type="text"
                value={displayName}
                maxLength={100}
                onChange={(e) => { setDisplayName(e.target.value); setProfileDirty(true); }}
                placeholder="Como quieres que te llamen"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Bio</label>
              <textarea
                value={bio}
                rows={3}
                maxLength={300}
                onChange={(e) => { setBio(e.target.value); setProfileDirty(true); }}
                placeholder="Cuentanos algo sobre ti..."
                className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Telefono</label>
              <input
                type="tel"
                value={phone}
                maxLength={30}
                onChange={(e) => { setPhone(e.target.value); setProfileDirty(true); }}
                placeholder="Opcional"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
                style={inputStyle}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!profileDirty || updateProfile.isPending}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: Q.tertiary }}
              >
                {updateProfile.isPending ? 'Guardando...' : 'Guardar perfil'}
              </button>
            </div>
          </form>
        )}
      </main>

      {editId && <EditReportLauncher reportId={editId} onClose={() => setEditId(null)} />}
    </div>
  );
}