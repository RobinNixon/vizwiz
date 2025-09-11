// groove.viz.js - Groove Visualizer for VizWiz
class GrooveVisualizer {
  constructor() {
    // === Visual Properties ===
    this.particleCount = 8;
    this.shapeSides = 5;
    this.rotationSpeed = 0.02;
    this.pulseIntensity = 1.5;
    this.fadeSpeed = 0.03;
    this.colorScheme = 'rainbow';
    this.shapeSize = 120;
    this.glowEnabled = true;
    this.responsiveness = 2.0;
    this.swirlDepth = 1.0;

    // Color schemes
    this.colorPalettes = {
      rainbow: ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#0099ff', '#9900ff'],
      fire: ['#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00'],
      ocean: ['#0066cc', '#0099ff', '#33ccff', '#66ffff'],
      neon: ['#00ff88', '#00ffcc', '#00ffff', '#88ffff'],
      purple: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'],
      sunset: ['#ff6b35', '#f7931e', '#ffcd3c', '#d4af37'],
      monochrome: ['#ffffff']
    };

    // Current colors
    this.colors = this.colorPalettes.rainbow;

    // Animation state
    this.angle = 0;
    this.opacity = 1;
    this.previousVolume = 0;

    // Required properties (from spec)
    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;
    this.elements = null;
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 200;
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

      // Mutation system
      if (this.mutationEnabled || window.VisualizerRegistry?.globalMutationEnabled) {
        this.mutationTimer++;
        if (this.mutationTimer >= this.mutationInterval) {
          this.mutateSettings();
          this.mutationTimer = 0;
        }
      }

      // Render only if context exists
      if (this.ctx && this.canvas) {
        const width = this.canvas.width / devicePixelRatio;
        const height = this.canvas.height / devicePixelRatio;
        this.render(this.ctx, this.dataArray, width, height);
      }
    }
  }

  render(ctx, dataArray, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate overall volume (average of low-mid frequencies)
    const volume = this.getAverageVolume(dataArray, 0, Math.floor(dataArray.length * 0.6));
    const normalizedVolume = Math.pow(volume / 255, 0.8) * this.responsiveness;

    // Fade background
    ctx.globalAlpha = this.fadeSpeed;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // Update rotation and pulsing
    this.angle += this.rotationSpeed;
    this.opacity = Math.max(0.3, this.opacity * 0.95 + normalizedVolume * 0.2);

    // Draw multiple layers of shapes
    for (let layer = 3; layer >= 1; layer--) {
      const size = this.shapeSize * layer * 0.4 * (1 + normalizedVolume * this.pulseIntensity);
      const alpha = 0.8 / layer;
      const colorIndex = (layer - 1) % this.colors.length;
      const color = this.colors[colorIndex];

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(this.angle * layer * this.swirlDepth);
      this.drawPolygon(ctx, 0, 0, this.shapeSides, size, color, alpha);
      ctx.restore();
    }

    // Draw pulsing central circle
    const pulseRadius = this.shapeSize * 0.3 * (1 + normalizedVolume * 2);
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    gradient.addColorStop(0, this.colors[0]);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Optional glow effect
    if (this.glowEnabled) {
      ctx.shadowColor = this.colors[0];
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw orbiting particles
    this.drawOrbitingParticles(ctx, centerX, centerY, normalizedVolume);
  }

  getAverageVolume(dataArray, start, end) {
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += dataArray[i];
    }
    return sum / (end - start);
  }

  drawPolygon(ctx, x, y, sides, radius, color, alpha = 1) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) + this.angle;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  drawOrbitingParticles(ctx, cx, cy, intensity) {
    const particleCount = this.particleCount;
    const baseRadius = this.shapeSize * 0.7;
    const speed = this.rotationSpeed * 10;

    for (let i = 0; i < particleCount; i++) {
      const angle = this.angle * 1.5 + (i / particleCount) * 2 * Math.PI;
      const radius = baseRadius * (1 + intensity * 0.5);
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const size = 4 + intensity * 6;
      const color = this.colors[i % this.colors.length];

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (this.glowEnabled) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  buildVisualizerSettings() {
    const container = document.getElementById('visualizerSettings');
    if (!container) return;
    container.innerHTML = '';
    const schema = this.constructor.getSettingsSchema();
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
          const optionEl = document.createElement('option');
          optionEl.value = option.value;
          optionEl.textContent = option.label;
          if (option.value === setting.default) optionEl.selected = true;
          input.appendChild(optionEl);
        });
        input.addEventListener('change', (e) => {
          this.setSetting(key, e.target.value);
        });
        item.appendChild(input);
        break;
    }

    return item;
  }

  setSetting(key, value) {
    switch (key) {
      case 'particleCount': this.particleCount = Math.floor(value); break;
      case 'shapeSides': this.shapeSides = Math.floor(value); break;
      case 'rotationSpeed': this.rotationSpeed = value / 1000; break;
      case 'pulseIntensity': this.pulseIntensity = value; break;
      case 'fadeSpeed': this.fadeSpeed = value / 100; break;
      case 'colorScheme': this.setColorScheme(value); break;
      case 'shapeSize': this.shapeSize = value; break;
      case 'glowEnabled': this.glowEnabled = value; break;
      case 'responsiveness': this.responsiveness = value / 100; break;
      case 'swirlDepth': this.swirlDepth = value / 100; break;
    }
  }

  setColorScheme(scheme) {
    if (this.colorPalettes[scheme]) {
      this.colors = this.colorPalettes[scheme];
      this.colorScheme = scheme;
    }
  }

  static getSettingsSchema() {
    return {
      name: 'Groovy Groove',
      settings: {
        particleCount: {
          type: 'range',
          label: 'Orbiting Particles',
          min: 1,
          max: 12,
          default: 8,
          step: 1,
          unit: ''
        },
        shapeSides: {
          type: 'range',
          label: 'Polygon Sides',
          min: 3,
          max: 12,
          default: 5,
          step: 1,
          unit: ''
        },
        rotationSpeed: {
          type: 'range',
          label: 'Rotation Direction & Speed',
          min: -50,
          max: 50,
          default: 20,
          step: 5,
          unit: ''
        },
        pulseIntensity: {
          type: 'range',
          label: 'Pulse Intensity',
          min: 0.5,
          max: 3.0,
          default: 1.5,
          step: 0.1,
          unit: '×'
        },
        fadeSpeed: {
          type: 'range',
          label: 'Trail Fade',
          min: 1,
          max: 10,
          default: 3,
          step: 1,
          unit: '%'
        },
        shapeSize: {
          type: 'range',
          label: 'Shape Size',
          min: 50,
          max: 200,
          default: 120,
          step: 10,
          unit: 'px'
        },
        responsiveness: {
          type: 'range',
          label: 'Responsiveness',
          min: 50,
          max: 300,
          default: 200,
          step: 10,
          unit: '%'
        },
        swirlDepth: {
          type: 'range',
          label: 'Swirl Depth',
          min: 50,
          max: 200,
          default: 100,
          step: 10,
          unit: '%'
        },
        colorScheme: {
          type: 'select',
          label: 'Color Scheme',
          options: [
            { value: 'rainbow', label: 'Rainbow' },
            { value: 'fire', label: 'Fire' },
            { value: 'ocean', label: 'Ocean' },
            { value: 'neon', label: 'Neon Glow' },
            { value: 'purple', label: 'Purple Haze' },
            { value: 'sunset', label: 'Sunset' },
            { value: 'monochrome', label: 'Monochrome' }
          ],
          default: 'rainbow'
        },
        glowEnabled: {
          type: 'checkbox',
          label: 'Enable Glow',
          default: true
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
    return {
      colorScheme: {
        probability: 0.7,
        values: ['rainbow', 'fire', 'ocean', 'neon', 'purple', 'sunset', 'monochrome']
      },
      shapeSides: {
        probability: 0.4,
        values: [3, 4, 5, 6, 8, 12]
      },
      particleCount: {
        probability: 0.3,
        values: [4, 6, 8, 10, 12]
      },
      rotationSpeed: {
        probability: 0.2,
        range: { min: 10, max: 40 }
      },
      shapeSize: {
        probability: 0.3,
        range: { min: 80, max: 180 }
      },
      swirlDepth: {
        probability: 0.25,
        range: { min: 70, max: 150 }
      },
      glowEnabled: {
        probability: 0.1,
        values: [true, false],
        bias: 0.8
      }
    };
  }

  // === REQUIRED METHODS (from spec) — Do not modify ===
  mutateSettings() {
    window.VisualizerRegistry.applyMutations(this);
  }

  updateUIControl(key, newValue, highlight = false) {
    window.VisualizerRegistry.updateUIControl(this, key, newValue, highlight);
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
    // Optional: handle resize
  }

  highlightMutatedControl(element, key) {
    window.VisualizerRegistry.highlightMutatedControl(this, element, key);
  }
}

// === REGISTER THE VISUALIZER ===
if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register('groove', 'Groovy Groove', GrooveVisualizer);
}