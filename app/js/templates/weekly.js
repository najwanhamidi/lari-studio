// Weekly (training block) templates.
const SH = { shadow: true, shadowColor: '#000000aa', shadowBlur: 14, shadowX: 0, shadowY: 3 };
const DARK = '#0d0f14';
function fitTo(k, el, maxW, grow = 1.7) {
  const f = Math.min(maxW / el.w, grow);
  if (f < 1) k.fitW(el, maxW); else if (f > 1.02) { el.s *= f; k.relayout(el); }
  return el;
}
function fitBox(k, el, maxW, maxH, grow = 2.2) {
  const f = Math.min(maxW / el.w, maxH / el.h, grow);
  if (f < 1) k.fitW(el, el.w * f); else if (f > 1.02) { el.s *= f; k.relayout(el); }
  return el;
}
const grid = (k, items, over, maxW, opt = {}) => fitTo(k, k.mk('statgrid', { ...over, props: { cols: items.length, layout: 'reverse', cellGapX: 40, items: items.map((m) => ({ m, on: true })), ...(over.props || {}) } }, { in: 'up', ...opt }), maxW);
const chart = (k, props, w, h, over = {}, opt = {}) => k.mk('wchart', { ...over, props }, { w: w / k.u, h: h / k.u, in: 'fade', ...opt });
const head = (k, titleTS, subText, subTS, align = 'left') => {
  const { W, M, mk, place, u } = k, IW = W - 2 * M;
  const t = mk('text', { props: { text: '{title}', align, ts: titleTS } }, { in: 'down' });
  k.fitW(t, IW); place(t, align === 'center' ? 0.5 : 0, 0, align === 'center' ? W / 2 : M, M);
  const s = mk('text', { props: { text: subText, align, ts: subTS } }, { in: 'down' });
  k.fitW(s, IW); place(s, align === 'center' ? 0.5 : 0, 0, align === 'center' ? W / 2 : M, t.y + t.h + 10 * u);
  return s.y + s.h;
};

