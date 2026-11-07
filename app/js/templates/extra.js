// Template pack 3 (v1.3). Same build kit as templates.js.
const SH = { shadow: true, shadowColor: '#000000aa', shadowBlur: 14, shadowX: 0, shadowY: 3 };
const DARK = '#0d0f14';

// letterbox bars used by the cinematic templates
function letterbox(k, barH) {
  const { W, H, mk, place, u } = k;
  const top = mk('shape', { name: 'Top bar', props: { shape: 'rect', color: '#000000', radius: 0 } }, { w: W / u, h: barH / u, in: 'down', delay: 0 });
  const bot = mk('shape', { name: 'Bottom bar', props: { shape: 'rect', color: '#000000', radius: 0 } }, { w: W / u, h: barH / u, in: 'up', delay: 0 });
  place(top, 0, 0, 0, 0); place(bot, 0, 1, 0, H);
  return [top, bot];
}

export const EXTRA_SINGLE = [
  {
    id: 'cinematic', name: 'Cinematic', desc: 'Letterbox bars, wide title and a stat line',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const bar = 300 * u;
      letterbox(k, bar);
      const t = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 50, font: 'Montserrat', weight: 300, transform: 'upper', spacing: 18 } } }, { in: 'fade' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0.5, W / 2, bar / 2);
      const grid = mk('statgrid', { props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 56, items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 52, font: 'Montserrat', weight: 600 }, unitTS: { size: 20, font: 'Montserrat' }, labelTS: { size: 15, spacing: 4 } } }, { in: 'fade' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 0.5, W / 2, H - bar / 2);
      const d = mk('text', { props: { text: '{date}', align: 'center', ts: { size: 24, font: 'Montserrat', weight: 400, spacing: 10, transform: 'upper', color: '@muted', role: 'muted', ...SH } } }, { in: 'fade' });
      place(d, 0.5, 1, W / 2, H - bar - 30 * u);
    },
  },
  {
    id: 'raceBib', name: 'Race Bib', desc: 'A race bib with your distance as the number',
    bg: { type: 'gradient', color: '#334155', color2: '#0f172a', angle: 160 }, theme: { accent: '#e11d48', accent2: '#1d4ed8' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const bw = W - 2 * M - 40 * u, bh = 900 * u;
      const bib = mk('shape', { name: 'Bib', props: { shape: 'rect', color: '#ffffff', radius: 28 } }, { w: bw / u, h: bh / u, in: 'drop' });
      place(bib, 0.5, 0.5, W / 2, H * 0.45);
      const band = mk('shape', { name: 'Bib band', props: { shape: 'rect', color: '@accent', radius: 0 } }, { w: bw / u, h: 150 / 1, in: 'drop', anim: false });
      place(band, 0.5, 0, W / 2, bib.y + 70 * u);
      for (const [ax, ay] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const hole = mk('shape', { name: 'Pin hole', props: { shape: 'ellipse', color: '#94a3b8' } }, { w: 34, h: 34, anim: false });
        place(hole, 0.5, 0.5, ax ? bib.x + bib.w - 48 * u : bib.x + 48 * u, ay ? bib.y + bib.h - 48 * u : bib.y + 48 * u);
      }
      const ev = mk('text', { props: { text: '{date}', align: 'center', ts: { size: 44, font: 'Russo One', weight: 400, color: '#ffffff', transform: 'upper', spacing: 4 } } }, { in: 'fade' });
      k.fitW(ev, bw - 80 * u); place(ev, 0.5, 0.5, W / 2, band.y + band.h / 2);
      const num = mk('stat', { props: { metric: 'distance', layout: 'valueOnly', showUnit: false, align: 'center', decimals: 2, valueTS: { size: 320, font: 'Anton', weight: 400, color: DARK } } }, { in: 'pop' });
      k.fitW(num, bw - 100 * u); place(num, 0.5, 0, W / 2, band.y + band.h + 60 * u);
      const nm = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 56, font: 'Russo One', weight: 400, color: '@accent2' } } }, { in: 'up' });
      k.fitW(nm, bw - 100 * u); place(nm, 0.5, 0, W / 2, num.y + num.h + 40 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 50, dividers: true, dividerColor: '#0d0f1422', items: [{ m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 50, font: 'Russo One', weight: 400, color: DARK }, unitTS: { size: 20, color: '#0d0f1499' }, labelTS: { size: 16, color: '#0d0f1488' } } }, { in: 'up' });
      k.fitW(grid, bw - 100 * u); place(grid, 0.5, 1, W / 2, bib.y + bib.h - 60 * u);
      const map = mk('map', { props: { line: 'glow', width: 8, start: 'dot', end: 'checkered' } }, { w: 300, h: 300, in: 'zoom' });
      place(map, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'halfhalf', name: 'Half & Half', desc: 'Colour block bottom half with a giant number',
    bg: { type: 'solid', color: '#0d0f14' }, theme: { accent: '#c6ff3d', accent2: '#00e0ff' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const block = mk('shape', { name: 'Colour block', props: { shape: 'rect', color: '@accent', radius: 0 } }, { w: W / u, h: (H * 0.5) / u, in: 'up', delay: 0 });
      place(block, 0, 1, 0, H);
      const map = mk('map', { props: { line: 'casing', color: '@accent', width: 10, start: 'ring', end: 'checkered' } }, { w: 860, h: 700, in: 'wipe' });
      place(map, 0.5, 0.5, W / 2, H * 0.25);
      const big = mk('stat', { props: { metric: 'distance', layout: 'stackUnit', showLabel: false, valueTS: { size: 330, font: 'Anton', weight: 400, color: DARK }, unitTS: { size: 80, font: 'Anton', weight: 400, color: DARK } } }, { in: 'pop' });
      k.fitW(big, W - 2 * M); place(big, 0, 0, M, block.y + 50 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', cellGapX: 50, items: [{ m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 60, font: 'Anton', weight: 400, color: DARK }, unitTS: { size: 24, color: '#0d0f14aa' }, labelTS: { size: 18, color: '#0d0f14aa' } } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0, 0, M, big.y + big.h + 40 * u);
      const nm = mk('text', { props: { text: '{name} · {date}', ts: { size: 30, font: 'Inter', weight: 800, color: DARK, transform: 'upper', spacing: 3 } } }, { in: 'up' });
      k.fitW(nm, W - 2 * M); place(nm, 0, 1, M, H - M);
    },
  },
  {
    id: 'sidecol', name: 'Side Column', desc: 'Right-hand column of stats, photo stays clear',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const grid = mk('statgrid', { props: { cols: 1, align: 'right', layout: 'reverse', cellGapY: 46, items: [{ m: 'distance', on: true }, { m: 'avgPace', on: true }, { m: 'time', on: true }, { m: 'avgHr', on: true }, { m: 'ascent', on: true }], valueTS: { size: 76, font: 'Barlow Condensed', weight: 700, ...SH }, unitTS: { size: 30, font: 'Barlow Condensed', ...SH }, labelTS: { size: 18, ...SH } } }, { in: 'right' });
      k.fitW(grid, W * 0.45); place(grid, 1, 0.5, W - M, H * 0.52);
      const line = mk('shape', { props: { shape: 'line', color: '@accent', strokeW: 4 } }, { w: grid.h / u, h: 6, in: 'wipe' });
      line.rot = 90; place(line, 0.5, 0.5, grid.x - 40 * u, grid.y + grid.h / 2);
      const nm = mk('text', { align: 'right', props: { text: '{name}', align: 'right', ts: { size: 46, font: 'Barlow Condensed', weight: 700, transform: 'upper', spacing: 2, ...SH } } }, { in: 'right' });
      k.fitW(nm, W - 2 * M); place(nm, 1, 1, W - M, grid.y - 50 * u);
      const d = mk('text', { align: 'right', props: { text: '{date}', align: 'right', ts: { size: 26, weight: 600, color: '@muted', role: 'muted', ...SH } } }, { in: 'right' });
      place(d, 1, 0, W - M, grid.y + grid.h + 40 * u);
    },
  },
  {
    id: 'topbanner', name: 'Top Banner', desc: 'Glass banner at the top, rest of the photo free',
    build(k) {
      const { W, M, mk, place, u } = k;
      const ban = mk('shape', { name: 'Banner', props: { shape: 'rect', color: '#00000088', radius: 30 } }, { w: (W - 2 * M) / u, h: 300, in: 'down' });
      place(ban, 0.5, 0, W / 2, M);
      const nm = mk('text', { props: { text: '{name}', ts: { size: 48, font: 'Space Grotesk', weight: 700 } } }, { in: 'down' });
      k.fitW(nm, W - 2 * M - 360 * u); place(nm, 0, 0, M + 40 * u, ban.y + 36 * u);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 24, font: 'Space Grotesk', weight: 500, color: '@muted', role: 'muted' } } }, { in: 'down' });
      place(d, 0, 0, M + 40 * u, nm.y + nm.h + 12 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', cellGapX: 44, items: [{ m: 'distance', on: true }, { m: 'avgPace', on: true }, { m: 'time', on: true }], valueTS: { size: 50, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 20, font: 'Space Grotesk' }, labelTS: { size: 15 } } }, { in: 'down' });
      k.fitW(grid, W - 2 * M - 360 * u); place(grid, 0, 1, M + 40 * u, ban.y + ban.h - 30 * u);
      const map = mk('map', { props: { line: 'glow', width: 7, start: 'dot', end: 'dot', dot: 'none' } }, { w: 240, h: 240, in: 'zoom' });
      place(map, 1, 0.5, ban.x + ban.w - 30 * u, ban.y + ban.h / 2);
    },
  },
  {
    id: 'scoreboard', name: 'Scoreboard', desc: 'Digital LCD panels like a stadium board',
    bg: { type: 'solid', color: '#050505' }, theme: { text: '#ffb000', muted: '#ffb000aa', accent: '#ffb000', accent2: '#ff3b30' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: 'RUN BOARD', align: 'center', ts: { size: 84, font: 'Share Tech Mono', weight: 400, spacing: 10, shadow: true, shadowColor: '@accent', shadowBlur: 24, shadowX: 0, shadowY: 0 } } }, { in: 'blur' });
      place(t, 0.5, 0, W / 2, M + 30 * u);
      const items = ['distance', 'time', 'avgPace', 'avgHr', 'ascent', 'calories'];
      const cw = (W - 2 * M - 30 * u) / 2;
      let y = t.y + t.h + 70 * u, row = 0;
      items.forEach((m, i) => {
        const s = mk('stat', { skin: 'solidDark', props: { metric: m, layout: 'lcd', valueTS: { size: 130, font: 'Share Tech Mono', weight: 400 }, unitTS: { size: 36, font: 'Share Tech Mono' }, labelTS: { size: 24, font: 'Share Tech Mono' } }, style: { padX: 30, padY: 26, borderW: 2, borderColor: '#ffb00055', radius: 10 } }, { in: 'fade' });
        k.fitW(s, cw);
        place(s, 0, 0, M + (i % 2) * (cw + 30 * u), y);
        if (i % 2) { y += Math.max(s.h, k.list[k.list.length - 2].h) + 30 * u; row++; }
      });
      const g = mk('graph', { skin: 'solidDark', props: { metric: 'pace', design: 'bars', bars: 40, showTitle: true, title: 'Pace', fillColor: '@accent', showY: false, grid: false, titleTS: { font: 'Share Tech Mono' }, axisTS: { font: 'Share Tech Mono' } }, style: { padX: 26, padY: 22, borderW: 2, borderColor: '#ffb00055', radius: 10 } }, { w: (W - 2 * M) / u, h: 520, in: 'wipe' });
      place(g, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'pastel', name: 'Soft Pastel', desc: 'Light pastel colours and rounded cards',
    bg: { type: 'gradient', color: '#fde2e4', color2: '#e2ece9', angle: 150 }, theme: { text: '#3d3a4b', muted: '#3d3a4b99', accent: '#f08080', accent2: '#84a59d' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: '{name}', ts: { size: 80, font: 'Poppins', weight: 700 } } }, { in: 'up' });
      k.fitW(t, W - 2 * M); place(t, 0, 0, M, M + 30 * u);
      const d = mk('text', { props: { text: '{date} · {startTime}', ts: { size: 30, font: 'Poppins', weight: 500, color: '@muted', role: 'muted' } } }, { in: 'up' });
      place(d, 0, 0, M, t.y + t.h + 14 * u);
      const map = mk('map', { skin: 'sticker', props: { line: 'solid', color: '@accent', width: 9, start: 'dot', end: 'dot', startColor: '@accent2', endColor: '@accent', dot: 'none' }, style: { padX: 30, padY: 30, radius: 40 } }, { w: (W - 2 * M) / u, h: 640, in: 'zoom' });
      place(map, 0, 0, M, d.y + d.h + 50 * u);
      const cw = (W - 2 * M - 30 * u) / 2;
      ['distance', 'avgPace', 'time', 'avgHr'].forEach((m, i) => {
        const s = mk('stat', { skin: 'sticker', props: { metric: m, layout: 'iconTop', iconColor: i % 2 ? '@accent2' : '@accent', valueTS: { size: 88, font: 'Poppins', weight: 700, color: '#3d3a4b' }, unitTS: { size: 32, font: 'Poppins', color: '#3d3a4b99' }, labelTS: { size: 18, font: 'Poppins', color: '#3d3a4b88' } }, style: { padX: 34, padY: 30, radius: 34 } }, { in: 'pop' });
        k.fitW(s, cw);
        place(s, 0.5, 0, M + (i % 2) * (cw + 30 * u) + cw / 2, map.y + map.h + 40 * u + Math.floor(i / 2) * 330 * u);
      });
    },
  },
  {
    id: 'speedo', name: 'Speedometer', desc: 'Big pace dial with stats around it',
    bg: { type: 'gradient', color: '#1c1917', color2: '#0c0a09', angle: 170, kind: 'radial' }, theme: { accent: '#f97316', accent2: '#facc15' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const g = mk('gauge', { props: { metric: 'pace', design: 'ticks', label: 'Avg pace', valueTS: { size: 120 } } }, { w: 860, h: 760, in: 'zoom' });
      place(g, 0.5, 0, W / 2, M + 140 * u);
      const t = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 56, font: 'Chakra Petch', weight: 700, transform: 'upper', spacing: 4 } } }, { in: 'down' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0, W / 2, M);
      const stats = ['distance', 'time', 'avgHr'].map((m) => mk('stat', { skin: 'glass', props: { metric: m, layout: 'reverse', align: 'center', valueTS: { size: 60, font: 'Chakra Petch', weight: 700 }, unitTS: { size: 22 }, labelTS: { size: 16 } }, style: { padX: 26, padY: 22 } }, { in: 'up' }));
      const gap = 24 * u, cw = (W - 2 * M - gap * 2) / 3;
      stats.forEach((s) => k.fitW(s, cw));
      let x = M; const y = g.y + g.h + 50 * u;
      stats.forEach((s) => { place(s, 0, 0, x + (cw - s.w) / 2, y); x += cw + gap; });
      const pg = mk('graph', { props: { metric: 'speed', design: 'heat', colorMode: 'ramp', ramp: 'fire', showTitle: true, title: 'Speed', showY: false, grid: false, showAvg: false, lineW: 6 } }, { w: (W - 2 * M) / u, h: 440, in: 'wipe' });
      place(pg, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'ringstats', name: 'Ring Stats', desc: 'Three ring badges and a progress ring',
    bg: { type: 'gradient', color: '#0f2027', color2: '#2c5364', angle: 160 }, theme: { accent: '#5ee7ff', accent2: '#c6ff3d' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const ring = mk('progress', { props: { design: 'ring', thickness: 26, showLabels: false, color: '@accent2' } }, { w: 560, h: 560, in: 'zoom' });
      place(ring, 0.5, 0, W / 2, M + 120 * u);
      const big = mk('stat', { props: { metric: 'distance', layout: 'stackUnit', align: 'center', showLabel: false, valueTS: { size: 130, font: 'Kanit', weight: 700 }, unitTS: { size: 40, font: 'Kanit' } } }, { in: 'pop' });
      k.fitW(big, ring.w * 0.55); place(big, 0.5, 0.5, W / 2, ring.y + ring.h / 2);
      const t = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 52, font: 'Kanit', weight: 600 } } }, { in: 'down' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0, W / 2, M);
      const rings = ['avgPace', 'time', 'avgHr'].map((m) => mk('stat', { props: { metric: m, layout: 'ring', align: 'center', ringWidth: 8, valueTS: { size: 52, font: 'Kanit', weight: 600 }, unitTS: { size: 20 }, labelTS: { size: 16 } } }, { in: 'pop' }));
      const gap = 20 * u, cw = (W - 2 * M - gap * 2) / 3;
      rings.forEach((s) => k.fitW(s, cw));
      let x = M; const y = ring.y + ring.h + 70 * u;
      rings.forEach((s) => { place(s, 0, 0, x + (cw - s.w) / 2, y); x += cw + gap; });
      const d = mk('text', { props: { text: '{date} · {startTime}', align: 'center', ts: { size: 28, weight: 600, color: '@muted', role: 'muted' } } });
      place(d, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'pulse', name: 'Pulse', desc: 'Neon heart-rate line with big HR numbers',
    bg: { type: 'solid', color: '#0a0306' }, theme: { accent: '#ff2e63', accent2: '#ff9a9e' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const hr = mk('stat', { props: { metric: 'avgHr', layout: 'iconInline', icon: 'heart-pulse', iconColor: '@accent', valueTS: { size: 220, font: 'Big Shoulders Display', weight: 800 }, unitTS: { size: 60, font: 'Big Shoulders Display', weight: 600 } } }, { in: 'pop' });
      k.fitW(hr, W - 2 * M); place(hr, 0, 0, M, M + 60 * u);
      const l = mk('text', { props: { text: 'AVERAGE HEART RATE', ts: { size: 30, weight: 800, spacing: 6, color: '@accent', role: 'accent' } } }, { in: 'left' });
      place(l, 0, 0, M, hr.y + hr.h + 20 * u);
      const g = mk('graph', { props: { metric: 'hr', design: 'neon', lineColor: '@accent', lineW: 5, showTitle: false, showY: true, grid: false, showAvg: true } }, { w: (W - 2 * M) / u, h: 560, in: 'wipe' });
      place(g, 0, 0, M, l.y + l.h + 80 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', cellGapX: 50, items: [{ m: 'maxHr', on: true }, { m: 'time', on: true }, { m: 'distance', on: true }], valueTS: { size: 64, font: 'Big Shoulders Display', weight: 800 }, unitTS: { size: 26 }, labelTS: { size: 18 } } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0, 0, M, g.y + g.h + 70 * u);
      const z = mk('zones', { props: { design: 'stacked', showTitle: false } }, { w: (W - 2 * M) / u, h: 170, in: 'wipe' });
      place(z, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'vintage', name: 'Vintage Poster', desc: 'Sepia poster with a ribbon and dashed route',
    bg: { type: 'solid', color: '#efe3c8' }, theme: { text: '#3a2c1d', muted: '#3a2c1daa', accent: '#9a3412', accent2: '#365314' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const frame = mk('shape', { name: 'Frame', props: { shape: 'rect', fill: 'none', color: '#00000000', strokeW: 6, strokeColor: '#3a2c1d', radius: 0 } }, { w: (W - M) / u, h: (H - M) / u, in: 'fade' });
      place(frame, 0.5, 0.5, W / 2, H / 2);
      const t = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 96, font: 'DM Serif Display', weight: 400 } } }, { in: 'up' });
      k.fitW(t, W - 3 * M); place(t, 0.5, 0, W / 2, M + 90 * u);
      const rib = mk('sticker', { props: { kind: 'badge', text: '{date}', shape: 'ribbon', color: '@accent', textColor: '#efe3c8', font: 'Playfair Display' } }, { w: 640, h: 150, in: 'drop' });
      place(rib, 0.5, 0, W / 2, t.y + t.h + 40 * u);
      rib.props.text = 'EST. TODAY';
      const map = mk('map', { props: { line: 'dashed', color: '#3a2c1d', width: 7, start: 'flag', end: 'checkered', startColor: '@accent2' } }, { w: 780, h: 700, in: 'wipe' });
      place(map, 0.5, 0, W / 2, rib.y + rib.h + 50 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 50, dividers: true, dividerColor: '#3a2c1d55', items: [{ m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }], valueTS: { size: 62, font: 'DM Serif Display', weight: 400 }, unitTS: { size: 26, font: 'Playfair Display', italic: true }, labelTS: { size: 18, font: 'Playfair Display' } } }, { in: 'up' });
      k.fitW(grid, W - 3 * M); place(grid, 0.5, 1, W / 2, H - M - 70 * u);
    },
  },
  {
    id: 'stickers', name: 'Sticker Pack', desc: 'Playful tilted stat stickers and icons',
    bg: { type: 'gradient', color: '#ffd166', color2: '#ef476f', angle: 140 }, theme: { text: '#111111', muted: '#111111aa', accent: '#118ab2', accent2: '#06d6a0' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: '{name}', align: 'center', ts: { size: 88, font: 'Bungee', weight: 400, color: '#ffffff', stroke: 6, strokeColor: '#111111' } } }, { in: 'drop' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0, W / 2, M + 40 * u);
      const tilts = [-6, 5, -4, 7];
      ['distance', 'avgPace', 'time', 'avgHr'].forEach((m, i) => {
        const s = mk('stat', { skin: 'sticker', props: { metric: m, layout: 'iconLeft', iconColor: i % 2 ? '@accent2' : '@accent', valueTS: { size: 74, font: 'Bungee', weight: 400, color: '#111111' }, unitTS: { size: 28, font: 'Bungee', weight: 400, color: '#111111aa' }, labelTS: { size: 18, color: '#11111199' } }, style: { padX: 36, padY: 30, radius: 26 } }, { in: 'pop' });
        k.fitW(s, W * 0.7);
        s.rot = tilts[i];
        place(s, i % 2 ? 1 : 0, 0, i % 2 ? W - M : M, t.y + t.h + 90 * u + i * 300 * u);
      });
      const icons = [['flame', 0.2, 0.86, -12], ['trophy', 0.8, 0.84, 10], ['zap', 0.5, 0.93, 0]];
      for (const [ic, fx, fy, r] of icons) {
        const s = mk('sticker', { props: { kind: 'icon', icon: ic, color: '#ffffff', fill: true, fillColor: '#111111', strokeW: 2 } }, { w: 170, h: 170, in: 'spin' });
        s.rot = r; place(s, 0.5, 0.5, W * fx, H * fy);
      }
    },
  },
  {
    id: 'laps', name: 'Lap Board', desc: 'Device laps table with lap pace bars',
    bg: { type: 'gradient', color: '#0b132b', color2: '#1c2541', angle: 170 }, theme: { accent: '#6fffe9', accent2: '#5bc0be' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('stat', { props: { metric: 'splits', layout: 'inline', label: 'Laps', valueTS: { size: 120, font: 'Rajdhani', weight: 700 }, labelTS: { size: 40, font: 'Rajdhani', weight: 700, spacing: 6 } } }, { in: 'left' });
      place(t, 0, 0, M, M + 20 * u);
      const n = mk('text', { props: { text: '{name} · {distance} {unit} · {time}', ts: { size: 30, font: 'Rajdhani', weight: 600, color: '@accent', role: 'accent' } } }, { in: 'left' });
      k.fitW(n, W - 2 * M); place(n, 0, 0, M, t.y + t.h + 14 * u);
      const bars = mk('graph', { skin: 'glass', props: { metric: 'pace', design: 'splitBars', splits: { mode: 'laps' }, showTitle: true, title: 'Lap pace', showY: true, grid: true, yTicks: 3 } }, { w: (W - 2 * M) / u, h: 420, in: 'wipe' });
      place(bars, 0, 0, M, n.y + n.h + 50 * u);
      const tbl = mk('splits', { props: { design: 'neon', splits: { mode: 'laps' }, rowScale: 1.7, columns: [{ k: 'idx', on: true }, { k: 'dist', on: true }, { k: 'time', on: true }, { k: 'pace', on: true }, { k: 'hr', on: true }], cellTS: { size: 34, font: 'Rajdhani', weight: 600 }, idxTS: { size: 34, font: 'Rajdhani' }, headerTS: { size: 22 }, colGap: 50, maxRows: 12 } }, { in: 'fade' });
      k.fitW(tbl, W - 2 * M); place(tbl, 0, 0, M, bars.y + bars.h + 50 * u);
    },
  },
  {
    id: 'cadence', name: 'Form & Cadence', desc: 'Cadence graph, steps and running form stats',
    bg: { type: 'gradient', color: '#1a1a1a', color2: '#2d2d2d', angle: 180 }, theme: { accent: '#a78bfa', accent2: '#34d399' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: 'RUNNING FORM', ts: { size: 96, font: 'Lexend', weight: 800 } } }, { in: 'left' });
      k.fitW(t, W - 2 * M); place(t, 0, 0, M, M + 20 * u);
      const n = mk('text', { props: { text: '{name} · {date}', ts: { size: 30, font: 'Lexend', weight: 500, color: '@muted', role: 'muted' } } }, { in: 'left' });
      k.fitW(n, W - 2 * M); place(n, 0, 0, M, t.y + t.h + 14 * u);
      const cad = mk('stat', { props: { metric: 'avgCad', layout: 'iconLeft', icon: 'footprints', valueTS: { size: 140, font: 'Lexend', weight: 700 }, unitTS: { size: 44 } } }, { in: 'pop' });
      place(cad, 0, 0, M, n.y + n.h + 70 * u);
      const g = mk('graph', { skin: 'glass', props: { metric: 'cad', design: 'dots', bars: 60, colorMode: 'ramp', ramp: 'cool', showTitle: true, title: 'Cadence', showY: true, baseline: 'tight' } }, { w: (W - 2 * M) / u, h: 440, in: 'wipe' });
      place(g, 0, 0, M, cad.y + cad.h + 50 * u);
      const grid = mk('statgrid', { skin: 'glass', props: { cols: 2, layout: 'iconLeft', cellGapX: 40, cellGapY: 30, items: [{ m: 'steps', on: true }, { m: 'avgPace', on: true }, { m: 'calories', on: true }, { m: 'distance', on: true }], valueTS: { size: 52, font: 'Lexend', weight: 700 }, unitTS: { size: 22 }, labelTS: { size: 16 } }, style: { padX: 36, padY: 30 } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'livecorner', name: 'Live Corner (video)', desc: 'Compact live HUD in the bottom-left corner',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      k.setDelay(0);
      const panel = mk('shape', { name: 'Panel', props: { shape: 'rect', color: '#000000a0', radius: 30 } }, { w: 620, h: 560, in: 'left' });
      place(panel, 0, 1, M, H - M);
      const P = 34 * u;
      const map = mk('map', { props: { line: 'casing', width: 6, dot: 'pulse', remaining: 'ghost', start: 'dot', end: 'none' } }, { w: 200, h: 200, in: 'zoom' });
      place(map, 1, 0, panel.x + panel.w - P, panel.y + P);
      const pace = mk('stat', { props: { metric: 'pace', layout: 'classic', label: 'Pace', valueTS: { size: 76, font: 'Oswald' }, unitTS: { size: 28 } } }, { in: 'left' });
      place(pace, 0, 0, panel.x + P, panel.y + P);
      const hr = mk('stat', { props: { metric: 'hr', layout: 'iconInline', iconColor: '#ff5470', valueTS: { size: 56, font: 'Oswald' }, unitTS: { size: 22 } } }, { in: 'left' });
      place(hr, 0, 0, panel.x + P, pace.y + pace.h + 26 * u);
      const dist = mk('stat', { props: { metric: 'distance', layout: 'iconInline', valueTS: { size: 56, font: 'Oswald' }, unitTS: { size: 22 } } }, { in: 'left' });
      place(dist, 0, 0, panel.x + P, hr.y + hr.h + 18 * u);
      const clock = mk('stat', { props: { metric: 'time', layout: 'iconInline', valueTS: { size: 56, font: 'Oswald' } } }, { in: 'left' });
      place(clock, 0, 0, panel.x + P, dist.y + dist.h + 18 * u);
      const prog = mk('progress', { props: { design: 'bar', thickness: 12, showLabels: false, showIcon: false } }, { w: (panel.w - 2 * P) / u, h: 30, in: 'wipe' });
      place(prog, 0, 1, panel.x + P, panel.y + panel.h - P);
    },
  },
  {
    id: 'splitladder', name: 'Split Ladder', desc: 'Split step graph with fastest split highlight',
    bg: { type: 'solid', color: '#111111' }, theme: { accent: '#ffe600', accent2: '#ff7a00' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: 'EVERY\nKILOMETER', ts: { size: 120, font: 'Archivo Black', weight: 400, lineHeight: 0.95 } } }, { in: 'left' });
      k.fitW(t, W - 2 * M); place(t, 0, 0, M, M + 20 * u);
      const g = mk('graph', { props: { metric: 'pace', design: 'step', lineColor: '@accent', fillColor: '@accent', lineW: 6, showTitle: false, showY: true, showAvg: true, grid: true } }, { w: (W - 2 * M) / u, h: 520, in: 'wipe' });
      place(g, 0, 0, M, t.y + t.h + 60 * u);
      const tbl = mk('splits', { props: { design: 'chips', rowScale: 1.6, wrapCols: 2, columns: [{ k: 'idx', on: true }, { k: 'pace', on: true }], cellTS: { size: 36 }, idxTS: { size: 36 }, colGap: 40 } }, { in: 'fade' });
      k.fitW(tbl, W - 2 * M); place(tbl, 0, 0, M, g.y + g.h + 50 * u);
      const f = mk('splitcard', { skin: 'accent', props: { which: 'fastest', layout: 'iconLeft', icon: 'trophy', valueTS: { size: 64 } } }, { in: 'pop' });
      k.fitW(f, W - 2 * M); place(f, 1, 1, W - M, H - M);
    },
  },
];

