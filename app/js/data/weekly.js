// Weekly (training block) mode: N week slots, each loaded from its own ZIP and labelled with a training phase.
import { isNum, clamp, fmtDate, uid } from '../util.js';

export const PHASES = [
  ['base', 'Base', '#38bdf8'], ['build', 'Build', '#f97316'], ['training', 'Training', '#a3e635'],
  ['down', 'Down week', '#a78bfa'], ['taper', 'Taper', '#fbbf24'], ['race', 'Race week', '#f43f5e'], ['custom', 'Custom', '#94a3b8'],
];
export const PHASE_KEYS = PHASES.map((p) => p[0]);

export function newWeekly() {
  return { count: 12, weeks: [], phaseNames: {}, phaseColors: {} };
}
export function newWeek() { return { id: uid(), name: '', phase: 'training', custom: '', customColor: '', runs: [], start: null }; }
export function ensureWeeks(W) {
  while (W.weeks.length < W.count) W.weeks.push(newWeek());
  return W.weeks.slice(0, W.count);
}

// Keep only what weekly widgets need from a full activity.
export function summarizeAct(a) {
  return {
    id: a.id || uid(), start: a.start instanceof Date ? a.start.toISOString() : a.start, name: a.name,
    distance: a.distance, moving: a.moving, elapsed: a.elapsed, ascent: a.ascent || 0, calories: a.calories || 0,
    avgHr: a.avgHr, maxHr: a.maxHr, avgCad: a.avgCad, avgPace: a.avgPace, hasGps: !!a.hasGps,
  };
}

export function phaseOf(w, W) {
  const key = PHASE_KEYS.includes(w.phase) ? w.phase : 'training';
  const def = PHASES.find((p) => p[0] === key);
  let name = (W.phaseNames && W.phaseNames[key]) || def[1];
  if (key === 'custom') name = w.custom || name;
  const color = (key === 'custom' && w.customColor) || (W.phaseColors && W.phaseColors[key]) || def[2];
  return { key, name, color };
}

const startOfWeek = (d, ws) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() - ws + 7) % 7)); return x; };

export function weeklyStats(W, opts = {}) {
  const ws = opts.weekStart ?? 1;
  const slots = ensureWeeks(W);
  const weeks = slots.map((w, i) => {
    const runs = (w.runs || []).map((r) => ({ ...r, start: new Date(r.start) })).sort((a, b) => a.start - b.start);
    let dist = 0, time = 0, asc = 0, cal = 0, hrW = 0, hrT = 0, longest = null, maxHr = NaN;
    for (const r of runs) {
      dist += r.distance || 0; time += r.moving || 0; asc += r.ascent || 0; cal += r.calories || 0;
      if (isNum(r.avgHr)) { hrW += r.avgHr * r.moving; hrT += r.moving; }
      if (isNum(r.maxHr) && !(r.maxHr <= maxHr)) maxHr = r.maxHr;
      if (!longest || r.distance > longest.distance) longest = r;
    }
    const start = w.start ? startOfWeek(new Date(w.start), ws) : runs.length ? startOfWeek(runs[0].start, ws) : null;
    const days = Array.from({ length: 7 }, () => 0);
    if (start) for (const r of runs) { const idx = Math.floor((new Date(r.start).setHours(0, 0, 0, 0) - start) / 86400000); if (idx >= 0 && idx < 7) days[idx] += r.distance; }
    const ph = phaseOf(w, W);
    return {
      i, n: i + 1, id: w.id, label: w.name || `Week ${i + 1}`, short: w.name || `W${i + 1}`, phase: ph.key, phaseName: ph.name, color: ph.color,
      runs, count: runs.length, distance: dist, time, ascent: asc, calories: cal,
      avgPace: dist > 0 ? time / (dist / 1000) : NaN, avgHr: hrT ? hrW / hrT : NaN, maxHr, longest, start, end: start ? new Date(start.getTime() + 6 * 86400000) : null, days,
      empty: !runs.length,
    };
  });
  // fill in dates for empty weeks from neighbours
  for (let k = 0; k < 2; k++) weeks.forEach((w, i) => {
    if (w.start) return;
    const p = weeks[i - 1], n = weeks[i + 1];
    if (p && p.start) w.start = new Date(p.start.getTime() + 7 * 86400000);
    else if (n && n.start) w.start = new Date(n.start.getTime() - 7 * 86400000);
    if (w.start) w.end = new Date(w.start.getTime() + 6 * 86400000);
  });
  weeks.forEach((w, i) => { const p = weeks[i - 1]; w.change = p && p.distance > 0 ? (w.distance - p.distance) / p.distance : NaN; });
  const S = { weeks, count: weeks.length };
  let dist = 0, time = 0, asc = 0, cal = 0, runs = 0, hrW = 0, hrT = 0, longest = null, peak = null, active = 0;
  for (const w of weeks) {
    dist += w.distance; time += w.time; asc += w.ascent; cal += w.calories; runs += w.count;
    if (isNum(w.avgHr)) { hrW += w.avgHr * w.time; hrT += w.time; }
    if (w.longest && (!longest || w.longest.distance > longest.distance)) longest = w.longest;
    if (!peak || w.distance > peak.distance) peak = w;
    if (!w.empty) active++;
  }
  const done = weeks.filter((w) => !w.empty);
  const last = done[done.length - 1] || weeks[weeks.length - 1];
  Object.assign(S, {
    distance: dist, time, ascent: asc, calories: cal, runs, active,
    avgPace: dist > 0 ? time / (dist / 1000) : NaN, avgHr: hrT ? hrW / hrT : NaN,
    longest, peak, last, avgWeek: active ? dist / active : 0, maxDist: Math.max(1, ...weeks.map((w) => w.distance)),
    first: weeks.find((w) => w.start)?.start || null, lastDate: [...weeks].reverse().find((w) => w.end)?.end || null,
  });
  S.rangeText = (style) => {
    const a = S.first, b = S.lastDate; if (!a || !b) return '';
    if (style === 'numeric') return `${fmtDate(a, 'numeric')} – ${fmtDate(b, 'numeric')}`;
    if (a.getFullYear() === b.getFullYear()) return `${fmtDate(a, 'short')} – ${fmtDate(b, 'medium')}`;
    return `${fmtDate(a, 'medium')} – ${fmtDate(b, 'medium')}`;
  };
  return S;
}

// Animated state: totals count up, k = weeks revealed so far.
export function weeklyStateAt(S, t) {
  t = clamp(t, 0, 1);
  if (t >= 1) return { ...S, t: 1 };
  return { ...S, t, distance: S.distance * t, time: S.time * t, ascent: S.ascent * t, calories: S.calories * t, runs: Math.floor(S.runs * t + 1e-6), active: Math.floor(S.active * t + 1e-6) };
}

// Split a pile of runs into calendar weeks (for "one ZIP with everything").
export function splitIntoWeeks(acts, ws = 1) {
  if (!acts.length) return [];
  const sorted = [...acts].sort((a, b) => new Date(a.start) - new Date(b.start));
  const first = startOfWeek(new Date(sorted[0].start), ws), lastW = startOfWeek(new Date(sorted[sorted.length - 1].start), ws);
  const n = Math.round((lastW - first) / (7 * 86400000)) + 1;
  const out = Array.from({ length: n }, (_, i) => ({ start: new Date(first.getTime() + i * 7 * 86400000), runs: [] }));
  for (const a of sorted) { const i = Math.round((startOfWeek(new Date(a.start), ws) - first) / (7 * 86400000)); if (out[i]) out[i].runs.push(a); }
  return out;
}

// Sample 12-week marathon block, shown until the user loads weeks.
export function sampleWeekly() {
  const plan = [[32, 'base'], [36, 'base'], [41, 'build'], [46, 'build'], [35, 'down'], [51, 'build'], [56, 'training'], [42, 'down'], [62, 'training'], [48, 'taper'], [36, 'taper'], [52, 'race']];
  const base = new Date(2026, 7, 31, 6, 30).getTime();
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const W = newWeekly(); W.count = plan.length;
  W.weeks = plan.map(([km, phase], i) => {
    const w = newWeek(); w.phase = phase;
    const parts = phase === 'race' ? [6, 5, 0, 0, 0, 42.2 - 0, 0] : [0.18, 0.14, 0.2, 0, 0.12, 0, 0.36];
    const total = phase === 'race' ? 53.2 : km;
    w.runs = parts.map((f, d) => {
      const dkm = phase === 'race' ? f : f * total; if (!dkm) return null;
      const pace = (d === 6 ? 345 : d === 2 ? 300 : 330) - i * 1.5 + (rnd() - 0.5) * 10;
      return { id: uid(), start: new Date(base + (i * 7 + d) * 86400000).toISOString(), name: d === 6 ? 'Long Run' : d === 2 ? 'Tempo' : 'Easy Run', distance: dkm * 1000, moving: dkm * pace, elapsed: dkm * pace * 1.03, ascent: dkm * 6, calories: dkm * 65, avgHr: 140 + (d === 2 ? 14 : 0) + rnd() * 6, maxHr: 170, avgCad: 170, avgPace: pace, hasGps: true };
    }).filter(Boolean);
    if (phase === 'race') { w.name = 'Race week'; w.runs[w.runs.length - 1].name = 'Marathon'; }
    return w;
  });
  return W;
}
