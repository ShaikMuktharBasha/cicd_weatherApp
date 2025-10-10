#!/bin/bash

# Weather App Development Auto-Rebuild Script
# This script watches for changes in Frontend files and automatically rebuilds the container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Weather App Development Auto-Rebuild${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed${NC}"
    exit 1
fi

# Check if services are running
if ! docker-compose -f docker-compose.multi.yml ps | grep -q "weather-app-frontend"; then
    echo -e "${YELLOW}⚠️ Frontend container not running. Starting services...${NC}"
    docker-compose -f docker-compose.multi.yml up -d
    sleep 10
fi

echo -e "${GREEN}✅ Services are running${NC}"
echo -e "${YELLOW}👀 Watching for Frontend file changes...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Function to rebuild frontend
rebuild_frontend() {
    echo -e "${BLUE}🔄 Frontend changes detected!${NC}"
    echo -e "${YELLOW}📦 Rebuilding frontend container...${NC}"

    # Stop frontend container
    docker-compose -f docker-compose.multi.yml stop frontend

    # Rebuild frontend image
    docker-compose -f docker-compose.multi.yml build --no-cache frontend

    # Start frontend container
    docker-compose -f docker-compose.multi.yml up -d frontend

    echo -e "${GREEN}✅ Frontend rebuilt successfully!${NC}"
    echo -e "${GREEN}🌐 Frontend URL: http://localhost:3000${NC}"
    echo -e "${YELLOW}👀 Continuing to watch for changes...${NC}"
    echo ""
}

# Initial build
rebuild_frontend

# Watch for file changes using inotifywait (Linux) or fswatch (macOS)
if command -v inotifywait &> /dev/null; then
    # Linux with inotify-tools
    echo -e "${BLUE}Using inotifywait for file watching${NC}"
    while inotifywait -r -e modify,create,delete Frontend/; do
        rebuild_frontend
    done
elif command -v fswatch &> /dev/null; then
    # macOS with fswatch
    echo -e "${BLUE}Using fswatch for file watching${NC}"
    fswatch -o Frontend/ | while read f; do
        rebuild_frontend
    done
else
    # Fallback: simple polling method
    echo -e "${YELLOW}⚠️ Advanced file watchers not available. Using polling method.${NC}"
    echo -e "${YELLOW}Install inotify-tools (Linux) or fswatch (macOS) for better performance.${NC}"

    LAST_MOD=$(find Frontend/ -type f -exec stat -c '%Y' {} \; | sort -n | tail -1)

    while true; do
        sleep 2
        CURRENT_MOD=$(find Frontend/ -type f -exec stat -c '%Y' {} \; | sort -n | tail -1)

        if [ "$CURRENT_MOD" != "$LAST_MOD" ]; then
            rebuild_frontend
            LAST_MOD=$CURRENT_MOD
        fi
    done
fi