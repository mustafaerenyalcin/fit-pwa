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

  // Soft bubble pop for micro-interactions
  pop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
      this.haptic(15);
    } catch {}
  }

  // Metal gym bell / ding for set completion or PR
  bellDing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.haptic([30, 40, 60]);
    try {
      const now = this.ctx.currentTime;
      const fundamental = 1174.66; // D6
      const overtone = 2349.32; // D7

      [fundamental, overtone].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        const vol = i === 0 ? 0.3 : 0.15;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
      });
    } catch {}
  }

  // Refreshing liquid bubble / water drop sound
  waterSplash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.haptic([25, 35]);
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.16);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch {}
  }

  // Cheerful double chime for XP gain and habit completion
  xpGain() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.haptic([20, 20, 40]);
    try {
      const now = this.ctx.currentTime;
      const notes = [784, 1046.5]; // G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.38);
      });
    } catch {}
  }

  // Party confetti popper
  confettiPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.haptic([40, 30, 80]);
    try {
      const now = this.ctx.currentTime;
      // Low air 'thump'
      const thumbOsc = this.ctx.createOscillator();
      const thumbGain = this.ctx.createGain();
      thumbOsc.type = 'sine';
      thumbOsc.frequency.setValueAtTime(160, now);
      thumbOsc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      thumbGain.gain.setValueAtTime(0.3, now);
      thumbGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      thumbOsc.connect(thumbGain);
      thumbGain.connect(this.ctx.destination);
      thumbOsc.start(now);
      thumbOsc.stop(now + 0.13);

      // High sparkle notes
      [1318.5, 1567.98, 2093].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + 0.04 + idx * 0.04);
        g.gain.setValueAtTime(0.15, now + 0.04 + idx * 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.04 + idx * 0.04 + 0.4);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now + 0.04 + idx * 0.04);
        osc.stop(now + 0.04 + idx * 0.04 + 0.42);
      });
    } catch {}
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

  // Hipertrofi Tempo Metronomu (3-1-1-0 Ritim Tıklaması)
  tempoTick(phase = 'down') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = phase === 'up' ? 880 : phase === 'pause' ? 580 : 380;
      const dur = phase === 'up' ? 0.12 : 0.06;
      const vol = phase === 'up' ? 0.35 : 0.18;

      osc.type = phase === 'up' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
      this.haptic(phase === 'up' ? [20, 30] : 15);
    } catch {}
  }

  // 40Hz Nöral Odaklanma Dalgası (PR Öncesi Sinir Sistemi Uyarımı)
  neuralPulse(durationSec = 4) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const carrier = this.ctx.createOscillator();
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const masterGain = this.ctx.createGain();

      // 40Hz Gamma frequency modulation for peak athletic focus
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(216, now); // Alpha-Beta bridge carrier

      mod.type = 'sine';
      mod.frequency.setValueAtTime(40, now); // 40Hz Gamma

      modGain.gain.setValueAtTime(0.4, now);
      mod.connect(modGain.gain);

      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.22, now + 0.8);
      masterGain.gain.setValueAtTime(0.22, now + durationSec - 0.8);
      masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

      carrier.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      mod.start(now);
      carrier.start(now);
      mod.stop(now + durationSec);
      carrier.stop(now + durationSec);

      this.haptic([40, 60, 40, 60, 80]);
    } catch {}
  }

  // Kulaklık İçi Sesli Antrenör (In-Ear Voice Coach via Web Speech API)
  speak(text, lang = 'tr-TR') {
    if (!this.enabled || typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.05; // Slightly athletic pace
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select female or natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }
}

export const sounds = new SoundEngine();
