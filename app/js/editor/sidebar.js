// Left sidebar: Data, Templates, Add, Layers, Trash.
import { App, on, emit, commit, setSel, addElement, restoreTrash, makeEnv, layoutAll, currentAct, currentActs, usingSample, invalidateMulti, invalidateWeekly, currentWeekly, addAsset, resetHistory, newDoc, THEMES } from './state.js';
import { PHASES, ensureWeeks, newWeek, summarizeAct, splitIntoWeeks } from '../data/weekly.js';
import { REG, renderScene } from '../widgets/core.js';
import { LIBRARY } from '../widgets/index.js';
import { TEMPLATES, buildTemplate, templateDocPatch } from '../templates/templates.js';
import { loadFiles } from '../data/loader.js';
import { el, clone, fmtDist, fmtDuration, fmtPace, fmtDate, fmtInt, distUnit, paceUnit, readFileAs, deepMerge, uid } from '../util.js';
import { section, row, textInput, numInput, select, seg, toggle, button, iconCanvas, toast, modal, colorInput } from './ui.js';
import { moveLayer } from './actions.js';
import { fitZoom } from './stage.js';
import { ensureFontsLoaded } from './panels.js';
import { saveUserTemplate, listUserTemplates, deleteUserTemplate } from './storage.js';

let root, tab = 'data';
export function initSidebar() {
  root = document.querySelector('#side-body');
  document.querySelectorAll('#side-tabs button').forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
  on((w) => {
    if (w === 'mode' || w === 'data') build();
    else if ((w === 'doc' || w === 'sel' || w === 'layers') && (tab === 'layers' || tab === 'trash')) build();
  });
  build();
}
export function showTab(t) {
  tab = t;
  document.querySelectorAll('#side-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
  build();
}
function build() {
  if (!root) return;
  const s = root.scrollTop;
  root.innerHTML = '';
  ({ data: dataTab, templates: templatesTab, add: addTab, layers: layersTab, trash: trashTab })[tab]();
  root.scrollTop = s;
}

// ---------- Data ----------
function fileInput(multiple, onFiles) {
  // No 'accept' filter on purpose: phones and cloud pickers (Google Drive, iOS Files) don't know the .fit type
  // and grey those files out. Files are recognised by their contents after picking instead.
  const inp = el('input', { type: 'file', multiple: multiple ? true : null, style: { display: 'none' } });
  inp.onchange = () => { if (inp.files.length) onFiles([...inp.files]); inp.value = ''; };
  return inp;
}
export async function handleFiles(files) {
  if (App.mode === 'weekly') return weeklyDrop(files);
  const busy = el('div', { class: 'busy' }, 'Reading files…'); document.body.append(busy);
  try {
    const { activities, errors } = await loadFiles(files);
    errors.forEach((e) => toast(e, 'err'));
    if (!activities.length) { if (!errors.length) toast('No activities found', 'err'); return; }
    if (App.mode === 'single') {
      if (activities.length > 1) { pickActivity(activities); return; }
      setActivity(activities[0]);
    } else {
      const key = (a) => Math.round(a.start.getTime() / 1000) + ':' + Math.round(a.distance);
      const seen = new Set(App.acts.map(key));
      const fresh = activities.filter((a) => { const k = key(a); if (seen.has(k)) return false; seen.add(k); return true; });
      App.acts = [...App.acts, ...fresh].sort((a, b) => a.start - b.start);
      invalidateMulti(); layoutAll(); emit('data'); emit('doc');
      const dup = activities.length - fresh.length;
      toast(`Loaded ${fresh.length} run${fresh.length !== 1 ? 's' : ''}${dup ? ` (${dup} duplicate${dup > 1 ? 's' : ''} skipped)` : ''}`);
    }
  } finally { busy.remove(); }
}
function setActivity(a) {
  App.act = a; layoutAll(); emit('data'); emit('doc');
  toast(`Loaded “${a.name}” · ${fmtDist(a.distance, App.settings.units)} ${distUnit(App.settings.units)}`);
}
function pickActivity(list) {
  const body = el('div', { class: 'pick-list' });
  const m = modal(`${list.length} activities found — pick one`, body, [button('Use all in Multi-run tab', () => { App.acts = [...App.acts, ...list].sort((a, b) => a.start - b.start); invalidateMulti(); m.close(); emit('switch-multi'); }, 'primary')]);
  for (const a of list) body.append(button(`${fmtDate(a.start, 'medium')} · ${a.name} · ${fmtDist(a.distance, App.settings.units)} ${distUnit(App.settings.units)}`, () => { setActivity(a); m.close(); }, 'wide'));
}
function dropZone(multi) {
  const inp = fileInput(true, handleFiles);
  const dz = el('div', { class: 'drop' },
    iconCanvas('route', 34, '#c6ff3d'),
    el('b', {}, multi ? 'Drop a ZIP or several run files' : 'Drop your run file'),
    el('span', {}, '.fit  .tcx  .gpx  .zip  .gz'),
    button(multi ? 'Choose files…' : 'Choose file…', () => inp.click(), 'primary'), inp);
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('over'); handleFiles([...e.dataTransfer.files]); });
  return dz;
}
function settingsBox() {
  const s = App.settings, box = el('div');
  const upd = (k, v) => { s[k] = v; invalidateMulti(); for (const d of Object.values(App.docs)) for (const e of d.elements) { /* noop */ } layoutAll(); emit('doc'); emit('data'); try { localStorage.setItem('lari-settings', JSON.stringify(s)); } catch (e) { /* ignore */ } };
  box.append(row('Units', seg(s.units, [['metric', 'Metric (km)'], ['imperial', 'Imperial (mi)']], (v) => upd('units', v))));
  box.append(row('Max heart rate', numInput(s.maxHr || '', (v, fin) => fin && upd('maxHr', v), { min: 0, max: 240, placeholder: 'auto' }), { half: true }));
  box.append(row('24-hour clock', toggle(s.h24, (v) => upd('h24', v)), { half: true }));
  box.append(row('HR zone limits (% of max)', el('div', { class: 'list5' }, s.zonePct.map((p, i) => numInput(p, (v, fin) => { if (!fin) return; const a = [...s.zonePct]; a[i] = v; upd('zonePct', a); }, { min: 30, max: 100 })))), { stack: true });
  if (App.mode === 'multi' || App.mode === 'weekly') {
    box.append(row('Week starts on', seg(String(s.weekStart), [['1', 'Monday'], ['0', 'Sunday']], (v) => upd('weekStart', +v))));
    box.append(row('Date range from', seg(s.rangeFromRuns ? 'runs' : 'week', [['week', 'Calendar week'], ['runs', 'First–last run']], (v) => upd('rangeFromRuns', v === 'runs'))));
  }
  box.append(el('div', { class: 'help' }, 'Max HR 0 = use the highest HR in the file (min 170).'));
  return section('Settings', box, { key: 'settings', open: false });
}
function dataTab() {
  const u = App.settings.units;
  if (App.mode === 'weekly') { weeklyDataTab(); root.append(settingsBox()); return; }
  if (App.mode === 'single') {
    root.append(dropZone(false));
    const a = currentAct();
    const card = el('div', { class: 'act-card' + (usingSample() ? ' sample' : '') });
    if (usingSample()) card.append(el('div', { class: 'badge-s' }, 'Sample data — load your own file above'));
    card.append(row('Run name', textInput(a.name, (v, fin) => { a.name = v; layoutAll(); emit(fin ? 'doc' : 'doc-live'); })));
    card.append(el('div', { class: 'kv' },
      kv('Date', fmtDate(a.start, 'medium')), kv('Distance', `${fmtDist(a.distance, u)} ${distUnit(u)}`), kv('Moving time', fmtDuration(a.moving)),
      kv('Avg pace', `${fmtPace(a.avgPace, u)}${paceUnit(u)}`), kv('Avg HR', a.hasHr ? fmtInt(a.avgHr) + ' bpm' : '—'), kv('Elev gain', fmtInt(a.ascent) + ' m'),
      kv('Device laps', String(a.rawLaps.length || '—')), kv('GPS', a.hasGps ? 'Yes' : 'No'), kv('Points', String(a.n))));
    if (!usingSample()) card.append(button('Remove file (use sample)', () => { App.act = null; layoutAll(); emit('data'); emit('doc'); }, 'small ghost'));
    root.append(card);
  } else {
    root.append(dropZone(true));
    const d = App.doc;
    root.append(row('Period title', textInput(d.title, (v, fin) => { d.title = v; commit('Title', fin ? 0 : 500); }), { stack: true }));
    const acts = currentActs();
    const list = el('div', { class: 'runs' });
    if (usingSample()) list.append(el('div', { class: 'badge-s' }, 'Sample week — drop your ZIP above'));
    acts.forEach((a) => {
      const r = el('div', { class: 'run' + (a.enabled === false ? ' off' : '') },
        toggle(a.enabled !== false, (v) => { a.enabled = v; invalidateMulti(); layoutAll(); emit('doc'); emit('data'); }),
        el('div', { class: 'run-main' },
          textInput(a.name, (v, fin) => { a.name = v; invalidateMulti(); layoutAll(); emit(fin ? 'doc' : 'doc-live'); }),
          el('span', { class: 'run-meta' }, `${fmtDate(a.start, 'short')} · ${fmtDist(a.distance, u)} ${distUnit(u)} · ${fmtDuration(a.moving)} · ${fmtPace(a.avgPace, u)}${paceUnit(u)}`)),
        !usingSample() ? button('✕', () => { App.acts = App.acts.filter((x) => x !== a); invalidateMulti(); layoutAll(); emit('data'); emit('doc'); }, 'tiny ghost') : null);
      list.append(r);
    });
    root.append(section(`Runs (${acts.filter((a) => a.enabled !== false).length} of ${acts.length} included)`, list, { key: 'runs' }));
    if (!usingSample()) root.append(button('Clear all runs', () => { App.acts = []; invalidateMulti(); layoutAll(); emit('data'); emit('doc'); }, 'small ghost'));
  }
  root.append(settingsBox());
}
const kv = (k, v) => el('div', {}, el('span', {}, k), el('b', {}, v));

// ---------- Weekly data ----------
const weeklyChanged = (rebuild = true) => { invalidateWeekly(); layoutAll(); emit('doc'); if (rebuild) emit('data'); };
async function readRuns(files) {
  const busy = el('div', { class: 'busy' }, 'Reading files…'); document.body.append(busy);
  try {
    const { activities, errors } = await loadFiles(files);
    errors.forEach((e) => toast(e, 'err'));
    return activities.map(summarizeAct);
  } finally { busy.remove(); }
}
async function loadWeekSlot(i, files) {
  const runs = await readRuns(files);
  if (!runs.length) { toast('No runs found in that file', 'err'); return; }
  const W = App.weekly; ensureWeeks(W);
  const seen = new Set(), uniq = runs.filter((r) => { const k = r.start + ':' + Math.round(r.distance); if (seen.has(k)) return false; seen.add(k); return true; });
  W.weeks[i].runs = uniq; W.weeks[i].start = null;
  const t = uniq.map((r) => new Date(r.start).getTime()), span = (Math.max(...t) - Math.min(...t)) / 86400000;
  toast(`Week ${i + 1}: ${uniq.length} run${uniq.length === 1 ? '' : 's'} loaded` + (span > 7.5 ? ` — these runs span ${Math.ceil(span / 7)} weeks; use “Load all weeks from one ZIP” to split them` : ''), span > 7.5 ? 'err' : undefined);
  weeklyChanged();
}
async function weeklyDrop(files) {
  const runs = await readRuns(files);
  if (!runs.length) { toast('No runs found', 'err'); return; }
  const groups = splitIntoWeeks(runs, App.settings.weekStart), W = App.weekly; ensureWeeks(W);
  if (groups.length > 1 && !W.weeks.slice(0, W.count).some((w) => w.runs && w.runs.length)) return loadAllWeeksFrom(runs);
  let i = W.weeks.slice(0, W.count).findIndex((w) => !w.runs || !w.runs.length);
  for (const g of groups) {
    if (i < 0 || i >= W.count) { if (W.count >= 52) break; W.count++; ensureWeeks(W); i = W.count - 1; }
    W.weeks[i].runs = g.runs; W.weeks[i].start = g.start.toISOString();
    toast(`Week ${i + 1}: ${g.runs.length} run${g.runs.length === 1 ? '' : 's'} loaded`);
    i = W.weeks.slice(0, W.count).findIndex((w) => !w.runs || !w.runs.length);
  }
  weeklyChanged();
}
async function loadAllWeeks(files) { const runs = await readRuns(files); if (!runs.length) { toast('No runs found', 'err'); return; } return loadAllWeeksFrom(runs); }
async function loadAllWeeksFrom(runs) {
  const groups = splitIntoWeeks(runs, App.settings.weekStart);
  const W = App.weekly;
  W.count = Math.min(52, Math.max(1, groups.length)); ensureWeeks(W);
  groups.slice(0, 52).forEach((g, i) => { W.weeks[i].runs = g.runs; W.weeks[i].start = g.start.toISOString(); });
  for (let i = groups.length; i < W.weeks.length; i++) { W.weeks[i].runs = []; W.weeks[i].start = null; }
  toast(`Split ${runs.length} runs into ${W.count} week${W.count === 1 ? '' : 's'}` + (groups.length > 52 ? ' (first 52 kept)' : ''));
  weeklyChanged();
}
// quick phase plans for N weeks
function phasePlan(kind, n) {
  if (kind === 'all') return Array(n).fill('training');
  if (kind === 'cycle') return Array.from({ length: n }, (_, i) => ((i + 1) % 4 === 0 ? 'down' : 'build'));
  // race block: ~25% base, build with every 4th week down, 2 taper (1 if short), race week last
  const out = [], taper = n >= 8 ? 2 : n >= 4 ? 1 : 0, race = n >= 2 ? 1 : 0, basen = Math.floor((n - taper - race) * 0.25);
  for (let i = 0; i < basen; i++) out.push('base');
  for (let i = basen, k = 1; i < n - taper - race; i++, k++) out.push(k % 4 === 0 ? 'down' : k > (n - taper - race - basen) * 0.6 ? 'training' : 'build');
  for (let i = 0; i < taper; i++) out.push('taper');
  if (race) out.push('race');
  return out.slice(0, n);
}
function weeklyDataTab() {
  const W = App.weekly, u = App.settings.units, d = App.doc;
  ensureWeeks(W);
  const S = currentWeekly();
  const allInp = fileInput(true, loadAllWeeks);
  const top = el('div', { class: 'act-card' });
  top.append(row('Block title', textInput(d.title, (v, fin) => { d.title = v; commit('Title', fin ? 0 : 500); }), { stack: true }));
  top.append(row('Number of weeks', numInput(W.count, (v, fin) => { if (!fin) return; W.count = Math.max(1, Math.min(52, Math.round(v) || 1)); ensureWeeks(W); weeklyChanged(); }, { min: 1, max: 52 }), { half: true }),
    row('', el('div', { class: 'btnrow' }, ...[4, 8, 12, 16].map((k) => button(String(k), () => { W.count = k; ensureWeeks(W); weeklyChanged(); }, 'tiny' + (W.count === k ? ' on' : '')))), { half: true }));
  top.append(el('div', { class: 'btnrow' }, button('Load all weeks from one ZIP…', () => allInp.click(), 'small'), allInp));
  top.append(el('div', { class: 'help' }, 'Load one ZIP per week below, or one ZIP with everything and it will be split into calendar weeks.'));
  root.append(top);
  if (usingSample()) root.append(el('div', { class: 'badge-s' }, 'Sample 12-week block shown — load your weekly ZIPs below'));
  // phase plan presets
  root.append(row('Quick phase plan', el('div', { class: 'btnrow' },
    button('Race block', () => { phasePlan('race', W.count).forEach((ph, i) => (W.weeks[i].phase = ph)); weeklyChanged(); }, 'tiny'),
    button('3 build + 1 down', () => { phasePlan('cycle', W.count).forEach((ph, i) => (W.weeks[i].phase = ph)); weeklyChanged(); }, 'tiny'),
    button('All training', () => { phasePlan('all', W.count).forEach((ph, i) => (W.weeks[i].phase = ph)); weeklyChanged(); }, 'tiny')), { stack: true }));
  const phaseOpts = PHASES.map(([k, name]) => [k, (W.phaseNames && W.phaseNames[k]) || name]);
  const list = el('div', { class: 'weeks' });
  W.weeks.slice(0, W.count).forEach((w, i) => {
    const info = S.weeks[i];
    const inp = fileInput(true, (files) => loadWeekSlot(i, files));
    const meta = w.runs && w.runs.length
      ? `${w.runs.length} run${w.runs.length === 1 ? '' : 's'} · ${fmtDist(info ? info.distance : 0, u, 1)} ${distUnit(u)}${info && info.start ? ' · ' + fmtDate(info.start, 'short') + ' – ' + fmtDate(info.end, 'short') : ''}`
      : 'No runs loaded';
    const slot = el('div', { class: 'week-slot' + (w.runs && w.runs.length ? '' : ' empty') },
      el('div', { class: 'ws-head' },
        el('span', { class: 'ws-n', style: { background: info ? info.color : '#888' } }, String(i + 1)),
        (() => { const t = textInput(w.name, (v, fin) => { w.name = v; weeklyChanged(false); if (fin) emit('data'); }, { placeholder: `Week ${i + 1}` }); t.className = 'ws-name'; return t; })(),
        select(w.phase, phaseOpts, (v) => { w.phase = v; weeklyChanged(); })),
      w.phase === 'custom' ? el('div', { class: 'ws-custom' }, textInput(w.custom, (v, fin) => { w.custom = v; weeklyChanged(false); if (fin) emit('data'); }, { placeholder: 'Custom label, e.g. Recovery, Hills, Holiday' }), colorInput(w.customColor || '#94a3b8', (v) => { w.customColor = v; weeklyChanged(false); })) : null,
      el('div', { class: 'ws-foot' },
        el('span', { class: 'run-meta' }, meta),
        button(w.runs && w.runs.length ? 'Replace' : 'Load ZIP', () => inp.click(), 'tiny' + (w.runs && w.runs.length ? '' : ' primary')), inp,
        button('↑', () => { if (!i) return; [W.weeks[i - 1], W.weeks[i]] = [W.weeks[i], W.weeks[i - 1]]; weeklyChanged(); }, 'tiny ghost'),
        button('↓', () => { if (i >= W.count - 1) return; [W.weeks[i + 1], W.weeks[i]] = [W.weeks[i], W.weeks[i + 1]]; weeklyChanged(); }, 'tiny ghost'),
        w.runs && w.runs.length ? button('✕', () => { w.runs = []; w.start = null; weeklyChanged(); }, 'tiny ghost') : null));
    slot.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); slot.classList.add('over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); slot.classList.remove('over'); loadWeekSlot(i, [...e.dataTransfer.files]); });
    list.append(slot);
  });
  root.append(section(`Weeks (${W.count})`, list, { key: 'weeks' }));
  root.append(el('div', { class: 'btnrow' },
    button('Sort weeks by date', () => { const head = W.weeks.slice(0, W.count), tail = W.weeks.slice(W.count); const key = (w) => (w.runs && w.runs.length ? Math.min(...w.runs.map((r) => new Date(r.start).getTime())) : Infinity); head.sort((a, b) => key(a) - key(b)); W.weeks = [...head, ...tail]; weeklyChanged(); }, 'small ghost'),
    button('Clear all weeks', () => { if (!confirm('Remove the runs from every week? Labels are kept.')) return; W.weeks.forEach((w) => { w.runs = []; w.start = null; }); weeklyChanged(); }, 'small ghost')));
  // phase names & colours
  const pbox = el('div');
  for (const [k, name, color] of PHASES) {
    if (k === 'custom') continue;
    pbox.append(el('div', { class: 'ws-phase' },
      colorInput((W.phaseColors && W.phaseColors[k]) || color, (v) => { W.phaseColors = { ...(W.phaseColors || {}), [k]: v }; weeklyChanged(false); }),
      textInput((W.phaseNames && W.phaseNames[k]) || '', (v, fin) => { W.phaseNames = { ...(W.phaseNames || {}) }; if (v) W.phaseNames[k] = v; else delete W.phaseNames[k]; weeklyChanged(false); if (fin) emit('data'); }, { placeholder: name })));
  }
  pbox.append(el('div', { class: 'help' }, 'Rename a phase (e.g. “Peak”) or change its colour everywhere. Custom weeks use their own label and colour.'));
  root.append(section('Phase names & colours', pbox, { key: 'phases', open: false }));
}

