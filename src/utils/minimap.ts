import { CAMPUSES } from '../data/campuses';
import { MAP } from '../config/mapConfig';

export function drawMinimap(
  canvas: HTMLCanvasElement,
  playerX: number,
  playerZ: number,
  completedAreas: Set<string>
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  const toPx = (x: number, z: number) => ({
    px: ((x - MAP.minX) / (MAP.maxX - MAP.minX)) * w,
    py: ((MAP.maxZ - z) / (MAP.maxZ - MAP.minZ)) * h,
  });

  const h1 = toPx(-90, 12);
  const h2 = toPx(90, -8);
  ctx.fillStyle = '#0e7490';
  ctx.fillRect(h1.px, h2.py, h2.px - h1.px, h1.py - h2.py);

  CAMPUSES.forEach((c) => {
    const { px, py } = toPx(c.position.x, c.position.z);
    const done = c.programmeAreaIds.every((id) => completedAreas.has(id));
    ctx.beginPath();
    ctx.arc(px, py, done ? 4 : 6, 0, Math.PI * 2);
    ctx.fillStyle = done ? '#64748b' : `#${c.color.toString(16).padStart(6, '0')}`;
    ctx.fill();
    if (!done) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '8px DM Sans, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(c.short, px, py - 9);
  });

  const p = toPx(playerX, playerZ);
  ctx.beginPath();
  ctx.arc(p.px, p.py, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#00d4aa';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '9px DM Sans, Arial';
  ctx.textAlign = 'left';
  ctx.fillText('N ↑', 4, 12);
}
