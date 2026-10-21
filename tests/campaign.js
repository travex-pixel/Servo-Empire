// Plays both servos back to back with a bot: servo 1 to completion, travel, servo 2 to completion.
const { loadGame } = require('./load.js'); const { makeBot } = require('./bots.js');
function campaign(kind, seed, opts = {}) {
  const G = loadGame(); if (opts.tweak) opts.tweak(G); const sim = new G.Sim({ seed }); const rng = new G.RNG(seed * 7 + 1); const bot = makeBot(kind, rng); const dt = 1 / 60;
  const out = { kind, seed, servos: {} }; let t = 0;
  for (const servo of (opts.servos || G.SERVO_ORDER || ['outback', 'nullarbor'])) {
    if (servo !== 'outback') { if (!sim.travel(servo)) throw new Error('travel failed'); sim.fx.length = 0; }
    Object.defineProperty(sim, 'STATION_BY_ID', { value: G.STATION_BY_ID, writable: true, configurable: true });
    const r = { unlocks: [], idleMax: 0, idleAt: 0, dry: 0, t0: t }; let idleCur = 0, prev = sim.stats.unlocks, local = 0; const limit = (opts.maxMin || 90) * 60;
    while (local < limit && !sim.allBuilt()) {
      const g = bot(sim, t, dt); if (opts.onStep) opts.onStep(sim, servo, local, g); sim.step(dt); sim.fx.length = 0; t += dt; local += dt;
      if (g.type === 'save' || g.type === 'done') { idleCur += dt; if (idleCur > r.idleMax) { r.idleMax = idleCur; r.idleAt = local; } } else idleCur = 0;
      if (sim.flags.peteBust && !r.peteAt) r.peteAt = local / 60;
      if (sim.stats.unlocks > prev) { prev = sim.stats.unlocks; const id = G.ORDER.filter(i => sim.built[i] && !r.unlocks.some(u => u.id === i))[0]; r.unlocks.push({ id, t: local }); }
    }
    r.done = sim.allBuilt(); r.min = local / 60; r.stats = Object.assign({}, sim.stats); r.share = sim.share; r.fuel = sim.fuel; r.netRate = sim.networkRate() * 60; r.upgrades = Object.assign({}, sim.upgrades); r.rate = sim.offlineRate() * 60;
    out.servos[servo] = r;
  }
  out.thongs = Object.keys(sim.world.thongs).length; out.totalMin = t / 60; out.sim = sim; out.G = G; return out;
}
module.exports = { campaign };
if (require.main === module) {
  for (const [kind, seed] of [['efficient', 7], ['lazy', 7], ['efficient', 21]]) { const c = campaign(kind, seed);
    for (const id in c.servos) { const r = c.servos[id]; let prev = 0; console.log(`== ${kind}/${seed} ${id}: done ${r.done} in ${r.min.toFixed(1)} min, idle max ${r.idleMax.toFixed(0)}s, share ${r.share.toFixed(2)}, dry ${r.stats.dry || 0}, repaired ${r.stats.repaired || 0}, unfixed ${r.stats.unfixed || 0}, lost ${r.stats.lost}, net $/min ${r.netRate.toFixed(0)}, own $/min ${r.rate.toFixed(0)}, pete bust at ${r.peteAt ? r.peteAt.toFixed(1) : '-'} min`);
      console.log('   ' + r.unlocks.map(u => { const s = `${u.id}@${(u.t / 60).toFixed(1)}(+${((u.t - prev) / 60).toFixed(1)})`; prev = u.t; return s; }).join(' ')); }
    console.log('   thongs', c.thongs, 'milestones', Object.keys(c.sim.world.milestones).length, 'life', JSON.stringify(c.sim.world.life)); }
}
