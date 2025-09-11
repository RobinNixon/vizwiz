# VizWiz 🎵✨

**Version 1.3** - A modular, browser-based audio visualizer with professional playlist controls

Transform any audio into stunning visual experiences! VizWiz is a powerful, entirely client-side audio visualizer that runs directly in your browser. Load music files, capture system audio from any application, and watch them come alive with reactive visual effects.

## ✨ Features

### 🎵 Audio Sources
- **File Support** - MP3, WAV, FLAC, and other browser-supported formats
- **System Audio Capture** - Visualize Spotify, YouTube, games, or any app audio in real-time
- **Drag & Drop** - Easy file loading with visual feedback
- **Large Libraries** - Handle collections of up to 2,500 tracks smoothly

### 🎨 Visualization
- **Several Unique Visualizers** - Bars, particles, blobs, fractals, plasma, and more
- **Real-time Response** - Frequency-based visual effects that react to bass, mids, and treble
- **Dynamic Backgrounds** - Multiple background styles and effects
- **Visualizer Toggle** - Turn off visuals to save CPU resources when needed

### 🎵 Audio Control
- **Single/Continuous Modes** - Choose between stopping after one track or continuous playback
- **Smart Crossfade** - Seamless track transitions from instant (0s) to long ambient (20s)
- **Playlist Management** - Multi-track support with shuffle and repeat modes
- **Live Search** - Instantly find tracks in large collections with real-time filtering
- **Auto-Scroll** - Current track automatically scrolls into view in large playlists

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
1. Click **"🎵 Audio Grab"** or press **'A'**
2. Select screen/application in browser dialog
3. **Important**: Check "Share system audio" or "Share tab audio"
4. Start playing audio from any app (Spotify, YouTube, games, etc.)
5. Watch real-time visualization of your system audio!

### Playlist Features
- **Search**: Type in the search box to instantly filter tracks by name
- **Single Mode**: Click the play mode button (🔄) to switch to single-track mode (⏹️)
- **Shuffle**: Reorganize your playlist while keeping the current track at the top
- **Crossfade**: Adjust seamless transitions between tracks (0-20 seconds)
- **Auto-Scroll**: Current track automatically stays visible in large playlists

### Professional Use
Perfect for radio DJs and live events:
- Search through large music collections instantly
- Single-track mode prevents accidental playback of next song
- Visual confirmation of which track is loaded and playing
- Works in any browser without installing software

### Keyboard Shortcuts
- **Space** - Play/Pause
- **A** - Toggle System Audio Capture
- **F** - Toggle Fullscreen
- **M** - Toggle Mutation Mode
- **R** - Toggle Random Mode
- **S** - Toggle Settings
- **←/→** - Switch Visualizers
- **Ctrl+P** - Performance Monitor
- **Escape** - Close open panels

### Supported Audio Sources
- **Music Streaming**: Spotify, Apple Music, YouTube Music, Online radio etc.
- **Video Platforms**: YouTube, Netflix, Twitch, any video content
- **Gaming**: Any game with audio output
- **Communication**: Discord, Zoom, Teams calls
- **Browser Tabs**: Isolate specific tab audio
- **System Sounds**: Notifications, alerts, any audio

## 🎨 Make Your Own Visualizers

One of the best things about VizWiz is how easy it is to add new effects.  
You don't need to be a coder — you can create visualizers by **chatting with an AI**.

1. Copy and paste or drag and drop the `vizwiz.md` file (included in this project) into a chat with your favorite AI assistant.  
2. Describe in as much detail as you can what kind of visualizer you'd like (spirals, flames, galaxies, anything you can imagine).
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

### Project Structure
```
vizwiz/
├── index.html                # Main HTML application
├── vizwiz.js                 # Core JavaScript engine
├── vizwiz.css                # CSS Styling
├── vizwiz.md                 # Visualizer development guide
├── readme.md                 # This readme file
├── vizwiz.png                # Favicon
├── visualizer-helper.html    # Web-based helper for adding visualizers
├── add-visualizer.js         # Node.js utility for adding visualizers
└── visualizers/
    ├── registry.js           # Registry of available visualizers
    ├── auto-loader.js        # Auto load visualizers
    ├── bars.viz.js           # Bars and Bars    (Claude Sonnet 4)
    ├── blobs.viz.js          # Blobby Blobs     (Deepseek R1)
    ├── bloom.viz.js          # Vector Bloom     (Copilot)
    ├── bouncer.viz.js        # Big Bouncer      (Grok 4)
    ├── fractal.viz.js        # Fractal Dreams   (Gemini 2.5 Pro)
    ├── groove.viz.js         # Groovy Groove    (Qwen3-235B-A22B-2507)
    ├── hyper.viz.js          # Hyper Bloom      (Copilot)
    ├── kaleidoscope.viz.js   # Kaleidoscope     (Claude Sonnet 4)
    ├── oscilloscope.viz.js   # Oscilloscope     (ChatGPT 5 Fast)
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

## 🆕 What's New in v1.3

### Professional Playlist Management
- **Live Search** - Instantly filter through thousands of tracks as you type
- **Smart Shuffle** - Randomize playlist while keeping current track at the top
- **Auto-Scroll** - Current track automatically scrolls into view in large playlists
- **Play Mode Toggle** - Switch between single-track and continuous playback modes
- **Visualizer Control** - Turn visualizations on/off to manage CPU usage

### Enhanced User Experience
- **Improved Keyboard Shortcuts** - Modifier keys properly ignored to prevent conflicts
- **Better UI Feedback** - Cleaner scrollbars and visual polish throughout
- **Resource Management** - Optional visualizer disable for performance-critical use
- **Radio DJ Friendly** - Perfect for live broadcasting and music curation

### Quality of Life Improvements
- **Long Name Support** - Hover over truncated track names to see full titles
- **Centered Controls** - Cleaner layout for playlist management controls
- **Z-index Fixes** - Panels now properly layer and close buttons always work
- **Search Highlighting** - Matched text highlighted in search results

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

### Enhanced Core System
- **Performance Monitoring** - Real-time FPS and render time tracking
- **Keyboard Shortcuts** - Complete keyboard control system
- **Better Audio Processing** - Improved frequency analysis with 1024 FFT
- **Settings Memory** - Visualizer settings persist between switches
- **Help System** - Built-in keyboard shortcut reference

## 🎯 Use Cases

### For Everyone
- **Personal Music Collections** - Visualize your own music library with style
- **Streaming Visualization** - Add visual flair to Spotify, YouTube, or any audio
- **Parties & Events** - Create atmosphere with reactive visual displays
- **Relaxation** - Soothing visuals that respond to ambient music

### For Professionals
- **Radio Broadcasting** - Search large music libraries and control playback precisely
- **Live Events** - Visual backdrop that responds to live audio
- **Presentations** - Add visual interest to audio content
- **Content Creation** - Screen record visualizations for videos or streams

### For Developers
- **Learning Resource** - Study audio visualization and canvas techniques
- **Customization** - Create your own visualizers with AI assistance
- **Open Source** - Fork and extend with your own features

## 📜 License

This project is licensed under the MIT License

## 🚀 Quick Links
- 📖 [Visualizer Development Guide](vizwiz.md)
- 🛠 [Report Issues](https://github.com/RobinNixon/vizwiz/issues)
- 💡 [Feature Requests](https://github.com/RobinNixon/vizwiz/discussions)
