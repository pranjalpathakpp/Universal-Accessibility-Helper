const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

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

const iconsDir = path.join(__dirname, '../icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 48, 128];

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(Buffer.from(iconSVG))
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon${size}.png`));
      console.log(`✅ Generated icon${size}.png (${size}x${size})`);
    }
    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\n💡 Install sharp: npm install --save-dev sharp');
  }
}

generateIcons();

