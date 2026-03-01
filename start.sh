#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$ROOT_DIR/api"
WEB_DIR="$ROOT_DIR/web"

# ── Generate a shared API key ─────────────────────────────────────────────────
API_KEY="eqm-$(openssl rand -hex 16)"
echo "Generated API key: $API_KEY"

# ── Setup API ─────────────────────────────────────────────────────────────────
echo ""
echo "==> Setting up API (Python)..."

cd "$API_DIR"

if [ ! -d "venv" ]; then
  # Prefer a modern Python (3.12+); fall back to python3
  PYTHON=""
  for candidate in python3.13 python3.12 python3.11; do
    if command -v "$candidate" >/dev/null 2>&1; then
      PYTHON="$candidate"
      break
    fi
  done
  : "${PYTHON:=python3}"
  echo "    Using $($PYTHON --version)"
  "$PYTHON" -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

cat > .env <<EOF
EQUAMOTION_API_KEY="$API_KEY"
EOF

echo "    API .env configured"

# ── Setup Web ─────────────────────────────────────────────────────────────────
echo ""
echo "==> Setting up Web (Next.js)..."

cd "$WEB_DIR"

if [ -f pnpm-lock.yaml ]; then
  command -v pnpm >/dev/null 2>&1 || npm install -g pnpm
  pnpm install
else
  npm install
fi

cat > .env.local <<EOF
VIDEO_API_URL=http://localhost:8000
VIDEO_API_KEY=$API_KEY
EOF

echo "    Web .env.local configured"

# ── Start both services ──────────────────────────────────────────────────────
echo ""
echo "==> Starting services..."
echo "    API  → http://localhost:8000"
echo "    Web  → http://localhost:3000"
echo ""

# Start API in background
cd "$API_DIR"
source venv/bin/activate
python main.py &
API_PID=$!

# Start Web in foreground
cd "$WEB_DIR"
npm run dev &
WEB_PID=$!

# Trap to clean up on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  kill "$API_PID" 2>/dev/null || true
  kill "$WEB_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait
