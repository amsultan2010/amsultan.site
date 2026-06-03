import { useState } from 'react';
import Education from '../desktop-portfolio/Education';
import Experience from '../desktop-portfolio/Experience';
import Projects from '../desktop-portfolio/Projects';
import Blog from '../desktop-portfolio/Blog';
import Watchlist from '../desktop-portfolio/Watchlist';
import Photos from '../desktop-portfolio/Photos';
import DetailPanel from '../desktop-portfolio/DetailPanel';
import ContentViewer from '../desktop-portfolio/ContentViewer';
import AbdullahAsciiLogo from './AbdullahAsciiLogo';
import type { DetailContent } from '../desktop-portfolio/DetailPanel';
import type { ContentViewData } from '../desktop-portfolio/ContentViewer';
import { BsGithub, BsInstagram, BsLinkedin } from 'react-icons/bs';

type SectionId = 'education' | 'experience' | 'projects' | 'blog' | 'watchlist' | 'photos' | 'github' | 'music' | 'linkedin' | 'instagram' | null;

interface AppDef {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

function ImgIcon({ src, bg = '#111' }: { src: string; bg?: string }) {
  return (
    <div style={{ width: 56, height: 56, borderRadius: 14, background: bg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
    </div>
  );
}
function GradIcon({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return (
    <div style={{ width: 56, height: 56, borderRadius: 14, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
}

const GRID_APPS: AppDef[] = [
  { id: 'photos',    label: 'Photos',    icon: <ImgIcon src="/icons/photos.png" /> },
  { id: null,        label: 'Gmail',     icon: <ImgIcon src="/images/logosicons/gmail.png" bg="#fff" />, href: 'mailto:abdullahmsultan1@gmail.com' },
  { id: 'watchlist', label: 'Netflix',   icon: <ImgIcon src="/images/logosicons/netflix.png" bg="#141414" /> },
  { id: null,        label: 'GitHub',    icon: <GradIcon gradient="linear-gradient(145deg,#2d2d2d,#434343)"><BsGithub size={30} color="#fff" /></GradIcon>, href: 'https://github.com/amsultan2010' },
  { id: null,        label: 'Music',     icon: <ImgIcon src="/images/logosicons/youtubemusic.png" bg="#fff" />, href: 'https://music.youtube.com/@amsultan303' },
  { id: null,        label: 'LinkedIn',  icon: <GradIcon gradient="linear-gradient(145deg,#0a66c2,#004182)"><BsLinkedin size={28} color="#fff" /></GradIcon>, href: 'https://www.linkedin.com/in/abdullah-sultan-4a264939a/' },
  { id: null,        label: 'Instagram', icon: <GradIcon gradient="linear-gradient(145deg,#833ab4,#fd1d1d 55%,#fcb045)"><BsInstagram size={28} color="#fff" /></GradIcon>, href: 'https://www.instagram.com/a.m.sultan_/' },
  { id: 'projects',  label: 'VS Code',   icon: <ImgIcon src="/vscode.png" bg="#fff" /> },
];

const DOCK_APPS: AppDef[] = [
  { id: 'education', label: 'About',    icon: <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden' }}><img src="/images/myimage.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} /></div> },
  { id: 'blog',      label: 'abdullahOS', icon: <div style={{ width: 56, height: 56, borderRadius: 14, background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AbdullahAsciiLogo width={46} height={46} color="#fff" opacity={0.9} /></div> },
  { id: null,        label: 'Terminal', icon: <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(145deg,#2c2c2e,#1c1c1e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: "'SF Mono',monospace", color: '#fff', fontSize: 20, fontWeight: 300 }}>{'>'}_</span></div>, href: 'https://github.com/amsultan2010' },
];

export default function MobileShell() {
  const [active, setActive] = useState<SectionId>(null);
  const [activeDetail, setActiveDetail] = useState<DetailContent | null>(null);
  const [activeContent, setActiveContent] = useState<ContentViewData | null>(null);

  const open = (app: AppDef) => {
    if (app.href) { window.open(app.href, app.href.startsWith('mailto') ? '_self' : '_blank'); return; }
    if (app.id) setActive(app.id);
  };

  const SECTION_LABEL: Record<string, string> = {
    education: 'About', experience: 'Experience', projects: 'VS Code',
    blog: 'abdullahOS', watchlist: 'Netflix', photos: 'Photos',
  };

  return (
    <div className="ms-root">
      <div className="ms-bg" />
      <div className="ms-scroll">
        <div className="ms-status">
          <span style={{ fontFamily: "'SF Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>abdullahOS</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>◉ online</span>
        </div>

        {/* Hero */}
        <div className="ms-hero">
          <img src="/images/myimage.jpg" alt="Abdullah Sultan" className="ms-photo" />
          <div className="ms-hero-grad" />
          <div className="ms-hero-text">
            <div className="ms-name">Abdullah<br />Sultan</div>
            <div className="ms-role">student builder · riyadh</div>
          </div>
        </div>

        {/* 8-app grid: 4 per row */}
        <div className="ms-grid">
          {GRID_APPS.map((app, i) => (
            <button key={i} className="ms-app" onClick={() => open(app)}>
              {app.icon}
              <span className="ms-app-label">{app.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fixed bottom dock */}
      <div className="ms-dock">
        <div className="ms-dock-inner">
          {DOCK_APPS.map((app, i) => (
            <button key={i} className="ms-dock-btn" onClick={() => open(app)}>
              {app.icon}
              <span className="ms-dock-label">{app.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Full-screen overlay */}
      {active && (
        <div className="ms-overlay">
          <div className="ms-bar">
            <button className="ms-back" onClick={() => setActive(null)}>← back</button>
            <span className="ms-bar-title">{SECTION_LABEL[active] ?? active}</span>
            <div style={{ width: 50 }} />
          </div>
          <div className="ms-body">
            {active === 'education'  && <Education  onCardClick={setActiveDetail}     windowMode />}
            {active === 'experience' && <Experience onCardClick={setActiveDetail}     windowMode />}
            {active === 'projects'   && <Projects   onCardClick={setActiveDetail}     windowMode />}
            {active === 'blog'       && <Blog        onContentClick={setActiveContent} windowMode />}
            {active === 'watchlist'  && <Watchlist   windowMode />}
            {active === 'photos'     && <Photos      windowMode />}
          </div>
        </div>
      )}

      {activeDetail  && <DetailPanel   detail={activeDetail}   onClose={() => setActiveDetail(null)} />}
      {activeContent && <ContentViewer content={activeContent} onClose={() => setActiveContent(null)} />}

      <style>{`
        .ms-root { position:relative; min-height:100svh; background:#060a0f; color:#fff; font-family:'Inter','SF Pro Text',-apple-system,sans-serif; overflow:hidden; -webkit-font-smoothing:antialiased; }
        .ms-bg { position:fixed; inset:0; background-image:url(/images/wallpaper/wallpaper.jpg); background-size:cover; background-position:center; opacity:0.12; z-index:0; }
        .ms-scroll { position:relative; z-index:1; overflow-y:auto; padding-bottom:120px; min-height:100svh; }
        .ms-status { display:flex; justify-content:space-between; padding:14px 20px 6px; }

        .ms-hero { position:relative; width:100%; height:clamp(170px,48vw,260px); overflow:hidden; flex-shrink:0; }
        .ms-photo { width:100%; height:100%; object-fit:cover; object-position:top center; display:block; }
        .ms-hero-grad { position:absolute; inset:0; background:linear-gradient(90deg,rgba(6,10,15,0.92) 0%,rgba(6,10,15,0.55) 40%,transparent 72%); }
        .ms-hero-text { position:absolute; left:20px; bottom:16px; }
        .ms-name { font-size:clamp(22px,7vw,30px); font-weight:800; line-height:1.0; letter-spacing:-0.03em; }
        .ms-role { font-family:'SF Mono',monospace; font-size:10px; color:rgba(255,255,255,0.45); letter-spacing:0.1em; text-transform:uppercase; margin-top:5px; }

        .ms-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; padding:18px 14px 10px; }
        .ms-app { display:flex; flex-direction:column; align-items:center; gap:5px; background:none; border:none; cursor:pointer; padding:6px 2px; -webkit-tap-highlight-color:transparent; }
        .ms-app:active { opacity:0.7; transform:scale(0.93); }
        .ms-app-label { font-size:10px; font-weight:500; color:rgba(255,255,255,0.75); letter-spacing:0.01em; text-align:center; width:64px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        .ms-dock { position:fixed; bottom:0; left:0; right:0; z-index:100; padding:0 20px 20px; background:linear-gradient(0deg,rgba(6,10,15,0.95) 60%,transparent); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); }
        .ms-dock-inner { display:flex; justify-content:space-around; align-items:center; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:10px 8px; }
        .ms-dock-btn { display:flex; flex-direction:column; align-items:center; gap:4px; background:none; border:none; cursor:pointer; padding:4px 10px; -webkit-tap-highlight-color:transparent; }
        .ms-dock-btn:active { opacity:0.7; transform:scale(0.92); }
        .ms-dock-label { font-size:10px; font-weight:500; color:rgba(255,255,255,0.6); }

        .ms-overlay { position:fixed; inset:0; z-index:200; background:rgba(6,10,15,0.97); display:flex; flex-direction:column; animation:msUp 0.22s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes msUp { from{transform:translateY(20px);opacity:0} to{transform:none;opacity:1} }
        .ms-bar { position:sticky; top:0; z-index:10; display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(6,10,15,0.92); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); }
        .ms-back { background:none; border:none; color:#64B5F6; font-size:14px; font-weight:500; cursor:pointer; padding:4px 0; font-family:'Inter',sans-serif; }
        .ms-bar-title { font-family:'SF Mono',monospace; font-size:11px; color:rgba(255,255,255,0.4); letter-spacing:0.08em; text-transform:uppercase; }
        .ms-body { flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding-bottom:40px; }
      `}</style>
    </div>
  );
}
