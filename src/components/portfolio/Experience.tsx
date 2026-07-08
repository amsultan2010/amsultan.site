import { useState, useEffect, useRef } from 'react';
import ExperienceCard from './ExperienceCard';
import type { ExperienceDetail, DetailContent } from './DetailPanel';

interface ExperienceProps {
  onCardClick?: (detail: DetailContent) => void;
}

const Experience = ({ onCardClick }: ExperienceProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const experienceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

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
        marginTop: '80px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 10,
        width: '90%',
        maxWidth: '1200px',
        minWidth: '320px',
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      <h2 style={{
        fontSize: '1.5rem',
        color: 'rgba(255, 255, 255, 0.75)',
        fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
        fontStyle: 'italic',
        margin: '0 0 1rem 0',
        fontWeight: '500'
      }}>
        Experience
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            clickable={true}
            onDetailClick={onCardClick ? () => onCardClick(experience.detail) : undefined}
          />
        ))}
      </div>

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
