# VizWiz 🎵✨

**Version 1.2** - A modular, browser-based audio visualizer with system capture and enhanced playlist controls

Transform any audio into stunning visual experiences! VizWiz is a powerful, entirely client-side audio visualizer that runs directly in your browser. Load music files, capture system audio from any application, and watch them come alive with reactive visual effects.

## ✨ Features

### 🎵 Audio Sources
- **File Support** - MP3, WAV, FLAC, and other browser-supported formats
- **System Audio Capture** - Visualize Spotify, YouTube, games, or any app audio in real-time
- **Drag & Drop** - Easy file loading with visual feedback

### 🎨 Visualization
- **9 Unique Visualizers** - Bars, particles, blobs, fractals, plasma, and more
- **Real-time Response** - Frequency-based visual effects that react to bass, mids, and treble
- **Particle Storm** - Advanced particle system with physics and connections
- **Dynamic Backgrounds** - Multiple background styles and effects

### 🎵 Audio Control
- **Smart Crossfade** - Seamless track transitions from instant (0s) to long ambient (20s)
- **Playlist Management** - Multi-track support with shuffle and repeat modes
- **System Audio Capture** - Visualize any app's audio in real-time
- **Multiple Formats** - MP3, WAV, FLAC, and other browser-supported audio

### ⚙️ Customization & Control
- **Rich Settings** - Extensive customization for each visualizer
- **Mutation Mode** - Auto-randomizing effects that evolve with your audio
- **Random Mode** - Automatic visualizer switching with smart timing
- **Keyboard Shortcuts** - Full keyboard control for seamless operation

### 🚀 Performance & UX
- **Performance Monitor** - Real-time FPS and render time tracking
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Zero Dependencies** - Pure HTML5, CSS3, and vanilla JavaScript
- **Privacy First** - Everything runs locally, no data leaves your device

## 🚀 Quick Start

1. **Clone or Download**
   ```bash
   git clone https://github.com/RobinNixon/vizwiz.git
   cd vizwiz-main # Or wherever you save the app
   ```

2. **Open in Browser**
   ```bash
   # Simply open index.html in any modern browser
   open index.html
   ```

3. **Start Visualizing**
   - **Load Music**: Click "Load Music" or drag & drop audio files
   - **Capture System Audio**: Click "Capture System Audio" to visualize any app
   - Hit play and enjoy the show!

## 🎮 Usage

### System Audio Capture
1. Click **"🎵 Capture Audio"** or press **'C'**
2. Select screen/application in browser dialog
3. **Important**: Check "Share system audio" or "Share tab audio"
4. Start playing audio from any app (Spotify, YouTube, games, etc.)
5. Watch real-time visualization of your system audio!

### Keyboard Shortcuts
- **Space** - Play/Pause
- **F** - Toggle Fullscreen
- **S** - Toggle Settings
- **R** - Toggle Random Mode
- **M** - Toggle Mutation Mode
- **←/→** - Switch Visualizers
- **C** - Toggle System Audio Capture
- **Ctrl+P** - Performance Monitor

### Supported Audio Sources
- **Music Streaming**: Spotify, Apple Music, YouTube Music
- **Video Platforms**: YouTube, Netflix, Twitch, any video content
- **Gaming**: Any game with audio output
- **Communication**: Discord, Zoom, Teams calls
- **Browser Tabs**: Isolate specific tab audio
- **System Sounds**: Notifications, alerts, any audio

## 🛠️ Development

## 🎨 Make Your Own Visualizers

One of the best things about VizWiz is how easy it is to add new effects.  
You don’t need to be a coder — you can create visualizers by **chatting with an AI**.

1. Copy and paste or drag and drop the `vizwiz.txt` file (included in this project) into a chat with your favorite AI assistant.  
2. Describe in as much detail as you can what kind of visualizer you’d like (spirals, flames, galaxies, anything you can imagine).
3. The AI will give you back a `.viz.js` file (or if you are a coder write your own).
4. Save that file into the `visualizers/` folder.  
5. Add its details into `registry.js` using one of the methods below.  
6. Refresh VizWiz and your new visualizer will be loaded.

## ⚙️ Adding a visualizer to the VizWiz registry

#### Method 1: Using the Helper Tool (Easiest)
1. Open `visualizer-helper.html` in your browser
2. Fill in your visualizer details (name, author, description)
3. Copy the generated code
4. Paste it into `visualizers/registry.js` file

#### Method 2: Manual Registry Edit (if you know what you are doing)
1. Edit `visualizers/registry.js` and add your visualizer to the array:
   ```javascript
   // Add this entry to the VisualizerManifest array
   {
     id: 'yourname',
     name: 'Display Name',
     file: 'yourname.viz.js', 
     author: 'Your Name',
     description: 'What your visualizer does'
   }
   ```
2. Refresh your browser - the visualizer appears automatically!

#### Method 3: Using Node.js Utility (For Developers)
If you have Node.js installed, you can use the automated utility:
```bash
node add-visualizer.js "yourname.viz.js" "Display Name" "Your Name" "Description"
```

#### Step-by-Step Example
Let's say you want to add a "Spiral Galaxy" visualizer:

