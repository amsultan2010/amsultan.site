import { useDesktop } from './DesktopContext';
import { useState, useEffect, useRef } from 'react';
import GitHubHeatmap from './GitHubHeatmap';
import AbdullahAsciiLogo from './AbdullahAsciiLogo';


/* ── Types ─────────────────────────────────────────── */

interface LocationData {
  city: string;
  region: string;
  country: string;
  lat?: number;
  lon?: number;
}

/* ── Main Component ────────────────────────────────── */

export default function DesktopMenuBar() {
  const { state, dispatch } = useDesktop();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const location: LocationData = { city: 'Riyadh', region: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753 };
  const barRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (id: string) => { setActiveMenu(p => p === id ? null : id); };
  const hover = (id: string) => { if (activeMenu !== null) setActiveMenu(id); };
  const close = () => setActiveMenu(null);

  const hasFocused = !!state.focusedWindowId;

  return (
    <div ref={barRef} className="desktop-menu-bar" style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '28px', zIndex: 10010,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px',
      background: 'rgba(0,0,0,0.78)',
      backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      borderBottom: 'none',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: isMobile ? '12px' : '14px', color: '#FFFFFF', userSelect: 'none',
    }}>
      {/* ── Left: Logo + Menus ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {/* Apple-menu-style logo dropdown */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div
            onMouseDown={() => toggle('apple')}
            onMouseEnter={() => hover('apple')}
            style={{
              ...barItem, padding: '0 8px 0 2px', borderRadius: '4px',
              background: activeMenu === 'apple' ? 'rgba(255,255,255,0.15)' : 'transparent',
            }}
          >
            <AbdullahAsciiLogo width={22} height={20} color="#fff" opacity={1} />
          </div>
          {activeMenu === 'apple' && (
            <div style={{ ...panelStyle, left: 0, minWidth: '240px' }}>
              <DropItem label="About Abdullah Sultan" onClick={() => { dispatch({ type: 'OPEN_WINDOW', id: 'terminal' }); close(); }} />
              <DropDivider />
              <DropItem label="System Settings..." disabled />
              <DropItem label="App Store..." disabled />
              <DropDivider />
              <DropItem label="Recent Items" disabled />
              <DropDivider />
              <DropItem label="Force Quit..." shortcut="⌥⌘⎋" onClick={() => {
                Object.keys(state.windows).forEach(id => dispatch({ type: 'CLOSE_WINDOW', id: id as any }));
                close();
              }} />
              <DropDivider />
              <DropItem label="Sleep" disabled />
              <DropItem label="Restart..." disabled />
              <DropItem label="Shut Down..." disabled />
              <DropDivider />
              <DropItem label="Lock Screen" shortcut="⌃⌘Q" onClick={() => { dispatch({ type: 'LOCK_SCREEN' }); close(); }} />
              <DropItem label="Log Out Abdullah Sultan..." shortcut="⇧⌘Q" onClick={() => { window.location.reload(); }} />
            </div>
          )}
        </div>

        {!isMobile && <div style={{ ...barItem, fontWeight: 600, padding: '0 14px 0 0' }}>abdullah sultan</div>}

        {!isMobile && (
          <>
            <div
              onMouseDown={() => {
                const termWin = state.windows.terminal;
                if (termWin?.isFullscreen) {
                  dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
                  setTimeout(() => dispatch({ type: 'OPEN_WINDOW', id: 'education' }), 150);
                } else {
                  dispatch({ type: 'OPEN_WINDOW', id: 'education' });
                }
                close();
              }}
              onMouseEnter={() => hover('_edu')}
              style={{ ...barItem, padding: '0 10px' }}
            >About</div>

            <div
              onMouseDown={() => {
                const termWin = state.windows.terminal;
                if (termWin?.isFullscreen) {
                  dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
                  setTimeout(() => dispatch({ type: 'OPEN_WINDOW', id: 'experience' }), 150);
                } else {
                  dispatch({ type: 'OPEN_WINDOW', id: 'experience' });
                }
                close();
              }}
              onMouseEnter={() => hover('_exp')}
              style={{ ...barItem, padding: '0 10px' }}
            >Projects</div>
          </>
        )}

        <div
          onMouseDown={() => window.open('https://github.com/amsultan2010', '_blank')}
          onMouseEnter={() => hover('_resume')}
          style={{ ...barItem, padding: '0 10px' }}
        >GitHub</div>

        {!isMobile && (
          <BarDropdown label="Window" id="window" active={activeMenu} toggle={toggle} hover={hover}>
            <DropItem label="Minimize" shortcut="⌘M" disabled={!hasFocused}
              onClick={() => { if (state.focusedWindowId) dispatch({ type: 'MINIMIZE_WINDOW', id: state.focusedWindowId }); close(); }} />
            <DropItem label="Zoom" disabled={!hasFocused}
              onClick={() => { if (state.focusedWindowId) dispatch({ type: 'TOGGLE_FULLSCREEN', id: state.focusedWindowId }); close(); }} />
            <DropDivider />
            <DropItem label="Close Window" shortcut="⌘W" disabled={!hasFocused}
              onClick={() => { if (state.focusedWindowId) dispatch({ type: 'CLOSE_WINDOW', id: state.focusedWindowId }); close(); }} />
            <DropDivider />
            <DropItem label="Bring All to Front" onClick={close} />
          </BarDropdown>
        )}
      </div>

      {/* ── Right: System Tray ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '100%' }}>
        <BatteryIcon />

        <TrayDropdown id="wifi" active={activeMenu} toggle={toggle} icon={<WifiIcon />} align="right">
          <WifiPanel location={location} />
        </TrayDropdown>

        <TrayDropdown id="sound" active={activeMenu} toggle={toggle} icon={<SpeakerIcon />} align="right">
          <SoundPanel />
        </TrayDropdown>

        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
          <span
            onMouseDown={(e) => { e.stopPropagation(); toggle('notif'); }}
            style={{
              fontSize: '12.5px',
              color: '#FFFFFF',
              fontWeight: 500,
              marginLeft: '6px',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'default',
              background: activeMenu === 'notif' ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
          >
            {isMobile ? time : <>{date}&ensp;{time}</>}
          </span>
          {activeMenu === 'notif' && (
            <div style={{ ...panelStyle, right: 0, background: 'rgba(244, 244, 244, 0.85)', color: 'rgba(0,0,0,0.85)' }}>
              <div style={{ padding: '10px 14px', minWidth: '320px' }}>
                <GitHubHeatmap />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared styles ─────────────────────────────────── */

const barItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', height: '100%',
  padding: '0 10px', cursor: 'default', fontSize: '13px',
};

const panelStyle: React.CSSProperties = {
  position: 'absolute', top: '28px', minWidth: '220px', padding: '4px 0',
  background: 'rgba(244, 244, 244, 0.72)',
  backdropFilter: 'saturate(200%) blur(50px)', WebkitBackdropFilter: 'saturate(200%) blur(50px)',
  borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.12)',
  boxShadow: '0 12px 48px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.6)',
  zIndex: 10011,
  color: 'rgba(0,0,0,0.85)',
};

