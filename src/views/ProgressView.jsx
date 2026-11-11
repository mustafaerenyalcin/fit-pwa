import React, { useState, useMemo } from 'react';
import {
  ChartNoAxesCombined,
  Target,
  Plus,
  Trash2,
  Calendar,
  Camera,
  Lock,
  TrendingUp,
  Award,
  Image as ImageIcon,
  Dumbbell,
  ArrowLeftRight,
  Activity,
  Sparkles
} from 'lucide-react';
import Metric from '../components/Metric.jsx';
import Panel from '../components/Panel.jsx';
import MiniChart from '../components/MiniChart.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PhotoCompareModal from '../components/PhotoCompareModal.jsx';
import { getExerciseHistory } from '../lib/exerciseStats.js';
import { calculateBMI, calculateWaistToHeightRatio } from '../lib/calculations.js';
import { getStoreUser } from '../lib/store.js';

export default function ProgressView({
  day,
  profile,
  entries,
  onAddWeight,
  onRemoveWeight
}) {
  const [timeFilter, setTimeFilter] = useState('all'); // '7d' | '30d' | '90d' | 'all'
  const [selectedExChart, setSelectedExChart] = useState('Dumbbell Floor Press');
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Input states
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [shoulders, setShoulders] = useState('');
  const [legs, setLegs] = useState('');

  // Private Photos stored in localStorage per user (base64)
  const photoKey = `fit-private-photos:${getStoreUser() || 'anon'}`;
  const [photos, setPhotos] = useState(() => {
    try {
      const own = localStorage.getItem(photoKey);
      if (own) return JSON.parse(own) || [];
      const legacy = localStorage.getItem('fit-private-photos');
      return legacy ? JSON.parse(legacy) || [] : [];
    } catch {
      return [];
    }
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2_500_000) {
      alert('Fotoğraf boyutu 2.5 MB altında olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result;
      if (base64) {
        const newPhoto = {
          id: 'photo-' + Date.now(),
          day,
          dataUrl: base64,
          label: 'Gelişim Fotoğrafı'
        };
        const updated = [newPhoto, ...photos];
        setPhotos(updated);
        try {
          localStorage.setItem(photoKey, JSON.stringify(updated));
        } catch (err) {
          alert('Cihaz depolama alanı yetersiz olabilir.');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removePhoto = (id) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    try {
      localStorage.setItem(photoKey, JSON.stringify(updated));
    } catch {}
  };

  // Filter weight entries based on time filter
  const filteredEntries = useMemo(() => {
    const sorted = [...entries.weight].reverse(); // Oldest to newest for charts
    if (timeFilter === 'all') return sorted;

    const daysCount = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysCount);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    return sorted.filter((e) => e.day >= cutoffStr);
  }, [entries.weight, timeFilter]);

  const latestWeight = entries.weight[0]?.payload?.weight || profile.weight || 77;
  const initialWeight = Number(profile.weight) || 77;
  const latestWaist = entries.weight[0]?.payload?.waist;

  const bmiData = calculateBMI(latestWeight, profile.height || 180);
  const waistRatioData = latestWaist
    ? calculateWaistToHeightRatio(latestWaist, profile.height || 180)
    : null;

  // Strength Progression history for selected exercise
  const exerciseHistory = useMemo(() => {
    return getExerciseHistory(entries.workout, selectedExChart);
  }, [entries.workout, selectedExChart]);

  const handleSubmitMeasurement = () => {
    if (!weight) return;
    onAddWeight({
      weight: Number(weight),
      waist: waist ? Number(waist) : null,
      chest: chest ? Number(chest) : null,
      arms: arms ? Number(arms) : null,
      shoulders: shoulders ? Number(shoulders) : null,
      legs: legs ? Number(legs) : null
    });
    setWeight('');
    setWaist('');
    setChest('');
    setArms('');
    setShoulders('');
    setLegs('');
  };

  return (
    <div className="progressView">
      <div className="intro">
        <h2>Vücut Gelişimi & Ölçüm Takibi</h2>
        <p>
          Kas kazanırken tartı sabit kalabilir veya artabilir. Bel çevresi, omuz ve göğüs ölçüleri,
          karın kası belirginlik oranı ve hareketlerdeki güç artışı gerçek dönüşümü gösterir.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="metrics four">
        <Metric
          label="BAŞLANGIÇ KİLOSU"
          value={`${initialWeight} kg`}
          extra="Profil başlangıç değeri"
          icon={Target}
        />
        <Metric
          label="SON TARTI KAYDI"
          value={`${latestWeight} kg`}
          extra={`Fark: ${Math.round((latestWeight - initialWeight) * 10) / 10} kg`}
          icon={ChartNoAxesCombined}
        />
        <Metric
          label="VÜCUT KİTLE İNDEKSİ"
          value={`${bmiData.bmi}`}
          extra={bmiData.label}
          icon={Activity}
        />
        <Metric
          label="BEL / BOY ORANI"
          value={waistRatioData ? `${waistRatioData.ratio}` : '—'}
          extra={waistRatioData ? waistRatioData.status : 'Bel ölçüsü gerekli'}
          icon={TrendingUp}
        />
      </div>

      {/* New Measurement Input Panel */}
      <Panel
        title="Yeni Vücut Ölçümü Ekle"
        sub="Tercihen sabah aç karnına, tuvalet sonrası ve benzer koşullarda"
      >
        <div className="formGrid threeCols">
          <label>
            Ağırlık (kg) *
            <input
              type="number"
              min="30"
              max="300"
              step="0.1"
              placeholder="77.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </label>
          <label>
            Bel Çevresi (cm)
            <input
              type="number"
              min="40"
              max="200"
              step="0.5"
              placeholder="82.0"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
          </label>
          <label>
            Omuz Çevresi (cm)
            <input
              type="number"
              min="50"
              max="200"
              step="0.5"
              placeholder="118.0"
              value={shoulders}
              onChange={(e) => setShoulders(e.target.value)}
            />
          </label>
          <label>
            Göğüs Çevresi (cm)
            <input
              type="number"
              min="50"
              max="200"
              step="0.5"
              placeholder="102.0"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
            />
          </label>
          <label>
            Kol / Pazı Çevresi (cm)
            <input
              type="number"
              min="20"
              max="70"
              step="0.5"
              placeholder="36.5"
              value={arms}
              onChange={(e) => setArms(e.target.value)}
            />
          </label>
          <label>
            Bacak / Uyluk Çevresi (cm)
            <input
              type="number"
              min="30"
              max="100"
              step="0.5"
              placeholder="56.0"
              value={legs}
              onChange={(e) => setLegs(e.target.value)}
            />
          </label>
        </div>

        <div className="profileAction">
          <button
            type="button"
            className="primary"
            disabled={!weight}
            onClick={handleSubmitMeasurement}
          >
            <Plus size={16} /> Ölçümleri Kaydet
          </button>
        </div>
      </Panel>

      {/* Interactive Charts Panel with Time Range Filters */}
      <Panel
        title="Gelişim Grafikleri"
        sub="Ağırlık ve çevre ölçümlerinin zamana göre değişimi"
        action={
          <div className="timeFilterButtons">
            {['7d', '30d', '90d', 'all'].map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filterPill ${timeFilter === filter ? 'active' : ''}`}
                onClick={() => setTimeFilter(filter)}
              >
                {filter === '7d' ? '7 Gün' : filter === '30d' ? '30 Gün' : filter === '90d' ? '90 Gün' : 'Tümü'}
              </button>
            ))}
          </div>
        }
      >
        <div className="chartGrid">
          <MiniChart
            title="Kilo Grafiği"
            unit="kg"
            rows={filteredEntries.map((e) => ({
              day: e.day,
              value: e.payload?.weight
            }))}
          />

          <MiniChart
            title="Bel Çevresi"
            unit="cm"
            rows={filteredEntries
              .filter((e) => e.payload?.waist)
              .map((e) => ({
                day: e.day,
                value: e.payload?.waist
              }))}
          />
        </div>

        {/* Shoulders and Arms progression */}
        <div className="chartGrid" style={{ marginTop: 20 }}>
          <MiniChart
            title="Omuz Çevresi"
            unit="cm"
            rows={filteredEntries
              .filter((e) => e.payload?.shoulders)
              .map((e) => ({
                day: e.day,
                value: e.payload?.shoulders
              }))}
          />

          <MiniChart
            title="Kol (Pazı) Çevresi"
            unit="cm"
            rows={filteredEntries
              .filter((e) => e.payload?.arms)
              .map((e) => ({
                day: e.day,
                value: e.payload?.arms
              }))}
          />
        </div>
      </Panel>

      {/* Strength Progression (Hareket Bazlı Güç Gelişimi) */}
      <Panel
        title="Hareket Bazlı Güç Gelişimi"
        sub="Zaman içindeki dambıl ağırlığı artış trendi"
        action={
          <select
            value={selectedExChart}
            onChange={(e) => setSelectedExChart(e.target.value)}
            className="exSelectInput"
          >
            <option value="Dumbbell Floor Press">Dumbbell Floor Press</option>
            <option value="Dumbbell Shoulder Press">Dumbbell Shoulder Press</option>
            <option value="Lateral Raise">Lateral Raise</option>
            <option value="Single-arm DB Row">Single-arm DB Row</option>
            <option value="Goblet Squat">Goblet Squat</option>
            <option value="DB Romanian Deadlift">DB Romanian Deadlift</option>
          </select>
        }
      >
        {exerciseHistory.length >= 2 ? (
          <MiniChart
            title={`${selectedExChart} (Maks Kg)`}
            unit="kg"
            rows={exerciseHistory}
          />
        ) : (
          <EmptyState
            icon={Dumbbell}
            title="Yeterli veri yok"
            description={`${selectedExChart} için grafik oluşturmak amacıyla en az 2 farklı antrenman kaydet.`}
          />
        )}
      </Panel>

      {/* Private Progress Photos Section (Özel Gelişim Fotoğrafları) */}
      <Panel
        title="Özel Gelişim Fotoğrafları"
        sub="Yalnızca bu cihazda yerel saklanır · Hiçbir sunucuya veya buluta yüklenmez"
        action={
          <div className="photoActionsTop">
            {photos.length >= 2 && (
              <button
                type="button"
                className="secondary"
                onClick={() => setShowCompareModal(true)}
              >
                <ArrowLeftRight size={14} /> Öncesi / Sonrası Karşılaştır
              </button>
            )}
            <label className="primary uploadPhotoBtn">
              <Camera size={16} /> Fotoğraf Ekle
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        }
      >
        <div className="securityNotice">
          <Lock size={15} />
          <span>
            <b>Tamamen Özel & Gizli:</b> Yüklediğin fotoğraflar şifreli olarak cihaz hafızasında
            tutulur. Hiçbir sunucuya aktarılmaz.
          </span>
        </div>

        {photos.length > 0 ? (
          <div className="photoGalleryGrid">
            {photos.map((p) => (
              <div key={p.id} className="photoCard">
                <img src={p.dataUrl} alt="Gelişim" className="photoImg" />
                <div className="photoMetaRow">
                  <span>{p.day}</span>
                  <button
                    type="button"
                    className="dangerIconBtn"
                    onClick={() => removePhoto(p.id)}
                    title="Fotoğrafı sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Camera}
            title="Henüz gelişim fotoğrafı yok"
            description="Benzer ışık altında çektiğin fotoğrafları ekleyerek kas dolgunluğu ve bel incelmesini görsel olarak takip et."
          />
        )}
      </Panel>

      {/* Measurement History Table */}
      <Panel title="Ölçüm Kayıt Geçmişi">
        <div className="history">
          {entries.weight.length ? (
            entries.weight.map((e) => (
              <div className="historyRow" key={e.id}>
                <div>
                  <b>{e.day}</b>
                  <small>
                    {e.payload?.weight} kg
                    {e.payload?.waist ? ` · Bel: ${e.payload.waist} cm` : ''}
                    {e.payload?.shoulders ? ` · Omuz: ${e.payload.shoulders} cm` : ''}
                    {e.payload?.chest ? ` · Göğüs: ${e.payload.chest} cm` : ''}
                    {e.payload?.arms ? ` · Kol: ${e.payload.arms} cm` : ''}
                    {e.payload?.legs ? ` · Bacak: ${e.payload.legs} cm` : ''}
                  </small>
                </div>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onRemoveWeight(e.id)}
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <EmptyState
              icon={ChartNoAxesCombined}
              title="Henüz ölçüm girilmedi"
              description="Yukarıdan ilk kilonu ve bel ölçünü kaydederek başla."
            />
          )}
        </div>
      </Panel>

      {/* Before / After Photo Compare Modal */}
      {showCompareModal && (
        <PhotoCompareModal
          photos={photos}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}
