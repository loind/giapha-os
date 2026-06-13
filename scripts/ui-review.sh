#!/bin/bash
# UI/UX Screenshot Capture Workflow
#
# Usage:
#   ./scripts/ui-review.sh                    # Public pages only
#   AUTH_EMAIL=x AUTH_PASSWORD=y ./scripts/ui-review.sh  # With auth
#   PORT=3005 ./scripts/ui-review.sh          # Custom port
#
# Steps:
#   1. Find available port (default 3003)
#   2. Start Next.js dev server with Supabase placeholders
#   3. Wait for server to be ready
#   4. Run Playwright screenshots (mobile/tablet/desktop)
#   5. Report results and next steps

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCREENSHOT_DIR="$PROJECT_DIR/e2e/screenshots"
PORT="${PORT:-3003}"
BASE_URL="${BASE_URL:-http://localhost:$PORT}"

cd "$PROJECT_DIR"

# Load .env.local if exists
if [ -f "$PROJECT_DIR/.env.local" ]; then
  set -a
  source "$PROJECT_DIR/.env.local"
  set +a
fi

# ─── Step 1: Check if Supabase is configured ─────────────────────
echo "🔍 Step 1: Checking environment..."
HAS_SUPABASE=false
if [ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ] && [ -n "${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:-}" ]; then
  HAS_SUPABASE=true
  echo "   ✓ Supabase env vars found"
else
  echo "   ⚠ Supabase not configured — using placeholder (pages render without data)"
fi

# ─── Step 2: Check port availability ──────────────────────────────
echo ""
echo " Step 2: Checking port $PORT..."

if lsof -i ":$PORT" > /dev/null 2>&1; then
  echo "   ⚠ Port $PORT is in use. Trying to use existing server..."
  if curl -sf "$BASE_URL" | grep -q "Gia Ph"; then
    echo "   ✓ Gia Phả OS detected on port $PORT"
    SERVER_PID=""
  else
    echo "   ✗ Port $PORT is running a different app. Use PORT=xxxx to override."
    exit 1
  fi
else
  echo "   Port $PORT is free"
  SERVER_PID="NEED_START"
fi

# ── Step 3: Start dev server if needed ──────────────────────────
echo ""
echo "🚀 Step 3: Starting dev server..."

if [ "${SERVER_PID:-}" = "NEED_START" ]; then
  echo "   Starting Next.js dev server on port $PORT..."

  ENV_VARS=""
  if [ "$HAS_SUPABASE" = "false" ]; then
    ENV_VARS="NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=placeholder-key"
  fi

  eval $ENV_VARS npm run dev -- -p $PORT > /tmp/giapha-dev.log 2>&1 &
  SERVER_PID=$!
  echo "   PID: $SERVER_PID"

  # Wait for server (max 30s)
  for i in $(seq 1 30); do
    if curl -sf "$BASE_URL" | grep -q "Gia Ph"; then
      echo "   ✓ Server ready after ${i}s"
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo "   ✗ Server failed to start. Check /tmp/giapha-dev.log"
      cat /tmp/giapha-dev.log | tail -20
      kill $SERVER_PID 2>/dev/null || true
      exit 1
    fi
    sleep 1
  done
else
  echo "   ✓ Using existing server"
fi

# ─── Step 4: Clean and capture screenshots ────────────────────────
echo ""
echo "🧹 Step 4: Cleaning old screenshots..."
rm -f "$SCREENSHOT_DIR"/*.png 2>/dev/null || true
mkdir -p "$SCREENSHOT_DIR"

echo ""
echo "📸 Step 5: Capturing screenshots..."
echo "   Base URL: $BASE_URL"
echo "   Viewports: mobile (375×812), tablet (768×1024), desktop (1440×900)"
echo "   Scale: 2x (Retina)"
echo ""

AUTH_PREFIX=""
if [ -n "${AUTH_EMAIL:-}" ] && [ -n "${AUTH_PASSWORD:-}" ]; then
  AUTH_PREFIX="AUTH_EMAIL=$AUTH_EMAIL AUTH_PASSWORD=$AUTH_PASSWORD"
  echo "   Auth: enabled ($AUTH_EMAIL)"
else
  echo "   Auth: disabled (dashboard pages will be skipped)"
fi

eval $AUTH_PREFIX BASE_URL="$BASE_URL" npx playwright test --config=playwright.config.ts 2>&1 || true

# ─── Step 6: Report results ──────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "📊 Results:"
echo "═══════════════════════════════════════════════════════"

if [ -d "$SCREENSHOT_DIR" ]; then
  COUNT=$(find "$SCREENSHOT_DIR" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COUNT" -gt 0 ]; then
    echo ""
    echo "   Public pages:"
    for page in landing login about setup; do
      if [ -f "$SCREENSHOT_DIR/${page}-desktop.png" ]; then
        SIZE=$(du -h "$SCREENSHOT_DIR/${page}-desktop.png" | cut -f1)
        echo "     $page/  ($SIZE desktop)"
      fi
    done
    echo ""
    if [ "$COUNT" -gt 12 ]; then
      echo "   Dashboard pages:"
      for f in "$SCREENSHOT_DIR"/dashboard*.png; do
        [ -f "$f" ] && echo "     $(basename $f)  ($(du -h "$f" | cut -f1))"
      done
    fi
    echo ""
    echo "   Total: $COUNT screenshots"
  else
    echo "    No screenshots captured"
  fi
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📋 Next Steps:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "   1. View screenshots:"
echo "      open $SCREENSHOT_DIR/"
echo ""
echo "   2. Analyze with UI/UX skill:"
echo "      Read screenshots → analyze against checklist"
echo ""
echo "   3. Review plan:"
echo "      cat plans/ui-review-$(date +%Y-%m-%d).md"
echo ""
echo "   4. Implement improvements"
echo ""

# ─── Cleanup ─────────────────────────────────────────────────────
if [ -n "${SERVER_PID:-}" ] && [ "$SERVER_PID" != "NEED_START" ] && [ "$SERVER_PID" != "" ]; then
  echo ""
  echo "💡 Dev server running on port $PORT (PID: $SERVER_PID)"
  echo "   Stop with: kill $SERVER_PID  or  kill \$(lsof -t -i:$PORT)"
fi
