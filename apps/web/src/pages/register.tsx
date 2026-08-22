import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { Q } from '../lib/colors';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, displayName || undefined);
      navigate('/map');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    borderColor: Q.stone,
    backgroundColor: Q.white,
    color: Q.charcoal,
    ['--tw-ring-color' as string]: `${Q.sage}40`,
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: Q.offWhite }}>
      {/* Left panel — branding */}
      <div className="hidden w-1/2 items-center justify-center lg:flex" style={{ backgroundColor: Q.charcoal }}>
        <div className="max-w-md px-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl font-bold text-2xl text-white" style={{ backgroundColor: Q.sage }}>
            R
          </div>
          <h2 className="text-3xl font-bold text-white">Únete a Radar Quito</h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: Q.warmGray }}>
            Crea tu cuenta y comienza a reportar incidentes en tu ciudad. Es gratis y toma menos de un minuto.
          </p>
          <div className="mt-10 flex flex-col gap-4 text-left">
            {[
              'Reporta incidentes en tiempo real',
              'Colabora con tu comunidad',
              'Recibe notificaciones importantes',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${Q.sage}30` }}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke={Q.sage} viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm" style={{ color: Q.stoneDark }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-10 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg text-white" style={{ backgroundColor: Q.sage }}>R</div>
            <h1 className="text-2xl font-bold" style={{ color: Q.charcoal }}>Radar Quito</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold" style={{ color: Q.charcoal }}>Crear cuenta</h2>
            <p className="mt-2 text-sm" style={{ color: Q.warmGray }}>Completa los datos para comenzar a reportar</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: Q.errorLight, color: Q.error }}>
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: Q.charcoal }}>Nombre</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={inputStyle}
                placeholder="Tu nombre (opcional)"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: Q.charcoal }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={inputStyle}
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
                style={inputStyle}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: Q.charcoal }}>Confirmar contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={inputStyle}
                placeholder="Repite tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-95 disabled:opacity-50"
              style={{ backgroundColor: Q.sage }}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Creando cuenta...
                </span>
              ) : 'Crear Cuenta'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: Q.warmGray }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold transition-colors hover:opacity-80" style={{ color: Q.terracotta }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
