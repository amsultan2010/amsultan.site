import { useState, useEffect } from 'react';
import Education from '../desktop-portfolio/Education';
import Experience from '../desktop-portfolio/Experience';
import Blog from '../desktop-portfolio/Blog';
import Photos from '../desktop-portfolio/Photos';
import Watchlist from '../desktop-portfolio/Watchlist';
import DetailPanel from '../desktop-portfolio/DetailPanel';
import ContentViewer from '../desktop-portfolio/ContentViewer';
import type { DetailContent } from '../desktop-portfolio/DetailPanel';
import type { ContentViewData } from '../desktop-portfolio/ContentViewer';
import AbdullahAsciiLogo from './AbdullahAsciiLogo';

type SectionId = 'education' | 'experience' | 'projects' | 'blog' | 'photos' | 'watchlist' | null;

const SECTION_LABELS: Record<NonNullable<SectionId>, string> = {
  education: 'Education',
  experience: 'About',
  projects: 'Projects',
  photos: 'Photos',
  blog: 'AbdullahOS',
  watchlist: 'Watchlist',
};

const MOBILE_PROJECTS = [
  {
    title: 'abdullahOS',
    desc: 'Desktop-style portfolio with draggable windows and static apps.',
    coverImage: '/readme/portfolio-desktop.jpg',
    gradient: 'linear-gradient(145deg, #0f172a 0%, #1e293b 55%, #020617 100%)',
    tech: ['Astro', 'React', 'TypeScript'],
    href: '/desktop',
  },
  {
    title: 'tutoringbyabdullah',
    desc: 'Tutoring platform focused on teaching style and real understanding.',
    coverImage: '/images/projects/tutoringpreview.png',
    gradient: 'linear-gradient(145deg, #111827 0%, #1f2937 55%, #0f172a 100%)',
    tech: ['Education', 'Product'],
    href: 'https://tutoringbyabdullah.xyz',
  },
  {
    title: 'quantbacktesterpy',
    desc: 'SMA crossover backtester with parameter heatmaps.',
    coverImage: '/images/projects/quantbacktesterpy.png',
    gradient: 'linear-gradient(145deg, #0c1222 0%, #1a2332 55%, #050810 100%)',
    tech: ['Python', 'Backtesting'],
    href: 'https://github.com/amsultan2010',
  },
  {
    title: 'quantoptionspy',
    desc: 'Black-Scholes and Monte Carlo options pricer with Greeks.',
    coverImage: '/images/projects/quantoptionspy.png',
    gradient: 'linear-gradient(145deg, #0c1222 0%, #1a2332 55%, #050810 100%)',
    tech: ['Python', 'Options'],
    href: 'https://github.com/amsultan2010',
  },
];

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function AppIcon({ src, alt, scale = 1.05 }: { src: string; alt: string; scale?: number }) {
  const size = 58;
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 14,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
    }}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{ width: size * scale, height: size * scale, objectFit: 'cover', pointerEvents: 'none' }}
      />
    </div>
  );
}

