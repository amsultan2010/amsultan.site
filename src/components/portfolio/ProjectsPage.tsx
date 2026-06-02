import { useState } from 'react';
import PageShell, { useTheme, themeColors } from './PageShell';

const PROJECTS = [
  {
    title: 'abdullahOS',
    cover: '/readme/portfolio-desktop.jpg',
    repo: '/desktop',
    demo: '/desktop',
    demoNewTab: true,
    desc: 'desktop-style personal portfolio built w/ astro, react, and a macos-inspired ui.',
    tech: ['Astro', 'React', 'TypeScript'],
  },
  {
    title: 'tutoringbyabdullah',
    cover: '/images/projects/tutoringpreview.png',
    repo: 'https://tutoringbyabdullah.xyz',
    desc: 'tutoring platform focused on teaching style, recommendations, and real understanding.',
    tech: ['Education', 'Product', 'Website'],
  },
  {
    title: 'quantbacktesterpy',
    cover: '/images/projects/quantbacktesterpy.png',
    repo: 'https://github.com/amsultan2010',
    desc: 'single-stock sma crossover backtester w/ parameter heatmaps.',
    tech: ['Python', 'Pandas', 'Backtesting'],
  },
  {
    title: 'quantportfoliopy',
    cover: '/images/projects/quantportfoliopy.png',
    repo: 'https://github.com/amsultan2010',
    desc: 'multi-asset risk parity portfolio backtester.',
    tech: ['Python', 'Finance', 'Research'],
  },
  {
    title: 'quantoptionspy',
    cover: '/images/projects/quantoptionspy.png',
    repo: 'https://github.com/amsultan2010',
    desc: 'black-scholes + monte carlo options pricer w/ greeks.',
    tech: ['Python', 'Options', 'Monte Carlo'],
  },
];

function ProjectCard({ project, dark }: { project: typeof PROJECTS[number]; dark: boolean }) {
  const [hovered, setHovered] = useState(false);
  const t = themeColors(dark);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${t.border}`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      {/* Cover image */}
      <a href={(project as any).demo || project.repo} target={((project as any).demoNewTab || (project as any).demo?.startsWith('http') || !(project as any).demo) ? '_blank' : undefined} rel="noopener noreferrer" style={{ display: 'block', overflow: 'hidden' }}>
        <img
          src={project.cover}
          alt={project.title}
          style={{
            width: '100%',
            height: hovered ? 275 : 250,
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            transition: 'height 0.5s ease',
            ...((project as any).coverStyle || {}),
          }}
        />
      </a>

      {/* Content */}
      <div style={{ padding: '20px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <a
            href={(project as any).demo || project.repo}
            target={((project as any).demoNewTab || (project as any).demo?.startsWith('http') || !(project as any).demo) ? '_blank' : undefined}
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: t.textStrong, transition: 'color 0.2s' }}
          >
            <h3 style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              fontFamily: "'NeueMontreal-Medium', -apple-system, sans-serif",
            }}>
              {project.title}
            </h3>
          </a>
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} GitHub`}
              style={{ color: t.text, transition: 'color 0.2s', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
              onMouseEnter={e => (e.currentTarget.style.color = t.textStrong)}
              onMouseLeave={e => (e.currentTarget.style.color = t.text)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            {(project as any).demo && (
              <a
                href={(project as any).demo}
                target={((project as any).demoNewTab || (project as any).demo?.startsWith('http')) ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label={`${project.title} Demo`}
                style={{ color: t.text, transition: 'color 0.2s', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
                onMouseEnter={e => (e.currentTarget.style.color = t.textStrong)}
                onMouseLeave={e => (e.currentTarget.style.color = t.text)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <p style={{
          margin: 0,
          fontSize: 15,
          lineHeight: 1.6,
          color: t.text,
        }}>
          {project.desc}
        </p>
      </div>
    </div>
  );
}

function ProjectsContent() {
  const { dark } = useTheme();
  const t = themeColors(dark);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
      {PROJECTS.map(p => (
        <ProjectCard key={p.title} project={p} dark={dark} />
      ))}

      <p style={{ fontSize: 14, color: t.text, marginTop: 8, lineHeight: 1.6 }}>
        i am most interested in vertical ai for automation, enterprise software, robotics, productivity, and education.
        long term, i want to help build a yc-funded startup that actually does something meaningful.
      </p>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <PageShell activePage="projects">
      <ProjectsContent />
    </PageShell>
  );
}
