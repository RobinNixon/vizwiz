/**
 * VizWiz Kaleidoscope Visualizer Plugin
 * 
 * Creates beautiful kaleidoscopic patterns with animated objects that fall and bounce
 * around the screen. The kaleidoscope rotates and reflects everything in symmetrical
 * patterns, creating mesmerizing visual effects that respond to audio.
 * 
 * See vizwiz.txt for complete development guide.
 */

class KaleidoscopeVisualizer {
    constructor() {
        this.segments = 8;
        this.rotationSpeed = 0.5;
        this.objectCount = 12;
        this.objectSize = 2.0;
        this.gravity = 0.3;
        this.bounce = 0.8;
        this.audioSensitivity = 1.5;
        this.colorScheme = 'rainbow';
        this.backgroundStyle = 'black';
        this.trailLength = 0.95;
        this.shapeType = 'mixed';
        this.reflectionStyle = 'mirror';
        this.pulseSensitivity = 1.0;
        
        // Animation properties
        this.animationId = null;
        this.analyser = null;
        this.dataArray = null;
        this.ctx = null;
        this.canvas = null;
        this.time = 0;
        this.rotation = 0;
        this.audioLevel = 0;
        this.audioHistory = new Array(30).fill(0);
        this.baseRadius = 0;
        
        // Kaleidoscope objects
        this.objects = [];
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.maxRadius = 0;
        
        // Mutation properties
        this.mutationEnabled = false;
        this.mutationTimer = 0;
        this.mutationInterval = 180;
        
        // UI elements
        this.elements = null;
        
        this.colorSchemes = {
            rainbow: {
                name: 'Rainbow Prism',
                colors: [
                    '#ff0000', '#ff8000', '#ffff00', '#80ff00',
                    '#00ff00', '#00ff80', '#00ffff', '#0080ff',
                    '#0000ff', '#8000ff', '#ff00ff', '#ff0080'
                ]
            },
            fire: {
                name: 'Fire Crystal',
                colors: [
                    '#ffff00', '#ff8000', '#ff4000', '#ff0000',
                    '#cc0000', '#990000', '#ff6600', '#ffcc00'
                ]
            },
            ocean: {
                name: 'Ocean Depths',
                colors: [
                    '#00ffff', '#00ccff', '#0099ff', '#0066ff',
                    '#0033ff', '#0000ff', '#3366ff', '#66ccff'
                ]
            },
            crystal: {
                name: 'Crystal Cave',
                colors: [
                    '#ffffff', '#ccffff', '#99ffff', '#66ffcc',
                    '#33ff99', '#00ff66', '#99ffcc', '#ccffff'
                ]
            },
            sunset: {
                name: 'Sunset Mandala',
                colors: [
                    '#ff6600', '#ff9900', '#ffcc00', '#ffff33',
                    '#ff3366', '#ff0099', '#cc0066', '#990033'
                ]
            },
            cosmic: {
                name: 'Cosmic Void',
                colors: [
                    '#8000ff', '#4000ff', '#0040ff', '#0080ff',
                    '#00ff80', '#80ff00', '#ff8000', '#ff4080'
                ]
            },
            emerald: {
                name: 'Emerald Dreams',
                colors: [
                    '#00ff00', '#33ff33', '#66ff66', '#99ff99',
                    '#00cc00', '#009900', '#00ff66', '#66ff00'
                ]
            },
            aurora: {
                name: 'Aurora Borealis',
                colors: [
                    '#00ff80', '#80ff80', '#80ff00', '#ffff00',
                    '#ff8080', '#ff0080', '#8000ff', '#0080ff'
                ]
            }
        };
        
        this.backgroundStyles = {
            black: '#000000',
            dark: '#0a0a0a',
            navy: '#000a1a',
            purple: '#0a0a1a',
            cosmic: '#050510'
        };
        
        this.shapeTypes = {
            circles: 'Circles',
            squares: 'Squares', 
            triangles: 'Triangles',
            stars: 'Stars',
            mixed: 'Mixed Shapes'
        };
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
    }
    
    startVisualization(analyser, dataArray, ctx, canvas) {
        this.analyser = analyser;
        this.dataArray = dataArray;
        this.ctx = ctx;
        this.canvas = canvas;
        
        this.updateDimensions();
        this.initializeObjects();
        
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
        
        this.width = this.canvas.width / devicePixelRatio;
        this.height = this.canvas.height / devicePixelRatio;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.baseRadius = Math.min(this.width, this.height) / 3;
        this.maxRadius = this.baseRadius; // Keep this for object boundaries
    }
    
