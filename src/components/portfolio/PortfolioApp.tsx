import { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext, lazy, Suspense } from 'react';

import ContentViewer from './ContentViewer';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';
import AbdullahAsciiLogo from '../desktop/AbdullahAsciiLogo';
import PokemonWalkers from '../PokemonWalkers';

const LazyDesktopShell = lazy(() => import('../desktop/DesktopShell'));

/* ══════════════════════════════════════════════════════════
   Theme context — dark/light mode
   ══════════════════════════════════════════════════════════ */

const ThemeCtx = createContext<{ dark: boolean; toggle: () => void; siteReady: boolean }>({ dark: false, toggle: () => {}, siteReady: false });

function getInitialTheme() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rg-theme') === 'dark';
  }
  return false;
}

function ThemeProvider({ children, siteReady = false }: { children: React.ReactNode; siteReady?: boolean }) {
  const [dark, setDark] = useState(getInitialTheme);
  const toggle = () => {
    setDark(d => {
      localStorage.setItem('rg-theme', d ? 'light' : 'dark');
      return !d;
    });
  };
  return <ThemeCtx.Provider value={{ dark, toggle, siteReady }}>{children}</ThemeCtx.Provider>;
}

/* ══════════════════════════════════════════════════════════
   Data
   ══════════════════════════════════════════════════════════ */

const BUILDING = [
  {
    label: 'abdullahos',
    href: '/desktop',
    cover: '/readme/portfolio-desktop.jpg',
    desc: 'desktop-style portfolio w/ draggable windows and static apps.',
    tech: ['Astro', 'React', 'TypeScript'],
  },
  {
    label: 'tutoringbyabdullah',
    href: 'https://tutoringbyabdullah.xyz',
    cover: '/images/projects/tutoringpreview.png',
    desc: 'education product focused on understanding, not memorizing.',
    tech: ['Education', 'Product', 'Website'],
  },
];

const PREVIOUSLY = [
  { role: 'vertical ai for automation, enterprise software, productivity, education', company: 'projects', icon: '/icons/folder.png', href: '/projects' },
  { role: 'robotics + automation systems, with quant as technical proof', company: 'builds', icon: '/icons/folder.png', href: '/projects' },
];

interface EducationEntry {
  school: string;
  years: string;
  location: string;
  logo: string;
  details: string[];
  activities: string[];
  achievements: string[];
  reflection: string;
}

const EDUCATION: EducationEntry[] = [
  {
    school: 'american international school in riyadh',
    years: '2025-present',
    location: 'riyadh, saudi arabia',
    logo: '/images/logosicons/aisr.png',
    details: ['ap precalc, ap psych, ap compsci a', 'aspiring doctors club lead', '#2 varsity tennis seed'],
    activities: [
      'self-studying ap precalc, ap psych, and ap compsci a',
      'highest achievable level of maths; one year of aa sl in 10th grade — 1 of 4 students in the grade',
      "aspiring doctors' club: promoted to leader within first year; 14 recurring members",
      "jv boys' badminton",
      "#2 seed on varsity boys' tennis; season cancelled due to geopolitical conflict",
    ],
    achievements: [
      'building products while keeping school as the operating base',
    ],
    reflection: 'current school chapter: harder academics, more responsibility, and more room to build.',
  },
  {
    school: 'the pingry school',
    years: '2021-2025',
    location: 'basking ridge, nj',
    logo: '/images/logosicons/pingry.png',
    details: ['ap compsci principles 5/5', 'public forum debate', 'engineering + affinity leadership'],
    activities: [
      'self-studied ap compsci principles; scored 5/5',
      'public forum debate club: 1st place w/ undefeated 5-0 record at horace mann juniors invitational',
      'muslim affinity group: leader; 8 recurring members; weekly meetings',
      'pingry research and innovation in modern engineering: 12 recurring members; 2 speaker sessions w/ engineering professors',
      'f1 club',
      "jv boys' tennis",
      "jv boys' swim: 1st place in exhibition 50 at lawrenceville state championships",
    ],
    achievements: [
      'built the habit of joining technical, academic, and community work early',
    ],
    reflection: 'pingry was where school became more than classes: debate, engineering, community, and competition.',
  },
];

const SOCIALS = [
  { label: 'github', href: 'https://github.com/amsultan2010' },
  { label: 'youtube music', href: 'https://music.youtube.com/@amsultan303' },
  { label: 'email', href: 'mailto:abdullahmsultan1@gmail.com' },
];

// Photo intrinsic dimensions (1023×1537) — used to size the container to the
// exact same aspect ratio so object-fit:fill and the ASCII grid both map 1:1.
const PHOTO_W = 1023;
const PHOTO_H = 1537;
const PHOTO_RATIO = PHOTO_W / PHOTO_H; // ≈ 0.6656

// ASCII grid dimensions (from myascii.txt)
const ASCII_COLS = 145;
const ASCII_ROWS = 120;
const ASCII_LINE_H = 1.02;
// Monospace char width-to-height ratio for SF Mono / Menlo at small sizes.
// The actual value is ≈0.58; the tiny residual is corrected by scaleX below.
const CHAR_W_RATIO = 0.58;

