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

    // Convert server structure to match client-side format
    const events = [];
    
    for (const [folderType, folders] of Object.entries(structure)) {
      for (const folder of folders) {
        const event = {
          name: folder.name,
          type: folderType,
          files: {},
          serverMode: true
        };

        // Group files by camera angle
        for (const file of folder.files) {
          const fileName = file.name.toLowerCase();
          let camera = 'unknown';
          
          if (fileName.includes('front')) camera = 'front';
          else if (fileName.includes('back')) camera = 'back';
          else if (fileName.includes('left_repeater')) camera = 'left';
          else if (fileName.includes('right_repeater')) camera = 'right';
          else if (fileName.includes('left')) camera = 'leftPillar';
          else if (fileName.includes('right')) camera = 'rightPillar';

          event.files[camera] = {
            name: file.name,
            url: file.url,
            serverPath: file.path
          };
        }

        events.push(event);
      }
    }

    return events;
  }
};

// Export for use in main script
if (typeof window !== 'undefined') {
  window.ServerAPI = ServerAPI;
}
