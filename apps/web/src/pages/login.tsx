import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { Q } from '../lib/colors';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/map');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: Q.offWhite }}>
      {/* Left panel — branding */}
      <div className="hidden w-1/2 items-center justify-center lg:flex" style={{ backgroundColor: Q.charcoal }}>
        <div className="max-w-md px-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl font-bold text-2xl text-white" style={{ backgroundColor: Q.terracotta }}>
            R
          </div>
          <h2 className="text-3xl font-bold text-white">Radar Quito</h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: Q.warmGray }}>
            Tu plataforma ciudadana para reportar incidentes y transformar Quito en una ciudad más segura.
          </p>
          <div className="mt-10 flex justify-center gap-8">
            {[
              { v: '12K+', l: 'Reportes' },
              { v: '8.5K', l: 'Ciudadanos' },
              { v: '94%', l: 'Resolución' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-bold" style={{ color: Q.gold }}>{s.v}</p>
                <p className="mt-1 text-xs" style={{ color: Q.warmGray }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80" style={{ color: Q.warmGray }}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al inicio
          </Link>

          {/* Mobile logo */}
          <div className="mb-10 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg text-white" style={{ backgroundColor: Q.terracotta }}>R</div>
            <h1 className="text-2xl font-bold" style={{ color: Q.charcoal }}>Radar Quito</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold" style={{ color: Q.charcoal }}>Bienvenido de vuelta</h2>
            <p className="mt-2 text-sm" style={{ color: Q.warmGray }}>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: Q.errorLight, color: Q.error }}>
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: Q.charcoal }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={{ borderColor: Q.stone, backgroundColor: Q.white, color: Q.charcoal, ['--tw-ring-color' as string]: `${Q.terracotta}40` }}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: Q.charcoal }}>Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={{ borderColor: Q.stone, backgroundColor: Q.white, color: Q.charcoal, ['--tw-ring-color' as string]: `${Q.terracotta}40` }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-95 disabled:opacity-50"
              style={{ backgroundColor: Q.terracotta }}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Ingresando...
                </span>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: Q.warmGray }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold transition-colors hover:opacity-80" style={{ color: Q.terracotta }}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
