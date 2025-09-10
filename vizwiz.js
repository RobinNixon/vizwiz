// === ENHANCED vizwiz.js with Settings Memory ===

class VizWiz {
  constructor() {
    this.audioContext = null;
    this.audioElement = null;
    this.audioSource = null;
    this.analyser = null;
    this.mediaStream = null;
    this.isCapturing = false;
    this.canvas = null;
    this.ctx = null;
    this.currentVisualizer = null;
    this.visualizers = new Map();
    this.visualizerInstances = new Map(); // Store instances to preserve settings
    this.savedSettings = new Map(); // Store settings for each visualizer
    this.isPlaying = false;
    this.isFullscreen = false;
    this.repeatMode = 'none';
    this.dataArray = null;
    this.bufferLength = 0;
    this.elements = {};
    
    // Random visualizer switching
    this.randomMode = false;
    this.randomTimer = 0;
    this.forceMutateMode = false;
    this.randomMode = false;
    this.lastRandomSwitch = 0; // Store timestamp of last switch
    this.nextRandomInterval = this.getRandomInterval(); // Get initial interval
  }
  
  async init() {
    this.setupElements();
    this.setupAudioContext();
    this.setupEventListeners();
    this.setupDragAndDrop();
    await this.registerVisualizers();
    this.startGlobalAnimationLoop();
    // console.log('VizWiz initialized successfully');
  }
  
  // Global animation loop for random mode and other global effects
  startGlobalAnimationLoop() {
    const loop = () => {
      // Update random mode switching
      this.updateRandomMode();
      
      requestAnimationFrame(loop);
    };
    loop();
  }
  getRandomInterval() {
    // Generate random interval between 5 and 25 seconds (in milliseconds)
    return 5000 + Math.random() * 20000;
  }

