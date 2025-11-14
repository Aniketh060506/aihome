#!/bin/bash

# CyberAI - Startup Script
# This script ensures all services are running and provides status

echo "================================================"
echo "   CyberAI - BYOK Cybersecurity Assistant"
echo "================================================"
echo ""

echo "📋 Checking service status..."
echo ""

# Check if supervisor is available
if ! command -v supervisorctl &> /dev/null; then
    echo "❌ supervisorctl not found. Cannot manage services."
    echo "   Please install supervisor or start services manually."
    exit 1
fi

# Get current status
STATUS=$(sudo supervisorctl status 2>&1)
echo "$STATUS"
echo ""

# Check if all services are running
if echo "$STATUS" | grep -q "STOPPED\|FATAL"; then
    echo "⚠️  Some services are not running. Attempting to start..."
    echo ""
    sudo supervisorctl restart all
    sleep 5
    echo ""
    echo "📋 Updated service status:"
    sudo supervisorctl status
    echo ""
fi

# Verify backend is responding
echo "🔍 Testing backend connection..."
if curl -s http://localhost:8001/api/ > /dev/null 2>&1; then
    RESPONSE=$(curl -s http://localhost:8001/api/)
    echo "✅ Backend is responding: $RESPONSE"
else
    echo "❌ Backend is not responding on http://localhost:8001/api/"
    echo "   Check logs: tail -f /var/log/supervisor/backend.err.log"
fi
echo ""

# Check frontend compilation
echo "🔍 Checking frontend status..."
if pgrep -f "craco start" > /dev/null; then
    echo "✅ Frontend process is running"
    # Check if webpack compiled successfully
    if tail -20 /var/log/supervisor/frontend.out.log 2>/dev/null | grep -q "webpack compiled successfully"; then
        echo "✅ Frontend compiled successfully"
    else
        echo "⚠️  Frontend may still be compiling..."
    fi
else
    echo "❌ Frontend process not found"
fi
echo ""

# Check MongoDB
echo "🔍 Checking MongoDB..."
if sudo supervisorctl status mongodb 2>&1 | grep -q "RUNNING"; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running"
fi
echo ""

# Display frontend URL
echo "================================================"
echo "   🚀 Application Status"
echo "================================================"
if [ -f /app/frontend/.env ]; then
    FRONTEND_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2 | tr -d '"')
    # Extract domain without /api
    FRONTEND_URL=$(echo $FRONTEND_URL | sed 's|/api||')
    echo "Frontend URL: $FRONTEND_URL"
else
    echo "Frontend URL: Check /app/frontend/.env"
fi
echo "Backend URL: http://localhost:8001/api/"
echo ""

# Quick tips
echo "================================================"
echo "   💡 Quick Tips"
echo "================================================"
echo "• Access Settings to add your API key"
echo "• Supported providers: OpenAI, Anthropic, Google"
echo "• Create conversations and select models"
echo "• Toggle dark mode for better experience"
echo ""
echo "📚 Documentation:"
echo "   • SETUP_GUIDE.md - Detailed setup instructions"
echo "   • CHECKLIST.md - Pre-launch validation"
echo "   • README.md - Full documentation"
echo ""

# Service management commands
echo "================================================"
echo "   🛠️  Service Management"
echo "================================================"
echo "Restart all:     sudo supervisorctl restart all"
echo "Check status:    sudo supervisorctl status"
echo "View logs:       tail -f /var/log/supervisor/backend.err.log"
echo "                 tail -f /var/log/supervisor/frontend.err.log"
echo ""

echo "================================================"
echo "   ✅ Startup Complete!"
echo "================================================"
