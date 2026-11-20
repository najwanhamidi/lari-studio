// Run cards (multi-run): one card per run with route, name, date and its own stats.
import { register, progOf } from './core.js';
import { TS, drawText, textBox, col, rrect, measureStr } from '../render/draw.js';
import { fmtPace, fmtDuration, fmtDist, fmtInt, fmtElev, fmtDate, isNum, clamp, distUnit, paceUnit, elevUnit, DAYS, EASE } from '../util.js';
import { routePoints } from './map.js';

export const CARD_FIELDS = [['dist', 'Distance'], ['time', 'Time'], ['pace', 'Avg pace'], ['hr', 'Avg HR'], ['elev', 'Elev gain'], ['cad', 'Cadence'], ['cal', 'Calories'], ['maxhr', 'Max HR']];
const PAL = ['#c6ff3d', '#00e0ff', '#ff6bd6', '#ffb020', '#8b5cf6', '#22c55e', '#f43f5e', '#38bdf8'];

function statOf(a, k, units) {
  switch (k) {
    case 'dist': return [fmtDist(a.distance, units, 2), distUnit(units), 'Distance'];
    case 'time': return [fmtDuration(a.moving), '', 'Time'];
    case 'pace': return [fmtPace(a.avgPace, units), paceUnit(units), 'Pace'];
    case 'hr': return [fmtInt(a.avgHr), 'bpm', 'Avg HR'];
    case 'maxhr': return [fmtInt(a.maxHr), 'bpm', 'Max HR'];
    case 'elev': return [fmtElev(a.ascent, units), elevUnit(units), 'Elev'];
    case 'cad': return [fmtInt(a.avgCad), 'spm', 'Cadence'];
    case 'cal': return [fmtInt(a.calories), 'kcal', 'Calories'];
    default: return ['--', '', ''];
  }
}
function dayLabel(a, style) {
  if (style === 'weekday') return DAYS[a.start.getDay()];
  if (style === 'dayDate') return DAYS[a.start.getDay()] + ' · ' + fmtDate(a.start, 'short');
  return fmtDate(a.start, style || 'short');
}
const scaleTS = (ts, k) => (k >= 0.999 ? ts : { ...ts, size: ts.size * k });

function drawRoute(ctx, a, x, y, w, h, color, width, glow, f) {
  const R = routePoints(a, 300); if (!R || w < 4 || h < 4) return;
  const sc = Math.min(w / Math.max(1, R.maxX - R.minX), h / Math.max(1, R.maxY - R.minY));
  const ox = x + w / 2 - ((R.minX + R.maxX) / 2) * sc, oy = y + h / 2 - ((R.minY + R.maxY) / 2) * sc;
  const n = Math.max(2, Math.floor(R.pts.length * f));
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = ctx.lineCap = 'round';
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  ctx.beginPath(); for (let i = 0; i < n; i++) { const q = R.pts[i]; i ? ctx.lineTo(q.x * sc + ox, q.y * sc + oy) : ctx.moveTo(q.x * sc + ox, q.y * sc + oy); } ctx.stroke(); ctx.restore();
}

// one row of stats inside width w, top-left at (x, y); returns height used
function statRow(ctx, p, a, x, y, w, k, env, align = 'spread') {
  const keys = p.fields || []; if (!keys.length) return 0;
  const vts = scaleTS(p.valueTS, k), uts = scaleTS(p.unitTS, k), lts = scaleTS(p.labelTS, k);
  const cw = w / keys.length;
  const vb = textBox(ctx, '0', vts), lb = p.statLabels ? textBox(ctx, 'A', lts) : null;
  keys.forEach((key, i) => {
    const [v, u, l] = statOf(a, key, env.units);
    const vw = measureStr(ctx, v, vts), uw = p.showUnits && u ? measureStr(ctx, u, uts) + vts.size * 0.12 : 0;
    const cx = align === 'left' ? x + i * cw : x + i * cw + (cw - (vw + uw)) / 2;
    drawText(ctx, v, cx, y + vb.asc, vts, env);
    if (uw) drawText(ctx, u, cx + vw + vts.size * 0.12, y + vb.asc, uts, env);
    if (lb) drawText(ctx, (p.fieldLabels && p.fieldLabels[key]) || l, align === 'left' ? cx : x + i * cw + cw / 2, y + vb.h + lts.size * 0.45 + lb.asc, lts, env, align === 'left' ? 'left' : 'center');
  });
  return vb.h + (lb ? lts.size * 0.45 + lb.h : 0);
}
// largest scale (<=1) at which every run's stats fit columns of width colW
function fitK(ctx, p, list, colW, units) {
  let need = 1;
  for (const a of list) for (const key of p.fields || []) {
    const [v, u] = statOf(a, key, units);
    const w = measureStr(ctx, v, p.valueTS) + (p.showUnits && u ? measureStr(ctx, u, p.unitTS) + p.valueTS.size * 0.12 : 0);
    need = Math.max(need, w / (colW * 0.9));
  }
  return 1 / need;
}
function statRowH(ctx, p, k) {
  const vb = textBox(ctx, '0', scaleTS(p.valueTS, k));
  return vb.h + (p.statLabels ? p.labelTS.size * k * 0.45 + textBox(ctx, 'A', scaleTS(p.labelTS, k)).h : 0);
}

