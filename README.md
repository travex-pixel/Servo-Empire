# Servo Empire

**Pies, petrol and pure chaos. Build the greatest servo in Australia.**

A mobile-first idle arcade tycoon in a single `index.html`. You walk your character around a dodgy outback-highway
servo, carry pies and iced coffees from the warmers to the counter, grab the cash piles that cars leave at the pumps,
and stand on unlock pads to build the place up. Hire Gav, Aunty Val and Shazza and it runs itself, including while
you're away.

- No build step, no external assets. All art is drawn on a canvas, all sound is synthesised with the Web Audio API.
- Portrait, one thumb, 60 fps target. Also works on desktop.
- Saves to `localStorage` every 5 seconds and when the tab hides. Export/Import save codes in Settings.

## Play it

Open `index.html` in any modern browser, or host it (see below). Tap **OPEN UP, LEGEND**.

### Controls

| Platform | Move | Interact |
|---|---|---|
| Phone / tablet | Touch and drag anywhere (floating joystick) | Walk near things. That's it. |
| Desktop | `W A S D` or arrow keys | Same |

- **Unlock pads**: stand on the dashed pad and your cash pours in. Partial progress is kept.
- **Pumps**: cars fill up on their own and leave a pile of cash. Walk into the pile.
- **Warmers / coffee machine / oven**: walk up to the tray to grab stock, walk to the counter to drop it.
- **Counter**: stand at the **SERVE** spot to serve the queue until Aunty Val is hired.
- **Back Office**: stand still at the desk for half a second (or tap the spanner) to open the upgrade board.
- **Chaos events** every 2-3 minutes: Tradie Rush (double customers for 30 s) and Seagull Raid (walk into the gulls before they nick your pies).
- Settings (⚙️): sound and music sliders, haptics, guide arrow, spicy language, anonymous analytics on/off, save code export/import, reset.

## Host it on GitHub Pages

1. Push this repo to GitHub (the file that matters is `index.html` at the repo root).
2. On GitHub: **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**.
3. Pick your branch (e.g. `main`) and the **/ (root)** folder. Save.
4. Wait a minute, then share `https://<your-username>.github.io/<repo-name>/`.

Nothing else is needed: there is no build, and the game has no server-side parts. Saves live in each player's browser.

## Analytics (optional)

The game ships with a PostHog placeholder key. Until you replace `POSTHOG_KEY` near the top of the script in
`index.html`, no analytics script is loaded at all and events are only kept in memory (`window.__servo.analytics.buffer`),
which is handy for debugging. With a real key, these events are sent (anonymous gameplay counters only, autocapture
and session recording are off, players can opt out in Settings):

`session_start`, `unlock_bought` (station, minutes_since_first_play), `staff_hired`, `upgrade_bought`,
`offline_return` (minutes_away, cash_earned), `double_offline_tapped`, `chaos_event_seen`, `map_complete`, `servo2_tapped`.

## Develop and test

Everything lives in `index.html`. The simulation (`class Sim`) has no DOM dependencies and runs at a fixed 60 Hz
step, so the same code powers the game, the offline model and the headless tests.

```bash
node tests/sim.test.js      # economy bots (efficient + lazy, 3 seeds), offline payouts, save/migration, analytics, pathing
node tests/browser.test.js  # Playwright: 390x844 + 1440x900, simulated input, screenshots to docs/screenshots, fails on console errors
node tests/quick.js         # one quick bot run per policy with income rates between unlocks
```

The browser test needs `playwright` and a Chromium it can launch (`npx playwright install chromium` if you don't have one).

Debug hooks in the browser console: `__servo.sim` (state), `__servo.bot = true` (autoplay to the next goal),
`__servo.handleReturn(5400)` (simulate 90 minutes away), `__servo.analytics.buffer` (events).

## Licence / credits

Original characters, text and art. Genre conventions are shared with many idle tycoons; nothing is copied from any
other game. Made for mates. Shout a pie.
