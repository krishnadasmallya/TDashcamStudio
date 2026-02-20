# Using Pre-Built Docker Images from GitHub

## Automatic Builds

Every push to `feature/server-mode` or `main` automatically builds and pushes a Docker image to GitHub Container Registry.

## Image Location

```
ghcr.io/YOUR-USERNAME/tdashcamstudio:feature-server-mode
```

Replace `YOUR-USERNAME` with your GitHub username.

## Quick Deploy on TrueNAS

### 1. Make Image Public (One-time setup)

After first build:
1. Go to your GitHub profile → Packages
2. Find `tdashcamstudio` package
3. Click "Package settings"
4. Scroll to "Danger Zone"
5. Click "Change visibility" → "Public"

### 2. Deploy on TrueNAS

```bash
# Download the compose file
wget https://raw.githubusercontent.com/YOUR-USERNAME/TDashcamStudio/feature/server-mode/docker-compose.ghcr.yml

# Edit to set your TeslaCam path
nano docker-compose.ghcr.yml
# Change: /mnt/your-pool/TeslaCam:/teslacam:ro

# Deploy
docker-compose -f docker-compose.ghcr.yml up -d
```

### 3. Update to Latest

```bash
# Pull latest image
docker-compose -f docker-compose.ghcr.yml pull

# Restart with new image
docker-compose -f docker-compose.ghcr.yml up -d
```

## Using in TrueNAS Scale Custom App

**Application Name:** `tdashcam-server`

**Container Images:**
- Image repository: `ghcr.io/YOUR-USERNAME/tdashcamstudio`
- Image Tag: `feature-server-mode`
- Pull Policy: `Always`

**Networking:**
- Container Port: `80`
- Node Port: `8188`

**Storage:**
- Host Path: `/mnt/your-pool/TeslaCam`
- Mount Path: `/teslacam`
- Read Only: `true`

**Environment Variables:**
- `TZ`: `Australia/Sydney`
- `TESLACAM_PATH`: `/teslacam`
- `PORT`: `3000`

## Available Tags

- `feature-server-mode` - Latest from feature branch
- `main` - Latest from main branch (after merge)
- `feature-server-mode-<commit-sha>` - Specific commit

## Manual Pull

```bash
docker pull ghcr.io/YOUR-USERNAME/tdashcamstudio:feature-server-mode
```

## Workflow

1. **Push code** → GitHub Action builds image automatically
2. **Wait 2-3 minutes** for build to complete
3. **Pull on TrueNAS** → `docker-compose pull`
4. **Restart** → `docker-compose up -d`

## Check Build Status

Go to: `https://github.com/YOUR-USERNAME/TDashcamStudio/actions`

Green checkmark = Build successful ✅
Red X = Build failed ❌

## Troubleshooting

### Image not found?
- Make sure package is public (see step 1 above)
- Check build completed successfully in Actions tab
- Verify image name matches your username

### Old version running?
```bash
# Force pull latest
docker-compose -f docker-compose.ghcr.yml pull --no-cache

# Remove old container
docker-compose -f docker-compose.ghcr.yml down

# Start fresh
docker-compose -f docker-compose.ghcr.yml up -d
```

### Check image version
```bash
docker images | grep tdashcamstudio
```
