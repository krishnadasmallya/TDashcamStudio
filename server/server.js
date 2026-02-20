import express from 'express';
import cors from 'cors';
import { readdir, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { createReadStream } from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;
const TESLACAM_PATH = process.env.TESLACAM_PATH || '/teslacam';

// Cache for file structure
let fileStructureCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.use(cors());
app.use(express.json());

// Serve static files from src directory
app.use(express.static('../src'));

// API endpoint to list directory structure
app.get('/api/files', async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if still valid
    if (fileStructureCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      console.log('Returning cached file structure');
      return res.json(fileStructureCache);
    }
    
    console.log('Scanning directory structure...');
    const structure = await scanTeslaCamDirectory(TESLACAM_PATH);
    
    // Update cache
    fileStructureCache = structure;
    cacheTimestamp = now;
    
    res.json(structure);
  } catch (error) {
    console.error('Error scanning directory:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get available dates
app.get('/api/dates', async (req, res) => {
  try {
    const now = Date.now();
    
    // Ensure cache is populated
    if (!fileStructureCache || !cacheTimestamp || (now - cacheTimestamp >= CACHE_DURATION)) {
      fileStructureCache = await scanTeslaCamDirectory(TESLACAM_PATH);
      cacheTimestamp = now;
    }
    
    // Extract dates per event type
    const datesByType = {
      RecentClips: new Set(),
      SavedClips: new Set(),
      SentryClips: new Set(),
      all: new Set()
    };
    
    for (const folder of Object.keys(fileStructureCache)) {
      for (const event of fileStructureCache[folder]) {
        const match = event.name.match(/(\d{4}-\d{2}-\d{2})/);
        if (match) {
          const date = match[1];
          datesByType.all.add(date);
          if (datesByType[folder]) {
            datesByType[folder].add(date);
          }
        }
      }
    }
    
    res.json({
      dates: {
        all: Array.from(datesByType.all).sort(),
        RecentClips: Array.from(datesByType.RecentClips).sort(),
        SavedClips: Array.from(datesByType.SavedClips).sort(),
        SentryClips: Array.from(datesByType.SentryClips).sort()
      },
      cacheAge: now - cacheTimestamp
    });
  } catch (error) {
    console.error('Error getting dates:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to invalidate cache
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('Refreshing cache...');
    fileStructureCache = await scanTeslaCamDirectory(TESLACAM_PATH);
    cacheTimestamp = Date.now();
    res.json({ success: true, message: 'Cache refreshed' });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to stream video files
app.get('/api/video/*', async (req, res) => {
  try {
    const filePath = join(TESLACAM_PATH, req.params[0]);
    const stats = await stat(filePath);
    
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      });
      
      createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': 'video/mp4',
      });
      createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

async function scanTeslaCamDirectory(basePath) {
  const structure = {
    RecentClips: [],
    SavedClips: [],
    SentryClips: []
  };

  for (const folder of Object.keys(structure)) {
    const folderPath = join(basePath, folder);
    try {
      const entries = await readdir(folderPath, { withFileTypes: true });
      
      // Check if files are directly in the folder (RecentClips style)
      const directVideoFiles = entries.filter(e => 
        e.isFile() && (e.name.endsWith('.mp4') || e.name.endsWith('.mov'))
      );
      
      if (directVideoFiles.length > 0) {
        // Group files by timestamp (e.g., "2026-02-20_11-14")
        const fileGroups = new Map();
        
        for (const file of directVideoFiles) {
          const match = file.name.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2})/);
          if (match) {
            const timestamp = match[1];
            if (!fileGroups.has(timestamp)) {
              fileGroups.set(timestamp, []);
            }
            fileGroups.get(timestamp).push(file.name);
          }
        }
        
        // Create events from grouped files
        for (const [timestamp, files] of fileGroups) {
          structure[folder].push({
            name: timestamp,
            path: folder,
            files: files.map(f => ({
              name: f,
              path: `${folder}/${f}`,
              url: `/api/video/${folder}/${f}`
            }))
          });
        }
      }
      
      // Also check for subdirectories (SavedClips/SentryClips style)
      const subdirs = entries.filter(e => e.isDirectory());
      for (const entry of subdirs) {
        const eventPath = join(folderPath, entry.name);
        const files = await readdir(eventPath);
        const videoFiles = files.filter(f => 
          f.endsWith('.mp4') || f.endsWith('.mov')
        );
        
        if (videoFiles.length > 0) {
          structure[folder].push({
            name: entry.name,
            path: `${folder}/${entry.name}`,
            files: videoFiles.map(f => ({
              name: f,
              path: `${folder}/${entry.name}/${f}`,
              url: `/api/video/${folder}/${entry.name}/${f}`
            }))
          });
        }
      }
    } catch (error) {
      console.warn(`Could not read ${folder}:`, error.message);
    }
  }

  return structure;
}

app.listen(PORT, () => {
  console.log(`TDashcam Server running on port ${PORT}`);
  console.log(`TeslaCam directory: ${TESLACAM_PATH}`);
  console.log(`Access the app at http://localhost:${PORT}`);
});