    initializeObjects() {
        this.objects = [];
        const scheme = this.colorSchemes[this.colorScheme];
        
        for (let i = 0; i < this.objectCount; i++) {
            this.objects.push({
                x: Math.random() * this.maxRadius * 2 - this.maxRadius,
                y: Math.random() * this.maxRadius * 2 - this.maxRadius,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: (Math.random() * 0.5 + 0.5) * this.objectSize,
                color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
                shape: this.getRandomShape(),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                life: 1.0,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }
    
    getRandomShape() {
        if (this.shapeType === 'mixed') {
            const shapes = ['circle', 'square', 'triangle', 'star'];
            return shapes[Math.floor(Math.random() * shapes.length)];
        }
        return this.shapeType === 'circles' ? 'circle' :
               this.shapeType === 'squares' ? 'square' :
               this.shapeType === 'triangles' ? 'triangle' : 'star';
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.analyser && this.dataArray) {
            this.analyser.getByteFrequencyData(this.dataArray);
            this.updateAudioData();
            
            if (this.mutationEnabled) {
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
        
        this.time += 0.016;
        this.rotation += this.rotationSpeed * 0.01 * (1 + this.audioLevel);
    }
    
    updateAudioData() {
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        this.audioLevel = (sum / this.dataArray.length / 255) * this.audioSensitivity;
        
        this.audioHistory.shift();
        this.audioHistory.push(this.audioLevel);
    }
    
    render() {
        // Apply trail effect
        if (this.trailLength < 1.0) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.trailLength})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            this.ctx.fillStyle = this.backgroundStyles[this.backgroundStyle] || '#000000';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Update and draw kaleidoscope
        this.updateObjects();
        this.drawKaleidoscope();
    }
    
    updateObjects() {
        const audioBoost = 1 + this.audioLevel * 2;
        const gravityForce = this.gravity * 0.5;
        
        this.objects.forEach((obj, index) => {
            // Apply gravity
            obj.vy += gravityForce;
            
            // Apply audio-reactive forces
            const audioIndex = Math.floor((index / this.objects.length) * this.dataArray.length);
            const audioForce = (this.dataArray[audioIndex] / 255) * this.audioSensitivity;
            obj.vx += (Math.random() - 0.5) * audioForce * 0.5;
            obj.vy += (Math.random() - 0.5) * audioForce * 0.5;
            
            // Update position
            obj.x += obj.vx;
            obj.y += obj.vy;
            
            // Bounce off boundaries (circular boundary with current radius)
            const currentRadius = this.baseRadius * (1 + this.audioLevel * this.pulseSensitivity * 0.3);
            const dist = Math.sqrt(obj.x * obj.x + obj.y * obj.y);
            if (dist > currentRadius * 0.9) { // Use 90% of current radius for smoother bouncing
                const angle = Math.atan2(obj.y, obj.x);
                obj.x = Math.cos(angle) * this.maxRadius;
                obj.y = Math.sin(angle) * this.maxRadius;
                
                // Reflect velocity
                const normalX = obj.x / this.maxRadius;
                const normalY = obj.y / this.maxRadius;
                const dot = obj.vx * normalX + obj.vy * normalY;
                obj.vx -= 2 * dot * normalX * this.bounce;
                obj.vy -= 2 * dot * normalY * this.bounce;
            }
            
            // Update rotation and pulse
            obj.rotation += obj.rotationSpeed * audioBoost;
            obj.pulse += 0.1;
            
            // Randomly spawn new objects based on audio
            if (Math.random() < audioForce * 0.01 && this.objects.length < this.objectCount * 2) {
                const scheme = this.colorSchemes[this.colorScheme];
                this.objects.push({
                    x: (Math.random() - 0.5) * this.maxRadius * 0.5,
                    y: (Math.random() - 0.5) * this.maxRadius * 0.5,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    size: (Math.random() * 0.5 + 0.5) * this.objectSize,
                    color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
                    shape: this.getRandomShape(),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2,
                    life: 1.0,
                    pulse: Math.random() * Math.PI * 2
                });
            }
        });
        
        // Remove excess objects
        if (this.objects.length > this.objectCount * 2) {
            this.objects.splice(this.objectCount, this.objects.length - this.objectCount);
        }
    }
    
    drawKaleidoscope() {
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        
        // Calculate pulsating radius based on audio
        const pulseAmount = this.audioLevel * this.pulseSensitivity * 0.3;
        const currentRadius = this.baseRadius * (1 + pulseAmount);
        
        // Create clipping region for kaleidoscope with pulsating radius
        this.ctx.beginPath();
        this.ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        this.ctx.clip();
        
        // Optional: Add a subtle glow effect when pulsing
        if (pulseAmount > 0.1) {
            this.ctx.shadowColor = this.colorSchemes[this.colorScheme].colors[0];
            this.ctx.shadowBlur = pulseAmount * 20;
        }
        
        // Draw each kaleidoscope segment
        const angleStep = (Math.PI * 2) / this.segments;
        
        for (let i = 0; i < this.segments; i++) {
            this.ctx.save();
            this.ctx.rotate(this.rotation + i * angleStep);
            
            // Create segment clipping path
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, currentRadius, 0, angleStep);
            this.ctx.closePath();
            this.ctx.clip();
            
            // Flip every other segment for mirror effect
            if (this.reflectionStyle === 'mirror' && i % 2 === 1) {
                this.ctx.scale(-1, 1);
            }
            
            // Draw objects in this segment
            this.drawObjects();
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    drawObjects() {
        this.objects.forEach(obj => {
            this.ctx.save();
            this.ctx.translate(obj.x, obj.y);
            this.ctx.rotate(obj.rotation);
            
            // Audio-reactive size pulsing
            const pulseSize = obj.size * (1 + Math.sin(obj.pulse) * this.audioLevel * 0.3);
            const alpha = 0.7 + this.audioLevel * 0.3;
            
            this.ctx.fillStyle = obj.color;
            this.ctx.strokeStyle = obj.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.lineWidth = 2;
            
            this.drawShape(obj.shape, pulseSize);
            
            this.ctx.restore();
        });
    }
    
    drawShape(shape, size) {
        const radius = size * 10;
        
        switch (shape) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                break;
                
            case 'square':
                this.ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
                this.ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
                break;
                
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -radius);
                this.ctx.lineTo(-radius * 0.866, radius * 0.5);
                this.ctx.lineTo(radius * 0.866, radius * 0.5);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
                
            case 'star':
                this.drawStar(radius);
                break;
        }
    }
    
    drawStar(radius) {
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        
        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
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
        window.VisualizerRegistry.resetToDefaults(this);
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
        this.initializeObjects();
    }
    
    setSetting(key, value) {
        switch (key) {
            case 'segments':
                this.setSegments(parseInt(value));
                break;
            case 'rotationSpeed':
                this.setRotationSpeed(parseFloat(value));
                break;
            case 'objectCount':
                this.setObjectCount(parseInt(value));
                break;
            case 'objectSize':
                this.setObjectSize(parseFloat(value));
                break;
            case 'gravity':
                this.setGravity(parseFloat(value));
                break;
            case 'bounce':
                this.setBounce(parseFloat(value));
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
            case 'trailLength':
                this.setTrailLength(parseFloat(value));
                break;
            case 'shapeType':
                this.setShapeType(value);
                break;
            case 'reflectionStyle':
                this.setReflectionStyle(value);
                break;
            case 'pulseSensitivity':
                this.setPulseSensitivity(parseFloat(value));
                break;
        }
    }
    
    setSegments(value) {
        this.segments = Math.max(3, Math.min(16, value));
    }
    
    setRotationSpeed(value) {
        this.rotationSpeed = Math.max(-3.0, Math.min(3.0, value));
    }
    
    setObjectCount(value) {
        this.objectCount = Math.max(3, Math.min(30, value));
        if (this.objects.length > this.objectCount) {
            this.objects.splice(this.objectCount);
        }
    }
    
    setObjectSize(value) {
        this.objectSize = Math.max(0.5, Math.min(5.0, value));
    }
    
    setGravity(value) {
        this.gravity = Math.max(0.0, Math.min(2.0, value));
    }
    
    setBounce(value) {
        this.bounce = Math.max(0.1, Math.min(1.0, value));
    }
    
    setAudioSensitivity(value) {
        this.audioSensitivity = Math.max(0.1, Math.min(3.0, value));
    }
    
    setColorScheme(scheme) {
        if (this.colorSchemes[scheme]) {
            this.colorScheme = scheme;
            this.initializeObjects();
        }
    }
    
    setBackgroundStyle(style) {
        this.backgroundStyle = style;
    }
    
    setTrailLength(value) {
        this.trailLength = Math.max(0.5, Math.min(1.0, value));
    }
    
    setShapeType(type) {
        this.shapeType = type;
        this.objects.forEach(obj => {
            obj.shape = this.getRandomShape();
        });
    }
    
    setReflectionStyle(style) {
        this.reflectionStyle = style;
    }
    
    setPulseSensitivity(value) {
        this.pulseSensitivity = Math.max(0.0, Math.min(3.0, value));
    }
    
    static getSettingsSchema() {
        return {
            name: 'Kaleidoscope Visualizer',
            settings: {
                segments: {
                    type: 'range',
                    label: 'Mirror Segments',
                    min: 3,
                    max: 16,
                    default: 8,
                    step: 1,
                    unit: ''
                },
                rotationSpeed: {
                    type: 'range',
                    label: 'Rotation Speed',
                    min: -2.0,
                    max: 2.0,
                    default: 0.5,
                    step: 0.1,
                    unit: 'x'
                },
                objectCount: {
                    type: 'range',
                    label: 'Object Count',
                    min: 3,
                    max: 30,
                    default: 12,
                    step: 1,
                    unit: ''
                },
                objectSize: {
                    type: 'range',
                    label: 'Object Size',
                    min: 0.5,
                    max: 4.0,
                    default: 2.0,
                    step: 0.1,
                    unit: 'x'
                },
                gravity: {
                    type: 'range',
                    label: 'Gravity',
                    min: 0.0,
                    max: 1.5,
                    default: 0.3,
                    step: 0.1,
                    unit: ''
                },
                bounce: {
                    type: 'range',
                    label: 'Bounce Factor',
                    min: 0.1,
                    max: 1.0,
                    default: 0.8,
                    step: 0.05,
                    unit: ''
                },
                audioSensitivity: {
                    type: 'range',
                    label: 'Audio Response',
                    min: 0.1,
                    max: 3.0,
                    default: 1.5,
                    step: 0.1,
                    unit: 'x'
                },
                colorScheme: {
                    type: 'select',
                    label: 'Color Scheme',
                    options: [
                        { value: 'rainbow', label: 'Rainbow Prism' },
                        { value: 'fire', label: 'Fire Crystal' },
                        { value: 'ocean', label: 'Ocean Depths' },
                        { value: 'crystal', label: 'Crystal Cave' },
                        { value: 'sunset', label: 'Sunset Mandala' },
                        { value: 'cosmic', label: 'Cosmic Void' },
                        { value: 'emerald', label: 'Emerald Dreams' },
                        { value: 'aurora', label: 'Aurora Borealis' }
                    ],
                    default: 'rainbow'
                },
                shapeType: {
                    type: 'select',
                    label: 'Shape Type',
                    options: [
                        { value: 'mixed', label: 'Mixed Shapes' },
                        { value: 'circles', label: 'Circles' },
                        { value: 'squares', label: 'Squares' },
                        { value: 'triangles', label: 'Triangles' },
                        { value: 'stars', label: 'Stars' }
                    ],
                    default: 'mixed'
                },
                trailLength: {
                    type: 'range',
                    label: 'Trail Length',
                    min: 0.5,
                    max: 1.0,
                    default: 0.95,
                    step: 0.02,
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
                        { value: 'cosmic', label: 'Cosmic Void' }
                    ],
                    default: 'black'
                },
                reflectionStyle: {
                    type: 'select',
                    label: 'Reflection',
                    options: [
                        { value: 'mirror', label: 'Mirror Effect' },
                        { value: 'normal', label: 'Normal Repeat' }
                    ],
                    default: 'mirror'
                },
                pulseSensitivity: {
                    type: 'range',
                    label: 'Pulse Sensitivity',
                    min: 0.0,
                    max: 3.0,
                    default: 1.0,
                    step: 0.1,
                    unit: 'x'
                },
                mutateMode: {
                    type: 'checkbox',
                    label: 'Mutate Effects',
                    default: false
                }
            }
        };
    }
    
