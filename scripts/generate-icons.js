/**
 * Generate extension icons from SVG
 * 
 * This script helps generate the required PNG icons for Chrome extension
 * You can use any SVG icon and convert it to PNG at different sizes
 * 
 * Requirements:
 * - Install sharp: npm install --save-dev sharp
 * - Or use an online tool: https://realfavicongenerator.net/
 */

const fs = require('fs');
const path = require('path');

// Simple SVG icon for accessibility (you can replace this with any SVG)
const iconSVG = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <path d="M64 32 L64 96 M32 64 L96 64" stroke="white" stroke-width="8" stroke-linecap="round"/>
  <circle cx="64" cy="64" r="20" fill="none" stroke="white" stroke-width="6"/>
</svg>
`;

// Save SVG
const iconsDir = path.join(__dirname, '../icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), iconSVG);
console.log('✅ Created icon.svg');

console.log('\n📝 Next steps:');
console.log('1. Open icon.svg in any image editor (Figma, Inkscape, etc.)');
console.log('2. Export as PNG at these sizes:');
console.log('   - 16x16 pixels → icon16.png');
console.log('   - 48x48 pixels → icon48.png');
console.log('   - 128x128 pixels → icon128.png');
console.log('3. Place all PNG files in the icons/ folder');
console.log('\n💡 Or use an online tool:');
console.log('   https://realfavicongenerator.net/');
console.log('   https://www.favicon-generator.org/');

