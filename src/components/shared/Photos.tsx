import { useState, useEffect, useRef, useCallback } from 'react';
import { photos } from '../../data/photos';

interface PhotosProps {
  windowMode?: boolean;
}

/* Lazy-loaded thumbnail that only renders the <img> when visible */
function LazyThumb({ thumb, alt, onClick }: { thumb: string; alt: string; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        aspectRatio: '1',
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: '2px',
        position: 'relative',
        background: '#1a1a1f',
        containIntrinsicSize: '140px 140px',
        contentVisibility: 'auto',
      } as React.CSSProperties}
      className="photos-grid-item"
    >
      {visible && (
        <img
          src={thumb}
          alt={alt}
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
}

const Photos = ({ windowMode }: PhotosProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const selected = selectedPhoto !== null ? photos[selectedPhoto] : null;

  // Keyboard navigation
  useEffect(() => {
    if (selectedPhoto === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && selectedPhoto < photos.length - 1) setSelectedPhoto(selectedPhoto + 1);
      if (e.key === 'ArrowLeft' && selectedPhoto > 0) setSelectedPhoto(selectedPhoto - 1);
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedPhoto]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(15, 15, 20, 0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '0 0 12px 12px',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)',
        gap: '12px',
        flexShrink: 0,
      }}>
        {selectedPhoto !== null ? (
          <>
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                cursor: 'pointer',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              All Photos
            </button>
            <div style={{ flex: 1 }} />
            <span style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.35)',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            }}>
              {selectedPhoto + 1} of {photos.length}
            </span>
          </>
        ) : (
          <>
            <span style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 600,
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            }}>
              All Photos
            </span>
            <div style={{ flex: 1 }} />
            <span style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.35)',
              fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            }}>
              {photos.length} photos
            </span>
          </>
        )}
      </div>

      {/* Content */}
      {selectedPhoto !== null && selected ? (
        /* Expanded single photo view — loads full-size original */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          minHeight: 0,
          position: 'relative',
        }}>
          {/* Navigation arrows */}
          {selectedPhoto > 0 && (
            <button
              onClick={() => setSelectedPhoto(selectedPhoto - 1)}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                backdropFilter: 'blur(8px)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {selectedPhoto < photos.length - 1 && (
            <button
              onClick={() => setSelectedPhoto(selectedPhoto + 1)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                backdropFilter: 'blur(8px)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          <img
            src={selected.src}
            alt={selected.alt}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100% - 60px)',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          />
          <div style={{
            marginTop: '12px',
            textAlign: 'center',
          }}>
            {selected.caption && (
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '13px',
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                margin: 0,
                fontWeight: 500,
              }}>
                {selected.caption}
              </p>
            )}
            {selected.createdAt && (
              <p style={{
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '11px',
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                margin: '4px 0 0',
              }}>
                {new Date(selected.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Grid view — uses compressed thumbnails */
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '4px',
          }}>
            {photos.map((photo, i) => (
              <LazyThumb
                key={i}
                thumb={photo.thumb}
                alt={photo.alt}
                onClick={() => setSelectedPhoto(i)}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .photos-grid-item {
          transition: transform 0.2s ease;
        }
        .photos-grid-item:hover {
          transform: scale(1.03);
          z-index: 1;
        }
        .photos-grid-item img {
          transition: filter 0.2s ease;
        }
        .photos-grid-item:hover img {
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default Photos;
