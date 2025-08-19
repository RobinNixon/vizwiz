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
   open index.html
   ```

3. **Load Your Music**
   - Click "Load Music" or drag & drop audio files
   - Hit play and enjoy the show!

## 🛠️ Development

### Adding New Visualizers

VizWiz uses a plugin architecture that makes adding new visualizers incredibly simple:

1. **Read the Guide** - Check `vizwiz.txt` for the complete visualizer development guide
2. **Create Your Plugin** - Follow the template and interface requirements
2. **Save the Plugin** - Save using the file convention: `vizname.viz.js`
4. **Register & Go** - Your visualizer automatically appears in the dropdown after adding to the HTML

Provide `vizwiz.txt` and one of the visualizer files to an AI (eg `plasma.viz.js`), along with a description of the effects and features you want, to have it make one for you. Then save it in the *vizwiz* folder.

**Example registration:**

At the end of the index.html file add the line:

```javascript
<script src='vizname.viz.js'></script>
```
Make sure you or your AI have added the following (replacing the arguments as necessary) at the end of the visualizer file to register it:
```javascript
// At the end of your myawesome.viz.js file
if (window.VisualizerRegistry) {
    window.VisualizerRegistry.register('newviz', 'New Visualizer', newVisualizer);
}
```

### Project Structure
```
vizwiz/
├── index.html            # Main application
├── vizwiz.js             # Core engine
├── vizwiz.css            # Styling
├── vizwiz.txt            # Visualizer development guide
├── bars.viz.js           # Vertical Bars visualizer      (Claude Sonnet 4)
├── plasma.viz.js         # Plasma FLow visualizer        (Claude Sonnet 4)
├── kaleidoscope.viz.js   # Kaleidoscope visualizer       (Claude Sonnet 4)
├── oscilloscope.viz.js   # Oscilloscope visualizer       (ChatGPT 5)
├── blobs.viz.js          # Blobby Blobs visualizer       (Deepseek R1)
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

## 🚀 Quick Links
- 📖 [Visualizer Development Guide](vizwiz.txt)
- 🐛 [Report Issues](https://github.com/RobinNixon/vizwiz/issues)
- 💡 [Feature Requests](https://github.com/RobinNixon/vizwiz/discussions)
