type StretchWordProps = {
  word: string;
  className?: string;
};

export function StretchWord({ word, className = '' }: StretchWordProps) {
  const letters = [...word.toLowerCase()];

  return (
    <section className={`s-stretch js-stretch ${className}`} aria-hidden="true">
      <div className="s-stretch__track js-stretch-track">
        {letters.map((ch, i) => (
          <span className="s-stretch__letter js-stretch-letter" key={`${ch}-${i}`}>
            {ch === ' ' ? '\u00a0' : ch}
          </span>
        ))}
      </div>
    </section>
  );
}
