// Bot policies used by the headless economy simulation.
function makeBot(kind, rng) {
  const st = { idleUntil: 0, lastGoalKey: '', wanderT: 0 };
  return function act(sim, t, dt) {
    const g = sim.nextGoal();
    // upgrades: efficient bot buys any upgrade costing < 35% of the next pad's remaining cost; lazy bot rarely bothers
    if (sim.built.office) {
      const next = sim.nextPad(); const remaining = next ? sim.STATION_BY_ID[next].cost - (sim.paid[next] || 0) : 1e9;
      const prio = sim.staff.gav ? ['price', 'station', 'staff', 'carry', 'walk'] : ['carry', 'price', 'walk', 'station', 'staff'];
      for (const id of prio) { const c = sim.upgradeCost(id); if (c <= sim.cash && c < remaining * (kind === 'efficient' ? 0.3 : 0.15) && (kind === 'efficient' || rng.next() < 0.002)) { sim.buyUpgrade(id); break; } }
    }
    if (kind === 'lazy') {
      // reacts late: when the goal changes, dawdle for 2-6 s first; 20% of goals get ignored for a bit
      const key = g.type + ':' + g.id;
      if (key !== st.lastGoalKey) { st.lastGoalKey = key; if (rng.next() < 0.6) st.idleUntil = t + rng.range(2, 6); }
      if (t < st.idleUntil) { sim.input.x = 0; sim.input.y = 0; return g; }
    }
    sim.autopilot(g, dt);
    return g;
  };
}
module.exports = { makeBot };
