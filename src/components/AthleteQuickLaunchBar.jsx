import React from 'react';
import { Play, Scan, Sparkles, Droplets, Clock, Users, Flame, ChevronRight } from 'lucide-react';
import { sounds } from '../lib/audio.js';

export default function AthleteQuickLaunchBar({
  plan,
  onStartWorkout,
  onOpenBarcode,
  onNavigate,
  onQuickWaterAdd
}) {
  return (
    <div className="fx-quickLaunchSection">
      <div className="fx-quickLaunchTrack">
        {/* 1. ANINDA ANTRENMAN BAŞLAT */}
        <button
          type="button"
          className="fx-quickLaunchCard fx-quickLaunchCard--workout"
          onClick={() => {
            sounds.tap();
            onStartWorkout(plan);
          }}
        >
          <div className="fx-quickLaunchIconBox">
            <Flame size={20} color="#ff4d1c" />
          </div>
          <div className="fx-quickLaunchBody">
            <span className="fx-quickLaunchTag">GÜNÜN SEANSI</span>
            <b>{plan.name || 'Antrenman'}</b>
            <small>{plan.moves?.length || 5} Hareket · Hemen Başla →</small>
          </div>
        </button>

        {/* 2. KAMERA İLE BARKOD TARA */}
        <button
          type="button"
          className="fx-quickLaunchCard fx-quickLaunchCard--barcode"
          onClick={() => {
            sounds.tap();
            onOpenBarcode();
          }}
        >
          <div className="fx-quickLaunchIconBox">
            <Scan size={20} color="#00f0ff" />
          </div>
          <div className="fx-quickLaunchBody">
            <span className="fx-quickLaunchTag">SIFIR PAYWALL</span>
            <b>Barkod Tara</b>
            <small>Kamerayla Anında Besin Ekle</small>
          </div>
        </button>

        {/* 3. AI FORM & BİYOMEKANİK KONTROL */}
        <button
          type="button"
          className="fx-quickLaunchCard fx-quickLaunchCard--ai"
          onClick={() => {
            sounds.tap();
            onNavigate('tools', 'form_check');
          }}
        >
          <div className="fx-quickLaunchIconBox">
            <Sparkles size={20} color="#c8ff00" />
          </div>
          <div className="fx-quickLaunchBody">
            <span className="fx-quickLaunchTag">YAPAY ZEKA</span>
            <b>AI Form Check</b>
            <small>Squat &amp; Deadlift Biyomekanik</small>
          </div>
        </button>

        {/* 4. HIZLI SU (+250ML) */}
        <button
          type="button"
          className="fx-quickLaunchCard fx-quickLaunchCard--water"
          onClick={() => {
            sounds.chime();
            onQuickWaterAdd(250);
          }}
        >
          <div className="fx-quickLaunchIconBox">
            <Droplets size={20} color="#00b4d8" />
          </div>
          <div className="fx-quickLaunchBody">
            <span className="fx-quickLaunchTag">HİDRASYON</span>
            <b>+250ml Su İç</b>
            <small>Tek Dokunuşla Kaydet</small>
          </div>
        </button>

        {/* 5. ARALIKLI ORUÇ & OTOFAJİ */}
        <button
          type="button"
          className="fx-quickLaunchCard fx-quickLaunchCard--fasting"
          onClick={() => {
            sounds.tap();
            onNavigate('tools', 'fasting');
          }}
        >
          <div className="fx-quickLaunchIconBox">
            <Clock size={20} color="#f5c451" />
          </div>
          <div className="fx-quickLaunchBody">
            <span className="fx-quickLaunchTag">METABOLİK</span>
            <b>Aralıklı Oruç</b>
            <small>16:8 Fazı ve Yağ Yakımı</small>
          </div>
        </button>
      </div>
    </div>
  );
}
