import React, { useRef, useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Flame,
  Coffee,
  Utensils,
  Share2,
  CheckCircle2,
  Sparkles,
  Award,
  Zap
} from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function WagerContractModal({ profile, buddy, stake, onClose }) {
  const [signed, setSigned] = useState(false);
  const [exporting, setExporting] = useState(false);

  const myName = profile?.name || 'Sen';
  const buddyName = buddy?.name || 'Gym Buddy';
  const stakeTitle = stake?.title || 'Kahve Ismarlama İddiası';
  const penaltyNote = stake?.penaltyNote || 'Seriyi ilk bozan diğerine büyük boy kahve ısmarlar!';

  const handleSign = () => {
    sounds.success();
    setSigned(true);
  };

  const exportDuelStory = async () => {
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

      // 1. Dark duel background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#090a0f');
      bgGrad.addColorStop(0.5, '#16111f');
      bgGrad.addColorStop(1, '#06070a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Dual energy beam (Cyan vs Orange)
      const cyanGlow = ctx.createRadialGradient(280, 600, 50, 280, 600, 500);
      cyanGlow.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      cyanGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 300, 540, 800);

      const orangeGlow = ctx.createRadialGradient(800, 600, 50, 800, 600, 500);
      orangeGlow.addColorStop(0, 'rgba(255, 77, 28, 0.35)');
      orangeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orangeGlow;
      ctx.fillRect(540, 300, 540, 800);

      // 3. Borders & Watermarks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, 960, 1800);

      // Header Stamp
      ctx.fillStyle = '#ff4d1c';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('[FIT. ATELIER // SQUAD WAGER DUEL]', 100, 140);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '26px monospace';
      ctx.fillText('RESMİ CENTİLMENLİK VE SERİ İDDİA SÖZLEŞMESİ', 100, 185);

      // Main Duel Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 74px sans-serif';
      ctx.fillText('KİM ÖNCE PES EDECEK?', 100, 300);

      // Player 1 Box (Left)
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      safeRoundRect(100, 380, 410, 440, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('YARIŞMACI 01', 140, 440);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 58px sans-serif';
      ctx.fillText(myName, 140, 540);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px sans-serif';
      ctx.fillText('🔥 Kararlı & Hazır', 140, 610);

      // VS Badge (Center)
      ctx.fillStyle = '#f5c451';
      ctx.font = 'bold 64px monospace';
      ctx.fillText('VS', 505, 620);

      // Player 2 Box (Right)
      ctx.fillStyle = 'rgba(255, 77, 28, 0.08)';
      ctx.strokeStyle = '#ff4d1c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      safeRoundRect(570, 380, 410, 440, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff4d1c';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('YARIŞMACI 02', 610, 440);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 58px sans-serif';
      ctx.fillText(buddyName, 610, 540);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px sans-serif';
      ctx.fillText('⚔️ Meydan Okuyan', 610, 610);

      // Stake & Penalty Card (Big Middle)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      safeRoundRect(100, 870, 880, 360, 32);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f5c451';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('İDDİA VE CEZAİ ŞART (THE STAKE):', 150, 940);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px sans-serif';
      ctx.fillText(stakeTitle.toUpperCase(), 150, 1020);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '32px sans-serif';
      ctx.fillText(`" ${penaltyNote} "`, 150, 1100);

      // Rules Checklist
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('📋 SÖZLEŞME KURALLARI:', 100, 1310);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px sans-serif';
      ctx.fillText('1. Her gün antrenman veya beslenme kaydı zorunludur.', 100, 1370);
      ctx.fillText('2. Dinlenme kalkanı (Streak Shield) haftada en fazla 1 kez kullanılabilir.', 100, 1420);
      ctx.fillText('3. Seriyi ilk bozan taraf cezayı 24 saat içinde yerine getirmekle yükümlüdür.', 100, 1470);

      // Bottom Stamp
      ctx.fillStyle = '#c8ff00';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('✓ RESMİ SQUAD SÖZLEŞMESİ ONAYLANDI', 100, 1600);

      ctx.fillStyle = '#ff4d1c';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('FIT. ATELIER // GYM BUDDY SQUAD', 100, 1780);

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'squad-wager.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'squad-wager.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'FIT. Squad İddia Sözleşmesi',
          text: `${myName} vs ${buddyName} — Düello Başladı! İddia: ${stakeTitle}`
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `squad-wager-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.warn('Wager export error:', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div className="fx-modal fx-contractModal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="fx-modalHead">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <FileText size={20} color="#f5c451" /> Resmi Squad Centilmenlik Sözleşmesi
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
              Arkadaşınla resmi sporcu iddiasına gir; seriyi bozan hesabı ödesin!
            </p>
          </div>
          <button type="button" className="fx-modalClose" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* PARŞÖMEN / TİTANYUM SÖZLEŞME GÖVDESİ */}
        <div className="fx-contractBody">
          <div className="fx-contractStamp">[FIT. ARBITRATION // RESMİ BAĞLAYICI]</div>

          <div className="fx-contractDuelHeader">
            <div className="fx-partyBox left">
              <span className="fx-partyRole">TARAFI (SEN)</span>
              <strong>{myName}</strong>
            </div>
            <div className="fx-duelVsCircle">VS</div>
            <div className="fx-partyBox right">
              <span className="fx-partyRole">MEYDAN OKUNAN</span>
              <strong>{buddyName}</strong>
            </div>
          </div>

          <div className="fx-contractClauseBox">
            <h4>MADDE 1 — İDDİA VE CEZAİ ŞART (THE STAKE)</h4>
            <p>
              İşbu sözleşmenin tarafları, önümüzdeki 30 gün boyunca günlük antrenman disiplinini sürdürmeyi taahhüt eder. 
              Serisini ilk sıfırlayan taraf, diğer tarafa <b>"{stakeTitle}"</b> (<em>{penaltyNote}</em>) ödemeyi kabul ve taahhüt eder.
            </p>
          </div>

          <div className="fx-contractClauseBox">
            <h4>MADDE 2 — HAKEM VE TELEMETRİ</h4>
            <p>
              İtiraz durumunda <b>FIT. ATELIER Bulut Senkronizasyon Kayıtları</b> tek ve kesin delil kabul edilir. 
              Gece 23:59'a kadar kaydedilmeyen seanslar geçersiz sayılır.
            </p>
          </div>

          <div className="fx-contractSignatureRow">
            <div className={`fx-signatureBox ${signed ? 'signed' : ''}`}>
              <small>DİJİTAL İMZA (SEN):</small>
              <div className="fx-sigText">{signed ? `✓ ${myName} (ONAYLANDI)` : 'İmza Bekleniyor'}</div>
            </div>

            <div className="fx-signatureBox signed">
              <small>ONAYLAYAN SİSTEM:</small>
              <div className="fx-sigText">✓ FIT. ATELIER ARBITRATION</div>
            </div>
          </div>
        </div>

        {/* EYLEMLER */}
        <div className="fx-contractActionsRow" style={{ marginTop: 16 }}>
          {!signed ? (
            <button
              type="button"
              className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
              onClick={handleSign}
              style={{ fontWeight: 800 }}
            >
              <Sparkles size={18} /> Sözleşmeyi İmzala ve Düelloyu Başlat
            </button>
          ) : (
            <button
              type="button"
              className="fx-btn fx-solarBtn fx-btn--block fx-btn--lg"
              onClick={exportDuelStory}
              disabled={exporting}
              style={{ fontWeight: 800, background: 'linear-gradient(135deg, #00f0ff 0%, #ff4d1c 100%)' }}
            >
              <Share2 size={18} /> {exporting ? 'Düello Görseli Üretiliyor…' : 'Instagram Story Olarak Paylaş / Arkadaşını Etiketle'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
