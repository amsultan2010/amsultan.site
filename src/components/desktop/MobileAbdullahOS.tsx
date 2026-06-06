import { useState, useEffect } from 'react';
import Education from '../desktop-portfolio/Education';
import Experience from '../desktop-portfolio/Experience';
import Projects from '../desktop-portfolio/Projects';
import Blog from '../desktop-portfolio/Blog';
import Photos from '../desktop-portfolio/Photos';
import Watchlist from '../desktop-portfolio/Watchlist';
import DetailPanel from '../desktop-portfolio/DetailPanel';
import ContentViewer from '../desktop-portfolio/ContentViewer';
import type { DetailContent } from '../desktop-portfolio/DetailPanel';
import type { ContentViewData } from '../desktop-portfolio/ContentViewer';
import AbdullahAsciiLogo from './AbdullahAsciiLogo';
import { BsLinkedin, BsInstagram } from 'react-icons/bs';

type SectionId = 'education' | 'experience' | 'projects' | 'blog' | 'photos' | 'watchlist' | null;

const SECTION_LABELS: Record<NonNullable<SectionId>, string> = {
  education: 'Education',
  experience: 'About',
  projects: 'Projects',
  photos: 'Photos',
  blog: 'abdullahOS',
  watchlist: 'Watchlist',
};

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const STATUS_MESSAGES = [
  'coding something cool',
  'procrastinating productively',
  'over-engineering a side project',
  'drinking too much matcha',
  'vibecoding with claude',
];

function MobileStatus() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % STATUS_MESSAGES.length);
        setVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.38)',
      letterSpacing: '0.04em', marginTop: 4, fontFamily: "'SF Mono',monospace",
      opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
      position: 'relative',
    }}>
      {STATUS_MESSAGES[idx]}
    </div>
  );
}

