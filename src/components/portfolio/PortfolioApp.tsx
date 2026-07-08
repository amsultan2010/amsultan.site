import { useEffect, useState } from 'react';
import { ThemeProvider, useTheme, themeColors } from './PageShell';
import { SiteHeader, SiteFooter } from './SiteChrome';
import Hero from './Hero';
import WorkStages from './WorkStages';
import About from './About';
import Contact from './Contact';
import '../../styles/global.css';

function PortfolioInner() {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, window.scrollY / (max * 0.35)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.backgroundColor = t.bg;
    document.body.style.backgroundColor = t.bg;
    document.body.style.color = t.text;
  }, [t.bg, t.text]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.text,
        fontFamily: 'var(--td-font-body)',
      }}
    >
      <SiteHeader />
      <main>
        <Hero scrollProgress={scrollProgress} />
        <WorkStages />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}

export default function PortfolioApp() {
  return (
    <ThemeProvider>
      <PortfolioInner />
    </ThemeProvider>
  );
}