export const WEEKLY_TEMPLATES = [
  {
    id: 'blockoverview', name: 'Block Overview', desc: 'Totals, km per week coloured by phase, phase timeline',
    bg: { type: 'gradient', color: '#0f172a', color2: '#020617', angle: 180 }, theme: { accent: '#c6ff3d', accent2: '#38bdf8' },
    build(k) {
      const { W, H, M, place, u } = k, IW = W - 2 * M, G = 40 * u;
      let y = head(k, { size: 84, font: 'Montserrat', weight: 900 }, '{range} · {weeks} weeks', { size: 30, weight: 600, color: '@muted', role: 'muted' });
      const g = grid(k, ['distance', 'avgWeek', 'peak', 'runs'], { skin: 'glass', props: { align: 'center', valueTS: { size: 56 }, unitTS: { size: 22 }, labelTS: { size: 16 } }, style: { padX: 28, padY: 24 } }, IW);
      g.w = IW; place(g, 0, 0, M, y + G); y = g.y + g.h + G;
      const ph = k.mk('wphase', {}, { w: IW / u, h: 190, in: 'wipe' });
      const lg = k.mk('wlegend', { props: { style: 'dot' } }, { in: 'fade' }); k.fitW(lg, IW);
      place(lg, 0.5, 1, W / 2, H - M); place(ph, 0, 1, M, lg.y - G * 0.7);
      const c = chart(k, { design: 'bars', phaseLabels: 'none', showY: true }, IW, ph.y - G - y, { skin: 'glass', style: { padX: 24, padY: 24 } });
      place(c, 0, 0, M, y);
    },
  },
  {
    id: 'mileagebars', name: 'Weekly Mileage', desc: 'Giant total and pill bars with km on every week',
    bg: { type: 'solid', color: '#0b0b10' }, theme: { accent: '#ff6b35', accent2: '#ffd166' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M;
      const l = mk('text', { props: { text: '{weeks} WEEKS OF RUNNING', ts: { size: 36, weight: 800, spacing: 6, color: '@accent', role: 'accent' } } }, { in: 'down' });
      k.fitW(l, IW); place(l, 0, 0, M, M);
      const big = mk('stat', { props: { metric: 'distance', layout: 'stackUnit', showLabel: false, decimals: 0, valueTS: { size: 300, font: 'Anton', weight: 400 }, unitTS: { size: 80, font: 'Anton', weight: 400 } } }, { in: 'pop' });
      fitTo(k, big, IW, 1.2); place(big, 0, 0, M, l.y + l.h + 10 * u);
      const r = mk('text', { props: { text: '{title} · {range}', ts: { size: 30, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'up' });
      k.fitW(r, IW); place(r, 0, 0, M, big.y + big.h + 10 * u);
      const top = r.y + r.h + 60 * u;
      const c = chart(k, { design: 'pills', phaseLabels: 'each', weekLabels: 'num', valueTS: { size: 26 }, phaseTS: { size: 15 } }, IW, H - M - top);
      place(c, 0, 0, M, top);
    },
  },
  {
    id: 'buildreport', name: 'Build Report', desc: 'Area chart of the block plus a full week table',
    bg: { type: 'gradient', color: '#111827', color2: '#030712', angle: 180 }, theme: { accent: '#34d399', accent2: '#60a5fa' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 36 * u;
      const y = head(k, { size: 76, font: 'Inter', weight: 800 }, '{range} · {distance} {unit} · peak {peak} {unit}', { size: 28, weight: 600, color: '@accent', role: 'accent' });
      const c = chart(k, { design: 'area', color: '@accent', phaseLabels: 'group', showY: true, valueTS: { size: 22 } }, IW, 620 * u);
      place(c, 0, 0, M, y + G);
      const tb = mk('wtable', { skin: 'glass', props: { design: 'striped', columns: [['week', 1], ['phase', 1], ['dates', 0], ['dist', 1], ['runs', 1], ['time', 1], ['pace', 1], ['change', 1], ['bar', 0]].map(([kk, on]) => ({ k: kk, on: !!on, label: '' })) }, style: { padX: 20, padY: 18 } }, { in: 'fade' });
      const top = c.y + c.h + G; fitBox(k, tb, IW, H - M - top); place(tb, 0.5, 0, W / 2, top);
    },
  },
  {
    id: 'weekcards', name: 'Week Cards', desc: 'A card for every week with km, runs and daily bars',
    bg: { type: 'gradient', color: '#1e1b4b', color2: '#0f0a24', angle: 170 }, theme: { accent: '#a78bfa', accent2: '#f472b6' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 30 * u;
      const y = head(k, { size: 76, font: 'Lexend', weight: 800 }, '{weeks} weeks · {distance} {unit} · {runs} runs', { size: 28, font: 'Lexend', weight: 500, color: '@accent', role: 'accent' });
      const n = (k.env.weekly && k.env.weekly.count) || 12;
      const c = mk('wcards', { props: { cols: n > 16 ? 4 : n > 6 ? 3 : 2, band: 'top' } }, { w: IW / u, h: (H - M - y - G) / u, in: 'fade' });
      place(c, 0, 0, M, y + G);
    },
  },
  {
    id: 'trainlogw', name: 'Training Log', desc: 'Every week in a table with dates, pace, longest run and change',
    bg: { type: 'solid', color: '#0b1220' }, theme: { accent: '#22d3ee', accent2: '#a3e635' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 34 * u;
      const y = head(k, { size: 80, font: 'Rajdhani', weight: 700, transform: 'upper' }, '{range} · {distance} {unit} · avg {avgWeek} {unit}/week', { size: 30, font: 'Rajdhani', weight: 600, color: '@accent', role: 'accent' });
      const ph = mk('wphase', { props: { design: 'outline', showKm: false } }, { w: IW / u, h: 150, in: 'wipe' });
      place(ph, 0, 1, M, H - M);
      const tb = mk('wtable', { props: { design: 'boxed', rowScale: 1.9, colGap: 26, columns: [['week', 1], ['phase', 1], ['dates', 1], ['dist', 1], ['runs', 1], ['pace', 1], ['long', 1], ['change', 1]].map(([kk, on]) => ({ k: kk, on: !!on, label: '' })), cellTS: { font: 'Rajdhani', weight: 600 }, weekTS: { font: 'Rajdhani' } } }, { in: 'fade' });
      fitBox(k, tb, IW, ph.y - G - (y + G)); place(tb, 0.5, 0, W / 2, y + G);
    },
  },
  {
    id: 'heatblock', name: 'Heat Block', desc: 'Every day of the block as a heatmap, weeks as rows',
    bg: { type: 'gradient', color: '#2e1065', color2: '#0c0518', angle: 180 }, theme: { accent: '#fb923c', accent2: '#facc15' },
    build(k) {
      const { W, H, M, place, u } = k, IW = W - 2 * M, G = 36 * u;
      const y = head(k, { size: 80, font: 'Kanit', weight: 800 }, '{range}', { size: 30, font: 'Kanit', weight: 500, color: '@accent', role: 'accent' });
      const g = grid(k, ['distance', 'runs', 'avgWeek', 'longest'], { props: { align: 'center', valueTS: { size: 54, font: 'Kanit', weight: 700 }, unitTS: { size: 20 }, labelTS: { size: 15 } } }, IW);
      place(g, 0.5, 0, W / 2, y + G);
      const lg = k.mk('wlegend', { props: { style: 'pill', legendTS: { size: 18 } } }, { in: 'fade' }); k.fitW(lg, IW); place(lg, 0.5, 1, W / 2, H - M);
      const hm = k.mk('wheat', {}, { w: IW / u, h: (lg.y - G - (g.y + g.h + G)) / u, in: 'fade' });
      place(hm, 0, 0, M, g.y + g.h + G);
    },
  },
  {
    id: 'roadtorace', name: 'Road to Race', desc: 'Countdown style: step chart, target line and race week',
    bg: { type: 'gradient', color: '#7f1d1d', color2: '#1c0606', angle: 180 }, theme: { text: '#ffffff', muted: '#ffffffb0', accent: '#fca5a5', accent2: '#fde68a' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 40 * u;
      const t = mk('text', { props: { text: 'ROAD\nTO RACE', ts: { size: 150, font: 'Anton', weight: 400, lineHeight: 0.92 } } }, { in: 'left' });
      k.fitW(t, IW * 0.62); place(t, 0, 0, M, M);
      const big = mk('stat', { props: { metric: 'distance', layout: 'reverse', align: 'right', decimals: 0, label: 'Total km', valueTS: { size: 120, font: 'Anton', weight: 400, color: '@accent2' }, unitTS: { size: 40, font: 'Anton', weight: 400 }, labelTS: { size: 20 } } }, { in: 'right' });
      k.fitW(big, IW * 0.38); place(big, 1, 1, W - M, t.y + t.h);
      const r = mk('text', { props: { text: '{title} · {range}', ts: { size: 30, weight: 600, color: '@muted', role: 'muted' } } }, { in: 'left' });
      k.fitW(r, IW); place(r, 0, 0, M, t.y + t.h + 20 * u);
      const ph = mk('wphase', { props: { design: 'steps', showKm: false } }, { w: IW / u, h: 300, in: 'wipe' });
      place(ph, 0, 1, M, H - M);
      const c = chart(k, { design: 'step', color: '#ffffff', lineW: 5, refLine: 'avg', phaseLabels: 'none', valueTS: { size: 22 } }, IW, ph.y - G - (r.y + r.h + G));
      place(c, 0, 0, M, r.y + r.h + G);
    },
  },
  {
    id: 'photoblock', name: 'Photo Block', desc: 'Glass weekly chart over your photo',
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 24 * u;
      head(k, { size: 84, font: 'Poppins', weight: 800, ...SH }, '{weeks} weeks · {distance} {unit}', { size: 32, font: 'Poppins', weight: 500, ...SH });
      const lg = mk('wlegend', { props: { legendTS: { size: 20, ...SH } } }, { in: 'fade' }); k.fitW(lg, IW); place(lg, 0.5, 1, W / 2, H - M);
      const c = chart(k, { design: 'bars', phaseLabels: 'none', weekLabels: 'num', labelTS: { color: '#ffffffcc' } }, IW, H * 0.4, { skin: 'glass', style: { padX: 24, padY: 24 } });
      place(c, 0, 1, M, lg.y - G);
      const g = grid(k, ['avgWeek', 'peak', 'runs'], { skin: 'glass', props: { align: 'center', valueTS: { size: 50 }, unitTS: { size: 20 }, labelTS: { size: 15 } }, style: { padX: 26, padY: 20 } }, IW);
      g.w = IW; place(g, 0, 1, M, c.y - G);
    },
  },
  {
    id: 'neonblock', name: 'Neon Block', desc: 'Glowing lollipops with a neon phase strip',
    bg: { type: 'solid', color: '#05060a' }, theme: { accent: '#00f0ff', accent2: '#ff2bd6' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 40 * u;
      const y = head(k, { size: 80, font: 'Orbitron', weight: 800, color: '@accent', shadow: true, shadowColor: '@accent', shadowBlur: 26, shadowX: 0, shadowY: 0 }, '{range} · {distance} {unit}', { size: 26, font: 'Orbitron', weight: 500, color: '@accent2' }, 'center');
      const g = grid(k, ['distance', 'avgWeek', 'peak'], { skin: 'neon', props: { align: 'center', valueTS: { size: 48, font: 'Orbitron' }, unitTS: { size: 18 }, labelTS: { size: 14 } }, style: { padX: 24, padY: 22 } }, IW);
      g.w = IW; place(g, 0, 0, M, y + G);
      const ph = mk('wphase', { props: { design: 'outline', phaseTS: { font: 'Orbitron' } } }, { w: IW / u, h: 180, in: 'wipe' });
      place(ph, 0, 1, M, H - M);
      const c = chart(k, { design: 'lollipop', phaseLabels: 'none', valueTS: { size: 22, font: 'Orbitron' }, labelTS: { font: 'Orbitron' } }, IW, ph.y - G - (g.y + g.h + G), { skin: 'neon', style: { padX: 24, padY: 24 } });
      place(c, 0, 0, M, g.y + g.h + G);
    },
  },
  {
    id: 'paperblock', name: 'Paper Log', desc: 'Light paper style with a lined week table',
    bg: { type: 'solid', color: '#f6f3ec' }, theme: { text: '#1c1917', muted: '#1c1917a0', accent: '#c2410c', accent2: '#0f766e' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 36 * u;
      const y = head(k, { size: 92, font: 'DM Serif Display', weight: 400 }, '{range} — {weeks} weeks, {distance} {unit}', { size: 30, font: 'Playfair Display', italic: true, weight: 400, color: '@accent', role: 'accent' });
      const c = chart(k, { design: 'bars', radius: 4, track: '#1c191710', phaseLabels: 'group', valueTS: { color: '#1c1917', font: 'Playfair Display' }, labelTS: { color: '#1c1917a0' }, refColor: '#1c191788', axisTS: { color: '#1c1917a0' }, hlColor: '#1c1917' }, IW, 560 * u);
      place(c, 0, 0, M, y + G);
      const tb = mk('wtable', { props: { design: 'lines', lineColor: '#1c191726', columns: [['week', 1], ['phase', 1], ['dates', 1], ['dist', 1], ['runs', 1], ['long', 1], ['bar', 0]].map(([kk, on]) => ({ k: kk, on: !!on, label: '' })), cellTS: { font: 'Playfair Display', weight: 400 }, weekTS: { font: 'Playfair Display', weight: 700 } } }, { in: 'fade' });
      const top = c.y + c.h + G; fitBox(k, tb, IW, H - M - top); place(tb, 0, 0, M, top);
    },
  },
  {
    id: 'hweeks', name: 'Week by Week', desc: 'One horizontal bar per week with its phase',
    bg: { type: 'gradient', color: '#0f2027', color2: '#203a43', angle: 170 }, theme: { accent: '#5ee7ff', accent2: '#c6ff3d' },
    build(k) {
      const { W, H, M, place } = k, IW = W - 2 * M;
      const y = head(k, { size: 76, font: 'Space Grotesk', weight: 700 }, '{range} · {distance} {unit} · avg {avgWeek} {unit}', { size: 28, font: 'Space Grotesk', weight: 500, color: '@accent', role: 'accent' });
      const c = chart(k, { design: 'hbars', phaseLabels: 'each', weekLabels: 'name', valueUnit: true, gap: 0.3, valueTS: { size: 28, font: 'Space Grotesk' }, labelTS: { size: 24, font: 'Space Grotesk', color: '@text' }, phaseTS: { size: 16 } }, IW, H - M - y - 40 * k.u);
      place(c, 0, 0, M, y + 40 * k.u);
    },
  },
  {
    id: 'brutalblock', name: 'Brutal Block', desc: 'Hard-shadow boxes, bold bars and phase pills',
    bg: { type: 'solid', color: '#f2f0ea' }, theme: { text: DARK, muted: '#0d0f14aa', accent: '#ff3d2e', accent2: '#2563eb' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M - 10 * u, G = 36 * u;
      const t = mk('text', { props: { text: 'TRAINING\nBLOCK', ts: { size: 130, font: 'Archivo Black', weight: 400, lineHeight: 0.92 } } }, { in: 'left' });
      k.fitW(t, IW); place(t, 0, 0, M, M);
      const cw = (IW - 30 * u) / 2; let y = t.y + t.h + G, rowMax = 0;
      ['distance', 'avgWeek', 'peak', 'weeks'].forEach((m, i) => {
        const s = mk('stat', { skin: 'brutal', props: { metric: m, layout: 'tag', valueTS: { size: 70, font: 'Archivo Black', weight: 400 }, unitTS: { size: 26, font: 'Archivo Black', weight: 400 }, labelTS: { size: 16 } }, style: { padX: 26, padY: 22 } }, { in: 'drop' });
        fitTo(k, s, cw); place(s, 0, 0, M + (i % 2) * (cw + 30 * u), y); rowMax = Math.max(rowMax, s.h);
        if (i % 2) { y += rowMax + 30 * u; rowMax = 0; }
      });
      const lg = mk('wlegend', { props: { style: 'pill', legendTS: { size: 18 } } }, { in: 'fade' }); k.fitW(lg, IW); place(lg, 0, 1, M, H - M - 10 * u);
      const c = chart(k, { design: 'bars', radius: 0, phaseLabels: 'none', valueTS: { color: DARK, font: 'Archivo Black', weight: 400 }, labelTS: { color: '#0d0f14aa' }, hlColor: DARK, refColor: '#0d0f1488', axisTS: { color: '#0d0f14aa' }, track: '#0d0f1412' }, IW, lg.y - G - y, { skin: 'brutal', style: { padX: 24, padY: 22 } });
      place(c, 0, 0, M, y);
    },
  },
  {
    id: 'minimalblock', name: 'Minimal Mileage', desc: 'Just the total and a thin weekly line',
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M;
      const big = mk('stat', { props: { metric: 'distance', layout: 'classic', decimals: 0, label: 'Training block', valueTS: { size: 240, font: 'Inter', weight: 200, spacing: -6, ...SH }, unitTS: { size: 60, font: 'Inter', weight: 300, ...SH }, labelTS: { size: 24, spacing: 6, ...SH } } }, { in: 'up' });
      fitTo(k, big, IW, 1.2); place(big, 0, 1, M, H * 0.62);
      const c = chart(k, { design: 'line', color: '#ffffff', colorBy: 'solid', lineW: 4, showValues: true, phaseLabels: 'none', refLine: 'none', hlPeak: false, valueTS: { size: 20, ...SH }, labelTS: { ...SH } }, IW, 380 * u);
      place(c, 0, 0, M, big.y + big.h + 40 * u);
    },
  },
  {
    id: 'weeklistblock', name: 'Week List', desc: 'Compact chart on top, a row per week below',
    bg: { type: 'solid', color: '#000000' }, theme: { accent: '#30d158', accent2: '#ff9f0a' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 30 * u;
      const y = head(k, { size: 70, font: 'Inter', weight: 700 }, '{range}', { size: 26, weight: 500, color: '@muted', role: 'muted' });
      const c = chart(k, { design: 'bars', phaseLabels: 'none', showValues: false, weekLabels: 'none', hlPeak: true, radius: 6 }, IW, 300 * u, { style: { bg: 'solid', bgColor: '#1c1c1e', bgOpacity: 1, radius: 28, padX: 24, padY: 22 } });
      place(c, 0, 0, M, y + G);
      const top = c.y + c.h + G;
      const l = mk('wcards', { props: { design: 'list', cardBg: '#1c1c1e', band: 'left', radius: 22, gap: 12 } }, { w: IW / u, h: (H - M - top) / u, in: 'fade' });
      place(l, 0, 0, M, top);
    },
  },
  {
    id: 'coachdash', name: 'Coach Dashboard', desc: 'Distance and time per week, heatmap and legend',
    bg: { type: 'gradient', color: '#18181b', color2: '#09090b', angle: 180 }, theme: { accent: '#22c55e', accent2: '#eab308' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 26 * u;
      const y = head(k, { size: 64, font: 'Inter', weight: 800 }, '{range} · {runs} runs · {time}', { size: 26, weight: 600, color: '@accent', role: 'accent' });
      const g = grid(k, ['distance', 'avgWeek', 'peak', 'longest'], { skin: 'solidDark', props: { align: 'center', valueTS: { size: 48 }, unitTS: { size: 20 }, labelTS: { size: 14 } }, style: { padX: 24, padY: 20 } }, IW);
      g.w = IW; place(g, 0, 0, M, y + G);
      const R = H - M - (g.y + g.h + G), h1 = R * 0.36, h2 = R * 0.26, h3 = R - h1 - h2 - 2 * G;
      const c1 = chart(k, { design: 'bars', phaseLabels: 'group', valueTS: { size: 20 }, phaseTS: { size: 14 } }, IW, h1, { skin: 'solidDark', style: { padX: 22, padY: 20 } });
      place(c1, 0, 0, M, g.y + g.h + G);
      const c2 = chart(k, { metric: 'time', design: 'area', color: '@accent2', colorBy: 'solid', phaseLabels: 'none', valueTS: { size: 18 }, refLine: 'none' }, IW, h2, { skin: 'solidDark', style: { padX: 22, padY: 18 } });
      place(c2, 0, 0, M, c1.y + h1 + G);
      const hm = mk('wheat', { skin: 'solidDark', style: { padX: 20, padY: 18 } }, { w: (IW * 0.66) / u, h: h3 / u, in: 'fade' });
      place(hm, 0, 0, M, c2.y + h2 + G);
      const lg = mk('wlegend', { props: { layout: 'column', showCount: true, legendTS: { size: 20 } } }, { in: 'fade' }); fitBox(k, lg, IW * 0.32, h3, 1.4); place(lg, 1, 0.5, W - M, hm.y + h3 / 2);
    },
  },
  {
    id: 'stackedruns', name: 'Stacked Runs', desc: 'Each week’s runs stacked into its bar',
    bg: { type: 'gradient', color: '#1a1a2e', color2: '#16213e', angle: 160 }, theme: { accent: '#ffb703', accent2: '#fb8500' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 36 * u;
      const y = head(k, { size: 80, font: 'Barlow Condensed', weight: 700, transform: 'upper' }, '{runs} runs · {distance} {unit} · longest {longest} {unit}', { size: 30, font: 'Barlow Condensed', weight: 600, color: '@accent', role: 'accent' });
      const tb = mk('wtable', { skin: 'glass', props: { design: 'plain', columns: [['week', 1], ['phase', 1], ['runs', 1], ['dist', 1], ['long', 1], ['time', 1]].map(([kk, on]) => ({ k: kk, on: !!on, label: '' })), cellTS: { size: 24, font: 'Barlow Condensed', weight: 600 }, weekTS: { size: 24, font: 'Barlow Condensed' } }, style: { padX: 20, padY: 16 } }, { in: 'fade' });
      fitBox(k, tb, IW, (H - y) * 0.42); place(tb, 0.5, 1, W / 2, H - M);
      const c = chart(k, { design: 'stacked', gap: 0.22, radius: 8, phaseLabels: 'group', valueTS: { font: 'Barlow Condensed', size: 26 } }, IW, tb.y - G - (y + G));
      place(c, 0, 0, M, y + G);
    },
  },
  {
    id: 'auroraweeks', name: 'Aurora Weeks', desc: 'Frosted week cards on a colourful gradient',
    bg: { type: 'gradient', color: '#00c6ff', color2: '#7b2ff7', angle: 150 }, theme: { text: '#ffffff', muted: '#ffffffcc', accent: '#ffffff', accent2: '#ffe066' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 30 * u;
      const y = head(k, { size: 84, font: 'Unbounded', weight: 800 }, '{range}', { size: 28, font: 'Unbounded', weight: 500 });
      const c = chart(k, { design: 'line', color: '#ffffff', colorBy: 'phase', lineW: 5, phaseLabels: 'none', refLine: 'avg', valueTS: { size: 20, font: 'Unbounded' } }, IW, 380 * u, { skin: 'frost', style: { padX: 24, padY: 22 } });
      place(c, 0, 0, M, y + G);
      const n = (k.env.weekly && k.env.weekly.count) || 12;
      const cards = mk('wcards', { props: { cols: n > 12 ? 4 : 3, cardBg: '#ffffff26', band: 'fill', showDays: false, nameTS: { font: 'Unbounded', size: 18 }, valueTS: { font: 'Unbounded', weight: 700 } } }, { w: IW / u, h: (H - M - (c.y + c.h + G)) / u, in: 'fade' });
      place(cards, 0, 0, M, c.y + c.h + G);
    },
  },
  {
    id: 'phasesteps', name: 'Phase Steps', desc: 'Big phase blocks over a stepped weekly chart',
    bg: { type: 'solid', color: '#0a0a0f' }, theme: { accent: '#c6ff3d', accent2: '#00e0ff' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 40 * u;
      const y = head(k, { size: 96, font: 'Bebas Neue', weight: 400, spacing: 3 }, '{weeks} WEEKS · {distance} {unit} · PEAK {peak} {unit}', { size: 32, font: 'Bebas Neue', weight: 400, spacing: 3, color: '@accent', role: 'accent' });
      const ph = mk('wphase', { props: { design: 'blocks', showKm: false, phaseTS: { size: 26 } } }, { w: IW / u, h: 230, in: 'wipe' });
      place(ph, 0, 0, M, y + G);
      const c = chart(k, { design: 'step', color: '@accent', lineW: 6, phaseLabels: 'none', showY: true, valueTS: { size: 24, font: 'Bebas Neue', weight: 400 } }, IW, H - M - (ph.y + ph.h + G));
      place(c, 0, 0, M, ph.y + ph.h + G);
    },
  },
  {
    id: 'timeblock', name: 'Hours per Week', desc: 'Training time each week, with distance alongside',
    bg: { type: 'gradient', color: '#14281d', color2: '#08110c', angle: 180 }, theme: { accent: '#a3e635', accent2: '#fbbf24' },
    build(k) {
      const { W, H, M, mk, place, u } = k, IW = W - 2 * M, G = 36 * u;
      const y = head(k, { size: 80, font: 'Teko', weight: 600, transform: 'upper' }, '{time} of running · {distance} {unit}', { size: 34, font: 'Teko', weight: 500, color: '@accent', role: 'accent' });
      const R = H - M - y - G, h1 = R * 0.5 - G / 2;
      const c1 = chart(k, { metric: 'time', design: 'pills', phaseLabels: 'none', valueTS: { size: 24, font: 'Teko' } }, IW, h1);
      place(c1, 0, 0, M, y + G);
      const c2 = chart(k, { metric: 'distance', design: 'bars', colorBy: 'solid', color: '@accent2', phaseLabels: 'group', valueTS: { size: 24, font: 'Teko' } }, IW, h1);
      place(c2, 0, 0, M, c1.y + h1 + G);
      const l1 = mk('text', { props: { text: 'TIME', ts: { size: 22, weight: 800, spacing: 4, color: '@accent' } } }, { anim: false }); place(l1, 1, 0, W - M, c1.y);
      const l2 = mk('text', { props: { text: 'DISTANCE', ts: { size: 22, weight: 800, spacing: 4, color: '@accent2' } } }, { anim: false }); place(l2, 1, 0, W - M, c2.y);
    },
  },
];
