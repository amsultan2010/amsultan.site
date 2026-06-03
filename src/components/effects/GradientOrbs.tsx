import { motion } from 'framer-motion';

interface Props {
  dark?: boolean;
  zIndex?: number;
}

export default function GradientOrbs({ dark = false, zIndex = 0 }: Props) {
  const orbs = [
    { color: dark ? 'rgba(139, 92, 246, 0.35)' : 'rgba(139, 92, 246, 0.2)', size: '55vw', top: '-15%', left: '-10%', duration: 22 },
    { color: dark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.12)', size: '45vw', top: '40%', left: '55%', duration: 28 },
    { color: dark ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.14)', size: '38vw', top: '65%', left: '-5%', duration: 25 },
    { color: dark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.08)', size: '30vw', top: '10%', left: '70%', duration: 20 },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex,
      }}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -35, 25, -15, 0],
            scale: [1, 1.08, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
