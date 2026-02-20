# Testing Guide

## Testing Server Mode Locally

### 1. Create Test TeslaCam Structure

```bash
mkdir -p test-teslacam/{RecentClips,SavedClips,SentryClips}/2024-02-20_17-30
touch test-teslacam/RecentClips/2024-02-20_17-30/2024-02-20_17-30-00-front.mp4
touch test-teslacam/RecentClips/2024-02-20_17-30/2024-02-20_17-30-00-back.mp4
```

### 2. Start the Server

```bash
cd server
npm install
TESLACAM_PATH=../test-teslacam node server.js
```

### 3. Test API Endpoints

```bash
# Test file listing
curl http://localhost:3000/api/files

# Expected output:
# {
#   "RecentClips": [...],
#   "SavedClips": [],
#   "SentryClips": []
# }
```

### 4. Test Frontend

```bash
# In another terminal
cd src
npx http-server -p 8080
```

Open `http://localhost:8080` and click "Select Folder"

## Testing with Docker

### Build and Run

```bash
# Build the image
docker build -f Dockerfile.server -t tdashcam-server-test .

# Run with test data
docker run -d \
  -p 8188:80 \
  -v $(pwd)/test-teslacam:/teslacam:ro \
  -e TESLACAM_PATH=/teslacam \
  --name tdashcam-test \
  tdashcam-server-test

# Check logs
docker logs tdashcam-test

# Test
curl http://localhost:8188/api/files
```

### Cleanup

```bash
docker stop tdashcam-test
docker rm tdashcam-test
docker rmi tdashcam-server-test
```

## Testing Both Modes

### Server Mode
1. Access via `http://localhost:8188`
2. Click "Select Folder"
3. Should automatically load files from server
4. Button should change to "🔄 Reload Server Files"

### Client Mode (Fallback)
1. Stop the API server
2. Access static files directly
3. Click "Select Folder"
4. Should show browser file picker (original behavior)

## Verification Checklist

- [ ] Server starts without errors
- [ ] `/api/files` returns valid JSON
- [ ] Frontend detects server mode
- [ ] Files load automatically in server mode
- [ ] Videos play correctly
- [ ] Client mode works when server unavailable
- [ ] Docker container builds successfully
- [ ] Docker container serves files correctly
- [ ] No errors in browser console
- [ ] No errors in server logs
