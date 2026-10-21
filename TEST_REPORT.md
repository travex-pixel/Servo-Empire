# Servo Empire 0.4.0 — Test Report

Date: 2026-10-21. Build: `index.html` (single file) plus share/icon assets. Tooling: Node 22, Playwright 1.56 with headless Chromium (software rendering), ESLint 9.

## Summary

| Check | Result |
|---|---|
| Headless economy suite `node tests/sim.test.js` (61 checks, all 4 servos, 3 full campaigns) | **PASS** |
| New mechanics `node tests/servos.test.js` (25 checks) | **PASS** |
| Click audit `node tests/clicks.test.js` (49 controls and flows) | **PASS**, 0 console errors |
| Browser release check `node tests/browser.test.js` (phone 390x844, desktop 1440x900, 4x CPU-throttled phone), served over HTTP like GitHub Pages | **PASS**, 0 console errors, 0 page errors |
| Lint (no-undef, no-use-before-define, no-redeclare, no-dupe-keys) | **0 errors** (12 unused-variable warnings, mostly unused catch bindings) |

The headless suites run the exact `<script>` shipped in `index.html` inside a Node vm.

## Balance targets vs result

Three full campaigns (efficient bot seeds 7 and 21, lazy bot seed 7) play all four servos back to back, plus six single-servo runs of the first servo.

| Target | Stuart Hwy | Nullarbor | UFO Roadhouse | Opal Dugout |
|---|---|---|---|---|
| Active play per servo | 18.7-23.3 min | 26.9-31.0 min | 27.6-35.3 min | 21.2-24.8 min |
| First unlock (after arriving) | 2-8 s | 2 s | 2-8 s | 2-6 s |
| Longest gap between unlocks (limit 7-7.5 min) | 3.8 min | 5.1 min | 7.3 min | 7.1 min |
| Longest stretch with nothing to do (limit 45 s) | 6 s | 4 s | 4 s | 6 s |
| Signature mechanic used by the bots | shift goals, hustle | 101-133 roo repairs, Pete bust at 16-20 min | 150-249 aliens served, 3-4 beams broken, 18-30 meteors | 496-548 opals, 2-12 black opals, 2-4 tourists rescued |

The whole campaign takes 98-110 minutes of active play for the bots. Real players are slower than the efficient bot, so expect roughly two to three hours.

The first servo is faster than in 0.3 (about 21 minutes instead of 29) because shift goals, milestones and mystery shoppers pay out on top of normal income. That is deliberate: more early wins, then the later servos stretch out.

## Click audit

Every button, toggle, slider, modal and gesture, tapped in a 390x844 phone browser. Each row checks the state change, not just that the tap landed.

