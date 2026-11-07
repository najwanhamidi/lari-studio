// Template pack 4 (v1.4). Same build kit as templates.js.
const SH = { shadow: true, shadowColor: '#000000aa', shadowBlur: 14, shadowX: 0, shadowY: 3 };
const DARK = '#0d0f14';
const rule = (k, x, y, w, color, thick = 3) => { const r = k.mk('shape', { name: 'Rule', props: { shape: 'line', color, strokeW: thick } }, { w: w / k.u, h: 8, in: 'wipe', anim: false }); k.place(r, 0, 0, x, y); return r; };
// shrink a card to end just below `last`, then re-centre the card and everything built after it vertically
const fitCard = (k, c, last, pad) => {
  const nh = last.y + last.h + pad - c.y, ny = (k.H - nh) / 2, dy = ny - c.y;
  const i = k.list.indexOf(c);
  c.h = nh; for (const e of k.list.slice(i)) e.y += dy;
};
const card = (k, color, w, h, radius = 24, inA = 'up', extra = {}) => k.mk('shape', { name: 'Card', props: { shape: 'rect', color, radius, ...extra } }, { w: w / k.u, h: h / k.u, in: inA });

export const PACK4_SINGLE = [
  {
    id: 'newspaper', name: 'Newspaper', desc: 'Front page with masthead and headline',
    bg: { type: 'solid', color: '#f3efe6' }, theme: { text: '#141414', muted: '#141414aa', accent: '#141414', accent2: '#8b0000' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const mast = mk('text', { props: { text: 'The Daily Run', align: 'center', ts: { size: 110, font: 'DM Serif Display', weight: 400 } } }, { in: 'fade' });
      k.fitW(mast, W - 2 * M); place(mast, 0.5, 0, W / 2, M);
      const r1 = rule(k, M, mast.y + mast.h + 20 * u, W - 2 * M, '#141414', 4);
      const dl = mk('text', { props: { text: '{date}  ·  EARLY EDITION  ·  {startTime}', align: 'center', ts: { size: 24, font: 'Inter', weight: 700, spacing: 3, transform: 'upper' } } }, { in: 'fade' });
      k.fitW(dl, W - 2 * M); place(dl, 0.5, 0, W / 2, r1.y + 22 * u);
      const r2 = rule(k, M, dl.y + dl.h + 20 * u, W - 2 * M, '#141414', 2);
      const hl = mk('text', { props: { text: 'LOCAL RUNNER COVERS\n{distance} {unit} IN {time}', ts: { size: 84, font: 'Playfair Display', weight: 900, lineHeight: 1.05 } } }, { in: 'up' });
      k.fitW(hl, W - 2 * M); place(hl, 0, 0, M, r2.y + 40 * u);
      const map = mk('map', { props: { line: 'solid', color: '#141414', width: 6, start: 'dot', end: 'checkered', startColor: '#8b0000', dot: 'none' }, style: { borderW: 2, borderColor: '#141414', padX: 20, padY: 20, radius: 0 } }, { w: 520, h: 520, in: 'fade' });
      place(map, 0, 0, M, hl.y + hl.h + 50 * u);
      const col = mk('text', { props: { text: '“{name}” went off at {startTime}.\nAverage pace held at\n{avgPace}{paceunit}, heart rate\naveraged {avgHr} bpm\nover {time}.', wrap: 0, ts: { size: 30, font: 'Playfair Display', weight: 400, lineHeight: 1.45 } } }, { in: 'fade' });
      k.fitW(col, W - 2 * M - map.w - 40 * u); place(col, 0, 0, map.x + map.w + 40 * u, map.y);
      const r3 = rule(k, M, map.y + map.h + 50 * u, W - 2 * M, '#141414', 2);
      const grid = mk('statgrid', { props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 40, dividers: true, dividerColor: '#14141455', items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'calories', on: true }], valueTS: { size: 54, font: 'DM Serif Display', weight: 400, color: '#141414' }, unitTS: { size: 22, font: 'Playfair Display', color: '#141414aa' }, labelTS: { size: 15, color: '#141414aa' } } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 0, W / 2, r3.y + 40 * u);
      const pg = mk('graph', { props: { metric: 'pace', design: 'line', lineColor: '#141414', lineW: 4, showTitle: true, title: 'Pace chart', titleTS: { color: '#141414', font: 'Playfair Display', transform: 'none', spacing: 0 }, axisTS: { color: '#141414aa' }, gridColor: '#14141422', avgColor: '#8b0000' } }, { w: (W - 2 * M) / u, h: 300, in: 'wipe' });
      place(pg, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'terminal', name: 'Terminal', desc: 'Green-on-black command line readout',
    bg: { type: 'solid', color: '#0a0f0a' }, theme: { text: '#39ff14', muted: '#39ff14aa', accent: '#39ff14', accent2: '#ffffff' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const mono = { font: 'JetBrains Mono' };
      const win = card(k, '#0f1a0f', W - 2 * M, H - 2 * M - 200 * u, 18, 'fade', { strokeW: 2, strokeColor: '#39ff1455' });
      place(win, 0.5, 0, W / 2, M + 100 * u);
      const bar = mk('text', { props: { text: '● ● ●   runner@lari: ~', ts: { size: 26, weight: 500, color: '#39ff14aa', ...mono } } }, { in: 'fade' });
      place(bar, 0, 0, win.x + 30 * u, win.y + 26 * u);
      const P = win.x + 40 * u;
      const cmd = mk('text', { props: { text: '$ lari --stats "{name}"', ts: { size: 36, weight: 700, ...mono } } }, { in: 'typewriter', step: 0.6 });
      k.fitW(cmd, win.w - 80 * u); place(cmd, 0, 0, P, bar.y + bar.h + 50 * u);
      const out = mk('text', { props: { text: '> date ........ {date}\n> start ....... {startTime}\n> distance .... {distance} {unit}\n> time ........ {time}\n> avg_pace .... {avgPace}{paceunit}\n> avg_hr ...... {avgHr} bpm\n> max_hr ...... {maxHr} bpm\n> climb ....... {ascent}\n> calories .... {calories}', ts: { size: 34, weight: 500, lineHeight: 1.7, ...mono } } }, { in: 'typewriter', dur: 1.6 });
      k.fitW(out, win.w - 80 * u); place(out, 0, 0, P, cmd.y + cmd.h + 40 * u);
      const g = mk('graph', { props: { metric: 'pace', design: 'bars', bars: 48, fillColor: '#39ff14', showTitle: true, title: '$ plot pace', titleTS: { ...mono, transform: 'none', spacing: 0, color: '#39ff14' }, axisTS: { ...mono, color: '#39ff14aa' }, showY: false, grid: false, avgColor: '#ffffff99' } }, { w: (win.w - 80 * u) / u, h: 340, in: 'wipe' });
      place(g, 0, 0, P, out.y + out.h + 60 * u);
      const done = mk('text', { props: { text: '$ exit 0  ✓ run saved', ts: { size: 30, weight: 700, ...mono } } }, { in: 'typewriter' });
      place(done, 0, 1, P, win.y + win.h - 36 * u);
    },
  },
  {
    id: 'boarding', name: 'Boarding Pass', desc: 'Ticket from START to FINISH',
    bg: { type: 'gradient', color: '#1e3a8a', color2: '#0f172a', angle: 160 }, theme: { accent: '#2563eb', accent2: '#f59e0b' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const cw = W - 2 * M;
      const tk = card(k, '#ffffff', cw, 1180 * u, 32, 'up');
      place(tk, 0.5, 0.5, W / 2, H / 2);
      const head = card(k, '#2563eb', cw, 140 * u, 32, 'up');
      place(head, 0.5, 0, W / 2, tk.y);
      const ht = mk('text', { props: { text: 'BOARDING PASS · RUN CLASS', ts: { size: 34, font: 'Space Grotesk', weight: 700, color: '#ffffff', spacing: 4 } } }, { in: 'fade' });
      k.fitW(ht, cw - 80 * u); place(ht, 0, 0.5, tk.x + 44 * u, head.y + head.h / 2);
      const L = tk.x + 50 * u, R = tk.x + tk.w - 50 * u;
      const big = { font: 'Space Grotesk', weight: 700, color: DARK };
      const lab = { size: 20, font: 'Space Grotesk', weight: 600, color: '#64748b', spacing: 3 };
      const from = mk('text', { props: { text: 'START', ts: { size: 110, ...big } } }, { in: 'left' });
      place(from, 0, 0, L, head.y + head.h + 60 * u);
      const to = mk('text', { align: 'right', props: { text: 'FINISH', align: 'right', ts: { size: 110, ...big } } }, { in: 'right' });
      place(to, 1, 0, R, from.y);
      const plane = mk('sticker', { props: { kind: 'icon', icon: 'footprints', color: '#2563eb', strokeW: 2.4 } }, { w: 110, h: 110, in: 'pop' });
      place(plane, 0.5, 0.5, W / 2, from.y + from.h / 2);
      const fl = mk('text', { props: { text: '{startTime}', ts: { size: 30, ...big, weight: 500 } } }, { in: 'left' });
      place(fl, 0, 0, L, from.y + from.h + 14 * u);
      const tl = mk('text', { align: 'right', props: { text: '{distance} {unit} later', align: 'right', ts: { size: 30, ...big, weight: 500 } } }, { in: 'right' });
      place(tl, 1, 0, R, fl.y);
      const r1 = rule(k, L, fl.y + fl.h + 50 * u, R - L, '#cbd5e1', 3);
      const pax = mk('text', { props: { text: 'PASSENGER', ts: lab } }, { in: 'fade' }); place(pax, 0, 0, L, r1.y + 40 * u);
      const pn = mk('text', { props: { text: '{name}', ts: { size: 44, ...big } } }, { in: 'fade' }); k.fitW(pn, R - L); place(pn, 0, 0, L, pax.y + pax.h + 12 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', cellGapX: 50, cellGapY: 34, items: [{ m: 'date', on: true, label: 'Date' }, { m: 'time', on: true, label: 'Duration' }, { m: 'avgPace', on: true, label: 'Cruise pace' }, { m: 'avgHr', on: true, label: 'Avg HR' }, { m: 'ascent', on: true, label: 'Altitude' }, { m: 'calories', on: true, label: 'Fuel' }], valueTS: { size: 44, ...big }, unitTS: { size: 20, color: '#64748b' }, labelTS: lab, dateStyle: 'short' } }, { in: 'up' });
      k.fitW(grid, R - L); place(grid, 0, 0, L, pn.y + pn.h + 50 * u);
      const r2 = rule(k, L, grid.y + grid.h + 50 * u, R - L, '#cbd5e1', 3);
      const map = mk('map', { props: { line: 'solid', color: '#2563eb', width: 6, start: 'dot', end: 'dot', startColor: '@accent2', endColor: '#2563eb', dot: 'none' } }, { w: 260, h: 220, in: 'zoom' });
      place(map, 1, 0, R, r2.y + 30 * u);
      const bc = mk('text', { props: { text: '║▌║█║▌│║▌║▌█║║▌│║', ts: { size: 90, font: 'Inter', weight: 400, color: DARK, spacing: -6 } } }, { in: 'wipe' });
      k.fitW(bc, R - L - map.w - 40 * u); place(bc, 0, 0.5, L, map.y + map.h / 2);
    },
  },
  {
    id: 'nutrition', name: 'Nutrition Label', desc: 'Run facts in a food-label style',
    bg: { type: 'solid', color: '#e8e4da' }, theme: { text: '#000000', muted: '#000000aa', accent: '#000000', accent2: '#000000' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const lw = 820 * u;
      const lbl = card(k, '#ffffff', lw, 1500 * u, 4, 'up', { strokeW: 6, strokeColor: '#000000' });
      place(lbl, 0.5, 0.5, W / 2, H / 2);
      const L = lbl.x + 40 * u, IW = lw - 80 * u;
      const t = mk('text', { props: { text: 'Run Facts', ts: { size: 110, font: 'Archivo Black', weight: 400, color: '#000000' } } }, { in: 'fade' });
      k.fitW(t, IW); place(t, 0, 0, L, lbl.y + 30 * u);
      const r0 = rule(k, L, t.y + t.h + 14 * u, IW, '#000000', 3);
      const sv = mk('text', { props: { text: '1 serving · {name}', ts: { size: 30, font: 'Inter', weight: 500, color: '#000000' } } }, { in: 'fade' });
      k.fitW(sv, IW); place(sv, 0, 0, L, r0.y + 20 * u);
      const r1 = rule(k, L, sv.y + sv.h + 20 * u, IW, '#000000', 18);
      const cal = mk('stat', { props: { metric: 'calories', layout: 'inline', label: 'Calories', showUnit: false, valueTS: { size: 90, font: 'Archivo Black', weight: 400, color: '#000000' }, labelTS: { size: 56, font: 'Archivo Black', weight: 400, color: '#000000', transform: 'none', spacing: 0 } } }, { in: 'fade' });
      k.fitW(cal, IW); place(cal, 0, 0, L, r1.y + 30 * u);
      const r2 = rule(k, L, cal.y + cal.h + 20 * u, IW, '#000000', 10);
      const grid = mk('statgrid', { props: { cols: 1, layout: 'inline', cellGapY: 34, dividers: true, dividerColor: '#000000', items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }, { m: 'maxHr', on: true }, { m: 'ascent', on: true }, { m: 'avgCad', on: true }], valueTS: { size: 52, font: 'Inter', weight: 800, color: '#000000' }, unitTS: { size: 32, font: 'Inter', weight: 500, color: '#000000' }, labelTS: { size: 40, font: 'Inter', weight: 800, color: '#000000', transform: 'none', spacing: 0 } } }, { in: 'fade' });
      k.fitW(grid, IW); place(grid, 0, 0, L, r2.y + 30 * u);
      const r3 = rule(k, L, grid.y + grid.h + 30 * u, IW, '#000000', 10);
      const ft = mk('text', { props: { text: '* Percent Daily Effort: 100%.\nContains: sweat, endorphins.', ts: { size: 24, font: 'Inter', weight: 500, color: '#000000', lineHeight: 1.4 } } }, { in: 'fade' });
      k.fitW(ft, IW); place(ft, 0, 0, L, r3.y + 24 * u);
      fitCard(k, lbl, ft, 40 * u);
    },
  },
  {
    id: 'certificate', name: 'Certificate', desc: 'Certificate of completion with a medal',
    bg: { type: 'solid', color: '#fbf6e9' }, theme: { text: '#2b2118', muted: '#2b2118aa', accent: '#b8860b', accent2: '#7c2d12' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const outer = mk('shape', { name: 'Border', props: { shape: 'rect', fill: 'none', strokeW: 10, strokeColor: '#b8860b', radius: 0 } }, { w: (W - M) / u, h: (H - M) / u, in: 'fade' });
      place(outer, 0.5, 0.5, W / 2, H / 2);
      const inner = mk('shape', { name: 'Inner border', props: { shape: 'rect', fill: 'none', strokeW: 3, strokeColor: '#b8860b', radius: 0 } }, { w: (W - M - 50 * u) / u, h: (H - M - 50 * u) / u, in: 'fade', anim: false });
      place(inner, 0.5, 0.5, W / 2, H / 2);
      const medal = mk('sticker', { props: { kind: 'icon', icon: 'medal', color: '#b8860b', strokeW: 1.8 } }, { w: 220, h: 220, in: 'drop' });
      place(medal, 0.5, 0, W / 2, M + 90 * u);
      const t = mk('text', { props: { text: 'Certificate', align: 'center', ts: { size: 120, font: 'DM Serif Display', weight: 400 } } }, { in: 'up' });
      place(t, 0.5, 0, W / 2, medal.y + medal.h + 30 * u);
      const st = mk('text', { props: { text: 'OF COMPLETION', align: 'center', ts: { size: 34, font: 'Playfair Display', weight: 700, spacing: 12, color: '@accent', role: 'accent' } } }, { in: 'up' });
      place(st, 0.5, 0, W / 2, t.y + t.h + 10 * u);
      const pr = mk('text', { props: { text: 'This certifies the completion of', align: 'center', ts: { size: 32, font: 'Playfair Display', italic: true, weight: 400 } } }, { in: 'fade' });
      place(pr, 0.5, 0, W / 2, st.y + st.h + 80 * u);
      const nm = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 84, font: 'Caveat', weight: 700, color: '@accent2' } } }, { in: 'fade' });
      k.fitW(nm, W - 3 * M); place(nm, 0.5, 0, W / 2, pr.y + pr.h + 30 * u);
      const r = rule(k, W / 2 - 300 * u, nm.y + nm.h + 16 * u, 600 * u, '#2b211855', 2);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 60, items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }], valueTS: { size: 84, font: 'DM Serif Display', weight: 400 }, unitTS: { size: 32, font: 'Playfair Display', italic: true }, labelTS: { size: 22, font: 'Playfair Display' } } }, { in: 'up' });
      k.fitW(grid, W - 3 * M); place(grid, 0.5, 0.5, W / 2, (r.y + H - M - 90 * u) / 2);
      const d = mk('text', { props: { text: 'Awarded on {date}', align: 'center', ts: { size: 30, font: 'Playfair Display', italic: true, weight: 400, color: '@muted', role: 'muted' } } }, { in: 'fade' });
      place(d, 0.5, 1, W / 2, H - M - 90 * u);
    },
  },
  {
    id: 'mapposter', name: 'Map Poster', desc: 'Huge route with spaced title, like a city print',
    bg: { type: 'solid', color: '#f5f2ec' }, theme: { text: '#1f2937', muted: '#1f2937aa', accent: '#1f2937', accent2: '#dc2626' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const map = mk('map', { props: { line: 'solid', color: '#1f2937', width: 7, start: 'dot', end: 'dot', startColor: '#dc2626', endColor: '#dc2626', dot: 'none', kmMarkers: 'dots', kmColor: '#dc2626' } }, { w: (W - 2 * M) / u, h: 1150, in: 'wipe' });
      place(map, 0.5, 0, W / 2, M + 40 * u);
      const nm = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 80, font: 'Montserrat', weight: 800, transform: 'upper', spacing: 18 } } }, { in: 'up' });
      k.fitW(nm, W - 2 * M); place(nm, 0.5, 0, W / 2, map.y + map.h + 60 * u);
      const r = rule(k, W / 2 - 80 * u, nm.y + nm.h + 30 * u, 160 * u, '#1f2937', 3);
      const sub = mk('text', { props: { text: '{distance} {unit}  ·  {time}  ·  {avgPace}{paceunit}', align: 'center', ts: { size: 30, font: 'Montserrat', weight: 500, spacing: 6 } } }, { in: 'up' });
      k.fitW(sub, W - 2 * M); place(sub, 0.5, 0, W / 2, r.y + 34 * u);
      const d = mk('text', { props: { text: '{date}', align: 'center', ts: { size: 24, font: 'Montserrat', weight: 400, spacing: 10, transform: 'upper', color: '@muted', role: 'muted' } } }, { in: 'up' });
      place(d, 0.5, 0, W / 2, sub.y + sub.h + 20 * u);
    },
  },
  {
    id: 'levelup', name: 'Level Complete', desc: 'Retro game screen with score and stats',
    bg: { type: 'solid', color: '#1b1033' }, theme: { text: '#ffffff', muted: '#c4b5fd', accent: '#facc15', accent2: '#22d3ee' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: 'LEVEL\nCOMPLETE!', align: 'center', ts: { size: 130, font: 'Black Ops One', weight: 400, color: '@accent', lineHeight: 1, stroke: 8, strokeColor: '#7c3aed' } } }, { in: 'pop' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0, W / 2, M + 60 * u);
      const stars = mk('text', { props: { text: '★ ★ ★', align: 'center', ts: { size: 110, font: 'Inter', weight: 400, color: '@accent' } } }, { in: 'drop' });
      place(stars, 0.5, 0, W / 2, t.y + t.h + 40 * u);
      const sc = mk('stat', { props: { metric: 'distance', layout: 'inline', label: 'SCORE', align: 'center', valueTS: { size: 150, font: 'Black Ops One', weight: 400 }, unitTS: { size: 40, font: 'Black Ops One', weight: 400 }, labelTS: { size: 40, font: 'Black Ops One', weight: 400, color: '@accent2' } } }, { in: 'up' });
      k.fitW(sc, W - 2 * M); place(sc, 0.5, 0, W / 2, stars.y + stars.h + 60 * u);
      const grid = mk('statgrid', { skin: 'solidDark', props: { cols: 2, layout: 'inline', cellGapX: 50, cellGapY: 44, items: [{ m: 'time', on: true, label: 'TIME' }, { m: 'avgPace', on: true, label: 'SPEED' }, { m: 'avgHr', on: true, label: 'POWER' }, { m: 'ascent', on: true, label: 'HEIGHT' }], valueTS: { size: 84, font: 'Black Ops One', weight: 400 }, unitTS: { size: 34 }, labelTS: { size: 36, font: 'Black Ops One', weight: 400, color: '@accent2' } }, style: { padX: 40, padY: 34, borderW: 5, borderColor: '#7c3aed', radius: 0 } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 0, W / 2, sc.y + sc.h + 70 * u);
      const lg = mk('graph', { skin: 'solidDark', props: { metric: 'pace', design: 'bars', bars: 24, barRadius: 0, barGap: 0.18, fillColor: '@accent', showTitle: true, title: 'Speed run', titleTS: { font: 'Black Ops One', weight: 400, color: '@accent2' }, axisTS: { font: 'Black Ops One', weight: 400 }, showY: false, grid: false, showAvg: false }, style: { padX: 34, padY: 30, borderW: 5, borderColor: '#7c3aed', radius: 0 } }, { w: (W - 2 * M) / u, h: 440, in: 'wipe' });
      place(lg, 0.5, 0, W / 2, grid.y + grid.h + 60 * u);
      const p = mk('text', { props: { text: 'PRESS START TO RUN AGAIN', align: 'center', ts: { size: 34, font: 'Black Ops One', weight: 400, color: '@muted', role: 'muted' } } }, { in: 'fade', delay: 1.4 });
      k.fitW(p, W - 2 * M); place(p, 0.5, 1, W / 2, H - M - 40 * u);
    },
  },
  {
    id: 'sunrise', name: 'Sunrise Run', desc: 'Warm sky colours with your start time',
    bg: { type: 'gradient', color: '#ff9a8b', color2: '#2b1055', angle: 0 }, theme: { text: '#ffffff', muted: '#ffffffcc', accent: '#ffd36e', accent2: '#ff9a8b' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const sun = mk('shape', { name: 'Sun', props: { shape: 'ellipse', fill: 'gradient', color: '#ffe29a', color2: '#ff9a8b', angle: 180 } }, { w: 520, h: 520, in: 'up' });
      place(sun, 0.5, 0.5, W / 2, H * 0.62);
      const st = mk('stat', { props: { metric: 'startTime', layout: 'valueOnly', align: 'center', valueTS: { size: 230, font: 'Teko', weight: 600 } } }, { in: 'down' });
      k.fitW(st, W - 2 * M); place(st, 0.5, 0, W / 2, M + 80 * u);
      const l = mk('text', { props: { text: 'UP BEFORE THE SUN', align: 'center', ts: { size: 44, font: 'Teko', weight: 500, spacing: 10, color: '@accent' } } }, { in: 'down' });
      place(l, 0.5, 0, W / 2, st.y + st.h + 10 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 60, items: [{ m: 'distance', on: true }, { m: 'avgPace', on: true }, { m: 'time', on: true }], valueTS: { size: 70, font: 'Teko', weight: 600, ...SH }, unitTS: { size: 30, font: 'Teko', ...SH }, labelTS: { size: 18, ...SH } } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 1, W / 2, H - M - 60 * u);
      const nm = mk('text', { props: { text: '{name} · {date}', align: 'center', ts: { size: 28, weight: 600, ...SH } } }, { in: 'up' });
      k.fitW(nm, W - 2 * M); place(nm, 0.5, 1, W / 2, grid.y - 40 * u);
    },
  },
  {
    id: 'justnumbers', name: 'Just the Numbers', desc: 'Three huge numbers, nothing else',
    build(k) {
      const { W, M, mk, place, u } = k;
      let y = M + 80 * u;
      for (const m of ['distance', 'time', 'avgPace']) {
        const s = mk('stat', { props: { metric: m, layout: 'classic', valueTS: { size: 240, font: 'Inter', weight: 200, spacing: -6, ...SH }, unitTS: { size: 60, font: 'Inter', weight: 300, ...SH }, labelTS: { size: 22, spacing: 6, ...SH } } }, { in: 'up' });
        k.fitW(s, W - 2 * M); place(s, 0, 0, M, y); y += s.h + 90 * u;
      }
    },
  },
  {
    id: 'graphhero', name: 'Graph Hero', desc: 'Full-width pace mountain across the bottom',
    bg: { type: 'gradient', color: '#0f0c29', color2: '#302b63', angle: 180 }, theme: { accent: '#00d2ff', accent2: '#3a7bd5' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const g = mk('graph', { props: { metric: 'pace', design: 'gradArea', lineColor: '@accent', fillColor: '@accent', fillOpacity: 0.7, lineW: 6, showTitle: false, showY: false, showX: false, grid: false, showAvg: false, smooth: 45 } }, { w: W / u, h: 900, in: 'wipe' });
      place(g, 0, 1, 0, H);
      const big = mk('stat', { props: { metric: 'avgPace', layout: 'classic', valueTS: { size: 230, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 60, font: 'Space Grotesk' }, labelTS: { size: 26, spacing: 6 } } }, { in: 'down' });
      k.fitW(big, W - 2 * M); place(big, 0, 0, M, M + 60 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', cellGapX: 50, items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 60, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 24 }, labelTS: { size: 18 } } }, { in: 'down' });
      k.fitW(grid, W - 2 * M); place(grid, 0, 0, M, big.y + big.h + 50 * u);
      const nm = mk('text', { props: { text: '{name} · {date}', ts: { size: 30, font: 'Space Grotesk', weight: 600, color: '@muted', role: 'muted' } } }, { in: 'down' });
      k.fitW(nm, W - 2 * M); place(nm, 0, 0, M, grid.y + grid.h + 40 * u);
    },
  },
  {
    id: 'neonsign', name: 'Neon Sign', desc: 'Glowing sign lettering on a dark wall',
    bg: { type: 'gradient', color: '#14080e', color2: '#0b0b12', angle: 180, kind: 'radial' }, theme: { accent: '#ff3cac', accent2: '#2bd2ff' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const glow = (c) => ({ fill: 'none', stroke: 4, strokeColor: c, shadow: true, shadowColor: c, shadowBlur: 34, shadowX: 0, shadowY: 0 });
      const t = mk('text', { props: { text: 'Run\nClub', align: 'center', ts: { size: 230, font: 'Righteous', weight: 400, lineHeight: 0.95, ...glow('#ff3cac') } } }, { in: 'blur' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0, W / 2, M + 80 * u);
      const big = mk('stat', { props: { metric: 'distance', layout: 'classic', align: 'center', showLabel: false, valueTS: { size: 200, font: 'Righteous', weight: 400, ...glow('#2bd2ff') }, unitTS: { size: 70, font: 'Righteous', weight: 400, ...glow('#2bd2ff') } } }, { in: 'blur' });
      k.fitW(big, W - 2 * M); place(big, 0.5, 0, W / 2, t.y + t.h + 80 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 60, items: [{ m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 64, font: 'Righteous', weight: 400, shadow: true, shadowColor: '#ff3cac', shadowBlur: 20, shadowX: 0, shadowY: 0 }, unitTS: { size: 24 }, labelTS: { size: 18 } } }, { in: 'fade' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 0, W / 2, big.y + big.h + 80 * u);
      const nm = mk('text', { props: { text: '{name} · {date}', align: 'center', ts: { size: 28, weight: 600, color: '@muted', role: 'muted' } } });
      k.fitW(nm, W - 2 * M); place(nm, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'dualgraph', name: 'Pace + Heart', desc: 'Pace and heart-rate graphs stacked on one timeline',
    bg: { type: 'gradient', color: '#111827', color2: '#030712', angle: 180 }, theme: { accent: '#34d399', accent2: '#f87171' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const nm = mk('text', { props: { text: '{name}', ts: { size: 70, font: 'Inter', weight: 800 } } }, { in: 'down' });
      k.fitW(nm, W - 2 * M); place(nm, 0, 0, M, M + 20 * u);
      const sub = mk('text', { props: { text: '{date} · {distance} {unit} · {time}', ts: { size: 30, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'down' });
      k.fitW(sub, W - 2 * M); place(sub, 0, 0, M, nm.y + nm.h + 14 * u);
      const gh = 560;
      const pg = mk('graph', { props: { metric: 'pace', design: 'gradArea', lineColor: '@accent', fillColor: '@accent', title: 'Pace', showX: false } }, { w: (W - 2 * M) / u, h: gh, in: 'wipe' });
      place(pg, 0, 0, M, sub.y + sub.h + 60 * u);
      const hg = mk('graph', { props: { metric: 'hr', design: 'gradArea', lineColor: '@accent2', fillColor: '@accent2', title: 'Heart rate', colorMode: 'solid' } }, { w: (W - 2 * M) / u, h: gh, in: 'wipe' });
      place(hg, 0, 0, M, pg.y + pg.h + 50 * u);
      const grid = mk('statgrid', { skin: 'glass', props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 36, items: [{ m: 'avgPace', on: true }, { m: 'avgHr', on: true }, { m: 'maxHr', on: true }, { m: 'avgCad', on: true }], valueTS: { size: 46, weight: 800 }, unitTS: { size: 20 }, labelTS: { size: 15 } }, style: { padX: 30, padY: 24 } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'polaroid', name: 'Polaroid', desc: 'Instant-photo frame with a handwritten caption',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const fw = W - 2 * M - 40 * u, fh = fw * 1.22;
      const frame = mk('shape', { name: 'Photo frame', props: { shape: 'rect', fill: 'none', strokeW: 46, strokeColor: '#fbfbf8', radius: 4 } }, { w: fw / u, h: fh / u, in: 'drop' });
      place(frame, 0.5, 0, W / 2, M + 60 * u);
      const chin = card(k, '#fbfbf8', fw, 260 * u, 4, 'drop');
      place(chin, 0.5, 0, W / 2, frame.y + frame.h - 23 * u);
      const cap = mk('text', { props: { text: '{name} ♥', align: 'center', ts: { size: 76, font: 'Caveat', weight: 700, color: '#1f2937' } } }, { in: 'fade' });
      k.fitW(cap, fw - 80 * u); place(cap, 0.5, 0, W / 2, chin.y + 40 * u);
      const st = mk('text', { props: { text: '{distance} {unit} · {time} · {avgPace}{paceunit}', align: 'center', ts: { size: 44, font: 'Caveat', weight: 600, color: '#475569' } } }, { in: 'fade' });
      k.fitW(st, fw - 80 * u); place(st, 0.5, 0, W / 2, cap.y + cap.h + 16 * u);
      const tape = mk('shape', { name: 'Tape', props: { shape: 'rect', color: '#fde68acc', radius: 2 } }, { w: 260, h: 70, in: 'fade', anim: false });
      tape.rot = -6; place(tape, 0.5, 0.5, W / 2, frame.y + 6 * u);
      const d = mk('text', { props: { text: '{date}', align: 'right', ts: { size: 40, font: 'Caveat', weight: 600, color: '#475569' } } }, { in: 'fade' });
      place(d, 1, 1, frame.x + frame.w - 40 * u, chin.y + chin.h - 20 * u);
    },
  },
  {
    id: 'calendarpage', name: 'Calendar Page', desc: 'Tear-off calendar page for today’s run',
    bg: { type: 'gradient', color: '#e0e7ff', color2: '#c7d2fe', angle: 160 }, theme: { text: '#111827', muted: '#11182799', accent: '#dc2626', accent2: '#1f2937' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const pw = W - 2 * M - 60 * u, ph = 1200 * u;
      const page = card(k, '#ffffff', pw, ph, 30, 'drop', { });
      place(page, 0.5, 0, W / 2, M + 60 * u);
      const top = card(k, '#dc2626', pw, 200 * u, 30, 'drop');
      place(top, 0.5, 0, W / 2, page.y);
      const day = mk('stat', { props: { metric: 'date', layout: 'valueOnly', align: 'center', dateStyle: 'weekday', valueTS: { size: 90, font: 'Oswald', weight: 700, color: '#ffffff', transform: 'upper', spacing: 6 } } }, { in: 'fade' });
      k.fitW(day, pw - 80 * u); place(day, 0.5, 0.5, W / 2, top.y + top.h / 2);
      const dt = mk('text', { props: { text: '{date}', align: 'center', ts: { size: 64, font: 'Oswald', weight: 600, color: '#111827' } } }, { in: 'fade' });
      k.fitW(dt, pw - 80 * u); place(dt, 0.5, 0, W / 2, top.y + top.h + 50 * u);
      const big = mk('stat', { props: { metric: 'distance', layout: 'stackUnit', align: 'center', showLabel: false, valueTS: { size: 300, font: 'Oswald', weight: 700, color: '#111827' }, unitTS: { size: 70, font: 'Oswald', color: '#dc2626' } } }, { in: 'pop' });
      k.fitW(big, pw - 120 * u); place(big, 0.5, 0, W / 2, dt.y + dt.h + 40 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 50, dividers: true, dividerColor: '#11182722', items: [{ m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'startTime', on: true }], valueTS: { size: 52, font: 'Oswald', weight: 600, color: '#111827' }, unitTS: { size: 22, color: '#11182799' }, labelTS: { size: 16, color: '#11182799' } } }, { in: 'up' });
      k.fitW(grid, pw - 100 * u); place(grid, 0.5, 1, W / 2, page.y + page.h - 60 * u);
      const nm = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 44, font: 'Caveat', weight: 700, color: '#1f2937' } } }, { in: 'fade' });
      k.fitW(nm, W - 2 * M); place(nm, 0.5, 0, W / 2, page.y + page.h + 50 * u);
    },
  },
  {
    id: 'blueprint', name: 'Blueprint', desc: 'Technical drawing of your route',
    bg: { type: 'solid', color: '#0d3b66' }, theme: { text: '#e0f2fe', muted: '#e0f2feaa', accent: '#ffffff', accent2: '#7dd3fc' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      for (let i = 1; i < 10; i++) { const v = mk('shape', { name: 'Grid', props: { shape: 'line', color: '#ffffff18', strokeW: 2 } }, { w: H / u, h: 4, anim: false }); v.rot = 90; place(v, 0.5, 0.5, (W * i) / 10, H / 2); }
      for (let i = 1; i < 18; i++) { const h = mk('shape', { name: 'Grid', props: { shape: 'line', color: '#ffffff18', strokeW: 2 } }, { w: W / u, h: 4, anim: false }); place(h, 0, 0.5, 0, (H * i) / 18); }
      const t = mk('text', { props: { text: 'ROUTE PLAN · REV. A', ts: { size: 50, font: 'Michroma', weight: 400, spacing: 4 } } }, { in: 'fade' });
      k.fitW(t, W - 2 * M); place(t, 0, 0, M, M);
      const map = mk('map', { props: { line: 'dashed', color: '#ffffff', width: 6, start: 'ring', end: 'ring', dot: 'none', kmMarkers: 'numbers', kmColor: '#7dd3fc', markerColor: '#ffffff' }, style: { borderW: 3, borderColor: '#ffffffaa', padX: 30, padY: 30, radius: 0 } }, { w: (W - 2 * M) / u, h: 1000, in: 'wipe' });
      place(map, 0, 0, M, t.y + t.h + 40 * u);
      const spec = mk('statgrid', { props: { cols: 2, layout: 'inline', cellGapX: 50, cellGapY: 22, items: [{ m: 'distance', on: true, label: 'LENGTH' }, { m: 'time', on: true, label: 'DURATION' }, { m: 'avgPace', on: true, label: 'RATE' }, { m: 'ascent', on: true, label: 'RISE' }, { m: 'avgHr', on: true, label: 'LOAD' }, { m: 'date', on: true, label: 'DATE' }], valueTS: { size: 40, font: 'Michroma', weight: 400 }, unitTS: { size: 18, font: 'Michroma' }, labelTS: { size: 18, font: 'Michroma', color: '#7dd3fc' }, dateStyle: 'iso' }, style: { borderW: 3, borderColor: '#ffffffaa', padX: 30, padY: 26, radius: 0 } }, { in: 'up' });
      k.fitW(spec, W - 2 * M); place(spec, 0, 0, M, map.y + map.h + 40 * u);
      const nm = mk('text', { props: { text: 'DWG: {name}', ts: { size: 26, font: 'Michroma', weight: 400, color: '@muted', role: 'muted' } } }, { in: 'fade' });
      k.fitW(nm, W - 2 * M); place(nm, 0, 1, M, H - M);
    },
  },
  {
    id: 'duotone', name: 'Duotone Split', desc: 'Diagonal two-colour split with bold stats',
    bg: { type: 'gradient', color: '#ff6b6b', color2: '#4ecdc4', angle: 135 }, theme: { text: '#ffffff', muted: '#ffffffd9', accent: '#ffffff', accent2: '#1a1a2e' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const band = mk('shape', { name: 'Band', props: { shape: 'rect', color: '#1a1a2e', radius: 0 } }, { w: (W * 1.6) / u, h: 520, in: 'wipe', delay: 0 });
      band.rot = -12; place(band, 0.5, 0.5, W / 2, H * 0.5);
      const big = mk('stat', { props: { metric: 'distance', layout: 'classic', align: 'center', showLabel: false, valueTS: { size: 260, font: 'Unbounded', weight: 800 }, unitTS: { size: 70, font: 'Unbounded', weight: 700 } } }, { in: 'pop' });
      big.rot = -12; k.fitW(big, W - 2 * M); place(big, 0.5, 0.5, W / 2, H * 0.5);
      const nm = mk('text', { props: { text: '{name}', ts: { size: 70, font: 'Unbounded', weight: 800 } } }, { in: 'down' });
      k.fitW(nm, W - 2 * M); place(nm, 0, 0, M, M + 40 * u);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 30, font: 'Unbounded', weight: 500 } } }, { in: 'down' });
      place(d, 0, 0, M, nm.y + nm.h + 14 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 50, items: [{ m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 64, font: 'Unbounded', weight: 700 }, unitTS: { size: 24 }, labelTS: { size: 18 } } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 1, W / 2, H - M - 40 * u);
    },
  },
];