1. **Create the file**: `visualizers/spiral.viz.js` (follow the pattern from existing visualizers)
2. **Edit registry**: Open `visualizers/registry.js` in any text editor
3. **Add your entry**: Find the array and add:
   ```javascript
   {
     id: 'spiral',
     name: 'Spiral Galaxy',
     file: 'spiral.viz.js',
     author: 'Your Name',
     description: 'Rotating spiral patterns that respond to music'
   }
   ```
4. **Save and refresh**: Your new visualizer will appear in the dropdown!

## Creating a Visualizer in More Detail
Provide a copy of `vizwiz.txt` to an AI, along with a description of the effects and features you want your visualizer to have, including any user settings you would like to be made available. Or, write your own using the same information.

For the best results ask your AI to use different colours from the example provided, and to be creative with your idea. Report any errors back to your AI for correcting - if necessary offer other visualizer examples from this distribution as further guidance.

#### Dynamic Loading Benefits
- **No HTML editing** required
- **Automatic discovery** of new visualizers
- **Metadata support** (author, description)
- **Error handling** for missing files
- **Development utilities** for easy addition

### Project Structure
```
vizwiz/
├── index.html                # Main HTML application
├── vizwiz.js                 # Core JavaScript engine
├── vizwiz.css                # CSS Styling
├── vizwiz.txt                # Visualizer development guide
├── readme.md                 # This readme file
├── vizwiz.png                # Favicon
├── visualizer-helper.html    # Web-based helper for adding visualizers
├── add-visualizer.js         # Node.js utility for adding visualizers
└── visualizers/
    ├── registry.js           # Registry of available visualizers
    ├── auto-loader.js        # Auto load visualizers
    ├── bars.viz.js           # Bars and Bars    (Claude Sonnet 4)
    ├── blobs.viz.js          # Blobby Blobs     (Deepseek R1)
    ├── bouncer.viz.js        # Big Bouncer      (Grok 4)
    ├── fractal.viz.js        # Fractal Dreams   (Gemini 2.5 Pro)
    ├── groove.viz.js         # Groovy Groove    (Qwen3-235B-A22B-2507)
    ├── kaleidoscope.viz.js   # Kaleidoscope     (Claude Sonnet 4)
    ├── oscilloscope.viz.js   # Oscilloscope     (ChatGPT 5 Fast)
    ├── particles.viz.js      # Particle Storm   (Claude Sonnet 4)
    └── plasma.viz.js         # Plasma Flow      (Claude Sonnet 4)
```

### Ideas for New Visualizers
- 🌀 Spiral/radial patterns
- 📊 3D spectrum analyzer
- 🌈 Waveform displays
- 🔥 Flame effects
- ⚡ Lightning patterns
- 🌌 Galaxy simulations
- 🌊 Fluid dynamics
- 🎯 Target/radar displays
- 🕸️ Network/web patterns

## 🆕 What's New in v1.2

### Enhanced Playlist Controls
- **Always-On Crossfade** - Seamless transitions controlled by simple 0-20 second slider
- **Instant Switching** - Set crossfade to 0 for DJ-style instant track changes
- **One-Click Shuffle** - Simple button to randomize playlist order immediately
- **Better UI** - Cleaner playlist panel with improved icons and streamlined controls
- **Smart Logic** - Crossfade timing automatically adjusts based on track length

## 🆕 What's New in v1.1

### System Audio Capture
- **Universal Audio Visualization** - Capture and visualize any audio playing on your system
- **Real-time Processing** - Instant response to system audio with high-quality 48kHz capture
- **Browser Integration** - Uses native `getDisplayMedia` API for seamless audio capture

### New Particle Storm Visualizer
- **Physics Simulation** - Gravity, friction, and realistic particle movement
- **Frequency-based Spawning** - Bass from bottom, mids from sides, treble from top
- **Dynamic Connections** - Lines drawn between nearby particles
- **5 Color Schemes** - Multiple visual themes with smooth transitions

### Enhanced Core System
- **Performance Monitoring** - Real-time FPS and render time tracking
- **Keyboard Shortcuts** - Complete keyboard control system
- **Better Audio Processing** - Improved frequency analysis with 1024 FFT
- **Settings Memory** - Visualizer settings persist between switches
- **Help System** - Built-in keyboard shortcut reference

### Enhanced Playlist & Audio Control
- **Smart Crossfade** - Always-on crossfade with 0-20 second range (0 = instant switching)
- **One-Click Shuffle** - Simple shuffle button for instant playlist randomization
- **Multi-Track Support** - Load multiple files and navigate with previous/next controls
- **Repeat Modes** - Off, single track, or entire playlist repeat options

### Quality of Life Improvements
- **Trail Effects** - Configurable fade intensity for particle trails
- **Debug Mode** - Real-time audio level monitoring
- **Error Handling** - Better user guidance for system audio capture
- **UI Polish** - Improved animations and visual feedback
- **Clean Controls** - Streamlined playlist panel with better icons and layout

## 📜 License

This project is licensed under the MIT License

## 🚀 Quick Links
- 📖 [Visualizer Development Guide](vizwiz.txt)
- 🐛 [Report Issues](https://github.com/RobinNixon/vizwiz/issues)
- 💡 [Feature Requests](https://github.com/RobinNixon/vizwiz/discussions)
