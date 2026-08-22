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

const STATUS_MAP: Record<string, { label: string; bg: string; fg: string }> = {
  PENDING: { label: 'Pendiente', bg: `${Q.gold}20`, fg: Q.gold },
  IN_REVIEW: { label: 'En revisión', bg: `${Q.sage}20`, fg: Q.sage },
  APPROVED: { label: 'Aprobado', bg: `${Q.success}20`, fg: Q.success },
  REJECTED: { label: 'Rechazado', bg: `${Q.error}20`, fg: Q.error },
  RESOLVED: { label: 'Resuelto', bg: `${Q.warmGray}20`, fg: Q.warmGray },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Baja', color: Q.warmGray },
  MEDIUM: { label: 'Media', color: Q.gold },
  HIGH: { label: 'Alta', color: Q.terracotta },
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
      <div className="absolute right-0 top-0 z-20 flex h-full w-96 items-center justify-center" style={{ backgroundColor: Q.charcoal }}>
        <div className="text-sm" style={{ color: Q.warmGray }}>Cargando...</div>
      </div>
    );
  }

  if (!report) return null;

  const status = STATUS_MAP[report.status] ?? { label: report.status, bg: `${Q.warmGray}20`, fg: Q.warmGray };
  const priority = PRIORITY_MAP[report.priority] ?? { label: report.priority, color: Q.warmGray };

  return (
    <div className="absolute right-0 top-0 z-20 flex h-full w-96 flex-col" style={{ backgroundColor: Q.charcoal }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: `${Q.white}10` }}>
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: report.categoryColor }} />
          <span className="text-sm font-semibold" style={{ color: report.categoryColor }}>
            {report.categoryLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
        >
          <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <h2 className="mb-3 text-lg font-bold text-white">{report.title}</h2>

        <div className="mb-4 flex items-center gap-2">
          <span
            className="inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: status.bg, color: status.fg }}
          >
            {status.label}
          </span>
          <span className="text-xs font-medium" style={{ color: priority.color }}>
            Prioridad {priority.label}
          </span>
        </div>

        {report.address && (
          <p className="mb-3 flex items-center gap-1.5 text-sm" style={{ color: Q.warmGray }}>
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {report.address}
          </p>
        )}

        <p className="mb-5 text-sm leading-relaxed" style={{ color: Q.stoneDark }}>
          {report.description}
        </p>

        {/* Images */}
        {report.images.length > 0 && (
          <div className="mb-5">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: Q.warmGray }}>Fotografías</h4>
            <div className="grid grid-cols-2 gap-2">
              {report.images.map((img) => (
                <img
                  key={img.id}
                  src={img.thumbnailUrl || img.url}
                  alt={img.filename}
                  className="h-24 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="mb-5 flex items-center gap-4 text-xs" style={{ color: Q.warmGray }}>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeAgo(report.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {report.viewCount}
          </span>
        </div>

        {/* Confirm button */}
        <button
          onClick={() => { if (user) confirmMutation.mutate(reportId); }}
          disabled={!user || confirmMutation.isPending}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40"
          style={{ borderColor: `${Q.sage}60`, color: Q.sage }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.228.22.442.403.618a.75.75 0 00.597.133H17.46a.75.75 0 00.597-.133" />
          </svg>
          Confirmar ({report.confirmationCount})
        </button>

        {/* Comments */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: Q.warmGray }}>
            Comentarios ({report.comments.length})
          </h4>
          <div className="space-y-3">
            {report.comments.map((c) => (
              <div key={c.id} className="rounded-xl p-3" style={{ backgroundColor: `${Q.white}08` }}>
                <p className="text-sm" style={{ color: Q.stoneDark }}>{c.content}</p>
                <p className="mt-1.5 text-xs" style={{ color: `${Q.warmGray}99` }}>{timeAgo(c.createdAt)}</p>
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
            }} className="mt-3 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Agregar comentario..."
                className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-all focus:ring-2"
                style={{
                  borderColor: `${Q.white}15`,
                  backgroundColor: `${Q.white}08`,
                  color: 'white',
                  ['--tw-ring-color' as string]: `${Q.terracotta}40`,
                }}
              />
              <button
                type="submit"
                disabled={!comment.trim() || commentMutation.isPending}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: Q.terracotta }}
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
