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
      setError('Las contrasenas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
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
    backgroundColor: `${Q.surface}CC`,
    borderColor: 'rgba(255,255,255,0.1)',
    color: Q.onSurface,
    ['--tw-ring-color' as string]: `${Q.tertiary}55`,
  };

  return (
    <div className="flex min-h-dvh" style={{ backgroundColor: Q.bg }}>
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(${Q.tertiary}30 1px, transparent 1px), linear-gradient(90deg, ${Q.tertiary}30 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
          }}
        />
        <div
          className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full blur-3xl"
          style={{ background: `${Q.tertiary}12` }}
        />
        <div className="relative z-10 max-w-md px-12 text-center">
          <span
            className="material-symbols-outlined mx-auto mb-6 flex h-16 w-16 items-center justify-center !text-[40px] text-tertiary rounded-2xl"
            style={{ fontVariationSettings: "'FILL' 1", background: `${Q.tertiary}14`, border: `1px solid ${Q.tertiary}33` }}
          >
            group_add
          </span>
          <h2 className="font-display text-headline-lg font-bold text-on-surface">Unete a Radar Quito</h2>
          <p className="mt-3 text-body-md leading-relaxed text-on-surface-variant">
            Crea tu cuenta y empieza a reportar incidentes en tu ciudad. Gratis y en menos de un minuto.
          </p>
          <div className="mt-10 flex flex-col gap-4 text-left">
            {[
              { icon: 'edit_location_alt', text: 'Reporta incidentes en tiempo real' },
              { icon: 'groups', text: 'Colabora con tu comunidad' },
              { icon: 'notifications_active', text: 'Recibe notificaciones importantes' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${Q.tertiary}18`, border: `1px solid ${Q.tertiary}33` }}
                >
                  <span
                    className="material-symbols-outlined text-[20px] text-tertiary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <span className="text-body-md" style={{ color: Q.onSurfaceVariant }}>{item.text}</span>
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

          <h2 className="font-display text-headline-lg font-bold text-on-surface">Crear cuenta</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">Completa los datos para empezar a reportar</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm font-medium"
                style={{ backgroundColor: `${Q.errorContainer}40`, color: Q.error, border: `1px solid ${Q.error}33` }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-label-md text-on-surface">Nombre</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-body-md outline-none transition-all focus:ring-2"
                style={inputStyle}
                placeholder="Tu nombre (opcional)"
              />
            </div>

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
                placeholder="Minimo 8 caracteres"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-label-md text-on-surface">Confirmar contrasena</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-body-md outline-none transition-all focus:ring-2"
                style={inputStyle}
                placeholder="Repite tu contrasena"
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
                  Creando cuenta...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Crear Cuenta
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-body-md text-on-surface-variant">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-secondary transition-colors hover:text-secondary-fixed">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
