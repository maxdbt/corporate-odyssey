// Animations built from separate frame textures.
import { ANIM, TEX, CHARACTERS, playerTex, playerAnim } from '../config/constants.js';

function add(scene, key, textures, frameRate, repeat = -1) {
  if (scene.anims.exists(key)) scene.anims.remove(key);
  scene.anims.create({ key, frames: textures.map((k) => ({ key: k })), frameRate, repeat });
}

export function generateAnims(scene) {
  for (const c of CHARACTERS) {
    add(scene, playerAnim(c, 'walk'), [playerTex(c, 'walk1'), playerTex(c, 'idle'), playerTex(c, 'walk2'), playerTex(c, 'idle')], 10);
    add(scene, playerAnim(c, 'climb'), [playerTex(c, 'climb1'), playerTex(c, 'climb2')], 6);
    add(scene, playerAnim(c, 'tired'), [playerTex(c, 'tired1'), playerTex(c, 'tired2')], 3);
    add(scene, playerAnim(c, 'swim'), [playerTex(c, 'swim1'), playerTex(c, 'swim2')], 5);
  }
  add(scene, ANIM.TALKER_WALK, [TEX.TALKER1, TEX.TALKER2], 4);
  add(scene, ANIM.CONFCALL_FLY, [TEX.CONFCALL1, TEX.CONFCALL2], 6);
  add(scene, ANIM.MINUTE_RUN, [TEX.MINUTE1, TEX.MINUTE2], 12);
  add(scene, ANIM.BUG_WIGGLE, [TEX.BUG1, TEX.BUG2], 10);
  add(scene, ANIM.PARTY_DANCE, [TEX.PARTY1, TEX.PARTY2], 4);
  add(scene, ANIM.GUARDIAN_WALK, [TEX.GUARDIAN1, TEX.GUARDIAN2], 5);
  add(scene, ANIM.SHARK_SWIM, [TEX.SHARK1, TEX.SHARK2], 4);
  add(scene, ANIM.COOK_THROW, [TEX.COOK1, TEX.COOK2], 3);
  add(scene, ANIM.EATER_A, [TEX.EATER_A1, TEX.EATER_A2], 2);
  add(scene, ANIM.EATER_B, [TEX.EATER_B1, TEX.EATER_B2], 2);
  add(scene, ANIM.EATER_C, [TEX.EATER_C1, TEX.EATER_C2], 2);
  add(scene, ANIM.EURO_SPIN, [TEX.EURO1, TEX.EURO2], 6);
  add(scene, ANIM.EXPLOSION, [TEX.FX_EXPLOSION1, TEX.FX_EXPLOSION2, TEX.FX_EXPLOSION3], 14, 0);
}