/* ── Menu bar dropdown wrapper ─────────────────────── */

function BarDropdown({ label, id, active, toggle, hover, children }: {
  label: string; id: string; active: string | null;
  toggle: (id: string) => void; hover: (id: string) => void;
  children: React.ReactNode;
}) {
  const open = active === id;
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        onMouseDown={() => toggle(id)}
        onMouseEnter={() => hover(id)}
        style={{
          ...barItem, borderRadius: '4px',
          background: open ? 'rgba(255,255,255,0.15)' : 'transparent',
        }}
      >{label}</div>
      {open && <div style={{ ...panelStyle, left: 0 }}>{children}</div>}
    </div>
  );
}

/* ── System tray icon dropdown ─────────────────────── */

function TrayDropdown({ id, active, toggle, icon, children, align, dark }: {
  id: string; active: string | null;
  toggle: (id: string) => void;
  icon: React.ReactNode; children: React.ReactNode; align?: 'left' | 'right'; dark?: boolean;
}) {
  const open = active === id;
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        onClick={() => toggle(id)}
        style={{
          padding: '3px 6px', borderRadius: '4px', cursor: 'default',
          background: open ? 'rgba(255,255,255,0.15)' : 'transparent',
          display: 'flex', alignItems: 'center',
        }}
      >{icon}</div>
      {open && <div style={{ ...panelStyle, ...(align === 'right' ? { right: 0 } : { left: 0 }), ...(dark ? { background: 'rgba(244, 244, 244, 0.85)', color: 'rgba(0,0,0,0.85)' } : {}) }}>{children}</div>}
    </div>
  );
}

