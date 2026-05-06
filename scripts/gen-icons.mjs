/**
 * Generates PWA icons from favicon.svg using sharp.
 * Run with: node scripts/gen-icons.mjs
 *
 * Outputs:
 *   public/icon-192.png    — standard 192×192 PWA icon
 *   public/icon-512.png    — standard 512×512 PWA icon
 *   public/icon-maskable-192.png  — maskable (with safe-zone padding)
 *   public/icon-maskable-512.png  — maskable large
 *   public/apple-touch-icon.png   — 180×180 for iOS
 */

import sharp from "sharp";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const publicDir = resolve(root, "public");

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// Read the SVG
const svgPath = resolve(publicDir, "favicon.svg");
const svgBuffer = readFileSync(svgPath);

// Standard icons — no extra padding, just resize
const sizes = [192, 512];
for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(resolve(publicDir, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

// Apple touch icon — 180×180
await sharp(svgBuffer)
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(resolve(publicDir, "apple-touch-icon.png"));
console.log("✓ apple-touch-icon.png");

// Maskable icons — add ~20% padding so the logo sits in the safe zone
// (safe zone = centre circle = 80% of the icon area)
// We render the SVG at 80% of target size, then extend with the bg colour
const bgColour = { r: 12, g: 28, b: 18, alpha: 1 }; // #0c1c12

for (const size of sizes) {
  const innerSize = Math.round(size * 0.78); // logo fills 78% of canvas
  const pad = Math.round((size - innerSize) / 2);

  await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .extend({
      top: pad,
      bottom: size - innerSize - pad,
      left: pad,
      right: size - innerSize - pad,
      background: bgColour,
    })
    .png({ compressionLevel: 9 })
    .toFile(resolve(publicDir, `icon-maskable-${size}.png`));
  console.log(`✓ icon-maskable-${size}.png`);
}

console.log("\nAll icons generated in public/");
