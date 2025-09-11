class NBodyVisualizer {
  constructor() {
    // Required properties
    this.animationId = null;
    this.analyser = null;
    this.dataArray = null;
    this.ctx = null;
    this.canvas = null;
    this.elements = null;
    this.mutationEnabled = false;
    this.mutationTimer = 0;
    this.mutationInterval = 300;

    // Visualizer-specific properties
    this.numBodies = 8;
    this.gravityStrength = 0.5;
    this.audioResponse = 0.7;
    this.movementSpeed = 1.0;
    this.trailsEnabled = true;
    this.filamentsEnabled = true;
    this.rotationSpeedBase = 0.02;
    this.pulsateStrength = 0.5;
    this.backgroundStyle = 'galaxy';
    this.colorScheme = 'neon';
    this.baseSize = 20;

    // Body properties
    this.bodies = [];
    this.trails = [];
    this.trailLength = 50;

    // Color schemes
    this.colorSchemes = {
      neon: { primary: '#00ff00', secondary: '#00ffff', accent: '#ff00ff', trail: 'rgba(0,255,0,0.1)' },
      cosmic: { primary: '#ff00ff', secondary: '#00ff00', accent: '#ffff00', trail: 'rgba(255,0,255,0.1)' },
      fire: { primary: '#ff4500', secondary: '#ffff00', accent: '#ff0000', trail: 'rgba(255,69,0,0.1)' },
      ocean: { primary: '#0066cc', secondary: '#00ccff', accent: '#00ffff', trail: 'rgba(0,102,204,0.1)' },
      rainbow: { primary: '#ff0000', secondary: '#00ff00', accent: '#0000ff', trail: 'rgba(255,0,0,0.1)' },
      plasma: { primary: '#ff0080', secondary: '#ff8080', accent: '#ffff80', trail: 'rgba(255,0,128,0.1)' },
      ice: { primary: '#4db8ff', secondary: '#b3e0ff', accent: '#ffffff', trail: 'rgba(77,184,255,0.1)' },
      sunset: { primary: '#ff6b35', secondary: '#ffcd3c', accent: '#ffffff', trail: 'rgba(255,107,53,0.1)' }
    };
  }

  initBodies() {
    this.bodies = [];
    this.trails = [];
    const binCount = this.dataArray ? this.dataArray.length : 1024;
    for (let i = 0; i < this.numBodies; i++) {
      this.bodies.push({
        pos: { x: Math.random() * 800 - 400, y: Math.random() * 600 - 300, z: Math.random() * 200 - 100 },
        vel: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: (Math.random() - 0.5) * 1 },
        rot: { x: 0, y: 0, z: 0 },
        size: this.baseSize + Math.random() * 10,
        freqBand: Math.floor(i * (binCount / this.numBodies)),
        polyType: ['tetra', 'cube', 'octa', 'dodeca', 'icosa'][i % 5] // Different polyhedrons
      });
      this.trails.push([]);
    }
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
    this.analyser = analyser;
    this.dataArray = dataArray;
    this.ctx = ctx;
    this.canvas = canvas;

    this.initBodies();

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
        const width = this.canvas.width / devicePixelRatio;
        const height = this.canvas.height / devicePixelRatio;
        this.updateSimulation();
        this.render(this.ctx, this.dataArray, width, height);
      }
    }
  }

  updateSimulation() {
    // N-body gravity simulation with repulsion to avoid collapse
    const G = this.gravityStrength * 0.01;
    const repulsionStrength = 1000 / this.numBodies; // Adjust based on num bodies

    for (let i = 0; i < this.numBodies; i++) {
      let ax = 0, ay = 0, az = 0;
      const body = this.bodies[i];

      for (let j = 0; j < this.numBodies; j++) {
        if (i === j) continue;
        const other = this.bodies[j];
        const dx = other.pos.x - body.pos.x;
        const dy = other.pos.y - body.pos.y;
        const dz = other.pos.z - body.pos.z;
        const distSq = dx*dx + dy*dy + dz*dz + 1e-6; // Avoid division by zero
        const dist = Math.sqrt(distSq);
        const force = G / distSq;
        ax += force * dx / dist;
        ay += force * dy / dist;
        az += force * dz / dist;

        // Add repulsion if too close
        if (dist < 50) {
          const repForce = repulsionStrength / distSq;
          ax -= repForce * dx / dist;
          ay -= repForce * dy / dist;
          az -= repForce * dz / dist;
        }
      }

      body.vel.x += ax * this.movementSpeed;
      body.vel.y += ay * this.movementSpeed;
      body.vel.z += az * this.movementSpeed;

      body.pos.x += body.vel.x * this.movementSpeed;
      body.pos.y += body.vel.y * this.movementSpeed;
      body.pos.z += body.vel.z * this.movementSpeed;

      // Audio-responsive pulsation and rotation
      const index = Math.min(Math.max(body.freqBand, 0), this.dataArray.length - 1);
      const freqValue = (this.dataArray[index] || 0) / 255;
      body.size = this.baseSize + freqValue * 30 * this.audioResponse * this.pulsateStrength * 10;
      body.rot.y += (this.rotationSpeedBase + freqValue * 0.05) * (i % 2 ? 1 : -1);
      body.rot.x += (this.rotationSpeedBase / 2 + freqValue * 0.02) * (i % 3 ? 1 : -1);

      // Bound to screen to prevent flying off
      const bound = 400;
      if (Math.abs(body.pos.x) > bound) body.vel.x *= -0.9;
      if (Math.abs(body.pos.y) > bound) body.vel.y *= -0.9;
      if (Math.abs(body.pos.z) > 200) body.vel.z *= -0.9;

      // Update trails
      if (this.trailsEnabled) {
        this.trails[i].push({ x: body.pos.x, y: body.pos.y, z: body.pos.z });
        if (this.trails[i].length > this.trailLength) {
          this.trails[i].shift();
        }
      }
    }
  }

  drawBackground(ctx, width, height) {
    let fillStyle;
    switch (this.backgroundStyle) {
      case 'galaxy':
        const galaxyGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        galaxyGrad.addColorStop(0, '#1a0a2a');
        galaxyGrad.addColorStop(0.5, '#0a0a1a');
        galaxyGrad.addColorStop(1, '#000010');
        fillStyle = galaxyGrad;
        break;
      case 'nebula':
        const nebulaGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        nebulaGrad.addColorStop(0, '#2a0a1a');
        nebulaGrad.addColorStop(0.5, '#1a0a2a');
        nebulaGrad.addColorStop(1, '#0a001a');
        fillStyle = nebulaGrad;
        break;
      case 'void':
        fillStyle = '#000000';
        break;
      case 'starry':
        fillStyle = '#0c0c0c';
        break;
      case 'aurora':
        const auroraGrad = ctx.createLinearGradient(0, 0, 0, height);
        auroraGrad.addColorStop(0, '#00ff99');
        auroraGrad.addColorStop(1, '#0066ff');
        fillStyle = auroraGrad;
        break;
      case 'plasma':
        const plasmaGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        plasmaGrad.addColorStop(0, '#ff0080');
        plasmaGrad.addColorStop(0.5, '#ff4080');
        plasmaGrad.addColorStop(1, '#000000');
        fillStyle = plasmaGrad;
        break;
      case 'fire':
        const fireGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        fireGrad.addColorStop(0, '#ff4500');
        fireGrad.addColorStop(0.5, '#ff0000');
        fireGrad.addColorStop(1, '#000000');
        fillStyle = fireGrad;
        break;
      case 'ocean':
        const oceanGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        oceanGrad.addColorStop(0, '#0066cc');
        oceanGrad.addColorStop(0.5, '#003366');
        oceanGrad.addColorStop(1, '#000033');
        fillStyle = oceanGrad;
        break;
      default:
        fillStyle = '#000000';
    }
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, width, height);
  }

  render(ctx, dataArray, width, height) {
    this.drawBackground(ctx, width, height);

    // Translate to center
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Sort bodies by z for depth
    const sortedBodies = [...this.bodies].sort((a, b) => a.pos.z - b.pos.z);

    // Draw filaments if enabled
    if (this.filamentsEnabled) {
      ctx.strokeStyle = this.colorSchemes[this.colorScheme].trail.replace('0.1', '0.05');
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < this.numBodies; i++) {
        for (let j = i + 1; j < this.numBodies; j++) {
          const bodyA = this.bodies[i];
          const bodyB = this.bodies[j];
          const scaleA = 1 / (1 + bodyA.pos.z / 200);
          const scaleB = 1 / (1 + bodyB.pos.z / 200);
          ctx.moveTo(bodyA.pos.x * scaleA, bodyA.pos.y * scaleA);
          ctx.lineTo(bodyB.pos.x * scaleB, bodyB.pos.y * scaleB);
        }
      }
      ctx.stroke();
    }

    // Draw trails and bodies
    const colors = this.colorSchemes[this.colorScheme];
    for (let i = 0; i < this.numBodies; i++) {
      const body = this.bodies[i];
      const scale = 1 / (1 + body.pos.z / 200); // Simple perspective
      const x = body.pos.x * scale;
      const y = body.pos.y * scale;

      // Draw trail
      if (this.trailsEnabled && this.trails[i].length > 1) {
        ctx.beginPath();
        for (let j = 0; j < this.trails[i].length; j++) {
          const trailPoint = this.trails[i][j];
          const trailScale = 1 / (1 + trailPoint.z / 200);
          const tx = trailPoint.x * trailScale;
          const ty = trailPoint.y * trailScale;
          const alpha = j / this.trailLength;
          ctx.strokeStyle = colors.trail.replace('0.1', (alpha * 0.5).toString());
          if (j === 0) ctx.moveTo(tx, ty);
          else ctx.lineTo(tx, ty);
        }
        ctx.stroke();
      }

      // Draw polyhedron (simple wireframe projection)
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.rotate(body.rot.y); // Simple 2D rotation for effect

      // Radial fill gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, body.size);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(0.5, colors.secondary);
      gradient.addColorStop(1, colors.accent);
      ctx.fillStyle = gradient;

      // Draw simple poly shape based on type
      this.drawPolyhedron(ctx, body.polyType, body.size);

      ctx.restore();
    }

    ctx.restore();
  }

  drawPolyhedron(ctx, type, size) {
    ctx.beginPath();
    let sides;
    switch (type) {
      case 'tetra': sides = 3; break; // Triangle for tetrahedron projection
      case 'cube': sides = 4; break;
      case 'octa': sides = 8; break; // Octagon approx
      case 'dodeca': sides = 5; break; // Pentagon
      case 'icosa': sides = 3; break; // Triangle
      default: sides = 6;
    }
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
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

        let currentValue = setting.default;
        switch (key.toLowerCase()) {
          case 'numbodies':
            currentValue = this.numBodies;
            break;
          case 'gravitystrength':
            currentValue = this.gravityStrength * 100;
            break;
          case 'audioresponse':
            currentValue = this.audioResponse * 100;
            break;
          case 'movementspeed':
            currentValue = this.movementSpeed * 100;
            break;
          case 'pulsatestrength':
            currentValue = this.pulsateStrength * 100;
            break;
          case 'basesize':
            currentValue = this.baseSize;
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

        let currentChecked = setting.default;
        switch (key.toLowerCase()) {
          case 'trailsenabled':
            currentChecked = this.trailsEnabled;
            break;
          case 'filamentsenabled':
            currentChecked = this.filamentsEnabled;
            break;
          case 'mutatemode':
            currentChecked = this.mutationEnabled;
            break;
        }

        input.checked = currentChecked;

        if (key.toLowerCase() === 'mutatemode') {
          const statusSpan = document.createElement('span');
          statusSpan.className = 'mutation-status';
          statusSpan.style.cssText = 'font-size: 11px; margin-left: 5px;';
          statusSpan.textContent = currentChecked ? ' 🎲 ACTIVE' : '';
          statusSpan.style.color = currentChecked ? '#6366f1' : '';
          statusSpan.style.fontWeight = currentChecked ? 'bold' : '';
          item.appendChild(statusSpan);
        }

        input.addEventListener('change', (e) => {
          if (key.toLowerCase() === 'mutatemode') {
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

        let currentSelected = setting.default;
        switch (key.toLowerCase()) {
          case 'colorscheme':
            currentSelected = this.colorScheme;
            break;
          case 'backgroundstyle':
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
      name: 'N-Body Cosmos',
      settings: {
        numBodies: {
          type: 'range',
          label: 'Number of Bodies',
          min: 3,
          max: 20,
          default: 8,
          step: 1,
          unit: ''
        },
        gravityStrength: {
          type: 'range',
          label: 'Gravity Strength',
          min: 0,
          max: 100,
          default: 50,
          step: 5,
          unit: '%'
        },
        audioResponse: {
          type: 'range',
          label: 'Audio Response',
          min: 0,
          max: 100,
          default: 70,
          step: 5,
          unit: '%'
        },
        movementSpeed: {
          type: 'range',
          label: 'Movement Speed',
          min: 50,
          max: 200,
          default: 100,
          step: 10,
          unit: '%'
        },
        pulsateStrength: {
          type: 'range',
          label: 'Pulsate Strength',
          min: 0,
          max: 100,
          default: 50,
          step: 5,
          unit: '%'
        },
        baseSize: {
          type: 'range',
          label: 'Object Size',
          min: 10,
          max: 50,
          default: 20,
          step: 1,
          unit: ''
        },
        trailsEnabled: {
          type: 'checkbox',
          label: 'Enable Trails',
          default: true
        },
        filamentsEnabled: {
          type: 'checkbox',
          label: 'Enable Filaments',
          default: true
        },
        colorScheme: {
          type: 'select',
          label: 'Color Scheme',
          options: [
            { value: 'neon', label: 'Neon' },
            { value: 'cosmic', label: 'Cosmic' },
            { value: 'fire', label: 'Fire' },
            { value: 'ocean', label: 'Ocean' },
            { value: 'rainbow', label: 'Rainbow' },
            { value: 'plasma', label: 'Plasma' },
            { value: 'ice', label: 'Ice' },
            { value: 'sunset', label: 'Sunset' }
          ],
          default: 'neon'
        },
        backgroundStyle: {
          type: 'select',
          label: 'Background',
          options: [
            { value: 'galaxy', label: 'Galaxy' },
            { value: 'nebula', label: 'Nebula' },
            { value: 'void', label: 'Void' },
            { value: 'starry', label: 'Starry' },
            { value: 'aurora', label: 'Aurora' },
            { value: 'plasma', label: 'Plasma' },
            { value: 'fire', label: 'Fire' },
            { value: 'ocean', label: 'Ocean' }
          ],
          default: 'galaxy'
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
        probability: 0.6,
        values: ['neon', 'cosmic', 'fire', 'ocean', 'rainbow', 'plasma', 'ice', 'sunset']
      },
      backgroundStyle: {
        probability: 0.5,
        values: ['galaxy', 'nebula', 'void', 'starry', 'aurora', 'plasma', 'fire', 'ocean']
      },
      numBodies: {
        probability: 0.2,
        values: [5, 6, 7, 8, 9, 10, 12]
      },
      trailsEnabled: {
        probability: 0.15,
        values: [true, false]
      },
      filamentsEnabled: {
        probability: 0.15,
        values: [true, false]
      },
      gravityStrength: {
        probability: 0.25,
        range: { min: 0.2, max: 0.8 }
      },
      audioResponse: {
        probability: 0.25,
        range: { min: 0.4, max: 1.0 }
      },
      baseSize: {
        probability: 0.2,
        range: { min: 15, max: 30 }
      }
    };
  }

  setSetting(key, value) {
    switch (key) {
      case 'numBodies':
        this.numBodies = parseInt(value);
        if (this.dataArray) {
          this.initBodies();
        }
        break;
      case 'gravityStrength':
        this.gravityStrength = value / 100;
        break;
      case 'audioResponse':
        this.audioResponse = value / 100;
        break;
      case 'movementSpeed':
        this.movementSpeed = value / 100;
        break;
      case 'pulsateStrength':
        this.pulsateStrength = value / 100;
        break;
      case 'baseSize':
        this.baseSize = parseInt(value);
        break;
      case 'trailsEnabled':
        this.trailsEnabled = value;
        if (!value) this.trails = this.trails.map(() => []);
        break;
      case 'filamentsEnabled':
        this.filamentsEnabled = value;
        break;
      case 'colorScheme':
        this.colorScheme = value;
        break;
      case 'backgroundStyle':
        this.backgroundStyle = value;
        break;
    }
  }
}

if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register('nbody', 'N-Body Cosmos', NBodyVisualizer);
}