# 🚀 Quick Start Guide - Using Your Extension

## ✅ Extension Loaded Successfully!

Now let's test it and see it in action.

---

## Step 1: Pin Extension to Toolbar (Optional but Recommended)

1. Look for the **puzzle piece icon** (🧩) in Chrome's toolbar (top right)
2. Click it
3. Find **"Universal Accessibility Helper"**
4. Click the **pin icon** (📌) next to it
5. The extension icon will now appear directly in your toolbar

---

## Step 2: Visit a Website to Test

Open any website. Good test sites:
- **Wikipedia** - https://en.wikipedia.org/wiki/Accessibility
- **News site** - Any article page
- **Blog** - Any blog post
- **Medium** - Any Medium article

---

## Step 3: Open the Extension Popup

1. **Click the extension icon** in your Chrome toolbar
2. You should see a popup with:
   - Header: "Accessibility Helper"
   - Toggle switch: "Enable Accessibility Mode"
   - Profile cards (when enabled)

---

## Step 4: Enable Accessibility Mode

1. **Toggle ON** the "Enable Accessibility Mode" switch
2. Watch the webpage **transform instantly**:
   - Fonts may get larger
   - Contrast may increase
   - Spacing may adjust
   - (Changes depend on the selected profile)

---

## Step 5: Try Different Profiles

Once enabled, you'll see 4 profile cards:

### 👁️ Low Vision
- **Click it** to activate
- See: Larger fonts, very high contrast, increased spacing
- Best for: Users with visual impairments

### 📖 Dyslexia
- **Click it** to activate
- See: Increased letter/word spacing, text simplification
- Best for: Users with dyslexia

### 🧠 Cognitive Load
- **Click it** to activate
- See: Simplified text, reduced distractions
- Best for: Users who need less cognitive load

### ⚙️ Custom
- **Click it** to activate
- See: Default settings (can be customized later)
- Best for: Custom preferences

**Try switching between profiles** to see different effects!

---

## Step 6: Disable and Re-enable

1. **Toggle OFF** the switch
2. Page should return to **normal**
3. **Toggle ON** again
4. Page transforms again

This tests the **reversibility** feature!

---

## Step 7: Test on Different Websites

Try the extension on:
- ✅ **Wikipedia** - Long articles
- ✅ **Twitter/X** - Dynamic content (tests SPA handling)
- ✅ **Gmail** - Forms and dynamic content
- ✅ **GitHub** - Code blocks (should remain unchanged)
- ✅ **News sites** - Article content

---

## What to Look For

### ✅ Good Signs:
- Fonts change size
- Contrast improves
- Spacing increases
- Text simplifies (if profile enabled)
- Icons/images remain intact
- Code blocks stay unchanged
- Page remains functional

### ⚠️ If Something Breaks:
- Reload the webpage
- Toggle extension off and on
- Try a different profile
- Check browser console (F12) for errors

---

## Testing Checklist

- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicked
- [ ] Toggle switch works
- [ ] Page changes when enabled
- [ ] Page returns to normal when disabled
- [ ] Profile switching works
- [ ] Works on multiple websites
- [ ] No broken images/icons
- [ ] Code blocks remain unchanged

---

## Troubleshooting

### Popup doesn't open
- Right-click extension icon → "Inspect popup"
- Check for errors in console

### Changes not applying
- Make sure toggle is ON
- Reload the webpage
- Check browser console (F12)

### Extension disappeared
- Go to `chrome://extensions`
- Make sure it's enabled
- Reload the extension if needed

---

## 🎉 You're Done!

Your extension is working! You've successfully:
- ✅ Built a Chrome extension
- ✅ Loaded it in Chrome
- ✅ Tested accessibility features
- ✅ Verified it works on real websites

**This is production-ready code that you can:**
- Add to your portfolio
- Show in interviews
- Publish to Chrome Web Store (optional)
- Use personally for better web accessibility

---

## Next Steps (Optional)

1. **Customize profiles** - Edit `utils/profiles.ts`
2. **Improve text simplification** - Enhance `utils/textSimplifier.ts`
3. **Add more features** - Extend functionality
4. **Publish to Chrome Web Store** - Share with others
5. **Add to GitHub** - Showcase your work

---

**Enjoy your accessibility extension!** 🌍✨

