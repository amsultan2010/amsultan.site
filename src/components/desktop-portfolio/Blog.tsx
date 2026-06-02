import { useState, useRef } from 'react';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';
import MarkdownRenderer from './MarkdownRenderer';

interface BlogProps {
  onContentClick?: (content: ContentViewData) => void;
  windowMode?: boolean;
}

const blogPosts = [
  {
    slug: "abdullahos-overview",
    title: "abdullahOS overview",
    summary: "desktop-style portfolio w/ draggable windows, app interactions, photos, projects, and static links.",
    tags: ["Astro", "React"],
    readingTime: 2,
    publishedAt: "2026-01-01",
    folder: "overview"
  },
  {
    slug: "abdullahos-parts",
    title: "app map",
    summary: "about, projects, photos, contact, github, youtube music, terminal, and abdullahOS.",
    tags: ["desktop", "apps"],
    readingTime: 2,
    publishedAt: "2026-01-02",
    folder: "apps"
  },
];

// Group posts by date section
function groupByDate(posts: typeof blogPosts) {
  const now = new Date();
  const buckets: Record<string, typeof blogPosts> = {};

  posts.forEach(post => {
    const d = new Date(post.publishedAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays <= 7) label = 'Previous 7 Days';
    else if (diffDays <= 30) label = 'Previous 30 Days';
    else if (d.getFullYear() === now.getFullYear()) {
      label = d.toLocaleString('en-US', { month: 'long' });
    } else {
      label = String(d.getFullYear());
    }

    if (!buckets[label]) buckets[label] = [];
    buckets[label].push(post);
  });

  const groups: { label: string; posts: typeof blogPosts }[] = [];
  for (const [label, posts] of Object.entries(buckets)) {
    groups.push({ label, posts });
  }
  return groups;
}

const folders = [
  { name: 'all', icon: '▣', count: blogPosts.length },
  { name: 'overview', icon: '⌘', count: blogPosts.filter(p => p.folder === 'overview').length },
  { name: 'apps', icon: '□', count: blogPosts.filter(p => p.folder === 'apps').length },
];

type FontSize = 'small' | 'medium' | 'large';
const fontSizes: Record<FontSize, { body: string; title: string; label: string }> = {
  small:  { body: '13px', title: '20px', label: 'Small' },
  medium: { body: '15px', title: '24px', label: 'Medium' },
  large:  { body: '17px', title: '28px', label: 'Large' },
};
const fontSizeOrder: FontSize[] = ['small', 'medium', 'large'];

