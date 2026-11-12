import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Check, Sparkles, User } from 'lucide-react';
import { PRESET_AVATARS } from '../lib/avatarPresets.js';
import { sounds } from '../lib/audio.js';

export default function AvatarPicker({ avatarUrl, userName = 'Sporcu', onSelectAvatar }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Compress & crop image to lightweight base64 data URL
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        sounds.success();
        onSelectAvatar(compressedDataUrl);
        setLoading(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    sounds.tap();
    onSelectAvatar(`preset:${preset.id}`);
  };

  const handleRemove = () => {
    sounds.tap();
    onSelectAvatar('');
  };

  const isPreset = avatarUrl?.startsWith('preset:');
  const activePreset = isPreset ? PRESET_AVATARS.find((p) => p.id === avatarUrl.replace('preset:', '')) : null;

  return (
    <div className="fx-avatarPickerBox">
      <div className="fx-avatarPickerHero">
        <div className="fx-avatarPreviewCircle">
          {avatarUrl ? (
            isPreset && activePreset ? (
              <div
                className="fx-avatarPresetPreview"
                style={{ background: activePreset.bg, borderColor: activePreset.border }}
              >
                <span>{activePreset.symbol}</span>
              </div>
            ) : (
              <img src={avatarUrl} alt={userName} className="fx-avatarImg" />
            )
          ) : (
            <div className="fx-avatarInitials">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          <button
            type="button"
            className="fx-avatarUploadTrigger"
            onClick={() => fileInputRef.current?.click()}
            title="Fotoğraf Yükle"
          >
            <Camera size={14} />
          </button>
        </div>

        <div className="fx-avatarPickerMeta">
          <h4>{userName}</h4>
          <p>Kişisel profil fotoğrafını yükle veya pro atlet avatarlarından birini seç.</p>
          <div className="fx-avatarBtnRow">
            <button
              type="button"
              className="fx-btn fx-solarBtn fx-btn--sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Upload size={14} /> {loading ? 'Yükleniyor…' : 'Fotoğraf Yükle'}
            </button>
            {avatarUrl && (
              <button
                type="button"
                className="fx-btn fx-btn--ghost fx-btn--sm"
                onClick={handleRemove}
                style={{ color: '#ff6b6b' }}
              >
                <Trash2 size={13} /> Kaldır
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* HAZIR SPORCU AVATAR SEÇENEKLERİ */}
      <div className="fx-presetAvatarsSection">
        <span className="fx-subLabel">VEYA LÜKS ATLET AVATARI SEÇ:</span>
        <div className="fx-presetAvatarsGrid">
          {PRESET_AVATARS.map((preset) => {
            const isSelected = avatarUrl === `preset:${preset.id}`;
            return (
              <button
                key={preset.id}
                type="button"
                className={`fx-presetAvatarBtn ${isSelected ? 'selected' : ''}`}
                style={{ background: preset.bg, borderColor: isSelected ? 'var(--fx-accent)' : preset.border }}
                onClick={() => handleSelectPreset(preset)}
                title={preset.name}
              >
                <span className="fx-presetSymbol">{preset.symbol}</span>
                {isSelected && <Check size={12} className="fx-presetCheck" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
