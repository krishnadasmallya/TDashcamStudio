# TDashcam Studio - Server Edition Fork

> **Note:** This is a fork that adds server-side deployment capabilities to [TDashcam Studio](https://github.com/DeaglePC/TDashcamStudio). All original functionality is preserved.

## 🆕 What's New in This Fork?

### Server Mode
Deploy TDashcam Studio on your NAS or server with automatic folder access:

- ✅ **No manual folder selection** - Server automatically reads mounted TeslaCam directories
- ✅ **Network access** - Access from any device on your network
- ✅ **Perfect for NAS** - TrueNAS Scale, Synology, QNAP, Unraid
- ✅ **Docker deployment** - Easy setup with docker-compose
- ✅ **Automatic file discovery** - Server scans and serves files automatically

### Original Client Mode Still Works
All original features are preserved:
- Browser-based local file access
- Desktop applications
- Drag & drop support
- Complete privacy (local processing)

## 🚀 Quick Start

### Server Mode (New!)

**Docker Compose:**
```bash
# Clone this fork
git clone https://github.com/YOUR-USERNAME/TDashcamStudio.git
cd TDashcamStudio

# Edit docker-compose.server.yml to set your TeslaCam path
# Then start:
docker-compose -f docker-compose.server.yml up -d

# Access at http://your-server-ip:8188
```

**TrueNAS Scale:**
See [SERVER_MODE.md](SERVER_MODE.md) for detailed TrueNAS installation instructions.

### Client Mode (Original)

Use any of the original methods:
- **Online:** https://teslacam.dpc.cool/
- **Desktop App:** Download from [Releases](https://github.com/DeaglePC/TDashcamStudio/releases)
- **Local Server:** `npx http-server -p 8188 src`

## 📖 Documentation

- **[Server Mode Guide](SERVER_MODE.md)** - Complete server deployment documentation
- **[Original README](README_ORIGINAL.md)** - Original project documentation

## 🏗️ Architecture

This fork adds a Node.js API server that:
1. Scans mounted TeslaCam directories
2. Serves file listings via REST API
3. Streams videos with range request support
4. Automatically detected by the frontend

The frontend intelligently switches between:
- **Server mode** - When API is available
- **Client mode** - Falls back to original file selection

## 🔧 Technical Details

**New Components:**
- `server/` - Node.js Express API server
- `src/server-api.js` - Server mode client library
- `Dockerfile.server` - Multi-stage Docker build
- `docker-compose.server.yml` - Server deployment config

**Modified Files:**
- `src/index.html` - Includes server-api.js
- `src/script.js` - Adds server mode detection and loading

## 🤝 Contributing

Contributions welcome! This fork aims to:
1. Preserve all original functionality
2. Add server mode as optional feature
3. Maintain compatibility with upstream

## 📝 License

AGPL-3.0 (same as original project)

## 🙏 Credits

- **Original Project:** [TDashcam Studio](https://github.com/DeaglePC/TDashcamStudio) by DeaglePC
- **Server Mode:** This fork adds deployment capabilities for NAS/server environments

---

For the original README and features, see [README_ORIGINAL.md](README_ORIGINAL.md)
