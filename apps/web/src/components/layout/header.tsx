import { useAuth } from '../../contexts/auth-context';
import { Link } from 'react-router-dom';
import { Q } from '../../lib/colors';

export function Header({ onReportClick }: { onReportClick?: () => void }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-3 backdrop-blur-md" style={{ backgroundColor: `${Q.charcoal}DD` }}>
      <Link to="/map" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: Q.terracotta }}>
          R
        </div>
        <span className="text-lg font-bold text-white">Radar Quito</span>
      </Link>

      <div className="flex items-center gap-3">
        {onReportClick && (
          <button
            onClick={onReportClick}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
            style={{ backgroundColor: Q.terracotta }}
          >
            + Reportar
          </button>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: Q.sage }}>
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Salir
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: Q.sage }}
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
