import { PROJECTS } from '../../data/projects';
import PageShell, { useTheme, themeColors } from './PageShell';

function ProjectsList() {
  const { dark } = useTheme();
  const t = themeColors(dark);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <header style={{ marginBottom: 40 }}>
        <p
          className="td-mono"
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: t.accent,
          }}
        >
          archive
        </p>
        <h2
          className="td-display"
          style={{
            margin: '10px 0 0',
            fontSize: 'clamp(32px, 5vw, 48px)',
            color: t.textStrong,
            textTransform: 'lowercase',
          }}
        >
          projects
        </h2>
        <p style={{ margin: '12px 0 0', color: t.text, maxWidth: 480, lineHeight: 1.55 }}>
          everything shipped or in motion — featured builds first, then the rest.
        </p>
      </header>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {PROJECTS.map((project, i) => {
          const href = project.demo || project.href;
          const external = href.startsWith('http');
          return (
            <li key={project.id}>
              <a
                href={href}
                target={external || project.demoNewTab ? '_blank' : undefined}
                rel={external || project.demoNewTab ? 'noopener noreferrer' : undefined}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(120px, 0.6fr)',
                  gap: 24,
                  alignItems: 'center',
                  padding: '28px 0',
                  borderTop: `1px solid ${t.border}`,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                className="td-project-row"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                    <span className="td-mono" style={{ fontSize: 11, color: t.textMuted }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className="td-display"
                      style={{
                        margin: 0,
                        fontSize: 'clamp(22px, 3vw, 28px)',
                        color: t.textStrong,
                        textTransform: 'lowercase',
                        fontWeight: 700,
                      }}
                    >
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span
                        className="td-mono"
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: t.accent,
                          border: `1px solid ${t.accentMuted}`,
                          padding: '2px 8px',
                        }}
                      >
                        featured
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '10px 0 0', color: t.text, fontSize: 15, lineHeight: 1.5, maxWidth: 520 }}>
                    {project.desc}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {project.tech.map((tag) => (
                      <span
                        key={tag}
                        className="td-mono"
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: t.textMuted,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    aspectRatio: '16 / 10',
                    overflow: 'hidden',
                    border: `1px solid ${t.border}`,
                    background: t.cardBg,
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
                      filter: dark ? 'saturate(0.92)' : 'none',
                    }}
                  />
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      <style>{`
        .td-project-row:hover h3 {
          color: var(--td-signal) !important;
        }
        @media (max-width: 640px) {
          .td-project-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <PageShell activePage="projects">
      <ProjectsList />
    </PageShell>
  );
}
