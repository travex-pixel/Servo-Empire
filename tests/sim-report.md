
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