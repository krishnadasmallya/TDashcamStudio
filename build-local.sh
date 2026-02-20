#!/bin/bash
# Quick local build and deploy script for TrueNAS

set -e

VERSION=${1:-latest}
IMAGE_NAME="tdashcam-server:${VERSION}"

echo "🔨 Building image: ${IMAGE_NAME}"
docker build -f Dockerfile.server -t ${IMAGE_NAME} .

echo "📦 Saving image to tar..."
docker save ${IMAGE_NAME} -o tdashcam-server-${VERSION}.tar

echo "📤 Copy this file to TrueNAS and run:"
echo "   docker load -i tdashcam-server-${VERSION}.tar"
echo ""
echo "Then update docker-compose.yml:"
echo "   image: ${IMAGE_NAME}"
echo ""
echo "Or run directly:"
echo "   docker run -d -p 8188:80 -v /mnt/pool/TeslaCam:/teslacam:ro ${IMAGE_NAME}"
