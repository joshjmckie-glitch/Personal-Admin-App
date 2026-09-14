import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const outDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
mkdirSync(outDir, { recursive: true });

const BG = "#141210";
const GOLD = "#E8B565";

// Full-bleed icon: dark square, gold ring + dot mark centered.
function iconSvg(size) {
  const c = size / 2;
  const ringR = size * 0.28;
  const strokeW = size * 0.09;
  const dotR = size * 0.055;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <circle cx="${c}" cy="${c}" r="${ringR}" fill="none" stroke="${GOLD}" stroke-width="${strokeW}" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * ringR * 0.74} ${2 * Math.PI * ringR}" transform="rotate(-90 ${c} ${c})"/>
  <circle cx="${c}" cy="${c - ringR}" r="${dotR}" fill="${GOLD}" transform="rotate(-90 ${c} ${c}) translate(0,0)"/>
</svg>`;
}

// Maskable icon needs extra safe-zone padding (icon content within inner ~80%).
function maskableSvg(size) {
  const c = size / 2;
  const ringR = size * 0.22;
  const strokeW = size * 0.075;
  const dotR = size * 0.045;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <circle cx="${c}" cy="${c}" r="${ringR}" fill="none" stroke="${GOLD}" stroke-width="${strokeW}" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * ringR * 0.74} ${2 * Math.PI * ringR}" transform="rotate(-90 ${c} ${c})"/>
  <circle cx="${c}" cy="${c - ringR}" r="${dotR}" fill="${GOLD}"/>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, svg: iconSvg },
  { name: "icon-512.png", size: 512, svg: iconSvg },
  { name: "maskable-512.png", size: 512, svg: maskableSvg },
  { name: "apple-touch-icon.png", size: 180, svg: iconSvg },
];

for (const t of targets) {
  const svg = Buffer.from(t.svg(t.size));
  await sharp(svg).png().toFile(path.join(outDir, t.name));
  console.log("wrote", t.name);
}
