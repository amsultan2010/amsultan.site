import { useState, useEffect, useRef } from 'react';
import { getTagColor } from './tagColors';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';

interface BlogProps {
  onContentClick?: (content: ContentViewData) => void;
}

const Blog = ({ onContentClick }: BlogProps) => {
  const [titleAnimated, setTitleAnimated] = useState(false);
  const [animatedCards, setAnimatedCards] = useState(new Set<string>());
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const blogPosts = [
    {
      slug: "abdullahos-overview",
      title: "abdullahOS overview",
      summary: "desktop-style portfolio w/ draggable windows, app interactions, photos, projects, and static links.",
      tags: ["Astro", "React"],
      readingTime: 2,
      publishedAt: "2026-01-01"
    },
    {
      slug: "abdullahos-parts",
      title: "app map",
      summary: "about, projects, photos, contact, github, youtube music, terminal, and abdullahOS.",
      tags: ["desktop", "apps"],
      readingTime: 2,
      publishedAt: "2026-01-02"
    },
  ];

  // Chunk posts into rows of 3
  const rows: typeof blogPosts[] = [];
  for (let i = 0; i < blogPosts.length; i += 3) {
    rows.push(blogPosts.slice(i, i + 3));
  }
  const totalRows = rows.length;
  const currentRow = rows[activeRow] || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('blog-title')) {
              setTitleAnimated(true);
            } else {
              const id = (entry.target as HTMLElement).dataset.blogId;
              if (id) setAnimatedCards(prev => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );

    const title = sectionRef.current?.querySelector('.blog-title');
    const cards = sectionRef.current?.querySelectorAll('.blog-card');
    if (title) observer.observe(title);
    if (cards) cards.forEach(c => observer.observe(c));

    return () => observer.disconnect();
  }, [animatedCards, activeRow]);

  // Re-trigger card animations on row change
  useEffect(() => {
    currentRow.forEach(post => {
      setAnimatedCards(prev => new Set([...prev, post.slug]));
    });
  }, [activeRow]);

  const handleCardClick = (slug: string) => {
    const data = contentMap[slug];
    if (data && onContentClick) {
      onContentClick(data);
    }
  };

  const handlePrev = () => {
    setActiveRow(prev => (prev - 1 + totalRows) % totalRows);
  };

  const handleNext = () => {
    setActiveRow(prev => (prev + 1) % totalRows);
  };

  return (
    <div
      ref={sectionRef}
      id="blog"
      className="blog-container"
      style={{
        position: 'relative',
        marginTop: '80px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 10,
        width: '90%',
        maxWidth: '1200px',
        minWidth: '320px',
        overflow: 'hidden',
        paddingBottom: '80px'
      }}
    >
      <h2
        className="blog-title"
        style={{
          fontSize: '1.5rem',
          color: 'rgba(255, 255, 255, 0.75)',
          fontFamily: 'NeueMontreal-MediumItalic, sans-serif',
          fontStyle: 'italic',
          margin: '0 0 1rem 0',
          fontWeight: '500',
          opacity: titleAnimated ? 1 : 0,
          transform: titleAnimated ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
        }}
      >
        My Thoughts
      </h2>

      {/* Cards grid — shows one row at a time */}
      <div
        key={activeRow}
        className="blog-row-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          width: '100%',
          animation: 'blogRowFadeIn 0.4s ease-out forwards'
        }}
      >
        {currentRow.map((post) => {
          const isAnimated = animatedCards.has(post.slug);
          return (
            <div
              key={post.slug}
              data-blog-id={post.slug}
              className={`blog-card glass-blog-card ${isAnimated ? 'animated' : ''}`}
              onClick={() => handleCardClick(post.slug)}
              onMouseEnter={() => setHoveredSlug(post.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              style={{ cursor: 'pointer' }}
            >
              <h3 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'NeueMontreal-Medium, sans-serif',
                margin: '0 0 0.75rem',
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                {post.title}
              </h3>

              <p style={{
                color: 'rgba(255, 255, 255, 0.55)',
                fontSize: '0.9rem',
                fontFamily: 'NeueMontreal-Light, sans-serif',
                lineHeight: '1.5',
                margin: '0 0 1rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {post.summary}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {post.tags.map((tag, i) => {
                  const tc = getTagColor(tag);
                  return (
                    <span key={i} className="blog-tag-pill" style={{
                      fontSize: '0.7rem',
                      fontFamily: 'NeueMontreal-Light, sans-serif',
                      color: tc.text,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      background: tc.bg,
                      border: `0.5px solid ${tc.border}`
                    }}>
                      {tag}
                    </span>
                  );
                })}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontFamily: 'NeueMontreal-Medium, sans-serif',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  Read →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation: dots + arrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {rows.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveRow(i)}
              style={{
                width: activeRow === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: activeRow === i ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              aria-label={`Go to row ${i + 1}`}
            />
          ))}
        </div>

        {/* Down/Up arrow */}
        <button
          onClick={activeRow < totalRows - 1 ? handleNext : handlePrev}
          className="blog-nav-btn"
          aria-label={activeRow < totalRows - 1 ? 'Next row' : 'Previous row'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: activeRow < totalRows - 1 ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes blogRowFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glass-blog-card {
          position: relative;
          background: rgba(128, 128, 128, 0.12);
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          overflow: hidden;
          box-sizing: border-box;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        .glass-blog-card.animated {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .glass-blog-card h3,
        .glass-blog-card p,
        .glass-blog-card span {
          transition: color 0.3s ease !important;
        }
        .glass-blog-card:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          transform: translateZ(10px) scale(1.02);
          transition: all 0.3s ease;
        }
        .glass-blog-card:hover h3,
        .glass-blog-card:hover p,
        .glass-blog-card:hover span:not(.blog-tag-pill) {
          color: rgb(255, 255, 255) !important;
        }
        .blog-tag-pill {
          transition: all 0.3s ease !important;
        }
        .glass-blog-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }
        .blog-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .blog-nav-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.8);
        }
        @media (max-width: 768px) {
          .blog-container { width: calc(95% - 40px) !important; min-width: 300px !important; padding: 0 20px 80px 20px !important; }
          .blog-row-container { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .blog-container { width: calc(98% - 40px) !important; min-width: 280px !important; padding: 0 20px 80px 20px !important; }
          .blog-row-container { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Blog;