const REVEAL_RADIUS = 198;

/** Returns container pixel dims that preserve the photo aspect ratio. */
function calcDims(vw: number, vh: number) {
  // Intentionally > 100 vh on desktop so the bottom bleeds off-screen
  const maxH = vw <= 500 ? vh * 0.55 : vh * 1.27;
  const maxW = vw <= 500 ? vw * 0.85 : vw * 0.85;
  const fromH = { w: maxH * PHOTO_RATIO, h: maxH };
  // If that overflows maxW, constrain by width instead
  return fromH.w <= maxW ? fromH : { w: maxW, h: maxW / PHOTO_RATIO };
}

function MainPhotoBackdrop({ dark }: { dark: boolean }) {
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [ascii, setAscii] = useState('');
  const [dims, setDims] = useState<{ w: number; h: number }>(() =>
    typeof window === 'undefined' ? { w: 440, h: 661 } : calcDims(window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    let cancelled = false;
    fetch('/images/myascii.txt')
      .then(r => r.text())
      .then(text => { if (!cancelled) setAscii(text.trimEnd()); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onResize = () => setDims(calcDims(window.innerWidth, window.innerHeight));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Font size that fills the container height exactly (120 rows × lineHeight).
  const fontSize = dims.h / (ASCII_ROWS * ASCII_LINE_H);
  // scaleX stretches the pre horizontally so 145 columns fill dims.w exactly.
  // This corrects the ≈3 % mismatch between the font's actual char width and
  // CHAR_W_RATIO, ensuring the ASCII grid overlays the photo pixel-perfectly.
  const scaleX = dims.w / (ASCII_COLS * fontSize * CHAR_W_RATIO);

  const photoMask = cursor
    ? `radial-gradient(circle ${REVEAL_RADIUS}px at ${cursor.x}px ${cursor.y}px, transparent 0%, transparent ${Math.round(REVEAL_RADIUS * 0.5)}px, black ${REVEAL_RADIUS}px)`
    : undefined;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: Math.round(dims.w),
        height: Math.round(dims.h),
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'auto',
        cursor: cursor ? 'none' : 'default',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setCursor(null)}
    >
      {/* ASCII art — anchored top-right, scaled to fill container exactly */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <pre
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            margin: 0,
            color: dark ? '#f5f5f4' : '#1c1917',
            opacity: 0.85,
            fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
            fontWeight: 900,
            fontSize: `${fontSize}px`,
            lineHeight: ASCII_LINE_H,
            letterSpacing: 0,
            whiteSpace: 'pre',
            // scaleX anchored at the right edge so both layers share the same
            // right boundary; any residual sub-pixel diff is clipped by parent overflow:hidden
            transform: `scaleX(${scaleX})`,
            transformOrigin: 'right top',
            WebkitFontSmoothing: 'antialiased' as const,
          }}
        >
          {ascii}
        </pre>
      </div>
      {/* Photo — fills container 1:1 via object-fit:fill (no crop offset) */}
      <img
        src="/images/myimage.png"
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          userSelect: 'none',
          pointerEvents: 'none',
          WebkitMaskImage: photoMask,
          maskImage: photoMask,
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Menacing aura — JoJo-style ゴゴゴゴ above the ascii art
   ══════════════════════════════════════════════════════════ */

function MenacingAura({ dark }: { dark: boolean }) {
  // JoJo's menacing aura is iconically purple — a deep eggplant/violet
  // with a stronger purple glow around it.
  const color = dark ? 'rgba(180, 110, 220, 0.92)' : 'rgba(74, 30, 122, 0.95)';
  const shadow = dark
    ? '0 0 10px rgba(150, 60, 220, 0.7), 0 0 22px rgba(80, 20, 140, 0.55), 0 0 32px rgba(0,0,0,0.45)'
    : '0 0 10px rgba(120, 50, 200, 0.55), 0 0 20px rgba(80, 20, 140, 0.35), 1px 1px 0 rgba(40, 10, 80, 0.4)';

  return (
    <div className="menacing-aura" aria-hidden="true">
      <span className="menacing-ch menacing-ch-1">ゴ</span>
      <span className="menacing-ch menacing-ch-2">ゴ</span>
      <span className="menacing-ch menacing-ch-3">ゴ</span>
      <span className="menacing-ch menacing-ch-4">ゴ</span>
      <span className="menacing-ch menacing-ch-5">ゴ</span>
      <style>{`
        /* Desktop: pinned to the upper area of the ascii art, shifted right
           so the aura overlaps the left edge of the visible ascii letters. */
        .menacing-aura {
          position: fixed;
          top: 40px;
          left: 54vw;
          display: flex;
          flex-direction: column;
          gap: 6px;
          pointer-events: none;
          user-select: none;
          z-index: 3;
        }
        .menacing-ch {
          position: relative;
          display: inline-block;
          font-family: 'YuMincho', 'Hiragino Mincho ProN', 'MS Mincho', 'Times New Roman', serif;
          font-weight: 900;
          font-style: italic;
          line-height: 0.9;
          letter-spacing: -0.04em;
          color: ${color};
          text-shadow: ${shadow};
          animation: menacingPulse 1.8s ease-in-out infinite;
        }
        /* Sizes are 2x larger than the previous step. */
        .menacing-ch-1 { font-size: 100px; left: 0;   transform: rotate(-3deg); animation-delay: 0s; }
        .menacing-ch-2 { font-size: 88px;  left: 32px; transform: rotate(2deg);  animation-delay: 0.22s; }
        .menacing-ch-3 { font-size: 120px; left: 8px;  transform: rotate(-1deg); animation-delay: 0.44s; }
        .menacing-ch-4 { font-size: 72px;  left: 44px; transform: rotate(3deg);  animation-delay: 0.66s; }
        .menacing-ch-5 { font-size: 92px;  left: 12px; transform: rotate(-2deg); animation-delay: 0.88s; }
        @keyframes menacingPulse {
          0%, 100% { opacity: 0.4; top: 0; }
          50%      { opacity: 1;   top: -6px; }
        }
        /* Tablet */
        @media (max-width: 900px) {
          .menacing-aura { top: 32px; left: 54vw; gap: 4px; }
          .menacing-ch-1 { font-size: 80px; }
          .menacing-ch-2 { font-size: 68px; }
          .menacing-ch-3 { font-size: 92px; }
          .menacing-ch-4 { font-size: 56px; }
          .menacing-ch-5 { font-size: 72px; }
        }
        /* Mobile: ascii art sits at the bottom of the viewport, so move
           the aura to the top-left edge of that lower-half region. */
        @media (max-width: 500px) {
          .menacing-aura { top: 42vh; left: 12px; gap: 3px; }
          .menacing-ch-1 { font-size: 56px; }
          .menacing-ch-2 { font-size: 48px; }
          .menacing-ch-3 { font-size: 66px; }
          .menacing-ch-4 { font-size: 40px; }
          .menacing-ch-5 { font-size: 50px; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Inline icon helper
   ══════════════════════════════════════════════════════════ */

function Ico({ src, alt }: { src: string; alt: string }) {
  const { dark } = useContext(ThemeCtx);
  // Only invert augmentor icon on light mode (it's white-on-transparent for dark bg)
  const needsInvert = !dark && src.includes('augmentor');
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: 14,
        height: 14,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        position: 'relative',
        top: -1,
        marginRight: 4,
        borderRadius: 2,
        filter: needsInvert ? 'invert(1)' : 'none',
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════
   Styled link (sweep underline on hover like Martin's)
   ══════════════════════════════════════════════════════════ */

function SLink({
  href,
  children,
  icon,
  iconDark,
  external = true,
}: {
  href: string;
  children: React.ReactNode;
  icon?: string;
  iconDark?: string;
  external?: boolean;
}) {
  const { dark } = useContext(ThemeCtx);
  const fg = dark ? '#d6d3d1' : '#44403c';
  const ul = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  const resolvedIcon = dark && iconDark ? iconDark : icon;
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="rg-slink"
      style={{ color: fg, '--ul': ul, '--fg-hover': dark ? '#d6d3d1' : '#44403c' } as React.CSSProperties}
    >
      {resolvedIcon && <Ico src={resolvedIcon} alt="" />}
      {children}
    </a>
  );
}

/* ══════════════════════════════════════════════════════════
   Main app
   ══════════════════════════════════════════════════════════ */

function Inner() {
  const { dark, toggle } = useContext(ThemeCtx);
  const [activeContent, setActiveContent] = useState<ContentViewData | null>(null);
  const [selectedEdu, setSelectedEdu] = useState<EducationEntry | null>(null);

  const openPost = (slug: string) => {
    const data = contentMap[slug];
    if (data) setActiveContent(data);
  };

  useEffect(() => {
    if (!selectedEdu) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEdu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedEdu]);

  const t = {
    bg: dark ? '#000000' : '#f5f5f4',
    text: dark ? '#a3a3a3' : '#57534e',
    textStrong: dark ? '#d6d3d1' : '#44403c',
    textMuted: dark ? '#78716c' : '#78716c',
    diamond: dark ? '#d6d3d1' : '#1c1917',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    cardBg: dark ? '#171717' : '#f5f5f5',
    footerLine: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    dotGrid: dark ? 'radial-gradient(#1f2937 1px, transparent 1px)' : 'radial-gradient(#e5e7eb 1px, transparent 1px)',
  };

  return (
    <div className="rg-root" style={{ background: t.bg, color: t.text }}>
      <MainPhotoBackdrop dark={dark} />
      <MenacingAura dark={dark} />
      <PokemonWalkers zIndex={50} />
      <div className="rg-container">
        {/* ── Header ── */}
        <header className="rg-header">
          <h1 className="rg-name" style={{ color: t.textStrong }}>abdullah sultan</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <nav className="rg-nav">
              <a href="/" className="rg-nav-link" style={{ color: t.textStrong }}>about</a>
              <a href="/projects" className="rg-nav-link" style={{ color: t.text }}>projects</a>
              <a href="#education" className="rg-nav-link" style={{ color: t.text }}>education</a>
            </nav>
            <button onClick={toggle} className="rg-theme-btn" style={{ color: t.text, border: `1px solid ${t.border}`, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} aria-label="Toggle theme">
              {dark ? (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>) : (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>)}
            </button>
          </div>
        </header>

        {/* ── Main bullet list ── */}
        <ul className="rg-list" id="projects">
          <BulletItem diamond={t.diamond}>
            <span style={{ color: t.text }}>
              Student builder{' '}
              <span className="rg-inline-link-group">
                <SLink
                  href="/desktop"
                  icon="/icons/folder.png"
                >
                  abdullahos
                </SLink>
              </span>
            </span>
          </BulletItem>

          <BulletItem diamond={t.diamond}>
            <span style={{ color: t.text }}>
              interested in{' '}
              <span className="rg-inline-link-group">
                <SLink href="/projects" icon="/icons/folder.png">startups</SLink>
                {' + '}
                <SLink href="/projects" icon="/icons/folder.png">vertical ai</SLink>
                {' + '}
                <SLink href="/projects" icon="/icons/folder.png">robotics</SLink>
              </span>
            </span>
          </BulletItem>

          <BulletItem diamond={t.diamond}>
            <span style={{ color: t.text }}>
              aiming to become the cto of a yc-funded startup that actually does something meaningful
            </span>
          </BulletItem>

          {/* What I've been building */}
          <li className="rg-item rg-item-nested" style={{ marginTop: 8 }}>
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span className="rg-section-label" style={{ color: t.text }}>what i've been building:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 6, width: '100%' }}>
              {BUILDING.map((b, i) => (
                <a key={i} href={b.href} target="_blank" rel="noopener noreferrer" className="rg-build-card" style={{
                  background: t.cardBg,
                  borderColor: t.border,
                }}>
                  <div style={{
                    aspectRatio: '16 / 10',
                    overflow: 'hidden',
                    borderRadius: '8px 8px 0 0',
                    margin: '-20px -20px 14px -20px',
                    width: 'calc(100% + 40px)',
                  }}>
                    <img src={b.cover} alt={b.label} className="rg-build-cover" style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      transition: 'transform 0.4s ease',
                    }} />
                  </div>
                  <span className="rg-build-label" style={{ color: t.textStrong }}>{b.label}</span>
                  <span className="rg-build-desc" style={{ color: t.text }}>{b.desc}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {b.tech.map((tag, j) => (
                      <span key={j} style={{
                        fontSize: 13, padding: '3px 9px', borderRadius: 99,
                        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        color: t.textMuted,
                      }}>{tag}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, width: '100%' }}>
              <a href="/projects" style={{ fontSize: 14, color: t.textMuted, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = t.textStrong)}
                onMouseLeave={e => (e.currentTarget.style.color = t.textMuted)}
              >see more →</a>
            </div>
          </li>

          {/* Education */}
          <li id="education" className="rg-item rg-item-nested" style={{ marginTop: 8 }}>
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span className="rg-section-label" style={{ color: t.text }}>education:</span>
            <div className="rg-education">
              {EDUCATION.map((edu, i) => (
                <button
                  key={i}
                  type="button"
                  className="rg-education-card"
                  onClick={() => setSelectedEdu(edu)}
                  aria-label={`Open details for ${edu.school}`}
                  style={{
                    borderColor: t.border,
                    background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    color: t.text,
                    cursor: 'pointer',
                  }}
                >
                  <img src={edu.logo} alt="" className="rg-education-logo" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="rg-education-title" style={{ color: t.textStrong }}>{edu.school}</div>
                    <div className="rg-education-years" style={{ color: t.textMuted }}>{edu.years}</div>
                    <div className="rg-education-details" style={{ color: t.text }}>
                      {edu.details.join(' · ')}
                    </div>
                  </div>
                  <span className="rg-education-chevron" style={{ color: t.textMuted }} aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </li>

          {/* Previously */}
          <li className="rg-item rg-item-nested" style={{ marginTop: 8 }}>
            <div className="rg-diamond" style={{ background: t.diamond }} />
            <span className="rg-section-label" style={{ color: t.text }}>exploring:</span>
            <ul className="rg-sublist">
               
              {PREVIOUSLY.map((p, i) => (
                <li key={i} className="rg-subitem">
                  <span className="rg-arrow" style={{ color: t.textMuted }}>↳</span>
                  <span style={{ color: t.text }}>
                    {p.role}{' '}
                    <span className="rg-inline-link-group">
                      <SLink href={p.href} icon={p.icon}>{p.company}</SLink>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        </ul>


        <div className="rg-signature" style={{ color: t.textStrong }}>Abdullah</div>

        {/* ── Footer (Martin-style: icon + label expands on hover) ── */}
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
            <FooterIcon href="https://www.linkedin.com/in/abdullah-sultan-4a264939a/" label="linkedin" dark={dark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </FooterIcon>
          </div>
          <p style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }} className="rg-copyright">
            2026 &copy; Abdullah Sultan
            <span className="rg-copyright-made"> — made with Cursor (Opus 4.7 Extra High and GPT-5.5 Medium)</span>
          </p>
        </footer>
      </div>

      {/* Content viewer modal */}
      {activeContent && (
        <ContentViewer content={activeContent} onClose={() => setActiveContent(null)} />
      )}

      {/* Education detail modal */}
      {selectedEdu && (
        <div
          className="rg-edu-backdrop"
          onClick={() => setSelectedEdu(null)}
          role="presentation"
        >
          <div
            className="rg-edu-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedEdu.school} details`}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: dark ? '#0c0c0c' : '#fafaf9',
              color: t.text,
              border: `1px solid ${t.border}`,
            }}
          >
            <button
              type="button"
              className="rg-edu-close"
              onClick={() => setSelectedEdu(null)}
              aria-label="Close"
              style={{ color: t.text, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
            >
              ✕
            </button>
            <div className="rg-edu-head">
              <img src={selectedEdu.logo} alt="" className="rg-edu-logo" />
              <div style={{ minWidth: 0 }}>
                <h2 className="rg-edu-title" style={{ color: t.textStrong }}>{selectedEdu.school}</h2>
                <div className="rg-edu-sub" style={{ color: t.textMuted }}>
                  {selectedEdu.years} · {selectedEdu.location}
                </div>
              </div>
            </div>

            <div className="rg-edu-section">
              <div className="rg-edu-heading" style={{ color: t.textMuted }}>highlights</div>
              <ul className="rg-edu-list">
                {selectedEdu.activities.map((a, i) => (
                  <li key={i} style={{ color: t.text }}>
                    <span className="rg-edu-bullet" style={{ color: t.textMuted }}>›</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedEdu.achievements.length > 0 && (
              <div className="rg-edu-section">
                <div className="rg-edu-heading" style={{ color: t.textMuted }}>achievements</div>
                <ul className="rg-edu-list">
                  {selectedEdu.achievements.map((a, i) => (
                    <li key={i} style={{ color: t.text }}>
                      <span className="rg-edu-bullet" style={{ color: t.textMuted }}>›</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rg-edu-section">
              <div className="rg-edu-heading" style={{ color: t.textMuted }}>reflection</div>
              <p className="rg-edu-reflection" style={{ color: t.textStrong, borderLeft: `2px solid ${t.border}` }}>
                {selectedEdu.reflection}
              </p>
            </div>
          </div>
        </div>
      )}

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
          justify-content: flex-start;
          align-items: flex-start;
          font-family: 'NeueMontreal-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 300;
          line-height: 1.6;
          overflow: hidden;
          transition: background 0.3s, color 0.3s;
        }

        .rg-ascii-backdrop {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 50vw;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          pointer-events: none;
          overflow: hidden;
          transform: none;
          transition: opacity 0.3s ease;
          user-select: none;
        }

        .rg-root ::selection {
          background: ${dark ? 'rgba(133, 77, 14, 0.6)' : 'rgba(254, 240, 138, 0.8)'};
        }

        .rg-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          max-width: min(680px, calc(50vw - 72px));
          margin-left: clamp(20px, 3vw, 48px);
          padding: 64px 24px 48px 0;
          box-sizing: border-box;
        }

        /* Header */
        .rg-header { display: flex; justify-content: space-between; align-items: center; }
        .rg-name {
          font-family: 'NeueMontreal-Medium', -apple-system, sans-serif;
          font-weight: 600;
          font-size: 24px;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .rg-nav { display: flex; gap: 18px; }
        .rg-nav-link {
          font-size: 18px;
          text-decoration: none;
          position: relative;
          transition: color 0.2s, opacity 0.2s;
        }
        .rg-nav-link::after {
          content: '';
          position: absolute;
          left: 0; bottom: -1px;
          width: 100%; height: 1px;
          background: currentColor;
          opacity: 0.25;
        }
        .rg-nav-link:hover { opacity: 1; }

        .rg-theme-btn {
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s, border-color 0.2s;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rg-theme-btn:hover { background: rgba(128,128,128,0.15); }

        /* List */
        .rg-list {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 22px;
        }
        .rg-item {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          padding-left: 20px;
          position: relative;
          transition: transform 0.2s;
        }
        .rg-item:hover { transform: translateX(4px); }
        .rg-item-nested {
          flex-direction: column;
          gap: 12px;
          padding-top: 2px;
        }
        .rg-diamond {
          position: absolute;
          left: 0; top: 13px;
          width: 7px; height: 7px;
          transform: rotate(45deg);
          flex-shrink: 0;
          transition: transform 0.3s;
        }
        .rg-item:hover > .rg-diamond { transform: rotate(90deg) scale(1.1); }

        .rg-section-label {
          font-style: italic;
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 700;
        }

        .rg-inline-link-group { margin-left: 6px; }

        /* Build cards */
        .rg-build-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .rg-build-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .rg-build-card:hover .rg-build-cover { transform: scale(1.05); }
        .rg-build-label {
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 600;
          font-size: 19px;
        }
        .rg-build-desc {
          font-size: 17px;
          line-height: 1.5;
        }

        /* Sweep-underline link */
        .rg-slink {
          text-decoration: none;
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 700;
          position: relative;
          transition: color 0.2s;
        }
        .rg-slink::after {
          content: '';
          position: absolute;
          left: 0; bottom: -1px;
          width: 100%; height: 1px;
          background: var(--ul);
          z-index: 1;
        }
        .rg-slink::before {
          content: '';
          position: absolute;
          left: 0; bottom: -1px;
          width: 100%; height: 1px;
          background: var(--fg-hover);
          z-index: 2;
          transform: scaleX(0);
          transform-origin: left;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .rg-slink:hover { color: var(--fg-hover); }
        .rg-slink:hover::before {
          opacity: 1;
          animation: sweep 2s ease-in-out infinite;
        }

        @keyframes sweep {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(1); transform-origin: left; }
          50.1%{ transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }

        /* Sublist */
        .rg-sublist {
          list-style: none;
          padding: 0 0 0 16px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rg-subitem {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .rg-arrow {
          position: absolute;
          left: -20px; top: 0;
        }

        /* Projects link */
        .rg-projects-link {
          display: block;
          text-align: center;
          padding: 14px 20px;
          border-radius: 8px;
          border: 1px solid;
          text-decoration: none;
          font-size: 15px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .rg-projects-link:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
        .rg-projects-link:active { transform: scale(0.98); }

        /* Education */
        .rg-education {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
          width: 100%;
        }
        .rg-education-card {
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid;
          border-radius: 8px;
          padding: 15px 17px;
          text-align: left;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          font-family: inherit;
          font-size: inherit;
          width: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        .rg-education-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .rg-education-card:hover .rg-education-chevron {
          transform: translateX(3px);
          opacity: 1;
        }
        .rg-education-card:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }
        .rg-education-chevron {
          margin-left: 8px;
          font-size: 18px;
          opacity: 0.55;
          flex-shrink: 0;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }

        /* Education detail modal */
        .rg-edu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: rgEduFade 0.22s ease-out;
        }
        .rg-edu-modal {
          position: relative;
          width: 100%;
          max-width: 600px;
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          border-radius: 16px;
          padding: 36px 32px 30px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
          animation: rgEduSlide 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .rg-edu-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .rg-edu-close:hover { transform: scale(1.08); }
        .rg-edu-head {
          display: flex;
          gap: 18px;
          align-items: center;
          margin-bottom: 28px;
          padding-right: 36px;
        }
        .rg-edu-logo {
          width: 58px;
          height: 58px;
          object-fit: contain;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .rg-edu-title {
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 500;
          font-size: 22px;
          line-height: 1.25;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .rg-edu-sub {
          font-size: 14px;
          line-height: 1.4;
        }
        .rg-edu-section { margin-bottom: 22px; }
        .rg-edu-section:last-child { margin-bottom: 0; }
        .rg-edu-heading {
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .rg-edu-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .rg-edu-list li {
          display: flex;
          gap: 10px;
          align-items: baseline;
          font-size: 15px;
          line-height: 1.55;
        }
        .rg-edu-bullet {
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 13px;
          flex-shrink: 0;
        }
        .rg-edu-reflection {
          font-size: 15px;
          line-height: 1.65;
          font-style: italic;
          margin: 0;
          padding-left: 14px;
        }
        @keyframes rgEduFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rgEduSlide {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 500px) {
          .rg-edu-backdrop { padding: 16px; }
          .rg-edu-modal { padding: 30px 22px 24px; border-radius: 14px; }
          .rg-edu-title { font-size: 19px; }
          .rg-edu-logo { width: 50px; height: 50px; }
          .rg-edu-list li { font-size: 14px; }
          .rg-edu-reflection { font-size: 14px; }
        }
        .rg-education-logo {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .rg-education-title {
          font-family: 'NeueMontreal-Medium', sans-serif;
          font-weight: 500;
          font-size: 19px;
        }
        .rg-education-years {
          font-size: 15px;
          line-height: 1.4;
        }
        .rg-education-details {
          font-size: 18px;
          line-height: 1.5;
        }

        /* CTA */
        .rg-cta { font-size: 18px; margin: 10px 0 0; }
        .rg-cta-link {
          text-decoration: none;
          border-bottom: 1px solid currentColor;
          transition: opacity 0.2s;
        }
        .rg-cta-link:hover { opacity: 1; }

        /* Signature with sweep reveal */
        .rg-signature-img {
          width: 180px;
          height: auto;
          -webkit-mask-image: linear-gradient(to right, black 0%, black 45%, transparent 50%);
          mask-image: linear-gradient(to right, black 0%, black 45%, transparent 50%);
          -webkit-mask-size: 230% 100%;
          mask-size: 230% 100%;
          -webkit-mask-position: 100% 0;
          mask-position: 100% 0;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }
        .rg-signature-img.rg-sig-animate {
          animation: sig-write 2.5s cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s both;
        }
        @keyframes sig-write {
          0%   { -webkit-mask-position: 100% 0; mask-position: 100% 0; }
          100% { -webkit-mask-position: 0% 0;   mask-position: 0% 0; }
        }

        /* Footer */
        .rg-footer { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
        .rg-socials { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
        .rg-copyright {
          line-height: 1.5;
        }
        .rg-copyright-made {
          opacity: 0.85;
        }
        @media (max-width: 500px) {
          .rg-copyright {
            font-size: 13px;
          }
          .rg-copyright-made {
            display: block;
            margin-top: 2px;
            font-size: 12px;
          }
        }

        @media (max-width: 900px) {
          .rg-container {
            max-width: min(680px, calc(100vw - clamp(20px, 3vw, 48px) - 32px));
          }
          .rg-ascii-backdrop {
            opacity: 0.55;
            width: 42vw;
          }
        }

        @media (max-width: 500px) {
          .rg-container {
            margin-left: clamp(16px, 4vw, 24px);
            max-width: calc(100vw - clamp(16px, 4vw, 24px) - 16px);
            padding: 40px 16px 100px 0;
          }
          .rg-header {
            align-items: flex-start;
            gap: 12px;
          }
          .rg-nav {
            gap: 12px;
            flex-wrap: wrap;
          }
          .rg-list { font-size: 19px; }
          .rg-build-card { padding: 16px; }
          .rg-ascii-backdrop {
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100vw;
            height: 50vh;
            opacity: 1;
            align-items: center;
          }
          .rg-ascii-backdrop-mobile {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
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
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        color: hovered ? hoverColor : color,
        textDecoration: 'none',
        transition: 'color 0.3s',
      }}
    >
      <span style={{ display: 'flex', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
        {children}
      </span>
      <span style={{
        display: 'inline-block',
        overflow: 'hidden',
        width: hovered ? 'auto' : 0,
        maxWidth: hovered ? 80 : 0,
        marginLeft: hovered ? 6 : 0,
        opacity: hovered ? 1 : 0,
        fontSize: 15,
        whiteSpace: 'nowrap',
        transition: 'max-width 0.5s ease, opacity 0.5s ease, margin-left 0.3s ease',
      }}>
        {label}
      </span>
    </a>
  );
}

function BulletItem({ diamond, children }: { diamond: string; children: React.ReactNode }) {
  return (
    <li className="rg-item">
      <div className="rg-diamond" style={{ background: diamond }} />
      {children}
    </li>
  );
}

/* ══════════════════════════════════════════════════════════
   Site loader + Page curl / AbdullahOS launcher
   ══════════════════════════════════════════════════════════ */

type AppPhase = 'loading' | 'site' | 'peeling' | 'desktop';

function SiteLoader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'fade' | 'done'>('loading');

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      const speed = Math.max(0.6, 3.5 * (1 - p / 100));
      p = Math.min(100, p + speed);
      setProgress(p);
      if (p >= 100) clearInterval(interval);
    }, 25);

    const t1 = setTimeout(() => setPhase('fade'), 2200);
    const t2 = setTimeout(() => {
      setPhase('done');
      onDone();
    }, 2800);

    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  if (phase === 'done') return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001, background: '#f5f5f4',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'fade' ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div style={{ width: 56, height: 56, animation: 'siteLoad 0.6s ease-out' }}>
        <AbdullahAsciiLogo width={56} height={56} color="#57534e" opacity={0.95} />
      </div>
      <div style={{
        marginTop: 24, width: 180, height: 3, borderRadius: 2,
        background: 'rgba(0,0,0,0.08)', overflow: 'hidden',
        animation: 'siteLoad 0.6s ease-out',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: '#57534e', borderRadius: 2,
          transition: 'width 0.08s linear',
        }} />
      </div>
      <style>{`
        @keyframes siteLoad {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/** ryo.lu-style page peel — CSS clip-path + layered gradients + spring transition */

function OSCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="os-close-btn"
      aria-label="Close AbdullahOS"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      <style>{`
        .os-close-btn {
          position: fixed;
          top: 36px;
          right: 16px;
          z-index: 10002;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 0.5px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.55);
          color: rgba(0,0,0,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(12px);
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .os-close-btn:hover {
          background: rgba(255,255,255,0.75);
          color: rgba(0,0,0,0.8);
          transform: scale(1.1);
        }
      `}</style>
    </button>
  );
}

export default function PortfolioApp() {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [expanded, setExpanded] = useState(false);

  const handleLoaded = useCallback(() => {
    setPhase('site');
  }, []);

  const handleClose = useCallback(() => {
    setExpanded(false);
    setPhase('site');
  }, []);

  // Toggle peek open/close
  const peelTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const togglePeek = useCallback(() => {
    if (!expanded) {
      setExpanded(true);
      // After the clip-path transition finishes, switch to full desktop mode
      peelTimer.current = setTimeout(() => setPhase('desktop'), 700);
    }
  }, [expanded]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (expanded || phase === 'desktop')) {
        clearTimeout(peelTimer.current);
        setExpanded(false);
        setPhase('site');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, phase]);

  return (
    <ThemeProvider siteReady={phase !== 'loading'}>
      {/* Portfolio page — the main content (hidden but not unmounted during desktop phase to avoid remount flash) */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', background: '#f5f5f4', display: (phase === 'loading' || phase === 'site') ? undefined : 'none' }}>
        <Inner />
      </div>

      {/* Corner fold — static, click to expand into AbdullahOS */}
      {(phase === 'site' || phase === 'desktop') && (
        <div className={`peek-container ${expanded ? 'peek-expanded' : ''}`}>
          <div className="peek-desktop">
            <Suspense fallback={<div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/wallpaper/wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />}>
              <LazyDesktopShell skipBoot />
            </Suspense>
            {phase === 'desktop' && <OSCloseButton onClose={handleClose} />}
          </div>
          <div
            className={`page-curl ${expanded ? 'curl-hidden' : ''}`}
            onClick={togglePeek}
            role="button"
            aria-label="Open AbdullahOS"
          >
            <span className="page-curl-chip">abdullahos →</span>
          </div>
          <div
            className={`peek-hint ${expanded ? 'curl-hidden' : ''}`}
            onClick={togglePeek}
            role="button"
            aria-label="Open AbdullahOS"
          >
            <span className="peek-hint-text">open abdullahos</span>
            <span className="peek-hint-arrow" aria-hidden="true">↗</span>
          </div>
        </div>
      )}

      <style>{`
        .peek-container {
          position: fixed;
          top: 0;
          right: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 999;
          overflow: visible;
        }
        .peek-desktop {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          pointer-events: auto;
          clip-path: polygon(
            calc(100% - 200px) 0%,
            100% 0%,
            100% 200px,
            calc(100% - 200px) 0%
          );
          transition: clip-path 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peek-expanded .peek-desktop {
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
        .page-curl {
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          pointer-events: auto;
          cursor: pointer;
          z-index: 1001;
          background:
            linear-gradient(225deg, transparent 48%, rgba(0,0,0,0.08) 49.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 51%, transparent 53%);
          transition: opacity 0.3s linear;
        }
        .page-curl-chip { display: none; }
        .peek-hint {
          position: absolute;
          top: 110px;
          right: 18px;
          z-index: 1002;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(20, 20, 20, 0.82);
          color: #f5f5f4;
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 12px;
          letter-spacing: 0.02em;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 8px 22px rgba(0,0,0,0.22), inset 0 0 0 0.5px rgba(255,255,255,0.08);
          cursor: pointer;
          pointer-events: auto;
          opacity: 0;
          animation: peekHintReveal 0.5s ease-out 1.1s forwards, peekHintFloat 2.6s ease-in-out 1.6s infinite;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
          user-select: none;
        }
        .peek-hint:hover {
          background: rgba(20, 20, 20, 0.94);
          box-shadow: 0 10px 28px rgba(0,0,0,0.32), inset 0 0 0 0.5px rgba(255,255,255,0.12);
        }
        .peek-hint-arrow {
          display: inline-block;
          font-size: 13px;
          animation: peekHintArrow 1.8s ease-in-out 1.6s infinite;
        }
        @keyframes peekHintReveal {
          0% { opacity: 0; transform: translateY(-4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes peekHintFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes peekHintArrow {
          0%, 100% { transform: translate(0, 0); opacity: 0.88; }
          50% { transform: translate(2px, -2px); opacity: 1; }
        }
        .curl-hidden {
          opacity: 0 !important;
          pointer-events: none;
        }
        body.blackbook-active .peek-container {
          display: none !important;
        }
        @media (max-width: 768px) {
          .peek-desktop {
            clip-path: polygon(
              calc(100% - 130px) 0%,
              100% 0%,
              100% 130px,
              calc(100% - 130px) 0%
            );
          }
          .page-curl {
            width: 150px;
            height: 60px;
            background: none;
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            padding: 14px 14px 0 0;
          }
          .page-curl-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 13px;
            border-radius: 999px;
            background: rgba(20, 20, 20, 0.88);
            color: #f5f5f4;
            font-family: 'SF Mono', 'Menlo', monospace;
            font-size: 11px;
            letter-spacing: 0.02em;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 4px 14px rgba(0,0,0,0.2);
            pointer-events: none;
          }
          .peek-hint {
            display: none;
          }
          .os-close-btn {
            top: 14px;
            right: 14px;
          }
        }
      `}</style>

      {/* Loading overlay */}
      {phase === 'loading' && (
        <SiteLoader onDone={handleLoaded} />
      )}

    </ThemeProvider>
  );
}
