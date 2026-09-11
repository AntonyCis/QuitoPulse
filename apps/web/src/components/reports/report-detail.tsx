import { useState } from 'react';
import { useReportDetail, useAddComment } from '../../hooks/use-report-detail';
import { useConfirmReport } from '../../hooks/use-reports';
import { useAuth } from '../../contexts/auth-context';
import { Q } from '../../lib/colors';

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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: Q.warning },
  IN_REVIEW: { label: 'En revision', color: Q.secondary },
  APPROVED: { label: 'Aprobado', color: Q.tertiary },
  REJECTED: { label: 'Rechazado', color: Q.error },
  RESOLVED: { label: 'Resuelto', color: Q.primary },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Baja', color: Q.outline },
  MEDIUM: { label: 'Media', color: Q.secondary },
  HIGH: { label: 'Alta', color: Q.primary },
  URGENT: { label: 'Urgente', color: Q.error },
};

export function ReportDetail({ reportId, onClose }: ReportDetailProps) {
  const { data: report, isLoading } = useReportDetail(reportId);
  const confirmMutation = useConfirmReport();
  const commentMutation = useAddComment();
  const { user } = useAuth();
  const [comment, setComment] = useState('');

  if (isLoading) {
    return (
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex h-[80svh] w-full items-center justify-center rounded-t-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-96 sm:max-w-[420px] sm:rounded-none"
        style={{ backgroundColor: Q.surfaceLowest }}
      >
        <div className="text-body-md text-on-surface-variant">Cargando...</div>
      </div>
    );
  }

  if (!report) return null;

  const status = STATUS_MAP[report.status] ?? { label: report.status, color: Q.outline };
  const priority = PRIORITY_MAP[report.priority] ?? { label: report.priority, color: Q.outline };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex h-[85svh] w-full flex-col rounded-t-2xl border-t sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-96 sm:max-w-[420px] sm:rounded-none sm:border-l" style={{ backgroundColor: Q.surfaceLowest, borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full sm:hidden" style={{ backgroundColor: Q.outlineVariant }} />
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: report.categoryColor, boxShadow: `0 0 10px ${report.categoryColor}88` }}
          />
          <span className="font-mono-data text-mono-data uppercase tracking-wider" style={{ color: report.categoryColor }}>
            {report.categoryLabel}
          </span>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <h2 className="mb-4 font-display text-headline-md font-semibold text-on-surface">{report.title}</h2>

        <div className="mb-4 flex items-center gap-3">
          <span
            className="rounded-lg px-2.5 py-1 font-mono-data text-xs font-medium uppercase tracking-wider"
            style={{
              backgroundColor: `${status.color}1A`,
              color: status.color,
              border: `1px solid ${status.color}44`,
            }}
          >
            {status.label}
          </span>
          <span className="flex items-center gap-1 text-label-sm" style={{ color: priority.color }}>
            <span className="material-symbols-outlined text-[16px]">flag</span>
            Prioridad {priority.label}
          </span>
        </div>

        {report.address && (
          <p className="mb-4 flex items-start gap-2 text-body-md text-on-surface-variant">
            <span className="material-symbols-outlined shrink-0 text-[18px] text-outline">location_on</span>
            {report.address}
          </p>
        )}

        <p className="mb-6 text-body-md leading-relaxed text-on-surface-variant">{report.description}</p>

        {/* Images */}
        {report.images.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2 text-label-sm uppercase tracking-wider text-outline">Fotografias</h4>
            <div className="grid grid-cols-2 gap-2">
              {report.images.map((img) => (
                <img
                  key={img.id}
                  src={img.thumbnailUrl || img.url}
                  alt={img.filename}
                  className="h-24 w-full rounded-xl border border-white/10 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="mb-6 flex items-center gap-4 font-mono-data text-xs text-outline">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            {timeAgo(report.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            {report.viewCount}
          </span>
        </div>

        {/* Confirm button */}
        <button
          onClick={() => { if (user) confirmMutation.mutate(reportId); }}
          disabled={!user || confirmMutation.isPending}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-label-md transition-all hover:opacity-85 disabled:opacity-40"
          style={{
            borderColor: `${Q.tertiary}55`,
            backgroundColor: `${Q.tertiary}14`,
            color: Q.tertiary,
            boxShadow: `0 0 16px ${Q.tertiary}22`,
          }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            thumb_up
          </span>
          Confirmar ({report.confirmationCount})
        </button>

        {/* Comments */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-label-sm uppercase tracking-wider text-outline">
            <span className="material-symbols-outlined text-[16px]">forum</span>
            Comentarios ({report.comments.length})
          </h4>
          <div className="space-y-3">
            {report.comments.map((c) => (
              <div key={c.id} className="rounded-xl p-3" style={{ backgroundColor: `${Q.surface}80`, border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-body-md text-on-surface-variant">{c.content}</p>
                <p className="mt-1.5 font-mono-data text-xs text-outline">{timeAgo(c.createdAt)}</p>
              </div>
            ))}
          </div>

          {user && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              commentMutation.mutate(
                { reportId, content: comment },
                { onSuccess: () => setComment('') },
              );
            }} className="mt-4 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Agregar comentario..."
                className="flex-1 rounded-xl border px-3.5 py-2.5 text-body-md outline-none transition-all focus:ring-2"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  backgroundColor: `${Q.surface}CC`,
                  color: Q.onSurface,
                  ['--tw-ring-color' as string]: `${Q.secondary}55`,
                }}
              />
              <button
                type="submit"
                disabled={!comment.trim() || commentMutation.isPending}
                className="btn-gradient rounded-xl px-4 py-2.5 text-label-md text-white transition-all disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
