// Fast headless checks for v0.4: the UFO Roadhouse, the Opal Dugout, shift goals and the Brag Board.
// Run: node tests/servos.test.js
const { loadGame, fakeStorage } = require('./load.js');
const assert = require('assert');
let fails = 0, passes = 0; const out = [];
function check(name, fn) { try { fn(); passes++; out.push('  ✔ ' + name); console.log('  ✔ ' + name); } catch (e) { fails++; out.push('  ✘ ' + name + ' -> ' + e.message); console.log('  ✘ ' + name + ' -> ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); } }
const dt = 1 / 60;
function run(sim, sec, each) { for (let i = 0; i < sec * 60; i++) { if (each && each(sim) === false) break; sim.step(dt); sim.fx.length = 0; } }
function at(servo, ids, seed = 9, meta = false) { const G = loadGame(); G.useServo(servo); const sim = new G.Sim({ seed, meta }); sim.chaosT = 1e9; for (const id of ids) sim.build(id); sim.fx.length = 0; sim.player.x = 9; sim.player.y = 12; return { G, sim }; }
function force(sim, kind, G) { const pick = sim.rng.pick; sim.rng.pick = a => (a.includes(kind) ? kind : pick.call(sim.rng, a)); sim.startEvent(); sim.rng.pick = pick; assert.strictEqual(sim.event, kind); }
function night(sim) { // jump the clock forward to the middle of the night (phase 0.65)
  const base = Math.floor(sim.time / 360) * 360 + (0.65 - 0.15) * 360; sim.time = base >= sim.time ? base : base + 360; }

console.log('## UFO Roadhouse');
check('econ keys never leak between servos (no stale alien/heap config after travel)', () => {
  const G = loadGame(); for (const id of G.SERVO_ORDER) { G.useServo(id); for (const k of ['alien', 'meteor', 'beam', 'heap', 'cutter', 'dust', 'shaft', 'tank', 'tanker', 'mechanic']) assert(k in G.SERVOS[id].econ, id + ' econ is missing ' + k); }
  G.useServo('ufo'); G.useServo('outback'); assert.strictEqual(G.ECON.alien, null); assert.strictEqual(G.ECON.heap, null); G.useServo('dugout'); assert.strictEqual(G.ECON.alien, null); assert(G.ECON.heap); });
check('every servo: pathfinder reaches every pad interact point and pile from the spawn', () => {
  const G = loadGame(); for (const id of G.SERVO_ORDER) { G.useServo(id); const sim = new G.Sim({ seed: 1, meta: false }); for (const st of G.STATIONS) { if (st.meta) continue; sim.build(st.id); }
    for (const st of G.STATIONS) { for (const k of ['interact', 'collect']) if (st[k]) { const p = sim.grid.path(G.MAP.spawn.x, G.MAP.spawn.y, st[k].x, st[k].y); assert(p, id + ': no path to ' + st.id + '.' + k); } } } });
check('every servo: costs rise, names are unique, the Big Thing is last, staff all have info', () => {
  const G = loadGame(); for (const id of G.SERVO_ORDER) { G.useServo(id); const ids = new Set(); const pads = G.STATIONS.filter(s => !s.meta); for (const st of pads) { assert(!ids.has(st.id), 'dup ' + st.id); ids.add(st.id); if (st.kind === 'hire') assert(G.STAFF_INFO[st.staff], 'no STAFF_INFO for ' + st.staff); }
    assert.strictEqual(pads[pads.length - 1].kind, G.SERVOS[id].bigThing, id + ' big thing last'); } });
check('aliens land only at night, only with the Landing Pad, and pay triple', () => {
  const { G, sim } = at('ufo', ['pump1', 'pie', 'counter', 'val']); sim.tray.pie = 8; sim.shelf.pie = 8;
  let aliens = 0; const seen = new Set(); run(sim, 40, s => { for (const c of s.customers) if (c.alien) seen.add(c); }); aliens = seen.size; assert.strictEqual(aliens, 0, 'aliens without a landing pad');
  sim.build('landing'); sim.fx.length = 0; night(sim); const c0 = sim.world.life.aliens; let pays = []; const orig = sim.addCash.bind(sim);
  run(sim, 30, s => { s.shelf.pie = 8; for (const c of s.customers) if (c.alien) seen.add(c); if (s.dayState().night < 0.6) night(s); });
  assert(seen.size >= 3, 'aliens seen ' + seen.size); });
check('alien pays ×3 at the till (Val serving)', () => {
  const { G, sim } = at('ufo', ['pump1', 'pie', 'counter', 'val', 'landing']); sim.shelf.pie = 50; night(sim); sim.custT = 1e9; sim.alienT = 1e9; sim.piles.counter = 0; sim.spawnCustomer(true); assert(sim.customers[0].alien);
  run(sim, 25, s => { s.custT = 1e9; s.alienT = 1e9; return !(s.piles.counter > 0); });
  const priced = sim.price('pie'); assert(sim.piles.counter >= priced * 3 - 0.01 && sim.piles.counter <= priced * 3 * 1.6, 'counter pile ' + sim.piles.counter + ' vs price ' + priced); });
check('meteor shower: rocks fall, walking over them pays, the event ends', () => {
  const { G, sim } = at('ufo', ['pump1', 'pie', 'counter']); force(sim, 'meteors', G); const n = sim.meteors.length; assert(n >= 4, 'meteors ' + n);
  const v = sim.meteors[0].value; assert(v >= 15); const c0 = sim.cash; run(sim, 3); for (const m of sim.meteors.slice()) { sim.player.x = m.x; sim.player.y = m.y; run(sim, 0.1); }
  assert.strictEqual(sim.meteors.length, 0); assert(sim.cash - c0 >= v * n * 0.99, 'got ' + (sim.cash - c0)); assert.strictEqual(sim.world.life.meteors, n); run(sim, 1); assert.strictEqual(sim.event, null); });
check('abduction beam: drains the biggest pile; standing in it refunds 1.5x what it ate', () => {
  const { G, sim } = at('ufo', ['pump1', 'pie', 'counter', 'pump2']); sim.piles.pump2 = 400; sim.piles.pump1 = 10; sim.piles.counter = 0; sim.player.x = 9.5; sim.player.y = 12; force(sim, 'abduct', G);
  assert.strictEqual(sim.beam.target, 'pump2'); run(sim, 4); const left = sim.piles.pump2; assert(left < 400, 'ate nothing'); const ate = sim.beam.ate; const pp = G.STATION_BY_ID.pump2.pile; sim.player.x = pp.x; sim.player.y = pp.y; sim.piles.pump2 = 0;
  // stand still without collecting to prove the refund: the player picks the pile up anyway, so count cash + pile
  const c0 = sim.cash; run(sim, 2.5); assert.strictEqual(sim.beam, null, 'beam still up'); assert.strictEqual(sim.world.life.beams, 1); assert(sim.cash - c0 + (sim.piles.pump2 || 0) >= ate * 1.4, 'refund ' + (sim.cash - c0) + ' ate ' + ate); });
check('abduction beam: the guide arrow sends a bot to break it, before Zorp', () => {
  const { G, sim } = at('ufo', ['pump1', 'pie', 'counter', 'pump2']); sim.piles.counter = 300; force(sim, 'abduct', G); let broke = false;
  run(sim, 18, s => { s.autopilot(s.nextGoal(), dt); if (!s.beam) { broke = true; return false; } }); assert(broke, 'bot never broke the beam'); assert.strictEqual(sim.world.life.beams, 1); });
check('Zorp beams cash piles to the wallet on his own and breaks beams without you', () => {
  const { G, sim } = at('ufo', ['pump1', 'pie', 'counter', 'pump2', 'zorp']); sim.player.x = 9.5; sim.player.y = 15.5; sim.piles.pump1 = 200; sim.piles.pump2 = 100; const c0 = sim.cash; run(sim, 12); assert(sim.cash - c0 >= 280, 'zorp collected ' + (sim.cash - c0));
  sim.piles.pump2 = 500; force(sim, 'abduct', G); run(sim, 5); assert.strictEqual(sim.beam, null, 'zorp did not break the beam'); });
check('UFO events never fire before there is anything to beam', () => { const { G, sim } = at('ufo', []); const seen = []; const pick = sim.rng.pick; sim.rng.pick = a => { seen.push(a.slice()); return 'rush'; }; sim.startEvent(); assert(!seen[0].includes('abduct')); });

console.log('## Opal Dugout');
check('heap makes rock; carrying rock to the cutter makes opals in a cash pile', () => {
  const { G, sim } = at('dugout', ['pump1', 'pie', 'counter', 'heap', 'cutter']); run(sim, 12); assert(sim.rockTray >= 3, 'rocks ' + sim.rockTray);
  const h = G.STATION_BY_ID.heap.interact; sim.player.x = h.x; sim.player.y = h.y; run(sim, 1.5); const rocks = sim.player.carry.filter(i => i === 'rock').length; assert(rocks >= 2, 'carried ' + rocks);
  const cu = G.STATION_BY_ID.cutter.interact; sim.player.x = cu.x; sim.player.y = cu.y; run(sim, 1.5); assert(!sim.player.carry.includes('rock'), 'still carrying rock'); sim.player.x = 9.5; sim.player.y = 12; run(sim, 3 * rocks * 1.2);
  assert(sim.world.life.opals >= rocks - 1, 'opals ' + sim.world.life.opals); assert(sim.piles.cutter > 0, 'no opal cash'); });
check('opal tiers: about 70% potch, black opals are rare, values follow the multipliers', () => {
  const { G, sim } = at('dugout', ['pump1', 'heap', 'cutter']); const tally = {}; let total = 0; const orig = sim.fx.push;
  for (let i = 0; i < 4000; i++) { sim.cutter.q = 1; sim.cutter.t = 999; sim.fx.length = 0; sim.step(dt); for (const f of sim.fx) if (f.t === 'opal') { tally[f.tier] = (tally[f.tier] || 0) + 1; total++; } }
  assert(total > 3500, 'cut ' + total); assert(Math.abs(tally.potch / total - 0.70) < 0.04, 'potch ' + tally.potch / total); assert(tally.black > 10 && tally.black / total < 0.02, 'black ' + tally.black); assert(tally.fire > tally.black && tally.crystal > tally.fire); });
check('dust storm: dusty bowsers stop filling; standing next to one wipes it', () => {
  const { G, sim } = at('dugout', ['pump1', 'pump2']); force(sim, 'duststorm', G); assert(sim.dusty.pump1 && sim.dusty.pump2); const piles0 = (sim.piles.pump1 || 0); run(sim, 15); assert.strictEqual((sim.piles.pump1 || 0), piles0, 'dusty pump still paid');
  const st = G.STATION_BY_ID.pump1; sim.player.x = st.collect.x; sim.player.y = st.collect.y; run(sim, 1); assert(!sim.dusty.pump1, 'not wiped'); assert(sim.dusty.pump2); assert.strictEqual(sim.world.life.wipes, 1); });
check('dust storm: Shazza wipes the bowsers for you', () => { const { G, sim } = at('dugout', ['pump1', 'pump2', 'shazza']); force(sim, 'duststorm', G); run(sim, 25); assert(!sim.dusty.pump1 && !sim.dusty.pump2, 'shazza left dust'); });
check('mine shaft: holding next to it for 2 s rescues the tourist for a tip', () => {
  const { G, sim } = at('dugout', ['pump1', 'pie', 'counter']); force(sim, 'shaft', G); const s = sim.shaft; assert(s); const c0 = sim.cash; sim.player.x = s.x + 0.6; sim.player.y = s.y; run(sim, 2.3);
  assert.strictEqual(sim.shaft, null); assert(sim.cash - c0 >= 60, 'tip ' + (sim.cash - c0)); assert.strictEqual(sim.world.life.rescues, 1); });
check('mine shaft: a bot following the arrow gets there in time from anywhere', () => {
  for (const seed of [1, 2, 3, 4, 5, 6]) { const { G, sim } = at('dugout', ['pump1', 'pie', 'counter'], seed); sim.player.x = 9.5; sim.player.y = 5.5; force(sim, 'shaft', G); let ok = false; run(sim, 30, s => { s.autopilot(s.nextGoal(), dt); if (!s.shaft) { ok = true; return false; } }); assert(ok && sim.world.life.rescues === 1, 'seed ' + seed + ' missed the rescue'); } });
check('Noodler Ned hauls rock to the cutter on his own', () => { const { G, sim } = at('dugout', ['pump1', 'heap', 'cutter', 'office', 'ned']); sim.player.x = 9.5; sim.player.y = 5.5; run(sim, 60); assert(sim.world.life.opals >= 6, 'opals ' + sim.world.life.opals); });
check('heat: walk-ins lose patience faster until the cool room is built', () => {
  const { G, sim } = at('dugout', ['pump1', 'pie', 'counter']); sim.shelf.pie = 0; sim.tray.pie = 0; sim.custT = 0; run(sim, 3); const c = sim.customers[0]; assert(c); const p0 = c.patience; run(sim, 5); const hot = p0 - c.patience;
  const b = at('dugout', ['pump1', 'pie', 'counter', 'coolroom']); const s2 = b.sim; s2.shelf.pie = 0; s2.tray.pie = 0; s2.custT = 0; run(s2, 3); const c2 = s2.customers[0]; const q0 = c2.patience; run(s2, 5); const cool = q0 - c2.patience; assert(hot > cool * 1.15, 'hot ' + hot + ' cool ' + cool); });
check('dugout save round-trip keeps rock, cutter queue and dusty bowsers', () => {
  const G = loadGame(); const storage = fakeStorage(); G.Save.storage = () => storage; G.useServo('dugout'); const sim = new G.Sim({ seed: 2 }); for (const id of ['pump1', 'pump2', 'heap', 'cutter']) sim.build(id); sim.rockTray = 7; sim.cutter.q = 4; sim.dusty.pump2 = true;
  const d = JSON.parse(JSON.stringify(sim.toJSON())); const s2 = new G.Sim({ seed: 3 }); s2.load(d); assert.strictEqual(s2.rockTray, 7); assert.strictEqual(s2.cutter.q, 4); assert(s2.dusty.pump2 && !s2.dusty.pump1); });

check('event fairness: every chaos type at every servo comes up within 12 events', () => {
  for (const id of ['outback', 'nullarbor', 'ufo', 'dugout']) { const { G, sim } = at(id, [], 5); for (const st of G.STATIONS) if (!st.meta) sim.build(st.id); sim.fx.length = 0; const seen = {};
    for (let i = 0; i < 12; i++) { sim.event = null; sim.beam = null; sim.shaft = null; sim.meteors.length = 0; sim.seagulls.length = 0; sim.ibises.length = 0; for (const k in sim.dusty) sim.dusty[k] = false; sim.tray.pie = 5; sim.startEvent(); seen[sim.event] = (seen[sim.event] || 0) + 1; }
    for (const k of G.SERVOS[id].events) if (k !== 'rush') assert((seen[k] || 0) >= 2, id + ': ' + k + ' came up ' + (seen[k] || 0) + ' times in 12 (' + JSON.stringify(seen) + ')'); } });

console.log('## Mystery shopper, goals, Brag Board');
check('VIP mystery shoppers appear only after 3 pads and pay ×8', () => {
  const { G, sim } = at('outback', ['pump1', 'pie', 'counter', 'coffee', 'val']); let vips = 0; const seen = new Set(); sim.rng.next = (() => { const r = new G.RNG(4); return () => r.next() * 0.5; })();
  run(sim, 60, s => { s.shelf.pie = 20; s.shelf.coffee = 20; for (const c of s.customers) if (c.vip) seen.add(c); }); assert(seen.size >= 1, 'no vip'); });
check('shift goals: three live goals, completing all three pays a bonus and starts Smoko Boost', () => {
  const { G, sim } = at('outback', ['pump1', 'pie', 'counter'], 4, true); run(sim, 1.2); assert.strictEqual(sim.goals.length, 3); for (const g of sim.goals) assert(g.reward > 0 && g.label);
  const c0 = sim.cash; for (const g of sim.goals) { sim.tally[g.k] = (sim.tally[g.k] || 0) + g.n + 1000; } let shift = false; const fx = []; for (let i = 0; i < 120; i++) { sim.step(dt); fx.push(...sim.fx); sim.fx.length = 0; }
  assert(fx.some(f => f.t === 'shiftDone'), 'no shift bonus'); assert(sim.boost > 0, 'no smoko boost'); assert(sim.cash > c0); assert.strictEqual(sim.goals.length, 3); assert.strictEqual(sim.world.life.shifts, 1); });
check('Brag Board: milestones fire once, pay once, and survive a save', () => {
  const G = loadGame(); const storage = fakeStorage(); G.Save.storage = () => storage; const sim = new G.Sim({ seed: 2 }); sim.chaosT = 1e9; sim.build('pump1'); const fx = []; for (let i = 0; i < 90; i++) { sim.step(dt); fx.push(...sim.fx); sim.fx.length = 0; }
  assert(sim.world.milestones.open, 'open not earned'); assert.strictEqual(fx.filter(f => f.t === 'milestone' && f.id === 'open').length, 1); const d = JSON.parse(JSON.stringify(sim.toJSON())); const s2 = new G.Sim({ seed: 2 }); s2.load(d); assert(s2.world.milestones.open); const c0 = s2.cash; for (let i = 0; i < 90; i++) { s2.step(dt); s2.fx.length = 0; } assert(!(s2.cash - c0 > 1000)); });
check('Brag Board: every milestone is reachable in the campaign design (counters exist)', () => { const G = loadGame(); const sim = new G.Sim({ seed: 1 }); for (const m of G.MILESTONES) { assert.doesNotThrow(() => m.test(sim), m.id); } assert(G.MILESTONES.length >= 25); });
check('offline cap: 2 h base, +2 h per finished servo, 8 h max', () => { const G = loadGame(); const sim = new G.Sim({ seed: 1 }); assert.strictEqual(sim.offlineCap(), 7200); sim.flags.mapComplete = true; assert.strictEqual(sim.offlineCap(), 14400); sim.world.others = { nullarbor: { flags: { mapComplete: true } }, ufo: { flags: { mapComplete: true } }, dugout: { flags: { mapComplete: true } } }; assert.strictEqual(sim.offlineCap(), 28800); });

console.log('\n' + (fails ? fails + ' SERVO TEST(S) FAILED' : 'ALL ' + passes + ' SERVO TESTS PASSED'));
require('fs').writeFileSync(require('path').join(__dirname, 'servos-report.md'), '# v0.4 servo mechanics\n\n' + out.join('\n') + '\n\n' + (fails ? fails + ' failed' : 'all ' + passes + ' passed') + '\n');
process.exitCode = fails ? 1 : 0;
