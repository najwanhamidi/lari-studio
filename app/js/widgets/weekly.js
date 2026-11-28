// Weekly (training block) widgets: distance per week, week table, week cards, phase timeline, heatmap, legend.
import { register, progOf } from './core.js';
import { TS, drawText, textBox, col, rrect, measureStr, drawIcon, luma } from '../render/draw.js';
import { tableProps, tableLayout, drawTable, TABLE_SCHEMA } from './table.js';
import { fmtPace, fmtDuration, fmtDist, fmtInt, fmtElev, fmtDate, isNum, clamp, distUnit, paceUnit, elevUnit, DAYS, EASE, rampColor, parseAxisVal, axisHint } from '../util.js';
import { PHASES } from '../data/weekly.js';

export const WMETRICS = [['distance', 'Distance'], ['time', 'Time'], ['runs', 'Runs'], ['ascent', 'Elevation'], ['longest', 'Longest run'], ['avgPace', 'Avg pace']];
const vOf = (w, m) => ({ distance: w.distance, time: w.time, runs: w.count, ascent: w.ascent, longest: w.longest ? w.longest.distance : 0, avgPace: w.avgPace }[m]);
function fmtV(m, v, units, p) {
  if (!isNum(v)) return '';
  switch (m) {
    case 'time': return fmtDuration(v, 'hm').replace(/^0h /, '');
    case 'runs': return String(v);
    case 'ascent': return fmtElev(v, units);
    case 'avgPace': return fmtPace(v, units);
    default: return fmtDist(v, units, p && isNum(p.decimals) ? p.decimals : 1);
  }
}
const unitOf = (m, u) => ({ distance: distUnit(u), longest: distUnit(u), ascent: elevUnit(u), avgPace: paceUnit(u), runs: 'runs', time: '' }[m] || '');
const axisKind = (m) => ({ distance: 'dist', longest: 'dist', time: 'time', ascent: 'ele', avgPace: 'pace' }[m] || 'num');
function weekLabel(w, mode) {
  if (mode === 'name') return w.label;
  if (mode === 'date') return w.start ? fmtDate(w.start, 'short') : w.short;
  if (mode === 'phase') return w.phaseName;
  if (mode === 'none') return '';
  return 'W' + w.n;
}
const reveal = (P, i, n) => (P >= 1 ? 1 : EASE.outCubic(clamp(P * n * 1.1 - i, 0, 1)));
const ink = (c) => (luma(c) > 0.55 ? '#0d0f14' : '#ffffff');
const fillOf = (p, w, S, env) => {
  if (p.colorBy === 'phase') return col(w.color, env);
  if (p.colorBy === 'ramp') return rampColor(['#22d3ee', '#a3e635', '#f97316', '#ef4444'], S.maxDist > 0 ? w.distance / S.maxDist : 0);
  return col(p.color, env);
};
// group consecutive weeks with the same phase label
function phaseGroups(weeks) {
  const g = [];
  weeks.forEach((w, i) => { const last = g[g.length - 1]; if (last && last.name === w.phaseName && last.color === w.color) last.to = i; else g.push({ name: w.phaseName, color: w.color, key: w.phase, from: i, to: i }); });
  return g;
}

