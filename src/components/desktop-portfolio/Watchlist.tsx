import { useEffect, useRef, useState } from 'react';

interface WatchlistProps {
  windowMode?: boolean;
}

type Kind = 'book' | 'movie' | 'show';

interface Media {
  kind: Kind;
  title: string;
  meta: string;
  cover: string;
}

const WATCHLIST: Media[] = [
  { kind: 'book',  title: 'Never Eat Alone',                    meta: 'Keith Ferrazzi',     cover: '/images/watchlist/books/never-eat-alone.jpg' },
  { kind: 'book',  title: "The Qur'an",                         meta: 'Holy Scripture',     cover: '/images/watchlist/books/quran.jpg' },
  { kind: 'book',  title: 'How to Become a Straight-A Student', meta: 'Cal Newport',        cover: '/images/watchlist/books/straight-a-student.jpg' },
  { kind: 'movie', title: 'Interstellar',                       meta: '2014 · Sci-Fi',      cover: '/images/watchlist/movies/interstellar.jpg' },
  { kind: 'movie', title: 'F1',                                 meta: '2025 · Drama',       cover: '/images/watchlist/movies/f1.jpg' },
  { kind: 'movie', title: 'The Message',                        meta: '1976 · Epic',        cover: '/images/watchlist/movies/the-message.jpg' },
  { kind: 'movie', title: 'Whiplash',                           meta: '2014 · Drama',       cover: '/images/watchlist/movies/whiplash.jpg' },
  { kind: 'movie', title: 'Gladiator',                          meta: '2000 · Epic',        cover: '/images/watchlist/movies/gladiator.jpg' },
  { kind: 'show',  title: 'Invincible',                         meta: '2021– · Animated',   cover: '/images/watchlist/shows/invincible.jpg' },
  { kind: 'show',  title: 'Suits',                              meta: '2011–2019 · Legal',  cover: '/images/watchlist/shows/suits.jpg' },
  { kind: 'show',  title: 'The Pitt',                           meta: '2025– · Medical',    cover: '/images/watchlist/shows/the-pitt.jpg' },
  { kind: 'show',  title: 'The Fresh Prince of Bel-Air',        meta: '1990–1996 · Sitcom', cover: '/images/watchlist/shows/fresh-prince.jpg' },
];

const HERO = WATCHLIST.find(m => m.title === 'Interstellar')!;
const CAPTION = 'my favorite books, movies, and shows that i keep coming back to.';

export default function Watchlist(_props: WatchlistProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const books = WATCHLIST.filter(m => m.kind === 'book');
  const movies = WATCHLIST.filter(m => m.kind === 'movie');
  const shows = WATCHLIST.filter(m => m.kind === 'show');

  return (
    <div className="nflx-root" style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: '#141414',
      color: '#fff',
      fontFamily: "'Netflix Sans', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      WebkitFontSmoothing: 'antialiased',
      position: 'relative',
    }}>
      <TopBar />
      <Hero media={HERO} isMobile={isMobile} />
      <div style={{ padding: isMobile ? '0 0 80px' : '0 0 64px' }}>
        <Row title="My Books" items={books} isMobile={isMobile} />
        <Row title="My Movies" items={movies} isMobile={isMobile} />
        <Row title="My Shows" items={shows} isMobile={isMobile} />
      </div>

      <style>{`
        .nflx-row-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .nflx-row-scroll::-webkit-scrollbar { display: none; }
        .nflx-card-poster {
          transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s ease;
          will-change: transform;
        }
        .nflx-card:hover .nflx-card-poster {
          transform: scale(1.08);
          box-shadow: 0 12px 32px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.06);
        }
        .nflx-card-overlay {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.25s ease 0.05s, transform 0.25s ease 0.05s;
        }
        .nflx-card:hover .nflx-card-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        .nflx-arrow {
          opacity: 0;
          transition: opacity 0.2s ease, background 0.2s ease;
        }
        .nflx-row:hover .nflx-arrow { opacity: 1; }
        .nflx-arrow:hover { background: rgba(0,0,0,0.85) !important; }
        @media (hover: none) {
          .nflx-arrow { display: none !important; }
        }
        @keyframes nflxFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nflx-hero-fade { animation: nflxFadeIn 0.5s ease-out both; }
      `}</style>
    </div>
  );
}

