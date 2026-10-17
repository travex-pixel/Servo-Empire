// Browser release check: loads index.html in headless Chromium at phone and desktop sizes, plays with simulated
// input, drives the player with the in-page bot, takes screenshots, and FAILS on any console error or page error.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { viewports: [], errors: [] };
  for (const vp of [{ name: 'phone', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }, { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor });
    const page = await ctx.newPage(); const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('[console.error] ' + m.text()); });
    page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
    await page.goto(URL); await sleep(300);
    await page.screenshot({ path: path.join(OUT, `${vp.name}-00-splash.png`) });
    await page.click('#btnStart'); await sleep(300);
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
    // 5) welcome back screen (simulate 90 minutes away) and map complete flow
    await page.evaluate(() => { window.__servo.handleReturn(90 * 60); }); await sleep(1800); await page.screenshot({ path: path.join(OUT, `${vp.name}-07-welcome.png`) });
    const welcomeShown = await page.evaluate(() => document.getElementById('welcome').classList.contains('open'));
    await page.click('#btnDouble'); await sleep(300);
    await page.evaluate(() => { window.__servo.sim.cash = 7000; window.__servo.bot = true; });
    let complete = { open: false, all: false }; for (let i = 0; i < 30 && !complete.open; i++) { await sleep(1000); complete = await page.evaluate(() => ({ open: document.getElementById('complete').classList.contains('open'), all: window.__servo.sim.allBuilt() })); }
    await page.screenshot({ path: path.join(OUT, `${vp.name}-08-complete.png`) });
    if (complete.open) { await page.click('#btnServo2'); await sleep(200); }
    const finalEvents = await page.evaluate(() => window.__servo.analytics.buffer.map(e => e.event + ' ' + JSON.stringify(e.props)));
    // 6) refresh keeps the save
    await page.reload(); await sleep(400); await page.click('#btnStart'); await sleep(300);
    const afterReload = await page.evaluate(() => ({ built: Object.keys(window.__servo.sim.built).length, cash: window.__servo.sim.cash }));
    report.viewports.push({ ...vp, moved, state, busy, welcomeShown, complete, afterReload, errors, finalEvents: finalEvents.slice(-12) });
    report.errors.push(...errors.map(e => vp.name + ': ' + e));
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'browser-report.json'), JSON.stringify(report, null, 2));
  for (const v of report.viewports) { console.log(`\n== ${v.name} ${v.width}x${v.height}`); console.log(' input moved player:', v.moved); console.log(' after 60s:', JSON.stringify(v.state)); console.log(' busy scene:', JSON.stringify(v.busy)); console.log(' welcome shown:', v.welcomeShown, ' complete:', JSON.stringify(v.complete), ' after reload:', JSON.stringify(v.afterReload)); console.log(' errors:', v.errors.length ? v.errors : 'none'); }
  const fail = report.errors.length > 0 || report.viewports.some(v => !v.moved || !v.welcomeShown || !v.complete.open || v.afterReload.built < 15);
  console.log(fail ? '\nRELEASE CHECK: FAIL' : '\nRELEASE CHECK: PASS'); process.exit(fail ? 1 : 0);
}
run().catch(e => { console.error(e); process.exit(1); });