// ---------- Weekly distance chart ----------
register({
  type: 'wchart', name: 'Weekly distance', auto: false, w: 940, h: 520, modes: ['weekly'],
  props: () => ({
    metric: 'distance', design: 'bars', colorBy: 'phase', color: '@accent', track: '#ffffff14', radius: 12, gap: 0.28, lineW: 5,
    showValues: true, valueUnit: false, decimals: 1, weekLabels: 'num', phaseLabels: 'group', hlPeak: true, hlColor: '#ffffff',
    refLine: 'avg', refValue: '', refColor: '#ffffffaa', showY: false, yTicks: 4, gridColor: '#ffffff1f', yMin: '', yMax: '',
    valueTS: TS({ size: 24, weight: 800, font: 'Inter' }), labelTS: TS({ size: 20, weight: 700, font: 'Inter', role: 'muted', color: '@muted' }),
    phaseTS: TS({ size: 18, weight: 800, font: 'Inter', transform: 'upper', spacing: 1 }), axisTS: TS({ size: 18, weight: 600, font: 'Inter', role: 'muted', color: '@muted' }),
  }),
  render(ctx, el, W, H, env) {
    const p = el.props, S = env.weekly; if (!S || !S.weeks.length) return;
    const weeks = S.weeks, n = weeks.length, P = progOf(el, env), m = p.metric;
    const vals = weeks.map((w) => vOf(w, m));
    const ak = axisKind(m), cMin = parseAxisVal(p.yMin, ak, env.units), cMax = parseAxisVal(p.yMax, ak, env.units);
    const finite = vals.filter((v) => isNum(v) && v > 0);
    const autoMax = finite.length ? Math.max(...finite) : 1;
    let lo = isNum(cMin) ? cMin : m === 'avgPace' && finite.length ? Math.min(...finite) * 0.9 : 0;
    let hi = isNum(cMax) && cMax > lo ? cMax : (m === 'avgPace' && finite.length ? Math.max(...finite) * 1.05 : autoMax * 1.04);
    const nv = (v) => (m === 'avgPace' ? clamp((hi - v) / ((hi - lo) || 1), 0, 1) * 0.85 + 0.15 : clamp((v - lo) / ((hi - lo) || 1), 0, 1));
    const peakI = vals.indexOf(autoMax);
    if (p.design === 'hbars') { drawH(ctx, p, S, W, H, env, P, vals, nv, peakI); return; }
    const showPh = p.phaseLabels !== 'none';
    const valH = p.showValues ? p.valueTS.size * 1.5 + (p.hlPeak ? p.valueTS.size * 1.1 : 0) : (p.hlPeak ? p.valueTS.size * 1.2 : 6);
    const labH = p.weekLabels !== 'none' ? p.labelTS.size * 1.7 : 0, phH = showPh ? p.phaseTS.size * 2.1 : 0;
    const yLabW = p.showY ? Math.max(measureStr(ctx, fmtV(m, hi, env.units, p), p.axisTS), measureStr(ctx, fmtV(m, lo, env.units, p), p.axisTS)) + 14 : 0;
    const px0 = yLabW, pw = W - px0, ch = Math.max(10, H - valH - labH - phH), base = valH + ch;
    const cw = pw / n, bw = Math.max(2, cw * (1 - p.gap));
    const Y = (v) => base - nv(v) * ch;
    // grid / y labels
    if (p.showY) for (let k = 0; k < p.yTicks; k++) {
      const v = lo + (hi - lo) * (k / (p.yTicks - 1)), y = m === 'avgPace' ? base - (k / (p.yTicks - 1)) * ch : Y(v);
      ctx.save(); ctx.strokeStyle = col(p.gridColor, env); ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.restore();
      drawText(ctx, fmtV(m, m === 'avgPace' ? hi - (hi - lo) * (k / (p.yTicks - 1)) : v, env.units, { ...p, decimals: 0 }), px0 - 10, y + p.axisTS.size * 0.35, p.axisTS, env, 'right');
    }
    const pts = [];
    weeks.forEach((w, i) => {
      const f = reveal(P, i, n), v = vals[i], x = px0 + i * cw + (cw - bw) / 2, c = fillOf(p, w, S, env);
      const has = isNum(v) && v > 0;
      const h = has ? (base - Y(v)) * f : 0;
      if (p.design === 'bars' || p.design === 'pills' || p.design === 'stacked') {
        if (p.design === 'pills') { ctx.fillStyle = col(p.track, env); rrect(ctx, x, valH, bw, ch, Math.min(p.radius, bw / 2)); ctx.fill(); }
        if (has && h > 0) {
          if (p.design === 'stacked' && w.runs.length && m === 'distance') {
            let y = base; const g = Math.max(2, ch * 0.006);
            ctx.save(); ctx.beginPath(); rrect(ctx, x, base - h, bw, h, Math.min(p.radius, bw / 2)); ctx.clip();
            w.runs.forEach((r, k) => { const rh = (r.distance / w.distance) * h; ctx.fillStyle = c; ctx.globalAlpha = 0.55 + 0.45 * ((k % 2) ? 0.6 : 1); ctx.fillRect(x, y - rh + g / 2, bw, Math.max(1, rh - g)); y -= rh; });
            ctx.restore();
          } else { ctx.fillStyle = c; rrect(ctx, x, base - h, bw, Math.max(h, 2), Math.min(p.radius, bw / 2)); ctx.fill(); }
        } else if (!has) { ctx.fillStyle = col(p.track, env); ctx.beginPath(); ctx.arc(x + bw / 2, base - 6, Math.min(6, bw / 3), 0, Math.PI * 2); ctx.fill(); }
      } else if (p.design === 'lollipop') {
        if (has && f > 0) { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = Math.max(3, bw * 0.12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + bw / 2, base); ctx.lineTo(x + bw / 2, base - h); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + bw / 2, base - h, Math.min(bw / 2, 20), 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      }
      pts.push({ x: x + bw / 2, y: base - h, v, has, f, c, i, x0: px0 + i * cw, x1: px0 + (i + 1) * cw });
    });
    if (/area|line|step/.test(p.design)) {
      const vis = pts.filter((q) => q.f > 0);
      if (vis.length) {
        ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        const path = () => { ctx.beginPath(); vis.forEach((q, k) => { if (p.design === 'step') { if (!k) ctx.moveTo(q.x0, q.y); else ctx.lineTo(q.x0, q.y); ctx.lineTo(q.x1, q.y); } else (k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); }); };
        if (p.design !== 'line') {
          path(); const lx = p.design === 'step' ? vis[vis.length - 1].x1 : vis[vis.length - 1].x, fx = p.design === 'step' ? vis[0].x0 : vis[0].x;
          ctx.lineTo(lx, base); ctx.lineTo(fx, base); ctx.closePath();
          const g = ctx.createLinearGradient(0, valH, 0, base); const c0 = p.colorBy === 'phase' ? col(p.color, env) : vis[0].c;
          g.addColorStop(0, c0); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= 0.45; ctx.fillStyle = g; ctx.fill(); ctx.globalAlpha /= 0.45;
          if (p.colorBy === 'phase' && p.design === 'step') vis.forEach((q) => { ctx.save(); ctx.globalAlpha *= 0.35; ctx.fillStyle = q.c; ctx.fillRect(q.x0, q.y, q.x1 - q.x0, base - q.y); ctx.restore(); });
        }
        path(); ctx.strokeStyle = col(p.color, env); ctx.lineWidth = p.lineW; ctx.stroke();
        if (p.design !== 'step') vis.forEach((q) => { ctx.fillStyle = q.has ? q.c : col(p.track, env); ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(6, p.lineW * 1.6), 0, Math.PI * 2); ctx.fill(); });
        ctx.restore();
      }
    }
    // reference line (average or target)
    if (p.refLine !== 'none') {
      const rv = p.refLine === 'avg' ? (m === 'distance' ? S.avgWeek : finite.reduce((a, b) => a + b, 0) / (finite.length || 1)) : parseAxisVal(p.refValue, ak, env.units);
      if (isNum(rv) && rv > 0) {
        const y = Y(rv);
        ctx.save(); ctx.strokeStyle = col(p.refColor, env); ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.restore();
        const t = (p.refLine === 'avg' ? 'AVG ' : 'TARGET ') + fmtV(m, rv, env.units, p);
        drawText(ctx, t, W, y - 8, { ...p.axisTS, color: p.refColor }, env, 'right');
      }
    }
    // values + peak
    pts.forEach((q) => {
      if (!q.has || q.f < 0.6) return;
      const a = clamp((q.f - 0.6) / 0.4, 0, 1);
      let y = q.y - p.valueTS.size * 0.5;
      if (p.design === 'lollipop') y -= Math.min(bw / 2, 20);
      if (p.showValues) { drawText(ctx, fmtV(m, q.v, env.units, p) + (p.valueUnit ? ' ' + unitOf(m, env.units) : ''), q.x, y, { ...p.valueTS, opacity: (p.valueTS.opacity ?? 1) * a }, env, 'center'); y -= p.valueTS.size * 1.2; }
      if (p.hlPeak && q.i === peakI) drawIcon(ctx, 'trophy', q.x - p.valueTS.size * 0.45, y - p.valueTS.size * 0.85, p.valueTS.size * 0.9, col(p.hlColor, env), { stroke: 2.2 });
    });
    // week labels
    if (labH) weeks.forEach((w, i) => { const t = weekLabel(w, p.weekLabels); if (t) drawText(ctx, fitTxt(ctx, t, p.labelTS, cw * 1.05), px0 + i * cw + cw / 2, base + p.labelTS.size * 1.3, p.labelTS, env, 'center'); });
    // phase labels
    if (showPh) {
      const y0 = base + labH + p.phaseTS.size * 0.25, bh = p.phaseTS.size * 1.6;
      const items = p.phaseLabels === 'each' ? weeks.map((w, i) => ({ name: w.phaseName, color: w.color, from: i, to: i })) : phaseGroups(weeks);
      items.forEach((g) => {
        const f = reveal(P, g.from, n); if (f <= 0) return;
        const x0 = px0 + g.from * cw + 3, x1 = px0 + (g.to + 1) * cw - 3, c = col(g.color, env);
        ctx.save(); ctx.globalAlpha *= f; ctx.fillStyle = c; rrect(ctx, x0, y0, x1 - x0, bh, bh / 2); ctx.fill(); ctx.restore();
        const t = fitTxt(ctx, g.name, p.phaseTS, x1 - x0 - 10);
        if (t) drawText(ctx, t, (x0 + x1) / 2, y0 + bh / 2 + p.phaseTS.size * 0.36, { ...p.phaseTS, color: ink(c), opacity: f, shadow: false }, env, 'center');
      });
    }
  },
  schema: (el, env) => [
    { title: 'Chart', fields: [
      { k: 'props.metric', t: 'select', label: 'Show per week', options: WMETRICS },
      { k: 'props.design', t: 'select', label: 'Design', options: [['bars', 'Bars'], ['pills', 'Pills with track'], ['stacked', 'Stacked runs'], ['lollipop', 'Lollipop'], ['area', 'Area'], ['line', 'Line'], ['step', 'Steps'], ['hbars', 'Horizontal bars']] },
      { k: 'props.colorBy', t: 'seg', label: 'Colour', options: [['phase', 'By phase'], ['solid', 'One colour'], ['ramp', 'By distance']] },
      { k: 'props.color', t: 'color', label: 'Colour / line' }, { k: 'props.track', t: 'color', label: 'Track / empty week' },
      { k: 'props.radius', t: 'range', label: 'Radius', min: 0, max: 60 }, { k: 'props.gap', t: 'range', label: 'Gap', min: 0, max: 0.8, step: 0.02 }, { k: 'props.lineW', t: 'range', label: 'Line width', min: 1, max: 16, when: (e) => /area|line|step/.test(e.props.design) },
    ] },
    { title: 'Labels', fields: [
      { k: 'props.showValues', t: 'toggle', label: 'Value on each week', half: true }, { k: 'props.valueUnit', t: 'toggle', label: 'With unit', half: true },
      { k: 'props.decimals', t: 'range', label: 'Decimals', min: 0, max: 2 },
      { k: 'props.weekLabels', t: 'select', label: 'Week labels', options: [['num', 'W1, W2…'], ['name', 'Week name'], ['date', 'Start date'], ['phase', 'Phase'], ['none', 'None']] },
      { k: 'props.phaseLabels', t: 'seg', label: 'Phase labels', options: [['group', 'Grouped'], ['each', 'Every week'], ['none', 'None']] },
      { k: 'props.hlPeak', t: 'toggle', label: 'Trophy on peak week' }, { k: 'props.hlColor', t: 'color', label: 'Trophy colour', when: (e) => e.props.hlPeak },
    ] },
    { title: 'Axes & lines', fields: [
      { k: 'props.refLine', t: 'seg', label: 'Reference line', options: [['avg', 'Average'], ['target', 'Target'], ['none', 'None']] },
      { k: 'props.refValue', t: 'text', label: 'Target value', placeholder: 'e.g. 50', when: (e) => e.props.refLine === 'target' }, { k: 'props.refColor', t: 'color', label: 'Line colour', when: (e) => e.props.refLine !== 'none' },
      { k: 'props.showY', t: 'toggle', label: 'Y axis labels' }, { k: 'props.yTicks', t: 'range', label: 'Y ticks', min: 2, max: 8, when: (e) => e.props.showY }, { k: 'props.gridColor', t: 'color', label: 'Grid colour', when: (e) => e.props.showY },
      { k: 'yrange', t: 'axis', label: 'Value axis range', kMin: 'props.yMin', kMax: 'props.yMax', minLabel: 'Min', maxLabel: 'Max', hint: `In ${axisHint(axisKind(el.props.metric), env && env.units)}. Blank = automatic. A fixed max keeps different blocks on the same scale.` },
    ] },
    { title: 'Value text', ts: 'props.valueTS' }, { title: 'Week label text', ts: 'props.labelTS' }, { title: 'Phase label text', ts: 'props.phaseTS' }, { title: 'Axis text', ts: 'props.axisTS' },
  ],
});
function drawH(ctx, p, S, W, H, env, P, vals, nv, peakI) {
  const weeks = S.weeks, n = weeks.length, m = p.metric;
  const rh = H / n, bh = rh * (1 - p.gap);
  const lw = p.weekLabels !== 'none' ? Math.max(...weeks.map((w) => measureStr(ctx, weekLabel(w, p.weekLabels), p.labelTS))) + 18 : 0;
  const phw = p.phaseLabels !== 'none' ? Math.max(...weeks.map((w) => measureStr(ctx, w.phaseName, p.phaseTS))) + p.phaseTS.size * 1.6 : 0;
  const vw = p.showValues ? Math.max(...weeks.map((w, i) => measureStr(ctx, fmtV(m, vals[i], env.units, p) + (p.valueUnit ? ' ' + unitOf(m, env.units) : ''), p.valueTS))) + 18 : 0;
  const bx = lw + phw, bwMax = Math.max(10, W - bx - vw);
  weeks.forEach((w, i) => {
    const f = reveal(P, i, n), y = i * rh + (rh - bh) / 2, v = vals[i], c = fillOf(p, w, S, env), has = isNum(v) && v > 0;
    if (lw) drawText(ctx, weekLabel(w, p.weekLabels), 0, y + bh / 2 + p.labelTS.size * 0.35, p.labelTS, env);
    if (phw) { const ph = p.phaseTS.size * 1.45, tw = measureStr(ctx, w.phaseName, p.phaseTS) + p.phaseTS.size; ctx.fillStyle = col(w.color, env); rrect(ctx, lw, y + (bh - ph) / 2, tw, ph, ph / 2); ctx.fill(); drawText(ctx, w.phaseName, lw + p.phaseTS.size / 2, y + bh / 2 + p.phaseTS.size * 0.36, { ...p.phaseTS, color: ink(col(w.color, env)), shadow: false }, env); }
    ctx.fillStyle = col(p.track, env); rrect(ctx, bx, y, bwMax, bh, Math.min(p.radius, bh / 2)); ctx.fill();
    if (has) { ctx.fillStyle = c; rrect(ctx, bx, y, Math.max(bh * 0.5, bwMax * nv(v) * f), bh, Math.min(p.radius, bh / 2)); ctx.fill(); }
    if (p.showValues && has && f > 0.4) drawText(ctx, fmtV(m, v, env.units, p) + (p.valueUnit ? ' ' + unitOf(m, env.units) : ''), W, y + bh / 2 + p.valueTS.size * 0.36, { ...p.valueTS, opacity: f }, env, 'right');
    if (p.hlPeak && i === peakI && f > 0.9) drawIcon(ctx, 'trophy', bx + bwMax * nv(v) - bh * 0.85, y + bh * 0.15, bh * 0.7, ink(c), { stroke: 2.2 });
  });
}
function fitTxt(ctx, s, ts, w) {
  if (measureStr(ctx, s, ts) <= w) return s;
  if (w < ts.size * 1.2) return '';
  let t = s; while (t.length > 1 && measureStr(ctx, t + '…', ts) > w) t = t.slice(0, -1);
  return t.length > 1 ? t + '…' : s[0];
}

