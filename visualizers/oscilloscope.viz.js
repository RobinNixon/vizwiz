class OscilloscopeVisualizer {
  constructor() {
  // Core state
  this.analyser = null;
  this.dataArray = null;
  this.ctx = null;
  this.canvas = null;
  this.animationId = null;
  this.elements = null;

  // Settings defaults
  this.lineWidth = 2;
  this.trailAlpha = 0.75; // how much of the old frame is preserved
  this.colorMode = "rainbow";
  this.stereoMode = "mono";
  this.amplitude = 1.0;
  this.backgroundStyle = "black";

  // Mutation
  this.mutationEnabled = false;
  this.mutationTimer = 0;
  this.mutationInterval = 300; // frames

  // Color presets
  this.colorSchemes = {
    single: "#00ffcc",
    rainbow: "rainbow",
    neon: "#ff00ff"
  };

  this.backgroundStyles = {
    black: "#000000",
    white: "#ffffff",
    dark: "#0c0c0c",
    gradient: "gradient"
  };
  }

  init(elements) {
  this.elements = elements;
  this.buildVisualizerSettings();

  const resetBtn = document.getElementById("resetSettings");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
    this.resetVisualizerSettings();
    });
  }
  }

  startVisualization(analyser, dataArray, ctx, canvas) {
  this.analyser = analyser;
  this.dataArray = new Uint8Array(analyser.fftSize);
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
    this.elements.trackInfo.classList.remove("playing");
  }
  }

  animate() {
  this.animationId = requestAnimationFrame(() => this.animate());

  if (this.analyser && this.dataArray) {
    this.analyser.getByteTimeDomainData(this.dataArray);

    if (this.mutationEnabled) {
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
  const container = document.getElementById("visualizerSettings");
  if (!container) return;

  container.innerHTML = "";

  const schema = this.constructor.getSettingsSchema();
  if (!schema) return;

  const group = document.createElement("div");
  group.className = "setting-group";

  const title = document.createElement("h4");
  title.textContent = schema.name;
  group.appendChild(title);

  Object.entries(schema.settings).forEach(([key, setting]) => {
    const item = this.createSettingItem(key, setting);
    group.appendChild(item);
  });

  container.appendChild(group);
  }

  createSettingItem(key, setting) {
  const item = document.createElement("div");
  item.className = "setting-item";

  const label = document.createElement("label");
  label.textContent = setting.label;
  label.setAttribute("for", key);
  item.appendChild(label);

  let input, valueDisplay;

  switch (setting.type) {
    case "range":
    input = document.createElement("input");
    input.type = "range";
    input.id = key;
    input.min = setting.min;
    input.max = setting.max;
    input.value = setting.default;
    input.step = setting.step || 1;

    valueDisplay = document.createElement("span");
    valueDisplay.id = key + "Value";
    valueDisplay.textContent = setting.default + (setting.unit || "");

    input.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      valueDisplay.textContent = value + (setting.unit || "");
      this.setSetting(key, value);
    });

    item.appendChild(input);
    item.appendChild(valueDisplay);
    break;

    case "checkbox":
    input = document.createElement("input");
    input.type = "checkbox";
    input.id = key;
    input.checked = setting.default;

    if (key === "mutateMode") {
      const statusSpan = document.createElement("span");
      statusSpan.className = "mutation-status";
      statusSpan.style.cssText = "font-size: 11px; margin-left: 5px;";
      item.appendChild(statusSpan);
    }

    input.addEventListener("change", (e) => {
      if (key === "mutateMode") {
      this.mutationEnabled = e.target.checked;
      this.mutationTimer = 0;

      const statusSpan = item.querySelector(".mutation-status");
      if (statusSpan) {
        statusSpan.textContent = this.mutationEnabled ? " 🎲 ACTIVE" : "";
        statusSpan.style.color = this.mutationEnabled ? "#6366f1" : "";
        statusSpan.style.fontWeight = this.mutationEnabled ? "bold" : "";
      }
      } else {
      this.setSetting(key, e.target.checked);
      }
    });

    item.appendChild(input);
    break;

    case "select":
    input = document.createElement("select");
    input.id = key;

    setting.options.forEach((opt) => {
      const optionElement = document.createElement("option");
      optionElement.value = opt.value;
      optionElement.textContent = opt.label;
      if (opt.value === setting.default) {
      optionElement.selected = true;
      }
      input.appendChild(optionElement);
    });

    input.addEventListener("change", (e) => {
      this.setSetting(key, e.target.value);
    });

    item.appendChild(input);
    break;
  }

  return item;
  }

  render(ctx, dataArray, width, height) {
  // Draw background (with trails effect)
  if (this.backgroundStyle === "gradient") {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(1, "#330033");
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = this.backgroundStyles[this.backgroundStyle] || "#000";
  }

  ctx.globalAlpha = 1 - this.trailAlpha;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  ctx.lineWidth = this.lineWidth;
  ctx.strokeStyle = this.getStrokeStyle(ctx, width);

  if (this.stereoMode === "lissajous") {
    this.drawLissajous(ctx, dataArray, width, height);
  } else {
    this.drawWaveform(ctx, dataArray, width, height);
  }
  }

  drawWaveform(ctx, dataArray, width, height) {
  const bufferLength = dataArray.length;
  const sliceWidth = width / bufferLength;
  let x = 0;

  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    let v = (dataArray[i] - 128) / 128.0;
    v *= this.amplitude;
    let y = height / 2 + v * height / 2;

    if (i === 0) {
    ctx.moveTo(x, y);
    } else {
    ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();
  }

  drawLissajous(ctx, dataArray, width, height) {
  const bufferLength = dataArray.length;
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const x = (dataArray[i] / 255.0) * width;
    const y = (dataArray[(i + bufferLength / 2) % bufferLength] / 255.0) * height;
    if (i === 0) {
    ctx.moveTo(x, y);
    } else {
    ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  }

  getStrokeStyle(ctx, width) {
  if (this.colorMode === "rainbow") {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.2, "orange");
    gradient.addColorStop(0.4, "yellow");
    gradient.addColorStop(0.6, "green");
    gradient.addColorStop(0.8, "blue");
    gradient.addColorStop(1, "violet");
    return gradient;
  }
  return this.colorSchemes[this.colorMode] || "#fff";
  }

  setSetting(key, value) {
  switch (key) {
    case "lineWidth":
    this.lineWidth = parseInt(value);
    break;
    case "trailLength":
    this.trailAlpha = Math.min(0.95, Math.max(0, value / 100));
    break;
    case "colorMode":
    this.colorMode = value;
    break;
    case "stereoMode":
    this.stereoMode = value;
    break;
    case "amplitude":
    this.amplitude = value / 100;
    break;
    case "backgroundColor":
    this.backgroundStyle = value;
    break;
  }
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

  // add 🎲 indicator
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
    if (indicator) indicator.style.opacity = '0';
  }, 1000);

  setTimeout(() => {
    settingItem.classList.remove('mutated');
    if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
    }
  }, 1300);
  }

  mutateSettings() {
  window.VisualizerRegistry.applyMutations(this);
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

  resetVisualizerSettings() {
  window.VisualizerRegistry.resetToDefaults(this);
  }

  static getSettingsSchema() {
  return {
    name: "Oscilloscope Visualizer",
    settings: {
    lineWidth: {
      type: "range",
      label: "Line Width",
      min: 1,
      max: 10,
      default: 2,
      step: 1
    },
    trailLength: {
      type: "range",
      label: "Trail Length",
      min: 0,
      max: 95,
      default: 75,
      step: 5,
      unit: "%"
    },
    amplitude: {
      type: "range",
      label: "Responsivity",
      min: 50,
      max: 200,
      default: 100,
      step: 10,
      unit: "%"
    },
    colorMode: {
      type: "select",
      label: "Color Mode",
      options: [
      { value: "single", label: "Single Colour" },
      { value: "rainbow", label: "Rainbow" },
      { value: "neon", label: "Neon" }
      ],
      default: "rainbow"
    },
    stereoMode: {
      type: "select",
      label: "Stereo Mode",
      options: [
      { value: "mono", label: "Mono" },
      { value: "dual", label: "Dual" },
      { value: "lissajous", label: "Lissajous" }
      ],
      default: "mono"
    },
    backgroundColor: {
      type: "select",
      label: "Background",
      options: [
      { value: "black", label: "Black" },
      { value: "white", label: "White" },
      { value: "dark", label: "Dark Grey" },
      { value: "gradient", label: "Gradient" }
      ],
      default: "black"
    },
    mutateMode: {
      type: "checkbox",
      label: "Mutate Settings",
      default: false
    }
    }
  };
  }

  static getMutationSettings() {
  return {
    colorMode: {
    probability: 0.6,
    values: ["single", "rainbow", "neon"]
    },
    lineWidth: {
    probability: 0.3,
    values: [1, 2, 3, 4, 5, 6]
    },
    amplitude: {
    probability: 0.3,
    range: { min: 0.5, max: 2.0 }
    },
    backgroundColor: {
    probability: 0.4,
    values: ["black", "white", "dark", "gradient"]
    }
  };
  }
}

if (window.VisualizerRegistry) {
  window.VisualizerRegistry.register("oscilloscope", "Oscilloscope", OscilloscopeVisualizer);
}
