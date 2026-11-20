// Template pack 6 (v1.6): more multi-run templates with details for every run.
const SH = { shadow: true, shadowColor: '#000000aa', shadowBlur: 14, shadowX: 0, shadowY: 3 };

function fitTo(k, el, maxW, grow = 1.7) {
  const f = Math.min(maxW / el.w, grow);
  if (f < 1) k.fitW(el, maxW); else if (f > 1.02) { el.s *= f; k.relayout(el); }
  return el;
}
const nRuns = (k) => (k.env.multi && k.env.multi.list.length) || 5;
const cards = (k, over, w, h, opt = {}) => k.mk('mcards', over, { w: w / k.u, h: h / k.u, in: 'fade', ...opt });

export const PACK6_MULTI = [
  {
    id: 'polaroidwall', name: 'Polaroid Wall', desc: 'White photo-style cards for every run on a cork board',
    bg: { type: 'gradient', color: '#c9a27e', color2: '#a87d58', angle: 160 }, theme: { text: '#1f1a17', muted: '#1f1a17a0', accent: '#b91c1c', accent2: '#1d4ed8' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: '{title}', ts: { size: 96, font: 'Caveat', weight: 700, color: '#ffffff', ...SH } } }, { in: 'down' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range} · {runs} runs · {distance} {unit}', ts: { size: 34, font: 'Caveat', weight: 600, color: '#ffffff', ...SH } } }, { in: 'down' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 6 * u);
      const top = r.y + r.h + 40 * u;
      const c = cards(k, { props: { design: 'grid', cols: 2, cardBg: '#fdfcf8', radius: 6, gap: 26, pad: 24, routeColor: '#1f1a17', routeBg: '#efe9df', routeWidth: 5, accentBar: false, hlColor: '@accent',
        nameTS: { font: 'Caveat', weight: 700, size: 44, color: '#1f1a17' }, dateTS: { color: '@accent', font: 'Caveat', size: 30, transform: 'none', spacing: 0 }, valueTS: { font: 'Inter', weight: 800, color: '#1f1a17' }, unitTS: { color: '#1f1a17a0' }, labelTS: { color: '#1f1a17a0' } } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'runjournal', name: 'Run Journal', desc: 'Handwritten journal timeline, one entry per run',
    bg: { type: 'solid', color: '#fbf8f1' }, theme: { text: '#1e293b', muted: '#1e293b99', accent: '#2563eb', accent2: '#db2777' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: 'Dear running diary,', ts: { size: 76, font: 'Caveat', weight: 700 } } }, { in: 'fade' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: 'this week I ran {runs} times, {distance} {unit} in {time}.', ts: { size: 40, font: 'Caveat', weight: 600, color: '@accent', role: 'accent' } } }, { in: 'fade' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 8 * u);
      const top = r.y + r.h + 44 * u;
      const c = cards(k, { props: { design: 'timeline', cardBg: '#ffffff', routeColor: '@accent', routeBg: '#eff6ff', accent: '@accent2', hlColor: '@accent2', lineColor: '#1e293b33', dateStyle: 'short',
        nameTS: { font: 'Caveat', weight: 700, color: '#1e293b' }, dateTS: { color: '@accent2' }, valueTS: { font: 'Inter', weight: 700, color: '#1e293b' }, unitTS: { color: '#1e293b99' }, labelTS: { color: '#1e293b88' } } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'heatweek2', name: 'Heat Week Cards', desc: 'Heat calendar strip with compact run cards',
    bg: { type: 'gradient', color: '#2e1065', color2: '#0c0518', angle: 180 }, theme: { accent: '#fb923c', accent2: '#facc15' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 30 * u;
      const t = mk('text', { props: { text: '{title}', ts: { size: 84, font: 'Kanit', weight: 800 } } }, { in: 'left' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range}', ts: { size: 30, font: 'Kanit', weight: 500, color: '@accent', role: 'accent' } } }, { in: 'left' });
      place(r, 0, 0, M, t.y + t.h + 6 * u);
      const cal = mk('mcal', { props: { design: 'heat' } }, { w: IW / u, h: 230, in: 'up' });
      place(cal, 0, 0, M, r.y + r.h + G);
      const g = mk('statgrid', { props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 40, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }], valueTS: { size: 52, font: 'Kanit', weight: 700 }, unitTS: { size: 20 }, labelTS: { size: 15 } } }, { in: 'up' });
      fitTo(k, g, IW); place(g, 0.5, 0, W / 2, cal.y + cal.h + G);
      const top = g.y + g.h + G * 1.4;
      const c = cards(k, { props: { design: 'compact', cardBg: '#ffffff12', routeBg: '', routeColor: '@accent', palette: false, accent: '@accent2', nameTS: { font: 'Kanit', weight: 600 }, valueTS: { font: 'Kanit', weight: 600 } } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'statmatrix', name: 'Stat Matrix', desc: 'Every run in a boxed grid with type, HR, climb and cadence',
    bg: { type: 'solid', color: '#0b1220' }, theme: { accent: '#22d3ee', accent2: '#a3e635' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 34 * u;
      const t = mk('text', { props: { text: 'WEEK {week} DATA', ts: { size: 80, font: 'Rajdhani', weight: 700, spacing: 2 } } }, { in: 'left' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range}', ts: { size: 30, font: 'Rajdhani', weight: 600, color: '@accent', role: 'accent' } } }, { in: 'left' });
      place(r, 0, 0, M, t.y + t.h + 4 * u);
      const g = mk('statgrid', { skin: 'outline', props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 30, dividers: true, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 54, font: 'Rajdhani', weight: 700 }, unitTS: { size: 22 }, labelTS: { size: 15 } }, style: { borderW: 1.5, borderColor: '#22d3ee66', padX: 24, padY: 22, radius: 6 } }, { in: 'up' });
      fitTo(k, g, IW); g.w = IW; place(g, 0, 0, M, r.y + r.h + G);
      const list = mk('mlist', { props: { design: 'boxed', rowScale: 1.9, colGap: 24, columns: [{ k: 'day', on: true }, { k: 'name', on: true }, { k: 'type', on: true }, { k: 'dist', on: true }, { k: 'time', on: true }, { k: 'pace', on: true }, { k: 'hr', on: true }, { k: 'elev', on: true }, { k: 'cad', on: true }], cellTS: { size: 26, font: 'Rajdhani', weight: 600 }, nameTS: { size: 26, font: 'Rajdhani', weight: 700 }, dayTS: { size: 24, font: 'Rajdhani' }, headerTS: { size: 16 } } }, { in: 'fade' });
      fitTo(k, list, IW); place(list, 0, 0, M, g.y + g.h + G);
      const top = list.y + list.h + G, R = H - M - top, half = (R - G) / 2;
      const dc = mk('mchart', { skin: 'outline', props: { metric: 'distance', design: 'hbars', color: '@accent', label: 'day', ramp: false }, style: { borderW: 1.5, borderColor: '#22d3ee44', padX: 22, padY: 20, radius: 6 } }, { w: (IW / 2 - G / 2) / u, h: R / u, in: 'wipe' });
      place(dc, 0, 0, M, top);
      const pc = mk('mchart', { skin: 'outline', props: { metric: 'avgPace', design: 'hbars', color: '@accent2', label: 'day' }, style: { borderW: 1.5, borderColor: '#a3e63544', padX: 22, padY: 20, radius: 6 } }, { w: (IW / 2 - G / 2) / u, h: R / u, in: 'wipe' });
      place(pc, 1, 0, W - M, top);
      void half;
    },
  },
  {
    id: 'boardingweek', name: 'Boarding Pass Week', desc: 'Ticket listing each run as a flight leg',
    bg: { type: 'gradient', color: '#1e3a8a', color2: '#0f172a', angle: 160 }, theme: { text: '#0f172a', muted: '#64748b', accent: '#2563eb', accent2: '#f59e0b' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const tk = mk('shape', { name: 'Ticket', props: { shape: 'rect', color: '#ffffff', radius: 32 } }, { w: IW / u, h: (H - 2 * M) / u, in: 'up' });
      place(tk, 0.5, 0, W / 2, M);
      const head = mk('shape', { name: 'Ticket head', props: { shape: 'rect', color: '#2563eb', radius: 32 } }, { w: IW / u, h: 150, in: 'up' });
      place(head, 0.5, 0, W / 2, M);
      const L = M + 46 * u, IW2 = IW - 92 * u;
      const ht = mk('text', { props: { text: 'BOARDING PASS · WEEK {week}', ts: { size: 36, font: 'Space Grotesk', weight: 700, color: '#ffffff', spacing: 4 } } }, { in: 'fade' });
      k.fitW(ht, IW2); place(ht, 0, 0.5, L, head.y + head.h / 2);
      const big = mk('stat', { props: { metric: 'distance', layout: 'inline', label: 'Total', valueTS: { size: 110, font: 'Space Grotesk', weight: 700, color: '#0f172a' }, unitTS: { size: 40, color: '#64748b' }, labelTS: { size: 22, color: '#64748b' } } }, { in: 'up' });
      fitTo(k, big, IW2, 1.2); place(big, 0, 0, L, head.y + head.h + 50 * u);
      const r = mk('text', { props: { text: '{range} · {runs} legs · {time}', ts: { size: 30, font: 'Space Grotesk', weight: 500, color: '#64748b' } } }, { in: 'up' });
      k.fitW(r, IW2); place(r, 0, 0, L, big.y + big.h + 14 * u);
      const top = r.y + r.h + 46 * u;
      const c = cards(k, { props: { design: 'list', cardBg: '#f1f5f9', routeColor: '#2563eb', routeBg: '#ffffff', accent: '@accent2', hlColor: '@accent2', fields: ['dist', 'time', 'pace', 'hr'],
        nameTS: { font: 'Space Grotesk', weight: 700, color: '#0f172a' }, dateTS: { color: '#2563eb' }, valueTS: { font: 'Space Grotesk', weight: 700, color: '#0f172a' }, unitTS: { color: '#64748b' }, labelTS: { color: '#64748b' } } }, IW2, tk.y + tk.h - 50 * u - top);
      place(c, 0, 0, L, top);
    },
  },
  {
    id: 'monthgrid', name: 'Month Grid', desc: 'Three-column cards — good for a month of runs',
    bg: { type: 'gradient', color: '#0f172a', color2: '#1e293b', angle: 180 }, theme: { accent: '#38bdf8', accent2: '#f472b6' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 30 * u;
      const t = mk('text', { props: { text: '{title}', ts: { size: 76, font: 'Space Grotesk', weight: 700 } } }, { in: 'down' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range}', ts: { size: 28, font: 'Space Grotesk', weight: 500, color: '@accent', role: 'accent' } } }, { in: 'down' });
      place(r, 0, 0, M, t.y + t.h + 6 * u);
      const g = mk('statgrid', { skin: 'glass', props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 36, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }, { m: 'longest', on: true }], valueTS: { size: 50, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 20 }, labelTS: { size: 14 } }, style: { padX: 26, padY: 22 } }, { in: 'up' });
      fitTo(k, g, IW); g.w = IW; place(g, 0, 0, M, r.y + r.h + G);
      const top = g.y + g.h + G;
      const c = cards(k, { props: { design: 'grid', cols: nRuns(k) > 12 ? 4 : 3, gap: 14, pad: 16, palette: true, routeGlow: 6, fields: ['dist', 'pace', 'time', 'hr'], statLabels: false, dateStyle: 'short', showName: nRuns(k) <= 12 } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'glassgrid', name: 'Glass Grid Overlay', desc: 'See-through run cards over your photo',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: '{title}', ts: { size: 80, font: 'Montserrat', weight: 900, ...SH } } }, { in: 'down' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range} · {distance} {unit} · {time}', ts: { size: 30, font: 'Montserrat', weight: 600, ...SH } } }, { in: 'down' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 8 * u);
      const top = H * 0.42;
      const c = cards(k, { props: { design: 'grid', cols: 2, cardBg: '#00000080', routeBg: '', routeColor: '#ffffff', routeWidth: 5, gap: 18, fields: ['dist', 'time', 'pace', 'hr'], dateTS: { color: '#ffffff' } } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'bulletin', name: 'Sports Bulletin', desc: 'Bold diagonal header and score-line rows per run',
    bg: { type: 'solid', color: '#111111' }, theme: { accent: '#ffcc00', accent2: '#e11d48' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const band = mk('shape', { name: 'Band', props: { shape: 'rect', color: '@accent', radius: 0 } }, { w: (W * 1.4) / u, h: 340, in: 'wipe', delay: 0 });
      band.rot = -6; place(band, 0.5, 0.5, W / 2, M + 150 * u);
      const t = mk('text', { props: { text: 'WEEK {week}\nRESULTS', ts: { size: 110, font: 'Anton', weight: 400, color: '#111111', lineHeight: 0.95 } } }, { in: 'left' });
      t.rot = -6; k.fitW(t, IW * 0.7); place(t, 0, 0.5, M, M + 150 * u);
      const big = mk('stat', { props: { metric: 'distance', layout: 'stackUnit', showLabel: false, decimals: 1, valueTS: { size: 120, font: 'Anton', weight: 400, color: '#111111' }, unitTS: { size: 40, font: 'Anton', weight: 400, color: '#111111' } } }, { in: 'pop' });
      big.rot = -6; k.fitW(big, IW * 0.3); place(big, 1, 0.5, W - M, M + 150 * u);
      const top = M + 360 * u;
      const c = cards(k, { props: { design: 'compact', showRoute: true, routeBg: '', cardBg: '#ffffff0f', accent: '@accent2', hlColor: '@accent', radius: 4, fields: ['dist', 'time', 'pace', 'hr'], nameTS: { font: 'Anton', weight: 400, transform: 'upper', spacing: 1 }, valueTS: { font: 'Anton', weight: 400 }, dateTS: { color: '@accent' } } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'runcompare', name: 'Run Comparison', desc: 'Distance, pace and heart rate compared run by run',
    bg: { type: 'gradient', color: '#14281d', color2: '#08110c', angle: 180 }, theme: { accent: '#a3e635', accent2: '#fb7185' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 30 * u;
      const t = mk('text', { props: { text: '{title}', ts: { size: 72, font: 'Barlow Condensed', weight: 700, transform: 'upper' } } }, { in: 'left' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range} · {runs} runs · {distance} {unit}', ts: { size: 30, font: 'Barlow Condensed', weight: 600, color: '@accent', role: 'accent' } } }, { in: 'left' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 6 * u);
      const routes = mk('mroutes', { props: { design: 'row', palette: true, label: 'day', glow: 8, cellBg: '#ffffff0d' } }, { w: IW / u, h: 260, in: 'fade' });
      place(routes, 0, 0, M, r.y + r.h + G);
      const lab = (txt, y, c) => { const l = mk('text', { props: { text: txt, ts: { size: 22, weight: 800, spacing: 4, color: c } } }, { anim: false }); place(l, 0, 0, M, y); return l; };
      const top = routes.y + routes.h + G, each = (H - M - top) / 3;
      [['DISTANCE', 'distance', '@accent'], ['AVERAGE PACE', 'avgPace', '#ffffff'], ['AVERAGE HEART RATE', 'avgHr', '@accent2']].forEach(([title, m, c], i) => {
        const y = top + i * each, l = lab(title, y, c);
        const ch = mk('mchart', { props: { metric: m, design: 'hbars', color: c, label: 'day', track: '#ffffff12' } }, { w: IW / u, h: (each - l.h - 26 * u) / u, in: 'wipe' });
        place(ch, 0, 0, M, l.y + l.h + 10 * u);
      });
    },
  },
  {
    id: 'monocards', name: 'Mono Run Cards', desc: 'Black and white cards with thin type',
    bg: { type: 'solid', color: '#000000' }, theme: { text: '#ffffff', muted: '#ffffff99', accent: '#ffffff', accent2: '#9ca3af' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M;
      const t = mk('text', { props: { text: '{title}', ts: { size: 84, font: 'Inter', weight: 200, spacing: -1 } } }, { in: 'fade' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range} — {runs} runs — {distance} {unit}', ts: { size: 24, font: 'JetBrains Mono', weight: 400, color: '@muted', role: 'muted' } } }, { in: 'fade' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 14 * u);
      const top = r.y + r.h + 50 * u;
      const c = cards(k, { props: { design: 'list', cardBg: '', routeBg: '#ffffff0d', routeColor: '#ffffff', routeWidth: 3, accentBar: false, hlColor: '#ffffff', radius: 0, gap: 10,
        nameTS: { font: 'Inter', weight: 300 }, dateTS: { font: 'JetBrains Mono', weight: 400, color: '#ffffff99' }, valueTS: { font: 'Inter', weight: 200 }, labelTS: { font: 'JetBrains Mono' } } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'auroracards', name: 'Aurora Cards', desc: 'Frosted run cards on a colourful gradient',
    bg: { type: 'gradient', color: '#00c6ff', color2: '#7b2ff7', angle: 150 }, theme: { text: '#ffffff', muted: '#ffffffcc', accent: '#ffffff', accent2: '#ffe066' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 26 * u;
      const t = mk('text', { props: { text: '{title}', ts: { size: 84, font: 'Unbounded', weight: 800 } } }, { in: 'down' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const r = mk('text', { props: { text: '{range}', ts: { size: 30, font: 'Unbounded', weight: 500 } } }, { in: 'down' });
      place(r, 0, 0, M, t.y + t.h + 8 * u);
      const g = mk('statgrid', { skin: 'frost', props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 40, items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }], valueTS: { size: 54, font: 'Unbounded', weight: 700 }, unitTS: { size: 20 }, labelTS: { size: 14 } }, style: { padX: 30, padY: 24 } }, { in: 'up' });
      fitTo(k, g, IW); g.w = IW; place(g, 0, 0, M, r.y + r.h + G * 1.4);
      const top = g.y + g.h + G;
      const c = cards(k, { props: { design: 'list', cardBg: '#ffffff26', routeBg: '#ffffff1a', routeColor: '#ffffff', accent: '@accent2', hlColor: '@accent2', nameTS: { font: 'Unbounded', weight: 700 }, valueTS: { font: 'Unbounded', weight: 600 }, dateTS: { color: '@accent2' } } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'weekposter2', name: 'Week Poster', desc: 'Huge total, every route (or treadmill) and a run list',
    bg: { type: 'solid', color: '#f5f2ec' }, theme: { text: '#1f2937', muted: '#1f2937a0', accent: '#dc2626', accent2: '#1f2937' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const IW = W - 2 * M, G = 34 * u;
      const big = mk('stat', { props: { metric: 'distance', layout: 'stackUnit', showLabel: false, decimals: 1, valueTS: { size: 240, font: 'Montserrat', weight: 900, color: '#1f2937' }, unitTS: { size: 60, font: 'Montserrat', weight: 700, color: '@accent' } } }, { in: 'pop' });
      fitTo(k, big, IW, 1.2); place(big, 0, 0, M, M);
      const r = mk('text', { props: { text: '{title} · {range}', ts: { size: 30, font: 'Montserrat', weight: 700, spacing: 6, transform: 'upper' } } }, { in: 'up' });
      k.fitW(r, IW); place(r, 0, 0, M, big.y + big.h + 16 * u);
      const n = nRuns(k), cols = n > 8 ? 4 : 3, rows = Math.ceil(n / cols);
      const gh = Math.min(260 * rows, 820) * u;
      const routes = mk('mroutes', { props: { design: 'grid', cols, palette: false, color: '#1f2937', glow: 0, width: 4, cellBg: '#1f29370d', label: 'day', labelTS: { color: '#1f2937' } } }, { w: IW / u, h: gh / u, in: 'fade' });
      place(routes, 0, 0, M, r.y + r.h + G);
      const list = mk('mlist', { props: { design: 'lines', lineColor: '#1f293726', rowScale: 1.7, colGap: 34, columns: [{ k: 'day', on: true }, { k: 'name', on: true }, { k: 'dist', on: true }, { k: 'time', on: true }, { k: 'pace', on: true }, { k: 'hr', on: true }], cellTS: { size: 28, font: 'Montserrat', weight: 500 }, nameTS: { size: 28, font: 'Montserrat', weight: 700 }, dayTS: { size: 24, font: 'Montserrat', color: '@accent' }, headerTS: { size: 16 } } }, { in: 'fade' });
      fitTo(k, list, IW); if (list.h > H - M - (routes.y + routes.h + G)) k.fitW(list, list.w * (H - M - (routes.y + routes.h + G)) / list.h);
      place(list, 0, 0, M, routes.y + routes.h + G);
    },
  },
];
