import { PROJECTS } from '@/data/projects';

export function Work() {
  const featured = PROJECTS;
  const total = String(featured.length).padStart(2, '0');

  return (
    <section id="work" className="s-work js-work" aria-label="work">
      <div className="s-work__head">
        <p className="s-work__count vf-mono">{total} projects</p>
        <a href="/projects" className="s-work__all vf-mono js-magnetic js-scramble">
          full archive →
        </a>
      </div>

      <div className="s-work__viewport">
        <div className="s-work__track js-work-track">
          {featured.map((project, i) => {
            const href = project.demo || project.href;
            const external = href.startsWith('http');
            const serial = `${String(i + 1).padStart(2, '0')} / ${total}`;
            const openNew = external || project.demoNewTab;
            return (
              <article className="s-work__item js-work-item" key={project.id}>
                <div className="s-work__meta vf-mono">
                  <span>{serial}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.period}</span>
                </div>
                <a
                  className="s-work__media"
                  href={href}
                  target={openNew ? '_blank' : undefined}
                  rel={openNew ? 'noopener noreferrer' : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.cover} alt="" loading="lazy" />
                </a>
                <div className="s-work__copy">
                  <p className="s-work__role vf-mono">{project.role}</p>
                  <h3 className="s-work__name vf-display">
                    <a
                      href={href}
                      target={openNew ? '_blank' : undefined}
                      rel={openNew ? 'noopener noreferrer' : undefined}
                    >
                      {project.title}
                    </a>
                  </h3>
                  <p className="s-work__desc vf-serif">{project.desc}</p>
                  {project.metrics && (
                    <ul className="s-work__metrics vf-mono">
                      {project.metrics.slice(0, 2).map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
