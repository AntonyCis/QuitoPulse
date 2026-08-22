import { useState } from 'react';
import { useReportDetail, useAddComment } from '../../hooks/use-report-detail';
import { useConfirmReport } from '../../hooks/use-reports';
import { useAuth } from '../../contexts/auth-context';

interface ReportDetailProps {
  reportId: string;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'hace un momento';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
  return `hace ${Math.floor(seconds / 86400)}d`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  IN_REVIEW: { label: 'En revisión', color: 'bg-blue-100 text-blue-800' },
  APPROVED: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  RESOLVED: { label: 'Resuelto', color: 'bg-gray-100 text-gray-800' },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Baja', color: 'text-gray-500' },
  MEDIUM: { label: 'Media', color: 'text-yellow-600' },
  HIGH: { label: 'Alta', color: 'text-orange-600' },
  URGENT: { label: 'Urgente', color: 'text-red-600' },
};

export function ReportDetail({ reportId, onClose }: ReportDetailProps) {
  const { data: report, isLoading } = useReportDetail(reportId);
  const confirmMutation = useConfirmReport();
  const commentMutation = useAddComment();
  const { user } = useAuth();
  const [comment, setComment] = useState('');

  if (isLoading) {
    return (
      <div className="absolute right-0 top-0 z-20 h-full w-96 bg-white shadow-xl">
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const status = STATUS_LABELS[report.status] ?? { label: report.status, color: 'bg-gray-100 text-gray-800' };
  const priority = PRIORITY_LABELS[report.priority] ?? { label: report.priority, color: 'text-gray-600' };

  const handleConfirm = () => {
    if (!user) return;
    confirmMutation.mutate(reportId);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    commentMutation.mutate(
      { reportId, content: comment },
      { onSuccess: () => setComment('') },
    );
  };

  return (
    <div className="absolute right-0 top-0 z-20 flex h-full w-96 flex-col bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: report.categoryColor }}
          />
          <span className="text-sm font-medium" style={{ color: report.categoryColor }}>
            {report.categoryLabel}
          </span>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-2 text-lg font-bold text-gray-900">{report.title}</h2>

        <div className="mb-3 flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <span className={`text-xs font-medium ${priority.color}`}>
            Prioridad: {priority.label}
          </span>
        </div>

        {report.address && (
          <p className="mb-3 text-sm text-gray-600">
            📍 {report.address}
          </p>
        )}

        <p className="mb-4 text-sm text-gray-700 leading-relaxed">
          {report.description}
        </p>

        {/* Images */}
        {report.images.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Fotografías</h4>
            <div className="grid grid-cols-2 gap-2">
              {report.images.map((img) => (
                <img
                  key={img.id}
                  src={img.thumbnailUrl || img.url}
                  alt={img.filename}
                  className="h-24 w-full rounded object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
          <span>Reportado {timeAgo(report.createdAt)}</span>
          <span>👁 {report.viewCount}</span>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!user || confirmMutation.isPending}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-green-500 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-50 disabled:opacity-50"
        >
          👍 Confirmar ({report.confirmationCount})
        </button>

        {/* Comments */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Comentarios ({report.comments.length})
          </h4>
          <div className="space-y-3">
            {report.comments.map((c) => (
              <div key={c.id} className="rounded bg-gray-50 p-3">
                <p className="text-sm text-gray-700">{c.content}</p>
                <p className="mt-1 text-xs text-gray-400">{timeAgo(c.createdAt)}</p>
              </div>
            ))}
          </div>

          {/* Add comment */}
          {user && (
            <form onSubmit={handleComment} className="mt-3 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Agregar comentario..."
                className="flex-1 rounded border px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={!comment.trim() || commentMutation.isPending}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
