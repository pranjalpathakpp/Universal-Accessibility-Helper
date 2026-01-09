#!/bin/bash

# Build script for Universal Accessibility Helper
# This compiles all TypeScript files and builds the React popup

set -e

echo "🔨 Building Universal Accessibility Helper..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies..."
  npm install
fi

# Build React popup
echo "⚛️  Building React popup..."
cd popup
if [ ! -d "node_modules" ]; then
  echo "📥 Installing popup dependencies..."
  npm install
fi
npm run build
cd ..

# Build content script and background worker (bundled with esbuild)
echo "📝 Building content script and background worker..."
node esbuild.config.js

# Copy manifest and icons
echo "📋 Copying manifest and assets..."
cp manifest.json dist/
if [ -d "icons" ]; then
  cp -r icons dist/
else
  echo "⚠️  Warning: icons folder not found. Create placeholder icons for Chrome Web Store."
  echo "💡 Creating placeholder icon files..."
  mkdir -p dist/icons
  # Create simple SVG icons (Chrome will need PNG, but this is a placeholder)
  echo "<!-- Placeholder icon - replace with actual PNG files -->" > dist/icons/icon16.png
  echo "<!-- Placeholder icon - replace with actual PNG files -->" > dist/icons/icon48.png
  echo "<!-- Placeholder icon - replace with actual PNG files -->" > dist/icons/icon128.png
fi

echo "✅ Build complete! Extension is ready in dist/ folder"
echo "📦 Load dist/ folder in Chrome at chrome://extensions"

