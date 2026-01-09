# 🐛 Debugging Guide

## Extension Not Working? Follow These Steps

### Step 1: Check if Popup Opens

1. **Click the extension icon** in Chrome toolbar
2. **Does a popup window appear?**
   - ✅ YES → Go to Step 2
   - ❌ NO → See "Popup Not Opening" below

### Step 2: Check Popup Console

1. **Right-click the extension icon**
2. Select **"Inspect popup"**
3. Check the **Console** tab for errors
4. Look for red error messages

### Step 3: Check Content Script

1. **Open any website** (e.g., Wikipedia)
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for errors related to the extension
5. Check if you see: `"Content script loaded"` or similar

### Step 4: Check Background Service Worker

1. Go to `chrome://extensions`
2. Find your extension
3. Click **"service worker"** link (or "Inspect views: service worker")
4. Check the console for errors

### Step 5: Verify Files Are Built

Run this in terminal:
```bash
cd /Users/pranjalpathak/zephyrsample/universal-accessibility-helper
ls -la dist/
```

You should see:
- `manifest.json`
- `popup/` folder
- `content/` folder
- `background/` folder
- `icons/` folder

---

## Common Issues & Fixes

### Issue 1: Popup Not Opening

**Symptoms:**
- Clicking extension icon does nothing
- No popup appears

**Fix:**
1. Go to `chrome://extensions`
2. Find your extension
3. Click **"Reload"** (circular arrow icon)
4. Try clicking extension icon again

### Issue 2: "Could not establish connection"

**Symptoms:**
- Popup shows error
- Console shows connection errors

**Fix:**
1. Make sure you're on a regular webpage (not `chrome://` pages)
2. Content scripts don't work on Chrome internal pages
3. Try a regular website like Wikipedia

### Issue 3: Toggle Doesn't Work

**Symptoms:**
- Popup opens
- Toggle switch doesn't do anything
- Page doesn't change

**Possible Causes:**
1. Content script not injected
2. Message passing broken
3. Background worker not running

**Fix:**
1. Reload the extension
2. Reload the webpage
3. Check console for errors

### Issue 4: Page Doesn't Change

**Symptoms:**
- Toggle works in popup
- But page doesn't transform

**Fix:**
1. Make sure you're on a webpage (not `chrome://` page)
2. Reload the webpage after enabling
3. Check browser console (F12) for errors

---

## Quick Test Checklist

- [ ] Extension icon appears in toolbar
- [ ] Popup opens when icon clicked
- [ ] No errors in popup console
- [ ] No errors in webpage console
- [ ] Background worker shows no errors
- [ ] Toggle switch works
- [ ] Page changes when enabled

---

## Manual Testing Steps

1. **Open Wikipedia:** https://en.wikipedia.org/wiki/Accessibility
2. **Open extension popup**
3. **Toggle ON** accessibility mode
4. **Watch the page** - fonts should change
5. **Toggle OFF** - page should return to normal

If step 4 doesn't work, there's an issue with content script injection.

---

## Still Not Working?

1. **Rebuild the extension:**
   ```bash
   npm run build:all
   ```

2. **Reload extension in Chrome:**
   - Go to `chrome://extensions`
   - Click reload on your extension

3. **Reload the webpage**

4. **Try again**

