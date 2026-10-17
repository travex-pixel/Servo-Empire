# Servo Empire 0.1.0 — Test Report

Date: 2026-10-17. Build: `index.html` (single file, ~118 KB). Tooling: Node 22, Playwright 1.56 + headless Chromium (SwiftShader software GL), ESLint 10.

## Summary

| Check | Result |
|---|---|
| Headless suite `node tests/sim.test.js` (31 checks) | **PASS** |
| Browser release check `node tests/browser.test.js` (390x844 phone, 1440x900 desktop) | **PASS, 0 console errors, 0 page errors** |
| Lint (no-undef, no-use-before-define, no-redeclare, no-dupe-keys) | **0 errors** (6 unused catch-variable warnings) |

The headless suite runs the exact `<script>` shipped in `index.html` inside a Node vm with `SERVO_HEADLESS` set, so the economy, offline model, saves and pathing are tested on the real code, not a copy.


## Economy simulation (60 Hz fixed step, 15 pads)

| bot | seed | finished | total min | first unlock | longest idle | unlocks in 10 min | longest gap (min) | lost sales |
|---|---|---|---|---|---|---|---|---|
| efficient | 7 | yes | 36.3 | 2.6 s | 5 s @ 0.1 m | 7 | 5.0 | 29 |
| efficient | 21 | yes | 36.7 | 2.6 s | 5 s @ 0.1 m | 8 | 5.1 | 38 |
| efficient | 99 | yes | 35.3 | 2.6 s | 5 s @ 0.1 m | 8 | 4.8 | 29 |
| lazy | 7 | yes | 34.3 | 5.0 s | 5 s @ 0.2 m | 8 | 6.4 | 33 |
| lazy | 21 | yes | 35.7 | 8.1 s | 5 s @ 0.2 m | 8 | 7.4 | 36 |
| lazy | 99 | yes | 34.0 | 8.3 s | 6 s @ 0.4 m | 8 | 6.4 | 27 |

Time to each unlock (minutes), efficient seed 7 vs lazy seed 7:

| # | pad | efficient | lazy |
|---|---|---|---|
| 1 | Fuel Pump 1 | 0.0 | 0.1 |
| 2 | Pie Warmer | 0.4 | 0.5 |
| 3 | Front Counter | 0.8 | 1.0 |
| 4 | Coffee Machine | 2.8 | 3.0 |
| 5 | Fuel Pump 2 | 2.2 | 2.3 |
| 6 | Back Office | 4.1 | 3.9 |
| 7 | Hire Gav | 6.0 | 5.5 |
| 8 | Hire Aunty Val | 10.1 | 8.1 |
| 9 | Sausage Roll Oven | 13.4 | 10.9 |
| 10 | Fuel Pump 3 | 16.0 | 14.9 |
| 11 | Hire Shazza | 21.0 | 17.8 |
| 12 | Highway Billboard | 26.5 | 24.6 |
| 13 | Second Till | 23.8 | 22.3 |
| 14 | Car Wash | 31.3 | 31.0 |
| 15 | The Big Pie | 36.3 | 34.3 |

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
| mid game (8 pads, Gav+Val) | 290 | $2.9K | $34.8K | $34.8K | true |
  ✔ offline: mid game (8 pads, Gav+Val) 3 days == 2 h (cap) and 10 min < 2 h
| full servo, no upgrades | 1215 | $12.2K | $146K | $146K | true |
  ✔ offline: full servo, no upgrades 3 days == 2 h (cap) and 10 min < 2 h
| full servo, mid upgrades | 2545 | $25.5K | $305K | $305K | true |
  ✔ offline: full servo, mid upgrades 3 days == 2 h (cap) and 10 min < 2 h
  ✔ offline: negative / NaN time pays nothing (clock tricks)
  ✔ offline: fresh game with no stations earns nothing
   measured $/s 52.4 vs formula 53.0 ratio 1.01
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

## Misc
  ✔ fmt formats big numbers
  ✔ at least 30 original speech lines, 35+ clean
  ✔ pathfinder reaches every queue slot and every station interact point from the spawn
  ✔ building the Second Till never traps the player behind the counter
  ✔ object pool recycles

ALL HEADLESS TESTS PASSED

### How the bots work
- **Efficient**: always walks to `Sim.nextGoal()` (the same target the in-game guide arrow shows) via the pathfinder; after the Back Office opens it buys any upgrade under 30% of the next pad's remaining cost, income upgrades first once staff are hired.
- **Lazy**: same targets, but 60% of goal changes are followed by a 2-6 s dawdle, and upgrades are bought rarely.
- "Idle" = ticks where the goal is "save up" or "done" (nothing to carry, collect, serve or build). Walking to the next pad while saving counts as idle, so the figure is conservative.

