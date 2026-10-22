# Corporate Odyssey — Architecture contract

Phaser 3.90 + Vite, ES modules, `import Phaser from 'phaser'`. Resolution 800x450, `pixelArt: true`,
Arcade physics gravity 900. All graphics are generated in code (no image files). Text uses `FONT`
('monospace'), bold, usually with a black stroke for an 8-bit look. All in-game text is in **Italian**.

Shared files (already written, do not rename keys — you may ADD keys if strictly needed and say so):
- `src/config/constants.js` — sizes, `DEPTH`, `EVENTS`, `TEX`, `ANIM`, `playerTex()`, `playerAnim()`, `LEVEL_META`, `WEAPONS`.
- `src/state/GameState.js` — run state singleton (hp, stress, euro, tickets, vacationDays, checkpoint, device, weapon, levelMods...).

## Ownership (one owner per file)

| Owner | Files |
|---|---|
| GFX | `src/scenes/BootScene.js`, `src/gfx/*.js` |
| PLAYER/UI | `src/entities/Player.js`, `src/systems/InputController.js`, `src/systems/Audio8bit.js`, `src/scenes/UIScene.js` (HUD + touch controls, may split into `src/ui/*.js`), `src/scenes/MenuScene.js`, `src/scenes/QuizScene.js`, `src/data/quizzes.js`, `src/scenes/GameOverScene.js`, `src/scenes/VictoryScene.js` |
| ENEMIES | `src/entities/enemies/*.js`, `src/entities/bosses/*.js`, `src/entities/hazards/*.js`, `src/entities/EnemyFactory.js` |
| GAME | `src/scenes/GameScene.js`, `src/levels/*.js`, `src/systems/*` other than InputController/Audio8bit (e.g. `LevelBuilder.js`, `WeaponSystem.js`, `Collectibles.js`, `Zones.js`), `src/entities/Collectible.js`, `src/entities/PlayerProjectile.js` |

Scene keys: `BootScene`, `MenuScene`, `GameScene`, `UIScene`, `QuizScene`, `GameOverScene`, `VictoryScene`.
Every scene file `export default class X extends Phaser.Scene { constructor(){ super('X'); } }`.

## Textures & animations (GFX)
BootScene generates EVERY key in `TEX` plus `playerTex(char, pose)` for char in `CHARACTERS` and pose in
`PLAYER_POSES`, with the sizes documented in constants.js, via `Graphics.generateTexture` (draw pixel art with
2x2 "art pixels" for a chunky 8-bit look). Player standing poses are 24x32, `crouch` 24x22, `slide` 32x16,
`sleep` 32x14. It creates every animation in `ANIM` and `playerAnim(char, 'walk'|'climb'|'tired'|'swim')`
(frames from separate textures: `frames: [{key:'a'},{key:'b'}]`). Then `this.scene.start('MenuScene')`.
Characters must look clearly different (man: short hair, shirt+tie; woman: long hair, blazer+skirt).
Other modules: use only TEX keys. If you truly need an extra texture, generate it yourself lazily with a
unique key (`if (!scene.textures.exists(k)) { ...generateTexture(k) }`).

## Audio (PLAYER/UI) — `src/systems/Audio8bit.js`
`export const audio` with: `sfx(name)` names: `jump, doublejump, coin, hurt, stomp, shoot, powerup, explosion,
quiz, select, gameover, victory, freeze, sneeze, splash, alarm, bossHit, checkpoint`; `music(track)` tracks:
`menu, level, promotion, boss`; `stopMusic()`; `unlock()` (call on first user input). Pure WebAudio square/
triangle oscillators, never throws if AudioContext is unavailable.

## Input (PLAYER/UI) — `src/systems/InputController.js`
`new InputController(scene)`; `update()` returns a fresh state each frame:
`{ left, right, up, down, jump, jumpPressed, run, slidePressed, attackPressed, switchWeaponPressed }`
(`*Pressed` = true only on the frame of the press). Keyboard: arrows/WASD, Space/Z jump, X run, C attack,
V switch weapon. It merges the touch state from `scene.scene.get('UIScene').getTouchState()` (may be null).

## UIScene (PLAYER/UI)
Launched by GameScene (`this.scene.launch('UIScene')`), stopped by GameScene on shutdown. Renders HUD + touch
controls above the game camera (so camera rotation/shake never affects them). Public methods MUST be safe to
call before `create()` has run (guard internally):
- `updateHud(data)` each frame, data = `{ hp, stress, euro, tickets, vacationDays, device, weapon, timeLeft (s),
  levelId, levelName, statuses: [{ name, remaining (ms|Infinity) }], meal: { primo, secondo, contorno, dolce } | null }`
