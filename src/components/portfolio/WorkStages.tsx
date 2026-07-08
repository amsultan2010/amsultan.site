import { useEffect, useRef, useState } from 'react';
import { FEATURED_PROJECTS, type Project } from '../../data/projects';
import { useTheme, themeColors } from './PageShell';

function Stage({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // 0 when section enters bottom, 1 when leaving top
        const raw = 1 - (rect.top + rect.height * 0.35) / (vh + rect.height * 0.35);
        setProgress(Math.min(1, Math.max(0, raw)));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const href = project.demo || project.href;
  const external = href.startsWith('http');
  const shift = (progress - 0.5) * 40;

  return (
    <article
      ref={ref}
      id={index === 0 ? undefined : undefined}
      style={{
        minHeight: '100svh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
        gap: 'clamp(24px, 4vw, 56px)',
        alignItems: 'center',
        padding: 'clamp(48px, 8vh, 96px) var(--td-gutter)',
        borderTop: `1px solid ${t.border}`,
      }}
      className="td-stage"
    >
      <div>
        <p
          className="td-mono"
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: '0.12em',
            color: t.accent,
            textTransform: 'uppercase',
          }}
        >
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
        <h3
          className="td-display"
          style={{
            margin: '12px 0 0',
            fontSize: 'clamp(32px, 5vw, 56px)',
            color: t.textStrong,
            textTransform: 'lowercase',
          }}
        >
          {project.title}
        </h3>
        <p style={{ margin: '16px 0 0', fontSize: 17, lineHeight: 1.55, color: t.text, maxWidth: 420 }}>
          {project.desc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
          {project.tech.map((tag) => (
            <span
              key={tag}
              className="td-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: t.textMuted,
                border: `1px solid ${t.border}`,
                padding: '4px 10px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <a
            href={href}
            target={external || project.demoNewTab ? '_blank' : undefined}
            rel={external || project.demoNewTab ? 'noopener noreferrer' : undefined}
            className="td-btn td-btn-primary"
          >
            open project
          </a>
        </div>
      </div>

      <a
        href={href}
        target={external || project.demoNewTab ? '_blank' : undefined}
        rel={external || project.demoNewTab ? 'noopener noreferrer' : undefined}
        style={{
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${t.border}`,
          background: t.cardBg,
          aspectRatio: '16 / 10',
          textDecoration: 'none',
          transform: `translate3d(0, ${shift * -0.4}px, 0) scale(${0.96 + progress * 0.04})`,
          transition: 'transform 0.05s linear',
        }}
      >
        <img
          src={project.cover}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: `scale(${1.05 + progress * 0.08}) translateX(${shift * 0.3}px)`,
            filter: dark ? 'saturate(0.9) contrast(1.05)' : 'none',
          }}
        />
        {/* Progress scrub bar */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: 3,
            width: `${progress * 100}%`,
            background: t.accent,
          }}
        />
      </a>

      <style>{`
        @media (max-width: 860px) {
          .td-stage {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .td-stage a,
          .td-stage img {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </article>
  );
}

export default function WorkStages() {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const projects = FEATURED_PROJECTS;

  return (
    <section id="work" aria-label="Work">
      <div
        style={{
          padding: '64px var(--td-gutter) 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <h2
          className="td-display"
          style={{
            margin: 0,
            fontSize: 'clamp(28px, 4vw, 40px)',
            color: t.textStrong,
            textTransform: 'lowercase',
          }}
        >
          work
        </h2>
        <a
          href="/projects"
          className="td-mono"
          style={{
            color: t.textMuted,
            textDecoration: 'none',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          full archive →
        </a>
      </div>
      {projects.map((p, i) => (
        <Stage key={p.id} project={p} index={i} total={projects.length} />
      ))}
    </section>
  );
}
