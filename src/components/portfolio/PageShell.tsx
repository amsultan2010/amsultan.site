import { useState, createContext, useContext } from 'react';
import '../../styles/global.css';

export const INTRO_SEEN_KEY = 'rg-intro-seen';
export const THEME_STORAGE_KEY = 'rg-theme';

const ThemeCtx = createContext<{ dark: boolean; toggle: () => void; siteReady: boolean }>({
  dark: true,
  toggle: () => {},
  siteReady: true,
});
export { ThemeCtx };

function getInitialTheme() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light') return false;
    if (stored === 'dark') return true;
    return true; // Telemetry Desk defaults dark
  }
  return true;
}

export function shouldSkipIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  return localStorage.getItem(INTRO_SEEN_KEY) === '1';
}

export function markIntroSeen(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INTRO_SEEN_KEY, '1');
  }
}

export function ThemeProvider({
  children,
  siteReady = true,
}: {
  children: React.ReactNode;
  siteReady?: boolean;
}) {
  const [dark, setDark] = useState(getInitialTheme);
  const toggle = () => {
    setDark(d => {
      localStorage.setItem(THEME_STORAGE_KEY, d ? 'light' : 'dark');
      return !d;
    });
  };
  return (
    <ThemeCtx.Provider value={{ dark, toggle, siteReady }}>
      <div data-rg-theme={dark ? 'dark' : 'light'} data-td-theme={dark ? 'dark' : 'light'} style={{ display: 'contents' }}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}

/** Telemetry Desk color tokens for inline styles */
export function themeColors(dark: boolean) {
  return {
    bg: dark ? '#0e1116' : '#f2ebe0',
    text: dark ? '#b8bfc9' : '#2a2e36',
    textStrong: dark ? '#f2ebe0' : '#0e1116',
    textMuted: '#8b93a7',
    diamond: dark ? '#f2ebe0' : '#0e1116',
    border: dark ? 'rgba(242,235,224,0.12)' : 'rgba(14,17,22,0.12)',
    cardBg: dark ? 'rgba(242,235,224,0.05)' : 'rgba(14,17,22,0.04)',
    footerLine: dark ? 'rgba(242,235,224,0.12)' : 'rgba(14,17,22,0.12)',
    dotGrid: dark
      ? 'radial-gradient(rgba(242,235,224,0.08) 1px, transparent 1px)'
      : 'radial-gradient(rgba(14,17,22,0.08) 1px, transparent 1px)',
    accent: '#ff4d2e',
    accentMuted: dark ? 'rgba(255,77,46,0.35)' : 'rgba(255,77,46,0.22)',
    phosphor: '#7dffb3',
    dust: '#c4b8a5',
    steel: '#8b93a7',
  };
}

export function SLink({
  href, children, icon, external = true,
}: {
  href: string; children: React.ReactNode; icon?: string; external?: boolean;
}) {
  const { dark } = useTheme();
  const t = themeColors(dark);
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="rg-slink"
      style={{ color: t.textStrong, '--ul': t.border, '--fg-hover': t.accent } as React.CSSProperties}
    >
      {icon && (
        <img src={icon} alt="" style={{
          width: 14, height: 14, objectFit: 'contain', display: 'inline-block',
          verticalAlign: 'middle', position: 'relative', top: -1, marginRight: 4, borderRadius: 2,
        }} />
      )}
      {children}
    </a>
  );
}

function FooterIcon({ href, label, dark, children, external = true }: {
  href: string; label: string; dark: boolean; children: React.ReactNode; external?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const t = themeColors(dark);
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 0,
        color: hovered ? t.textStrong : t.textMuted, textDecoration: 'none', transition: 'color 0.3s',
      }}
    >
      <span style={{ display: 'flex', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
        {children}
      </span>
      <span style={{
        display: 'inline-block', overflow: 'hidden',
        width: hovered ? 'auto' : 0, maxWidth: hovered ? 80 : 0,
        marginLeft: hovered ? 6 : 0, opacity: hovered ? 1 : 0, fontSize: 13,
        fontFamily: 'var(--td-font-mono)',
        whiteSpace: 'nowrap', transition: 'max-width 0.5s ease, opacity 0.5s ease, margin-left 0.3s ease',
      }}>
        {label}
      </span>
    </a>
  );
}