- `fog(ms)` — HUD gets blurred/fogged ("HUD appannato").
- `message(text, color = '#ffffff', ms = 2000)` — big centered 8-bit banner.
- `bossBar(name, ratio)` — show/update boss HP bar; `ratio === null` hides it.
- `getTouchState()` — `null` on non-touch devices; else same shape as InputController state (held + pressed
  flags). Touch layout: d-pad left (left/right/up/down), buttons right "SALTA", "SCIVOLA" (held = run, press =
  slide), "ATTACCA"; tapping the HUD weapon icon = switchWeaponPressed. Shown only if
  `this.sys.game.device.input.touch`.

## Player (PLAYER/UI) — `src/entities/Player.js`
`export default class Player extends Phaser.Physics.Arcade.Sprite`
- `constructor(scene, x, y, character)` — adds itself to display list + physics; origin (0.5, 1): x,y = feet.
  Body sizes: standing 16x30, crouch 16x20, slide 28x14 (bottom aligned). Depth `DEPTH.PLAYER`.
- `update(time, delta, input)` — called by GameScene. Handles walk (160 px/s), run (260), jump (-430),
  double jump (-380, once in air), crouch, slide (down+run while moving on ground or `slidePressed`, ~450 ms,
  low body), ladders, attack (if `GameState.device`: emits `scene.events.emit(EVENTS.PLAYER_FIRE, {x, y, dir})`
  with cooldown ~250 ms), weapon switching (cycles `GameState.weapon` through `WEAPONS`), panic inversion
  (`GameState.isPanicking()` => left/right and up/down swapped), animations & visual effects of statuses.
- `facing` (1 | -1), `isSliding`, `isCrouching`, `onGround` getter.
- `env` — per-frame environment set by GameScene/hazards BEFORE `player.update()`; Player reads it;
  GameScene calls `player.resetEnv()` AFTER `player.update()`. Defaults:
  `{ speedMult: 1, windX: 0, ice: false, underwater: false, onLadder: false, ladderX: 0, heat: false }`
  - `windX` (<0 blows left): moving against it halves speed; idle player drifts with it.
  - `ice`: near-zero friction (keeps sliding in the same direction, slow to change direction).
  - `underwater`: low gravity (max fall 90 px/s), each jumpPressed = swim stroke (-220), swim anim.
  - `heat`: tired anim + speedMult applied by GameScene (0.6).
  - `onLadder`: up/down climbs at 120 px/s with gravity off, snaps x to `ladderX`.
- Statuses: `applyStatus(name, ms)`, `hasStatus(name)`, `clearStatus(name)`, `statusList()` →
  `[{name, remaining}]`. Names and behaviour (Player implements all visuals):
  - `drunk` (5000): camera sways (rotation/zoom wobble via `scene.cameras.main`), input delayed ~250 ms,
    character auto-staggers left/right. Restore camera when it ends.
  - `frozen` (1000): cannot move, tinted ice-blue; when it ends automatically applies `cold`.
  - `cold` (5000): speed x1.4, very slippery, random sneezes (`audio.sfx('sneeze')`, "ETCIU'!" text) that
    kick the horizontal velocity / jump trajectory randomly.
  - `asleep` (3000): lies down (`sleep` pose), 8-bit "Zzz" floating text, no input.
  - `stuck` (ms): blocked in place (talker), shakes.
  - `promotion` (ms): invincible, speed x1.5, rainbow tint flicker; plays `audio.music('promotion')` and
    restores `audio.music('level')` (or 'boss' if `scene.bossActive`) when over.
  - `raise` (15000): only a marker (collectible values doubled by GameScene).
  - `shield` (Infinity): company car shield, visual outline/ring; removed by first damage.
  - `invuln` (ms): post-hit invincibility frames (blinking).
- `takeDamage(hp, stress, sourceX)` → boolean. Ignored if `promotion` or `invuln`. If `shield`: remove shield,
  give `invuln` 1000, return false. Else apply `GameState.addHp(-hp)`, `GameState.addStress(stress)`,
  knockback away from sourceX, `invuln` 1000, `audio.sfx('hurt')`, return true.
- `bounce(v = -350)` — after stomping an enemy.
- `respawn(x, y)` — reset velocity/statuses/camera effects at a position.

