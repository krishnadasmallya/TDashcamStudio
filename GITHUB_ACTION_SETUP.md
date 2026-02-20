# 🚀 GitHub Action Setup - Automatic Docker Builds

## What It Does

Every time you push code to GitHub, it automatically:
1. ✅ Builds the Docker image
2. ✅ Pushes to GitHub Container Registry (ghcr.io)
3. ✅ Makes it available for TrueNAS deployment

## Setup Steps

### 1. Fork & Push (One-time)

```bash
# Go to GitHub and fork: https://github.com/DeaglePC/TDashcamStudio

# Add your fork as remote
cd /Users/dasveen/tmp/177074438500515/TDashcamStudio
git remote add myfork https://github.com/YOUR-USERNAME/TDashcamStudio.git

# Push the branch
git push myfork feature/server-mode
```

### 2. Make Package Public (One-time)

After first build completes:
1. Go to `https://github.com/YOUR-USERNAME?tab=packages`
2. Click on `tdashcamstudio` package
3. Click "Package settings" (right side)
4. Scroll to "Danger Zone"
5. Click "Change visibility" → Select "Public" → Confirm

### 3. Deploy on TrueNAS

```bash
# Download compose file
wget https://raw.githubusercontent.com/YOUR-USERNAME/TDashcamStudio/feature/server-mode/docker-compose.ghcr.yml

# Edit to set your TeslaCam path
nano docker-compose.ghcr.yml
# Change line: - /mnt/your-pool/TeslaCam:/teslacam:ro

# Also update image name with your username
# Change: ghcr.io/YOUR-USERNAME/tdashcamstudio:feature-server-mode

# Deploy
docker-compose -f docker-compose.ghcr.yml up -d

# Access at http://your-truenas-ip:8188
```

## Workflow

```
You push code → GitHub Action builds → Image available in 2-3 min → Pull on TrueNAS
```

### Update Cycle

```bash
# 1. Make changes locally
git add -A
git commit -m "your changes"
git push myfork feature/server-mode

# 2. Wait 2-3 minutes for build

# 3. Update on TrueNAS
docker-compose -f docker-compose.ghcr.yml pull
docker-compose -f docker-compose.ghcr.yml up -d
```

## Image Location

Your image will be at:
```
ghcr.io/YOUR-USERNAME/tdashcamstudio:feature-server-mode
```

## Check Build Status

Go to: `https://github.com/YOUR-USERNAME/TDashcamStudio/actions`

- ✅ Green checkmark = Build successful
- ❌ Red X = Build failed (click to see logs)

## Quick Commands

```bash
# Pull latest image
docker pull ghcr.io/YOUR-USERNAME/tdashcamstudio:feature-server-mode

# Update running container
docker-compose -f docker-compose.ghcr.yml pull
docker-compose -f docker-compose.ghcr.yml up -d

# View logs
docker-compose -f docker-compose.ghcr.yml logs -f

# Stop
docker-compose -f docker-compose.ghcr.yml down
```

## Benefits

✅ No need to build locally
✅ Automatic builds on every push
✅ Easy updates on TrueNAS
✅ Version control with tags
✅ Fast deployment

## Files Added

- `.github/workflows/docker-build.yml` - GitHub Action workflow
- `docker-compose.ghcr.yml` - Compose file using pre-built image
- `GITHUB_IMAGES.md` - Detailed documentation

## Next Steps

1. Fork the repo on GitHub
2. Push your branch: `git push myfork feature/server-mode`
3. Wait for first build to complete
4. Make package public
5. Deploy on TrueNAS using `docker-compose.ghcr.yml`

That's it! Every future push will automatically build and update the image.
