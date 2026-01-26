# 🌍 Universal Web Accessibility Helper

A privacy-first Chrome extension that provides one-click accessibility improvements for any website. Built with React, TypeScript, and Manifest V3.

**Built for:** Users with low vision, dyslexia, cognitive differences, and reading challenges

**Version:** 0.2.0  
**Author:** Pranjal Pathak  
**Role:** Software Engineer

## 🌱 Why this project exists

Over 1 billion people globally experience some form of visual, cognitive, or neurological disability. Despite this, most websites are not built with accessibility in mind.

This extension empowers users — not websites — to control how content is presented, making the web more readable, calm, and inclusive by default.

## 🆕 What's New in v0.2.0

### Major Features
- **📖 Reading Mode**: Focus on content by hiding navigation and sidebars, with optimal reading width
- **📏 Reading Ruler**: Visual line that follows your cursor to help track reading position (elegant purple design)
- **🌙 Dark Mode**: Invert colors for better visibility in low-light conditions
- **🎨 Color Blind Support**: Filters for Protanopia, Deuteranopia, and Tritanopia
- **⌨️ Keyboard Shortcuts**: Quick access with `Ctrl/Cmd + K` to toggle, `Ctrl/Cmd + R` for reading mode
- **🔤 Font Size Quick Adjust**: Real-time font size adjustment (0.5x - 3.0x) with visual controls
- **🌍 Multi-Language Translation**: Translate entire pages using free Google Translate API (30+ languages, no API key required, works without page refresh)

### UI/UX Improvements
- Modern, polished design with smooth animations
- Quick action buttons for common features
- Enhanced visual hierarchy and better contrast
- Keyboard shortcuts help panel
- Improved focus indicators for keyboard navigation

### Performance & Reliability
- Better error handling and graceful degradation
- Performance optimizations using `requestIdleCallback`
- Throttled mutation observer for better performance
- Enhanced text simplification with 60+ word pairs
- Improved ARIA enhancement algorithms

### Technical Enhancements
- Better TypeScript types and error handling
- Improved state management and synchronization
- Persistent storage for all settings
- Better browser compatibility

## ✨ Features

### Core Features
- **Accessibility Profiles**: Pre-configured profiles for Low Vision, Dyslexia, Cognitive Load, and Custom settings
- **Style Injection**: Dynamic font adjustments, contrast enhancement, and spacing improvements
- **Text Simplification**: Rule-based text simplification (sentence shortening, word replacement, passive-voice reduction)
- **ARIA Enhancement**: Automatic screen-reader hints and landmark improvements
- **Cognitive Load Reduction**: Disables auto-play, reduces clutter, highlights key content
- **Privacy-First**: All processing happens locally, no data sent to servers

### New in v0.2.0
- **Reading Mode**: Distraction-free reading experience
- **Reading Ruler**: Visual reading line tracker (elegant purple design)
- **Dark Mode**: Low-light viewing support
- **Color Blind Filters**: Support for different types of color blindness
- **Keyboard Shortcuts**: Quick access to common actions
- **Font Size Quick Adjust**: Real-time font size control
- **Enhanced Focus Indicators**: Better keyboard navigation visibility
- **Multi-Language Translation**: Translate entire pages using free Google Translate API (30+ languages, no API key required, instant translation without page refresh)

## 🏗️ Architecture

```
┌──────────────────────────┐
│ Popup UI (React)         │
│ - Toggle accessibility   │
│ - Profile selection      │
│ - Settings               │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Background Service Worker│
│ - Manages state          │
│ - Stores preferences     │
│ - Message routing        │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Content Script           │
│ - Injects styles         │
│ - Modifies DOM           │
│ - Simplifies text        │
│ - Adds ARIA hints        │
└──────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Chrome browser

### Installation

1. **Clone and install dependencies:**

```bash
cd universal-accessibility-helper
npm install
```

2. **Build the extension:**

```bash
npm run build:all
```

This will:
- Build the React popup UI
- Compile TypeScript content scripts
- Compile background service worker
- Compile utility modules

3. **Load in Chrome:**

- Open Chrome and navigate to `chrome://extensions`
- Enable **Developer mode** (toggle in top right)
- Click **Load unpacked**
- Select the `dist/` folder from this project

4. **Test the extension:**