## Enemies (ENEMIES) — `src/entities/EnemyFactory.js`
`createEnemy(scene, type, x, y, props = {})` → enemy (already added to `scene.enemies`).
`createHazard(scene, type, props = {})` → controller `{ update(time, delta), destroy() }`.
Ground enemies: x,y = feet on the surface (origin 0.5,1). Flying ones: x,y = center.

Base `src/entities/enemies/Enemy.js extends Phaser.Physics.Arcade.Sprite`:
- constructor does `scene.add.existing(this); scene.physics.add.existing(this); scene.enemies.add(this);`
  and **only after** `enemies.add` configures the body (physics groups reset body defaults on add).
- Fields: `kind`, `hp`, `stompable` (bool), `isBoss` (bool), `damage = { hp, stress }`, `isColleague` (talker/party).
- Uses `preUpdate(time, delta)` (call `super.preUpdate`) for AI; reads `this.scene.player`. Must not crash if
  player is dead/missing. Speeds multiplied by `GameState.levelMods.enemySpeedMult`; colleagues more aggressive
  when `GameState.levelMods.colleaguesHostile` (read live every frame).
- `onPlayerContact(player)` — default `player.takeDamage(damage.hp, damage.stress, this.x)`.
- `hit(amount, type)` — type: `email|teams|coffee|clock|www|stomp|ram`. Handles hp, flash, death.
- `stun(ms)` (teams: frozen in place, stars), `slow(ms, factor)` (clock: blue tint), `die()` (pop FX, 
  `scene.events.emit(EVENTS.ENEMY_KILLED, this)`, destroy). Bosses emit `EVENTS.BOSS_DEFEATED` on death and
  `EVENTS.BOSS_HEALTH` when damaged/spawned.

Enemy types & props:
- `talker` Collega Logorroico: slowly follows player, emits "BLA BLA" speech bubbles; contact → `stuck` 1500 ms,
  stress +15, hp -5. Stompable.
- `confcall` Conf Call: headset flying in parabolic swoops from above. Stompable. props `{ range }`.
- `clienthell` Cliente dall'Inferno: hides in a desk, pops up and shoots horizontal flames toward the player. Stompable when up.
- `minute` "Ti rubo solo un minuto": clock that charges very fast in a straight line when player in sight
  (`range` default 260). Stompable.
- `bug` Bug di sistema: small, totally random jittery movement on platforms (random hops/direction). Stompable.
- `party` Collega festaiolo (1-1): stationary dancing, throws bouncing panettone slices; contact → stress +20,
  `scene.scene.get('UIScene').fog(3000)`. Stompable.
- `guardian` Guardiano del Budget: armored tuxedo, patrols `props.patrol` px, hp 3, stomp deals 1.
- `shark` Squalo-Consulente: swims in a circle (`props.radius` 60) around x,y. Not stompable, hp 2.
- `mine` Mina-notifica: red, bobs in place, explodes on contact (hp 15 dmg). Destroyable by projectiles.
- `copier` Fotocopiatrice impazzita: stationary, shoots paper sheets horizontally toward player every ~2 s
  when on screen. hp 3, not stompable (solid-looking), contact dmg small.
- `cabinet` Armadio d'archivio: stationary, harmless on contact; drops a falling `folder` when the player is
  within 70 px horizontally (cooldown).
- `cook` Cuoco arrabbiato: throws plastic trays in arcs toward the player. props `{ dir }`.
- Canteen (2-1, `src/entities/enemies/CanteenEnemies.js`, need `scene.canteen` = `src/systems/Canteen.js`):
  - `chef` stands on a counter and throws dishes / Teams icons at the player. props `{ rate, mix: { good, hot,
    spoiled, teams, ticket } }` (weights). Invulnerable, harmless on contact.
  - `teamscall` Teams icon thrown by a chef; hops like `teamsicon` once landed. Contact → `canteen.teamsCall()`:
    call window in the HUD, `stuck` 5 s, stress +20. Stompable.
  - `moocher` colleague who runs to dishes lying on the floor and eats them. Stompable.
  - `chief` the boss: patrols `props.patrol` px; seeing the player on his floor in front of him (or touching
    him) → stress +15 (4 s cooldown). Invulnerable; players avoid him on the tables.
- `stalactite` Stalattite-scadenza: x,y = ceiling attach point; falls when player passes under (|dx| < 40).
- `cactus` Cactus-faldone: static, damages on contact. `mirage` Oasi miraggio: harmless oasis that turns into
  a pile of worksheets (`PAPERPILE`) when player within 80 px, stress +10 once, then damages on contact.