const Blog = ({ onContentClick, windowMode }: BlogProps) => {
  const [selectedSlug, setSelectedSlug] = useState<string>('abdullahos-overview');
  const [activeFolder, setActiveFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [sortNewest, setSortNewest] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredPosts = blogPosts.filter(p => {
    const matchFolder = activeFolder === 'all' || p.folder === activeFolder;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  // Sort
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    return sortNewest ? diff : -diff;
  });

  const grouped = groupByDate(sortedPosts);
  const isPreface = false;
  const prefaceContent = null;
  const selectedPost = blogPosts.find(p => p.slug === selectedSlug);
  const selectedContent = selectedPost ? contentMap[selectedPost.slug] : null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const cycleFontSize = () => {
    const idx = fontSizeOrder.indexOf(fontSize);
    setFontSize(fontSizeOrder[(idx + 1) % fontSizeOrder.length]);
  };

  const fs = fontSizes[fontSize];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      color: 'rgba(0,0,0,0.85)',
      fontSize: '13px',
    }}>
      {/* ── App Toolbar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderBottom: '0.5px solid rgba(0,0,0,0.12)',
        background: '#f0f0f0',
        minHeight: '34px',
        gap: '0px',
      }}>
        {/* ── Section 1: Sidebar toggle ── */}
        <NTBtn onClick={() => setShowSidebar(s => !s)} active={showSidebar} tooltip="Toggle Sidebar">
          <svg width="16" height="15" viewBox="0 0 18 16" fill="none">
            <rect x="1" y="1" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="6.5" y1="1" x2="6.5" y2="15" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </NTBtn>

        <ToolbarDivider />

        {/* ── Section 2: List / Grid view ── */}
        <NTBtn onClick={() => setViewMode('list')} active={viewMode === 'list'} tooltip="List View">
          <svg width="15" height="14" viewBox="0 0 16 14" fill="none">
            <line x1="1" y1="2" x2="15" y2="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="1" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="1" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </NTBtn>
        <NTBtn onClick={() => setViewMode('grid')} active={viewMode === 'grid'} tooltip="Grid View">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </NTBtn>

        <ToolbarDivider />

        {/* ── Section 3: Trash (no-op, visual only) ── */}
        <NTBtn tooltip="Trash">
          <svg width="14" height="15" viewBox="0 0 14 16" fill="none">
            <path d="M2 4h10l-.8 10a1 1 0 01-1 .9H3.8a1 1 0 01-1-.9L2 4z" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <line x1="1" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M5 4V2.5a1 1 0 011-1h2a1 1 0 011 1V4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </NTBtn>

        <ToolbarDivider />

        {/* ── Section 4: Compose (no-op, visual only) ── */}
        <NTBtn tooltip="New Note">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9.5 2L14 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="8" x2="9" y2="8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <line x1="5" y1="5.5" x2="8" y2="5.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <line x1="5" y1="10.5" x2="7" y2="10.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </NTBtn>

        <ToolbarDivider />

        {/* ── Section 5: Aa (font size), Sort, Table (no-op), Chart (no-op) ── */}
        <NTBtn onClick={cycleFontSize} tooltip={`Font Size: ${fontSizes[fontSize].label}`}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'currentColor', lineHeight: 1, letterSpacing: '-0.5px' }}>Aa</span>
        </NTBtn>
        <NTBtn onClick={() => setSortNewest(s => !s)} active={!sortNewest} tooltip={sortNewest ? 'Newest First' : 'Oldest First'}>
          <svg width="15" height="14" viewBox="0 0 16 14" fill="none">
            <circle cx="4" cy="3" r="2" stroke="currentColor" strokeWidth="1.1" />
            <line x1="4" y1="5" x2="4" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="1.1" />
            <line x1="12" y1="1" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </NTBtn>
        <NTBtn tooltip="Table">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <line x1="1" y1="5.5" x2="15" y2="5.5" stroke="currentColor" strokeWidth="0.8" />
            <line x1="1" y1="10.5" x2="15" y2="10.5" stroke="currentColor" strokeWidth="0.8" />
            <line x1="5.5" y1="1" x2="5.5" y2="15" stroke="currentColor" strokeWidth="0.8" />
            <line x1="10.5" y1="1" x2="10.5" y2="15" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </NTBtn>
        <NTBtn tooltip="Chart">
          <svg width="15" height="14" viewBox="0 0 16 14" fill="none">
            <rect x="1" y="6" width="3" height="7" rx="0.5" fill="currentColor" opacity="0.8" />
            <rect x="5.5" y="3" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.8" />
            <rect x="10" y="1" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.8" />
          </svg>
        </NTBtn>

        <ToolbarDivider />

        {/* ── Section 6: Image, Link, Lock (visual only) ── */}
        <NTBtn hasDropdown tooltip="Insert Image">
          <svg width="15" height="13" viewBox="0 0 16 14" fill="none">
            <rect x="1" y="1" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="5" cy="4.5" r="1.5" fill="currentColor" opacity="0.5" />
            <path d="M1 9l4-3 3 2 3-2 4 3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none" />
          </svg>
        </NTBtn>
        <NTBtn tooltip="Insert Link">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M6.5 9.5l-1 1a2 2 0 102.83 2.83l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M9.5 6.5l1-1a2 2 0 112.83 2.83l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="6" y1="10" x2="10" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </NTBtn>
        <NTBtn hasDropdown tooltip="Lock Note">
          <svg width="12" height="15" viewBox="0 0 12 16" fill="none">
            <rect x="1" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        </NTBtn>

        <ToolbarDivider />

        {/* ── Section 7: Share, Search ── */}
        <NTBtn tooltip="Share">
          <svg width="14" height="15" viewBox="0 0 14 16" fill="none">
            <path d="M3 9v4.5a1 1 0 001 1h6a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <polyline points="4,5 7,1.5 10,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="7" y1="1.5" x2="7" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </NTBtn>
        <NTBtn onClick={() => { searchRef.current?.focus(); }} tooltip="Search">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="10.2" y1="10.2" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </NTBtn>
      </div>

      {/* ── Three-panel layout below toolbar ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

      {/* ── Left Sidebar: Folders ── */}
      {showSidebar && (
      <div style={{
        width: '180px',
        minWidth: '180px',
        borderRight: '0.5px solid rgba(0,0,0,0.1)',
        background: '#f0f0f0',
        padding: '12px 0',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Search */}
        <div style={{ padding: '0 10px 10px', position: 'relative' }}>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 8px 5px 26px',
              fontSize: '12px',
              border: '0.5px solid rgba(0,0,0,0.12)',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.04)',
              color: 'rgba(0,0,0,0.8)',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          <svg width="12" height="12" viewBox="0 0 16 16" style={{ position: 'absolute', left: '18px', top: '6px', opacity: 0.35 }}>
            <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" fill="none" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* iCloud section label */}
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'rgba(0,0,0,0.35)',
          padding: '8px 14px 4px',
          letterSpacing: '0.02em',
        }}>
          iCloud
        </div>

        {folders.map(folder => {
          const isActive = activeFolder === folder.name;
          return (
            <div
              key={folder.name}
              onClick={() => setActiveFolder(folder.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                cursor: 'default',
                borderRadius: '6px',
                margin: '0 6px',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: isActive ? '#007AFF' : 'rgba(0,0,0,0.7)',
                fontWeight: isActive ? 500 : 400,
                fontSize: '13px',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{folder.icon}</span>
              <span style={{ flex: 1 }}>{folder.name}</span>
              <span style={{
                fontSize: '12px',
                color: isActive ? '#007AFF' : 'rgba(0,0,0,0.3)',
                fontWeight: 400,
              }}>
                {folder.count}
              </span>
            </div>
          );
        })}
      </div>
      )}

      {/* ── Middle: Notes List ── */}
      <div style={{
        width: showSidebar ? '240px' : '280px',
        minWidth: showSidebar ? '240px' : '280px',
        borderRight: '0.5px solid rgba(0,0,0,0.1)',
        overflowY: 'auto',
        background: '#ffffff',
      }}>
        {viewMode === 'list' ? (
          /* ── List View ── */
          grouped.map(group => (
            <div key={group.label}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(0,0,0,0.4)',
                padding: '12px 14px 4px',
              }}>
                {group.label}
              </div>
              {group.posts.map(post => {
                const isSelected = post.slug === selectedSlug;
                return (
                  <div
                    key={post.slug}
                    onClick={() => setSelectedSlug(post.slug)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'default',
                      borderRadius: '8px',
                      margin: '2px 6px',
                      background: isSelected ? '#FFCA28' : 'transparent',
                      transition: 'background 0.12s',
                    }}
                  >
                    <div style={{
                      fontWeight: 600,
                      fontSize: '13px',
                      color: isSelected ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.8)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {post.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '2px',
                      fontSize: '12px',
                      color: isSelected ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
                    }}>
                      <span>{formatDate(post.publishedAt)}</span>
                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {post.summary.slice(0, 30)}...
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '3px',
                      fontSize: '11px',
                      color: isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
                    }}>
                      <span>📓</span>
                      <span>{post.folder}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          /* ── Grid View ── */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            padding: '10px',
          }}>
            {sortedPosts.map(post => {
              const isSelected = post.slug === selectedSlug;
              return (
                <div
                  key={post.slug}
                  onClick={() => setSelectedSlug(post.slug)}
                  style={{
                    padding: '12px',
                    cursor: 'default',
                    borderRadius: '10px',
                    background: isSelected ? '#FFCA28' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.06)'}`,
                    transition: 'all 0.12s',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{
                    fontWeight: 600,
                    fontSize: '12px',
                    color: isSelected ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.8)',
                    lineHeight: 1.3,
                    marginBottom: '4px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.title}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)',
                    marginTop: 'auto',
                  }}>
                    {formatDate(post.publishedAt)}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
                    display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px',
                  }}>
                    <span>▣</span> {post.folder}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right: Content Reader ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 32px',
        background: '#ffffff',
      }}>
        {isPreface && prefaceContent ? (
          <>
            {/* Preface welcome page */}
            <div style={{
              maxWidth: '520px',
              margin: '0 auto',
            }}>
              <div style={{
                fontSize: '32px',
                marginBottom: '10px',
              }}>
                📝
              </div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 600,
                color: 'rgba(0,0,0,0.85)',
                lineHeight: 1.3,
                margin: '0 0 20px',
                fontFamily: 'NeueMontreal-Medium, -apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                abdullahOS
              </h1>
              <div className="app-content" style={{
                fontSize: fs.body,
                lineHeight: 1.8,
                color: 'rgba(0,0,0,0.65)',
                fontFamily: 'NeueMontreal-Light, -apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'font-size 0.2s ease',
              }}>
                <MarkdownRenderer content={prefaceContent.markdown} />
              </div>
              <div style={{
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                fontSize: '12px',
                color: 'rgba(0,0,0,0.3)',
              }}>
                {blogPosts.length} sections &middot; select one from the list
              </div>
            </div>
          </>
        ) : selectedPost && selectedContent ? (
          <>
            {/* Date header */}
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: 'rgba(0,0,0,0.35)',
              marginBottom: '20px',
            }}>
              {formatFullDate(selectedPost.publishedAt)}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: fs.title,
              fontWeight: 700,
              color: 'rgba(0,0,0,0.9)',
              lineHeight: 1.3,
              margin: '0 0 8px',
              fontFamily: 'NeueMontreal-Medium, -apple-system, BlinkMacSystemFont, sans-serif',
              transition: 'font-size 0.2s ease',
            }}>
              {selectedPost.title}
            </h1>

            {/* Summary/subtitle */}
            <p style={{
              fontSize: fs.body,
              color: 'rgba(0,0,0,0.5)',
              lineHeight: 1.5,
              margin: '0 0 24px',
              fontFamily: 'NeueMontreal-Light, -apple-system, BlinkMacSystemFont, sans-serif',
              transition: 'font-size 0.2s ease',
            }}>
              {selectedPost.summary}
            </p>

            {/* Markdown content */}
            <div className="app-content" style={{
              fontSize: fs.body,
              lineHeight: 1.7,
              color: 'rgba(0,0,0,0.8)',
              transition: 'font-size 0.2s ease',
            }}>
              <MarkdownRenderer content={selectedContent.markdown} />
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'rgba(0,0,0,0.25)',
            fontSize: '15px',
          }}>
            select a section
          </div>
        )}
      </div>

      </div>{/* close three-panel layout */}

      <style>{`
        /* Override MarkdownRenderer dark-theme inline styles for this light window */
        .app-content h2 {
          font-family: NeueMontreal-Medium, -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-size: 1.2em !important;
          font-weight: 500 !important;
          color: rgba(0,0,0,0.85) !important;
          margin: 1.8em 0 0.6em !important;
          padding-bottom: 0.35em !important;
          border-bottom: 1px solid rgba(0,0,0,0.08) !important;
          line-height: 1.35 !important;
        }
        .app-content h3 {
          font-family: NeueMontreal-Medium, -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-size: 1.05em !important;
          font-weight: 500 !important;
          color: rgba(0,0,0,0.8) !important;
          margin: 1.5em 0 0.5em !important;
          line-height: 1.35 !important;
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        .app-content p {
          font-family: NeueMontreal-Light, -apple-system, BlinkMacSystemFont, sans-serif !important;
          margin: 0 0 1em !important;
          color: rgba(0,0,0,0.7) !important;
          line-height: 1.8 !important;
          font-weight: normal !important;
        }
        .app-content strong {
          font-family: NeueMontreal-Medium, -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-weight: 500 !important;
          color: rgba(0,0,0,0.85) !important;
        }
        .app-content em {
          color: rgba(0,0,0,0.75) !important;
        }
        .app-content blockquote {
          font-family: NeueMontreal-Light, -apple-system, BlinkMacSystemFont, sans-serif !important;
          border-left: 3px solid rgba(0,0,0,0.15) !important;
          padding-left: 16px !important;
          margin: 1.2em 0 !important;
          color: rgba(0,0,0,0.55) !important;
          font-style: italic;
          line-height: 1.7 !important;
        }
        .app-content code {
          background: rgba(0,0,0,0.06) !important;
          color: rgba(0,0,0,0.8) !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-size: 0.88em !important;
        }
        .app-content pre {
          background: rgba(0,0,0,0.04) !important;
          border: 0.5px solid rgba(0,0,0,0.08) !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          overflow-x: auto;
          margin: 1.2em 0 !important;
        }
        .app-content pre code {
          background: none !important;
          padding: 0 !important;
        }
        .app-content hr {
          border: none !important;
          border-top: 1px solid rgba(0,0,0,0.1) !important;
          margin: 1.5em 0 !important;
        }
        .app-content a {
          color: #007AFF !important;
          text-decoration-color: rgba(0,122,255,0.3) !important;
        }
        .app-content ul,
        .app-content ol {
          font-family: NeueMontreal-Light, -apple-system, BlinkMacSystemFont, sans-serif !important;
          color: rgba(0,0,0,0.7) !important;
          line-height: 1.8 !important;
          margin: 0.8em 0 !important;
        }
        .app-content li {
          color: rgba(0,0,0,0.7) !important;
          margin-bottom: 0.3em !important;
        }
        .app-content table {
          font-family: NeueMontreal-Light, -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        .app-content table th {
          font-family: NeueMontreal-Medium, -apple-system, BlinkMacSystemFont, sans-serif !important;
          color: rgba(0,0,0,0.85) !important;
          border-bottom-color: rgba(0,0,0,0.15) !important;
        }
        .app-content table td {
          color: rgba(0,0,0,0.7) !important;
          border-bottom-color: rgba(0,0,0,0.06) !important;
        }
      `}</style>
    </div>
  );
};

function NTBtn({ children, active, hasDropdown, onClick, tooltip }: {
  children: React.ReactNode;
  active?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
  tooltip?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      title={tooltip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '28px',
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        cursor: onClick ? 'pointer' : 'default',
        color: active ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.45)',
        background: hovered ? 'rgba(0,0,0,0.08)' : 'transparent',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.1s, color 0.1s',
      }}
    >
      {children}
      {hasDropdown && (
        <svg width="6" height="4" viewBox="0 0 6 4" fill="none" style={{ position: 'absolute', bottom: '2px', right: '1px' }}>
          <path d="M0.5 0.5L3 3L5.5 0.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function ToolbarDivider() {
  return <div style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.1)', margin: '0 6px', flexShrink: 0 }} />;
}

export default Blog;
