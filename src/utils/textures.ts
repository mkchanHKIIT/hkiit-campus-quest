import * as THREE from 'three';
import { CAMPUSES } from '../data/campuses';
import { PROGRAMME_AREA_MAP } from '../data/programmeAreas';
import { MAP } from '../config/mapConfig';

let logoTexture: THREE.CanvasTexture | null = null;

/** Canvas-drawn HKIIT logo (always visible, no external file dependency). */
export function createHkiitLogoTexture(): THREE.CanvasTexture {
  if (logoTexture) return logoTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0d2137';
  roundRect(ctx, 4, 4, 392, 152, 12);
  ctx.fill();

  ctx.strokeStyle = '#00d4aa';
  ctx.lineWidth = 4;
  roundRect(ctx, 4, 4, 392, 152, 12);
  ctx.stroke();

  // Icon circle
  ctx.beginPath();
  ctx.arc(52, 80, 36, 0, Math.PI * 2);
  ctx.fillStyle = '#1e3a5f';
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(52, 58);
  ctx.lineTo(68, 80);
  ctx.lineTo(52, 102);
  ctx.lineTo(36, 80);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#00d4aa';
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('HKIIT', 100, 72);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText('Hong Kong Institute of', 100, 98);
  ctx.fillText('Information Technology', 100, 118);

  logoTexture = new THREE.CanvasTexture(canvas);
  logoTexture.colorSpace = THREE.SRGBColorSpace;
  return logoTexture;
}

function worldToUv(x: number, z: number, size: number): { u: number; v: number } {
  const u = (x - MAP.minX) / (MAP.maxX - MAP.minX);
  // North (+Z) at top of texture image
  const v = (MAP.maxZ - z) / (MAP.maxZ - MAP.minZ);
  return { u: u * size, v: v * size };
}

/** Ground map aligned to world X/Z (North = +Z). */
export function createHongKongMapTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const toPx = (x: number, z: number) => worldToUv(x, z, size);

  // Ocean / base (realistic tones)
  ctx.fillStyle = '#1e4d6b';
  ctx.fillRect(0, 0, size, size);

  const land = (pts: [number, number][], fill: string, stroke?: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    pts.forEach(([x, z], i) => {
      const { u, v } = toPx(x, z);
      if (i === 0) ctx.moveTo(u, v);
      else ctx.lineTo(u, v);
    });
    ctx.closePath();
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // New Territories (north, +Z)
  land(
    [[-95, 18], [95, 18], [95, 75], [-95, 75]],
    '#3d5c42',
    '#4a6b4f'
  );
  // Kowloon (urban grey-green)
  land(
    [[-52, -6], [58, -6], [58, 24], [-52, 24]],
    '#5a6a5e',
    '#6b7a6e'
  );
  // Hong Kong Island (south, -Z)
  land(
    [[-48, -54], [78, -54], [78, -4], [-48, -4]],
    '#4a6b55',
    '#5a7d65'
  );
  // Tsing Yi island
  land(
    [[-76, 0], [-40, 0], [-40, 20], [-76, 20]],
    '#527a58',
    '#638a68'
  );

  // Victoria Harbour
  const h1 = toPx(-92, 14);
  const h2 = toPx(92, -10);
  ctx.fillStyle = '#2a7a9a';
  ctx.fillRect(h1.u, h1.v, h2.u - h1.u, h2.v - h1.v);

  // Campus markers on map (exact world positions)
  CAMPUSES.forEach((c) => {
    const { u, v } = toPx(c.position.x, c.position.z);
    const hex = `#${c.color.toString(16).padStart(6, '0')}`;
    ctx.beginPath();
    ctx.arc(u, v, 10, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(c.short, u, v - 14);
  });

  // District labels
  ctx.font = 'bold 13px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'center';
  const labels: [string, number, number][] = [
    ['Victoria Harbour 維多利亞港', 0, 2],
    ['Kowloon 九龍', 8, 16],
    ['Hong Kong Island 香港島', 18, -30],
    ['New Territories 新界', 0, 55],
  ];
  labels.forEach(([t, x, z]) => {
    const { u, v } = toPx(x, z);
    ctx.fillText(t, u, v);
  });

  // Compass North
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  const n = toPx(0, 70);
  ctx.fillText('N ↑', n.u, n.v);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.flipY = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createProgrammeIconTexture(
  icon: string,
  completed: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = completed ? 'rgba(100,116,139,0.9)' : 'rgba(13,33,55,0.95)';
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = completed ? '#64748b' : '#00d4aa';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 32, 34);

  if (completed) {
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('✓', 48, 18);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCampusSignTexture(
  short: string,
  shortZh: string,
  district: string,
  colorHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(13, 33, 55, 0.92)';
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 6;
  roundRect(ctx, 8, 8, 496, 240, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#00d4aa';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('HKIIT', 256, 52);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(short, 256, 110);

  ctx.fillStyle = colorHex;
  ctx.font = '28px Arial';
  ctx.fillText(shortZh, 256, 148);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px Arial';
  ctx.fillText(district, 256, 185);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Re-export for campus building programme rows */
export function getProgrammeIconsForCampus(campusId: string): { id: string; icon: string }[] {
  const campus = CAMPUSES.find((c) => c.id === campusId);
  if (!campus) return [];
  return campus.programmeAreaIds.map((id) => ({
    id,
    icon: PROGRAMME_AREA_MAP.get(id)?.icon ?? '📘',
  }));
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
