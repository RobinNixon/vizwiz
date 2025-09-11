class BarsVisualizer {
  // Everything is in this class
  constructor() {
    this.bars = 64;
    this.barWidth = 0;
    this.barSpacing = 2;
    this.smoothing = 0.8;
    this.previousHeights = new Array(this.bars).fill(0);
    this.gradient = null;
    this.peakDots = new Array(this.bars).fill(0);
    this.peakFallSpeed = 0.3;
    this.peakDotsEnabled = true;
    this.sensitivity = 0.5;
    this.backgroundStyle = 'dark';

    // Animation properties
    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;
    
    // Mutation properties
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 300;
    
    // UI elements
    this.elements = null;
    
    this.colorSchemes = {
      // Create different colour schemes in each visualizer for variety
      purple: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899', peak: '#f59e0b' },
      rainbow: { primary: '#ff0000', secondary: '#ffff00', accent: '#00ff00', peak: '#ffffff' },
      fire: { primary: '#ff4500', secondary: '#ff6500', accent: '#ffff00', peak: '#ffffff' },
      ocean: { primary: '#0066cc', secondary: '#0099ff', accent: '#00ccff', peak: '#ffffff' },
      neon: { primary: '#00ff00', secondary: '#00ff88', accent: '#00ffff', peak: '#ffffff' },
      sunset: { primary: '#ff6b35', secondary: '#f7931e', accent: '#ffcd3c', peak: '#ffffff' },
      plasma: { primary: '#ff0080', secondary: '#ff4080', accent: '#ff8080', peak: '#ffffff' },
      ice: { primary: '#4db8ff', secondary: '#80d0ff', accent: '#b3e0ff', peak: '#ffffff' }
    };
    
    this.backgroundStyles = {
      // Use different background styles in each visualizer for variety
      dark: '#0c0c0c',
      black: '#000000',
      navy: '#0a0a1a',
      purple: '#1a0a1a',
      green: '#0a1a0a',
      blue: '#0a0a2a',
      red: '#2a0a0a',
      orange: '#2a1a0a',
      teal: '#0a2a2a',
      magenta: '#2a0a2a',
      galaxy: 'gradient',
      neon: 'gradient'
    };
    
    this.colors = this.colorSchemes.purple;
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
    // Ensure settings display correctly
    this.resetVisualizerSettings();
  }
  
  startVisualization(analyser, dataArray, ctx, canvas) {
    // Start visualization
    this.analyser = analyser;
    this.dataArray = dataArray;
    this.ctx = ctx;
    this.canvas = canvas;
    
    if (!this.animationId) {
      this.animate();
    }
  }
  
  stopVisualization() {
    // Stop visualization
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.elements && this.elements.trackInfo) {
      this.elements.trackInfo.classList.remove('playing');
    }
  }
  
  animate() {
    // Animate a frame
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      
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
  
  buildVisualizerSettings() {
    // Build the settings HTML
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
    // Create a settings item
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
        input.step = setting.step || 1;
        
        // Get the current actual value from the visualizer
        let currentValue = setting.default;
        switch (key) {
          case 'barCount':
            currentValue = this.bars;
            break;
          case 'smoothing':
            currentValue = this.smoothing * 100; // Convert decimal to percentage for display
            break;
          case 'sensitivity':
            currentValue = this.sensitivity * 100; // Convert decimal to percentage for display
            break;
        }
        
        input.value = currentValue;
        
        valueDisplay = document.createElement('span');
        valueDisplay.id = key + 'Value';
        valueDisplay.textContent = currentValue + (setting.unit || '');
        
        input.addEventListener('input', (e) => {
          const value = setting.step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value);
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
        
        // Get the current actual value from the visualizer
        let currentChecked = setting.default;
        switch (key) {
          case 'peakDots':
            currentChecked = this.peakDotsEnabled;
            break;
          case 'mutateMode':
            currentChecked = this.mutationEnabled;
            break;
        }
        
        input.checked = currentChecked;
        
        // Add mutation status indicator for mutateMode
        if (key === 'mutateMode') {
          const statusSpan = document.createElement('span');
          statusSpan.className = 'mutation-status';
          statusSpan.style.cssText = 'font-size: 11px; margin-left: 5px;';
          statusSpan.textContent = currentChecked ? ' 🎲 ACTIVE' : '';
          statusSpan.style.color = currentChecked ? '#6366f1' : '';
          statusSpan.style.fontWeight = currentChecked ? 'bold' : '';
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
        
        // Get the current actual value from the visualizer
        let currentSelected = setting.default;
        switch (key) {
          case 'colorScheme':
            // Find the current color scheme by comparing color objects
            for (const [schemeName, colors] of Object.entries(this.colorSchemes)) {
              if (this.colors === colors) {
                currentSelected = schemeName;
                break;
              }
            }
            break;
          case 'backgroundColor':
            currentSelected = this.backgroundStyle;
            break;
        }
        
        setting.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          if (option.value === currentSelected) {
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
    // Apply mutation(s)
    window.VisualizerRegistry.applyMutations(this);
  }

  updateUIControl(key, newValue, highlight = false) {
    // Update UI control
    window.VisualizerRegistry.updateUIControl(this, key, newValue, highlight);
  }
  
  highlightMutatedControl(element, key) {
    // Highlight mutations
    window.VisualizerRegistry.highlightMutatedControl(this, element, key);
  }
  
  resetVisualizerSettings() {
    // Reset settings after giving the DOM time
    // Keep this function as is — it should not require changing
    setTimeout(() => window.VisualizerRegistry.resetToDefaults(this), 10);
  }
  
  toggleSettings() {
    // Toggle settings
    // Keep this function as is — it should not require changing
    if (this.elements && this.elements.settingsPanel) {
      this.elements.settingsPanel.classList.toggle('hidden');
    }
  }
  
  closeSettings() {
    // Close settings
    // Keep this function as is — it should not require changing
    if (this.elements && this.elements.settingsPanel) {
      this.elements.settingsPanel.classList.add('hidden');
    }
  }
  
  onCanvasResize(width, height) {
    // Handle canvas resize if needed
    // This method is called when the canvas is resized
  }
  
  static getSettingsSchema() {
    // Return the schema
    return {
      name: 'Bar and Bars',
      settings: {
        barCount: {
          type: 'range',
          label: 'Bar Count',
          min: 16,
          max: 128,
          default: 64,
          step: 16,
          unit: ''
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
        peakDots: {
          type: 'checkbox',
          label: 'Peak Dots',
          default: true
        },
        colorScheme: {
          type: 'select',
          label: 'Color Scheme',
          options: [
            { value: 'purple', label: 'Purple Gradient' },
            { value: 'rainbow', label: 'Rainbow' },
            { value: 'fire', label: 'Fire' },
            { value: 'ocean', label: 'Ocean' },
            { value: 'neon', label: 'Neon Green' },
            { value: 'sunset', label: 'Sunset' },
            { value: 'plasma', label: 'Plasma' },
            { value: 'ice', label: 'Ice Blue' }
          ],
          default: 'purple'
        },
        sensitivity: {
          type: 'range',
          label: 'Sensitivity',
          min: 25,
          max: 100,
          default: 50,
          step: 5,
          unit: '%'
        },
        backgroundColor: {
          type: 'select',
          label: 'Background',
          options: [
            { value: 'dark', label: 'Dark Gradient' },
            { value: 'black', label: 'Pure Black' },
            { value: 'navy', label: 'Deep Navy' },
            { value: 'purple', label: 'Dark Purple' },
            { value: 'green', label: 'Dark Green' },
            { value: 'blue', label: 'Electric Blue' },
            { value: 'red', label: 'Deep Red' },
            { value: 'orange', label: 'Sunset Orange' },
            { value: 'teal', label: 'Vibrant Teal' },
            { value: 'magenta', label: 'Hot Magenta' },
            { value: 'galaxy', label: 'Galaxy' },
            { value: 'neon', label: 'Neon Glow' }
          ],
          default: 'dark'
        },
        mutateMode: {
          type: 'checkbox',
          label: 'Auto Mutate',
          default: false
        }
      }
    };
  }
  
  static getMutationSettings() {
    // Return mutatable settings object
    // Don't allow sensitivity to be mutated
    return {
      colorScheme: {
        probability: 0.6,
        values: ['purple', 'rainbow', 'fire', 'ocean', 'neon', 'sunset', 'plasma', 'ice']
      },
      barCount: {
        probability: 0.3,
        values: [48, 56, 64, 72, 80]
      },
      smoothing: {
        probability: 0.25,
        range: { min: 0.7, max: 0.9 }
      },
      peakDots: {
        probability: 0.15,
        values: [true, false],
        bias: 0.7
      },
      backgroundColor: {
        probability: 0.5,
        values: ['dark', 'black', 'navy', 'purple', 'green', 'blue', 'red', 'orange', 'teal', 'magenta', 'galaxy', 'neon']
      }
    };
  }
  
  drawBackground(ctx, width, height) {
    // Draw the background
    switch (this.backgroundStyle) {
      case 'galaxy':
        const gradient = ctx.createRadialGradient(
          width/2, height/2, 0,
          width/2, height/2, Math.max(width, height)/2
        );
        gradient.addColorStop(0, '#1a0a2a');
        gradient.addColorStop(0.5, '#0a0a1a');
        gradient.addColorStop(1, '#000010');
        ctx.fillStyle = gradient;
        break;
      case 'neon':
        const neonGradient = ctx.createRadialGradient(
          width/2, height/2, 0,
          width/2, height/2, Math.max(width, height)/2
        );
        neonGradient.addColorStop(0, '#0a2a0a');
        neonGradient.addColorStop(0.7, '#051505');
        neonGradient.addColorStop(1, '#000a00');
        ctx.fillStyle = neonGradient;
        break;
      default:
        ctx.fillStyle = this.backgroundStyles[this.backgroundStyle] || this.backgroundStyles.dark;
        break;
    }
    
    ctx.fillRect(0, 0, width, height);
  }
  
  createGradient(ctx, width, height) {
    // Create a gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, this.colors.primary);
    gradient.addColorStop(0.5, this.colors.secondary);
    gradient.addColorStop(1, this.colors.accent);
    return gradient;
  }
  
  render(ctx, dataArray, width, height) {
    // Render frame
    // Draw background first
    this.drawBackground(ctx, width, height);
    
    // Simply divide the full width by number of bars
    this.barWidth = width / this.bars;
    
    // Create gradient if needed
    if (!this.gradient) {
      this.gradient = this.createGradient(ctx, width, height);
    }
    
    // Process frequency data
    const barHeights = this.processFrequencyData(dataArray, height);
    
    // Draw bars
    this.drawBars(ctx, barHeights, width, height);
    
    // Draw peak dots
    this.drawPeakDots(ctx, barHeights, width, height);
    
    // Update peak dots
    this.updatePeakDots(barHeights);
  }
  
  processFrequencyData(dataArray, height) {
    // Process audio stream
    const barHeights = [];
    
    // Covers roughly 20Hz to 8kHz where most music content lives
    for (let i = 0; i < this.bars; i++) {
      // Create a logarithmic curve that heavily emphasizes lower frequencies
      const logIndex = Math.pow(i / (this.bars - 1), 2.8); // Aggressive curve
      const maxFreqIndex = Math.floor(dataArray.length * 0.6); // Lower 60% of spectrum
      const dataIndex = Math.floor(logIndex * maxFreqIndex);
      
      // Take a small range around each mapped frequency for smoothing
      const range = Math.max(1, Math.floor(maxFreqIndex / this.bars / 3));
      const startIndex = Math.max(0, dataIndex - range);
      const endIndex = Math.min(maxFreqIndex, dataIndex + range);
      
      let sum = 0;
      let count = 0;
      
      for (let j = startIndex; j <= endIndex; j++) {
        sum += dataArray[j];
        count++;
      }
      
      const average = sum / count;
      let normalizedHeight = (average / 255) * this.sensitivity;
      
      // Apply progressive boost to higher frequencies to make them more visible
      const frequencyBoost = 1 + (i / this.bars) * 0.8; // Stronger boost for higher bars
      normalizedHeight *= frequencyBoost;
      
      normalizedHeight = Math.min(1, normalizedHeight);
      normalizedHeight = Math.pow(normalizedHeight, 0.65); // Slightly less compression
      
      const smoothedHeight = this.previousHeights[i] * this.smoothing + 
                 normalizedHeight * (1 - this.smoothing);
      
      this.previousHeights[i] = smoothedHeight;
      barHeights[i] = smoothedHeight * height;
    }
    
    return barHeights;
  }
  
  drawBars(ctx, barHeights, width, height) {
    // Draw frequency bars
    ctx.fillStyle = this.gradient;
    
    for (let i = 0; i < this.bars; i++) {
      // Each bar gets exactly 1/bars of the total width
      const x = i * this.barWidth;
      const barHeight = barHeights[i];
      const y = height - barHeight;
      
      // Leave 1px gap between bars by reducing bar width slightly
      const actualBarWidth = Math.max(1, this.barWidth - 1);
      
      ctx.fillRect(x, y, actualBarWidth, barHeight);
      
      if (barHeight > height * 0.6) {
        ctx.shadowColor = this.colors.accent;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
        ctx.shadowBlur = 0;
      }
    }
  }

  drawPeakDots(ctx, barHeights, width, height) {
    // Draw peak dots
    if (!this.peakDotsEnabled) return;
    
    ctx.fillStyle = this.colors.peak;
    
    for (let i = 0; i < this.bars; i++) {
      // Center dot in each bar's allocated space
      const x = i * this.barWidth + this.barWidth / 2;
      const peakY = height - this.peakDots[i];
      
      if (this.peakDots[i] > 0) {
        ctx.beginPath();
        ctx.arc(x, peakY, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
  
  updatePeakDots(barHeights) {
    // Update peak dots
    for (let i = 0; i < this.bars; i++) {
      if (barHeights[i] > this.peakDots[i]) {
        this.peakDots[i] = barHeights[i];
      } else {
        this.peakDots[i] = Math.max(0, this.peakDots[i] - this.peakFallSpeed);
      }
    }
  }
  
  setSetting(key, value) {
    // Set settings
    switch (key) {
      case 'barCount':
        this.setBarCount(parseInt(value));
        break;
      case 'smoothing':
        this.setSmoothing(value / 100);
        break;
      case 'peakDots':
        this.setPeakDots(value);
        break;
      case 'colorScheme':
        this.setColorScheme(value);
        break;
      case 'sensitivity':
        this.setSensitivity(value / 100);
        break;
      case 'backgroundColor':
        this.setBackgroundStyle(value);
        break;
    }
  }
  
  setBarCount(count) {
    // Number of bars
    this.bars = Math.max(16, Math.min(128, count));
    this.previousHeights = new Array(this.bars).fill(0);
    this.peakDots = new Array(this.bars).fill(0);
  }
  
  setSmoothing(value) {
    // SMoothing value
    this.smoothing = Math.max(0, Math.min(0.95, value));
  }
  
  setPeakDots(enabled) {
    // Dots or not
    this.peakDotsEnabled = enabled;
  }
  
  setColorScheme(schemeName) {
    // Select colors
    if (this.colorSchemes[schemeName]) {
      this.colors = this.colorSchemes[schemeName];
      this.gradient = null;
    }
  }
  
  setSensitivity(value) {
     // Sensitivity to audio
     this.sensitivity = Math.max(0.1, Math.min(3.0, value));
  }
  
  setBackgroundStyle(style) {
    // Select background
    this.backgroundStyle = style;
  }
}

if (window.VisualizerRegistry) {
   // Register visualizer
   window.VisualizerRegistry.register('bars', 'Bars and Bars', BarsVisualizer);
}
