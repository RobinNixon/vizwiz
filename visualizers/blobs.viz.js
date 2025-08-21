class BlobVisualizer {
  constructor() {
    // Core properties
    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;
    this.elements = null;
    
    // Blob properties
    this.blobs = [];
    this.maxBlobs = 50;
    this.blobSizeMin = 10;
    this.blobSizeMax = 150;
    this.blobSpeedMin = 0.2;
    this.blobSpeedMax = 1.5;
    this.blobOpacity = 0.7;
    this.blobLifespan = 500; // frames
    
    // Audio response properties
    this.sensitivity = 1.0;
    this.smoothing = 0.8;
    this.previousData = null;
    
    // Color properties
    this.colorPalette = 'rainbow';
    this.backgroundStyle = 'dark';
    
    // Mutation properties
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 300;
    
    // Available color palettes
    this.colorPalettes = {
      rainbow: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
      pastel: ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#d9baff', '#ffb3e6', '#ffcccb', '#c9f3d2', '#c5e3f6', '#e2cef5', '#f9d6e5'],
      neon: ['#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00', '#0000ff', '#ff8000', '#ff0080', '#80ff00', '#0080ff', '#8000ff', '#00ff80'],
      fire: ['#ff3800', '#ff5400', '#ff7100', '#ff8d00', '#ffaa00', '#ffc600', '#ffe300', '#ffff00', '#ffff33', '#ffff66'],
      ocean: ['#001f3f', '#003366', '#00468b', '#0059b3', '#0074d9', '#0080ff', '#0099ff', '#00b3ff', '#00ccff', '#00e6ff', '#00ffff'],
      forest: ['#004d00', '#006600', '#008000', '#009900', '#00b300', '#00cc00', '#00e600', '#00ff00', '#33ff33', '#66ff66', '#99ff99']
    };
    
    // Background styles
    this.backgroundStyles = {
      dark: '#0a0a0a',
      black: '#000000',
      navy: '#0a0a1a',
      purple: '#1a0a1a',
      blue: '#0a0a2a',
      gradient: 'gradient'
    };
  }
  
  init(elements) {
    this.elements = elements;
    this.buildVisualizerSettings();
    
    // Set up reset settings button listener
    const resetBtn = document.getElementById('resetSettings');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetVisualizerSettings();
      });
    }
    this.resetVisualizerSettings();
  }
  
  startVisualization(analyser, dataArray, ctx, canvas) {
    this.analyser = analyser;
    this.dataArray = dataArray;
    this.ctx = ctx;
    this.canvas = canvas;
    this.previousData = new Array(this.dataArray.length).fill(0);
    
    // Initialize blobs array
    this.blobs = [];
    
    if (!this.animationId) {
      this.animate();
    }
  }
  
  stopVisualization() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.elements && this.elements.trackInfo) {
      this.elements.trackInfo.classList.remove('playing');
    }
  }
  
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Handle mutations
      if (this.mutationEnabled || window.VisualizerRegistry?.globalMutationEnabled) {
        this.mutationTimer++;
        if (this.mutationTimer >= this.mutationInterval) {
          this.mutateSettings();
          this.mutationTimer = 0;
        }
      }
      
      if (this.ctx && this.canvas) {
        this.render(this.ctx, this.dataArray, this.canvas.width / devicePixelRatio, this.canvas.height / devicePixelRatio);
      }
    }
  }
  
  render(ctx, dataArray, width, height) {
    // Draw background
    this.drawBackground(ctx, width, height);
    
    // Process audio data
    const audioData = this.processAudioData(dataArray);
    
    // Create new blobs based on audio intensity
    this.createBlobs(audioData, width, height);
    
    // Update and draw existing blobs
    this.updateBlobs(ctx, audioData, width, height);
  }
  
  drawBackground(ctx, width, height) {
    if (this.backgroundStyle === 'gradient') {
      const gradient = ctx.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2, Math.max(width, height)/2
      );
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.7, '#050510');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = this.backgroundStyles[this.backgroundStyle] || this.backgroundStyles.dark;
    }
    
    ctx.fillRect(0, 0, width, height);
  }
  
  processAudioData(dataArray) {
    // Apply smoothing
    const smoothedData = [];
    for (let i = 0; i < dataArray.length; i++) {
      smoothedData[i] = this.previousData[i] * this.smoothing + 
                        dataArray[i] * (1 - this.smoothing);
      this.previousData[i] = smoothedData[i];
    }
    
    // Calculate overall intensity
    const intensity = smoothedData.reduce((sum, value) => sum + value, 0) / smoothedData.length / 255;
    
    // Calculate bass, mids, and treble
    const bass = smoothedData.slice(0, Math.floor(smoothedData.length * 0.25))
                            .reduce((sum, value) => sum + value, 0) / 
                            (smoothedData.length * 0.25) / 255;
    
    const mids = smoothedData.slice(Math.floor(smoothedData.length * 0.25), 
                            Math.floor(smoothedData.length * 0.75))
                            .reduce((sum, value) => sum + value, 0) / 
                            (smoothedData.length * 0.5) / 255;
    
    const treble = smoothedData.slice(Math.floor(smoothedData.length * 0.75))
                              .reduce((sum, value) => sum + value, 0) / 
                              (smoothedData.length * 0.25) / 255;
    
    return {
      intensity: intensity * this.sensitivity,
      bass: bass * this.sensitivity,
      mids: mids * this.sensitivity,
      treble: treble * this.sensitivity
    };
  }
  
  createBlobs(audioData, width, height) {
    // Create new blobs based on audio intensity
    const blobCreationChance = audioData.intensity * 0.5;
    
    if (this.blobs.length < this.maxBlobs && Math.random() < blobCreationChance) {
      const sizeBase = this.blobSizeMin + (this.blobSizeMax - this.blobSizeMin) * audioData.intensity;
      const sizeVariation = sizeBase * 0.3;
      
      const newBlob = {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.max(this.blobSizeMin, sizeBase + (Math.random() * 2 - 1) * sizeVariation),
        targetSize: 0, // Will be set based on audio
        dx: (Math.random() * 2 - 1) * (this.blobSpeedMin + 
             (this.blobSpeedMax - this.blobSpeedMin) * Math.random()),
        dy: (Math.random() * 2 - 1) * (this.blobSpeedMin + 
             (this.blobSpeedMax - this.blobSpeedMin) * Math.random()),
        color: this.colorPalettes[this.colorPalette][
          Math.floor(Math.random() * this.colorPalettes[this.colorPalette].length)
        ],
        opacity: this.blobOpacity,
        life: this.blobLifespan,
        audioResponse: Math.random() // Which audio frequency band affects this blob most
      };
      
      this.blobs.push(newBlob);
    }
  }
  
  updateBlobs(ctx, audioData, width, height) {
    for (let i = this.blobs.length - 1; i >= 0; i--) {
      const blob = this.blobs[i];
      
      // Decrease lifespan
      blob.life--;
      
      // Remove dead blobs
      if (blob.life <= 0) {
        this.blobs.splice(i, 1);
        continue;
      }
      
      // Determine which frequency band affects this blob
      let audioFactor;
      if (blob.audioResponse < 0.33) {
        audioFactor = audioData.bass;
      } else if (blob.audioResponse < 0.66) {
        audioFactor = audioData.mids;
      } else {
        audioFactor = audioData.treble;
      }
      
      // Update target size based on audio
      blob.targetSize = this.blobSizeMin + (this.blobSizeMax - this.blobSizeMin) * audioFactor;
      
      // Smoothly adjust size toward target
      blob.size += (blob.targetSize - blob.size) * 0.1;
      
      // Update position
      blob.x += blob.dx;
      blob.y += blob.dy;
      
      // Bounce off edges
      if (blob.x < 0 || blob.x > width) {
        blob.dx *= -1;
        blob.x = Math.max(0, Math.min(width, blob.x));
      }
      if (blob.y < 0 || blob.y > height) {
        blob.dy *= -1;
        blob.y = Math.max(0, Math.min(height, blob.y));
      }
      
      // Adjust speed based on audio intensity
      const speedFactor = 1 + audioData.intensity * 0.5;
      blob.dx *= speedFactor;
      blob.dy *= speedFactor;
      
      // Draw the blob
      this.drawBlob(ctx, blob);
    }
  }
  
  drawBlob(ctx, blob) {
    ctx.globalAlpha = blob.opacity;
    ctx.fillStyle = blob.color;
    
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow effect for larger blobs
    if (blob.size > 40) {
      ctx.shadowColor = blob.color;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    ctx.globalAlpha = 1;
  }
  
  buildVisualizerSettings() {
    const container = document.getElementById('visualizerSettings');
    if (!container) return;
    
    container.innerHTML = '';
    
    const schema = this.constructor.getSettingsSchema();
    if (!schema) return;
    
    const group = document.createElement('div');
    group.className = 'setting-group';
    
    const title = document.createElement('h4');
    title.textContent = schema.name;
    group.appendChild(title);
    
    Object.entries(schema.settings).forEach(([key, setting]) => {
      const item = this.createSettingItem(key, setting);
      group.appendChild(item);
    });
    
    container.appendChild(group);
  }
  
  createSettingItem(key, setting) {
    const item = document.createElement('div');
    item.className = 'setting-item';
    
    const label = document.createElement('label');
    label.textContent = setting.label;
    label.setAttribute('for', key);
    item.appendChild(label);
    
    let input, valueDisplay;
    
    switch (setting.type) {
      case 'range':
        input = document.createElement('input');
        input.type = 'range';
        input.id = key;
        input.min = setting.min;
        input.max = setting.max;
        input.value = setting.default;
        input.step = setting.step || 1;
        
        valueDisplay = document.createElement('span');
        valueDisplay.id = key + 'Value';
        valueDisplay.textContent = setting.default + (setting.unit || '');
        
        input.addEventListener('input', (e) => {
          const value = parseFloat(e.target.value);
          valueDisplay.textContent = value + (setting.unit || '');
          this.setSetting(key, value);
        });
        
        item.appendChild(input);
        item.appendChild(valueDisplay);
        break;
        
      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = key;
        input.checked = setting.default;
        
        // Add mutation status indicator for mutateMode
        if (key === 'mutateMode') {
          const statusSpan = document.createElement('span');
          statusSpan.className = 'mutation-status';
          statusSpan.style.cssText = 'font-size: 11px; margin-left: 5px;';
          item.appendChild(statusSpan);
        }
        
        input.addEventListener('change', (e) => {
          if (key === 'mutateMode') {
            this.mutationEnabled = e.target.checked;
            this.mutationTimer = 0;
            
            // Update mutation status indicator
            const statusSpan = item.querySelector('.mutation-status');
            if (statusSpan) {
              statusSpan.textContent = this.mutationEnabled ? ' 🎲 ACTIVE' : '';
              statusSpan.style.color = this.mutationEnabled ? '#6366f1' : '';
              statusSpan.style.fontWeight = this.mutationEnabled ? 'bold' : '';
            }
          } else {
            this.setSetting(key, e.target.checked);
          }
        });
        
        item.appendChild(input);
        break;
        
      case 'select':
        input = document.createElement('select');
        input.id = key;
        
        setting.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          if (option.value === setting.default) {
            optionElement.selected = true;
          }
          input.appendChild(optionElement);
        });
        
        input.addEventListener('change', (e) => {
          this.setSetting(key, e.target.value);
        });
        
        item.appendChild(input);
        break;
    }
    
    return item;
  }
  
  mutateSettings() {
    window.VisualizerRegistry.applyMutations(this);
  }

  updateUIControl(key, newValue, highlight = false) {
    window.VisualizerRegistry.updateUIControl(this, key, newValue, highlight);
  }
  
  highlightMutatedControl(element, key) {
    const settingItem = element.closest('.setting-item');
    if (!settingItem) return;
    
    // Add mutation highlight class
    settingItem.classList.add('mutated');
    
    // Create a brief flash effect
    settingItem.style.background = 'rgba(99, 102, 241, 0.3)';
    settingItem.style.borderRadius = '4px';
    settingItem.style.transition = 'all 0.3s ease';
    
    // Show mutation indicator
    let indicator = settingItem.querySelector('.mutation-indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'mutation-indicator';
      indicator.textContent = '🎲';
      indicator.style.cssText = `
        margin-left: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-size: 12px;
      `;
      settingItem.appendChild(indicator);
    }
    
    // Animate the indicator
    indicator.style.opacity = '1';
    
    // Remove effects after delay
    setTimeout(() => {
      settingItem.style.background = '';
      if (indicator) {
        indicator.style.opacity = '0';
      }
    }, 1000);
    
    // Remove indicator after animation
    setTimeout(() => {
      settingItem.classList.remove('mutated');
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 1300);
  }
  
  resetVisualizerSettings() {
    setTimeout(() => window.VisualizerRegistry.resetToDefaults(this), 10);
  }
  
  toggleSettings() {
    if (this.elements && this.elements.settingsPanel) {
      this.elements.settingsPanel.classList.toggle('hidden');
    }
  }
  
  closeSettings() {
    if (this.elements && this.elements.settingsPanel) {
      this.elements.settingsPanel.classList.add('hidden');
    }
  }
  
  onCanvasResize(width, height) {
    // Handle canvas resize if needed
  }
  
  static getSettingsSchema() {
    return {
      name: 'Blobby Blobs',
      settings: {
        maxBlobs: {
          type: 'range',
          label: 'Max Blobs',
          min: 10,
          max: 100,
          default: 50,
          step: 5,
          unit: ''
        },
        blobSize: {
          type: 'range',
          label: 'Blob Size',
          min: 5,
          max: 200,
          default: 80,
          step: 5,
          unit: ''
        },
        blobSpeed: {
          type: 'range',
          label: 'Blob Speed',
          min: 10,
          max: 200,
          default: 100,
          step: 10,
          unit: '%'
        },
        blobOpacity: {
          type: 'range',
          label: 'Blob Opacity',
          min: 10,
          max: 100,
          default: 70,
          step: 5,
          unit: '%'
        },
        sensitivity: {
          type: 'range',
          label: 'Sensitivity',
          min: 50,
          max: 200,
          default: 100,
          step: 10,
          unit: '%'
        },
        smoothing: {
          type: 'range',
          label: 'Smoothing',
          min: 0,
          max: 95,
          default: 80,
          step: 5,
          unit: '%'
        },
        colorPalette: {
          type: 'select',
          label: 'Color Palette',
          options: [
            { value: 'rainbow', label: 'Rainbow' },
            { value: 'pastel', label: 'Pastel' },
            { value: 'neon', label: 'Neon' },
            { value: 'fire', label: 'Fire' },
            { value: 'ocean', label: 'Ocean' },
            { value: 'forest', label: 'Forest' }
          ],
          default: 'rainbow'
        },
        backgroundColor: {
          type: 'select',
          label: 'Background',
          options: [
            { value: 'dark', label: 'Dark' },
            { value: 'black', label: 'Black' },
            { value: 'navy', label: 'Navy' },
            { value: 'purple', label: 'Purple' },
            { value: 'blue', label: 'Blue' },
            { value: 'gradient', label: 'Gradient' }
          ],
          default: 'dark'
        },
        mutateMode: {
          type: 'checkbox',
          label: 'Mutation Mode',
          default: false
        }
      }
    };
  }
  
  static getMutationSettings() {
    return {
      maxBlobs: {
        probability: 0.2,
        values: [30, 40, 50, 60, 70]
      },
      blobSize: {
        probability: 0.3,
        range: { min: 30, max: 150 }
      },
      blobSpeed: {
        probability: 0.25,
        range: { min: 50, max: 150 }
      },
      blobOpacity: {
        probability: 0.2,
        range: { min: 30, max: 90 }
      },
      colorPalette: {
        probability: 0.6,
        values: ['rainbow', 'pastel', 'neon', 'fire', 'ocean', 'forest']
      },
      backgroundColor: {
        probability: 0.4,
        values: ['dark', 'black', 'navy', 'purple', 'blue', 'gradient']
      }
    };
  }
  
  setSetting(key, value) {
    switch (key) {
      case 'maxBlobs':
        this.maxBlobs = parseInt(value);
        break;
      case 'blobSize':
        this.blobSizeMax = parseInt(value);
        break;
      case 'blobSpeed':
        const speedFactor = value / 100;
        this.blobSpeedMin = 0.2 * speedFactor;
        this.blobSpeedMax = 1.5 * speedFactor;
        break;
      case 'blobOpacity':
        this.blobOpacity = value / 100;
        break;
      case 'sensitivity':
        this.sensitivity = value / 100;
        break;
      case 'smoothing':
        this.smoothing = value / 100;
        break;
      case 'colorPalette':
        if (this.colorPalettes[value]) {
          this.colorPalette = value;
        }
        break;
      case 'backgroundColor':
        this.backgroundStyle = value;
        break;
    }
  }
}

if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register('blobs', 'Blobby Blobs', BlobVisualizer);
}