class HyperBloomVisualizer {
  constructor() {
    this.rotationSpeed = 1.0;
    this.foldDepth = 0.5;
    this.pulseSensitivity = 1.2;
    this.colorScheme = 'Neon Grid';
    this.spinDirection = 'Clockwise';
    this.edgeThickness = 2;
    this.backgroundFade = 0.2;
    this.vertexDrift = false;
    this.mutateGeometry = true;
    this.rotateAxes = true;

    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;

    this.elements = null;
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 300;

    this.angle = 0;
    this.tesseractVertices = this.generateTesseractVertices();
    this.colorSets = {
      'Neon Grid': ['#00FFFF', '#FF00FF', '#FFFF00', '#FF6600'],
      'Cosmic Ice': ['#A0F0FF', '#70D0FF', '#C0E0FF', '#F0FFFF'],
      'Sunset Fold': ['#FF4500', '#FF8C00', '#FFD700', '#FF6347'],
      'Monochrome Pulse': ['#FFFFFF', '#CCCCCC', '#999999', '#666666']
    };
  }

  init(elements) {
    this.elements = elements;
    this.buildVisualizerSettings();
    const resetBtn = document.getElementById('resetSettings');
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetVisualizerSettings());
    this.resetVisualizerSettings();
  }

  static getMutationSettings() {
    return {
      rotationSpeed: {
        probability: 0.15,  // Reduced from 0.4
        range: { min: 0.1, max: 3 }
      },
      foldDepth: {
        probability: 0.2,   // Reduced from 0.5
        range: { min: 0, max: 1 }
      },
      pulseSensitivity: {
        probability: 0.1,   // Reduced from 0.3
        range: { min: 0.5, max: 3 }
      },
      colorScheme: {
        probability: 0.4,   // Reduced from 0.6
        values: ['Neon Grid', 'Cosmic Ice', 'Sunset Fold', 'Monochrome Pulse']
      },
      spinDirection: {
        probability: 0.1,   // Reduced from 0.25
        values: ['Clockwise', 'Counterclockwise', 'None']
      },
      edgeThickness: {
        probability: 0.15,  // Reduced from 0.3
        range: { min: 1, max: 10 }
      },
      backgroundFade: {
        probability: 0.2,   // Reduced from 0.4
        range: { min: 0, max: 1 }
      },
      vertexDrift: {
        probability: 0.1,   // Reduced from 0.2
        values: [true, false],
        bias: 0.3
      },
      mutateGeometry: {
        probability: 0.1,   // Reduced from 0.2
        values: [true, false],
        bias: 0.3
      },
      rotateAxes: {
        probability: 0.05,  // Reduced from 0.15
        values: [true, false],
        bias: 0.8
      }
    };
  }

  startVisualization(analyser, dataArray, ctx, canvas) {
    this.analyser = analyser;
    this.dataArray = dataArray;
    this.ctx = ctx;
    this.canvas = canvas;
    if (!this.animationId) this.animate();
  }

  stopVisualization() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = null;
    if (this.elements?.trackInfo) this.elements.trackInfo.classList.remove('playing');
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
    this.angle += this.rotationSpeed * 0.01;
  }

  render(ctx, dataArray, width, height) {
    ctx.fillStyle = `rgba(0, 0, 0, ${this.backgroundFade})`;
    ctx.fillRect(0, 0, width, height);

    const beat = this.getBeat(dataArray);
    const scale = 100 * (1 + beat * this.pulseSensitivity);
    const folded = this.foldTesseract(this.tesseractVertices, this.foldDepth);
    const rotated = this.rotateTesseract(folded, this.angle);
    const projected = this.projectTo2D(rotated, width, height, scale);
    const colors = this.colorSets[this.colorScheme] || ['#FFFFFF'];

    const spinAngle = this.spinDirection === 'None' ? 0 :
      this.angle * (this.spinDirection === 'Counterclockwise' ? -1 : 1);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(spinAngle);
    ctx.translate(-width / 2, -height / 2);
    this.drawEdges(ctx, projected, colors);
    ctx.restore();
  }

  generateTesseractVertices() {
    const vertices = [];
    for (let i = 0; i < 16; i++) {
      const v = [
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
      ];
      vertices.push(v);
    }
    return vertices;
  }

  foldTesseract(vertices, depth) {
    return vertices.map(v => {
      const folded = [...v];
      folded[3] *= depth;
      return folded;
    });
  }

  rotateTesseract(vertices, angle) {
    return vertices.map(v => {
      let [x, y, z, w] = v;
      if (this.rotateAxes) {
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const x1 = x * cosA - w * sinA;
        const w1 = x * sinA + w * cosA;
        const y1 = y * cosA - z * sinA;
        const z1 = y * sinA + z * cosA;
        return [x1, y1, z1, w1];
      }
      return v;
    });
  }

  projectTo2D(vertices, width, height, scale) {
    return vertices.map(v => {
      const perspective = 1 / (2 - v[3]);
      const drift = this.vertexDrift ? (Math.random() - 0.5) * 4 : 0;
      const x = v[0] * perspective * scale + width / 2 + drift;
      const y = v[1] * perspective * scale + height / 2 + drift;
      return [x, y];
    });
  }

  drawEdges(ctx, points, colors) {
    const edges = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if (diff && !(diff & (diff - 1))) {
          edges.push([i, j]);
        }
      }
    }

    ctx.lineWidth = this.edgeThickness;
    edges.forEach(([i, j], idx) => {
      ctx.strokeStyle = colors[idx % colors.length];
      ctx.beginPath();
      ctx.moveTo(...points[i]);
      ctx.lineTo(...points[j]);
      ctx.stroke();
    });
  }

  getBeat(dataArray) {
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    return Math.min(1, (avg / 255) * this.pulseSensitivity);
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
          if (option === setting.default) {
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
    // Optional: handle canvas resize logic
  }

  static getSettingsSchema() {
    return {
      name: 'HyperBloom',
      settings: {
        rotationSpeed: { type: 'range', label: 'Rotation Speed', min: 0.1, max: 3.0, default: 1.0, step: 0.1, unit: 'x' },
        foldDepth: { type: 'range', label: 'Fold Depth', min: 0.0, max: 1.0, default: 0.5, step: 0.05 },
        pulseSensitivity: { type: 'range', label: 'Pulse Sensitivity', min: 0.1, max: 3.0, default: 1.2, step: 0.1 },
        colorScheme: {
          type: 'select',
          label: 'Color Scheme',
          options: ['Neon Grid', 'Cosmic Ice', 'Sunset Fold', 'Monochrome Pulse'],
          default: 'Neon Grid'
        },
        spinDirection: {
          type: 'select',
          label: '2D Spin Direction',
          options: ['Clockwise', 'Counterclockwise', 'None'],
          default: 'Clockwise'
        },
        edgeThickness: {
          type: 'range',
          label: 'Edge Thickness',
          min: 1,
          max: 10,
          default: 2,
          step: 1,
          unit: 'px'
        },
        backgroundFade: {
          type: 'range',
          label: 'Background Fade',
          min: 0,
          max: 1,
          default: 0.2,
          step: 0.05
        },
        vertexDrift: {
          type: 'checkbox',
          label: 'Vertex Drift',
          default: false
        },
        mutateGeometry: {
          type: 'checkbox',
          label: 'Mutate Geometry',
          default: false
        },
        rotateAxes: {
          type: 'checkbox',
          label: 'Multi-Axis Rotation',
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

// ✅ Final registration line
if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register('hyperbloom', 'Hyper Bloom', HyperBloomVisualizer);
}
