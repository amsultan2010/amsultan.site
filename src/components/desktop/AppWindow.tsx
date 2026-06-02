import { useRef, useCallback, useEffect, useState } from 'react';
import { useDesktop } from './DesktopContext';
import type { WindowState } from './types';

interface AppWindowProps {
  windowState: WindowState;
  children: React.ReactNode;
  darkMode?: boolean;
  titleBarBg?: string;
  titleBarDark?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function AppWindow({ windowState, children, darkMode, titleBarBg, titleBarDark, onMouseEnter, onMouseLeave }: AppWindowProps) {
  const { state, dispatch } = useDesktop();
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; edge: string } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [entering, setEntering] = useState(true);
  const [trafficHover, setTrafficHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isFocused = state.focusedWindowId === windowState.id;

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 300);
    return () => clearTimeout(t);
  }, []);

  // Drag handler
  const handleMouseDownTitleBar = useCallback((e: React.MouseEvent) => {
    if (windowState.isFullscreen) return;
    e.preventDefault();
    dispatch({ type: 'FOCUS_WINDOW', id: windowState.id });
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      winX: windowState.position.x,
      winY: windowState.position.y,
    };

    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = dragRef.current.winX + dx;
      const newY = Math.max(28, dragRef.current.winY + dy);
      dispatch({ type: 'MOVE_WINDOW', id: windowState.id, position: { x: newX, y: newY } });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dispatch, windowState.id, windowState.position, windowState.isFullscreen]);

  // Resize handler
  const handleResizeStart = useCallback((edge: string, e: React.MouseEvent) => {
    if (windowState.isFullscreen) return;
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'FOCUS_WINDOW', id: windowState.id });
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: windowState.size.width,
      startH: windowState.size.height,
      edge,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      let newW = resizeRef.current.startW;
      let newH = resizeRef.current.startH;

      if (edge.includes('e')) newW = Math.max(400, resizeRef.current.startW + dx);
      if (edge.includes('w')) newW = Math.max(400, resizeRef.current.startW - dx);
      if (edge.includes('s')) newH = Math.max(300, resizeRef.current.startH + dy);
      if (edge.includes('n')) newH = Math.max(300, resizeRef.current.startH - dy);

      dispatch({ type: 'RESIZE_WINDOW', id: windowState.id, size: { width: newW, height: newH } });

      // If dragging west or north edge, also move the position
      if (edge.includes('w')) {
        const actualDx = resizeRef.current.startW - newW;
        dispatch({ type: 'MOVE_WINDOW', id: windowState.id, position: { x: windowState.position.x - actualDx, y: windowState.position.y } });
      }
      if (edge.includes('n')) {
        const actualDy = resizeRef.current.startH - newH;
        dispatch({ type: 'MOVE_WINDOW', id: windowState.id, position: { x: windowState.position.x, y: Math.max(28, windowState.position.y - actualDy) } });
      }
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dispatch, windowState]);

  const handleFocus = useCallback(() => {
    if (!isFocused) dispatch({ type: 'FOCUS_WINDOW', id: windowState.id });
  }, [dispatch, isFocused, windowState.id]);

  const handleDoubleClickTitleBar = useCallback(() => {
    dispatch({ type: 'TOGGLE_FULLSCREEN', id: windowState.id });
  }, [dispatch, windowState.id]);

  if (windowState.isMinimized) return null;

  const borderRadius = windowState.isFullscreen ? '12px' : '12px';

  return (
    <div
      ref={windowRef}
      onMouseDown={handleFocus}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        left: windowState.position.x,
        top: windowState.position.y,
        width: windowState.size.width,
        height: windowState.size.height,
        zIndex: windowState.zIndex,
        borderRadius,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: darkMode ? 'rgba(244, 244, 245, 0.72)' : 'rgba(255, 255, 255, 0.32)',
        backdropFilter: 'saturate(200%) blur(40px)',
        WebkitBackdropFilter: 'saturate(200%) blur(40px)',
        border: windowState.isFullscreen ? 'none' : darkMode
          ? (isFocused ? '0.5px solid rgba(0, 0, 0, 0.15)' : '0.5px solid rgba(0, 0, 0, 0.08)')
          : (isFocused ? '1px solid rgba(0, 0, 0, 0.18)' : '1px solid rgba(0, 0, 0, 0.1)'),
        boxShadow: windowState.isFullscreen ? 'none' : isFocused
          ? '0 24px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.6)'
          : '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06), inset 0 0.5px 0 rgba(255,255,255,0.4)',
        opacity: entering ? 0 : 1,
        transform: entering ? 'scale(0.92)' : 'scale(1)',
        transition: isDragging
          ? 'opacity 0.25s ease-out, transform 0.25s ease-out, box-shadow 0.2s ease, border-color 0.2s ease'
          : 'opacity 0.25s ease-out, transform 0.25s ease-out, box-shadow 0.2s ease, border-color 0.2s ease, border-radius 0.2s ease, width 0.25s ease, height 0.25s ease',
        willChange: 'transform',
      }}
    >
      {/* Title bar — draggable */}
      <div
        onMouseDown={handleMouseDownTitleBar}
        onDoubleClick={handleDoubleClickTitleBar}
        style={{
          height: '38px',
          minHeight: '38px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: titleBarDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.04)',
          cursor: windowState.isFullscreen ? 'default' : 'grab',
          userSelect: 'none',
          background: titleBarBg || 'transparent',
        }}
      >
        {/* Traffic lights */}
        <div
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          onMouseEnter={() => setTrafficHover(true)}
          onMouseLeave={() => setTrafficHover(false)}
        >
          <TrafficButton
            color="#ff5f57"
            isFocused={isFocused}
            isHovered={trafficHover}
            darkMode={titleBarDark}
            symbol="×"
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CLOSE_WINDOW', id: windowState.id }); }}
            label="Close window"
          />
          <TrafficButton
            color="#febc2e"
            isFocused={isFocused}
            isHovered={trafficHover}
            darkMode={titleBarDark}
            symbol="−"
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'MINIMIZE_WINDOW', id: windowState.id }); }}
            label="Minimize window"
          />
          <TrafficButton
            color="#28c840"
            isFocused={isFocused}
            isHovered={trafficHover}
            darkMode={titleBarDark}
            symbol="⤢"
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FULLSCREEN', id: windowState.id }); }}
            label="Fullscreen"
          />
        </div>

        {/* Window title */}
        <span style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
          fontSize: '13px',
          color: titleBarDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          letterSpacing: '0.02em',
          transition: 'color 0.15s ease',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {windowState.title}
        </span>

        {/* Spacer to balance traffic lights */}
        <div style={{ width: '52px' }} />
      </div>

      {/* Content area — scrollable */}
      <div className={darkMode ? 'dark-window' : 'light-window'} style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'transparent',
      }}>
        {children}
      </div>

      {/* Resize handles (hidden in fullscreen) */}
      {!windowState.isFullscreen && (
        <>
          <ResizeEdge edge="e" onStart={handleResizeStart} cursor="ew-resize" style={{ right: 0, top: 0, width: '4px', height: '100%' }} />
          <ResizeEdge edge="w" onStart={handleResizeStart} cursor="ew-resize" style={{ left: 0, top: 0, width: '4px', height: '100%' }} />
          <ResizeEdge edge="s" onStart={handleResizeStart} cursor="ns-resize" style={{ bottom: 0, left: 0, width: '100%', height: '4px' }} />
          <ResizeEdge edge="se" onStart={handleResizeStart} cursor="nwse-resize" style={{ right: 0, bottom: 0, width: '12px', height: '12px' }} />
          <ResizeEdge edge="sw" onStart={handleResizeStart} cursor="nesw-resize" style={{ left: 0, bottom: 0, width: '12px', height: '12px' }} />
        </>
      )}
    </div>
  );
}

// ── Traffic Light Button ──

function TrafficButton({ color, isFocused, isHovered, darkMode, symbol, onClick, label }: {
  color: string;
  isFocused: boolean;
  isHovered: boolean;
  darkMode?: boolean;
  symbol: string;
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: color,
        border: `0.5px solid ${color}88`,
        padding: 0,
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontWeight: 800,
        lineHeight: 1,
        color: isHovered ? 'rgba(0,0,0,0.65)' : 'transparent',
      }}
    >
      {symbol}
    </button>
  );
}

// ── Resize Edge ──

function ResizeEdge({ edge, onStart, cursor, style }: {
  edge: string;
  onStart: (edge: string, e: React.MouseEvent) => void;
  cursor: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      onMouseDown={(e) => onStart(edge, e)}
      style={{
        position: 'absolute',
        cursor,
        zIndex: 10,
        ...style,
      }}
    />
  );
}