/* ── Dropdown menu items ───────────────────────────── */

function DropItem({ label, shortcut, onClick, disabled }: {
  label: string; shortcut?: string; onClick?: () => void; disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const active = hovered && !disabled;
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '4px 12px', margin: '0 4px', borderRadius: '4px',
        fontSize: '13px', cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'rgba(0,0,0,0.25)' : active ? '#fff' : 'rgba(0,0,0,0.85)',
        background: active ? 'rgba(59,130,246,0.85)' : 'transparent',
      }}
    >
      <span>{label}</span>
      {shortcut && (
        <span style={{
          color: disabled ? 'rgba(0,0,0,0.12)' : active ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.35)',
          fontSize: '12px', marginLeft: '24px',
        }}>{shortcut}</span>
      )}
    </div>
  );
}

function DropDivider() {
  return <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '4px 0' }} />;
}

/* ── WiFi Panel ────────────────────────────────────── */

function WifiPanel({ location }: { location: LocationData | null }) {
  return (
    <div style={{ padding: '4px 0', minWidth: '280px' }}>
      {/* Wi-Fi header with blue toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 10px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'rgba(0,0,0,0.85)' }}>Wi-Fi</span>
        <div style={{ width: '38px', height: '22px', borderRadius: '11px', background: '#007aff', position: 'relative', cursor: 'default' }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%', background: 'white',
            position: 'absolute', top: '2px', right: '2px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

      <DropDivider />

      {/* Known Network - Connected */}
      <div style={{ padding: '8px 14px 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.02em' }}>Known Network</span>
      </div>

      <div style={{ padding: '4px 14px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Blue wifi icon */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: '#007aff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
              <path d="M8 10.5a1 1 0 100-2 1 1 0 000 2z" fill="white" />
              <path d="M5.17 7.17a4 4 0 015.66 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M2.93 4.93a7 7 0 0110.14 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(0,0,0,0.85)', flex: 1 }}>Abdullah's Network</span>
          {/* Lock icon */}
          <svg width="12" height="14" viewBox="0 0 12 16" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
            <rect x="1" y="7" width="10" height="8" rx="2" fill="rgba(0,0,0,0.65)" />
            <path d="M3 7V5a3 3 0 016 0v2" stroke="rgba(0,0,0,0.65)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>

      {location && (
        <div style={{ padding: '2px 14px 6px', paddingLeft: '52px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.35)' }}>
            Connected from {location.city}, {location.region}
          </span>
        </div>
      )}

      <DropDivider />

      {/* Known Networks - Places visited */}
      <div style={{ padding: '8px 14px 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.02em' }}>Known Networks</span>
      </div>

      {[
        { name: 'Riyadh, Saudi Arabia',  flag: '🇸🇦' },
        { name: 'Short Hills, NJ',       flag: '🇺🇸' },
        { name: 'Dhahran, Saudi Arabia', flag: '🇸🇦' },
        { name: 'Manhattan, NY',         flag: '🇺🇸' },
        { name: 'San Francisco, CA',     flag: '🇺🇸' },
      ].map((place) => (
        <div key={place.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '3px 14px' }}>
          <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{place.flag}</span>
          <span style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.55)', flex: 1 }}>{place.name}</span>
          <svg width="12" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.25, flexShrink: 0 }}>
            <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill="rgba(0,0,0,0.5)" />
            <path d="M5.17 9.17a4 4 0 015.66 0" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M2.93 6.93a7 7 0 0110.14 0" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      ))}

      <div style={{ padding: '4px 0' }} />

      <DropDivider />

      {/* Other Networks */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 14px', cursor: 'default',
      }}>
        <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.85)' }}>Other Networks</span>
        <svg width="8" height="12" viewBox="0 0 8 14" fill="none" style={{ opacity: 0.3 }}>
          <path d="M1 1l6 6-6 6" stroke="rgba(0,0,0,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <DropDivider />

    </div>
  );
}

