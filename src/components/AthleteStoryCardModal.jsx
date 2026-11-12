import React, { useRef, useState } from 'react';
import { X, Download, Share2, Sparkles, Flame, Trophy, Check, Dumbbell, Clock } from 'lucide-react';
import UserAvatar from './UserAvatar.jsx';
import { sounds } from '../lib/audio.js';

export default function AthleteStoryCardModal({
  workoutResult = {},
  profile = {},
  streak = 14,
  readinessScore = 92,
  onClose
}) {
  const cardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const workoutName = workoutResult.name || 'Günün Seansı';
  const durationMins = Math.round((workoutResult.durationSeconds || 3600) / 60);
  const volumeKg = workoutResult.totalVolume || 8450;
  const userName = profile?.name || 'Şampiyon';
  const streakDays = typeof streak === 'object' ? (streak?.current ?? 0) : (streak ?? 0);

  // Render high-res canvas and trigger Web Share API or download
  const handleExportStory = async () => {
    sounds.success();
    setExporting(true);

    try {
      // Create high-res 1080x1920 canvas (9:16 Instagram Story standard)
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
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#12141c');
      bgGrad.addColorStop(1, '#050507');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Solar Corsa ambient beam
      const beamGrad = ctx.createRadialGradient(540, 300, 50, 540, 300, 600);
      beamGrad.addColorStop(0, 'rgba(255, 77, 28, 0.28)');
      beamGrad.addColorStop(1, 'rgba(255, 77, 28, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, 1080, 800);

      // 3. Editorial Watermark & Borders
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, 960, 1800);

      // Top Header Stamp
      ctx.fillStyle = '#ff4d1c';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('[FIT. ATELIER // ATHLETE RECORD]', 100, 140);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px sans-serif';
      ctx.fillText(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), 100, 185);

      // Athlete Name & Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 74px sans-serif';
      ctx.fillText(userName, 100, 300);

      ctx.fillStyle = '#ff7a50';
      ctx.font = '36px sans-serif';
      ctx.fillText(workoutName.toUpperCase(), 100, 360);

      // Big Volume Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 77, 28, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      safeRoundRect(100, 440, 880, 320, 30);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff7a50';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('TOPLAM KALDIRILAN HACİM (TONNAJ)', 140, 510);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 110px monospace';
      ctx.fillText(`${volumeKg.toLocaleString()} KG`, 140, 640);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '32px sans-serif';
      ctx.fillText('⚡ Kas glukojen depoları ve nöral adaptasyon maksimumda.', 140, 710);

      // 3-Metric Horizontal Row
      const metrics = [
        { label: 'SÜRE', val: `${durationMins} DK`, color: '#c8ff00' },
        { label: 'SERİ', val: `${streakDays} GÜN`, color: '#ff4d1c' },
        { label: 'HAZIRLIK', val: `%${readinessScore}`, color: '#00f0ff' }
      ];

      metrics.forEach((m, idx) => {
        const x = 100 + idx * 300;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        safeRoundRect(x, 800, 280, 220, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(m.label, x + 30, 850);

        ctx.fillStyle = m.color;
        ctx.font = 'bold 56px monospace';
        ctx.fillText(m.val, x + 30, 930);
      });

      // Exercises Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      safeRoundRect(100, 1060, 880, 560, 30);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('TAMAMLANAN BİYOMEKANİK HAREKETLER', 140, 1130);

      const exercises = Object.entries(workoutResult.sets || {}).slice(0, 6);
      if (exercises.length > 0) {
        exercises.forEach(([name, data], idx) => {
          const y = 1200 + idx * 65;
          ctx.fillStyle = '#00f0ff';
          ctx.font = 'bold 28px monospace';
          ctx.fillText(`0${idx + 1}`, 140, y);

          ctx.fillStyle = '#ffffff';
          ctx.font = '28px sans-serif';
          ctx.fillText(name.slice(0, 28), 200, y);

          ctx.fillStyle = '#ff7a50';
          ctx.font = 'bold 28px monospace';
          ctx.fillText(`${data.kg} kg × ${data.reps}`, 820, y);
        });
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '32px sans-serif';
        ctx.fillText('Tüm çalışma ve ısınma setleri başarıyla tamamlandı.', 140, 1220);
      }

      // Bottom Footer Stamp & QR placeholder
      ctx.fillStyle = '#ff4d1c';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('FIT.', 100, 1750);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ATELIER', 190, 1750);

      ctx.fillStyle = '#64748b';
      ctx.font = '26px monospace';
      ctx.fillText('PRO ATHLETE RECOVERY & NUTRITION ENGINE // GLOBAL', 100, 1800);

      // Export blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `fit-atelier-${Date.now()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'FIT. ATELIER Seans Raporu',
              text: `${userName} bugün ${volumeKg} kg hacim kaldırdı! 🔥`
            });
            setExporting(false);
            return;
          } catch {}
        }

        // Fallback: Trigger browser image download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fit-atelier-story-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
      }, 'image/png');
    } catch (e) {
      console.error('Story export error:', e);
      setExporting(false);
    }
  };

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div className="fx-modal fx-storyCardModal" onClick={(e) => e.stopPropagation()}>
        <div className="fx-modalHead">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Trophy size={18} color="#ff4d1c" /> Athlete Story Kartı (Instagram / WhatsApp)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
              Başarını ve kaldırılan hacmini 9:16 formatında heykelsi bir kart olarak paylaş.
            </p>
          </div>
          <button type="button" className="fx-modalClose" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 9:16 ÖNİZLEME KARTI */}
        <div className="fx-storyPreviewContainer">
          <div className="fx-storyVisualCard" ref={cardRef}>
            <div className="fx-storyCardTop">
              <span className="fx-storyEyebrow">[FIT. ATELIER // RECORD]</span>
              <small>{new Date().toLocaleDateString('tr-TR')}</small>
            </div>

            <div className="fx-storyAthleteRow">
              <UserAvatar avatarUrl={profile?.avatarUrl} name={userName} size={44} />
              <div>
                <h4>{userName}</h4>
                <span>{workoutName}</span>
              </div>
            </div>

            <div className="fx-storyBigVolume">
              <small>TOPLAM HACİM (TONNAJ)</small>
              <div className="fx-volumeDigits">
                <b className="fx-monoVal">{volumeKg.toLocaleString()}</b> <span>KG</span>
              </div>
            </div>

            <div className="fx-storyTrioRow">
              <div className="fx-storyTrioBox">
                <small>SÜRE</small>
                <b style={{ color: '#c8ff00' }}>{durationMins} dk</b>
              </div>
              <div className="fx-storyTrioBox">
                <small>SERİ</small>
                <b style={{ color: '#ff4d1c' }}>{streakDays} gün</b>
              </div>
              <div className="fx-storyTrioBox">
                <small>HAZIRLIK</small>
                <b style={{ color: '#00f0ff' }}>%{readinessScore}</b>
              </div>
            </div>

            <div className="fx-storyFooterWatermark">
              <b>FIT.<span>ATELIER</span></b>
              <small>EDİTORYAL PERFORMANS LABORATUVARI</small>
            </div>
          </div>
        </div>

        {/* EYLEM BUTONLARI */}
        <div className="fx-storyActionsRow">
          <button
            type="button"
            className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
            onClick={handleExportStory}
            disabled={exporting}
          >
            <Share2 size={18} /> {exporting ? 'Kart Üretiliyor…' : 'Instagram Story Olarak Paylaş / İndir'}
          </button>
        </div>
      </div>
    </div>
  );
}