function ImgIcon({ src, alt, bg = 'transparent', contain = false }: { src: string; alt: string; bg?: string; contain?: boolean }) {
  return (
    <div style={{ width: 58, height: 58, borderRadius: 14, overflow: 'hidden', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', flexShrink: 0 }}>
      <img src={src} alt={alt} draggable={false} style={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', pointerEvents: 'none' }} />
    </div>
  );
}

function GradIcon({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return (
    <div style={{ width: 58, height: 58, borderRadius: 14, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', flexShrink: 0 }}>
      {children}
    </div>
  );
}

function SectionSheet({ section, onClose, onCardClick, onContentClick }: {
  section: NonNullable<SectionId>;
  onClose: () => void;
  onCardClick: (d: DetailContent) => void;
  onContentClick: (c: ContentViewData) => void;
}) {
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', flexDirection: 'column', background: 'rgba(6,8,14,0.97)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', animation: 'aosSheetIn 0.3s cubic-bezier(0.22,1,0.36,1)' }}>
      <header style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: 'max(10px,env(safe-area-inset-top)) 16px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', background: 'rgba(6,8,14,0.85)' }}>
        <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 20, padding: '8px 14px', color: '#93c5fd', fontSize: 15, fontWeight: 500, fontFamily: "'SF Pro Text',-apple-system,sans-serif", cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>Done</button>
        <h2 style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: "'SF Pro Text',-apple-system,sans-serif" }}>{SECTION_LABELS[section]}</h2>
        <div style={{ width: 72 }} />
      </header>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: 'max(24px,env(safe-area-inset-bottom))' }}>
        {section === 'education'  && <Education  onCardClick={onCardClick}    windowMode />}
        {section === 'experience' && <Experience onCardClick={onCardClick}    windowMode />}
        {section === 'projects'   && <Projects   onCardClick={onCardClick}    windowMode />}
        {section === 'photos'     && <Photos      windowMode />}
        {section === 'blog'       && <Blog        onContentClick={onContentClick} windowMode />}
        {section === 'watchlist'  && <Watchlist   windowMode />}
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

  // 8 grid apps
  const gridApps = [
    { id: 'photos',    label: 'Photos',    icon: <ImgIcon src="/icons/photos.png" alt="Photos" />,          action: () => setActiveSection('photos') },
    { id: 'gmail',     label: 'Gmail',     icon: <ImgIcon src="/images/logosicons/gmail.png" alt="Gmail" bg="#fff" contain />, action: () => { window.location.href = 'mailto:abdullahmsultan1@gmail.com'; } },
    { id: 'watchlist', label: 'Netflix',   icon: <ImgIcon src="/images/logosicons/netflix.png" alt="Netflix" bg="#141414" contain />, action: () => setActiveSection('watchlist') },
    { id: 'github',    label: 'GitHub',    icon: <GradIcon gradient="linear-gradient(145deg,#2a2a2a,#454545)"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg></GradIcon>, action: () => window.open('https://github.com/amsultan2010', '_blank') },
    { id: 'music',     label: 'Music',     icon: <ImgIcon src="/images/logosicons/youtubemusic.png" alt="Music" bg="#fff" contain />, action: () => window.open('https://music.youtube.com/@amsultan303', '_blank') },
    { id: 'linkedin',  label: 'LinkedIn',  icon: <GradIcon gradient="linear-gradient(145deg,#0a66c2,#004182)"><BsLinkedin size={28} color="#fff" /></GradIcon>, action: () => window.open('https://www.linkedin.com/in/abdullah-sultan-4a264939a/', '_blank') },
    { id: 'instagram', label: 'Instagram', icon: <GradIcon gradient="linear-gradient(145deg,#833ab4,#fd1d1d 55%,#fcb045)"><BsInstagram size={28} color="#fff" /></GradIcon>, action: () => window.open('https://www.instagram.com/a.m.sultan_/', '_blank') },
    { id: 'projects',  label: 'VS Code',   icon: <ImgIcon src="/vscode.png" alt="VS Code" bg="#fff" contain />, action: () => setActiveSection('projects') },
  ];

  // 3 dock apps
  const dockApps = [
    { id: 'about', label: 'About', icon: (
      <div style={{ width: 58, height: 58, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>
        <img src="/images/myimage.jpg" alt="About" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
      </div>
    ), action: () => setActiveSection('experience') },
    { id: 'blog', label: 'abdullahOS', icon: (
      <div style={{ width: 58, height: 58, borderRadius: 14, background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>
        <AbdullahAsciiLogo width={48} height={48} color="#fff" opacity={0.92} />
      </div>
    ), action: () => setActiveSection('blog') },
    { id: 'terminal', label: 'Terminal', icon: (
      <div style={{ width: 58, height: 58, borderRadius: 14, background: 'linear-gradient(145deg,#2c2c2e,#1c1c1e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', gap: 2 }}>
        <span style={{ fontFamily: "'SF Mono',monospace", color: '#fff', fontSize: 18, fontWeight: 300 }}>{'>'}</span>
        <span style={{ display: 'inline-block', width: 7, height: 2, background: '#fff', marginTop: 5 }} />
      </div>
    ), action: () => window.open('https://github.com/amsultan2010', '_blank') },
  ];

  return (
    <div className="aos-mobile-root" style={{ position: 'fixed', top: 28, left: 0, right: 0, bottom: 0, zIndex: 5000, display: 'flex', flexDirection: 'column', fontFamily: "'SF Pro Text',-apple-system,BlinkMacSystemFont,sans-serif", touchAction: 'manipulation', animation: 'aosHomeIn 0.45s ease-out' }}>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '20px max(18px,env(safe-area-inset-right)) 100px max(18px,env(safe-area-inset-left))' }}>

          {/* Clock */}
          <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 12, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '90%', height: '120%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
              pointerEvents: 'none', filter: 'blur(24px)',
            }} />
            <div className="aos-clock-time" style={{
              fontSize: 'clamp(68px,17vw,88px)', fontWeight: 100, color: '#fff',
              letterSpacing: '-4px', lineHeight: 1,
              fontFamily: "'SF Pro Display',-apple-system,sans-serif",
              textShadow: '0 0 80px rgba(255,255,255,0.12), 0 4px 32px rgba(0,0,0,0.5)',
              position: 'relative',
            }}>{timeStr}</div>
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', position: 'relative' }}>{dateStr}</div>
            <MobileStatus />
          </div>

          {/* App grid — 4 columns, 2 rows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px 8px', justifyItems: 'center' }}>
            {gridApps.map((app, i) => (
              <button key={app.id} type="button" onClick={app.action} className="aos-app-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, width: '100%', maxWidth: 76, background: 'none', border: 'none', padding: 0, cursor: 'pointer', WebkitTapHighlightColor: 'transparent', animation: `aosIconIn 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both` }}>
                {app.icon}
                <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.6)', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom dock — 3 apps */}
      <div style={{ flexShrink: 0, padding: '10px max(16px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))', background: 'linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.55) 40%)' }}>
        <div style={{ maxWidth: 320, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 8, padding: '14px 24px', borderRadius: 26, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(60px) saturate(200%) brightness(1.06)', WebkitBackdropFilter: 'blur(60px) saturate(200%) brightness(1.06)', border: '0.5px solid rgba(255,255,255,0.22)', boxShadow: '0 10px 40px rgba(0,0,0,0.45), inset 0 0.5px 0 rgba(255,255,255,0.28)' }}>
          {dockApps.map(app => (
            <button key={app.id} type="button" onClick={app.action} aria-label={app.label} className="aos-dock-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              {app.icon}
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{app.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeSection && <SectionSheet section={activeSection} onClose={() => setActiveSection(null)} onCardClick={setActiveDetail} onContentClick={setActiveContent} />}
      {activeDetail  && <div style={{ position: 'fixed', inset: 0, zIndex: 10100, animation: 'aosPushIn 0.3s ease-out' }}><DetailPanel detail={activeDetail} onClose={() => setActiveDetail(null)} /></div>}
      {activeContent && <div style={{ position: 'fixed', inset: 0, zIndex: 10100, animation: 'aosPushIn 0.3s ease-out' }}><ContentViewer content={activeContent} onClose={() => setActiveContent(null)} /></div>}

      <style>{`
        @keyframes aosHomeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes aosSheetIn { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes aosPushIn { from{transform:translateX(20%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes aosIconIn { from{opacity:0;transform:translateY(14px) scale(0.85)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes clockGlow { 0%,100%{text-shadow:0 0 80px rgba(255,255,255,0.12),0 4px 32px rgba(0,0,0,0.5)} 50%{text-shadow:0 0 100px rgba(255,255,255,0.18),0 0 40px rgba(59,130,246,0.08),0 4px 32px rgba(0,0,0,0.5)} }
        .aos-mobile-root * { -webkit-tap-highlight-color:transparent; }

        /* Clock subtle pulse */
        .aos-clock-time { animation: clockGlow 4s ease-in-out infinite; }

        /* App icon press */
        .aos-app-btn { transition: transform 0.12s cubic-bezier(0.22,1,0.36,1), opacity 0.12s; }
        .aos-app-btn:active { transform: scale(0.88) !important; opacity: 0.75; }

        /* Dock app press */
        .aos-dock-btn { transition: transform 0.12s cubic-bezier(0.22,1,0.36,1), opacity 0.12s; }
        .aos-dock-btn:active { transform: scale(0.86) !important; opacity: 0.7; }

        /* Sheet header done button */
        .aos-sheet-done:active { opacity: 0.6; transform: scale(0.96); }
      `}</style>
    </div>
  );
}
