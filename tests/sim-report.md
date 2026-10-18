
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