  setupElements() {
    this.elements = {
      fileBtn: document.getElementById('fileBtn'),
      fileInput: document.getElementById('fileInput'),
      captureBtn: document.getElementById('captureBtn'),
      playBtn: document.getElementById('playBtn'),
      playIcon: document.getElementById('playIcon'),
      repeatBtn: document.getElementById('repeatBtn'),
      repeatIcon: document.getElementById('repeatIcon'),
      progressBar: document.getElementById('progressBar'),
      currentTime: document.getElementById('currentTime'),
      duration: document.getElementById('duration'),
      volumeSlider: document.getElementById('volumeSlider'),
      visualizerSelect: document.getElementById('visualizerSelect'),
      randomCheckbox: document.getElementById('randomCheckbox'),
      settingsBtn: document.getElementById('settingsBtn'),
      fullscreenBtn: document.getElementById('fullscreenBtn'),
      trackTitle: document.getElementById('trackTitle'),
      trackDetails: document.getElementById('trackDetails'),
      trackInfo: document.getElementById('trackInfo'),
      settingsPanel: document.getElementById('settingsPanel'),
      closeSettingsBtn: document.getElementById('closeSettingsBtn')
    };
    
    this.canvas = document.getElementById('visualizerCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.audioElement = document.getElementById('audioPlayer');
    this.resizeCanvas();
  }
  
  setupAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024; // Increased for better frequency resolution
      this.analyser.smoothingTimeConstant = 0.8; // Add smoothing for more stable visuals
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      // console.log('Audio context created successfully');
    } catch (error) {
      console.error('Failed to create audio context:', error);
    }
  }
  
  setupEventListeners() {
    this.elements.fileBtn.addEventListener('click', () => {
      this.elements.fileInput.click();
    });
    
    this.elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.loadAudioFile(e.target.files[0], true);
      }
    });
    
    this.elements.captureBtn.addEventListener('click', () => {
      this.toggleSystemAudioCapture();
    });
    
    this.elements.playBtn.addEventListener('click', () => {
      this.togglePlayback();
    });
    
    this.elements.repeatBtn.addEventListener('click', () => {
      this.toggleRepeatMode();
    });
    
    this.elements.progressBar.addEventListener('input', (e) => {
      const time = (e.target.value / 100) * this.audioElement.duration;
      this.audioElement.currentTime = time;
    });
    
    this.elements.volumeSlider.addEventListener('input', (e) => {
      this.audioElement.volume = e.target.value / 100;
    });
    
    this.elements.visualizerSelect.addEventListener('change', (e) => {
      this.switchVisualizer(e.target.value);
    });
    
    this.elements.randomCheckbox.addEventListener('change', (e) => {
      this.randomMode = e.target.checked;
      this.randomTimer = 0; // Reset timer
      this.forceMutateMode = this.randomMode;
      
      // Set global mutation flag
      window.VisualizerRegistry.globalMutationEnabled = this.forceMutateMode;
      
      // Apply to all existing visualizer instances
      if (this.forceMutateMode) {
        this.enableMutationOnAllVisualizers();
      }
      
      // Apply to current visualizer immediately
      if (this.currentVisualizer && this.currentVisualizer.setSetting) {
        this.currentVisualizer.setSetting('mutateMode', this.forceMutateMode);
        this.updateUIFromVisualizer(this.currentVisualizer);
      }
      
      // console.log('Random visualizer mode:', this.randomMode ? 'ON' : 'OFF');
    });
    
    this.elements.settingsBtn.addEventListener('click', () => {
      if (this.currentVisualizer && this.currentVisualizer.toggleSettings) {
        this.currentVisualizer.toggleSettings();
      }
    });
    
    this.elements.closeSettingsBtn.addEventListener('click', () => {
      if (this.currentVisualizer && this.currentVisualizer.closeSettings) {
        this.currentVisualizer.closeSettings();
      }
    });
    
    // Help system event listeners
    const helpBtn = document.getElementById('helpBtn');
    const helpPanel = document.getElementById('helpPanel');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    
    if (helpBtn && helpPanel && closeHelpBtn) {
      helpBtn.addEventListener('click', () => {
        helpPanel.classList.toggle('hidden');
      });
      
      closeHelpBtn.addEventListener('click', () => {
        helpPanel.classList.add('hidden');
      });
    }
    
    this.elements.fullscreenBtn.addEventListener('click', () => {
      this.toggleFullscreen();
    });
    
    this.audioElement.addEventListener('loadedmetadata', () => {
      this.onAudioLoaded();
    });
    
    this.audioElement.addEventListener('timeupdate', () => {
      this.updateProgress();
    });
    
    this.audioElement.addEventListener('ended', () => {
      this.onTrackEnded();
    });
    
    this.canvas.addEventListener('click', () => {
      if (this.audioElement.src) {
        this.togglePlayback();
      }
    });
    
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }
  
  setupDragAndDrop() {
    const container = document.getElementById('visualizerContainer');
    
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      container.classList.add('dragover');
    });
    
    container.addEventListener('dragleave', () => {
      container.classList.remove('dragover');
    });
    
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      container.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        for (let file of files) {
          if (file.type.startsWith('audio/')) {
            this.loadAudioFile(file, true);
            break;
          }
        }
      }
    });
  }
  
  async registerVisualizers() {
    // Load visualizers dynamically from manifest
    await this.loadVisualizersFromManifest();
    
    // Check for the global visualizer registry
    if (window.VisualizerRegistry) {
      const registeredVisualizers = window.VisualizerRegistry.getAll();
      
      registeredVisualizers.forEach(({ id, name, class: VisualizerClass }) => {
        this.visualizers.set(id, VisualizerClass);
      // console.log(`Registered ${id} visualizer: ${name}`);
      });
      
      // Populate the dropdown
      this.populateVisualizerDropdown(registeredVisualizers);
      
      // Default to first available visualizer
      if (registeredVisualizers.length > 0) {
        this.switchVisualizer(registeredVisualizers[0].id);
      }
    } else {
      console.warn('VisualizerRegistry not found. Make sure visualizer scripts are loaded.');
    }
  }
  
  async loadVisualizersFromManifest() {
    try {
      // Method 1: Try to load from manifest (preferred)
      if (window.VisualizerManifest) {
        await this.loadFromManifest();
        return;
      }
      
      // Method 2: Try auto-loader as fallback
      if (window.VisualizerAutoLoader) {
        console.log('Manifest not found, trying auto-loader...');
        await window.VisualizerAutoLoader.loadAvailableVisualizers();
        return;
      }
      
      // Method 3: Fallback message
      console.warn('No dynamic loading system found. Visualizers should be loaded via HTML script tags.');
      
    } catch (error) {
      console.error('Error loading visualizers:', error);
    }
  }
  
  async loadFromManifest() {
    const manifest = window.VisualizerManifest;
    console.log(`Loading ${manifest.length} visualizers from manifest...`);
    
    // Load each visualizer script dynamically
    const loadPromises = manifest.map(visualizer => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `visualizers/${visualizer.file}`;
        script.onload = () => {
          console.log(`✓ Loaded ${visualizer.name} by ${visualizer.author}`);
          resolve(visualizer);
        };
        script.onerror = () => {
          console.error(`✗ Failed to load ${visualizer.name} (${visualizer.file})`);
          reject(new Error(`Failed to load ${visualizer.file}`));
        };
        document.head.appendChild(script);
      });
    });
    
    // Wait for all visualizers to load
    const results = await Promise.allSettled(loadPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Visualizer loading complete: ${successful} successful, ${failed} failed`);
    
    if (failed > 0) {
      console.warn(`Some visualizers failed to load. Check that all files exist in the visualizers/ directory.`);
    }
  }
  
  populateVisualizerDropdown(visualizers) {
    const select = this.elements.visualizerSelect;
    select.innerHTML = ''; // Clear existing options
    
    visualizers.forEach(({ id, name }) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      select.appendChild(option);
    });
    
    // console.log(`Populated dropdown with ${visualizers.length} visualizers`);
  }
  
  // Enable mutation mode on all visualizer instances
  enableMutationOnAllVisualizers() {
    this.visualizerInstances.forEach((visualizer, id) => {
      if (visualizer.setSetting) {
        visualizer.setSetting('mutateMode', true);
        // console.log(`Enabled mutation mode on ${id} visualizer`);
      }
    });
    
    // Also update saved settings
    this.savedSettings.forEach((settings, id) => {
      settings.mutateMode = true;
    });
  }
  
  // Get a random visualizer ID that's different from current
  getRandomVisualizerId() {
    const allIds = Array.from(this.visualizers.keys());
    if (allIds.length <= 1) return null;
    
    const currentId = this.elements.visualizerSelect.value;
    const availableIds = allIds.filter(id => id !== currentId);
    
    return availableIds[Math.floor(Math.random() * availableIds.length)];
  }
  
  // Handle random visualizer switching
  updateRandomMode() {
    if (!this.randomMode || !this.isPlaying) return;
    
    const currentTime = Date.now();
      
    // Initialize timestamp if this is the first call
    if (this.lastRandomSwitch === 0) {
      this.lastRandomSwitch = currentTime;
      return;
    }
    
    // Check if enough time has passed
    if (currentTime - this.lastRandomSwitch >= this.nextRandomInterval) {
      this.lastRandomSwitch = currentTime;
      this.nextRandomInterval = this.getRandomInterval();
      // console.log(`Next switch in ${this.nextRandomInterval / 1000}s`);
 
      const randomId = this.getRandomVisualizerId();
      if (randomId) {
        // console.log(`Random switch to: ${randomId}`);
        this.switchVisualizer(randomId);
        setTimeout(() => window.VisualizerRegistry.resetToDefaults(this.visualizerInstances.get(randomId)), 10);
      }
    }
  }
  
  saveCurrentVisualizerSettings() {
    if (!this.currentVisualizer) return;
    
    const currentId = this.elements.visualizerSelect.value;
    const settings = {};
    
    // Get the schema to know what settings to save
    const schema = this.currentVisualizer.constructor.getSettingsSchema();
    if (schema && schema.settings) {
      Object.keys(schema.settings).forEach(key => {
        // Get the current value from the visualizer instance
        if (this.currentVisualizer.hasOwnProperty(key)) {
          settings[key] = this.currentVisualizer[key];
        }
      });
    }
    
    this.savedSettings.set(currentId, settings);
    // console.log(`Saved settings for ${currentId}:`, settings);
  }
  
  // Restore settings for a visualizer
  restoreVisualizerSettings(visualizer, id) {
    const savedSettings = this.savedSettings.get(id);
    if (!savedSettings) return;
    
    // console.log(`Restoring settings for ${id}:`, savedSettings);
    
    // Apply each saved setting
    Object.entries(savedSettings).forEach(([key, value]) => {
      if (visualizer.setSetting) {
        visualizer.setSetting(key, value);
      } else {
        // Fallback: set property directly
        visualizer[key] = value;
      }
    });
    
    // Update the UI to reflect the restored settings
    this.updateUIFromVisualizer(visualizer);
  }
  
  // Update UI controls to match visualizer settings
  updateUIFromVisualizer(visualizer) {
    const schema = visualizer.constructor.getSettingsSchema();
    if (!schema || !schema.settings) return;
    
    Object.entries(schema.settings).forEach(([key, setting]) => {
      const element = document.getElementById(key);
      if (!element || !visualizer.hasOwnProperty(key)) return;
      
      const value = visualizer[key];
      
      if (element.type === 'range') {
        element.value = value;
        const valueElement = document.getElementById(key + 'Value');
        if (valueElement) {
          const displayValue = setting.unit ? value + setting.unit : value;
          valueElement.textContent = displayValue;
        }
      } else if (element.type === 'checkbox') {
        element.checked = value;
        
        // Special handling for mutation mode
        if (key === 'mutateMode') {
          const statusSpan = element.closest('.setting-item')?.querySelector('.mutation-status');
          if (statusSpan) {
            statusSpan.textContent = value ? ' 🎲 ACTIVE' : '';
            statusSpan.style.color = value ? '#6366f1' : '';
            statusSpan.style.fontWeight = value ? 'bold' : '';
          }
        }
      } else if (element.tagName === 'SELECT') {
        element.value = value;
      }
    });
  }
  
  switchVisualizer(id) {
    const VisualizerClass = this.visualizers.get(id);
    if (!VisualizerClass) return;
    
    // Save current visualizer settings before switching
    if (this.currentVisualizer) {
      this.saveCurrentVisualizerSettings();
      
      // Stop current visualizer
      if (this.currentVisualizer.stopVisualization) {
        this.currentVisualizer.stopVisualization();
      }
    }
    
    // Check if we already have an instance of this visualizer
    let visualizer = this.visualizerInstances.get(id);
    
    if (!visualizer) {
      // Create new instance if we don't have one
      visualizer = new VisualizerClass();
      this.visualizerInstances.set(id, visualizer);
      
      // Initialize the visualizer
      if (visualizer.init) {
        visualizer.init(this.elements);
      }
      
      // Apply force mutate mode if enabled
      if (this.forceMutateMode && visualizer.setSetting) {
        visualizer.setSetting('mutateMode', true);
      }
      
      // console.log(`Created new instance of ${id} visualizer`);
    } else {
      // Reuse existing instance and restore its settings
      this.restoreVisualizerSettings(visualizer, id);
      
      // Apply force mutate mode if enabled (overrides saved settings)
      if (this.forceMutateMode && visualizer.setSetting) {
        visualizer.setSetting('mutateMode', true);
      }
      
      // console.log(`Reusing existing instance of ${id} visualizer`);
    }
    
    // Clear the canvas completely when switching
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width / devicePixelRatio, this.canvas.height / devicePixelRatio);
    
    this.currentVisualizer = visualizer;
    this.elements.visualizerSelect.value = id;
    
    // Rebuild settings UI for this visualizer
    if (this.currentVisualizer.buildVisualizerSettings) {
      this.currentVisualizer.buildVisualizerSettings();
      // Update UI to match current settings
      this.updateUIFromVisualizer(this.currentVisualizer);
    }
    
    // Start visualization if audio is playing
    if (this.isPlaying && this.currentVisualizer.startVisualization) {
      this.currentVisualizer.startVisualization(this.analyser, this.dataArray, this.ctx, this.canvas);
      // Ensure trackInfo stays hidden when switching during playback
      this.elements.trackInfo.classList.add('playing');
    }
    
    // console.log(`Switched to ${id} visualizer`);
  }
  
  // Add method to clear all saved settings (useful for debugging)
  clearAllSavedSettings() {
    this.savedSettings.clear();
    this.visualizerInstances.clear();
    // console.log('Cleared all saved settings and instances');
  }
  
  loadAudioFile(file, autoPlay = true) {
    try {
      // Check for unsupported formats first
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.split('.').pop();
      
      // List of unsupported formats
      const unsupportedFormats = ['wma', 'wmv', 'asf'];
      
      if (unsupportedFormats.includes(fileExtension)) {
        this.showUnsupportedFormatMessage(file.name, fileExtension);
        return;
      }
      
      // Also check MIME type as backup
      if (file.type && file.type.includes('windows-media')) {
        this.showUnsupportedFormatMessage(file.name, 'WMA');
        return;
      }

      // Stop current playback if playing
      if (this.isPlaying) {
        this.audioElement.pause();
        this.isPlaying = false;
        this.elements.playIcon.textContent = '▶️';
        if (this.currentVisualizer && this.currentVisualizer.stopVisualization) {
          this.currentVisualizer.stopVisualization();
        }
      }

      const url = URL.createObjectURL(file);
      this.audioElement.src = url;
      
      this.elements.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
      this.elements.trackDetails.textContent = `${this.formatFileSize(file.size)} • ${file.type}`;
      
      if (autoPlay) {
        const playWhenReady = () => {
          if (this.audioElement.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            setTimeout(() => {
              if (!this.isPlaying) {
                this.togglePlayback();
              }
            }, 100);
          } else {
            // Wait a bit more if not ready
            setTimeout(playWhenReady, 50);
          }
        };
        
        // Start checking if ready
        playWhenReady();
      }
      
      // console.log('Audio file loaded:', file.name);
    } catch (error) {
      console.error('Failed to load audio file:', error);
    }
  }

  showUnsupportedFormatMessage(fileName, format) {
    // Update the UI to show the error
    this.elements.trackTitle.textContent = `Unsupported Format: ${fileName}`;
    this.elements.trackDetails.textContent = `${format.toUpperCase()} files aren't supported by web browsers. Try converting to MP3 first.`;
    
    // Disable controls
    this.elements.playBtn.disabled = true;
    this.elements.repeatBtn.disabled = true;
    this.elements.progressBar.disabled = true;
    this.elements.visualizerSelect.disabled = true;
    this.elements.settingsBtn.disabled = true;
    this.elements.fullscreenBtn.disabled = true;
    
    // console.warn(`Unsupported audio format: ${format}`);
  }
  
  onAudioLoaded() {
    if (!this.audioSource) {
      this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
      this.audioSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
    
    this.elements.playBtn.disabled = false;
    this.elements.repeatBtn.disabled = false;
    this.elements.progressBar.disabled = false;
    this.elements.visualizerSelect.disabled = false;
    this.elements.settingsBtn.disabled = false;
    this.elements.fullscreenBtn.disabled = false;
    
    this.elements.duration.textContent = this.formatTime(this.audioElement.duration);
    // console.log('Audio loaded and connected to analyser');
  }
 
  async togglePlayback() {
    try {
      if (this.isCapturing) {
        // Handle system audio capture playback
        if (this.isPlaying) {
          this.isPlaying = false;
          this.elements.playIcon.textContent = '▶️';
          this.elements.trackInfo.classList.remove('playing');
          if (this.currentVisualizer && this.currentVisualizer.stopVisualization) {
            this.currentVisualizer.stopVisualization();
          }
        } else {
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
          
          this.isPlaying = true;
          this.elements.playIcon.textContent = '⏸️';
          this.elements.trackInfo.classList.add('playing');
          if (this.currentVisualizer && this.currentVisualizer.startVisualization) {
            this.currentVisualizer.startVisualization(this.analyser, this.dataArray, this.ctx, this.canvas);
          }
          
          // Reset random timer when starting playback
          this.randomTimer = 0;
        }
      } else {
        // Handle regular file playback
        if (this.isPlaying) {
          this.audioElement.pause();
          this.isPlaying = false;
          this.elements.playIcon.textContent = '▶️';
          if (this.currentVisualizer && this.currentVisualizer.stopVisualization) {
            this.currentVisualizer.stopVisualization();
          }
        } else {
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
          
          await this.audioElement.play();
          this.isPlaying = true;
          this.elements.playIcon.textContent = '⏸️';
          this.elements.trackInfo.classList.add('playing');
          if (this.currentVisualizer && this.currentVisualizer.startVisualization) {
            this.currentVisualizer.startVisualization(this.analyser, this.dataArray, this.ctx, this.canvas);
          }
          
          // Track performance for the new visualizer
          this.lastRenderStart = performance.now();
          
          // Reset random timer when starting playback
          this.randomTimer = 0;
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  }
  
  updateProgress() {
    const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
    this.elements.progressBar.value = progress;
    this.elements.currentTime.textContent = this.formatTime(this.audioElement.currentTime);
  }
  
  onTrackEnded() {
    if (this.repeatMode === 'one') {
      this.audioElement.currentTime = 0;
      this.audioElement.play();
    } else {
      this.isPlaying = false;
      this.elements.playIcon.textContent = '▶️';
      if (this.currentVisualizer && this.currentVisualizer.stopVisualization) {
        this.currentVisualizer.stopVisualization();
      }
      this.elements.progressBar.value = 0;
    }
  }
  
  toggleRepeatMode() {
    switch (this.repeatMode) {
      case 'none':
        this.repeatMode = 'one';
        this.elements.repeatIcon.textContent = '🔄';
        this.elements.repeatBtn.classList.add('active');
        this.elements.repeatBtn.title = 'Repeat: Current Track';
        break;
      case 'one':
        this.repeatMode = 'none';
        this.elements.repeatIcon.textContent = '↩️';
        this.elements.repeatBtn.classList.remove('active');
        this.elements.repeatBtn.title = 'Repeat: Off';
        break;
    }
    // console.log('Repeat mode:', this.repeatMode);
  }
  
  toggleFullscreen() {
    const container = document.getElementById('visualizerContainer');
    
    if (!this.isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    // Notify current visualizer about canvas resize
    if (this.currentVisualizer && this.currentVisualizer.onCanvasResize) {
      this.currentVisualizer.onCanvasResize(rect.width, rect.height);
    }
  }
  
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  
  handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (this.audioElement.src || this.isCapturing) {
          this.togglePlayback();
        }
        break;
      case 'KeyF':
        e.preventDefault();
        this.toggleFullscreen();
        break;
      case 'KeyR':
        e.preventDefault();
        this.elements.randomCheckbox.checked = !this.elements.randomCheckbox.checked;
        this.elements.randomCheckbox.dispatchEvent(new Event('change'));
        break;
      case 'KeyS':
        e.preventDefault();
        if (this.currentVisualizer && this.currentVisualizer.toggleSettings) {
          this.currentVisualizer.toggleSettings();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.switchToPreviousVisualizer();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.switchToNextVisualizer();
        break;
      case 'KeyM':
        e.preventDefault();
        if (this.currentVisualizer && this.currentVisualizer.setSetting) {
          const currentMutation = this.currentVisualizer.mutationEnabled || false;
          this.currentVisualizer.setSetting('mutateMode', !currentMutation);
          this.updateUIFromVisualizer(this.currentVisualizer);
        }
        break;
      case 'KeyP':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.togglePerformanceMonitor();
        }
        break;
      case 'KeyC':
        e.preventDefault();
        this.toggleSystemAudioCapture();
        break;
    }
  }
  
  switchToPreviousVisualizer() {
    const select = this.elements.visualizerSelect;
    const currentIndex = select.selectedIndex;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : select.options.length - 1;
    select.selectedIndex = newIndex;
    this.switchVisualizer(select.value);
  }
  
  switchToNextVisualizer() {
    const select = this.elements.visualizerSelect;
    const currentIndex = select.selectedIndex;
    const newIndex = currentIndex < select.options.length - 1 ? currentIndex + 1 : 0;
    select.selectedIndex = newIndex;
    this.switchVisualizer(select.value);
  }
  
  togglePerformanceMonitor() {
    let perfDiv = document.getElementById('performanceStats');
    
    if (!perfDiv) {
      // Create performance monitor
      perfDiv = document.createElement('div');
      perfDiv.id = 'performanceStats';
      perfDiv.className = 'performance-stats';
      document.body.appendChild(perfDiv);
      
      // Update performance stats every second
      this.perfInterval = setInterval(() => {
        const stats = window.VisualizerRegistry.getPerformanceStats();
        perfDiv.innerHTML = `FPS: ${stats.fps}<br>Render: ${stats.renderTime}`;
      }, 1000);
    } else {
      // Remove performance monitor
      perfDiv.remove();
      if (this.perfInterval) {
        clearInterval(this.perfInterval);
        this.perfInterval = null;
      }
    }
  }
  
  async toggleSystemAudioCapture() {
    if (this.isCapturing) {
      // Stop capturing
      this.stopSystemAudioCapture();
    } else {
      // Start capturing
      await this.startSystemAudioCapture();
    }
  }
  
  async startSystemAudioCapture() {
    try {
      // Check if getDisplayMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen capture with audio is not supported in this browser. Please use Chrome, Edge, or Firefox.');
        return;
      }
      
      // Update UI to show we're requesting permission
      this.elements.captureBtn.textContent = '🔄 Requesting Permission...';
      this.elements.captureBtn.disabled = true;
      
      // Request screen capture with audio (video is required for getDisplayMedia to work)
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Required for getDisplayMedia, but we'll ignore the video track
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000
        }
      });
      
      // Check if audio track is available
      const audioTracks = this.mediaStream.getAudioTracks();
      const videoTracks = this.mediaStream.getVideoTracks();
      
      if (audioTracks.length === 0) {
        alert('No audio track found. Make sure to:\n1. Select "Share system audio" or "Share tab audio" in the dialog\n2. Choose a tab or application that is currently playing audio\n3. Grant permission when prompted');
        this.mediaStream.getTracks().forEach(track => track.stop());
        return;
      }
      
      // Stop the video track since we only need audio
      videoTracks.forEach(track => track.stop());
      
      // Stop current audio if playing
      if (this.isPlaying) {
        this.audioElement.pause();
        this.isPlaying = false;
        this.elements.playIcon.textContent = '▶️';
        if (this.currentVisualizer && this.currentVisualizer.stopVisualization) {
          this.currentVisualizer.stopVisualization();
        }
      }
      
      // Create audio context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Connect the media stream to the analyser
      if (this.audioSource) {
        this.audioSource.disconnect();
      }
      
      this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.audioSource.connect(this.analyser);
      
      // Update UI
      this.isCapturing = true;
      this.elements.captureBtn.innerHTML = '<span>⏹️</span> Stop Capture';
      this.elements.captureBtn.classList.add('active');
      this.elements.captureBtn.disabled = false; // Re-enable the button
      this.elements.trackTitle.textContent = 'System Audio Capture';
      this.elements.trackDetails.textContent = 'Capturing audio from your system';
      
      // Enable controls
      this.elements.playBtn.disabled = false;
      this.elements.visualizerSelect.disabled = false;
      this.elements.settingsBtn.disabled = false;
      this.elements.fullscreenBtn.disabled = false;
      
      // Auto-start visualization
      this.isPlaying = true;
      this.elements.playIcon.textContent = '⏸️';
      this.elements.trackInfo.classList.add('playing');
      if (this.currentVisualizer && this.currentVisualizer.startVisualization) {
        this.currentVisualizer.startVisualization(this.analyser, this.dataArray, this.ctx, this.canvas);
      }
      
      // Handle stream ending
      this.mediaStream.getAudioTracks()[0].addEventListener('ended', () => {
        this.stopSystemAudioCapture();
      });
      
      console.log('System audio capture started successfully');
      console.log('Audio tracks:', this.mediaStream.getAudioTracks().length);
      console.log('Video tracks:', this.mediaStream.getVideoTracks().length);
      
    } catch (error) {
      console.error('Failed to start system audio capture:', error);
      
      // Reset button state
      this.elements.captureBtn.innerHTML = '<span>🎵</span> Capture System Audio';
      this.elements.captureBtn.disabled = false;
      
      let errorMessage = 'Failed to capture system audio.\n\n';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Permission was denied. Please:\n1. Click "Capture System Audio" again\n2. Select "Allow" when prompted\n3. Choose "Share system audio" or "Share tab audio"\n4. Select a tab/app that is playing audio';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'This feature requires a modern browser (Chrome, Edge, or Firefox).\nSafari is not supported.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No audio source found. Make sure:\n1. An application is currently playing audio\n2. You select "Share system audio" in the dialog\n3. Your system audio is not muted';
      } else {
        errorMessage += `Error: ${error.message}\n\nTips:\n• Try selecting "Entire Screen" and check "Share system audio"\n• Make sure audio is playing from another app\n• Use Chrome or Edge for best compatibility`;
      }
      
      alert(errorMessage);
    }
  }
  
  stopSystemAudioCapture() {
    if (this.mediaStream) {
      // Stop all tracks
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }
    
    // Update UI
    this.isCapturing = false;
    this.isPlaying = false;
    this.elements.captureBtn.innerHTML = '<span>🎵</span> Capture System Audio';
    this.elements.captureBtn.classList.remove('active');
    this.elements.playIcon.textContent = '▶️';
    this.elements.trackInfo.classList.remove('playing');
    
    // Stop visualization
    if (this.currentVisualizer && this.currentVisualizer.stopVisualization) {
      this.currentVisualizer.stopVisualization();
    }
    
    // Reset track info
    this.elements.trackTitle.innerHTML = `
      <div style='font-size:.65em; color:#0df'>
        VizWiz &copy; 2025 Robin Nixon
      </div>
      Load/drop music file or capture audio to begin
    `;
    this.elements.trackDetails.textContent = 'Drag & drop, click "Load Music", or capture system audio';
    
    // Disable some controls
    this.elements.playBtn.disabled = true;
    this.elements.repeatBtn.disabled = true;
    this.elements.progressBar.disabled = true;
    
    console.log('System audio capture stopped');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const vizwiz = new VizWiz();
  await vizwiz.init();
  
  // Expose vizwiz globally for debugging
  window.vizwiz = vizwiz;
});

