import React from 'react';
import { PRESET_AVATARS } from '../lib/avatarPresets.js';

export default function UserAvatar({ avatarUrl, name = 'S', size = 32, className = '' }) {
  const isPreset = avatarUrl?.startsWith('preset:');
  const preset = isPreset ? PRESET_AVATARS.find((p) => p.id === avatarUrl.replace('preset:', '')) : null;

  const style = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontWeight: 800,
    fontSize: Math.round(size * 0.42),
    border: '1.5px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
    verticalAlign: 'middle'
  };

  if (avatarUrl && !isPreset) {
    return (
      <span className={`fx-avatarImgWrap ${className}`} style={style}>
        <img
          src={avatarUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </span>
    );
  }

  if (preset) {
    return (
      <span
        className={`fx-avatarPresetWrap ${className}`}
        style={{
          ...style,
          background: preset.bg,
          borderColor: preset.border
        }}
      >
        <span>{preset.symbol}</span>
      </span>
    );
  }

  return (
    <span
      className={`fx-avatarInitialsWrap ${className}`}
      style={{
        ...style,
        background: 'linear-gradient(135deg, rgba(255, 77, 28, 0.85), rgba(255, 122, 80, 0.4))',
        color: '#fff'
      }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
