import { useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  onClick?: () => void;
  as?: 'a' | 'button' | 'div';
  target?: string;
  rel?: string;
}

export default function TiltCard({
  children,
  className,
  style,
  href,
  onClick,
  as = 'div',
  target,
  rel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = as === 'a' ? motion.a : as === 'button' ? motion.button : motion.div;

  return (
    <Component
      ref={ref as React.Ref<HTMLDivElement>}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        perspective: 800,
        rotateX,
        rotateY,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(139,92,246,0.08) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        className="tilt-shine"
      />
      {children}
      <style>{`
        .tilt-shine { opacity: 0; }
        *:hover > .tilt-shine, *:focus-within > .tilt-shine { opacity: 1; }
      `}</style>
    </Component>
  );
}
