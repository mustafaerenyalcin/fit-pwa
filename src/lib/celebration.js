/**
 * FIT. ATELIER — High-Performance Particle Celebration & Micro-Motion Engine
 * Zero dependencies, pure HTML5 Canvas + Web Animations API.
 * Provides dopamine-inducing particle fireworks, electric sparks, water ripples, and floating XP badges.
 */

import { sounds } from './audio.js';

class CelebrationEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animId = null;
    this.width = 0;
    this.height = 0;
  }

  ensureCanvas() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'fx-celebrationCanvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 99999;
      `;
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d', { alpha: true });

      const resize = () => {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        if (this.ctx) this.ctx.scale(dpr, dpr);
      };

      window.addEventListener('resize', resize, { passive: true });
      resize();
    }
    return !!this.ctx;
  }

  animate() {
    if (!this.ctx || !this.particles.length) {
      if (this.canvas && this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
      this.animId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.spin;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.shape === 'rect') {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 'circle') {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'spark') {
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-p.size, 0);
        this.ctx.lineTo(p.size, 0);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    if (!this.animId) {
      this.animId = requestAnimationFrame(() => this.animate());
    }
  }

  // Multi-color Confetti Shower (Workouts, Streaks, Level-ups)
  confetti({ x = window.innerWidth / 2, y = window.innerHeight / 2, count = 65, playAudio = true } = {}) {
    if (!this.ensureCanvas()) return;
    if (playAudio) sounds.confettiPop();

    const colors = ['#c8ff00', '#00f0ff', '#ffd700', '#ff3366', '#ffffff', '#a855f7'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 6 + Math.random() * 12;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        gravity: 0.28,
        drag: 0.95,
        size: 7 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.25,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.015,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    this.startAnimation();
  }

  // Golden / Neon Electric Sparks (Set Completion, PRs, Calculation Buttons)
  sparks({ x = window.innerWidth / 2, y = window.innerHeight / 2, count = 28, color = '#c8ff00', playAudio = true } = {}) {
    if (!this.ensureCanvas()) return;
    if (playAudio) sounds.bellDing();

    const colors = [color, '#ffffff', '#ffd700', '#fff077'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.14,
        drag: 0.92,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: angle,
        spin: 0.1,
        alpha: 1,
        decay: 0.025 + Math.random() * 0.03,
        shape: Math.random() > 0.5 ? 'spark' : 'circle'
      });
    }

    this.startAnimation();
  }

  // Liquid Splash Effect (Water tracking, Hydration Lab)
  waterSplash({ x = window.innerWidth / 2, y = window.innerHeight / 2, count = 22, playAudio = true } = {}) {
    if (!this.ensureCanvas()) return;
    if (playAudio) sounds.waterSplash();

    const waterColors = ['#00f0ff', '#38bdf8', '#0284c7', '#ffffff', '#7dd3fc'];

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 5 + Math.random() * 10;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.35,
        drag: 0.94,
        size: 4 + Math.random() * 6,
        color: waterColors[Math.floor(Math.random() * waterColors.length)],
        rotation: 0,
        spin: 0,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02,
        shape: 'circle'
      });
    }

    this.startAnimation();
  }

  // Floating XP / Reward Pill that floats upward from tap coordinate
  floatingBadge({ text = '+50 XP', x, y, icon = '⚡', color = '#c8ff00' } = {}) {
    if (typeof document === 'undefined') return;

    const badge = document.createElement('div');
    badge.className = 'fx-floatingXpBadge';
    badge.innerHTML = `<span class="fx-xpIcon">${icon}</span><span>${text}</span>`;

    const startX = x !== undefined ? x : window.innerWidth / 2;
    const startY = y !== undefined ? y : window.innerHeight / 2;

    badge.style.left = `${startX}px`;
    badge.style.top = `${startY}px`;
    badge.style.borderColor = color;
    badge.style.color = color;
    badge.style.boxShadow = `0 0 18px ${color}55`;

    document.body.appendChild(badge);

    setTimeout(() => {
      badge.remove();
    }, 1300);
  }
}

export const celebration = new CelebrationEngine();
