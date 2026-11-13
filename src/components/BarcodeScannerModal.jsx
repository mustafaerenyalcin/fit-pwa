import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scan, Check, Search, Plus, AlertCircle, RefreshCw, BookmarkPlus } from 'lucide-react';
import { sounds } from '../lib/audio.js';
import { useI18n } from '../lib/i18n.js';

const CUSTOM_BARCODES_KEY = 'fit-custom-barcodes-v1';

// Sık kullanılan Türk & global sporcu ürünleri (anında çevrimdışı eşleşme)
const VERIFIED_BARCODES = {
  '8690504123456': {
    name: 'Eti Lifalif Yulaf Ezmesi',
    per100g: { calories: 356, protein: 12.5, carbs: 60, fat: 7 },
    defaultGram: 100
  },
  '8690637890123': {
    name: 'Dardanel Ton Balığı (Süzme)',
    per100g: { calories: 180, protein: 24, carbs: 0, fat: 9 },
    defaultGram: 160
  },
  '8690555432109': {
    name: 'Fellas Yüksek Protein Bar',
    per100g: { calories: 344, protein: 33.3, carbs: 26.7, fat: 10 },
    defaultGram: 45
  },
  '8690777112233': {
    name: 'İçim Fit Yüksek Proteinli Süt',
    per100g: { calories: 50, protein: 6, carbs: 4.4, fat: 0.2 },
    defaultGram: 500
  }
};