### Balance targets vs result
| Target | Result |
|---|---|
| First unlock within 20 s | 2.6-8.3 s |
| New unlock every 60-90 s for the first 10 min | 7-8 unlocks in 10 min (avg 75-85 s). Gaps of ~2-3 min appear from pad 6-7 onward, a bit earlier than the brief's "after 10 minutes". |
| Later unlocks every 2-4 min | Mostly 3-5 min; the longest single gap was 7.8 min (Car Wash, one seed). **Partly missed.** |
| Whole map in 30-45 min active | 34-37 min across 6 runs |
| No dead stretch over 45 s | 5-6 s max |

## Browser release check (Playwright)

Per viewport the script: loads the page, taps OPEN UP, moves the player with real input (pointer-drag joystick on phone, WASD/arrows on desktop), hands control to the in-page bot for the rest of 60 s, opens Settings, injects a full servo with all staff plus a chaos event and 8 queued customers, simulates 90 minutes away, taps DOUBLE IT, lets the bot build the last pad, taps OPEN SERVO #2, reloads and checks the save. Any `console.error` or uncaught exception fails the run.

| | Phone 390x844 @3x | Desktop 1440x900 |
|---|---|---|
| Joystick / keys move the player | yes | yes |
| Unlocks after 60 s of bot play | 3 (pump, pie warmer, counter) | 3 |
| Save present and restored after reload | yes, 15/15 stations | yes, 15/15 |
| Welcome-back screen after simulated 90 min | shown, count-up, double worked | shown |
| Map-complete screen + Servo #2 tap logged | yes | yes |
| Render fps, early game | 60 | 61 |
| Render fps, full servo busy scene (8 customers, 5 cars, 3 staff, 3 seagulls, event) | 50 (software GL at DPR 3; the game caps DPR at 2 on real devices) | 61 |
| Console errors | none | none |

Screenshots: `docs/screenshots/` (splash, start, 20 s, 45 s, 60 s, settings, full servo, welcome back, complete, for both sizes). I looked at them and fixed what they showed: phone zoom was too tight (now ~9.5 tiles wide), guide labels overlapped pad price tags, cars overlapped in the arrival lane, HUD goal text truncated.

Analytics events observed in `__servo.analytics.buffer` during the browser run: `session_start`, `unlock_bought` x15, `staff_hired` x3, `chaos_event_seen`, `offline_return`, `double_offline_tapped`, `map_complete`, `servo2_tapped`. `upgrade_bought` is covered by the headless analytics check (the browser bot doesn't shop).

## Bugs found and fixed during testing
1. Player embedded in a station tile the moment it was built (couldn't move). Fixed with an unstick-on-build.
2. Offline formula paid ~2x more than active play late game (ignored one-car-per-pump and queue throughput). Reworked; now within 1-15% of measured automated income at 7 stages.
3. Car spawn timer reset while the pump was busy, starving pumps at high traffic. Timer now pends until the pump is free.
4. Walking past the Back Office popped the upgrade board open every time. Now requires standing still at the desk for 0.5 s.
5. Guide arrow flip-flopped between "drop at counter" and "build pad" each time Val freed one shelf slot. Fixed with priority + hysteresis.
6. Deadlock: hands full of pies, shelf full of pies, queue full of coffee drinkers. Customers now want what is on the shelf more often, and the carry goal always exists when any slot is free.
7. **Building the Second Till walled the player in behind the counter for good.** Every build now checks that the player, customers and staff can still reach the forecourt and relocates anyone trapped. Regression test added.
8. Negative cash from a tampered save was loaded as-is. Clamped.

## Not tested (honest list)
- **Real phones.** No iPhone 11 / Pixel 6a was available. Frame rate, touch feel, haptics (`navigator.vibrate` is Android-only anyway), audio unlock on iOS Safari and the `visibilitychange`/sleep path were not exercised on hardware. The fps numbers above come from a software renderer and are indicative only.
- **Real offline time.** The 2-hour cap and payouts were verified by simulation (10 min, 2 h, 3 days, negative, NaN) and by calling the return handler with a fake gap, not by leaving a device closed for hours.
- **PostHog delivery.** With the placeholder key the loader never runs, by design. Loading, `init`, opt-out and property delivery against a live project are untested.
- **Audio quality.** Web Audio code runs without errors in headless Chromium but nobody listened to it. Music loop and mix levels need ears.
- **Long sessions.** Longest continuous browser run was ~2.5 minutes; memory over an hour of play is unmeasured (pools are used for popups, cash, confetti and sparks; customers/cars are plain arrays capped at 30/16).
- **Accessibility.** No screen-reader or colour-blind pass. Customer wants rely on item shape + a red "!" when out of stock, not colour alone, but this was not formally checked.
- Localisation, RTL, and browsers other than Chromium.