// ---------- Templates ----------
function tplPreview(tpl, w = 150) {
  const d = newDoc(App.mode); d.w = App.doc.w; d.h = App.doc.h;
  deepMerge(d, clone(templateDocPatch(tpl)));
  if (!tpl.bg) d.bg = { ...d.bg, type: 'gradient', color: '#3b4252', color2: '#1b1f27', angle: 160 };
  const env = makeEnv(d);
  const c = document.createElement('canvas');
  const k = w / d.w, h = Math.round(d.h * k);
  c.width = w * 2; c.height = h * 2; c.style.width = w + 'px'; c.style.height = h + 'px';
  const ctx = c.getContext('2d');
  d.elements = buildTemplate(tpl, d, env, ctx);
  ctx.scale(k * 2, k * 2);
  renderScene(ctx, d, env, {});
  return c;
}
export function applyTemplate(tpl, mode = 'replace') {
  const d = App.doc;
  if (mode === 'replace') { d.trash = [...d.elements.map((e) => ({ el: e, at: Date.now() })), ...d.trash].slice(0, 80); d.elements = []; }
  const patch = clone(templateDocPatch(tpl));
  if (mode === 'replace') { const t0 = THEMES[0]; d.theme = { text: t0.text, muted: t0.muted, accent: t0.accent, accent2: t0.accent2, ...(patch.theme || {}) }; }
  else if (patch.theme) Object.assign(d.theme, patch.theme);
  if (patch.bg) d.bg = { ...d.bg, ...patch.bg };
  else if (mode === 'replace' && d.bg.type !== 'image') d.bg.type = 'transparent';
  const env = makeEnv(d);
  const els = buildTemplate(tpl, d, env, App.measureCtx);
  d.elements.push(...els);
  setSel([], true);
  commit('Template: ' + tpl.name);
  emit('sel');
  ensureFontsLoaded();
}
function templatesTab() {
  root.append(el('div', { class: 'help' }, 'Start from a template, then customise every element. Applying replaces the current design (old elements go to Trash, and Undo works).'));
  const g = el('div', { class: 'tpl-grid' });
  for (const t of TEMPLATES[App.mode]) {
    const b = el('button', { type: 'button', class: 'tpl' }, el('div', { class: 'tpl-img' }), el('b', {}, t.name), el('span', {}, t.desc));
    b.onclick = () => applyTemplate(t);
    g.append(b);
    requestAnimationFrame(() => { try { b.firstChild.append(tplPreview(t)); } catch (e) { console.warn(e); } });
  }
  root.append(g);
  // user templates
  const mine = el('div', { class: 'tpl-grid mine' });
  const sec = section('My saved designs', el('div', {}, button('Save current design as template', async () => {
    const name = prompt('Template name', App.doc.title || 'My design'); if (!name) return;
    await saveUserTemplate({ id: uid(), name, mode: App.mode, doc: clone({ ...App.doc, trash: [] }), assets: Object.fromEntries(Object.entries(App.assetSrc)) });
    toast('Template saved'); build();
  }, 'small primary'), mine), { key: 'mytpl' });
  root.append(sec);
  listUserTemplates(App.mode).then((list) => {
    if (!list.length) mine.append(el('div', { class: 'help' }, 'Nothing saved yet.'));
    for (const t of list) {
      mine.append(el('div', { class: 'mytpl' }, el('b', {}, t.name),
        button('Use', () => { for (const [id, src] of Object.entries(t.assets || {})) if (!App.assets[id]) addAsset(src, id); const d = clone(t.doc); d.trash = App.doc.elements.map((e) => ({ el: e, at: Date.now() })); App.docs[App.mode] = d; setSel([], true); commit('Template: ' + t.name); fitZoom(); ensureFontsLoaded(); }, 'tiny'),
        button('Delete', async () => { await deleteUserTemplate(t.id); build(); }, 'tiny ghost')));
    }
  });
}

