import { LEADERSHIP, SKILL_GROUPS } from '@/data/proof';

export function Proof() {
  return (
    <section id="proof" className="s-proof js-proof" aria-label="proof and leadership">
      <div className="s-proof__block">
        <p className="vf-mono s-proof__block-label">leadership</p>
        <div className="vf-rule js-rule" />
        <ul className="s-proof__lead">
          {LEADERSHIP.map((item) => (
            <li className="s-proof__lead-item js-proof-lead" key={`${item.org}-${item.title}`}>
              <div className="s-proof__lead-meta vf-mono">
                <span>{item.org}</span>
                <span aria-hidden="true">·</span>
                <span>{item.period}</span>
              </div>
              <h3 className="s-proof__lead-title vf-display">{item.title}</h3>
              <p className="s-proof__lead-body vf-serif">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="s-proof__block">
        <p className="vf-mono s-proof__block-label">stack</p>
        <div className="vf-rule js-rule" />
        <div className="s-proof__skills">
          {SKILL_GROUPS.map((group) => (
            <div className="s-proof__skill js-proof-skill" key={group.label}>
              <p className="s-proof__skill-label vf-mono">{group.label}</p>
              <ul className="s-proof__skill-list vf-serif">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
