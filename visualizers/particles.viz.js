/**
 * VizWiz Particle Storm Visualizer
 * Creates a dynamic particle system that responds to audio frequencies.
 * Particles spawn, move, and interact based on bass, mids, and treble levels.
 */
class ParticleVisualizer {
  constructor() {
    // Core animation properties
    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;
    this.elements = null;
    
    // Particle system properties
    this.particles = [];
    this.maxParticles = 200;
    this.particleSize = 3;
    this.particleSpeed = 1.0;
    this.particleLife = 300; // frames
    this.gravity = 0.02;
    this.friction = 0.98;
    
    // Audio response properties
    this.sensitivity = 1.2;
    this.bassResponse = 1.5;
    this.midResponse = 1.0;
    this.trebleResponse = 0.8;
    
    // Visual properties
    this.colorMode = 'frequency';
    this.backgroundStyle = 'fade';
    this.fadeIntensity = 0.03; // How strong the fade effect is
    this.connectionLines = true;
    this.connectionDistance = 80;
    this.glowEffect = true;
    
    // Mutation properties
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 240;
    
    // Debug properties
    this.debugMode = false;
    this.debugTimer = 0;
    
    // Audio analysis
    this.previousData = null;
    this.bassLevel = 0;
    this.midLevel = 0;
    this.trebleLevel = 0;
    
    // Color schemes
    this.colorSchemes = {
      frequency: {
        bass: '#ff4444',
        mid: '#44ff44', 
        treble: '#4444ff',
        connection: '#ffffff'
      },
      fire: {
        bass: '#ff6600',
        mid: '#ff9900',
        treble: '#ffcc00',
        connection: '#ff3300'
      },
      ice: {
        bass: '#00ccff',
        mid: '#66ddff',
        treble: '#99eeff',
        connection: '#ffffff'
      },
      neon: {
        bass: '#ff00ff',
        mid: '#00ffff',
        treble: '#ffff00',
        connection: '#ffffff'
      },
      aurora: {
        bass: '#00ff80',
        mid: '#8080ff',
        treble: '#ff8080',
        connection: '#80ff80'
      }
    };
    
    this.colors = this.colorSchemes.frequency;
  }
  
