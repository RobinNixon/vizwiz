// === UPDATED vizwiz.js ===

class VizWiz {
    constructor() {
        this.audioContext = null;
        this.audioElement = null;
        this.audioSource = null;
        this.analyser = null;
        this.canvas = null;
        this.ctx = null;
        this.currentVisualizer = null;
        this.visualizers = new Map();
        this.isPlaying = false;
        this.isFullscreen = false;
        this.repeatMode = 'none';
        this.dataArray = null;
        this.bufferLength = 0;
        this.elements = {};
    }
    
    init() {
        this.setupElements();
        this.setupAudioContext();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.registerVisualizers();
        // console.log('VizWiz initialized successfully');
    }
    
    setupElements() {
        this.elements = {
            fileBtn: document.getElementById('fileBtn'),
            fileInput: document.getElementById('fileInput'),
            playBtn: document.getElementById('playBtn'),
            playIcon: document.getElementById('playIcon'),
            repeatBtn: document.getElementById('repeatBtn'),
            repeatIcon: document.getElementById('repeatIcon'),
            progressBar: document.getElementById('progressBar'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            volumeSlider: document.getElementById('volumeSlider'),
            visualizerSelect: document.getElementById('visualizerSelect'),
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
            this.analyser.fftSize = 512;
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
        
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
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
    
    registerVisualizers() {
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
    
    // ... rest of the methods remain the same ...
    
    loadAudioFile(file, autoPlay = true) {
        try {
            const url = URL.createObjectURL(file);
            this.audioElement.src = url;
            
            this.elements.trackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
            this.elements.trackDetails.textContent = `${this.formatFileSize(file.size)} • ${file.type}`;
            
            if (autoPlay) {
                this.audioElement.addEventListener('loadedmetadata', () => {
                    setTimeout(() => {
                        if (!this.isPlaying) {
                            this.togglePlayback();
                        }
                    }, 100);
                }, { once: true });
            }
            
            // console.log('Audio file loaded:', file.name);
        } catch (error) {
            console.error('Failed to load audio file:', error);
        }
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
            }
        } catch (error) {
            console.error('Playback error:', error);
        }
    }
    
    switchVisualizer(id) {
        const VisualizerClass = this.visualizers.get(id);
        if (VisualizerClass) {
            // Stop current visualizer if running
            if (this.currentVisualizer && this.currentVisualizer.stopVisualization) {
                this.currentVisualizer.stopVisualization();
            }
            
            // Clear the canvas completely when switching
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width / devicePixelRatio, this.canvas.height / devicePixelRatio);
            
            this.currentVisualizer = new VisualizerClass();
            this.elements.visualizerSelect.value = id;
            
            // Initialize the visualizer with necessary components
            if (this.currentVisualizer.init) {
                this.currentVisualizer.init(this.elements);
            }
            
            // Start visualization if audio is playing
            if (this.isPlaying && this.currentVisualizer.startVisualization) {
                this.currentVisualizer.startVisualization(this.analyser, this.dataArray, this.ctx, this.canvas);
            }
            
            // console.log(`Switched to ${id} visualizer`);
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
    
    handleKeyPress(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                if (this.audioElement.src) {
                    this.togglePlayback();
                }
                break;
            case 'f':
                e.preventDefault();
                if (this.audioElement.src) {
                    this.toggleFullscreen();
                }
                break;
            case 'r':
                e.preventDefault();
                if (this.audioElement.src) {
                    this.toggleRepeatMode();
                }
                break;
            case 's':
                e.preventDefault();
                if (!this.isFullscreen && this.currentVisualizer && this.currentVisualizer.toggleSettings) {
                    this.currentVisualizer.toggleSettings();
                }
                break;
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const vizwiz = new VizWiz();
    vizwiz.init();
});

// ====================================
// === REGISTRY SYSTEM ===
// ====================================

// Global visualizer registry - create this BEFORE loading visualizers
window.VisualizerRegistry = {
    visualizers: [],
    
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
    }
};

// ====================================
// === UPDATED VISUALIZER TEMPLATE ===
// ====================================

// Example of how to update existing visualizers:
// At the end of bars.viz.js, replace the window.BarsVisualizer line with:

/*
// Auto-register this visualizer
if (window.VisualizerRegistry) {
    window.VisualizerRegistry.register('bars', 'Vertical Bars', BarsVisualizer);
} else {
    // Fallback for backward compatibility
    window.BarsVisualizer = BarsVisualizer;
}
*/

// And at the end of plasma.viz.js:

/*
// Auto-register this visualizer
if (window.VisualizerRegistry) {
    window.VisualizerRegistry.register('plasma', 'Plasma Flow', PlasmaVisualizer);
} else {
    // Fallback for backward compatibility
    window.PlasmaVisualizer = PlasmaVisualizer;
}
*/