// ---------- Add ----------
function addTab() {
  const cats = [...LIBRARY[App.mode], LIBRARY.media];
  for (const c of cats) {
    const g = el('div', { class: 'lib' });
    for (const it of c.items) {
      const b = el('button', { type: 'button', class: 'lib-item' }, iconCanvas(it.icon || 'star', 26), el('span', {}, it.label));
      b.onclick = () => addFromLibrary(it);
      g.append(b);
    }
    root.append(section(c.cat, g, { key: 'lib' + c.cat }));
  }
}
export async function addFromLibrary(it) {
  if (it.type === 'image') {
    const inp = el('input', { type: 'file', accept: 'image/*' });
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      const url = await readFileAs(f, 'dataURL'); const id = addAsset(url);
      const img = App.assets[id];
      await new Promise((r) => { if (img.complete) r(); else img.onload = r; });
      const max = App.doc.w * 0.6, k = Math.min(max / img.naturalWidth, max / img.naturalHeight, 1);
      addElement('image', { props: { asset: id, mask: 'rect', radius: 0 }, w: img.naturalWidth * k, h: img.naturalHeight * k, name: f.name.replace(/\.[^.]+$/, '') });
      emit('added');
    };
    inp.click();
    return;
  }
  const over = clone(it.over || {});
  if (!over.name) over.name = it.label;
  addElement(it.type, over);
  ensureFontsLoaded();
  emit('added');
}

