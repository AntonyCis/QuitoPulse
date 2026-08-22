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

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600',
};

export function ReportsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<ReportsResponse>({
    queryKey: ['admin-reports-pending', page],
    queryFn: () =>
      apiRequest(`/admin/reports/pending?page=${page}&limit=20`),
  });

  const statusMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
      apiRequest(`/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, moderatorId: user?.id }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports-pending'] }),
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Cola de Moderación
          {data && (
            <span className="ml-2 text-base font-normal text-gray-500">
              ({data.total} pendientes)
            </span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Cargando...</div>
      ) : data?.items.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <div className="mb-2 text-4xl">✅</div>
          <p className="text-gray-500">No hay reportes pendientes por revisar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items.map((report) => (
            <div key={report.id} className="rounded-lg bg-white p-5 shadow">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: report.categoryColor }}
                    >
                      {report.categoryLabel}
                    </span>
                    <span className={`text-xs font-medium ${PRIORITY_COLORS[report.priority]}`}>
                      {report.priority}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                <span>📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                <span>👤 {report.creatorEmail}</span>
                <span>👍 {report.confirmationCount} confirmaciones</span>
                <span>📅 {new Date(report.createdAt).toLocaleDateString('es-EC')}</span>
              </div>

              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
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
