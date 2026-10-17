# Changelog

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
