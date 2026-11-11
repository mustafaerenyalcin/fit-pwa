import React, { useState, useEffect } from 'react';
import { Clock, Flame, Play, Square, Sparkles, RotateCcw } from 'lucide-react';
import { Card, Ring } from './ui.jsx';

const STORAGE_KEY = 'fit-fasting-state-v1';

const PROTOCOLS = [
  { id: '16:8', hours: 16, label: '16:8 Standart Yağ Yakım' },
  { id: '18:6', hours: 18, label: '18:6 İleri Ketozis' },
  { id: '14:10', hours: 14, label: '14:10 Başlangıç' },
  { id: '20:4', hours: 20, label: '20:4 Savaşçı / Otofaji' }
];

function getMetabolicStage(elapsedHours) {
  if (elapsedHours < 4) {
    return {
      title: 'Sindirim & Emilim Fazı (0–4 Saat)',
      desc: 'Son öğünün sindiriliyor, insülin seviyesi kademeli olarak düşmeye hazırlanıyor.',
      color: '#7ee0ff'
    };
  }
  if (elapsedHours < 12) {
    return {
      title: 'Glikojen Boşaltım Fazı (4–12 Saat)',
      desc: 'İnsülin düştü; vücut karaciğerdeki depolanmış glikojeni enerji olarak tüketiyor.',
      color: '#f5c451'
    };
  }
  if (elapsedHours < 16) {
    return {
      title: 'Aktif Yağ Yakımı & Ketozis (12–16 Saat)',
      desc: 'Glikojen depoları azaldı! Vücut enerji için doğrudan yağ hücrelerini yakmaya başladı.',
      color: '#b3f46f'
    };
  }
  return {
    title: 'Otofaji & Hücresel Yenilenme (16+ Saat)',
    desc: 'Büyüme hormonu (HGH) zirvede; hücreler hasarlı proteinleri temizleyip yenileniyor.',
    color: '#c084fc'
  };
}

export default function FastingTimer() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      active: false,
      protocol: '16:8',
      targetHours: 16,
      startTime: null
    };
  });

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    if (!state.active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.active]);

  const elapsedMs = state.active && state.startTime ? Math.max(0, now - state.startTime) : 0;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedHours = elapsedSeconds / 3600;
  const targetSeconds = (state.targetHours || 16) * 3600;
  const pct = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100) || 0);

  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = elapsedSeconds % 60;
  const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const stage = getMetabolicStage(elapsedHours);

  const startFasting = (offsetHours = 0) => {
    setState((prev) => ({
      ...prev,
      active: true,
      startTime: Date.now() - offsetHours * 3600 * 1000
    }));
    setNow(Date.now());
  };

  const stopFasting = () => {
    setState((prev) => ({
      ...prev,
      active: false,
      startTime: null
    }));
  };

  const changeProtocol = (proto) => {
    setState((prev) => ({
      ...prev,
      protocol: proto.id,
      targetHours: proto.hours
    }));
  };

  return (
    <Card
      title="Aralıklı Oruç (Intermittent Fasting) & Otofaji Saati"
      subtitle="İnsülin kontrolü, yağ yakım fazı ve hücresel yenilenme takibi"
      action={
        <div className="fx-choiceRow">
          {PROTOCOLS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`fx-chip ${state.protocol === p.id ? 'active' : ''}`}
              onClick={() => changeProtocol(p)}
            >
              {p.id}
            </button>
          ))}
        </div>
      }
    >
      <div className="fx-fastingWrap">
        <div className="fx-fastingRingCol">
          <Ring
            value={state.active ? elapsedSeconds : 0}
            max={targetSeconds}
            size={122}
            stroke={10}
            color={state.active ? stage.color : '#8b98ad'}
          >
            <div className="fx-fastingRingInner">
              <b>{state.active ? formatted : `${state.targetHours}:00:00`}</b>
              <small>{state.active ? `%${pct} tamamlandı` : `${state.protocol} hazır`}</small>
            </div>
          </Ring>
        </div>

        <div className="fx-fastingDetailsCol">
          {state.active ? (
            <>
              <div className="fx-fastingStageBadge" style={{ borderColor: stage.color, color: stage.color }}>
                <Flame size={14} /> {stage.title}
              </div>
              <p className="fx-muted fx-small">{stage.desc}</p>
              <div className="fx-btnRow" style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="fx-btn fx-btn--ghost fx-btn--sm"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      startTime: (prev.startTime || Date.now()) - 3600 * 1000
                    }))
                  }
                  title="Son öğününü 1 saat önce yediysen süreyi ileri sar"
                >
                  <RotateCcw size={13} /> +1 Saat Önce Başladım
                </button>
                <button type="button" className="fx-btn fx-btn--danger fx-btn--sm" onClick={stopFasting}>
                  <Square size={13} /> Orucu Bitir (Yeme Penceresi)
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="fx-fastingStageBadge">
                <Clock size={14} /> Yeme Penceresi Aktif ({24 - state.targetHours} Saat Beslenme / {state.targetHours} Saat Oruç)
              </div>
              <p className="fx-muted fx-small">
                Akşam son öğününü bitirdiğinde sayacı başlat. 12. saatten itibaren <b>aktif yağ yakımı</b>, 16. saatten itibaren{' '}
                <b>otofaji</b> fazına geçişini canlı takip et.
              </p>
              <div className="fx-btnRow" style={{ marginTop: 10 }}>
                <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" onClick={() => startFasting(0)}>
                  <Play size={14} /> Orucu Şimdi Başlat
                </button>
                <button
                  type="button"
                  className="fx-btn fx-btn--ghost fx-btn--sm"
                  onClick={() => startFasting(2)}
                  title="Son yemeğini 2 saat önce yediysen"
                >
                  <Sparkles size={14} /> 2 Saat Önce Yedim
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2016 NOBEL TIP ÖDÜLÜ: OTOFAJİ & METABOLİK FAZLAR */}
      <div className="fx-scienceGuideBox" style={{ marginTop: 16 }}>
        <div className="fx-scienceHead">
          <Sparkles size={16} color="#c084fc" />
          <b>OTOFAJİ BİYOKİMYASI: 2016 NOBEL TIP ÖDÜLÜ (DR. YOSHINORI OHSUMI)</b>
        </div>
        <div className="fx-scienceGrid">
          <div className="fx-scienceCol">
            <h4>🧬 Otofaji (Hücresel Geri Dönüşüm)</h4>
            <p>
              Açlık 16. saati aştığında <b>mTOR proteini baskılanır ve AMPK enzimi aktive olur</b>. 
              Hücreleriniz hayatta kalmak için sitoplazmadaki hasarlı mitokondrileri (mitofaji), yaşlı protein yumaklarını 
              ve hücresel çöpü parçalayarak amino asitlere dönüştürür.
            </p>
          </div>
          <div className="fx-scienceCol">
            <h4>🛡️ Kas Kaybı Efsanesi &amp; HGH Artışı</h4>
            <p>
              "Oruçta kas erir" miti bilimsel olarak çürütülmüştür: Açlık sırasında vücut kas dokusunu korumak için 
              <b> Büyüme Hormonunu (HGH) %300 ila %500 artırır</b>. Asıl dikkat edilmesi gereken tek kural, 
              orucu açarken ani insülin fırlaması yaratmamak için ilk lokmayı rafine şeker yerine protein ve sağlıklı yağla almaktır.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
