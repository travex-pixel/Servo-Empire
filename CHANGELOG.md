# Changelog

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
