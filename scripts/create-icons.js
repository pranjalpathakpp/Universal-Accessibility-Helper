const fs = require('fs');
const path = require('path');

const createMinimalPNG = (size) => {
  
  console.log(`Creating icon${size}.png (${size}x${size})...`);
  
  try {
    const sharp = require('sharp');
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#667eea"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size * 0.3}" fill="white" opacity="0.8"/>
      </svg>
    `;
    
    sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(__dirname, `../icons/icon${size}.png`))
      .then(() => {
        console.log(`✅ Created icon${size}.png`);
      })
      .catch(() => {
        console.log(`⚠️  Could not create icon${size}.png with sharp`);
      });
  } catch (e) {
    
    console.log(`⚠️  Sharp not available. Install it: npm install --save-dev sharp`);
    console.log(`   Or create icon${size}.png manually using an online tool.`);
  }
};

const iconsDir = path.join(__dirname, '../icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  createMinimalPNG(size);
});

