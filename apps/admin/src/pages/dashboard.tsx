import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';

interface Stats {
  users: { total: number; active: number };
  reports: { total: number; byStatus: Record<string, number> };
  pendingFlags: number;
  recentReports: Array<{
    id: string;
    title: string;
    status: string;
    categoryLabel: string;
    categoryColor: string;
    createdAt: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-gray-100 text-gray-800',
};

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => apiRequest('/admin/stats'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    );
  }

  if (!stats) return null;

  const reportStatuses = stats.reports.byStatus;

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-500">Total Usuarios</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">{stats.users.total}</div>
          <div className="mt-1 text-xs text-green-600">{stats.users.active} activos</div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-500">Total Reportes</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">{stats.reports.total}</div>
          <div className="mt-1 text-xs text-yellow-600">
            {reportStatuses.PENDING || 0} pendientes
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-500">Reportes Pendientes</div>
          <div className="mt-1 text-3xl font-bold text-yellow-600">
            {reportStatuses.PENDING || 0}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-500">Reportes por Revisar</div>
          <div className="mt-1 text-3xl font-bold text-orange-600">{stats.pendingFlags}</div>
          <div className="mt-1 text-xs text-gray-500">denuncias activas</div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Reportes por Estado</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.entries(reportStatuses).map(([status, count]) => (
            <div key={status} className="rounded-lg bg-gray-50 p-3 text-center">
              <div className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100'}`}>
                {status}
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent reports */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Reportes Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-2 font-medium">Título</th>
                <th className="pb-2 font-medium">Categoría</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReports.map((report) => (
                <tr key={report.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-900">{report.title}</td>
                  <td className="py-3">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: report.categoryColor }}
                    >
                      {report.categoryLabel}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[report.status] || ''}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString('es-EC')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