- Visit any website
- Click the extension icon
- Toggle "Enable Accessibility Mode"
- Select a profile (Low Vision, Dyslexia, Cognitive, Custom)
- Try the new Quick Actions: Reading Mode, Reading Ruler, Dark Mode, Font Size Adjust
- Test Translation: Enable "Translate Page" and select a language (e.g., Spanish, Hindi)
- Use keyboard shortcuts: `Ctrl/Cmd + K` to toggle, `Ctrl/Cmd + R` for reading mode

## 📁 Project Structure

```
universal-accessibility-helper/
├── manifest.json              # Extension manifest
├── popup/                     # React popup UI
│   ├── src/
│   │   ├── App.tsx           # Main popup component
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   └── package.json
├── content/                   # Content scripts
│   └── injector.ts           # Main injection logic
├── background/                # Service worker
│   └── serviceWorker.ts      # State management
├── utils/                     # Shared utilities
│   ├── profiles.ts           # Accessibility profiles
│   ├── textSimplifier.ts     # Text simplification
│   ├── ariaEnhancer.ts       # ARIA improvements
│   ├── cognitiveReducer.ts   # Cognitive load reduction
│   └── translator.ts         # Multi-language translation
└── dist/                      # Build output (generated)
```

## 🎯 Accessibility Profiles

### Low Vision
- Larger fonts (1.3x)
- Very high contrast
- Increased line height (1.8)
- Background images removed
- Animations disabled

### Dyslexia
- Dyslexia-friendly font
- Increased letter/word spacing
- Text simplification enabled
- High contrast
- Animations disabled

### Cognitive Load
- Simplified text
- Reduced distractions
- High contrast
- Background images removed
- Key sentences highlighted

### Custom
- User-configurable settings
- All features toggleable

## 🌍 Language Translation

The extension supports translating web pages to **30+ languages** using **free Google Translate API** - no API key required, no registration needed!

### ✨ Key Features

- ✅ **Free & Unlimited** - No API key needed, uses Google Translate's public endpoint
- ✅ **30+ Languages** - Support for major world languages
- ✅ **Auto-detect** - Automatically detects source language
- ✅ **Instant Translation** - Works without page refresh, translates immediately
- ✅ **Smart Element Detection** - Finds and translates all text elements on the page
- ✅ **Batch Processing** - Efficiently translates multiple elements
- ✅ **Privacy-first** - All translation requests go directly to Google Translate
- ✅ **Fully Reversible** - Restore original text anytime with one click
- ✅ **No usage limits** - Translate as much as you want

### 🚀 How to Use

1. **Enable Translation**:
   - Open the extension popup
   - Enable "Accessibility Mode" (if not already enabled)
   - Toggle "Translate Page" ON in Quick Actions section
   - Select your target language from the dropdown

2. **That's it!** The page will be translated automatically without any refresh needed.

3. **Change Language**:
   - Simply select a different language from the dropdown
   - The page will automatically retranslate

4. **Disable Translation**:
   - Toggle "Translate Page" OFF
   - Original text is restored immediately

### 🌐 Supported Languages

**Major Languages:**
English, Spanish (Español), French (Français), German (Deutsch), Italian (Italiano), Portuguese (Português), Russian (Русский), Japanese (日本語), Korean (한국어), Chinese (中文), Arabic (العربية), Hindi (हिन्दी)

**Additional Languages:**
Dutch (Nederlands), Polish (Polski), Turkish (Türkçe), Swedish (Svenska), Danish (Dansk), Finnish (Suomi), Norwegian (Norsk), Ukrainian (Українська), Czech (Čeština), Romanian (Română), Hungarian (Magyar), Greek (Ελληνικά), Hebrew (עברית), Thai (ไทย), Vietnamese (Tiếng Việt), and more.

### 🔒 Privacy & Technical Details

- ✅ **No API key required** - Uses Google Translate's free public endpoint (`translate.googleapis.com`)
- ✅ **Direct API calls** - Same endpoint used by translate.google.com
- ✅ **No registration** - No Google account or API setup needed
- ✅ **No data stored** - Original text is preserved locally in browser
- ✅ **Fully reversible** - Restore original text anytime
- ✅ **No tracking** - Your translations are private
- ✅ **Works offline** - Translation requests are made directly from your browser
- ✅ **Rate limiting** - Built-in delays to respect API limits

