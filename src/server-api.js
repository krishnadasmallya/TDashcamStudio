// Server Mode API Client
// This module provides server-side file access when SERVER_MODE is enabled

const ServerAPI = {
  enabled: false,
  baseUrl: '',

  async init() {
    // Check if server mode is available
    console.log('[ServerAPI] Checking for server mode...');
    try {
      const response = await fetch('/api/files');
      console.log('[ServerAPI] API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[ServerAPI] API returned data:', data);
        this.enabled = true;
        this.baseUrl = window.location.origin;
        console.log('[ServerAPI] ✅ Server mode enabled');
        return true;
      } else {
        console.log('[ServerAPI] API returned non-OK status:', response.status);
      }
    } catch (error) {
      console.log('[ServerAPI] ❌ Server mode not available:', error.message);
    }
    console.log('[ServerAPI] Falling back to client mode');
    return false;
  },

  async getFileStructure() {
    if (!this.enabled) return null;
    
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      return await response.json();
    } catch (error) {
      console.error('Error fetching file structure:', error);
      return null;
    }
  },

  getVideoUrl(path) {
    if (!this.enabled) return null;
    return `${this.baseUrl}/api/video/${path}`;
  },

  async loadServerFiles() {
    const structure = await this.getFileStructure();
    if (!structure) return null;

    console.log('[ServerAPI] Raw structure from server:', structure);

    // Convert server structure to match client-side format
    const events = [];
    
    for (const [folderType, folders] of Object.entries(structure)) {
      for (const folder of folders) {
        console.log('[ServerAPI] Processing folder:', folder.name);
        
        // Parse timestamp from folder name (e.g., "2024-02-20_17-30")
        const timestampMatch = folder.name.match(/(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2})/);
        let startTime = folder.name; // Default to folder name
        let eventTimestamp = null;
        
        if (timestampMatch) {
          const [, date, time] = timestampMatch;
          startTime = `${date}_${time}`;
          eventTimestamp = `${date}T${time.replace('-', ':')}:00`;
          console.log('[ServerAPI] Parsed timestamp:', { startTime, eventTimestamp });
        } else {
          console.warn('[ServerAPI] Could not parse timestamp from:', folder.name);
        }
        
        // Group files by minute timestamp to create segments
        const segmentMap = new Map();
        
        for (const file of folder.files) {
          // Extract minute timestamp from filename (e.g., "2024-02-20_17-30-45-front.mp4" -> "2024-02-20_17-30")
          const fileTimestampMatch = file.name.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2})-\d{2}/);
          const minuteTimestamp = fileTimestampMatch ? fileTimestampMatch[1] : startTime;
          
          if (!segmentMap.has(minuteTimestamp)) {
            segmentMap.set(minuteTimestamp, {
              timestamp: minuteTimestamp,
              files: {}
            });
          }
          
          const segment = segmentMap.get(minuteTimestamp);
          const fileName = file.name.toLowerCase();
          let camera = null;
          
          // Check most specific patterns first
          if (fileName.includes('front')) camera = 'front';
          else if (fileName.includes('back')) camera = 'back';
          else if (fileName.includes('left_pillar')) camera = 'leftPillar';
          else if (fileName.includes('right_pillar')) camera = 'rightPillar';
          else if (fileName.includes('left_repeater')) camera = 'left';
          else if (fileName.includes('right_repeater')) camera = 'right';
          
          if (camera) {
            // Create a pseudo-file object that works with getFileUrl
            segment.files[camera] = {
              name: file.name,
              url: file.url,
              serverPath: file.path,
              // Add properties that make it work like a File object
              size: 0,
              type: 'video/mp4'
            };
          }
        }
        
        const event = {
          eventId: `${folderType}/${folder.name}`,
          eventType: folderType,
          name: folder.name,
          startTime: startTime,
          eventTimestamp: eventTimestamp,
          segments: Array.from(segmentMap.values()).sort((a, b) => 
            a.timestamp.localeCompare(b.timestamp)
          ),
          serverMode: true
        };

        console.log('[ServerAPI] Created event:', event);
        events.push(event);
      }
    }

    console.log('[ServerAPI] Total events created:', events.length);
    return events;
  }
};

// Export for use in main script
if (typeof window !== 'undefined') {
  window.ServerAPI = ServerAPI;
}
