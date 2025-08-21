class PlasmaVisualizer {
  constructor() {
    this.resolution = 2;
    this.speed = 1.0;
    this.turbulence = 1.0;
    this.trailLength = 0.85;
    this.audioSensitivity = 1.2;
    this.colorScheme = 'plasma';
    this.backgroundStyle = 'black';
    this.colorSpeed = 1.0;
    this.waveCount = 3;
    this.symmetry = false;
    
    // Animation properties
    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;
    this.time = 0;
    this.audioLevel = 0;
    this.audioHistory = new Array(60).fill(0);
    
    // Mutation properties
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 200;
    
    // UI elements
    this.elements = null;
    
    // Plasma calculation cache
    this.plasmaBuffer = null;
    this.width = 0;
    this.height = 0;
    
    this.colorSchemes = {
      plasma: {
        name: 'Classic Plasma',
        colors: [
          [255, 0, 128],   // Hot pink
          [128, 0, 255],   // Purple
          [0, 128, 255],   // Blue
          [0, 255, 128]  // Cyan
        ]
      },
      fire: {
        name: 'Fire Storm',
        colors: [
          [255, 255, 0],   // Yellow
          [255, 128, 0],   // Orange
          [255, 0, 0],   // Red
          [128, 0, 0]    // Dark red
        ]
      },
      ocean: {
        name: 'Ocean Depths',
        colors: [
          [0, 255, 255],   // Cyan
          [0, 128, 255],   // Blue
          [0, 64, 128],  // Deep blue
          [0, 32, 64]    // Navy
        ]
      },
      arctic: {
        name: 'Arctic Aurora',
        colors: [
          [255, 255, 255], // White
          [128, 255, 255], // Light cyan
          [0, 255, 128],   // Mint
          [0, 128, 255]  // Blue
        ]
      },
      sunset: {
        name: 'Sunset Dreams',
        colors: [
          [255, 200, 100], // Warm yellow
          [255, 100, 50],  // Orange
          [200, 50, 100],  // Pink
          [100, 0, 150]  // Purple
        ]
      },
      galaxy: {
        name: 'Galaxy Swirl',
        colors: [
          [255, 0, 255],   // Magenta
          [128, 0, 255],   // Purple
          [0, 0, 255],   // Blue
          [0, 255, 255]  // Cyan
        ]
      },
      toxic: {
        name: 'Toxic Waste',
        colors: [
          [128, 255, 0],   // Lime
          [255, 255, 0],   // Yellow
          [255, 128, 0],   // Orange
          [128, 64, 0]   // Brown
        ]
      },
      rainbow: {
        name: 'Rainbow Flow',
        colors: [
          [255, 0, 0],   // Red
          [255, 128, 0],   // Orange
          [255, 255, 0],   // Yellow
          [0, 255, 0],   // Green
          [0, 255, 255],   // Cyan
          [0, 0, 255],   // Blue
          [128, 0, 255]  // Purple
        ]
      }
    };
    
    this.backgroundStyles = {
      black: '#000000',
      dark: '#0a0a0a',
      navy: '#000a1a',
      purple: '#0a0a1a',
      green: '#0a1a0a',
      blue: '#0a0a2a',
      red: '#1a0a0a'
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
    
    this.updateDimensions();
    
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
  
  updateDimensions() {
    if (!this.canvas) return;
    
    this.width = Math.floor(this.canvas.width / devicePixelRatio / this.resolution);
    this.height = Math.floor(this.canvas.height / devicePixelRatio / this.resolution);
    
    // Initialize plasma buffer if needed
    if (!this.plasmaBuffer || this.plasmaBuffer.length !== this.width * this.height) {
      this.plasmaBuffer = new Float32Array(this.width * this.height);
    }
  }
  
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.updateAudioData();
      
      if (this.mutationEnabled || window.VisualizerRegistry?.globalMutationEnabled) {
        this.mutationTimer++;
        if (this.mutationTimer >= this.mutationInterval) {
          this.mutateSettings();
          this.mutationTimer = 0;
        }
      }
      
      if (this.ctx && this.canvas) {
        this.render();
      }
    }
    
    this.time += 0.02 * this.speed;
  }
  
  updateAudioData() {
    // Calculate current audio level
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    this.audioLevel = (sum / this.dataArray.length / 255) * this.audioSensitivity;
    
    // Update audio history for smoother effects
    this.audioHistory.shift();
    this.audioHistory.push(this.audioLevel);
  }
  
  render() {
    const canvasWidth = this.canvas.width / devicePixelRatio;
    const canvasHeight = this.canvas.height / devicePixelRatio;
    
    // Apply trail effect
    if (this.trailLength < 1.0) {
      this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.trailLength})`;
      this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      // Clear background
      this.ctx.fillStyle = this.backgroundStyles[this.backgroundStyle] || '#000000';
      this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    // Calculate plasma
    this.calculatePlasma();
    
    // Render plasma to canvas
    this.renderPlasma(canvasWidth, canvasHeight);
  }
  
  calculatePlasma() {
    const audioBoost = 1 + this.audioLevel * 2;
    const turbMod = this.turbulence * audioBoost;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        
        // Normalized coordinates
        const nx = x / this.width - 0.5;
        const ny = y / this.height - 0.5;
        
        // Multiple wave sources for complex patterns
        let value = 0;
        
        // Primary waves
        for (let w = 0; w < this.waveCount; w++) {
          const waveOffset = (w * Math.PI * 2) / this.waveCount;
          const timeOffset = this.time + waveOffset;
          
          // Circular waves from different points
          const dist1 = Math.sqrt(
            Math.pow(nx - Math.sin(timeOffset * 0.3) * 0.3, 2) +
            Math.pow(ny - Math.cos(timeOffset * 0.2) * 0.3, 2)
          );
          
          const dist2 = Math.sqrt(
            Math.pow(nx + Math.sin(timeOffset * 0.4) * 0.2, 2) +
            Math.pow(ny + Math.cos(timeOffset * 0.3) * 0.2, 2)
          );
          
          // Create interference patterns
          value += Math.sin(dist1 * 20 * turbMod + timeOffset * 2);
          value += Math.sin(dist2 * 15 * turbMod + timeOffset * 1.5);
          
          // Add linear waves for complexity
          value += Math.sin(nx * 10 * turbMod + timeOffset);
          value += Math.sin(ny * 8 * turbMod + timeOffset * 0.8);
        }
        
        // Add audio-reactive turbulence
        const audioIndex = Math.floor((x / this.width) * this.dataArray.length);
        const audioValue = this.dataArray[audioIndex] / 255;
        value += Math.sin(audioValue * 10 + this.time * 3) * this.audioLevel;
        
        // Apply symmetry if enabled
        if (this.symmetry) {
          const symX = this.width - 1 - x;
          const symIndex = y * this.width + symX;
          if (symIndex < this.plasmaBuffer.length) {
            value = (value + this.plasmaBuffer[symIndex]) * 0.5;
          }
        }
        
        this.plasmaBuffer[index] = value;
      }
    }
  }
  
  renderPlasma(canvasWidth, canvasHeight) {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    const scheme = this.colorSchemes[this.colorScheme];
    
    for (let i = 0; i < this.plasmaBuffer.length; i++) {
      const value = this.plasmaBuffer[i];
      const normalizedValue = (Math.sin(value + this.time * this.colorSpeed) + 1) * 0.5;
      
      // Interpolate between colors in the scheme
      const colorIndex = normalizedValue * (scheme.colors.length - 1);
      const colorIndexFloor = Math.floor(colorIndex);
      const colorIndexCeil = Math.ceil(colorIndex);
      const colorBlend = colorIndex - colorIndexFloor;
      
      const color1 = scheme.colors[colorIndexFloor] || scheme.colors[0];
      const color2 = scheme.colors[colorIndexCeil] || scheme.colors[scheme.colors.length - 1];
      
      // Blend colors
      const r = Math.floor(color1[0] * (1 - colorBlend) + color2[0] * colorBlend);
      const g = Math.floor(color1[1] * (1 - colorBlend) + color2[1] * colorBlend);
      const b = Math.floor(color1[2] * (1 - colorBlend) + color2[2] * colorBlend);
      
      // Apply audio-reactive brightness
      const brightness = 0.7 + this.audioLevel * 0.3;
      
      const pixelIndex = i * 4;
      data[pixelIndex] = Math.min(255, r * brightness);   // Red
      data[pixelIndex + 1] = Math.min(255, g * brightness); // Green
      data[pixelIndex + 2] = Math.min(255, b * brightness); // Blue
      data[pixelIndex + 3] = 255;              // Alpha
    }
    
    // Create temporary canvas for scaling
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    
    tempCtx.putImageData(imageData, 0, 0);
    
    // Scale and draw to main canvas
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(tempCanvas, 0, 0, this.width, this.height, 0, 0, canvasWidth, canvasHeight);
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
          const value = setting.type === 'range' ? 
            (setting.step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value)) : 
            e.target.value;
          
          const displayValue = setting.unit ? value + setting.unit : value;
          valueDisplay.textContent = displayValue;
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
            console.log('Mutation mode:', this.mutationEnabled ? 'ON' : 'OFF');
            
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
    this.updateDimensions();
  }
  
  setSetting(key, value) {
    switch (key) {
      case 'resolution':
        this.setResolution(parseInt(value));
        break;
      case 'speed':
        this.setSpeed(parseFloat(value));
        break;
      case 'turbulence':
        this.setTurbulence(parseFloat(value));
        break;
      case 'trailLength':
        this.setTrailLength(parseFloat(value));
        break;
      case 'audioSensitivity':
        this.setAudioSensitivity(parseFloat(value));
        break;
      case 'colorScheme':
        this.setColorScheme(value);
        break;
      case 'backgroundStyle':
        this.setBackgroundStyle(value);
        break;
      case 'colorSpeed':
        this.setColorSpeed(parseFloat(value));
        break;
      case 'waveCount':
        this.setWaveCount(parseInt(value));
        break;
      case 'symmetry':
        this.setSymmetry(value);
        break;
    }
  }
  
  setResolution(value) {
    this.resolution = Math.max(1, Math.min(8, value));
    this.updateDimensions();
  }
  
  setSpeed(value) {
    this.speed = Math.max(0.1, Math.min(5.0, value));
  }
  
  setTurbulence(value) {
    this.turbulence = Math.max(0.1, Math.min(3.0, value));
  }
  
  setTrailLength(value) {
    this.trailLength = Math.max(0.1, Math.min(1.0, value));
  }
  
  setAudioSensitivity(value) {
    this.audioSensitivity = Math.max(0.1, Math.min(3.0, value));
  }
  
  setColorScheme(scheme) {
    if (this.colorSchemes[scheme]) {
      this.colorScheme = scheme;
    }
  }
  
  setBackgroundStyle(style) {
    this.backgroundStyle = style;
  }
  
  setColorSpeed(value) {
    this.colorSpeed = Math.max(0.1, Math.min(5.0, value));
  }
  
  setWaveCount(value) {
    this.waveCount = Math.max(1, Math.min(8, value));
  }
  
  setSymmetry(value) {
    this.symmetry = value;
  }
  
  static getSettingsSchema() {
    return {
      name: 'Plasma',
      settings: {
        resolution: {
          type: 'range',
          label: 'Resolution',
          min: 1,
          max: 8,
          default: 2,
          step: 1,
          unit: 'x'
        },
        speed: {
          type: 'range',
          label: 'Speed',
          min: 0.1,
          max: 3.0,
          default: 1.0,
          step: 0.1,
          unit: 'x'
        },
        turbulence: {
          type: 'range',
          label: 'Turbulence',
          min: 0.1,
          max: 3.0,
          default: 1.0,
          step: 0.1,
          unit: 'x'
        },
        trailLength: {
          type: 'range',
          label: 'Trail Length',
          min: 0.1,
          max: 1.0,
          default: 0.85,
          step: 0.05,
          unit: ''
        },
        audioSensitivity: {
          type: 'range',
          label: 'Audio Response',
          min: 0.1,
          max: 3.0,
          default: 1.2,
          step: 0.1,
          unit: 'x'
        },
        colorScheme: {
          type: 'select',
          label: 'Color Scheme',
          options: [
            { value: 'plasma', label: 'Classic Plasma' },
            { value: 'fire', label: 'Fire Storm' },
            { value: 'ocean', label: 'Ocean Depths' },
            { value: 'arctic', label: 'Arctic Aurora' },
            { value: 'sunset', label: 'Sunset Dreams' },
            { value: 'galaxy', label: 'Galaxy Swirl' },
            { value: 'toxic', label: 'Toxic Waste' },
            { value: 'rainbow', label: 'Rainbow Flow' }
          ],
          default: 'plasma'
        },
        colorSpeed: {
          type: 'range',
          label: 'Color Speed',
          min: 0.1,
          max: 3.0,
          default: 1.0,
          step: 0.1,
          unit: 'x'
        },
        waveCount: {
          type: 'range',
          label: 'Wave Count',
          min: 1,
          max: 8,
          default: 3,
          step: 1,
          unit: ''
        },
        backgroundStyle: {
          type: 'select',
          label: 'Background',
          options: [
            { value: 'black', label: 'Pure Black' },
            { value: 'dark', label: 'Dark Gray' },
            { value: 'navy', label: 'Deep Navy' },
            { value: 'purple', label: 'Dark Purple' },
            { value: 'green', label: 'Dark Green' },
            { value: 'blue', label: 'Dark Blue' },
            { value: 'red', label: 'Dark Red' }
          ],
          default: 'black'
        },
        symmetry: {
          type: 'checkbox',
          label: 'Symmetry Mode',
          default: false
        },
        mutateMode: {
          type: 'checkbox',
          label: 'Mutate Colors',
          default: false
        }
      }
    };
  }
  
  static getMutationSettings() {
    return {
      colorScheme: {
        probability: 0.7,
        values: ['plasma', 'fire', 'ocean', 'arctic', 'sunset', 'galaxy', 'toxic', 'rainbow']
      },
      speed: {
        probability: 0.4,
        range: { min: 0.5, max: 2.5 },
        step: 0.1
      },
      turbulence: {
        probability: 0.5,
        range: { min: 0.5, max: 2.0 },
        step: 0.1
      },
      colorSpeed: {
        probability: 0.6,
        range: { min: 0.3, max: 2.0 },
        step: 0.1
      },
      waveCount: {
        probability: 0.3,
        values: [2, 3, 4, 5]
      },
      trailLength: {
        probability: 0.2,
        range: { min: 0.6, max: 0.95 },
        step: 0.05
      },
      audioSensitivity: {
        probability: 0.3,
        range: { min: 0.8, max: 2.0 },
        step: 0.1
      },
      backgroundStyle: {
        probability: 0.4,
        values: ['black', 'dark', 'navy', 'purple', 'green', 'blue', 'red']
      },
      symmetry: {
        probability: 0.15,
        values: [true, false]
      }
    };
  }
}

if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register('plasma', 'Plasma Flow', PlasmaVisualizer);
}