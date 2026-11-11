import React, { useRef, useState } from 'react';
import { Trophy, Share2, Download, Check, Flame, Clock, Dumbbell, Sparkles } from 'lucide-react';

/**
 * Antrenman tamamlandığında ekrana gelen Strava / Hevy tarzı Zafer Kartı.
 * HTML5 Canvas ile yüksek çözünürlüklü (1080x1350) paylaşım görseli üretir,
 * Web Share API destekleniyorsa doğrudan paylaşır, değilse PNG olarak indirir.
 */
export default function WorkoutSummaryCard({
  planName,
  planFocus,
  elapsedSeconds,
  totalVolume,
  completedSetsCount,
  exercises = [],
  newPRs = [],
  onConfirmFinish
}) {
  const [sharing, setSharing] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const canvasRef = useRef(null);

  const minutes = Math.max(1, Math.round((elapsedSeconds || 0) / 60));
  const xpEarned = 120 + completedSetsCount * 10 + Math.floor((totalVolume || 0) / 250) * 15 + newPRs.length * 50;

  const generateCanvasBlob = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // Arka plan gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    bgGrad.addColorStop(0, '#0b1018');
    bgGrad.addColorStop(0.55, '#131f2e');
    bgGrad.addColorStop(1, '#0e1722');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Dekoratif neon yeşil ışık halkası
    const glow = ctx.createRadialGradient(880, 220, 20, 880, 220, 420);
    glow.addColorStop(0, 'rgba(179, 244, 111, 0.25)');
    glow.addColorStop(1, 'rgba(179, 244, 111, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1350);

    // Marka logosu
    ctx.fillStyle = '#ecf1f8';
    ctx.font = '900 72px system-ui, -apple-system, sans-serif';
    ctx.fillText('fit', 80, 130);
    ctx.fillStyle = '#b3f46f';
    ctx.fillText('.', 162, 130);

    // Tarih
    ctx.fillStyle = '#8b9aad';
    ctx.font = '600 28px system-ui, -apple-system, sans-serif';
    const dateStr = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    ctx.fillText(dateStr.toUpperCase(), 80, 185);

    // Başlık
    ctx.fillStyle = '#b3f46f';
    ctx.font = '800 26px system-ui, -apple-system, sans-serif';
    ctx.fillText('ANTRENMAN TAMAMLANDI', 80, 275);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px system-ui, -apple-system, sans-serif';
    ctx.fillText((planName || 'Antrenman').slice(0, 28), 80, 350);

    if (planFocus) {
      ctx.fillStyle = '#9aa8ba';
      ctx.font = '500 32px system-ui, -apple-system, sans-serif';
      ctx.fillText(planFocus.slice(0, 45), 80, 405);
    }

    // 3 Büyük İstatistik Kutusu
    const stats = [
      { label: 'SÜRE', value: `${minutes} dk` },
      { label: 'TOPLAM TONAJ', value: `${(totalVolume || 0).toLocaleString('tr-TR')} kg` },
      { label: 'TAMAMLANAN SET', value: `${completedSetsCount} set` }
    ];

    stats.forEach((st, idx) => {
      const x = 80 + idx * 315;
      const y = 460;
      ctx.fillStyle = 'rgba(24, 34, 47, 0.9)';
      ctx.strokeStyle = 'rgba(179, 244, 111, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, 290, 170, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#8b9aad';
      ctx.font = '800 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(st.label, x + 28, y + 55);

      ctx.fillStyle = '#b3f46f';
      ctx.font = '900 46px system-ui, -apple-system, sans-serif';
      ctx.fillText(st.value, x + 28, y + 125);
    });

    // Hareket Özeti Listesi
    ctx.fillStyle = '#ecf1f8';
    ctx.font = '800 30px system-ui, -apple-system, sans-serif';
    ctx.fillText('HAREKET ÖZETİ', 80, 710);

    const activeEx = exercises
      .map((ex) => {
        const doneSets = (ex.sets || []).filter((s) => s.done || (s.kg && s.reps));
        const bestKg = doneSets.reduce((m, s) => Math.max(m, Number(s.kg) || 0), 0);
        return { name: ex.name, count: doneSets.length, bestKg };
      })
      .filter((e) => e.count > 0)
      .slice(0, 6);

    activeEx.forEach((ex, idx) => {
      const y = 770 + idx * 72;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(80, y - 42, 920, 58, 14);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 28px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${idx + 1}. ${ex.name}`, 104, y - 4);

      ctx.fillStyle = '#b3f46f';
      ctx.font = '800 26px system-ui, -apple-system, sans-serif';
      const rightText = ex.bestKg > 0 ? `${ex.count} set · En yüksek ${ex.bestKg} kg` : `${ex.count} set`;
      ctx.fillText(rightText, 640, y - 4);
    });

    // Alt Bilgi
    ctx.fillStyle = '#8b9aad';
    ctx.font = '600 26px system-ui, -apple-system, sans-serif';
    ctx.fillText(`+${xpEarned} XP kazanıldı · Fit Kişisel AI Spor Koçu`, 80, 1275);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  };

  const handleShareOrDownload = async () => {
    setSharing(true);
    try {
      const blob = await generateCanvasBlob();
      if (!blob) return;
      const file = new File([blob], `fit-antrenman-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${planName} Tamamlandı!`,
          text: `${planName}: ${minutes} dk, ${totalVolume} kg toplam tonaj! 💪`,
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fit-zafer-karti-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 15000);
        setDownloaded(true);
      }
    } catch (err) {
      console.error('Paylaşım hatası:', err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fx-victoryCard">
      <div className="fx-victoryGlow" />
      <div className="fx-victoryBadge">
        <Trophy size={32} />
      </div>
      <span className="fx-eyebrow" style={{ justifyContent: 'center' }}>
        <Sparkles size={13} /> SEANS TAMAMLANDI · +{xpEarned} XP
      </span>
      <h2>{planName}</h2>
      {planFocus && <p className="fx-muted">{planFocus}</p>}

      <div className="fx-victoryStats">
        <div>
          <Clock size={16} />
          <b>{minutes} dk</b>
          <small>Süre</small>
        </div>
        <div>
          <Dumbbell size={16} />
          <b>{(totalVolume || 0).toLocaleString('tr-TR')} kg</b>
          <small>Toplam Tonaj</small>
        </div>
        <div>
          <Flame size={16} />
          <b>{completedSetsCount} set</b>
          <small>Tamamlanan</small>
        </div>
      </div>

      {newPRs.length > 0 && (
        <div className="fx-prBanner">
          <b>🏆 Yeni Kişisel Rekor (PR)!</b>
          <ul>
            {newPRs.map((pr, i) => (
              <li key={i}>
                {pr.name}: <strong>{pr.kg} kg</strong> × {pr.reps} tekrar
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="fx-victoryExList">
        {exercises.map((ex, idx) => {
          const done = (ex.sets || []).filter((s) => s.done || (s.kg && s.reps));
          if (!done.length) return null;
          const maxKg = done.reduce((m, s) => Math.max(m, Number(s.kg) || 0), 0);
          return (
            <div key={idx} className="fx-victoryExRow">
              <span>
                <b>{ex.name}</b>
              </span>
              <small>
                {done.length} set {maxKg > 0 ? `· maks ${maxKg} kg` : ''}
              </small>
            </div>
          );
        })}
      </div>

      <canvas ref={canvasRef} hidden />

      <div className="fx-victoryActions">
        <button
          type="button"
          className="fx-btn fx-btn--ghost fx-btn--lg"
          onClick={handleShareOrDownload}
          disabled={sharing}
        >
          {downloaded ? <Check size={18} /> : <Share2 size={18} />}
          {sharing ? 'Hazırlanıyor…' : downloaded ? 'Görsel İndirildi' : 'Zafer Kartını Paylaş / İndir'}
        </button>

        <button type="button" className="fx-btn fx-btn--primary fx-btn--lg" onClick={onConfirmFinish}>
          <Check size={18} /> Antrenmanı Kaydet ve Bitir
        </button>
      </div>
    </div>
  );
}
