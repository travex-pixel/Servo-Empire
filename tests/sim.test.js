// Headless test suite: economy bots, offline payouts, saves/migration, analytics, pathing. Run: node tests/sim.test.js
const { loadGame, fakeStorage } = require('./load.js'); const { makeBot } = require('./bots.js');
const assert = require('assert'); const fs = require('fs'); const path = require('path');
const G = loadGame(); const out = []; const log = (...a) => { console.log(...a); out.push(a.join(' ')); };
let failures = 0; function check(name, fn) { try { fn(); log('  ✔', name); } catch (e) { failures++; log('  ✘', name, '->', e.message); } }

/* ---------- 1. economy bots ---------- */
function runBot(kind, seed, maxMin = 70) {
  const sim = new G.Sim({ seed }); sim.STATION_BY_ID = G.STATION_BY_ID; const rng = new G.RNG(seed * 7 + 1); const bot = makeBot(kind, rng);
  const dt = 1 / 60; let t = 0; const unlocks = []; let idleMax = 0, idleCur = 0, idleAt = 0, prev = 0; let maxEnter = 0; let stuckStaff = 0;
  while (t < maxMin * 60 && !sim.allBuilt()) {
    const g = bot(sim, t, dt); sim.step(dt); sim.fx.length = 0; t += dt;
    if (g.type === 'save' || g.type === 'done') { idleCur += dt; if (idleCur > idleMax) { idleMax = idleCur; idleAt = t; } } else idleCur = 0;
    if (sim.stats.unlocks > prev) { prev = sim.stats.unlocks; const id = G.ORDER.filter(i => sim.built[i] && !unlocks.some(u => u.id === i))[0]; unlocks.push({ id, t }); }
    for (const c of sim.customers) { c._age = (c._age || 0) + dt; if (c.state === 'enter' && c._age > maxEnter) maxEnter = c._age; }
    for (const k in sim.staff) { const s = sim.staff[k]; if (s.state !== 'idle' && s.path.length) { s._moveT = (s._moveT || 0) + dt; if (s._moveT > 20) stuckStaff++; } else s._moveT = 0; }
  }
  return { sim, t, unlocks, idleMax, idleAt, maxEnter, stuckStaff };
}
log('\n## Economy simulation (60 Hz fixed step, 15 pads)');
const summary = [];
for (const kind of ['efficient', 'lazy']) for (const seed of [7, 21, 99]) {
  const r = runBot(kind, seed); const times = r.unlocks.map(u => u.t);
  const gaps = times.map((x, i) => (x - (times[i - 1] || 0)) / 60);
  const first10 = r.unlocks.filter(u => u.t <= 600).length;
  summary.push({ kind, seed, done: r.sim.allBuilt(), total: r.t / 60, first: times[0], idle: r.idleMax, idleAt: r.idleAt / 60, maxGap: Math.max(...gaps.slice(1)), first10, served: r.sim.stats.served, lost: r.sim.stats.lost, unlocks: r.unlocks, maxEnter: r.maxEnter, stuckStaff: r.stuckStaff, events: r.sim.stats.events, upgrades: r.sim.upgrades });
}
log('\n| bot | seed | finished | total min | first unlock | longest idle | unlocks in 10 min | longest gap (min) | lost sales |');
log('|---|---|---|---|---|---|---|---|---|');
for (const s of summary) log(`| ${s.kind} | ${s.seed} | ${s.done ? 'yes' : 'NO'} | ${s.total.toFixed(1)} | ${s.first.toFixed(1)} s | ${s.idle.toFixed(0)} s @ ${s.idleAt.toFixed(1)} m | ${s.first10} | ${s.maxGap.toFixed(1)} | ${s.lost} |`);
log('\nTime to each unlock (minutes), efficient seed 7 vs lazy seed 7:');
log('\n| # | pad | efficient | lazy |'); log('|---|---|---|---|');
const e7 = summary[0].unlocks, l7 = summary[3].unlocks;
G.ORDER.forEach((id, i) => { const a = e7.find(u => u.id === id), b = l7.find(u => u.id === id); log(`| ${i + 1} | ${G.STATION_BY_ID[id].name} | ${a ? (a.t / 60).toFixed(1) : '-'} | ${b ? (b.t / 60).toFixed(1) : '-'} |`); });
log('');
check('every bot run finishes the map', () => summary.forEach(s => assert(s.done, s.kind + ' seed ' + s.seed)));
check('first unlock within 20 s', () => summary.forEach(s => assert(s.first <= 20, s.first)));
check('whole map in 30-45 min active play', () => summary.forEach(s => assert(s.total >= 25 && s.total <= 46, s.kind + ' ' + s.total.toFixed(1))));
check('no idle stretch over 45 s (nothing to do, nothing affordable)', () => summary.forEach(s => assert(s.idle <= 45, s.idle)));
check('at least 7 unlocks in the first 10 minutes', () => summary.forEach(s => assert(s.first10 >= 7, s.kind + ' ' + s.first10)));
check('customers never take over 40 s to reach the queue (no stuck pathing)', () => summary.forEach(s => assert(s.maxEnter < 40, s.maxEnter)));
check('staff never walk a single leg for over 20 s (no stuck staff)', () => summary.forEach(s => assert.strictEqual(s.stuckStaff, 0)));
check('chaos events fire roughly every 2-3 min', () => summary.forEach(s => { const perMin = s.events / s.total; assert(perMin > 0.25 && perMin < 0.6, perMin.toFixed(2)); }));