export const EXTRA_MULTI = [
  {
    id: 'cinemaweek', name: 'Cinematic Week', desc: 'Letterbox bars with the week totals',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const bar = 300 * u;
      letterbox(k, bar);
      const t = mk('text', { props: { text: '{title} · {range}', align: 'center', ts: { size: 40, font: 'Montserrat', weight: 300, transform: 'upper', spacing: 12 } } }, { in: 'fade' });
      k.fitW(t, W - 2 * M); place(t, 0.5, 0.5, W / 2, bar / 2);
      const grid = mk('statgrid', { props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 50, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }], valueTS: { size: 52, font: 'Montserrat', weight: 600 }, unitTS: { size: 20, font: 'Montserrat' }, labelTS: { size: 15, spacing: 4 } } }, { in: 'fade' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 0.5, W / 2, H - bar / 2);
    },
  },
  {
    id: 'month', name: 'Month in Review', desc: 'Big total, run list and per-run chart for a month',
    bg: { type: 'gradient', color: '#0f172a', color2: '#111827', angle: 180 }, theme: { accent: '#38bdf8', accent2: '#f472b6' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: 'MONTH IN REVIEW', ts: { size: 44, weight: 800, spacing: 8, color: '@accent', role: 'accent' } } }, { in: 'down' });
      place(t, 0, 0, M, M + 10 * u);
      const r = mk('text', { props: { text: '{range}', ts: { size: 30, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'down' });
      place(r, 0, 0, M, t.y + t.h + 12 * u);
      const big = mk('stat', { props: { metric: 'distance', layout: 'stackUnit', showLabel: false, decimals: 1, valueTS: { size: 230, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 56, font: 'Space Grotesk' } } }, { in: 'pop' });
      k.fitW(big, W - 2 * M); place(big, 0, 0, M, r.y + r.h + 40 * u);
      const grid = mk('statgrid', { props: { cols: 4, layout: 'reverse', cellGapX: 40, items: [{ m: 'runs', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'ascent', on: true }], valueTS: { size: 46, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 20 }, labelTS: { size: 15 } } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0, 0, M, big.y + big.h + 40 * u);
      const ch = mk('mchart', { skin: 'glass', props: { metric: 'distance', design: 'vbars', label: 'date', color: '@accent' } }, { w: (W - 2 * M) / u, h: 420, in: 'wipe' });
      place(ch, 0, 0, M, grid.y + grid.h + 50 * u);
      const list = mk('mlist', { props: { design: 'lines', rowScale: 1.8, maxRows: 8, colGap: 44, columns: [{ k: 'date', on: true }, { k: 'name', on: true }, { k: 'dist', on: true }, { k: 'pace', on: true }], cellTS: { size: 36 }, nameTS: { size: 36 }, headerTS: { size: 20 } } }, { in: 'fade' });
      k.fitW(list, W - 2 * M); place(list, 0, 0, M, ch.y + ch.h + 50 * u);
    },
  },
  {
    id: 'streak', name: 'Run Streak', desc: 'Active days, week circles and totals',
    bg: { type: 'gradient', color: '#ff512f', color2: '#dd2476', angle: 150 }, theme: { text: '#ffffff', muted: '#ffffffcc', accent: '#ffffff', accent2: '#ffd166' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const fire = mk('sticker', { props: { kind: 'icon', icon: 'flame', color: '#ffffff', strokeW: 2.2 } }, { w: 240, h: 240, in: 'pop' });
      place(fire, 0.5, 0, W / 2, M + 40 * u);
      const days = mk('stat', { props: { metric: 'activeDays', layout: 'valueOnly', showUnit: false, align: 'center', valueTS: { size: 300, font: 'Anton', weight: 400 } } }, { in: 'pop' });
      place(days, 0.5, 0, W / 2, fire.y + fire.h + 20 * u);
      const l = mk('text', { props: { text: 'DAYS ON THE ROAD', align: 'center', ts: { size: 50, font: 'Anton', weight: 400, spacing: 8 } } }, { in: 'up' });
      place(l, 0.5, 0, W / 2, days.y + days.h + 20 * u);
      const cal = mk('mcal', { props: { design: 'circles', color: '#ffffff', textOn: '#dd2476', empty: '#ffffff33' } }, { w: (W - 2 * M) / u, h: 230, in: 'up' });
      place(cal, 0, 0, M, l.y + l.h + 70 * u);
      const grid = mk('statgrid', { skin: 'frost', props: { cols: 3, layout: 'reverse', align: 'center', cellGapX: 50, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }], valueTS: { size: 58, font: 'Anton', weight: 400 }, unitTS: { size: 22 }, labelTS: { size: 16 } }, style: { padX: 40, padY: 30 } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 1, W / 2, H - M - 40 * u);
    },
  },
  {
    id: 'longrunweek', name: 'Long Run Focus', desc: 'Your longest run in the spotlight',
    bg: { type: 'solid', color: '#0b0f14' }, theme: { accent: '#fbbf24', accent2: '#60a5fa' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const l = mk('text', { props: { text: 'LONGEST RUN', ts: { size: 40, weight: 800, spacing: 8, color: '@accent', role: 'accent' } } }, { in: 'left' });
      place(l, 0, 0, M, M + 20 * u);
      const big = mk('stat', { props: { metric: 'longest', layout: 'stackUnit', showLabel: false, valueTS: { size: 260, font: 'Big Shoulders Display', weight: 800 }, unitTS: { size: 64, font: 'Big Shoulders Display', weight: 700 } } }, { in: 'pop' });
      k.fitW(big, W - 2 * M); place(big, 0, 0, M, l.y + l.h + 20 * u);
      const routes = mk('mroutes', { props: { design: 'row', palette: true, label: 'day' } }, { w: (W - 2 * M) / u, h: 300, in: 'fade' });
      place(routes, 0, 0, M, big.y + big.h + 60 * u);
      const ch = mk('mchart', { props: { metric: 'distance', design: 'vbars', label: 'day', color: '@accent' } }, { w: (W - 2 * M) / u, h: 440, in: 'wipe' });
      place(ch, 0, 0, M, routes.y + routes.h + 50 * u);
      const grid = mk('statgrid', { props: { cols: 3, layout: 'reverse', cellGapX: 50, items: [{ m: 'distance', on: true }, { m: 'runs', on: true }, { m: 'avgDist', on: true }], valueTS: { size: 56, font: 'Big Shoulders Display', weight: 800 }, unitTS: { size: 24 }, labelTS: { size: 16 } } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0, 1, M, H - M);
    },
  },
  {
    id: 'scoreweek', name: 'Scoreboard Week', desc: 'Digital LCD panels with the week totals',
    bg: { type: 'solid', color: '#050505' }, theme: { text: '#ffb000', muted: '#ffb000aa', accent: '#ffb000', accent2: '#ff3b30' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: 'WEEK {week}', align: 'center', ts: { size: 96, font: 'Share Tech Mono', weight: 400, spacing: 10, shadow: true, shadowColor: '@accent', shadowBlur: 24, shadowX: 0, shadowY: 0 } } }, { in: 'blur' });
      place(t, 0.5, 0, W / 2, M + 30 * u);
      const items = ['distance', 'time', 'runs', 'avgPace', 'ascent', 'longest'];
      const cw = (W - 2 * M - 30 * u) / 2;
      let y = t.y + t.h + 70 * u;
      items.forEach((m, i) => {
        const s = mk('stat', { skin: 'solidDark', props: { metric: m, layout: 'lcd', valueTS: { size: 130, font: 'Share Tech Mono', weight: 400 }, unitTS: { size: 36, font: 'Share Tech Mono' }, labelTS: { size: 24, font: 'Share Tech Mono' } }, style: { padX: 30, padY: 26, borderW: 2, borderColor: '#ffb00055', radius: 10 } }, { in: 'fade' });
        k.fitW(s, cw);
        place(s, 0, 0, M + (i % 2) * (cw + 30 * u), y);
        if (i % 2) y += Math.max(s.h, k.list[k.list.length - 2].h) + 30 * u;
      });
      const bars = mk('mbars', { skin: 'solidDark', props: { design: 'bars', color: '@accent', hlColor: '@accent2', dayTS: { font: 'Share Tech Mono' }, valueTS: { font: 'Share Tech Mono' } }, style: { padX: 26, padY: 22, borderW: 2, borderColor: '#ffb00055', radius: 10 } }, { w: (W - 2 * M) / u, h: 420, in: 'wipe' });
      place(bars, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'pastelweek', name: 'Soft Pastel Week', desc: 'Pastel cards with daily chart',
    bg: { type: 'gradient', color: '#e0c3fc', color2: '#8ec5fc', angle: 150 }, theme: { text: '#2e2a4f', muted: '#2e2a4f99', accent: '#6d5dfc', accent2: '#ff8fab' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: '{title}', ts: { size: 84, font: 'Poppins', weight: 700 } } }, { in: 'up' });
      k.fitW(t, W - 2 * M); place(t, 0, 0, M, M + 30 * u);
      const r = mk('text', { props: { text: '{range}', ts: { size: 30, font: 'Poppins', weight: 500, color: '@muted', role: 'muted' } } }, { in: 'up' });
      place(r, 0, 0, M, t.y + t.h + 12 * u);
      const cw = (W - 2 * M - 30 * u) / 2;
      ['distance', 'runs', 'time', 'avgPace'].forEach((m, i) => {
        const s = mk('stat', { skin: 'sticker', props: { metric: m, layout: 'iconTop', iconColor: i % 2 ? '@accent2' : '@accent', valueTS: { size: 88, font: 'Poppins', weight: 700, color: '#2e2a4f' }, unitTS: { size: 32, font: 'Poppins', color: '#2e2a4f99' }, labelTS: { size: 17, font: 'Poppins', color: '#2e2a4f88' } }, style: { padX: 34, padY: 28, radius: 34 } }, { in: 'pop' });
        k.fitW(s, cw);
        place(s, 0.5, 0, M + (i % 2) * (cw + 30 * u) + cw / 2, r.y + r.h + 60 * u + Math.floor(i / 2) * 330 * u);
      });
      const bars = mk('mbars', { skin: 'sticker', props: { design: 'pills', color: '@accent', track: '#6d5dfc22', hlColor: '@accent2', dayTS: { color: '#2e2a4f99' }, valueTS: { color: '#2e2a4f' } }, style: { padX: 30, padY: 30, radius: 34 } }, { w: (W - 2 * M) / u, h: 560, in: 'wipe' });
      place(bars, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'sideweek', name: 'Side Column Week', desc: 'Right-hand column of week stats over a photo',
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const grid = mk('statgrid', { props: { cols: 1, align: 'right', layout: 'reverse', cellGapY: 46, items: [{ m: 'distance', on: true }, { m: 'runs', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }, { m: 'longest', on: true }], valueTS: { size: 76, font: 'Barlow Condensed', weight: 700, ...SH }, unitTS: { size: 30, font: 'Barlow Condensed', ...SH }, labelTS: { size: 18, ...SH } } }, { in: 'right' });
      k.fitW(grid, W * 0.45); place(grid, 1, 0.5, W - M, H * 0.52);
      const t = mk('text', { align: 'right', props: { text: '{title}', align: 'right', ts: { size: 50, font: 'Barlow Condensed', weight: 700, transform: 'upper', spacing: 2, ...SH } } }, { in: 'right' });
      k.fitW(t, W - 2 * M); place(t, 1, 1, W - M, grid.y - 50 * u);
      const r = mk('text', { align: 'right', props: { text: '{range}', align: 'right', ts: { size: 26, weight: 600, color: '@muted', role: 'muted', ...SH } } }, { in: 'right' });
      place(r, 1, 0, W - M, grid.y + grid.h + 40 * u);
    },
  },
  {
    id: 'trainlog', name: 'Training Log', desc: 'Striped run table with HR per run',
    bg: { type: 'gradient', color: '#1f2937', color2: '#111827', angle: 180 }, theme: { accent: '#22d3ee', accent2: '#f43f5e' },
    build(k) {
      const { W, H, M, mk, place, u } = k;
      const t = mk('text', { props: { text: 'TRAINING LOG', ts: { size: 96, font: 'Saira Condensed', weight: 800, spacing: 2 } } }, { in: 'left' });
      place(t, 0, 0, M, M + 20 * u);
      const r = mk('text', { props: { text: 'Week {week} · {range}', ts: { size: 32, font: 'Saira Condensed', weight: 600, color: '@accent', role: 'accent' } } }, { in: 'left' });
      place(r, 0, 0, M, t.y + t.h + 10 * u);
      const list = mk('mlist', { props: { design: 'striped', rowScale: 2, columns: [{ k: 'day', on: true }, { k: 'name', on: true }, { k: 'dist', on: true }, { k: 'time', on: true }, { k: 'pace', on: true }, { k: 'hr', on: true }], cellTS: { size: 30, font: 'Saira Condensed', weight: 600 }, nameTS: { size: 30, font: 'Saira Condensed', weight: 700 }, dayTS: { size: 28, font: 'Saira Condensed' }, headerTS: { size: 20 } } }, { in: 'fade' });
      k.fitW(list, W - 2 * M); place(list, 0, 0, M, r.y + r.h + 50 * u);
      const ch = mk('mchart', { skin: 'glass', props: { metric: 'avgHr', design: 'dots', color: '@accent2', label: 'day', yMin: '120', yMax: '175' } }, { w: (W - 2 * M) / u, h: 440, in: 'wipe' });
      place(ch, 0, 0, M, list.y + list.h + 50 * u);
      const grid = mk('statgrid', { skin: 'glass', props: { cols: 4, layout: 'reverse', align: 'center', cellGapX: 36, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgHr', on: true }], valueTS: { size: 46, font: 'Saira Condensed', weight: 800 }, unitTS: { size: 20 }, labelTS: { size: 15 } }, style: { padX: 30, padY: 24 } }, { in: 'up' });
      k.fitW(grid, W - 2 * M); place(grid, 0.5, 1, W / 2, H - M);
    },
  },
  {
    id: 'bannerweek', name: 'Top Banner Week', desc: 'Glass banner with week totals at the top',
    build(k) {
      const { W, M, mk, place, u } = k;
      const ban = mk('shape', { name: 'Banner', props: { shape: 'rect', color: '#00000088', radius: 30 } }, { w: (W - 2 * M) / u, h: 300, in: 'down' });
      place(ban, 0.5, 0, W / 2, M);
      const t = mk('text', { props: { text: '{title}', ts: { size: 48, font: 'Space Grotesk', weight: 700 } } }, { in: 'down' });
      k.fitW(t, W - 2 * M - 80 * u); place(t, 0, 0, M + 40 * u, ban.y + 36 * u);
      const r = mk('text', { props: { text: '{range}', ts: { size: 24, font: 'Space Grotesk', weight: 500, color: '@muted', role: 'muted' } } }, { in: 'down' });
      place(r, 0, 0, M + 40 * u, t.y + t.h + 12 * u);
      const grid = mk('statgrid', { props: { cols: 4, layout: 'reverse', cellGapX: 40, items: [{ m: 'runs', on: true }, { m: 'distance', on: true }, { m: 'time', on: true }, { m: 'avgPace', on: true }], valueTS: { size: 48, font: 'Space Grotesk', weight: 700 }, unitTS: { size: 20, font: 'Space Grotesk' }, labelTS: { size: 15 } } }, { in: 'down' });
      k.fitW(grid, W - 2 * M - 80 * u); place(grid, 0, 1, M + 40 * u, ban.y + ban.h - 30 * u);
    },
  },
];