function readCustomBarcodes() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_BARCODES_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCustomBarcode(code, item) {
  try {
    const map = readCustomBarcodes();
    map[code] = item;
    localStorage.setItem(CUSTOM_BARCODES_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Open Food Facts API v2 üzerinden gerçek barkod besin değeri sorgular.
 */
async function fetchOpenFoodFactsProduct(code) {
  const clean = String(code || '').replace(/[^0-9A-Za-z]/g, '');
  if (!clean) return null;

  const custom = readCustomBarcodes()[clean];
  if (custom) return { ...custom, source: 'Yerel Kayıt' };
  if (VERIFIED_BARCODES[clean]) return { ...VERIFIED_BARCODES[clean], source: 'Doğrulanmış Liste' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5500);
  try {
    const resp = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(clean)}.json?fields=product_name,product_name_tr,brands,nutriments,serving_quantity`,
      { signal: controller.signal }
    );
    if (!resp.ok) return null;
    const json = await resp.json();
    if (json?.status !== 1 || !json.product) return null;

    const p = json.product;
    const n = p.nutriments || {};
    const kcal = Math.round(
      Number(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? (n.energy_100g ? n.energy_100g / 4.184 : 0))
    ) || 0;
    const protein = Math.round((Number(n.proteins_100g ?? n.proteins) || 0) * 10) / 10;
    const carbs = Math.round((Number(n.carbohydrates_100g ?? n.carbohydrates) || 0) * 10) / 10;
    const fat = Math.round((Number(n.fat_100g ?? n.fat) || 0) * 10) / 10;
    const rawName = p.product_name_tr || p.product_name || '';
    const brand = p.brands ? `${p.brands.split(',')[0].trim()} · ` : '';
    const name = `${brand}${rawName || `Ürün (${clean})`}`.trim();

    if (!rawName && kcal === 0 && protein === 0) return null;
    return {
      name,
      per100g: { calories: kcal, protein, carbs, fat },
      defaultGram: Number(p.serving_quantity) > 0 ? Math.min(1000, Math.round(Number(p.serving_quantity))) : 100,
      source: 'Open Food Facts'
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default function BarcodeScannerModal({ onAddMeal, onClose }) {
  const { t } = useI18n();
  const [scanning, setScanning] = useState(true);
  const [lookingUp, setLookingUp] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [portionGrams, setPortionGrams] = useState(100);
  const [notFoundCode, setNotFoundCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [hasDetector, setHasDetector] = useState(false);

  // Bulunamayan barkodlar için dürüst manuel kayıt formu
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customPro, setCustomPro] = useState('');
  const [customCarb, setCustomCarb] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [rememberBarcode, setRememberBarcode] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const busyDetectRef = useRef(false);

  const lookupBarcode = useCallback(async (code) => {
    const normalized = String(code || '').trim();
    if (!normalized || busyDetectRef.current) return;
    busyDetectRef.current = true;
    setLookingUp(true);
    setNotFoundCode('');

    const product = await fetchOpenFoodFactsProduct(normalized);
    setLookingUp(false);
    busyDetectRef.current = false;

    if (product) {
      sounds.success();
      setScannedProduct(product);
      setPortionGrams(product.defaultGram || 100);
      setScanning(false);
    } else {
      sounds.tap();
      setNotFoundCode(normalized);
      setCustomName('');
      setCustomCal('');
      setCustomPro('');
      setCustomCarb('');
      setCustomFat('');
      setScanning(false);
    }
  }, []);

  // Kamera ve varsa tarayıcının yerel optik BarcodeDetector döngüsünü başlat
  useEffect(() => {
    if (!scanning) return;
    let active = true;
    let scanInterval = null;
    const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    setHasDetector(supported);

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('NO_CAM');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (!active) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if (supported) {
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']
          });
          scanInterval = setInterval(async () => {
            if (!active || !videoRef.current || videoRef.current.readyState < 2 || busyDetectRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes && codes.length > 0 && codes[0].rawValue) {
                lookupBarcode(codes[0].rawValue);
              }
            } catch {}
          }, 350);
        }
      } catch {
        if (active) {
          setCameraError(t('barcode.noDetector'));
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (scanInterval) clearInterval(scanInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
    };
  }, [scanning, lookupBarcode, t]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    lookupBarcode(manualCode.trim());
  };

  const scaledMacros = scannedProduct
    ? {
        name: `${scannedProduct.name} (${portionGrams}g)`,
        calories: Math.round((scannedProduct.per100g.calories * portionGrams) / 100),
        protein: Math.round(((scannedProduct.per100g.protein * portionGrams) / 100) * 10) / 10,
        carbs: Math.round(((scannedProduct.per100g.carbs * portionGrams) / 100) * 10) / 10,
        fat: Math.round(((scannedProduct.per100g.fat * portionGrams) / 100) * 10) / 10
      }
    : null;

  const confirmAdd = () => {
    if (!scaledMacros) return;
    sounds.success();
    onAddMeal(scaledMacros);
    onClose();
  };

  const handleSaveManualProduct = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const per100 = {
      calories: Number(customCal) || 0,
      protein: Number(customPro) || 0,
      carbs: Number(customCarb) || 0,
      fat: Number(customFat) || 0
    };
    if (rememberBarcode && notFoundCode) {
      saveCustomBarcode(notFoundCode, {
        name: customName.trim(),
        per100g: per100,
        defaultGram: 100
      });
    }
    sounds.success();
    onAddMeal({
      name: customName.trim(),
      ...per100
    });
    onClose();
  };

  const resetScanner = () => {
    setScannedProduct(null);
    setNotFoundCode('');
    setScanning(true);
  };

  return (
    <div className="fx-modalBackdrop" onClick={onClose}>
      <div className="fx-modal fx-barcodeModal" onClick={(e) => e.stopPropagation()}>
        <div className="fx-modalHead">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Scan size={18} color="#06b6d4" /> {t('barcode.title')}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
              {t('barcode.sub')}
            </p>
          </div>
          <button type="button" className="fx-modalClose" onClick={onClose}>
            ✕
          </button>
        </div>

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
                  {hasDetector ? t('barcode.liveActive') : t('barcode.noDetector')}
                </div>
              </div>
            ) : (
              <div className="fx-cameraFallback">
                <AlertCircle size={32} color="#f59e0b" />
                <p>{cameraError}</p>
              </div>
            )}

            {lookingUp && (
              <div className="fx-analyzingBanner animate-pulse" style={{ marginTop: 10 }}>
                <RefreshCw size={15} className="animate-spin" />
                <span>{t('barcode.searching')}</span>
              </div>
            )}

            <div className="fx-sampleBarcodesSection">
              <span className="fx-subLabel">HIZLI DOĞRULANMIŞ ÜRÜNLER:</span>
              <div className="fx-sampleBarcodePills">
                {Object.entries(VERIFIED_BARCODES).map(([code, item]) => (
                  <button
                    key={code}
                    type="button"
                    className="fx-sampleBarcodeBtn"
                    onClick={() => lookupBarcode(code)}
                  >
                    <Scan size={12} /> {item.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleManualSearch} className="fx-manualBarcodeInputRow">
              <input
                type="text"
                placeholder={t('barcode.manualPlaceholder')}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <button type="submit" className="fx-btn fx-solarBtn" disabled={lookingUp}>
                <Search size={15} /> Ara
              </button>
            </form>
          </div>
        ) : notFoundCode ? (
          <form onSubmit={handleSaveManualProduct} className="fx-stack animate-scale-in">
            <div className="fx-scannedHeader">
              <span className="fx-subLabel" style={{ color: '#f59e0b' }}>
                <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                BARKOD: {notFoundCode}
              </span>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--fx-muted)' }}>
                {t('barcode.notFound')}
              </p>
            </div>

            <div className="fx-field">
              <label>Ürün Adı *</label>
              <input
                type="text"
                placeholder="Örn: Protein Bar 50g"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
              />
            </div>

            <div className="fx-grid2" style={{ gap: 10 }}>
              <div className="fx-field">
                <label>Kalori (kcal)</label>
                <input type="number" min="0" value={customCal} onChange={(e) => setCustomCal(e.target.value)} required />
              </div>
              <div className="fx-field">
                <label>Protein (g)</label>
                <input type="number" min="0" step="0.1" value={customPro} onChange={(e) => setCustomPro(e.target.value)} required />
              </div>
              <div className="fx-field">
                <label>Karbonhidrat (g)</label>
                <input type="number" min="0" step="0.1" value={customCarb} onChange={(e) => setCustomCarb(e.target.value)} />
              </div>
              <div className="fx-field">
                <label>Yağ (g)</label>
                <input type="number" min="0" step="0.1" value={customFat} onChange={(e) => setCustomFat(e.target.value)} />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fx-muted)' }}>
              <input
                type="checkbox"
                checked={rememberBarcode}
                onChange={(e) => setRememberBarcode(e.target.checked)}
              />
              <span>Bu barkodu sonraki taramalar için cihazıma kaydet</span>
            </label>

            <div className="fx-scannedActions">
              <button type="button" className="fx-btn fx-btn--ghost" onClick={resetScanner}>
                Yeniden Tara
              </button>
              <button type="submit" className="fx-btn fx-solarBtn">
                <BookmarkPlus size={15} /> {t('barcode.addMeal')}
              </button>
            </div>
          </form>
        ) : (
          <div className="fx-stack fx-scannedResultCard animate-scale-in">
            <div className="fx-scannedHeader">
              <span className="fx-badgeOk">
                <Check size={14} /> {scannedProduct.source || 'Doğrulandı'}
              </span>
              <h4>{scannedProduct.name}</h4>
            </div>

            <div className="fx-field" style={{ maxWidth: 200 }}>
              <label>{t('barcode.gramLabel')}</label>
              <input
                type="number"
                min="1"
                max="2000"
                step="5"
                value={portionGrams}
                onChange={(e) => setPortionGrams(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <div className="fx-grid3 fx-macroTrioGrid" style={{ margin: '10px 0' }}>
              <div className="fx-macroBox" style={{ borderColor: 'rgba(16, 185, 129, 0.45)' }}>
                <small style={{ color: '#10b981' }}>PROTEİN</small>
                <b>{scaledMacros.protein} g</b>
              </div>
              <div className="fx-macroBox" style={{ borderColor: 'rgba(245, 158, 11, 0.45)' }}>
                <small style={{ color: '#f59e0b' }}>KARBONHİDRAT</small>
                <b>{scaledMacros.carbs} g</b>
              </div>
              <div className="fx-macroBox" style={{ borderColor: 'rgba(255, 77, 28, 0.45)' }}>
                <small style={{ color: '#ff4d1c' }}>KALORİ</small>
                <b>{scaledMacros.calories} kcal</b>
              </div>
            </div>

            <div className="fx-scannedActions">
              <button type="button" className="fx-btn fx-btn--ghost" onClick={resetScanner}>
                Yeni Barkod Tara
              </button>
              <button type="button" className="fx-btn fx-solarBtn" onClick={confirmAdd}>
                <Plus size={16} /> {t('barcode.addMeal')} (+{scaledMacros.protein}g Protein)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
