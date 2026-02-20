# Pull Request: Add Server Mode for NAS/Docker Deployment

## Summary

This PR adds **server-side deployment mode** to TDashcam Studio while preserving all original client-side functionality. Users can now deploy the app on NAS systems (TrueNAS Scale, Synology, QNAP) or any Docker environment with automatic access to mounted TeslaCam folders.

## Motivation

The current version requires users to manually select folders through the browser's file picker, which doesn't work well for:
- NAS deployments where files are stored server-side
- Multi-user scenarios where everyone needs access to the same footage
- Automated setups where manual folder selection is impractical

## Changes

### New Features

1. **Server Mode**
   - Node.js Express API server that scans and serves TeslaCam files
   - Automatic file discovery from mounted directories
   - Video streaming with HTTP range request support
   - REST API for file listings

2. **Automatic Mode Detection**
   - Frontend automatically detects if server API is available
   - Seamlessly switches between server and client modes
   - Falls back to original behavior when server unavailable

3. **Docker Deployment**
   - Multi-stage Dockerfile for efficient builds
   - Docker Compose configuration
   - Nginx + Node.js architecture

### Files Added

- `server/package.json` - Server dependencies
- `server/server.js` - Express API server (120 lines)
- `src/server-api.js` - Client-side server mode library (80 lines)
- `Dockerfile.server` - Multi-stage Docker build
- `docker-compose.server.yml` - Server deployment config
- `SERVER_MODE.md` - Comprehensive server mode documentation
- `README_FORK.md` - Fork-specific README
- `TESTING.md` - Testing guide

### Files Modified

- `src/index.html` - Added `<script src="server-api.js"></script>`
- `src/script.js` - Added:
  - Server mode initialization check
  - `loadServerModeFiles()` method
  - Modified `getFileUrl()` to support server URLs
  - Modified `initializeEventListeners()` to check for server mode

## Technical Details

### Architecture

```
Browser → Nginx (port 80) → Static files (/)
                          → Proxy to Node.js (/api/*)
                                    ↓
                          Node.js (port 3000) → File System (/teslacam)
```

### API Endpoints

- `GET /api/files` - Returns TeslaCam directory structure
- `GET /api/video/*` - Streams video files with range support

### Mode Detection

```javascript
// On page load
if (window.ServerAPI) {
  const serverAvailable = await window.ServerAPI.init();
  // Automatically enables server mode if /api/files responds
}
```

## Backward Compatibility

✅ **All original functionality preserved:**
- Client-side folder selection still works
- Desktop app compatibility maintained
- Drag & drop support unchanged
- No breaking changes to existing code

The app intelligently chooses the appropriate mode:
- **Server mode** when API is available
- **Client mode** when API is not available (original behavior)

## Testing

Tested scenarios:
- [x] Server mode with Docker
- [x] Server mode with local Node.js
- [x] Client mode fallback
- [x] Video playback in both modes
- [x] File filtering and search
- [x] Multiple camera angles
- [x] TrueNAS Scale deployment

See `TESTING.md` for detailed testing instructions.

## Documentation

- `SERVER_MODE.md` - Complete guide for server deployment
- `README_FORK.md` - Fork overview and quick start
- `TESTING.md` - Testing procedures
- Inline code comments for new functionality

## Use Cases

This enables:
1. **NAS Deployment** - TrueNAS Scale, Synology, QNAP, Unraid
2. **Family Sharing** - Multiple users accessing same footage
3. **Remote Access** - View footage from any device on network
4. **Automated Workflows** - No manual folder selection needed

## Future Enhancements (Not in this PR)

Potential future additions:
- Authentication/authorization
- Multi-user support with permissions
- File upload capability
- Metadata caching for faster loading
- WebSocket for real-time updates

## Breaking Changes

None. This is purely additive.

## Migration Guide

For existing users:
- No changes needed
- App works exactly as before
- Server mode is opt-in via Docker deployment

## Questions for Reviewers

1. Should server mode be in a separate branch or merged to main?
2. Any concerns about the dual-mode architecture?
3. Suggestions for the API design?
4. Should we add authentication in this PR or separately?

## Checklist

- [x] Code follows project style
- [x] All original functionality preserved
- [x] New features documented
- [x] Testing guide provided
- [x] Docker configuration included
- [x] No breaking changes
- [x] Backward compatible
- [x] Ready for review
