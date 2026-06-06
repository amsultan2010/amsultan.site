import { useState, useRef, useCallback } from 'react';
import { useDesktop } from './DesktopContext';
import type { WindowId } from './types';
import { BsGithub, BsInstagram, BsLinkedin } from 'react-icons/bs';
import AbdullahAsciiLogo from './AbdullahAsciiLogo';

interface DockItem {
  id: WindowId | 'github' | 'email' | 'music' | 'linkedin' | 'instagram';
  label: string;
  icon: React.ReactNode;
  isExternal?: boolean;
  href?: string;
}

const BASE_SIZE = 108;
const MAX_SIZE = 156;
const MAGNIFY_RANGE = 230; // px range of magnification

/** Inner tile size for icons inside the dock buttons. */
const TILE_SIZE = BASE_SIZE - 6;
/** Glyph size used inside the gradient-tile social icons (github/linkedin
 *  /instagram). Scales with the tile so they fill the same visual area as
 *  the photo-style icons rather than looking tiny. */
const SOCIAL_GLYPH_SIZE = Math.round(TILE_SIZE * 0.6);

export default function DesktopDock() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { state, dispatch } = useDesktop();
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const windowItems: DockItem[] = [
    { id: 'terminal', label: 'terminal', icon: <DockImage src="/usethisTERMIANL.png" alt="terminal" cropScale={1.15} /> },
    { id: 'education', label: 'about', icon: <AboutIcon /> },
    { id: 'projects', label: 'vscode', icon: <DockImage src="/vscode.png" alt="vscode" cropScale={1} contain /> },
    { id: 'blog', label: 'abdullahOS', icon: <DockAsciiLogo /> },
    { id: 'photos', label: 'photos', icon: <DockImage src="/icons/photos.png" alt="photos" /> },
    { id: 'email' as any, label: 'gmail', icon: <DockImage src="/images/logosicons/gmail.png" alt="gmail" cropScale={1} contain /> },
    { id: 'watchlist', label: 'watchlist', icon: <DockImage src="/images/logosicons/netflix.png" alt="watchlist" cropScale={1} contain /> },
  ];

  const externalItems: DockItem[] = [
    { id: 'github', label: 'github', icon: <AppIcon gradient="linear-gradient(135deg, #2d2d2d 0%, #434343 100%)" iconEl={<BsGithub size={SOCIAL_GLYPH_SIZE} color="white" />} />, isExternal: true, href: 'https://github.com/amsultan2010' },
    { id: 'music', label: 'youtube music', icon: <DockImage src="/images/logosicons/youtubemusic.png" alt="youtube music" cropScale={1} contain />, isExternal: true, href: 'https://music.youtube.com/@amsultan303' },
    { id: 'linkedin', label: 'linkedin', icon: <AppIcon gradient="linear-gradient(135deg, #0a66c2 0%, #004182 100%)" iconEl={<BsLinkedin size={SOCIAL_GLYPH_SIZE} color="white" />} />, isExternal: true, href: 'https://www.linkedin.com/in/abdullah-sultan-4a264939a/' },
    { id: 'instagram', label: 'instagram', icon: <AppIcon gradient="linear-gradient(135deg, #833ab4 0%, #fd1d1d 55%, #fcb045 100%)" iconEl={<BsInstagram size={SOCIAL_GLYPH_SIZE} color="white" />} />, isExternal: true, href: 'https://www.instagram.com/a.m.sultan_/' },
  ];

  const allItems = [...windowItems, { id: 'divider' as any, label: '', icon: null }, ...externalItems];

  const handleClick = (item: DockItem) => {
    // Collapse terminal if it's fullscreened before doing anything
    if (state.windows.terminal?.isFullscreen) {
      dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
    }

    if (item.isExternal && item.href) {
      if (item.href.startsWith('mailto:')) {
        window.location.href = item.href;
      } else {
        window.open(item.href, '_blank');
      }
      return;
    }
    const id = item.id as WindowId;

    const win = state.windows[id];
    if (win?.isMinimized) {
      dispatch({ type: 'RESTORE_WINDOW', id });
    } else if (win?.isOpen) {
      dispatch({ type: 'FOCUS_WINDOW', id });
    } else {
      // Reducer handles closing other windows automatically
      dispatch({ type: 'OPEN_WINDOW', id });
    }
  };

  const isOpen = (id: string) => {
    const win = state.windows[id as WindowId];
    return win?.isOpen && !win.isMinimized;
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  // Calculate icon scale based on distance from mouse
  const getScale = (index: number): number => {
    if (mouseX === null) return 1;
    // Calculate center X of each icon slot (keep in sync with the dock
    // container style: padding 24px, gap 10px, divider margin 10px each side)
    const iconCenters: number[] = [];
    let x = 24; // padding-left
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].id === 'divider') {
        x += 1 + 20 + 10; // divider width + horizontal margins + trailing gap
      } else {
        x += BASE_SIZE / 2;
        iconCenters.push(x);
        x += BASE_SIZE / 2 + 10; // half icon + gap
      }
    }

    const center = iconCenters[index];
    if (center === undefined) return 1;
    const dist = Math.abs(mouseX - center);
    if (dist > MAGNIFY_RANGE) return 1;

    const scale = 1 + (MAX_SIZE / BASE_SIZE - 1) * Math.cos((dist / MAGNIFY_RANGE) * (Math.PI / 2));
    return scale;
  };

  let iconIndex = 0;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '50%',
      transform: isMobile ? 'translateX(-50%) scale(0.4)' : 'translateX(-50%)',
      transformOrigin: 'bottom center',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'flex-end',
    }}>
      <div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          padding: '14px 24px',
          borderRadius: '34px',
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'saturate(200%) blur(32px)',
          WebkitBackdropFilter: 'saturate(200%) blur(32px)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 14px 44px rgba(0,0,0,0.16), inset 0 0.5px 0 rgba(255,255,255,0.6)',
        }}
      >
        {allItems.map((item, i) => {
          if (item.id === 'divider') {
            return (
              <div key="divider" style={{
                width: '1px',
                height: '94px',
                background: 'rgba(0,0,0,0.1)',
                margin: '0 10px',
                alignSelf: 'center',
              }} />
            );
          }
          const currentIndex = iconIndex++;
          const scale = getScale(currentIndex);
          return (
            <DockButton
              key={item.id}
              item={item}
              scale={scale}
              isOpen={!('isExternal' in item && item.isExternal) && isOpen(item.id)}
              onClick={() => handleClick(item)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DockButton({ item, scale, isOpen, onClick }: {
  item: DockItem;
  scale: number;
  isOpen: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const size = BASE_SIZE * scale;
  const translateY = -(size - BASE_SIZE) / 2;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip — Apple-style speech bubble above icon */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: `${size + 16 + Math.abs(translateY)}px`,
          padding: '4px 12px',
          borderRadius: '4px',
          background: 'rgba(244, 244, 244, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(0,0,0,0.08)',
          color: 'rgba(0,0,0,0.85)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          lineHeight: '18px',
          letterSpacing: '-0.01em',
        }}>
          {item.label}
          {/* Downward triangle */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(244, 244, 244, 0.92)',
          }} />
        </div>
      )}

      <button
        onClick={onClick}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${12 * scale}px`,
          border: 'none',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${translateY}px)`,
          transition: scale === 1 ? 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          padding: 0,
          position: 'relative',
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'bottom center',
          transition: scale === 1 ? 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }}>
          {item.icon}
        </div>
      </button>

      {/* Open indicator dot */}
      {isOpen && (
        <div style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.92)',
          marginTop: `${2 + translateY}px`,
          boxShadow: '0 0 6px rgba(255,255,255,0.8), 0 0 12px rgba(255,255,255,0.4)',
        }} />
      )}
    </div>
  );
}

