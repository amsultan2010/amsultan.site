import { useEffect, useRef, useState } from 'react';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  location: { city: string; region: string; country: string; lat?: number; lon?: number } | null;
}

const activityItems = [
  { title: 'abdullahOS', detail: 'desktop shell, static apps, project workspace' },
  { title: 'vertical ai', detail: 'automation, enterprise software, productivity, education' },
  { title: 'build queue', detail: 'robotics, tutoringbyabdullah, creative engineering' },
];

export default function NotificationCenter({ open, onClose, location }: NotificationCenterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleOutside), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [open, onClose]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: '50%',
        right: '16px',
        width: '320px',
        maxHeight: 'calc(100vh - 80px)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        pointerEvents: open ? 'auto' : 'none',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(-50%)' : 'translateY(calc(-50% - 8px))',
        transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        scrollbarWidth: 'none',
      }}
    >
      <AnalogClock />
      <ActivityList city={location?.city || 'riyadh'} />
    </div>
  );
}

function AnalogClock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 140;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 60;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const isMain = i % 3 === 0;
      const innerR = radius - (isMain ? 12 : 8);
      const outerR = radius - 3;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = isMain ? 2.2 : 0.8;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const angle = (i * 6 - 90) * (Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(cx + (radius - 5) * Math.cos(angle), cy + (radius - 5) * Math.sin(angle));
      ctx.lineTo(cx + (radius - 3) * Math.cos(angle), cy + (radius - 3) * Math.sin(angle));
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const hAngle = ((hours + minutes / 60) * 30 - 90) * (Math.PI / 180);
    const mAngle = ((minutes + seconds / 60) * 6 - 90) * (Math.PI / 180);
    const sAngle = (seconds * 6 - 90) * (Math.PI / 180);

    ctx.beginPath();
    ctx.moveTo(cx - 7 * Math.cos(hAngle), cy - 7 * Math.sin(hAngle));
    ctx.lineTo(cx + 32 * Math.cos(hAngle), cy + 32 * Math.sin(hAngle));
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 7 * Math.cos(mAngle), cy - 7 * Math.sin(mAngle));
    ctx.lineTo(cx + 46 * Math.cos(mAngle), cy + 46 * Math.sin(mAngle));
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 12 * Math.cos(sAngle), cy - 12 * Math.sin(sAngle));
    ctx.lineTo(cx + 50 * Math.cos(sAngle), cy + 50 * Math.sin(sAngle));
    ctx.strokeStyle = '#FF9500';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FF9500';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }, [time]);

  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dayStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toLowerCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
      <canvas ref={canvasRef} style={{ width: '140px', height: '140px' }} />
      <div style={{
        marginTop: '10px',
        fontSize: '26px',
        fontWeight: 300,
        color: '#fff',
        letterSpacing: '-0.02em',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
        textShadow: '0 1px 8px rgba(0,0,0,0.3)',
      }}>
        {timeStr.toLowerCase()}
      </div>
      <div style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.85)',
        marginTop: '2px',
        textShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}>
        {dayStr}
      </div>
    </div>
  );
}

function ActivityList({ city }: { city: string }) {
  return (
    <div style={{ padding: '0' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '8px',
        padding: '0 4px',
        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}>
        abdullahOS
      </div>

      {[{ title: city.toLowerCase(), detail: 'startup + school base' }, ...activityItems].map((item, i) => (
        <div
          key={item.title}
          style={{
            padding: '8px 6px',
            color: 'inherit',
            borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: '6px',
          }}
        >
          <div style={{
            fontSize: '10.5px',
            fontWeight: 600,
            marginBottom: '3px',
            color: '#74c0fc',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}>
            {item.title}
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.4,
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            {item.detail}
          </div>
        </div>
      ))}
    </div>
  );
}
