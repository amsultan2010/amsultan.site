import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { DesktopProvider, useDesktop } from './DesktopContext';
import Background from './MacBackground';
import AppWindow from './AppWindow';
import BootScreen from './BootScreen';
import DesktopDock from './DesktopDock';
import DesktopMenuBar from './DesktopMenuBar';
import AbdullahAsciiLogo from './AbdullahAsciiLogo';
import MobileAbdullahOS from './MobileAbdullahOS';
import type { WindowId } from './types';

// Section content — uses desktop-portfolio (master copies, untouched)
import Education from '../desktop-portfolio/Education';
import Experience from '../desktop-portfolio/Experience';
import Projects from '../desktop-portfolio/Projects';
import Blog from '../desktop-portfolio/Blog';
import EmailCompose from '../desktop-portfolio/EmailCompose';
const LazyPhotos = lazy(() => import('../desktop-portfolio/Photos'));
const LazyWatchlist = lazy(() => import('../desktop-portfolio/Watchlist'));
const LazyProjects = lazy(() => import('../desktop-portfolio/Projects'));
const LazyBlog = lazy(() => import('../desktop-portfolio/Blog'));
import WifiSettings from '../desktop-portfolio/WifiSettings';
import DetailPanel from '../desktop-portfolio/DetailPanel';
import ContentViewer from '../desktop-portfolio/ContentViewer';
import type { DetailContent } from '../desktop-portfolio/DetailPanel';
import type { ContentViewData } from '../desktop-portfolio/ContentViewer';

function WindowContent({ id }: { id: WindowId }) {
  const { dispatch } = useDesktop();

  const handleCardClick = (detail: DetailContent) => {
    dispatch({ type: 'OPEN_DETAIL', detail });
  };

  const handleContentClick = (content: ContentViewData) => {
    dispatch({ type: 'OPEN_CONTENT', content });
  };

  switch (id) {
    case 'terminal':
      return <TerminalContent />;
    case 'education':
      return <Education onCardClick={handleCardClick} windowMode />;
    case 'experience':
      return <Experience onCardClick={handleCardClick} windowMode />;
    case 'projects':
      return <Suspense fallback={<div style={{ padding: 24, opacity: 0.5 }}>Loading…</div>}><LazyProjects onCardClick={handleCardClick} windowMode /></Suspense>;
    case 'blog':
      return <Suspense fallback={<div style={{ padding: 24, opacity: 0.5 }}>Loading…</div>}><LazyBlog onContentClick={handleContentClick} windowMode /></Suspense>;
    case 'email':
      return <EmailCompose windowMode />;
    case 'photos':
      return <Suspense fallback={<div style={{ padding: 24, opacity: 0.5 }}>Loading…</div>}><LazyPhotos windowMode /></Suspense>;
    case 'watchlist':
      return <Suspense fallback={<div style={{ padding: 24, opacity: 0.5 }}>Loading…</div>}><LazyWatchlist windowMode /></Suspense>;
    default:
      return null;
  }
}

interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'system' | 'human';
  text: string;
  command?: string;
  ts?: number; // timestamp for auto-fade
}

const COMMANDS: Record<string, { window: WindowId; desc: string }> = {
  'about':         { window: 'education',      desc: 'About Abdullah' },
  'projects':      { window: 'projects',        desc: 'projects & builds' },
  'abdullahOS':    { window: 'blog',            desc: 'open abdullahOS' },
  'contact':       { window: 'email',           desc: 'Static contact window' },
  'photos':        { window: 'photos',          desc: 'Local photo gallery' },
  'terminal':      { window: 'terminal',        desc: 'Terminal home' },
  'experience':    { window: 'experience',      desc: 'experience' },
  'watchlist':     { window: 'watchlist',       desc: 'favorite books, movies, shows' },
};

const SMART_COMMANDS: Record<string, { window: WindowId; output: string }> = {
  'npm run about':         { window: 'education',     output: '> abdullah@1.0.0 about\n> Loading static profile shell...' },
  'git log --projects':    { window: 'projects',      output: 'commit a1b2c3d (HEAD -> main)\nopening abdullah projects...' },
  'open abdullahOS.app':   { window: 'blog',          output: 'Opening AbdullahOS.app...' },
  'open contact.app':      { window: 'email',         output: 'Opening static contact window...' },
  'open watchlist.app':    { window: 'watchlist',     output: 'Opening Watchlist...' },
};

