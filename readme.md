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
   cd vizwiz
   ```

2. **Open in Browser**
   ```bash
   # Simply open vizwiz.html in any modern browser
   open vizwiz.html
   ```

3. **Load Your Music**
   - Click "Load Music" or drag & drop audio files
   - Hit play and enjoy the show!

## 🎮 Controls

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `R` | Toggle Repeat Mode |
| `F` | Toggle Fullscreen |
| `S` | Open Settings Panel |

### Mouse Controls
- **Click canvas** - Play/Pause
- **Drag & Drop** - Load audio files
- **Settings button** - Customize visualizer
- **Volume slider** - Adjust audio level

## 🔧 Visualizers Included

### 🎛️ Vertical Bars
Classic frequency analyzer with customizable:
- Bar count (16-128)
- Smoothing levels
- Peak dots
- Color schemes (8 options)
- Audio sensitivity
- Background styles

### 🌊 Plasma Flow
Organic flowing plasma effect with:
- Resolution control
- Speed & turbulence
- Trail effects
- Audio responsiveness
- 8 color schemes
- Symmetry mode

## 🎨 Mutation Mode

Enable "Mutate Colors" for an ever-evolving visual experience:
- ✨ Settings automatically randomize over time
- 🎲 Visual feedback shows what's changing
- 🔄 Creates unique combinations you'd never think to try
- 📊 Perfect for long listening sessions

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
├── vizwiz.html         # Main application
├── vizwiz.js           # Core engine
├── vizwiz.css          # Styling
├── vizwiz.txt          # Visualizer development guide
├── bars.viz.js         # Bars visualizer plugin
├── plasma.viz.js       # Plasma visualizer plugin
└── README.md           # This file
```

### Technical Details
- **Web Audio API** for real-time frequency analysis
- **Canvas 2D** for high-performance rendering
- **Modular Registry System** for plugin management
- **Responsive Design** with `devicePixelRatio` support
- **RAF Animation Loops** for smooth 60fps visuals

## 🌟 Creating Your Own Visualizers

The plugin system is designed to be as simple as possible. Here's what you need:

### Required Methods
```javascript
class MyVisualizer {
    constructor() { /* Initialize properties */ }
    init(elements) { /* Setup UI */ }
    startVisualization(analyser, dataArray, ctx, canvas) { /* Begin */ }
    stopVisualization() { /* Cleanup */ }
    static getSettingsSchema() { /* Define UI controls */ }
    setSetting(key, value) { /* Handle setting changes */ }
}
```

### Automatic Features
Once you implement the interface, you get for free:
- ⚙️ Auto-generated settings panel
- 🎲 Mutation system support
- 📱 Responsive canvas handling
- 🎵 Audio data integration
- 🔄 Play/pause state management

**👉 See `vizwiz.txt` for the complete development guide with examples!**

## 🎬 Use Cases

- **Music Production** - Visualize your tracks while mixing
- **Live Performances** - Project visuals during DJ sets or concerts
- **Relaxation** - Ambient visuals for meditation or background ambiance
- **Education** - Demonstrate audio frequencies and waveforms
- **Development** - Learning Web Audio API and canvas animation
- **Art** - Create unique visual art driven by your favorite music

## 🌐 Browser Support

- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

**Requirements:** Modern browser with Web Audio API and Canvas 2D support

## 🤝 Contributing

We'd love your contributions! Here are some ways to get involved:

### Ideas for New Visualizers
- 🌀 Spiral/radial patterns
- 🎆 Particle systems
- 📊 3D spectrum analyzer
- 🌈 Waveform displays
- 🔥 Flame effects
- ⚡ Lightning patterns
- 🌌 Galaxy simulations

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b amazing-visualizer`)
3. Create your visualizer following the guide in `vizwiz.txt`
4. Test across different browsers and audio types
5. Submit a pull request

### Code Style
- Use clear, descriptive variable names
- Comment complex algorithms
- Follow the existing patterns in `bars.viz.js` and `plasma.viz.js`
- Include mutation settings for dynamic effects
- Test performance on lower-end devices

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Web Audio API for making real-time audio analysis possible
- HTML5 Canvas for high-performance 2D graphics
- The open-source community for inspiration and feedback

## 📧 Contact

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Ideas and showcase your visualizers
- **YouTube** - Watch the tutorial series on building VizWiz

---

**Made with ❤️ for music lovers and developers**

*VizWiz - Where Music Meets Visual Magic* ✨🎵

---

### 🚀 Quick Links
- [📖 Visualizer Development Guide](vizwiz.txt)
- [🐛 Report Issues](https://github.com/RobinNixon/vizwiz/issues)
- [💡 Feature Requests](https://github.com/RobinNixon/vizwiz/discussions)
- [📺 YouTube Tutorial Series](#) *(Coming Soon)*