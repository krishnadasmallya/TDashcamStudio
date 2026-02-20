import express from 'express';
import cors from 'cors';
import { readdir, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { createReadStream } from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;
const TESLACAM_PATH = process.env.TESLACAM_PATH || '/teslacam';

app.use(cors());
app.use(express.json());

// Serve static files from src directory
app.use(express.static('../src'));

// API endpoint to list directory structure
app.get('/api/files', async (req, res) => {
  try {
    const structure = await scanTeslaCamDirectory(TESLACAM_PATH);
    res.json(structure);
  } catch (error) {
    console.error('Error scanning directory:', error);
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
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
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
