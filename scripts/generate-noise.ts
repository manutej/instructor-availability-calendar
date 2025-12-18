// Noise texture generator for LibreUIUX Luxury/Refined aesthetic
// Generates 512x512px grayscale noise with 20% opacity
// Used as subtle texture layer in glassmorphism components
//
// MANUAL GENERATION INSTRUCTIONS:
// Since we don't have canvas package installed, use one of these methods:
//
// Method 1: Online Generator (Fastest)
// 1. Visit: https://www.noisetexturegenerator.com/
// 2. Settings:
//    - Size: 512×512px
//    - Type: Perlin Noise
//    - Scale: 2.0
//    - Octaves: 4
//    - Opacity: 20%
//    - Format: PNG with transparency
// 3. Save to: /Users/manu/Documents/LUXOR/cal/public/noise.png
//
// Method 2: ImageMagick (CLI)
// Run: convert -size 512x512 xc: +noise Random -channel A -evaluate set 20% public/noise.png
//
// Method 3: Photoshop/GIMP
// 1. Create new 512×512px document
// 2. Fill with 50% gray (#808080)
// 3. Filter → Noise → Add Noise (25%, Gaussian, Monochromatic)
// 4. Adjust opacity to 20%
// 5. Save as PNG: public/noise.png

import fs from 'fs';
import path from 'path';

console.log('🎨 Noise Texture Generator for LibreUIUX');
console.log('');
console.log('⚠️  Canvas package not installed. Please generate manually:');
console.log('');
console.log('✅ RECOMMENDED: Online Generator');
console.log('   1. Visit: https://www.noisetexturegenerator.com/');
console.log('   2. Set: 512×512px, Perlin Noise, Scale 2.0, Opacity 20%');
console.log('   3. Save to: public/noise.png');
console.log('');
console.log('📦 Or install canvas package:');
console.log('   npm install canvas');
console.log('');

// Create public directory
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public/ directory');
}

// Check if noise.png already exists
const noisePath = path.join(publicDir, 'noise.png');
if (fs.existsSync(noisePath)) {
  console.log('✅ noise.png already exists at:', noisePath);
} else {
  console.log('❌ noise.png not found. Please generate manually.');
  console.log('   Expected location:', noisePath);
}
