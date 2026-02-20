# Local Development & Quick Deploy

## Quick Deploy on TrueNAS (Recommended)

**Run this directly on TrueNAS via SSH:**

```bash
# Download and run deploy script
curl -sSL https://raw.githubusercontent.com/krishnadasmallya/TDashcamStudio/feature/server-mode/deploy-truenas.sh | bash

# Or manually:
cd /tmp
git clone --depth 1 --branch feature/server-mode https://github.com/krishnadasmallya/TDashcamStudio.git
cd TDashcamStudio
docker build -f Dockerfile.server -t tdashcam-server:latest .
```

**Then deploy:**

```bash
# Download compose file
wget https://raw.githubusercontent.com/krishnadasmallya/TDashcamStudio/feature/server-mode/docker-compose.local.yml

# Edit to set your TeslaCam path
nano docker-compose.local.yml

# Deploy
docker-compose -f docker-compose.local.yml up -d
```

## Local Build (From Your Computer)

```bash
cd TDashcamStudio

# Build with version tag
./build-local.sh v1.0.0

# Copy to TrueNAS
scp tdashcam-server-v1.0.0.tar root@truenas-ip:/tmp/

# On TrueNAS:
docker load -i /tmp/tdashcam-server-v1.0.0.tar
docker tag tdashcam-server:v1.0.0 tdashcam-server:latest
```

## Quick Update Workflow

**On TrueNAS:**

```bash
# 1. Rebuild
cd /tmp
rm -rf TDashcamStudio
git clone --depth 1 --branch feature/server-mode https://github.com/krishnadasmallya/TDashcamStudio.git
cd TDashcamStudio
docker build -f Dockerfile.server -t tdashcam-server:latest .

# 2. Restart
docker-compose -f /path/to/docker-compose.local.yml up -d
```

## Auto-Update Script

Save this as `/root/update-tdashcam.sh` on TrueNAS:

```bash
#!/bin/bash
set -e

echo "🔄 Updating TDashcam Server..."

# Build new image
cd /tmp
rm -rf TDashcamStudio
git clone --depth 1 --branch feature/server-mode https://github.com/krishnadasmallya/TDashcamStudio.git
cd TDashcamStudio
docker build -f Dockerfile.server -t tdashcam-server:latest .

# Restart container
docker-compose -f /path/to/docker-compose.local.yml up -d

echo "✅ Update complete!"
```

Make it executable:
```bash
chmod +x /root/update-tdashcam.sh
```

Run anytime:
```bash
/root/update-tdashcam.sh
```

## Version Management

### Tag Versions

```bash
# Build with specific version
docker build -f Dockerfile.server -t tdashcam-server:v1.0.0 .
docker tag tdashcam-server:v1.0.0 tdashcam-server:latest

# List versions
docker images tdashcam-server
```

### Rollback

```bash
# Switch to previous version
docker tag tdashcam-server:v1.0.0 tdashcam-server:latest
docker-compose up -d
```

## Development Workflow

### 1. Make Changes Locally

```bash
# Edit files
nano src/server-api.js

# Test locally
docker build -f Dockerfile.server -t tdashcam-server:dev .
docker run -d -p 8188:80 -v /path/to/TeslaCam:/teslacam:ro tdashcam-server:dev

# Test in browser
open http://localhost:8188
```

### 2. Deploy to TrueNAS

```bash
# Commit changes
git add -A
git commit -m "fix: your changes"
git push

# On TrueNAS, run update script
/root/update-tdashcam.sh
```

## Comparison: Local vs GitHub

| Method | Speed | Use Case |
|--------|-------|----------|
| **Local Build** | ⚡ 1-2 min | Quick testing, development |
| **GitHub Action** | 🐌 3-5 min | Production, sharing, CI/CD |

## Tips

- Use local builds for rapid iteration
- Use GitHub Actions for stable releases
- Tag versions for easy rollback
- Keep `latest` tag for current version

## Troubleshooting

### Build fails on TrueNAS
```bash
# Check Docker is running
docker ps

# Check disk space
df -h

# Clean old images
docker system prune -a
```

### Can't connect to TrueNAS
```bash
# Enable SSH in TrueNAS UI:
# System Settings → Services → SSH → Enable
```

### Permission denied
```bash
# Run as root or use sudo
sudo docker build ...
```
