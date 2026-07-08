import { useTheme, themeColors } from './PageShell';

const NAV = [
  { href: '/#work', label: 'work' },
  { href: '/lab', label: 'lab' },
  { href: '/#about', label: 'about' },
  { href: '/#contact', label: 'contact' },
];

export function SiteHeader() {
  const { dark, toggle } = useTheme();
  const t = themeColors(dark);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        padding: '16px var(--td-gutter)',
        background: `color-mix(in srgb, ${t.bg} 92%, transparent)`,
        borderBottom: `1px solid ${t.border}`,
        backdropFilter: 'none',
      }}
    >
      <a
        href="/"
        className="td-display"
        style={{
          color: t.textStrong,
          textDecoration: 'none',
          fontSize: 18,
          letterSpacing: '-0.02em',
        }}
      >
        abdullah sultan
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <nav aria-label="Primary" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="td-mono"
              style={{
                color: t.text,
                textDecoration: 'none',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            background: t.cardBg,
            border: `1px solid ${t.border}`,
            color: t.text,
            padding: '6px 8px',
            cursor: 'pointer',
            borderRadius: 2,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const links = [
    { href: 'https://github.com/amsultan2010', label: 'github' },
    { href: 'https://www.linkedin.com/in/abdullah-sultan-4a264939a/', label: 'linkedin' },
    { href: 'mailto:abdullahmsultan1@gmail.com', label: 'email' },
    { href: '/resume.docx', label: 'resume' },
  ];

  return (
    <footer
      style={{
        padding: '32px var(--td-gutter) 48px',
        borderTop: `1px solid ${t.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="td-mono"
            style={{
              color: t.textMuted,
              textDecoration: 'none',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {l.label}
          </a>
        ))}
      </div>
      <p className="td-mono" style={{ margin: 0, fontSize: 11, color: t.textMuted }}>
        2026 © Abdullah Sultan · Riyadh
      </p>
    </footer>
  );
}
