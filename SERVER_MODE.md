# Server Mode for TDashcam Studio

This fork adds **server-side mode** to TDashcam Studio, allowing you to deploy it on any Docker environment (like TrueNAS Scale) with direct access to mounted TeslaCam folders.

## Credits

This is a fork of [TDashcam Studio](https://github.com/DeaglePC/TDashcamStudio) by DeaglePC. All original functionality is preserved, and server mode is added as an additional feature.

## What's New?

### Server Mode Features

- **Direct folder access**: No need to manually select folders - the server automatically reads from mounted directories
- **Network deployment**: Deploy once, access from any device on your network
- **Docker-friendly**: Perfect for NAS systems like TrueNAS Scale, Synology, QNAP
- **Automatic file discovery**: Server scans and serves TeslaCam files automatically
- **Streaming support**: Efficient video streaming with range request support

### Original Client Mode

All original functionality is preserved:
- Browser-based file selection
- Desktop application support
- Drag & drop folders
- Complete privacy (local processing)

## Installation

### Option 1: Docker Compose (Recommended)

1. **Clone this repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/TDashcamStudio.git
   cd TDashcamStudio
   ```

2. **Edit `docker-compose.server.yml`:**
   ```yaml
   volumes:
     - /mnt/your-pool/TeslaCam:/teslacam:ro  # Change this to your TeslaCam path
   ```

3. **Start the server:**
   ```bash
   docker-compose -f docker-compose.server.yml up -d
   ```

4. **Access the app:**
   Open `http://your-server-ip:8188` in your browser

### Option 2: TrueNAS Scale Custom App

1. **Navigate to Apps** → **Discover Apps** → **Custom App**

2. **Configure:**
   - **Application Name:** `tdashcam-server`
   - **Image Repository:** Build from source or use pre-built image
   - **Image Tag:** `latest`
   
3. **Container Configuration:**
   - **Container Port:** `80`
   - **Node Port:** `8188`

4. **Storage:**
   - **Host Path:** `/mnt/your-pool/TeslaCam`
   - **Mount Path:** `/teslacam`
   - **Read Only:** `true` (recommended)

5. **Environment Variables:**
   - `TZ`: Your timezone (e.g., `America/New_York`)
   - `TESLACAM_PATH`: `/teslacam`
   - `PORT`: `3000`

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/TDashcamStudio.git
cd TDashcamStudio

# Build the Docker image
docker build -f Dockerfile.server -t tdashcam-server .

# Run the container
docker run -d \
  -p 8188:80 \
  -v /path/to/TeslaCam:/teslacam:ro \
  -e TZ=America/New_York \
  -e TESLACAM_PATH=/teslacam \
  --name tdashcam-server \
  tdashcam-server
```

## Usage

### Server Mode

When you access the app via the server URL:

1. The app automatically detects server mode
2. Click "📁 Select Folder" - it will load files from the server automatically
3. No manual folder selection needed!
4. The button changes to "🔄 Reload Server Files" for refreshing

### Client Mode (Fallback)

If server mode is not available (e.g., accessing the static files directly), the app falls back to the original client-side folder selection.

## Architecture

```
┌─────────────────┐
│   Browser       │
│  (Frontend)     │
└────────┬────────┘
         │
         │ HTTP
         │
┌────────▼────────┐
│   Nginx         │
│  (Port 80)      │
└────────┬────────┘
         │
         ├─── /          → Static files (HTML/JS/CSS)
         │
         └─── /api/*     → Proxy to Node.js
                          │
                ┌─────────▼──────────┐
                │   Node.js Server   │
                │   (Port 3000)      │
                └─────────┬──────────┘
                          │
                          │ File System
                          │
                ┌─────────▼──────────┐
                │   /teslacam        │
                │   (Mounted Volume) │
                └────────────────────┘
```

## API Endpoints

### `GET /api/files`
Returns the complete TeslaCam directory structure:
```json
{
  "RecentClips": [...],
  "SavedClips": [...],
  "SentryClips": [...]
}
```

### `GET /api/video/*`
Streams video files with range request support for seeking.

## Configuration

### Environment Variables

- `TESLACAM_PATH`: Path to TeslaCam folder (default: `/teslacam`)
- `PORT`: API server port (default: `3000`)
- `TZ`: Timezone for timestamps

### Volume Mounts

Mount your TeslaCam folder to `/teslacam` in the container:
```yaml
volumes:
  - /your/teslacam/path:/teslacam:ro
```

**Note:** Use `:ro` (read-only) for safety.

## Development

### Running Locally

1. **Start the API server:**
   ```bash
   cd server
   npm install
   TESLACAM_PATH=/path/to/TeslaCam npm start
   ```

2. **Serve the frontend:**
   ```bash
   cd src
   npx http-server -p 8080
   ```

3. **Access:** `http://localhost:8080`

### Testing Server Mode

The app automatically detects if `/api/files` is available. If it responds successfully, server mode is enabled.

## Troubleshooting

### Server mode not detected
- Check that the API server is running on port 3000
- Verify nginx is proxying `/api/*` requests correctly
- Check browser console for errors

### No files found
- Verify the TeslaCam folder is mounted correctly
- Check folder structure: should contain `RecentClips/`, `SavedClips/`, `SentryClips/`
- Check container logs: `docker logs tdashcam-server`

### Videos won't play
- Ensure video files are accessible
- Check browser console for 404 errors
- Verify file permissions (container needs read access)

## Contributing

Contributions are welcome! Please:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Test both server and client modes
5. Submit a pull request

## License

This project maintains the same license as the original TDashcam Studio (AGPL-3.0).

## Acknowledgments

- Original TDashcam Studio by [DeaglePC](https://github.com/DeaglePC/TDashcamStudio)
- All contributors to the original project

## Differences from Original

This fork adds:
- Server-side API (`server/` directory)
- Server mode detection (`src/server-api.js`)
- Modified frontend to support both modes
- Docker configuration for server deployment
- Documentation for server mode

All original features remain unchanged and functional.
