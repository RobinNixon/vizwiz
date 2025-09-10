# Adding New Visualizers to VizWiz

This guide shows you how to add new visualizers to VizWiz, with examples for users who don't have Node.js installed.

## 🚀 Quick Start (No Node.js Required)

### Step 1: Use the Helper Tool
1. Open `visualizer-helper.html` in your browser
2. Fill in the form:
   - **Filename**: `rainbow-spiral.viz.js`
   - **Display Name**: `Rainbow Spiral`
   - **Author**: `Your Name`
   - **Description**: `Colorful spiral patterns that dance to the music`
3. Click "Generate Registry Entry"
4. Copy the generated code

### Step 2: Update the Registry
1. Open `visualizers/registry.js` in any text editor
2. Find the `window.VisualizerManifest = [` array
3. Scroll to the end of the array (before the closing `]`)
4. Add a comma after the last entry if needed
5. Paste your generated code
6. Save the file

**Example of what to add:**
```javascript
  {
    id: 'rainbow-spiral',
    name: 'Rainbow Spiral',
    file: 'rainbow-spiral.viz.js',
    author: 'Your Name',
    description: 'Colorful spiral patterns that dance to the music'
  }
```

### Step 3: Create Your Visualizer
1. Create `visualizers/rainbow-spiral.viz.js`
2. Use the template from `vizwiz.txt` or copy from an existing visualizer
3. Customize the colors, patterns, and effects
4. Save the file

### Step 4: Test It
1. Refresh your browser
2. Your new "Rainbow Spiral" visualizer will appear in the dropdown
3. Load some music and test it out!

## 🎨 Visualizer Ideas

### Easy to Create
- **Color Bars**: Different colored frequency bars
- **Pulsing Circles**: Circles that grow/shrink with the beat
- **Waveform**: Classic oscilloscope-style display
- **Spectrum Dots**: Dots arranged in frequency order

### Intermediate
- **Spiral Patterns**: Rotating spirals with color changes
- **Particle Fountains**: Particles shooting up from the bottom
- **Geometric Shapes**: Triangles, hexagons responding to music
- **Tunnel Effect**: 3D tunnel with moving patterns

### Advanced
- **Fractal Trees**: Growing/shrinking fractal patterns
- **Fluid Simulation**: Liquid-like effects
- **Galaxy Simulation**: Rotating star fields
- **Lightning Effects**: Electric-style visualizations

## 🛠️ Development Tips

### Getting Started
1. **Copy an existing visualizer** as your starting point
2. **Change the colors first** - easiest way to make it unique
3. **Modify one thing at a time** - easier to debug
4. **Test frequently** - load music and see how it looks

### Common Patterns
```javascript
// Basic visualizer structure
class YourVisualizer {
  constructor() {
    // Set default values
    this.color = '#ff0000';
    this.size = 50;
  }
  
  // Required methods
  init(elements) { /* Setup UI */ }
  startVisualization(analyser, dataArray, ctx, canvas) { /* Start */ }
  stopVisualization() { /* Stop */ }
  animate() { /* Main loop */ }
  
  // Settings
  static getSettingsSchema() { /* Define UI controls */ }
  setSetting(key, value) { /* Handle changes */ }
}

// Register it
window.VisualizerRegistry.register('your-id', 'Your Name', YourVisualizer);
```

### Audio Data
```javascript
// Get frequency data
this.analyser.getByteFrequencyData(this.dataArray);

// Calculate frequency bands
const bass = this.dataArray.slice(0, 85).reduce((sum, val) => sum + val, 0) / 85;
const mid = this.dataArray.slice(85, 170).reduce((sum, val) => sum + val, 0) / 85;
const treble = this.dataArray.slice(170, 255).reduce((sum, val) => sum + val, 0) / 85;
```

### Drawing
```javascript
// Clear canvas
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, width, height);

// Draw shapes
ctx.fillStyle = '#ff0000';
ctx.fillRect(x, y, width, height);

ctx.strokeStyle = '#00ff00';
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.stroke();
```

## 🎯 Examples

### Simple Color Bars
```javascript
// In your render method
for (let i = 0; i < this.bars; i++) {
  const height = this.dataArray[i] / 255 * canvas.height;
  const hue = (i / this.bars) * 360; // Rainbow colors
  
  ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
  ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
}
```

### Pulsing Circle
```javascript
// In your render method
const intensity = this.dataArray.reduce((sum, val) => sum + val, 0) / this.dataArray.length;
const radius = 50 + (intensity / 255) * 100;

ctx.fillStyle = `rgba(255, 0, 0, ${intensity / 255})`;
ctx.beginPath();
ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
ctx.fill();
```

## 🚀 Sharing Your Visualizer

Once you've created a cool visualizer:
1. **Test it thoroughly** with different types of music
2. **Add good settings** so users can customize it
3. **Share the `.viz.js` file** with others
4. **Consider contributing** to the main VizWiz repository

## 🆘 Getting Help

- **Check existing visualizers** for examples
- **Use the browser console** to debug errors
- **Start simple** and add complexity gradually
- **Ask for help** in the VizWiz community

Happy visualizing! 🎵✨