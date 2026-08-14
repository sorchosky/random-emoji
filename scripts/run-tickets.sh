#!/usr/bin/env bash
#
# Drive Claude Code through the ticket queue in docs/TICKETS.md, unattended.
#
# For each unchecked ticket, in order: hand the ticket to Claude Code headlessly,
# gate the result on build + tests, commit it, and tick the box. A ticket that
# fails the gate stops the run with its box still unchecked, so the next run
# retries it rather than skipping past a half-finished change.
#
# Usage:
#   scripts/run-tickets.sh                 # run every unchecked ticket
#   scripts/run-tickets.sh --one           # run only the next unchecked ticket
#   scripts/run-tickets.sh --from T-05     # start at a specific ticket
#   scripts/run-tickets.sh --dry-run       # show the prompt, invoke nothing
#   scripts/run-tickets.sh --model sonnet  # override the model
#
# Meant to run inside a feature worktree — make one with:
#   scripts/new-feature.sh <slug>

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

TICKETS_FILE="docs/TICKETS.md"
LOG_DIR=".tickets-log"

ONLY_ONE=false
DRY_RUN=false
START_AT=""
MODEL=""

while [ $# -gt 0 ]; do
  case "$1" in
    --one)      ONLY_ONE=true; shift ;;
    --dry-run)  DRY_RUN=true; shift ;;
    --from)     START_AT="${2:-}"; shift 2 ;;
    --model)    MODEL="${2:-}"; shift 2 ;;
    -h|--help)  sed -n '3,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)          echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------

die() { echo "error: $*" >&2; exit 1; }

[ -f "$TICKETS_FILE" ] || die "$TICKETS_FILE not found"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" = "main" ]; then
  die "refusing to run on main — cut a worktree first: scripts/new-feature.sh <slug>"
fi

if ! command -v claude >/dev/null 2>&1; then
  die "the 'claude' CLI is not on PATH"
fi

mkdir -p "$LOG_DIR"

# First unchecked ticket ID in queue order, honoring --from.
next_ticket_id() {
  awk -v start="$START_AT" '
    /^- \[ \] T-[0-9]+/ {
      match($0, /T-[0-9]+/)
      id = substr($0, RSTART, RLENGTH)
      if (start != "" && id < start) next
      print id
      exit
    }
  ' "$TICKETS_FILE"
}

ticket_title() {
  awk -v id="$1" '
    $0 ~ "^## " id " " { sub("^## " id "[^A-Za-z0-9]*", ""); print; exit }
  ' "$TICKETS_FILE"
}

# The ticket body: everything between its heading and the next --- rule.
ticket_body() {
  awk -v id="$1" '
    $0 ~ "^## " id " " { capture = 1 }
    capture && /^---$/ { exit }
    capture { print }
  ' "$TICKETS_FILE"
}

build_prompt() {
  local id="$1"
  cat <<PROMPT
You are implementing a single ticket in the Emoji Pop repo.

Before writing code, read CLAUDE.md, docs/PRD.md, and docs/ARCHITECTURE.md in
full, and read docs/DECISIONS.md so you do not re-litigate anything already
settled.

Implement EXACTLY the ticket below — nothing from any other ticket, and nothing
beyond its stated scope. If the ticket is ambiguous enough that two readings
would produce materially different code, pick the reading most consistent with
docs/PRD.md and append an entry to docs/DECISIONS.md explaining the call.

Match the surrounding code's style, naming, and comment density. Meet the
quality bar in CLAUDE.md: no console errors or warnings, responsive at mobile
and desktop widths, keyboard-navigable with visible focus, 44px minimum touch
targets, no hardcoded secrets.

Do not commit — the runner handles commits and the build/test gate.

$(ticket_body "$id")
PROMPT
}

run_gate() {
  echo "  gate: npm run build"
  npm run build >/dev/null 2>&1 || return 1
  if [ -d src ] && ls src/**/*.test.js >/dev/null 2>&1 || ls src/*/*.test.js >/dev/null 2>&1; then
    echo "  gate: tests"
    npx vitest run >/dev/null 2>&1 || return 1
  fi
  return 0
}

tick_box() {
  local id="$1"
  # BSD and GNU sed disagree about -i, so write through a temp file instead.
  local tmp
  tmp="$(mktemp)"
  sed "s/^- \[ \] ${id} /- [x] ${id} /" "$TICKETS_FILE" > "$tmp"
  mv "$tmp" "$TICKETS_FILE"
}

# ---------------------------------------------------------------------------

echo "Ticket runner — branch $BRANCH"

while true; do
  ID="$(next_ticket_id)"
  if [ -z "$ID" ]; then
    echo "No unchecked tickets left. Done."
    break
  fi

  TITLE="$(ticket_title "$ID")"
  echo ""
  echo "▶ $ID — $TITLE"

  PROMPT="$(build_prompt "$ID")"

  if [ "$DRY_RUN" = true ]; then
    echo "--- prompt (dry run, nothing invoked) ---"
    echo "$PROMPT"
    echo "--- end prompt ---"
    break
  fi

  CLAUDE_ARGS=(
    -p "$PROMPT"
    --permission-mode acceptEdits
    --allowedTools "Edit" "Write" "Read" "Glob" "Grep" "Bash(npm *)" "Bash(npx *)"
    --output-format json
  )
  [ -n "$MODEL" ] && CLAUDE_ARGS+=(--model "$MODEL")

  if ! claude "${CLAUDE_ARGS[@]}" > "$LOG_DIR/$ID.json" 2>"$LOG_DIR/$ID.err"; then
    echo "  Claude Code exited non-zero. See $LOG_DIR/$ID.err"
    exit 1
  fi

  if ! run_gate; then
    echo ""
    echo "  ✗ $ID failed the gate — box left unchecked, changes left in the tree."
    echo "    Reproduce with: npm run build && npx vitest run"
    exit 1
  fi

  git add -A
  if git diff --cached --quiet; then
    echo "  ! $ID produced no changes — stopping rather than ticking it off."
    exit 1
  fi
  git commit -q -m "$ID: $TITLE"

  tick_box "$ID"
  git add "$TICKETS_FILE"
  git commit -q -m "Mark $ID complete"

  echo "  ✓ $ID committed"

  [ "$ONLY_ONE" = true ] && break
done
