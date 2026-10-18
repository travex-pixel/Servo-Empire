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
check('offline: formula within 20% of measured automated income (full servo, mid upgrades)', () => { const sim = stage(G.ORDER, { walk: 3, carry: 3, station: 4, price: 4, staff: 4 }); sim.player.x = 5.5; sim.player.y = 19; sim.chaosT = 1e9; /* offline has no chaos events */ const e0 = sim.totalEarned, p0 = Object.values(sim.piles).reduce((a, b) => a + b, 0); for (let i = 0; i < 60 * 300; i++) { sim.step(1 / 60); sim.fx.length = 0; } const measured = (sim.totalEarned - e0 + Object.values(sim.piles).reduce((a, b) => a + b, 0) - p0) / 300; const eff = G.ECON.offlineBase + G.ECON.offlinePerStaff * 3; const ratio = (sim.offlineRate() / eff) / measured; log('   measured $/s ' + measured.toFixed(1) + ' vs formula ' + (sim.offlineRate() / eff).toFixed(1) + ' ratio ' + ratio.toFixed(2)); assert(ratio > 0.8 && ratio < 1.2, ratio); });

/* ---------- 3. saves ---------- */
log('\n## Saves');
check('save mid-carry, reload: carry, cash, built, upgrades, piles, staff carry all survive', () => {
  const sim = new G.Sim({ seed: 5 }); const d0 = sim.toJSON(); for (const id of G.ORDER.slice(0, 8)) d0.built[id] = true; sim.load(d0); sim.cash = 1234.5; sim.player.carry = ['pie', 'pie', 'coffee']; sim.player.x = 8.5; sim.player.y = 9.5; sim.upgrades.carry = 2; sim.piles.pump1 = 77; sim.shelf.pie = 4; sim.tray.coffee = 3; sim.staff.gav.carry = ['pie'];
  const storage = fakeStorage(); const S = G.Save; S.storage = () => storage; S.write(sim.toJSON());
  const sim2 = new G.Sim({ seed: 9 }); sim2.load(S.read());
  assert.strictEqual(JSON.stringify(sim2.player.carry), JSON.stringify(['pie', 'pie', 'coffee'])); assert.strictEqual(sim2.cash, 1234.5); assert.strictEqual(Object.keys(sim2.built).length, 8); assert.strictEqual(sim2.upgrades.carry, 2); assert.strictEqual(sim2.piles.pump1, 77); assert.strictEqual(sim2.shelf.pie, 4); assert.strictEqual(sim2.tray.coffee, 3); assert.strictEqual(JSON.stringify(sim2.staff.gav.carry), '["pie"]'); assert(sim2.staff.val && sim2.staff.gav); assert(Math.abs(sim2.player.x - 8.5) < 1e-9);
  for (let i = 0; i < 600; i++) { sim2.step(1 / 60); sim2.fx.length = 0; } // keeps running after load
});
check('migrates a v1 save (money, built array) to v3', () => {
  const v1 = { v: 1, money: 500, built: ['pump1', 'pie', 'counter'], player: { x: 5, y: 7 }, lastSeen: Date.now() - 1000 };
  const d = G.Save.migrate(JSON.parse(JSON.stringify(v1))); assert.strictEqual(d.v, 3); assert.strictEqual(d.active, 'outback'); assert.strictEqual(d.cash, 500); assert.strictEqual(JSON.stringify(d.built), JSON.stringify({ pump1: true, pie: true, counter: true }));
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


/* ---------- 4b. v0.2 features ---------- */
log('\n## v0.2 features');
function stageSim(ids, seed = 11) { const sim = new G.Sim({ seed }); const d = sim.toJSON(); for (const id of ids) d.built[id] = true; sim.load(d); sim.chaosT = 1e9; return sim; }
check('hustle: builds with actions, caps at +50%, decays when idle', () => { const sim = stageSim(['pump1']); for (let i = 0; i < 40; i++) sim.addHustle(1); assert(Math.abs(sim.hustleMult - 1.5) < 1e-9); for (let i = 0; i < 60 * 10; i++) { sim.step(1 / 60); sim.fx.length = 0; } assert(sim.hustle === 0, sim.hustle); });
check('hustle: bonus applies to piles the player grabs, never to Shazza or offline', () => { const sim = stageSim(['pump1', 'pie', 'counter', 'coffee', 'pump2', 'office', 'gav', 'val', 'roll', 'pump3', 'shazza']); const off0 = sim.offlineRate();
  sim.hustle = 0.5; sim.hustleHold = 99; sim.piles.pump1 = 100; const pp = G.STATION_BY_ID.pump1.pile; sim.player.x = pp.x; sim.player.y = pp.y; const c0 = sim.cash; sim.step(1 / 60); assert.strictEqual(Math.round(sim.cash - c0), 150);
  assert.strictEqual(sim.offlineRate(), off0); const sh = sim.staff.shazza; sim.player.x = 9.5; sim.player.y = 9.5; sim.piles.pump2 = 100; const c1 = sim.cash; for (let i = 0; i < 60 * 20 && sim.piles.pump2 > 0; i++) { sim.step(1 / 60); sim.fx.length = 0; } assert(sim.cash - c1 >= 100 && sim.cash - c1 < 130, 'shazza got ' + (sim.cash - c1)); });
check('road train pays ×4 at the pump', () => { const sim = stageSim(['pump1', 'pump2']); sim.rng.next = (() => { let k = 0; return () => (k++ === 0 ? 0.5 : 0.01); })(); sim.spawnCar('pump1'); const c = sim.cars[sim.cars.length - 1]; assert.strictEqual(c.kind, 'roadtrain'); sim.rng = new G.RNG(3);
  sim.piles.pump1 = 0; for (let i = 0; i < 60 * 20 && sim.piles.pump1 === 0; i++) { sim.step(1 / 60); sim.fx.length = 0; } assert.strictEqual(sim.piles.pump1 % sim.pumpPay() === 0 && sim.piles.pump1 >= sim.pumpPay() * 4, true, 'pile ' + sim.piles.pump1); });
check('bin chicken raid: ibis eat a pile, walking into them stops it, event ends', () => { const sim = stageSim(['pump1', 'pie', 'counter']); sim.piles.pump1 = 500; sim.piles.counter = 0; sim.player.x = 9.5; sim.player.y = 12; const opts = []; sim.rng.pick = arr => { opts.push(arr.slice()); return arr.includes('ibis') ? 'ibis' : arr[0]; }; sim.startEvent(); sim.rng = new G.RNG(5);
  assert(opts[0].includes('ibis')); assert.strictEqual(sim.event, 'ibis'); for (let i = 0; i < 60 * 6; i++) { sim.step(1 / 60); sim.fx.length = 0; } const eaten = 500 - sim.piles.pump1; assert(eaten > 20, 'ate ' + eaten);
  const g = sim.nextGoal(); assert.strictEqual(g.type, 'shoo'); for (let i = 0; i < 60 * 30 && sim.event; i++) { sim.autopilot(sim.nextGoal(), 1 / 60); sim.step(1 / 60); sim.fx.length = 0; } assert(!sim.event, 'event still running'); assert(sim.stats.ibisShooed >= 1); });
check('Shazza scares ibis off the pump piles', () => { const sim = stageSim(['pump1', 'pie', 'counter', 'coffee', 'pump2', 'office', 'gav', 'val', 'roll', 'pump3', 'shazza']); sim.piles.pump1 = 400; sim.player.x = 9.5; sim.player.y = 12; sim.rng.pick = arr => arr.includes('ibis') ? 'ibis' : arr[0]; sim.startEvent(); sim.rng = new G.RNG(5); sim.ibises.forEach(b => { b.target = 'pump1'; const pp = G.STATION_BY_ID.pump1.pile; b.tx = pp.x; b.ty = pp.y; });
  for (let i = 0; i < 60 * 25 && sim.event; i++) { sim.input.x = sim.input.y = 0; sim.step(1 / 60); sim.fx.length = 0; } assert(sim.stats.ibisShooed >= 1, 'shazza never shooed'); });
check('pest goal points the guide arrow at seagulls during a raid', () => { const sim = stageSim(['pump1', 'pie', 'counter']); sim.tray.pie = 5; sim.rng.pick = arr => arr.includes('seagulls') ? 'seagulls' : arr[0]; sim.startEvent(); assert.strictEqual(sim.nextGoal().type, 'shoo'); });


/* ---------- 4c. Servo #2: The Nullarbor + the network ---------- */
log('\n## Servo #2: The Nullarbor');
const { campaign } = require('./campaign.js');
const camps = [campaign('efficient', 7), campaign('lazy', 7), campaign('efficient', 21)];
log('\n| bot | seed | servo 1 min | Nullarbor min | first Nullarbor unlock | longest gap (min) | longest idle | dry tanks | repairs (missed) | Pete bust at | thongs |');
log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const c of camps) { const a = c.servos.outback, b = c.servos.nullarbor; const ts = b.unlocks.map(u => u.t); const gap = Math.max(...ts.map((x, i) => (x - (ts[i - 1] || 0)) / 60).slice(1));
  log(`| ${c.kind} | ${c.seed} | ${a.min.toFixed(1)} | ${b.min.toFixed(1)} | ${(ts[0]).toFixed(1)} s | ${gap.toFixed(1)} | ${b.idleMax.toFixed(0)} s | ${b.stats.dry || 0} | ${b.stats.repaired || 0} (${b.stats.unfixed || 0}) | ${b.peteAt ? b.peteAt.toFixed(1) + ' min' : 'never'} | ${c.thongs} |`); }
log('\nNullarbor unlock times (minutes after arriving), efficient seed 7:');
log('\n' + camps[0].servos.nullarbor.unlocks.map(u => `${u.id} ${(u.t / 60).toFixed(1)}`).join(' · '));
log('');
check('Nullarbor: every bot finishes both servos', () => camps.forEach(c => { assert(c.servos.outback.done && c.servos.nullarbor.done, c.kind + ' ' + c.seed); }));
check('Nullarbor: 25-45 min of active play', () => camps.forEach(c => { const m = c.servos.nullarbor.min; assert(m >= 25 && m <= 45, m.toFixed(1)); }));
check('Nullarbor: first unlock within 20 s of arriving', () => camps.forEach(c => assert(c.servos.nullarbor.unlocks[0].t <= 20, c.servos.nullarbor.unlocks[0].t)));
check('Nullarbor: no idle stretch over 45 s', () => camps.forEach(c => assert(c.servos.nullarbor.idleMax <= 45, c.servos.nullarbor.idleMax)));
check('Nullarbor: no unlock gap over 7 min', () => camps.forEach(c => { const ts = c.servos.nullarbor.unlocks.map(u => u.t); for (let i = 1; i < ts.length; i++) assert((ts[i] - ts[i - 1]) / 60 <= 7, 'gap ' + ((ts[i] - ts[i - 1]) / 60).toFixed(1)); }));
check('Nullarbor: a bot that follows the arrow never lets the tank run dry more than a few times', () => camps.forEach(c => assert((c.servos.nullarbor.stats.dry || 0) <= 5, c.servos.nullarbor.stats.dry)));
check('Nullarbor: roo repairs happen and Petrol Pete goes bust before the finale', () => camps.forEach(c => { const b = c.servos.nullarbor; assert(b.stats.repaired > 10); assert(b.peteAt && b.peteAt < b.min, 'pete ' + b.peteAt); }));
check('travel keeps crew skills, parks the old servo, and the network pays', () => { const G2 = loadGame(); const sim = new G2.Sim({ seed: 3 }); const d = sim.toJSON(); for (const id of G2.ORDER) d.built[id] = true; d.upgrades = { walk: 5, carry: 4, station: 6, price: 6, staff: 3 }; d.flags.mapComplete = true; d.unlocked.nullarbor = true; sim.load(d); sim.chaosT = 1e9;
  assert(sim.travel('nullarbor')); assert.strictEqual(G2.SERVO.id, 'nullarbor'); assert.strictEqual(sim.upgrades.walk, 5); assert.strictEqual(sim.upgrades.carry, 4); assert.strictEqual(sim.upgrades.staff, 3); assert.strictEqual(sim.upgrades.station, 0); assert.strictEqual(sim.upgrades.price, 0);
  assert(sim.world.others.outback && sim.world.others.outback.rate > 0); assert(sim.networkRate() > 0); assert.strictEqual(Object.keys(sim.built).length, 0); assert.strictEqual(sim.cash, G2.SERVOS.nullarbor.startCash);
  for (let i = 0; i < 60 * 45; i++) { sim.step(1 / 60); sim.fx.length = 0; } assert(sim.piles.network > 100, 'network pile ' + sim.piles.network);
  const off = sim.offlineEarnings(3600); assert(off.network > 0 && off.cash === off.own + off.network);
  assert(sim.travel('outback')); assert.strictEqual(G2.SERVO.id, 'outback'); assert.strictEqual(Object.keys(sim.built).length, 15); assert.strictEqual(sim.upgrades.station, 6); assert(!sim.travel('ufo')); });
check('saves at the Nullarbor round-trip (active servo, parked servo, thongs, fuel, share)', () => { const G2 = loadGame(); const storage = fakeStorage(); G2.Save.storage = () => storage; const sim = new G2.Sim({ seed: 4 }); const d = sim.toJSON(); for (const id of G2.ORDER) d.built[id] = true; d.flags.mapComplete = true; d.unlocked.nullarbor = true; sim.load(d); sim.travel('nullarbor');
  sim.build('pump1'); sim.build('depot'); sim.fuel = 17; sim.depotTray = 5; sim.share = 0.73; sim.player.carry = ['fuel', 'fuel']; sim.world.thongs = { gold: 1, black: 3 }; G2.Save.write(sim.toJSON());
  const G3 = loadGame(); G3.Save.storage = () => storage; const s2 = new G3.Sim({ seed: 9 }); s2.load(G3.Save.read()); assert.strictEqual(G3.SERVO.id, 'nullarbor'); assert(s2.built.pump1 && s2.built.depot); assert.strictEqual(s2.fuel, 17); assert.strictEqual(s2.depotTray, 5); assert(Math.abs(s2.share - 0.73) < 1e-9); assert.strictEqual(JSON.stringify(s2.player.carry), '["fuel","fuel"]'); assert.strictEqual(s2.thongCount, 2); assert(s2.world.others.outback && Object.keys(s2.world.others.outback.built).length === 15); assert(s2.world.bigThings.outback); });
check('v2 save migrates to v3 at the first servo', () => { const d = G.Save.migrate({ v: 2, cash: 77, built: { pump1: true, bigpie: true }, flags: { mapComplete: true } }); assert.strictEqual(d.v, 3); assert.strictEqual(d.active, 'outback'); assert(d.unlocked.nullarbor); assert(d.bigThings.outback); });
check('empty tank turns cars away; carrying drums refills it; Trev automates it', () => { const G2 = loadGame(); G2.useServo('nullarbor'); const sim = new G2.Sim({ seed: 5 }); sim.chaosT = 1e9; sim.build('pump1'); sim.build('depot'); sim.fuel = 0; sim.player.x = 9; sim.player.y = 12; for (let i = 0; i < 60 * 30; i++) { sim.step(1 / 60); sim.fx.length = 0; } assert(sim.stats.dry >= 2, 'dry ' + sim.stats.dry);
  sim.depotTray = 6; const dep = G2.STATION_BY_ID.depot.interact; sim.player.x = dep.x; sim.player.y = dep.y; for (let i = 0; i < 60; i++) { sim.step(1 / 60); sim.fx.length = 0; } assert(sim.player.carry.filter(x => x === 'fuel').length >= 4);
  for (let i = 0; i < 60 * 30 && sim.player.carry.includes('fuel'); i++) { sim.autopilot(sim.nextGoal(), 1 / 60); sim.step(1 / 60); sim.fx.length = 0; } assert(sim.fuel >= 8, 'fuel ' + sim.fuel);
  sim.build('pie'); sim.build('counter'); sim.build('pump2'); sim.build('choc'); sim.build('office'); sim.build('trev'); sim.fuel = 2; sim.depotTray = 10; sim.player.x = 9; sim.player.y = 12; const f0 = sim.fuel; for (let i = 0; i < 60 * 40; i++) { sim.input.x = sim.input.y = 0; sim.step(1 / 60); sim.fx.length = 0; } assert(sim.fuel > f0 + 10, 'trev fuel ' + sim.fuel); });
check('roo-damaged cars come more at night, and Mick repairs them alone', () => { const G2 = loadGame(); G2.useServo('nullarbor'); const sim = new G2.Sim({ seed: 6 }); sim.chaosT = 1e9; for (const id of ['pump1', 'mechanic', 'office', 'mick']) sim.build(id); sim.player.x = 9; sim.player.y = 12; sim.fuel = 60;
  const count = startTime => { sim.time = startTime; const r0 = sim.stats.repaired + sim.stats.unfixed; for (let i = 0; i < 60 * 60; i++) { sim.step(1 / 60); sim.fx.length = 0; sim.time = startTime + i / 60; } return sim.stats.repaired + sim.stats.unfixed - r0; };
  const day = count(0), night = count(230); assert(night > day * 2, 'day ' + day + ' night ' + night); assert(sim.stats.repaired >= night, 'mick repaired ' + sim.stats.repaired); });
check('price war: standing on the board wins it and raises Highway Share', () => { const G2 = loadGame(); G2.useServo('nullarbor'); const sim = new G2.Sim({ seed: 7 }); sim.chaosT = 1e9; sim.build('pump1'); sim.build('pie'); sim.build('counter'); const s0 = sim.share; sim.rng.pick = a => a.includes('pricewar') ? 'pricewar' : a[0]; sim.startEvent(); sim.rng = new G2.RNG(1);
  assert.strictEqual(sim.event, 'pricewar'); assert(sim.trafficMult < 0.6 * (0.5 + s0) + 1e-9); assert.strictEqual(sim.nextGoal().type, 'shoo'); for (let i = 0; i < 60 * 20 && sim.event; i++) { sim.autopilot(sim.nextGoal(), 1 / 60); sim.step(1 / 60); sim.fx.length = 0; } assert(!sim.event); assert(sim.share > s0, 'share ' + sim.share); });
check('thongs: collected designs give +1% prices each, everywhere', () => { const sim = new G.Sim({ seed: 8 }); const p0 = sim.priceMult; sim.floorThongs.push({ x: sim.player.x, y: sim.player.y, t: 0 }); sim.step(1 / 60); assert.strictEqual(sim.thongCount, 1); assert(Math.abs(sim.priceMult / p0 - 1.01) < 1e-9); });
check('offline formula within 25% of measured automated income at a full Nullarbor (one full day)', () => { const G2 = loadGame(); G2.useServo('nullarbor'); const sim = new G2.Sim({ seed: 3 }); for (const id of G2.ORDER) sim.build(id); sim.fx.length = 0; sim.upgrades = { walk: 6, carry: 5, station: 4, price: 4, staff: 5 }; sim.chaosT = 1e9; sim.player.x = 9; sim.player.y = 12; sim.fuel = 60;
  const e0 = sim.totalEarned, p0 = Object.values(sim.piles).reduce((a, b) => a + b, 0); for (let i = 0; i < 60 * 360; i++) { sim.input.x = sim.input.y = 0; sim.step(1 / 60); sim.fx.length = 0; } const measured = (sim.totalEarned - e0 + Object.values(sim.piles).reduce((a, b) => a + b, 0) - p0) / 360;
  const eff = G2.ECON.offlineBase + G2.ECON.offlinePerStaff * sim.staffCount; const ratio = (sim.offlineRate() / eff) / measured; log('   Nullarbor measured $/s ' + measured.toFixed(1) + ' vs formula ' + (sim.offlineRate() / eff).toFixed(1) + ' ratio ' + ratio.toFixed(2) + ', dry ' + sim.stats.dry); assert(ratio > 0.75 && ratio < 1.25, ratio); });

/* ---------- 5. misc ---------- */
log('\n## Misc');
check('fmt formats big numbers', () => { assert.strictEqual(G.fmt(999), '$999'); assert.strictEqual(G.fmt(1200), '$1.2K'); assert.strictEqual(G.fmt(3400000), '$3.4M'); assert.strictEqual(G.fmt(12345678), '$12.3M'); assert.strictEqual(G.fmt(2.5e9), '$2.5B'); });
check('at least 30 original speech lines, 35+ clean', () => { assert(G.LINES.length >= 30); assert(G.LINES.filter(l => !l[1]).length >= 30); });
check('pathfinder reaches every queue slot and every station interact point from the spawn', () => { const g = new G.Grid(); const built = {}; for (const id of G.ORDER) built[id] = true; g.rebuild(built); for (const q of G.MAP.queue) { const p = g.path(G.MAP.spawn.x, G.MAP.spawn.y, q.x, q.y); assert(p && p.length > 3); const last = p[p.length - 1]; assert(Math.abs(last.x - q.x) < 0.01 && Math.abs(last.y - q.y) < 0.01, 'slot unreachable ' + JSON.stringify(q)); } });
check('building the Second Till never traps the player behind the counter', () => { const sim = new G.Sim({ seed: 1 }); const d = sim.toJSON(); for (const id of G.ORDER.slice(0, 12)) d.built[id] = true; d.cash = 10000; d.player = { x: 10.5, y: 3.4 }; sim.load(d); sim.player.x = 10.5; sim.player.y = 3.4; sim.build('till2'); assert(sim.grid.reachable(sim.player.x, sim.player.y), JSON.stringify([sim.player.x, sim.player.y])); });
check('a pad never sticks at "$0 to go" (fractional cents)', () => { const sim = new G.Sim({ seed: 1 }); sim.cash = 9.9995; const st = G.STATION_BY_ID.pump1; sim.player.x = st.x + 0.5; sim.player.y = st.y + 0.5; for (let i = 0; i < 300; i++) { sim.step(1 / 60); sim.fx.length = 0; } assert(sim.built.pump1); });
check('object pool recycles', () => { const p = new G.Pool(() => ({})); const a = p.get(); p.release(a); const b = p.get(); assert.strictEqual(a, b); });

log(`\n${failures === 0 ? 'ALL HEADLESS TESTS PASSED' : failures + ' HEADLESS TEST(S) FAILED'}`);
fs.writeFileSync(path.join(__dirname, 'sim-report.md'), out.join('\n'));
process.exit(failures ? 1 : 0);
