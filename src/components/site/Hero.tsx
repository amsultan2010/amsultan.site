import { SeparatorStrip } from './SeparatorStrip';

export function Hero() {
  return (
    <section className="s-hero" aria-label="introduction">
      <div className="s-hero__meta vf-mono">
        <span>student builder</span>
        <span aria-hidden="true">·</span>
        <span>riyadh</span>
        <span aria-hidden="true">·</span>
        <span className="js-clock">--:--</span>
      </div>

      <SeparatorStrip phrases={['abd', 'ullah', 'sul', 'tan']} />

      <div className="s-hero__stage js-hero-stage">
        <h1 className="s-hero__title vf-display js-hero-title">
          <span className="s-hero__line js-hero-line">abdullah</span>
          <span className="s-hero__star js-hero-star" aria-hidden="true">
            ★
          </span>
          <span className="s-hero__line js-hero-line">sultan</span>
        </h1>
      </div>

      <SeparatorStrip phrases={['tutor', 'f1', 'quant', 'build']} reverse />

      <p className="s-hero__lede vf-serif js-fade-up">
        tutoring, f1 media, and quant tools. open to coffee chats.
      </p>

      <div className="s-hero__actions vf-mono js-fade-up">
        <a
          href="mailto:abdullahmsultan1@gmail.com"
          className="s-hero__btn s-hero__btn--solid js-magnetic js-scramble"
        >
          grab coffee
        </a>
        <a href="#work" className="s-hero__btn js-magnetic js-scramble">
          see work
        </a>
      </div>

      <p className="s-hero__scroll vf-mono js-scroll-cue" aria-hidden="true">
        scroll
      </p>
    </section>
  );
}
