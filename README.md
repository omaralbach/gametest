# Mandi Afandi Dash

A Phaser 3, browser-only, isometric diner-management prototype inspired by Diner Dash. Seat guests, take orders, prep at the kitchen counter, deliver plates, and clean tables before the rush overwhelms you.

## Play locally
1. Clone or download this repo.
2. Open `index.html` in a modern desktop browser (Phaser is pulled from a CDN).
3. Click **Launch Diner** to boot the game, then in-game click a waiting guest followed by a table to seat them.

No build tools are required—everything runs from static files, so you can also drag the folder into GitHub Pages.

## Controls & loop
- **Seat guests:** Click a waiting customer, then click an empty table.
- **Take orders:** When a bubble appears at a seated table, click the table to capture the ticket (it shows on the right in the kitchen area).
- **Deliver food:** When a ticket turns green/"Ready", click the same table to serve.
- **Clean:** Click dirty tables to bus them for the next party.
- **Hud:** The overlay shows score, tables served, queue length, and current rush level.

## Project structure
```
index.html          // loads Phaser 3 from CDN and hooks up all scripts
style.css           // page chrome around the canvas
js/
  main.js           // bootstraps the Phaser game config
  utils/Pathfinding.js
  objects/Waiter.js
  objects/Customer.js
  objects/Table.js
  objects/OrderManager.js
  objects/LevelManager.js
  scenes/BootScene.js
  scenes/PreloadScene.js
  scenes/MenuScene.js
  scenes/GameScene.js
  scenes/UIScene.js
assets/
  sprites/           // drop your Mandi Afandi characters, tables, floors, walls, kitchen counter art here
  ui/                // buttons, stars, panels
  audio/             // click/serve/fail/success/bgm
```

## Using the provided Mandi Afandi textures
Place your high-quality textures (from the Mandi Afandi pack you added) inside `/assets` and the engine will auto-use them, then **bake isometric, shadowed variants** at runtime for extra depth. If something is missing, the code still draws layered canvas backups so the game always starts.

- **Sprites** (used first): `waiter.png`, `customer_1.png`, `customer_2.png`, `table_empty.png`, `table_occupied.png`, `table_dirty.png`, `floor_tiles.png`, `wall_tile.png`, `kitchen_counter.png`, `order_icons.png` (32x32 frames). These are turned into `_iso` variants with tilt/shadow for the dining floor.
- **UI**: `button_start.png`, `button_pause.png`, `star_empty.png`, `star_filled.png`, `panel.png`. Glow-boosted versions are generated (`*_glow`) so text stays legible over busy art.
- **Audio**: `click.wav`, `serve.wav`, `success.wav`, `fail.wav`, `bgm_loop.mp3` (looping music). Each call also points to a tiny synthesized data-URL tone in case a file is missing.
- If you change dimensions, tweak scaling in `GameScene` (tables, floor tiles) or update the sprite sheet frame sizes in `PreloadScene`.

## Customizing gameplay
- **Menu items:** Edit the menu entries inside `objects/OrderManager.js` (name, emoji, spritesheet frame).
- **Table layout:** Tweak `tableCoords` in `scenes/GameScene.js` to reposition or add more tables; remember to also adjust `gridWidth`/`gridHeight` if expanding the floor.
- **Spawn pace:** Modify `spawnInterval`, `minInterval`, and the level ramp in `objects/LevelManager.js`.
- **Path grid:** Grid size and isometric projection live in `GameScene` (`tileWidth`, `tileHeight`, `gridWidth`, `gridHeight`).

## Deploying to GitHub Pages
1. Push this repository to GitHub.
2. In repository settings, enable **GitHub Pages** for the `main` branch and root directory.
3. Your game will be available at the Pages URL GitHub provides.
