import { useState, createContext, useContext } from 'react';
import '../../styles/global.css';

export const INTRO_SEEN_KEY = 'rg-intro-seen';
export const THEME_STORAGE_KEY = 'rg-theme';

/* Theme context */
const ThemeCtx = createContext<{ dark: boolean; toggle: () => void; siteReady: boolean }>({
  dark: false,
  toggle: () => {},
  siteReady: true,
});
export { ThemeCtx };

function getInitialTheme() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
  }
  return false;
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
      <div data-rg-theme={dark ? 'dark' : 'light'} style={{ display: 'contents' }}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}

export function themeColors(dark: boolean) {
  return {
    bg: dark ? '#000000' : '#f5f5f4',
    text: dark ? '#a3a3a3' : '#57534e',
    textStrong: dark ? '#d6d3d1' : '#44403c',
    textMuted: dark ? '#78716c' : '#78716c',
    diamond: dark ? '#d6d3d1' : '#1c1917',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    cardBg: dark ? '#171717' : '#f5f5f5',
    footerLine: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    dotGrid: dark ? 'radial-gradient(#1f2937 1px, transparent 1px)' : 'radial-gradient(#e5e7eb 1px, transparent 1px)',
    accent: dark ? '#fb923c' : '#ea580c',
    accentMuted: dark ? 'rgba(251, 146, 60, 0.35)' : 'rgba(234, 88, 12, 0.25)',
  };
}

/* Styled link with sweep underline */
export function SLink({
  href, children, icon, external = true,
}: {
  href: string; children: React.ReactNode; icon?: string; external?: boolean;
}) {
  const { dark } = useTheme();
  const fg = dark ? '#d6d3d1' : '#44403c';
  const ul = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="rg-slink"
      style={{ color: fg, '--ul': ul, '--fg-hover': dark ? '#d6d3d1' : '#44403c' } as React.CSSProperties}
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

/* Footer icon with label that expands on hover (like Martin's) */
function FooterIcon({ href, label, dark, children, external = true }: {
  href: string; label: string; dark: boolean; children: React.ReactNode; external?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const color = dark ? '#78716c' : '#78716c';
  const hoverColor = dark ? '#d6d3d1' : '#44403c';
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 0,
        color: hovered ? hoverColor : color, textDecoration: 'none', transition: 'color 0.3s',
      }}
    >
      <span style={{ display: 'flex', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
        {children}
      </span>
      <span style={{
        display: 'inline-block', overflow: 'hidden',
        width: hovered ? 'auto' : 0, maxWidth: hovered ? 80 : 0,
        marginLeft: hovered ? 6 : 0, opacity: hovered ? 1 : 0, fontSize: 14,
        whiteSpace: 'nowrap', transition: 'max-width 0.5s ease, opacity 0.5s ease, margin-left 0.3s ease',
      }}>
        {label}
      </span>
    </a>
  );
}

/* Full page shell with header, WebGL bg, footer */
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
        {/* Header */}
        <header className="rg-header">
          <h1 className="rg-name" style={{ color: t.textStrong }}>
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>abdullah sultan</a>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <nav className="rg-nav">
              <a href="/" className="rg-nav-link" style={{ color: activePage === 'about' ? t.textStrong : t.text }}>about</a>
              <a href="/projects" className="rg-nav-link" style={{ color: activePage === 'projects' ? t.textStrong : t.text }}>projects</a>
              <a href="/desktop" className="rg-nav-link" style={{ color: activePage === 'desktop' ? t.textStrong : t.text }}>desktop</a>
              <a href="/#education" className="rg-nav-link" style={{ color: t.text }}>education</a>
            </nav>
            <button onClick={toggle} className="rg-theme-btn" style={{ color: t.text, border: `1px solid ${t.border}`, background: dark ? '#1c1917' : '#fafaf9' }} aria-label="Toggle theme">
              {dark ? (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>) : (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>)}
            </button>
          </div>
        </header>

        {/* Page content */}
        {children}

        {/* Footer */}
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
            <FooterIcon href="https://github.com/amsultan2010" label="projects" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </FooterIcon>
          </div>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>2026 &copy; Abdullah Sultan</p>
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
          font-family: 'NeueMontreal-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 300;
          line-height: 1.6;
          transition: background 0.3s, color 0.3s;
        }
        .rg-root ::selection {
          background: ${dark ? 'rgba(133, 77, 14, 0.6)' : 'rgba(254, 240, 138, 0.8)'};
        }
        .rg-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: var(--rg-max-projects, 780px);
          padding: 64px 24px 40px;
        }
        .rg-header { display: flex; justify-content: space-between; align-items: center; }
        .rg-name {
          font-family: 'NeueMontreal-Medium', -apple-system, sans-serif;
          font-weight: 600; font-size: 18px; margin: 0; letter-spacing: -0.01em;
        }
        .rg-nav { display: flex; gap: 16px; }
        .rg-nav-link {
          font-size: 14px; text-decoration: none; position: relative; transition: color 0.2s, opacity 0.2s;
        }
        .rg-nav-link::after {
          content: ''; position: absolute; left: 0; bottom: -1px;
          width: 100%; height: 1px; background: currentColor; opacity: 0.25;
        }
        .rg-nav-link:hover { opacity: 1; }
        .rg-theme-btn {
          background: none; border: none; cursor: pointer; font-size: 16px;
          padding: 4px 6px; border-radius: 6px; transition: background 0.2s; line-height: 1;
        }
        .rg-theme-btn:hover { background: rgba(128,128,128,0.15); }

        /* Sweep-underline link */
        .rg-slink {
          text-decoration: none;
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 500; position: relative; transition: color 0.2s;
        }
        .rg-slink::after {
          content: ''; position: absolute; left: 0; bottom: -1px;
          width: 100%; height: 1px; background: var(--ul); z-index: 1;
        }
        .rg-slink::before {
          content: ''; position: absolute; left: 0; bottom: -1px;
          width: 100%; height: 1px; background: var(--fg-hover); z-index: 2;
          transform: scaleX(0); transform-origin: left; opacity: 0; transition: opacity 0.15s;
        }
        .rg-slink:hover { color: var(--fg-hover); }
        .rg-slink:hover::before { opacity: 1; animation: sweep 2s ease-in-out infinite; }
        @keyframes sweep {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(1); transform-origin: left; }
          50.1%{ transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }

        .rg-footer { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .rg-socials { display: flex; gap: 20px; }
        .rg-social-link { font-size: 14px; text-decoration: none; transition: opacity 0.2s; }
        .rg-social-link:hover { opacity: 1; }

        @media (max-width: 500px) { .rg-container { padding: 40px 20px 32px; } }
      `}</style>
    </div>
  );
}
