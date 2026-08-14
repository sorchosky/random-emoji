# CLAUDE.md — Agent Contract

This file governs how Claude Code operates in this repo. Read it in full before
touching any code. It is copied verbatim from the vibe-scaffold template —
project-specific detail lives in `docs/PRD.md`, `docs/ARCHITECTURE.md`, and
`docs/DECISIONS.md`, not here.

## Project identity

- **Name:** Emoji Pop
- **One-liner:** Tap anywhere and a random emoji pops up, holds for a couple of
  seconds, and fades away — a toddler toy for the iPad.
- **Stack:** React + Vite, deployed on Vercel (default — override in ARCHITECTURE.md if this project differs)
- **PRD:** `docs/PRD.md`
- **Architecture / decisions:** `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

## How to start a session

1. Read `docs/PRD.md` and `docs/ARCHITECTURE.md` in full.
2. Read `docs/DECISIONS.md` for anything already settled — don't re-litigate it.
3. Restate the plan for the current feature/phase in 3-5 bullets before writing code.
   **Wait for a go-ahead on this restatement before building.** This is the one
   mandatory check-in — everything after it runs autonomously until the next
   trigger below.

## Autonomy contract

**Do without asking:**
- Implement anything explicitly scoped in `docs/PRD.md`
- Install/remove npm dependencies that stay within the stack already declared in ARCHITECTURE.md
- Create commits and push to the current feature branch
- Open a PR from a feature branch into `main`
- Write/update tests for code you write
- Update `docs/DECISIONS.md` when you make a judgment call worth remembering

**Stop and ask first:**
- Merging a PR into `main`
- Anything that touches production data or a live deploy
- Adding a paid API, service, or anything with a cost attached — surface the cost before doing anything, no exceptions
- Any change that expands scope beyond what's in `docs/PRD.md`
- Deleting data, dropping a table/collection, or force-pushing
- Introducing a new major dependency/framework not already in ARCHITECTURE.md

## Check-in cadence

Beyond the mandatory plan check-in above, check in when:
- A PRD feature/milestone is complete and ready for review
- You've attempted the same blocker two different ways and neither worked
- Something in the PRD is ambiguous enough that two reasonable interpretations
  would produce different code
- You're about to open a PR to `main`

Otherwise, keep working. Don't check in just to narrate progress — a working
diff and a clear commit message says more than a status update.

## Git workflow

- `main` is production. Vercel auto-deploys `main` to prod and gives every
  branch/PR a preview URL — no extra config needed, just keep the repo connected.
- One branch per feature: `feature/<slug>`, cut from latest `main`.
- One **worktree** per feature, created with `scripts/new-feature.sh <slug>`,
  living as a sibling directory (`../<repo>-worktrees/<slug>`). This lets
  multiple features get worked in parallel without stashing.
- Squash-merge feature branches into `main` via PR. Delete the branch and
  remove the worktree after merge (`git worktree remove`).
- Commit messages: imperative mood, no filler ("add score validation" not
  "this commit adds some validation logic for scores"). Reference the PRD
  section a commit addresses when it's not obvious.

## Quality bar before calling something done

- No console errors/warnings in the browser
- Responsive at mobile + desktop widths at minimum
- Keyboard-navigable, visible focus states, obvious touch targets (44px min)
- No hardcoded secrets — use `.env.local`, confirm it's gitignored
- Update `docs/DECISIONS.md` if you made a call the PRD didn't specify

## Voice for anything user-facing in the PR/commit trail

Direct, no filler, no "great progress!" energy. State what changed and why in
as few words as it takes.