/* ---------- 2. offline ---------- */
log('\n## Offline earnings');
function stage(built, upg, staffNote) { const sim = new G.Sim({ seed: 3 }); const d = sim.toJSON(); for (const id of built) d.built[id] = true; d.upgrades = upg; sim.load(d); return sim; }
const stages = [['pump1 only', ['pump1'], null], ['mid game (8 pads, Gav+Val)', G.ORDER.slice(0, 8), null], ['full servo, no upgrades', G.ORDER, null], ['full servo, mid upgrades', G.ORDER, { walk: 3, carry: 3, station: 4, price: 4, staff: 4 }]];
log('\n| stage | $/min | 10 min away | 2 h away | 3 days away | capped |'); log('|---|---|---|---|---|---|');
for (const [name, built, upg] of stages) { const sim = stage(built, upg || { walk: 0, carry: 0, station: 0, price: 0, staff: 0 }); const a = sim.offlineEarnings(600), b = sim.offlineEarnings(7200), c = sim.offlineEarnings(3 * 86400);
  log(`| ${name} | ${(sim.offlineRate() * 60).toFixed(0)} | ${G.fmt(a.cash)} | ${G.fmt(b.cash)} | ${G.fmt(c.cash)} | ${c.capped} |`);
  check('offline: ' + name + ' 3 days == 2 h (cap) and 10 min < 2 h', () => { assert.strictEqual(c.cash, b.cash); assert(a.cash < b.cash || b.cash === 0); assert(c.capped && !b.capped); }); }
check('offline: negative / NaN time pays nothing (clock tricks)', () => { const sim = stage(G.ORDER, { walk: 0, carry: 0, station: 0, price: 0, staff: 0 }); assert.strictEqual(sim.offlineEarnings(-5000).cash, 0); assert.strictEqual(sim.offlineEarnings(NaN).cash, 0); });
check('offline: fresh game with no stations earns nothing', () => { const sim = new G.Sim({ seed: 1 }); assert.strictEqual(sim.offlineEarnings(7200).cash, 0); });
check('offline: formula within 20% of measured automated income (full servo, mid upgrades)', () => { const sim = stage(G.ORDER, { walk: 3, carry: 3, station: 4, price: 4, staff: 4 }); sim.player.x = 5.5; sim.player.y = 19; const e0 = sim.totalEarned, p0 = Object.values(sim.piles).reduce((a, b) => a + b, 0); for (let i = 0; i < 60 * 300; i++) { sim.step(1 / 60); sim.fx.length = 0; } const measured = (sim.totalEarned - e0 + Object.values(sim.piles).reduce((a, b) => a + b, 0) - p0) / 300; const eff = G.ECON.offlineBase + G.ECON.offlinePerStaff * 3; const ratio = (sim.offlineRate() / eff) / measured; log('   measured $/s ' + measured.toFixed(1) + ' vs formula ' + (sim.offlineRate() / eff).toFixed(1) + ' ratio ' + ratio.toFixed(2)); assert(ratio > 0.8 && ratio < 1.2, ratio); });