- `boss_client` Boss "Il Cliente dall'Inferno": floats on a burning office chair; homing fireball "Feedback fuori
  scope"; periodically shouts "LO VOGLIO PRONTO PER IERI!" (big text) and sends shockwaves along the floor
  (jump them). hp 30. props `{ arena: { left, right, floorY } }`.
- `boss_ceo` Boss "Il Mega-Direttore": on a moving leather throne. Patterns cycle: Q4 folders (land and become
  obstacles in `scene.obstacles` with `hit()`, hp 3, block the path until destroyed by projectiles); Mega-Riunione
  Sincrona (siren + "ALLARME!" then a tall red wave from the screen corner across the floor — needs a
  double jump); Pioggia di Excel (Tetris-like spreadsheet blocks fall in all columns but one, highlighted
  briefly before). hp 50. Takes damage from player projectiles and stomps. props `{ arena: { left, right, floorY, ceilingY } }`.

Hazard controller types:
- `mailrain` Le Mail: envelopes rain vertically from the top of the camera view near the player while
  player.x in `[from, to]`, every `interval` ms (900).
- `teamsmeteor` Loghi Teams giganti come meteoriti (with a short warning shadow) while player.x in `[from, to]`;
  hit → `player.applyStatus('asleep', 3000)` + hp -5.

Enemy projectiles: class(es) added to `scene.enemyBullets` (then configure body). Implement
`onHitPlayer(player)` (default takeDamage then destroy) and optional `onHitWall()`.

## GameScene (GAME)
Owns level building, collisions, camera, zones, collectibles, power-ups, player weapons, timer, quiz terminals,
level flow. Creates BEFORE spawning anything:
- `this.player` (Player), `this.platforms` (static group, solid), `this.oneWay` (static group, collide only
  from above — desks, post-its use own dynamic handling), `this.enemies` (physics group), `this.enemyBullets`
  (physics group `{ allowGravity: false }`), `this.obstacles` (physics group `{ allowGravity: false, immovable: true }`),
  `this.bossActive` (bool).
- Colliders: enemies↔platforms/oneWay/obstacles; enemyBullets↔platforms (process: call `onHitWall?.()`);
  player↔platforms/oneWay/obstacles; player↔enemies overlap: if player has `promotion` or `shield` and enemy
  is not a boss → `enemy.hit(99, 'ram')`; else if stomp (player falling and feet near enemy top) and
  `enemy.stompable` → `enemy.hit(1,'stomp')` + `player.bounce()`; else `enemy.onPlayerContact(player)`.
  Player↔enemyBullets → `bullet.onHitPlayer(player)`. Player projectiles ↔ enemies/obstacles → `hit(dmg, weaponType)`.
- `spawnEnemy(type, x, y, props)` wraps the factory. `applyEffects(effects)` (quiz). Hazards list updated each frame.
- Update order: hazards.update → zones set `player.env` → `player.update(time, delta, input)` →
  `player.resetEnv()` → HUD `ui.updateHud(...)` → checks (hp <= 0 / timer 0 → Burnout, fall in pit, goal).
- Burnout: `this.scene.start('GameOverScene', { levelIndex })`. Level complete → `goNext(this, i)` (Trip.js: next level
  or trip stage) after `GameState.beginLevel`; after the last → `VictoryScene`.
- `init(data)`: `{ levelIndex, fromCheckpoint }`. If `fromCheckpoint` and `GameState.hasCheckpoint()` spawn at
  checkpoint (do NOT call beginLevel), else `GameState.beginLevel(levelIndex)`.

Quiz terminals: on touch, `this.scene.pause(); this.scene.launch('QuizScene', { quizId })` (each terminal
used once; `quizId = nextQuizId(level.quizSetting)`: one shuffled deck per setting, quizzes carry
`setting` (default `'office'`), e.g. level4_desert uses `quizSetting: 'desert'` so no office quizzes there). QuizScene shows the question (keyboard 1/2/3 or A/B/C, arrows+Enter, or tap), calls
`this.scene.get('GameScene').applyEffects(choice.effects)`, shows the outcome text, then
`this.scene.resume('GameScene'); this.scene.stop()`.

Effect keys (all optional): `stress` (delta), `stressSet` (absolute), `hp` (delta), `euro` (delta),
`tickets` (delta), `vacationDays` (delta), `timer` (delta seconds), `nextLevelEnemySpeed` (multiplier, e.g.
1.15), `colleaguesHostile` (bool), `spawnBugs` (count, spawned near the player), `weapon` ('www' etc.; also
grants device 'laptop' if none), `promotion` (seconds).