// ---------- Week table ----------
export const WEEK_COLS = [['week', 'Week'], ['phase', 'Phase'], ['dates', 'Dates'], ['dist', 'Distance'], ['runs', 'Runs'], ['time', 'Time'], ['pace', 'Avg pace'], ['hr', 'Avg HR'], ['elev', 'Elev gain'], ['long', 'Longest'], ['change', 'Change'], ['bar', 'Distance bar']];
function weekRows(el, env, all) {
  const p = el.props, S = env.weekly; if (!S) return [];
  const P = all ? 1 : progOf(el, env), n = S.weeks.length, u = env.units;
  return S.weeks.map((w, i) => ({
    cells: {
      week: w.label, phase: w.phaseName, dates: w.start ? `${fmtDate(w.start, 'short')} – ${fmtDate(w.end, 'short')}` : '—',
      dist: w.empty ? '—' : fmtDist(w.distance, u, p.decimals ?? 1) + (p.units ? ' ' + distUnit(u) : ''), runs: String(w.count), time: w.empty ? '—' : fmtDuration(w.time, 'hm').replace(/^0h /, ''),
      pace: fmtPace(w.avgPace, u), hr: fmtInt(w.avgHr), elev: fmtElev(w.ascent, u), long: w.longest ? fmtDist(w.longest.distance, u, 1) : '—',
      change: isNum(w.change) ? (w.change >= 0 ? '+' : '−') + Math.floor(Math.abs(w.change) * 100) + '%' : '',
    },
    colors: { phase: w.color }, bar: S.maxDist > 0 ? w.distance / S.maxDist : 0, barColor: p.barByPhase ? w.color : null,
    hl: p.hlPeak && w === S.peak ? 'fast' : null, alpha: reveal(P, i, n), dim: w.empty,
  }));
}
function weekCols(el) {
  const p = el.props;
  return p.columns.filter((c) => c.on).map((c) => ({ key: c.k, label: c.label || ({ week: 'Week', phase: 'Phase', dates: 'Dates', dist: 'Dist', runs: 'Runs', time: 'Time', pace: 'Pace', hr: 'HR', elev: 'Elev', long: 'Long', change: '+/−', bar: '' }[c.k]), align: /week|phase|dates/.test(c.k) ? 'left' : 'right', bar: c.k === 'bar', pill: c.k === 'phase' && p.phasePills, ts: c.k === 'week' ? p.weekTS : undefined }));
}
register({
  type: 'wtable', name: 'Week table', auto: true, modes: ['weekly'],
  props: () => tableProps({
    design: 'striped', rowScale: 1.9, decimals: 1, units: false, phasePills: true, barByPhase: true, hlPeak: true, highlight: 'fastest',
    columns: WEEK_COLS.map(([k]) => ({ k, on: ['week', 'phase', 'dist', 'runs', 'time', 'pace', 'bar'].includes(k), label: '' })),
    weekTS: TS({ size: 28, weight: 800, font: 'Inter' }), cellTS: TS({ size: 28, weight: 600, font: 'Inter' }),
  }),
  measure(ctx, el, env) { const L = tableLayout(ctx, el.props, weekCols(el), weekRows(el, env, true)); return { w: L.w, h: L.h }; },
  render(ctx, el, W, H, env) { const p = el.props, cols = weekCols(el); const L = tableLayout(ctx, p, cols, weekRows(el, env, true)); L.list = weekRows(el, env, false).slice(0, L.list.length); drawTable(ctx, p, cols, L, env); },
  schema: () => [
    { title: 'Columns', fields: [{ k: 'props.columns', t: 'cols', label: 'Toggle, rename, reorder', options: WEEK_COLS }, { k: 'props.phasePills', t: 'toggle', label: 'Coloured phase pills' }, { k: 'props.barByPhase', t: 'toggle', label: 'Bars in phase colour' }, { k: 'props.hlPeak', t: 'toggle', label: 'Highlight peak week' }, { k: 'props.units', t: 'toggle', label: 'Unit after distance' }, { k: 'props.decimals', t: 'range', label: 'Decimals', min: 0, max: 2 }] },
    { title: 'Design', fields: TABLE_SCHEMA },
    { title: 'Week text', ts: 'props.weekTS' }, { title: 'Header text', ts: 'props.headerTS' }, { title: 'Cell text', ts: 'props.cellTS' },
  ],
});

