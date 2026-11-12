import React, { useState } from 'react';
import { Flame, Shield, ShieldAlert, ShieldCheck, Trophy, Sparkles, Check, Zap, AlertTriangle, Calendar } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function StreakVaultModal({ streak = {}, onClose, onUseShield }) {
  const [shieldActive, setShieldActive] = useState(streak.shieldUsed || false);
  const [shieldsLeft, setShieldsLeft] = useState(streak.shieldsRemaining ?? 2);
  const [justActivated, setJustActivated] = useState(false);

  const isAtRisk = !streak.loggedToday && !shieldActive && streak.current > 0;

  const handleActivateShield = () => {
    if (shieldsLeft <= 0 || shieldActive) return;
    sounds.success();
    setShieldActive(true);
    setShieldsLeft((prev) => Math.max(0, prev - 1));
    setJustActivated(true);

    try {
      localStorage.setItem('fit-active-shield-today', 'true');
    } catch {}

    if (onUseShield) onUseShield();
  };

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div className="fx-modal fx-streakVaultModal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fx-modalClose" onClick={onClose} aria-label="Kapat">
          ✕
        </button>

        {/* ALEV ANİMASYONLU KOR BAŞLIK */}
        <div className="fx-vaultHeader">
          <div className="fx-vaultFlameAura">
            <div className={`fx-vaultFlamePulse ${isAtRisk ? 'risk' : 'flaming'}`}>
              <Flame size={54} className="fx-vaultBigFlame" />
            </div>
          </div>

          <div className="fx-vaultCount">
            <strong>{streak.current || 0}</strong>
            <span>GÜN SERİ</span>
          </div>

          {/* SERİ DURUM PİLİ */}
          <div className="fx-vaultStatusBeacon">
            {streak.loggedToday ? (
              <span className="fx-statusPill safe">
                <Check size={14} /> Bugünkü Seri Kilitlendi
              </span>
            ) : shieldActive ? (
              <span className="fx-statusPill shielded">
                <ShieldCheck size={14} /> Dinlenme Kalkanı Devrede (Serin Güvende)
              </span>
            ) : isAtRisk ? (
              <span className="fx-statusPill danger">
                <AlertTriangle size={14} /> Tehlikede! Bugün Seans Yap veya Kalkanı Aç
              </span>
            ) : (
              <span className="fx-statusPill neutral">
                <Sparkles size={14} /> Bugün İlk Adımı At &amp; Seriyi Başlat
              </span>
            )}
          </div>
        </div>

        {/* 7 GÜNLÜK SERİ TAKVİMİ */}
        <div className="fx-vaultWeekTrack">
          <span className="fx-vaultSubLabel">SON 7 GÜNÜN SERİ ZİNCİRİ:</span>
          <div className="fx-vaultDaysRow">
            {(streak.last7 || []).map((dayItem, idx) => {
              const active = dayItem.active;
              const isToday = dayItem.isToday;
              return (
                <div
                  key={idx}
                  className={`fx-vaultDayCell ${active ? 'active' : ''} ${isToday ? 'today' : ''}`}
                >
                  <span className="fx-vaultDayName">{dayItem.label}</span>
                  <div className="fx-vaultDayFlame">
                    {active ? (
                      <Flame size={16} color="#ff4d1c" />
                    ) : isToday && shieldActive ? (
                      <Shield size={14} color="#00f0ff" />
                    ) : (
                      <span className="fx-vaultEmptyDot" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DİNLENME VE SERİ KALKANLARI KASASI */}
        <div className="fx-vaultShieldPod">
          <div className="fx-shieldPodHead">
            <div className="fx-shieldTitleRow">
              <Shield size={18} color="#00f0ff" />
              <h4>Haftalık Dinlenme Kalkanları</h4>
            </div>
            <span className="fx-shieldBadge">{shieldsLeft} / 2 HAZIR</span>
          </div>

          <p className="fx-shieldDesc">
            Hastalık, yoğun seyahat veya zorunlu dinlenme günlerinde serin sıfırlanmasın. Kalkanı aktif ettiğinde bugünkü serin donar ve korunur.
          </p>

          {justActivated ? (
            <div className="fx-shieldSuccessBanner animate-fade-in">
              <ShieldCheck size={16} color="#00f0ff" />
              <span>Kalkan Aktif Edildi! Bugünü dinlenerek geçirebilirsin.</span>
            </div>
          ) : shieldActive ? (
            <button type="button" className="fx-btn fx-btn--block fx-shieldBtn active" disabled>
              <ShieldCheck size={16} /> Dinlenme Kalkanı Bugün Devrede
            </button>
          ) : (
            <button
              type="button"
              className="fx-btn fx-btn--block fx-shieldBtn"
              onClick={handleActivateShield}
              disabled={shieldsLeft <= 0}
            >
              <Shield size={16} />
              {shieldsLeft > 0 ? 'Bugün İçin Kalkanı Devreye Sok (1 Kalkan Kullan)' : 'Kalkan Hakkın Kalmadı'}
            </button>
          )}
        </div>

        {/* SPORCU REKORU & MOTİVASYON */}
        <div className="fx-vaultMetaFooter">
          <div className="fx-vaultRecordItem">
            <Trophy size={16} color="#f5c451" />
            <div>
              <small>EN İYİ SERİ REKORUN</small>
              <b>{streak.best || streak.current || 0} Gün Kesintisiz</b>
            </div>
          </div>
          <div className="fx-vaultRecordItem">
            <Zap size={16} color="#ff4d1c" />
            <div>
              <small>TOPLAM AKTİF GÜN</small>
              <b>{streak.totalActiveDays || 0} Gün Salonda</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
