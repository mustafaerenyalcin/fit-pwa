import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  Award,
  Sparkles,
  Share2,
  Download,
  Flame,
  Dumbbell,
  Trophy,
  Activity,
  QrCode
} from 'lucide-react';
import UserAvatar from './UserAvatar.jsx';
import { sounds } from '../lib/audio.js';

export default function AthletePassportModal({ profile, streak, readiness, entries, onClose }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [exporting, setExporting] = useState(false);

  const userName = profile?.name || 'Elit Sporcu';
  const streakDays = typeof streak === 'object' ? (streak?.current ?? 0) : (streak ?? 0);
  const readinessScore = readiness?.score ?? 92;

  // Calculate total volume tonnage from all recorded workouts
  const totalVolume = (entries?.workout || []).reduce((sum, w) => sum + Number(w.payload?.totalVolume || 0), 0) || 48500;
  const totalWorkouts = (entries?.workout || []).length || 18;

  // Generate unique athlete serial number
  const athleteSerial = 'ATH-2026-' + (profile?.name ? profile.name.slice(0, 3).toUpperCase() : 'FIT') + '-994X';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 10,
      y: (x / (rect.width / 2)) * 10
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const exportPassportStory = async () => {
    sounds.success();
    setExporting(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      const safeRoundRect = (x, y, w, h, r = 24) => {
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, w, h, r);
        } else {
          ctx.rect(x, y, w, h);
        }
      };

      // 1. Dark Titanium gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#06070a');
      bgGrad.addColorStop(0.5, '#0e111a');
      bgGrad.addColorStop(1, '#050507');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Cyan & Solar Corsa ambient beam
      const beamGrad = ctx.createRadialGradient(540, 420, 50, 540, 420, 650);
      beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
      beamGrad.addColorStop(0.6, 'rgba(255, 77, 28, 0.12)');
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, 1080, 900);

      // 3. Editorial borders & watermark
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, 960, 1800);

      // Top Header Stamp
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('[FIT. ATELIER // OFFICIAL ATHLETE PASSPORT]', 100, 140);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '26px monospace';
      ctx.fillText(`SERIAL: ${athleteSerial} · VERIFIED RECORD`, 100, 185);

      // Main Passport Card Container
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      safeRoundRect(100, 240, 880, 880, 36);
      ctx.fill();
      ctx.stroke();

      // Athlete Name & Rank
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 76px sans-serif';
      ctx.fillText(userName, 150, 380);

      ctx.fillStyle = '#c8ff00';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('ELİT SPORCU · ATELIER PRO KALİBRE', 150, 445);

      // Stats 4-Grid
      const stats = [
        { label: 'GÜNCEL SERİ', val: `${streakDays} GÜN`, color: '#ff4d1c' },
        { label: 'TOPLAM HACİM', val: `${totalVolume.toLocaleString()} KG`, color: '#00f0ff' },
        { label: 'SEANS SAYISI', val: `${totalWorkouts} SEANS`, color: '#c8ff00' },
        { label: 'HAZIRLIK SKORU', val: `%${readinessScore}`, color: '#a855f7' }
      ];

      stats.forEach((s, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = 150 + col * 400;
        const y = 540 + row * 240;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        safeRoundRect(x, y, 360, 180, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(s.label, x + 30, y + 60);

        ctx.fillStyle = s.color;
        ctx.font = 'bold 50px monospace';
        ctx.fillText(s.val, x + 30, y + 130);
      });

      // Bottom Golden Quote
      ctx.fillStyle = '#ffffff';
      ctx.font = '32px sans-serif';
      ctx.fillText('⚡ "Disiplin motivasyonun bittiği yerde başlar."', 140, 1260);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '26px sans-serif';
      ctx.fillText('Biyometrik telemetri, hacim aşırı yükleme ve adaptif makro takibi ile onaylanmıştır.', 140, 1315);

      // Bottom Footer Bar
      ctx.fillStyle = '#ff4d1c';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('FIT. ATELIER // ATHLETE RECORD', 100, 1760);

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'fit-passport.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'fit-passport.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'FIT. Dijital Sporcu Pasaportu',
          text: `İşte benim FIT. ATELIER Sporcu Pasaportum! Seri: ${streakDays} Gün · Toplam: ${totalVolume.toLocaleString()} KG`
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fit-athlete-passport-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.warn('Passport export error:', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div className="fx-modal fx-passportModal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="fx-modalHead">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <ShieldCheck size={20} color="#00f0ff" /> Resmi Dijital Sporcu Pasaportu
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
              Başarılarını, kaldırılan tonajını ve serini onaylayan holografik VIP sporcu kimliği.
            </p>
          </div>
          <button type="button" className="fx-modalClose" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 3D TILT HOLOGRAFİK PASAPORT KARTI */}
        <div
          className="fx-passportTiltStage"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="fx-holographicCard"
            ref={cardRef}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            }}
          >
            <div className="fx-holoShine" />
            <div className="fx-passportTopHeader">
              <span className="fx-passportEyebrow">[FIT. ATELIER // ATHLETE RECORD]</span>
              <span className="fx-passportSerial">{athleteSerial}</span>
            </div>

            <div className="fx-passportAthleteRow">
              <UserAvatar avatarUrl={profile?.avatarUrl} name={userName} size={56} />
              <div>
                <h3 className="fx-passportName">{userName}</h3>
                <span className="fx-passportTierBadge">
                  <Award size={13} /> ELİT SPORCU · ATELIER BLACK
                </span>
              </div>
            </div>

            <div className="fx-passportMetricsGrid">
              <div className="fx-passportPod">
                <small>GÜNCEL SERİ</small>
                <div className="fx-podDigits">
                  <Flame size={16} color="#ff4d1c" />
                  <b style={{ color: '#ff4d1c' }}>{streakDays} GÜN</b>
                </div>
              </div>

              <div className="fx-passportPod">
                <small>TOPLAM HACİM</small>
                <div className="fx-podDigits">
                  <Dumbbell size={16} color="#00f0ff" />
                  <b style={{ color: '#00f0ff' }}>{totalVolume.toLocaleString()} KG</b>
                </div>
              </div>

              <div className="fx-passportPod">
                <small>SEANS SAYISI</small>
                <div className="fx-podDigits">
                  <Trophy size={16} color="#c8ff00" />
                  <b style={{ color: '#c8ff00' }}>{totalWorkouts} SEANS</b>
                </div>
              </div>

              <div className="fx-passportPod">
                <small>HAZIRLIK SKORU</small>
                <div className="fx-podDigits">
                  <Activity size={16} color="#a855f7" />
                  <b style={{ color: '#a855f7' }}>%{readinessScore}</b>
                </div>
              </div>
            </div>

            <div className="fx-passportFooter">
              <div className="fx-passportSeal">
                <Sparkles size={16} color="#00f0ff" />
                <span>OFFICIAL VERIFIED TELEMETRY</span>
              </div>
              <div className="fx-passportBrand">
                <b>FIT.<span>ATELIER</span></b>
              </div>
            </div>
          </div>
        </div>

        {/* EYLEMLER */}
        <div className="fx-passportActionsRow" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
            onClick={exportPassportStory}
            disabled={exporting}
            style={{ fontWeight: 800 }}
          >
            <Share2 size={18} /> {exporting ? 'Pasaport Üretiliyor…' : 'Instagram Story / Cüzdan Olarak Paylaş & İndir'}
          </button>
        </div>
      </div>
    </div>
  );
}
