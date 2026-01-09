# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd universal-accessibility-helper
npm install
```

## Step 2: Build the Extension

```bash
npm run build:all
```

Or use the build script:

```bash
./build.sh
```

## Step 3: Load in Chrome

1. Open Chrome
2. Go to `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `dist/` folder

**📖 For detailed step-by-step instructions, see [CHROME_SETUP.md](CHROME_SETUP.md)**

## Step 4: Test

1. Visit any website (e.g., news site, blog)
2. Click the extension icon in Chrome toolbar
3. Toggle "Enable Accessibility Mode"
4. Select a profile (Low Vision, Dyslexia, Cognitive, Custom)
5. See the page transform instantly!

## 🎨 Creating Icons

The extension needs icon files. Create these PNG files in the `icons/` folder:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

You can use any image editor or online tools to create accessibility-themed icons.

## 🔧 Development

### Rebuild after changes:

```bash
npm run build:all
```

Then reload the extension in Chrome (click the reload icon on the extension card).

### Popup development (with hot reload):

```bash
npm run dev
```

Note: Content scripts still need a full rebuild and extension reload.

## 📦 Distribution

To create a ZIP for Chrome Web Store:

```bash
cd dist
zip -r ../accessibility-helper.zip .
```

Then upload `accessibility-helper.zip` to the Chrome Web Store Developer Dashboard.

---

**That's it! Your extension is ready to use.** 🎉

