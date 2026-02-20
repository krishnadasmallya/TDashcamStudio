#!/bin/bash
# Deploy script for TrueNAS - run this ON TrueNAS

set -e

REPO_URL="https://github.com/krishnadasmallya/TDashcamStudio.git"
BRANCH="feature/server-mode"
BUILD_DIR="/tmp/tdashcam-build"
VERSION=$(date +%Y%m%d-%H%M%S)

echo "🔄 Cloning repository..."
rm -rf ${BUILD_DIR}
git clone --depth 1 --branch ${BRANCH} ${REPO_URL} ${BUILD_DIR}

echo "🔨 Building image..."
cd ${BUILD_DIR}
docker build -f Dockerfile.server -t tdashcam-server:${VERSION} -t tdashcam-server:latest .

echo "🧹 Cleaning up..."
cd /
rm -rf ${BUILD_DIR}

echo "✅ Build complete!"
echo ""
echo "Image tags:"
echo "  - tdashcam-server:${VERSION}"
echo "  - tdashcam-server:latest"
echo ""
echo "To deploy, update your docker-compose.yml:"
echo "  image: tdashcam-server:latest"
echo ""
echo "Then run:"
echo "  docker-compose up -d"
