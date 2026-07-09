import type { Metadata } from 'next';
import { PROJECTS } from '@/data/projects';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProjectsContrast } from './ProjectsContrast';

export const metadata: Metadata = {
  title: 'projects',
  description: 'archive of shipped work: tutoring, f1 media, and quant tools.',
  alternates: { canonical: 'https://abdullahmsultan.me/projects' },
  openGraph: {
    url: 'https://abdullahmsultan.me/projects',
    title: 'projects | abdullah sultan',
    description: 'archive of shipped work: tutoring, f1 media, and quant tools.',
  },
};

export default function ProjectsPage() {
  const total = String(PROJECTS.length).padStart(2, '0');

  return (
    <>
      <div className="site-wrapper" style={{ opacity: 1 }}>
        <SiteHeader />
        <main className="archive">
          <header className="archive__head">
            <div className="archive__head-copy">
              <p className="vf-band">archive</p>
              <h1 className="archive__title vf-display">projects</h1>
              <p className="archive__lede vf-serif">
                tutoring, f1 media, and quant tools. {PROJECTS.length} shipped.
              </p>
            </div>
            <a href="/#work" className="archive__back vf-mono">
              ← back to work
            </a>
          </header>

          <ul className="archive__list">
            {PROJECTS.map((project, i) => {
              const href = project.demo || project.href;
              const external = href.startsWith('http');
              const serial = `${String(i + 1).padStart(2, '0')} / ${total}`;
              const openNew = external || project.demoNewTab;
              return (
                <li key={project.id}>
                  <a
                    className="archive__row"
                    href={href}
                    target={openNew ? '_blank' : undefined}
                    rel={openNew ? 'noopener noreferrer' : undefined}
                  >
                    <div className="archive__media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={project.cover} alt="" loading="lazy" />
                    </div>
                    <div className="archive__copy">
                      <p className="archive__serial vf-mono">
                        {serial}
                        {project.featured && <span> · featured</span>}
                        <span> · {project.role}</span>
                        <span> · {project.period}</span>
                      </p>
                      <h2 className="archive__name vf-display">{project.title}</h2>
                      <p className="archive__desc vf-serif">{project.desc}</p>
                      <p className="archive__detail vf-serif">{project.detail}</p>
                      {project.metrics && (
                        <p className="archive__metrics vf-mono">{project.metrics.join(' · ')}</p>
                      )}
                      <p className="archive__tech vf-mono">{project.tech.join(' · ')}</p>
                      <span className="archive__cta vf-mono">open project →</span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </main>
        <SiteFooter />
      </div>
      <div className="site-contrast-mask js-contrast-mask" aria-hidden="true" />
      <ProjectsContrast />
    </>
  );
}
