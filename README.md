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
- [Robustness & edge cases](#robustness--edge-cases)
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

### Quick Actions & comfort features (v0.2.x–v0.3)

| Feature | Description |
|--------|-------------|
| **Reading Mode** | Hide nav and sidebars; focus on main content with optimal width |
| **Reading Ruler** | Purple line that follows the cursor to track reading position |
| **Dark Mode** | Inverted colors for low-light viewing |
| **Focus Mode** | Dim non-main areas to visually isolate the main content |
| **Color blind filters** | Protanopia, Deuteranopia, Tritanopia |
| **Font size** | Real-time 0.5×–3× with +/- controls (0.5×–3×) |
| **Themes** | Default, Paper, Night, High-contrast Blue page themes |
| **Translation** | Translate the whole page to 30+ languages (no API key, no refresh) |
| **Selection translation** | Translate only the selected text with a floating bubble |
| **Quick presets** | One-click “Reading”, “Calm”, and “High Contrast” presets |
| **Read Later** | Save pages with their accessibility settings and reopen with the same experience |

### Technical

- **Manifest V3** (Chrome 88+) · React + TypeScript popup · Content + background scripts
- **Shared types** · `types/messages.ts` for message payloads, storage keys, and validation
- **Production builds** · All `console.*` stripped; no debug output in release
- **Persistent settings** · Chrome sync (preferences) and local (usage count) storage

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
| `Ctrl` / `Cmd` + `L` | Toggle Reading Ruler |
| `Ctrl` / `Cmd` + `M` | Toggle Dark Mode |
| `Ctrl` / `Cmd` + `,` | Decrease font size |
| `Ctrl` / `Cmd` + `.` | Increase font size |
| `Ctrl` / `Cmd` + `P` | Cycle profiles (Low Vision → Dyslexia → Cognitive → Custom) |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Chrome** 88+ (or Chromium-based browser; Manifest V3)

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
│   │   ├── App.tsx           # Popup shell, Quick Actions, presets, Read Later, tooltips
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

### Robustness & edge cases

The extension is built to handle incomplete data, invalid input, and messaging edge cases so existing behavior is preserved and the UI stays stable.

#### Validation & security

| Area | What we validate | Fallback / behavior |
|------|------------------|----------------------|
| **Profile ID** | `profileId` must be one of `lowVision`, `dyslexia`, `cognitive`, `custom` | Invalid → `lowVision` |
| **Font size** | Must be a number in 0.5–3.0 | Out of range → 1.0; missing → use stored or 1.0 |
| **Translation language** | `targetLang` allowlisted (30+ codes); reject `auto` for API calls | Invalid/missing → no translation; original text unchanged |
| **Message payloads** | All handlers treat `message` as `unknown` and cast safely | Avoids runtime errors from malformed or missing fields |

#### Storage & toggle behavior

- **Toggle:** When you toggle on/off, the extension **never overwrites your settings with empty data**. If the popup sends a toggle without profile/quick settings/font size, the background **falls back to current storage** and then writes that back. So profile, reading mode, ruler, dark mode, translation, and font size are preserved across toggles.
- **Custom profile:** Custom settings are read from `chrome.storage.sync` when the content script applies the custom profile, so opening the popup on another device or after clearing in-memory state still applies your saved custom profile.
- **Quick settings:** Content script only replaces `currentQuickSettings` when the message includes quick settings; otherwise it keeps the previous value so rapid toggles don’t clear options.

#### Error handling & messaging

- **Safe `sendResponse`:** Every message handler uses a small `safeSend()` wrapper so `sendResponse` is called at most once and never after the channel is closed. Handlers return `true` when the response is async so the message channel stays open.
- **Popup:** Every `chrome.runtime.sendMessage` callback checks `chrome.runtime.lastError` and bails out without updating state if the extension context is invalid or the message fails.
- **Content script:** Enable/disable/updateQuickSettings/updateFontSize/translate handlers are wrapped in try/catch; errors are returned in the response instead of throwing so the popup can stay in sync.
- **Background:** Tabs that don’t inject the content script (e.g. chrome://, or not yet loaded) are skipped when broadcasting; `sendMessage` failures are caught so one bad tab doesn’t break the rest.

#### Performance & rate limiting

- **Translation:** At most **100 elements** per page are translated (`MAX_TRANSLATE_ELEMENTS`). Prevents UI freeze and reduces the chance of hitting rate limits on the translation endpoint. Batches of 5 with a short delay between batches.
- **Mutation observer:** Throttled (debounce 500 ms, max 10 mutations/sec) so DOM-heavy pages don’t thrash. Non-critical work (simplify text, ARIA) runs in `requestIdleCallback` with a timeout.
- **Profile switching:** Rapid profile changes are debounced (requestAnimationFrame + 300 ms timeout) so we don’t remove and re-apply enhancements in the same tick and break the page.

#### Consistency & maintainability

- **Single source of truth for profiles:** Popup and `utils/profiles.ts` use the same profile definitions (e.g. Cognitive profile: fontSize, lineHeight, simplifyText, etc.) so the UI description and applied behavior match.
- **Storage keys:** All keys are constants in `types/messages.ts` (`STORAGE_KEYS`); background and content use these so typos don’t cause silent misreads.
- **Language allowlist:** `VALID_TARGET_LANGS` in `types/messages.ts` is the single allowlist for translation API calls. A comment reminds to keep it in sync with `SUPPORTED_LANGUAGES` in `utils/translator.ts` when adding languages.

---

## Privacy

- **Local by default** — Styles, profiles, and preferences are applied in your browser.
- **Translation** — Only the text you translate is sent to Google’s public Translate endpoint (same as using translate.google.com). Original text is kept locally and can be restored anytime.
- **No tracking** — No analytics, no profiling, no selling of data.
- **Open source** — You can review the code. See [PRIVACY.md](PRIVACY.md) for the full policy.

---

## Changelog

### 0.3.0 (current)

- Focus Mode (dim non-main areas while keeping content sharp)
- Themes: Default, Paper, Night, High-contrast Blue
- Selection translation bubble for highlighted text
- Read Later list (saves URL + profile + quick settings + font size; reopens with the same experience)
- Quick Presets row: **Reading**, **Calm**, **High Contrast**
- Extra keyboard shortcuts (L, M, comma, dot, P)
- Micro-help hints (`?` badges) for Quick Actions, Profiles, and Translation
- Last-used preset banner (“Apply your last used settings?”)
- Gentle toasts for enable + Read Later actions

#### Robustness & production hardening

- **Shared types** (`types/messages.ts`): Message and storage types; `VALID_PROFILE_IDS` and `VALID_TARGET_LANGS`; `isValidProfileId` / `isValidTargetLang`; `STORAGE_KEYS`.
- **Background:** Toggle uses storage fallbacks so profile/quick settings/font size are never wiped by incomplete messages. All handlers validate input and use `safeSend`. Translation only accepts allowlisted language codes, with batched, rate-limited calls.
- **Content script:** Validates `profileId` and `fontSizeMultiplier` on enable; uses `STORAGE_KEYS` for storage and mutation observer; message listener accepts `unknown` and casts safely; all handlers wrapped in try/catch with safe response; translation capped at 100 elements per page.
- **Translator:** Language validation at API boundary; batched requests with delays; safe fallbacks when API fails; selection translation reuses the same pipeline.
- **Popup:** Checks `chrome.runtime.lastError` on every `sendMessage` callback; typed responses; Cognitive profile aligned with `utils/profiles.ts`; Read Later and Last Used powered by local storage.
- **Manifest/build:** `minimum_chrome_version: "88"` for MV3; esbuild drops all `console.*` in content and background; popup is bundled + minified.

### 0.1.0

- Initial release: profiles, text simplification, ARIA, cognitive load reduction

---

## License & Author

**MIT** — see [LICENSE](LICENSE).

**Pranjal Pathak** · Built for universal web accessibility.
