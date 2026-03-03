/**
 * Generate a simple Apex launcher icon (blue gradient with "A").
 * Run: node scripts/generate-icon.js
 */
const fs = require('fs');
const path = require('path');

// Create a minimal 1024x1024 PNG using sharp if available
async function main() {
  try {
    const sharp = require('sharp');
    const size = 1024;
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6"/>
            <stop offset="100%" style="stop-color:#8b5cf6"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="180" fill="url(#grad)"/>
        <text x="50%" y="58%" fontSize="520" fontFamily="Arial,sans-serif" fontWeight="bold" fill="white" textAnchor="middle" dominantBaseline="middle">A</text>
      </svg>
    `;
    const outDir = path.join(__dirname, '..', 'src-tauri', 'icons');
    const outPath = path.join(outDir, 'app-icon.png');
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outPath);
    console.log('Created app-icon.png at', outPath);
    return outPath;
  } catch (e) {
    console.error('Sharp failed:', e.message);
    // Fallback: create minimal 32x32 PNG (base64)
    const outDir = path.join(__dirname, '..', 'src-tauri', 'icons');
    fs.mkdirSync(outDir, { recursive: true });
    const minimalPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAADAAAAAwABAAEBAAAABgAAABEBAAAFAAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(path.join(outDir, '32x32.png'), minimalPng);
    fs.writeFileSync(path.join(outDir, '128x128.png'), minimalPng);
    fs.writeFileSync(path.join(outDir, '128x128@2x.png'), minimalPng);
    fs.writeFileSync(path.join(outDir, 'icon.ico'), minimalPng);
    console.log('Created minimal placeholder icons');
  }
}

main().catch(console.error);
