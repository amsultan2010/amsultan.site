import { EDUCATION } from '@/data/education';

export function About() {
  return (
    <section id="about" className="s-about js-about" aria-label="about">
      <div className="s-about__grid">
        <div className="s-about__copy js-about-copy">
          <h2 className="s-about__title vf-display js-reveal-lines">building from riyadh</h2>
          <p className="s-about__body vf-serif">
            student at ais-r. shipping tutoringbyabdullah, the downforce blog, and a small quant suite.
            founding x-combinator, a student-run startup incubator.
          </p>
          <p className="s-about__resume">
            <a href="/resume.docx" className="vf-mono js-magnetic js-scramble">
              download resume →
            </a>
          </p>
        </div>

        <aside className="s-about__aside js-about-aside">
          <p className="s-about__aside-label vf-mono">currently</p>
          <ul className="s-about__now">
            <li>ais-r · 10th grade</li>
            <li>shipping tutoring + quantpy</li>
            <li>writing the downforce blog</li>
            <li>founding x-combinator</li>
          </ul>
        </aside>
      </div>

      <div className="s-about__edu-head">
        <p className="vf-mono s-about__edu-label">education</p>
        <div className="vf-rule js-rule" />
      </div>

      <ol className="s-about__timeline">
        {EDUCATION.map((entry, i) => (
          <li className="s-about__cred js-about-cred" key={entry.school}>
            <div className="s-about__cred-rail" aria-hidden="true">
              <span className="s-about__cred-dot" />
              {i < EDUCATION.length - 1 && <span className="s-about__cred-line" />}
            </div>
            <div className="s-about__cred-body">
              <div className="s-about__cred-top">
                <span className="s-about__cred-years vf-mono">{entry.years}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="s-about__cred-logo"
                  src={entry.logo}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                />
              </div>
              <h3 className="s-about__cred-school vf-display">{entry.short ?? entry.school}</h3>
              <p className="s-about__cred-loc vf-mono">{entry.location}</p>
              <p className="s-about__cred-focus vf-serif">{entry.focus}</p>
              <ul className="s-about__cred-list vf-serif">
                {entry.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
