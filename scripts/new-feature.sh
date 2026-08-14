#!/usr/bin/env bash
# Create a dedicated git worktree + branch for a new feature.
# Usage: scripts/new-feature.sh <feature-slug>
# Example: scripts/new-feature.sh score-correction-loop

set -euo pipefail

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Usage: scripts/new-feature.sh <feature-slug>"
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"
WORKTREE_DIR="$(dirname "$REPO_ROOT")/${REPO_NAME}-worktrees/${SLUG}"
BRANCH="feature/${SLUG}"

echo "Fetching latest main..."
git -C "$REPO_ROOT" fetch origin main

echo "Creating worktree at $WORKTREE_DIR on branch $BRANCH..."
git -C "$REPO_ROOT" worktree add -b "$BRANCH" "$WORKTREE_DIR" origin/main

# Carry over local env vars so Claude Code has API keys etc. in the worktree
if [ -f "$REPO_ROOT/.env.local" ]; then
  cp "$REPO_ROOT/.env.local" "$WORKTREE_DIR/.env.local"
  echo "Copied .env.local into worktree."
fi

echo ""
echo "Worktree ready. Next steps:"
echo "  cd $WORKTREE_DIR"
echo "  npm install"
echo "  claude    # start Claude Code in this worktree"
