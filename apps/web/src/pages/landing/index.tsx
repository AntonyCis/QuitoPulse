import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { features, secondaryFeatures, stats, steps } from './data';
import { Q } from '../../lib/colors';

gsap.registerPlugin(ScrollTrigger);

const ACCENTS = {
  secondary: Q.secondary,
  primary: Q.primary,
  tertiary: Q.tertiary,
} as const;

function RadarDecoration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/3 opacity-60 md:h-[620px] md:w-[620px]"
    >
      <circle cx="200" cy="200" r="60" stroke={Q.secondary} strokeOpacity="0.22" />
      <circle cx="200" cy="200" r="110" stroke={Q.secondary} strokeOpacity="0.15" />
      <circle cx="200" cy="200" r="160" stroke={Q.secondary} strokeOpacity="0.09" />
      <circle cx="200" cy="200" r="196" stroke={Q.secondary} strokeOpacity="0.05" />
      <line x1="200" y1="4" x2="200" y2="396" stroke={Q.secondary} strokeOpacity="0.07" />
      <line x1="4" y1="200" x2="396" y2="200" stroke={Q.secondary} strokeOpacity="0.07" />
      <g className="radar-sweep">
        <line x1="200" y1="200" x2="200" y2="42" stroke={Q.secondary} strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
        <circle cx="200" cy="52" r="4" fill={Q.secondary} fillOpacity="0.7" />
      </g>
      <circle cx="200" cy="200" r="80" stroke={Q.secondary} strokeOpacity="0.35" className="radar-ring" />
      <circle cx="200" cy="200" r="80" stroke={Q.primary} strokeOpacity="0.28" className="radar-ring" style={{ animationDelay: '1.5s' }} />
      <circle cx="272" cy="140" r="5" fill={Q.tertiary} fillOpacity="0.9" />
      <circle cx="132" cy="262" r="4" fill={Q.primary} fillOpacity="0.8" />
      <circle cx="248" cy="286" r="3.5" fill={Q.secondaryFixed} fillOpacity="0.8" />
    </svg>
  );
}