| control | action | expected | result |
|---|---|---|---|
| splash | first visit | one CTA, no form fields, no continue card | ✔ |
| #btnStart | tap | splash closes, loop running | ✔ |
| #namePrompt | build the Front Counter | name prompt opens ~2 s later | ✔ |
| #nameIn | type "Dazza" + Enter | prompt closes, sign uses name, saved | ✔ |
| #namePrompt | build again | never asks twice | ✔ |
| #btnNameSkip | tap | prompt closes, name unchanged | ✔ |
| #btnNameOk | type "Dazza" + tap PAINT THE SIGN | prompt closes, sign uses name | ✔ |
| #shiftPill | tap | shift card opens with 3 goals and the Brag Board | ✔ |
| #btnCloseShift | tap | shift card closes | ✔ |
| canvas | drag joystick | player moves | ✔ |
| keyboard | hold D | player moves right | ✔ |
| #btnSettings | tap | settings opens, stats line filled | ✔ |
| #sfxVol | set 30 | audio sfx gain follows | ✔ |
| #musVol | set 10 | music gain follows | ✔ |
| #tgHaptics | tap twice | toggles off then on, setting + live value follow | ✔ |
| #tgArrow | tap twice | toggles off then on, setting + live value follow | ✔ |
| #tgSpicy | tap twice | toggles off then on, setting + live value follow | ✔ |
| #tgAnalytics | tap twice | toggles off then on, setting + live value follow | ✔ |
| #nameSet | change to "Shazza" | sign updates | ✔ |
| #btnExport | tap | save code appears in textarea | ✔ |
| #btnImport | tap with garbage | toast says code is cooked, nothing changes | ✔ |
| #btnImport | tap with valid code (cash 777) | save imported, settings closes | ✔ |
| #btnReset | tap once | arms only: text changes, save kept | ✔ |
| #btnReset | wait 4s | disarms by itself | ✔ |
| #btnCloseSettings | tap | settings closes | ✔ |
| .modal backdrop | tap outside card | modal closes | ✔ |
| #btnUpg | tap (office built) | upgrades opens with 5 rows | ✔ |
| upgrade buy button | tap first affordable | level +1, cash down, row re-rendered | ✔ |
| upgrade buy button | tap when unaffordable | button disabled, nothing bought | ✔ |
| upgrade buy button | tap at max level | shows MAXED, disabled | ✔ |
| #btnCloseUpg | tap | upgrades closes | ✔ |
| Back Office desk | stand still 0.5 s | upgrades opens by walking | ✔ |
| welcome | simulate 90 min away | modal opens with count-up | ✔ |
| #btnDouble | tap | cash doubled, modal closes, event logged | ✔ |
| #btnWelcomeClose | tap | modal closes without doubling | ✔ |
| postcard | build final pad | postcard opens before finale | ✔ |
| #btnSharePc | tap (no share sheet here) | fallback toast, no error | ✔ |
| #btnClosePc | tap | postcard closes, finale opens next | ✔ |
| #btnCompleteClose | tap | finale closes, map button visible | ✔ |
| #btnMap | tap | network opens, 4 servos + 2 teasers listed, big pie postcard thumb | ✔ |
| big thing thumbnail | tap | postcard reopens | ✔ |
| #btnCloseNet | tap | network closes | ✔ |
| #btnServo2 | tap on finale (HIT THE ROAD) | travel cutscene, lands at Nullarbor | ✔ |
| network "Drive there" | tap | travels back to first servo | ✔ |
| #btnServo2 | HIT THE ROAD from nullarbor | cutscene, lands at ufo with its own theme | ✔ |
| #btnServo2 | HIT THE ROAD from ufo | cutscene, lands at dugout with its own theme | ✔ |
| #btnServo2 | tap on finale at the last servo | logs servo3_tapped + toast | ✔ |
| reload | reload page | continue card shows servo + progress, CTA says BACK TO WORK | ✔ |
| #btnStart | tap after reload | save restores same servo and settings | ✔ |

## New mechanics (servos.test.js)

✔ econ keys never leak between servos (no stale alien/heap config after travel)
  ✔ every servo: pathfinder reaches every pad interact point and pile from the spawn
  ✔ every servo: costs rise, names are unique, the Big Thing is last, staff all have info
  ✔ aliens land only at night, only with the Landing Pad, and pay triple
  ✔ alien pays ×3 at the till (Val serving)
  ✔ meteor shower: rocks fall, walking over them pays, the event ends
  ✔ abduction beam: drains the biggest pile; standing in it refunds 1.5x what it ate
  ✔ abduction beam: the guide arrow sends a bot to break it, before Zorp
  ✔ Zorp beams cash piles to the wallet on his own and breaks beams without you
  ✔ UFO events never fire before there is anything to beam
  ✔ heap makes rock; carrying rock to the cutter makes opals in a cash pile
  ✔ opal tiers: about 70% potch, black opals are rare, values follow the multipliers
  ✔ dust storm: dusty bowsers stop filling; standing next to one wipes it
  ✔ dust storm: Shazza wipes the bowsers for you
  ✔ mine shaft: holding next to it for 2 s rescues the tourist for a tip
  ✔ mine shaft: a bot following the arrow gets there in time from anywhere
  ✔ Noodler Ned hauls rock to the cutter on his own
  ✔ heat: walk-ins lose patience faster until the cool room is built
  ✔ dugout save round-trip keeps rock, cutter queue and dusty bowsers
  ✔ event fairness: every chaos type at every servo comes up within 12 events
  ✔ VIP mystery shoppers appear only after 3 pads and pay ×8
  ✔ shift goals: three live goals, completing all three pays a bonus and starts Smoko Boost
  ✔ Brag Board: milestones fire once, pay once, and survive a save
  ✔ Brag Board: every milestone is reachable in the campaign design (counters exist)
  ✔ offline cap: 2 h base, +2 h per finished servo, 8 h max

