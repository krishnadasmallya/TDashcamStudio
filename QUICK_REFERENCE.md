# Quick Reference Card

## 🚀 Quick Deploy (TrueNAS Scale)

```bash
# 1. Edit docker-compose.server.yml
volumes:
  - /mnt/your-pool/TeslaCam:/teslacam:ro

# 2. Deploy
docker-compose -f docker-compose.server.yml up -d

# 3. Access
http://your-truenas-ip:8188
```

## 📋 Essential Commands

```bash
# View logs
docker-compose -f docker-compose.server.yml logs -f

# Stop server
docker-compose -f docker-compose.server.yml down

# Restart
docker-compose -f docker-compose.server.yml restart

# Update
docker-compose -f docker-compose.server.yml pull
docker-compose -f docker-compose.server.yml up -d

# Rebuild
docker-compose -f docker-compose.server.yml build --no-cache
docker-compose -f docker-compose.server.yml up -d
```

## 🔍 Troubleshooting

### Server mode not working?
```bash
# Check if API is responding
curl http://localhost:8188/api/files

# Check server logs
docker logs tdashcam-server

# Check if container is running
docker ps | grep tdashcam
```

### No files found?
```bash
# Verify mount
docker exec tdashcam-server ls -la /teslacam

# Check folder structure
docker exec tdashcam-server ls -la /teslacam/RecentClips
```

### Videos won't play?
```bash
# Check file permissions
docker exec tdashcam-server ls -la /teslacam/RecentClips/*/

# Test video endpoint
curl -I http://localhost:8188/api/video/RecentClips/2024-02-20_17-30/2024-02-20_17-30-00-front.mp4
```

## 📁 Required Folder Structure

```
TeslaCam/
├── RecentClips/
│   └── 2024-02-20_17-30/
│       ├── 2024-02-20_17-30-00-front.mp4
│       ├── 2024-02-20_17-30-00-back.mp4
│       ├── 2024-02-20_17-30-00-left_repeater.mp4
│       └── 2024-02-20_17-30-00-right_repeater.mp4
├── SavedClips/
│   └── (same structure)
└── SentryClips/
    └── (same structure)
```

## 🔧 Configuration

### Environment Variables
```yaml
environment:
  - TZ=America/New_York          # Your timezone
  - TESLACAM_PATH=/teslacam      # Mount path (don't change)
  - PORT=3000                    # API port (don't change)
```

### Ports
```yaml
ports:
  - "8188:80"  # Change 8188 to your preferred port
```

### Volume Mount
```yaml
volumes:
  - /your/teslacam/path:/teslacam:ro  # :ro = read-only (recommended)
```

## 🌐 API Endpoints

```bash
# Get file list
GET http://localhost:8188/api/files

# Stream video
GET http://localhost:8188/api/video/RecentClips/2024-02-20_17-30/2024-02-20_17-30-00-front.mp4
```

## 📊 Health Check

```bash
# Check if everything is working
curl http://localhost:8188/api/files | jq .

# Expected output:
# {
#   "RecentClips": [...],
#   "SavedClips": [...],
#   "SentryClips": [...]
# }
```

## 🔄 Mode Detection

The app automatically detects which mode to use:

- **Server Mode** ✅ When `/api/files` responds
- **Client Mode** 📁 When `/api/files` is unavailable

## 📖 Documentation

- **Full Guide:** `SERVER_MODE.md`
- **Testing:** `TESTING.md`
- **Summary:** `SUMMARY.md`
- **PR Info:** `PR_DESCRIPTION.md`

## 🆘 Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify mount: `docker exec tdashcam-server ls /teslacam`
3. Test API: `curl http://localhost:8188/api/files`
4. Check browser console for errors
5. Review `SERVER_MODE.md` for detailed troubleshooting

## ⚡ One-Line Install

```bash
./install-server.sh
```

## 🎯 Quick Test

```bash
# Create test data
mkdir -p test-teslacam/RecentClips/2024-02-20_17-30
touch test-teslacam/RecentClips/2024-02-20_17-30/test.mp4

# Run with test data
docker run -d -p 8188:80 \
  -v $(pwd)/test-teslacam:/teslacam:ro \
  -e TESLACAM_PATH=/teslacam \
  tdashcam-server

# Test
curl http://localhost:8188/api/files
```

## 🔐 Security Notes

- Use `:ro` (read-only) for volume mounts
- Don't expose port 3000 (internal API)
- Only expose port 80 (Nginx)
- Consider adding authentication for remote access

## 📱 Access from Other Devices

```
http://your-server-ip:8188
```

Replace `your-server-ip` with:
- TrueNAS IP address
- Server IP address
- `localhost` if on same machine

## ✅ Checklist

- [ ] Docker installed
- [ ] TeslaCam folder accessible
- [ ] Port 8188 available
- [ ] docker-compose.server.yml edited
- [ ] Container running
- [ ] API responding
- [ ] Files loading in browser
- [ ] Videos playing

## 🎉 Success Indicators

✅ Container status: `Up`  
✅ API responds: `{"RecentClips":[...]}`  
✅ Button shows: "🔄 Reload Server Files"  
✅ Videos play without errors  

---

**Need more help?** See `SERVER_MODE.md` for detailed documentation.