// ---------- Week cards ----------
register({
  type: 'wcards', name: 'Week cards', auto: false, w: 940, h: 1100, modes: ['weekly'],
  props: () => ({
    cols: 2, design: 'grid', cardBg: '#ffffff12', radius: 22, gap: 16, pad: 22, band: 'left', showDays: true, showSub: true, showPhase: true, showDates: true, decimals: 1,
    nameTS: TS({ size: 24, weight: 800, font: 'Inter', transform: 'upper', spacing: 1.5 }), valueTS: TS({ size: 64, weight: 800, font: 'Inter' }),
    unitTS: TS({ size: 24, weight: 600, font: 'Inter', role: 'muted', color: '@muted' }), subTS: TS({ size: 18, weight: 600, font: 'Inter', role: 'muted', color: '@muted' }),
    phaseTS: TS({ size: 15, weight: 800, font: 'Inter', transform: 'upper', spacing: 1 }),
  }),
  render(ctx, el, W, H, env) {
    const p = el.props, S = env.weekly; if (!S) return;
    const weeks = S.weeks, n = weeks.length, P = progOf(el, env), u = env.units;
    const cols = p.design === 'list' ? 1 : Math.max(1, Math.min(p.cols, n)), rows = Math.ceil(n / cols);
    const cw = (W - p.gap * (cols - 1)) / cols, ch = (H - p.gap * (rows - 1)) / rows;
    const pad = Math.min(p.pad, ch * 0.14, cw * 0.1);
    // one text scale for all cards so they line up
    const natH = textBox(ctx, 'A', p.nameTS).h + 8 + textBox(ctx, '0', p.valueTS).h + (p.showSub ? textBox(ctx, '0', p.subTS).h + 10 : 0);
    const valW = Math.max(...weeks.map((w) => measureStr(ctx, fmtDist(w.distance, u, p.decimals), p.valueTS) + measureStr(ctx, distUnit(u), p.unitTS) + 8));
    const avail = p.design === 'list' ? cw - 2 * pad - (p.showDays ? cw * 0.3 : 0) - 10 : cw - 2 * pad;
    const k = clamp(Math.min((ch - 2 * pad - (p.design !== 'list' && p.showDays ? Math.min(ch * 0.3, 130) + 8 : 0)) / natH, avail / valW), 0.35, 1.6);
    const s = (ts) => ({ ...ts, size: ts.size * k });
    weeks.forEach((w, i) => {
      const f = reveal(P, i, n); if (f <= 0) return;
      const x = (i % cols) * (cw + p.gap), y = Math.floor(i / cols) * (ch + p.gap), c = col(w.color, env);
      ctx.save(); ctx.globalAlpha *= Math.min(1, f * 1.5); ctx.translate(0, (1 - f) * 30);
      if (p.cardBg) { ctx.fillStyle = col(p.cardBg, env); rrect(ctx, x, y, cw, ch, p.radius); ctx.fill(); }
      if (p.band === 'left') { ctx.fillStyle = c; rrect(ctx, x, y + p.radius * 0.5, 7, ch - p.radius, 3); ctx.fill(); }
      else if (p.band === 'top') { ctx.save(); ctx.beginPath(); rrect(ctx, x, y, cw, ch, p.radius); ctx.clip(); ctx.fillStyle = c; ctx.fillRect(x, y, cw, Math.max(8, ch * 0.05)); ctx.restore(); }
      else if (p.band === 'fill') { ctx.save(); ctx.globalAlpha *= 0.22; ctx.fillStyle = c; rrect(ctx, x, y, cw, ch, p.radius); ctx.fill(); ctx.restore(); }
      const lx = x + pad + (p.band === 'left' ? 8 : 0);
      let yy = y + pad + (p.band === 'top' ? ch * 0.05 : 0);
      const nb = textBox(ctx, w.label, s(p.nameTS));
      drawText(ctx, w.label + (p.showDates && w.start && p.design === 'list' ? '  ·  ' + fmtDate(w.start, 'short') : ''), lx, yy + nb.asc, s(p.nameTS), env);
      if (p.showPhase) { const pt = s(p.phaseTS), tw = measureStr(ctx, w.phaseName, pt) + pt.size, ph = pt.size * 1.6, px = x + cw - pad - tw; ctx.fillStyle = c; rrect(ctx, px, yy + nb.asc / 2 - ph / 2, tw, ph, ph / 2); ctx.fill(); drawText(ctx, w.phaseName, px + pt.size / 2, yy + nb.asc / 2 + pt.size * 0.36, { ...pt, color: ink(c), shadow: false }, env); }
      yy += nb.h + 8 * k;
      const vt = s(p.valueTS), vb = textBox(ctx, '0', vt), vs = w.empty ? '—' : fmtDist(w.distance * f, u, p.decimals);
      drawText(ctx, vs, lx, yy + vb.asc, vt, env);
      if (!w.empty) drawText(ctx, distUnit(u), lx + measureStr(ctx, vs, vt) + 8 * k, yy + vb.asc, s(p.unitTS), env);
      yy += vb.h + 10 * k;
      if (p.showSub) { const st = s(p.subTS); drawText(ctx, w.empty ? 'No runs' : `${w.count} run${w.count === 1 ? '' : 's'} · ${fmtDuration(w.time, 'hm').replace(/^0h /, '')} · ${fmtPace(w.avgPace, u)}${paceUnit(u)}`, lx, yy + textBox(ctx, '0', st).asc, st, env); }
      if (p.showDays) {
        const max = Math.max(1, ...weeks.map((q) => Math.max(...q.days)));
        const box = p.design === 'list' ? { x: x + cw - pad - cw * 0.3, y: y + ch * 0.42, w: cw * 0.3, h: ch * 0.5 - pad } : { x: lx, y: y + ch - pad - Math.min(ch * 0.3, 130), w: x + cw - pad - lx, h: Math.min(ch * 0.3, 130) };
        const dw = box.w / 7;
        w.days.forEach((d, j) => { const hh = d > 0 ? Math.max(4, (d / max) * box.h) : 3; ctx.fillStyle = d > 0 ? c : col('#ffffff22', env); rrect(ctx, box.x + j * dw + dw * 0.18, box.y + box.h - hh, dw * 0.64, hh, Math.min(4, dw * 0.2)); ctx.fill(); });
      }
      ctx.restore();
    });
  },
  schema: () => [
    { title: 'Week cards', fields: [
      { k: 'props.design', t: 'seg', label: 'Layout', options: [['grid', 'Grid'], ['list', 'List']] }, { k: 'props.cols', t: 'range', label: 'Columns', min: 1, max: 6, when: (e) => e.props.design === 'grid' },
      { k: 'props.band', t: 'seg', label: 'Phase colour', options: [['left', 'Side bar'], ['top', 'Top band'], ['fill', 'Tint'], ['none', 'None']] },
      { k: 'props.showPhase', t: 'toggle', label: 'Phase pill', half: true }, { k: 'props.showDays', t: 'toggle', label: 'Daily mini bars', half: true },
      { k: 'props.showSub', t: 'toggle', label: 'Runs · time · pace', half: true }, { k: 'props.showDates', t: 'toggle', label: 'Dates (list)', half: true },
      { k: 'props.decimals', t: 'range', label: 'Decimals', min: 0, max: 2 },
      { k: 'props.cardBg', t: 'color', label: 'Card colour' }, { k: 'props.radius', t: 'range', label: 'Radius', min: 0, max: 60 }, { k: 'props.gap', t: 'range', label: 'Gap', min: 0, max: 60 }, { k: 'props.pad', t: 'range', label: 'Padding', min: 4, max: 60 },
    ] },
    { title: 'Week name text', ts: 'props.nameTS' }, { title: 'Distance text', ts: 'props.valueTS' }, { title: 'Unit text', ts: 'props.unitTS' }, { title: 'Detail text', ts: 'props.subTS' }, { title: 'Phase text', ts: 'props.phaseTS' },
  ],
});

