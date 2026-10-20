// Helpers for the hi-res rendering: the canvas is GAME_WIDTH*RENDER_SCALE wide and cameras zoom by
// RENDER_SCALE, while all game logic keeps using 800x450 logical coordinates.
import { GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE } from '../config/constants.js';

// Non-scrolling scenes (menus, HUD, overlays): logical (0,0) maps to the canvas top-left.
export function setupStaticCamera(scene) {
  scene.cameras.main.setOrigin(0, 0).setZoom(RENDER_SCALE).setScroll(0, 0).setRotation(0);
}

// The game camera zooms around its center, so scrollX is no longer the left edge of the view.
const offsetX = (cam) => cam.width * 0.5 * (1 - 1 / cam.zoom);
export const viewLeft = (cam) => cam.scrollX + offsetX(cam);
export const setViewLeft = (cam, x) => { cam.scrollX = x - offsetX(cam); };

// Position an object with scrollFactor < 1 as if the camera were unzoomed: (x, y) are view coordinates
// for scrollFactor 0, or parallax coordinates for 0 < scrollFactor < 1.
export function pinToView(obj, x, y, sfx = 0, sfy = sfx) {
  const dx = (GAME_WIDTH * (RENDER_SCALE - 1)) / 2;
  const dy = (GAME_HEIGHT * (RENDER_SCALE - 1)) / 2;
  return obj.setScrollFactor(sfx, sfy).setPosition(x + dx * (1 - sfx), y + dy * (1 - sfy));
}