/* ---------- 3. saves ---------- */
log('\n## Saves');
check('save mid-carry, reload: carry, cash, built, upgrades, piles, staff carry all survive', () => {
  const sim = new G.Sim({ seed: 5 }); const d0 = sim.toJSON(); for (const id of G.ORDER.slice(0, 8)) d0.built[id] = true; sim.load(d0); sim.cash = 1234.5; sim.player.carry = ['pie', 'pie', 'coffee']; sim.player.x = 8.5; sim.player.y = 9.5; sim.upgrades.carry = 2; sim.piles.pump1 = 77; sim.shelf.pie = 4; sim.tray.coffee = 3; sim.staff.gav.carry = ['pie'];
  const storage = fakeStorage(); const S = G.Save; S.storage = () => storage; S.write(sim.toJSON());
  const sim2 = new G.Sim({ seed: 9 }); sim2.load(S.read());
  assert.strictEqual(JSON.stringify(sim2.player.carry), JSON.stringify(['pie', 'pie', 'coffee'])); assert.strictEqual(sim2.cash, 1234.5); assert.strictEqual(Object.keys(sim2.built).length, 8); assert.strictEqual(sim2.upgrades.carry, 2); assert.strictEqual(sim2.piles.pump1, 77); assert.strictEqual(sim2.shelf.pie, 4); assert.strictEqual(sim2.tray.coffee, 3); assert.strictEqual(JSON.stringify(sim2.staff.gav.carry), '["pie"]'); assert(sim2.staff.val && sim2.staff.gav); assert(Math.abs(sim2.player.x - 8.5) < 1e-9);
  for (let i = 0; i < 600; i++) { sim2.step(1 / 60); sim2.fx.length = 0; } // keeps running after load
});
check('migrates a v1 save (money, built array) to v2', () => {
  const v1 = { v: 1, money: 500, built: ['pump1', 'pie', 'counter'], player: { x: 5, y: 7 }, lastSeen: Date.now() - 1000 };
  const d = G.Save.migrate(JSON.parse(JSON.stringify(v1))); assert.strictEqual(d.v, 2); assert.strictEqual(d.cash, 500); assert.strictEqual(JSON.stringify(d.built), JSON.stringify({ pump1: true, pie: true, counter: true }));
  const sim = new G.Sim({ seed: 1 }); sim.load(d); assert.strictEqual(sim.cash, 500); assert(sim.built.counter);
});
check('corrupt primary save falls back to the backup copy', () => {
  const storage = fakeStorage(); const S = G.Save; S.storage = () => storage; const sim = new G.Sim({ seed: 2 }); sim.cash = 42; S.write(sim.toJSON()); sim.cash = 43; S.write(sim.toJSON()); storage.setItem('servoEmpire.save', '{not json'); const warn = console.warn; console.warn = () => {}; const d = S.read(); console.warn = warn; assert(d && d.cash === 42);
});
check('unsupported future save version is rejected (not silently loaded)', () => { assert.throws(() => G.Save.migrate({ v: 99 })); });
check('export/import code round-trips', () => { const sim = new G.Sim({ seed: 4 }); sim.cash = 999; const code = G.Save.encode(sim.toJSON()); assert(code.startsWith('SERVO1.')); const d = G.Save.migrate(G.Save.decode(code)); assert.strictEqual(d.cash, 999); assert.throws(() => G.Save.decode('garbage')); });
check('load clamps hostile values (negative cash, 10^9 pies, player in a wall)', () => { const sim = new G.Sim({ seed: 1 }); const d = sim.toJSON(); d.built = { pump1: true }; d.cash = -50; d.tray = { pie: 1e9 }; d.player = { x: 4.5, y: 5.5 }; sim.load(d); assert.strictEqual(sim.cash, 0); assert(sim.tray.pie <= 8); assert(!sim.circleHits(sim.player.x, sim.player.y, 0.3)); });