// ---------- Phase timeline ----------
register({
  type: 'wphase', name: 'Phase timeline', auto: false, w: 940, h: 220, modes: ['weekly'],
  props: () => ({ design: 'blocks', radius: 14, gap: 6, showWeeks: true, showKm: true, showRange: true, decimals: 0,
    phaseTS: TS({ size: 22, weight: 800, font: 'Inter', transform: 'upper', spacing: 1 }), weekTS: TS({ size: 17, weight: 700, font: 'Inter', role: 'muted', color: '@muted' }), kmTS: TS({ size: 18, weight: 700, font: 'Inter' }) }),
  render(ctx, el, W, H, env) {
    const p = el.props, S = env.weekly; if (!S) return;
    const weeks = S.weeks, n = weeks.length, P = progOf(el, env), cw = W / n;
    const kmH = p.showKm ? p.kmTS.size * 1.7 : 0, wkH = p.showWeeks ? p.weekTS.size * 1.7 : 0;
    const bh = Math.max(10, H - kmH - wkH);
    const groups = phaseGroups(weeks);
    groups.forEach((g) => {
      const f = reveal(P, g.from, n); if (f <= 0) return;
      const x0 = g.from * cw + p.gap / 2, x1 = (g.to + 1) * cw - p.gap / 2, c = col(g.color, env);
      ctx.save(); ctx.globalAlpha *= f;
      if (p.design === 'blocks') { ctx.fillStyle = c; rrect(ctx, x0, kmH, (x1 - x0) * Math.min(1, f * 1.2), bh, Math.min(p.radius, bh / 2)); ctx.fill(); }
      else if (p.design === 'outline') { ctx.strokeStyle = c; ctx.lineWidth = 4; rrect(ctx, x0 + 2, kmH + 2, x1 - x0 - 4, bh - 4, Math.min(p.radius, bh / 2)); ctx.stroke(); }
      else { // steps: height by distance per week, coloured by phase
        for (let i = g.from; i <= g.to; i++) { const w = weeks[i], hh = Math.max(6, (w.distance / S.maxDist) * bh); ctx.fillStyle = c; rrect(ctx, i * cw + p.gap / 2, kmH + bh - hh, cw - p.gap, hh, Math.min(p.radius, cw / 3)); ctx.fill(); }
      }
      ctx.restore();
      const ts = p.design === 'blocks' ? { ...p.phaseTS, color: ink(c), shadow: false } : { ...p.phaseTS, color: g.color };
      const rng = p.showRange && g.to > g.from ? `W${g.from + 1}–${g.to + 1}` : '';
      const ty = p.design === 'steps' ? kmH + p.phaseTS.size * 1.1 : kmH + bh / 2 + (rng ? -p.phaseTS.size * 0.15 : p.phaseTS.size * 0.36);
      const t = fitTxt(ctx, g.name, ts, x1 - x0 - 10);
      if (t && f > 0.5) {
        drawText(ctx, t, (x0 + x1) / 2, ty, { ...ts, opacity: f }, env, 'center');
        if (rng && p.design !== 'steps' && measureStr(ctx, rng, ts) < x1 - x0 - 10) drawText(ctx, rng, (x0 + x1) / 2, ty + p.phaseTS.size * 1.05, { ...ts, size: ts.size * 0.7, opacity: f * 0.75 }, env, 'center');
      }
    });
    weeks.forEach((w, i) => {
      const f = reveal(P, i, n); if (f <= 0.3) return;
      if (p.showKm && !w.empty) drawText(ctx, fmtDist(w.distance, env.units, p.decimals), i * cw + cw / 2, p.kmTS.size * 1.1, { ...p.kmTS, opacity: f }, env, 'center');
      if (p.showWeeks) drawText(ctx, 'W' + w.n, i * cw + cw / 2, H - p.weekTS.size * 0.3, p.weekTS, env, 'center');
    });
  },
  schema: () => [{ title: 'Phase timeline', fields: [
    { k: 'props.design', t: 'seg', label: 'Design', options: [['blocks', 'Blocks'], ['outline', 'Outline'], ['steps', 'Steps (by km)']] },
    { k: 'props.showKm', t: 'toggle', label: 'Distance above', half: true }, { k: 'props.showWeeks', t: 'toggle', label: 'Week numbers', half: true }, { k: 'props.showRange', t: 'toggle', label: 'Week range in block' },
    { k: 'props.decimals', t: 'range', label: 'Decimals', min: 0, max: 2 }, { k: 'props.radius', t: 'range', label: 'Radius', min: 0, max: 60 }, { k: 'props.gap', t: 'range', label: 'Gap', min: 0, max: 30 },
  ] }, { title: 'Phase text', ts: 'props.phaseTS' }, { title: 'Week text', ts: 'props.weekTS' }, { title: 'Distance text', ts: 'props.kmTS' }],
});

