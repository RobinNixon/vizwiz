# VizWiz 🎵✨

**Version 1.0** - A modular, browser-based music visualizer with a plugin architecture

Transform your music into stunning visual experiences! VizWiz is a lightweight, entirely client-side music visualizer that runs directly in your browser. Drop in audio files and watch them come alive with reactive visual effects.

## ✨ Features

- 🎵 **Universal Audio Support** - Works with MP3, WAV, FLAC, and other browser-supported formats
- 🔌 **Plugin Architecture** - Modular visualizer system for easy extensibility
- 🎨 **Multiple Visualizers** - Choose from bars, plasma flow, and more
- ⚙️ **Rich Customization** - Extensive settings panels for each visualizer
- 🎲 **Mutation Mode** - Auto-randomizing effects that evolve with your music
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚀 **Zero Dependencies** - Pure HTML5, CSS3, and vanilla JavaScript
- 🔒 **Privacy First** - Everything runs locally, no data leaves your device

## 🚀 Quick Start

1. **Clone or Download**
   ```bash
   git clone https://github.com/yourusername/vizwiz.git
   cd vizwiz-main
   ```

2. **Open in Browser**
   ```bash
   # Simply open vizwiz.html in any modern browser
   open vizwiz.html
   ```

3. **Load Your Music**
   - Click "Load Music" or drag & drop audio files
   - Hit play and enjoy the show!

## 🛠️ Development

### Adding New Visualizers

VizWiz uses a plugin architecture that makes adding new visualizers incredibly simple:

1. **Read the Guide** - Check `vizwiz.txt` for the complete visualizer development guide
2. **Create Your Plugin** - Follow the template and interface requirements
3. **Register & Go** - Your visualizer automatically appears in the dropdown

**Example registration:**
```javascript
// At the end of your myawesome.viz.js file
if (window.VisualizerRegistry) {
    window.VisualizerRegistry.register('myawesome', 'My Awesome Visualizer', MyAwesomeVisualizer);
}
```

### Project Structure
```
vizwiz/
├── vizwiz.html           # Main application
├── vizwiz.js             # Core engine
├── vizwiz.css            # Styling
├── vizwiz.txt            # Visualizer development guide
├── bars.viz.js           # Bars visualizer plugin
├── plasma.viz.js         # Plasma visualizer plugin
├── kaleidoscope.viz.js   # Kaleidoscope visualizer plugin
├── oscilloscope.viz.js   # Oscilloscope visualizer plugin
└── README.md             # This file
```

### Ideas for New Visualizers
- 🌀 Spiral/radial patterns
- 🎆 Particle systems
- 📊 3D spectrum analyzer
- 🌈 Waveform displays
- 🔥 Flame effects
- ⚡ Lightning patterns
- 🌌 Galaxy simulations

## 📜 License

This project is licensed under the MIT License

---

### 🚀 Quick Links
- [📖 Visualizer Development Guide](vizwiz.txt)
- [🐛 Report Issues](https://github.com/RobinNixon/vizwiz/issues)
- [💡 Feature Requests](https://github.com/RobinNixon/vizwiz/discussions)
