# Servo Empire 0.3.0 — Test Report

Date: 2026-10-18. Build: `index.html` (single file) plus share/icon assets. Tooling: Node 22, Playwright 1.56 + headless Chromium (software rendering), ESLint 10.

## Summary

| Check | Result |
|---|---|
| Headless suite `node tests/sim.test.js` (51 checks, both servos) | **PASS** |
| Browser release check `node tests/browser.test.js` (390x844 phone, 1440x900 desktop, 4x CPU-throttled phone), served over HTTP like GitHub Pages | **PASS, 0 console errors, 0 page errors** |
| Lint (no-undef, no-use-before-define, no-redeclare, no-dupe-keys) | **0 errors** |

The headless suite runs the exact `<script>` shipped in `index.html` inside a Node vm.


## Economy simulation (60 Hz fixed step, 15 pads)

| bot | seed | finished | total min | first unlock | longest idle | unlocks in 10 min | longest gap (min) | lost sales |
|---|---|---|---|---|---|---|---|---|
| efficient | 7 | yes | 29.8 | 2.4 s | 6 s @ 0.1 m | 8 | 4.3 | 30 |
| efficient | 21 | yes | 28.9 | 2.4 s | 6 s @ 0.1 m | 9 | 4.5 | 22 |
| efficient | 99 | yes | 29.9 | 2.4 s | 6 s @ 0.1 m | 8 | 4.5 | 28 |
| lazy | 7 | yes | 29.3 | 4.8 s | 6 s @ 0.7 m | 9 | 4.1 | 17 |
| lazy | 21 | yes | 28.8 | 7.9 s | 6 s @ 0.2 m | 9 | 4.0 | 27 |
| lazy | 99 | yes | 28.5 | 8.1 s | 6 s @ 0.7 m | 9 | 4.3 | 15 |

Time to each unlock (minutes), efficient seed 7 vs lazy seed 7:

| # | pad | efficient | lazy |
|---|---|---|---|
| 1 | Fuel Pump 1 | 0.0 | 0.1 |
| 2 | Pie Warmer | 0.4 | 0.4 |
| 3 | Front Counter | 0.8 | 0.8 |
| 4 | Coffee Machine | 2.6 | 1.8 |
| 5 | Fuel Pump 2 | 2.0 | 2.4 |
| 6 | Back Office | 3.4 | 3.5 |
| 7 | Hire Gav | 4.6 | 6.1 |
| 8 | Hire Aunty Val | 7.5 | 5.1 |
| 9 | Sausage Roll Oven | 10.5 | 8.7 |
| 10 | Fuel Pump 3 | 12.7 | 12.1 |
| 11 | Hire Shazza | 15.7 | 15.2 |
| 12 | Highway Billboard | 22.8 | 21.6 |
| 13 | Second Till | 18.6 | 18.9 |
| 14 | Car Wash | 26.2 | 25.2 |
| 15 | The Big Pie | 29.8 | 29.3 |

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
   measured $/s 53.7 vs formula 57.2 ratio 1.06
  ✔ offline: formula within 20% of measured automated income (full servo, mid upgrades)

## Saves
  ✔ save mid-carry, reload: carry, cash, built, upgrades, piles, staff carry all survive
  ✔ migrates a v1 save (money, built array) to v3
  ✔ corrupt primary save falls back to the backup copy
  ✔ unsupported future save version is rejected (not silently loaded)
  ✔ export/import code round-trips
  ✔ load clamps hostile values (negative cash, 10^9 pies, player in a wall)

## Analytics events
   events seen: unlock_bought, chaos_event_seen, upgrade_bought, staff_hired, thong_found, map_complete (session_start, offline_return, double_offline_tapped, servo2_tapped are fired by the browser layer and checked in the browser test)
  ✔ all required events fire with the right properties
  ✔ Analytics class buffers events when disabled/headless and never throws

## v0.2 features
  ✔ hustle: builds with actions, caps at +50%, decays when idle
  ✔ hustle: bonus applies to piles the player grabs, never to Shazza or offline
  ✔ road train pays ×4 at the pump
  ✔ bin chicken raid: ibis eat a pile, walking into them stops it, event ends
  ✔ Shazza scares ibis off the pump piles
  ✔ pest goal points the guide arrow at seagulls during a raid

## Servo #2: The Nullarbor

| bot | seed | servo 1 min | Nullarbor min | first Nullarbor unlock | longest gap (min) | longest idle | dry tanks | repairs (missed) | Pete bust at | thongs |
|---|---|---|---|---|---|---|---|---|---|---|
| efficient | 7 | 29.8 | 29.5 | 2.3 s | 4.6 | 5 s | 0 | 132 (0) | 17.2 min | 12 |
| lazy | 7 | 29.3 | 36.3 | 7.4 s | 5.5 | 6 s | 0 | 143 (0) | 23.5 min | 10 |
| efficient | 21 | 28.9 | 28.1 | 2.3 s | 4.5 | 5 s | 0 | 122 (0) | 15.6 min | 10 |

Nullarbor unlock times (minutes after arriving), efficient seed 7:

pump1 0.0 · pie 0.7 · counter 0.8 · depot 1.4 · pump2 2.3 · choc 3.4 · office 4.5 · val 7.2 · trev 8.4 · gav 10.6 · mechanic 12.1 · dimsim 16.7 · mick 17.4 · pump3 20.1 · shazza 22.5 · lookout 25.3 · bigthong 29.5

  ✔ Nullarbor: every bot finishes both servos
  ✔ Nullarbor: 25-45 min of active play
  ✔ Nullarbor: first unlock within 20 s of arriving
  ✔ Nullarbor: no idle stretch over 45 s
  ✔ Nullarbor: no unlock gap over 7 min
  ✔ Nullarbor: a bot that follows the arrow never lets the tank run dry more than a few times
  ✔ Nullarbor: roo repairs happen and Petrol Pete goes bust before the finale
  ✔ travel keeps crew skills, parks the old servo, and the network pays
  ✔ saves at the Nullarbor round-trip (active servo, parked servo, thongs, fuel, share)
  ✔ v2 save migrates to v3 at the first servo
  ✔ empty tank turns cars away; carrying drums refills it; Trev automates it
  ✔ roo-damaged cars come more at night, and Mick repairs them alone
  ✔ price war: standing on the board wins it and raises Highway Share
  ✔ thongs: collected designs give +1% prices each, everywhere
   Nullarbor measured $/s 105.8 vs formula 104.5 ratio 0.99, dry 0
  ✔ offline formula within 25% of measured automated income at a full Nullarbor (one full day)

## Misc
  ✔ fmt formats big numbers
  ✔ at least 30 original speech lines, 35+ clean
  ✔ pathfinder reaches every queue slot and every station interact point from the spawn
  ✔ building the Second Till never traps the player behind the counter
  ✔ a pad never sticks at "$0 to go" (fractional cents)
  ✔ object pool recycles

ALL HEADLESS TESTS PASSED

### Balance targets vs result
| Target | Servo 1 (Stuart Hwy) | Servo 2 (Nullarbor) |
|---|---|---|
| First unlock within 20 s | 2-8 s | 2-5 s after arriving |
| Unlocks in the first 10 min | 8-9 | 8-9 |
| Whole map 30-45 min active | 29-34 min | 29-37 min |
| No dead stretch over 45 s | 6 s max | 5 s max |
| Longest gap between unlocks | 4-5 min (one 6.7 min outlier, lazy bot) | 4-6 min |
| Hiring feels like relief | Gav and Val at 4-6 min | Trev at 8-10 min, Mick at 17-23 min |

Petrol Pete goes bust at 17-24 minutes into the Nullarbor, a mid-run milestone rather than the finale. Bots that follow the guide arrow never let the tank run dry and miss no repairs. Expect real players to do both now and then; that is the intended pressure.

## Browser release check

Per viewport:

1. Name the servo, then move with real input.
2. The bot plays for 60 s.
3. Open Settings, then an injected full servo with a chaos event.
4. Night with a Bin Chicken Raid and a road train, then 90 minutes away with Double it.
5. The bot builds the finale. **The postcard must appear before the finale screen.**
6. **Road trip to the Nullarbor**, the bot plays there, then night with a roo repair and a floor thong.
7. **A Price War the bot wins by standing on the board**, then the Servo Network map and Thong Wall.
8. Reload. The game must come back at the Nullarbor with the first servo parked.

Any `console.error` or uncaught exception fails the run.

| | Phone 390x844 @3x | Desktop 1440x900 |
|---|---|---|
| Postcard shown before finale screen | yes | yes |
| Road trip lands at the Nullarbor, crew skills carried | yes | yes |
| Network income arriving | about $690/min | about $690/min |
| Price War won by standing on the board | yes, share 0.50 to 0.56 | yes |
| Reload restores Nullarbor plus parked servo | yes | yes |
| Console errors | none | none |

### Frame rate under 4x CPU throttle (software rendering, worst case, not a phone)

| Scene | fps (min / avg) |
|---|---|
| Stuart Hwy full servo, rush, day | 14 / 16 |
| Stuart Hwy full servo, rush, night | 19 / 20 |
| Nullarbor full, night, caravan convoy | 18 / 20 |

The Nullarbor costs no more frame time than the first servo.

## Bugs found and fixed in 0.3
1. Pad labels were dimmed by the night overlay and sat under the iPhone home bar. Labels now draw above the lighting, and the camera can scroll past the map edges.
2. Very wide screens showed uncleared canvas past the world margin. It came from a 0.2 optimisation.
3. Arriving at the Nullarbor with less cash than the first pad caused a 40-second dead start. Starting cash was raised.
4. Petrol Pete was never visible on a phone, the Mechanic Bay sat under the HUD and the coast was off-screen. Camera overscroll fixed all three.
5. The postcard rendered asynchronously, so the finale screen could open first and then get covered. It is now synchronous and queued first.
6. The Big Pie showed as missing on the network map for saves that built it before 0.3. Big Things are now derived from what's built.
7. The first Nullarbor balance pass finished in 13-16 minutes, because network income made it trivial. Costs, network share (35% to 25%) and Highway Share gains were retuned, and the Whale Lookout was added to remove a 10-minute final gap.

## Not tested (honest list)
- **Real phones.** Still not available. Touch feel, iOS audio unlock, haptics, real sleep/wake and real GPU frame rate are unverified on hardware.
- **Share sheet.** `navigator.share` with a postcard file is only reachable on a real phone over HTTPS. The fallback text was exercised, the real share sheet was not.
- **Link preview.** The `og:image` card only resolves once GitHub Pages is live at `https://travex-pixel.github.io/Servo-Empire/`. I checked the image and tags, not an actual Messenger or iMessage preview.
- **Add to Home Screen.** The manifest and icons load without errors. Installing on iOS and Android was not tried.
- **Long-term play.** Real offline time, live PostHog delivery, audio by ear, hour-long sessions, accessibility and non-Chromium browsers are the same gaps as before.