// ── Icon Components ────────────────────────────────────────────

function DockImage({ src, alt, cropScale = 1.12, contain = false }: { src: string; alt: string; contain?: boolean; cropScale?: number }) {
  const s = BASE_SIZE - 6;
  return (
    <div style={{
      width: `${s}px`,
      height: `${s}px`,
      borderRadius: '22px',
      overflow: 'hidden',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: `${s * cropScale}px`,
          height: `${s * cropScale}px`,
          objectFit: contain ? 'contain' : 'cover',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function DockAsciiLogo() {
  const s = BASE_SIZE - 6;
  return (
    <div style={{
      width: `${s}px`,
      height: `${s}px`,
      borderRadius: '22px',
      overflow: 'hidden',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050505',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
    }}>
      <AbdullahAsciiLogo width={s - 6} height={s - 6} color="#fff" opacity={0.9} />
    </div>
  );
}

function AboutIcon() {
  const s = BASE_SIZE - 6;
  return (
    <div style={{
      width: `${s}px`, height: `${s}px`, borderRadius: '22px',
      background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.1)',
      overflow: 'hidden', position: 'relative',
    }}>
      <img src="/images/myimage.jpg" alt="about"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', borderRadius: '22px' }} />
    </div>
  );
}

function AppIcon({ gradient, iconEl }: { gradient: string; iconEl: React.ReactNode }) {
  return (
    <div style={{
      width: `${BASE_SIZE - 6}px`,
      height: `${BASE_SIZE - 6}px`,
      borderRadius: '22px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
    }}>
      {iconEl}
    </div>
  );
}

function TerminalIcon() {
  const s = BASE_SIZE - 6;
  return (
    <div style={{
      width: `${s}px`,
      height: `${s}px`,
      borderRadius: '11px',
      overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(180deg, #e0e0e0 0%, #b8b8b8 40%, #a0a0a0 100%)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.3) inset',
    }}>
      {/* Inner black screen */}
      <div style={{
        position: 'absolute',
        inset: '3px',
        borderRadius: '9px',
        background: 'linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 30%, #1c1c1e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
      }}>
        {/* > prompt */}
        <span style={{
          color: '#fff',
          fontSize: '18px',
          fontWeight: 300,
          fontFamily: "'SF Mono', Menlo, monospace",
          lineHeight: 1,
          marginBottom: '2px',
        }}>{'>'}</span>
        {/* _ cursor */}
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '2px',
          background: '#fff',
          marginTop: '6px',
        }} />
      </div>
    </div>
  );
}

function CalendarIcon() {
  const now = new Date();
  const monthStr = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = now.getDate();
  const s = BASE_SIZE - 6;
  return (
    <div style={{
      width: `${s}px`,
      height: `${s}px`,
      borderRadius: '11px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
      background: '#fff',
    }}>
      {/* Red header with month */}
      <div style={{
        height: '15px',
        background: 'linear-gradient(180deg, #ea4335 0%, #d62d20 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: '8.5px',
          fontWeight: 800,
          color: 'white',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          letterSpacing: '0.8px',
          lineHeight: 1,
        }}>
          {monthStr}
        </span>
      </div>
      {/* White body with date number */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #fff 0%, #f8f8f8 100%)',
      }}>
        <span style={{
          fontSize: '20px',
          fontWeight: 300,
          color: '#1a1a1a',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          lineHeight: 1,
          marginTop: '-1px',
        }}>
          {dayNum}
        </span>
      </div>
    </div>
  );
}

function BooksIcon() {
  const s = BASE_SIZE - 6;
  return (
    <div style={{
      width: `${s}px`,
      height: `${s}px`,
      borderRadius: '11px',
      background: 'linear-gradient(180deg, #f5a623 0%, #e88b10 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.1) inset',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5V4.5A2.5 2.5 0 016.5 2z" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.15)" />
        <line x1="8" y1="7" x2="16" y2="7" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="8" y1="10" x2="14" y2="10" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <line x1="8" y1="13" x2="12" y2="13" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      </svg>
    </div>
  );
}
