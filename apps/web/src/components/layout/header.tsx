import { useAuth } from '../../contexts/auth-context';
import { Link } from 'react-router-dom';

export function Header({ onReportClick }: { onReportClick?: () => void }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          R
        </div>
        <span className="text-lg font-bold text-gray-900">Radar Quito</span>
      </Link>

      <div className="flex items-center gap-3">
        {onReportClick && (
          <button
            onClick={onReportClick}
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600 hover:shadow-md"
          >
            + Reportar
          </button>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Salir
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
