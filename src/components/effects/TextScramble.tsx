import { useEffect, useState } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
}

export default function TextScramble({ text, className, style, delay = 0, duration = 1200 }: Props) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text);
      setDone(true);
      return;
    }

    let frame = 0;
    const totalFrames = Math.round(duration / 32);
    let raf = 0;

    const timeout = setTimeout(() => {
      const tick = () => {
        frame++;
        const progress = frame / totalFrames;
        const revealed = Math.floor(progress * text.length);

        const scrambled = text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < revealed) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');

        setDisplay(scrambled);

        if (frame < totalFrames) {
          raf = requestAnimationFrame(tick);
        } else {
          setDisplay(text);
          setDone(true);
        }
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [text, delay, duration]);

  return (
    <span
      className={className}
      style={{
        ...style,
        ...(done ? {} : { fontVariantNumeric: 'tabular-nums' }),
      }}
    >
      {display || '\u00A0'}
    </span>
  );
}
