import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/reports', label: 'Reportes', icon: '📋' },
  { to: '/users', label: 'Usuarios', icon: '👥' },
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="border-b border-gray-700 p-4">
          <h1 className="text-lg font-bold">Radar Quito</h1>
          <p className="text-xs text-gray-400">Panel Administrativo</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-700 p-4">
          <div className="mb-2 text-sm text-gray-300">{user?.email}</div>
          <button
            onClick={logout}
            className="w-full rounded bg-gray-800 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