### 💡 How It Works

The extension uses Google Translate's public API endpoint (the same one used by translate.google.com) to translate text. Each text element is translated individually to ensure accuracy, with small delays between requests to avoid rate limiting. The translation happens in real-time without requiring a page refresh.

## 🛠️ Development

### Production Builds

✅ **All console.log statements are automatically removed** from production builds:
- Content scripts: All `console.*` calls removed via esbuild `drop: ['console']`
- Background worker: All `console.*` calls removed via esbuild `drop: ['console']`
- Popup UI: All `console.*` calls removed via build minification

This ensures a clean production build with no debug logs visible to end users.

### Build Commands

```bash
# Build everything
npm run build:all

# Build popup only
npm run build:popup

# Build content script only
npm run build:content

# Build background worker only
npm run build:background

# Build utilities
npm run build:utils
```

### Development Mode

For popup development with hot reload:

```bash
npm run dev
```

Note: Content scripts require a full rebuild and extension reload.

## 🎨 Accessible by Design

The extension UI itself:
- Meets WCAG AA contrast guidelines
- Is keyboard navigable
- Uses semantic HTML
- Is screen-reader friendly

Accessibility starts with the tool itself.

## ⚠️ Limitations (By Design)

- This extension does not replace screen readers.
- It does not modify or persist changes to websites.
- Accessibility improvements are best-effort and vary by site structure.
- Some highly dynamic web apps may require manual toggling.

These constraints are intentional to preserve safety, privacy, and reversibility.

## 🔒 Privacy

This extension:
- ✅ Processes most features locally in your browser
- ✅ Translation requests go directly to Google Translate (same as using translate.google.com)
- ✅ Uses Chrome's local storage only for settings
- ✅ No tracking or analytics
- ✅ No data collection or user profiling
- ✅ Open source and auditable
- ✅ Original text is preserved locally and never sent anywhere

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔒 Privacy Policy

This extension is privacy-first and processes everything locally. See [PRIVACY.md](PRIVACY.md) for complete privacy policy.

## 📋 Changelog

### Version 0.2.0 (Current)
- ✅ **Added Reading Mode** - Distraction-free reading experience
- ✅ **Added Reading Ruler** - Visual line tracker (elegant purple design)
- ✅ **Added Dark Mode** - Low-light viewing support
- ✅ **Added Color Blind Filters** - Support for Protanopia, Deuteranopia, and Tritanopia
- ✅ **Added Keyboard Shortcuts** - Quick access (Ctrl/Cmd + K to toggle, Ctrl/Cmd + R for reading mode)
- ✅ **Added Font Size Quick Adjust** - Real-time font size control (0.5x - 3.0x)
- ✅ **Added Multi-Language Translation** - Translate entire pages to 30+ languages using free Google Translate API (no API key required, works without page refresh)
- ✅ **Enhanced UI/UX** - Modern, polished design with smooth animations
- ✅ **Improved Performance** - Better error handling, throttled mutation observer, optimized rendering
- ✅ **Expanded Text Simplification** - 60+ word pairs for better readability
- ✅ **Enhanced Focus Indicators** - Better keyboard navigation visibility
- ✅ **In-Extension Virality** - Rating and sharing prompts (appears after 3-4 uses)
- ✅ **Better State Management** - Persistent storage for all settings

### Version 0.1.0
- Initial release
- Basic accessibility profiles
- Text simplification
- ARIA enhancement
- Cognitive load reduction

## 🤝 Contributing

Contributions welcome! This is a production-grade extension built for real-world use.

---

**Built with ❤️ for universal web accessibility**

**Version 0.2.0** · Maintained by **Pranjal Pathak** · Open to contributions

---

## 🎉 Recent Updates

### Translation Feature (v0.2.0)
- ✅ Fully working multi-language translation
- ✅ Uses direct Google Translate API (free, no API key)
- ✅ Translates all page elements automatically
- ✅ Works without page refresh
- ✅ 30+ languages supported
- ✅ Smart element detection and batch processing
- ✅ Fully reversible - restore original text anytime

### Performance Improvements
- ✅ Optimized translation batching (5 elements per batch)
- ✅ Individual translation for reliability
- ✅ Rate limiting with smart delays
- ✅ Better error handling and fallbacks

