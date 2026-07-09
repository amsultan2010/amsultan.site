import { VoltageExperience } from '@/components/site/VoltageExperience';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteScrollbar } from '@/components/site/SiteScrollbar';
import { Hero } from '@/components/site/Hero';
import { SeparatorStrip } from '@/components/site/SeparatorStrip';
import { StretchWord } from '@/components/site/StretchWord';
import { About } from '@/components/site/About';
import { Work } from '@/components/site/Work';
import { Proof } from '@/components/site/Proof';
import { Photos } from '@/components/site/Photos';
import { Contact } from '@/components/site/Contact';
import Script from 'next/script';

export default function HomePage() {
  return (
    <VoltageExperience>
      <Script id="vf-boot-gate" strategy="beforeInteractive">
        {`(function(){try{var t=window.matchMedia('(pointer:coarse)').matches||window.matchMedia('(hover:none)').matches||window.innerWidth<768;if(!t){document.documentElement.classList.add('is-scroll-blocked');}}catch(e){document.documentElement.classList.add('is-scroll-blocked');}})();`}
      </Script>
      <div className="site-progress js-progress" aria-hidden="true" />
      <div className="site-cursor js-cursor" aria-hidden="true">
        <span className="site-cursor__ring js-cursor-ring" />
        <span className="site-cursor__dot js-cursor-dot" />
      </div>
      <div className="site-noise js-noise" aria-hidden="true" />
      <div className="site-frame" aria-hidden="true" />

      <div className="site-terrain js-terrain" aria-hidden="true">
        <div className="site-terrain__fallback" />
        <canvas className="js-terrain-canvas" />
      </div>

      <div id="top" className="site-wrapper js-site-wrapper">
        <SiteHeader />
        <main>
          <Hero />
          <SeparatorStrip phrases={['about', 'riyadh', 'student', 'builder']} style="secondary" />
          <StretchWord word="about" />
          <About />
          <SeparatorStrip phrases={['tutoringbyabdullah', 'downforce', 'quantpy']} reverse />
          <StretchWord word="work" />
          <Work />
          <SeparatorStrip phrases={['x-combinator', 'debate', 'tennis', 'stack']} style="secondary" />
          <StretchWord word="proof" />
          <Proof />
          <SeparatorStrip phrases={['photos', 'f1', 'tennis', 'weightlifting']} reverse />
          <StretchWord word="photos" />
          <Photos />
          <SeparatorStrip phrases={['email', 'github', 'linkedin', 'resume']} style="secondary" />
          <StretchWord word="talk" />
          <Contact />
        </main>
        <SiteFooter />
      </div>

      <div className="site-intro js-intro">
        <div className="site-intro__panel js-intro-panel" aria-hidden="true" />
        <div className="site-intro__border site-intro__border--top js-intro-border-t" />
        <div className="site-intro__border site-intro__border--left js-intro-border-l" />
        <div className="site-intro__border site-intro__border--right js-intro-border-r" />
        <p className="site-intro__mark js-intro-mark">abdullah sultan</p>
        <button type="button" className="site-intro__skip js-intro-skip">
          skip
        </button>
      </div>
      <SiteScrollbar />
      <div className="site-contrast-mask js-contrast-mask" aria-hidden="true" />
    </VoltageExperience>
  );
}
