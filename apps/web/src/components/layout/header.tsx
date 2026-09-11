import { useAuth } from '../../contexts/auth-context';
import { Link } from 'react-router-dom';
import { Q } from '../../lib/colors';

export function Header({ onReportClick }: { onReportClick?: () => void }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header
      className="absolute left-0 right-0 top-0 z-10 flex h-[56px] items-center justify-between border-b px-4 backdrop-blur-xl sm:h-[68px] sm:px-5"
      style={{ backgroundColor: `${Q.bg}D9`, borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <Link to="/map" className="flex shrink-0 items-center gap-2">
        <span
          className="material-symbols-outlined text-[24px] sm:text-[28px] text-secondary pulse-glow rounded-lg p-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          radar
        </span>
        <span className="hidden font-display text-headline-md font-bold tracking-tight text-on-surface sm:inline">
          Radar Quito
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {onReportClick && (
          <button
            onClick={onReportClick}
            className="btn-gradient flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-label-md text-white shadow-lg transition-all hover:shadow-xl sm:px-4 sm:py-2.5"
          >
            <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
            <span className="hidden sm:inline">Reportar</span>
          </button>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              to="/account"
              title="Mi cuenta"
              className="flex items-center gap-2"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs sm:h-8 sm:w-8 sm:text-label-md"
                style={{ backgroundColor: `${Q.primaryContainer}40`, color: Q.primary, border: `1px solid ${Q.primaryContainer}55` }}
              >
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface sm:px-3"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-white/10 hover:text-secondary sm:inline-block"
            >
              Iniciar sesion
            </Link>
            <Link to="/register" className="btn-gradient rounded-lg px-3 py-2 text-label-md text-white shadow-lg sm:px-4">
              <span className="hidden sm:inline">Registrarse</span>
              <span className="material-symbols-outlined text-[18px] sm:hidden">person_add</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