const NAV = [
  { href: '/#work', label: 'work', id: 'work' },
  { href: '/lab', label: 'lab', id: 'lab' },
  { href: '/#about', label: 'about', id: 'about' },
  { href: '/#contact', label: 'contact', id: 'contact' },
];

export default function PageShell({ activePage, children }: { activePage: string; children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PageShellInner activePage={activePage}>{children}</PageShellInner>
    </ThemeProvider>
  );
}

function PageShellInner({ activePage, children }: { activePage: string; children: React.ReactNode }) {
  const { dark, toggle } = useTheme();
  const t = themeColors(dark);

  return (
    <div className="rg-root" style={{ background: t.bg, color: t.text }}>
      <div className="rg-container">
        <header className="rg-header">
          <h1 className="rg-name" style={{ color: t.textStrong }}>
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>abdullah sultan</a>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <nav className="rg-nav" aria-label="Primary">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="rg-nav-link"
                  style={{ color: activePage === item.id || activePage === item.label ? t.textStrong : t.text }}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/projects"
                className="rg-nav-link"
                style={{ color: activePage === 'projects' ? t.textStrong : t.text }}
              >
                projects
              </a>
            </nav>
            <button
              onClick={toggle}
              className="rg-theme-btn"
              style={{ color: t.text, border: `1px solid ${t.border}`, background: t.cardBg }}
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </header>

        {children}

        <footer className="rg-footer">
          <div style={{ height: 1, background: t.footerLine }} />
          <div className="rg-socials">
            <FooterIcon href="https://github.com/amsultan2010" label="github" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </FooterIcon>
            <FooterIcon href="https://music.youtube.com/@amsultan303" label="music" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M10 8l6 4-6 4z"/></svg>
            </FooterIcon>
            <FooterIcon href="mailto:abdullahmsultan1@gmail.com" label="email" dark={dark} external={false}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </FooterIcon>
            <FooterIcon href="https://www.linkedin.com/in/abdullah-sultan-4a264939a/" label="linkedin" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 0.774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </FooterIcon>
          </div>
          <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4, fontFamily: 'var(--td-font-mono)' }}>
            2026 © Abdullah Sultan
          </p>
        </footer>
      </div>

      <style>{`
        :root {
          color-scheme: ${dark ? 'dark' : 'light'};
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .rg-root {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          font-family: var(--td-font-body);
          font-weight: 400;
          line-height: 1.6;
          transition: background 0.3s, color 0.3s;
        }
        .rg-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: var(--td-max, 1080px);
          padding: 48px var(--td-gutter) 40px;
        }
        .rg-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .rg-name {
          font-family: var(--td-font-display);
          font-weight: 700; font-size: 18px; margin: 0; letter-spacing: -0.02em;
          text-transform: lowercase;
        }
        .rg-nav { display: flex; gap: 16px; flex-wrap: wrap; }
        .rg-nav-link {
          font-family: var(--td-font-mono);
          font-size: 12px; text-decoration: none; text-transform: uppercase;
          letter-spacing: 0.06em; position: relative; transition: color 0.2s;
        }
        .rg-nav-link::after {
          content: ''; position: absolute; left: 0; bottom: -2px;
          width: 100%; height: 1px; background: currentColor; opacity: 0.2;
        }
        .rg-nav-link:hover { color: ${t.accent} !important; }
        .rg-theme-btn {
          background: none; border: none; cursor: pointer; font-size: 16px;
          padding: 4px 6px; border-radius: 2px; transition: background 0.2s; line-height: 1;
        }
        .rg-theme-btn:hover { background: rgba(128,128,128,0.15); }

        .rg-slink {
          text-decoration: none;
          font-family: var(--td-font-display);
          font-weight: 500; position: relative; transition: color 0.2s;
        }
        .rg-slink::after {
          content: ''; position: absolute; left: 0; bottom: -1px;
          width: 100%; height: 1px; background: var(--ul); z-index: 1;
        }
        .rg-slink:hover { color: var(--fg-hover); }

        .rg-footer { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }
        .rg-socials { display: flex; gap: 20px; }

        @media (max-width: 640px) {
          .rg-container { padding: 32px 20px 28px; }
          .rg-nav { gap: 12px; }
        }
      `}</style>
    </div>
  );
}
