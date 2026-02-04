# Universal Web Accessibility Helper

> One-click accessibility improvements for any website. Built for users with low vision, dyslexia, cognitive differences, and reading challenges.

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)

---

## Quick Start

```bash
git clone <repo-url>
cd universal-accessibility-helper
npm install
npm run build:all
```

Then in Chrome: **chrome://extensions** → Enable **Developer mode** → **Load unpacked** → select the `dist/` folder.

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Features](#features)
- [Accessibility Profiles](#accessibility-profiles)
- [Translation](#translation)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Privacy](#privacy)
- [Changelog](#changelog)

---

## Why This Exists

Over **1 billion people** globally experience some form of visual, cognitive, or neurological disability. Most websites are not built with accessibility in mind.

This extension puts control in **your hands**: you choose how content is presented. No site changes required—read more comfortably on any page.

---

## Features

### Core

| Feature | Description |
|--------|-------------|
| **Profiles** | Low Vision, Dyslexia, Cognitive Load, or Custom—one click to apply |
| **Font & contrast** | Dynamic font size (0.5×–3×), high contrast, spacing, and line height |
| **Text simplification** | Shorter sentences, simpler words, less passive voice (60+ word pairs) |
| **ARIA & cognitive** | Better screen-reader hints, less clutter, key content highlighted |
| **Privacy-first** | Processing is local; no data sent to servers except for translation |

### Quick Actions (v0.2.0)

| Feature | Description |
|--------|-------------|
| **Reading Mode** | Hide nav and sidebars; focus on main content with optimal width |
| **Reading Ruler** | Purple line that follows the cursor to track reading position |
| **Dark Mode** | Inverted colors for low-light viewing |
| **Color blind filters** | Protanopia, Deuteranopia, Tritanopia |
| **Font size** | Real-time 0.5×–3× with +/- controls |
| **Translation** | Translate the whole page to 30+ languages (no API key, no refresh) |

### Technical

- **Manifest V3** · React + TypeScript popup · Content + background scripts
- **Production builds** · All `console.*` calls stripped for clean release
- **Persistent settings** · Stored in Chrome sync/local storage

---

## Accessibility Profiles

| Profile | Best for |
|--------|----------|
| **Low Vision** | Larger fonts (1.3×), very high contrast, 1.8 line height, no background images or animations |
| **Dyslexia** | Dyslexia-friendly font, extra letter/word spacing, text simplification, high contrast |
| **Cognitive Load** | Simplified text, fewer distractions, high contrast, key sentences highlighted |
| **Custom** | Your own mix of toggles and values |

---

## Translation

Translate any page to **30+ languages** using Google Translate’s public API. No API key, no account, no page refresh.

- **How:** Enable accessibility → turn on **Translate Page** → pick a language.
- **Change language:** Select another language; the page retranslates.
- **Revert:** Turn **Translate Page** off; original text is restored.

**Supported languages (examples):** English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Dutch, Polish, Turkish, Swedish, Danish, Finnish, Norwegian, Ukrainian, Czech, Romanian, Hungarian, Greek, Hebrew, Thai, Vietnamese, and more.

**Privacy:** Requests go to `translate.googleapis.com` (same as translate.google.com). Original text stays in your browser; nothing is stored or tracked.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl` / `Cmd` + `K` | Toggle accessibility on/off |
| `Ctrl` / `Cmd` + `R` | Toggle Reading Mode |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Chrome** (or Chromium-based browser)

### Install & Build

```bash
cd universal-accessibility-helper
npm install
npm run build:all
```

This builds:

- React popup UI
- Content script (injector)
- Background service worker
- Shared utilities

### Load in Chrome

1. Open **chrome://extensions**
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Choose the project’s **dist/** folder

### Try It

1. Open any website.
2. Click the extension icon.
3. Turn on **Enable Accessibility Mode** and pick a profile.
4. Use Quick Actions: Reading Mode, Ruler, Dark Mode, Font Size, Translation.
5. Use **Ctrl/Cmd + K** to toggle, **Ctrl/Cmd + R** for Reading Mode.

---

## Project Structure

```
universal-accessibility-helper/
├── manifest.json           # Extension manifest (v3)
├── popup/                  # React popup UI
│   ├── src/
│   │   ├── App.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── ViralityPrompt.tsx
│   │   └── profiles.ts
│   └── index.html
├── content/
│   └── injector.ts         # DOM injection, styles, translation trigger
├── background/
│   └── serviceWorker.ts   # State, storage, translation API proxy
├── utils/
│   ├── profiles.ts
│   ├── textSimplifier.ts
│   ├── ariaEnhancer.ts
│   ├── cognitiveReducer.ts
│   └── translator.ts      # Translation logic
├── types/
│   ├── chrome.d.ts
│   ├── messages.ts        # Message & storage types, validation
│   └── translate-google-api.d.ts
└── dist/                  # Build output (load this in Chrome)
```

---

## Development

### Build commands

```bash
npm run build:all      # Full build (popup + scripts + copy assets)
npm run build:popup    # Popup only
npm run build:scripts  # Content + background (esbuild)
npm run copy-assets    # manifest + icons → dist/
npm run dev            # Popup dev server (Vite)
```

Content/background changes need a full rebuild and extension reload.

### Production builds

- **Content & background:** esbuild `drop: ['console']` removes all `console.*` calls.
- **Popup:** Minification removes debug logs.
- Result: no debug output in production.

---

## Privacy

- **Local by default** — Styles, profiles, and preferences are applied in your browser.
- **Translation** — Only the text you translate is sent to Google’s public Translate endpoint (same as using translate.google.com). Original text is kept locally and can be restored anytime.
- **No tracking** — No analytics, no profiling, no selling of data.
- **Open source** — You can review the code. See [PRIVACY.md](PRIVACY.md) for the full policy.

---

## Changelog

### 0.2.0

- Reading Mode, Reading Ruler, Dark Mode, Color blind filters
- Keyboard shortcuts (Ctrl/Cmd + K, Ctrl/Cmd + R)
- Font size quick adjust (0.5×–3×)
- **Page translation** — 30+ languages, no API key, no refresh
- Improved UI/UX, performance, and state persistence
- In-extension rating/share prompt after a few uses

### 0.1.0

- Initial release: profiles, text simplification, ARIA, cognitive load reduction

---

## License & Author

**MIT** — see [LICENSE](LICENSE).

**Pranjal Pathak** · Built for universal web accessibility.
