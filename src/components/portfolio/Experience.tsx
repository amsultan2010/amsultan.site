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
      company: "abdullahOS",
      role: "featured project",
      date: "Current",
      location: "Riyadh, Saudi Arabia",
      description: "desktop-style personal portfolio built w/ astro, react, and a macos-inspired ui.",
      logo: "/terminal.png",
      detail: {
        type: 'experience' as const,
        id: 0,
        company: "abdullahOS",
        role: "featured project",
        date: "Current",
        location: "Riyadh, Saudi Arabia",
        logo: "/terminal.png",
        timeline: [
          { month: "Stage 1", description: "Static abdullahOS future shell. Final project details will be added later." }
        ],
        reflection: "abdullahOS is the main custom project app for Abdullah Sultan's portfolio.",
        skillsLearned: ["AI", "Desktop UI", "Creative hardware", "Product thinking"],
        techStack: ["Astro", "React", "TypeScript"]
      } satisfies ExperienceDetail
    },
    {
      id: 1,
      company: "vertical ai",
      role: "product track",
      date: "TBD",
      location: "Riyadh, Saudi Arabia",
      description: "startup and vertical ai product interests across education, automation, and enterprise software.",
      logo: "/icons/folder.png",
      detail: {
        type: 'experience' as const,
        id: 1,
        company: "vertical ai",
        role: "product track",
        date: "TBD",
        location: "Riyadh, Saudi Arabia",
        logo: "/icons/folder.png",
        timeline: [
          { month: "Future", description: "Future startup experience copy goes here." }
        ],
        reflection: "focused on building useful vertical products, not pitch-deck theater.",
        skillsLearned: ["Startups", "Product", "Operations"],
        techStack: ["Future"]
      } satisfies ExperienceDetail
    },
    {
      id: 2,
      company: "robotics automation",
      role: "product track",
      date: "TBD",
      location: "Riyadh, Saudi Arabia",
      description: "robotics, automation, sensors, and creative hardware experiments.",
      logo: "/icons/folder.png",
      detail: {
        type: 'experience' as const,
        id: 2,
        company: "robotics automation",
        role: "product track",
        date: "TBD",
        location: "Riyadh, Saudi Arabia",
        logo: "/icons/folder.png",
        timeline: [
          { month: "Future", description: "Future robotics and hardware experience copy goes here." }
        ],
        reflection: "hands-on systems work across hardware and software.",
        skillsLearned: ["Robotics", "Hardware", "Prototyping"],
        techStack: ["Future"]
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
