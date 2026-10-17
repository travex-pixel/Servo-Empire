
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