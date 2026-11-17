# abdullahsultan.tech

Agent instructions for this repo. Visual design is in `DESIGN.md` and nowhere else. Repo notes are in `CLAUDE.md`.

## UI work: Impeccable is required

Hard requirements for any change to a file that renders or styles the interface. Skipping a step is a failed task. The same rules are in `.cursor/rules/design.mdc`.

1. Before touching a UI file, read `.cursor/skills/impeccable/SKILL.md` in full and follow it. Run its context step (`.cursor/skills/impeccable/scripts/impeccable context`), which loads `PRODUCT.md` and `DESIGN.md`. Read `reference/craft-floor.md` before the first edit.
2. `DESIGN.md` is the only source of visual truth. Other files do not set colours, type, spacing, radius, depth, or motion. A design change updates DESIGN.md in the same PR.
3. Run `/impeccable critique` before any polish pass, then the command that fits the task.
4. Before the PR: the Impeccable finish review, `npx -y impeccable detect` on the changed UI files, the web-design-guidelines review (`.agents/skills/web-design-guidelines`), and `.cursor/skills/ship-check` for anything public.
5. The PR body carries a filled `## Impeccable` section (see `.github/pull_request_template.md`): commands run, critique summary, detector and finish-review results. The `impeccable-check` workflow, where installed, fails UI PRs without it.

Installed skills: `.cursor/skills/impeccable`, `.cursor/agents/impeccable-*`, `.cursor/skills/ship-check`, `.agents/skills/web-design-guidelines`, `.agents/skills/emil-design-eng`, `.agents/skills/animation-vocabulary`.
