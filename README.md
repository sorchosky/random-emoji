# Emoji Pop

Tap anywhere and a random emoji pops up under your finger, holds for a couple of
seconds, and floats away. That's the whole app.

Built for a toddler on an iPad, in the spirit of [tinyfingers.net](https://tinyfingers.net):
one surface, one gesture, no menus, and no way to accidentally end up in Safari.

## What it does

- **Tap anywhere** → a random emoji appears exactly where you touched
- **Every finger counts** — ten fingers at once means ten emoji, each fading on
  its own schedule
- **A soft musical pop** per emoji, pitched from a pentatonic scale so a
  fistful of simultaneous taps lands as a chord instead of a mess
- **A light buzz** on devices that support vibration
- **Locked down** — no zoom, no pull-to-refresh, no long-press menus, and no
  browser chrome when launched from the home screen

## Running it

```bash
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest — emoji dataset invariants |
| `node scripts/verify-app.mjs` | Playwright end-to-end checks (needs `npm run preview` running) |

## Putting it on the iPad

Deploy to Vercel (`main` auto-deploys, every branch gets a preview URL), then on
the iPad: open the URL in Safari → Share → **Add to Home Screen**. Launching
from that icon is what removes the browser chrome — opening it in a normal
Safari tab still works, but she can tap her way out of it.

## Settings

Hold the **top-left corner for 2.5 seconds** to open the grown-up panel — sound
and vibration toggles, and that's it. It's a deliberate hold rather than a
button so a child doesn't find it by accident. A normal tap in that corner still
pops an emoji like anywhere else.

## Adding emoji

Add to the right category in `src/data/emoji.js`, then run `npm test`. The suite
enforces the two rules that keep emoji from rendering badly on an older iPad:
every entry must be a **single grapheme cluster** (no ZWJ sequences, skin-tone
modifiers, or flags) and **nothing newer than Unicode 12.0**. It also blocks the
obvious not-for-kids categories.

## Working on it

The build is organized as a ticket queue in [`docs/TICKETS.md`](docs/TICKETS.md).
`scripts/run-tickets.sh` reads that queue and drives Claude Code through the
unchecked tickets unattended — one at a time, gated on build and tests, with a
commit per ticket. A ticket that fails the gate stops the run with its box still
unchecked, so nothing half-finished gets marked done.

```bash
scripts/new-feature.sh <slug>     # worktree + branch, cut from latest main
cd ../random-emoji-worktrees/<slug>
npm install
scripts/run-tickets.sh --dry-run  # show the next ticket's prompt, invoke nothing
scripts/run-tickets.sh            # run the queue
```

Context for the agent lives in [`docs/PRD.md`](docs/PRD.md),
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and
[`docs/DECISIONS.md`](docs/DECISIONS.md). `CLAUDE.md` is the agent contract —
what it can do without asking, and where it has to stop and check in.
