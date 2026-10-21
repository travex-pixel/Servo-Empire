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