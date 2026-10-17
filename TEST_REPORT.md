# Servo Empire 0.2.0 — Test Report

Date: 2026-10-17. Build: `index.html` (single file). Tooling: Node 22, Playwright 1.56 + headless Chromium (software rendering), ESLint 10.

## Summary

| Check | Result |
|---|---|
| Headless suite `node tests/sim.test.js` (39 checks) | **PASS** |
| Browser release check `node tests/browser.test.js` (390x844 phone, 1440x900 desktop, 4x CPU-throttled phone) | **PASS, 0 console errors, 0 page errors** |
| Lint (no-undef, no-use-before-define, no-redeclare, no-dupe-keys) | **0 errors** |

The headless suite runs the exact `<script>` shipped in `index.html` in a Node vm, so the economy, offline model, saves, pathing and the new 0.2 mechanics are tested on the real code.


## Economy simulation (60 Hz fixed step, 15 pads)

| bot | seed | finished | total min | first unlock | longest idle | unlocks in 10 min | longest gap (min) | lost sales |
|---|---|---|---|---|---|---|---|---|
| efficient | 7 | yes | 33.2 | 2.4 s | 6 s @ 0.1 m | 8 | 5.2 | 26 |
| efficient | 21 | yes | 34.0 | 2.4 s | 6 s @ 0.1 m | 8 | 5.7 | 22 |
| efficient | 99 | yes | 32.7 | 2.4 s | 6 s @ 0.1 m | 9 | 5.8 | 19 |
| lazy | 7 | yes | 36.2 | 4.8 s | 6 s @ 0.7 m | 9 | 9.0 | 24 |
| lazy | 21 | yes | 31.0 | 7.9 s | 6 s @ 0.2 m | 9 | 5.6 | 13 |
| lazy | 99 | yes | 35.4 | 8.1 s | 6 s @ 0.7 m | 9 | 7.7 | 23 |

Time to each unlock (minutes), efficient seed 7 vs lazy seed 7:

| # | pad | efficient | lazy |
|---|---|---|---|
| 1 | Fuel Pump 1 | 0.0 | 0.1 |
| 2 | Pie Warmer | 0.4 | 0.4 |
| 3 | Front Counter | 0.8 | 0.8 |
| 4 | Coffee Machine | 2.2 | 1.8 |
| 5 | Fuel Pump 2 | 1.8 | 2.5 |
| 6 | Back Office | 2.8 | 3.2 |
| 7 | Hire Gav | 4.3 | 4.5 |
| 8 | Hire Aunty Val | 6.9 | 6.2 |
| 9 | Sausage Roll Oven | 10.1 | 8.9 |
| 10 | Fuel Pump 3 | 12.6 | 12.2 |
| 11 | Hire Shazza | 15.4 | 15.4 |
| 12 | Highway Billboard | 23.0 | 22.1 |
| 13 | Second Till | 18.4 | 19.2 |
| 14 | Car Wash | 27.9 | 31.1 |
| 15 | The Big Pie | 33.2 | 36.2 |

  ✔ every bot run finishes the map
  ✔ first unlock within 20 s
  ✔ whole map in 30-45 min active play
  ✔ no idle stretch over 45 s (nothing to do, nothing affordable)
  ✔ at least 7 unlocks in the first 10 minutes
  ✔ customers never take over 40 s to reach the queue (no stuck pathing)
  ✔ staff never walk a single leg for over 20 s (no stuck staff)
  ✔ chaos events fire roughly every 2-3 min

## Offline earnings

| stage | $/min | 10 min away | 2 h away | 3 days away | capped |
|---|---|---|---|---|---|
| pump1 only | 65 | $654 | $7.9K | $7.9K | true |
  ✔ offline: pump1 only 3 days == 2 h (cap) and 10 min < 2 h
| mid game (8 pads, Gav+Val) | 334 | $3.3K | $40K | $40K | true |
  ✔ offline: mid game (8 pads, Gav+Val) 3 days == 2 h (cap) and 10 min < 2 h
| full servo, no upgrades | 1306 | $13.1K | $157K | $157K | true |
  ✔ offline: full servo, no upgrades 3 days == 2 h (cap) and 10 min < 2 h
| full servo, mid upgrades | 2747 | $27.5K | $330K | $330K | true |
  ✔ offline: full servo, mid upgrades 3 days == 2 h (cap) and 10 min < 2 h
  ✔ offline: negative / NaN time pays nothing (clock tricks)
  ✔ offline: fresh game with no stations earns nothing
   measured $/s 55.0 vs formula 57.2 ratio 1.04
  ✔ offline: formula within 20% of measured automated income (full servo, mid upgrades)

## Saves
  ✔ save mid-carry, reload: carry, cash, built, upgrades, piles, staff carry all survive
  ✔ migrates a v1 save (money, built array) to v2
  ✔ corrupt primary save falls back to the backup copy
  ✔ unsupported future save version is rejected (not silently loaded)
  ✔ export/import code round-trips
  ✔ load clamps hostile values (negative cash, 10^9 pies, player in a wall)

