#!/bin/bash
# ─── Personalized Learning Assistant – Quick Start ───────────────────────────

set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     Personalized Learning Assistant – Setup          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌  Python 3 not found. Please install Python 3.9+"
  exit 1
fi

# ── Check Node
if ! command -v node &>/dev/null; then
  echo "❌  Node.js not found. Please install Node.js 18+"
  exit 1
fi

# ── Backend setup
echo "▶  Setting up Python backend..."
cd backend

if [ ! -f ".env" ]; then
  if [ -z "$GROQ_API_KEY" ]; then
    echo ""
    echo "⚠️  GROQ_API_KEY not set."
    echo "   Get a free key at: https://console.groq.com"
    echo "   Then run: export GROQ_API_KEY=your_key_here"
    echo ""
    read -p "Enter your Groq API key now (or press Enter to skip): " key
    if [ -n "$key" ]; then
      echo "GROQ_API_KEY=$key" > .env
      export GROQ_API_KEY="$key"
    fi
  else
    echo "GROQ_API_KEY=$GROQ_API_KEY" > .env
  fi
fi

if [ ! -d "venv" ]; then
  echo "▶  Creating Python virtual environment..."
  python3 -m venv venv
fi

echo "▶  Installing Python dependencies (this may take a few minutes)..."
source venv/bin/activate
pip install -q -r requirements.txt

echo "▶  Starting FastAPI backend on http://localhost:8000..."
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

cd ..

# ── Frontend setup
echo ""
echo "▶  Setting up React frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
  echo "▶  Installing Node dependencies..."
  npm install
fi

echo "▶  Starting React dev server on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

# ── Done
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  App is running!                                  ║"
echo "║                                                        ║"
echo "║  Frontend:  http://localhost:3000                      ║"
echo "║  Backend:   http://localhost:8000                      ║"
echo "║  API Docs:  http://localhost:8000/docs                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all servers."

wait $BACKEND_PID $FRONTEND_PID
