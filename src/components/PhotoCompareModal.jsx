import React, { useState } from 'react';
import { X, ArrowLeftRight, Calendar, Camera } from 'lucide-react';

export default function PhotoCompareModal({ photos = [], onClose }) {
  const [photoAIndex, setPhotoAIndex] = useState(photos.length > 1 ? photos.length - 1 : 0); // Older
  const [photoBIndex, setPhotoBIndex] = useState(0); // Newer

  if (!photos || photos.length < 2) {
    return (
      <div className="activeWorkoutOverlay">
        <div className="activeWorkoutModal" style={{ maxWidth: 450, padding: 30, textAlign: 'center' }}>
          <h3>En Az 2 Fotoğraf Gerekli</h3>
          <p className="muted">
            Karşılaştırma yapabilmek için en az 2 farklı tarihte gelişim fotoğrafı yüklemelisin.
          </p>
          <button type="button" className="primary" onClick={onClose} style={{ marginTop: 16 }}>
            Tamam
          </button>
        </div>
      </div>
    );
  }

  const photoA = photos[photoAIndex];
  const photoB = photos[photoBIndex];

  return (
    <div className="activeWorkoutOverlay">
      <div className="activeWorkoutModal" style={{ maxWidth: 900 }}>
        <div className="activeModalHeader">
          <div className="headerLeft">
            <span className="liveBadge">
              <ArrowLeftRight size={14} /> KARŞILAŞTIRMA
            </span>
            <h3>Öncesi & Sonrası Fotoğraf Analizi</h3>
          </div>
          <button type="button" className="iconBtnClose" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="photoCompareBody">
          <div className="compareControls">
            <div className="controlGroup">
              <label>Önceki Fotoğraf (Başlangıç):</label>
              <select
                value={photoAIndex}
                onChange={(e) => setPhotoAIndex(Number(e.target.value))}
              >
                {photos.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.day} ({idx === photos.length - 1 ? 'İlk Kayıt' : `#${idx + 1}`})
                  </option>
                ))}
              </select>
            </div>

            <div className="controlGroup">
              <label>Sonraki Fotoğraf (Güncel):</label>
              <select
                value={photoBIndex}
                onChange={(e) => setPhotoBIndex(Number(e.target.value))}
              >
                {photos.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.day} ({idx === 0 ? 'En Son Kayıt' : `#${idx + 1}`})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="compareSideBySide">
            {/* Photo A (Before) */}
            <div className="compareCard">
              <div className="compareCardHeader">
                <span className="pillBtn">ÖNCESİ</span>
                <b>{photoA?.day}</b>
              </div>
              <div className="compareImgWrapper">
                <img src={photoA?.dataUrl} alt="Öncesi" className="compareImg" />
              </div>
            </div>

            {/* Photo B (After) */}
            <div className="compareCard">
              <div className="compareCardHeader">
                <span className="pillBtn primaryPill">SONRASI</span>
                <b>{photoB?.day}</b>
              </div>
              <div className="compareImgWrapper">
                <img src={photoB?.dataUrl} alt="Sonrası" className="compareImg" />
              </div>
            </div>
          </div>

          <p className="smallHelp" style={{ textAlign: 'center', marginTop: 14 }}>
            Fotoğrafların aynı ışık açısı, benzer mesafe ve aç karnına çekilmiş olması kas dolgunluğu
            ve bel incelmesini en doğru şekilde yansıtır.
          </p>
        </div>
      </div>
    </div>
  );
}
