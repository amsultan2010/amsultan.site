import { useTheme, themeColors } from './PageShell';

export default function Contact() {
  const { dark } = useTheme();
  const t = themeColors(dark);

  return (
    <section
      id="contact"
      aria-label="Contact"
      style={{
        padding: 'clamp(72px, 12vh, 140px) var(--td-gutter)',
        borderTop: `1px solid ${t.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: dark
            ? 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(255,77,46,0.16), transparent 60%)'
            : 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(255,77,46,0.1), transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 640 }}>
        <p
          className="td-mono"
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: t.phosphor,
          }}
        >
          contact
        </p>
        <h2
          className="td-display"
          style={{
            margin: '14px 0 0',
            fontSize: 'clamp(36px, 7vw, 72px)',
            color: t.textStrong,
            textTransform: 'lowercase',
          }}
        >
          want to talk?
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 18, lineHeight: 1.55, color: t.text, maxWidth: 440 }}>
          founders, recruiters, curious builders — email me. coffee chats welcome.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
          <a href="mailto:abdullahmsultan1@gmail.com" className="td-btn td-btn-primary">
            abdullahmsultan1@gmail.com
          </a>
          <a href="/lab" className="td-btn td-btn-ghost">
            visit the lab
          </a>
        </div>
      </div>
    </section>
  );
}