// ---------- Training heatmap (weeks × days) ----------
register({
  type: 'wheat', name: 'Training heatmap', auto: false, w: 940, h: 800, modes: ['weekly'],
  props: () => ({ colorBy: 'phase', color: '@accent', empty: '#ffffff10', radius: 8, gap: 6, showTotals: true, showLabels: true, showDays: true, decimals: 0,
    labelTS: TS({ size: 20, weight: 800, font: 'Inter' }), dayTS: TS({ size: 16, weight: 700, font: 'Inter', role: 'muted', color: '@muted', transform: 'upper' }), totalTS: TS({ size: 20, weight: 800, font: 'Inter' }) }),
  render(ctx, el, W, H, env) {
    const p = el.props, S = env.weekly; if (!S) return;
    const weeks = S.weeks, n = weeks.length, P = progOf(el, env);
    const lw = p.showLabels ? Math.max(...weeks.map((w) => measureStr(ctx, 'W' + w.n, p.labelTS))) + 26 : 0;
    const tw = p.showTotals ? Math.max(...weeks.map((w) => measureStr(ctx, fmtDist(w.distance, env.units, p.decimals), p.totalTS))) + 16 : 0;
    const dh = p.showDays ? p.dayTS.size * 1.8 : 0;
    const gw = W - lw - tw, cw = gw / 7, rh = (H - dh) / n;
    const max = Math.max(1, ...weeks.map((w) => Math.max(...w.days)));
    const ws = env.settings?.weekStart ?? 1;
    if (p.showDays) for (let j = 0; j < 7; j++) drawText(ctx, DAYS[(j + ws) % 7].slice(0, 2), lw + j * cw + cw / 2, p.dayTS.size * 1.1, p.dayTS, env, 'center');
    weeks.forEach((w, i) => {
      const f = reveal(P, i, n); if (f <= 0) return;
      const y = dh + i * rh, c = p.colorBy === 'phase' ? col(w.color, env) : col(p.color, env);
      if (p.showLabels) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(8, y + rh / 2, 6, 0, Math.PI * 2); ctx.fill(); drawText(ctx, 'W' + w.n, 22, y + rh / 2 + p.labelTS.size * 0.36, p.labelTS, env); }
      w.days.forEach((d, j) => {
        const x = lw + j * cw;
        ctx.fillStyle = col(p.empty, env); rrect(ctx, x + p.gap / 2, y + p.gap / 2, cw - p.gap, rh - p.gap, p.radius); ctx.fill();
        if (d > 0) { ctx.save(); ctx.globalAlpha *= (0.3 + 0.7 * (d / max)) * f; ctx.fillStyle = c; rrect(ctx, x + p.gap / 2, y + p.gap / 2, cw - p.gap, rh - p.gap, p.radius); ctx.fill(); ctx.restore(); }
      });
      if (p.showTotals) drawText(ctx, w.empty ? '—' : fmtDist(w.distance, env.units, p.decimals), W, y + rh / 2 + p.totalTS.size * 0.36, { ...p.totalTS, opacity: f }, env, 'right');
    });
  },
  schema: () => [{ title: 'Heatmap', fields: [
    { k: 'props.colorBy', t: 'seg', label: 'Colour', options: [['phase', 'By phase'], ['solid', 'One colour']] }, { k: 'props.color', t: 'color', label: 'Colour', when: (e) => e.props.colorBy === 'solid' }, { k: 'props.empty', t: 'color', label: 'Rest day colour' },
    { k: 'props.showLabels', t: 'toggle', label: 'Week labels', half: true }, { k: 'props.showTotals', t: 'toggle', label: 'Week totals', half: true }, { k: 'props.showDays', t: 'toggle', label: 'Day names' },
    { k: 'props.radius', t: 'range', label: 'Radius', min: 0, max: 30 }, { k: 'props.gap', t: 'range', label: 'Gap', min: 0, max: 20 }, { k: 'props.decimals', t: 'range', label: 'Decimals', min: 0, max: 2 },
  ] }, { title: 'Week text', ts: 'props.labelTS' }, { title: 'Day text', ts: 'props.dayTS' }, { title: 'Total text', ts: 'props.totalTS' }],
});