## Menu / GameOver / Victory (PLAYER/UI)
- MenuScene: title "CORPORATE ODYSSEY", character select (Jack / Wendy, big preview of the sprites, keyboard
  left/right + Enter/Space, or tap), controls help for PC and mobile, level selector (from `LEVEL_META`,
  default 1-1; chips wrap on more rows). Start: `GameState.newGame(char); startLevel(this, levelIndex)`.
- GameOverScene `{ levelIndex }`: "BURNOUT!". Options: "Usa 1 Giorno di Ferie" (only if
  `GameState.hasCheckpoint() && GameState.vacationDays > 0`: vacationDays--, `revive()`, start GameScene
  `{ levelIndex, fromCheckpoint: true }`), "Ricomincia il livello" (`revive()`, checkpoint = null, start
  GameScene `{ levelIndex }`), "Menu".
- VictoryScene: ending ("Sei diventato il nuovo CEO... o forse è ora di andare in ferie?"), stats, back to menu.

## Mondo 4: La Trasferta (GAME) — `src/systems/Trip.js`
One trip in stages, with a BUDGET bar carried across them in `GameState.trip`
(`{ items, transport, budget, maxBudget, stageIndex, stageBudget }`; `hasItem / budget / canAfford / spend / addBudget`).
- Stages are `LEVEL_META` entries with `trip: true`; entries with `scene` are static scenes (PackingScene,
  TransportScene, JourneyScene plane/train, NegotiationScene), the others are GameScene levels.
- The suitcase holds `SUITCASE_SIZE` (10) items; `itemTex(id, character)` gives per-character icons for
  underwear, suit and swimsuit.
- ALWAYS start a level with `startLevel(scene, index)` and advance with `goNext(scene, index)`: they route to the
  static scene and pick the branch: 4-1 Valigia → 4-2 Mezzo → 4-3 Aeroporto | 4-4 Stazione → 4-5 Volo | 4-6 Treno →
  random ground leg from `GROUND_LEGS` (now only 4-7 Deserto) → 4-10 Cliente → 5-1.
- `beginStage(index)` stores the budget at stage start (a replay restores it); `ensureTrip(index)` builds a default
  trip when a stage is started directly from the menu (debug, `TRIP_STAGES_IN_MENU`). `finishTrip()` converts the
  leftover budget to euro (`BUDGET_TO_EURO`) and clears the trip.
- Data (items, transports, prices, food stand menus): `src/data/trip.js`. `TRIP_FUND` (480) is the whole allowance:
  the ticket is paid out of it (train 180 → 300 left, plane 300 → 180 left but +60s on the clock). Shared dialogs/HUD for static scenes: `src/ui/TripUI.js`.
- In-level trip props live in `src/systems/TripLevel.js` (`scene.tripLevel`): falling drops from the departure
  boards (`tripdrops` hazard), duty free shelves, document check, rental kiosk (opens `RentalScene` overlay →
  `rent(type)` → `player.mountUp(type)`), taxi meter, sniffer search, petition stand (`level.petition: [x...]`,
  spawns two `Petitioner`s that chase you and block you to sign), food stand (`level.food: [x, y]`, forced stop →
  `FoodScene` overlay: 3 dishes from `FOOD_MENUS`, shuffled good / trip (5s hallucination) / toxic (5s in the
  toilet), `FOOD_OUTCOMES`). Enemies Sniffer / Pickpocket / Petitioner in `entities/enemies/TripEnemies.js`.
- Mounts: `MOUNTS` in Player.js (camel / moto / taxi); while mounted no double jump, slide or ladders;
  the camel with the DATES item is turbo (`cfg.turbo` speed, wings, mid-air jumps = flaps `cfg.flap`);
  GameScene.playerVsEnemy asks `player.mountContact(enemy)` first (immune / ram / crash).
- NegotiationScene phases: question 1 (first impression) → dodge the requests (18s, jump with SPACE) →
  consultants (stomp them or throw e-mails with C/Q; some hop over e-mails) → questions 2-4 → outcome.
  Each action phase scores 0-2 from the patience left; `MAX_POINTS` 12.
- JourneyScene: the train keeps the side cabin; the plane is a front view (`drawPlaneCabin`: window wall, two
  seats + aisle + two seats, seated passengers `pax_*` from `gfx/trip.js`, hostess with trolley, seat-belt sign).
- 4-8 Ghiacciaio and 4-9 Mare are still the old levels: to become ground legs they need their own mounts
  (sled / snowmobile, submarine / boat / seahorse) and an entry in `GROUND_LEGS`.