all 25 passed

## Economy simulation (60 Hz fixed step, 15 pads)

| bot | seed | finished | total min | first unlock | longest idle | unlocks in 10 min | longest gap (min) | lost sales |
|---|---|---|---|---|---|---|---|---|
| efficient | 7 | yes | 20.3 | 2.4 s | 6 s @ 0.1 m | 11 | 3.2 | 7 |
| efficient | 21 | yes | 21.6 | 2.4 s | 6 s @ 0.1 m | 10 | 3.5 | 14 |
| efficient | 99 | yes | 22.6 | 2.4 s | 6 s @ 0.1 m | 10 | 3.4 | 8 |
| lazy | 7 | yes | 18.7 | 4.8 s | 6 s @ 0.2 m | 10 | 2.7 | 2 |
| lazy | 21 | yes | 23.3 | 7.9 s | 6 s @ 0.2 m | 10 | 3.4 | 17 |
| lazy | 99 | yes | 20.7 | 8.1 s | 6 s @ 0.2 m | 11 | 3.8 | 6 |

Time to each unlock (minutes), efficient seed 7 vs lazy seed 7:

| # | pad | efficient | lazy |
|---|---|---|---|
| 1 | Fuel Pump 1 | 0.0 | 0.1 |
| 2 | Pie Warmer | 0.2 | 0.4 |
| 3 | Front Counter | 0.4 | 0.5 |
| 4 | Coffee Machine | 0.6 | 1.0 |
| 5 | Fuel Pump 2 | 0.8 | 1.2 |
| 6 | Back Office | 1.5 | 1.7 |
| 7 | Hire Gav | 2.4 | 2.6 |
| 8 | Hire Aunty Val | 2.5 | 2.5 |
| 9 | Sausage Roll Oven | 4.7 | 5.3 |
| 10 | Fuel Pump 3 | 6.6 | 7.5 |
| 11 | Hire Shazza | 9.3 | 10.0 |
| 12 | Highway Billboard | 14.6 | 13.8 |
| 13 | Second Till | 11.4 | 12.2 |
| 14 | Car Wash | 17.7 | 16.5 |
| 15 | The Big Pie | 20.3 | 18.7 |

  ✔ every bot run finishes the map
  ✔ first unlock within 20 s
  ✔ whole first servo in 18-40 min of active play (shift goals make it brisker than v0.3)
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
  ✔ migrates a v1 save (money, built array) to v4
  ✔ corrupt primary save falls back to the backup copy
  ✔ unsupported future save version is rejected (not silently loaded)
  ✔ export/import code round-trips
  ✔ load clamps hostile values (negative cash, 10^9 pies, player in a wall)

## Analytics events
   events seen: unlock_bought, milestone_earned, goal_completed, shift_completed, upgrade_bought, chaos_event_seen, staff_hired, thong_found, map_complete (session_start, offline_return, double_offline_tapped, servo2_tapped are fired by the browser layer and checked in the browser test)
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
| efficient | 7 | 20.3 | 26.9 | 2.3 s | 4.5 | 3 s | 3 | 101 (0) | 15.6 min | 13 |
| lazy | 7 | 18.7 | 31.0 | 2.3 s | 4.3 | 2 s | 0 | 122 (0) | 20.2 min | 12 |
| efficient | 21 | 21.6 | 27.5 | 2.3 s | 5.1 | 4 s | 0 | 133 (0) | 18.7 min | 13 |

