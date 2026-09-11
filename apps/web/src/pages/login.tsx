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
      setError(err instanceof Error ? err.message : 'Credenciales invalidas');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: `${Q.surface}CC`,
    borderColor: 'rgba(255,255,255,0.1)',
    color: Q.onSurface,
    ['--tw-ring-color' as string]: `${Q.secondary}55`,
  };

  return (
    <div className="flex min-h-dvh" style={{ backgroundColor: Q.bg }}>
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(${Q.secondary}30 1px, transparent 1px), linear-gradient(90deg, ${Q.secondary}30 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
          }}
        />
        <div
          className="absolute -left-32 top-1/4 h-96 w-96 rounded-full blur-3xl"
          style={{ background: `${Q.secondary}12` }}
        />
        <div className="relative z-10 max-w-md px-12 text-center">
          <span
            className="material-symbols-outlined mx-auto mb-6 flex h-16 w-16 items-center justify-center !text-[40px] text-secondary pulse-glow rounded-2xl"
            style={{ fontVariationSettings: "'FILL' 1", background: `${Q.secondary}14`, border: `1px solid ${Q.secondary}33` }}
          >
            radar
          </span>
          <h2 className="font-display text-headline-lg font-bold text-on-surface">Radar Quito</h2>
          <p className="mt-3 text-body-md leading-relaxed text-on-surface-variant">
            El pulso de tu ciudad en tiempo real. Reporta, valida y transforma Quito.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { v: '12K+', l: 'Reportes' },
              { v: '8.5K', l: 'Ciudadanos' },
              { v: '94%', l: 'Resolucion' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-mono-data text-2xl font-medium" style={{ color: Q.secondary }}>{s.v}</p>
                <p className="mt-1 text-label-sm uppercase tracking-wider text-outline">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="glass-card w-full max-w-md rounded-2xl p-6 sm:p-10">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-label-md transition-colors hover:text-secondary" style={{ color: Q.outline }}>
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver al inicio
          </Link>

          <h2 className="font-display text-headline-lg font-bold text-on-surface">Bienvenido de vuelta</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm font-medium"
                style={{ backgroundColor: `${Q.errorContainer}40`, color: Q.error, border: `1px solid ${Q.error}33` }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-label-md text-on-surface">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-body-md outline-none transition-all focus:ring-2"
                style={inputStyle}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-label-md text-on-surface">Contrasena</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-body-md outline-none transition-all focus:ring-2"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full rounded-xl py-3.5 text-label-md text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Ingresando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Iniciar Sesion
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-body-md text-on-surface-variant">
            No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-secondary transition-colors hover:text-secondary-fixed">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
