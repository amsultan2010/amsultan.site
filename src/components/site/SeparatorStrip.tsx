type SeparatorStripProps = {
  phrases?: string[];
  reverse?: boolean;
  style?: 'primary' | 'secondary';
  className?: string;
};

export function SeparatorStrip({
  phrases = ['tutoring', 'f1', 'quant', 'riyadh'],
  reverse = false,
  style = 'primary',
  className = '',
}: SeparatorStripProps) {
  const strip = Array.from({ length: 18 }, (_, i) => phrases[i % phrases.length]);

  return (
    <div
      className={`a-sep js-sep ${reverse ? 'a-sep--reverse' : ''} a-sep--${style} ${className}`}
      aria-hidden="true"
      data-intersect
    >
      <span className="a-sep__tri a-sep__tri--l" />
      <div className="a-sep__binaries vf-mono">
        {strip.map((word, i) => (
          <span className="a-sep__group" key={`${word}-${i}`}>
            <span className="a-sep__code js-sep-code">
              {[...word].map((ch, j) => (
                <span className="a-sep__char js-sep-char" data-ch={ch} key={`${ch}-${j}`}>
                  {ch}
                </span>
              ))}
            </span>
            <span className="a-sep__stripes">////////////////</span>
          </span>
        ))}
      </div>
      <span className="a-sep__tri a-sep__tri--r" />
    </div>
  );
}
