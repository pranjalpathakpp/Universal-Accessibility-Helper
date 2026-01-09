const fs = require('fs');
const path = require('path');

const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.25}" fill="white" opacity="0.9"/>
  <path d="M${size/2} ${size * 0.3} L${size/2} ${size * 0.7} M${size * 0.3} ${size/2} L${size * 0.7} ${size/2}" 
        stroke="white" stroke-width="${size * 0.08}" stroke-linecap="round"/>
</svg>
`;


const iconsDir = path.join(__dirname, '../icons');
const distIconsDir = path.join(__dirname, '../dist/icons');

[iconsDir, distIconsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sizes = [16, 48, 128];
sizes.forEach(size => {
  const svg = createIconSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  fs.writeFileSync(path.join(distIconsDir, `icon${size}.svg`), svg);
});

console.log('✅ Created SVG icon templates');
console.log('\n📝 To create PNG icons, you have two options:');
console.log('\nOption 1: Use ImageMagick (if installed):');
sizes.forEach(size => {
  console.log(`  convert -size ${size}x${size} xc:#667eea -fill white -draw "circle ${size/2},${size/2} ${size/2},${size * 0.3}" icons/icon${size}.png`);
});

console.log('\nOption 2: Use online tool:');
console.log('  1. Go to https://realfavicongenerator.net/');
console.log('  2. Upload any image or use the SVG files in icons/ folder');
console.log('  3. Download the generated PNG icons');
console.log('  4. Place them in icons/ folder');

console.log('\nOption 3: Create simple colored squares (quickest):');
console.log('  Using ImageMagick:');
sizes.forEach(size => {
  console.log(`  convert -size ${size}x${size} xc:#667eea icons/icon${size}.png`);
});

console.log('\n💡 For now, creating minimal PNG placeholders...');

const createMinimalPNG = (size) => {
  const minimalPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  fs.writeFileSync(
    path.join(iconsDir, `icon${size}.png.placeholder`),
    `Placeholder for icon${size}.png\nSize: ${size}x${size}\nColor: #667eea\n\nCreate this file as a PNG image.`
  );
};

sizes.forEach(size => {
  createMinimalPNG(size);
});

console.log('\n⚠️  Created placeholder notes. You need to create actual PNG files.');
console.log('   Quick fix: Use ImageMagick or an online tool to create the PNG files.');

