import { lazy, Suspense, useEffect, useState } from 'react';
import { useTheme, themeColors } from './PageShell';

const AsciiDesk = lazy(() => import('../effects/AsciiDesk'));

type HeroProps = {
  scrollProgress: number;
};

export default function Hero({ scrollProgress }: HeroProps) {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section
      aria-label="Introduction"
      style={{
        minHeight: '100svh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
        gap: 'clamp(24px, 4vw, 64px)',
        alignItems: 'center',
        padding: 'clamp(32px, 6vh, 72px) var(--td-gutter)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="td-hero"
    >
      {/* Atmosphere — not glass orbs */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: dark
            ? `radial-gradient(ellipse 70% 50% at 80% 40%, rgba(255,77,46,0.14), transparent 55%),
               radial-gradient(ellipse 40% 40% at 10% 80%, rgba(125,255,179,0.06), transparent 50%),
               linear-gradient(180deg, ${t.bg}, ${t.bg})`
            : `radial-gradient(ellipse 70% 50% at 80% 40%, rgba(255,77,46,0.1), transparent 55%),
               linear-gradient(180deg, ${t.bg}, #ebe3d4)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
        <p
          className="td-mono"
          style={{
            margin: '0 0 16px',
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: t.accent,
          }}
        >
          student builder · riyadh
        </p>
        <h1
          className="td-display"
          style={{
            margin: 0,
            fontSize: 'clamp(48px, 9vw, 92px)',
            color: t.textStrong,
            textTransform: 'lowercase',
          }}
        >
          abdullah
          <br />
          sultan
        </h1>
        <p
          style={{
            margin: '20px 0 0',
            fontSize: 'clamp(16px, 2.2vw, 19px)',
            lineHeight: 1.5,
            color: t.text,
            maxWidth: 420,
          }}
        >
          shipping tutoring, f1 media, and agent tools — looking for coffee chats with builders.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          <a href="mailto:abdullahmsultan1@gmail.com" className="td-btn td-btn-primary">
            grab coffee
          </a>
          <a href="#work" className="td-btn td-btn-ghost">
            see work
          </a>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: 320,
          height: 'min(52vh, 480px)',
        }}
      >
        {mounted ? (
          <Suspense
            fallback={
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  border: `1px solid ${t.border}`,
                  background: t.cardBg,
                }}
              />
            }
          >
            <AsciiDesk scrollProgress={scrollProgress} height="100%" />
          </Suspense>
        ) : null}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .td-hero {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
            padding-top: 48px !important;
            padding-bottom: 40px !important;
          }
          .td-hero > div:last-of-type {
            height: 300px !important;
            min-height: 280px !important;
            order: -1;
          }
        }
      `}</style>
    </section>
  );
}
