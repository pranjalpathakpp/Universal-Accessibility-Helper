# 🌍 Universal Web Accessibility Helper

A privacy-first Chrome extension that provides one-click accessibility improvements for any website. Built with React, TypeScript, and Manifest V3.

**Author:** Pranjal Pathak  
**Role:** Software Engineer

## 🌱 Why this project exists

Over 1 billion people globally experience some form of visual, cognitive, or neurological disability. Despite this, most websites are not built with accessibility in mind.

This extension empowers users — not websites — to control how content is presented, making the web more readable, calm, and inclusive by default.

## ✨ Features

- **Accessibility Profiles**: Pre-configured profiles for Low Vision, Dyslexia, Cognitive Load, and Custom settings
- **Style Injection**: Dynamic font adjustments, contrast enhancement, and spacing improvements
- **Text Simplification**: Rule-based text simplification (sentence shortening, word replacement, passive-voice reduction)
- **ARIA Enhancement**: Automatic screen-reader hints and landmark improvements
- **Cognitive Load Reduction**: Disables auto-play, reduces clutter, highlights key content
- **Privacy-First**: All processing happens locally, no data sent to servers

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
│   └── cognitiveReducer.ts   # Cognitive load reduction
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

## 🛠️ Development

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
- ✅ Processes everything locally in your browser
- ✅ Never sends data to external servers
- ✅ Uses Chrome's local storage only
- ✅ No tracking or analytics
- ✅ Open source and auditable

## 🎓 Resume-Ready Description

> Built a privacy-first Chrome extension that provides universal, user-controlled accessibility enhancements across arbitrary websites using DOM injection, ARIA enrichment, and rule-based text simplification. Designed and implemented a Manifest V3 architecture with a React-based UI, background service worker, and content scripts.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! This is a production-grade extension built for real-world use.

---

**Built with ❤️ for universal web accessibility**

Maintained by **Pranjal Pathak** · Open to contributions