  init(elements) {
    this.elements = elements;
    this.buildVisualizerSettings();
    
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
    
    this.particles = [];
    
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
      const renderStart = performance.now();
      
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
      
      // Update performance stats
      if (window.VisualizerRegistry) {
        window.VisualizerRegistry.updatePerformanceStats(renderStart);
      }
    }
  }
  
  render(ctx, dataArray, width, height) {
    // Draw background
    this.drawBackground(ctx, width, height);
    
    // Process audio data
    this.processAudioData(dataArray);
    
    // Spawn new particles based on audio
    this.spawnParticles(width, height);
    
    // Update and draw particles
    this.updateParticles(ctx, width, height);
    
    // Draw connections between nearby particles
    if (this.connectionLines) {
      this.drawConnections(ctx);
    }
    
    // Debug information
    if (this.debugMode) {
      this.drawDebugInfo(ctx, width, height);
    }
  }
  
  drawBackground(ctx, width, height) {
    if (this.backgroundStyle === 'fade') {
      // Configurable fade effect - use low alpha to avoid gray buildup
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeIntensity})`;
      ctx.fillRect(0, 0, width, height);
    } else if (this.backgroundStyle === 'clear') {
      // Clear background each frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    } else if (this.backgroundStyle === 'gradient') {
      // Animated gradient background
      const gradient = ctx.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2, Math.max(width, height)/2
      );
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.7, '#050510');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  }
  
  processAudioData(dataArray) {
    // Apply smoothing
    for (let i = 0; i < dataArray.length; i++) {
      this.previousData[i] = this.previousData[i] * 0.7 + dataArray[i] * 0.3;
    }
    
    // Better frequency band separation
    const length = dataArray.length;
    const bassEnd = Math.floor(length * 0.15);      // 0-15% for bass (lower frequencies)
    const midEnd = Math.floor(length * 0.5);        // 15-50% for mids
    const trebleEnd = Math.floor(length * 0.85);    // 50-85% for treble
    
    // Calculate averages with better weighting
    let bassSum = 0, midSum = 0, trebleSum = 0;
    
    // Bass calculation with emphasis on lower frequencies
    for (let i = 0; i < bassEnd; i++) {
      const weight = 1 + (bassEnd - i) / bassEnd; // Higher weight for lower frequencies
      bassSum += this.previousData[i] * weight;
    }
    this.bassLevel = (bassSum / (bassEnd * 1.5)) / 255 * this.bassResponse;
    
    // Mid calculation
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += this.previousData[i];
    }
    this.midLevel = (midSum / (midEnd - bassEnd)) / 255 * this.midResponse;
    
    // Treble calculation with emphasis on higher frequencies
    for (let i = midEnd; i < trebleEnd; i++) {
      const weight = 1 + (i - midEnd) / (trebleEnd - midEnd); // Higher weight for higher frequencies
      trebleSum += this.previousData[i] * weight;
    }
    this.trebleLevel = (trebleSum / ((trebleEnd - midEnd) * 1.5)) / 255 * this.trebleResponse;
    
    // Normalize levels to prevent one band from dominating
    const maxLevel = Math.max(this.bassLevel, this.midLevel, this.trebleLevel);
    if (maxLevel > 0) {
      const normalizer = 0.8 / maxLevel; // Keep some dynamic range
      this.bassLevel = Math.min(1, this.bassLevel * normalizer);
      this.midLevel = Math.min(1, this.midLevel * normalizer);
      this.trebleLevel = Math.min(1, this.trebleLevel * normalizer);
    }
  }
  
  spawnParticles(width, height) {
    const totalLevel = (this.bassLevel + this.midLevel + this.trebleLevel) * this.sensitivity;
    const spawnChance = Math.min(0.8, totalLevel * 0.5);
    
    if (this.particles.length < this.maxParticles && Math.random() < spawnChance) {
      // More balanced spawning - use weighted random selection instead of just dominant frequency
      const bassWeight = Math.max(0.1, this.bassLevel);
      const midWeight = Math.max(0.1, this.midLevel);
      const trebleWeight = Math.max(0.1, this.trebleLevel);
      const totalWeight = bassWeight + midWeight + trebleWeight;
      
      const random = Math.random() * totalWeight;
      let x, y, type;
      
      if (random < bassWeight) {
        // Bass - spawn from bottom area
        x = Math.random() * width;
        y = height - Math.random() * (height * 0.3); // Bottom 30% of screen
        type = 'bass';
      } else if (random < bassWeight + midWeight) {
        // Mids - spawn from sides or middle
        if (Math.random() < 0.6) {
          // Spawn from sides
          x = Math.random() < 0.5 ? Math.random() * 50 : width - Math.random() * 50;
          y = Math.random() * height;
        } else {
          // Spawn from middle area
          x = width * 0.3 + Math.random() * (width * 0.4);
          y = height * 0.3 + Math.random() * (height * 0.4);
        }
        type = 'mid';
      } else {
        // Treble - spawn from top area
        x = Math.random() * width;
        y = Math.random() * (height * 0.3); // Top 30% of screen
        type = 'treble';
      }
      
      // Add some initial velocity based on spawn type
      let vx, vy;
      if (type === 'bass') {
        // Bass particles tend to move upward
        vx = (Math.random() - 0.5) * this.particleSpeed * 3;
        vy = -Math.random() * this.particleSpeed * 2 - 1; // Upward bias
      } else if (type === 'mid') {
        // Mid particles move more randomly
        vx = (Math.random() - 0.5) * this.particleSpeed * 4;
        vy = (Math.random() - 0.5) * this.particleSpeed * 3;
      } else {
        // Treble particles tend to move downward
        vx = (Math.random() - 0.5) * this.particleSpeed * 3;
        vy = Math.random() * this.particleSpeed * 2 + 1; // Downward bias
      }
      
      const particle = {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: this.particleSize + Math.random() * this.particleSize,
        life: this.particleLife,
        maxLife: this.particleLife,
        type: type,
        color: this.colors[type],
        audioLevel: type === 'bass' ? this.bassLevel : 
                   type === 'mid' ? this.midLevel : this.trebleLevel
      };
      
      this.particles.push(particle);
    }
    
    // Fallback spawning to ensure particles appear across the screen
    // This helps when audio levels are low or unbalanced
    if (this.particles.length < this.maxParticles * 0.3 && Math.random() < 0.1) {
      const fallbackTypes = ['bass', 'mid', 'treble'];
      const randomType = fallbackTypes[Math.floor(Math.random() * fallbackTypes.length)];
      
      let x, y;
      if (randomType === 'bass') {
        x = Math.random() * width;
        y = height * 0.7 + Math.random() * (height * 0.3);
      } else if (randomType === 'mid') {
        x = Math.random() * width;
        y = height * 0.3 + Math.random() * (height * 0.4);
      } else {
        x = Math.random() * width;
        y = Math.random() * (height * 0.3);
      }
      
      const fallbackParticle = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * this.particleSpeed * 2,
        vy: (Math.random() - 0.5) * this.particleSpeed * 2,
        size: this.particleSize * 0.8,
        life: this.particleLife * 0.8,
        maxLife: this.particleLife * 0.8,
        type: randomType,
        color: this.colors[randomType],
        audioLevel: 0.3
      };
      
      this.particles.push(fallbackParticle);
    }
  }
  
  updateParticles(ctx, width, height) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update life
      particle.life--;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Apply physics
      particle.vy += this.gravity;
      particle.vx *= this.friction;
      particle.vy *= this.friction;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -0.8;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -0.8;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }
      
      // Draw particle
      this.drawParticle(ctx, particle);
    }
  }
  
  drawParticle(ctx, particle) {
    const alpha = particle.life / particle.maxLife;
    const size = particle.size * (0.5 + alpha * 0.5);
    
    ctx.globalAlpha = alpha;
    
    if (this.glowEffect) {
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 10;
    }
    
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    ctx.fill();
    
    if (this.glowEffect) {
      ctx.shadowBlur = 0;
    }
    
    ctx.globalAlpha = 1;
  }
  
  drawConnections(ctx) {
    ctx.strokeStyle = this.colors.connection;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.connectionDistance) {
          const alpha = 1 - (distance / this.connectionDistance);
          ctx.globalAlpha = alpha * 0.3;
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    
    ctx.globalAlpha = 1;
  }
  
  drawDebugInfo(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`Particles: ${this.particles.length}/${this.maxParticles}`, 10, 20);
    ctx.fillText(`Bass: ${this.bassLevel.toFixed(2)}`, 10, 35);
    ctx.fillText(`Mid: ${this.midLevel.toFixed(2)}`, 10, 50);
    ctx.fillText(`Treble: ${this.trebleLevel.toFixed(2)}`, 10, 65);
    
    // Count particles by type
    const counts = { bass: 0, mid: 0, treble: 0 };
    this.particles.forEach(p => counts[p.type]++);
    ctx.fillText(`Types - B:${counts.bass} M:${counts.mid} T:${counts.treble}`, 10, 80);
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
        input.step = setting.step || 1;
        input.value = setting.default;
        
        valueDisplay = document.createElement('span');
        valueDisplay.id = key + 'Value';
        valueDisplay.textContent = setting.default + (setting.unit || '');
        
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
        input.checked = setting.default;
        
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
    
    // Use key parameter for potential future logging/debugging
    console.log(`Mutated setting: ${key}`);
    
    settingItem.classList.add('mutated');
    settingItem.style.background = 'rgba(99, 102, 241, 0.3)';
    settingItem.style.borderRadius = '4px';
    settingItem.style.transition = 'all 0.3s ease';
    
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
    
    indicator.style.opacity = '1';
    
    setTimeout(() => {
      settingItem.style.background = '';
      if (indicator) {
        indicator.style.opacity = '0';
      }
    }, 1000);
    
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
    // Handle canvas resize if needed - currently no specific resize logic needed
    // Width and height parameters available for future use
    console.log(`Canvas resized to ${width}x${height}`);
  }
  
  static getSettingsSchema() {
    return {
      name: 'Particle Storm',
      settings: {
        maxParticles: {
          type: 'range',
          label: 'Max Particles',
          min: 50,
          max: 500,
          default: 200,
          step: 25,
          unit: ''
        },
        particleSize: {
          type: 'range',
          label: 'Particle Size',
          min: 1,
          max: 10,
          default: 3,
          step: 0.5,
          unit: 'px'
        },
        particleSpeed: {
          type: 'range',
          label: 'Particle Speed',
          min: 0.1,
          max: 3.0,
          default: 1.0,
          step: 0.1,
          unit: 'x'
        },
        sensitivity: {
          type: 'range',
          label: 'Audio Sensitivity',
          min: 0.5,
          max: 3.0,
          default: 1.2,
          step: 0.1,
          unit: 'x'
        },
        gravity: {
          type: 'range',
          label: 'Gravity',
          min: 0,
          max: 0.1,
          default: 0.02,
          step: 0.01,
          unit: ''
        },
        colorMode: {
          type: 'select',
          label: 'Color Scheme',
          options: [
            { value: 'frequency', label: 'Frequency Based' },
            { value: 'fire', label: 'Fire' },
            { value: 'ice', label: 'Ice' },
            { value: 'neon', label: 'Neon' },
            { value: 'aurora', label: 'Aurora' }
          ],
          default: 'frequency'
        },
        backgroundStyle: {
          type: 'select',
          label: 'Background',
          options: [
            { value: 'fade', label: 'Fade Trail' },
            { value: 'clear', label: 'Clear' },
            { value: 'gradient', label: 'Gradient' }
          ],
          default: 'fade'
        },
        fadeIntensity: {
          type: 'range',
          label: 'Trail Intensity',
          min: 0.01,
          max: 0.2,
          default: 0.03,
          step: 0.01,
          unit: ''
        },
        connectionLines: {
          type: 'checkbox',
          label: 'Connection Lines',
          default: true
        },
        glowEffect: {
          type: 'checkbox',
          label: 'Glow Effect',
          default: true
        },
        mutateMode: {
          type: 'checkbox',
          label: 'Mutation Mode',
          default: false
        },
        debugMode: {
          type: 'checkbox',
          label: 'Debug Info',
          default: false
        }
      }
    };
  }
  
  static getMutationSettings() {
    return {
      maxParticles: {
        probability: 0.3,
        range: { min: 100, max: 400 }
      },
      particleSize: {
        probability: 0.4,
        range: { min: 2, max: 8 }
      },
      particleSpeed: {
        probability: 0.3,
        range: { min: 0.5, max: 2.5 }
      },
      gravity: {
        probability: 0.2,
        range: { min: 0, max: 0.08 }
      },
      colorMode: {
        probability: 0.6,
        values: ['frequency', 'fire', 'ice', 'neon', 'aurora']
      },
      backgroundStyle: {
        probability: 0.4,
        values: ['fade', 'clear', 'gradient']
      },
      fadeIntensity: {
        probability: 0.25,
        range: { min: 0.02, max: 0.08 }
      },
      connectionLines: {
        probability: 0.2,
        values: [true, false]
      },
      glowEffect: {
        probability: 0.15,
        values: [true, false]
      }
    };
  }
  
  setSetting(key, value) {
    switch (key) {
      case 'maxParticles':
        this.maxParticles = parseInt(value);
        break;
      case 'particleSize':
        this.particleSize = parseFloat(value);
        break;
      case 'particleSpeed':
        this.particleSpeed = parseFloat(value);
        break;
      case 'sensitivity':
        this.sensitivity = parseFloat(value);
        break;
      case 'gravity':
        this.gravity = parseFloat(value);
        break;
      case 'colorMode':
        if (this.colorSchemes[value]) {
          this.colors = this.colorSchemes[value];
        }
        break;
      case 'backgroundStyle':
        this.backgroundStyle = value;
        break;
      case 'fadeIntensity':
        this.fadeIntensity = parseFloat(value);
        break;
      case 'connectionLines':
        this.connectionLines = value;
        break;
      case 'glowEffect':
        this.glowEffect = value;
        break;
      case 'debugMode':
        this.debugMode = value;
        break;
    }
  }
}

if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register('particles', 'Particle Storm', ParticleVisualizer);
}