/* ── Sound / Music Panel ─────────────────────────── */

function SoundPanel() {
  return (
    <div style={{ padding: '8px 0', minWidth: '290px' }}>
      <div style={{ padding: '0 14px 6px', fontSize: '11px', color: 'rgba(0,0,0,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>
        AUDIO
      </div>

      <a
        href="https://music.youtube.com/@amsultan303"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', gap: '12px', padding: '8px 14px 12px', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
      >
        <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: '#ff0033', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M10 8l6 4-6 4z" /></svg>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            YouTube Music
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)', marginTop: '2px' }}>
            Static launcher
          </div>
        </div>
      </a>

      <DropDivider />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}>
        <svg width="12" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
          <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(0,0,0,0.55)" />
        </svg>
        <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(0,0,0,0.1)', position: 'relative' }}>
          <div style={{ height: '100%', width: '70%', background: 'rgba(0,0,0,0.35)', borderRadius: '2px' }} />
          <div style={{
            position: 'absolute', top: '-4px', left: '70%', transform: 'translateX(-50%)',
            width: '10px', height: '10px', borderRadius: '50%', background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
        <svg width="14" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
          <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="rgba(0,0,0,0.55)" />
          <path d="M11 4.5a3.5 3.5 0 010 5" stroke="rgba(0,0,0,0.4)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          <path d="M13 2.5a6.5 6.5 0 010 9" stroke="rgba(0,0,0,0.25)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}

function CtrlBtn({ children, size = 26 }: { children: React.ReactNode; size?: number }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: h ? 'rgba(0,0,0,0.06)' : 'transparent',
        cursor: 'default', transition: 'background 0.15s',
      }}
    >{children}</div>
  );
}

/* ── Dark WiFi icon for light panels ─────────────── */

function WifiIconDark() {
  return (
    <svg width="14" height="10" viewBox="0 0 16 12" fill="none" style={{ opacity: 0.6 }}>
      <path d="M8 10.5a1 1 0 100-2 1 1 0 000 2z" fill="rgba(0,0,0,0.65)" />
      <path d="M5.17 7.17a4 4 0 015.66 0" stroke="rgba(0,0,0,0.55)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M2.93 4.93a7 7 0 0110.14 0" stroke="rgba(0,0,0,0.4)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── System Tray Icons ─────────────────────────────── */

function BatteryIcon() {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
      <rect x="0.5" y="1" width="18" height="10" rx="2" stroke="#FFFFFF" strokeWidth="1" fill="none" />
      <rect x="19" y="3.5" width="2" height="5" rx="0.75" fill="#FFFFFF" />
      <rect x="2" y="2.5" width="14" height="7" rx="1" fill="#FFFFFF" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 16 12" fill="none">
      <path d="M8 10.5a1 1 0 100-2 1 1 0 000 2z" fill="#FFFFFF" />
      <path d="M5.17 7.17a4 4 0 015.66 0" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M2.93 4.93a7 7 0 0110.14 0" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
      <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="#FFFFFF" />
      <path d="M11 4.5a3.5 3.5 0 010 5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M13 2.5a6.5 6.5 0 010 9" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}
