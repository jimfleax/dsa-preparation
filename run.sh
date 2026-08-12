#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

PRETTY=0
LINT=0
INSTALL_DEPS=0

for arg in "$@"; do
  if [ "$arg" = "--pretty" ] || [ "$arg" = "-p" ]; then
    PRETTY=1
  elif [ "$arg" = "--lint" ] || [ "$arg" = "-l" ]; then
    LINT=1
  elif [ "$arg" = "--install" ] || [ "$arg" = "-i" ]; then
    INSTALL_DEPS=1
  fi
done

log() {
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

cleanup() {
  log "Shutting down servers..."
  if command -v kill >/dev/null 2>&1; then
    jobs -pr | xargs -r kill 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

install_deps() {
  local dir="$1"
  local name="$2"

  if [ ! -d "$dir" ]; then
    log "ERROR: $name directory not found at $dir"
    exit 1
  fi
  if [ ! -f "$dir/package.json" ]; then
    log "ERROR: no package.json in $dir"
    exit 1
  fi

  log "Installing $name dependencies..."
  (cd "$dir" && npm install)
}

if [ "$INSTALL_DEPS" = 1 ]; then
  log "Installing dependencies..."
  install_deps "$BACKEND_DIR" "backend"
  install_deps "$FRONTEND_DIR" "frontend"
fi

if [ "$PRETTY" = 1 ]; then
  log "Prettifying directories..."
  
  log "Prettifying frontend..."
  (cd "$FRONTEND_DIR" && npx prettier --write .)
  
  log "Prettifying backend..."
  (cd "$BACKEND_DIR" && npx prettier --write .)
fi

if [ "$LINT" = 1 ]; then
  log "Linting directories..."
  
  log "Linting frontend..."
  (cd "$FRONTEND_DIR" && npm run lint)
  
  log "Linting backend..."
  (cd "$BACKEND_DIR" && npm run lint)
fi

log "Starting backend and frontend..."

(
  cd "$BACKEND_DIR"
  npm run dev
) &
BACKEND_PID=$!

(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID"
