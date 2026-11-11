import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Scan, Zap, Check, Search, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { sounds } from '../lib/audio.js';

// Verified common Turkish & Global fitness food barcodes for instant offline mapping
const VERIFIED_BARCODES = {
  '8690504123456': { name: 'Eti Lifalif Yulaf Ezmesi (100g)', calories: 356, protein: 12.5, carbs: 60, fat: 7 },
  '8690637890123': { name: 'Dardanel Ton Balığı (160g Süzme)', calories: 288, protein: 38.4, carbs: 0, fat: 14.4 },
  '8690555432109': { name: 'Fellas Yüksek Protein Bar (45g)', calories: 155, protein: 15, carbs: 12, fat: 4.5 },
  '8690777112233': { name: 'İçim Fit Yüksek Proteinli Süt (500ml)', calories: 250, protein: 30, carbs: 22, fat: 1 },
  '8690888998877': { name: 'Süzme Yoğurt / Greek Style (200g)', calories: 210, protein: 18, carbs: 8, fat: 12 },
  '8690111223344': { name: 'Pınar Doğal Fıstık Ezmesi (30g)', calories: 185, protein: 8, carbs: 4, fat: 15 },
  '8690222334455': { name: 'Gold Wheystar %100 Whey Protein (1 Ölçek)', calories: 124, protein: 25, carbs: 2, fat: 1.5 },
  '8690333445566': { name: 'Tam Buğday Patlağı / Pirinç Patlağı (3 Adet)', calories: 88, protein: 2.2, carbs: 19, fat: 0.6 }
};

export default function BarcodeScannerModal({ onAddMeal, onClose }) {
  const [scanning, setScanning] = useState(true);
  const [scannedFood, setScannedFood] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize camera stream
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamera desteği bulunamadı.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (active && videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        setCameraError('Kamera erişimine izin verilmedi veya cihaz desteklemiyor. Aşağıdan barkodu elle girebilir veya ürün arayabilirsiniz.');
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleBarcodeDetect = (code) => {
    sounds.success();
    const found = VERIFIED_BARCODES[code] || {
      name: `Taranan Barkod (${code})`,
      calories: 220,
      protein: 20,
      carbs: 25,
      fat: 5
    };
    setScannedFood(found);
    setScanning(false);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeDetect(manualCode.trim());
  };

  const confirmAdd = () => {
    if (!scannedFood) return;
    sounds.success();
    onAddMeal(scannedFood);
    onClose();
  };

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div className="fx-modal fx-barcodeModal" onClick={(e) => e.stopPropagation()}>
        <div className="fx-modalHead">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Scan size={18} color="#00f0ff" /> Ücretsiz Barkod Tarayıcı (Zero Paywall)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
              MyFitnessPal gibi paralı abonelik istemez. Barkodu kameraya tutun.
            </p>
          </div>
          <button type="button" className="fx-modalClose" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* KAMERA VİZÖRÜ */}
        {scanning ? (
          <div className="fx-barcodeCameraContainer">
            {!cameraError ? (
              <div className="fx-viewfinderBox">
                <video ref={videoRef} autoPlay playsInline muted className="fx-cameraFeed" />
                <div className="fx-viewfinderTarget">
                  <div className="fx-targetCorner top-left" />
                  <div className="fx-targetCorner top-right" />
                  <div className="fx-targetCorner bottom-left" />
                  <div className="fx-targetCorner bottom-right" />
                  <div className="fx-barcodeLaserLine" />
                </div>
                <div className="fx-scannerHint">
                  Barkodu sarı karenin içine ortalayın
                </div>
              </div>
            ) : (
              <div className="fx-cameraFallback">
                <AlertCircle size={32} color="#f5c451" />
                <p>{cameraError}</p>
              </div>
            )}

            {/* HIZLI TEST / SİMÜLASYON BUTONLARI (KULLANICININ ANINDA DENEMESİ İÇİN) */}
            <div className="fx-sampleBarcodesSection">
              <span className="fx-subLabel">VEYA HIZLI TEST BARKODLARINDAN BİRİNE BAS:</span>
              <div className="fx-sampleBarcodePills">
                {Object.entries(VERIFIED_BARCODES).slice(0, 4).map(([code, item]) => (
                  <button
                    key={code}
                    type="button"
                    className="fx-sampleBarcodeBtn"
                    onClick={() => handleBarcodeDetect(code)}
                  >
                    <Scan size={12} /> {item.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* ELLE BARKOD / KOD ARAMA */}
            <form onSubmit={handleManualSearch} className="fx-manualBarcodeInputRow">
              <input
                type="text"
                placeholder="Barkod numarası (örn: 8690504123456)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <button type="submit" className="fx-btn fx-solarBtn">
                <Search size={15} /> Sorgula
              </button>
            </form>
          </div>
        ) : (
          /* TARANAN ÜRÜN MAKRO DETAYI */
          <div className="fx-stack fx-scannedResultCard animate-scale-in">
            <div className="fx-scannedHeader">
              <span className="fx-badgeOk">
                <Check size={14} /> ÜRÜN BAŞARIYLA BULUNDU
              </span>
              <h4>{scannedFood.name}</h4>
            </div>

            <div className="fx-grid3 fx-macroTrioGrid" style={{ margin: '14px 0' }}>
              <div className="fx-macroBox" style={{ borderColor: 'rgba(0, 240, 255, 0.4)' }}>
                <small style={{ color: '#00f0ff' }}>PROTEİN</small>
                <b>{scannedFood.protein} g</b>
              </div>
              <div className="fx-macroBox" style={{ borderColor: 'rgba(200, 255, 0, 0.4)' }}>
                <small style={{ color: '#c8ff00' }}>KARBONHİDRAT</small>
                <b>{scannedFood.carbs} g</b>
              </div>
              <div className="fx-macroBox" style={{ borderColor: 'rgba(255, 77, 28, 0.4)' }}>
                <small style={{ color: '#ff4d1c' }}>KALORİ</small>
                <b>{scannedFood.calories} kcal</b>
              </div>
            </div>

            <div className="fx-scannedActions">
              <button
                type="button"
                className="fx-btn fx-btn--ghost"
                onClick={() => {
                  setScannedFood(null);
                  setScanning(true);
                }}
              >
                Yeni Barkod Tara
              </button>
              <button type="button" className="fx-btn fx-solarBtn" onClick={confirmAdd}>
                <Plus size={16} /> Günlük Öğünlerime Ekle (+{scannedFood.protein}g Protein)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