Nullarbor unlock times (minutes after arriving), efficient seed 7:

pump1 0.0 · pie 0.1 · counter 0.1 · depot 0.7 · pump2 1.7 · choc 2.5 · office 3.9 · val 7.1 · trev 8.6 · gav 9.6 · mechanic 11.4 · dimsim 14.1 · mick 17.0 · pump3 18.7 · shazza 20.7 · lookout 22.4 · bigthong 26.9

  ✔ campaign: every bot finishes all four servos
  ✔ Nullarbor: 22-42 min of active play
  ✔ Nullarbor: first unlock within 20 s of arriving
  ✔ Nullarbor: no idle stretch over 45 s
  ✔ Nullarbor: no unlock gap over 7 min
  ✔ Nullarbor: a bot that follows the arrow never lets the tank run dry more than a few times
  ✔ Nullarbor: roo repairs happen and Petrol Pete goes bust before the finale

## Servos #3 and #4: the UFO Roadhouse and the Opal Dugout

| bot | seed | UFO min | first UFO unlock | UFO longest gap | aliens | beams broken | meteors | Dugout min | first Dugout unlock | Dugout longest gap | opals | black opals | rescues | campaign total min |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| efficient | 7 | 29.1 | 2.3 s | 6.7 | 176 | 4 | 18 | 23.3 | 2.3 s | 6.4 | 548 | 2 | 4 | 100 |
| lazy | 7 | 35.3 | 7.8 s | 7.3 | 249 | 4 | 30 | 24.8 | 5.8 s | 7.1 | 514 | 7 | 3 | 110 |
| efficient | 21 | 27.6 | 2.3 s | 5.7 | 150 | 3 | 18 | 21.2 | 2.3 s | 5.4 | 496 | 12 | 2 | 98 |

UFO and Dugout unlock times (minutes after arriving), efficient seed 7:

ufo: pump1 0.0 · pie 0.1 · counter 0.1 · pump2 0.6 · slushie 1.4 · office 2.8 · val 4.2 · landing 6.6 · gav 8.2 · jerky 9.4 · shazza 12.4 · pump3 15.1 · zorp 21.0 · museum 22.4 · bigalien 29.1

dugout: pump1 0.0 · pie 0.6 · counter 0.8 · heap 1.4 · pump2 2.3 · cutter 2.8 · icypole 3.6 · office 4.0 · val 4.7 · coolroom 5.1 · gav 6.4 · ned 9.9 · pastie 9.9 · pump3 12.9 · shazza 16.9 · bigopal 23.3

  ✔ ufo: 20-45 min of active play
  ✔ ufo: first unlock within 20 s of arriving
  ✔ ufo: no idle stretch over 45 s
  ✔ ufo: no unlock gap over 7.5 min
  ✔ dugout: 20-45 min of active play
  ✔ dugout: first unlock within 20 s of arriving
  ✔ dugout: no idle stretch over 45 s
  ✔ dugout: no unlock gap over 7.5 min
  ✔ ufo: aliens get served, beams get broken, meteors get grabbed
  ✔ dugout: opals get cut, tourists get rescued
  ✔ Brag Board: a full campaign earns most milestones
  ✔ travel keeps crew skills, parks the old servo, and the network pays
  ✔ saves at the Nullarbor round-trip (active servo, parked servo, thongs, fuel, share)
  ✔ v2 save migrates to v4 at the first servo
  ✔ empty tank turns cars away; carrying drums refills it; Trev automates it
  ✔ roo-damaged cars come more at night, and Mick repairs them alone
  ✔ price war: standing on the board wins it and raises Highway Share
  ✔ thongs: collected designs give +1% prices each, everywhere
   Nullarbor measured $/s 107.7 vs formula 104.5 ratio 0.97, dry 0
  ✔ offline formula within 25% of measured automated income at a full Nullarbor (one full day)

