import React, { useState } from 'react';
import {
  Settings2,
  Save,
  Target,
  Dumbbell,
  Flame,
  Activity,
  ShieldAlert,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Panel from '../components/Panel.jsx';

export default function ProfileView({ profile, onSaveProfile }) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    height: profile.height || '',
    weight: profile.weight || '',
    age: profile.age || '',
    sex: profile.sex || '',
    activity: profile.activity || 'medium',
    training: profile.training || 'home',
    experience: profile.experience || 'beginner',
    goal: profile.goal || 'recomp',
    focus: profile.focus || 'balanced',
    trainingFrequency: profile.trainingFrequency || 4,
    equipmentDumbbells: profile.equipmentDumbbells || '',
    injuries: profile.injuries || '',
    water: profile.water || 2500,
    steps: profile.steps || 8000
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    const success = await onSaveProfile(formData);
    if (success) {
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3500);
    }
  };

  return (
    <div className="profileView">
      <div className="intro">
        <p>
          Boy, kilo, hedef, ekipman ve sakatlık bilgilerin kalori hesabına ve AI koçun önerilerine
          anında yansır. Ekipmanını değiştirirsen Antrenman sekmesinden programını yeniden oluştur.
        </p>
      </div>

      {savedNotice && (
        <div className="notice" role="status">
          <CheckCircle2 size={18} /> Profil bilgilerin başarıyla güncellendi ve kaydedildi.
        </div>
      )}

      {/* Main Physical Information */}
      <Panel
        title="Fiziksel Bilgiler ve Vücut Ölçüleri"
        sub="Protein ve kalori ihtiyaçları bu bilgilere göre hesaplanır"
      >
        <div className="formGrid">
          <label>
            İsim / Takma Ad
            <input
              type="text"
              placeholder="Adın"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </label>

          <label>
            Boy (cm) *
            <input
              type="number"
              min="120"
              max="240"
              value={formData.height}
              onChange={(e) => handleChange('height', Number(e.target.value))}
            />
          </label>

          <label>
            Kilo (kg) *
            <input
              type="number"
              min="30"
              max="300"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleChange('weight', Number(e.target.value))}
            />
          </label>

          <label>
            Yaş
            <input
              type="number"
              min="14"
              max="100"
              placeholder="Örn: 27"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
            />
          </label>

          <label>
            Biyolojik Cinsiyet (BMR Kalori Hesabı İçin)
            <select
              value={formData.sex}
              onChange={(e) => handleChange('sex', e.target.value)}
            >
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
              <option value="">Belirtmek İstemiyorum</option>
            </select>
          </label>

          <label>
            Günlük Hareket Seviyesi
            <select
              value={formData.activity}
              onChange={(e) => handleChange('activity', e.target.value)}
            >
              <option value="low">Az hareketli (Masa başı iş, düşük aktivite)</option>
              <option value="medium">Orta hareketli (Haftada 3-5 antrenman)</option>
              <option value="high">Çok hareketli (Yoğun fiziksel iş / antrenman)</option>
            </select>
          </label>
        </div>
      </Panel>

      {/* Fitness Goals */}
      <Panel
        title="Ana Hedef & Odak Bölgeleri"
        sub="Vücut kompozisyonu (Recomposition) hedefine göre program şekillenir"
      >
        <div className="goalSelection">
          <button
            type="button"
            className={formData.goal === 'recomp' ? 'selected' : ''}
            onClick={() => handleChange('goal', 'recomp')}
          >
            <Target size={24} />
            <b>Atletik Kas & Yağ Kontrolü (Recomp)</b>
            <span>Kas kazanırken yağ oranını dengede tut. Omuz ve karın vurgusu.</span>
          </button>

          <button
            type="button"
            className={formData.goal === 'gain' ? 'selected' : ''}
            onClick={() => handleChange('goal', 'gain')}
          >
            <Dumbbell size={24} />
            <b>Kas Kütlesi Artışı (Lean Bulk)</b>
            <span>Kontrollü kalori fazlası ile maksimum hipertrofi.</span>
          </button>

          <button
            type="button"
            className={formData.goal === 'cut' ? 'selected' : ''}
            onClick={() => handleChange('goal', 'cut')}
          >
            <Flame size={24} />
            <b>Yağ Yakımı & Definasyon (Cut)</b>
            <span>Mevcut kas kütlesini koruyarak yağ oranını düşür.</span>
          </button>
        </div>

        <div className="formGrid" style={{ marginTop: 18 }}>
          <label>
            Öncelikli Kas Grupları
            <select
              value={formData.focus}
              onChange={(e) => handleChange('focus', e.target.value)}
            >
              <option value="shoulders-abs">Omuz ve Karın (Geniş omuz &amp; belirgin core)</option>
              <option value="upper-body">Tüm Üst Vücut (Göğüs, Sırt, Omuz, Kol)</option>
              <option value="glutes-legs">Bacak ve Kalça</option>
              <option value="balanced">Tüm Vücut Dengeli Gelişim</option>
            </select>
          </label>

          <label>
            Antrenman Sıklığı (Haftalık)
            <select
              value={formData.trainingFrequency}
              onChange={(e) => handleChange('trainingFrequency', Number(e.target.value))}
            >
              <option value={2}>Haftada 2 Gün</option>
              <option value={3}>Haftada 3 Gün</option>
              <option value={4}>Haftada 4 Gün</option>
              <option value={5}>Haftada 5 Gün</option>
              <option value={6}>Haftada 6 Gün</option>
            </select>
          </label>
        </div>
      </Panel>

      {/* Equipment, Experience and Injury Status */}
      <Panel
        title="Ekipman, Spor Geçmişi ve Sağlık Durumu"
        sub="Antrenman hareketleri evdeki dambıl donanımına göre optimize edilir"
      >
        <div className="formGrid">
          <label>
            Antrenman Yeri
            <select
              value={formData.training}
              onChange={(e) => handleChange('training', e.target.value)}
            >
              <option value="home">Ev (Dambıllar ile)</option>
              <option value="gym">Spor Salonu</option>
            </select>
          </label>

          <label>
            Spor Geçmişi / Seviye
            <select
              value={formData.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
            >
              <option value="returning">Önceden spor yaptım, ara verdim (Geri dönüş)</option>
              <option value="beginner">Yeni başlayan</option>
              <option value="intermediate">Orta / İleri seviye</option>
            </select>
          </label>

          <label className="wide">
            Kullanılabilir Dambıl Ağırlıkları / Ekipmanlar
            <input
              type="text"
              placeholder="Örn: 2×5kg ve 2×10kg dambıllar / ayarlanabilir dambıl seti"
              value={formData.equipmentDumbbells}
              onChange={(e) => handleChange('equipmentDumbbells', e.target.value)}
            />
          </label>

          <label className="wide">
            Varsa Sakatlık veya Hassas Bölgeler
            <input
              type="text"
              placeholder="Örn: Bel fıtığı hassasiyeti / Sol omuz sıkışması / Yok"
              value={formData.injuries}
              onChange={(e) => handleChange('injuries', e.target.value)}
            />
          </label>

          <label>
            Günlük Su Takip Hedefi (ml)
            <input
              type="number"
              min="1000"
              max="10000"
              step="100"
              value={formData.water}
              onChange={(e) => handleChange('water', Number(e.target.value))}
            />
          </label>

          <label>
            Günlük Adım Takip Hedefi
            <input
              type="number"
              min="2000"
              max="50000"
              step="500"
              value={formData.steps}
              onChange={(e) => handleChange('steps', Number(e.target.value))}
            />
          </label>
        </div>

        <div className="profileAction">
          <button type="button" className="primary" onClick={handleSave}>
            <Save size={16} /> Tüm Profil Bilgilerini Kaydet
          </button>
        </div>
      </Panel>
    </div>
  );
}
