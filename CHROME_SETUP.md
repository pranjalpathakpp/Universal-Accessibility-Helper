# 🚀 How to Load Extension in Chrome - Step by Step

## Prerequisites

- ✅ Chrome browser installed
- ✅ Node.js 18+ installed
- ✅ Terminal/Command line access

---

## Step 1: Navigate to Project Directory

Open your terminal and go to the project folder:

```bash
cd /Users/pranjalpathak/zephyrsample/universal-accessibility-helper
```

---

## Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

This will install:
- esbuild (for building scripts)
- TypeScript
- React dependencies (will be installed when building popup)

---

## Step 3: Build the Extension

Build all components:

```bash
npm run build:all
```

**What this does:**
- Builds the React popup UI
- Compiles TypeScript content scripts
- Compiles background service worker
- Creates the `dist/` folder with everything ready

**Expected output:**
```
✅ Content script built
✅ Background worker built
🎉 All scripts built successfully
```

---

## Step 4: Create Extension Icons (Quick Setup)

You need icon files for Chrome. Quick options:

### Option A: Generate from Script (if you have sharp)
```bash
npm install --save-dev sharp
npm run generate-icons:sharp
```

### Option B: Create Simple Placeholders
Create these files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

**Quick way:** Use any image editor or online tool:
- Go to https://realfavicongenerator.net/
- Upload any image
- Download the generated icons
- Place them in the `icons/` folder

### Option C: Use Colored Squares (for testing)
If you have ImageMagick:
```bash
convert -size 16x16 xc:#667eea icons/icon16.png
convert -size 48x48 xc:#667eea icons/icon48.png
convert -size 128x128 xc:#667eea icons/icon128.png
```

**Note:** The extension will work without icons, but Chrome will show a warning. Icons are required for Chrome Web Store submission.

---

## Step 5: Copy Icons to Dist Folder

After creating icons, copy them to the dist folder:

```bash
cp -r icons dist/
```

Or if icons are already in dist, you're good!

---

## Step 6: Open Chrome Extensions Page

1. Open **Google Chrome** browser
2. In the address bar, type:
   ```
   chrome://extensions
   ```
   Press Enter

---

## Step 7: Enable Developer Mode

1. Look for the **"Developer mode"** toggle in the **top right corner**
2. **Turn it ON** (toggle should be blue/enabled)
3. You'll see new buttons appear: "Load unpacked", "Pack extension", etc.

---

## Step 8: Load the Extension

1. Click the **"Load unpacked"** button (top left)
2. A file picker window will open
3. Navigate to your project folder:
   ```
   /Users/pranjalpathak/zephyrsample/universal-accessibility-helper
   ```
4. Select the **`dist`** folder (NOT the root folder)
5. Click **"Select"** or **"Open"**

---

## Step 9: Verify Extension is Loaded

You should see:
- ✅ Extension card appears in the extensions page
- ✅ Name: "Universal Accessibility Helper"
- ✅ Version: 0.1.0
- ✅ Extension icon appears in Chrome toolbar (puzzle piece icon area)

If you see errors:
- Check the browser console for details
- Make sure you selected the `dist/` folder, not the root folder
- Verify the build completed successfully

---

## Step 10: Pin Extension to Toolbar (Optional)

1. Click the **puzzle piece icon** (🧩) in Chrome toolbar
2. Find "Universal Accessibility Helper"
3. Click the **pin icon** 📌 next to it
4. Extension icon will now appear directly in toolbar

---

## Step 11: Test the Extension

1. **Visit any website** (e.g., news site, blog, Wikipedia)
2. **Click the extension icon** in Chrome toolbar
3. The popup should open showing:
   - "Accessibility Helper" header
   - Toggle switch for "Enable Accessibility Mode"
   - Profile selection (when enabled)
4. **Toggle ON** the accessibility mode
5. **Watch the page transform:**
   - Fonts may change
   - Contrast may increase
   - Spacing may adjust
   - (Depending on selected profile)

---

## Step 12: Try Different Profiles

1. With accessibility enabled, you'll see 4 profile cards:
   - **Low Vision** 👁️
   - **Dyslexia** 📖
   - **Cognitive Load** 🧠
   - **Custom** ⚙️
2. Click different profiles to see changes
3. Each profile applies different accessibility settings

---

## 🐛 Troubleshooting

### Extension doesn't appear
- ✅ Make sure you selected the `dist/` folder
- ✅ Check that build completed: `npm run build:all`
- ✅ Verify `dist/manifest.json` exists

### Popup doesn't open
- ✅ Check browser console for errors (F12)
- ✅ Reload the extension (click reload icon on extension card)
- ✅ Make sure `dist/popup/index.html` exists

### Changes not applying to pages
- ✅ Make sure you clicked "Enable Accessibility Mode"
- ✅ Check that content script is loaded (Chrome DevTools → Sources → Content scripts)
- ✅ Try reloading the webpage after enabling

### Build errors
- ✅ Make sure Node.js 18+ is installed: `node --version`
- ✅ Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- ✅ Check that all dependencies installed correctly

### Icons missing warning
- ✅ This is OK for testing
- ✅ Create icons in `icons/` folder (see Step 4)
- ✅ Copy to `dist/icons/` after building

---

## 🔄 Making Changes & Reloading

After making code changes:

1. **Rebuild:**
   ```bash
   npm run build:all
   ```

2. **Reload extension in Chrome:**
   - Go to `chrome://extensions`
   - Find your extension
   - Click the **reload icon** (circular arrow) 🔄

3. **Reload the webpage** you're testing on

---

## ✅ Success Checklist

- [ ] Extension appears in `chrome://extensions`
- [ ] Extension icon visible in Chrome toolbar
- [ ] Popup opens when clicking icon
- [ ] Toggle switch works
- [ ] Profiles can be selected
- [ ] Page changes when accessibility is enabled
- [ ] No errors in browser console

---

## 📸 Visual Guide

```
Chrome Extensions Page:
┌─────────────────────────────────────┐
│  Developer mode: [ON]               │
│                                     │
│  [Load unpacked] [Pack extension]    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Universal Accessibility      │   │
│  │ Helper                       │   │
│  │ Version 0.1.0        [🔄]    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎉 You're Done!

Your extension is now loaded and ready to use. Test it on different websites and enjoy making the web more accessible!

---

**Next Steps:**
- Test on various websites
- Customize profiles if needed
- Prepare for Chrome Web Store submission (optional)