// Global visualizer registry - create this BEFORE loading visualizers
window.VisualizerRegistry = {
  visualizers: [],
  
  // Global mutation control
  globalMutationEnabled: false,
  
  register(id, name, visualizerClass) {
    this.visualizers.push({
      id: id,
      name: name,
      class: visualizerClass
    });
    // console.log(`Registered visualizer: ${id} (${name})`);
  },

  getAll() {
    return this.visualizers;
  },
  
  get(id) {
    return this.visualizers.find(v => v.id === id);
  },
  
  // === SHARED UTILITIES FOR ALL VISUALIZERS ===
  
  // Performance monitoring
  performanceStats: {
    frameCount: 0,
    lastFpsUpdate: 0,
    fps: 0,
    renderTime: 0
  },
  
  /**
   * Monitor performance and provide stats
   */
  updatePerformanceStats(renderStartTime) {
    this.performanceStats.frameCount++;
    this.performanceStats.renderTime = performance.now() - renderStartTime;
    
    const now = performance.now();
    if (now - this.performanceStats.lastFpsUpdate >= 1000) {
      this.performanceStats.fps = this.performanceStats.frameCount;
      this.performanceStats.frameCount = 0;
      this.performanceStats.lastFpsUpdate = now;
    }
  },
  
  /**
   * Get current performance stats
   */
  getPerformanceStats() {
    return {
      fps: this.performanceStats.fps,
      renderTime: this.performanceStats.renderTime.toFixed(2) + 'ms'
    };
  },
  
  /**
   * Clean floating point numbers for UI display based on step precision
   */
  cleanValue(value, step) {
    if (!step || step >= 1) return Math.round(value);
    
    return value.toFixed(1) * 1;
  },
  
  /**
   * Update a UI control with proper value formatting
   */
  updateUIControl(visualizer, key, newValue, highlight = false) {
    const element = document.getElementById(key);
    if (!element) return;
    
    const schema = visualizer.constructor.getSettingsSchema();
    const setting = schema.settings[key];
    
    // Clean the value for display
    let displayValue = newValue;
    if (setting && setting.step && typeof newValue === 'number') {
      displayValue = this.cleanValue(newValue, setting.step);
    }
    
    // Update the control value
    if (element.type === 'range') {
      element.value = displayValue;
      
      const valueElement = document.getElementById(key + 'Value');
      if (valueElement) {
        const finalDisplay = setting && setting.unit ? 
          displayValue + setting.unit : displayValue;
        valueElement.textContent = finalDisplay;
      }
    } else if (element.type === 'checkbox') {
      element.checked = newValue;
    } else if (element.tagName === 'SELECT') {
      element.value = newValue;
    }
    
    // Add visual feedback for mutations
    if (highlight && visualizer.highlightMutatedControl) {
      visualizer.highlightMutatedControl(element, key);
    }
  },
  
  /**
   * Apply mutations to a visualizer using its mutation settings
   */
  applyMutations(visualizer) {
    const mutations = [];
    const mutationSettings = visualizer.constructor.getMutationSettings();
    
    if (!mutationSettings) return [];
    
    Object.entries(mutationSettings).forEach(([key, config]) => {
      if (Math.random() < config.probability) {
        let newValue;
        
        if (config.values) {
          newValue = config.values[Math.floor(Math.random() * config.values.length)];
        } else if (config.range) {
          newValue = config.range.min + Math.random() * (config.range.max - config.range.min);
          if (config.step) {
            newValue = this.cleanValue(newValue, config.step);
          }
        }
        
        mutations.push({
          key: key,
          value: newValue,
          apply: () => {
            visualizer.setSetting(key, newValue);
            this.updateUIControl(visualizer, key, newValue, true);
          }
        });
      }
    });
    
    mutations.forEach(mutation => mutation.apply());
    
    if (mutations.length > 0) {
      // console.log(`Applied ${mutations.length} mutations:`, mutations.map(m => `${m.key}=${m.value}`).join(', '));
    }
    
    return mutations;
  },
  
  /**
   * Analyze frequency data and return structured audio information
   */
  analyzeFrequencyData(dataArray, sensitivity = 1.0) {
    const length = dataArray.length;
    const bassEnd = Math.floor(length * 0.1);      // 0-10% for bass
    const midEnd = Math.floor(length * 0.4);       // 10-40% for mids  
    const trebleEnd = Math.floor(length * 0.8);    // 40-80% for treble
    
    // Calculate averages for each band
    let bassSum = 0, midSum = 0, trebleSum = 0, highSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += dataArray[i];
    }
    
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += dataArray[i];
    }
    
    for (let i = midEnd; i < trebleEnd; i++) {
      trebleSum += dataArray[i];
    }
    
    for (let i = trebleEnd; i < length; i++) {
      highSum += dataArray[i];
    }
    
    // Normalize and apply sensitivity
    const bass = (bassSum / bassEnd / 255) * sensitivity;
    const mid = (midSum / (midEnd - bassEnd) / 255) * sensitivity;
    const treble = (trebleSum / (trebleEnd - midEnd) / 255) * sensitivity;
    const high = (highSum / (length - trebleEnd) / 255) * sensitivity;
    
    const overall = (bass + mid + treble + high) / 4;
    
    return {
      bass: Math.min(1, bass),
      mid: Math.min(1, mid), 
      treble: Math.min(1, treble),
      high: Math.min(1, high),
      overall: Math.min(1, overall),
      peak: Math.max(bass, mid, treble, high)
    };
  },
  
  /**
   * Reset visualizer settings to defaults
   */
  resetToDefaults(visualizer) {
    visualizer.mutationEnabled = false;
    visualizer.mutationTimer = 0;
    
    const schema = visualizer.constructor.getSettingsSchema();
    if (schema) {
      Object.entries(schema.settings).forEach(([key, setting]) => {
        if (key === 'mutateMode') {
          visualizer.mutationEnabled = setting.default;
        }
        
        visualizer.setSetting(key, setting.default);
        
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'range') {
            element.value = setting.default;
            const valueElement = document.getElementById(key + 'Value');
            if (valueElement) {
              valueElement.textContent = setting.default + (setting.unit || '');
            }
          } else if (element.type === 'checkbox') {
            element.checked = setting.default;
          } else if (element.tagName === 'SELECT') {
            element.value = setting.default;
          }
        }
      });
    }
    
    // console.log('Settings reset to defaults');
  }
};