// ── Rolling titles ribbon for fullscreen subtitle ──
function RollingTitles() {
  const titles = [
    'Student Builder', 'Startup Curious', 'Robotics Explorer', 'AI Tinkerer',
    'Quant Finance Learner', 'Creative Hardware Builder', 'AbdullahOS Maker',
    'Systems Thinker', 'Prototype Shipper', 'Terminal Dweller',
    'Product Learner', 'Robotics Builder', 'Market Student',
    'Hardware Hacker', 'Project Collector', 'Riyadh Based',
  ];
  const colors = [
    '#60a5fa', '#c084fc', '#4ade80', '#fbbf24', '#f472b6',
    '#22d3ee', '#fb923c', '#a78bfa', '#34d399', '#f87171',
    '#38bdf8', '#e879f9', '#86efac', '#fcd34d', '#fb7185',
    '#67e8f9',
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [built, setBuilt] = useState<{ text: string; color: string }[]>([]);
  const [charIdx, setCharIdx] = useState(0);
  const [titleIdx, setTitleIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'reverse-erase' | 'reverse-pause'>('typing');
  const [reverseIdx, setReverseIdx] = useState(0);
  const [reverseCharIdx, setReverseCharIdx] = useState(0);
  const [overflowed, setOverflowed] = useState(false);

  // Check if content overflows the container
  const checkOverflow = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth - 10; // leave room for cursor
      const contentWidth = contentRef.current.scrollWidth;
      return contentWidth >= containerWidth;
    }
    return false;
  }, []);

  useEffect(() => {
    if (phase === 'typing') {
      // Check overflow after each render
      if (overflowed) {
        // We've hit the edge — pause then reverse
        const t = setTimeout(() => {
          const finalBuilt = [...built];
          const currentTitle = titles[titleIdx];
          if (charIdx > 0) {
            finalBuilt.push({ text: currentTitle.slice(0, charIdx), color: colors[titleIdx % colors.length] });
          }
          setBuilt(finalBuilt);
          setPhase('reverse-erase');
          setReverseIdx(finalBuilt.length - 1);
          setReverseCharIdx(finalBuilt[finalBuilt.length - 1]?.text.length || 0);
          setOverflowed(false);
        }, 1500);
        return () => clearTimeout(t);
      }

      const title = titles[titleIdx];
      if (charIdx < title.length) {
        // Before typing next char, check if we're close to the edge
        if (containerRef.current && contentRef.current) {
          const containerWidth = containerRef.current.offsetWidth - 20; // leave comfortable margin
          const contentWidth = contentRef.current.scrollWidth;
          if (contentWidth >= containerWidth) {
            // We're at the edge — don't add more characters, treat as overflow
            setOverflowed(true);
            return;
          }
        }
        const t = setTimeout(() => setCharIdx(c => c + 1), 35);
        return () => clearTimeout(t);
      } else {
        // Title done — add separator and move to next
        const newBuilt = [...built, { text: title, color: colors[titleIdx % colors.length] }];
        if (titleIdx + 1 < titles.length) {
          setBuilt(newBuilt);
          setTitleIdx(i => i + 1);
          setCharIdx(0);
        } else {
          // All titles typed — pause then reverse
          setBuilt(newBuilt);
          const t = setTimeout(() => {
            setPhase('reverse-erase');
            setReverseIdx(newBuilt.length - 1);
            setReverseCharIdx(newBuilt[newBuilt.length - 1].text.length);
          }, 1500);
          return () => clearTimeout(t);
        }
      }
    }

    if (phase === 'reverse-erase') {
      if (reverseCharIdx > 0) {
        const t = setTimeout(() => setReverseCharIdx(c => c - 1), 20);
        return () => clearTimeout(t);
      } else if (reverseIdx > 0) {
        const t = setTimeout(() => {
          setReverseIdx(i => i - 1);
          setReverseCharIdx(built[reverseIdx - 1].text.length);
        }, 50);
        return () => clearTimeout(t);
      } else {
        // All erased — restart
        const t = setTimeout(() => {
          setBuilt([]);
          setTitleIdx(0);
          setCharIdx(0);
          setPhase('typing');
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [phase, charIdx, titleIdx, reverseIdx, reverseCharIdx, overflowed]);

  // After each render during typing, check if we've overflowed
  useEffect(() => {
    if (phase === 'typing' && !overflowed && checkOverflow()) {
      setOverflowed(true);
    }
  });

  // Build display items
  const displayItems: { text: string; color: string }[] = [];
  if (phase === 'typing') {
    displayItems.push(...built);
    const currentTitle = titles[titleIdx];
    if (charIdx > 0) {
      displayItems.push({ text: currentTitle.slice(0, charIdx), color: colors[titleIdx % colors.length] });
    }
  } else if (phase === 'reverse-erase') {
    for (let i = 0; i < reverseIdx; i++) {
      displayItems.push(built[i]);
    }
    if (reverseCharIdx > 0 && built[reverseIdx]) {
      displayItems.push({ text: built[reverseIdx].text.slice(0, reverseCharIdx), color: built[reverseIdx].color });
    }
  }

  const cursorColor = displayItems.length > 0 ? displayItems[displayItems.length - 1].color : colors[0];

  return (
    <div ref={containerRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', minHeight: '20px', width: '100%' }}>
      <span ref={contentRef} style={{ display: 'inline' }}>
        {displayItems.map((item, i) => (
          <span key={i}>
            <span style={{ color: item.color, fontWeight: 600, fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>{item.text}</span>
            {i < displayItems.length - 1 && <span style={{ color: 'rgba(0,0,0,0.12)', margin: '0 6px' }}>·</span>}
          </span>
        ))}
      </span>
      <span style={{
        display: 'inline-block', width: '2px', height: '14px',
        background: cursorColor, marginLeft: '1px',
        animation: 'blink 1s step-end infinite',
        verticalAlign: 'text-bottom',
      }} />
    </div>
  );
}

// ── Rotating words component (character-by-character typing) ──
function RotatingWords() {
  const words = [
    'Drinking way too much homemade matcha',
    'Coding with Cursor on caffeine',
    'Listening to Don Toliver',
    'Procrastinating with progress',
    'Larping on LinkedIn',
    'Sending cold emails',
    'Vibecoding random stuff',
    'Doing absolutely nothing in school',
    'Watching Fireship videos',
    'Bringing my Macbook to a Starbucks in San Francisco',
  ];

  const wordColors = [
    '#4ade80', // matcha green
    '#c084fc', // cursor purple
    '#fbbf24', // amber
    '#22d3ee', // cyan
    '#60a5fa', // blue
    '#f472b6', // pink
    '#a78bfa', // violet
    '#fb923c', // orange
    '#ef4444', // fireship red
    '#34d399', // starbucks-ish green
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<'delay' | 'typing' | 'showing' | 'erasing'>('delay');

  useEffect(() => {
    const word = words[currentIdx];

    if (phase === 'delay') {
      // Brief pause before typing starts (initial load)
      const timer = setTimeout(() => setPhase('typing'), 600);
      return () => clearTimeout(timer);
    }

    if (phase === 'typing') {
      if (displayText.length < word.length) {
        const timer = setTimeout(() => {
          setDisplayText(word.slice(0, displayText.length + 1));
        }, 45);
        return () => clearTimeout(timer);
      } else {
        // Word fully typed — hold it on screen
        const timer = setTimeout(() => setPhase('erasing'), 2200);
        return () => clearTimeout(timer);
      }
    }

    if (phase === 'erasing') {
      if (displayText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 25);
        return () => clearTimeout(timer);
      } else {
        // Move to next word and start typing
        setCurrentIdx(prev => (prev + 1) % words.length);
        setPhase('typing');
      }
    }

    if (phase === 'showing') {
      setPhase('typing');
    }
  }, [displayText, phase, currentIdx]);

  const color = wordColors[currentIdx % wordColors.length];

  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800, fontSize: '22px', fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
        {displayText}
      </span>
      <span style={{
        display: 'inline-block', width: '2.5px', height: '24px',
        background: 'rgba(255,255,255,0.8)', marginLeft: '2px',
        animation: 'blink 1s step-end infinite',
        verticalAlign: 'text-bottom',
      }} />
    </span>
  );
}

// ── Stock Ticker component ──
function FocusStack() {
  const focus = [
    ['STARTUP', 'x-combinator from ais-r'],
    ['VERTICAL AI', 'automation + enterprise software'],
    ['ROBOTICS', 'hardware, sensors, prototypes'],
    ['EDUCATION', 'tutoringbyabdullah'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
        FOCUS
      </div>
      {focus.map(([label, detail]) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '3px 0',
            borderBottom: '0.5px solid rgba(0,0,0,0.04)',
          }}>
            <span style={{
              color: 'rgba(0,0,0,0.6)',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: "'SF Mono', monospace",
              width: '40px',
            }}>{label}</span>
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10.5px',
              color: '#4ade80',
              fontWeight: 500,
              flex: 1,
              textAlign: 'right',
            }}>
              {detail}
            </span>
          </div>
      ))}
    </div>
  );
}

// ── World Clock (rotating groups of 3 cities) ──
function WorldClock() {
  const [time, setTime] = useState(new Date());
  const [groupIdx, setGroupIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const allCities = [
    { label: 'LDN', tz: 'Europe/London' },
    { label: 'SF', tz: 'America/Los_Angeles' },
    { label: 'TOR', tz: 'America/Toronto' },
    { label: 'TYO', tz: 'Asia/Tokyo' },
    { label: 'SYD', tz: 'Australia/Sydney' },
    { label: 'PAR', tz: 'Europe/Paris' },
    { label: 'NYC', tz: 'America/New_York' },
    { label: 'DXB', tz: 'Asia/Dubai' },
    { label: 'SIN', tz: 'Asia/Singapore' },
  ];

  // Groups of 3
  const groups: typeof allCities[] = [];
  for (let i = 0; i < allCities.length; i += 3) {
    groups.push(allCities.slice(i, i + 3));
  }

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setGroupIdx(prev => (prev + 1) % groups.length);
        setFading(false);
      }, 300);
    }, 6000);
    return () => clearInterval(id);
  }, [groups.length]);

  const font = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif";
  const currentGroup = groups[groupIdx];

  return (
    <div style={{ fontFamily: font, transition: 'opacity 0.3s ease', opacity: fading ? 0 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {currentGroup.map(city => {
          const t = time.toLocaleTimeString('en-US', {
            timeZone: city.tz, hour: 'numeric', minute: '2-digit', hour12: true,
          });
          const hrs = parseInt(time.toLocaleTimeString('en-US', { timeZone: city.tz, hour: '2-digit', hour12: false }));
          const isNight = hrs >= 20 || hrs < 6;
          return (
            <div key={city.label} style={{ textAlign: 'center', minWidth: '70px' }}>
              <div style={{ color: '#1d1d1f', fontSize: '10px', fontWeight: 500, marginBottom: '4px' }}>
                {isNight ? '🌙' : '☀️'} {city.label}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 300, color: '#1d1d1f', letterSpacing: '-0.3px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {t}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Scramble Text Hook ──
function useScrambleText(target: string, trigger: number) {
  const [display, setDisplay] = useState('');
  const prevTarget = useRef('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&#$%';

  useEffect(() => {
    if (!target) { setDisplay(''); return; }
    // Skip scramble if this is the very first text (just show it)
    if (!prevTarget.current) {
      prevTarget.current = target;
      setDisplay(target);
      return;
    }
    prevTarget.current = target;

    const len = Math.max(display.length, target.length);
    const resolveOrder: number[] = [];
    for (let i = 0; i < len; i++) resolveOrder.push(i);
    for (let i = resolveOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resolveOrder[i], resolveOrder[j]] = [resolveOrder[j], resolveOrder[i]];
    }

    let step = 0;
    const totalSteps = len + 12;
    const id = setInterval(() => {
      step++;
      const result: string[] = [];
      for (let i = 0; i < target.length; i++) {
        const resolveAt = resolveOrder.indexOf(i);
        if (step > resolveAt + 8) {
          result.push(target[i]);
        } else if (target[i] === ' ') {
          result.push(' ');
        } else {
          result.push(chars[Math.floor(Math.random() * chars.length)]);
        }
      }
      setDisplay(result.join(''));
      if (step >= totalSteps + 6) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [target, trigger]);

  return display || target;
}

// ── Quick Start Tiles ──
const QUICK_NAV = [
  { label: 'about', cmd: 'npm run about', color: '#60a5fa', icon: '/icons/folder.png' },
  { label: 'projects', cmd: 'git log --projects', color: '#4ade80', icon: '/vscode.png' },
  { label: 'abdullahOS', cmd: 'open abdullahOS.app', color: '#fbbf24', icon: '/terminal.png' },
  { label: 'contact', cmd: 'open contact.app', color: '#22d3ee', icon: '/usethismailicon.png' },
  { label: 'photos', cmd: 'photos', color: '#c084fc', icon: '/icons/photos.png' },
  { label: 'watchlist', cmd: 'watchlist', color: '#e50914', icon: '/images/logosicons/netflix.png' },
];

function QuickStartTiles({ runCommand }: { runCommand: (cmd: string, source?: 'ui' | 'typed') => void }) {
  return (
    <div style={{ marginTop: '20px', fontFamily: "'SF Mono', monospace" }}>
      <div style={{ color: '#1d1d1f', fontSize: '11px', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>
        QUICK START
      </div>
      <div className="qs-pills" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
        {QUICK_NAV.map(n => (
          <div
            key={n.label}
            className="qs-pill"
            onClick={(e) => { e.stopPropagation(); runCommand(n.cmd, 'ui'); }}
            style={{
              padding: '10px 8px 8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
              border: `1px solid ${n.color}33`, background: `${n.color}0a`,
              fontSize: '12px', color: n.color, ['--gc' as any]: n.color,
            }}
          >
            <div style={{ marginBottom: '3px', display: 'flex', justifyContent: 'center' }}>{'emoji' in n && n.emoji ? <span style={{ fontSize: '20px', lineHeight: '22px' }}>{n.emoji}</span> : <img src={n.icon} alt={n.label} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />}</div>
            <div style={{ fontWeight: 500 }}>{n.label}</div>
          </div>
        ))}
      </div>
      <style>{`
        .qs-pill { opacity:1; transition:opacity .2s,background .2s,border-color .2s,box-shadow .2s; }
        .qs-pills:hover .qs-pill { opacity:0.3; }
        .qs-pills:hover .qs-pill:hover { opacity:1; box-shadow:0 0 12px var(--gc,#fff)22; }
      `}</style>
    </div>
  );
}

// ── Animated Explore — Apple-style typing animation ──
function AnimatedExplore({ runCommand }: { runCommand: (cmd: string, source?: 'ui' | 'typed') => void }) {
  const commands = [
    { short: 'about', cmd: 'about' },
    { short: 'code', cmd: 'projects' },
    { short: 'os', cmd: 'abdullahOS' },
    { short: 'mail', cmd: 'contact' },
    { short: 'pics', cmd: 'photos' },
  ];
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const targetWord = hoveredIdx !== null ? commands[hoveredIdx].short : '';

  // Type out the hovered word, erase when unhovered
  useEffect(() => {
    if (hoveredIdx !== null) {
      const word = commands[hoveredIdx].short;
      if (typed.length < word.length) {
        const t = setTimeout(() => setTyped(word.slice(0, typed.length + 1)), 50);
        return () => clearTimeout(t);
      }
    } else {
      if (typed.length > 0) {
        const t = setTimeout(() => setTyped(typed.slice(0, -1)), 30);
        return () => clearTimeout(t);
      }
    }
  }, [typed, hoveredIdx]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
      {/* Typed text — shows on hover */}
      <div style={{ minHeight: '28px', display: 'flex', alignItems: 'baseline', fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
        {typed && (
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px' }}>
            {typed}
          </span>
        )}
        <span style={{
          display: 'inline-block', width: '2px', height: '22px',
          background: '#1d1d1f', marginLeft: '2px',
          animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom',
          opacity: typed ? 0.8 : 0.3,
        }} />
      </div>

      {/* Command pills — hover to type, click to open */}
      <div
        style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {commands.map((item, i) => {
          const isHovered = i === hoveredIdx;
          return (
            <div
              key={item.cmd}
              onClick={(e) => { e.stopPropagation(); runCommand(item.cmd); }}
              onMouseEnter={() => { setHoveredIdx(i); setTyped(''); }}
              style={{
                padding: '5px 14px', borderRadius: '16px', cursor: 'pointer',
                fontSize: '13px', fontWeight: isHovered ? 700 : 500,
                fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                color: isHovered ? '#1d1d1f' : 'rgba(0,0,0,0.4)',
                background: isHovered ? 'rgba(0,0,0,0.06)' : 'transparent',
                border: `1px solid ${isHovered ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              {item.short}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Explore Commands (constantly lit, highlight on hover) ──
function ExploreCommands({ smartCommandLinks, runCommand }: {
  smartCommandLinks: { cmd: string; color: string }[];
  runCommand: (cmd: string, source?: 'ui' | 'typed') => void;
}) {
  return (
    <div style={{ padding: '8px 14px' }}>
      <div style={{ color: '#1d1d1f', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '4px' }}>EXPLORE</div>
      <div className="explore-list" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {smartCommandLinks.map((item) => (
          <div
            key={item.cmd}
            className="explore-cmd"
            onClick={(e) => { e.stopPropagation(); runCommand(item.cmd, 'ui'); }}
            style={{
              padding: '3px 6px', borderRadius: '4px', cursor: 'pointer',
              fontSize: '12.5px',
              color: item.color,
              ['--glow-color' as any]: item.color,
            }}
          >
            <span style={{ color: '#4ade80', marginRight: '4px' }}>$</span>{item.cmd}
          </div>
        ))}
      </div>
      <style>{`
        .explore-cmd {
          opacity: 0.85;
          text-shadow: 0 0 4px var(--glow-color, #fff);
          transition: opacity 0.2s, text-shadow 0.2s, background 0.2s;
        }
        .explore-list:hover .explore-cmd {
          opacity: 0.35;
          text-shadow: none;
        }
        .explore-list:hover .explore-cmd:hover {
          opacity: 1;
          text-shadow: 0 0 8px var(--glow-color, #fff);
          background: rgba(0,0,0,0.06);
        }
      `}</style>
    </div>
  );
}

// ── Stock Ticker Tape with Continuous Line ──
interface StockData {
  symbol: string; name: string; price: number; change: number; pct: number; history: number[];
}

// Shared sector definitions — used across heatmap, sparklines, and detail views
const SECTORS: { name: string; symbols: string[]; color?: string }[] = [
  { name: 'Tech', symbols: ['AAPL', 'MSFT', 'GOOG', 'META', 'NVDA', 'AMD', 'AVGO', 'CRM', 'ORCL', 'ADBE', 'INTC'] },
  { name: 'Consumer', symbols: ['AMZN', 'TSLA', 'NFLX', 'DIS', 'NKE', 'SBUX', 'MCD', 'UBER', 'SHOP'] },
  { name: 'Finance', symbols: ['JPM', 'V', 'MA', 'GS'] },
  { name: 'Health', symbols: ['JNJ', 'PFE', 'LLY', 'UNH'] },
  { name: 'Crypto', symbols: ['BTC', 'ETH', 'COIN', 'MSTR'] },
  { name: 'Cloud', symbols: ['SNOW', 'NET', 'CRWD', 'DDOG', 'PLTR'] },
  { name: 'Energy', symbols: ['XOM', 'BA', 'CAT'] },
];

const STOCK_NAMES: { symbol: string; name: string }[] = [
  // ── Indices & ETFs ──
  { symbol: 'SPY', name: 'S&P 500' }, { symbol: 'QQQ', name: 'Nasdaq 100' },
  { symbol: 'DIA', name: 'Dow Jones' }, { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: 'VOO', name: 'Vanguard S&P 500' }, { symbol: 'VTI', name: 'Total Stock Market' },
  { symbol: 'ARKK', name: 'ARK Innovation' }, { symbol: 'XLF', name: 'Financial Select' },
  { symbol: 'XLE', name: 'Energy Select' }, { symbol: 'XLK', name: 'Tech Select' },
  // ── Mega Cap Tech ──
  { symbol: 'AAPL', name: 'Apple' }, { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOG', name: 'Alphabet' }, { symbol: 'GOOGL', name: 'Alphabet A' },
  { symbol: 'AMZN', name: 'Amazon' }, { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'NVDA', name: 'NVIDIA' }, { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AVGO', name: 'Broadcom' }, { symbol: 'ORCL', name: 'Oracle' },
  // ── Semiconductors ──
  { symbol: 'AMD', name: 'AMD' }, { symbol: 'INTC', name: 'Intel' },
  { symbol: 'QCOM', name: 'Qualcomm' }, { symbol: 'TXN', name: 'Texas Instruments' },
  { symbol: 'MU', name: 'Micron' }, { symbol: 'MRVL', name: 'Marvell' },
  { symbol: 'ARM', name: 'ARM Holdings' }, { symbol: 'SMCI', name: 'Super Micro' },
  { symbol: 'ASML', name: 'ASML' }, { symbol: 'TSM', name: 'TSMC' },
  { symbol: 'LRCX', name: 'Lam Research' }, { symbol: 'AMAT', name: 'Applied Materials' },
  { symbol: 'KLAC', name: 'KLA Corp' }, { symbol: 'ON', name: 'ON Semiconductor' },
  // ── Software & Cloud ──
  { symbol: 'CRM', name: 'Salesforce' }, { symbol: 'ADBE', name: 'Adobe' },
  { symbol: 'NOW', name: 'ServiceNow' }, { symbol: 'INTU', name: 'Intuit' },
  { symbol: 'SNOW', name: 'Snowflake' }, { symbol: 'NET', name: 'Cloudflare' },
  { symbol: 'CRWD', name: 'CrowdStrike' }, { symbol: 'DDOG', name: 'Datadog' },
  { symbol: 'PLTR', name: 'Palantir' }, { symbol: 'MDB', name: 'MongoDB' },
  { symbol: 'ZS', name: 'Zscaler' }, { symbol: 'PANW', name: 'Palo Alto Networks' },
  { symbol: 'FTNT', name: 'Fortinet' }, { symbol: 'WDAY', name: 'Workday' },
  { symbol: 'TEAM', name: 'Atlassian' }, { symbol: 'HUBS', name: 'HubSpot' },
  { symbol: 'VEEV', name: 'Veeva Systems' }, { symbol: 'BILL', name: 'Bill Holdings' },
  // ── Internet & Social ──
  { symbol: 'NFLX', name: 'Netflix' }, { symbol: 'UBER', name: 'Uber' },
  { symbol: 'SHOP', name: 'Shopify' }, { symbol: 'SQ', name: 'Block' },
  { symbol: 'SNAP', name: 'Snap' }, { symbol: 'RBLX', name: 'Roblox' },
  { symbol: 'PINS', name: 'Pinterest' }, { symbol: 'SPOT', name: 'Streaming Co.' },
  { symbol: 'DASH', name: 'DoorDash' }, { symbol: 'ABNB', name: 'Airbnb' },
  { symbol: 'BKNG', name: 'Booking Holdings' }, { symbol: 'PYPL', name: 'PayPal' },
  { symbol: 'ROKU', name: 'Roku' }, { symbol: 'TTD', name: 'Trade Desk' },
  { symbol: 'U', name: 'Unity Software' }, { symbol: 'TWLO', name: 'Twilio' },
  // ── Finance & Banking ──
  { symbol: 'JPM', name: 'JPMorgan Chase' }, { symbol: 'BAC', name: 'Bank of America' },
  { symbol: 'WFC', name: 'Wells Fargo' }, { symbol: 'C', name: 'Citigroup' },
  { symbol: 'GS', name: 'Goldman Sachs' }, { symbol: 'MS', name: 'Morgan Stanley' },
  { symbol: 'SCHW', name: 'Charles Schwab' }, { symbol: 'BLK', name: 'BlackRock' },
  { symbol: 'V', name: 'Visa' }, { symbol: 'MA', name: 'Mastercard' },
  { symbol: 'AXP', name: 'American Express' }, { symbol: 'COF', name: 'Capital One' },
  { symbol: 'USB', name: 'U.S. Bancorp' }, { symbol: 'PNC', name: 'PNC Financial' },
  // ── Healthcare & Pharma ──
  { symbol: 'JNJ', name: 'Johnson & Johnson' }, { symbol: 'UNH', name: 'UnitedHealth' },
  { symbol: 'LLY', name: 'Eli Lilly' }, { symbol: 'PFE', name: 'Pfizer' },
  { symbol: 'MRK', name: 'Merck' }, { symbol: 'ABBV', name: 'AbbVie' },
  { symbol: 'TMO', name: 'Thermo Fisher' }, { symbol: 'ABT', name: 'Abbott Labs' },
  { symbol: 'BMY', name: 'Bristol-Myers' }, { symbol: 'AMGN', name: 'Amgen' },
  { symbol: 'GILD', name: 'Gilead Sciences' }, { symbol: 'ISRG', name: 'Intuitive Surgical' },
  { symbol: 'VRTX', name: 'Vertex Pharma' }, { symbol: 'REGN', name: 'Regeneron' },
  { symbol: 'MDT', name: 'Medtronic' }, { symbol: 'DHR', name: 'Danaher' },
  { symbol: 'ELV', name: 'Elevance Health' }, { symbol: 'CI', name: 'Cigna' },
  { symbol: 'HCA', name: 'HCA Healthcare' }, { symbol: 'MRNA', name: 'Moderna' },
  // ── Consumer ──
  { symbol: 'DIS', name: 'Disney' }, { symbol: 'NKE', name: 'Nike' },
  { symbol: 'SBUX', name: 'Starbucks' }, { symbol: 'MCD', name: "McDonald's" },
  { symbol: 'KO', name: 'Coca-Cola' }, { symbol: 'PEP', name: 'PepsiCo' },
  { symbol: 'PG', name: 'Procter & Gamble' }, { symbol: 'COST', name: 'Costco' },
  { symbol: 'WMT', name: 'Walmart' }, { symbol: 'TGT', name: 'Target' },
  { symbol: 'HD', name: 'Home Depot' }, { symbol: 'LOW', name: "Lowe's" },
  { symbol: 'TJX', name: 'TJX Companies' }, { symbol: 'LULU', name: 'Lululemon' },
  { symbol: 'EL', name: 'Estée Lauder' }, { symbol: 'CPNG', name: 'Coupang' },
  { symbol: 'CMG', name: 'Chipotle' }, { symbol: 'YUM', name: 'Yum! Brands' },
  { symbol: 'MNST', name: 'Monster Beverage' }, { symbol: 'CL', name: 'Colgate-Palmolive' },
  // ── Industrial & Defense ──
  { symbol: 'BA', name: 'Boeing' }, { symbol: 'CAT', name: 'Caterpillar' },
  { symbol: 'HON', name: 'Honeywell' }, { symbol: 'GE', name: 'GE Aerospace' },
  { symbol: 'RTX', name: 'RTX Corp' }, { symbol: 'LMT', name: 'Lockheed Martin' },
  { symbol: 'NOC', name: 'Northrop Grumman' }, { symbol: 'GD', name: 'General Dynamics' },
  { symbol: 'DE', name: 'John Deere' }, { symbol: 'UPS', name: 'UPS' },
  { symbol: 'FDX', name: 'FedEx' }, { symbol: 'UNP', name: 'Union Pacific' },
  // ── Energy ──
  { symbol: 'XOM', name: 'ExxonMobil' }, { symbol: 'CVX', name: 'Chevron' },
  { symbol: 'COP', name: 'ConocoPhillips' }, { symbol: 'SLB', name: 'Schlumberger' },
  { symbol: 'EOG', name: 'EOG Resources' }, { symbol: 'OXY', name: 'Occidental' },
  { symbol: 'MPC', name: 'Marathon Petroleum' }, { symbol: 'VLO', name: 'Valero Energy' },
  // ── Telecom & Media ──
  { symbol: 'T', name: 'AT&T' }, { symbol: 'VZ', name: 'Verizon' },
  { symbol: 'TMUS', name: 'T-Mobile' }, { symbol: 'CMCSA', name: 'Comcast' },
  { symbol: 'WBD', name: 'Warner Bros Discovery' }, { symbol: 'PARA', name: 'Paramount' },
  // ── Real Estate ──
  { symbol: 'AMT', name: 'American Tower' }, { symbol: 'PLD', name: 'Prologis' },
  { symbol: 'CCI', name: 'Crown Castle' }, { symbol: 'EQIX', name: 'Equinix' },
  { symbol: 'O', name: 'Realty Income' }, { symbol: 'SPG', name: 'Simon Property' },
  // ── Auto ──
  { symbol: 'F', name: 'Ford' }, { symbol: 'GM', name: 'General Motors' },
  { symbol: 'RIVN', name: 'Rivian' }, { symbol: 'LCID', name: 'Lucid Motors' },
  { symbol: 'TM', name: 'Toyota' }, { symbol: 'HMC', name: 'Honda' },
  // ── Crypto ──
  { symbol: 'BTC', name: 'Bitcoin' }, { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'COIN', name: 'Coinbase' }, { symbol: 'MSTR', name: 'MicroStrategy' },
  { symbol: 'SOL', name: 'Solana' }, { symbol: 'DOGE', name: 'Dogecoin' },
  // ── Other Notable ──
  { symbol: 'BRK-B', name: 'Berkshire Hathaway' }, { symbol: 'NEE', name: 'NextEra Energy' },
  { symbol: 'LIN', name: 'Linde' }, { symbol: 'ACN', name: 'Accenture' },
  { symbol: 'IBM', name: 'IBM' }, { symbol: 'CSCO', name: 'Cisco' },
  { symbol: 'TXN', name: 'Texas Instruments' }, { symbol: 'ANET', name: 'Arista Networks' },
  { symbol: 'APH', name: 'Amphenol' }, { symbol: 'FI', name: 'Fiserv' },
  { symbol: 'SO', name: 'Southern Company' }, { symbol: 'DUK', name: 'Duke Energy' },
  { symbol: 'SHW', name: 'Sherwin-Williams' }, { symbol: 'MMM', name: '3M' },
  { symbol: 'SPGI', name: 'S&P Global' }, { symbol: 'ICE', name: 'Intercontinental Exchange' },
  { symbol: 'CME', name: 'CME Group' }, { symbol: 'MCO', name: "Moody's" },
  { symbol: 'CB', name: 'Chubb' }, { symbol: 'AIG', name: 'AIG' },
  { symbol: 'ZTS', name: 'Zoetis' }, { symbol: 'SYK', name: 'Stryker' },
  { symbol: 'BSX', name: 'Boston Scientific' }, { symbol: 'EW', name: 'Edwards Lifesciences' },
  { symbol: 'SNPS', name: 'Synopsys' }, { symbol: 'CDNS', name: 'Cadence Design' },
];

// Legacy market widgets now use local static data only.
function useStockData() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  useEffect(() => {
    const generateFallback = (): StockData[] => {
      const bases = [
        { symbol: 'NVDA', name: 'NVIDIA', base: 118.72 },
        { symbol: 'TSLA', name: 'Tesla', base: 272.64 },
        { symbol: 'PLTR', name: 'Palantir', base: 78.50 },
        { symbol: 'AMD', name: 'AMD', base: 156.30 },
        { symbol: 'META', name: 'Meta', base: 585.20 },
        { symbol: 'COIN', name: 'Coinbase', base: 215.40 },
        { symbol: 'BTC', name: 'Bitcoin', base: 87245 },
        { symbol: 'SNAP', name: 'Snap', base: 11.20 },
        { symbol: 'NFLX', name: 'Netflix', base: 892.50 },
        { symbol: 'CRWD', name: 'CrowdStrike', base: 342.10 },
        { symbol: 'AAPL', name: 'Apple', base: 228.54 },
        { symbol: 'SPY', name: 'S&P 500', base: 590.32 },
      ];
      return bases.map((b, idx) => {
        const drift = (idx % 3 === 0 ? 0.52 : idx % 3 === 1 ? 0.44 : 0.48);
        const vol = idx < 6 ? 0.005 : 0.002;
        const history: number[] = [b.base];
        for (let i = 1; i < 80; i++) {
          history.push(history[i - 1] + (Math.random() - drift) * b.base * vol);
        }
        const price = history[history.length - 1];
        return { symbol: b.symbol, name: b.name, price, change: price - b.base, pct: ((price - b.base) / b.base) * 100, history };
      }).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
    };
    const interleaveMovers = (data: StockData[]): StockData[] => {
      const gainers = data.filter(s => s.pct > 0).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
      const losers = data.filter(s => s.pct <= 0).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
      const result: StockData[] = [];
      let gi = 0, li = 0;
      while (gi < gainers.length || li < losers.length) {
        if (gi < gainers.length) result.push(gainers[gi++]);
        if (li < losers.length) result.push(losers[li++]);
      }
      return result;
    };
    setStocks(interleaveMovers(generateFallback()));
  }, []);
  return stocks;
}

function CyclingStock({ stocks: externalStocks, startOffset = 0, compact = false, instanceId = 0, onCurrentStock, textColor = '#1d1d1f' }: {
  stocks?: StockData[]; startOffset?: number; compact?: boolean; instanceId?: number; onCurrentStock?: (stock: StockData) => void; textColor?: string;
} = {}) {
  const ownStocks = useStockData();
  const stocks = externalStocks && externalStocks.length > 0 ? externalStocks : ownStocks;
  const containerRef = useRef<HTMLDivElement>(null);
  const totalInstances = compact ? 4 : 1;

  const h = compact ? 70 : 120;
  const NUM_POINTS = 100; // number of chart points to draw
  const DRAW_DURATION = compact ? 3000 : 3500; // ms to draw/erase
  const HOLD_DURATION = compact ? 20000 : 30000; // ms to hold on screen

  // Phases: 'drawing' → 'holding' → 'erasing' → 'switching' → 'drawing'
  const [phase, setPhase] = useState<'drawing' | 'holding' | 'erasing' | 'switching'>('drawing');
  const [drawProgress, setDrawProgress] = useState(0); // 0 to 1
  const [cycleCount, setCycleCount] = useState(0);
  const [displayIdx, setDisplayIdx] = useState(startOffset);
  const rafRef = useRef<number>(0);
  const SWITCH_PAUSE = 1200; // ms to show new ticker before drawing

  const getStockIdx = (cycle: number) => {
    if (stocks.length === 0) return 0;
    return (startOffset + cycle * totalInstances) % stocks.length;
  };

  // Main animation loop
  useEffect(() => {
    if (!stocks.length) return;
    let startTime = performance.now();
    let currentPhase: 'drawing' | 'holding' | 'erasing' | 'switching' = 'drawing';
    let cycle = 0;

    // Set initial stock
    setDisplayIdx(getStockIdx(cycle));

    const loop = (now: number) => {
      const elapsed = now - startTime;

      if (currentPhase === 'drawing') {
        const p = Math.min(elapsed / DRAW_DURATION, 1);
        const eased = 1 - Math.pow(1 - p, 2);
        setDrawProgress(eased);
        if (p >= 1) {
          currentPhase = 'holding';
          setPhase('holding');
          startTime = now;
          setDrawProgress(1);
        }
      } else if (currentPhase === 'holding') {
        if (elapsed >= HOLD_DURATION) {
          currentPhase = 'erasing';
          setPhase('erasing');
          startTime = now;
        }
      } else if (currentPhase === 'erasing') {
        const p = Math.min(elapsed / DRAW_DURATION, 1);
        const eased = 1 - (1 - Math.pow(p, 2));
        setDrawProgress(1 - eased);
        if (p >= 1) {
          // Erase done — switch ticker text, pause before drawing
          cycle++;
          const nextIdx = getStockIdx(cycle);
          setCycleCount(cycle);
          setDisplayIdx(nextIdx);
          setDrawProgress(0);
          currentPhase = 'switching';
          setPhase('switching');
          startTime = now;
        }
      } else if (currentPhase === 'switching') {
        // Pause with new ticker shown, empty chart
        if (elapsed >= SWITCH_PAUSE) {
          currentPhase = 'drawing';
          setPhase('drawing');
          startTime = now;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    setPhase('drawing');
    setDrawProgress(0);
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stocks]);

  // Notify parent of current stock
  useEffect(() => {
    if (onCurrentStock && stocks[displayIdx]) onCurrentStock(stocks[displayIdx]);
  }, [displayIdx, stocks]);

  const stock = stocks[displayIdx] || null;
  const tickerFull = stock ? `${stock.symbol} ${stock.name}` : '';
  const isUp = stock ? stock.change >= 0 : true;
  const fmtPrice = stock
    ? (stock.symbol === 'BTC' ? stock.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : stock.price.toFixed(2))
    : '';
  const pctStr = stock ? `${isUp ? '▲' : '▼'} ${Math.abs(stock.pct).toFixed(2)}%` : '';
  const scrambledText = useScrambleText(tickerFull, displayIdx);
  const scrambledPrice = useScrambleText(fmtPrice, displayIdx);
  const scrambledPct = useScrambleText(pctStr, displayIdx);
  const color = isUp ? '#4ade80' : '#f87171';

  if (!stock) return <div style={{ height: compact ? '90px' : '140px' }} />;

  // Build full chart points from stock history
  const w = containerRef.current?.clientWidth || 220;
  const hist = stock.history;
  const mn = Math.min(...hist), mx = Math.max(...hist), rng = mx - mn || 1;
  const totalPts = Math.min(hist.length, NUM_POINTS);

  const allPts: { x: number; y: number }[] = [];
  for (let i = 0; i < totalPts; i++) {
    const histIdx = Math.floor((i / (totalPts - 1)) * (hist.length - 1));
    const norm = (hist[histIdx] - mn) / rng;
    allPts.push({
      x: (i / (totalPts - 1)) * w,
      y: h - 4 - norm * (h - 8),
    });
  }

  // Slice points based on drawProgress (how much of the chart is visible)
  const visibleCount = Math.max(2, Math.round(drawProgress * totalPts));
  const visPts = phase === 'erasing'
    ? allPts.slice(0, visibleCount) // erase from right: shrink visible from end
    : allPts.slice(0, visibleCount); // draw from left: grow visible from start

  const linePath = visPts.length > 1
    ? visPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';
  const lastPt = visPts[visPts.length - 1] || { x: 0, y: h / 2 };
  const firstPt = visPts[0] || { x: 0, y: h / 2 };
  const gradId = `spark-grad-${instanceId}`;
  const glowId = `glow-${instanceId}`;

  return (
    <div>
      <div style={{ fontFamily: "'SF Mono', monospace", minHeight: compact ? '14px' : '18px', marginBottom: '2px' }}>
        <span style={{ color: textColor, fontWeight: 700, fontSize: compact ? '11px' : '13px' }}>
          {scrambledText}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: compact ? '6px' : '8px' }}>
        <span style={{ fontSize: compact ? '18px' : '26px', fontWeight: 700, color: textColor, fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
          {scrambledPrice}
        </span>
        <span style={{ color, fontSize: compact ? '11px' : '13px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {scrambledPct}
        </span>
      </div>
      <div ref={containerRef} style={{ marginTop: compact ? '2px' : '4px', overflow: 'visible' }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" overflow="visible" style={{ display: 'block', width: '100%', height: `${h}px` }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {linePath && (
          <>
            <path d={linePath + ` L${lastPt.x.toFixed(1)},${h} L${firstPt.x.toFixed(1)},${h} Z`} fill={`url(#${gradId})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lastPt.x} cy={lastPt.y} r={compact ? 3 : 5} fill={color} filter={`url(#${glowId})`}>
              <animate attributeName="r" values={compact ? '2;4;2' : '4;6;4'} dur="1.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
      </div>
    </div>
  );
}

// 2x2 Stock Grid for fullscreen Bloomberg view
function StockGrid({ onStockClick }: { onStockClick?: (symbol: string, name: string) => void } = {}) {
  const stocks = useStockData();
  const currentStocks = useRef<(StockData | null)[]>([null, null, null, null]);
  const [hovered, setHovered] = useState<number | null>(null);

  const handleCurrentStock = (cellIdx: number, stock: StockData) => {
    currentStocks.current[cellIdx] = stock;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i}
          onClick={(e) => {
            e.stopPropagation();
            const s = currentStocks.current[i];
            if (s && onStockClick) onStockClick(s.symbol, s.name);
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '8px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            cursor: onStockClick ? 'pointer' : 'default',
            background: hovered === i ? 'rgba(255,255,255,0.04)' : 'transparent',
            transition: 'background 0.15s',
          }}>
          <CyclingStock stocks={stocks} startOffset={i} compact instanceId={i} onCurrentStock={(s) => handleCurrentStock(i, s)} textColor="#fff" />
        </div>
      ))}
    </div>
  );
}

// Inline news feed for fullscreen Bloomberg view
interface NewsItem { title: string; source: string; url: string; pubDate: string; }

function BloombergNewsFeed() {
  const [news] = useState<NewsItem[]>([
    { title: 'static update: abdullahOS project shell', source: 'Local', url: '#', pubDate: new Date().toISOString() },
    { title: 'robotics automation ideas', source: 'Local', url: '#', pubDate: new Date().toISOString() },
    { title: 'quant finance tools are local-only', source: 'Local', url: '#', pubDate: new Date().toISOString() },
  ]);

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Now';
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
    } catch { return ''; }
  };

  const sourceColors: Record<string, string> = {
    'CBC': '#e03131', 'CBC News': '#e03131', 'BBC': '#da77f2', 'BBC News': '#da77f2',
    'CTV': '#51cf66', 'CTV News': '#51cf66', 'CP24': '#ff922b', 'Global News': '#4dabf7',
    'Reuters': '#ff922b', 'The Globe and Mail': '#ffd43b', 'Toronto Star': '#4dabf7',
  };
  const getColor = (s: string) => {
    if (sourceColors[s]) return sourceColors[s];
    for (const [k, c] of Object.entries(sourceColors)) { if (s.toLowerCase().includes(k.toLowerCase())) return c; }
    return '#74c0fc';
  };

  if (!news.length) return (
    <div style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: "'SF Mono', monospace" }}>
      Loading feed...
    </div>
  );

  return (
    <div style={{ padding: '0 10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
        TOP STORIES
      </div>
      {news.slice(0, 3).map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '5px 4px', textDecoration: 'none', color: 'inherit',
          borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ color: getColor(item.source), fontSize: '10px', fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>{item.source}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>{timeAgo(item.pubDate)}</span>
          </div>
          <div style={{
            fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
          }}>
            {item.title}
          </div>
        </a>
      ))}
    </div>
  );
}

// ── Widget 2: Static music launcher ──
function MusicWidget() {
  const [track] = useState<{ isPlaying: boolean; title: string; artist: string; album: string; albumArt: string; progressMs: number; durationMs: number } | null>({
    isPlaying: false,
    title: 'YouTube Music',
    artist: 'Static launcher',
    album: 'AbdullahOS',
    albumArt: '',
    progressMs: 0,
    durationMs: 180000,
  });
  const [progress, setProgress] = useState(0);

  // Animate progress bar
  useEffect(() => {
    if (!track?.isPlaying) return;
    const id = setInterval(() => setProgress(p => Math.min(p + 1000, track.durationMs)), 1000);
    return () => clearInterval(id);
  }, [track]);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  if (!track) return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
        NOW PLAYING
      </div>
      <div style={{ color: 'rgba(0,0,0,0.25)', fontSize: '11px', fontFamily: "'SF Mono', monospace" }}>Not connected</div>
    </div>
  );

  const pct = track.durationMs > 0 ? (progress / track.durationMs) * 100 : 0;

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
        {track.isPlaying ? 'NOW PLAYING' : 'RECENTLY PLAYED'}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {track.albumArt && (
          <img src={track.albumArt} alt="" style={{ width: 40, height: 40, borderRadius: 4, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
            {track.title}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.artist}
          </div>
          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ flex: 1, height: 3, background: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#1db954', borderRadius: 2, transition: 'width 1s linear' }} />
            </div>
            <span style={{ fontSize: '9px', color: 'rgba(0,0,0,0.3)', fontFamily: "'SF Mono', monospace", flexShrink: 0 }}>
              {fmtTime(progress)}/{fmtTime(track.durationMs)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Widget 3: Market Sector Heatmap ──
function SectorHeatmap() {
  const stocks = useStockData();
  if (!stocks.length) return null;

  const sectorData = SECTORS.map(sec => {
    const matched = stocks.filter(s => sec.symbols.includes(s.symbol));
    const avgPct = matched.length > 0 ? matched.reduce((a, s) => a + s.pct, 0) / matched.length : 0;
    return { ...sec, pct: avgPct, count: matched.length };
  });

  const maxAbs = Math.max(...sectorData.map(s => Math.abs(s.pct)), 1);

  const getHeatColor = (pct: number) => {
    const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
    if (pct >= 0) {
      const r = Math.round(20 - intensity * 10);
      const g = Math.round(60 + intensity * 140);
      const b = Math.round(30 + intensity * 20);
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(60 + intensity * 180);
      const g = Math.round(30 - intensity * 15);
      const b = Math.round(30 - intensity * 10);
      return `rgb(${r},${g},${b})`;
    }
  };

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          SECTOR PERFORMANCE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
        {sectorData.map(sec => (
          <div key={sec.name} style={{
            flex: `${sec.count} 0 0`,
            minWidth: '48px',
            background: getHeatColor(sec.pct),
            borderRadius: 4,
            padding: '6px 6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontFamily: "'SF Mono', monospace" }}>
              {sec.name}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: "'SF Mono', monospace" }}>
              {sec.pct >= 0 ? '+' : ''}{sec.pct.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Static music launcher ──
const DEV_PLAYLIST_URL = 'https://music.youtube.com/@amsultan303';
const DEV_PLAYLIST_TRACKS = [
  { title: 'EXCAVATOR', artist: 'Don Toliver', durationMs: 198000 },
  { title: 'Through The Wire', artist: 'Kanye West', durationMs: 221000 },
  { title: 'MUTT', artist: 'Leon Thomas', durationMs: 186000 },
  { title: 'BLACK BALLOONS', artist: 'Denzel Curry', durationMs: 203000 },
  { title: 'In Your Eyes', artist: 'The Weeknd', durationMs: 237000 },
  { title: 'Favorite Lie', artist: 'Lil Tecca', durationMs: 174000 },
  { title: 'Sucka Free', artist: 'Tyler, The Creator', durationMs: 192000 },
  { title: "Wanna Be Startin' Somethin'", artist: 'Michael Jackson', durationMs: 244000 },
  { title: 'GEMSTONE', artist: 'Don Toliver', durationMs: 201000 },
  { title: 'Roses', artist: 'Kanye West', durationMs: 239000 },
  { title: 'Whiplash', artist: 'Hank Levy', durationMs: 412000 },
  { title: 'Caravan', artist: 'Hank Levy', durationMs: 387000 },
  { title: 'Human Nature', artist: 'Michael Jackson', durationMs: 246000 },
  { title: 'Rapp Snitch Knishes', artist: 'MF DOOM', durationMs: 244000 },
  { title: 'Dark Thoughts', artist: 'Lil Tecca', durationMs: 169000 },
  { title: "What's the Use?", artist: 'Mac Miller', durationMs: 287000 },
  { title: 'In the Dark', artist: 'Swae Lee, Jhene Aiko', durationMs: 212000 },
  { title: "You Know It's Okay", artist: 'Ellzo', durationMs: 198000 },
  { title: 'TIRAMISU', artist: 'Don Toliver', durationMs: 207000 },
];

function NowPlaying() {
  const titleRef = useRef<HTMLDivElement>(null);
  const artistRef = useRef<HTMLSpanElement>(null);
  const [titleOverflow, setTitleOverflow] = useState(false);
  const [artistOverflow, setArtistOverflow] = useState(false);
  const [track] = useState<{ isPlaying: boolean; title: string; artist: string; album: string; albumArt: string; progressMs: number; durationMs: number; isPlaylistFallback?: boolean } | null>(null);
  const [progress, setProgress] = useState(0);
  const [fallback, setFallback] = useState(() => {
    const t = DEV_PLAYLIST_TRACKS[Math.floor(Math.random() * DEV_PLAYLIST_TRACKS.length)];
    return { isPlaying: true, title: t.title, artist: t.artist, album: 'session', albumArt: '', progressMs: Math.floor(Math.random() * 0.6 * t.durationMs), durationMs: t.durationMs, isPlaylistFallback: true };
  });

  const pickRandomTrack = useCallback(() => {
    const t = DEV_PLAYLIST_TRACKS[Math.floor(Math.random() * DEV_PLAYLIST_TRACKS.length)];
    const progressMs = Math.floor(Math.random() * 0.35 * t.durationMs);
    setFallback({
      isPlaying: true,
      title: t.title,
      artist: t.artist,
      album: 'session',
      albumArt: '',
      progressMs,
      durationMs: t.durationMs,
      isPlaylistFallback: true,
    });
    setProgress(progressMs);
  }, []);

  const active = track || fallback;

  useEffect(() => {
    if (!track) setProgress(fallback.progressMs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => setProgress(p => {
      const next = p + 1000;
      if (next >= active.durationMs) {
        if (active.isPlaylistFallback) pickRandomTrack();
        return active.durationMs;
      }
      return next;
    }), 1000);
    return () => clearInterval(id);
  }, [active.durationMs, active.isPlaylistFallback, pickRandomTrack]);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  // Check overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current) {
        const el = titleRef.current;
        setTitleOverflow(el.scrollWidth > el.clientWidth);
        if (el.scrollWidth > el.clientWidth) {
          el.style.setProperty('--np-scroll', `${-(el.scrollWidth - el.clientWidth)}px`);
        }
      }
      if (artistRef.current) {
        const el = artistRef.current;
        setArtistOverflow(el.scrollWidth > el.clientWidth);
        if (el.scrollWidth > el.clientWidth) {
          el.style.setProperty('--np-scroll', `${-(el.scrollWidth - el.clientWidth)}px`);
        }
      }
    };
    checkOverflow();
    const t = setTimeout(checkOverflow, 500);
    return () => clearTimeout(t);
  }, [active.title, active.artist]);

  const isPlaylistFallback = active.isPlaylistFallback;
  const pct = active.durationMs > 0 ? (progress / active.durationMs) * 100 : 0;

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {active.albumArt ? (
        <img src={active.albumArt} alt="" style={{ width: 42, height: 42, borderRadius: 6, flexShrink: 0 }} />
      ) : (
        <a href={DEV_PLAYLIST_URL} target="_blank" rel="noopener noreferrer" style={{ width: 42, height: 42, borderRadius: 6, flexShrink: 0, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', overflow: 'hidden' }}>
          <img src="/images/logosicons/youtubemusic.png" alt="YouTube Music" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </a>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          {active.title}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.55)', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          {active.artist}
        </div>
        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(255,255,255,0.5)', borderRadius: 1, transition: 'width 1s linear' }} />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Pro Text', -apple-system, sans-serif", flexShrink: 0 }}>
            {fmtTime(progress)}
          </span>
        </div>
      </div>
      <style>{`
        .np-title-scroll { position: relative; overflow: hidden; }
        .np-title-inner {
          display: inline-block;
          white-space: nowrap;
        }
        .np-title-scroll.np-overflow .np-title-inner {
          animation: npMarquee 6s ease-in-out infinite;
        }
        .np-title-scroll:hover .np-title-inner { animation-play-state: paused; }
        @keyframes npMarquee {
          0%, 20% { transform: translateX(0); }
          50%, 70% { transform: translateX(var(--np-scroll, -50px)); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ── Sector Treemap (finviz style) ──
function SectorTreemap() {
  const stocks = useStockData();
  const [expanded, setExpanded] = useState(false);
  if (!stocks.length) return null;

  // Build flat list of individual stocks with sector info
  const items = SECTORS.flatMap(sec =>
    sec.symbols.map(sym => {
      const stock = stocks.find(s => s.symbol === sym);
      return stock ? { symbol: stock.symbol, name: stock.name, pct: stock.pct, sector: sec.name, weight: Math.max(Math.abs(stock.pct), 0.3) } : null;
    }).filter(Boolean) as { symbol: string; name: string; pct: number; sector: string; weight: number }[]
  );

  const totalWeight = items.reduce((a, b) => a + b.weight, 0);
  const maxAbs = Math.max(...items.map(i => Math.abs(i.pct)), 1);

  const getColor = (pct: number) => {
    const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
    if (pct >= 0) return `rgba(${Math.round(30 + intensity * 10)}, ${Math.round(90 + intensity * 60)}, ${Math.round(60 + intensity * 30)}, ${0.5 + intensity * 0.35})`;
    return `rgba(${Math.round(130 + intensity * 50)}, ${Math.round(50 - intensity * 15)}, ${Math.round(55 - intensity * 10)}, ${0.5 + intensity * 0.35})`;
  };

  // Simple treemap: arrange in rows
  const W = 100; // percentage width
  const rows: { items: typeof items; y: number; h: number }[] = [];
  let remaining = [...items].sort((a, b) => b.weight - a.weight);
  let yPos = 0;

  while (remaining.length > 0) {
    const rowItems: typeof items = [];
    let rowWeight = 0;
    const targetRowWeight = totalWeight / 4; // ~4 rows
    while (remaining.length > 0 && (rowWeight < targetRowWeight || rowItems.length === 0)) {
      rowItems.push(remaining.shift()!);
      rowWeight += rowItems[rowItems.length - 1].weight;
    }
    const rowH = (rowWeight / totalWeight) * 100;
    rows.push({ items: rowItems, y: yPos, h: rowH });
    yPos += rowH;
  }

  const treemapContent = (
    <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: expanded ? '400px' : '160px', borderRadius: 4, overflow: 'hidden' }}>
      {rows.map((row) => {
        const rowWeight = row.items.reduce((a, b) => a + b.weight, 0);
        let xPos = 0;
        return row.items.map((item) => {
          const w = (item.weight / rowWeight) * W;
          const x = xPos;
          xPos += w;
          const symSize = expanded ? (w > 12 ? '16px' : '12px') : (w > 12 ? '13px' : '10px');
          const pctSize = expanded ? '13px' : '11px';
          return (
            <div key={item.symbol} style={{
              position: 'absolute',
              left: `${x}%`, top: `${row.y}%`,
              width: `${w}%`, height: `${row.h}%`,
              background: getColor(item.pct),
              border: '0.5px solid rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', cursor: 'default',
            }}>
              <div style={{ fontSize: symSize, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)', fontFamily: "'SF Mono', monospace", lineHeight: 1.2 }}>
                {item.symbol}
              </div>
              {w > 8 && (
                <div style={{ fontSize: pctSize, fontWeight: 600, color: 'rgba(255,255,255,0.95)', fontFamily: "'SF Mono', monospace" }}>
                  {item.pct >= 0 ? '+' : ''}{item.pct.toFixed(1)}%
                </div>
              )}
            </div>
          );
        });
      })}
    </div>
  );

  return (
    <div style={{ padding: '10px 12px', height: expanded ? 'auto' : '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          MARKET TREEMAP
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            onClick={() => setExpanded(e => !e)}
            style={{ cursor: 'pointer', fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontFamily: "'SF Mono', monospace", padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
          >
            {expanded ? '↙ Collapse' : '↗ Expand'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
            LIVE
          </div>
        </div>
      </div>
      {treemapContent}
    </div>
  );
}

// ── Sector Bubbles ──
function SectorBubbles() {
  const stocks = useStockData();
  if (!stocks.length) return null;

  const sectorData = SECTORS.map(sec => {
    const matched = stocks.filter(s => sec.symbols.includes(s.symbol));
    const avgPct = matched.length > 0 ? matched.reduce((a, s) => a + s.pct, 0) / matched.length : 0;
    return { name: sec.name, pct: avgPct, count: matched.length };
  });

  const maxAbs = Math.max(...sectorData.map(s => Math.abs(s.pct)), 1);
  const W = 320, H = 90;

  // Position bubbles in a packed layout
  const bubbles = sectorData.map((sec, i) => {
    const r = 12 + (sec.count / 11) * 20;
    const angle = (i / sectorData.length) * Math.PI * 2 - Math.PI / 2;
    const spread = 0.6;
    return {
      ...sec,
      r,
      cx: W / 2 + Math.cos(angle) * (W * spread * 0.35),
      cy: H / 2 + Math.sin(angle) * (H * spread * 0.35),
    };
  });

  const getColor = (pct: number) => {
    const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
    if (pct >= 0) return `rgba(34, ${Math.round(140 + intensity * 57)}, ${Math.round(60 + intensity * 20)}, ${0.7 + intensity * 0.3})`;
    return `rgba(${Math.round(200 + intensity * 48)}, ${Math.round(50 - intensity * 25)}, ${Math.round(50 - intensity * 20)}, ${0.7 + intensity * 0.3})`;
  };

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
          SECTOR BUBBLES
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE
        </div>
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {bubbles.map(b => (
          <g key={b.name}>
            <circle cx={b.cx} cy={b.cy} r={b.r} fill={getColor(b.pct)} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <text x={b.cx} y={b.cy - 3} textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="'SF Mono', monospace" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {b.name}
            </text>
            <text x={b.cx} y={b.cy + 7} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="7" fontWeight="600" fontFamily="'SF Mono', monospace">
              {b.pct >= 0 ? '+' : ''}{b.pct.toFixed(1)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Market Clock (fills empty grid slot next to Energy) ──
function MarketClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // NYSE hours: 9:30 AM - 4:00 PM ET, Mon-Fri
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay(); // 0=Sun, 6=Sat
  const hrs = et.getHours();
  const mins = et.getMinutes();
  const secs = et.getSeconds();
  const totalMins = hrs * 60 + mins;
  const openMin = 9 * 60 + 30; // 9:30 AM
  const closeMin = 16 * 60;     // 4:00 PM
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && totalMins >= openMin && totalMins < closeMin;

  // Calculate countdown
  let targetLabel = '';
  let countdown = '';
  if (isOpen) {
    // Market is open — count down to close
    targetLabel = 'MARKET CLOSES IN';
    const remaining = (closeMin - totalMins) * 60 - secs;
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    countdown = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    // Market is closed — count down to next open
    targetLabel = 'MARKET OPENS IN';
    let nextOpen = new Date(et);
    if (isWeekday && totalMins < openMin) {
      // Today before open
      nextOpen.setHours(9, 30, 0, 0);
    } else {
      // After close or weekend — find next weekday
      nextOpen.setDate(nextOpen.getDate() + 1);
      while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
      nextOpen.setHours(9, 30, 0, 0);
    }
    const diff = Math.max(0, Math.floor((nextOpen.getTime() - et.getTime()) / 1000));
    const dh = Math.floor(diff / 3600);
    const dm = Math.floor((diff % 3600) / 60);
    const ds = diff % 60;
    if (dh >= 24) {
      const dd = Math.floor(dh / 24);
      const rh = dh % 24;
      countdown = `${dd}d ${rh}h ${dm.toString().padStart(2, '0')}m`;
    } else {
      countdown = `${dh}:${dm.toString().padStart(2, '0')}:${ds.toString().padStart(2, '0')}`;
    }
  }

  return (
    <div style={{
      padding: '6px 8px',
      background: 'rgba(255,255,255,0.04)', borderRadius: 5, border: '0.5px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: isOpen ? '#4ade80' : '#f87171', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: isOpen ? '#4ade80' : '#f87171', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>
          {isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
        </span>
      </div>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace", marginBottom: '4px' }}>
        {targetLabel}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>
        {countdown}
      </div>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Mono', monospace", marginTop: '4px' }}>
        NYSE · {et.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })} ET
      </div>
    </div>
  );
}

// ── Mountain Climber Interactive ──
// Side-view mountain in the triangular whitespace of the left panel.
// Fixed 200x300 viewBox so proportions stay consistent regardless of container size.
const CLIMB_START = 0.08; // man starts near the bottom of the mountain, around email level
function MountainClimber() {
  const [progress, setProgress] = useState(CLIMB_START);
  const [celebrating, setCelebrating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [typedChars, setTypedChars] = useState(0);
  const keysDown = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const fullMessage = 'YOU\nJUST\nNEED TO\nKEEP ON\nPUSHING';

  // Fixed coordinate system — 240x400 ensures consistent proportions
  const W = 240;
  const H = 400;

  // Ridge points — gentle rolling hill with subtle S-curves
  const ridgePts: [number, number][] = [
    [8, H],        // flush with bottom edge
    [18, 378],
    [30, 358],
    [42, 342],     // gentle start
    [54, 330],
    [66, 320],
    [76, 314],     // slight plateau
    [86, 310],
    [96, 304],
    [106, 294],    // picks up again
    [116, 280],
    [126, 264],
    [134, 250],    // mid-slope
    [142, 238],
    [150, 224],
    [158, 208],
    [166, 190],    // steeper push
    [174, 170],
    [182, 148],
    [188, 130],    // approaching summit
    [194, 114],
    [200, 100],
    [206, 88],
    [212, 78],     // summit
  ];

  // Smooth ridge path with quadratic bezier curves
  const ridgePath = (() => {
    const pts = ridgePts;
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i][0] + pts[i + 1][0]) / 2;
      const midY = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q ${pts[i][0]},${pts[i][1]} ${midX},${midY}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last[0]},${last[1]}`;
    return d;
  })();

  // Terrain fill: ridge → right edge → bottom → close
  const terrainPath = `${ridgePath} L ${W},${ridgePts[ridgePts.length - 1][1]} L ${W},${H} L ${ridgePts[0][0]},${H} Z`;

  // Get position along the climb path
  const getPositionOnRidge = useCallback((t: number) => {
    const pts = ridgePts;
    let totalLen = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i-1][0]; const dy = pts[i][1] - pts[i-1][1];
      totalLen += Math.sqrt(dx*dx + dy*dy);
    }
    const targetLen = t * totalLen;
    let traveled = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i-1][0]; const dy = pts[i][1] - pts[i-1][1];
      const segLen = Math.sqrt(dx*dx + dy*dy);
      if (traveled + segLen >= targetLen) {
        const frac = segLen > 0 ? (targetLen - traveled) / segLen : 0;
        return {
          x: pts[i-1][0] + dx * frac,
          y: pts[i-1][1] + dy * frac,
          // Slope angle for tilting figure
          angle: Math.atan2(-dy, dx),
        };
      }
      traveled += segLen;
    }
    const last = pts[pts.length - 1];
    return { x: last[0], y: last[1], angle: -Math.PI / 4 };
  }, []);

  // Keyboard
  useEffect(() => {
    if (celebrating) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { keysDown.current.add(e.key); setHintVisible(false); }
    };
    const up = (e: KeyboardEvent) => { keysDown.current.delete(e.key); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [celebrating]);

  // Animation loop
  useEffect(() => {
    if (celebrating) return;
    let lastTime = 0;
    const speed = 0.1;
    const tick = (time: number) => {
      if (lastTime) {
        const dt = (time - lastTime) / 1000;
        if (keysDown.current.size > 0) {
          setProgress(prev => {
            const next = Math.min(prev + speed * dt, 1);
            if (next >= 1) { setCelebrating(true); setTimeout(() => setShowMessage(true), 800); }
            return next;
          });
        } else {
          setProgress(prev => Math.max(prev - speed * 0.08 * dt, CLIMB_START));
        }
      }
      lastTime = time;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [celebrating]);

  // Typewriter effect for "JUST KEEP PUSHING"
  useEffect(() => {
    if (!showMessage) return;
    setTypedChars(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= fullMessage.length) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, [showMessage]);

  const pos = getPositionOnRidge(progress);
  const sphereR = 6;
  const summit = ridgePts[ridgePts.length - 1];

  const particles = celebrating ? Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r = 20 + Math.random() * 15;
    return { x: pos.x + Math.cos(a) * r, y: pos.y + Math.sin(a) * r, delay: i * 0.05, color: ['#fbbf24', '#fff', '#4ade80', '#f472b6'][i % 4] };
  }) : [];

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '65%',
        height: '75%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMax meet">
        <defs>
          <radialGradient id="sphereGlow">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="mtnFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.015)" />
          </linearGradient>
          <filter id="sphereBlur"><feGaussianBlur stdDeviation="4" /></filter>
          <filter id="celebGlow"><feGaussianBlur stdDeviation="3" /></filter>
          <clipPath id="mtnClip">
            <path d={terrainPath} />
          </clipPath>
        </defs>

        {/* Mountain body fill */}
        <path d={terrainPath} fill="url(#mtnFill)" />

        {/* Subtle terrain texture lines */}
        <line x1="60" y1="340" x2="160" y2="340" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
        <line x1="80" y1="290" x2="180" y2="290" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
        <line x1="110" y1="230" x2="200" y2="230" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        <line x1="140" y1="170" x2="220" y2="170" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        <line x1="170" y1="110" x2="230" y2="110" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />

        {/* Mountain ridge line */}
        <path d={ridgePath} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Flag at summit — red until reached, then green */}
        <g transform={`translate(${summit[0]}, ${summit[1]})`}>
          <line x1="0" y1="0" x2="0" y2="-16" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <polygon points="0,-16 10,-12.5 0,-9" fill={celebrating ? '#4ade80' : '#ef4444'} stroke={celebrating ? '#22c55e' : '#dc2626'} strokeWidth="0.5" opacity={0.85} />
        </g>

        {/* Glowing sphere — ON TOP of the ridge */}
        {!celebrating && (
          <>
            <circle cx={pos.x + 6} cy={pos.y - sphereR - 6} r={sphereR + 8} fill="url(#sphereGlow)" filter="url(#sphereBlur)" opacity={0.6} />
            <circle cx={pos.x + 6} cy={pos.y - sphereR - 6} r={sphereR} fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8">
              <animate attributeName="r" values={`${sphereR};${sphereR + 1};${sphereR}`} dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Stick figure */}
        {(() => {
          const step = Math.sin(progress * Math.PI * 20);
          const isMoving = keysDown.current.size > 0;
          const legSpread = isMoving ? step * 4 : 0;
          // Position figure ON the ridge (feet on the surface)
          const fx = pos.x;
          const fy = pos.y;

          if (celebrating) {
            // Standing upright to the RIGHT of the flag — feet ON the ridge
            const sx = summit[0] + 14;
            const sy = summit[1] - 10; // offset up so feet (at +10) land on ridge
            return (
              <g transform={`translate(${sx}, ${sy})`} opacity="0.9">
                {/* Legs — standing */}
                <line x1="-2" y1="0" x2="-3" y2="10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="2" y1="0" x2="3" y2="10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                {/* Body — upright */}
                <line x1="0" y1="0" x2="0" y2="-12" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
                {/* Head */}
                <circle cx="0" cy="-15" r="2.5" fill="none" stroke="#fff" strokeWidth="1" />
                {/* Arms — raised in victory */}
                <line x1="0" y1="-9" x2="-7" y2="-16" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
                <line x1="0" y1="-9" x2="7" y2="-16" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
              </g>
            );
          }

          return (
            <g transform={`translate(${fx - 14}, ${fy - 8})`} opacity="0.8">
              {/* Legs — stepping animation, feet touch the ridge surface */}
              <line x1="0" y1="0" x2={3 + legSpread} y2="8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="0" y1="0" x2={3 - legSpread} y2="8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              {/* Body — leaning forward to push */}
              <line x1="0" y1="0" x2="8" y2="-10" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
              {/* Head */}
              <circle cx="9.5" cy="-12.5" r="2.5" fill="none" stroke="#fff" strokeWidth="1" />
              {/* Arms — reaching forward to push the ball */}
              <line x1="5" y1="-6" x2="13" y2="-7" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
              <line x1="5" y1="-7" x2="13" y2="-5" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
            </g>
          );
        })()}

        {/* Celebration particles */}
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={p.color} opacity={showMessage ? 0 : 1} filter="url(#celebGlow)">
            <animate attributeName="r" from="0" to="4" dur="0.6s" begin={`${p.delay}s`} fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="1.2s" begin={`${p.delay + 0.3}s`} fill="freeze" />
          </circle>
        ))}

        {/* "YOU JUST NEED TO KEEP ON PUSHING" — text fills mountain shape, clipped to terrain */}
        {showMessage && (() => {
          // Text fills the mountain shape — each word sized to fit its horizontal band
          const words = ['YOU', 'JUST', 'NEED TO', 'KEEP ON', 'PUSHING'];
          const bandCount = words.length;
          const topY = 78;   // summit Y
          const botY = H;    // base Y
          const bandH = (botY - topY) / bandCount;

          // Helper: find the ridge X at a given Y (left edge of mountain at that height)
          const getRidgeXAtY = (y: number) => {
            for (let i = 1; i < ridgePts.length; i++) {
              const [x0, y0] = ridgePts[i - 1];
              const [x1, y1] = ridgePts[i];
              if ((y0 <= y && y <= y1) || (y1 <= y && y <= y0)) {
                const t = y0 === y1 ? 0 : (y - y0) / (y1 - y0);
                return x0 + t * (x1 - x0);
              }
            }
            return ridgePts[0][0];
          };

          return (
            <g clipPath="url(#mtnClip)">
              {words.map((word, wi) => {
                const charsBeforeThisWord = words.slice(0, wi).reduce((s, w) => s + w.length + 1, 0);
                const charsAvailable = Math.max(0, typedChars - charsBeforeThisWord);
                const visiblePart = word.slice(0, charsAvailable);
                if (charsAvailable <= 0) return null;
                const bandMidY = topY + (wi + 0.55) * bandH;
                const fontSize = bandH * 0.78;
                // Left edge of mountain at this Y
                const leftX = getRidgeXAtY(bandMidY) + 4;
                const rightX = W - 2;
                const availWidth = rightX - leftX;
                return (
                  <text
                    key={wi}
                    x={leftX}
                    y={bandMidY + fontSize * 0.32}
                    textAnchor="start"
                    textLength={availWidth}
                    lengthAdjust="spacingAndGlyphs"
                    style={{
                      fontSize: `${fontSize}px`,
                      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                      fontWeight: 900,
                      fontStyle: 'italic',
                      fill: 'rgba(255,255,255,0.15)',
                    }}
                  >
                    {visiblePart}
                  </text>
                );
              })}
            </g>
          );
        })()}
      </svg>

      {/* Hint — glowing text in bottom right */}
      {hintVisible && !celebrating && (
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          fontSize: '10px', fontFamily: "'SF Mono', monospace",
          color: 'rgba(255,255,255,0.5)',
          animation: 'cornerPulse 2.5s ease-in-out infinite',
          pointerEvents: 'none', textAlign: 'right',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            hold
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', borderRadius: 3, padding: '1px 5px', fontSize: '9px', background: 'rgba(255,255,255,0.06)' }}>↑</span>
            or
            <span style={{ border: '1px solid rgba(255,255,255,0.4)', borderRadius: 3, padding: '1px 5px', fontSize: '9px', background: 'rgba(255,255,255,0.06)' }}>→</span>
            to push
          </span>
        </div>
      )}

      {/* Reset button — appears after celebration */}
      {celebrating && (
        <div
          onClick={() => {
            setCelebrating(false);
            setShowMessage(false);
            setTypedChars(0);
            setProgress(CLIMB_START);
            setHintVisible(true);
          }}
          style={{
            position: 'absolute', bottom: '8px', right: '8px',
            cursor: 'pointer', pointerEvents: 'auto',
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.4)', fontSize: '11px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          title="Reset climb"
        >
          ↻
        </div>
      )}
    </div>
  );
}

// ── Sector Sparklines ──
function AnimatedSparkline({ history, color, delay, sparkW, sparkH, animReady, idx }: {
  history: number[]; color: string; delay: number; sparkW: number; sparkH: number; animReady: boolean; idx: number;
}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;

  useEffect(() => {
    if (!animReady || history.length === 0) return;

    const timeout = setTimeout(() => {
      let frame = 0;
      const totalPoints = history.length;
      const framesPerPoint = Math.max(1, Math.round(72 / totalPoints));
      let subFrame = 0;

      const loop = () => {
        subFrame++;
        if (subFrame >= framesPerPoint) {
          subFrame = 0;
          frame++;
          setProgress(frame);
        }
        if (frame < totalPoints) {
          rafRef.current = requestAnimationFrame(loop);
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animReady]);

  const visCount = Math.min(progress, history.length);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < visCount; i++) {
    pts.push({
      x: (i / (history.length - 1)) * sparkW,
      y: sparkH - ((history[i] - min) / range) * (sparkH - 4) - 2,
    });
  }

  const linePath = pts.length > 1
    ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const gradId = `sector-grad-${idx}`;
  const glowId = `sector-glow-${idx}`;

  return (
    <svg width="100%" height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {linePath && firstPt && lastPt && (
        <>
          <path d={linePath + ` L${lastPt.x.toFixed(1)},${sparkH} L${firstPt.x.toFixed(1)},${sparkH} Z`} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastPt.x} cy={lastPt.y} r={3} fill={color} filter={`url(#${glowId})`}>
            <animate attributeName="r" values="2;4;2" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

function SectorSparklines({ onSectorClick }: { onSectorClick?: (name: string) => void } = {}) {
  const stocks = useStockData();
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    if (stocks.length > 0) {
      const t = setTimeout(() => setAnimReady(true), 100);
      return () => clearTimeout(t);
    }
  }, [stocks.length]);

  if (!stocks.length) return null;

  const sectorData = SECTORS.map(sec => {
    const matched = stocks.filter(s => sec.symbols.includes(s.symbol));
    const avgPct = matched.length > 0 ? matched.reduce((a, s) => a + s.pct, 0) / matched.length : 0;
    const maxLen = Math.max(...matched.map(s => s.history.length), 0);
    const avgHistory: number[] = [];
    for (let i = 0; i < maxLen; i++) {
      // Normalize each stock to % change from its start price so BTC doesn't dominate
      const pctChanges = matched.map(s => {
        if (s.history[i] == null || !s.history[0]) return null;
        return ((s.history[i] - s.history[0]) / s.history[0]) * 100;
      }).filter((v): v is number => v != null);
      avgHistory.push(pctChanges.length > 0 ? pctChanges.reduce((a, b) => a + b, 0) / pctChanges.length : 0);
    }
    return { name: sec.name, pct: avgPct, history: avgHistory, count: matched.length };
  });

  const sparkW = 200, sparkH = 40;

  return (
    <div style={{ padding: '10px 12px' }}>
      <style>{`
        @keyframes sparkFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          SECTOR PERFORMANCE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {sectorData.map((sec, idx) => {
          const color = sec.pct >= 0 ? '#4ade80' : '#f87171';
          const delay = idx * 0.12;
          return (
            <div key={sec.name}
              onClick={(e) => { e.stopPropagation(); onSectorClick?.(sec.name); }}
              style={{
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.04)', borderRadius: 5, border: '0.5px solid rgba(255,255,255,0.06)',
              opacity: animReady ? 1 : 0, animation: animReady ? `sparkFadeIn 0.4s ${delay}s ease-out both` : 'none',
              cursor: onSectorClick ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (onSectorClick) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { if (onSectorClick) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace" }}>{sec.name}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color, fontFamily: "'SF Mono', monospace" }}>
                  {sec.pct >= 0 ? '+' : ''}{sec.pct.toFixed(2)}%
                </span>
              </div>
              <AnimatedSparkline
                history={sec.history}
                color={color}
                delay={delay}
                sparkW={sparkW}
                sparkH={sparkH}
                animReady={animReady}
                idx={idx}
              />
            </div>
          );
        })}
        {/* Market Clock — fills the empty 8th grid slot */}
        <MarketClock />
      </div>
    </div>
  );
}

// ── Drill-Down Components ──

function BloombergBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
        fontSize: '10px', fontWeight: 700, fontFamily: "'SF Mono', monospace",
        letterSpacing: '0.05em', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#60a5fa')}
      onMouseLeave={e => (e.currentTarget.style.color = '#3b82f6')}
    >
      ← BACK TO DASHBOARD
    </button>
  );
}

// ── Middle Panel: Site Guide + Tech Stack + Stats + Certs ──

const SITE_GUIDE = [
  { label: 'About', desc: 'Static Abdullah profile shell', cmd: 'npm run about', icon: '👋' },
  { label: 'Projects', desc: 'projects & builds', cmd: 'git log --projects', icon: '🔨' },
  { label: 'abdullahOS', desc: 'custom desktop project', cmd: 'open abdullahOS.app', icon: '▣' },
  { label: 'Contact', desc: 'Static contact window', cmd: 'open contact.app', icon: '✉' },
  { label: 'Photos', desc: 'Local photo gallery', cmd: 'photos', icon: '◈' },
];

// Category color themes — one gradient color per category
const CATEGORY_THEME: Record<string, { color: string; rgb: string }> = {
  Languages:  { color: '#5B9BD5', rgb: '91,155,213' },
  Frameworks: { color: '#4ECB71', rgb: '78,203,113' },
  Tools:      { color: '#FF9F43', rgb: '255,159,67' },
};
const TECH_STACK = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'Java', 'C++', 'SQL', 'Go'] },
  { category: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'Astro', 'FastAPI', 'Spring'] },
  { category: 'Tools', items: ['AWS', 'Docker', 'PostgreSQL', 'Redis', 'Git', 'Linux'] },
];

const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#4285F4', '#EA4335', '#FBBC04', '#34A853', '#4285F4', '#EA4335', '#FBBC04', '#34A853'];
// Wharton: "Wharton" in blue, " Online" in white
const WHARTON_COLORS = ['#4A7EC1','#4A7EC1','#4A7EC1','#4A7EC1','#4A7EC1','#4A7EC1','#4A7EC1','#fff','#fff','#fff','#fff','#fff','#fff','#fff'];
// Amazon: 3 yellow, 3 white, space white, "Web" all yellow, space white, "Ser" white, "vic" yellow, "es" white
const AMAZON_COLORS = ['#FF9900','#FF9900','#FF9900','#fff','#fff','#fff','#fff','#FF9900','#FF9900','#FF9900','#fff','#fff','#fff','#fff','#FF9900','#FF9900','#FF9900','#fff','#fff'];
const SALESFORCE_COLORS = ['#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0','#00A1E0'];

function BrandText({ text, colors }: { text: string; colors: string[] }) {
  return <>{text.split('').map((ch, i) => <span key={i} style={{ color: colors[i % colors.length] }}>{ch}</span>)}</>;
}

const CERTIFICATIONS = [
  { name: 'Machine Learning for Trading Specialization', issuer: 'Google Cloud', status: '', issuerColors: GOOGLE_COLORS },
  { name: 'Finance & Quantitative Modeling for Analysts', issuer: 'Wharton Online', status: '', issuerColors: WHARTON_COLORS },
  { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', status: 'In Progress', issuerColors: AMAZON_COLORS },
  { name: 'Salesforce Certified B2C Commerce Cloud Developer', issuer: 'Salesforce', status: 'In Progress', issuerColors: SALESFORCE_COLORS },
];

const sectionLabel: React.CSSProperties = {
  color: '#fff', fontSize: '11px', fontWeight: 700,
  letterSpacing: '0.1em', marginBottom: '10px', fontFamily: "'SF Mono', monospace",
};

// ── Chronograph Clock ──
function ChronographClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78; // main dial radius

  // Angles (12 o'clock = -90deg)
  const secAngle = (seconds / 60) * 360 - 90;
  const minAngle = (minutes / 60) * 360 + (seconds / 60) * 6 - 90;
  const hrAngle = (hours / 12) * 360 + (minutes / 60) * 30 - 90;

  const hand = (angle: number, len: number, w: number, color: string) => {
    const rad = (angle * Math.PI) / 180;
    return (
      <line
        x1={cx} y1={cy}
        x2={cx + Math.cos(rad) * len}
        y2={cy + Math.sin(rad) * len}
        stroke={color} strokeWidth={w} strokeLinecap="round"
      />
    );
  };

  // Sub-dial: running seconds (small circle at bottom)
  const subR = 18;
  const subCx = cx;
  const subCy = cy + 32;
  const subSecAngle = (seconds / 60) * 360 - 90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />

        {/* Hour markers */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = ((i / 12) * 360 - 90) * Math.PI / 180;
          const isMain = i % 3 === 0;
          const inner = isMain ? r - 12 : r - 8;
          const outer = r - 2;
          return (
            <line
              key={i}
              x1={cx + Math.cos(angle) * inner} y1={cy + Math.sin(angle) * inner}
              x2={cx + Math.cos(angle) * outer} y2={cy + Math.sin(angle) * outer}
              stroke={isMain ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}
              strokeWidth={isMain ? 1.5 : 0.8}
              strokeLinecap="round"
            />
          );
        })}

        {/* Minute tick marks */}
        {Array.from({ length: 60 }, (_, i) => {
          if (i % 5 === 0) return null;
          const angle = ((i / 60) * 360 - 90) * Math.PI / 180;
          return (
            <line
              key={`m${i}`}
              x1={cx + Math.cos(angle) * (r - 4)} y1={cy + Math.sin(angle) * (r - 4)}
              x2={cx + Math.cos(angle) * (r - 2)} y2={cy + Math.sin(angle) * (r - 2)}
              stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"
            />
          );
        })}

        {/* Sub-dial ring (running seconds) */}
        <circle cx={subCx} cy={subCy} r={subR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {/* Sub-dial ticks */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = ((i / 12) * 360 - 90) * Math.PI / 180;
          return (
            <line
              key={`s${i}`}
              x1={subCx + Math.cos(angle) * (subR - 3)} y1={subCy + Math.sin(angle) * (subR - 3)}
              x2={subCx + Math.cos(angle) * (subR - 1)} y2={subCy + Math.sin(angle) * (subR - 1)}
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.4"
            />
          );
        })}
        {/* Sub-dial hand */}
        {(() => {
          const rad = (subSecAngle * Math.PI) / 180;
          return (
            <line
              x1={subCx} y1={subCy}
              x2={subCx + Math.cos(rad) * (subR - 4)}
              y2={subCy + Math.sin(rad) * (subR - 4)}
              stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" strokeLinecap="round"
            />
          );
        })()}

        {/* Hour hand */}
        {hand(hrAngle, 40, 2.2, 'rgba(255,255,255,0.75)')}
        {/* Minute hand */}
        {hand(minAngle, 58, 1.5, 'rgba(255,255,255,0.6)')}
        {/* Second hand */}
        {hand(secAngle, 65, 0.6, 'rgba(255,255,255,0.35)')}
        {/* Second hand tail */}
        {(() => {
          const rad = ((secAngle + 180) * Math.PI) / 180;
          return (
            <line
              x1={cx} y1={cy}
              x2={cx + Math.cos(rad) * 14}
              y2={cy + Math.sin(rad) * 14}
              stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" strokeLinecap="round"
            />
          );
        })()}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2.5" fill="rgba(255,255,255,0.5)" />
        <circle cx={cx} cy={cy} r="1" fill="#1a1a2e" />

        {/* Brand text */}
        <text x={cx} y={cy - 20} textAnchor="middle" style={{ fontSize: '6px', fill: 'rgba(255,255,255,0.2)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.15em', fontWeight: 500 }}>
          SULTAN
        </text>
      </svg>

      {/* Digital readout below */}
      <div style={{
        fontFamily: "'SF Mono', monospace",
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.1em',
      }}>
        {String(time.getHours()).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}

function __removedDinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    dino: { y: number; vy: number; jumping: boolean; ducking: boolean; width: number; height: number };
    obstacles: { x: number; width: number; height: number; type: 'cactus' | 'bird'; y: number }[];
    score: number;
    highScore: number;
    speed: number;
    frame: number;
    gameOver: boolean;
    started: boolean;
    groundY: number;
    raf: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const CANVAS_W = 400;
  const CANVAS_H = 100;
  const GROUND_Y = 80;
  const DINO_W = 20;
  const DINO_H = 22;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -10;

  const initGame = () => {
    const g = {
      dino: { y: GROUND_Y - DINO_H, vy: 0, jumping: false, ducking: false, width: DINO_W, height: DINO_H },
      obstacles: [] as any[],
      score: 0,
      highScore: gameRef.current?.highScore || 0,
      speed: 3,
      frame: 0,
      gameOver: false,
      started: true,
      groundY: GROUND_Y,
      raf: 0,
    };
    gameRef.current = g;
    setGameOver(false);
    setStarted(true);
    setScore(0);
  };

  const drawDino = (ctx: CanvasRenderingContext2D, g: NonNullable<typeof gameRef.current>) => {
    const d = g.dino;
    ctx.fillStyle = '#e0e0e0';
    // Simple dino shape
    const legFrame = Math.floor(g.frame / 5) % 2;
    // Body
    ctx.fillRect(d.y < GROUND_Y - DINO_H - 2 ? 12 : 10, d.y, d.width, d.ducking ? d.height * 0.6 : d.height);
    // Head
    ctx.fillRect(22, d.y - 6, 10, 8);
    // Eye
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(27, d.y - 4, 3, 3);
    ctx.fillStyle = '#e0e0e0';
    // Legs
    if (!d.jumping) {
      if (legFrame === 0) {
        ctx.fillRect(12, d.y + d.height, 4, 5);
        ctx.fillRect(22, d.y + d.height, 4, 3);
      } else {
        ctx.fillRect(12, d.y + d.height, 4, 3);
        ctx.fillRect(22, d.y + d.height, 4, 5);
      }
    } else {
      ctx.fillRect(12, d.y + d.height, 4, 4);
      ctx.fillRect(22, d.y + d.height, 4, 4);
    }
    // Tail
    ctx.fillRect(6, d.y + 2, 6, 3);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial state
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();

    // Static dino
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(10, GROUND_Y - DINO_H, DINO_W, DINO_H);
    ctx.fillRect(22, GROUND_Y - DINO_H - 6, 10, 8);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(27, GROUND_Y - DINO_H - 4, 3, 3);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(12, GROUND_Y, 4, 4);
    ctx.fillRect(22, GROUND_Y, 4, 4);
    ctx.fillRect(6, GROUND_Y - DINO_H + 2, 6, 3);

    // "Press Space" text
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = "10px 'SF Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to start', CANVAS_W / 2, GROUND_Y + 16);
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g = gameRef.current;
    if (!g) return;

    let raf: number;
    const loop = () => {
      g.frame++;
      const d = g.dino;

      // Physics
      if (d.jumping) {
        d.vy += GRAVITY;
        d.y += d.vy;
        if (d.y >= GROUND_Y - d.height) {
          d.y = GROUND_Y - d.height;
          d.vy = 0;
          d.jumping = false;
        }
      }

      // Spawn obstacles
      const lastObs = g.obstacles[g.obstacles.length - 1];
      const minGap = 120 / g.speed * 3;
      if (!lastObs || lastObs.x < CANVAS_W - minGap) {
        if (Math.random() < 0.02) {
          const isBird = g.score > 5 && Math.random() < 0.25;
          g.obstacles.push({
            x: CANVAS_W + 10,
            width: isBird ? 16 : (8 + Math.random() * 12),
            height: isBird ? 12 : (15 + Math.random() * 15),
            type: isBird ? 'bird' : 'cactus',
            y: isBird ? GROUND_Y - 30 - Math.random() * 15 : GROUND_Y,
          });
        }
      }

      // Move obstacles
      g.obstacles.forEach(o => { o.x -= g.speed; });
      g.obstacles = g.obstacles.filter(o => o.x > -30);

      // Score
      g.score += 0.05;
      g.speed = 3 + Math.floor(g.score / 10) * 0.5;
      setScore(Math.floor(g.score));

      // Collision
      for (const o of g.obstacles) {
        const ox = o.x;
        const oy = o.type === 'cactus' ? o.y - o.height : o.y;
        const ow = o.width;
        const oh = o.height;
        const dx = 10, dy = d.y, dw = d.width + 10, dh = d.ducking ? d.height * 0.6 : d.height;
        if (dx + dw > ox + 2 && dx < ox + ow - 2 && dy + dh > oy + 2 && dy < oy + oh - 2) {
          g.gameOver = true;
          if (g.score > g.highScore) {
            g.highScore = Math.floor(g.score);
            setHighScore(Math.floor(g.score));
          }
          setGameOver(true);
          return;
        }
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Ground
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();

      // Ground texture (small dashes)
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 30; i++) {
        const gx = ((i * 17 + g.frame * g.speed * 0.5) % (CANVAS_W + 20)) - 10;
        ctx.fillRect(gx, GROUND_Y + 2 + (i % 3), 3 + (i % 2), 1);
      }

      // Dino
      drawDino(ctx, g);

      // Obstacles
      for (const o of g.obstacles) {
        if (o.type === 'cactus') {
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(o.x, o.y - o.height, o.width, o.height);
          // Cactus arms
          if (o.width > 12) {
            ctx.fillRect(o.x - 4, o.y - o.height * 0.6, 5, 3);
            ctx.fillRect(o.x + o.width - 1, o.y - o.height * 0.4, 5, 3);
          }
        } else {
          // Bird
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillRect(o.x, o.y, o.width, 4);
          // Wings
          const wingY = g.frame % 10 < 5 ? -5 : 3;
          ctx.fillRect(o.x + 4, o.y + wingY, 8, 3);
        }
      }

      // Score display
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = "10px 'SF Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.floor(g.score)).padStart(5, '0'), CANVAS_W - 4, 12);
      if (g.highScore > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillText('HI ' + String(g.highScore).padStart(5, '0'), CANVAS_W - 60, 12);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started, gameOver]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const g = gameRef.current;
        if (!g || !g.started) {
          initGame();
          return;
        }
        if (g.gameOver) {
          initGame();
          return;
        }
        if (!g.dino.jumping) {
          g.dino.jumping = true;
          g.dino.vy = JUMP_FORCE;
        }
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        const g = gameRef.current;
        if (g && g.started && !g.gameOver) {
          g.dino.ducking = true;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        const g = gameRef.current;
        if (g) g.dino.ducking = false;
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        const g = gameRef.current;
        if (!g || !g.started) {
          initGame();
          return;
        }
        if (g.gameOver) {
          initGame();
          return;
        }
        if (!g.dino.jumping) {
          g.dino.jumping = true;
          g.dino.vy = JUMP_FORCE;
        }
      }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 6,
        padding: '6px',
        border: '0.5px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ display: 'block', width: '100%', height: 'auto', imageRendering: 'pixelated' }}
      />
      {gameOver && (
        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>
            GAME OVER — click or press SPACE to restart
          </span>
        </div>
      )}
    </div>
  );
}

// ── Bloomberg Terminal Components (fullscreen easter egg) ──

const SECTOR_COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa', '#fb923c', '#2dd4bf'];

const LEADERBOARD_FUNDS = [
  { name: 'S&P 500 (SPY)', annualReturn: 10 },
  { name: 'Nasdaq (QQQ)', annualReturn: 15 },
  { name: 'Berkshire Hathaway', annualReturn: 12 },
  { name: 'Renaissance Technologies', annualReturn: 30 },
  { name: 'Bridgewater Associates', annualReturn: 8 },
  { name: 'Citadel Wellington', annualReturn: 20 },
  { name: 'Two Sigma', annualReturn: 18 },
  { name: 'D.E. Shaw', annualReturn: 15 },
  { name: 'AQR Capital', annualReturn: 10 },
  { name: 'Tiger Global', annualReturn: 22 },
  { name: 'Millennium Management', annualReturn: 14 },
  { name: 'Point72', annualReturn: 16 },
];

function BloombergTopBar({ stocks }: { stocks: StockData[]; gameMode: boolean; onToggleGame: () => void }) {
  // Build a doubled list for seamless loop
  const tickerItems = stocks.length > 0 ? [...stocks, ...stocks] : [];

  return (
    <div className="bloomberg-top-bar" style={{
      height: '28px', minHeight: '28px', borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      overflow: 'hidden', position: 'relative',
      fontFamily: "'SF Mono', monospace", fontSize: '10px',
    }}>
      <div className="ticker-scroll" style={{
        display: 'flex', alignItems: 'center', height: '100%',
        whiteSpace: 'nowrap', gap: '24px',
        animation: `tickerRoll ${stocks.length * 3}s linear infinite`,
      }}>
        {tickerItems.map((s, i) => (
          <span key={`${s.symbol}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{s.symbol}</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>{s.price < 1000 ? s.price.toFixed(2) : s.price.toFixed(0)}</span>
            <span style={{ color: s.pct >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
              {s.pct >= 0 ? '▲' : '▼'}{Math.abs(s.pct).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes tickerRoll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function BloombergStockGrid6({ stocks, onStockClick }: { stocks: StockData[]; onStockClick: (symbol: string, name: string) => void }) {
  const currentStocks = useRef<(StockData | null)[]>(Array(9).fill(null));
  const [hovered, setHovered] = useState<number | null>(null);

  const handleCurrentStock = (cellIdx: number, stock: StockData) => {
    currentStocks.current[cellIdx] = stock;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0' }}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i}
          onClick={(e) => {
            e.stopPropagation();
            const s = currentStocks.current[i];
            if (s) onStockClick(s.symbol, s.name);
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            padding: '8px 10px',
            borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            borderRight: i % 3 !== 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            cursor: 'pointer',
            background: hovered === i ? 'rgba(255,255,255,0.04)' : 'transparent',
            transition: 'background 0.15s',
          }}>
          <CyclingStock stocks={stocks} startOffset={i * 4} compact instanceId={100 + i} onCurrentStock={(s) => handleCurrentStock(i, s)} textColor="#fff" />
        </div>
      ))}
    </div>
  );
}

// ── Performance Bar Chart — top movers ──
function PerformanceBarChart({ stocks }: { stocks: StockData[] }) {
  const sorted = [...stocks].filter(s => s.pct !== 0).sort((a, b) => b.pct - a.pct);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();
  const movers = [...top5, ...bottom5];
  const maxAbs = Math.max(...movers.map(s => Math.abs(s.pct)), 1);

  return (
    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>TOP MOVERS</div>
      {movers.map((s, i) => {
        const isUp = s.pct >= 0;
        const barPct = (Math.abs(s.pct) / maxAbs) * 100;
        return (
          <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', opacity: 0, animation: `fadeInLeft 0.3s ease ${i * 0.04}s forwards` }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontFamily: "'SF Mono', monospace", minWidth: '40px' }}>{s.symbol}</span>
            <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', [isUp ? 'left' : 'right']: '50%', top: 0, height: '100%',
                width: `${barPct / 2}%`, borderRadius: '2px',
                background: isUp ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.6)',
                transition: 'width 0.5s ease',
              }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: "'SF Mono', monospace", minWidth: '52px', textAlign: 'right', color: isUp ? '#4ade80' : '#f87171' }}>
              {isUp ? '+' : ''}{s.pct.toFixed(2)}%
            </span>
          </div>
        );
      })}
      <style>{`@keyframes fadeInLeft { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}

// ── Correlation Matrix — sector correlations ──
function CorrelationMatrix({ stocks }: { stocks: StockData[] }) {
  const sectorNames = SECTORS.map(s => s.name);
  // Build sector average histories
  const sectorHistories = SECTORS.map(sector => {
    const matched = stocks.filter(s => sector.symbols.includes(s.symbol));
    if (matched.length === 0) return [];
    const maxLen = Math.max(...matched.map(s => s.history.length));
    const avg: number[] = [];
    for (let i = 0; i < maxLen; i++) {
      const vals = matched.map(s => s.history[i]).filter(v => v != null);
      avg.push(vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);
    }
    return avg;
  });

  // Compute correlation between two arrays
  const corr = (a: number[], b: number[]) => {
    const n = Math.min(a.length, b.length);
    if (n < 2) return 0;
    const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
    const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
    let num = 0, denA = 0, denB = 0;
    for (let i = 0; i < n; i++) {
      const da = a[i] - meanA, db = b[i] - meanB;
      num += da * db; denA += da * da; denB += db * db;
    }
    return denA > 0 && denB > 0 ? num / Math.sqrt(denA * denB) : 0;
  };

  const matrix = sectorHistories.map((a, i) => sectorHistories.map((b, j) => i === j ? 1 : corr(a, b)));

  const getColor = (v: number) => {
    const clamped = Math.max(-1, Math.min(1, v));
    if (clamped >= 0) return `rgba(74,222,128,${0.15 + clamped * 0.55})`;
    return `rgba(248,113,113,${0.15 + Math.abs(clamped) * 0.55})`;
  };

  return (
    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>SECTOR CORRELATION</div>
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${sectorNames.length}, 1fr)`, gap: '2px' }}>
        {/* Header row */}
        <div />
        {sectorNames.map(name => (
          <div key={name} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontFamily: "'SF Mono', monospace", padding: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {name.slice(0, 4)}
          </div>
        ))}
        {/* Data rows */}
        {sectorNames.map((rowName, ri) => (
          <React.Fragment key={rowName}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontFamily: "'SF Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px', fontWeight: 600 }}>
              {rowName.slice(0, 4)}
            </div>
            {matrix[ri].map((val, ci) => (
              <div key={ci} style={{
                background: getColor(val),
                borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                aspectRatio: '1', minHeight: '26px',
                fontSize: '12px', color: 'rgba(255,255,255,0.95)', fontFamily: "'SF Mono', monospace", fontWeight: 700,
              }}>
                {val.toFixed(1)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Volatility Gauge — sector volatility rings ──
function VolatilityGauge({ stocks }: { stocks: StockData[] }) {
  const sectorVols = SECTORS.map((sector, i) => {
    const matched = stocks.filter(s => sector.symbols.includes(s.symbol));
    // Average absolute pct change as proxy for volatility
    const avgVol = matched.length > 0 ? matched.reduce((sum, s) => sum + Math.abs(s.pct), 0) / matched.length : 0;
    return { name: sector.name, vol: avgVol, color: SECTOR_COLORS[i % SECTOR_COLORS.length] };
  }).sort((a, b) => b.vol - a.vol);

  const maxVol = Math.max(...sectorVols.map(s => s.vol), 1);

  return (
    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>VOLATILITY INDEX</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {sectorVols.map((s, i) => {
          const pct = (s.vol / maxVol) * 100;
          return (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontFamily: "'SF Mono', monospace", minWidth: '56px' }}>{s.name}</span>
              <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%', borderRadius: '4px',
                  background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                  transition: 'width 1s ease',
                  animation: `volGrow${i} 1.2s ease ${i * 0.08}s both`,
                }} />
              </div>
              <span style={{ fontSize: '10px', color: s.color, fontFamily: "'SF Mono', monospace", minWidth: '42px', textAlign: 'right', fontWeight: 600 }}>
                {s.vol.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      <style>{SECTORS.map((_, i) => `@keyframes volGrow${i} { from { width: 0; } }`).join('\n')}</style>
    </div>
  );
}

function SectorPieChart({ stocks }: { stocks: StockData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const sectorData = SECTORS.map((sector, i) => {
    const sectorStocks = stocks.filter(s => sector.symbols.includes(s.symbol));
    const totalValue = sectorStocks.reduce((sum, s) => sum + Math.abs(s.price), 0);
    return { name: sector.name, value: totalValue || 1, color: SECTOR_COLORS[i % SECTOR_COLORS.length], count: sectorStocks.length };
  });
  const total = sectorData.reduce((s, d) => s + d.value, 0);

  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ padding: '10px 14px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: "'SF Mono', monospace" }}>
        SECTOR ALLOCATION
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <svg width="180" height="180" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
          {sectorData.map((d, i) => {
            const pct = d.value / total;
            const dashLen = pct * circumference;
            const currentOffset = offset;
            offset += dashLen;
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="20"
                strokeDasharray={`${mounted ? dashLen : 0} ${circumference}`}
                strokeDashoffset={-currentOffset}
                style={{ transition: 'stroke-dasharray 0.8s ease-out', transformOrigin: `${cx}px ${cy}px` }}
              />
            );
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="18" fontWeight="700" fontFamily="'SF Mono', monospace">{SECTORS.length}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="'SF Mono', monospace">SECTORS</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sectorData.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: "'SF Mono', monospace" }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', minWidth: '55px' }}>{d.name}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{((d.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BloombergBottomBar() {
  const [data, setData] = useState({
    advancers: 2145, decliners: 987,
    upVol: 1.82, dnVol: 0.94,
    pcRatio: 0.92, tick: 187, trin: 1.05, vix: 18.4,
  });

  useEffect(() => {
    const t = setInterval(() => {
      setData(prev => ({
        advancers: Math.max(500, prev.advancers + Math.round((Math.random() - 0.5) * 40)),
        decliners: Math.max(300, prev.decliners + Math.round((Math.random() - 0.5) * 30)),
        upVol: Math.max(0.3, +(prev.upVol + (Math.random() - 0.5) * 0.08).toFixed(2)),
        dnVol: Math.max(0.2, +(prev.dnVol + (Math.random() - 0.5) * 0.06).toFixed(2)),
        pcRatio: Math.max(0.5, Math.min(1.5, +(prev.pcRatio + (Math.random() - 0.5) * 0.04).toFixed(2))),
        tick: Math.max(-400, Math.min(600, prev.tick + Math.round((Math.random() - 0.5) * 50))),
        trin: Math.max(0.5, Math.min(2.0, +(prev.trin + (Math.random() - 0.5) * 0.06).toFixed(2))),
        vix: Math.max(10, Math.min(40, +(prev.vix + (Math.random() - 0.5) * 0.5).toFixed(1))),
      }));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const items: { label: string; value: string; color?: string }[] = [
    { label: 'A/D', value: `${data.advancers.toLocaleString()} / ${data.decliners.toLocaleString()}` },
    { label: 'UP VOL', value: `${data.upVol}B`, color: '#4ade80' },
    { label: 'DN VOL', value: `${data.dnVol}B`, color: '#f87171' },
    { label: 'P/C', value: `${data.pcRatio}` },
    { label: 'TICK', value: `${data.tick > 0 ? '+' : ''}${data.tick}`, color: data.tick >= 0 ? '#4ade80' : '#f87171' },
    { label: 'TRIN', value: `${data.trin}` },
    { label: 'VIX', value: `${data.vix}`, color: data.vix > 25 ? '#f87171' : data.vix > 20 ? '#facc15' : '#4ade80' },
  ];

  const adTotal = data.advancers + data.decliners;
  const adPct = data.advancers / adTotal * 100;

  return (
    <div style={{
      height: '32px', minHeight: '32px', background: 'rgba(0,0,0,0.4)', borderTop: '0.5px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', padding: '0 12px', gap: '16px',
      fontFamily: "'SF Mono', monospace", fontSize: '10px',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
          {item.label === 'A/D' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>{item.value}</span>
              <div style={{ width: '40px', height: '4px', background: '#f87171', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${adPct}%`, height: '100%', background: '#4ade80', borderRadius: '2px', transition: 'width 0.5s' }} />
              </div>
            </div>
          ) : (
            <span style={{ color: item.color || 'rgba(255,255,255,0.9)' }}>{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function StockPickerGame({ stocks }: { stocks: StockData[] }) {
  // ── Trading Simulator State ──
  type TradeOrder = { id: number; type: 'buy' | 'sell'; qty: number; price: number; day: number; symbol: string };
  type Position = { symbol: string; qty: number; avgCost: number };
  type HistData = { symbol: string; name: string; closes: number[]; timestamps: number[] };
  type OHLCBar = { open: number; high: number; low: number; close: number; volume: number };

  const TRADE_SYMBOLS = 'AAPL,MSFT,NVDA,TSLA,META,AMZN,GOOG,NFLX,AMD,JPM,V,BA,DIS,COIN,PLTR,UBER,LLY,XOM,GS,BTC';

  const getName = (sym: string) => {
    const found = STOCK_NAMES.find(s => s.symbol === sym);
    return found ? found.name : sym;
  };


  // ── Seeded random for reproducible OHLC ──
  const seededRandom = (seed: number) => {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  };

  // ── Generate OHLC from closes ──
  const generateOHLC = (closes: number[]): OHLCBar[] => {
    const rng = seededRandom(42);
    return closes.map((close, i) => {
      const open = i === 0 ? close * (0.99 + rng() * 0.02) : closes[i - 1];
      const highMult = 1 + rng() * 0.03;
      const lowMult = 0.97 + rng() * 0.03;
      const high = Math.max(open, close) * highMult;
      const low = Math.min(open, close) * lowMult;
      const volume = Math.floor(5000000 + rng() * 30000000);
      return { open, high, low, close, volume };
    });
  };

  // ── Ranks & Achievements ──
  const RANKS = [
    { title: 'Intern', minXp: 0, color: 'rgba(255,255,255,0.4)' },
    { title: 'Junior Analyst', minXp: 100, color: '#60a5fa' },
    { title: 'Analyst', minXp: 300, color: '#818cf8' },
    { title: 'Senior Analyst', minXp: 600, color: '#a78bfa' },
    { title: 'Vice President', minXp: 1000, color: '#c084fc' },
    { title: 'Director', minXp: 1600, color: '#f472b6' },
    { title: 'Managing Director', minXp: 2500, color: '#ff6b35' },
    { title: 'Wolf of Wall Street', minXp: 4000, color: '#fbbf24' },
  ];
  const ACHIEVEMENTS = [
    { id: 'first_trade', label: 'First Blood', desc: 'Execute your first trade', icon: '\u2694\uFE0F' },
    { id: 'profit_1k', label: 'Comma Club', desc: 'Earn $1,000+ profit', icon: '\uD83D\uDCB0' },
    { id: 'profit_10k', label: 'Big Leagues', desc: 'Earn $10,000+ profit', icon: '\uD83D\uDCC8' },
    { id: 'streak_3', label: 'Hot Streak', desc: '3 profitable trades in a row', icon: '\uD83D\uDD25' },
    { id: 'streak_5', label: 'On Fire', desc: '5 profitable trades in a row', icon: '\u26A1' },
    { id: 'buy_low', label: 'Bottom Fisher', desc: 'Buy at the daily low', icon: '\uD83C\uDFA3' },
    { id: 'quick_flip', label: 'Scalper', desc: 'Profit within 2 days of buying', icon: '\u23F1\uFE0F' },
    { id: 'diamond_hands', label: 'Diamond Hands', desc: 'Hold a position for 20+ days', icon: '\uD83D\uDC8E' },
    { id: 'beat_market', label: 'Market Beater', desc: 'Outperform S&P 500', icon: '\uD83C\uDFC6' },
    { id: 'ten_trades', label: 'Active Trader', desc: 'Execute 10+ trades', icon: '\uD83D\uDCCA' },
  ];
  const LEADERBOARD_ENTRIES = [
    { name: 'Warren Buffett', firm: 'Berkshire Hathaway', annualReturn: 19.8, style: 'Value' },
    { name: 'Jim Simons', firm: 'Renaissance Tech', annualReturn: 66.1, style: 'Quant' },
    { name: 'Ray Dalio', firm: 'Bridgewater', annualReturn: 12.0, style: 'Macro' },
    { name: 'George Soros', firm: 'Quantum Fund', annualReturn: 30.0, style: 'Macro' },
    { name: 'Peter Lynch', firm: 'Magellan Fund', annualReturn: 29.2, style: 'Growth' },
    { name: 'Carl Icahn', firm: 'Icahn Capital', annualReturn: 14.6, style: 'Activist' },
    { name: 'Steve Cohen', firm: 'Point72', annualReturn: 30.0, style: 'Multi-Strat' },
    { name: 'Ken Griffin', firm: 'Citadel', annualReturn: 26.0, style: 'Market Making' },
    { name: 'Cathie Wood', firm: 'ARK Invest', annualReturn: 15.2, style: 'Disruptive' },
    { name: 'S&P 500 Index', firm: 'Passive', annualReturn: 10.5, style: 'Index' },
  ];

  // ── State ──
  const [cash, setCash] = useState(100000);
  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([100000]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [histDataMap, setHistDataMap] = useState<Record<string, HistData>>({});
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(3);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [visibleDays, setVisibleDays] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderQty, setOrderQty] = useState(10);
  const [limitPrice, setLimitPrice] = useState(0);
  const [flashEffect, setFlashEffect] = useState<'buy' | 'sell' | null>(null);
  const [pnlFlash, setPnlFlash] = useState(0);
  const [dayPnl, setDayPnl] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [usedSymbols, setUsedSymbols] = useState<string[]>([]);
  const [roundScores, setRoundScores] = useState<{ symbol: string; pnl: number; spReturn: number }[]>([]);
  const [animatingCandle, setAnimatingCandle] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);
  const totalDays = 60;

  // ── Gamification state ──
  const [xp, setXp] = useState(0);
  const [profitStreak, setProfitStreak] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [achievementToast, setAchievementToast] = useState<{ label: string; icon: string; desc: string } | null>(null);
  const [xpPopups, setXpPopups] = useState<{ id: number; amount: number; x: number }[]>([]);
  const [buyDay, setBuyDay] = useState(-1);
  const [started, setStarted] = useState(false);

  // ── Rank calculation ──
  const currentRank = useMemo(() => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXp) return RANKS[i];
    }
    return RANKS[0];
  }, [xp]);
  const nextRank = useMemo(() => {
    const idx = RANKS.findIndex(r => r.title === currentRank.title);
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
  }, [currentRank]);
  const xpProgress = nextRank ? (xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp) : 1;

  // ── Achievement unlock helper ──
  const unlockAchievement = useCallback((id: string) => {
    if (unlockedAchievements.includes(id)) return;
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    setUnlockedAchievements(prev => [...prev, id]);
    setAchievementToast({ label: ach.label, icon: ach.icon, desc: ach.desc });
    setXp(prev => prev + 150);
    addXpPopup(150);
    setTimeout(() => setAchievementToast(null), 3000);
  }, [unlockedAchievements]);

  // ── XP popup helper ──
  const addXpPopup = useCallback((amount: number) => {
    const id = Date.now() + Math.random();
    setXpPopups(prev => [...prev, { id, amount, x: 50 + Math.random() * 200 }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1500);
  }, []);

  // ── Local static historical data ──
  useEffect(() => {
    const syms = TRADE_SYMBOLS.split(',');
    const map: Record<string, HistData> = {};
    const rng = seededRandom(99);
    for (const sym of syms) {
      let p = 100 + rng() * 400;
      const closes: number[] = [];
      const timestamps: number[] = [];
      for (let i = 0; i < 70; i++) {
        p *= 0.97 + rng() * 0.06;
        closes.push(Math.round(p * 100) / 100);
        timestamps.push(Date.now() - (70 - i) * 86400000);
      }
      map[sym] = { symbol: sym, name: getName(sym), closes, timestamps };
    }
    setHistDataMap(map);
    setLoading(false);
  }, []);

  // ── Pick random stock for round ──
  const startRound = useCallback((roundNum: number) => {
    const available = Object.keys(histDataMap).filter(s => !usedSymbols.includes(s));
    if (available.length === 0) return;
    const rng = seededRandom(roundNum * 7 + 13);
    const pick = available[Math.floor(rng() * available.length)];
    setCurrentSymbol(pick);
    setUsedSymbols(prev => [...prev, pick]);
    setVisibleDays(0);
    setRoundComplete(false);
    setRevealed(false);
    setDayPnl(0);
    setAnimatingCandle(-1);
  }, [histDataMap, usedSymbols]);

  useEffect(() => {
    if (!loading && Object.keys(histDataMap).length > 0 && !currentSymbol) {
      startRound(1);
    }
  }, [loading, histDataMap, currentSymbol, startRound]);

  // ── Day timer ──
  useEffect(() => {
    if (!currentSymbol || roundComplete || loading) return;
    timerRef.current = setInterval(() => {
      setVisibleDays(prev => {
        const next = prev + 1;
        setAnimatingCandle(next - 1);
        setTimeout(() => setAnimatingCandle(-1), 400);
        if (next >= totalDays) {
          setRoundComplete(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return next;
      });
    }, 800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentSymbol, roundComplete, loading]);

  // ── Current data ──
  const histData = currentSymbol ? histDataMap[currentSymbol] : null;
  const ohlcData = useMemo((): OHLCBar[] => histData ? generateOHLC(histData.closes) : [], [histData]);
  const visibleOHLC = ohlcData.slice(0, visibleDays);
  const currentPrice = visibleOHLC.length > 0 ? visibleOHLC[visibleOHLC.length - 1].close : 0;
  const prevPrice = visibleOHLC.length > 1 ? visibleOHLC[visibleOHLC.length - 2].close : currentPrice;
  const spread = currentPrice * 0.001;
  const bidPrice = Math.round((currentPrice - spread / 2) * 100) / 100;
  const askPrice = Math.round((currentPrice + spread / 2) * 100) / 100;

  // ── Position for current symbol ──
  const currentPos = positions.find(p => p.symbol === currentSymbol);
  const unrealizedPnl = currentPos ? (currentPrice - currentPos.avgCost) * currentPos.qty : 0;
  const totalPositionValue = positions.reduce((sum, p) => {
    const price = histDataMap[p.symbol]?.closes?.[Math.min(visibleDays - 1, (histDataMap[p.symbol]?.closes?.length || 1) - 1)] || 0;
    return sum + price * p.qty;
  }, 0);
  const portfolioValue = cash + totalPositionValue;
  const totalPnl = portfolioValue - 100000;

  // ── Track day P&L + achievement checks ──
  useEffect(() => {
    if (visibleOHLC.length > 1 && currentPos) {
      const dayChange = (currentPrice - prevPrice) * currentPos.qty;
      setDayPnl(dayChange);
      if (Math.abs(dayChange) > 0.01) {
        setPnlFlash(dayChange > 0 ? 1 : -1);
        setTimeout(() => setPnlFlash(0), 600);
      }
      // Diamond hands: held 20+ days
      if (buyDay >= 0 && visibleDays - buyDay >= 20) unlockAchievement('diamond_hands');
    }
    // Profit milestones
    if (totalPnl >= 1000) unlockAchievement('profit_1k');
    if (totalPnl >= 10000) unlockAchievement('profit_10k');
  }, [visibleDays]);

  // ── Execute trade ──
  const executeTrade = useCallback((side: 'buy' | 'sell', qty: number) => {
    if (qty <= 0 || !currentSymbol) return;
    const price = side === 'buy' ? askPrice : bidPrice;
    const cost = price * qty;

    if (side === 'buy') {
      if (cost > cash) return;
      setCash(prev => prev - cost);
      setPositions(prev => {
        const existing = prev.find(p => p.symbol === currentSymbol);
        if (existing) {
          const totalQty = existing.qty + qty;
          const avgCost = (existing.avgCost * existing.qty + price * qty) / totalQty;
          return prev.map(p => p.symbol === currentSymbol ? { ...p, qty: totalQty, avgCost } : p);
        }
        return [...prev, { symbol: currentSymbol, qty, avgCost: price }];
      });
    } else {
      const pos = positions.find(p => p.symbol === currentSymbol);
      if (!pos || pos.qty < qty) return;
      setCash(prev => prev + cost);
      setPositions(prev => {
        const existing = prev.find(p => p.symbol === currentSymbol);
        if (!existing) return prev;
        if (existing.qty === qty) return prev.filter(p => p.symbol !== currentSymbol);
        return prev.map(p => p.symbol === currentSymbol ? { ...p, qty: p.qty - qty } : p);
      });
    }

    const newOrder: TradeOrder = { id: Date.now(), type: side, qty, price, day: visibleDays, symbol: currentSymbol };
    setOrders(prev => [...prev, newOrder]);

    setFlashEffect(side);
    setTimeout(() => setFlashEffect(null), 500);

    // ── Gamification: XP + achievements ──
    const baseXp = 25 + Math.floor(qty / 10) * 5;
    setXp(prev => prev + baseXp);
    addXpPopup(baseXp);

    // First trade
    if (orders.length === 0) unlockAchievement('first_trade');
    // 10 trades
    if (orders.length + 1 >= 10) unlockAchievement('ten_trades');

    if (side === 'buy') {
      setBuyDay(visibleDays);
    }

    if (side === 'sell') {
      const pos = positions.find(p => p.symbol === currentSymbol);
      if (pos) {
        const tradeProfit = (price - pos.avgCost) * qty;
        if (tradeProfit > 0) {
          const newStreak = profitStreak + 1;
          setProfitStreak(newStreak);
          const streakBonus = Math.floor(newStreak * 15);
          setXp(prev => prev + streakBonus);
          if (streakBonus > 0) addXpPopup(streakBonus);
          if (newStreak >= 3) unlockAchievement('streak_3');
          if (newStreak >= 5) unlockAchievement('streak_5');
          // Quick flip
          if (buyDay >= 0 && visibleDays - buyDay <= 2) unlockAchievement('quick_flip');
        } else {
          setProfitStreak(0);
        }
      }
    }
  }, [currentSymbol, askPrice, bidPrice, cash, positions, visibleDays, orders, profitStreak, buyDay, unlockAchievement, addXpPopup]);

  // ── Next round ──
  const nextRound = useCallback(() => {
    // Close all positions for current symbol
    const pos = positions.find(p => p.symbol === currentSymbol);
    if (pos) {
      const proceeds = currentPrice * pos.qty;
      setCash(prev => prev + proceeds);
      setPositions(prev => prev.filter(p => p.symbol !== currentSymbol));
    }

    const spReturn = histData ? ((histData.closes[Math.min(totalDays - 1, histData.closes.length - 1)] / histData.closes[0]) - 1) * 100 : 0;
    const roundPnl = orders.filter(o => o.symbol === currentSymbol).reduce((sum, o) => {
      return sum + (o.type === 'sell' ? o.price * o.qty : -o.price * o.qty);
    }, 0) + (pos ? currentPrice * pos.qty : 0);

    setRoundScores(prev => [...prev, { symbol: currentSymbol, pnl: roundPnl, spReturn }]);

    if (round >= totalRounds) {
      setGameOver(true);
    } else {
      setRound(prev => prev + 1);
      startRound(round + 1);
    }
  }, [positions, currentSymbol, currentPrice, round, totalRounds, startRound, histData, orders]);

  // ── Format helpers ──
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPnl = (n: number) => (n >= 0 ? '+' : '') + fmt(n);

  // ── Candlestick chart renderer ──
  const CandlestickChart = useMemo(() => {
    if (!visibleOHLC.length) return null;
    const chartW = 700;
    const chartH = 320;
    const volH = 60;
    const pad = { top: 20, right: 60, bottom: 5, left: 60 };
    const plotW = chartW - pad.left - pad.right;
    const plotH = chartH - pad.top - pad.bottom;

    const allData = ohlcData.slice(0, Math.max(visibleDays, 1));
    const minPrice = Math.min(...allData.map(d => d.low)) * 0.998;
    const maxPrice = Math.max(...allData.map(d => d.high)) * 1.002;
    const priceRange = maxPrice - minPrice || 1;
    const maxVol = Math.max(...allData.map(d => d.volume));

    const candleW = Math.max(2, Math.min(10, plotW / totalDays - 2));
    const gap = plotW / totalDays;

    const yScale = (p: number) => pad.top + plotH - ((p - minPrice) / priceRange) * plotH;
    const volScale = (v: number) => (v / maxVol) * volH;

    // Grid lines
    const gridLines = [];
    const priceStep = priceRange / 5;
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + priceStep * i;
      const y = yScale(price);
      gridLines.push(
        <g key={`grid-${i}`}>
          <line x1={pad.left} y1={y} x2={chartW - pad.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={chartW - pad.right + 5} y={y + 4} fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="'SF Mono', monospace">{price.toFixed(2)}</text>
        </g>
      );
    }

    // Candles
    const candles = visibleOHLC.map((d, i) => {
      const x = pad.left + i * gap + gap / 2;
      const isGreen = d.close >= d.open;
      const color = isGreen ? '#4ade80' : '#f87171';
      const bodyTop = yScale(Math.max(d.open, d.close));
      const bodyBot = yScale(Math.min(d.open, d.close));
      const bodyH = Math.max(1, bodyBot - bodyTop);
      const isAnimating = i === animatingCandle;

      return (
        <g key={`candle-${i}`} style={{
          opacity: isAnimating ? 0 : 1,
          animation: isAnimating ? 'none' : undefined,
          transition: 'opacity 0.3s ease',
        }}>
          {/* Wick */}
          <line x1={x} y1={yScale(d.high)} x2={x} y2={yScale(d.low)} stroke={color} strokeWidth="1" />
          {/* Body */}
          <rect
            x={x - candleW / 2}
            y={bodyTop}
            width={candleW}
            height={bodyH}
            fill={isGreen ? color : color}
            stroke={color}
            strokeWidth="0.5"
            rx="0.5"
          />
        </g>
      );
    });

    // Volume bars
    const volBars = visibleOHLC.map((d, i) => {
      const x = pad.left + i * gap + gap / 2;
      const isGreen = d.close >= d.open;
      const h = volScale(d.volume);
      return (
        <rect
          key={`vol-${i}`}
          x={x - candleW / 2}
          y={chartH + volH - h}
          width={candleW}
          height={h}
          fill={isGreen ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}
          rx="0.5"
        />
      );
    });

    // Current price line
    const curY = yScale(currentPrice);

    return (
      <svg ref={chartRef} width="100%" height="100%" viewBox={`0 0 ${chartW} ${chartH + volH + 10}`} preserveAspectRatio="xMidYMid meet">
        {/* Background */}
        <rect width={chartW} height={chartH + volH + 10} fill="transparent" />
        {gridLines}
        {/* Separator line between chart and volume */}
        <line x1={pad.left} y1={chartH} x2={chartW - pad.right} y2={chartH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {candles}
        {volBars}
        {/* Current price dashed line */}
        {visibleOHLC.length > 0 && (
          <g>
            <line x1={pad.left} y1={curY} x2={chartW - pad.right} y2={curY} stroke="#ff6b35" strokeWidth="1" strokeDasharray="4,3" opacity="0.7" />
            <rect x={chartW - pad.right} y={curY - 10} width={55} height={20} rx="3" fill="#ff6b35" />
            <text x={chartW - pad.right + 27} y={curY + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="'SF Mono', monospace">{currentPrice.toFixed(2)}</text>
            {/* Pulsing dot */}
            <circle cx={pad.left + visibleDays * gap - gap / 2} cy={curY} r="3" fill="#ff6b35">
              <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
        {/* Order markers */}
        {orders.filter(o => o.symbol === currentSymbol).map(o => {
          const ox = pad.left + o.day * gap + gap / 2;
          const oy = yScale(o.price);
          return (
            <g key={o.id}>
              <polygon
                points={o.type === 'buy'
                  ? `${ox},${oy + 8} ${ox - 5},${oy + 14} ${ox + 5},${oy + 14}`
                  : `${ox},${oy - 8} ${ox - 5},${oy - 14} ${ox + 5},${oy - 14}`}
                fill={o.type === 'buy' ? '#4ade80' : '#f87171'}
                opacity="0.9"
              />
            </g>
          );
        })}
        {/* Day counter */}
        <text x={pad.left} y={chartH + volH + 8} fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="'SF Mono', monospace">
          Day {visibleDays}/{totalDays}
        </text>
      </svg>
    );
  }, [visibleOHLC, ohlcData, visibleDays, animatingCandle, currentPrice, orders, currentSymbol]);

  // ── Max qty user can buy ──
  const maxBuyQty = currentPrice > 0 ? Math.floor(cash / askPrice) : 0;
  const maxSellQty = currentPos?.qty || 0;

  // ── Start screen ──
  if (!started && !loading) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #0f1119 0%, #0a0c12 70%)',
        fontFamily: "'SF Mono', monospace", color: '#fff', gap: '20px', padding: '40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated background grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,107,53,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'rgba(255,107,53,0.6)', textTransform: 'uppercase', zIndex: 1 }}>Bloomberg Terminal Presents</div>
        <div style={{
          fontSize: '42px', fontWeight: 900, color: '#ff6b35', letterSpacing: '0.05em', zIndex: 1,
          textShadow: '0 0 60px rgba(255,107,53,0.3), 0 0 120px rgba(255,107,53,0.1)',
        }}>
          TRADING ARENA
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', maxWidth: '400px', textAlign: 'center', lineHeight: 1.8, zIndex: 1 }}>
          Trade mystery stocks in real-time. Earn XP, unlock achievements, and climb the ranks from Intern to Wolf of Wall Street.
        </div>
        <div style={{ display: 'flex', gap: '32px', margin: '16px 0', zIndex: 1 }}>
          {[
            { val: '$100K', label: 'STARTING CAPITAL' },
            { val: '3', label: 'ROUNDS' },
            { val: '60', label: 'TRADING DAYS' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff6b35' }}>{s.val}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setStarted(true)} style={{
          padding: '14px 48px', border: '2px solid #ff6b35', borderRadius: '6px', cursor: 'pointer',
          background: 'rgba(255,107,53,0.1)', color: '#ff6b35', fontSize: '14px', fontWeight: 800,
          fontFamily: "'SF Mono', monospace", letterSpacing: '0.15em', zIndex: 1,
          transition: 'all 0.3s ease', animation: 'pulse-glow 2s ease infinite',
        }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,107,53,0.25)'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'rgba(255,107,53,0.1)'; }}
        >
          START TRADING
        </button>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', zIndex: 1 }}>
          Can you beat the legends?
        </div>
      </div>
    );
  }

  // ── Loading screen ──
  if (loading) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0c12', color: '#ff6b35', fontFamily: "'SF Mono', monospace",
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.1em' }}>LOADING MARKET DATA</div>
        <div style={{
          width: '200px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: '40%', height: '100%', background: '#ff6b35', borderRadius: '2px',
            animation: 'loading-slide 1.5s ease-in-out infinite',
          }} />
        </div>
        <style>{`@keyframes loading-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style>
      </div>
    );
  }

  // ── Game over screen ──
  if (gameOver) {
    const totalReturn = ((portfolioValue / 100000) - 1) * 100;
    const avgSpReturn = roundScores.reduce((s, r) => s + r.spReturn, 0) / roundScores.length;
    const beatMarket = totalReturn > avgSpReturn;
    // Build leaderboard with user inserted
    const scaledReturn = totalReturn * (365 / (totalDays * totalRounds));
    const leaderboardWithUser = [...LEADERBOARD_ENTRIES, { name: 'YOU', firm: currentRank.title, annualReturn: scaledReturn, style: 'Manual' }]
      .sort((a, b) => b.annualReturn - a.annualReturn);
    const userRankIdx = leaderboardWithUser.findIndex(e => e.name === 'YOU');

    return (
      <div className="bloomberg-scroll" style={{
        height: '100%', overflowY: 'auto', background: 'radial-gradient(ellipse at top, #0f1119 0%, #0a0c12 70%)',
        color: '#fff', fontFamily: "'SF Mono', monospace", padding: '32px 40px',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>TRADING SESSION COMPLETE</div>
            <div style={{
              fontSize: '36px', fontWeight: 900, color: beatMarket ? '#4ade80' : '#f87171',
              textShadow: `0 0 40px ${beatMarket ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
              marginBottom: '8px',
            }}>
              {beatMarket ? 'YOU BEAT THE MARKET' : 'MARKET WINS'}
            </div>
            <div style={{ fontSize: '12px', color: currentRank.color, fontWeight: 700 }}>
              Final Rank: {currentRank.title} ({xp} XP)
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', justifyContent: 'center' }}>
            {[
              { val: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`, label: 'YOUR RETURN', color: totalReturn >= 0 ? '#4ade80' : '#f87171' },
              { val: `$${fmt(portfolioValue)}`, label: 'FINAL VALUE', color: '#fff' },
              { val: `${orders.length}`, label: 'TRADES', color: '#ff6b35' },
              { val: `${unlockedAchievements.length}/${ACHIEVEMENTS.length}`, label: 'ACHIEVEMENTS', color: '#fbbf24' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', flex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, marginBottom: '4px' }}>{s.val}</div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Round breakdown + Leaderboard side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Rounds */}
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>ROUND BREAKDOWN</div>
              {roundScores.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 10px', marginBottom: '4px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '4px', borderLeft: `2px solid ${r.pnl >= 0 ? '#4ade80' : '#f87171'}`,
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>R{i + 1}: {r.symbol}</span>
                  <span style={{ color: r.pnl >= 0 ? '#4ade80' : '#f87171', fontSize: '11px', fontWeight: 600 }}>{fmtPnl(r.pnl)}</span>
                </div>
              ))}
            </div>
            {/* Leaderboard */}
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>LEADERBOARD (ANNUALIZED)</div>
              {leaderboardWithUser.map((entry, i) => {
                const isUser = entry.name === 'YOU';
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 8px', marginBottom: '2px', borderRadius: '3px',
                    background: isUser ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.02)',
                    border: isUser ? '1px solid rgba(255,107,53,0.3)' : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', width: '16px' }}>#{i + 1}</span>
                      <span style={{ fontSize: '10px', color: isUser ? '#ff6b35' : 'rgba(255,255,255,0.6)', fontWeight: isUser ? 800 : 500 }}>{entry.name}</span>
                      <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>{entry.firm}</span>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      color: entry.annualReturn >= 0 ? '#4ade80' : '#f87171',
                    }}>{entry.annualReturn >= 0 ? '+' : ''}{entry.annualReturn.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>ACHIEVEMENTS UNLOCKED</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ACHIEVEMENTS.map(a => {
                const unlocked = unlockedAchievements.includes(a.id);
                return (
                  <div key={a.id} style={{
                    padding: '6px 10px', borderRadius: '4px', fontSize: '10px',
                    background: unlocked ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${unlocked ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    color: unlocked ? '#ff6b35' : 'rgba(255,255,255,0.15)',
                    opacity: unlocked ? 1 : 0.5,
                  }}>
                    {a.icon} {a.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Play again */}
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => { setStarted(false); setGameOver(false); setCash(100000); setPositions([]); setOrders([]); setRound(1); setCurrentSymbol(''); setUsedSymbols([]); setRoundScores([]); setXp(0); setProfitStreak(0); setUnlockedAchievements([]); setVisibleDays(0); setRoundComplete(false); }} style={{
              padding: '10px 32px', border: '2px solid #ff6b35', borderRadius: '6px', cursor: 'pointer',
              background: 'rgba(255,107,53,0.1)', color: '#ff6b35', fontSize: '12px', fontWeight: 700,
              fontFamily: "'SF Mono', monospace", letterSpacing: '0.1em',
            }}>PLAY AGAIN</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main trading UI ──
  return (
    <div style={{
      height: '100%', display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gridTemplateRows: '48px 1fr 40px',
      background: '#0a0c12', fontFamily: "'SF Mono', monospace", color: '#fff',
      overflow: 'hidden',
    }}>
      {/* Flash overlay */}
      {flashEffect && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: flashEffect === 'buy' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          pointerEvents: 'none',
          animation: 'flash-fade 0.5s ease-out forwards',
        }} />
      )}
      <style>{`
        @keyframes flash-fade { from { opacity: 1; } to { opacity: 0; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 8px rgba(255,107,53,0.3); } 50% { box-shadow: 0 0 20px rgba(255,107,53,0.6); } }
        @keyframes count-up { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes xp-float { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
        @keyframes toast-in { 0% { transform: translateX(120%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes toast-out { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(120%); opacity: 0; } }
      `}</style>

      {/* Achievement toast */}
      {achievementToast && (
        <div style={{
          position: 'absolute', top: '60px', right: '16px', zIndex: 100,
          background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.35)',
          borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'toast-in 0.4s ease-out',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(255,107,53,0.15)',
        }}>
          <span style={{ fontSize: '22px' }}>{achievementToast.icon}</span>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff6b35', letterSpacing: '0.05em' }}>ACHIEVEMENT UNLOCKED</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{achievementToast.label}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{achievementToast.desc}</div>
          </div>
          <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>+150 XP</span>
        </div>
      )}

      {/* XP float popups */}
      {xpPopups.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '40px', left: `${p.x}px`, zIndex: 90,
          color: '#fbbf24', fontSize: '13px', fontWeight: 800, pointerEvents: 'none',
          animation: 'xp-float 1.2s ease-out forwards',
          textShadow: '0 0 8px rgba(251,191,36,0.4)',
        }}>+{p.amount} XP</div>
      ))}

      {/* ── Portfolio Stats Bar ── */}
      <div style={{
        gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '24px', padding: '0 16px',
        background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>ROUND</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff6b35' }}>{round}/{totalRounds}</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
        {[
          { label: 'CASH', value: `$${fmt(cash)}`, color: '#fff' },
          { label: 'PORTFOLIO', value: `$${fmt(portfolioValue)}`, color: '#fff' },
          { label: 'TOTAL P&L', value: `$${fmtPnl(totalPnl)}`, color: totalPnl >= 0 ? '#4ade80' : '#f87171' },
          { label: "DAY P&L", value: `$${fmtPnl(dayPnl)}`, color: dayPnl >= 0 ? '#4ade80' : '#f87171' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{item.label}</span>
            <span style={{
              fontSize: '12px', fontWeight: 700, color: item.color,
              animation: (item.label === 'TOTAL P&L' || item.label === "DAY P&L") && pnlFlash !== 0 ? 'count-up 0.4s ease' : 'none',
              textShadow: pnlFlash !== 0 && (item.label === "DAY P&L") ? `0 0 12px ${pnlFlash > 0 ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)'}` : 'none',
            }}>{item.value}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {/* Rank + XP bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: currentRank.color, letterSpacing: '0.05em' }}>{currentRank.title.toUpperCase()}</span>
          <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${xpProgress * 100}%`, height: '100%', background: currentRank.color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>{xp}XP</span>
          {profitStreak >= 2 && (
            <span style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 700, animation: 'count-up 0.3s ease' }}>{profitStreak}x streak</span>
          )}
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
        {/* Day progress */}
        <div style={{
          width: '100px', height: '4px',
          background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${(visibleDays / totalDays) * 100}%`, height: '100%',
            background: roundComplete ? '#4ade80' : '#ff6b35', borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* ── Chart Area ── */}
      <div style={{
        padding: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Chart header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#ff6b35', letterSpacing: '0.05em' }}>
              {revealed || roundComplete ? currentSymbol : '???'}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {revealed || roundComplete ? getName(currentSymbol) : 'Hidden Stock'}
            </span>
          </div>
          {visibleOHLC.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                O <span style={{ color: '#fff' }}>{visibleOHLC[visibleOHLC.length - 1].open.toFixed(2)}</span>
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                H <span style={{ color: '#4ade80' }}>{visibleOHLC[visibleOHLC.length - 1].high.toFixed(2)}</span>
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                L <span style={{ color: '#f87171' }}>{visibleOHLC[visibleOHLC.length - 1].low.toFixed(2)}</span>
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                C <span style={{ color: currentPrice >= prevPrice ? '#4ade80' : '#f87171' }}>{currentPrice.toFixed(2)}</span>
              </span>
            </div>
          )}
        </div>
        {/* SVG Chart */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {CandlestickChart}
        </div>
      </div>

      {/* ── Right Panel: Order Entry + Positions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Order Entry */}
        <div style={{
          padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>ORDER ENTRY</div>

          {/* Bid/Ask */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>BID</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>{bidPrice.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>SPREAD</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{spread.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>ASK</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171' }}>{askPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* Order type toggle */}
          <div style={{ display: 'flex', marginBottom: '10px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['market', 'limit'] as const).map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{
                flex: 1, padding: '6px', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace", textTransform: 'uppercase',
                background: orderType === t ? 'rgba(255,107,53,0.15)' : 'transparent',
                color: orderType === t ? '#ff6b35' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.2s ease',
              }}>{t}</button>
            ))}
          </div>

          {/* Limit price input */}
          {orderType === 'limit' && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '0.1em' }}>LIMIT PRICE</div>
              <input
                type="number"
                value={limitPrice || currentPrice}
                onChange={e => setLimitPrice(Number(e.target.value))}
                style={{
                  width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px', color: '#fff', fontSize: '12px', fontFamily: "'SF Mono', monospace", outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '0.1em' }}>QUANTITY</div>
            <input
              type="number"
              value={orderQty}
              onChange={e => setOrderQty(Math.max(1, Number(e.target.value)))}
              style={{
                width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px', color: '#fff', fontSize: '12px', fontFamily: "'SF Mono', monospace", outline: 'none',
                marginBottom: '6px', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              {[10, 50, 100].map(q => (
                <button key={q} onClick={() => setOrderQty(q)} style={{
                  flex: 1, padding: '4px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px',
                  background: orderQty === q ? 'rgba(255,107,53,0.12)' : 'transparent', cursor: 'pointer',
                  color: orderQty === q ? '#ff6b35' : 'rgba(255,255,255,0.3)', fontSize: '10px',
                  fontFamily: "'SF Mono', monospace", fontWeight: 600, transition: 'all 0.15s ease',
                }}>{q}</button>
              ))}
              <button onClick={() => setOrderQty(maxBuyQty)} style={{
                flex: 1, padding: '4px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px',
                background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '10px',
                fontFamily: "'SF Mono', monospace", fontWeight: 600, transition: 'all 0.15s ease',
              }}>ALL</button>
            </div>
          </div>

          {/* Buy/Sell buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => executeTrade('buy', orderQty)}
              disabled={roundComplete || orderQty <= 0 || orderQty > maxBuyQty}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '4px', cursor: roundComplete ? 'not-allowed' : 'pointer',
                background: roundComplete ? 'rgba(74,222,128,0.08)' : 'rgba(74,222,128,0.15)',
                color: roundComplete ? 'rgba(74,222,128,0.3)' : '#4ade80',
                fontSize: '12px', fontWeight: 800, fontFamily: "'SF Mono', monospace", letterSpacing: '0.1em',
                transition: 'all 0.2s ease',
                boxShadow: !roundComplete ? '0 0 12px rgba(74,222,128,0.1)' : 'none',
              }}
              onMouseEnter={e => { if (!roundComplete) (e.target as HTMLButtonElement).style.background = 'rgba(74,222,128,0.25)'; }}
              onMouseLeave={e => { if (!roundComplete) (e.target as HTMLButtonElement).style.background = 'rgba(74,222,128,0.15)'; }}
            >
              BUY
            </button>
            <button
              onClick={() => executeTrade('sell', Math.min(orderQty, maxSellQty))}
              disabled={roundComplete || maxSellQty <= 0}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '4px', cursor: roundComplete || maxSellQty <= 0 ? 'not-allowed' : 'pointer',
                background: roundComplete || maxSellQty <= 0 ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.15)',
                color: roundComplete || maxSellQty <= 0 ? 'rgba(248,113,113,0.3)' : '#f87171',
                fontSize: '12px', fontWeight: 800, fontFamily: "'SF Mono', monospace", letterSpacing: '0.1em',
                transition: 'all 0.2s ease',
                boxShadow: !(roundComplete || maxSellQty <= 0) ? '0 0 12px rgba(248,113,113,0.1)' : 'none',
              }}
              onMouseEnter={e => { if (!(roundComplete || maxSellQty <= 0)) (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.25)'; }}
              onMouseLeave={e => { if (!(roundComplete || maxSellQty <= 0)) (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'; }}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Position Tracker */}
        <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flex: '0 0 auto' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>POSITIONS</div>
          {currentPos ? (
            <div style={{
              padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px',
              borderLeft: `2px solid ${unrealizedPnl >= 0 ? '#4ade80' : '#f87171'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff6b35' }}>{revealed || roundComplete ? currentSymbol : '???'}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{currentPos.qty} shares</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>ENTRY</div>
                  <div style={{ fontSize: '11px', color: '#fff' }}>{currentPos.avgCost.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>CURRENT</div>
                  <div style={{ fontSize: '11px', color: '#fff' }}>{currentPrice.toFixed(2)}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>UNREALIZED P&L</div>
                  <div style={{
                    fontSize: '14px', fontWeight: 700, color: unrealizedPnl >= 0 ? '#4ade80' : '#f87171',
                    textShadow: pnlFlash !== 0 ? `0 0 10px ${unrealizedPnl >= 0 ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}` : 'none',
                    transition: 'text-shadow 0.3s ease',
                  }}>
                    {fmtPnl(unrealizedPnl)} ({((unrealizedPnl / (currentPos.avgCost * currentPos.qty)) * 100).toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', padding: '16px' }}>No open positions</div>
          )}
        </div>

        {/* Round complete actions */}
        {roundComplete && (
          <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              padding: '10px', background: 'rgba(255,107,53,0.08)', borderRadius: '4px',
              border: '1px solid rgba(255,107,53,0.2)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', color: '#ff6b35', letterSpacing: '0.15em', marginBottom: '6px' }}>
                ROUND {round} COMPLETE
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
                Stock: <span style={{ color: '#ff6b35', fontWeight: 700 }}>{currentSymbol}</span> — {getName(currentSymbol)}
              </div>
              <button
                onClick={nextRound}
                style={{
                  padding: '8px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                  background: '#ff6b35', color: '#fff', fontSize: '11px', fontWeight: 700,
                  fontFamily: "'SF Mono', monospace", letterSpacing: '0.1em',
                  transition: 'all 0.2s ease', animation: 'pulse-glow 2s ease infinite',
                }}
              >
                {round >= totalRounds ? 'VIEW RESULTS' : `NEXT ROUND →`}
              </button>
            </div>
          </div>
        )}

        {/* Order History */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px', minHeight: 0 }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>ORDER HISTORY</div>
          {orders.filter(o => o.symbol === currentSymbol).length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', padding: '12px' }}>No trades yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {orders.filter(o => o.symbol === currentSymbol).slice().reverse().map(o => (
                <div key={o.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px',
                  borderLeft: `2px solid ${o.type === 'buy' ? '#4ade80' : '#f87171'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '2px',
                      background: o.type === 'buy' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                      color: o.type === 'buy' ? '#4ade80' : '#f87171',
                    }}>{o.type.toUpperCase()}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{o.qty} @ {o.price.toFixed(2)}</span>
                  </div>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>D{o.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{
        gridColumn: '1 / -1', display: 'flex', alignItems: 'center', padding: '0 16px',
        background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: '9px', color: 'rgba(255,255,255,0.3)', gap: '16px', letterSpacing: '0.05em',
      }}>
        <span>TRADING ARENA v2.0</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>{visibleDays}/{totalDays} DAYS</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>{orders.length} TRADES</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span style={{ color: '#fbbf24' }}>{unlockedAchievements.length} ACHIEVEMENTS</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: roundComplete ? '#4ade80' : '#ff6b35' }}>
          {roundComplete ? 'MARKET CLOSED' : 'MARKET OPEN'}
        </span>
      </div>
    </div>
  );
}

function BloombergTerminalView({ drillDown, setDrillDown }: {
  drillDown: { type: 'stock'; symbol: string; name: string } | { type: 'sector'; name: string } | null;
  setDrillDown: (v: { type: 'stock'; symbol: string; name: string } | { type: 'sector'; name: string } | null) => void;
}) {
  const stocks = useStockData();
  // Game mode disabled for now — code preserved but not accessible
  const gameMode = false;

  const hasDrillDown = drillDown !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'SF Mono', monospace", background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <BloombergTopBar stocks={stocks} gameMode={gameMode} onToggleGame={() => {}} />
      <div style={{ flex: 1, overflow: 'hidden', display: hasDrillDown ? 'block' : 'grid', gridTemplateColumns: hasDrillDown ? undefined : '50% 50%' }}>
        {hasDrillDown ? (
          <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto' }}>
            {drillDown.type === 'stock' ? (
              <StockDetailView symbol={drillDown.symbol} name={drillDown.name} onBack={() => setDrillDown(null)} onSectorClick={(name) => setDrillDown({ type: 'sector', name })} />
            ) : (
              <SectorDetailView sectorName={drillDown.name} onBack={() => setDrillDown(null)} onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })} />
            )}
          </div>
        ) : (
          <>
            {/* Left column */}
            <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <BloombergStockGrid6 stocks={stocks} onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })} />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <MarketStatsBar />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <PerformanceBarChart stocks={stocks} />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <ScrollingNewsTape />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <EconomicCalendar />
            </div>
            {/* Right column */}
            <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto' }}>
              <div style={{ display: 'flex', height: '240px' }}>
                <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}><SectorTreemap /></div>
                <div style={{ flex: 1, overflow: 'hidden' }}><SectorPieChart stocks={stocks} /></div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <CorrelationMatrix stocks={stocks} />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <VolatilityGauge stocks={stocks} />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.06)' }}><MarketClock /></div>
                <div style={{ flex: 1 }}><OrderbookDepth /></div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <LiveNewsFeed />
            </div>
          </>
        )}
      </div>
      <BloombergBottomBar />
    </div>
  );
}

// ── Standalone Stocks App ──
function StocksApp() {
  const { state } = useDesktop();
  const isFullscreen = state.windows.stocks?.isFullscreen ?? false;
  const [drillDown, setDrillDown] = useState<{ type: 'stock'; symbol: string; name: string } | { type: 'sector'; name: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drillDown) { setDrillDown(null); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drillDown]);

  if (isFullscreen) {
    return <BloombergTerminalView drillDown={drillDown} setDrillDown={setDrillDown} />;
  }

  return (
    <div className="bloomberg-scroll" style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', fontFamily: "'SF Mono', monospace", padding: '10px' }}>
      {drillDown ? (
        <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          {drillDown.type === 'stock' ? (
            <StockDetailView
              symbol={drillDown.symbol}
              name={drillDown.name}
              onBack={() => setDrillDown(null)}
              onSectorClick={(name) => setDrillDown({ type: 'sector', name })}
            />
          ) : (
            <SectorDetailView
              sectorName={drillDown.name}
              onBack={() => setDrillDown(null)}
              onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })}
            />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Header card */}
          <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '12px', padding: '12px 14px', border: '0.5px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', fontFamily: "'SF Pro Display', -apple-system, sans-serif", letterSpacing: '-0.01em' }}>
                My Watchlist
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80', animation: 'livePulse 2s ease-in-out infinite' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>LIVE</span>
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 500, fontFamily: "'SF Pro Text', -apple-system, sans-serif", marginTop: '2px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* Stock Grid card */}
          <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
            <StockGrid onStockClick={(symbol, name) => setDrillDown({ type: 'stock', symbol, name })} />
          </div>

          {/* Sector Sparklines card */}
          <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
            <SectorSparklines onSectorClick={(name) => setDrillDown({ type: 'sector', name })} />
          </div>

          {/* News + Calendar card */}
          <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
            <ScrollingNewsTape />
            <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
            <EconomicCalendar />
          </div>
        </div>
      )}
      <style>{`@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.bloomberg-scroll::-webkit-scrollbar { display: none; }
.bloomberg-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}

function MiddlePanel({ runCommand }: { runCommand: (cmd: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '28px 24px 14px 24px', justifyContent: 'space-between' }}>
      <div>
        {/* Tech Stack */}
        <div style={{ marginTop: '16px' }}>
          <div style={sectionLabel}>TECH STACK</div>
          {TECH_STACK.map(cat => (
            <div key={cat.category} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: '#fff', fontFamily: "'SF Mono', monospace", marginBottom: '5px', textTransform: 'uppercase' as const, fontWeight: 600 }}>{cat.category}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {cat.items.map((item, i) => {
                  const theme = CATEGORY_THEME[cat.category] || { color: '#fff', rgb: '255,255,255' };
                  const opacity = 0.18 - (i * 0.02);
                  return (
                    <span key={item} style={{
                      fontSize: '11.5px', padding: '3px 10px', borderRadius: 5,
                      background: `rgba(${theme.rgb},${Math.max(opacity, 0.06)})`,
                      border: `0.5px solid rgba(${theme.rgb},0.25)`,
                      color: theme.color, fontFamily: "'SF Mono', monospace",
                    }}>{item}</span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* GitHub Heatmap removed — moved to notification center */}
    </div>
  );
}

function StockDetailView({ symbol, name, onBack, onSectorClick }: { symbol: string; name: string; onBack: () => void; onSectorClick: (name: string) => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const stocks = useStockData();
  const currentStock = stocks.find(s => s.symbol === symbol);

  useEffect(() => {
    setLoading(true);
    setDetail({
      summary: { name, exchange: 'Static', currency: 'USD' },
      chart: { closes: currentStock?.history || [] },
      news: [],
    });
    setLoading(false);
  }, [symbol]);

  // Find which sector this stock belongs to
  const sector = SECTORS.find(s => s.symbols.includes(symbol));
  const sectorStocks = sector ? stocks.filter(s => sector.symbols.includes(s.symbol)) : [];

  const price = currentStock?.price ?? 0;
  const pct = currentStock?.pct ?? 0;
  const change = currentStock?.change ?? 0;
  const isUp = change >= 0;
  const color = isUp ? '#4ade80' : '#f87171';

  // Build chart from 1-day history (same as main Bloomberg screen) — fallback to detail API if unavailable
  const chartData = (currentStock?.history?.length ?? 0) > 0 ? currentStock!.history : (detail?.chart?.closes || []);
  const chartH = 160, chartW = 500;
  const mn = Math.min(...chartData), mx = Math.max(...chartData), rng = mx - mn || 1;
  const pts = chartData.map((v: number, i: number) => `${(i / (chartData.length - 1)) * chartW},${chartH - ((v - mn) / rng) * (chartH - 8) - 4}`).join(' ');
  const fillPts = pts + ` ${chartW},${chartH} 0,${chartH}`;

  const statItems = detail ? [
    { label: 'Open', value: detail.open },
    { label: 'Prev Close', value: detail.prevClose },
    { label: 'Day High', value: detail.dayHigh },
    { label: 'Day Low', value: detail.dayLow },
    { label: '52W High', value: detail.fiftyTwoWeekHigh },
    { label: '52W Low', value: detail.fiftyTwoWeekLow },
    { label: 'Market Cap', value: detail.marketCap },
    { label: 'Volume', value: detail.volume },
    { label: '5D High', value: detail.fiveDayHigh },
    { label: '5D Low', value: detail.fiveDayLow },
    { label: 'P/E', value: detail.pe },
    { label: 'Exchange', value: detail.exchange },
  ].filter(s => s.value && s.value !== '—') : [];

  return (
    <div style={{ padding: '10px 12px' }}>
      <BloombergBackButton onClick={onBack} />

      {/* Header: Symbol + Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '8px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: "'SF Mono', monospace" }}>
            {symbol} <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{detail?.name || name}</span>
          </div>
          {detail?.exchange && (
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", marginTop: '2px' }}>
              {detail.exchange} · {detail.currency}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: "'SF Mono', monospace" }}>
            {symbol === 'BTC' ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color, fontFamily: "'SF Mono', monospace" }}>
            {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px', marginBottom: '12px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="detail-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polygon points={fillPts} fill="url(#detail-fill)" />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={chartW} cy={chartH - ((chartData[chartData.length - 1] - mn) / rng) * (chartH - 8) - 4} r="3" fill={color}>
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", marginTop: '4px' }}>
            <span>{detail?.chart?.closes?.length > 0 ? '5D' : '1D'}</span>
            <span>LIVE</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: "'SF Mono', monospace", textAlign: 'center', padding: '20px' }}>
          Loading fundamentals...
        </div>
      ) : statItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden', marginBottom: '12px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          {statItems.map(s => (
            <div key={s.label} style={{ padding: '5px 8px', background: 'rgba(10,12,18,0.9)' }}>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#fff', fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Sector Context */}
      {sector && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px 10px', marginBottom: '12px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>
              SECTOR: {sector.name.toUpperCase()}
            </span>
            <button onClick={() => onSectorClick(sector.name)} style={{
              background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
              fontSize: '9px', fontWeight: 700, fontFamily: "'SF Mono', monospace",
            }}>
              VIEW ALL →
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {sectorStocks.map(s => (
              <span key={s.symbol} style={{
                fontSize: '9px', fontFamily: "'SF Mono', monospace", fontWeight: 600,
                padding: '2px 6px', borderRadius: 3,
                background: s.symbol === symbol ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                color: s.symbol === symbol ? '#3b82f6' : (s.pct >= 0 ? '#4ade80' : '#f87171'),
                border: s.symbol === symbol ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}>
                {s.symbol} {s.pct >= 0 ? '+' : ''}{s.pct.toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related News */}
      {detail?.news?.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em', marginBottom: '6px' }}>
            RELATED NEWS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            {detail.news.map((n: any, i: number) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '6px 8px', background: 'rgba(10,12,18,0.9)',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(10,12,18,0.9)')}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ fontSize: '10px', color: '#fff', fontFamily: "'SF Mono', monospace", fontWeight: 500, lineHeight: 1.3 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", marginTop: '2px' }}>
                  {n.source} · {n.pubDate ? new Date(n.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectorDetailView({ sectorName, onBack, onStockClick }: { sectorName: string; onBack: () => void; onStockClick: (symbol: string, name: string) => void }) {
  const stocks = useStockData();
  const sector = SECTORS.find(s => s.name === sectorName);
  const [news, setNews] = useState<{ title: string; source: string; url: string; pubDate: string }[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    if (!sectorName) return;
    setNews([
      { title: `${sectorName} static note`, source: 'Local', url: '#', pubDate: new Date().toISOString() },
    ]);
    setNewsLoading(false);
  }, [sectorName]);

  if (!sector) return null;

  const matched = stocks.filter(s => sector.symbols.includes(s.symbol));
  const sorted = [...matched].sort((a, b) => b.pct - a.pct);
  const avgPct = matched.length > 0 ? matched.reduce((a, s) => a + s.pct, 0) / matched.length : 0;
  const winners = matched.filter(s => s.pct > 0).length;
  const losers = matched.filter(s => s.pct < 0).length;
  const flat = matched.filter(s => s.pct === 0).length;
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const isUp = avgPct >= 0;
  const color = isUp ? '#4ade80' : '#f87171';

  // Spread & volatility
  const allPcts = matched.map(s => s.pct);
  const spread = allPcts.length > 1 ? Math.max(...allPcts) - Math.min(...allPcts) : 0;
  const variance = allPcts.length > 1 ? allPcts.reduce((a, p) => a + (p - avgPct) ** 2, 0) / allPcts.length : 0;
  const volatility = Math.sqrt(variance);

  // Build sector average sparkline
  const maxLen = Math.max(...matched.map(s => s.history.length), 0);
  const avgHistory: number[] = [];
  for (let i = 0; i < maxLen; i++) {
    const pctChanges = matched.map(s => {
      if (s.history[i] == null || !s.history[0]) return null;
      return ((s.history[i] - s.history[0]) / s.history[0]) * 100;
    }).filter((v): v is number => v != null);
    avgHistory.push(pctChanges.length > 0 ? pctChanges.reduce((a, b) => a + b, 0) / pctChanges.length : 0);
  }

  const sparkH = 120, sparkW = 500;
  const mn = Math.min(...avgHistory), mx = Math.max(...avgHistory), rng = mx - mn || 1;
  const pts = avgHistory.map((v, i) => `${(i / (avgHistory.length - 1)) * sparkW},${sparkH - ((v - mn) / rng) * (sparkH - 8) - 4}`).join(' ');
  const fillPts = pts + ` ${sparkW},${sparkH} 0,${sparkH}`;

  // Mini sparkline builder for individual stocks
  const miniSparkline = (history: number[], w: number, h: number, c: string) => {
    if (history.length < 2) return null;
    const mnH = Math.min(...history), mxH = Math.max(...history), rngH = mxH - mnH || 1;
    const p = history.map((v, i) => `${(i / (history.length - 1)) * w},${h - ((v - mnH) / rngH) * (h - 2) - 1}`).join(' ');
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <polyline points={p} fill="none" stroke={c} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  };

  // Performance bar distribution
  const maxAbsPct = Math.max(...allPcts.map(Math.abs), 0.01);

  // Source colors for news
  const sourceColors: Record<string, string> = {
    'Reuters': '#ff922b', 'CNBC': '#2563eb', 'Bloomberg': '#ff6b35',
    'WSJ': '#c4a000', 'BBC': '#da77f2', 'AP': '#f87171',
    'CNN': '#cc0000', 'The Guardian': '#1a73e8', 'Yahoo': '#7c3aed',
    'MarketWatch': '#22c55e', 'Barron': '#60a5fa', 'Forbes': '#e11d48',
  };
  const getNewsColor = (s: string) => {
    for (const [k, c] of Object.entries(sourceColors)) { if (s.toLowerCase().includes(k.toLowerCase())) return c; }
    return '#74c0fc';
  };

  return (
    <div style={{ padding: '10px 12px' }}>
      <BloombergBackButton onClick={onBack} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '8px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: "'SF Mono', monospace" }}>
            {sectorName} Sector
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", marginTop: '2px' }}>
            {matched.length} stocks tracked · {winners} up · {losers} down{flat > 0 ? ` · ${flat} flat` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color, fontFamily: "'SF Mono', monospace" }}>
            {isUp ? '+' : ''}{avgPct.toFixed(2)}%
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>
            sector avg
          </div>
        </div>
      </div>

      {/* Sector Avg Chart — larger */}
      {avgHistory.length > 1 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px', marginBottom: '10px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>SECTOR AVG PERFORMANCE</span>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace" }}>intraday</span>
          </div>
          <svg width="100%" height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <defs>
              <linearGradient id={`sector-fill-${sectorName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <polygon points={fillPts} fill={`url(#sector-fill-${sectorName})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            {mn < 0 && mx > 0 && (
              <line x1="0" y1={sparkH - ((0 - mn) / rng) * (sparkH - 8) - 4} x2={sparkW} y2={sparkH - ((0 - mn) / rng) * (sparkH - 8) - 4} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="4 2" />
            )}
          </svg>
        </div>
      )}

      {/* Stats Grid — 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '10px' }}>
        {[
          { label: 'Winners', value: String(winners), color: '#4ade80' },
          { label: 'Losers', value: String(losers), color: '#f87171' },
          { label: 'Best', value: best ? `${best.symbol} ${best.pct >= 0 ? '+' : ''}${best.pct.toFixed(1)}%` : '—', color: '#4ade80' },
          { label: 'Worst', value: worst ? `${worst.symbol} ${worst.pct.toFixed(1)}%` : '—', color: '#f87171' },
          { label: 'Spread', value: spread.toFixed(2) + '%', color: '#60a5fa' },
          { label: 'Volatility', value: volatility.toFixed(2) + '%', color: '#c084fc' },
          { label: 'Sector Avg', value: `${isUp ? '+' : ''}${avgPct.toFixed(2)}%`, color },
          { label: 'Breadth', value: matched.length > 0 ? `${((winners / matched.length) * 100).toFixed(0)}% up` : '—', color: winners >= losers ? '#4ade80' : '#f87171' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '5px 6px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", fontWeight: 600, letterSpacing: '0.03em' }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: '9px', color: s.color, fontFamily: "'SF Mono', monospace", fontWeight: 700, marginTop: '1px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Performance Distribution Bar */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px', marginBottom: '10px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em', marginBottom: '6px' }}>PERFORMANCE DISTRIBUTION</div>
        {sorted.map(s => {
          const sUp = s.pct >= 0;
          const sColor = sUp ? '#4ade80' : '#f87171';
          const barWidth = Math.abs(s.pct) / maxAbsPct * 50;
          return (
            <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', cursor: 'pointer', padding: '1px 2px', borderRadius: 3, transition: 'background 0.15s' }}
              onClick={() => onStockClick(s.symbol, s.name)}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace", width: '38px', flexShrink: 0 }}>{s.symbol}</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '0.5px', background: 'rgba(255,255,255,0.1)' }} />
                {sUp ? (
                  <div style={{ marginLeft: '50%', width: `${barWidth}%`, height: '8px', background: sColor, borderRadius: '0 2px 2px 0', opacity: 0.7, transition: 'width 0.3s' }} />
                ) : (
                  <div style={{ marginLeft: `${50 - barWidth}%`, width: `${barWidth}%`, height: '8px', background: sColor, borderRadius: '2px 0 0 2px', opacity: 0.7, transition: 'width 0.3s' }} />
                )}
              </div>
              <span style={{ fontSize: '8px', color: sColor, fontFamily: "'SF Mono', monospace", fontWeight: 700, width: '48px', textAlign: 'right', flexShrink: 0 }}>
                {sUp ? '+' : ''}{s.pct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Stock Table with Mini Charts */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.06)', marginBottom: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 70px 60px 58px', padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>SYMBOL</span>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace" }}>CHART</span>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", textAlign: 'right' }}>PRICE</span>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", textAlign: 'right' }}>CHG%</span>
          <span style={{ fontSize: '7px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", textAlign: 'right' }}>RANGE</span>
        </div>
        {sorted.map(s => {
          const sUp = s.pct >= 0;
          const sColor = sUp ? '#4ade80' : '#f87171';
          const hi = s.history.length ? Math.max(...s.history) : s.price;
          const lo = s.history.length ? Math.min(...s.history) : s.price;
          const rangeStr = s.symbol === 'BTC'
            ? `${(lo/1000).toFixed(0)}k-${(hi/1000).toFixed(0)}k`
            : `${lo.toFixed(0)}-${hi.toFixed(0)}`;
          return (
            <div key={s.symbol}
              onClick={() => onStockClick(s.symbol, s.name)}
              style={{
                display: 'grid', gridTemplateColumns: '50px 1fr 70px 60px 58px', padding: '4px 8px',
                borderBottom: '0.5px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                transition: 'background 0.15s', alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', fontFamily: "'SF Mono', monospace" }}>{s.symbol}</span>
                <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '48px' }}>{s.name.split(' ')[0]}</div>
              </div>
              <div style={{ padding: '2px 4px' }}>
                {miniSparkline(s.history, 80, 20, sColor)}
              </div>
              <span style={{ fontSize: '9px', color: '#fff', fontFamily: "'SF Mono', monospace", textAlign: 'right', fontWeight: 600 }}>
                {s.symbol === 'BTC' ? s.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : s.price.toFixed(2)}
              </span>
              <span style={{ fontSize: '9px', color: sColor, fontFamily: "'SF Mono', monospace", textAlign: 'right', fontWeight: 700 }}>
                {sUp ? '+' : ''}{s.pct.toFixed(2)}%
              </span>
              <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', fontFamily: "'SF Mono', monospace", textAlign: 'right' }}>
                {rangeStr}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sector News */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px', border: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '8px', fontWeight: 700, color: '#ff6b35', fontFamily: "'SF Mono', monospace", letterSpacing: '0.08em', marginBottom: '6px' }}>
          {sectorName.toUpperCase()} SECTOR NEWS
        </div>
        {newsLoading ? (
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", padding: '8px 0' }}>Loading news…</div>
        ) : news.length === 0 ? (
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", padding: '8px 0' }}>No recent news available</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {news.map((n, i) => (
              <a
                key={i}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textDecoration: 'none', padding: '5px 6px', borderRadius: 4,
                  transition: 'background 0.15s', background: 'rgba(10,12,18,0.9)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(10,12,18,0.9)')}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: getNewsColor(n.source), fontFamily: "'SF Mono', monospace", flexShrink: 0, marginTop: '1px', minWidth: '50px' }}>
                    {n.source.toUpperCase().slice(0, 10)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '9px', color: '#fff', fontFamily: "'SF Mono', monospace", fontWeight: 500, lineHeight: 1.3 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)', fontFamily: "'SF Mono', monospace", marginTop: '1px' }}>
                      {n.pubDate ? new Date(n.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bloomberg Option 1: Scrolling News Tape ──
function ScrollingNewsTape() {
  const [news] = useState<{ title: string; source: string; url: string }[]>([
    { title: 'abdullahOS local feed', source: 'Local', url: '#' },
    { title: 'robotics automation ideas', source: 'Local', url: '#' },
  ]);

  if (!news.length) return null;

  const sourceColors: Record<string, string> = {
    'Reuters': '#ff922b', 'CNBC': '#2563eb', 'Bloomberg': '#ff6b35',
    'WSJ': '#c4a000', 'BBC': '#da77f2', 'CBC': '#e03131',
    'AP': '#f87171', 'CNN': '#cc0000', 'The Guardian': '#1a73e8',
  };
  const getColor = (s: string) => {
    for (const [k, c] of Object.entries(sourceColors)) { if (s.toLowerCase().includes(k.toLowerCase())) return c; }
    return '#74c0fc';
  };

  const tape = [...news, ...news]; // duplicate for seamless loop
  const tapeContent = tape.map((item, i) => (
    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', paddingRight: '32px', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
      onMouseEnter={e => { (e.currentTarget.querySelector('[data-title]') as HTMLElement).style.textDecoration = 'underline'; }}
      onMouseLeave={e => { (e.currentTarget.querySelector('[data-title]') as HTMLElement).style.textDecoration = 'none'; }}
    >
      <span style={{ color: getColor(item.source), fontSize: '10px', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
        {item.source.toUpperCase()}
      </span>
      <span data-title style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontFamily: "'SF Mono', monospace" }}>
        {item.title}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>│</span>
    </a>
  ));

  return (
    <div style={{ padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff6b35', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace", padding: '0 10px', flexShrink: 0 }}>
          NEWS
        </span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', animation: 'tickerScroll 80s linear infinite', willChange: 'transform' }}>
            {tapeContent}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bloomberg Option 2: Live News Feed ──
function LiveNewsFeed() {
  const [news] = useState<{ title: string; source: string; url: string; pubDate: string }[]>([
    { title: 'static update: abdullah projects are local-only', source: 'Local', url: '#', pubDate: new Date().toISOString() },
    { title: 'Static update: live feeds disabled for this portfolio stage', source: 'Local', url: '#', pubDate: new Date().toISOString() },
  ]);

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Now';
      if (mins < 60) return `${mins}m`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h`;
      return `${Math.floor(hrs / 24)}d`;
    } catch { return ''; }
  };

  const sourceColors: Record<string, string> = {
    'Reuters': '#ff922b', 'CNBC': '#2563eb', 'Bloomberg': '#ff6b35',
    'WSJ': '#c4a000', 'BBC': '#da77f2', 'CBC': '#e03131',
    'AP': '#f87171', 'CNN': '#cc0000',
  };
  const getColor = (s: string) => {
    for (const [k, c] of Object.entries(sourceColors)) { if (s.toLowerCase().includes(k.toLowerCase())) return c; }
    return '#74c0fc';
  };

  if (!news.length) return (
    <div style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>
      Loading feed...
    </div>
  );

  return (
    <div style={{ padding: '8px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          MARKET NEWS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.85)', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff6b35', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {news.slice(0, 5).map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
            display: 'block', padding: '5px 6px', textDecoration: 'none', color: 'inherit',
            borderRadius: 4, transition: 'background 0.15s', borderLeft: `2px solid ${getColor(item.source)}22`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderLeftColor = getColor(item.source); }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = `${getColor(item.source)}22`; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ color: getColor(item.source), fontSize: '10px', fontWeight: 700, fontFamily: "'SF Mono', monospace", letterSpacing: '0.05em' }}>
                {item.source.toUpperCase()}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>
                {timeAgo(item.pubDate)}
              </span>
            </div>
            <div style={{
              fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.35,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              fontFamily: "'SF Mono', monospace",
            }}>
              {item.title}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Bloomberg Option 3: Market Stats Bar ──
function MarketStatsBar() {
  const stocks = useStockData();
  const [indicators, setIndicators] = useState<{ label: string; value: string; change: number }[]>([]);

  useEffect(() => {
    // Generate realistic market indicators
    const gen = (label: string, base: number, vol: number, decimals: number, suffix = '') => {
      const change = (Math.random() - 0.48) * vol;
      return { label, value: (base + change).toFixed(decimals) + suffix, change: (change / base) * 100 };
    };
    setIndicators([
      gen('VIX', 18.5, 3, 1),
      gen('10Y', 4.32, 0.15, 2, '%'),
      gen('DXY', 104.2, 1.5, 1),
      gen('GOLD', 2340, 40, 0),
      gen('OIL', 78.5, 3, 1),
    ]);
  }, []);

  if (!indicators.length) return null;

  return (
    <div style={{ padding: '6px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {indicators.map(ind => {
          const isUp = ind.change >= 0;
          const color = ind.label === 'VIX' ? (isUp ? '#f87171' : '#4ade80') : (isUp ? '#4ade80' : '#f87171');
          return (
            <div key={ind.label} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.08em', fontFamily: "'SF Mono', monospace", marginBottom: '2px' }}>
                {ind.label}
              </div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, fontFamily: "'SF Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                {ind.value}
              </div>
              <div style={{ fontSize: '10px', color, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>
                {isUp ? '▲' : '▼'} {Math.abs(ind.change).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bloomberg Option 4: Economic Calendar ──
function EconomicCalendar() {
  const events = [
    { type: 'fed', label: 'FOMC Rate Decision', date: '2026-03-19', icon: '🏛️', importance: 'high' },
    { type: 'earnings', label: 'NVDA Earnings', date: '2026-03-26', icon: '📊', importance: 'high' },
    { type: 'earnings', label: 'AAPL Earnings', date: '2026-04-01', icon: '📊', importance: 'high' },
    { type: 'data', label: 'Non-Farm Payrolls', date: '2026-04-04', icon: '📈', importance: 'medium' },
    { type: 'data', label: 'CPI Release', date: '2026-04-10', icon: '📉', importance: 'medium' },
  ];

  const importanceColor: Record<string, string> = { high: '#f87171', medium: '#fbbf24', low: '#4ade80' };

  const getCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff < 0) return 'Passed';
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `in ${days}d`;
  };

  return (
    <div style={{ padding: '8px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: "'SF Mono', monospace" }}>
          UPCOMING
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: "'SF Mono', monospace" }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {events.map((evt, i) => {
          const countdown = getCountdown(evt.date);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 6px', borderRadius: 4,
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: importanceColor[evt.importance], flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontFamily: "'SF Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontFamily: "'SF Mono', monospace" }}>
                  {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: countdown === 'Today' ? '#f87171' : countdown === 'Tomorrow' ? '#fbbf24' : 'rgba(255,255,255,0.75)', fontFamily: "'SF Mono', monospace", minWidth: '44px', textAlign: 'right' }}>
                  {countdown}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Widget 4: System Vitals Sparklines ──
function SystemVitals() {
  const [data, setData] = useState<{ cpu: number[]; mem: number[]; net: number[] }>({ cpu: [], mem: [], net: [] });
  const maxPoints = 40;

  useEffect(() => {
    // Seed with initial data
    const seed = (base: number, variance: number) =>
      Array.from({ length: maxPoints }, () => base + (Math.random() - 0.5) * variance);
    setData({ cpu: seed(35, 30), mem: seed(62, 10), net: seed(45, 40) });

    const id = setInterval(() => {
      setData(prev => ({
        cpu: [...prev.cpu.slice(1), Math.max(5, Math.min(95, prev.cpu[prev.cpu.length - 1] + (Math.random() - 0.48) * 15))],
        mem: [...prev.mem.slice(1), Math.max(40, Math.min(85, prev.mem[prev.mem.length - 1] + (Math.random() - 0.5) * 3))],
        net: [...prev.net.slice(1), Math.max(0, Math.min(100, prev.net[prev.net.length - 1] + (Math.random() - 0.5) * 25))],
      }));
    }, 800);
    return () => clearInterval(id);
  }, []);

  const Sparkline = ({ values, color, label, suffix }: { values: number[]; color: string; label: string; suffix: string }) => {
    if (!values.length) return null;
    const w = 130, h = 22;
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => `${(i / (maxPoints - 1)) * w},${h - (v / max) * h}`);
    const path = `M${pts.join(' L')}`;
    const current = values[values.length - 1];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono', monospace", width: 24, flexShrink: 0 }}>{label}</span>
        <svg width={w} height={h} style={{ flexShrink: 0 }}>
          <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={w} cy={h - (current / max) * h} r="2" fill={color} />
        </svg>
        <span style={{ fontSize: '10px', color, fontWeight: 600, fontFamily: "'SF Mono', monospace", width: 36, textAlign: 'right', flexShrink: 0 }}>
          {current.toFixed(0)}{suffix}
        </span>
      </div>
    );
  };

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>
        SYSTEM
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Sparkline values={data.cpu} color="#4ade80" label="CPU" suffix="%" />
        <Sparkline values={data.mem} color="#60a5fa" label="MEM" suffix="%" />
        <Sparkline values={data.net} color="#c084fc" label="NET" suffix="k" />
      </div>
    </div>
  );
}

// ── Widget 5: Crypto Orderbook Depth Chart ──
function OrderbookDepth() {
  const [bids, setBids] = useState<number[]>([]);
  const [asks, setAsks] = useState<number[]>([]);
  const levels = 20;

  useEffect(() => {
    const genSide = (base: number, mult: number) =>
      Array.from({ length: levels }, (_, i) => base * Math.pow(mult, i) + Math.random() * base * 0.3);

    setBids(genSide(2.5, 1.08));
    setAsks(genSide(2.2, 1.06));

    const id = setInterval(() => {
      setBids(prev => prev.map(v => Math.max(0.5, v + (Math.random() - 0.5) * v * 0.15)));
      setAsks(prev => prev.map(v => Math.max(0.5, v + (Math.random() - 0.5) * v * 0.15)));
    }, 600);
    return () => clearInterval(id);
  }, []);

  if (!bids.length) return null;

  const w = 220, h = 50;
  const maxVol = Math.max(...bids, ...asks, 1);

  // Cumulative volumes
  const bidCum: number[] = [];
  bids.forEach((v, i) => bidCum.push((bidCum[i - 1] || 0) + v));
  const askCum: number[] = [];
  asks.forEach((v, i) => askCum.push((askCum[i - 1] || 0) + v));

  const maxCum = Math.max(bidCum[bidCum.length - 1], askCum[askCum.length - 1], 1);
  const midX = w / 2;

  // Bid path (left side, going outward)
  const bidPts = bidCum.map((c, i) => ({
    x: midX - (i / (levels - 1)) * midX,
    y: h - (c / maxCum) * (h - 4),
  }));
  const bidPath = `M${midX},${h} ` + bidPts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${bidPts[bidPts.length - 1]?.x.toFixed(1) || 0},${h} Z`;
  const bidLine = bidPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Ask path (right side, going outward)
  const askPts = askCum.map((c, i) => ({
    x: midX + (i / (levels - 1)) * midX,
    y: h - (c / maxCum) * (h - 4),
  }));
  const askPath = `M${midX},${h} ` + askPts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${askPts[askPts.length - 1]?.x.toFixed(1) || w},${h} Z`;
  const askLine = askPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', fontFamily: "'SF Pro Text', -apple-system, sans-serif" }}>BTC ORDERBOOK</span>
        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>
          <span style={{ color: '#4ade80' }}>BID {bidCum[bidCum.length - 1]?.toFixed(1)}</span>
          <span style={{ color: '#f87171' }}>ASK {askCum[askCum.length - 1]?.toFixed(1)}</span>
        </div>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="bid-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="ask-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={bidPath} fill="url(#bid-fill)" />
        <path d={bidLine} fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <path d={askPath} fill="url(#ask-fill)" />
        <path d={askLine} fill="none" stroke="#f87171" strokeWidth="1.5" />
        <line x1={midX} y1="0" x2={midX} y2={h} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="2,2" />
      </svg>
    </div>
  );
}

// ── Compact inline clocks (for Big Type ticker bar) ──
function CompactClocks() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  const cities = [
    { name: 'NY', tz: 'America/New_York' },
    { name: 'LDN', tz: 'Europe/London' },
    { name: 'TYO', tz: 'Asia/Tokyo' },
    { name: 'SYD', tz: 'Australia/Sydney' },
  ];
  return (
    <span style={{ display: 'inline-flex', gap: '12px' }}>
      {cities.map(c => {
        const t = time.toLocaleTimeString('en-US', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', hour12: true }).replace(' ', '');
        return <span key={c.name}><span style={{ color: 'rgba(255,255,255,0.3)' }}>{c.name}</span> <span style={{ color: 'rgba(255,255,255,0.6)' }}>{t}</span></span>;
      })}
    </span>
  );
}

function CompactFocus() {
  const focus = ['startup', 'vertical ai', 'robotics', 'automation', 'education', 'productivity'];
  return (
    <span style={{ display: 'inline-flex', gap: '10px' }}>
      {focus.map(item => (
        <span key={item}>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>{item}</span>{' '}
          <span style={{ color: '#4ade80' }}>●</span>
        </span>
      ))}
    </span>
  );
}

function ChronographWatch() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 50);
    return () => clearInterval(id);
  }, []);
  const h = time.getHours() % 12;
  const m = time.getMinutes();
  const s = time.getSeconds();
  const ms = time.getMilliseconds();
  const hAngle = (h * 30 + m * 0.5) - 90;
  const mAngle = (m * 6 + s * 0.1) - 90;
  const sAngle = (s * 6 + ms * 0.006) - 90;
  const C = 100; // center
  const toRad = (deg: number) => deg * (Math.PI / 180);
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
      {/* Outer rings */}
      <circle cx={C} cy={C} r="94" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" />
      <circle cx={C} cy={C} r="90" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      <text x={C} y="48" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="8" fontFamily="'SF Pro Display', -apple-system, sans-serif" fontWeight="800" letterSpacing="4">SULTAN</text>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = toRad(i * 30 - 90);
        const r1 = i % 3 === 0 ? 72 : 78;
        const r2 = 86;
        return <line key={i} x1={C + r1 * Math.cos(a)} y1={C + r1 * Math.sin(a)} x2={C + r2 * Math.cos(a)} y2={C + r2 * Math.sin(a)} stroke="rgba(255,255,255,0.9)" strokeWidth={i % 3 === 0 ? 3.5 : 1.5} strokeLinecap="round" />;
      })}
      {Array.from({ length: 60 }).map((_, i) => {
        if (i % 5 === 0) return null;
        const a = toRad(i * 6 - 90);
        return <line key={`t${i}`} x1={C + 83 * Math.cos(a)} y1={C + 83 * Math.sin(a)} x2={C + 86 * Math.cos(a)} y2={C + 86 * Math.sin(a)} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />;
      })}
      <circle cx={C} cy={68} r="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
      <line x1={C} y1={68} x2={C + 11 * Math.cos(toRad(m * 12 - 90))} y2={68 + 11 * Math.sin(toRad(m * 12 - 90))} stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={68} cy={C} r="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
      <line x1={68} y1={C} x2={68 + 11 * Math.cos(toRad(sAngle))} y2={C + 11 * Math.sin(toRad(sAngle))} stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={132} cy={C} r="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
      <line x1={132} y1={C} x2={132 + 11 * Math.cos(toRad(hAngle))} y2={C + 11 * Math.sin(toRad(hAngle))} stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={C} y1={C} x2={C + 46 * Math.cos(toRad(hAngle))} y2={C + 46 * Math.sin(toRad(hAngle))} stroke="rgba(255,255,255,0.95)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1={C} y1={C} x2={C + 64 * Math.cos(toRad(mAngle))} y2={C + 64 * Math.sin(toRad(mAngle))} stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" />
      <line x1={C - 14 * Math.cos(toRad(sAngle))} y1={C - 14 * Math.sin(toRad(sAngle))} x2={C + 78 * Math.cos(toRad(sAngle))} y2={C + 78 * Math.sin(toRad(sAngle))} stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx={C} cy={C} r="5" fill="rgba(255,255,255,0.7)" />
      <circle cx={C} cy={C} r="2.5" fill="rgba(255,255,255,0.95)" />
      <rect x="192" y="96" width="7" height="8" rx="1.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      {/* Pushers */}
      <rect x="190" y="70" width="8" height="4" rx="1" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <rect x="190" y="126" width="8" height="4" rx="1" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    </svg>
  );
}

function TerminalContent() {
  const { state, dispatch } = useDesktop();
  const isFullscreen = state.windows.terminal?.isFullscreen ?? false;
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [introDone, setIntroDone] = useState(false);
  const [showRotating, setShowRotating] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isSmallScreen = typeof window !== 'undefined' && window.innerHeight < 850;
  const isMobileTerminal = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Stagger-in elements (text is static, only rotating words animate)
  useEffect(() => {
    setShowRotating(true);
    setTimeout(() => setShowLinks(true), 400);
    setTimeout(() => setShowCommands(true), 700);
    setTimeout(() => setIntroDone(true), 1000);
  }, []);

  useEffect(() => {
    if (introDone) inputRef.current?.focus();
  }, [introDone]);

  // Only auto-scroll on command history updates, not during intro typing
  useEffect(() => {
    if (history.length > 0) {
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [history]);

  const prompt = 'abdullah@MacBookPro ~ % ';

  // Exit fullscreen before opening a window so the terminal shrinks back first
  const openWindow = (id: string) => {
    if (isFullscreen) {
      dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
      setTimeout(() => dispatch({ type: 'OPEN_WINDOW', id: id as any }), 150);
    } else {
      dispatch({ type: 'OPEN_WINDOW', id: id as any });
    }
  };

  const runCommand = (raw: string, _source: 'ui' | 'typed' = 'typed') => {
    const cmd = raw.trim().toLowerCase();
    const newLines: TerminalLine[] = [
      { type: 'prompt', text: prompt + raw, command: raw },
    ];

    if (!cmd) {
      // empty
    } else if (cmd === 'help') {
      newLines.push({ type: 'system', text: '\nAvailable commands:\n' });
      Object.entries(COMMANDS).forEach(([name, { desc }]) => {
        newLines.push({ type: 'output', text: `  \x1b[cmd]${name}\x1b[/cmd]${' '.repeat(Math.max(1, 15 - name.length))}${desc}` });
      });
      newLines.push({ type: 'output', text: '' });
      newLines.push({ type: 'output', text: '  \x1b[cmd]help\x1b[/cmd]           Show this list again' });
      newLines.push({ type: 'output', text: '  \x1b[cmd]clear\x1b[/cmd]          Clear terminal' });
      newLines.push({ type: 'output', text: '' });
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (SMART_COMMANDS[cmd]) {
      const { window: win, output } = SMART_COMMANDS[cmd];
      newLines.push({ type: 'system', text: output });
      openWindow(win);
    } else if (COMMANDS[cmd]) {
      const { window: winId, desc } = COMMANDS[cmd];
      newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
      openWindow(winId);
    } else if (cmd.startsWith('cd ')) {
      const target = cmd.replace('cd ', '').replace(/[\/~]/g, '').trim();
      if (COMMANDS[target]) {
        const { window: winId2, desc } = COMMANDS[target];
        newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
        openWindow(winId2);
      } else {
        newLines.push({ type: 'error', text: `cd: no such directory: ${target}` });
        newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
      }
    } else if (cmd.startsWith('open ')) {
      const target = cmd.replace('open ', '').trim();
      if (COMMANDS[target]) {
        const { window: winId3, desc } = COMMANDS[target];
        newLines.push({ type: 'system', text: `Opening ${desc.toLowerCase()}...` });
        openWindow(winId3);
      } else {
        newLines.push({ type: 'error', text: `open: "${target}" not found` });
        newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
      }
    } else if (cmd === 'ls') {
      Object.keys(COMMANDS).forEach(name => {
        newLines.push({ type: 'output', text: `  📁 ${name}/` });
      });
    } else if (cmd === 'whoami') {
      newLines.push({ type: 'output', text: 'abdullah' });
    } else if (cmd === 'pwd') {
      newLines.push({ type: 'output', text: '/Users/abdullah/portfolio' });
    } else if (cmd.startsWith('echo ')) {
      newLines.push({ type: 'output', text: raw.replace(/^echo\s+/i, '').replace(/^["']|["']$/g, '') });
    } else {
      newLines.push({ type: 'error', text: `zsh: command not found: ${cmd.split(' ')[0]}` });
      newLines.push({ type: 'output', text: 'Type "help" to see available commands.' });
    }

    const now = Date.now();
    const stamped = newLines.map(l => ({ ...l, ts: now }));
    setHistory(prev => [...prev, ...stamped]);
    setCmdHistory(prev => [raw, ...prev]);
    setHistoryIdx(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        setHistoryIdx(historyIdx - 1);
        setInput(cmdHistory[historyIdx - 1]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (input.trim()) {
        const partial = input.trim().toLowerCase();
        const prefix = partial.startsWith('cd ') ? partial.replace('cd ', '') : partial.startsWith('open ') ? partial.replace('open ', '') : partial;
        const match = Object.keys(COMMANDS).find(c => c.startsWith(prefix));
        if (match) {
          if (partial.startsWith('cd ')) setInput('cd ' + match);
          else if (partial.startsWith('open ')) setInput('open ' + match);
          else setInput(match);
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const renderColoredLine = (text: string) => {
    const parts = text.split(/\x1b\[cmd\]|\x1b\[\/cmd\]/);
    return parts.map((part, idx) => (
      idx % 2 === 1
        ? <span key={idx} style={{ color: '#60a5fa', fontWeight: 700 }}>{part}</span>
        : <span key={idx} style={{ color: 'rgba(0,0,0,0.5)' }}>{part}</span>
    ));
  };

  const getLineColor = (line: TerminalLine) => {
    switch (line.type) {
      case 'prompt': return '#4ade80';
      case 'error': return '#f87171';
      case 'system': return '#22d3ee';
      case 'human': return 'rgba(255,255,255,0.55)';
      default: return 'rgba(255,255,255,0.75)';
    }
  };

  const cmdColors: Record<string, string> = {
    about: '#60a5fa', experience: '#c084fc', projects: '#4ade80',
    abdullahOS: '#fbbf24', contact: '#22d3ee', photos: '#c084fc',
    help: '#94a3b8', clear: '#94a3b8',
  };

  const commandLinks = [
    { cmd: 'about', emoji: '👋', label: 'About', color: '#60a5fa' },
    { cmd: 'projects', emoji: '⚡', label: 'Projects', color: '#4ade80' },
    { cmd: 'abdullahOS', emoji: '▣', label: 'AbdullahOS', color: '#fbbf24' },
    { cmd: 'contact', emoji: '✉', label: 'Contact', color: '#22d3ee' },
    { cmd: 'photos', emoji: '◈', label: 'Photos', color: '#c084fc' },
  ];

  const smartCommandLinks = [
    { cmd: 'npm run about', color: '#60a5fa' },
    { cmd: 'git log --projects', color: '#4ade80' },
    { cmd: 'open abdullahOS.app', color: '#fbbf24' },
    { cmd: 'open contact.app', color: '#22d3ee' },
  ];

  // ============= DESIGN MODE =============
  // Change to preview: 'bento' | 'bigtype' | 'dashboard' | 'split'
  const DESIGN_MODE = 'split' as 'split' | 'bento' | 'bigtype' | 'dashboard';

  // Auto-fade old terminal lines after 15s
  useEffect(() => {
    if (history.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setHistory(prev => prev.filter(line => !line.ts || now - line.ts < 18000));
    }, 3000);
    return () => clearInterval(timer);
  }, [history.length]);

  // Shared terminal prompt + history renderer
  const renderTerminal = (compact?: boolean, mono?: boolean) => (
    <div style={{ fontFamily: mono !== false ? "'SF Mono', 'JetBrains Mono', 'Menlo', monospace" : 'inherit', fontSize: compact ? '12.5px' : '13px', lineHeight: 1.5 }}>
      {history.map((line, i) => {
        const age = line.ts ? Date.now() - line.ts : 0;
        const isFading = line.ts && age > 15000;
        return (
          <div key={i} style={{
            color: getLineColor(line), whiteSpace: 'pre-wrap',
            opacity: isFading ? 0 : 1,
            transform: isFading ? 'translateY(-12px) scale(0.97)' : 'translateY(0) scale(1)',
            filter: isFading ? 'blur(2px)' : 'blur(0px)',
            transition: 'opacity 3s ease-out, transform 3s ease-out, filter 3s ease-out',
          }}>
            {line.type === 'prompt' ? (
              <><span style={{ color: '#4ade80', fontWeight: 700 }}>{prompt}</span><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{line.command}</span></>
            ) : line.text.includes('\x1b[cmd]') ? renderColoredLine(line.text) : line.text}
          </div>
        );
      })}
      {introDone && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#4ade80', fontWeight: 700, whiteSpace: 'pre', fontFamily: "'SF Mono', monospace", fontSize: compact ? '12.5px' : '13px' }}>{prompt}</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            spellCheck={false} autoComplete="off"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'SF Mono', monospace", fontSize: compact ? '12.5px' : '13px', color: 'rgba(255,255,255,0.9)', padding: 0, margin: 0, caretColor: '#4ade80' }} />
        </div>
      )}
      {!introDone && <span style={{ display: 'inline-block', width: '8px', height: '14px', background: '#4ade80', animation: 'blink 1s step-end infinite' }} />}
    </div>
  );

  // Shared command grid renderer
  const renderCommandGrid = (cols?: number, small?: boolean) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols || 2}, 1fr)`, gap: small ? '4px' : '4px' }}>
      {commandLinks.map((item) => (
        <div key={item.cmd} onClick={(e) => { e.stopPropagation(); runCommand(item.cmd); }}
          style={{
            display: 'flex', alignItems: 'center', gap: small ? '6px' : '8px',
            padding: small ? '5px 8px' : '6px 10px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease', fontSize: small ? '11px' : '12px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = item.color + '40'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
        >
          <span style={{ fontSize: small ? '12px' : '14px' }}>{item.emoji}</span>
          <span style={{ color: item.color, fontWeight: 600 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );

  // ═══════════════ BENTO GRID ═══════════════
  if (DESIGN_MODE === 'bento') {
    return (
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        display: 'grid',
        gridTemplateColumns: '1fr 240px',
        gridTemplateRows: 'auto 1fr auto',
        height: '100%',
        fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
        fontSize: '12.5px', color: '#3a3a3c', lineHeight: 1.6,
        cursor: 'text', overflow: 'hidden',
      }}>
        {/* Hero tile — top left */}
        <div style={{ gridRow: '1', padding: '24px 24px 16px', overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: '22px', color: '#1d1d1f', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Abdullah Sultan</div>
          <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', marginTop: '2px', marginBottom: '14px' }}>Student builder</div>
          <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '13px', lineHeight: 1.5 }}>
            Using <RotatingWords /> to create<br />elegant and scalable solutions<br />to real world problems.
          </div>
        </div>

        {/* Right column — clock + contact info */}
        <div style={{ gridRow: '1 / 3', borderLeft: '1px solid rgba(0,0,0,0.04)', padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WorldClock />
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.04)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <a href="https://music.youtube.com/@amsultan303" target="_blank" rel="noopener" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>♫ music.youtube.com</a>
            <a href="https://github.com/amsultan2010" target="_blank" rel="noopener" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 github.com/amsultan2010</a>
            <a href="mailto:abdullahmsultan1@gmail.com" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ abdullahmsultan1@gmail.com</a>
            <span style={{ color: '#1d1d1f' }}>📍 Riyadh, Saudi Arabia</span>
          </div>
        </div>

        {/* Command tiles — middle left */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ color: 'rgba(0,0,0,0.25)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '8px' }}>EXPLORE</div>
          {renderCommandGrid(3, true)}
        </div>

        {/* Terminal prompt strip — full bottom */}
        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(0,0,0,0.04)', padding: '8px 24px', overflowY: 'auto', maxHeight: '120px' }}>
          {renderTerminal(true)}
        </div>

        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  // ═══════════════ BIG TYPE HERO ═══════════════
  if (DESIGN_MODE === 'bigtype') {
    return (
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        display: 'flex', flexDirection: 'column', height: '100%', cursor: 'text', overflow: 'hidden',
      }}>
        {/* Hero area — centered, fills most space */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px 32px 0', minHeight: 0 }}>
          <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: '52px', fontWeight: 800, letterSpacing: '0.12em', color: '#1d1d1f', lineHeight: 1, textTransform: 'uppercase' }}>Abdullah</div>
          <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: '52px', fontWeight: 800, letterSpacing: '0.12em', color: '#1d1d1f', lineHeight: 1, textTransform: 'uppercase', marginBottom: '12px' }}>Sultan</div>
          <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: '14px', color: 'rgba(0,0,0,0.4)', fontWeight: 400, marginBottom: '4px' }}>Student builder</div>
          <div style={{ fontFamily: "'SF Mono', monospace", fontSize: '13px', marginBottom: '20px' }}>
            <RotatingWords />
          </div>
          <div style={{ width: '40px', height: '1px', background: 'rgba(0,0,0,0.08)', marginBottom: '20px' }} />

          {/* Info row */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontFamily: "'SF Mono', monospace", marginBottom: '24px' }}>
            <a href="https://music.youtube.com/@amsultan303" target="_blank" rel="noopener" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>♫ YouTube Music</a>
            <a href="https://github.com/amsultan2010" target="_blank" rel="noopener" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
            <a href="mailto:abdullahmsultan1@gmail.com" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <span style={{ color: '#1d1d1f' }}>📍 Riyadh, Saudi Arabia</span>
          </div>

          {/* Command pills — horizontal */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '520px' }}>
            {commandLinks.map(item => (
              <div key={item.cmd} onClick={(e) => { e.stopPropagation(); runCommand(item.cmd); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                  background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.08)', transition: 'all 0.2s', fontSize: '12px',
                  fontFamily: "'SF Mono', monospace",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = item.color + '50'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
              >
                <span style={{ fontSize: '13px' }}>{item.emoji}</span>
                <span style={{ color: item.color, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data ticker bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px', padding: '10px 24px',
          borderTop: '1px solid rgba(0,0,0,0.04)', fontFamily: "'SF Mono', monospace", fontSize: '11px',
          color: 'rgba(0,0,0,0.35)', flexWrap: 'wrap',
        }}>
          <CompactClocks />
          <span style={{ color: 'rgba(0,0,0,0.08)' }}>│</span>
          <CompactFocus />
        </div>

        {/* Terminal prompt */}
        <div style={{
          borderTop: '1px solid rgba(0,0,0,0.04)', padding: '8px 24px', maxHeight: '100px', overflowY: 'auto',
          fontFamily: "'SF Mono', monospace",
        }}>
          {renderTerminal(true)}
        </div>

        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  // ═══════════════ DASHBOARD CARDS ═══════════════
  if (DESIGN_MODE === 'dashboard') {
    return (
      <div ref={scrollRef} onClick={() => inputRef.current?.focus()} style={{
        display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center',
        padding: '0', cursor: 'text', overflow: 'hidden',
      }}>
        {/* Top hero section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px', width: '100%', minHeight: 0, overflowY: 'auto' }}>
          <div style={{ width: '44px', height: '44px', marginBottom: '12px' }}>
            <AbdullahAsciiLogo width={44} height={44} color="#1d1d1f" opacity={0.85} />
          </div>
          <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontSize: '26px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px' }}>Abdullah Sultan</div>
          <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: '13px', color: 'rgba(0,0,0,0.4)', marginBottom: '6px' }}>Student builder · <RotatingWords /></div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontFamily: "'SF Mono', monospace", marginBottom: '20px' }}>
            <a href="https://music.youtube.com/@amsultan303" target="_blank" rel="noopener" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>♫ YouTube Music</a>
            <a href="https://github.com/amsultan2010" target="_blank" rel="noopener" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>🐙 GitHub</a>
            <a href="mailto:abdullahmsultan1@gmail.com" style={{ color: 'rgba(0,0,0,0.75)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>✉️ Email</a>
            <span style={{ color: 'rgba(0,0,0,0.4)' }}>📍 Riyadh</span>
          </div>

          {/* Glass cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '520px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.06)', padding: '14px 16px' }}>
              <WorldClock />
            </div>
            <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.06)', padding: '14px 16px' }}>
              <FocusStack />
            </div>
          </div>

          {/* Explore cards */}
          <div style={{ width: '100%', maxWidth: '520px' }}>
            <div style={{ color: 'rgba(0,0,0,0.25)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '8px' }}>EXPLORE</div>
            {renderCommandGrid(3, true)}
          </div>
        </div>

        {/* Terminal prompt */}
        <div style={{
          borderTop: '1px solid rgba(0,0,0,0.04)', padding: '8px 24px', width: '100%',
          maxHeight: '100px', overflowY: 'auto', fontFamily: "'SF Mono', monospace",
        }}>
          {renderTerminal(true)}
        </div>

        <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  // ═══════════════ FULLSCREEN: Abdullah static dashboard ═══════════════
  if (isFullscreen) {
    // Keep the same fullscreen terminal surface, but make it static and local-only.
  }

  // ═══════════════ SPLIT PANELS (default) ═══════════════
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' as const }}>
      {/* Left — hero + portfolio (main focus) */}
      <div style={{
        width: '100%',
        flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: isFullscreen ? (isSmallScreen ? '20px 28px 36px 28px' : '28px 48px 50px 48px') : (isMobileTerminal ? '12px 16px 10px 16px' : '20px 24px 16px 24px'),
        minWidth: 0, flexShrink: 0,
        overflowY: isFullscreen ? 'auto' : 'hidden',
        overflowX: 'hidden',
        position: 'relative' as const,
      }}>
        {/* Hero text */}
        <div>
          <div style={{ fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif", fontSize: isFullscreen ? '15.5px' : '14px', lineHeight: 1.6, color: isFullscreen ? '#1d1d1f' : '#3a3a3c' }}>
            {isFullscreen ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: isSmallScreen ? '32px' : '42px', color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>
                    Abdullah Sultan
                  </div>
                  <div style={{ fontSize: isSmallScreen ? '12px' : '14px', marginBottom: isSmallScreen ? '8px' : '12px', fontFamily: "'SF Pro Text', -apple-system, sans-serif", letterSpacing: '0.3px' }}>
                    <RollingTitles />
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 700, fontFamily: "'SF Pro Display', -apple-system, sans-serif", textAlign: 'right', paddingTop: '8px', flexShrink: 0, marginLeft: '16px' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: '36px', color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '2px' }}>
                  Abdullah Sultan
                </div>
                <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 700, marginBottom: '14px' }}>
                  Student builder
                </div>
              </>
            )}
            {isFullscreen ? (() => {
              const sHead: React.CSSProperties = { color: 'rgba(255,255,255,0.9)', fontSize: isSmallScreen ? '10px' : '11.5px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: isSmallScreen ? '5px' : '8px', fontFamily: "'SF Mono', monospace" };
              const sPara: React.CSSProperties = { color: 'rgba(255,255,255,0.75)', fontSize: isSmallScreen ? '12px' : '14.5px', lineHeight: isSmallScreen ? 1.5 : 1.65, fontFamily: "'SF Pro Text', -apple-system, sans-serif", fontWeight: 400 };
              const sRule: React.CSSProperties = { width: '40px', height: '1px', background: 'rgba(255,255,255,0.12)', margin: isSmallScreen ? '6px 0' : '10px 0' };
              return (
              <div style={{ marginTop: '2px', display: 'flex', gap: isSmallScreen ? '24px' : '40px' }}>
                {/* ── Left Column ── */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* About */}
                  <div style={sHead}>ABOUT</div>
                  <div style={sPara}>
                    currently based in Riyadh, Saudi Arabia. student builder focused on products, automation, robotics, and vertical ai.
                  </div>
                  <div style={{ ...sPara, marginTop: '6px' }}>
                    long term: become the cto of a yc-funded startup that actually does something meaningful.
                  </div>
                  <div style={{ ...sPara, marginTop: '6px' }}>
                  </div>

                  <div style={sRule} />

                  {/* Software */}
                  <div style={sHead}>SOFTWARE</div>
                  <div style={sPara}>
                    abdullahOS is the main desktop-style portfolio project.
                  </div>
                  <div style={{ ...sPara, marginTop: '6px' }}>
                    tutoringbyabdullah is the first education product; quant tools sit underneath as technical proof.
                  </div>

                  {/* Chronograph Watch */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, marginTop: '0px' }}>
                    <ChronographWatch />
                  </div>


                </div>

                {/* ── Right Column ── */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Hardware */}
                  <div style={sHead}>HARDWARE</div>
                  <div style={sPara}>
                    robotics, automation, sensors, prototypes, and lab-style experiments.
                  </div>

                  {/* Current Focus + Online (left) | Markets (right) */}
                  <div style={{ display: 'flex', gap: '48px', marginTop: '14px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={sHead}>CURRENT FOCUS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                          'abdullahOS interface',
                          'vertical ai for education and productivity',
                          'robotics, automation, and quant tools',
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                            <span style={{ color: '#1d1d1f', fontSize: '9px', fontFamily: "'SF Mono', monospace" }}>›</span>
                            <span style={{ ...sPara }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={sHead}>TECHNICAL PROOF</div>
                      <div style={sPara}>
                        quant tools are supporting technical proof, not the whole identity.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              );
            })(            ) : !isMobileTerminal ? (
              <>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", color: 'rgba(255,255,255,0.85)', fontSize: '17px', fontWeight: 500, minHeight: '48px', lineHeight: 1.35 }}>
                    {showRotating && <RotatingWords />}
                  </div>
                  <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", color: 'rgba(255,255,255,0.85)', fontSize: '17px', fontWeight: 500, width: '100%', lineHeight: 1.45 }}>
                    so that I can become a co-founder/CTO of a YC-funded startup that integrates AI automation with robotics.
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Clock — centered in remaining space */}
        {!isFullscreen && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <ChronographWatch />
          </div>
        )}

        {/* Bottom row — now playing left, links right */}
        {!isFullscreen && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
            {/* Bottom left: NowPlaying on desktop, Using text on mobile */}
            <div style={{ width: '50%', minWidth: 0 }}>
              {isMobileTerminal ? (
                <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", color: 'rgba(255,255,255,0.85)', fontSize: '15px', lineHeight: 1.6, fontWeight: 500, width: '100%' }}>
                  <div style={{ minHeight: '54px' }}>{showRotating && <RotatingWords />}</div>
                  <div>so that I can become a co-founder/CTO of a YC-funded startup that integrates AI automation with robotics.</div>
                </div>
              ) : (
                <NowPlaying />
              )}
            </div>
            {/* Links — bottom right */}
            <div style={{ fontFamily: "'SF Pro Text', -apple-system, sans-serif", display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '17px', fontWeight: 500, textAlign: 'right', flexShrink: 0, color: 'rgba(255,255,255,0.85)' }}>
              {[
                { href: 'https://music.youtube.com/@amsultan303', text: 'music' },
                { href: 'https://github.com/amsultan2010', text: 'github' },
                { href: 'https://www.linkedin.com/in/abdullah-sultan-4a264939a/', text: 'linkedin' },
                { href: 'mailto:abdullahmsultan1@gmail.com', text: 'email' },
              ].map(link => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener"
                  style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'all 0.15s', fontWeight: 500 }}
                  onClick={e => e.stopPropagation()}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.fontWeight = '700'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.fontWeight = '500'; }}
                >{link.text}</a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Middle — Tech Stack, Certs, GitHub heatmap (fullscreen only) */}
      {isFullscreen && (
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          <MiddlePanel runCommand={runCommand} />
        </div>
      )}

      {/* Collapse hint — bottom right, fullscreen only */}
      {isFullscreen && (
        <div
          onClick={() => dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' })}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px 5px 12px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.12)';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
          }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(0,0,0,0.6)',
            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
            letterSpacing: '0.02em',
          }}>Collapse</span>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M1 17V1h17" fill="none" stroke="rgba(0,0,0,0.75)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* (expand hint removed for minimal design) */}

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes cornerGlow {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(0,0,0,0.3)); }
  50% { filter: drop-shadow(0 0 6px rgba(0,0,0,0.7)); }
}
@keyframes cornerPulse {
  0%, 100% { opacity: 0.25; filter: drop-shadow(0 0 1px rgba(0,0,0,0.2)); }
  50% { opacity: 0.85; filter: drop-shadow(0 0 8px rgba(0,0,0,0.6)); }
}
@keyframes expandHintPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@keyframes expandGlow {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(97,218,251,0.4)); }
  50% { filter: drop-shadow(0 0 6px rgba(97,218,251,0.8)); }
}
.bloomberg-scroll::-webkit-scrollbar { display: none; }
.bloomberg-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}



function Desktop() {
  const [siteDark, setSiteDark] = useState(false);
  useEffect(() => {
    setSiteDark(localStorage.getItem('rg-theme') === 'dark');
  }, []);
  const { state, dispatch } = useDesktop();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [hoveredWindowId, setHoveredWindowId] = useState<string | null>('terminal');
  const terminalOrigRef = useRef<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Open terminal on boot complete (desktop only — mobile uses MobileAbdullahOS)
  useEffect(() => {
    if (!state.bootComplete || isMobile || Object.keys(state.windows).length > 0) return;
    dispatch({ type: 'OPEN_WINDOW', id: 'terminal' });
  }, [state.bootComplete, isMobile, dispatch]);

  // Desktop click — deselect all windows
  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    // Only if clicking the desktop surface itself
    if (e.target === e.currentTarget) {
      dispatch({ type: 'DESELECT_ALL' });
    }
  }, [dispatch]);

  // Terminal slide-over: when Education or Experience opens, shrink 20% and slide to middle-left
  // Only runs when browser viewport is wide enough (not split-screen / narrow view)
  useEffect(() => {
    const terminal = state.windows['terminal'];
    if (!terminal || terminal.isMinimized || !terminal.isOpen) return;

    // Skip slide-over animation when viewport is narrow (e.g. browser in split-screen)
    const MIN_WIDTH_FOR_SLIDE = 1024;
    if (window.innerWidth < MIN_WIDTH_FOR_SLIDE) return;

    const sideWindows = ['education', 'experience'] as const;
    const openSideWindow = sideWindows.find(id => {
      const w = state.windows[id];
      return w && w.isOpen && !w.isMinimized;
    });

    const hasSideContent = !!openSideWindow;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const menuBarH = 28;
    const dockH = 72;
    const gap = 10;
    const usableH = screenH - menuBarH - dockH;

    if (hasSideContent) {
      // Save original terminal size before any adjustments
      if (!terminalOrigRef.current) {
        terminalOrigRef.current = { width: terminal.size.width, height: terminal.size.height };
      }

      // Determine how much space the side content takes
      const sideWin = state.windows[openSideWindow]!;
      const is13Inch = screenH < 900 || screenW < 1500;
      // On 13-inch displays, scale down side windows to prevent terminal compression
      const sideW = is13Inch ? Math.min(sideWin.size.width, Math.round(screenW * 0.38)) : sideWin.size.width;
      const sideH = is13Inch ? Math.min(sideWin.size.height, usableH - 20) : sideWin.size.height;
      // Resize side window if needed on small screens
      if (is13Inch && (Math.abs(sideWin.size.width - sideW) > 10 || Math.abs(sideWin.size.height - sideH) > 10)) {
        dispatch({ type: 'RESIZE_WINDOW', id: openSideWindow, size: { width: sideW, height: sideH } });
      }
      // Place side window on right edge, vertically centered in usable area
      const sideX = screenW - gap - sideW;
      const sideY = menuBarH + Math.round((usableH - sideH) / 2);
      if (Math.abs(sideWin.position.x - sideX) > 10 || Math.abs(sideWin.position.y - sideY) > 10) {
        dispatch({ type: 'MOVE_WINDOW', id: openSideWindow, position: { x: sideX, y: sideY } });
      }

      // Check if terminal fits without shrinking — ensure minimum width
      const origTermW = terminalOrigRef.current.width;
      const spaceForTerm = sideX - gap - gap;
      const minTermW = is13Inch ? 500 : 600;
      const termW = Math.max(minTermW, Math.min(origTermW, spaceForTerm));
      const termH = terminal.size.height;

      // Shift terminal left only as much as needed
      const maxTermX = sideX - gap - termW;
      const centeredX = Math.round((screenW - termW) / 2);
      const termX = Math.max(gap, Math.min(centeredX, maxTermX));
      const termY = terminal.position.y;

      // Resize if needed, move if needed
      if (Math.abs(terminal.size.width - termW) > 10) {
        dispatch({ type: 'RESIZE_WINDOW', id: 'terminal', size: { width: termW, height: termH } });
      }
      if (Math.abs(terminal.position.x - termX) > 10) {
        dispatch({ type: 'MOVE_WINDOW', id: 'terminal', position: { x: termX, y: termY } });
      }
    } else {
      // Restore terminal to original size and center when side windows close
      const origSize = terminalOrigRef.current;
      if (origSize) {
        const centeredX = Math.round((screenW - origSize.width) / 2);
        const origY = menuBarH + Math.round((usableH - origSize.height) / 2);
        dispatch({ type: 'RESIZE_WINDOW', id: 'terminal', size: { width: origSize.width, height: origSize.height } });
        dispatch({ type: 'MOVE_WINDOW', id: 'terminal', position: { x: centeredX, y: origY } });
        terminalOrigRef.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Stable dependency: only re-run when the set of open side windows changes
    ['education', 'experience'].filter(id => state.windows[id]?.isOpen && !state.windows[id]?.isMinimized).join(','),
    state.windows['terminal']?.isOpen,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+W to close focused window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w' && state.focusedWindowId) {
        e.preventDefault();
        dispatch({ type: 'CLOSE_WINDOW', id: state.focusedWindowId });
      }
      // Cmd+M to minimize focused window
      if ((e.metaKey || e.ctrlKey) && e.key === 'm' && state.focusedWindowId) {
        e.preventDefault();
        dispatch({ type: 'MINIMIZE_WINDOW', id: state.focusedWindowId });
      }
      // Escape to close focused window (skip terminal)
      if (e.key === 'Escape' && state.focusedWindowId && state.focusedWindowId !== 'terminal') {
        dispatch({ type: 'CLOSE_WINDOW', id: state.focusedWindowId });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.focusedWindowId, dispatch]);

  const openWindows = Object.values(state.windows).filter(w => w.isOpen);

  return (
    <div
      onClick={handleDesktopClick}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: 'transparent',
        cursor: 'default',
      }}
    >
      <Background overlayOpacity={['education', 'experience', 'terminal'].includes(state.focusedWindowId as string) ? 0.35 : 0.1} />
      <BootScreen key={state.bootComplete ? 'booted' : 'booting'} />

      {state.bootComplete && (
        <>
          <DesktopMenuBar />

          {isMobile ? (
            <MobileAbdullahOS />
          ) : (
            <>
              {openWindows.map(win => {
                const titleBarBgMap: Record<string, string> = {
                  projects: '#252526',
                  blog: '#f9f9f8',
                  email: '#ffffff',
                  photos: '#1a1a1f',
                  watchlist: '#141414',
                };
                const darkTitleBars = ['projects', 'terminal', 'photos', 'watchlist'];
                const titleBarBg = titleBarBgMap[win.id];
                const titleBarDark = darkTitleBars.includes(win.id);
                const hoverProps = {
                  onMouseEnter: () => setHoveredWindowId(win.id),
                  onMouseLeave: () => setHoveredWindowId(null),
                };
                if (win.id === 'detail' && state.activeDetail) {
                  return (
                    <AppWindow key={win.id} windowState={win} titleBarBg={titleBarBg} titleBarDark={titleBarDark} {...hoverProps}>
                      <DetailPanel
                        detail={state.activeDetail}
                        onClose={() => dispatch({ type: 'CLOSE_DETAIL' })}
                        windowMode
                      />
                    </AppWindow>
                  );
                }
                if (win.id === 'content' && state.activeContent) {
                  return (
                    <AppWindow key={win.id} windowState={win} titleBarBg={titleBarBg} titleBarDark={titleBarDark} {...hoverProps}>
                      <ContentViewer
                        content={state.activeContent}
                        onClose={() => dispatch({ type: 'CLOSE_CONTENT' })}
                        windowMode
                      />
                    </AppWindow>
                  );
                }
                return (
                  <AppWindow key={win.id} windowState={win} titleBarBg={titleBarBg} titleBarDark={titleBarDark} {...hoverProps}>
                    <WindowContent id={win.id} />
                  </AppWindow>
                );
              })}
              <DesktopDock />
            </>
          )}
        </>
      )}

      <style>{`
        :root {
          color-scheme: ${siteDark ? "dark" : "light"};
          color: rgba(0, 0, 0, 0.87);
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Custom scrollbar for windows */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

export default function DesktopShell({ skipBoot }: { skipBoot?: boolean } = {}) {
  return (
    <DesktopProvider skipBoot={skipBoot}>
      <Desktop />
    </DesktopProvider>
  );
}