// ---------- Phase legend ----------
function legendItems(el, env) {
  const S = env.weekly; if (!S) return [];
  const seen = new Map();
  for (const w of S.weeks) { const k = w.phaseName + w.color; if (!seen.has(k)) seen.set(k, { name: w.phaseName, color: w.color, n: 0, km: 0 }); const it = seen.get(k); it.n++; it.km += w.distance; }
  return [...seen.values()];
}
function legendLayout(ctx, el, env) {
  const p = el.props, items = legendItems(el, env), ts = p.legendTS;
  const parts = items.map((it) => { const t = it.name + (p.showCount ? ` · ${it.n} wk` : ''); return { ...it, t, w: (p.style === 'pill' ? ts.size : ts.size * 1.4) + measureStr(ctx, t, ts) + (p.style === 'pill' ? ts.size * 0.6 : 0) }; });
  const ih = ts.size * 1.7;
  let w = 0, h = 0;
  if (p.layout === 'column') { w = Math.max(0, ...parts.map((q) => q.w)); h = parts.length * ih + Math.max(0, parts.length - 1) * p.gap; }
  else { w = parts.reduce((a, q) => a + q.w, 0) + Math.max(0, parts.length - 1) * p.gap; h = ih; }
  return { parts, ih, w: Math.max(4, w), h: Math.max(4, h) };
}
register({
  type: 'wlegend', name: 'Phase legend', auto: true, modes: ['weekly'],
  props: () => ({ layout: 'row', style: 'dot', gap: 26, showCount: false, legendTS: TS({ size: 22, weight: 700, font: 'Inter' }) }),
  measure(ctx, el, env) { const L = legendLayout(ctx, el, env); return { w: L.w, h: L.h }; },
  render(ctx, el, W, H, env) {
    const p = el.props, L = legendLayout(ctx, el, env), ts = p.legendTS;
    let x = 0, y = 0;
    for (const q of L.parts) {
      const c = col(q.color, env);
      if (p.style === 'pill') { ctx.fillStyle = c; rrect(ctx, x, y, q.w, L.ih, L.ih / 2); ctx.fill(); drawText(ctx, q.t, x + ts.size * 0.8, y + L.ih / 2 + ts.size * 0.36, { ...ts, color: ink(c), shadow: false }, env); }
      else { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + ts.size * 0.4, y + L.ih / 2, ts.size * 0.36, 0, Math.PI * 2); ctx.fill(); drawText(ctx, q.t, x + ts.size * 1.2, y + L.ih / 2 + ts.size * 0.36, ts, env); }
      if (p.layout === 'column') y += L.ih + p.gap; else x += q.w + p.gap;
    }
  },
  schema: () => [{ title: 'Legend', fields: [
    { k: 'props.layout', t: 'seg', label: 'Layout', options: [['row', 'Row'], ['column', 'Column']] }, { k: 'props.style', t: 'seg', label: 'Style', options: [['dot', 'Dots'], ['pill', 'Pills']] },
    { k: 'props.showCount', t: 'toggle', label: 'Number of weeks' }, { k: 'props.gap', t: 'range', label: 'Gap', min: 0, max: 80 },
  ] }, { title: 'Legend text', ts: 'props.legendTS' }],
});

export { PHASES };
