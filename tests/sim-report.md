
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