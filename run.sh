#!/usr/bin/env bash
# ==============================================================================
# K-PIPE | Single-Command Server Launcher
# Boots both the Java 21+ Kernel Engine (port 8080) and React HUD (port 5173)
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

BACKEND_PID=""
FRONTEND_PID=""

# Cleanup function on Ctrl+C or script termination
cleanup() {
    echo ""
    echo ">> Stopping K-PIPE servers..."
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    # Ensure background port release
    fuser -k 8080/tcp 2>/dev/null || true
    fuser -k 5173/tcp 2>/dev/null || true
    echo ">> Servers stopped cleanly. Goodbye!"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "=============================================================="
echo "  K-PIPE: Linux Kernel Pipe & Ring Buffer Visualizer"
echo "=============================================================="

# 1. Check prerequisites
command -v java >/dev/null 2>&1 || { echo "[ERROR] Java is required but not installed."; exit 1; }
command -v mvn >/dev/null 2>&1 || { echo "[ERROR] Maven (mvn) is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm is required but not installed."; exit 1; }

# 2. Check if ports are already occupied and free them
if lsof -i :8080 >/dev/null 2>&1; then
    echo ">> Port 8080 is currently in use. Releasing port..."
    fuser -k 8080/tcp 2>/dev/null || true
    sleep 1
fi

if lsof -i :5173 >/dev/null 2>&1; then
    echo ">> Port 5173 is currently in use. Releasing port..."
    fuser -k 5173/tcp 2>/dev/null || true
    sleep 1
fi

# 3. Start Java Kernel Backend (Javalin on port 8080)
echo ">> Starting Java Kernel Backend (Javalin microserver)..."
mvn compile exec:java > /dev/null 2>&1 &
BACKEND_PID=$!

# Wait for backend healthcheck
echo -n ">> Waiting for backend to initialize on port 8080"
for i in {1..30}; do
    if curl -s http://localhost:8080/health | grep -q "OK"; then
        echo " [READY]"
        break
    fi
    echo -n "."
    sleep 0.5
done

# 4. Check & install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo ">> Installing frontend dependencies (npm install)..."
    (cd frontend && npm install)
fi

# 5. Start React Vite Dev Server (port 5173)
echo ">> Starting Frontend HUD (Vite on port 5173)..."
(cd frontend && npm run dev -- --host 0.0.0.0 --port 5173 > /dev/null 2>&1) &
FRONTEND_PID=$!

# Wait for frontend port
echo -n ">> Waiting for frontend dev server"
for i in {1..20}; do
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo " [READY]"
        break
    fi
    echo -n "."
    sleep 0.5
done

echo ""
echo "=============================================================="
echo "  K-PIPE IS LIVE AND READY!"
echo "=============================================================="
echo "  Frontend Dashboard : http://localhost:5173"
echo "  Backend REST API   : http://localhost:8080/api/snapshot"
echo "  WebSocket Stream   : ws://localhost:8080/ws/telemetry"
echo "=============================================================="
echo "  Press Ctrl+C to stop both servers."
echo ""

# Prevent trap from firing EXIT prematurely while waiting
trap - EXIT
trap cleanup SIGINT SIGTERM

# Keep script running
wait
