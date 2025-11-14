#!/bin/bash

# Stop CyberAI Services

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "================================================"
echo "   Stopping CyberAI Services"
echo "================================================"
echo ""

echo -e "${RED}[1/3]${NC} Stopping Frontend (port 3000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}[OK]${NC} Frontend stopped" || echo -e "${RED}[INFO]${NC} Frontend not running"

echo -e "${RED}[2/3]${NC} Stopping Backend (port 8001)..."
lsof -ti:8001 | xargs kill -9 2>/dev/null && echo -e "${GREEN}[OK]${NC} Backend stopped" || echo -e "${RED}[INFO]${NC} Backend not running"

echo -e "${RED}[3/3]${NC} Stopping MongoDB (optional)..."
# Uncomment to stop MongoDB
# pkill -9 mongod

echo ""
echo "================================================"
echo "   All CyberAI services stopped"
echo "================================================"
