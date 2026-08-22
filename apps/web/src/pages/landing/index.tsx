import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { QUITO_COLORS, features, stats, steps } from './data';
import { Icon } from './icon';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

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
      // Hero entrance
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
        .from('.hero-title', { y: 40, opacity: 0, duration: 0.8 }, '-=0.3')
        .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.5 }, '-=0.4')
        .from('.hero-visual', { y: 60, opacity: 0, scale: 0.95, duration: 1 }, '-=0.3');

      // Scroll-triggered animations with fromTo to guarantee visibility
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, delay: i * 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.stat-item').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, delay: i * 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.step-card').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, delay: i * 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          },
        );
      });

      gsap.fromTo('.cta-block',
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
    <div className="min-h-screen" style={{ backgroundColor: QUITO_COLORS.offWhite }}>
      <Nav />
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: `${QUITO_COLORS.offWhite}E6` }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white" style={{ backgroundColor: QUITO_COLORS.terracotta }}>R</div>
          <span className="text-lg font-semibold" style={{ color: QUITO_COLORS.charcoal }}>Radar Quito</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: QUITO_COLORS.slate }}>Iniciar Sesión</Link>
          <Link to="/register" className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: QUITO_COLORS.terracotta }}>Registrarse</Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(${QUITO_COLORS.terracotta} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
              style={{ backgroundColor: `${QUITO_COLORS.sage}15`, color: QUITO_COLORS.sageDark, border: `1px solid ${QUITO_COLORS.sage}30` }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: QUITO_COLORS.sage }} />
              Plataforma Ciudadana
            </div>

            <h1 className="hero-title text-5xl font-bold leading-tight tracking-tight lg:text-6xl" style={{ color: QUITO_COLORS.charcoal }}>
              Tu voz,{' '}<span style={{ color: QUITO_COLORS.terracotta }}>nuestro radar.</span>
            </h1>

            <p className="hero-subtitle mt-6 max-w-lg text-lg leading-relaxed" style={{ color: QUITO_COLORS.warmGray }}>
              Reporta incidentes, colabora con tu comunidad y transforma Quito en una ciudad más segura y conectada.
            </p>

            <div className="hero-cta mt-8 flex flex-wrap items-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-95"
                style={{ backgroundColor: QUITO_COLORS.terracotta }}>
                Comenzar Ahora <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold transition-all hover:opacity-70"
                style={{ color: QUITO_COLORS.charcoal, border: `1.5px solid ${QUITO_COLORS.stoneDark}` }}>
                Ya tengo cuenta
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[QUITO_COLORS.terracotta, QUITO_COLORS.sage, QUITO_COLORS.gold, QUITO_COLORS.slate].map((color, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-white" style={{ backgroundColor: color }} />
                ))}
              </div>
              <p className="text-xs" style={{ color: QUITO_COLORS.warmGray }}>
                <span className="font-semibold" style={{ color: QUITO_COLORS.charcoal }}>8,500+</span> ciudadanos ya reportan
              </p>
            </div>
          </div>

          <div className="hero-visual hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ border: `1px solid ${QUITO_COLORS.stone}` }}>
              <div className="flex h-80 items-center justify-center" style={{ backgroundColor: '#1a1f2e' }}>
                <div className="text-center">
                  <div className="mb-3 flex justify-center gap-2">
                    {[QUITO_COLORS.terracotta, QUITO_COLORS.sage, QUITO_COLORS.gold, '#E63946', QUITO_COLORS.slate].map((color, i) => (
                      <div key={i} className="h-4 w-4 rounded-full shadow-lg" style={{
                        backgroundColor: color,
                        animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
                      }} />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-white/60">Mapa interactivo de Quito</p>
                  <p className="mt-1 text-xs text-white/30">12,450 reportes activos</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 rounded-xl p-4 shadow-xl" style={{ backgroundColor: QUITO_COLORS.offWhite, border: `1px solid ${QUITO_COLORS.stone}` }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${QUITO_COLORS.sage}20` }}>
                    <svg className="h-5 w-5" fill="none" stroke={QUITO_COLORS.sage} viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: QUITO_COLORS.charcoal }}>Resueltos hoy</p>
                    <p className="text-lg font-bold" style={{ color: QUITO_COLORS.sage }}>47</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 rounded-xl p-3 shadow-xl" style={{ backgroundColor: QUITO_COLORS.offWhite, border: `1px solid ${QUITO_COLORS.stone}` }}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: QUITO_COLORS.terracotta, animation: 'pulse 2s infinite' }} />
                  <span className="text-xs font-medium" style={{ color: QUITO_COLORS.charcoal }}>3 nuevos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: QUITO_COLORS.terracotta }}>Funcionalidades</p>
          <h2 className="text-3xl font-bold lg:text-4xl" style={{ color: QUITO_COLORS.charcoal }}>
            Todo lo que necesitas para <span style={{ color: QUITO_COLORS.sage }}>reportar</span>
          </h2>
        </div>

        <div className="features-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="feature-card group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: 'white', border: `1px solid ${QUITO_COLORS.stone}` }}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${QUITO_COLORS.terracotta}10`, color: QUITO_COLORS.terracotta }}>
                <Icon name={f.icon} />
              </div>
              <h3 className="mb-2 text-base font-semibold" style={{ color: QUITO_COLORS.charcoal }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: QUITO_COLORS.warmGray }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats-section py-20" style={{ backgroundColor: QUITO_COLORS.charcoal }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="stat-item text-center">
              <p className="text-4xl font-bold tracking-tight lg:text-5xl" style={{ color: QUITO_COLORS.gold }}>{s.value}</p>
              <p className="mt-2 text-sm" style={{ color: '#8A8580' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="steps-section py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: QUITO_COLORS.sage }}>Cómo Funciona</p>
          <h2 className="text-3xl font-bold lg:text-4xl" style={{ color: QUITO_COLORS.charcoal }}>
            Cuatro pasos para <span style={{ color: QUITO_COLORS.terracotta }}>hacer la diferencia</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="step-card relative text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: i === 3 ? QUITO_COLORS.terracotta : QUITO_COLORS.sage }}>
                {s.num}
              </div>
              <h3 className="mb-2 text-base font-semibold" style={{ color: QUITO_COLORS.charcoal }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: QUITO_COLORS.warmGray }}>{s.desc}</p>
              {i < 3 && (
                <div className="absolute top-7 left-[60%] hidden h-px w-[80%] md:block" style={{ backgroundColor: QUITO_COLORS.stone }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta-section py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="cta-block overflow-hidden rounded-3xl px-8 py-16 text-center md:px-16"
          style={{ backgroundColor: QUITO_COLORS.charcoal }}>
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            Únete a los ciudadanos que ya están <span style={{ color: QUITO_COLORS.gold }}>transformando Quito</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm" style={{ color: '#8A8580' }}>
            Cada reporte cuenta. Cada confirmación importa. Juntos podemos hacer de Quito una ciudad más segura.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-95"
              style={{ backgroundColor: QUITO_COLORS.terracotta }}>
              Crear Cuenta Gratis <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-80"
              style={{ border: `1.5px solid ${QUITO_COLORS.slate}` }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12" style={{ borderTop: `1px solid ${QUITO_COLORS.stone}` }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs text-white" style={{ backgroundColor: QUITO_COLORS.terracotta }}>R</div>
            <span className="text-sm font-semibold" style={{ color: QUITO_COLORS.charcoal }}>Radar Quito</span>
          </div>
          <p className="text-xs" style={{ color: QUITO_COLORS.warmGray }}>
            &copy; 2026 Radar Quito. Hecho con propósito para la ciudad.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs transition-colors hover:opacity-70" style={{ color: QUITO_COLORS.slate }}>Privacidad</a>
            <a href="#" className="text-xs transition-colors hover:opacity-70" style={{ color: QUITO_COLORS.slate }}>Términos</a>
            <a href="#" className="text-xs transition-colors hover:opacity-70" style={{ color: QUITO_COLORS.slate }}>Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