// ── Top Bar ────────────────────────────────────────────────
function TopBar() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 'clamp(10px, 1.6vw, 16px) clamp(16px, 4vw, 40px)',
      background: 'linear-gradient(180deg, rgba(20,20,20,0.96) 0%, rgba(20,20,20,0.75) 70%, rgba(20,20,20,0) 100%)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src="/images/logosicons/netflix.png"
          alt="Netflix"
          style={{ width: 'clamp(28px, 3vw, 36px)', height: 'clamp(28px, 3vw, 36px)', borderRadius: 6, display: 'block' }}
          draggable={false}
        />
        <div style={{
          fontSize: 'clamp(13px, 1.3vw, 15px)',
          fontWeight: 700, letterSpacing: '-0.01em', color: '#fff',
        }}>
          Abdullah's Watchlist
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <SearchIcon />
        <ProfileDot />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function ProfileDot() {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 6,
      background: 'linear-gradient(135deg, #f97316, #b91c1c)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: '#fff',
      letterSpacing: '-0.02em',
    }}>
      a
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────
function Hero({ media, isMobile }: { media: Media; isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="nflx-hero-fade" style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 4',
        maxHeight: '72vh',
        overflow: 'hidden',
        background: '#000',
        marginTop: -60,
      }}>
        <img
          src={media.cover}
          alt={media.title}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 20%',
          }}
          draggable={false}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(20,20,20,0.55) 0%, rgba(20,20,20,0) 30%, rgba(20,20,20,0.1) 55%, rgba(20,20,20,0.96) 100%)',
        }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 16,
          padding: '0 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#e50914', fontWeight: 800,
          }}>
            ★ Featured Pick
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', 'SF Pro Display', sans-serif",
            fontSize: 'clamp(34px, 10vw, 52px)',
            fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 0.95,
            textShadow: '0 4px 18px rgba(0,0,0,0.85)',
            textAlign: 'center',
          }}>
            {media.title}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600,
          }}>
            <span>{media.meta.split(' · ')[0]}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
            <span style={{
              padding: '1px 6px', border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 3, fontSize: 10, letterSpacing: '0.04em',
            }}>HD</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
            <span>{media.meta.split(' · ')[1] ?? 'Pick'}</span>
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.45,
            textAlign: 'center', maxWidth: 320,
            textShadow: '0 1px 6px rgba(0,0,0,0.7)',
          }}>
            {CAPTION}
          </div>
          <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 360, marginTop: 4 }}>
            <PillBtn primary>▶ Play</PillBtn>
            <PillBtn>＋ My List</PillBtn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nflx-hero-fade" style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '16 / 7',
      minHeight: 260,
      maxHeight: 460,
      overflow: 'hidden',
      background: '#000',
      marginTop: -56,
    }}>
      <img
        src={media.cover}
        alt={media.title}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 18%',
          filter: 'saturate(1.05)',
        }}
        draggable={false}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(20,20,20,0.94) 0%, rgba(20,20,20,0.55) 38%, rgba(20,20,20,0.05) 68%, rgba(20,20,20,0) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(20,20,20,0) 55%, rgba(20,20,20,0.92) 100%)',
      }} />
      <div style={{
        position: 'absolute', left: 'clamp(20px, 4vw, 56px)', bottom: 'clamp(28px, 5vw, 56px)',
        maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#e50914', fontWeight: 700,
        }}>
          ★ Featured Pick
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', 'SF Pro Display', sans-serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1,
          textShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}>
          {media.title}
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.5, maxWidth: 460,
          textShadow: '0 1px 8px rgba(0,0,0,0.6)',
        }}>
          {CAPTION}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <PillBtn primary>▶ Featured: {media.meta}</PillBtn>
          <PillBtn>＋ My List</PillBtn>
        </div>
      </div>
    </div>
  );
}