function Nav({ scrolled }: { scrolled: boolean }) {
  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-300 ${scrolled ? 'border-white/10 shadow-lg' : 'border-transparent'}`}
      style={{ backgroundColor: `${Q.bg}${scrolled ? 'F2' : 'CC'}` }}
    >
      <div className="mx-auto flex max-w-container-max items-center justify-between px-gutter py-4">
        <Link to="/" className="flex items-center gap-2 tracking-tight">
          <span className="material-symbols-outlined text-[28px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            radar
          </span>
          <span className="font-display text-headline-md font-bold">Radar Quito</span>
        </Link>

        <div className="hidden items-center gap-8 text-label-md md:flex">
          <a href="#features" className="text-on-surface-variant transition-colors duration-300 hover:text-secondary">Funcionalidades</a>
          <a href="#how" className="text-on-surface-variant transition-colors duration-300 hover:text-secondary">Como funciona</a>
          <a href="#stats" className="text-on-surface-variant transition-colors duration-300 hover:text-secondary">Datos</a>
        </div>

        <Link
          to="/login"
          className="flex items-center gap-2 text-label-md text-secondary transition-colors duration-300 hover:text-secondary-fixed"
        >
          Iniciar Sesion
          <span className="material-symbols-outlined text-[20px]">login</span>
        </Link>
      </div>
    </nav>
  );
}

export function LandingPage() {
  const lenisRef = useRef<Lenis | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', ({ scroll }: { scroll: number }) => setScrolled(scroll > 20));

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenis.raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
        .from('.hero-title', { y: 40, opacity: 0, duration: 0.8 }, '-=0.3')
        .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.5 }, '-=0.4')
        .from('.hero-radar', { opacity: 0, scale: 0.85, duration: 1.2 }, '-=0.8');

      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, delay: i * 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.stat-item').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, delay: i * 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.step-card').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, delay: i * 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          },
        );
      });

      gsap.fromTo(
        '.cta-block',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: '.cta-section', start: 'top 90%', toggleActions: 'play none none none' },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex-1" style={{ backgroundColor: Q.bg }}>
      <Nav scrolled={scrolled} />

      <main className="grow pt-24">
        {/* Hero */}
        <section className="relative flex min-h-[82vh] w-full items-center justify-center overflow-hidden px-gutter">
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 opacity-[0.13]"
              style={{
                backgroundImage: `linear-gradient(${Q.secondary}1F 1px, transparent 1px), linear-gradient(90deg, ${Q.secondary}1F 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
              }}
            />
            <div
              className="absolute left-1/2 top-1/3 h-[480px] w-[720px] -translate-x-1/2 -translate-y-1/4 rounded-full blur-3xl pulse-glow"
              style={{ background: `${Q.secondary}12` }}
            />
            <div className="hero-radar absolute inset-0">
              <RadarDecoration />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
          </div>

          <div className="relative z-10 mx-auto mt-10 flex max-w-3xl flex-col items-center gap-6 text-center">
            <div className="glass-card mb-2 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 hero-badge">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-secondary" />
              </span>
              <span className="font-mono-data text-mono-data uppercase tracking-wider text-secondary-fixed">
                Sistema Activo
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-on-surface hero-title sm:text-display-lg md:text-[64px] md:leading-[72px]">
              El Pulso de Quito en{' '}
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                Tiempo Real
              </span>
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-body-lg text-on-surface-variant hero-subtitle">
              Descubre incidencias, eventos y el ritmo de tu zona al instante.
              Navega la ciudad con inteligencia impulsada por datos comunitarios.
            </p>

            <div className="mt-6 flex w-full flex-col gap-4 sm:w-auto sm:flex-row hero-cta">
              <Link
                to="/map"
                className="btn-gradient group flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-label-md text-white shadow-lg transition-all"
                style={{ boxShadow: `0 10px 30px ${Q.primaryContainer}33` }}
              >
                Explorar el Mapa
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
              <a
                href="#features"
                className="glass-card flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-label-md text-on-surface transition-colors hover:bg-white/5"
              >
                Ver Funcionalidades
              </a>
            </div>
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className="relative z-20 mx-auto max-w-container-max px-gutter py-24">
          <div className="mb-14 text-center">
            <p className="mb-3 text-label-sm uppercase tracking-[0.2em] text-secondary">Monitoreo ciudadano</p>
            <h2 className="font-display text-headline-lg text-on-surface">Construido para la ciudad</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`feature-card glass-card group relative flex cursor-pointer flex-col gap-6 overflow-hidden rounded-xl p-8 transition-colors hover:bg-surface-low ${
                  i === 1 ? 'md:translate-y-8' : ''
                }`}
              >
                <div
                  className="absolute -mr-16 -mt-16 right-0 top-0 h-32 w-32 rounded-full blur-3xl transition-opacity group-hover:opacity-100"
                  style={{ background: `${ACCENTS[f.accent]}1A`, opacity: 0.5 }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-surface transition-colors" style={{ borderColor: `${ACCENTS[f.accent]}33` }}>
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ color: ACCENTS[f.accent], fontVariationSettings: "'FILL' 1" }}
                  >
                    {f.icon}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 font-display text-headline-md text-on-surface">{f.title}</h3>
                  <p className="text-body-md text-on-surface-variant">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-12">
            {secondaryFeatures.map((s) => (
              <div key={s.label} className="feature-card flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-tertiary">{s.icon}</span>
                <span className="text-label-md text-on-surface-variant">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="relative z-20 mx-auto max-w-container-max px-gutter pb-24">
          <div className="glass-card-solid grid grid-cols-2 gap-y-10 rounded-2xl px-6 py-10 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="stat-item text-center">
                <p className="font-display text-4xl font-bold text-secondary md:text-5xl">{s.value}</p>
                <p className="mt-2 text-label-sm uppercase tracking-[0.15em] text-outline">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="relative z-20 mx-auto max-w-container-max px-gutter pb-24">
          <div className="mb-14 text-center">
            <p className="mb-3 text-label-sm uppercase tracking-[0.2em] text-secondary">Simple y colaborativo</p>
            <h2 className="font-display text-headline-lg text-on-surface">
              Cuatro pasos para <span className="text-secondary">hacer la diferencia</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.num} className="step-card glass-card relative rounded-xl p-8">
                <span className="font-mono-data text-mono-data text-secondary" style={{ opacity: 0.9 }}>{s.num}</span>
                <h3 className="mb-2 mt-4 font-display font-semibold text-on-surface">{s.title}</h3>
                <p className="text-body-md text-on-surface-variant">{s.desc}</p>
                {i < steps.length - 1 && (
                  <span className="material-symbols-outlined absolute -right-5 top-1/2 hidden -translate-y-1/2 text-outline-variant lg:block">
                    arrow_forward_ios
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section relative z-20 mx-auto max-w-container-max px-gutter pb-28">
          <div className="cta-block relative overflow-hidden rounded-2xl p-8 text-center sm:p-12 md:p-16" style={{ background: `linear-gradient(135deg, ${Q.surfaceLow}, ${Q.surface})`, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ background: `${Q.secondary}14` }} />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full blur-3xl" style={{ background: `${Q.primaryContainer}14` }} />
            <h2 className="font-display text-headline-lg text-on-surface md:text-[36px] md:leading-[44px]">
              Se parte del pulso de tu ciudad
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-on-surface-variant">
              Unete a miles de quiteños que ya estan transformando su ciudad, un reporte a la vez.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register" className="btn-gradient rounded-lg px-8 py-4 text-label-md text-white shadow-lg">
                Crear cuenta gratis
              </Link>
              <Link to="/map" className="glass-card rounded-lg px-8 py-4 text-label-md text-on-surface transition-colors hover:bg-white/5">
                Ver el mapa
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto w-full border-t border-white/5" style={{ backgroundColor: Q.surfaceLowest }}>
        <div className="mx-auto flex w-full max-w-container-max flex-col items-center justify-between gap-8 px-10 py-12 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              radar
            </span>
            <span className="font-display font-bold text-on-surface">Radar Quito</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-label-sm text-on-surface-variant">
            <a href="#features" className="rounded outline-none transition-colors hover:text-primary">Privacidad</a>
            <a href="#features" className="rounded outline-none transition-colors hover:text-primary">Terminos</a>
            <a href="#features" className="rounded outline-none transition-colors hover:text-primary">Contacto</a>
          </div>
          <div className="text-center text-sm text-tertiary md:text-right">
            © 2026 Radar Quito. Monitorizacion en tiempo real.
          </div>
        </div>
      </footer>
    </div>
  );
}
