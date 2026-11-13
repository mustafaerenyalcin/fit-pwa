import React, { useState, useRef } from 'react';
import { Camera, Trash2, SlidersHorizontal, ShieldCheck, Plus } from 'lucide-react';
import { Card } from './ui.jsx';
import { compressImage } from '../lib/api.js';
import { today } from '../lib/calculations.js';

const PHOTOS_KEY = 'fit-progress-photos-v1';

export default function BeforeAfterSlider({ profile, entries }) {
  const [photos, setPhotos] = useState(() => {
    try {
      const raw = localStorage.getItem(PHOTOS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [sliderPos, setSliderPos] = useState(50);
  const [compareMode, setCompareMode] = useState('slider'); // 'slider' | 'side' | 'ghost'
  const [ghostOpacity, setGhostOpacity] = useState(50);
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(1);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const latestWeight = entries?.weight?.[0]?.payload?.weight || profile?.weight || '';

  const savePhotos = (next) => {
    setPhotos(next);
    try {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, 720, 0.76);
      const item = {
        id: `ph_${Date.now()}`,
        day: today(),
        weight: latestWeight,
        url: dataUrl
      };
      const next = [...photos, item];
      savePhotos(next);
      if (next.length >= 2) {
        setLeftIdx(0);
        setRightIdx(next.length - 1);
      }
    } catch {}
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = (id) => {
    const next = photos.filter((p) => p.id !== id);
    savePhotos(next);
    setLeftIdx(0);
    setRightIdx(Math.max(0, next.length - 1));
  };

  const beforePhoto = photos[leftIdx] || photos[0];
  const afterPhoto = photos[rightIdx] || photos[photos.length - 1];

  return (
    <Card
      title="Vücut Değişim Zaman Tüneli (Before / After Slider)"
      subtitle="Haftalık form fotoğraflarını gizli kasan olarak kaydet ve kaydırıcıyla değişimini kıyasla"
      action={
        <button
          type="button"
          className="fx-btn fx-btn--primary fx-btn--sm"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Camera size={14} /> {busy ? 'Yükleniyor…' : 'Fotoğraf Ekle'}
        </button>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />

      <div className="fx-privacyNote">
        <ShieldCheck size={14} className="fx-accentIcon" />
        <span>Fotoğrafların sunucuya gönderilmez; yalnızca senin cihazında şifreli/yerel olarak saklanır.</span>
      </div>

      {photos.length >= 2 && beforePhoto && afterPhoto ? (
        <div className="fx-baContainer">
          <div className="fx-baSelectRow">
            <label>
              <small>ÖNCE (Sol):</small>
              <select value={leftIdx} onChange={(e) => setLeftIdx(Number(e.target.value))}>
                {photos.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.day} {p.weight ? `(${p.weight} kg)` : ''}
                  </option>
                ))}
              </select>
            </label>
            <SlidersHorizontal size={16} className="fx-accentIcon" />
            <label>
              <small>SONRA (Sağ):</small>
              <select value={rightIdx} onChange={(e) => setRightIdx(Number(e.target.value))}>
                {photos.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.day} {p.weight ? `(${p.weight} kg)` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            role="tablist"
            style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}
          >
            {[
              ['slider', 'Kaydırıcı'],
              ['side', 'Yan Yana'],
              ['ghost', 'Hayalet Overlay']
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={compareMode === id}
                className={`fx-btn fx-btn--sm ${compareMode === id ? 'fx-solarBtn' : 'fx-btn--ghost'}`}
                onClick={() => setCompareMode(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {compareMode === 'slider' && (
            <div className="fx-baStage">
              <img src={afterPhoto.url} alt="Sonra" className="fx-baImg fx-baImg--after" />
              <div className="fx-baClip" style={{ width: `${sliderPos}%` }}>
                <img src={beforePhoto.url} alt="Önce" className="fx-baImg fx-baImg--before" />
              </div>
              <div className="fx-baDivider" style={{ left: `${sliderPos}%` }}>
                <span className="fx-baHandle">↔</span>
              </div>
              <span className="fx-baTag fx-baTag--left">
                ÖNCE · {beforePhoto.day} {beforePhoto.weight ? `· ${beforePhoto.weight}kg` : ''}
              </span>
              <span className="fx-baTag fx-baTag--right">
                SONRA · {afterPhoto.day} {afterPhoto.weight ? `· ${afterPhoto.weight}kg` : ''}
              </span>
              <input
                type="range"
                min="5"
                max="95"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="fx-baRangeInput"
                aria-label="Önce Sonra Karşılaştırma Kaydırıcısı"
              />
            </div>
          )}

          {compareMode === 'side' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--fx-border)' }}>
                <img src={beforePhoto.url} alt="Önce" style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block' }} />
                <span className="fx-baTag fx-baTag--left">
                  ÖNCE · {beforePhoto.day} {beforePhoto.weight ? `· ${beforePhoto.weight}kg` : ''}
                </span>
              </div>
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--fx-border)' }}>
                <img src={afterPhoto.url} alt="Sonra" style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block' }} />
                <span className="fx-baTag fx-baTag--right">
                  SONRA · {afterPhoto.day} {afterPhoto.weight ? `· ${afterPhoto.weight}kg` : ''}
                </span>
              </div>
            </div>
          )}

          {compareMode === 'ghost' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="fx-baStage">
                <img src={beforePhoto.url} alt="Önce" className="fx-baImg fx-baImg--after" />
                <img
                  src={afterPhoto.url}
                  alt="Sonra"
                  className="fx-baImg fx-baImg--before"
                  style={{ opacity: ghostOpacity / 100, transition: 'opacity 0.1s linear' }}
                />
                <span className="fx-baTag fx-baTag--left">
                  ÖNCE (Alt)
                </span>
                <span className="fx-baTag fx-baTag--right">
                  SONRA · %{ghostOpacity} Opaklık
                </span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span className="fx-muted">Hayalet Opaklık: %{ghostOpacity}</span>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={ghostOpacity}
                  onChange={(e) => setGhostOpacity(Number(e.target.value))}
                  style={{ flex: 1 }}
                  aria-label="Hayalet Overlay Opaklığı"
                />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div className="fx-baEmptyState">
          <p className="fx-muted fx-small">
            {photos.length === 0
              ? 'İlk form fotoğrafını ekle! İkinci fotoğrafını eklediğinde interaktif Önce / Sonra karşılaştırma kaydırıcısı (Before/After Slider) otomatik aktif olur.'
              : 'Harika, ilk fotoğrafın kaydedildi! Karşılaştırma kaydırıcısını kullanmak için 1 fotoğraf daha ekle.'}
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="fx-photoThumbGrid">
          {photos.map((p) => (
            <div key={p.id} className="fx-photoThumb">
              <img src={p.url} alt={p.day} />
              <div className="fx-photoThumbMeta">
                <div>
                  <b>{p.day}</b>
                  {p.weight && <small>{p.weight} kg</small>}
                </div>
                <button
                  type="button"
                  className="fx-iconBtn"
                  onClick={() => handleDelete(p.id)}
                  title="Fotoğrafı sil"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="fx-photoThumbAdd" onClick={() => fileRef.current?.click()}>
            <Plus size={20} />
            <small>Yeni Ekle</small>
          </button>
        </div>
      )}
    </Card>
  );
}
