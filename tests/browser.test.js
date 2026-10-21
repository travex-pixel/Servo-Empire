// Browser release check: loads index.html in headless Chromium at phone and desktop sizes, plays with simulated
// input, drives the player with the in-page bot, takes screenshots, and FAILS on any console error or page error.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const http = require('http');
const ROOT = path.join(__dirname, '..'); const TYPES = { '.html': 'text/html', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.js': 'text/javascript' };
const server = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
let URL = '';
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run() {
  fs.mkdirSync(OUT, { recursive: true }); await new Promise(r => server.listen(0, '127.0.0.1', r)); URL = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { viewports: [], errors: [] };
  for (const vp of [{ name: 'phone', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }, { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor });
    const page = await ctx.newPage(); const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('[console.error] ' + m.text()); });
    page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
    await page.goto(URL); await sleep(300);
    await page.screenshot({ path: path.join(OUT, `${vp.name}-00-splash.png`) });
    await page.click('#btnStart'); await sleep(300); await page.evaluate(() => window.__servo.setName('Dazza'));
    const handShown = await page.evaluate(() => window.__servo.renderer.showHand);
    const p0 = await page.evaluate(() => ({ x: window.__servo.sim.player.x, y: window.__servo.sim.player.y, cash: window.__servo.sim.cash }));
    // 1) simulated input. Phone: drag joystick with pointer events. Desktop: hold keys.
    if (vp.isMobile) { await page.mouse.move(200, 600); await page.mouse.down(); for (let i = 0; i < 10; i++) { await page.mouse.move(200, 600 - i * 8); await sleep(40); } await sleep(1200); await page.mouse.up(); }
    else { await page.keyboard.down('w'); await sleep(900); await page.keyboard.up('w'); await page.keyboard.down('ArrowLeft'); await sleep(500); await page.keyboard.up('ArrowLeft'); }
    const p1 = await page.evaluate(() => ({ x: window.__servo.sim.player.x, y: window.__servo.sim.player.y }));
    const moved = Math.hypot(p1.x - p0.x, p1.y - p0.y) > 0.5;
    await page.screenshot({ path: path.join(OUT, `${vp.name}-01-start.png`) });
    // 2) bot plays for the rest of the 60 seconds
    await page.evaluate(() => { window.__servo.bot = true; });
    await sleep(20000); await page.screenshot({ path: path.join(OUT, `${vp.name}-02-20s.png`) });
    await sleep(25000); await page.screenshot({ path: path.join(OUT, `${vp.name}-03-45s.png`) });
    await sleep(12000);
    const state = await page.evaluate(() => { const g = window.__servo; return { cash: g.sim.cash, built: Object.keys(g.sim.built), fps: g.renderer.fps, events: g.analytics.buffer.map(e => e.event), customers: g.sim.customers.length, cars: g.sim.cars.length, saved: !!localStorage.getItem('servoEmpire.save') }; });
    await page.screenshot({ path: path.join(OUT, `${vp.name}-04-60s.png`) });
    // 3) settings + upgrades modals render
    await page.click('#btnSettings'); await sleep(200); await page.screenshot({ path: path.join(OUT, `${vp.name}-05-settings.png`) }); await page.click('#btnCloseSettings');
    // 4) late game: inject a full servo with staff and traffic; measure fps with many entities on screen
    await page.evaluate(() => { const g = window.__servo; const d = g.sim.toJSON(); for (const id of ServoEmpire.ORDER) if (id !== 'bigpie') d.built[id] = true; d.cash = 9000; d.upgrades = { walk: 3, carry: 3, station: 4, price: 4, staff: 4 }; d.player = { x: 5.5, y: 12.5 }; d.carry = ['pie', 'coffee', 'roll']; g.loadData(d); g.renderer.goal = null; g.bot = false;
      // force a busy scene: tradie rush + a seagull raid + lots of customers
      g.sim.tray.pie = 6; g.sim.chaosT = 0; g.sim.startEvent(); for (let i = 0; i < 8; i++) g.sim.spawnCustomer(); for (const id of ['pump1', 'pump2', 'pump3', 'carwash']) g.sim.carT[id] = 0; });
    await sleep(4000);
    const busy = await page.evaluate(() => { const g = window.__servo; return { fps: g.renderer.fps, customers: g.sim.customers.length, cars: g.sim.cars.length, seagulls: g.sim.seagulls.length, event: g.sim.event, staff: Object.keys(g.sim.staff) }; });
    await page.screenshot({ path: path.join(OUT, `${vp.name}-06-fullservo.png`) });
    // night, bin chicken raid and a road train
    await page.evaluate(() => { const s = window.__servo.sim; s.time = 205; s.event = null; s.seagulls.length = 0; s.piles.pump1 = 180; s.piles.counter = 90; const pick = s.rng.pick; s.rng.pick = a => a.includes('ibis') ? 'ibis' : a[0]; s.startEvent(); s.rng.pick = pick;
      const r = s.rng.next; let k = 0; s.rng.next = () => (k++ === 1 ? 0.01 : r.call(s.rng)); s.cars = s.cars.filter(c => c.station !== 'pump2'); s.spawnCar('pump2'); s.rng.next = r; });
    await sleep(3500);
    const night = await page.evaluate(() => { const g = window.__servo; return { night: g.renderer.night, ibis: g.sim.ibises.length, event: g.sim.event, roadTrains: g.sim.cars.filter(c => c.kind === 'roadtrain').length, fps: g.renderer.fps, sign: g.renderer.servoName }; });
    await page.screenshot({ path: path.join(OUT, `${vp.name}-06b-night-ibis.png`) });
    // 5) welcome back screen (simulate 90 minutes away) and map complete flow
    await page.evaluate(() => { window.__servo.handleReturn(90 * 60); }); await sleep(1800); await page.screenshot({ path: path.join(OUT, `${vp.name}-07-welcome.png`) });
    const welcomeShown = await page.evaluate(() => document.getElementById('welcome').classList.contains('open'));
    await page.click('#btnDouble'); await sleep(300);
    await page.evaluate(() => { window.__servo.sim.cash = 12000; window.__servo.bot = true; });
    let complete = { open: false, all: false }; for (let i = 0; i < 45 && !complete.open; i++) { await sleep(1000); if (await page.evaluate(() => document.getElementById('postcard').classList.contains('open'))) { await page.screenshot({ path: path.join(OUT, `${vp.name}-08b-postcard.png`) }); await page.click('#btnClosePc'); } complete = await page.evaluate(() => ({ open: document.getElementById('complete').classList.contains('open'), all: window.__servo.sim.allBuilt() })); }
    await page.screenshot({ path: path.join(OUT, `${vp.name}-08-complete.png`) });
    const postcardSeen = await page.evaluate(() => !!localStorage.getItem('servoEmpire.postcard.outback'));
    if (complete.open) { await page.click('#btnCompleteClose'); await sleep(200); }
    const finalEvents = await page.evaluate(() => window.__servo.analytics.buffer.map(e => e.event + ' ' + JSON.stringify(e.props)));
    // 5b) Servo #2: travel to the Nullarbor and play its scenes
    if (complete.open) { await page.click('#btnCompleteClose').catch(() => {}); }
    await page.evaluate(() => { for (const m of document.querySelectorAll('.modal.open')) m.classList.remove('open'); });
    await page.evaluate(() => { const s = window.__servo.sim; s.flags.mapComplete = true; s.world.unlocked.nullarbor = true; window.__servo.bot = false; window.__servo.startTravel('nullarbor'); });
    await sleep(1400); await page.screenshot({ path: path.join(OUT, `${vp.name}-10-roadtrip.png`) }); await sleep(2600);
    const nb = await page.evaluate(() => ({ servo: ServoEmpire.SERVO.id, crewWalk: window.__servo.sim.upgrades.walk, net: Math.round(window.__servo.sim.networkRate() * 60) }));
    await page.evaluate(() => { window.__servo.bot = true; }); await sleep(15000); await page.screenshot({ path: path.join(OUT, `${vp.name}-11-nullarbor-start.png`) });
    await page.evaluate(() => { const g = window.__servo, s = g.sim; g.bot = false; const d = s.toJSON(); for (const id of ['pump1', 'pie', 'counter', 'depot', 'pump2', 'choc', 'office', 'trev', 'val', 'mechanic', 'gav', 'dimsim']) d.built[id] = true; d.cash = 5000; d.player = { x: 3.6, y: 3.8 }; g.loadData(d); s.time = 210; s.chaosT = 1e9; s.carT.mechanic = 0; for (let i = 0; i < 6; i++) s.spawnCustomer(); s.floorThongs.push({ x: 8.4, y: 7.3, t: 0 }); });
    await sleep(4000); await page.screenshot({ path: path.join(OUT, `${vp.name}-12-nullarbor-night.png`) });
    await page.evaluate(() => { const s = window.__servo.sim; s.time = 30; const p = s.rng.pick; s.rng.pick = a => a.includes('pricewar') ? 'pricewar' : p.call(s.rng, a); s.startEvent(); s.rng.pick = p; window.__servo.bot = true; });
    await sleep(4500); await page.screenshot({ path: path.join(OUT, `${vp.name}-13-pricewar.png`) });
    const pw = await page.evaluate(() => ({ event: window.__servo.sim.event, share: window.__servo.sim.share }));
    await page.evaluate(() => { window.__servo.bot = false; window.__servo.sim.world.thongs = { black: 3, gold: 1, footy: 1 }; window.__servo.ui.openNetwork(); }); await sleep(1200); await page.screenshot({ path: path.join(OUT, `${vp.name}-14-network.png`) });
    await page.evaluate(() => window.__servo.ui.close('network'));
    // 6) refresh keeps the save
    await page.reload(); await sleep(400); await page.click('#btnStart'); await sleep(300);
    const afterReload = await page.evaluate(() => ({ servo: ServoEmpire.SERVO.id, built: Object.keys(window.__servo.sim.built).length, parked: Object.keys(window.__servo.sim.world.others), cash: Math.round(window.__servo.sim.cash) }));
    report.viewports.push({ ...vp, postcardSeen, nb, pw, handShown, night, moved, state, busy, welcomeShown, complete, afterReload, errors, finalEvents: finalEvents.slice(-12) });
    report.errors.push(...errors.map(e => vp.name + ': ' + e));
    await ctx.close();
  }
  // throttled-CPU phone pass: the closest stand-in for a mid-range phone available here (not a real device)
  { const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(URL); await sleep(300); await page.click('#btnStart'); await sleep(300);
    const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const runScene = async (label, ...setups) => { for (const fn of setups) await page.evaluate(fn); await sleep(2500); const f = []; for (let i = 0; i < 5; i++) { await sleep(1000); f.push(await page.evaluate(() => window.__servo.renderer.fps)); } const ents = await page.evaluate(() => { const s = window.__servo.sim; return s.customers.length + s.cars.length + Object.keys(s.staff).length + s.ibises.length + s.seagulls.length + 1; }); return { label, fps: f, min: Math.min(...f), avg: f.reduce((a, b) => a + b, 0) / f.length, entities: ents }; };
    const full = () => { const g = window.__servo; const d = g.sim.toJSON(); for (const id of ServoEmpire.ORDER) d.built[id] = true; d.cash = 50000; d.upgrades = { walk: 3, carry: 3, station: 4, price: 4, staff: 4 }; d.player = { x: 5.5, y: 9.5 }; g.loadData(d); g.bot = true; g.sim.event = 'rush'; g.sim.eventT = 999; for (let i = 0; i < 8; i++) g.sim.spawnCustomer(); };
    const day = await runScene('full servo, rush, day', full, () => { window.__servo.sim.time = 10; });
    const nightScene = await runScene('full servo, rush, night', () => { window.__servo.sim.time = 205; });
    const nbScene = await runScene('Nullarbor full, night, convoy', () => { const g = window.__servo, s = g.sim; const d = s.toJSON(); d.unlocked.nullarbor = true; g.loadData(d); s.travel('nullarbor'); for (const id of ServoEmpire.ORDER) s.build(id); s.fx.length = 0; g.renderer.onServoChange(); s.fuel = 60; s.time = 210; s.event = 'rush'; s.eventT = 999; for (let i = 0; i < 8; i++) s.spawnCustomer(); });
    await page.screenshot({ path: path.join(OUT, 'phone-15-nullarbor-throttled.png') });
    const forceEv = k => { const s = window.__servo.sim; s.event = null; const p = s.rng.pick; s.rng.pick = a => (a.includes(k) ? k : p.call(s.rng, a)); s.startEvent(); s.rng.pick = p; };
    const ufoScene = await runScene('UFO full, night, aliens + abduction beam', () => { const g = window.__servo, s = g.sim; s.world.unlocked.ufo = true; s.travel('ufo'); for (const id of ServoEmpire.ORDER) s.build(id); s.fx.length = 0; g.renderer.onServoChange(); s.time = 200; s.piles.pump2 = 900; s.player.x = 7; s.player.y = 12; for (let i = 0; i < 6; i++) s.spawnCustomer(true); }, '(' + forceEv.toString() + ')("abduct")');
    await page.screenshot({ path: path.join(OUT, 'phone-16-ufo-night-beam.png') });
    const meteorScene = await runScene('UFO full, day, meteor shower', () => { const s = window.__servo.sim; s.beam = null; s.time = 30; s.player.x = 4.5; s.player.y = 10; }, '(' + forceEv.toString() + ')("meteors")');
    await page.screenshot({ path: path.join(OUT, 'phone-17-ufo-meteors.png') });
    const dugScene = await runScene('Dugout full, day, dust storm', () => { const g = window.__servo, s = g.sim; s.event = null; s.meteors.length = 0; s.world.unlocked.dugout = true; s.travel('dugout'); for (const id of ServoEmpire.ORDER) s.build(id); s.fx.length = 0; g.renderer.onServoChange(); s.time = 30; s.player.x = 5.5; s.player.y = 14; s.rockTray = 8; s.cutter.q = 8; }, '(' + forceEv.toString() + ')("duststorm")');
    await page.screenshot({ path: path.join(OUT, 'phone-18-dugout-storm.png') });
    const shaftScene = await runScene('Dugout full, night, mine shaft', () => { const s = window.__servo.sim; s.event = null; for (const k in s.dusty) s.dusty[k] = false; s.time = 215; }, '(' + forceEv.toString() + ')("shaft")');
    await page.screenshot({ path: path.join(OUT, 'phone-19-dugout-night-shaft.png') });
    report.throttled = { rate: 4, dpr: 2, scenes: [day, nightScene, nbScene, ufoScene, meteorScene, dugScene, shaftScene], errors }; report.errors.push(...errors.map(e => 'throttled: ' + e)); await ctx.close(); }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'browser-report.json'), JSON.stringify(report, null, 2));
  for (const v of report.viewports) { console.log(`\n== ${v.name} ${v.width}x${v.height}`); console.log(' input moved player:', v.moved); console.log(' after 60s:', JSON.stringify(v.state)); console.log(' busy scene:', JSON.stringify(v.busy)); console.log(' nullarbor:', JSON.stringify(v.nb), ' price war:', JSON.stringify(v.pw)); console.log(' tutorial hand:', v.handShown, ' night/ibis/roadtrain:', JSON.stringify(v.night)); console.log(' welcome shown:', v.welcomeShown, ' complete:', JSON.stringify(v.complete), ' after reload:', JSON.stringify(v.afterReload)); console.log(' errors:', v.errors.length ? v.errors : 'none'); }
  console.log('\n== 4x CPU throttle, 390x844 @2x'); for (const sc of report.throttled.scenes) console.log(' ' + sc.label + ': fps ' + sc.fps.join(',') + ' (min ' + sc.min + ', avg ' + sc.avg.toFixed(0) + ') entities ' + sc.entities);
  const fail = report.errors.length > 0 || report.viewports.some(v => !v.moved || !v.welcomeShown || !v.complete.open || !v.postcardSeen || v.nb.servo !== 'nullarbor' || v.afterReload.servo !== 'nullarbor' || !v.afterReload.parked.includes('outback'));
  console.log(fail ? '\nRELEASE CHECK: FAIL' : '\nRELEASE CHECK: PASS'); server.close(); process.exit(fail ? 1 : 0);
}
run().catch(e => { console.error(e); process.exit(1); });