function MobileProjectsList() {
  return (
    <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {MOBILE_PROJECTS.map((proj) => (
        <a
          key={proj.title}
          href={proj.href}
          target={proj.href.startsWith('http') ? '_blank' : undefined}
          rel={proj.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            background: proj.gradient,
            border: '1px solid rgba(255,255,255,0.1)',
            textDecoration: 'none',
            color: 'inherit',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{ height: 140, overflow: 'hidden' }}>
            <img
              src={proj.coverImage}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
            />
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 6 }}>{proj.title}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5, marginBottom: 10 }}>{proj.desc}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {proj.tech.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "'SF Mono', monospace",
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function SectionSheet({
  section,
  onClose,
  onCardClick,
  onContentClick,
}: {
  section: NonNullable<SectionId>;
  onClose: () => void;
  onCardClick: (detail: DetailContent) => void;
  onContentClick: (content: ContentViewData) => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(6, 8, 14, 0.97)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        animation: 'aosSheetIn 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <header style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 'max(10px, env(safe-area-inset-top)) 16px 12px',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        background: 'rgba(6, 8, 14, 0.85)',
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: 20,
            padding: '8px 14px',
            color: '#93c5fd',
            fontSize: 15,
            fontWeight: 500,
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Done
        </button>
        <h2 style={{
          flex: 1,
          margin: 0,
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        }}>
          {SECTION_LABELS[section]}
        </h2>
        <div style={{ width: 72 }} />
      </header>
      <div
        className="aos-mobile-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        {section === 'education' && <Education onCardClick={onCardClick} windowMode />}
        {section === 'experience' && <Experience onCardClick={onCardClick} windowMode />}
        {section === 'projects' && <MobileProjectsList />}
        {section === 'photos' && <Photos windowMode />}
        {section === 'blog' && <Blog onContentClick={onContentClick} windowMode />}
        {section === 'watchlist' && <Watchlist windowMode />}
      </div>
    </div>
  );
}

export default function MobileAbdullahOS() {
  const now = useLiveClock();
  const [activeSection, setActiveSection] = useState<SectionId>(null);
  const [activeDetail, setActiveDetail] = useState<DetailContent | null>(null);
  const [activeContent, setActiveContent] = useState<ContentViewData | null>(null);

  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const apps: { id: string; label: string; icon: React.ReactNode; action: () => void }[] = [
    { id: 'about', label: 'About', icon: <AppIcon src="/images/logosicons/codex.png" alt="About" scale={1} />, action: () => setActiveSection('experience') },
    { id: 'projects', label: 'Projects', icon: <AppIcon src="/vscode.png" alt="Projects" />, action: () => setActiveSection('projects') },
    { id: 'photos', label: 'Photos', icon: <AppIcon src="/icons/photos.png" alt="Photos" />, action: () => setActiveSection('photos') },
    { id: 'blog', label: 'AbdullahOS', icon: (
      <div style={{
        width: 58, height: 58, borderRadius: 14, background: '#050505',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
      }}>
        <AbdullahAsciiLogo width={48} height={48} color="#fff" opacity={0.92} />
      </div>
    ), action: () => setActiveSection('blog') },
    { id: 'watchlist', label: 'Watchlist', icon: <AppIcon src="/images/logosicons/netflix.png" alt="Watchlist" />, action: () => setActiveSection('watchlist') },
    { id: 'gmail', label: 'Mail', icon: <AppIcon src="/images/logosicons/gmail.png" alt="Mail" />, action: () => { window.location.href = 'mailto:abdullahmsultan1@gmail.com'; } },
    { id: 'github', label: 'GitHub', icon: (
      <div style={{
        width: 58, height: 58, borderRadius: 14,
        background: 'linear-gradient(145deg, #2a2a2a, #454545)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </div>
    ), action: () => window.open('https://github.com/amsultan2010', '_blank') },
    { id: 'music', label: 'Music', icon: <AppIcon src="/images/logosicons/youtubemusic.png" alt="Music" />, action: () => window.open('https://music.youtube.com/@amsultan303', '_blank') },
  ];

  const dockApps = apps.slice(0, 4);

  return (
    <div
      className="aos-mobile-root"
      style={{
        position: 'fixed',
        top: 28,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        touchAction: 'manipulation',
        animation: 'aosHomeIn 0.45s ease-out',
      }}
    >
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          maxWidth: 440,
          margin: '0 auto',
          padding: '20px max(18px, env(safe-area-inset-right)) 100px max(18px, env(safe-area-inset-left))',
        }}>
          {/* Clock */}
          <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 8 }}>
            <div style={{
              fontSize: 'clamp(52px, 14vw, 72px)',
              fontWeight: 200,
              color: '#fff',
              letterSpacing: '-2px',
              lineHeight: 1,
              fontFamily: "'SF Pro Display', -apple-system, sans-serif",
              textShadow: '0 2px 24px rgba(0,0,0,0.45)',
            }}>
              {timeStr}
            </div>
            <div style={{
              marginTop: 8,
              fontSize: 15,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.65)',
            }}>
              {dateStr}
            </div>
          </div>

          {/* Profile card */}
          <div style={{
            background: 'rgba(10, 12, 20, 0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 18,
            padding: '16px 18px',
            marginBottom: 28,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Abdullah Sultan</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>Student builder · Riyadh</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.8)' }}>
              Startups, vertical AI, robotics, education, and automation.
            </p>
          </div>

          {/* App grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px 12px',
            justifyItems: 'center',
          }}>
            {apps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={app.action}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  maxWidth: 80,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {app.icon}
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.88)',
                  textAlign: 'center',
                  lineHeight: 1.25,
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}>
                  {app.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom dock */}
      <div style={{
        flexShrink: 0,
        padding: '10px max(16px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 40%)',
      }}>
        <div style={{
          maxWidth: 440,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: 8,
          padding: '12px 16px',
          borderRadius: 22,
          background: 'rgba(255,255,255,0.14)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '0.5px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        }}>
          {dockApps.map((app) => (
            <button
              key={`dock-${app.id}`}
              type="button"
              onClick={app.action}
              aria-label={app.label}
              style={{
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transform: 'scale(0.92)',
              }}
            >
              {app.icon}
            </button>
          ))}
        </div>
      </div>

      {activeSection && (
        <SectionSheet
          section={activeSection}
          onClose={() => setActiveSection(null)}
          onCardClick={setActiveDetail}
          onContentClick={setActiveContent}
        />
      )}

      {activeDetail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10100, animation: 'aosPushIn 0.3s ease-out' }}>
          <DetailPanel detail={activeDetail} onClose={() => setActiveDetail(null)} />
        </div>
      )}

      {activeContent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10100, animation: 'aosPushIn 0.3s ease-out' }}>
          <ContentViewer content={activeContent} onClose={() => setActiveContent(null)} />
        </div>
      )}

      <style>{`
        @keyframes aosHomeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes aosSheetIn {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes aosPushIn {
          from { transform: translateX(20%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .aos-mobile-root * {
          -webkit-tap-highlight-color: transparent;
        }
        .aos-mobile-scroll {
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 768px) {
          .aos-mobile-scroll [style*="minWidth"] {
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
