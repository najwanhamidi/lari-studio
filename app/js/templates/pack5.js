// Template pack 5 (v1.5): "full report" single-run templates (name, distance, avg pace, avg HR, time, map,
// laps table, labelled split bars) and multi-run templates with details for every run.
const SH = { shadow: true, shadowColor: '#000000aa', shadowBlur: 14, shadowX: 0, shadowY: 3 };
const LAPCOLS = [{ k: 'idx', on: true }, { k: 'dist', on: true }, { k: 'time', on: true }, { k: 'pace', on: true }, { k: 'hr', on: true }];
const FOUR = [{ m: 'distance', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }, { m: 'time', on: true }];

// Laps table that always fits its box: wraps into two columns for long runs, then scales.
function lapsTable(k, over, maxW, maxH, opt = {}) {
  const o = { ...over, props: { splits: { mode: 'laps' }, columns: LAPCOLS, rowScale: 1.6, colGap: 34, ...(over.props || {}) } };
  const el = k.mk('splits', o, { in: 'fade', ...opt });
  if (el.h > maxH * 1.15 && (el.props.wrapCols || 1) < 2) { el.props.wrapCols = 2; k.relayout(el); }
  const f = Math.min(maxW / el.w, maxH / el.h, 1.6);
  if (Math.abs(f - 1) > 0.01) { if (f < 1) k.fitW(el, el.w * f); else { el.s *= f; k.relayout(el); } }
  return el;
}
// shrink or grow an auto-sized widget to fill maxW (growth capped)
function fitTo(k, el, maxW, grow = 1.7) {
  const f = Math.min(maxW / el.w, grow);
  if (f < 1) k.fitW(el, maxW); else if (f > 1.02) { el.s *= f; k.relayout(el); }
  return el;
}
function splitBars(k, over, w, h, opt = {}) {
  return k.mk('graph', { ...over, props: { metric: 'pace', design: 'splitBars', splitLabels: true, showTitle: true, title: 'Pace per split', showAvg: true, yTicks: 3, ...(over.props || {}) } }, { w: w / k.u, h: h / k.u, in: 'wipe', ...opt });
}
function grid4(k, over, maxW, opt = {}) {
  const el = k.mk('statgrid', { ...over, props: { cols: 4, layout: 'reverse', items: FOUR, cellGapX: 44, ...(over.props || {}) } }, { in: 'up', ...opt });
  return fitTo(k, el, maxW);
}