// ---------- Layers ----------
function layersTab() {
  const d = App.doc;
  if (!d.elements.length) { root.append(el('div', { class: 'help' }, 'No elements yet. Add some from the Add tab or pick a template.')); return; }
  root.append(el('div', { class: 'help' }, 'Top of the list is in front. Drag to reorder. Shift/Ctrl-click to select several.'));
  const list = el('div', { class: 'layers' });
  const els = [...d.elements].reverse();
  let dragId = null;
  for (const e of els) {
    const r = el('div', { class: 'layer' + (App.sel.includes(e.id) ? ' on' : '') + (e.hidden ? ' hid' : ''), draggable: 'true' });
    if (e.group) r.style.setProperty('--g', groupColor(e.group));
    const name = el('span', { class: 'lname' }, e.name || REG[e.type]?.name);
    name.ondblclick = () => { const i = textInput(e.name, (v, fin) => { e.name = v; if (fin) commit('Rename'); }); name.replaceWith(i); i.focus(); i.select(); i.onblur = () => commit('Rename'); };
    r.append(
      el('i', { class: 'grip' }, '⋮⋮'),
      name,
      button(e.hidden ? '◌' : '●', (ev) => { ev.stopPropagation(); e.hidden = !e.hidden; commit(e.hidden ? 'Hide' : 'Show'); }, 'tiny ghost eye'),
      button(e.locked ? '🔒' : '🔓', (ev) => { ev.stopPropagation(); e.locked = !e.locked; commit(e.locked ? 'Lock' : 'Unlock'); }, 'tiny ghost'),
    );
    r.onclick = (ev) => {
      if (ev.shiftKey || ev.ctrlKey || ev.metaKey) setSel(App.sel.includes(e.id) ? App.sel.filter((x) => x !== e.id) : [...App.sel, e.id]);
      else setSel([e.id]);
      emit('layers');
    };
    r.addEventListener('dragstart', (ev) => { dragId = e.id; ev.dataTransfer.effectAllowed = 'move'; r.classList.add('drag'); });
    r.addEventListener('dragend', () => r.classList.remove('drag'));
    r.addEventListener('dragover', (ev) => { ev.preventDefault(); r.classList.add('over'); });
    r.addEventListener('dragleave', () => r.classList.remove('over'));
    r.addEventListener('drop', (ev) => { ev.preventDefault(); r.classList.remove('over'); if (!dragId || dragId === e.id) return; const to = d.elements.findIndex((x) => x.id === e.id); moveLayer(dragId, to); });
    list.append(r);
  }
  root.append(list);
}
function groupColor(g) { let h = 0; for (const c of g) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 80% 60%)`; }

// ---------- Trash ----------
function trashTab() {
  const d = App.doc;
  if (!d.trash.length) { root.append(el('div', { class: 'help' }, 'Deleted elements appear here so you can restore them.')); return; }
  const list = el('div', { class: 'layers' });
  d.trash.forEach((t, i) => list.append(el('div', { class: 'layer' }, el('span', { class: 'lname' }, t.el.name || t.el.type), button('Restore', () => restoreTrash(i), 'tiny'))));
  root.append(list, button('Restore all', () => { d.elements.push(...d.trash.map((t) => t.el)); d.trash = []; commit('Restore all'); }, 'small'), button('Empty trash', () => { d.trash = []; commit('Empty trash'); }, 'small ghost danger'));
}