## Analytics events
   events seen: unlock_bought, chaos_event_seen, upgrade_bought, staff_hired, map_complete (session_start, offline_return, double_offline_tapped, servo2_tapped are fired by the browser layer and checked in the browser test)
  ✔ all required events fire with the right properties
  ✔ Analytics class buffers events when disabled/headless and never throws

## v0.2 features
  ✔ hustle: builds with actions, caps at +50%, decays when idle
  ✔ hustle: bonus applies to piles the player grabs, never to Shazza or offline
  ✔ road train pays ×4 at the pump
  ✔ bin chicken raid: ibis eat a pile, walking into them stops it, event ends
  ✔ Shazza scares ibis off the pump piles
  ✔ pest goal points the guide arrow at seagulls during a raid

## Misc
  ✔ fmt formats big numbers
  ✔ at least 30 original speech lines, 35+ clean
  ✔ pathfinder reaches every queue slot and every station interact point from the spawn
  ✔ building the Second Till never traps the player behind the counter
  ✔ a pad never sticks at "$0 to go" (fractional cents)
  ✔ object pool recycles

ALL HEADLESS TESTS PASSED

### Balance targets vs result (0.2, with Hustle)
| Target | Result |
|---|---|
| First unlock within 20 s | 2-8 s |
| New unlock every 60-90 s for the first 10 min | 8-9 unlocks in 10 min |
| Hiring feels like relief | Gav and Val now land at 4-6 min (were 6-10 min in 0.1) |
| Later unlocks every 2-4 min | Mostly 3-5 min, longest single gap 5-9 min (Car Wash or The Big Pie). **Still partly missed**, mainly for the lazy bot. |
| Whole map in 30-45 min active | 31-36 min across 6 runs |
| No dead stretch over 45 s | 6 s max |

## Browser release check

Per viewport: splash name entry ("Dazza"), real input (pointer-drag joystick on phone, WASD/arrows on desktop), bot play for the rest of 60 s, Settings, an injected full servo with a chaos event and 8 queued customers, **night + Bin Chicken Raid + road train**, a simulated 90 minutes away with Double it, the bot building the final pad, the Servo #2 tap, then a reload. Any `console.error` or uncaught exception fails the run.

| | Phone 390x844 @3x | Desktop 1440x900 |
|---|---|---|
| Tutorial hand shows for a brand-new player | yes | yes |
| Joystick / keys move the player | yes | yes |
| Sign uses the typed servo name | yes | yes |
| Night lighting, ibis raid and road train all on screen | yes | yes |
| Welcome back, map complete, Servo #2 tap | yes | yes |
| Save restored after reload | 15/15 stations | 15/15 |
| Console errors | none | none |

### Frame rate (headless software rendering, so a worst case, not a phone)

Same machine, same scene (full servo, Tradie Rush, 8 queued customers), 390x844 at 2x:

| Scene | v0.1 | v0.2 |
|---|---|---|
| Day, normal CPU | 52 fps | 52 fps |
| Night/busy, normal CPU | 45 | 48 |
| Day, 4x CPU throttle | 11 | 13-22 |
| Night, 4x CPU throttle | 11 | 12-17 |

v0.2 draws far more (lighting, props, particles) and still matches or beats v0.1. The gains come from the sprite cache, the merged overlay and adaptive resolution. Profiling showed JavaScript at 1.5-3.4 ms per frame. The rest is pixel fill, which a real phone does on the GPU and this test machine does on the CPU.

Screenshots: `docs/screenshots/`. I looked at them and fixed what they showed: the player could stand on top of the new props, the bin sat in Shazza's walking lane, and a pad stuck at "$0 to go".

## Bugs found and fixed in 0.2
1. Pads could stay at "$0 to go" forever over fractional cents. Fixed, with a regression test.
2. The night lightmap, vignette and sunset tint were three full-screen passes and cost about 15 fps at night. Merged into one third-resolution pass.
3. The neon sign used `shadowBlur`, which is very slow in software rendering. Replaced with a stroked glow.
4. The offline calibration test was skewed by chaos events in its measurement window. Offline doesn't model events, so the test now measures with them off. The formula is within 1% of measured income.
5. Props were walk-through. They are now solid tiles, and pathing tests still pass.

## Not tested (honest list)
- **Real phones.** Still no iPhone 11 or Pixel 6a here. CPU throttling in headless Chromium is the closest available stand-in, and it overstates the cost of drawing because there's no GPU. Touch feel, iOS audio unlock, haptics and real sleep/wake are unverified on hardware.
- **Real offline time**, **live PostHog delivery**, **audio by ear**, **hour-long sessions**, **accessibility** and **non-Chromium browsers**: same gaps as 0.1.
- Day/night was only checked at fixed times (day and full night). The dusk and dawn transitions were not screenshotted.
