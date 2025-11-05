#!/bin/bash

echo "=========================================="
echo "IoT Agriculture System Startup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${YELLOW}Checking MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${RED}⚠️  MongoDB not detected${NC}"
    echo -e "${YELLOW}Start MongoDB with: mongod${NC}"
    echo ""
fi

echo ""
echo -e "${YELLOW}Starting system in 3 terminals...${NC}"
echo ""
echo "Terminal 1: MongoDB (if not running)"
echo "Terminal 2: Backend (npm run dev in backend/)"
echo "Terminal 3: Frontend (npm run dev in frontend/)"
echo ""
echo -e "${GREEN}Manual start:${NC}"
echo ""
echo "# Terminal 1 (if needed)"
echo "mongod"
echo ""
echo "# Terminal 2"
echo "cd backend && npm run dev"
echo ""
echo "# Terminal 3"
echo "cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo -e "${YELLOW}========================================${NC}"

# Optional: Open terminals automatically (requires gnome-terminal or similar)
if command -v gnome-terminal &> /dev/null; then
    echo ""
    read -p "Open terminals automatically? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Opening terminals..."
        
        # Check if we need to start MongoDB
        if ! pgrep -x "mongod" > /dev/null; then
            gnome-terminal -- bash -c "echo 'Starting MongoDB...'; mongod; exec bash"
            sleep 2
        fi
        
        # Start backend
        gnome-terminal --working-directory="$(pwd)/backend" -- bash -c "echo 'Starting Backend...'; npm run dev; exec bash"
        
        # Wait a bit for backend to start
        sleep 3
        
        # Start frontend
        gnome-terminal --working-directory="$(pwd)/frontend" -- bash -c "echo 'Starting Frontend...'; npm run dev; exec bash"
        
        # Wait for frontend to start
        sleep 3
        
        # Open browser
        if command -v xdg-open &> /dev/null; then
            echo "Opening browser..."
            xdg-open http://localhost:5173
        fi
        
        echo ""
        echo -e "${GREEN}✅ System started!${NC}"
    fi
fi
