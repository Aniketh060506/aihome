#!/bin/bash

# CyberAI - BYOK Cybersecurity Assistant
# Startup script for Mac/Linux

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================"
echo "   CyberAI - BYOK Cybersecurity Assistant"
echo "================================================"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} MongoDB not found"
    echo "Please install MongoDB:"
    echo "  Mac: brew install mongodb-community"
    echo "  Ubuntu: sudo apt install mongodb"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Python3 not found"
    echo "Please install Python 3.10+ from: https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js/Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Yarn not found"
    echo "Please install Node.js and Yarn:"
    echo "  npm install -g yarn"
    exit 1
fi

echo -e "${GREEN}[1/4]${NC} Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}[INFO]${NC} MongoDB already running"
else
    echo -e "${GREEN}[INFO]${NC} Starting MongoDB..."
    # Try to start MongoDB
    if command -v brew &> /dev/null; then
        # Mac with Homebrew
        brew services start mongodb-community 2>/dev/null || mongod --fork --logpath /tmp/mongodb.log --dbpath ~/data/db
    else
        # Linux
        sudo systemctl start mongodb 2>/dev/null || mongod --fork --logpath /tmp/mongodb.log --dbpath ~/data/db
    fi
fi
sleep 2

echo -e "${GREEN}[2/4]${NC} Setting up Backend..."
cd "$SCRIPT_DIR/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[SETUP]${NC} Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo -e "${YELLOW}[SETUP]${NC} Installing backend dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start backend in background
echo -e "${GREEN}[INFO]${NC} Starting backend on http://127.0.0.1:8001"
uvicorn server:app --host 127.0.0.1 --port 8001 > /tmp/cyberai-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}[OK]${NC} Backend PID: $BACKEND_PID"
sleep 3

echo -e "${GREEN}[3/4]${NC} Setting up Frontend..."
cd "$SCRIPT_DIR/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[SETUP]${NC} Installing frontend dependencies..."
    yarn install
fi

# Update .env to use localhost
cat > .env << EOL
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
EOL

# Start frontend in background
echo -e "${GREEN}[INFO]${NC} Starting frontend on http://localhost:3000"
yarn start > /tmp/cyberai-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}[OK]${NC} Frontend PID: $FRONTEND_PID"

echo ""
echo "================================================"
echo "   CyberAI is running!"
echo "================================================"
echo ""
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Backend:${NC}  http://localhost:8001/api/"
echo ""
echo -e "${YELLOW}[INFO]${NC} Application is starting..."
echo -e "${YELLOW}[INFO]${NC} Your browser will open in 15 seconds"
echo ""
echo "Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "To stop CyberAI:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/cyberai-backend.log"
echo "  Frontend: tail -f /tmp/cyberai-frontend.log"
echo ""

# Open browser after delay
sleep 15
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo "================================================"
echo "Press Ctrl+C to stop all services"
echo "================================================"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Stopping CyberAI..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}[OK]${NC} Services stopped"
    exit 0
}

# Trap SIGINT (Ctrl+C) and cleanup
trap cleanup INT

# Keep script running
while true; do
    sleep 1
done
