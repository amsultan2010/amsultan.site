import { useState, useEffect, useRef } from 'react';
import ExperienceCard from './ExperienceCard';
import { ExperienceContent } from './DetailPanel';
import type { ExperienceDetail, DetailContent } from './DetailPanel';

interface ExperienceProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

const Experience = ({ onCardClick, windowMode }: ExperienceProps) => {
  const [hasAnimated, setHasAnimated] = useState(windowMode ?? false);
  const [selectedDetail, setSelectedDetail] = useState<ExperienceDetail | null>(null);
  const [viewState, setViewState] = useState<'list' | 'fading-out' | 'detail' | 'fading-back'>('list');
  const experienceRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (windowMode) return;
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, [windowMode]);

  const experiences = [
    {
      id: 0,
      company: "the lab",
      role: "featured project",
      date: "Current",
      location: "Riyadh, Saudi Arabia",
      description: "interactive playground — ascii instrument, chronograph, terminal easter egg.",
      logo: "/terminal.png",
      detail: {
        type: 'experience' as const,
        id: 0,
        company: "the lab",
        role: "featured project",
        date: "Current",
        location: "Riyadh, Saudi Arabia",
        logo: "/terminal.png",
        timeline: [
          { month: "Now", description: "Replaced the macOS clone with a smaller expressive playground." }
        ],
        reflection: "Keep the personal DNA without the glass dock.",
        skillsLearned: ["Three.js", "Motion", "Product thinking"],
        techStack: ["Astro", "React", "Three.js"]
      } satisfies ExperienceDetail
    },
    {
      id: 1,
      company: "tutoringbyabdullah",
      role: "education product",
      date: "Current",
      location: "Riyadh, Saudi Arabia",
      description: "education service focused on understanding, not memorizing.",
      logo: "/icons/folder.png",
      detail: {
        type: 'experience' as const,
        id: 1,
        company: "tutoringbyabdullah",
        role: "education product",
        date: "Current",
        location: "Riyadh, Saudi Arabia",
        logo: "/icons/folder.png",
        timeline: [
          { month: "Shipped", description: "Live site with teaching style and recommendations." }
        ],
        reflection: "Building useful vertical products in education.",
        skillsLearned: ["Product", "Education", "Operations"],
        techStack: ["Web", "Product"]
      } satisfies ExperienceDetail
    },
    {
      id: 2,
      company: "quant suite",
      role: "technical proof",
      date: "2025–2026",
      location: "Riyadh, Saudi Arabia",
      description: "python backtesters and options tools as proof of systems thinking.",
      logo: "/icons/folder.png",
      detail: {
        type: 'experience' as const,
        id: 2,
        company: "quant suite",
        role: "technical proof",
        date: "2025–2026",
        location: "Riyadh, Saudi Arabia",
        logo: "/icons/folder.png",
        timeline: [
          { month: "Shipped", description: "Backtester, portfolio, and options pricer as Flask/Plotly apps." }
        ],
        reflection: "Quant as technical proof, not identity.",
        skillsLearned: ["Python", "Finance", "Research"],
        techStack: ["Python", "Pandas", "Plotly"]
      } satisfies ExperienceDetail
    }
  ];

  return (
    <div
      ref={experienceRef}
      id="experience"
      className="experience-container"
      style={{
        position: 'relative',
        marginTop: windowMode ? '0' : '80px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 10,
        width: windowMode ? '100%' : '90%',
        maxWidth: windowMode ? 'none' : '1200px',
        minWidth: windowMode ? 'auto' : '320px',
        padding: windowMode ? '0' : undefined,
        height: windowMode ? '100%' : undefined,
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      {windowMode ? (
        /* Window mode: inline page transitions */
        <div ref={scrollRef} style={{
          height: '100%',
          overflowY: 'auto',
          position: 'relative',
        }}>
          {/* ── LIST VIEW ── */}
          <div style={{
            padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.25rem, 2.5vw, 2rem) clamp(0.5rem, 1vw, 0.75rem)',
            opacity: viewState === 'list' ? 1 : viewState === 'fading-out' ? 0 : 0,
            transform: viewState === 'list' ? 'scale(1)' : 'scale(0.97)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: (viewState === 'list') ? 'auto' : 'none',
            position: (viewState === 'detail' || viewState === 'fading-back') ? 'absolute' : 'relative',
            inset: 0,
          }}>
            <h2 style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-MediumItalic, sans-serif',
              fontStyle: 'italic',
              margin: '0 0 0.75rem 0',
              fontWeight: '600'
            }}>
              Experience
            </h2>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', paddingLeft: '28px' }}>
              {/* Cross-card timeline pipe */}
              <div style={{
                position: 'absolute',
                left: '8px',
                top: '24px',
                bottom: '24px',
                width: '2px',
                background: 'rgba(255, 255, 255, 0.12)',
                zIndex: 1,
              }} />
              {/* Glow overlay on timeline */}
              <div style={{
                position: 'absolute',
                left: '7px',
                top: '24px',
                bottom: '24px',
                width: '4px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.3) 100%)',
                filter: 'blur(1.5px)',
                borderRadius: '2px',
                zIndex: 1,
                opacity: 0.7,
              }} />
              {experiences.map((experience, idx) => (
                <div key={experience.id} style={{ position: 'relative' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: (experience as any).isFeatured ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.35)',
                    border: `2px solid ${(experience as any).isFeatured ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                    boxShadow: (experience as any).isFeatured ? '0 0 10px rgba(255,255,255,0.2), 0 0 4px rgba(255,255,255,0.1)' : '0 0 4px rgba(255,255,255,0.08)',
                    zIndex: 2,
                    transition: 'all 0.3s ease',
                  }} />
                  <ExperienceCard
                    experience={experience}
                    clickable={true}
                    onDetailClick={() => {
                      setSelectedDetail(experience.detail);
                      setViewState('fading-out');
                      setTimeout(() => {
                        setViewState('detail');
                        scrollRef.current?.scrollTo({ top: 0 });
                      }, 300);
                    }}
                    darkMode
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── DETAIL VIEW ── */}
          {selectedDetail && (viewState === 'detail' || viewState === 'fading-back') && (
            <div style={{
              padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 2.5rem)',
              opacity: viewState === 'detail' ? 1 : 0,
              transform: viewState === 'detail' ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}>
              {/* Back button */}
              <button
                onClick={() => {
                  setViewState('fading-back');
                  setTimeout(() => {
                    setSelectedDetail(null);
                    setViewState('list');
                  }, 300);
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)', fontSize: '13px',
                  fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                  padding: '4px 0', marginBottom: '1.25rem',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Experience
              </button>

              <ExperienceContent detail={selectedDetail} />
            </div>
          )}
        </div>
      ) : (
        /* Non-window mode: original light layout */
        <>
          <h2 style={{
            fontSize: '1.2rem',
            color: '#1d1d1f',
            fontFamily: '-apple-system, BlinkMacSystemFont, NeueMontreal-MediumItalic, sans-serif',
            fontStyle: 'italic',
            margin: '0 0 1rem 0',
            fontWeight: '600'
          }}>
            Experience
          </h2>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', paddingLeft: '28px' }}>
            {/* Cross-card timeline pipe */}
            <div style={{
              position: 'absolute',
              left: '8px',
              top: '24px',
              bottom: '24px',
              width: '2px',
              background: 'rgba(0, 0, 0, 0.12)',
              zIndex: 1,
            }} />
            {experiences.map((experience) => (
              <div key={experience.id} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: (experience as any).isFeatured ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.25)',
                  border: `2px solid ${(experience as any).isFeatured ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)'}`,
                  zIndex: 2,
                }} />
                <ExperienceCard
                  experience={experience}
                  clickable={true}
                  onDetailClick={onCardClick ? () => onCardClick(experience.detail) : undefined}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @font-face {
          font-family: 'NeueMontreal-MediumItalic';
          src: url('/NeueMontreal-MediumItalic.otf') format('opentype');
          font-weight: 500;
          font-style: italic;
        }
        @media (max-width: 1200px) {
          .experience-container { width: 95% !important; min-width: 300px !important; padding: 0 20px !important; }
        }
        @media (max-width: 768px) {
          .experience-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default Experience;
