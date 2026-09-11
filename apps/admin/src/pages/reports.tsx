import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';
import { useAuth } from '../contexts/auth-context';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  confirmationCount: number;
  createdAt: string;
  categoryLabel: string;
  categoryColor: string;
  creatorEmail: string;
}

interface ReportsResponse {
  items: ReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: 'APPROVED', label: 'Aprobar', color: 'bg-green-600' },
  { value: 'REJECTED', label: 'Rechazar', color: 'bg-red-600' },
  { value: 'IN_REVIEW', label: 'En revisión', color: 'bg-blue-600' },
];

const APPROVED_STATUS_OPTIONS = [
  { value: 'IN_REVIEW', label: 'Mover a revisión', color: 'bg-blue-600' },
  { value: 'RESOLVED', label: 'Marcar resuelto', color: 'bg-gray-600' },
  { value: 'REJECTED', label: 'Rechazar', color: 'bg-red-600' },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-gray-100 text-gray-800',
};

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baja', color: '#6b7280' },
  { value: 'MEDIUM', label: 'Media', color: '#ca8a04' },
  { value: 'HIGH', label: 'Alta', color: '#ea580c' },
  { value: 'URGENT', label: 'Urgente', color: '#dc2626' },
];

const priorityColor = (priority: string) =>
  PRIORITY_OPTIONS.find((o) => o.value === priority)?.color ?? '#6b7280';

type Tab = 'pending' | 'approved';

export function ReportsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('pending');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<ReportsResponse>({
    queryKey: ['admin-reports', tab, page],
    queryFn: () =>
      tab === 'pending'
        ? apiRequest(`/admin/reports/pending?page=${page}&limit=20`)
        : apiRequest(`/admin/reports?status=APPROVED&page=${page}&limit=20`),
  });

  const statusMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
      apiRequest(`/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, moderatorId: user?.id }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const priorityMutation = useMutation({
    mutationFn: ({ reportId, priority }: { reportId: string; priority: string }) =>
      apiRequest(`/admin/reports/${reportId}/priority`, {
        method: 'PATCH',
        body: JSON.stringify({ priority, moderatorId: user?.id }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const statusOptions = tab === 'pending' ? STATUS_OPTIONS : APPROVED_STATUS_OPTIONS;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Moderación de Reportes
          {data && (
            <span className="ml-2 text-base font-normal text-gray-500">
              ({data.total} {tab === 'pending' ? 'pendientes' : 'aprobados'})
            </span>
          )}
        </h2>

        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => {
              setTab('pending');
              setPage(1);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              tab === 'pending' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => {
              setTab('approved');
              setPage(1);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              tab === 'approved' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aprobados
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Cargando...</div>
      ) : data?.items.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <div className="mb-2 text-4xl">✅</div>
          <p className="text-gray-500">
            {tab === 'pending'
              ? 'No hay reportes pendientes por revisar'
              : 'No hay reportes aprobados'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items.map((report) => (
            <div key={report.id} className="rounded-lg bg-white p-5 shadow">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: report.categoryColor }}
                    >
                      {report.categoryLabel}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[report.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span>📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                <span>👤 {report.creatorEmail}</span>
                <span>👍 {report.confirmationCount} confirmaciones</span>
                <span>📅 {new Date(report.createdAt).toLocaleDateString('es-EC')}</span>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <label className="text-xs font-medium text-gray-500">Prioridad:</label>
                <select
                  value={report.priority}
                  disabled={priorityMutation.isPending}
                  onChange={(e) =>
                    priorityMutation.mutate({ reportId: report.id, priority: e.target.value })
                  }
                  className="rounded border px-3 py-1.5 text-sm font-medium outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  style={{ color: priorityColor(report.priority), borderColor: '#d1d5db' }}
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} style={{ color: opt.color }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {priorityMutation.error && (
                  <span className="text-xs text-red-600">Error al actualizar prioridad</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      statusMutation.mutate({ reportId: report.id, status: opt.value })
                    }
                    disabled={statusMutation.isPending}
                    className={`rounded px-4 py-2 text-sm font-medium text-white transition ${
                      opt.color
                    } hover:opacity-90 disabled:opacity-50`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow">
              <span className="text-sm text-gray-500">
                Página {data.page} de {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}