## Misc
  ✔ fmt formats big numbers
  ✔ at least 30 original speech lines, 35+ clean
  ✔ pathfinder reaches every queue slot and every station interact point from the spawn
  ✔ building the Second Till never traps the player behind the counter
  ✔ a pad never sticks at "$0 to go" (fractional cents)
  ✔ object pool recycles

ALL HEADLESS TESTS PASSED

## Browser release check

Per viewport: start, real input, the bot plays 60 s, settings, a full servo in a rush, night with a bin chicken raid, 90 minutes away, the finale with its postcard, the road trip to the Nullarbor, a Price War, the network map, and a reload. Any `console.error` or uncaught exception fails the run.

| | Phone 390x844 | Desktop 1440x900 |
|---|---|---|
| Player moved with real input | yes | yes |
| Postcard shown before finale screen | yes | yes |
| Road trip lands at the Nullarbor | yes | yes |
| Network income arriving | about $687/min | about $709/min |
| Reload restores Nullarbor plus parked servo | yes | yes |
| Console or page errors | none | none |

### Frame rate under 4x CPU throttle (software rendering at DPR 2, a worst case, not a phone)

| Scene | fps (min / avg) | entities |
|---|---|---|
| full servo, rush, day | 13 / 15 | 18 |
| full servo, rush, night | 15 / 17 | 23 |
| Nullarbor full, night, convoy | 17 / 19 | 20 |
| UFO full, night, aliens + abduction beam | 17 / 18 | 18 |
| UFO full, day, meteor shower | 18 / 20 | 19 |
| Dugout full, day, dust storm | 14 / 17 | 14 |
| Dugout full, night, mine shaft | 13 / 16 | 19 |

Screenshots from these scenes are in `docs/screenshots/` (phone-15 to phone-19 are the new servos).

## Bugs found and fixed in 0.4
1. **Milestone cash landed in the wrong wallet.** Rewards scale with the current servo, and "finish a servo" milestones fired at the servo you had just finished, where the cash is useless. A bot travelling straight away got an outsized payout at the next servo instead. Milestones now wait while a finished servo is idle and pay on arrival at the next one, and the biggest rewards were trimmed.
2. **Economy settings leaked between servos.** Each servo's settings are merged into the shared economy object, so a key one servo lacked kept the previous servo's value. Every servo now lists every key, and a test guards it.
3. **First 0.4 balance pass was far too fast.** The UFO finished in 10 minutes and the Dugout in 5, and the Dugout had a 40-second dead start. Costs, start cash and the cost curve were reshaped.
4. **A servo could go a whole run without one of its events.** One bot saw eight Dugout events without a single mine shaft. Event types that haven't appeared for a while are now guaranteed next.
5. **The first-visit start screen showed an empty bar.** The hidden Continue card was still displayed because a CSS rule overrode the hidden flag. The click audit now checks what is actually displayed, not the flag.
6. **The pulsing PLAY button broke automated clicks.** Its scale animation never let the button settle, so every later click timed out. It now pulses with a glow ring that doesn't move the button.
7. **Test harness bugs.** The lazy bot's dawdle timer reset on travel, so it stood idle for 37 minutes at the Dugout. The click audit pressed "D" while facing a wall and clicked the settings gear through an already-open settings card. The analytics test only accepted two of the first servo's three events.

## Not tested (honest list)
- **Real phones.** Still not available here. Touch feel, iOS audio unlock, haptics, real sleep and wake, and real GPU frame rates are unverified on hardware. The throttled numbers above come from software rendering on a server.
- **Humans.** All pacing numbers come from bots. Whether the shift goals, aliens and opals feel addictive to people is a guess until mates play it. PostHog events are in place to measure it once a real key is added.
- **Share sheet and link preview.** Same as 0.3: only the fallback text was exercised, and no real Messenger or iMessage preview was checked.
- **Add to Home Screen, non-Chromium browsers, accessibility, hour-long sessions and real offline time** were not tested.
- **Upgrading a real 0.3 save on a phone.** The v3 to v4 migration is covered by headless tests, not by a real device save.

