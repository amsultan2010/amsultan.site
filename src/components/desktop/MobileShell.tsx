import { useState } from 'react';
import Education from '../desktop-portfolio/Education';
import Experience from '../desktop-portfolio/Experience';
import Projects from '../desktop-portfolio/Projects';
import Blog from '../desktop-portfolio/Blog';
import DetailPanel from '../desktop-portfolio/DetailPanel';
import ContentViewer from '../desktop-portfolio/ContentViewer';
import type { DetailContent } from '../desktop-portfolio/DetailPanel';
import type { ContentViewData } from '../desktop-portfolio/ContentViewer';
import { HiAcademicCap } from 'react-icons/hi2';
import { BsBriefcaseFill, BsGithub, BsYoutube } from 'react-icons/bs';
import { FaCode } from 'react-icons/fa6';
import { HiPencilSquare } from 'react-icons/hi2';

type SectionId = 'education' | 'experience' | 'projects' | 'blog' | null;

const SECTIONS = [
  { id: 'education' as const, label: 'education', icon: <HiAcademicCap size={20} />, color: '#667eea' },
  { id: 'experience' as const, label: 'Experience', icon: <BsBriefcaseFill size={18} />, color: '#f5576c' },
  { id: 'projects' as const, label: 'Projects', icon: <FaCode size={18} />, color: '#4facfe' },
  { id: 'blog' as const, label: 'abdullahOS', icon: <HiPencilSquare size={18} />, color: '#fa709a' },
];

export default function MobileShell() {
  const [activeSection, setActiveSection] = useState<SectionId>(null);
  const [activeDetail, setActiveDetail] = useState<DetailContent | null>(null);
  const [activeContent, setActiveContent] = useState<ContentViewData | null>(null);

  const handleCardClick = (detail: DetailContent) => setActiveDetail(detail);
  const handleContentClick = (content: ContentViewData) => setActiveContent(content);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: '#0b1220',
      color: 'white',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Background image */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(/images/wallpaper/wallpaper.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
      }} />

      {/* Dark overlay for readability */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.6) 100%)',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '60px 20px 120px' }}>
        {/* Terminal card */}
        <div style={{
          background: 'rgba(10, 15, 26, 0.85)',
          backdropFilter: 'saturate(140%) blur(20px)',
          WebkitBackdropFilter: 'saturate(140%) blur(20px)',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '0',
          marginBottom: '24px',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          {/* Title bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
            </div>
            <span style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: "'SF Mono', monospace",
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)',
            }}>
              github.com/amsultan2010 — zsh
            </span>
            <div style={{ width: '42px' }} />
          </div>

          {/* Terminal content */}
          <div style={{
            padding: '16px 18px',
            fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
            fontSize: '13px',
            lineHeight: 1.7,
            color: '#e6e9ef',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'white', marginBottom: '10px' }}>
              Abdullah Sultan — Student builder
            </div>
            <div style={{ marginBottom: '2px' }}>
              <span style={{ color: '#ff79c6' }}>Location:</span> Riyadh, Saudi Arabia
            </div>
            <div style={{ marginBottom: '2px' }}>
              <span style={{ color: '#f1fa8c' }}>Email:</span> abdullahmsultan1@gmail.com
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: '#8be9fd' }}>GitHub:</span> github.com/amsultan2010
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', fontSize: '12px' }}>
              I build systems that think, design that feels, and code that connects ideas to impact.
            </div>
          </div>
        </div>

        {/* Section grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '20px',
        }}>
          {SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(10, 15, 26, 0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                cursor: 'pointer',
                color: 'white',
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
            >
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: section.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {section.icon}
              </div>
              {section.label}
            </button>
          ))}
        </div>

        {/* External links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
          <ExternalLink href="https://github.com/amsultan2010" icon={<BsGithub size={20} />} label="GitHub" />
          <ExternalLink href="mailto:abdullahmsultan1@gmail.com" icon={<span style={{ fontSize: '18px' }}>✉</span>} label="Email" />
          <ExternalLink href="https://music.youtube.com/@amsultan303" icon={<BsYoutube size={20} />} label="YouTube Music" />
        </div>
      </div>

      {/* Section full-screen overlay */}
      {activeSection && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(10, 15, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflowY: 'auto',
          animation: 'slideUp 0.25s ease-out',
        }}>
          {/* Header */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'rgba(10, 15, 26, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button
              onClick={() => setActiveSection(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#4facfe',
                fontSize: '15px',
                cursor: 'pointer',
                fontFamily: "'SF Pro Text', sans-serif",
                padding: '4px 0',
              }}
            >
              ← back
            </button>
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '13px',
              color: 'rgba(255,255,255,0.6)',
            }}>
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </span>
            <div style={{ width: '50px' }} />
          </div>

          {/* Section content */}
          <div style={{ paddingBottom: '40px' }}>
            {activeSection === 'education' && <Education onCardClick={handleCardClick} windowMode />}
            {activeSection === 'experience' && <Experience onCardClick={handleCardClick} windowMode />}
            {activeSection === 'projects' && <Projects onCardClick={handleCardClick} windowMode />}
            {activeSection === 'blog' && <Blog onContentClick={handleContentClick} windowMode />}
          </div>
        </div>
      )}

      {/* Detail panel */}
      {activeDetail && (
        <DetailPanel
          detail={activeDetail}
          onClose={() => setActiveDetail(null)}
        />
      )}

      {/* Content viewer */}
      {activeContent && (
        <ContentViewer
          content={activeContent}
          onClose={() => setActiveContent(null)}
        />
      )}

      <style>{`
        :root {
          color-scheme: dark;
          -webkit-font-smoothing: antialiased;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function ExternalLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const isMailto = href.startsWith('mailto:');
  return (
    <a
      href={href}
      target={isMailto ? undefined : '_blank'}
      rel={isMailto ? undefined : 'noopener noreferrer'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: 'rgba(255,255,255,0.6)',
        textDecoration: 'none',
        fontSize: '11px',
        fontFamily: "'SF Pro Text', sans-serif",
        transition: 'color 0.15s ease',
      }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      {label}
    </a>
  );
}
