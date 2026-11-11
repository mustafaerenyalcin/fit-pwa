import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Flame,
  Search,
  Star,
  Bookmark,
  Check,
  Info,
  Droplets,
  Sparkles,
  Pill,
  Copy,
  ChevronDown,
  Layers,
  Scan
} from 'lucide-react';
import Metric from '../components/Metric.jsx';
import Panel from '../components/Panel.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import BarcodeScannerModal from '../components/BarcodeScannerModal.jsx';
import { FOOD_DATABASE, calculateFoodNutrition } from '../lib/foodDatabase.js';
import { FOOD_EXAMPLES, SUPPLEMENT_LIST } from '../lib/constants.js';

export default function NutritionView({
  day,
  profile,
  entries,
  target,
  totals,
  onAddMeal,
  onRemoveMeal,
  onAddSupplement,
  onRemoveSupplement
}) {
  const [mealCategory, setMealCategory] = useState('Öğle');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Food database search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [customGram, setCustomGram] = useState(150);

  // Barcode Scanner Modal State
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Supplements state
  const [selectedSupplement, setSelectedSupplement] = useState('Kreatin');
  const [supplementDose, setSupplementDose] = useState('5');

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fit-fav-meals')) || [
        { name: '3 Haşlanmış Yumurta & Yulaf', calories: 420, protein: 27, carbs: 42, fat: 16 },
        { name: '150g Tavuk Göğsü & Pirinç Pilavı', calories: 480, protein: 50, carbs: 48, fat: 6 },
        { name: '200g Süzme Yoğurt & Muz', calories: 320, protein: 20, carbs: 35, fat: 12 },
        { name: '150g Somon & Fırın Patates', calories: 510, protein: 36, carbs: 42, fat: 18 }
      ];
    } catch {
      return [];
    }
  });

  const saveFavorite = (item) => {
    const next = [...favorites, item];
    setFavorites(next);
    try {
      localStorage.setItem('fit-fav-meals', JSON.stringify(next));
    } catch {}
  };

  const removeFavorite = (idx) => {
    const next = favorites.filter((_, i) => i !== idx);
    setFavorites(next);
    try {
      localStorage.setItem('fit-fav-meals', JSON.stringify(next));
    } catch {}
  };

  // Find yesterday's date
  const yDate = new Date(day + 'T12:00:00');
  yDate.setDate(yDate.getDate() - 1);
  const yesterdayIso = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, '0')}-${String(yDate.getDate()).padStart(2, '0')}`;
  const yesterdayMeals = entries.meal.filter((e) => e.day === yesterdayIso);

  const copyYesterdayMeals = () => {
    if (!yesterdayMeals.length) return;
    yesterdayMeals.forEach((m) => {
      onAddMeal({
        category: m.payload?.category || 'Öğün',
        name: m.payload?.name,
        calories: m.payload?.calories || 0,
        protein: m.payload?.protein || 0,
        carbs: m.payload?.carbs || 0,
        fat: m.payload?.fat || 0
      });
    });
  };

  const todayMeals = entries.meal.filter((e) => e.day === day);
  const todaySupplements = entries.supplement.filter((e) => e.day === day);

  // Search filtered foods
  const filteredFoods = searchQuery.trim()
    ? FOOD_DATABASE.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectFoodFromDb = (food) => {
    setSelectedFood(food);
    setCustomGram(food.defaultGram);
    const nut = calculateFoodNutrition(food, food.defaultGram);
    setMealName(`${food.name} (${food.defaultGram}g)`);
    setCalories(nut.calories);
    setProtein(nut.protein);
    setCarbs(nut.carbs);
    setFat(nut.fat);
  };

  const handleGramsChange = (g) => {
    setCustomGram(g);
    if (selectedFood) {
      const nut = calculateFoodNutrition(selectedFood, g);
      setMealName(`${selectedFood.name} (${g}g)`);
      setCalories(nut.calories);
      setProtein(nut.protein);
      setCarbs(nut.carbs);
      setFat(nut.fat);
    }
  };

  const handleSubmitMeal = () => {
    if (!mealName.trim()) return;
    onAddMeal({
      category: mealCategory,
      name: mealName.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0
    });
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setSelectedFood(null);
    setSearchQuery('');
  };

  const addFavoriteToToday = (fav) => {
    onAddMeal({
      category: mealCategory,
      name: fav.name,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat
    });
  };

  const handleBarcodeMealAdd = (foodItem) => {
    onAddMeal({
      category: mealCategory,
      name: foodItem.name,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fat: foodItem.fat
    });
  };

  // Macro Calorie Distribution percentages (% Pro, % Carb, % Fat)
  const totalCalFromMacros = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
  const proPct = totalCalFromMacros > 0 ? Math.round(((totals.protein * 4) / totalCalFromMacros) * 100) : 0;
  const carbPct = totalCalFromMacros > 0 ? Math.round(((totals.carbs * 4) / totalCalFromMacros) * 100) : 0;
  const fatPct = totalCalFromMacros > 0 ? Math.round(((totals.fat * 9) / totalCalFromMacros) * 100) : 0;

  return (
    <div className="nutritionView">
      <div className="intro">
        <h2>Beslenme ve Makro Takibi</h2>
        <p>
          Kas kazanımı ve yağ oranı kontrolü için dengeli beslenme planı. Türk mutfağına özel
          veritabanından arama yapabilir, gramaj seçebilir, sık yediğin favorileri tek dokunuşla
          ekleyebilir veya dünün menüsünü kopyalayabilirsin.
        </p>
      </div>

      {/* Copy Yesterday's Meals Button */}
      {yesterdayMeals.length > 0 && todayMeals.length === 0 && (
        <div className="copyYesterdayBanner">
          <Copy size={16} />
          <span>Dün ({yesterdayIso}) {yesterdayMeals.length} öğün kaydettin. Aynısını bugüne kopyalamak ister misin?</span>
          <button type="button" className="pillBtn primaryPill" onClick={copyYesterdayMeals}>
            Dünün Öğünlerini Kopyala
          </button>
        </div>
      )}

      {/* Macro Metrics */}
      <div className="metrics four">
        <Metric
          label="GÜNLÜK PROTEİN HEDEFİ"
          value={`${target.protein} g`}
          extra={`${totals.protein} g alındı · ${Math.max(0, target.protein - totals.protein)} g kaldı`}
          icon={Utensils}
        />
        <Metric
          label="ALINAN KALORİ"
          value={`${totals.calories} kcal`}
          extra="Günlük toplam kalori"
          icon={Flame}
        />
        <Metric
          label="KARBONHİDRAT"
          value={`${totals.carbs} g`}
          extra="Enerji ve kas glikojeni"
          icon={Utensils}
        />
        <Metric
          label="SAĞLIKLI YAĞ"
          value={`${totals.fat} g`}
          extra={`Hedef: ~${target.fat} g`}
          icon={Flame}
        />
      </div>

      <div className="twoCols">
        {/* Add Meal / Food Search Panel */}
        <Panel title="Öğün & Besin Ekle" sub="Veritabanından seç veya manuel gir">
          {/* Meal Category Selector */}
          <div className="mealCategoryTabs">
            {['Kahvaltı', 'Öğle', 'Akşam', 'Ara Öğün'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`categoryPill ${mealCategory === cat ? 'active' : ''}`}
                onClick={() => setMealCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Ücretsiz Barkod Tarayıcı Hızlı Başlatma Butonu */}
          <div className="fx-barcodeTriggerWrap" style={{ margin: '10px 0 14px 0' }}>
            <button
              type="button"
              className="fx-btn fx-solarBtn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 16px',
                fontSize: 13.5,
                fontWeight: 800,
                borderRadius: 14,
                boxShadow: '0 4px 18px rgba(255, 77, 28, 0.22)'
              }}
              onClick={() => setShowBarcodeScanner(true)}
            >
              <Scan size={17} /> Kamera ile Ücretsiz Barkod Tara (Sıfır Paywall)
            </button>
          </div>

          {/* Database Search Input */}
          <div className="searchFoodBox">
            <div className="searchInputWrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Besin ara (örn: tavuk, yumurta, yulaf, lor, somon…)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredFoods.length > 0 && (
              <div className="searchResultsDropdown">
                {filteredFoods.slice(0, 8).map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    className="searchResultItem"
                    onClick={() => handleSelectFoodFromDb(food)}
                  >
                    <div>
                      <b>{food.name}</b>
                      <small>{food.portionDesc}</small>
                    </div>
                    <span className="calBadge">
                      {food.per100g.calories} kcal / 100g
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Food Grams Adjuster */}
          {selectedFood && (
            <div className="selectedFoodAdjuster">
              <div className="adjusterRow">
                <span>Porsiyon Gramajı:</span>
                <div className="gramButtons">
                  {[50, 100, 150, 200, 250].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`gramBtn ${customGram === g ? 'active' : ''}`}
                      onClick={() => handleGramsChange(g)}
                    >
                      {g}g
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={customGram}
                  onChange={(e) => handleGramsChange(Number(e.target.value) || 0)}
                  className="gramInput"
                />
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="formGrid" style={{ marginTop: 12 }}>
            <label className="wide">
              Öğün / Besin Adı
              <input
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="Örn: Izgara Tavuk & Bulgur Pilavı"
              />
            </label>
            <label>
              Kalori (kcal)
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="450"
              />
            </label>
            <label>
              Protein (g)
              <input
                type="number"
                min="0"
                step="0.5"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="40"
              />
            </label>
            <label>
              Karbonhidrat (g)
              <input
                type="number"
                min="0"
                step="0.5"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="45"
              />
            </label>
            <label>
              Yağ (g)
              <input
                type="number"
                min="0"
                step="0.5"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="8"
              />
            </label>
          </div>

          <div className="formActionButtons">
            <button
              type="button"
              className="primary"
              disabled={!mealName.trim()}
              onClick={handleSubmitMeal}
            >
              <Plus size={16} /> Öğünü Kaydet ({mealCategory})
            </button>

            {mealName.trim() && calories && protein && (
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  saveFavorite({
                    name: mealName.trim(),
                    calories: Number(calories) || 0,
                    protein: Number(protein) || 0,
                    carbs: Number(carbs) || 0,
                    fat: Number(fat) || 0
                  })
                }
                title="Sık tüketilen favorilere kaydet"
              >
                <Bookmark size={15} /> Favorilere Ekle
              </button>
            )}
          </div>
        </Panel>

        {/* Daily Macros & Summary Panel */}
        <Panel title="Bugünün Makro Dağılımı" sub={day}>
          <div className="nutritionNumbers">
            <div>
              <b>{totals.protein} g</b>
              <small>Protein ({target.protein} g hedef)</small>
            </div>
            <div>
              <b>{totals.calories}</b>
              <small>Toplam Kalori</small>
            </div>
            <div>
              <b>{totals.carbs} g</b>
              <small>Karbonhidrat</small>
            </div>
            <div>
              <b>{totals.fat} g</b>
              <small>Sağlıklı Yağ</small>
            </div>
          </div>

          <ProgressBar current={totals.protein} target={target.protein} />

          {/* Segmented Macro Bar */}
          {totalCalFromMacros > 0 && (
            <div className="macroSegmentContainer">
              <span className="macroSegmentTitle">Enerji Dağılım Oranı:</span>
              <div className="macroSegmentBar">
                <span className="segPro" style={{ width: `${proPct}%` }} title={`Protein %${proPct}`} />
                <span className="segCarb" style={{ width: `${carbPct}%` }} title={`Karbonhidrat %${carbPct}`} />
                <span className="segFat" style={{ width: `${fatPct}%` }} title={`Yağ %${fatPct}`} />
              </div>
              <div className="macroSegmentLegend">
                <span><i style={{ background: '#7ee787' }} /> %{proPct} Protein</span>
                <span><i style={{ background: '#f0883e' }} /> %{carbPct} Karb</span>
                <span><i style={{ background: '#e3b341' }} /> %{fatPct} Yağ</span>
              </div>
            </div>
          )}

          {/* Favorites / Templates Quick Add */}
          <div className="favoritesSection">
            <div className="favHeader">
              <Star size={15} className="favStar" />
              <b>Favori & Sık Tüketilen Öğünler</b>
            </div>
            <div className="favList">
              {favorites.map((fav, i) => (
                <div key={i} className="favItemRow">
                  <div className="favItemMeta">
                    <b>{fav.name}</b>
                    <small>
                      {fav.calories} kcal · {fav.protein}g protein · {fav.carbs}g karb
                    </small>
                  </div>
                  <div className="favItemBtns">
                    <button
                      type="button"
                      className="pillBtn primaryPill"
                      onClick={() => addFavoriteToToday(fav)}
                      title="Bugüne ekle"
                    >
                      <Plus size={13} /> Ekle
                    </button>
                    <button
                      type="button"
                      className="dangerIconBtn"
                      onClick={() => removeFavorite(i)}
                      title="Favorilerden kaldır"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Today's Logged Meals & Supplements */}
      <div className="twoCols">
        {/* Today's Meals */}
        <Panel title="Bugün Tüketilen Öğünler">
          <div className="history">
            {todayMeals.length ? (
              todayMeals.map((m) => (
                <div className="historyRow" key={m.id}>
                  <div>
                    <span className="mealCatBadge">{m.payload?.category || 'Öğün'}</span>
                    <b>{m.payload?.name}</b>
                    <small>
                      {m.payload?.calories} kcal · {m.payload?.protein}g protein · {m.payload?.carbs || 0}g karb · {m.payload?.fat || 0}g yağ
                    </small>
                  </div>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => onRemoveMeal(m.id)}
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Utensils}
                title="Bugün henüz öğün girilmedi"
                description="Yukarıdaki arama çubuğunu veya formu kullanarak öğünlerini ekle."
              />
            )}
          </div>
        </Panel>

        {/* Supplement Tracking */}
        <Panel title="Takviye Takibi" sub="Kreatin, Protein Tozu ve BCAA">
          <div className="measureInput">
            <label>
              Takviye
              <select
                value={selectedSupplement}
                onChange={(e) => {
                  setSelectedSupplement(e.target.value);
                  if (e.target.value === 'Kreatin') setSupplementDose('5');
                  if (e.target.value === 'Protein tozu') setSupplementDose('30');
                  if (e.target.value === 'BCAA') setSupplementDose('5');
                }}
              >
                {SUPPLEMENT_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Doz (Gram)
              <input
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={supplementDose}
                onChange={(e) => setSupplementDose(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="primary"
              disabled={!supplementDose || Number(supplementDose) <= 0}
              onClick={() => {
                onAddSupplement({
                  name: selectedSupplement,
                  grams: Number(supplementDose) || 0
                });
              }}
            >
              <Plus size={16} /> Kullanımı Kaydet
            </button>
          </div>

          <div className="history" style={{ marginTop: 14 }}>
            {todaySupplements.map((s) => (
              <div className="historyRow" key={s.id}>
                <span>
                  <Pill size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#b3f46f' }} />
                  <b>{s.payload?.name}: </b>
                  <span>{s.payload?.grams} g alındı</span>
                </span>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onRemoveSupplement(s.id)}
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="supplementScientificNotice">
            <Info size={16} />
            <div>
              <b>Bilimsel Takviye Notu:</b>
              <p>
                <b>Kreatin:</b> Günde 3–5g düzenli kullanım kas gücü ve dolgunluğunda kanıtlanmış
                fayda sağlar; bol su ile tüketilmelidir.
              </p>
              <p>
                <b>Protein tozu:</b> Günlük besinlerle protein hedefini karşılayamadığında pratik bir
                destektir.
              </p>
              <p>
                <b>BCAA:</b> Günlük protein alımın yeterliyse BCAA ek bir kas yapımı sağlamaz;
                öncelik dengeli beslenmedir.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Turkish Protein Source Cheat Sheet */}
      <Panel title="Pratik Türk Proteini Kaynakları">
        <div className="history">
          {FOOD_EXAMPLES.map(([name, note]) => (
            <div className="historyRow" key={name}>
              <span>{name}</span>
              <b className="lightText">{note}</b>
            </div>
          ))}
        </div>
      </Panel>

      {/* Ücretsiz Barkod Tarayıcı Modalı */}
      {showBarcodeScanner && (
        <BarcodeScannerModal
          onAddMeal={handleBarcodeMealAdd}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  );
}
