class VectorBloomVisualizer {
  constructor() {
    this.bloomCount = 32;
    this.petalCount = 12;
    this.petalCurvature = 60;
    this.bloomSize = 80;
    this.trailPersistence = 70;
    this.beatSensitivity = 85;
    this.colorScheme = 'Aurora';
    this.mutateGeometry = true;
    this.rotateBlooms = true;

    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;

    this.elements = null;
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 300;

    this.colorSchemes = {
      Aurora: ['#A0F0E0', '#70D0FF', '#C080FF', '#F0A0E0'],
      SolarFlare: ['#FF4500', '#FF8C00', '#FFD700', '#FF6347'],
      DeepOcean: ['#003366', '#005580', '#0077A3', '#00A3CC'],
      NeonPulse: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF6600'],
      Monochrome: ['#FFFFFF', '#CCCCCC', '#999999', '#666666']
    };
  }

  init(elements) {
    this.elements = elements;
    this.buildVisualizerSettings();

    const resetBtn = document.getElementById('resetSettings');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetVisualizerSettings());
    }

    this.resetVisualizerSettings();
  }

  // Add this static method to the VectorBloomVisualizer class
  static getMutationSettings() {
    return {
      bloomCount: {
        probability: 0.2,
        values: [16, 24, 32, 40, 48, 56]
      },
      petalCount: {
        probability: 0.25,
        values: [6, 8, 10, 12, 16, 20]
      },
      petalCurvature: {
        probability: 0.3,
        range: { min: 20, max: 90 }
      },
      bloomSize: {
        probability: 0.2,
        range: { min: 40, max: 140 }
      },
      trailPersistence: {
        probability: 0.4,
        range: { min: 30, max: 95 }
      },
      beatSensitivity: {
        probability: 0.15,
        range: { min: 50, max: 100 }
      },
      colorScheme: {
        probability: 0.5,
        values: ['Aurora', 'SolarFlare', 'DeepOcean', 'NeonPulse', 'Monochrome']
      },
      mutateGeometry: {
        probability: 0.1,
        values: [true, false],
        bias: 0.6 // 60% chance of being true when mutated
      },
      rotateBlooms: {
        probability: 0.1,
        values: [true, false],
        bias: 0.8 // 80% chance of being true when mutated
      }
    };
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
    if (this.elements?.trackInfo) {
      this.elements.trackInfo.classList.remove('playing');
    }
  }

  animate() {
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

  render(ctx, dataArray, width, height) {
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.trailPersistence / 100})`;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    const beat = this.getBeat(dataArray);
    const colors = this.colorSchemes[this.colorScheme] || ['#FFFFFF'];

    for (let i = 0; i < this.bloomCount; i++) {
      const angle = (i / this.bloomCount) * 2 * Math.PI;
      const bloomX = centerX + radius * Math.cos(angle);
      const bloomY = centerY + radius * Math.sin(angle);
      const bloomScale = this.bloomSize * (1 + beat * 0.5);
      const rotation = this.rotateBlooms ? beat * 2 * Math.PI : 0;
      const color = colors[i % colors.length];

      this.drawBloom(ctx, bloomX, bloomY, bloomScale, this.petalCount, this.petalCurvature, color, rotation, this.mutateGeometry);
    }
  }

  drawBloom(ctx, x, y, size, petals, curvature, color, rotation, mutate) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * 2 * Math.PI;
      const cx = size * Math.cos(angle);
      const cy = size * Math.sin(angle);
      const mutationFactor = mutate ? (Math.random() * 0.2 + 0.9) : 1;
      const controlX = cx * (curvature / 100) * mutationFactor;
      const controlY = cy * (curvature / 100) * mutationFactor;

      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(controlX, controlY, cx, cy);
    }

    ctx.stroke();
    ctx.restore();
  }

  getBeat(dataArray) {
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    return Math.min(1, (avg / 255) * (this.beatSensitivity / 100));
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
        input.step = setting.step || 1;
        input.value = setting.default;

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
          statusSpan.textContent = setting.default ? ' 🎲 ACTIVE' : '';
          statusSpan.style.color = setting.default ? '#6366f1' : '';
          statusSpan.style.fontWeight = setting.default ? 'bold' : '';
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
          optionElement.value = option;
          optionElement.textContent = option;
          if (option === setting.default) optionElement.selected = true;
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

  setSetting(key, value) {
    this[key] = value;
  }

  mutateSettings() {
    window.VisualizerRegistry.applyMutations(this);
  }

  updateUIControl(key, newValue, highlight = false) {
    window.VisualizerRegistry.updateUIControl(this, key, newValue, highlight);
  }

  highlightMutatedControl(element, key) {
    window.VisualizerRegistry.highlightMutatedControl(this, element, key);
  }

  resetVisualizerSettings() {
    setTimeout(() => window.VisualizerRegistry.resetToDefaults(this), 10);
  }

  toggleSettings() {
    if (this.elements?.settingsPanel) {
      this.elements.settingsPanel.classList.toggle('hidden');
    }
  }

  closeSettings() {
    if (this.elements?.settingsPanel) {
      this.elements.settingsPanel.classList.add('hidden');
    }
  }

  onCanvasResize(width, height) {
    // Optional: handle resize logic
  }

  static getSettingsSchema() {
    return {
      name: 'Vector Bloom',
      settings: {
        bloomCount: {
          type: 'range',
          label: 'Bloom Count',
          min: 8,
          max: 64,
          default: 32,
          step: 4
        },
        petalCount: {
          type: 'range',
          label: 'Petals per Bloom',
          min: 4,
          max: 24,
          default: 12,
          step: 2
        },
        petalCurvature: {
          type: 'range',
          label: 'Petal Curvature',
          min: 0,
          max: 100,
          default: 60,
          step: 5,
          unit: '%'
        },
        bloomSize: {
          type: 'range',
          label: 'Bloom Size',
          min: 10,
          max: 200,
          default: 80,
          step: 10,
          unit: 'px'
        },
        trailPersistence: {
          type: 'range',
          label: 'Trail Persistence',
          min: 0,
          max: 100,
          default: 70,
          step: 5,
          unit: '%'
        },
        beatSensitivity: {
          type: 'range',
          label: 'Beat Sensitivity',
          min: 0,
          max: 100,
          default: 85,
          step: 5,
          unit: '%'
        },
        colorScheme: {
          type: 'select',
          label: 'Color Scheme',
          options: ['Aurora', 'SolarFlare', 'DeepOcean', 'NeonPulse', 'Monochrome'],
          default: 'Aurora'
        },
        mutateGeometry: {
          type: 'checkbox',
          label: 'Mutate Geometry',
          default: false
        },
        rotateBlooms: {
          type: 'checkbox',
          label: 'Rotate Blooms',
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
}

VisualizerRegistry.register('vectorbloom', 'Vector Bloom', VectorBloomVisualizer);
