// Tiny WebAudio chiptune engine: square/triangle oscillators only, never throws.

const NOTE_INDEX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

// 'A4' -> 440 Hz. null/'-' -> rest.
function freq(note) {
  if (!note || note === '-') return 0;
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if (!m) return 0;
  const semis = NOTE_INDEX[m[1]] + (parseInt(m[2], 10) + 1) * 12 - 69;
  return 440 * Math.pow(2, semis / 12);
}

// Tracks: arrays of [note, beats] for melody and bass, plus tempo (beats per minute).
const TRACKS = {
  menu: {
    bpm: 132,
    lead: [
      ['E5', 1], ['G5', 1], ['C6', 1], ['G5', 1], ['A5', 1], ['F5', 1], ['D5', 2],
      ['E5', 1], ['G5', 1], ['B5', 1], ['G5', 1], ['C6', 2], ['-', 2],
      ['A5', 1], ['G5', 1], ['F5', 1], ['E5', 1], ['D5', 1], ['E5', 1], ['C5', 2],
      ['D5', 1], ['F5', 1], ['E5', 1], ['D5', 1], ['C5', 2], ['-', 2]
    ],
    bass: [
      ['C3', 2], ['G3', 2], ['F3', 2], ['G3', 2], ['C3', 2], ['G3', 2], ['C3', 2], ['G2', 2],
      ['F3', 2], ['C3', 2], ['G3', 2], ['C3', 2], ['G2', 2], ['G3', 2], ['C3', 4]
    ]
  },
  // Elevator muzak (Mondo 5 ElevatorScene) and the Caribbean ending (VictoryScene).
  elevator: {
    bpm: 96,
    lead: [
      ['E5', 1.5], ['D5', 0.5], ['C5', 1], ['A4', 1], ['G4', 2], ['-', 2],
      ['F5', 1.5], ['E5', 0.5], ['D5', 1], ['B4', 1], ['C5', 2], ['-', 2]
    ],
    bass: [
      ['C3', 2], ['A2', 2], ['D3', 2], ['G2', 2], ['F2', 2], ['G2', 2], ['C3', 2], ['G2', 2]
    ]
  },
  island: {
    bpm: 112,
    lead: [
      ['G5', 0.5], ['E5', 0.5], ['G5', 1], ['A5', 0.5], ['G5', 0.5], ['E5', 1], ['C5', 1], ['D5', 1], ['E5', 2],
      ['F5', 0.5], ['D5', 0.5], ['F5', 1], ['G5', 0.5], ['F5', 0.5], ['D5', 1], ['B4', 1], ['C5', 1], ['C5', 2]
    ],
    bass: [
      ['C3', 1], ['G3', 1], ['C3', 1], ['G3', 1], ['F3', 1], ['C4', 1], ['G3', 1], ['D3', 1],
      ['G2', 1], ['D3', 1], ['G2', 1], ['D3', 1], ['F3', 1], ['G3', 1], ['C3', 2]
    ]
  },
  level: {
    bpm: 150,
    lead: [
      ['C5', 0.5], ['C5', 0.5], ['-', 0.5], ['C5', 0.5], ['-', 0.5], ['G4', 0.5], ['C5', 1],
      ['E5', 1], ['-', 1], ['G4', 1], ['-', 1],
      ['A4', 0.5], ['B4', 0.5], ['C5', 0.5], ['A4', 0.5], ['G4', 1], ['E5', 1],
      ['D5', 0.5], ['C5', 0.5], ['B4', 0.5], ['G4', 0.5], ['C5', 2],
      ['F5', 0.5], ['F5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 1], ['A4', 1],
      ['G4', 0.5], ['A4', 0.5], ['C5', 0.5], ['D5', 0.5], ['E5', 2],
      ['D5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['B4', 1], ['G4', 1],
      ['C5', 2], ['-', 2]
    ],
    bass: [
      ['C3', 1], ['C4', 1], ['C3', 1], ['C4', 1], ['C3', 1], ['C4', 1], ['G2', 1], ['G3', 1],
      ['A2', 1], ['A3', 1], ['A2', 1], ['A3', 1], ['G2', 1], ['G3', 1], ['G2', 1], ['G3', 1],
      ['F2', 1], ['F3', 1], ['F2', 1], ['F3', 1], ['C3', 1], ['C4', 1], ['C3', 1], ['C4', 1],
      ['G2', 1], ['G3', 1], ['G2', 1], ['G3', 1], ['C3', 1], ['G3', 1], ['C3', 2]
    ]
  },
  promotion: {
    bpm: 190,
    lead: [
      ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 0.5], ['G5', 0.5], ['E5', 0.5], ['C6', 1],
      ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['D6', 0.5], ['A5', 0.5], ['F5', 0.5], ['D6', 1],
      ['E5', 0.5], ['G5', 0.5], ['B5', 0.5], ['E6', 0.5], ['D6', 0.5], ['B5', 0.5], ['G5', 1],
      ['C6', 0.5], ['C6', 0.5], ['C6', 0.5], ['C6', 0.5], ['C6', 2]
    ],
    bass: [
      ['C3', 0.5], ['C4', 0.5], ['C3', 0.5], ['C4', 0.5], ['C3', 0.5], ['C4', 0.5], ['C3', 0.5], ['C4', 0.5],
      ['D3', 0.5], ['D4', 0.5], ['D3', 0.5], ['D4', 0.5], ['D3', 0.5], ['D4', 0.5], ['D3', 0.5], ['D4', 0.5],
      ['E3', 0.5], ['E4', 0.5], ['E3', 0.5], ['E4', 0.5], ['G3', 0.5], ['G4', 0.5], ['G3', 0.5], ['G4', 0.5],
      ['C3', 0.5], ['C4', 0.5], ['C3', 0.5], ['C4', 0.5], ['C3', 2]
    ]
  },
  boss: {
    bpm: 168,
    lead: [
      ['A4', 0.5], ['A4', 0.5], ['C5', 0.5], ['A4', 0.5], ['D#5', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 0.5],
      ['G4', 0.5], ['A4', 0.5], ['-', 0.5], ['E4', 0.5], ['A4', 2],
      ['A4', 0.5], ['A4', 0.5], ['C5', 0.5], ['A4', 0.5], ['F5', 0.5], ['E5', 0.5], ['D#5', 0.5], ['D5', 0.5],
      ['C5', 0.5], ['B4', 0.5], ['G#4', 0.5], ['B4', 0.5], ['A4', 2]
    ],
    bass: [
      ['A2', 0.5], ['A2', 0.5], ['A3', 0.5], ['A2', 0.5], ['A2', 0.5], ['A2', 0.5], ['A3', 0.5], ['A2', 0.5],
      ['F2', 0.5], ['F2', 0.5], ['F3', 0.5], ['F2', 0.5], ['E2', 0.5], ['E2', 0.5], ['E3', 0.5], ['E2', 0.5],
      ['A2', 0.5], ['A2', 0.5], ['A3', 0.5], ['A2', 0.5], ['D2', 0.5], ['D2', 0.5], ['D3', 0.5], ['D2', 0.5],
      ['E2', 0.5], ['E2', 0.5], ['E3', 0.5], ['E2', 0.5], ['A2', 2]
    ]
  }
};

class Audio8bit {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this.musicTimer = null;
    this.muted = false;
  }

  _ensure() {
    if (this.ctx) return this.ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.18;
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.35;
      this.sfxGain.connect(this.master);
    } catch (e) {
      this.ctx = null;
    }
    return this.ctx;
  }

  unlock() {
    try {
      const ctx = this._ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) { /* ignore */ }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  // One oscillator blip with optional pitch slide.
  _tone(type, f0, f1, start, dur, vol, dest) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, f0), start);
    if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), start + dur);
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  _noise(start, dur, vol) {
    const ctx = this.ctx;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    src.connect(g);
    g.connect(this.sfxGain);
    src.start(start);
  }

  sfx(name) {
    try {
      const ctx = this._ensure();
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime;
      const d = this.sfxGain;
      const seq = (notes, step, type = 'square', vol = 0.3) => {
        notes.forEach((n, i) => this._tone(type, freq(n), 0, t + i * step, step * 0.95, vol, d));
      };
      switch (name) {
        case 'jump': this._tone('square', 260, 620, t, 0.14, 0.3, d); break;
        case 'doublejump': this._tone('square', 420, 900, t, 0.12, 0.3, d); break;
        case 'coin': seq(['B5', 'E6'], 0.07); break;
        case 'hurt': this._tone('square', 400, 90, t, 0.3, 0.35, d); break;
        case 'stomp': this._tone('triangle', 500, 120, t, 0.15, 0.5, d); break;
        case 'shoot': this._tone('square', 900, 300, t, 0.08, 0.2, d); break;
        case 'powerup': seq(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.06); break;
        case 'explosion': this._noise(t, 0.4, 0.5); this._tone('triangle', 150, 40, t, 0.4, 0.5, d); break;
        case 'quiz': seq(['E5', 'G5', 'E5', 'G5'], 0.08); break;
        case 'select': this._tone('square', 700, 700, t, 0.06, 0.25, d); break;
        case 'gameover': seq(['G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4'], 0.16, 'triangle', 0.5); break;
        case 'victory': seq(['C5', 'C5', 'C5', 'C5', 'G#4', 'A#4', 'C5', '-', 'A#4', 'C5'], 0.12); break;
        case 'freeze': this._tone('triangle', 1800, 300, t, 0.4, 0.3, d); this._noise(t, 0.2, 0.15); break;
        case 'sneeze': this._noise(t + 0.15, 0.25, 0.4); this._tone('square', 300, 800, t, 0.15, 0.15, d); break;
        case 'splash': this._noise(t, 0.3, 0.3); break;
        case 'alarm':
          for (let i = 0; i < 4; i++) this._tone('square', i % 2 ? 600 : 900, i % 2 ? 900 : 600, t + i * 0.2, 0.19, 0.3, d);
          break;
        case 'bossHit': this._tone('square', 200, 60, t, 0.2, 0.4, d); this._noise(t, 0.1, 0.2); break;
        case 'checkpoint': seq(['G5', 'C6', 'E6', 'G6'], 0.09, 'triangle', 0.5); break;
        case 'kick': this._tone('triangle', 160, 40, t, 0.12, 0.7, d); break;
        case 'hat': this._noise(t, 0.03, 0.08); break;
        case 'perfect': seq(['C6', 'G6'], 0.05, 'square', 0.2); break;
        case 'miss': this._tone('square', 180, 110, t, 0.12, 0.25, d); break;
        case 'cheer': this._noise(t, 0.9, 0.25); seq(['C5', 'E5', 'G5', 'C6'], 0.1, 'triangle', 0.4); break;
        default: this._tone('square', 440, 440, t, 0.05, 0.2, d);
      }
    } catch (e) { /* audio must never break the game */ }
  }

  music(track) {
    try {
      if (this.currentTrack === track && this.musicTimer) return;
      this.stopMusic();
      const ctx = this._ensure();
      const data = TRACKS[track];
      if (!ctx || !data) return;
      this.currentTrack = track;
      const out = ctx.createGain();
      out.connect(this.musicGain);
      this.trackGain = out;
      const beat = 60 / data.bpm;
      const len = (arr) => arr.reduce((s, n) => s + n[1], 0);
      const loopBeats = Math.max(len(data.lead), len(data.bass));
      const loopDur = loopBeats * beat;
      let nextStart = ctx.currentTime + 0.05;
      const schedule = () => {
        if (this.currentTrack !== track) return;
        // Schedule loops ahead while the context runs (it may be suspended until unlock()).
        if (ctx.state === 'running') {
          while (nextStart < ctx.currentTime + 1.0) {
            this._scheduleVoice(data.lead, 'square', nextStart, beat, 0.5, out);
            this._scheduleVoice(data.bass, 'triangle', nextStart, beat, 0.9, out);
            nextStart += loopDur;
          }
        } else {
          nextStart = ctx.currentTime + 0.05;
        }
        this.musicTimer = setTimeout(schedule, 250);
      };
      schedule();
    } catch (e) { /* ignore */ }
  }

  // One note on the music bus, for scenes that sequence their own music (PartyScene: tempo speeds up).
  note(n, dur, type = 'square', vol = 0.5) {
    try {
      const ctx = this._ensure();
      if (!ctx || ctx.state !== 'running' || !freq(n)) return;
      this._tone(type, freq(n), 0, ctx.currentTime, dur, vol, this.musicGain);
    } catch (e) { /* ignore */ }
  }

  _scheduleVoice(notes, type, start, beat, vol, out) {
    let t = start;
    for (const [n, b] of notes) {
      const f = freq(n);
      const dur = b * beat;
      if (f > 0) this._tone(type, f, 0, t, dur * 0.9, vol, out);
      t += dur;
    }
  }

  stopMusic() {
    if (this.musicTimer) clearTimeout(this.musicTimer);
    this.musicTimer = null;
    this.currentTrack = null;
    // Disconnecting the per-track gain silences notes already scheduled ahead.
    if (this.trackGain) {
      try { this.trackGain.disconnect(); } catch (e) { /* ignore */ }
      this.trackGain = null;
    }
  }
}

export const audio = new Audio8bit();
export default audio;
