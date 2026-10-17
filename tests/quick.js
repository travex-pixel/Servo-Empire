const { loadGame } = require('./load.js'); const { makeBot } = require('./bots.js');
const G = loadGame();
function run(kind, seed, maxMin = 60) {
  const sim = new G.Sim({ seed }); sim.STATION_BY_ID = G.STATION_BY_ID; const rng = new G.RNG(seed * 7 + 1);
  const bot = makeBot(kind, rng); const dt = 1 / 60; let t = 0; const unlocks = []; let idleMax = 0, idleCur = 0, idleAt = 0; let prevBuilt = 0;
  while (t < maxMin * 60 && !sim.allBuilt()) {
    const g = bot(sim, t, dt); sim.step(dt); sim.fx.length = 0; t += dt;
    if (g.type === 'save' || g.type === 'done') { idleCur += dt; if (idleCur > idleMax) { idleMax = idleCur; idleAt = t; } } else idleCur = 0;
    if (sim.stats.unlocks > prevBuilt) { prevBuilt = sim.stats.unlocks; const id = G.ORDER.filter(i => sim.built[i] && !unlocks.some(u => u.id === i))[0]; unlocks.push({ id, t, earned: sim.totalEarned }); }
  }
  return { sim, t, unlocks, idleMax, idleAt };
}
module.exports = { run, G };
if (require.main === module) {
  for (const kind of ['efficient', 'lazy']) {
    const r = run(kind, 7); console.log('==', kind, 'finished', r.sim.allBuilt(), 'in', (r.t / 60).toFixed(1), 'min; longest idle', r.idleMax.toFixed(0), 's at', (r.idleAt / 60).toFixed(1), 'm');
    let prev = 0, pe = 0; console.log(r.unlocks.map(u => { const s = `${u.id}@${(u.t / 60).toFixed(1)}m(+${((u.t - prev) / 60).toFixed(1)}m, $${((u.earned - pe) / Math.max(1, u.t - prev) * 60).toFixed(0)}/min)`; prev = u.t; pe = u.earned; return s; }).join(' '));
    console.log('upgrades', JSON.stringify(r.sim.upgrades), 'served', r.sim.stats.served, 'lost', r.sim.stats.lost, 'events', r.sim.stats.events, 'cash', r.sim.cash.toFixed(0), 'offline $/min', (r.sim.offlineRate() * 60).toFixed(0));
  }
}