register({
  type: 'mcards', name: 'Run cards', auto: false, w: 940, h: 1100, modes: ['multi'],
  props: () => ({
    design: 'list', cols: 2, fields: ['dist', 'time', 'pace', 'hr'], statLabels: true, showUnits: true, fieldLabels: {},
    showRoute: true, routeColor: '@accent', palette: false, routeWidth: 5, routeGlow: 0, routeBg: '#ffffff0d',
    showName: true, showDate: true, dateStyle: 'dayDate', cardBg: '#ffffff14', radius: 22, gap: 18, pad: 26,
    accentBar: true, accent: '@accent', hlMode: 'longest', hlColor: '@accent', lineColor: '#ffffff33',
    nameTS: TS({ size: 34, weight: 800, font: 'Inter' }),
    dateTS: TS({ size: 20, weight: 700, font: 'Inter', transform: 'upper', spacing: 1.5, role: 'accent', color: '@accent' }),
    valueTS: TS({ size: 34, weight: 700, font: 'Inter' }),
    unitTS: TS({ size: 17, weight: 600, font: 'Inter', role: 'muted', color: '@muted' }),
    labelTS: TS({ size: 14, weight: 700, font: 'Inter', role: 'muted', color: '@muted', transform: 'upper', spacing: 1.5 }),
  }),
  render(ctx, el, W, H, env) {
    const p = el.props, S = env.multi; if (!S || !S.list.length) return;
    const list = S.list, n = list.length, P = progOf(el, env);
    const hlRun = p.hlMode === 'longest' ? S.longest : p.hlMode === 'fastest' ? S.fastest : null;
    const design = p.design;
    const cols = design === 'grid' ? Math.max(1, Math.min(p.cols, n)) : 1;
    const rows = Math.ceil(n / cols);
    const tlW = design === 'timeline' ? Math.max(measureStr(ctx, 'WED', p.dateTS) + 40, W * 0.14) : 0;
    const cw = (W - tlW - p.gap * (cols - 1)) / cols, ch = (H - p.gap * (rows - 1)) / rows;
    if (design === 'timeline') { ctx.save(); ctx.strokeStyle = col(p.lineColor, env); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tlW - 22, ch / 2); ctx.lineTo(tlW - 22, H - ch / 2); ctx.stroke(); ctx.restore(); }
    list.forEach((a, i) => {
      const f = P >= 1 ? 1 : EASE.outCubic(clamp(P * n * 1.15 - i * 0.9, 0, 1)); if (f <= 0) return;
      const x = tlW + (i % cols) * (cw + p.gap), y = Math.floor(i / cols) * (ch + p.gap);
      const routeCol = p.palette ? PAL[i % PAL.length] : col(p.routeColor, env);
      ctx.save(); ctx.globalAlpha *= Math.min(1, f * 1.6); ctx.translate((1 - f) * 40, 0);
      if (design === 'timeline') {
        ctx.save(); ctx.fillStyle = a === hlRun ? col(p.hlColor, env) : col(p.accent, env); ctx.beginPath(); ctx.arc(tlW - 22, y + ch / 2, 10, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        drawText(ctx, DAYS[a.start.getDay()], tlW - 46, y + ch / 2 + p.dateTS.size * 0.35, p.dateTS, env, 'right');
      }
      if (p.cardBg) { ctx.fillStyle = col(p.cardBg, env); rrect(ctx, x, y, cw, ch, p.radius); ctx.fill(); }
      if (a === hlRun && p.hlColor) { ctx.save(); ctx.strokeStyle = col(p.hlColor, env); ctx.lineWidth = 3; rrect(ctx, x + 1.5, y + 1.5, cw - 3, ch - 3, p.radius); ctx.stroke(); ctx.restore(); }
      if (p.accentBar && design !== 'grid') { ctx.save(); ctx.fillStyle = col(p.accent, env); rrect(ctx, x, y + p.radius * 0.6, 6, ch - p.radius * 1.2, 3); ctx.fill(); ctx.restore(); }
      const pad = Math.min(p.pad, ch * 0.16, cw * 0.1);
      const nameS = a.name, dateS = dayLabel(a, design === 'timeline' && p.dateStyle === 'dayDate' ? 'short' : p.dateStyle);
      if (design === 'grid') {
        // route on top, then name/date, then stats (2 per row)
        const half = Math.ceil((p.fields || []).length / 2);
        const sub = { ...p, fields: (p.fields || []).slice(0, half) }, sub2 = { ...p, fields: (p.fields || []).slice(half) };
        let need = (p.showName ? textBox(ctx, 'Ag', p.nameTS).h + 10 : 0) + (p.showDate ? textBox(ctx, 'A', p.dateTS).h + 14 : 0) + statRowH(ctx, p, 1) * (sub2.fields.length ? 2 : 1) + 20;
        const routeH = p.showRoute ? Math.max(0, ch - 2 * pad - need - 14) : 0;
        const k = Math.min(clamp((ch - 2 * pad - (p.showRoute ? Math.min(routeH, cw * 0.3) + 14 : 0)) / need, 0.45, 1.5), fitK(ctx, sub, list, (cw - 2 * pad) / Math.max(1, sub.fields.length), env.units));
        let yy = y + pad;
        if (p.showRoute && routeH > 30) { if (p.routeBg) { ctx.fillStyle = col(p.routeBg, env); rrect(ctx, x + pad, yy, cw - 2 * pad, routeH, p.radius * 0.6); ctx.fill(); } drawRoute(ctx, a, x + pad + 10, yy + 10, cw - 2 * pad - 20, routeH - 20, routeCol, p.routeWidth, p.routeGlow, f); yy += routeH + 14; }
        if (p.showDate) { const b = textBox(ctx, dateS, scaleTS(p.dateTS, k)); drawText(ctx, dateS, x + pad, yy + b.asc, scaleTS(p.dateTS, k), env); yy += b.h + 10 * k; }
        if (p.showName) { const t = scaleTS(p.nameTS, k); const b = textBox(ctx, nameS, t); drawText(ctx, fitStr(ctx, nameS, t, cw - 2 * pad), x + pad, yy + b.asc, t, env); yy += b.h + 14 * k; }
        yy += statRow(ctx, sub, a, x + pad, yy, cw - 2 * pad, k, env, 'left') + 12 * k;
        if (sub2.fields.length) statRow(ctx, sub2, a, x + pad, yy, cw - 2 * pad, k, env, 'left');
      } else {
        // list / timeline / compact: route square on the left, name + date top, stats row bottom
        const compact = design === 'compact';
        const rs = p.showRoute ? ch - 2 * pad : 0;
        const tx = x + pad + (p.accentBar ? 8 : 0) + (rs > 20 ? rs + pad : 0), tw = x + cw - pad - tx;
        if (rs > 20) { if (p.routeBg) { ctx.fillStyle = col(p.routeBg, env); rrect(ctx, x + pad + (p.accentBar ? 8 : 0), y + pad, rs, rs, p.radius * 0.6); ctx.fill(); } drawRoute(ctx, a, x + pad + (p.accentBar ? 8 : 0) + 8, y + pad + 8, rs - 16, rs - 16, routeCol, p.routeWidth, p.routeGlow, f); }
        const headH = (p.showName ? textBox(ctx, 'Ag', p.nameTS).h : 0) + (p.showDate ? textBox(ctx, 'A', p.dateTS).h + 8 : 0);
        if (compact) {
          // one line: date · name on the left, stats on the right
          const sw = tw * 0.64;
          const k = Math.min(clamp((ch - 2 * pad) / Math.max(headH, statRowH(ctx, p, 1)), 0.4, 1.4), fitK(ctx, p, list, sw / Math.max(1, (p.fields || []).length), env.units));
          let yy = y + (ch - headH * k) / 2;
          if (p.showDate) { const t = scaleTS(p.dateTS, k), b = textBox(ctx, dateS, t); drawText(ctx, dateS, tx, yy + b.asc, t, env); yy += b.h + 8 * k; }
          if (p.showName) { const t = scaleTS(p.nameTS, k), b = textBox(ctx, nameS, t); drawText(ctx, fitStr(ctx, nameS, t, tw - sw - 20), tx, yy + b.asc, t, env); }
          statRow(ctx, p, a, x + cw - pad - sw, y + (ch - statRowH(ctx, p, k)) / 2, sw, k, env);
        } else {
          const need = headH + 14 + statRowH(ctx, p, 1);
          const k = Math.min(clamp((ch - 2 * pad) / need, 0.4, 1.8), fitK(ctx, p, list, tw / Math.max(1, (p.fields || []).length), env.units));
          let yy = y + pad;
          const kh = clamp((ch - 2 * pad - statRowH(ctx, p, k) - 16) / Math.max(1, headH), k, 1.9); // header can grow into spare room
          if (p.showDate) { const t = scaleTS(p.dateTS, kh), b = textBox(ctx, dateS, t); drawText(ctx, dateS, tx, yy + b.asc, t, env); yy += b.h + 8 * kh; }
          if (p.showName) { const t = scaleTS(p.nameTS, kh), b = textBox(ctx, nameS, t); drawText(ctx, fitStr(ctx, nameS, t, tw), tx, yy + b.asc, t, env); }
          statRow(ctx, p, a, tx, y + ch - pad - statRowH(ctx, p, k), tw, k, env, 'left');
        }
      }
      ctx.restore();
    });
  },
  schema: () => [
    { title: 'Run cards', fields: [
      { k: 'props.design', t: 'seg', label: 'Layout', options: [['list', 'List'], ['grid', 'Grid'], ['timeline', 'Timeline'], ['compact', 'Compact']] },
      { k: 'props.cols', t: 'range', label: 'Columns', min: 1, max: 4, when: (e) => e.props.design === 'grid' },
      { k: 'props.fields', t: 'multi', label: 'Stats on each card', options: CARD_FIELDS },
      { k: 'props.statLabels', t: 'toggle', label: 'Stat labels', half: true }, { k: 'props.showUnits', t: 'toggle', label: 'Units', half: true },
      { k: 'props.showName', t: 'toggle', label: 'Run name', half: true }, { k: 'props.showDate', t: 'toggle', label: 'Date', half: true },
      { k: 'props.dateStyle', t: 'select', label: 'Date format', options: [['dayDate', 'Mon · 18 Oct'], ['weekday', 'Mon'], ['short', '18 Oct'], ['medium', '18 Oct 2026'], ['numeric', '18/10/2026']] },
      { k: 'props.hlMode', t: 'seg', label: 'Highlight', options: [['longest', 'Longest'], ['fastest', 'Fastest'], ['none', 'None']] },
    ] },
    { title: 'Route', fields: [
      { k: 'props.showRoute', t: 'toggle', label: 'Show route' }, { k: 'props.routeColor', t: 'color', label: 'Route color' }, { k: 'props.palette', t: 'toggle', label: 'Different color per run' },
      { k: 'props.routeWidth', t: 'range', label: 'Line width', min: 1, max: 14, step: 0.5 }, { k: 'props.routeGlow', t: 'range', label: 'Glow', min: 0, max: 30 }, { k: 'props.routeBg', t: 'color', label: 'Route background' },
    ] },
    { title: 'Card style', fields: [
      { k: 'props.cardBg', t: 'color', label: 'Card color' }, { k: 'props.radius', t: 'range', label: 'Radius', min: 0, max: 60 }, { k: 'props.gap', t: 'range', label: 'Gap', min: 0, max: 60 }, { k: 'props.pad', t: 'range', label: 'Padding', min: 4, max: 60 },
      { k: 'props.accentBar', t: 'toggle', label: 'Accent bar' }, { k: 'props.accent', t: 'color', label: 'Accent' }, { k: 'props.hlColor', t: 'color', label: 'Highlight color' }, { k: 'props.lineColor', t: 'color', label: 'Timeline line', when: (e) => e.props.design === 'timeline' },
    ] },
    { title: 'Name text', ts: 'props.nameTS' }, { title: 'Date text', ts: 'props.dateTS' }, { title: 'Value text', ts: 'props.valueTS' }, { title: 'Unit text', ts: 'props.unitTS' }, { title: 'Label text', ts: 'props.labelTS' },
  ],
});

function fitStr(ctx, s, ts, w) {
  if (measureStr(ctx, s, ts) <= w) return s;
  let t = s; while (t.length > 1 && measureStr(ctx, t + '…', ts) > w) t = t.slice(0, -1);
  return t + '…';
}