export const PACK5_SINGLE = [
  {
    id: 'fullreport', name: 'Full Report', desc: 'Every key stat, map, laps table and split bars',
    bg: { type: 'gradient', color: '#0f172a', color2: '#020617', angle: 180 }, theme: { accent: '#c6ff3d', accent2: '#38bdf8' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 28 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 68, font: 'Montserrat', weight: 900 } } }, { in: 'down' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 28, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'down' });
      place(d, 0, 0, M, nm.y + nm.h + 14 * u);
      const g = grid4(k, { skin: 'glass', props: { align: 'center', valueTS: { size: 58 }, unitTS: { size: 24 }, labelTS: { size: 17 } }, style: { padX: 30, padY: 28 } }, IW);
      g.w = IW; place(g, 0, 0, M, d.y + d.h + 34 * u);
      const R = H - M - (g.y + g.h + G);
      const rowH = R * 0.5 - G / 2, barH = R - rowH - G;
      const map = mk('map', { skin: 'glass', props: { line: 'glow', width: 8, start: 'dot', end: 'checkered' }, style: { padX: 20, padY: 20 } }, { w: (IW * 0.44) / u, h: rowH / u, in: 'zoom' });
      place(map, 0, 0, M, g.y + g.h + G);
      const tb = lapsTable(k, { skin: 'glass', props: { design: 'striped' }, style: { padX: 22, padY: 18 } }, IW * 0.56 - G, rowH);
      place(tb, 1, 0, W - M, map.y + (rowH - tb.h) / 2);
      const bars = splitBars(k, { skin: 'glass', style: { padX: 26, padY: 22 } }, IW, barH);
      place(bars, 0, 0, M, map.y + rowH + G);
    },
  },
  {
    id: 'photoreport', name: 'Photo Report', desc: 'Full report in glass cards, top of photo stays clear',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 22 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 64, font: 'Poppins', weight: 800, ...SH } } }, { in: 'down' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date}', ts: { size: 28, font: 'Poppins', weight: 500, ...SH } } }, { in: 'down' });
      place(d, 0, 0, M, nm.y + nm.h + 10 * u);
      const top = H * 0.36;
      const g = grid4(k, { skin: 'glass', props: { align: 'center', valueTS: { size: 54, font: 'Poppins', weight: 700 }, unitTS: { size: 22 }, labelTS: { size: 16 } }, style: { padX: 28, padY: 24 } }, IW);
      g.w = IW; place(g, 0, 0, M, top);
      const R = H - M - (g.y + g.h + G), rowH = R * 0.52, barH = R - rowH - G;
      const map = mk('map', { skin: 'glass', props: { line: 'casing', width: 7, start: 'dot', end: 'checkered' }, style: { padX: 16, padY: 16 } }, { w: (IW * 0.4) / u, h: rowH / u, in: 'zoom' });
      place(map, 0, 0, M, g.y + g.h + G);
      const tb = lapsTable(k, { skin: 'glass', props: { design: 'minimal' }, style: { padX: 22, padY: 18 } }, IW * 0.6 - G, rowH);
      place(tb, 1, 0, W - M, map.y + (rowH - tb.h) / 2);
      const bars = splitBars(k, { skin: 'glass', props: { showY: false, grid: false }, style: { padX: 24, padY: 20 } }, IW, barH);
      place(bars, 0, 0, M, map.y + rowH + G);
    },
  },
  {
    id: 'lapsheet', name: 'Lap Sheet', desc: 'Paper style with a full laps table',
    bg: { type: 'solid', color: '#f6f3ec' }, theme: { text: '#1c1917', muted: '#1c1917a6', accent: '#c2410c', accent2: '#0f766e' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 34 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 84, font: 'DM Serif Display', weight: 400 } } }, { in: 'up' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 28, font: 'Playfair Display', italic: true, weight: 400, color: '@accent', role: 'accent' } } }, { in: 'up' });
      place(d, 0, 0, M, nm.y + nm.h + 10 * u);
      const g = grid4(k, { props: { dividers: true, dividerColor: '#1c191733', valueTS: { size: 62, font: 'DM Serif Display', weight: 400 }, unitTS: { size: 24, font: 'Playfair Display', italic: true }, labelTS: { size: 17 } } }, IW);
      place(g, 0, 0, M, d.y + d.h + 40 * u);
      const R = H - M - (g.y + g.h + G), tH = R * 0.5, bH = R - tH - G;
      const tb = lapsTable(k, { props: { design: 'lines', lineColor: '#1c191726', cellTS: { font: 'Inter', size: 30 }, headerTS: { size: 18 } } }, IW, tH);
      place(tb, 0, 0, M, g.y + g.h + G);
      const map = mk('map', { props: { line: 'solid', color: '#1c1917', width: 6, start: 'dot', end: 'checkered', startColor: '@accent', dot: 'none' }, style: { borderW: 2, borderColor: '#1c191744', padX: 18, padY: 18, radius: 16 } }, { w: (IW * 0.36) / u, h: bH / u, in: 'fade' });
      place(map, 0, 0, M, tb.y + tH + G);
      const bars = splitBars(k, { props: { fillColor: '#1c1917', lineColor: '@accent', gridColor: '#1c191718', avgColor: '@accent', splitLabelTS: { color: '#1c1917' }, titleTS: { color: '#1c1917' }, axisTS: { color: '#1c1917a6' } } }, IW * 0.64 - G, bH);
      place(bars, 1, 0, W - M, map.y);
    },
  },
  {
    id: 'coachview', name: 'Coach View', desc: 'Stats column beside the map, then splits and laps',
    bg: { type: 'gradient', color: '#18181b', color2: '#09090b', angle: 180 }, theme: { accent: '#22c55e', accent2: '#eab308' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 26 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 60, font: 'Inter', weight: 800 } } }, { in: 'down' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 26, weight: 600, color: '@accent', role: 'accent' } } }, { in: 'down' });
      place(d, 0, 0, M, nm.y + nm.h + 10 * u);
      const st = mk('statgrid', { skin: 'solidDark', props: { cols: 1, layout: 'iconLeft', cellGapY: 30, items: FOUR, valueTS: { size: 56 }, unitTS: { size: 24 }, labelTS: { size: 16 } }, style: { padX: 30, padY: 30 } }, { in: 'left' });
      fitTo(k, st, IW * 0.46); place(st, 0, 0, M, d.y + d.h + 36 * u);
      const map = mk('map', { skin: 'solidDark', props: { line: 'heat', width: 8, start: 'dot', end: 'checkered' }, style: { padX: 20, padY: 20 } }, { w: (IW * 0.54 - G) / u, h: st.h / u, in: 'zoom' });
      place(map, 1, 0, W - M, st.y);
      const R = H - M - (st.y + st.h + G), bH = R * 0.42, tH = R - bH - G;
      const bars = splitBars(k, { skin: 'solidDark', props: { colorMode: 'ramp', ramp: 'lime' }, style: { padX: 26, padY: 22 } }, IW, bH);
      place(bars, 0, 0, M, st.y + st.h + G);
      const tb = lapsTable(k, { skin: 'solidDark', props: { design: 'cards', cardColor: '#ffffff0d' }, style: { padX: 22, padY: 20 } }, IW, tH);
      place(tb, 0.5, 0, W / 2, bars.y + bH + G);
    },
  },
  {
    id: 'neonlaps', name: 'Neon Laps', desc: 'Glowing map, neon table and labelled lap bars',
    bg: { type: 'solid', color: '#05060a' }, theme: { accent: '#00f0ff', accent2: '#ff2bd6' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 28 * u;
      const nm = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 64, font: 'Orbitron', weight: 800, color: '@accent', shadow: true, shadowColor: '@accent', shadowBlur: 26, shadowX: 0, shadowY: 0 } } }, { in: 'blur' });
      k.fitW(nm, IW); place(nm, 0.5, 0, W / 2, M);
      const d = mk('text', { props: { text: '{date}', align: 'center', ts: { size: 26, font: 'Orbitron', weight: 500, color: '@accent2' } } }, { in: 'fade' });
      place(d, 0.5, 0, W / 2, nm.y + nm.h + 12 * u);
      const g = grid4(k, { skin: 'neon', props: { align: 'center', valueTS: { size: 50, font: 'Orbitron' }, unitTS: { size: 20 }, labelTS: { size: 15 } }, style: { padX: 26, padY: 24 } }, IW);
      g.w = IW; place(g, 0, 0, M, d.y + d.h + 36 * u);
      const R = H - M - (g.y + g.h + G), rowH = R * 0.5, bH = R - rowH - G;
      const map = mk('map', { props: { line: 'gradient', color: '@accent', color2: '@accent2', width: 9, glow: 34, start: 'ring', end: 'ring', dot: 'pulse' } }, { w: (IW * 0.46) / u, h: rowH / u, in: 'wipe' });
      place(map, 0, 0, M, g.y + g.h + G);
      const tb = lapsTable(k, { props: { design: 'neon', cellTS: { font: 'Orbitron', size: 26 }, idxTS: { font: 'Orbitron', size: 26 } } }, IW * 0.54 - G, rowH);
      place(tb, 1, 0, W - M, map.y + (rowH - tb.h) / 2);
      const bars = splitBars(k, { skin: 'neon', props: { design: 'lollipop', splits: { mode: 'laps' }, title: 'Lap pace', lineColor: '@accent2', fillColor: '@accent', splitLabelShow: 'both', titleTS: { font: 'Orbitron' } }, style: { padX: 26, padY: 22 } }, IW, bH);
      place(bars, 0, 0, M, map.y + rowH + G);
    },
  },
  {
    id: 'brutalreport', name: 'Brutal Report', desc: 'Hard-shadow boxes with every stat',
    bg: { type: 'solid', color: '#f2f0ea' }, theme: { text: '#0d0f14', muted: '#0d0f14aa', accent: '#ff3d2e', accent2: '#2563eb' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M - 10 * u, G = 34 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 84, font: 'Archivo Black', weight: 400, lineHeight: 0.95 } } }, { in: 'left' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} — {startTime}', ts: { size: 28, font: 'Archivo Black', weight: 400, color: '@accent', role: 'accent' } } }, { in: 'left' });
      place(d, 0, 0, M, nm.y + nm.h + 12 * u);
      const cw = (IW - 30 * u) / 2;
      let y = d.y + d.h + 40 * u, rowMax = 0;
      ['distance', 'avgPace', 'avgHr', 'time'].forEach((m, i) => {
        const s = mk('stat', { skin: 'brutal', props: { metric: m, layout: 'tag', valueTS: { size: 64, font: 'Archivo Black', weight: 400 }, unitTS: { size: 24, font: 'Archivo Black', weight: 400 }, labelTS: { size: 16 } }, style: { padX: 26, padY: 22 } }, { in: 'drop' });
        fitTo(k, s, cw); place(s, 0, 0, M + (i % 2) * (cw + 30 * u), y); rowMax = Math.max(rowMax, s.h);
        if (i % 2) { y += rowMax + 30 * u; rowMax = 0; }
      });
      const R = H - M - 10 * u - y, rowH = R * 0.5, bH = R - rowH - G;
      const map = mk('map', { skin: 'brutal', props: { line: 'solid', color: '#0d0f14', width: 7, start: 'dot', end: 'checkered', startColor: '@accent' }, style: { padX: 18, padY: 18 } }, { w: (IW * 0.4) / u, h: rowH / u, in: 'drop' });
      place(map, 0, 0, M, y);
      const tb = lapsTable(k, { skin: 'brutal', props: { design: 'boxed', headerTS: { color: '#0d0f14aa' } }, style: { padX: 20, padY: 18 } }, IW * 0.6 - G, rowH);
      place(tb, 1, 0, M + IW, y + (rowH - tb.h) / 2);
      const bars = splitBars(k, { skin: 'brutal', props: { fillColor: '#0d0f14', lineColor: '@accent', gridColor: '#0d0f1422', avgColor: '@accent', splitLabelBox: true, splitLabelBoxColor: '#ff3d2e', splitLabelTS: { color: '#ffffff' }, titleTS: { color: '#0d0f14' }, axisTS: { color: '#0d0f14aa' } }, style: { padX: 26, padY: 22 } }, IW, bH);
      place(bars, 0, 0, M, y + rowH + G);
    },
  },
  {
    id: 'editorialreport', name: 'Editorial Report', desc: 'Magazine layout with rules, map and lap list',
    bg: { type: 'solid', color: '#ffffff' }, theme: { text: '#111111', muted: '#111111a0', accent: '#d90429', accent2: '#111111' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 34 * u;
      const kick = mk('text', { props: { text: 'RUN REPORT · {date}', ts: { size: 24, font: 'Inter', weight: 800, spacing: 4, color: '@accent', role: 'accent' } } }, { in: 'fade' });
      place(kick, 0, 0, M, M);
      const nm = mk('text', { props: { text: '{name}', ts: { size: 96, font: 'Playfair Display', weight: 900, lineHeight: 1 } } }, { in: 'up' });
      k.fitW(nm, IW); place(nm, 0, 0, M, kick.y + kick.h + 18 * u);
      const r1 = mk('shape', { props: { shape: 'line', color: '#111111', strokeW: 3 } }, { w: IW / u, h: 6, anim: false }); place(r1, 0, 0, M, nm.y + nm.h + 26 * u);
      const g = grid4(k, { props: { dividers: true, dividerColor: '#11111126', valueTS: { size: 60, font: 'Playfair Display', weight: 700 }, unitTS: { size: 24, font: 'Playfair Display', italic: true }, labelTS: { size: 16 } } }, IW);
      place(g, 0, 0, M, r1.y + 34 * u);
      const r2 = mk('shape', { props: { shape: 'line', color: '#111111', strokeW: 1.5 } }, { w: IW / u, h: 6, anim: false }); place(r2, 0, 0, M, g.y + g.h + 30 * u);
      const R = H - M - (r2.y + G), rowH = R * 0.52, bH = R - rowH - G;
      const map = mk('map', { props: { line: 'solid', color: '#111111', width: 6, start: 'dot', end: 'checkered', startColor: '@accent', dot: 'none' } }, { w: (IW * 0.44) / u, h: rowH / u, in: 'fade' });
      place(map, 0, 0, M, r2.y + G);
      const tb = lapsTable(k, { props: { design: 'minimal', cellTS: { font: 'Playfair Display', weight: 400, size: 30 }, idxTS: { font: 'Inter', weight: 800, color: '@accent', size: 26 }, headerTS: { size: 16 } } }, IW * 0.56 - G, rowH);
      place(tb, 1, 0, W - M, map.y + (rowH - tb.h) / 2);
      const bars = splitBars(k, { props: { design: 'splitBars', fillColor: '#111111', lineColor: '@accent', gridColor: '#11111114', avgColor: '@accent', barRadius: 0, splitLabelTS: { color: '#111111', font: 'Playfair Display' }, titleTS: { color: '#111111', font: 'Playfair Display', transform: 'none', spacing: 0, size: 30 }, axisTS: { color: '#111111a0' } } }, IW, bH);
      place(bars, 0, 0, M, map.y + rowH + G);
    },
  },
  {
    id: 'sunsetreport', name: 'Sunset Report', desc: 'Warm gradient with frosted cards',
    bg: { type: 'gradient', color: '#f97316', color2: '#7c3aed', angle: 160 }, theme: { text: '#ffffff', muted: '#ffffffd0', accent: '#fde047', accent2: '#ffffff' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 24 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 70, font: 'Kanit', weight: 700 } } }, { in: 'down' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 28, font: 'Kanit', weight: 500, color: '@muted', role: 'muted' } } }, { in: 'down' });
      place(d, 0, 0, M, nm.y + nm.h + 8 * u);
      const big = mk('stat', { props: { metric: 'distance', layout: 'stackUnit', showLabel: false, valueTS: { size: 180, font: 'Kanit', weight: 800 }, unitTS: { size: 48, font: 'Kanit' } } }, { in: 'pop' });
      k.fitW(big, IW * 0.5); place(big, 0, 0, M, d.y + d.h + 30 * u);
      const map = mk('map', { skin: 'frost', props: { line: 'solid', color: '#ffffff', width: 7, start: 'dot', end: 'checkered', startColor: '@accent' }, style: { padX: 18, padY: 18 } }, { w: (IW * 0.42) / u, h: big.h / u, in: 'zoom' });
      place(map, 1, 0, W - M, big.y);
      const g = mk('statgrid', { skin: 'frost', props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 50, items: [{ m: 'avgPace', on: true }, { m: 'avgHr', on: true }, { m: 'time', on: true }], valueTS: { size: 56, font: 'Kanit', weight: 700 }, unitTS: { size: 22 }, labelTS: { size: 16 } }, style: { padX: 30, padY: 24 } }, { in: 'up' });
      fitTo(k, g, IW); g.w = IW; place(g, 0, 0, M, big.y + big.h + G);
      const R = H - M - (g.y + g.h + G), bH = R * 0.44, tH = R - bH - G;
      const bars = splitBars(k, { skin: 'frost', props: { fillColor: '#ffffff', lineColor: '@accent', gridColor: '#ffffff33', splitLabelPos: 'inside', titleTS: { font: 'Kanit' } }, style: { padX: 26, padY: 22 } }, IW, bH);
      place(bars, 0, 0, M, g.y + g.h + G);
      const tb = lapsTable(k, { skin: 'frost', props: { design: 'striped', stripeColor: '#ffffff1f', cellTS: { font: 'Kanit', weight: 500 } }, style: { padX: 24, padY: 20 } }, IW, tH);
      place(tb, 0.5, 0, W / 2, bars.y + bH + G);
    },
  },
  {
    id: 'bottomsheet', name: 'Bottom Sheet', desc: 'Dark sheet over the lower part of a photo',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const sheetY = H * 0.34;
      const sheet = mk('shape', { name: 'Sheet', props: { shape: 'rect', color: '#0d0f14ee', radius: 48 } }, { w: W / u, h: (H - sheetY + 60 * u) / u, in: 'up', delay: 0 });
      place(sheet, 0, 0, 0, sheetY);
      const IW = W - 2 * M, G = 24 * u;
      const handle = mk('shape', { name: 'Handle', props: { shape: 'rect', color: '#ffffff40', radius: 99 } }, { w: 120, h: 10, anim: false });
      place(handle, 0.5, 0, W / 2, sheetY + 20 * u);
      const nm = mk('text', { props: { text: '{name}', ts: { size: 56, font: 'Inter', weight: 800 } } }, { in: 'up' });
      k.fitW(nm, IW); place(nm, 0, 0, M, sheetY + 60 * u);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 24, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'up' });
      place(d, 0, 0, M, nm.y + nm.h + 10 * u);
      const g = grid4(k, { props: { valueTS: { size: 54 }, unitTS: { size: 22 }, labelTS: { size: 15 } } }, IW);
      place(g, 0, 0, M, d.y + d.h + 30 * u);
      const R = H - M - (g.y + g.h + G), rowH = R * 0.5, bH = R - rowH - G;
      const map = mk('map', { props: { line: 'glow', width: 7, start: 'dot', end: 'checkered' }, style: { bg: 'solid', bgColor: '#ffffff', bgOpacity: 0.06, padX: 16, padY: 16, radius: 22 } }, { w: (IW * 0.4) / u, h: rowH / u, in: 'zoom' });
      place(map, 0, 0, M, g.y + g.h + G);
      const tb = lapsTable(k, { props: { design: 'striped' } }, IW * 0.6 - G, rowH);
      place(tb, 1, 0, W - M, map.y + (rowH - tb.h) / 2);
      const bars = splitBars(k, { props: { showY: false } }, IW, bH);
      place(bars, 0, 0, M, map.y + rowH + G);
    },
  },
  {
    id: 'splitscreen', name: 'Split Screen', desc: 'Tall map on the left, stats and laps on the right',
    bg: { type: 'gradient', color: '#1e293b', color2: '#0b1120', angle: 180 }, theme: { accent: '#f472b6', accent2: '#60a5fa' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 28 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 62, font: 'Space Grotesk', weight: 700 } } }, { in: 'down' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 26, font: 'Space Grotesk', weight: 500, color: '@accent', role: 'accent' } } }, { in: 'down' });
      place(d, 0, 0, M, nm.y + nm.h + 10 * u);
      const top = d.y + d.h + 40 * u;
      const bH = (H - M - top) * 0.3, colH = H - M - top - bH - G;
      const lw = IW * 0.44, rw = IW - lw - G;
      const map = mk('map', { skin: 'glass', props: { line: 'gradient', color: '@accent', color2: '@accent2', width: 8, start: 'dot', end: 'checkered', kmMarkers: 'dots' }, style: { padX: 20, padY: 20 } }, { w: lw / u, h: colH / u, in: 'wipe' });
      place(map, 0, 0, M, top);
      const st = mk('statgrid', { props: { cols: 2, layout: 'reverse', cellGapX: 30, cellGapY: 26, items: FOUR, valueTS: { size: 52, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 22 }, labelTS: { size: 15 } } }, { in: 'right' });
      fitTo(k, st, rw); place(st, 0, 0, M + lw + G, top);
      const tb = lapsTable(k, { skin: 'glass', props: { design: 'striped', cellTS: { font: 'Space Grotesk', size: 28 } }, style: { padX: 20, padY: 18 } }, rw, colH - st.h - G);
      place(tb, 0, 0, M + lw + G, st.y + st.h + G);
      const bars = splitBars(k, { skin: 'glass', props: { colorMode: 'ramp', ramp: 'sunset' }, style: { padX: 26, padY: 22 } }, IW, bH);
      place(bars, 0, 1, M, H - M);
    },
  },
  {
    id: 'monoreport', name: 'Mono Report', desc: 'Black and white, thin type, outlined boxes',
    bg: { type: 'solid', color: '#000000' }, theme: { text: '#ffffff', muted: '#ffffff99', accent: '#ffffff', accent2: '#9ca3af' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 30 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 72, font: 'Inter', weight: 200, spacing: -1 } } }, { in: 'fade' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} — {startTime}', ts: { size: 24, font: 'JetBrains Mono', weight: 400, color: '@muted', role: 'muted' } } }, { in: 'fade' });
      place(d, 0, 0, M, nm.y + nm.h + 14 * u);
      const g = grid4(k, { skin: 'outline', props: { valueTS: { size: 58, font: 'Inter', weight: 200 }, unitTS: { size: 22, font: 'Inter', weight: 300 }, labelTS: { size: 15, font: 'JetBrains Mono' } }, style: { padX: 28, padY: 24, borderW: 1.5, radius: 0 } }, IW);
      g.w = IW; place(g, 0, 0, M, d.y + d.h + 40 * u);
      const R = H - M - (g.y + g.h + G), rowH = R * 0.5, bH = R - rowH - G;
      const map = mk('map', { skin: 'outline', props: { line: 'solid', color: '#ffffff', width: 4, start: 'ring', end: 'ring', dot: 'none' }, style: { borderW: 1.5, padX: 20, padY: 20, radius: 0 } }, { w: (IW * 0.44) / u, h: rowH / u, in: 'fade' });
      place(map, 0, 0, M, g.y + g.h + G);
      const tb = lapsTable(k, { skin: 'outline', props: { design: 'lines', cellTS: { font: 'JetBrains Mono', weight: 400, size: 26 }, idxTS: { font: 'JetBrains Mono', size: 26 }, headerTS: { font: 'JetBrains Mono' } }, style: { borderW: 1.5, padX: 20, padY: 18, radius: 0 } }, IW * 0.56 - G, rowH);
      place(tb, 1, 0, W - M, map.y);
      const bars = splitBars(k, { skin: 'outline', props: { design: 'step', lineColor: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.25, lineW: 3, avgColor: '#ffffff66', splitLabelTS: { font: 'JetBrains Mono', weight: 400 }, titleTS: { font: 'JetBrains Mono', weight: 400 } }, style: { borderW: 1.5, padX: 24, padY: 22, radius: 0 } }, IW, bH);
      place(bars, 0, 0, M, map.y + rowH + G);
    },
  },
  {
    id: 'watchsummary', name: 'Watch Summary', desc: 'Rounded summary cards like a watch app',
    bg: { type: 'solid', color: '#000000' }, theme: { accent: '#30d158', accent2: '#ff9f0a' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 20 * u;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 60, font: 'Inter', weight: 700 } } }, { in: 'down' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 26, weight: 500, color: '@muted', role: 'muted' } } }, { in: 'down' });
      place(d, 0, 0, M, nm.y + nm.h + 8 * u);
      const cw = (IW - G) / 2;
      const colors = ['#30d158', '#64d2ff', '#ff375f', '#ff9f0a'];
      let y = d.y + d.h + 34 * u, rowMax = 0;
      ['distance', 'avgPace', 'avgHr', 'time'].forEach((m, i) => {
        const s = mk('stat', { props: { metric: m, layout: 'reverse', valueTS: { size: 64, font: 'Inter', weight: 700, color: colors[i] }, unitTS: { size: 26, color: colors[i] }, labelTS: { size: 18, color: '#8e8e93', transform: 'none', spacing: 0, weight: 600 } }, style: { bg: 'solid', bgColor: '#1c1c1e', bgOpacity: 1, radius: 28, padX: 28, padY: 24 } }, { in: 'up' });
        fitTo(k, s, cw); s.props.align = 'left';
        place(s, 0, 0, M + (i % 2) * (cw + G), y); rowMax = Math.max(rowMax, s.h);
        if (i % 2) { y += rowMax + G; rowMax = 0; }
      });
      const R = H - M - y, rowH = R * 0.5, bH = R - rowH - G;
      const card = { bg: 'solid', bgColor: '#1c1c1e', bgOpacity: 1, radius: 28, padX: 24, padY: 22 };
      const map = mk('map', { props: { line: 'heat', width: 7, start: 'dot', end: 'checkered' }, style: card }, { w: (IW * 0.42) / u, h: rowH / u, in: 'zoom' });
      place(map, 0, 0, M, y);
      const tb = lapsTable(k, { props: { design: 'plain', headerTS: { color: '#8e8e93' } }, style: card }, IW * 0.58 - G, rowH);
      tb.w = Math.max(tb.w, 1); place(tb, 1, 0, W - M, y + (rowH - tb.h) / 2);
      const bars = splitBars(k, { props: { colorMode: 'ramp', ramp: 'heat', title: 'Split pace' }, style: card }, IW, bH);
      place(bars, 0, 0, M, y + rowH + G);
    },
  },
  {
    id: 'trackday', name: 'Track Day', desc: 'Track-red background, lap bars numbered',
    bg: { type: 'gradient', color: '#9f2d20', color2: '#6b1d14', angle: 180 }, theme: { text: '#ffffff', muted: '#ffffffc0', accent: '#ffffff', accent2: '#fde68a' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 26 * u;
      for (let i = 0; i < 4; i++) { const l = mk('shape', { name: 'Lane line', props: { shape: 'line', color: '#ffffff22', strokeW: 3 } }, { w: H / u, h: 6, anim: false }); l.rot = 90; place(l, 0.5, 0.5, M + (IW * (i + 1)) / 5, H / 2); }
      const nm = mk('text', { props: { text: '{name}', ts: { size: 72, font: 'Saira Condensed', weight: 800, transform: 'upper' } } }, { in: 'left' });
      k.fitW(nm, IW); place(nm, 0, 0, M, M);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 28, font: 'Saira Condensed', weight: 600, color: '@accent2' } } }, { in: 'left' });
      place(d, 0, 0, M, nm.y + nm.h + 8 * u);
      const g = grid4(k, { skin: 'solidDark', props: { align: 'center', valueTS: { size: 58, font: 'Saira Condensed', weight: 800 }, unitTS: { size: 24 }, labelTS: { size: 16 } }, style: { padX: 28, padY: 24, bgOpacity: 0.55 } }, IW);
      g.w = IW; place(g, 0, 0, M, d.y + d.h + 36 * u);
      const R = H - M - (g.y + g.h + G), bH = R * 0.36, rowH = R - bH - G;
      const bars = splitBars(k, { skin: 'solidDark', props: { splits: { mode: 'laps' }, title: 'Lap pace', fillColor: '#ffffff', lineColor: '@accent2', splitLabelShow: 'both', splitLabelPos: 'inside', titleTS: { font: 'Saira Condensed' } }, style: { padX: 26, padY: 22, bgOpacity: 0.55 } }, IW, bH);
      place(bars, 0, 0, M, g.y + g.h + G);
      const tb = lapsTable(k, { skin: 'solidDark', props: { design: 'striped', cellTS: { font: 'Saira Condensed', weight: 600, size: 32 }, idxTS: { font: 'Saira Condensed', size: 32 } }, style: { padX: 22, padY: 20, bgOpacity: 0.55 } }, IW * 0.6 - G, rowH);
      place(tb, 0, 0, M, bars.y + bH + G);
      const map = mk('map', { skin: 'solidDark', props: { line: 'solid', color: '#ffffff', width: 7, start: 'dot', end: 'checkered', startColor: '@accent2' }, style: { padX: 18, padY: 18, bgOpacity: 0.55 } }, { w: (IW * 0.4) / u, h: rowH / u, in: 'zoom' });
      place(map, 1, 0, W - M, bars.y + bH + G);
    },
  },
  {
    id: 'retroreport', name: 'Retro Report', desc: 'Warm retro cards with the full breakdown',
    bg: { type: 'solid', color: '#f4e4c1' }, theme: { text: '#3b2a1a', muted: '#3b2a1aaa', accent: '#c2410c', accent2: '#0f766e' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 26 * u;
      const nm = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 78, font: 'Righteous', weight: 400 } } }, { in: 'down' });
      k.fitW(nm, IW); place(nm, 0.5, 0, W / 2, M);
      const d = mk('text', { props: { text: '{date} · {startTime}', align: 'center', ts: { size: 28, font: 'Righteous', weight: 400, color: '@accent', role: 'accent' } } }, { in: 'down' });
      place(d, 0.5, 0, W / 2, nm.y + nm.h + 10 * u);
      const g = grid4(k, { skin: 'retro', props: { align: 'center', valueTS: { size: 54, font: 'Righteous', weight: 400 }, unitTS: { size: 22, font: 'Righteous', weight: 400 }, labelTS: { size: 15 } }, style: { padX: 26, padY: 22 } }, IW);
      g.w = IW; place(g, 0, 0, M, d.y + d.h + 36 * u);
      const R = H - M - (g.y + g.h + G), rowH = R * 0.5, bH = R - rowH - G;
      const map = mk('map', { skin: 'retro', props: { line: 'dashed', color: '#3b2a1a', width: 6, start: 'flag', end: 'checkered', startColor: '@accent2' }, style: { padX: 18, padY: 18 } }, { w: (IW * 0.42) / u, h: rowH / u, in: 'drop' });
      place(map, 0, 0, M, g.y + g.h + G);
      const tb = lapsTable(k, { skin: 'retro', props: { design: 'ticket', cellTS: { font: 'Righteous', weight: 400, size: 28 }, idxTS: { font: 'Righteous', weight: 400, size: 28 } }, style: { padX: 20, padY: 18 } }, IW * 0.58 - G, rowH);
      place(tb, 1, 0, W - M, map.y + (rowH - tb.h) / 2);
      const bars = splitBars(k, { skin: 'retro', props: { fillColor: '@accent2', lineColor: '@accent', gridColor: '#3b2a1a22', avgColor: '@accent', splitLabelTS: { color: '#3b2a1a', font: 'Righteous', weight: 400 }, titleTS: { color: '#3b2a1a', font: 'Righteous', weight: 400 }, axisTS: { color: '#3b2a1aaa' } }, style: { padX: 26, padY: 22 } }, IW, bH);
      place(bars, 0, 0, M, map.y + rowH + G);
    },
  },
];