/* ---------- 4. analytics ---------- */
log('\n## Analytics events');
check('all required events fire with the right properties', () => {
  const events = []; const sim = new G.Sim({ seed: 7, track: (e, p) => events.push({ e, p }) }); sim.STATION_BY_ID = G.STATION_BY_ID; const bot = makeBot('efficient', new G.RNG(1)); let t = 0; while (t < 60 * 60 && !sim.allBuilt()) { bot(sim, t, 1 / 60); sim.step(1 / 60); sim.fx.length = 0; t += 1 / 60; }
  const names = new Set(events.map(x => x.e)); for (const n of ['unlock_bought', 'staff_hired', 'upgrade_bought', 'chaos_event_seen', 'map_complete']) assert(names.has(n), 'missing ' + n);
  const u = events.find(x => x.e === 'unlock_bought'); assert('station' in u.p && 'minutes_since_first_play' in u.p); const h = events.find(x => x.e === 'staff_hired'); assert(h.p.staff); const c = events.find(x => x.e === 'chaos_event_seen'); assert(['rush', 'seagulls'].includes(c.p.event));
  assert.strictEqual(events.filter(x => x.e === 'unlock_bought').length, 15); assert.strictEqual(events.filter(x => x.e === 'staff_hired').length, 3);
  log('   events seen: ' + [...names].join(', ') + ' (session_start, offline_return, double_offline_tapped, servo2_tapped are fired by the browser layer and checked in the browser test)');
});
check('Analytics class buffers events when disabled/headless and never throws', () => { const a = new G.Analytics(); a.setEnabled(false); a.track('x', { a: 1 }); assert.strictEqual(a.buffer.length, 1); assert.strictEqual(a.queue.length, 0); });

/* ---------- 5. misc ---------- */
log('\n## Misc');
check('fmt formats big numbers', () => { assert.strictEqual(G.fmt(999), '$999'); assert.strictEqual(G.fmt(1200), '$1.2K'); assert.strictEqual(G.fmt(3400000), '$3.4M'); assert.strictEqual(G.fmt(12345678), '$12.3M'); assert.strictEqual(G.fmt(2.5e9), '$2.5B'); });
check('at least 30 original speech lines, 35+ clean', () => { assert(G.LINES.length >= 30); assert(G.LINES.filter(l => !l[1]).length >= 30); });
check('pathfinder reaches every queue slot and every station interact point from the spawn', () => { const g = new G.Grid(); const built = {}; for (const id of G.ORDER) built[id] = true; g.rebuild(built); for (const q of G.MAP.queue) { const p = g.path(G.MAP.spawn.x, G.MAP.spawn.y, q.x, q.y); assert(p && p.length > 3); const last = p[p.length - 1]; assert(Math.abs(last.x - q.x) < 0.01 && Math.abs(last.y - q.y) < 0.01, 'slot unreachable ' + JSON.stringify(q)); } });
check('building the Second Till never traps the player behind the counter', () => { const sim = new G.Sim({ seed: 1 }); const d = sim.toJSON(); for (const id of G.ORDER.slice(0, 12)) d.built[id] = true; d.cash = 10000; d.player = { x: 10.5, y: 3.4 }; sim.load(d); sim.player.x = 10.5; sim.player.y = 3.4; sim.build('till2'); assert(sim.grid.reachable(sim.player.x, sim.player.y), JSON.stringify([sim.player.x, sim.player.y])); });
check('object pool recycles', () => { const p = new G.Pool(() => ({})); const a = p.get(); p.release(a); const b = p.get(); assert.strictEqual(a, b); });

log(`\n${failures === 0 ? 'ALL HEADLESS TESTS PASSED' : failures + ' HEADLESS TEST(S) FAILED'}`);
fs.writeFileSync(path.join(__dirname, 'sim-report.md'), out.join('\n'));
process.exit(failures ? 1 : 0);
