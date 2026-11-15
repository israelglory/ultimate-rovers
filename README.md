# Ultimate Rovers: design handoff

Everything needed to build the Ultimate Rovers website.

## Contents

| Folder or file | What it is |
| --- | --- |
| `CLAUDE_CODE_PROMPT.md` | The kickoff prompt for Claude Code |
| `docs/DESIGN_SPEC.md` | Routes, components, content model, behaviour, quality targets |
| `docs/DESIGN_FORMAT.md` | How to read the design files |
| `design/` | Source of all 11 page designs |
| `preview/` | The same pages, clickable in a browser. Start at `preview/index.html` |
| `tokens/` | Design tokens as JSON and CSS variables |
| `assets/` | Crest (transparent PNG and the original) |

## Pages

Home, Home on mobile, Fixtures and results, Match centre (upcoming, live and full time), Squad, Player profile, Stakeholders, About, News, Contact, Design system.

## Using it with Claude Code

1. Create an empty repo and copy this folder into its root as `ultimate-rovers-handoff/`.
2. Open Claude Code in the repo.
3. Paste the contents of `CLAUDE_CODE_PROMPT.md` as your first message.
4. Review the `PLAN.md` it writes before letting it build.

## Previewing

From this folder run `npx serve .` and open the `/preview/` path it prints, or open `preview/index.html` directly.

All bracketed text, `X : X` scores and `--` stats are placeholders for real club content.
