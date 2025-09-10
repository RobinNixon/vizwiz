// Alternative Auto-Loader System
// This approach tries to load visualizers by scanning for common patterns

window.VisualizerAutoLoader = {
  // Common visualizer file patterns to try
  commonVisualizers: [
    'bars', 'blobs', 'bouncer', 'fractal', 'groove', 
    'kaleidoscope', 'oscilloscope', 'particles', 'plasma',
    'spiral', 'waveform', 'spectrum', 'circle', 'tunnel'
  ],
  
  async loadAvailableVisualizers() {
    console.log('Auto-loading visualizers...');
    const loadedCount = 0;
    
    for (const name of this.commonVisualizers) {
      try {
        await this.tryLoadVisualizer(name);
        loadedCount++;
      } catch (error) {
        // Silently ignore missing visualizers
        console.log(`Visualizer '${name}' not found, skipping...`);
      }
    }
    
    console.log(`Auto-loaded ${loadedCount} visualizers`);
    return loadedCount;
  },
  
  tryLoadVisualizer(name) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `visualizers/${name}.viz.js`;
      script.onload = () => resolve(name);
      script.onerror = () => reject(new Error(`${name} not found`));
      
      // Set a timeout to avoid hanging
      setTimeout(() => reject(new Error(`${name} timeout`)), 2000);
      
      document.head.appendChild(script);
    });
  }
};