    static getMutationSettings() {
        return {
            colorScheme: {
                probability: 0.8,
                values: ['rainbow', 'fire', 'ocean', 'crystal', 'sunset', 'cosmic', 'emerald', 'aurora']
            },
            segments: {
                probability: 0.4,
                values: [6, 8, 10, 12]
            },
            rotationSpeed: {
                probability: 0.5,
                range: { min: -1.5, max: 1.5 },
                step: 0.1
            },
            objectCount: {
                probability: 0.3,
                range: { min: 8, max: 20 },
                step: 1
            },
            objectSize: {
                probability: 0.4,
                range: { min: 1.0, max: 3.5 },
                step: 0.1
            },
            gravity: {
                probability: 0.3,
                range: { min: 0.1, max: 1.0 },
                step: 0.1
            },
            bounce: {
                probability: 0.2,
                range: { min: 0.4, max: 1.0 },
                step: 0.05
            },
            shapeType: {
                probability: 0.6,
                values: ['mixed', 'circles', 'squares', 'triangles', 'stars']
            },
            trailLength: {
                probability: 0.25,
                range: { min: 0.8, max: 1.0 },
                step: 0.02
            },
            backgroundStyle: {
                probability: 0.3,
                values: ['black', 'dark', 'navy', 'purple', 'cosmic']
            },
            reflectionStyle: {
                probability: 0.15,
                values: ['mirror', 'normal']
            },
            pulseSensitivity: {
                probability: 0.4,
                range: { min: 0.5, max: 2.5 },
                step: 0.1
            }
        };
    }
}

// Auto-register this visualizer
if (window.VisualizerRegistry) {
    window.VisualizerRegistry.register('kaleidoscope', 'Kaleidoscope', KaleidoscopeVisualizer);
} else {
    // Fallback for backward compatibility
    window.KaleidoscopeVisualizer = KaleidoscopeVisualizer;
}