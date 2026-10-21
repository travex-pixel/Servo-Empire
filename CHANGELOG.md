# Changelog

## 0.4.0 - 2026-10-21

Two new servos, a reason to come back every few minutes, and a faster first minute.

### Servo #3: UFO Roadhouse (Stuart Highway, NT)
- 15 pads in a red-desert roadhouse with neon-green trim, crop circles in the paddock and an alien statue out front.
- **Landing Pad**: after dark, saucers land and alien customers walk in. They pay triple.
- **Meteor Shower** event: glowing space rocks crash onto the forecourt. Run over them for cash.
- **Abduction** event: a saucer beams up your biggest cash pile. Stand in the beam to break it and it coughs up 1.5× what it took.
- **Zorp the Intern**: an alien hire who beams cash piles straight into your wallet and breaks beams for you.
- Glow Slushies, Moon Jerky, the Alien Museum (+40% traffic) and **The Big Alien** finale. Cows occasionally get abducted at night.

### Servo #4: Opal Dugout Servo (Stuart Highway, SA)
- 16 pads on an opal field covered in mullock heaps, with a "Don't walk backwards" shaft warning sign.
- **Opal mining loop**: the Mullock Heap makes rock; carry it to the Opal Cutter. Most opals are potch, some are crystal or fire, and about 1 in 100 is a **Black Opal** worth 25×.
- **Dust Storm** event: bowsers get caked in dust and stop pumping until you (or Shazza) wipe them.
- **Mine Shaft** event: a tourist falls down a shaft. Stand next to the hole for 2 seconds to haul them out for a tip.
- **Heat**: walk-ins lose patience faster in the day until you build the Underground Cool Room.
- **Noodler Ned** hauls rock to the cutter forever. Icy poles, pasties, a mining blower truck and **The Big Opal** finale.

### Come-back loops (no timers you can pay to skip, no paid randomness)
- **Shift Goals**: three small jobs at a time (serve, carry, grab cash, beat an event). Each pays a slice of your next pad; all three pay a Shift Bonus and a 20-second **Smoko Boost** (Hustle locked at ×1.5).
- **Brag Board**: 29 one-off milestones across the whole network, with rewards scaled to the servo you're at.
- **Mystery Shopper**: a rare VIP in a suit and sunnies. Serve them before they leave and they pay ×8.
- **Offline cap grows** with progress: 2 hours at the start, +2 hours per finished servo, up to 8 hours.

### First minute and conversion
- The start screen is one button. The name field moved to a "Name your servo" prompt that appears right after you build the Front Counter, when the sign actually matters.
- Returning players get a **Continue** card (servo, pads built, cash, milestones, time away) and a **BACK TO WORK** button.
- Honest promise line under the button: Free · No ads · No sign-up · 4 servos to build.

### Under the hood
- Per-servo themes replace every hard-coded servo check in the renderer and UI (ground, walls, signs, travel scene, postcard, finale text, ambient animals).
- New sounds (saucer, zap, gem, wind), new animals (cow, emu), 22 new customer and alien lines.
- Save format v4 (milestones, lifetime counters, rock and cutter queues, dusty bowsers) with automatic migration from v1-v3.
- Milestones that complete a servo now pay out on arrival at the next one, where the cash is useful.
- Economy retuned so each servo takes about 20-37 minutes of active play for the test bots (about 1 h 45 m for the whole campaign).

## 0.3.0 - 2026-10-18

Servo #2 and the Servo Network.

### Servo #2: Long Straight Roadhouse, the Nullarbor
- 17 new pads, a fresh wallet and its own economy, reached by a road-trip cutscene from the first servo's finale or the network map.
- Fuel tank that every car drinks from, a tanker that drops fuel drums at a depot, and Tanker Trev to haul them.
- Roo-damaged cars arrive mostly at night (the day/night cycle now matters); fix them at the Mechanic Bay or hire Mick the Mechanic.
- Petrol Pete's servo across the highway, a Highway Share tug-of-war that changes traffic, and a "Pete's gone bust" milestone.
- New events: Price War (stand on your price board to match Pete) and Grey Nomad Convoy (caravans).
- Whale Lookout, Bunda Cliffs and ocean with whales, wombats and camels, saltbush plain, The Big Thong finale. 15 new customer lines.
- New items: iced choc, dim sims, fuel drums. New vehicles: fuel tanker, caravans.

### The Servo Network
- Map of Australia with your servos, highways and live delivery trucks; travel between servos any time.
- Parked servos keep earning and truck 25% of their idle income to the one you're playing (also counted in offline earnings).
- Crew skills (walk, carry, staff speed) carry between servos and now go to level 10. Station speed and prices are per servo.
- Big Things postcards (shareable image) and a 16-design Thong Wall collection (+1% prices per design).

