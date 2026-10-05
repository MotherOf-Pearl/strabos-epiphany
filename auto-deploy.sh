#!/usr/bin/env bash
# Cron-driven auto-deploy for Strabo's Epiphany.
# Mirrors boohaw-tcg: pull if there's new, restart container only on change.
set -euo pipefail

REPO_DIR="/mnt/user/appdata/strabos-epiphany"
CONTAINER="strabos-epiphany"
LOG="$REPO_DIR/auto-deploy.log"

cd "$REPO_DIR"

BEFORE=$(git rev-parse HEAD)
git fetch --quiet origin main
AFTER=$(git rev-parse origin/main)

if [[ "$BEFORE" == "$AFTER" ]]; then
  exit 0
fi

{
  echo "[$(date -Iseconds)] updating $BEFORE -> $AFTER"
  git reset --hard origin/main
  docker restart "$CONTAINER"
  echo "[$(date -Iseconds)] done"
} >> "$LOG" 2>&1
