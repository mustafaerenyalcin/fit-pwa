/**
 * Web Audio & Haptic Feedback Engine
 * No external audio files needed; uses Web Audio API oscillators and Vibration API.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft click / tap feedback
  tap() {
    this.haptic(20);
  }

  // Haptic vibration if supported (mobile)
  haptic(duration = 40) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch {}
    }
  }

  // Timer finished bell chime
  chime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.haptic([60, 50, 100]);

    try {
      const now = this.ctx.currentTime;

      // Dual tone pleasant chime (880Hz + 1320Hz - A5 & E6)
      const playTone = (freq, start, dur, vol = 0.25) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      };

      playTone(880, now, 0.6, 0.25);
      playTone(1320, now + 0.12, 0.8, 0.2);
      playTone(1760, now + 0.24, 1.0, 0.15);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Success fan-fare for workout completion
  success() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.haptic([80, 40, 80, 40, 120]);

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const start = now + idx * 0.12;
        const dur = idx === notes.length - 1 ? 0.9 : 0.4;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch (e) {
      console.warn('Success audio error:', e);
    }
  }
}

export const sounds = new SoundEngine();