### Fixes and polish
- Pad names and prices draw above the night lighting, are larger, and the camera can scroll past the map edges.
- Share preview card, icons and Add to Home Screen manifest.
- Shorter waits for the last pads at the first servo.
- Save format v3 (multiple servos) with automatic migration from v1 and v2.


## 0.2.0 - 2026-10-17

The "make it insane" update: game feel, graphics, a new event and a mid-game rebalance.

### Gameplay
- **Hustle combo**: active play builds a multiplier of up to ×1.5 on cash you collect yourself. It drains after 2.5 s of doing nothing.
- **Bin Chicken Raid** (third chaos event): ibis land on your biggest cash piles and eat them. Walk into them, or hire Shazza and she runs them off.
- **Road trains**: an 8% chance a triple-trailer pulls into a pump, pays ×4 and takes 60% longer.
- The guide arrow now points at pests during raids, and red edge markers show raids happening off-screen.
- Rebalance: hires land at 4-6 minutes instead of 6-10, and late pads cost more to keep the map at about 32 minutes of active play.

### Graphics and feel
- Day/night cycle with a real lightmap: interior lights, pump lights, headlights, a flickering neon sign, sunset and sunrise tint.
- Build reveal: slow-mo, screen shake, zoom punch, a whoosh-thud, the station drops in with an overshoot bounce and a dust ring.
- Cash notes fly from your hands into a pad while you pay. Ibis fling notes out of piles while they eat.
- Carry stack leans and springs as you walk, with squash on pickup and dust puffs from your boots.
- Unlock pads show a translucent blueprint of what they build, replacing emoji icons.
- Your character's gear follows your upgrades: Volleys then red runners, an esky backpack, sunnies, a gold chain, a mullet and a cork hat.
- Outback world around the map on wide screens: a spinning windmill, "Next servo 412 km" and roo signs, spinifex, hopping kangaroos, tumbleweeds and cloud shadows. The yard gets a dunny, tyres, an ice freezer, a gas cage and a bin with flies.
- Rolling wallet counter, Hustle meter, "now → next" values on the upgrade board, and an animated drag-to-walk hand for brand-new players.
- Speech bubbles never overlap: at most four show at once, prioritised by importance and distance.
- Sound: whoosh and thud on builds, a rising combo chime, a road-train horn, an ibis honk, and faster music during a Tradie Rush.

### Performance
- Characters and cars are pre-rendered into a sprite cache (LRU, 320 entries) instead of being redrawn from shapes every frame.
- Vignette, sunset tint and the night lightmap merged into one third-resolution overlay, cached during the day.
- Adaptive resolution: pixel density drops when the frame rate stays under 48 fps and recovers after sustained 58+ fps.

### Fixes
- A pad could sit on "$0 to go" forever when fractional cents left it under $1 short.
- The upgrade board's Reset now uses an in-page two-tap confirm, so it also works where `confirm()` is blocked.
- New `servo_named` analytics event sends only `named: true`, never the name itself.


## 0.1.0 (MVP beta) - 2026-10-17

First playable. One map, 15 unlock pads, 3 staff, 5 upgrades, offline earnings, 2 chaos events.

### Added
- Floating joystick + WASD/arrows, auto-interaction by proximity, guide arrow and "next goal" HUD.
- Stations: Fuel Pumps 1-3, Pie Warmer, Front Counter, Coffee Machine, Back Office, Sausage Roll Oven, Highway Billboard, Second Till, Car Wash, The Big Pie. Hire pads for Gav the Tradie (restocker), Aunty Val (register) and Shazza (pump attendant).
- Upgrade board: walk speed, carry capacity, station speed, prices, staff speed (8 levels each).
- Offline earnings capped at 2 hours with a "Welcome back" count-up and a free "Double it" button (beta measurement, no ads).
- Chaos events every 2-3 minutes: Tradie Rush and Seagull Raid. 45 original customer lines (36 clean, 9 spicy; spicy toggle in settings).
- Game feel: cash piles that fly to the wallet, number pops, cha-ching, build fanfare, station bounce, confetti, haptics toggle, generative outback music with volume sliders.
- Save v2 with migration from v1, backup copy, export/import codes, autosave every 5 s and on hide, clock-trick protection.
- PostHog analytics with placeholder key, opt-out toggle, no personal data.
- Map-complete celebration with "Open Servo #2 (coming soon)" demand button.
- Headless economy/offline/save test suite and a Playwright release check with screenshots.

### Balance (from the bot sim)
- First unlock at ~3 s, 7-8 unlocks in the first 10 minutes, whole map in 36-40 minutes of active play.
- Offline model calibrated to within ~10% of measured automated income.

### Known gaps
- See TEST_REPORT.md and the team review for what is untested and what blocks a wider release.
