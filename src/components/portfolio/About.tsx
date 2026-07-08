import { EDUCATION } from '../../data/education';
import { useTheme, themeColors } from './PageShell';

export default function About() {
  const { dark } = useTheme();
  const t = themeColors(dark);

  return (
    <section
      id="about"
      aria-label="About"
      style={{
        padding: 'clamp(64px, 10vh, 120px) var(--td-gutter)',
        borderTop: `1px solid ${t.border}`,
        maxWidth: 900,
      }}
    >
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
        about
      </p>
      <h2
        className="td-display"
        style={{
          margin: '12px 0 0',
          fontSize: 'clamp(28px, 4vw, 44px)',
          color: t.textStrong,
          textTransform: 'lowercase',
        }}
      >
        building in public from riyadh
      </h2>
      <p style={{ margin: '20px 0 0', fontSize: 17, lineHeight: 1.65, color: t.text, maxWidth: 560 }}>
        I care about products that teach, tools that automate the boring parts, and systems that prove
        the math. Currently a student — shipping tutoringbyabdullah, an F1 media experiment, and a
        small quant suite as technical proof.
      </p>

      <ol
        style={{
          listStyle: 'none',
          margin: '48px 0 0',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {EDUCATION.map((entry) => (
          <li
            key={entry.school}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px minmax(0, 1fr)',
              gap: 20,
              padding: '24px 0',
              borderTop: `1px solid ${t.border}`,
            }}
            className="td-edu-row"
          >
            <span className="td-mono" style={{ fontSize: 12, color: t.textMuted, letterSpacing: '0.04em' }}>
              {entry.years}
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={entry.logo}
                  alt=""
                  width={28}
                  height={28}
                  style={{ objectFit: 'contain', borderRadius: 2 }}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: t.textStrong, fontSize: 16 }}>
                    {entry.school}
                  </p>
                  <p className="td-mono" style={{ margin: '2px 0 0', fontSize: 11, color: t.textMuted }}>
                    {entry.location}
                  </p>
                </div>
              </div>
              <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: t.text, fontSize: 14, lineHeight: 1.55 }}>
                {entry.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <p style={{ marginTop: 32 }}>
        <a href="/resume.docx" className="td-btn td-btn-ghost" download>
          download resume
        </a>
      </p>

      <style>{`
        @media (max-width: 560px) {
          .td-edu-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </section>
  );
}
