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

Provide a copy of `vizwiz.txt` to an AI, along with a description of the effects and features you want your visualiser to have, including any user settings you would like to be made available. Or, write your own using the same information. Once complete save the new file in the *vizwiz* folder and add a link at the bottom of the `index.html` file (where commented) like this:

```
<script src='newviz.viz.js'></script>
```

For the best results ask your AI to use different colours from the example provided, and to be creative with your idea. Report any errors back to your AI for correcting - if necessary offer other visualizer examples from this distribution as further guidance.

### Project Structure
```
vizwiz/
├── index.html            # Main HTML application
├── vizwiz.js             # Core JavaScript engine
├── vizwiz.css            # CSS Styling
├── vizwiz.txt            # Visualizer development guide
├── bars.viz.js           # Vertical Bars visualizer      (Claude Sonnet 4)
├── plasma.viz.js         # Plasma FLow visualizer        (Claude Sonnet 4)
├── kaleidoscope.viz.js   # Kaleidoscope visualizer       (Claude Sonnet 4)
├── oscilloscope.viz.js   # Oscilloscope visualizer       (ChatGPT 5 Fast)
├── blobs.viz.js          # Blobby Blobs visualizer       (Deepseek R1)
├── fractal.viz.js        # Fractal Dreams visualizer     (Gemini 2.5 Pro)
├── groove.viz.js         # Groovy Groove visualizer      (Qwen3-235B-A22B-2507)
└── README.md             # This readme file
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
