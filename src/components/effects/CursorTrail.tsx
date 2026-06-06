import { useEffect, useRef } from 'react';

interface TrailDot {
  x: number;
  y: number;
  life: number;
}

interface Props {
  dark?: boolean;
}

export default function CursorTrail({ dark = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailDot[]>([]);
  const posRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window && window.innerWidth <= 768) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY, active: true };
      trailRef.current.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (trailRef.current.length > 24) trailRef.current.shift();
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);

    let raf = 0;
    const core = dark ? 'rgba(255, 160, 60, 0.9)' : 'rgba(220, 110, 20, 0.85)';
    const glow = dark ? 'rgba(251, 146, 60, 0.4)' : 'rgba(234, 120, 40, 0.35)';

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const trail = trailRef.current;

      for (let i = 0; i < trail.length; i++) {
        const dot = trail[i];
        dot.life -= 0.04;
        if (dot.life <= 0) continue;

        const size = dot.life * 6;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(255, 160, 60, ${dot.life * 0.5})`
          : `rgba(220, 110, 20, ${dot.life * 0.4})`;
        ctx.fill();
      }

      trailRef.current = trail.filter(d => d.life > 0);

      if (posRef.current.active) {
        const { x, y } = posRef.current;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 18);
        grad.addColorStop(0, core);
        grad.addColorStop(0.4, glow);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        mixBlendMode: dark ? 'screen' : 'multiply',
      }}
    />
  );
}