export const PACK4_MULTI = [
  {
    id: 'gazette', name: 'Weekly Gazette', desc: 'Newspaper front page for your week',
    bg: { type: 'solid', color: '#f3efe6' }, theme: { text: '#141414', muted: '#141414aa', accent: '#141414', accent2: '#8b0000' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const mast = mk('text', { props: { text: 'The Weekly Run', align: 'center', ts: { size: 104, font: 'DM Serif Display', weight: 400 } } }, { in: 'fade' });
      k.fitW(mast, W - 2 * M); place(mast, 0.5, 0, W / 2, M);
      const r1 = rule(k, M, mast.y + mast.h + 20 * u, W - 2 * M, '#141414', 4);
      const dl = mk('text', { props: { text: 'WEEK {week}  ·  {range}', align: 'center', ts: { size: 24, weight: 700, spacing: 3 } } }, { in: 'fade' });
      k.fitW(dl, W - 2 * M); place(dl, 0.5, 0, W / 2, r1.y + 22 * u);
      const r2 = rule(k, M, dl.y + dl.h + 20 * u, W - 2 * M, '#141414', 2);
      const hl = mk('text', { props: { text: '{runs} RUNS, {distance} {unit}:\nA WEEK TO REMEMBER', ts: { size: 80, font: 'Playfair Display', weight: 900, lineHeight: 1.05 } } }, { in: 'up' });
      k.fitW(hl, W - 2 * M); place(hl, 0, 0, M, r2.y + 40 * u);
      const list = mk('mlist', { props: { design: 'lines', lineColor: '#14141433', rowScale: 1.9, colGap: 40, columns: [{ k: 'day', on: true }, { k: 'name', on: true }, { k: 'dist', on: true }, { k: 'time', on: true }, { k: 'pace', on: true }], cellTS: { size: 40, font: 'Playfair Display', weight: 400, color: '#141414' }, nameTS: { size: 40, font: 'Playfair Display', weight: 700, color: '#141414' }, dayTS: { size: 32, font: 'Inter', weight: 800, color: '#8b0000' }, headerTS: { size: 22, color: '#141414aa' } } }, { in: 'fade' });
      k.fitW(list, W - 2 * M); place(list, 0, 0, M, hl.y + hl.h + 50 * u);
      const bars = mk('mbars', { props: { design: 'bars', color: '#141414', hlColor: '#8b0000', track: '#14141412', dayTS: { color: '#141414aa' }, valueTS: { color: '#141414', font: 'Playfair Display' } } }, { w: (W - 2 * M) / u, h: 380, in: 'wipe' });
      place(bars, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'terminalweek', name: 'Terminal Week', desc: 'Command-line printout of the week',
    bg: { type: 'solid', color: '#0a0f0a' }, theme: { text: '#39ff14', muted: '#39ff14aa', accent: '#39ff14', accent2: '#ffffff' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const mono = { font: 'JetBrains Mono' };
      const win = card(k, '#0f1a0f', W - 2 * M, H - 2 * M - 200 * u, 18, 'fade', { strokeW: 2, strokeColor: '#39ff1455' });
      place(win, 0.5, 0, W / 2, M + 100 * u);
      const P = win.x + 40 * u;
      const cmd = mk('text', { props: { text: '$ lari --week {week}', ts: { size: 38, weight: 700, ...mono } } }, { in: 'typewriter' });
      place(cmd, 0, 0, P, win.y + 50 * u);
      const out = mk('text', { props: { text: '> period ...... {range}\n> runs ........ {runs}\n> distance .... {distance} {unit}\n> time ........ {time}\n> avg_pace .... {avgPace}\n> longest ..... {longest}\n> climb ....... {ascent}', ts: { size: 34, weight: 500, lineHeight: 1.7, ...mono } } }, { in: 'typewriter', dur: 1.6 });
      k.fitW(out, win.w - 80 * u); place(out, 0, 0, P, cmd.y + cmd.h + 40 * u);
      const list = mk('mlist', { props: { design: 'minimal', rowScale: 1.7, columns: [{ k: 'day', on: true }, { k: 'dist', on: true }, { k: 'time', on: true }, { k: 'pace', on: true }], cellTS: { size: 32, ...mono, weight: 500 }, dayTS: { size: 30, ...mono, color: '#ffffff' }, headerTS: { size: 20, ...mono } } }, { in: 'fade' });
      k.fitW(list, win.w - 80 * u); place(list, 0, 0, P, out.y + out.h + 50 * u);
      const done = mk('text', { props: { text: '$ exit 0  ✓ week saved', ts: { size: 30, weight: 700, ...mono } } }, { in: 'typewriter' });
      place(done, 0, 1, P, win.y + win.h - 36 * u);
    },
  },
  {
    id: 'nutritionweek', name: 'Weekly Facts', desc: 'Nutrition-label style weekly totals',
    bg: { type: 'solid', color: '#e8e4da' }, theme: { text: '#000000', muted: '#000000aa', accent: '#000000', accent2: '#000000' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const lw = 820 * u;
      const lbl = card(k, '#ffffff', lw, 1460 * u, 4, 'up', { strokeW: 6, strokeColor: '#000000' });
      place(lbl, 0.5, 0.5, W / 2, H / 2);
      const L = lbl.x + 40 * u, IW = lw - 80 * u;
      const t = mk('text', { props: { text: 'Week Facts', ts: { size: 110, font: 'Archivo Black', weight: 400, color: '#000000' } } }, { in: 'fade' });
      k.fitW(t, IW); place(t, 0, 0, L, lbl.y + 30 * u);
      const r0 = rule(k, L, t.y + t.h + 14 * u, IW, '#000000', 3);
      const sv = mk('text', { props: { text: '{runs} servings · {range}', ts: { size: 30, font: 'Inter', weight: 500, color: '#000000' } } }, { in: 'fade' });
      k.fitW(sv, IW); place(sv, 0, 0, L, r0.y + 20 * u);
      const r1 = rule(k, L, sv.y + sv.h + 20 * u, IW, '#000000', 18);
      const big = mk('stat', { props: { metric: 'distance', layout: 'inline', label: 'Distance', valueTS: { size: 90, font: 'Archivo Black', weight: 400, color: '#000000' }, unitTS: { size: 40, font: 'Archivo Black', weight: 400, color: '#000000' }, labelTS: { size: 56, font: 'Archivo Black', weight: 400, color: '#000000', transform: 'none', spacing: 0 } } }, { in: 'fade' });
      k.fitW(big, IW); place(big, 0, 0, L, r1.y + 30 * u);
      const r2 = rule(k, L, big.y + big.h + 20 * u, IW, '#000000', 10);
      const grid = mk('statgrid', { props: { cols: 1, layout: 'inline', cellGapY: 34, dividers: true, dividerColor: '#000000', items: [{ m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }, { m: 'longest', on: true }, { m: 'avgDist', on: true }, { m: 'ascent', on: true }, { m: 'activeDays', on: true }], valueTS: { size: 52, font: 'Inter', weight: 800, color: '#000000' }, unitTS: { size: 32, font: 'Inter', weight: 500, color: '#000000' }, labelTS: { size: 40, font: 'Inter', weight: 800, color: '#000000', transform: 'none', spacing: 0 } } }, { in: 'fade' });
      k.fitW(grid, IW); place(grid, 0, 0, L, r2.y + 30 * u);
      const r3 = rule(k, L, grid.y + grid.h + 30 * u, IW, '#000000', 10);
      const ft = mk('text', { props: { text: '* Percent Weekly Effort: 100%.\nContains: early alarms, sweat.', ts: { size: 24, font: 'Inter', weight: 500, color: '#000000', lineHeight: 1.4 } } }, { in: 'fade' });
      k.fitW(ft, IW); place(ft, 0, 0, L, r3.y + 24 * u);
      fitCard(k, lbl, ft, 40 * u);
    },
  },
  {
    id: 'routeposter', name: 'Route Poster Week', desc: 'All routes overlaid, poster style',
    bg: { type: 'solid', color: '#f5f2ec' }, theme: { text: '#1f2937', muted: '#1f2937aa', accent: '#dc2626', accent2: '#1f2937' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const g = mk('mroutes', { props: { design: 'overlay', palette: true, width: 6, glow: 0, cellBg: '#00000000', showLabel: false } }, { w: (W - 2 * M) / u, h: 1150, in: 'fade' });
      place(g, 0.5, 0, W / 2, M + 40 * u);
      const t = mk('text', { props: { text: '{title}', align: 'center', ts: { size: 76, font: 'Montserrat', weight: 800, transform: 'upper', spacing: 16 } } }, { in: 'up' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0, W / 2, g.y + g.h + 60 * u);
      const r = rule(k, W / 2 - 80 * u, t.y + t.h + 30 * u, 160 * u, '#1f2937', 3);
      const sub = mk('text', { props: { text: '{runs} runs  ·  {distance} {unit}  ·  {time}', align: 'center', ts: { size: 30, font: 'Montserrat', weight: 500, spacing: 6 } } }, { in: 'up' });
      k.fitW(sub, W - 2 * M); place(sub, 0.5, 0, W / 2, r.y + 34 * u);
      const d = mk('text', { props: { text: '{range}', align: 'center', ts: { size: 24, font: 'Montserrat', weight: 400, spacing: 10, transform: 'upper', color: '@muted', role: 'muted' } } }, { in: 'up' });
      place(d, 0.5, 0, W / 2, sub.y + sub.h + 20 * u);
    },
  },
  {
    id: 'levelweek', name: 'Level Up Week', desc: 'Retro game screen for the week',
    bg: { type: 'solid', color: '#1b1033' }, theme: { text: '#ffffff', muted: '#c4b5fd', accent: '#facc15', accent2: '#22d3ee' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: 'WEEK {week}\nCLEARED!', align: 'center', ts: { size: 120, font: 'Black Ops One', weight: 400, color: '@accent', lineHeight: 1, stroke: 8, strokeColor: '#7c3aed' } } }, { in: 'pop' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0, W / 2, M + 60 * u);
      const sc = mk('stat', { props: { metric: 'distance', layout: 'inline', label: 'XP', align: 'center', valueTS: { size: 110, font: 'Black Ops One', weight: 400 }, unitTS: { size: 40, font: 'Black Ops One', weight: 400 }, labelTS: { size: 44, font: 'Black Ops One', weight: 400, color: '@accent2' } } }, { in: 'up' });
      k.fitW(sc, W - 2 * M); place(sc, 0.5, 0, W / 2, t.y + t.h + 70 * u);
      const cal = mk('mcal', { props: { design: 'squares', color: '@accent', textOn: '#1b1033', empty: '#ffffff1f' } }, { w: (W - 2 * M) / u, h: 220, in: 'up' });
      place(cal, 0, 0, M, sc.y + sc.h + 60 * u);
      const grid = mk('statgrid', { skin: 'solidDark', props: { cols: 2, layout: 'inline', cellGapX: 50, cellGapY: 30, items: [{ m: 'runs', on: true, label: 'QUESTS' }, { m: 'time', on: true, label: 'TIME' }, { m: 'longest', on: true, label: 'BOSS' }, { m: 'avgPace', on: true, label: 'SPEED' }], valueTS: { size: 84, font: 'Black Ops One', weight: 400 }, unitTS: { size: 34 }, labelTS: { size: 36, font: 'Black Ops One', weight: 400, color: '@accent2' } }, style: { padX: 40, padY: 34, borderW: 5, borderColor: '#7c3aed', radius: 0 } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 0, W / 2, cal.y + cal.h + 60 * u);
      const lb = mk('mbars', { skin: 'solidDark', props: { design: 'bars', radius: 0, color: '@accent', hlColor: '@accent2', track: '#ffffff12', dayTS: { font: 'Black Ops One', weight: 400 }, valueTS: { font: 'Black Ops One', weight: 400 } }, style: { padX: 34, padY: 30, borderW: 5, borderColor: '#7c3aed', radius: 0 } }, { w: (W - 2 * M) / u, h: 400, in: 'wipe' });
      place(lb, 0.5, 0, W / 2, grid.y + grid.h + 50 * u);
      const p = mk('text', { props: { text: 'PRESS START FOR NEXT WEEK', align: 'center', ts: { size: 34, font: 'Black Ops One', weight: 400, color: '@muted', role: 'muted' } } }, { in: 'fade', delay: 1.4 });
      k.fitW(p, W - 2 * M); place(p, 0.5, 1, W / 2, H - M - 40 * u);
    },
  },
  {
    id: 'certweek', name: 'Week Certificate', desc: 'Certificate for a completed training week',
    bg: { type: 'solid', color: '#fbf6e9' }, theme: { text: '#2b2118', muted: '#2b2118aa', accent: '#b8860b', accent2: '#7c2d12' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const outer = mk('shape', { name: 'Border', props: { shape: 'rect', fill: 'none', strokeW: 10, strokeColor: '#b8860b', radius: 0 } }, { w: (W - M) / u, h: (H - M) / u, in: 'fade' });
      place(outer, 0.5, 0.5, W / 2, H / 2);
      const medal = mk('sticker', { props: { kind: 'icon', icon: 'award', color: '#b8860b', strokeW: 1.8 } }, { w: 220, h: 220, in: 'drop' });
      place(medal, 0.5, 0, W / 2, M + 90 * u);
      const t = mk('text', { props: { text: 'Certificate', align: 'center', ts: { size: 120, font: 'DM Serif Display', weight: 400 } } }, { in: 'up' });
      place(t, 0.5, 0, W / 2, medal.y + medal.h + 30 * u);
      const st = mk('text', { props: { text: 'OF CONSISTENCY', align: 'center', ts: { size: 34, font: 'Playfair Display', weight: 700, spacing: 12, color: '@accent', role: 'accent' } } }, { in: 'up' });
      place(st, 0.5, 0, W / 2, t.y + t.h + 10 * u);
      const pr = mk('text', { props: { text: 'for completing {runs} runs during', align: 'center', ts: { size: 32, font: 'Playfair Display', italic: true, weight: 400 } } }, { in: 'fade' });
      place(pr, 0.5, 0, W / 2, st.y + st.h + 80 * u);
      const nm = mk('text', { props: { text: '{range}', align: 'center', ts: { size: 84, font: 'Caveat', weight: 700, color: '@accent2' } } }, { in: 'fade' });
      k.fitW(nm, W - 3 * M); place(nm, 0.5, 0, W / 2, pr.y + pr.h + 30 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 60, items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'longest', on: true }], valueTS: { size: 84, font: 'DM Serif Display', weight: 400 }, unitTS: { size: 32, font: 'Playfair Display', italic: true }, labelTS: { size: 18, font: 'Playfair Display' } } }, { in: 'up' });
      k.fitW(grid, W - 3 * M); place(grid, 0.5, 0, W / 2, nm.y + nm.h + 100 * u);
      const cal = mk('mcal', { props: { design: 'rings', color: '#b8860b', empty: '#2b211822', textOn: '#2b2118' } }, { w: (W - 3 * M) / u, h: 200, in: 'up' });
      place(cal, 0.5, 1, W / 2, H - M - 90 * u);
    },
  },
  {
    id: 'justnumbersweek', name: 'Week in Numbers', desc: 'Four huge weekly numbers, nothing else',
    build(k) {
      const { W, M, mk, place, u } = k;
      let y = M + 60 * u;
      for (const m of ['distance', 'runs', 'time', 'avgPace']) {
        const s = mk('stat', { props: { metric: m, layout: 'classic', valueTS: { size: 200, font: 'Inter', weight: 200, spacing: -5, ...SH }, unitTS: { size: 54, font: 'Inter', weight: 300, ...SH }, labelTS: { size: 22, spacing: 6, ...SH } } }, { in: 'up' });
        k.fitW(s, W - 2 * M); place(s, 0, 0, M, y); y += s.h + 70 * u;
      }
    },
  },
  {
    id: 'duoweek', name: 'Duotone Week', desc: 'Diagonal band with the weekly total',
    bg: { type: 'gradient', color: '#ff6b6b', color2: '#4ecdc4', angle: 135 }, theme: { text: '#ffffff', muted: '#ffffffd9', accent: '#ffffff', accent2: '#1a1a2e' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const band = mk('shape', { name: 'Band', props: { shape: 'rect', color: '#1a1a2e', radius: 0 } }, { w: (W * 1.6) / u, h: 520, in: 'wipe', delay: 0 });
      band.rot = -12; place(band, 0.5, 0.5, W / 2, H * 0.48);
      const big = mk('stat', { props: { metric: 'distance', layout: 'classic', align: 'center', showLabel: false, valueTS: { size: 260, font: 'Unbounded', weight: 800 }, unitTS: { size: 70, font: 'Unbounded', weight: 700 } } }, { in: 'pop' });
      big.rot = -12; k.fitW(big, W - 2 * M); place(big, 0.5, 0.5, W / 2, H * 0.48);
      const t = mk('text', { props: { text: '{title}', ts: { size: 70, font: 'Unbounded', weight: 800 } } }, { in: 'down' });
      k.fitW(t, W - 2 * M); place(t, 0, 0, M, M + 40 * u);
      const d = mk('text', { props: { text: '{range}', ts: { size: 30, font: 'Unbounded', weight: 500 } } }, { in: 'down' });
      place(d, 0, 0, M, t.y + t.h + 14 * u);
      const bars = mk('mbars', { props: { design: 'pills', color: '#ffffff', track: '#ffffff33', hlColor: '#1a1a2e', dayTS: { color: '#ffffffd9' }, valueTS: { color: '#ffffff' } } }, { w: (W - 2 * M) / u, h: 360, in: 'wipe' });
      place(bars, 0.5, 1, W / 2, H - M);
    },
  },
];
