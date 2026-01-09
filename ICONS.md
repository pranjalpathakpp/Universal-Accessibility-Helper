# Icon Requirements

The extension needs icon files for the Chrome Web Store. Create these PNG files in the `icons/` folder:

## Required Sizes

- **icon16.png** - 16x16 pixels (toolbar icon)
- **icon48.png** - 48x48 pixels (extension management page)
- **icon128.png** - 128x128 pixels (Chrome Web Store)

## Quick Generation (Recommended)

### Option 1: Generate from SVG (Automatic)

```bash
# Generate SVG template
npm run generate-icons

# If you have sharp installed, generate PNGs automatically:
npm install --save-dev sharp
npm run generate-icons:sharp
```

### Option 2: Use React Icons (For UI)

The popup UI already uses **react-icons** (Feather Icons) for beautiful, consistent icons:
- ✅ Eye icon for Low Vision profile
- ✅ Book icon for Dyslexia profile  
- ✅ Brain icon for Cognitive profile
- ✅ Settings icon for Custom profile
- ✅ Zap icon for main header

No need to create custom UI icons!

### Option 3: Online Tools

Use these free tools to generate extension icons:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon Generator](https://www.favicon-generator.org/)
- [Figma](https://figma.com) - Export as PNG

## Design Suggestions

The icons should represent accessibility. Some ideas:

- ♿ Accessibility symbol
- 👁️ Eye icon (matches Low Vision profile)
- 🔍 Magnifying glass (for "making things clearer")
- ✨ Sparkles (for "enhancement")
- 🌐 Globe with accessibility overlay

## Using React Icons in Code

The popup already uses `react-icons` (Feather Icons). To add more icons:

```tsx
import { FiEye, FiBookOpen, FiBrain } from 'react-icons/fi';

// Use in components
<FiEye size={20} />
```

Available icon sets:
- `react-icons/fi` - Feather Icons (used in this project)
- `react-icons/fa` - Font Awesome
- `react-icons/md` - Material Design
- `react-icons/hi` - Heroicons

## After Creating Icons

1. Place PNG files in `icons/` folder
2. Run `npm run build:all`
3. Icons will be copied to `dist/icons/` automatically

