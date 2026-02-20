#!/bin/bash
# Quick installation script for TDashcam Studio Server Mode

set -e

echo "🚀 TDashcam Studio Server Mode Installer"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Prompt for TeslaCam path
echo "📁 Enter the path to your TeslaCam folder:"
read -p "Path: " TESLACAM_PATH

if [ ! -d "$TESLACAM_PATH" ]; then
    echo "❌ Directory does not exist: $TESLACAM_PATH"
    exit 1
fi

# Prompt for port
echo ""
echo "🔌 Enter the port to run the server on (default: 8188):"
read -p "Port: " PORT
PORT=${PORT:-8188}

# Prompt for timezone
echo ""
echo "🌍 Enter your timezone (default: UTC):"
echo "Examples: America/New_York, Europe/London, Asia/Tokyo, Australia/Sydney"
read -p "Timezone: " TZ
TZ=${TZ:-UTC}

# Create docker-compose.yml from template
echo ""
echo "📝 Creating docker-compose configuration..."

cat > docker-compose.yml <<EOF
version: '3.8'

services:
  tdashcam-server:
    build:
      context: .
      dockerfile: Dockerfile.server
    container_name: tdashcam-server
    ports:
      - "${PORT}:80"
    volumes:
      - ${TESLACAM_PATH}:/teslacam:ro
    environment:
      - TZ=${TZ}
      - TESLACAM_PATH=/teslacam
      - PORT=3000
    restart: unless-stopped
    networks:
      - tdashcam-network

networks:
  tdashcam-network:
    driver: bridge
EOF

echo "✅ Configuration created!"
echo ""
echo "🏗️  Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting TDashcam Server..."
docker-compose up -d

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Server Status:"
docker-compose ps

echo ""
echo "🌐 Access your TDashcam Studio at:"
echo "   http://localhost:${PORT}"
echo ""
echo "📝 Useful commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop server:  docker-compose down"
echo "   Restart:      docker-compose restart"
echo "   Update:       docker-compose pull && docker-compose up -d"
echo ""
echo "📖 For more information, see SERVER_MODE.md"
