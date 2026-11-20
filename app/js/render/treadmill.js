// Treadmill illustration, drawn in place of a route for runs without GPS.
import { drawText, textBox, col } from './draw.js';

// Draws the illustration centred in (x, y, w, h). f = run progress 0..1 (moves the belt in videos).
// Returns the box actually used {x, y, w, h}.
export function drawTreadmillArt(ctx, x, y, w, h, color, f = 1, lw = 1) {
  const s = Math.min(w / 100, h / 70);
  if (s <= 0) return null;
  const ox = x + (w - 100 * s) / 2, oy = y + (h - 70 * s) / 2;
  ctx.save();
  ctx.translate(ox, oy); ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.lineWidth = 4 * lw;
  // deck
  const deck = new Path2D(); deck.moveTo(10, 54); deck.lineTo(78, 54); deck.arc(78, 59, 5, -Math.PI / 2, Math.PI / 2); deck.lineTo(10, 64); deck.arc(10, 59, 5, Math.PI / 2, Math.PI * 1.5); deck.closePath();
  ctx.stroke(deck);
  // rollers
  ctx.beginPath(); ctx.arc(10, 59, 1.6, 0, Math.PI * 2); ctx.arc(78, 59, 1.6, 0, Math.PI * 2); ctx.fill();
  // moving belt marks
  ctx.save(); ctx.clip(deck); ctx.lineWidth = 2.5 * lw; ctx.globalAlpha *= 0.55;
  const off = ((f * 360) % 12 + 12) % 12;
  for (let bx = 4 - off; bx < 86; bx += 12) { ctx.beginPath(); ctx.moveTo(bx, 57); ctx.lineTo(bx + 5, 57); ctx.stroke(); }
  ctx.restore();
  // feet, upright, console, handle
  ctx.beginPath(); ctx.moveTo(12, 64); ctx.lineTo(12, 68); ctx.moveTo(76, 64); ctx.lineTo(76, 68);
  ctx.moveTo(80, 54); ctx.lineTo(90, 14); ctx.moveTo(84, 9); ctx.lineTo(98, 9); ctx.moveTo(89, 18); ctx.lineTo(72, 24); ctx.stroke();
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(83, 5, 16, 8, 2) : ctx.rect(83, 5, 16, 8); ctx.stroke();
  // runner (stride swings with progress)
  const sw = Math.sin(f * Math.PI * 24) * 0.5;
  ctx.lineWidth = 4.5 * lw;
  ctx.beginPath(); ctx.arc(44, 10, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(43, 18); ctx.lineTo(39, 34); // torso
  ctx.moveTo(42, 21); ctx.lineTo(50 + sw * 3, 27); ctx.lineTo(56 + sw * 3, 22); // front arm
  ctx.moveTo(42, 21); ctx.lineTo(34 - sw * 3, 25); ctx.lineTo(30 - sw * 3, 32); // back arm
  ctx.moveTo(39, 34); ctx.lineTo(48 + sw * 4, 41); ctx.lineTo(47 + sw * 4, 51); // front leg
  ctx.moveTo(39, 34); ctx.lineTo(33 - sw * 4, 44); ctx.lineTo(24 - sw * 4, 46); // back leg
  ctx.stroke();
  ctx.restore();
  return { x: ox, y: oy, w: 100 * s, h: 70 * s };
}

// Art + label in a box. mode: 'treadmill' (art + label) | 'art' | 'text' | 'blank'.
export function drawNoGps(ctx, x, y, w, h, opts, env) {
  const { mode = 'treadmill', color = '@accent', text = 'Treadmill', ts, f = 1, sub = '' } = opts;
  if (mode === 'blank') return;
  const c = col(color, env);
  const showText = mode !== 'art' && text, hasSub = mode !== 'art' && sub;
  const tb = showText && ts ? textBox(ctx, text, ts) : null, sb = hasSub && ts ? textBox(ctx, sub, { ...ts, size: ts.size * 0.6, opacity: 0.75 }) : null;
  const textH = (tb ? tb.h + ts.size * 0.5 : 0) + (sb ? sb.h + ts.size * 0.35 : 0);
  if (mode === 'text') {
    let yy = y + (h - textH) / 2;
    if (tb) { drawText(ctx, text, x + w / 2, yy + tb.asc, ts, env, 'center'); yy += tb.h + ts.size * 0.35; }
    if (sb) drawText(ctx, sub, x + w / 2, yy + sb.asc, { ...ts, size: ts.size * 0.6, opacity: (ts.opacity ?? 1) * 0.75 }, env, 'center');
    return;
  }
  const artH = Math.max(10, h - textH);
  const box = drawTreadmillArt(ctx, x + w * 0.08, y, w * 0.84, artH, c, f, Math.max(1, 1.6 - Math.min(w, h) / 600));
  let yy = (box ? box.y + box.h : y + artH) + ts.size * 0.45;
  if (tb) { drawText(ctx, text, x + w / 2, yy + tb.asc, ts, env, 'center'); yy += tb.h + ts.size * 0.35; }
  if (sb) drawText(ctx, sub, x + w / 2, yy + sb.asc, { ...ts, size: ts.size * 0.6, opacity: (ts.opacity ?? 1) * 0.75 }, env, 'center');
}