function PillBtn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <div style={{
      flex: '1 1 auto',
      padding: '10px 18px', borderRadius: 4,
      background: primary ? '#fff' : 'rgba(109,109,110,0.7)',
      color: primary ? '#000' : '#fff',
      fontWeight: 700, fontSize: 13, letterSpacing: '0.01em',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      whiteSpace: 'nowrap', textAlign: 'center',
      cursor: 'default',
    }}>
      {children}
    </div>
  );
}

// ── Row ────────────────────────────────────────────────────
function Row({ title, items, isMobile }: { title: string; items: Media[]; isMobile: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const sidePad = isMobile ? 'clamp(16px, 4vw, 20px)' : 'clamp(20px, 4vw, 56px)';

  return (
    <div className="nflx-row" style={{
      position: 'relative',
      padding: isMobile ? '20px 0 4px' : '28px 0 6px',
    }}>
      <h2 style={{
        margin: '0 0 12px',
        padding: `0 ${sidePad}`,
        fontSize: isMobile ? 17 : 'clamp(15px, 1.4vw, 19px)',
        fontWeight: 700,
        color: '#e5e5e5',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h2>

      {!isMobile && canLeft && (
        <button
          className="nflx-arrow"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-25%)',
            zIndex: 6, width: 'clamp(36px, 4vw, 56px)', height: 'clamp(90px, 12vw, 150px)',
            background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer',
            fontSize: 26, fontWeight: 700, borderTopRightRadius: 4, borderBottomRightRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>
      )}
      {!isMobile && canRight && (
        <button
          className="nflx-arrow"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-25%)',
            zIndex: 6, width: 'clamp(36px, 4vw, 56px)', height: 'clamp(90px, 12vw, 150px)',
            background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer',
            fontSize: 26, fontWeight: 700, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      )}

      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="nflx-row-scroll"
        style={{
          display: 'flex',
          gap: isMobile ? 12 : 8,
          padding: `${isMobile ? '8px' : '20px'} ${sidePad} ${isMobile ? '4px' : '20px'}`,
          overflowX: 'auto', overflowY: 'hidden',
          scrollSnapType: isMobile ? 'x mandatory' : 'x proximity',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map(item => (
          <Card key={item.title} item={item} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────
function Card({ item, isMobile }: { item: Media; isMobile: boolean }) {
  if (isMobile) {
    return (
      <div
        className="nflx-card"
        style={{
          flex: '0 0 auto',
          width: '42vw',
          maxWidth: 180,
          minWidth: 138,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          scrollSnapAlign: 'start',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div
          className="nflx-card-poster"
          style={{
            width: '100%',
            aspectRatio: '2 / 3',
            borderRadius: 6,
            overflow: 'hidden',
            background: '#222',
            position: 'relative',
            boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
          }}
        >
          <img
            src={item.cover}
            alt={item.title}
            loading="lazy"
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            color: '#fff', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 6px', borderRadius: 3,
          }}>
            {item.kind === 'book' ? 'Book' : item.kind === 'movie' ? 'Film' : 'Series'}
          </div>
        </div>
        <div style={{ padding: '0 2px', minHeight: 38 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, lineHeight: 1.25, color: '#f5f5f5',
            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {item.title}
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500,
            marginTop: 2, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.meta}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="nflx-card"
      style={{
        flex: '0 0 auto',
        width: 'clamp(150px, 16vw, 210px)',
        scrollSnapAlign: 'start',
        cursor: 'pointer',
      }}
    >
      <div
        className="nflx-card-poster"
        style={{
          width: '100%',
          aspectRatio: '2 / 3',
          borderRadius: 4,
          overflow: 'hidden',
          background: '#222',
          position: 'relative',
        }}
      >
        <img
          src={item.cover}
          alt={item.title}
          loading="lazy"
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          className="nflx-card-overlay"
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            padding: '28px 12px 10px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.82) 60%, rgba(0,0,0,0.92) 100%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            fontSize: 13, fontWeight: 700, lineHeight: 1.2, marginBottom: 3,
            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {item.title}
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500,
          }}>
            {item.meta}
          </div>
        </div>
      </div>
    </div>
  );
}
