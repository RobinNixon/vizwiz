class BigBouncerVisualizer {
  constructor() {
    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;
    this.elements = null;
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 200;

    this.shapes = [];
    this.particles = [];
    this.numShapes = 10;
    this.baseSpeed = 2;
    this.trailLength = 10;
    this.glowIntensity = 10;
    this.haloSize = 1;
    this.sensitivity = 3.0;
    this.backgroundStyle = 'dark';
    this.bounceEffect = true;
    this.rotationEnabled = true;
    this.enableCircles = true;
    this.enableLines = true;
    this.enablePolygons = true;
    this.enableStars = true;
    this.minSides = 3;
    this.maxSides = 8;

    this.colorSchemes = {
      purple:  { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899', peak: '#f59e0b' },
      rainbow: { primary: '#ff0000', secondary: '#ffff00', accent: '#00ff00', peak: '#ffffff' },
      fire:    { primary: '#ff4500', secondary: '#ff6500', accent: '#ffff00', peak: '#ffffff' },
      ocean:   { primary: '#0066cc', secondary: '#0099ff', accent: '#00ccff', peak: '#ffffff' },
      neon:    { primary: '#00ff00', secondary: '#00ff88', accent: '#00ffff', peak: '#ffffff' },
      sunset:  { primary: '#ff6b35', secondary: '#f7931e', accent: '#ffcd3c', peak: '#ffffff' },
      plasma:  { primary: '#ff0080', secondary: '#ff4080', accent: '#ff8080', peak: '#ffffff' },
      ice:     { primary: '#4db8ff', secondary: '#80d0ff', accent: '#b3e0ff', peak: '#ffffff' }
    };

    this.backgroundStyles = {
      dark:    '#0c0c0c',
      black:   '#000000',
      navy:    '#0a0a1a',
      purple:  '#1a0a1a',
      green:   '#0a1a0a',
      blue:    '#0a0a2a',
      red:     '#2a0a0a',
      orange:  '#2a1a0a',
      teal:    '#0a2a2a',
      magenta: '#2a0a2a',
      galaxy:  'gradient',
      neon:    'gradient'
    };

    this.colors = this.colorSchemes.purple;
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

    this.createShapes(canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);

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
    this.createShapes(width, height);
  }

  static getSettingsSchema() {
    return {
      name: 'Big Bouncer',
      settings: {
        numShapes: {
          type: 'range',
          label: 'Number of Shapes',
          min: 5,
          max: 30,
          default: 10,
          step: 1,
          unit: ''
        },
        baseSpeed: {
          type: 'range',
          label: 'Speed',
          min: 50,
          max: 200,
          default: 100,
          step: 10,
          unit: '%'
        },
        trailLength: {
          type: 'range',
          label: 'Trail Length',
          min: 0,
          max: 20,
          default: 10,
          step: 1,
          unit: ''
        },
        glowIntensity: {
          type: 'range',
          label: 'Glow Intensity',
          min: 0,
          max: 20,
          default: 10,
          step: 1,
          unit: ''
        },
        haloSize: {
          type: 'range',
          label: 'Halo Size',
          min: 0,
          max: 20,
          default: 10,
          step: 1,
          unit: ''
        },
        sensitivity: {
          type: 'range',
          label: 'Sensitivity',
          min: 50,
          max: 300,
          default: 300,
          step: 10,
          unit: '%'
        },
        enableCircles: {
          type: 'checkbox',
          label: 'Include Circles',
          default: true
        },
        enableLines: {
          type: 'checkbox',
          label: 'Include Lines',
          default: true
        },
        enablePolygons: {
          type: 'checkbox',
          label: 'Include Polygons',
          default: true
        },
        enableStars: {
          type: 'checkbox',
          label: 'Include Stars',
          default: true
        },
        minSides: {
          type: 'range',
          label: 'Min Sides',
          min: 3,
          max: 8,
          default: 3,
          step: 1,
          unit: ''
        },
        maxSides: {
          type: 'range',
          label: 'Max Sides',
          min: 3,
          max: 8,
          default: 8,
          step: 1,
          unit: ''
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
        bounceEffect: {
          type: 'checkbox',
          label: 'Bounce Sparks',
          default: true
        },
        rotationEnabled: {
          type: 'checkbox',
          label: 'Rotation',
          default: true
        },
        mutateMode: {
          type: 'checkbox',
          label: 'Mutate Mode',
          default: false
        }
      }
    };
  }

  static getMutationSettings() {
    return {
      colorScheme: {
        probability: 0.6,
        values: ['purple', 'rainbow', 'fire', 'ocean', 'neon', 'sunset', 'plasma', 'ice']
      },
      baseSpeed: {
        probability: 0.3,
        range: { min: 50, max: 200 }
      },
      trailLength: {
        probability: 0.25,
        range: { min: 0, max: 20 }
      },
      glowIntensity: {
        probability: 0.25,
        range: { min: 0, max: 20 }
      },
      haloSize: {
        probability: 0.25,
        range: { min: 0, max: 20 }
      },
      enableCircles: {
        probability: 0.15,
        values: [true, false]
      },
      enableLines: {
        probability: 0.15,
        values: [true, false]
      },
      enablePolygons: {
        probability: 0.15,
        values: [true, false]
      },
      enableStars: {
        probability: 0.15,
        values: [true, false]
      },
      minSides: {
        probability: 0.2,
        values: [3,4,5,6,7,8]
      },
      maxSides: {
        probability: 0.2,
        values: [3,4,5,6,7,8]
      },
      backgroundColor: {
        probability: 0.5,
        values: ['dark', 'black', 'navy', 'purple', 'green', 'blue', 'red', 'orange', 'teal', 'magenta', 'galaxy', 'neon']
      },
      bounceEffect: {
        probability: 0.15,
        values: [true, false],
        bias: 0.8
      },
      rotationEnabled: {
        probability: 0.15,
        values: [true, false],
        bias: 0.7
      }
    };
  }

  drawBackground(ctx, width, height) {
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

  createShapes(width, height) {
    this.shapes = [];
    const fftSize = this.dataArray ? this.dataArray.length : 1024;

    let possibleTypes = [];
    if (this.enableCircles) possibleTypes.push('circle');
    if (this.enableLines) possibleTypes.push('line');
    if (this.enablePolygons) possibleTypes.push('polygon');
    if (this.enableStars) possibleTypes.push('star');
    if (possibleTypes.length === 0) possibleTypes.push('circle');

    for (let i = 0; i < this.numShapes; i++) {
      const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
      const shape = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * this.baseSpeed * 2,
        vy: (Math.random() - 0.5) * this.baseSpeed * 2,
        size: 20 + Math.random() * 30,
        color: [this.colors.primary, this.colors.secondary, this.colors.accent][Math.floor(Math.random() * 3)],
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.05,
        bandIndex: Math.floor(i * fftSize / this.numShapes),
        trail: [],
        type: type,
        sides: 0,
        inset: 0
      };

      if (type === 'polygon' || type === 'star') {
        shape.sides = Math.floor(Math.random() * (this.maxSides - this.minSides + 1)) + this.minSides;
      }
      if (type === 'star') {
        shape.inset = 0.3 + Math.random() * 0.4;
      }

      this.shapes.push(shape);
    }
  }

  drawShapePath(ctx, shape, size) {
    if (shape.type === 'circle') {
      ctx.arc(0, 0, size, 0, 2 * Math.PI);
    } else if (shape.type === 'line') {
      const halfLength = size;
      const thickness = size / 5;
      ctx.rect(-halfLength, -thickness / 2, halfLength * 2, thickness);
    } else if (shape.type === 'polygon') {
      const angleStep = 2 * Math.PI / shape.sides;
      ctx.moveTo(size, 0);
      for (let i = 1; i < shape.sides; i++) {
        const ang = i * angleStep;
        ctx.lineTo(size * Math.cos(ang), size * Math.sin(ang));
      }
      ctx.closePath();
    } else if (shape.type === 'star') {
      const angleStep = Math.PI / shape.sides;
      const outerR = size;
      const innerR = size * shape.inset;
      ctx.moveTo(outerR, 0);
      for (let i = 1; i < shape.sides * 2; i++) {
        const r = (i % 2 === 0) ? outerR : innerR;
        const ang = i * angleStep;
        ctx.lineTo(r * Math.cos(ang), r * Math.sin(ang));
      }
      ctx.closePath();
    }
  }

  render(ctx, dataArray, width, height) {
    this.drawBackground(ctx, width, height);

    // Update and draw particles
    this.particles = this.particles.filter(p => p.life-- > 0);

    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
    });
    ctx.globalAlpha = 1;

    // Draw and update shapes
    this.shapes.forEach(shape => {
      const amp = (dataArray[shape.bandIndex] || 0) / 255 * this.sensitivity;
      const pulseSize = shape.size * (1 + amp * 0.5);

      // Draw trail
      if (this.trailLength > 0) {
        shape.trail.push({ x: shape.x, y: shape.y, size: pulseSize, angle: shape.angle });
        if (shape.trail.length > this.trailLength) shape.trail.shift();

        shape.trail.forEach((t, j) => {
          const alpha = (j + 1) / shape.trail.length * 0.5;
          const trailSize = t.size * (j + 1) / shape.trail.length;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(t.x, t.y);
          ctx.rotate(t.angle);
          ctx.beginPath();
          this.drawShapePath(ctx, shape, trailSize);
          ctx.fillStyle = shape.color;
          ctx.fill();
          ctx.restore();
        });
        ctx.globalAlpha = 1;
      }

      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.angle);

      // Draw halo
      if (this.haloSize > 0) {
        const haloAddon = this.haloSize * 2;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = shape.color;
        ctx.beginPath();
        this.drawShapePath(ctx, shape, pulseSize + haloAddon);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Set glow
      if (this.glowIntensity > 0) {
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = this.glowIntensity * (1 + amp);
      }

      // Draw shape
      ctx.beginPath();
      this.drawShapePath(ctx, shape, pulseSize);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
      grad.addColorStop(0, this.colors.accent);
      grad.addColorStop(0.5, shape.color);
      grad.addColorStop(1, this.colors.primary);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Update shapes positions and rotations
    this.shapes.forEach(shape => {
      if (this.rotationEnabled) {
        shape.angle += shape.angularSpeed;
      }

      shape.x += shape.vx;
      shape.y += shape.vy;

      // Wall collisions
      if (shape.x - shape.size < 0 || shape.x + shape.size > width) {
        shape.vx = -shape.vx;
        shape.x = Math.max(shape.size, Math.min(width - shape.size, shape.x));
      }
      if (shape.y - shape.size < 0 || shape.y + shape.size > height) {
        shape.vy = -shape.vy;
        shape.y = Math.max(shape.size, Math.min(height - shape.size, shape.y));
      }
    });

    // Shape collisions
    for (let i = 0; i < this.shapes.length; i++) {
      for (let j = i + 1; j < this.shapes.length; j++) {
        const s1 = this.shapes[i];
        const s2 = this.shapes[j];
        const dx = s1.x - s2.x;
        const dy = s1.y - s2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = s1.size + s2.size;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const rvx = s1.vx - s2.vx;
          const rvy = s1.vy - s2.vy;
          const dot = rvx * nx + rvy * ny;

          if (dot > 0) continue;

          const mass1 = s1.size * s1.size;
          const mass2 = s2.size * s2.size;
          const impulse = (2 * dot) / (mass1 + mass2);

          s1.vx -= impulse * mass2 * nx;
          s1.vy -= impulse * mass2 * ny;
          s2.vx += impulse * mass1 * nx;
          s2.vy += impulse * mass1 * ny;

          const overlap = minDist - dist;
          s1.x += nx * overlap / 2;
          s1.y += ny * overlap / 2;
          s2.x -= nx * overlap / 2;
          s2.y -= ny * overlap / 2;

          if (this.bounceEffect) {
            const midX = (s1.x + s2.x) / 2;
            const midY = (s1.y + s2.y) / 2;
            const sparkColor = this.colors.peak;
            for (let k = 0; k < 10; k++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 1 + Math.random() * 3;
              const life = 20 + Math.random() * 10;
              this.particles.push({
                x: midX,
                y: midY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                maxLife: life,
                color: sparkColor,
                size: 1 + Math.random() * 2
              });
            }
          }
        }
      }
    }
  }

  setSetting(key, value) {
    let oldValue;
    switch (key) {
      case 'numShapes':
        this.numShapes = value;
        this.recreateShapes();
        break;
      case 'baseSpeed':
        oldValue = this.baseSpeed;
        this.baseSpeed = value / 50;
        if (this.shapes && oldValue) {
          const ratio = this.baseSpeed / oldValue;
          this.shapes.forEach(s => {
            s.vx *= ratio;
            s.vy *= ratio;
          });
        }
        break;
      case 'trailLength':
        this.trailLength = value;
        break;
      case 'glowIntensity':
        this.glowIntensity = value;
        break;
      case 'haloSize':
        this.haloSize = value;
        break;
      case 'sensitivity':
        this.sensitivity = value / 100;
        break;
      case 'enableCircles':
        this.enableCircles = value;
        this.recreateShapes();
        break;
      case 'enableLines':
        this.enableLines = value;
        this.recreateShapes();
        break;
      case 'enablePolygons':
        this.enablePolygons = value;
        this.recreateShapes();
        break;
      case 'enableStars':
        this.enableStars = value;
        this.recreateShapes();
        break;
      case 'minSides':
        this.minSides = value;
        this.recreateShapes();
        break;
      case 'maxSides':
        this.maxSides = value;
        this.recreateShapes();
        break;
      case 'colorScheme':
        this.colors = this.colorSchemes[value];
        if (this.shapes) {
          this.shapes.forEach(s => {
            s.color = [this.colors.primary, this.colors.secondary, this.colors.accent][Math.floor(Math.random() * 3)];
          });
        }
        break;
      case 'backgroundColor':
        this.backgroundStyle = value;
        break;
      case 'bounceEffect':
        this.bounceEffect = value;
        break;
      case 'rotationEnabled':
        this.rotationEnabled = value;
        break;
      case 'mutateMode':
        this.mutationEnabled = value;
        this.mutationTimer = 0;
        break;
    }
  }

  recreateShapes() {
    if (this.canvas) {
      this.createShapes(this.canvas.width / devicePixelRatio, this.canvas.height / devicePixelRatio);
    }
  }
}

if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register('bouncer', 'Big Bouncer', BigBouncerVisualizer);
}