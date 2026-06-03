import { useState } from 'react';
import Education from '../desktop-portfolio/Education';
import Experience from '../desktop-portfolio/Experience';
import Projects from '../desktop-portfolio/Projects';
import Blog from '../desktop-portfolio/Blog';
import Watchlist from '../desktop-portfolio/Watchlist';
import DetailPanel from '../desktop-portfolio/DetailPanel';
import ContentViewer from '../desktop-portfolio/ContentViewer';
import type { DetailContent } from '../desktop-portfolio/DetailPanel';
import type { ContentViewData } from '../desktop-portfolio/ContentViewer';

type SectionId = 'education' | 'experience' | 'projects' | 'blog' | 'watchlist' | null;

const APPS: { id: SectionId; label: string; icon: string; accent: string; sub: string }[] = [
  { id: 'experience',  label: 'Experience',  icon: '◈', accent: '#E57373', sub: 'work & projects' },
  { id: 'education',   label: 'Education',   icon: '◉', accent: '#64B5F6', sub: 'schools & awards' },
  { id: 'projects',    label: 'Projects',    icon: '◧', accent: '#81C784', sub: 'code & builds'   },
  { id: 'watchlist',   label: 'Watchlist',   icon: '▶', accent: '#E50914', sub: 'movies & shows'  },
  { id: 'blog',        label: 'abdullahOS',  icon: '⬡', accent: '#FFB74D', sub: 'notes & writing' },
];

export default function MobileShell() {
  const [active, setActive] = useState<SectionId>(null);
  const [activeDetail, setActiveDetail] = useState<DetailContent | null>(null);
  const [activeContent, setActiveContent] = useState<ContentViewData | null>(null);

  return (
    <div className="ms-root">
      <div className="ms-bg" />

      <div className="ms-home">
        {/* Status bar */}
        <div className="ms-status">
          <span>abdullahOS</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>◉ online</span>
        </div>

        {/* Hero — photo with name overlay */}
        <div className="ms-hero">
          <img src="/images/myimage.jpg" alt="Abdullah Sultan" className="ms-photo" />
          <div className="ms-hero-overlay" />
          <div className="ms-hero-text">
            <div className="ms-hero-name">Abdullah<br />Sultan</div>
            <div className="ms-hero-role">student builder</div>
            <div className="ms-hero-loc">◎ Riyadh, Saudi Arabia</div>
          </div>
        </div>

        {/* App grid */}
        <div className="ms-grid">
          {APPS.map(app => (
            <button
              key={app.id}
              className="ms-app"
              onClick={() => setActive(app.id)}
              style={{ '--accent': app.accent } as React.CSSProperties}
            >
              <div className="ms-app-icon">{app.icon}</div>
              <div className="ms-app-label">{app.label}</div>
              <div className="ms-app-sub">{app.sub}</div>
            </button>
          ))}
        </div>

        {/* Links */}
        <div className="ms-links">
          {[
            { href: 'https://github.com/amsultan2010',                   label: 'GitHub',   icon: '⌥' },
            { href: 'mailto:abdullahmsultan1@gmail.com',                  label: 'Email',    icon: '✉' },
            { href: 'https://www.linkedin.com/in/amsultan2010', label: 'LinkedIn', icon: '⊞' },
          ].map(l => (
            <a
              key={l.label}
              href={l.href}
              className="ms-link"
              target={l.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
            >
              <span className="ms-link-icon">{l.icon}</span>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Full-screen section overlay */}
      {active && (
        <div className="ms-overlay">
          <div className="ms-overlay-bar">
            <button className="ms-back" onClick={() => setActive(null)}>← back</button>
            <span className="ms-overlay-title">{APPS.find(a => a.id === active)?.label}</span>
            <div style={{ width: 50 }} />
          </div>
          <div className="ms-overlay-body">
            {active === 'education'  && <Education  onCardClick={setActiveDetail}    windowMode />}
            {active === 'experience' && <Experience onCardClick={setActiveDetail}    windowMode />}
            {active === 'projects'   && <Projects   onCardClick={setActiveDetail}    windowMode />}
            {active === 'blog'       && <Blog        onContentClick={setActiveContent} windowMode />}
            {active === 'watchlist'  && <Watchlist   windowMode />}
          </div>
        </div>
      )}

      {activeDetail  && <DetailPanel   detail={activeDetail}   onClose={() => setActiveDetail(null)} />}
      {activeContent && <ContentViewer content={activeContent} onClose={() => setActiveContent(null)} />}

      <style>{`
        .ms-root {
          position: relative;
          min-height: 100svh;
          background: #050a0f;
          font-family: 'Inter', 'SF Pro Text', -apple-system, sans-serif;
          color: #fff;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .ms-bg {
          position: fixed;
          inset: 0;
          background-image: url(/images/wallpaper/wallpaper.jpg);
          background-size: cover;
          background-position: center;
          opacity: 0.15;
          z-index: 0;
        }
        .ms-home {
          position: relative;
          z-index: 1;
          padding-bottom: 48px;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
        }

        .ms-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px 8px;
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em;
        }

        .ms-hero {
          position: relative;
          width: 100%;
          height: clamp(180px, 52vw, 280px);
          overflow: hidden;
          margin-bottom: 20px;
          flex-shrink: 0;
        }
        .ms-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
        }
        .ms-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(5,10,15,0.93) 0%,
            rgba(5,10,15,0.65) 38%,
            rgba(5,10,15,0.05) 70%,
            transparent 100%
          );
        }
        .ms-hero-text {
          position: absolute;
          left: 20px;
          bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 54%;
        }
        .ms-hero-name {
          font-size: clamp(22px, 7vw, 30px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: #fff;
        }
        .ms-hero-role {
          font-family: 'SF Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 5px;
        }
        .ms-hero-loc {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.03em;
          margin-top: 2px;
        }

        .ms-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 0 16px;
          flex: 1;
        }
        .ms-app {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: 16px 14px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          cursor: pointer;
          text-align: left;
          color: #fff;
          transition: transform 0.12s ease, background 0.12s ease;
          overflow: hidden;
        }
        .ms-app::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent);
          opacity: 0.75;
        }
        .ms-app:active { transform: scale(0.95); background: rgba(255,255,255,0.09); }
        .ms-app-icon { font-size: 20px; color: var(--accent); line-height: 1; }
        .ms-app-label { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; color: #f0eeec; }
        .ms-app-sub { font-size: 11px; color: rgba(255,255,255,0.32); }

        .ms-links {
          display: flex;
          justify-content: center;
          padding: 20px 16px 0;
          gap: 4px;
        }
        .ms-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .ms-link:active { color: rgba(255,255,255,0.9); }
        .ms-link-icon { font-size: 14px; opacity: 0.55; }

        .ms-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(5,10,15,0.97);
          display: flex;
          flex-direction: column;
          animation: msSlideUp 0.22s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes msSlideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .ms-overlay-bar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(5,10,15,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .ms-back {
          background: none;
          border: none;
          color: #64B5F6;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 0;
        }
        .ms-overlay-title {
          font-family: 'SF Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ms-overlay-body {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 40px;
        }
      `}</style>
    </div>
  );
}
