import React, { useState } from 'react';
import { Plus, Play, Trash2, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui.jsx';
import { getSetting, setSetting } from '../lib/store.js';
import { scheduleSync } from '../lib/supabase.js';

export const EXERCISE_LIBRARY = {
  Omuz: [
    { name: 'Seated Dumbbell Shoulder Press', sets: '3 × 8-12', muscle: 'Ön & Yan Omuz', tip: 'Sehpada dik otur, karın sıkı, dambılları kulak hizasından yukarı it.' },
    { name: 'Lateral Raise', sets: '4 × 12-15', muscle: 'Yan Omuz', tip: 'Dirsekler hafif bükülü, omuz hizasına kadar kontrollü kaldır.' },
    { name: 'Rear Delt Fly', sets: '3 × 12-15', muscle: 'Arka Omuz', tip: 'Gövde öne eğik, kürek kemiklerini birbirine yaklaştır.' },
    { name: 'Arnold Press', sets: '3 × 10-12', muscle: 'Tüm Omuz', tip: 'Avuç içleri sana bakarken başla, yukarı iterken dışa çevir.' },
    { name: 'Pike Push-Ups', sets: '3 × 8-12', muscle: 'Omuz & Triceps', tip: 'Kalça yukarıda ters V pozisyonunda başı yere yaklaştır.' }
  ],
  Göğüs: [
    { name: 'Dumbbell Bench Press', sets: '3 × 8-12', muscle: 'Orta Göğüs', tip: 'Düz sehpada kürek kemiklerini sabitle, dirsekler 45° açıyla indir ve bas.' },
    { name: 'Incline Dumbbell Press', sets: '3 × 8-12', muscle: 'Üst Göğüs', tip: '30-45° eğimli sehpada dambılları üst göğüs hizasına indirip yukarı bas.' },
    { name: 'Decline Dumbbell Press', sets: '3 × 10-12', muscle: 'Alt Göğüs', tip: 'Baş aşağı eğimli sehpada göğsün alt liflerini sıkarak kontrollü bas.' },
    { name: 'Dumbbell Fly', sets: '3 × 12-15', muscle: 'Göğüs İç/Dış', tip: 'Dirsek açısını bozmadan göğsü esneterek aç ve ortada birleştir.' }
  ],
  Sırt: [
    { name: 'One-Arm Dumbbell Row', sets: '3 × 10-12', muscle: 'Kanat (Lat)', tip: 'Dambılı kalçana doğru çek, üst noktada sırtını sık.' },
    { name: 'Bent-Over Dumbbell Row', sets: '3 × 8-12', muscle: 'Orta Sırt', tip: 'Bel düz, gövde 45° eğik, dirsekleri geriye çek.' },
    { name: 'Pull-Up', sets: '3 × Maks', muscle: 'Üst Sırt & Kanat', tip: 'Avuç içleri karşıya bakacak şekilde geniş tut, göğsü bara çek.' },
    { name: 'Chin-Up', sets: '3 × Maks', muscle: 'Alt Kanat & Biceps', tip: 'Avuç içleri sana bakacak şekilde omuz genişliğinde tut, çeneyi barın üzerine çıkar.' }
  ],
  'Karın / Core': [
    { name: 'Plank', sets: '3 × 45-60 sn', muscle: 'Core', tip: 'Bel çökmeden karın ve kalçayı sıkarak sabit kal.' },
    { name: 'Weighted Crunch', sets: '3 × 15-20', muscle: 'Üst Karın', tip: 'Göğüste dambıl ile omuzları yerden kaldırıp karnı sık.' },
    { name: 'Lying Leg Raise', sets: '3 × 12-15', muscle: 'Alt Karın', tip: 'Sırtüstü bel boşluğunu yere bastırarak bacakları kontrollü kaldır.' },
    { name: 'Russian Twist', sets: '3 × 20', muscle: 'Oblik (Yan Karın)', tip: 'Gövdeyi sağa ve sola kontrollü döndür.' },
    { name: 'Dead Bug', sets: '3 × 12', muscle: 'Derin Core', tip: 'Belin yere temasını kesmeden çapraz kol ve bacağı yavaşça uzat.' }
  ],
  Kol: [
    { name: 'Dumbbell Bicep Curl', sets: '3 × 10-12', muscle: 'Biceps', tip: 'Dirsekleri gövdeye sabitle, sallanmadan kaldır.' },
    { name: 'Hammer Curl', sets: '3 × 10-12', muscle: 'Brachialis & Ön Kol', tip: 'Avuç içleri birbirine bakacak şekilde kontrollü kaldır.' },
    { name: 'Dumbbell Overhead Triceps Extension', sets: '3 × 10-15', muscle: 'Triceps Uzun Baş', tip: 'Dirsekleri açmadan dambılı baş arkasına indirip yukarı kilitle.' },
    { name: 'Dumbbell Skull Crusher', sets: '3 × 10-12', muscle: 'Triceps', tip: 'Düz sehpada dirsekleri sabit tutarak dambılları alın yanına indir ve it.' }
  ],
  Bacak: [
    { name: 'Goblet Squat', sets: '3 × 10-12', muscle: 'Ön Bacak & Kalça', tip: 'Dambılı göğüste tut, dik gövdeyle derin çömel.' },
    { name: 'Dumbbell Romanian Deadlift', sets: '3 × 10-12', muscle: 'Arka Bacak & Kalça', tip: 'Dizler hafif bükülü, kalçayı geriye iterek dambılları indir.' },
    { name: 'Bulgarian Split Squat', sets: '3 × 8-10', muscle: 'Bacak & Kalça', tip: 'Arka ayak yüksekte, ön bacakla dengeli çömel.' },
    { name: 'Standing Calf Raise', sets: '4 × 15-20', muscle: 'Baldır (Kalf)', tip: 'Ayakta parmak ucunda yükselip tepe noktada 1 saniye sık.' }
  ]
};

export default function CustomWorkoutBuilder({ onStartWorkout }) {
  const [templates, setTemplates] = useState(() => {
    try {
      return getSetting('customWorkouts') || [];
    } catch {
      return [];
    }
  });
  const [building, setBuilding] = useState(false);
  const [title, setTitle] = useState('');
  const [activeCat, setActiveCat] = useState('Omuz');
  const [selectedMoves, setSelectedMoves] = useState([]);

  const toggleMove = (move) => {
    if (selectedMoves.some((m) => m.name === move.name)) {
      setSelectedMoves(selectedMoves.filter((m) => m.name !== move.name));
    } else {
      setSelectedMoves([...selectedMoves, { ...move, defaultSets: 3, restSeconds: 75 }]);
    }
  };

  const saveTemplate = () => {
    if (!title.trim() || !selectedMoves.length) return;
    const newTpl = {
      id: 'cw-' + Date.now(),
      name: title.trim(),
      focus: `${selectedMoves.length} hareket · Özel rutin`,
      moves: selectedMoves
    };
    const next = [newTpl, ...templates];
    setTemplates(next);
    setSetting('customWorkouts', next);
    scheduleSync();
    setTitle('');
    setSelectedMoves([]);
    setBuilding(false);
  };

  const removeTemplate = (id) => {
    const next = templates.filter((t) => t.id !== id);
    setTemplates(next);
    setSetting('customWorkouts', next);
    scheduleSync();
  };

  return (
    <Card
      title="Kendi Antrenmanını Oluştur"
      subtitle="26 benzersiz hareketlik kütüphaneden kendi özel rutinini kur ve kaydet"
      action={
        <button
          type="button"
          className="fx-btn fx-btn--ghost fx-btn--sm"
          onClick={() => setBuilding((v) => !v)}
        >
          {building ? <ChevronUp size={15} /> : <Plus size={15} />}
          {building ? 'Kapat' : 'Yeni Rutin'}
        </button>
      }
    >
      {building && (
        <div className="fx-builderBox">
          <label className="fx-field" style={{ marginTop: 0 }}>
            <span>Antrenman Adı</span>
            <input
              type="text"
              placeholder="Örn: 20 Dk Omuz & Karın Patlatma"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className="fx-choiceRow" style={{ marginBottom: 10 }}>
            {Object.keys(EXERCISE_LIBRARY).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`fx-chip ${activeCat === cat ? 'active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="fx-libGrid">
            {EXERCISE_LIBRARY[activeCat].map((mv) => {
              const picked = selectedMoves.some((m) => m.name === mv.name);
              return (
                <button
                  key={mv.name}
                  type="button"
                  className={`fx-libItem ${picked ? 'picked' : ''}`}
                  onClick={() => toggleMove(mv)}
                >
                  <div>
                    <b>{picked ? '✓ ' : '+ '}{mv.name}</b>
                    <small>{mv.muscle} · {mv.sets}</small>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedMoves.length > 0 && (
            <div className="fx-builderFooter">
              <small className="fx-muted">
                Seçilen ({selectedMoves.length}): {selectedMoves.map((m) => m.name).join(', ')}
              </small>
              <div className="fx-btnRow" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="fx-btn fx-btn--primary fx-grow"
                  onClick={saveTemplate}
                  disabled={!title.trim()}
                >
                  Rutini Kaydet ({selectedMoves.length} Hareket)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {templates.length > 0 ? (
        <div className="fx-tplList">
          {templates.map((tpl) => (
            <div key={tpl.id} className="fx-tplRow">
              <div>
                <b>{tpl.name}</b>
                <small className="fx-muted" style={{ display: 'block' }}>
                  {tpl.moves.map((m) => m.name).join(' · ')}
                </small>
              </div>
              <div className="fx-btnRow">
                <button
                  type="button"
                  className="fx-btn fx-btn--primary fx-btn--sm"
                  onClick={() => onStartWorkout(tpl)}
                >
                  <Play size={14} fill="currentColor" /> Başla
                </button>
                <button
                  type="button"
                  className="fx-iconBtn"
                  onClick={() => removeTemplate(tpl.id)}
                  title="Sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !building && (
          <p className="fx-muted fx-small" style={{ margin: 0 }}>
            Henüz özel bir rutin oluşturmadın. Sağ üstteki <b>+ Yeni Rutin</b> düğmesiyle kendi antrenmanını kurabilirsin.
          </p>
        )
      )}
    </Card>
  );
}
