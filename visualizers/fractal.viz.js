class FractalVisualizer {
  constructor() {
    // --- User-configurable settings with defaults ---
    this.fractalType = 'tree';
    this.recursionDepth = 5;
    this.branchFactor = 0.67;
    this.branchAngle = 0.6; // in radians
    this.colorScheme = 'forest';
    this.lineWidth = 2.0;
    this.spawnRate = 0.5;
    this.audioSensitivity = 3.0;
    this.trailLength = 0.85;
    this.pulseSensitivity = 3.0;

    // --- Core animation properties (required by VizWiz) ---
    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;
    this.elements = null;

    // --- Internal state ---
    this.fractals = [];
    this.width = 0;
    this.height = 0;
    this.bassLevel = 0;
    this.midLevel = 0;
    this.trebleLevel = 0;

    // --- Mutation properties (required by VizWiz) ---
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 300; // Frames between mutations

    // --- Color Schemes ---
    this.colorSchemes = {
      forest: ['#daddd8', '#a4ac86', '#87986a', '#656d4a', '#414833'],
      aurora: ['#00ff80', '#80ff80', '#80ff00', '#ffff00', '#ff8080', '#ff0080', '#8000ff', '#0080ff'],
      fire: ['#ffff00', '#ffc400', '#ff8700', '#ff4d00', '#d22700'],
      ice: ['#ffffff', '#ccffff', '#99ffff', '#66ffcc', '#33ff99'],
      cosmic: ['#8000ff', '#4000ff', '#0040ff', '#0080ff', '#00ff80', '#80ff00'],
      electric: ['#fcf300', '#ffc400', '#ff8700', '#ff4d00', '#d22700']
    };
  }

  // REQUIRED: Called once when the visualizer is created
  init(elements) {
    this.elements = elements;
    this.buildVisualizerSettings();
    this.resetVisualizerSettings();
  }

  // REQUIRED: Called when audio playback starts
  startVisualization(analyser, dataArray, ctx, canvas) {
    this.analyser = analyser;
    this.dataArray = dataArray;
    this.ctx = ctx;
    this.canvas = canvas;

    this.onCanvasResize();
    this.fractals = [];

    if (!this.animationId) {
      this.animate();
    }
  }

  // REQUIRED: Called when audio playback stops
  stopVisualization() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.fractals = []; // Clear fractals on stop
  }

  // Main animation loop
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (!this.analyser || !this.dataArray) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    this.updateAudioLevels();

    // Handle mutations if enabled
    if (this.mutationEnabled || window.VisualizerRegistry?.globalMutationEnabled) {
      this.mutationTimer++;
      if (this.mutationTimer >= this.mutationInterval) {
        this.mutateSettings();
        this.mutationTimer = 0;
      }
    }

    this.render();
  }

  // Analyze audio data into different frequency bands
  updateAudioLevels() {
    const slice1 = this.dataArray.length / 4;
    const slice2 = slice1 * 2;
    const slice3 = slice1 * 3;

    let bassSum = 0;
    for (let i = 0; i < slice1; i++) bassSum += this.dataArray[i];
    this.bassLevel = (bassSum / slice1 / 255) * this.audioSensitivity;

    let midSum = 0;
    for (let i = slice1; i < slice2; i++) midSum += this.dataArray[i];
    this.midLevel = (midSum / slice1 / 255) * this.audioSensitivity;

    let trebleSum = 0;
    for (let i = slice2; i < this.dataArray.length; i++) trebleSum += this.dataArray[i];
    this.trebleLevel = (trebleSum / (this.dataArray.length - slice2) / 255) * this.audioSensitivity;

    // Spawn new fractals based on bass hits
    if (this.bassLevel > this.spawnRate && Math.random() > 0.5) {
      this.spawnFractal();
    }
  }

  // Main rendering method
  render() {
    if (!this.ctx || !this.canvas) return;

    // Apply trail effect
    this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.trailLength})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Update and draw all active fractals
    this.fractals.forEach((fractal, index) => {
      if (fractal.life <= 0) {
        this.fractals.splice(index, 1);
      } else {
        fractal.life -= 0.002;
        this.drawFractal(fractal);
      }
    });
  }

  // Spawns a new fractal root at a random location
  spawnFractal() {
    if (this.fractals.length > 30) return; // Performance cap

    this.fractals.push({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      angle: Math.random() * Math.PI * 2,
      len: (this.height / 10) * (1 + this.bassLevel * this.pulseSensitivity),
      depth: this.recursionDepth,
      life: 1.0,
      colorIndex: 0
    });
  }

  // The recursive drawing function
  drawFractal(root) {
    this.ctx.save();
    this.ctx.globalAlpha = root.life;
    this.ctx.translate(root.x, root.y);
    this.ctx.rotate(root.angle);

    this.recursiveDraw(root.len, root.depth, root.colorIndex);

    this.ctx.restore();
  }

  recursiveDraw(len, depth, colorIndex) {
    if (depth === 0 || len < 1) return;

    const colors = this.colorSchemes[this.colorScheme];
    const color = colors[colorIndex % colors.length];

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = Math.max(0.5, len / 10) * this.lineWidth * (1 + this.midLevel * 0.5);
    this.ctx.lineCap = 'round';

    switch (this.fractalType) {
      case 'tree':
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -len);
        this.ctx.stroke();

        this.ctx.translate(0, -len);
        
        const angle = this.branchAngle * (1 + this.trebleLevel * 0.5 - 0.25);
        const newLen = len * this.branchFactor;

        this.ctx.save();
        this.ctx.rotate(-angle);
        this.recursiveDraw(newLen, depth - 1, colorIndex + 1);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.rotate(angle);
        this.recursiveDraw(newLen, depth - 1, colorIndex + 1);
        this.ctx.restore();
        break;

      case 'nestedCircles':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, len, 0, Math.PI * 2);
        this.ctx.stroke();
        
        const radiusFactor = 0.5 + this.trebleLevel * 0.2;
        this.recursiveDraw(len * radiusFactor, depth - 1, colorIndex + 1);
        break;
        
      case 'sierpinski':
        const h = (len * Math.sqrt(3)) / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -h / 2);
        this.ctx.lineTo(-len / 2, h / 2);
        this.ctx.lineTo(len / 2, h / 2);
        this.ctx.closePath();
        this.ctx.stroke();

        if (depth > 1) {
          const newLenTri = len * 0.5;
          const newH = h * 0.5;
          // Top triangle
          this.ctx.save();
          this.ctx.translate(0, -newH / 2);
          this.recursiveDraw(newLenTri, depth - 1, colorIndex + 1);
          this.ctx.restore();
          // Bottom-left
          this.ctx.save();
          this.ctx.translate(-len / 4, newH / 2);
          this.recursiveDraw(newLenTri, depth - 1, colorIndex + 1);
          this.ctx.restore();
          // Bottom-right
          this.ctx.save();
          this.ctx.translate(len / 4, newH / 2);
          this.recursiveDraw(newLenTri, depth - 1, colorIndex + 1);
          this.ctx.restore();
        }
        break;
    }
  }
  
  // REQUIRED: Called when the canvas is resized
  onCanvasResize() {
    if (!this.canvas) return;
    this.width = this.canvas.width / (window.devicePixelRatio || 1);
    this.height = this.canvas.height / (window.devicePixelRatio || 1);
    this.fractals = [];
  }

  // REQUIRED: Handles setting changes from the UI
  setSetting(key, value) {
    this[key] = value;
    if (['recursionDepth', 'fractalType', 'colorScheme'].includes(key)) {
        this.fractals = []; // Reset on major structural changes
    }
  }

  // --- Integration with VizWiz UI and Mutation System ---

  // Delegate mutation logic to the central registry
  mutateSettings() {
    window.VisualizerRegistry.applyMutations(this);
  }

  // Delegate UI updates to the central registry
  updateUIControl(key, newValue, highlight = false) {
    window.VisualizerRegistry.updateUIControl(this, key, newValue, highlight);
  }

  resetVisualizerSettings() {
    setTimeout(() => window.VisualizerRegistry.resetToDefaults(this), 10);
    this.fractals = []; // Also clear fractals on reset
  }

  highlightMutatedControl(element, key) {
    window.VisualizerRegistry.highlightMutatedControl(this, element, key);
  }

  // REQUIRED UI methods (can be boilerplate)
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
      group.appendChild(this.createSettingItem(key, setting));
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
    
    let input;
    switch (setting.type) {
        case 'range':
            input = document.createElement('input');
            input.type = 'range';
            Object.assign(input, { id: key, min: setting.min, max: setting.max, value: setting.default, step: setting.step });
            const valueDisplay = document.createElement('span');
            valueDisplay.id = `${key}Value`;
            valueDisplay.textContent = setting.default + (setting.unit || '');
            input.addEventListener('input', e => {
                const val = setting.step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value);
                valueDisplay.textContent = val + (setting.unit || '');
                this.setSetting(key, val);
            });
            item.append(input, valueDisplay);
            break;
        case 'select':
            input = document.createElement('select');
            input.id = key;
            setting.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (opt.value === setting.default) option.selected = true;
                input.appendChild(option);
            });
            input.addEventListener('change', e => this.setSetting(key, e.target.value));
            item.appendChild(input);
            break;
        case 'checkbox':
            input = document.createElement('input');
            input.type = 'checkbox';
            input.id = key;
            input.checked = setting.default;
            input.addEventListener('change', e => {
                if (key === 'mutateMode') {
                    this.mutationEnabled = e.target.checked;
                    this.mutationTimer = 0;
                } else {
                    this.setSetting(key, e.target.checked);
                }
            });
            item.appendChild(input);
            break;
    }
    return item;
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

  // --- REQUIRED STATIC METHODS ---

  // Defines the settings panel UI
  static getSettingsSchema() {
    return {
      name: 'Fractal Dreams',
      settings: {
        fractalType: {
          type: 'select',
          label: 'Fractal Type',
          options: [
            { value: 'tree', label: 'Branching Tree' },
            { value: 'nestedCircles', label: 'Nested Circles' },
            { value: 'sierpinski', label: 'Sierpinski Triangle' }
          ],
          default: 'tree'
        },
        colorScheme: {
          type: 'select',
          label: 'Color Scheme',
          options: [
            { value: 'forest', label: 'Forest' },
            { value: 'aurora', label: 'Aurora' },
            { value: 'fire', label: 'Fire' },
            { value: 'ice', label: 'Ice' },
            { value: 'cosmic', label: 'Cosmic' },
            { value: 'electric', label: 'Electric' }
          ],
          default: 'forest'
        },
        recursionDepth: {
          type: 'range',
          label: 'Recursion Depth',
          min: 2, max: 8, default: 5, step: 1
        },
        branchAngle: {
          type: 'range',
          label: 'Branch Angle',
          min: 0.1, max: 1.5, default: 0.6, step: 0.05, unit: ' rad'
        },
        lineWidth: {
          type: 'range',
          label: 'Line Width',
          min: 0.5, max: 5.0, default: 2.0, step: 0.1, unit: 'x'
        },
        audioSensitivity: {
          type: 'range',
          label: 'Audio Response',
          min: 0.1, max: 3.0, default: 3.0, step: 0.1, unit: 'x'
        },
        pulseSensitivity: {
            type: 'range',
            label: 'Pulse Sensitivity',
            min: 0.0, max: 3.0, default: 3.0, step: 0.1, unit: 'x'
        },
        spawnRate: {
          type: 'range',
          label: 'Spawn Threshold',
          min: 0.1, max: 1.0, default: 0.5, step: 0.05
        },
        trailLength: {
            type: 'range',
            label: 'Trail Length',
            min: 0.5, max: 0.99, default: 0.85, step: 0.01
        },
        mutateMode: {
          type: 'checkbox',
          label: 'Auto Mutate',
          default: false
        }
      }
    };
  }

  // Defines how settings are randomized in Mutation Mode
  static getMutationSettings() {
    return {
      fractalType: { probability: 0.3, values: ['tree', 'nestedCircles', 'sierpinski'] },
      colorScheme: { probability: 0.8, values: ['forest', 'aurora', 'fire', 'ice', 'cosmic', 'electric'] },
      recursionDepth: { probability: 0.4, range: { min: 3, max: 7 }, step: 1 },
      branchAngle: { probability: 0.6, range: { min: 0.2, max: 1.2 }, step: 0.05 },
      lineWidth: { probability: 0.5, range: { min: 1.0, max: 4.0 }, step: 0.1 }
    };
  }
}

// REQUIRED: Register the visualizer with the application
if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register('fractal', 'Fractal Dreams', FractalVisualizer);
} else {
  // Fallback for backward compatibility
  window.FractalVisualizer = FractalVisualizer;
}