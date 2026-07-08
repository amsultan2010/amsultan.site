import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type AsciiDeskProps = {
  scrollProgress?: number;
  className?: string;
  height?: number | string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useAsciiTexture() {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const paint = (ascii: string) => {
      ctx.fillStyle = '#0e1116';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#f2ebe0';
      ctx.font = '10px "JetBrains Mono", Menlo, monospace';
      ctx.textBaseline = 'top';
      const lines = ascii.split('\n').slice(0, 48);
      const step = 512 / Math.max(lines.length, 1);
      lines.forEach((line, i) => {
        ctx.fillText(line.slice(0, 80), 8, i * step);
      });
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      if (!cancelled) setTexture(tex);
    };

    fetch('/images/myascii.txt')
      .then((r) => r.text())
      .then((text) => paint(text.trimEnd() || 'ABDULLAH'))
      .catch(() => paint('ABDULLAH\nSULTAN\nTELEMETRY'));

    return () => {
      cancelled = true;
    };
  }, []);

  return texture;
}

function DeskInstrument({
  scrollProgress = 0,
  reduced,
}: {
  scrollProgress: number;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const texture = useAsciiTexture();
  const drag = useRef({ x: 0, y: 0, active: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
    };
    const onUp = () => {
      drag.current.active = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.x += (e.clientX - drag.current.lastX) * 0.005;
      drag.current.y += (e.clientY - drag.current.lastY) * 0.003;
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
    };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    const el = document.getElementById('ascii-desk-canvas');
    el?.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      el?.removeEventListener('pointerdown', onDown);
    };
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const baseY = scrollProgress * Math.PI * 1.2 + drag.current.x;
    const baseX = 0.35 + scrollProgress * 0.4 + drag.current.y;
    if (reduced) {
      group.current.rotation.set(0.4, baseY * 0.2, 0);
    } else {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, baseY + Math.sin(t * 0.3) * 0.08, 0.08);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, baseX + Math.cos(t * 0.25) * 0.05, 0.08);
    }
  });

  return (
    <group ref={group}>
      {/* Core dial / instrument body */}
      <mesh castShadow>
        <cylinderGeometry args={[1.15, 1.25, 0.35, 48]} />
        <meshStandardMaterial
          map={texture ?? undefined}
          color={texture ? '#ffffff' : '#f2ebe0'}
          roughness={0.55}
          metalness={0.15}
          emissive="#ff4d2e"
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* Bezel ring */}
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.06, 12, 64]} />
        <meshStandardMaterial color="#ff4d2e" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Inner phosphor disc */}
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 48]} />
        <meshStandardMaterial
          color="#0e1116"
          emissive="#7dffb3"
          emissiveIntensity={0.35}
          roughness={0.4}
        />
      </mesh>
      {/* Needle */}
      <mesh position={[0, 0.28, 0]} rotation={[0, 0, -0.6 + scrollProgress]}>
        <boxGeometry args={[0.04, 0.02, 0.7]} />
        <meshStandardMaterial color="#ff4d2e" emissive="#ff4d2e" emissiveIntensity={0.4} />
      </mesh>
      {/* Side plates with ASCII feel */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[2.4, 0.18, 2.4]} />
        <meshStandardMaterial color="#1a1f28" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
}

function StaticFallback() {
  const [ascii, setAscii] = useState('');
  useEffect(() => {
    fetch('/images/myascii.txt')
      .then((r) => r.text())
      .then((t) => setAscii(t.trimEnd().split('\n').slice(0, 28).join('\n')))
      .catch(() => setAscii('ABDULLAH\nTELEMETRY'));
  }, []);

  return (
    <pre
      aria-hidden
      style={{
        margin: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        color: 'var(--td-dust, #c4b8a5)',
        fontFamily: 'var(--td-font-mono)',
        fontSize: 7,
        lineHeight: 1.05,
        opacity: 0.85,
        userSelect: 'none',
        padding: 12,
        background: 'var(--td-surface)',
        border: '1px solid var(--td-border)',
      }}
    >
      {ascii || 'loading signal…'}
    </pre>
  );
}

export default function AsciiDesk({ scrollProgress = 0, className, height = '100%' }: AsciiDeskProps) {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(true);
  const [webglOk, setWebglOk] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduced || !webglOk) {
    return (
      <div ref={wrapRef} className={className} style={{ width: '100%', height, minHeight: 280 }}>
        <StaticFallback />
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      id="ascii-desk-canvas"
      className={className}
      style={{
        width: '100%',
        height,
        minHeight: 280,
        cursor: 'grab',
        touchAction: 'none',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(255,77,46,0.12), transparent 60%)',
      }}
      aria-label="Interactive ASCII desk instrument — drag to orbit"
    >
      {visible && (
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 1.6, 3.4], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['transparent']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 3]} intensity={1.1} color="#f2ebe0" />
          <pointLight position={[-2, 1, 2]} intensity={0.6} color="#ff4d2e" />
          <Suspense fallback={null}>
            <DeskInstrument scrollProgress={scrollProgress} reduced={reduced} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