export const PACK5_MULTI = [
  {
    id: 'runbyrun', name: 'Run by Run', desc: 'Totals, then a card for every run with route and stats',
    bg: { type: 'gradient', color: '#0f172a', color2: '#020617', angle: 180 }, theme: { accent: '#c6ff3d', accent2: '#38bdf8' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: '{title}', ts: { size: 72, font: 'Montserrat', weight: 900 } } }, { in: 'down' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range}', ts: { size: 28, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'down' });
      place(r, 0, 0, M, t.y + t.h + 10 * u);
      const g = mk('statgrid', { skin: 'glass', props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 40, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }], valueTS: { size: 52 }, unitTS: { size: 22 }, labelTS: { size: 15 } }, style: { padX: 28, padY: 24 } }, { in: 'up' });
      fitTo(k, g, IW); g.w = IW; place(g, 0, 0, M, r.y + r.h + 34 * u);
      const top = g.y + g.h + 30 * u;
      const c = mk('mcards', { props: { design: 'list' } }, { w: IW / u, h: (H - M - top) / u, in: 'fade' });
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'cardgrid', name: 'Run Card Grid', desc: 'Two-column cards for each run, totals at the bottom',
    bg: { type: 'gradient', color: '#1e1b4b', color2: '#0f0a24', angle: 170 }, theme: { accent: '#a78bfa', accent2: '#f472b6' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: '{title}', ts: { size: 70, font: 'Lexend', weight: 800 } } }, { in: 'down' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range}', ts: { size: 28, font: 'Lexend', weight: 500, color: '@accent', role: 'accent' } } }, { in: 'down' });
      place(r, 0, 0, M, t.y + t.h + 10 * u);
      const g = mk('statgrid', { skin: 'glass', props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 40, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 50, font: 'Lexend', weight: 700 }, unitTS: { size: 20 }, labelTS: { size: 15 } }, style: { padX: 28, padY: 22 } }, { in: 'up' });
      fitTo(k, g, IW); g.w = IW; place(g, 0, 1, M, H - M);
      const top = r.y + r.h + 40 * u;
      const c = mk('mcards', { props: { design: 'grid', cols: 2, palette: true, routeGlow: 10, cardBg: '#ffffff12', fields: ['dist', 'time', 'pace', 'hr'] } }, { w: IW / u, h: (g.y - 30 * u - top) / u, in: 'fade' });
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'runtimeline', name: 'Run Timeline', desc: 'A dotted timeline through the week, one card per run',
    bg: { type: 'solid', color: '#0b0f14' }, theme: { accent: '#fbbf24', accent2: '#60a5fa' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: 'WEEK {week}', ts: { size: 96, font: 'Big Shoulders Display', weight: 800 } } }, { in: 'left' });
      place(t, 0, 0, M, M);
      const big = mk('stat', { props: { metric: 'distance', layout: 'inline', label: 'Total', valueTS: { size: 96, font: 'Big Shoulders Display', weight: 800, color: '@accent' }, unitTS: { size: 36, font: 'Big Shoulders Display', weight: 700 }, labelTS: { size: 22 } } }, { in: 'right' });
      k.fitW(big, IW * 0.55); place(big, 1, 0, W - M, M + (t.h - big.h) / 2);
      const r = mk('text', { props: { text: '{range} · {runs} runs · {time}', ts: { size: 28, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'left' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 12 * u);
      const top = r.y + r.h + 40 * u;
      const c = mk('mcards', { props: { design: 'timeline', fields: ['dist', 'time', 'pace', 'hr'], dateStyle: 'short', lineColor: '#ffffff26' } }, { w: IW / u, h: (H - M - top) / u, in: 'fade' });
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'photoweekcards', name: 'Photo Week Cards', desc: 'Compact glass run cards over a photo',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: '{title}', ts: { size: 72, font: 'Poppins', weight: 800, ...SH } } }, { in: 'down' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range} · {distance} {unit}', ts: { size: 30, font: 'Poppins', weight: 500, ...SH } } }, { in: 'down' });
      place(r, 0, 0, M, t.y + t.h + 8 * u);
      const n = (k.env.multi && k.env.multi.list.length) || 5;
      const ch = Math.min(150, 1000 / n) * u;
      const c = mk('mcards', { props: { design: 'compact', showRoute: true, cardBg: '#000000a0', routeBg: '', accentBar: false, gap: 14, fields: ['dist', 'time', 'pace', 'hr'] } }, { w: IW / u, h: (ch * n + 14 * u * (n - 1)) / u, in: 'up' });
      place(c, 0, 1, M, H - M);
    },
  },
  {
    id: 'detaillog', name: 'Detailed Log', desc: 'Full run table plus per-run pace and HR charts',
    bg: { type: 'gradient', color: '#111827', color2: '#030712', angle: 180 }, theme: { accent: '#34d399', accent2: '#f87171' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 30 * u;
      const t = mk('text', { props: { text: '{title}', ts: { size: 70, font: 'Inter', weight: 800 } } }, { in: 'down' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range} · {runs} runs · {distance} {unit} · {time}', ts: { size: 26, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'down' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 10 * u);
      const list = mk('mlist', { skin: 'glass', props: { design: 'striped', rowScale: 1.9, colGap: 26, columns: [{ k: 'day', on: true }, { k: 'name', on: true }, { k: 'dist', on: true }, { k: 'time', on: true }, { k: 'pace', on: true }, { k: 'hr', on: true }, { k: 'elev', on: true }], cellTS: { size: 26 }, nameTS: { size: 26 }, dayTS: { size: 24 }, headerTS: { size: 16 } }, style: { padX: 20, padY: 18 } }, { in: 'fade' });
      fitTo(k, list, IW); place(list, 0, 0, M, r.y + r.h + 36 * u);
      const R = H - M - (list.y + list.h + G), rh = R / 3 - G * 2 / 3;
      const routes = mk('mroutes', { props: { design: 'row', palette: true, label: 'day', glow: 8 } }, { w: IW / u, h: rh / u, in: 'fade' });
      place(routes, 0, 0, M, list.y + list.h + G);
      const pc = mk('mchart', { skin: 'glass', props: { metric: 'avgPace', design: 'vbars', color: '@accent', label: 'day' } }, { w: (IW / 2 - G / 2) / u, h: (R - rh - G) / u, in: 'wipe' });
      place(pc, 0, 0, M, routes.y + rh + G);
      const hc = mk('mchart', { skin: 'glass', props: { metric: 'avgHr', design: 'vbars', color: '@accent2', label: 'day', yMin: '100' } }, { w: (IW / 2 - G / 2) / u, h: (R - rh - G) / u, in: 'wipe' });
      place(hc, 1, 0, W - M, pc.y);
      const lp = mk('text', { props: { text: 'PACE', ts: { size: 18, weight: 800, spacing: 3, color: '@accent' } } }, { anim: false });
      place(lp, 0, 1, pc.x + 4 * u, pc.y - 6 * u);
      const lh = mk('text', { props: { text: 'HEART RATE', ts: { size: 18, weight: 800, spacing: 3, color: '@accent2' } } }, { anim: false });
      place(lh, 0, 1, hc.x + 4 * u, hc.y - 6 * u);
    },
  },
  {
    id: 'neoncards', name: 'Neon Run Cards', desc: 'Glowing routes on a card per run',
    bg: { type: 'solid', color: '#05060a' }, theme: { accent: '#00f0ff', accent2: '#ff2bd6' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: 'WEEK {week}', align: 'center', ts: { size: 96, font: 'Orbitron', weight: 800, color: '@accent', shadow: true, shadowColor: '@accent', shadowBlur: 26, shadowX: 0, shadowY: 0 } } }, { in: 'blur' });
      k.fitW(t, IW); place(t, 0.5, 0, W / 2, M);
      const r = mk('text', { props: { text: '{runs} runs · {distance} {unit} · {time}', align: 'center', ts: { size: 28, font: 'Orbitron', weight: 500, color: '@accent2' } } }, { in: 'fade' });
      k.fitW(r, IW); place(r, 0.5, 0, W / 2, t.y + t.h + 12 * u);
      const top = r.y + r.h + 40 * u;
      const c = mk('mcards', { props: { design: 'list', palette: true, routeGlow: 16, routeWidth: 6, cardBg: '#ffffff0a', routeBg: '', accent: '@accent2', hlColor: '@accent', valueTS: { font: 'Orbitron', weight: 700 }, nameTS: { font: 'Orbitron', weight: 700 }, dateTS: { color: '@accent2' } } }, { w: IW / u, h: (H - M - top) / u, in: 'fade' });
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'paperweek', name: 'Paper Week', desc: 'Light paper log with run rows and a daily chart',
    bg: { type: 'solid', color: '#f6f3ec' }, theme: { text: '#1c1917', muted: '#1c1917a0', accent: '#c2410c', accent2: '#0f766e' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 30 * u;
      const t = mk('text', { props: { text: '{title}', ts: { size: 92, font: 'DM Serif Display', weight: 400 } } }, { in: 'up' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range} — {runs} runs, {distance} {unit}', ts: { size: 30, font: 'Playfair Display', italic: true, weight: 400, color: '@accent', role: 'accent' } } }, { in: 'up' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 10 * u);
      const bars = mk('mbars', { props: { design: 'bars', color: '#1c1917', hlColor: '@accent', track: '#1c191710', dayTS: { color: '#1c1917a0' }, valueTS: { color: '#1c1917', font: 'Playfair Display' } } }, { w: IW / u, h: 340, in: 'wipe' });
      place(bars, 0, 1, M, H - M);
      const top = r.y + r.h + 44 * u;
      const c = mk('mcards', { props: { design: 'list', cardBg: '#ffffff', routeColor: '#1c1917', routeBg: '#1c19170a', accent: '@accent', hlColor: '@accent', dateTS: { color: '@accent' }, nameTS: { font: 'DM Serif Display', weight: 400, color: '#1c1917' }, valueTS: { font: 'Playfair Display', weight: 700, color: '#1c1917' }, unitTS: { color: '#1c1917a0' }, labelTS: { color: '#1c1917a0' } } }, { w: IW / u, h: (bars.y - G - top) / u, in: 'fade' });
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'weekdash2', name: 'Week Dashboard', desc: 'Totals, daily chart, routes overlay and run rows',
    bg: { type: 'gradient', color: '#0f2027', color2: '#203a43', angle: 170 }, theme: { accent: '#5ee7ff', accent2: '#c6ff3d' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 24 * u;
      const t = mk('text', { props: { text: '{title}', ts: { size: 60, font: 'Space Grotesk', weight: 700 } } }, { in: 'down' });
      k.fitW(t, IW * 0.6); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range}', ts: { size: 26, font: 'Space Grotesk', weight: 500, color: '@accent', role: 'accent' } } }, { in: 'down' });
      place(r, 0, 0, M, t.y + t.h + 8 * u);
      const ov = mk('mroutes', { props: { design: 'overlay', palette: true, width: 4, glow: 8, gap: 4 } }, { w: 300, h: 300, in: 'fade' });
      place(ov, 1, 0, W - M, M - 10 * u);
      const g = mk('statgrid', { skin: 'glass', props: { cols: 3, layout: 'iconTop', align: 'center', cellGapX: 30, cellGapY: 26, items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'runs', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }, { m: 'longest', on: true }], valueTS: { size: 48, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 20 }, labelTS: { size: 14 } }, style: { padX: 28, padY: 24 } }, { in: 'up' });
      fitTo(k, g, IW); g.w = IW; place(g, 0, 0, M, Math.max(r.y + r.h, ov.y + ov.h) + G);
      const bars = mk('mbars', { skin: 'glass', props: { design: 'pills', color: '@accent', hlColor: '@accent2' }, style: { padX: 24, padY: 20 } }, { w: IW / u, h: 340, in: 'wipe' });
      place(bars, 0, 0, M, g.y + g.h + G);
      const top = bars.y + bars.h + G;
      const c = mk('mcards', { props: { design: 'compact', showRoute: false, gap: 12, fields: ['dist', 'time', 'pace', 'hr'] } }, { w: IW / u, h: (H - M - top) / u, in: 'fade' });
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'cardgrid3', name: 'Route Cards', desc: 'Big route per run with its key numbers',
    bg: { type: 'solid', color: '#0a0a0f' }, theme: { accent: '#ff6b6b', accent2: '#ffd166' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('stat', { props: { metric: 'distance', layout: 'inline', label: 'This week', valueTS: { size: 110, font: 'Anton', weight: 400 }, unitTS: { size: 40, font: 'Anton', weight: 400 }, labelTS: { size: 26 } } }, { in: 'left' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range} · {time} · {avgPace}', ts: { size: 28, weight: 600, color: '@accent', role: 'accent' } } }, { in: 'left' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 12 * u);
      const top = r.y + r.h + 40 * u;
      const c = mk('mcards', { props: { design: 'grid', cols: 2, palette: true, routeWidth: 6, routeGlow: 12, routeBg: '', cardBg: '#ffffff0d', fields: ['dist', 'pace', 'time', 'hr'], nameTS: { font: 'Anton', weight: 400 }, valueTS: { font: 'Anton', weight: 400 } } }, { w: IW / u, h: (H - M - top) / u, in: 'fade' });
      place(c, 0, 0, M, top);
    },
  },
];
