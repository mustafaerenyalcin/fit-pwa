/**
 * Türk Mutfağı ve Sporcu Besinleri Veritabanı
 * 100 gram başına besin değerleri (kcal, protein, karbonhidrat, yağ)
 */

export const FOOD_DATABASE = [
  // Protein Kaynakları
  { id: 'tavuk-gogus', name: 'Tavuk Göğsü (Pişmiş/Izgara)', category: 'protein', per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }, defaultGram: 150, portionDesc: '150g porsiyon (~46g protein)' },
  { id: 'yumurta-haslanmis', name: 'Yumurta (Haşlanmış - 1 adet ~50g)', category: 'protein', per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11 }, defaultGram: 100, portionDesc: '2 adet (~13g protein)' },
  { id: 'yumurta-beyazi', name: 'Yumurta Akı', category: 'protein', per100g: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2 }, defaultGram: 100, portionDesc: '100g (~11g protein)' },
  { id: 'dana-kiyma-yagsiz', name: 'Dana Kıyma (%10-15 yağlı)', category: 'protein', per100g: { calories: 215, protein: 26, carbs: 0, fat: 12 }, defaultGram: 150, portionDesc: '150g porsiyon (~39g protein)' },
  { id: 'dana-biftek', name: 'Dana Bonfile / Biftek (Izgara)', category: 'protein', per100g: { calories: 195, protein: 28, carbs: 0, fat: 8.5 }, defaultGram: 150, portionDesc: '150g porsiyon (~42g protein)' },
  { id: 'somon-balik', name: 'Somon Balığı (Fırın)', category: 'protein', per100g: { calories: 206, protein: 22, carbs: 0, fat: 12.5 }, defaultGram: 150, portionDesc: '150g porsiyon (~33g protein)' },
  { id: 'ton-baligi', name: 'Ton Balığı (Süzülmüş)', category: 'protein', per100g: { calories: 132, protein: 29, carbs: 0, fat: 1.2 }, defaultGram: 80, portionDesc: '1 küçük kutu (~23g protein)' },
  { id: 'lor-peyniri', name: 'Lor Peyniri (Yağsız/Tatlı)', category: 'protein', per100g: { calories: 98, protein: 17, carbs: 3.5, fat: 1.5 }, defaultGram: 100, portionDesc: '100g porsiyon (~17g protein)' },
  { id: 'suzme-yogurt', name: 'Süzme Yoğurt', category: 'protein', per100g: { calories: 115, protein: 9.5, carbs: 4.5, fat: 6.5 }, defaultGram: 200, portionDesc: '1 kase 200g (~19g protein)' },
  { id: 'ev-yogurdu', name: 'Ev Yoğurdu', category: 'protein', per100g: { calories: 65, protein: 4, carbs: 5, fat: 3.5 }, defaultGram: 200, portionDesc: '1 kase 200g (~8g protein)' },
  { id: 'beyaz-peynir', name: 'Klasik Beyaz Peynir', category: 'protein', per100g: { calories: 260, protein: 16, carbs: 2, fat: 21 }, defaultGram: 50, portionDesc: '1 dilim 50g (~8g protein)' },
  { id: 'kashar-peynir', name: 'Taze Kaşar Peyniri', category: 'protein', per100g: { calories: 340, protein: 25, carbs: 1.5, fat: 26 }, defaultGram: 40, portionDesc: '2 dilim 40g (~10g protein)' },
  { id: 'protein-tozu', name: 'Whey Protein Tozu (1 Ölçek ~30g)', category: 'protein', per100g: { calories: 380, protein: 80, carbs: 6, fat: 4 }, defaultGram: 30, portionDesc: '1 ölçek 30g (~24g protein)' },

  // Karbonhidrat & Tahıllar
  { id: 'pirinc-pilavi', name: 'Pirinç Pilavı (Pişmiş)', category: 'carbs', per100g: { calories: 160, protein: 2.7, carbs: 32, fat: 2.2 }, defaultGram: 150, portionDesc: '1 porsiyon 150g (~48g karb)' },
  { id: 'bulgur-pilavi', name: 'Bulgur Pilavı (Pişmiş)', category: 'carbs', per100g: { calories: 150, protein: 3.5, carbs: 29, fat: 2.5 }, defaultGram: 150, portionDesc: '1 porsiyon 150g (~43g karb)' },
  { id: 'yulaf-ezmesi', name: 'Yulaf Ezmesi (Kuru)', category: 'carbs', per100g: { calories: 370, protein: 13, carbs: 62, fat: 7 }, defaultGram: 60, portionDesc: '60g porsiyon (~8g pro, 37g karb)' },
  { id: 'makarna', name: 'Makarna (Pişmiş)', category: 'carbs', per100g: { calories: 158, protein: 5.8, carbs: 31, fat: 0.9 }, defaultGram: 150, portionDesc: '1 porsiyon 150g (~46g karb)' },
  { id: 'patates-haslama', name: 'Patates (Haşlanmış/Fırın)', category: 'carbs', per100g: { calories: 87, protein: 1.9, carbs: 20, fat: 0.1 }, defaultGram: 200, portionDesc: '1 orta boy (~40g karb)' },
  { id: 'tam-bugday-ekmek', name: 'Tam Buğday Ekmeği (1 dilim ~30g)', category: 'carbs', per100g: { calories: 247, protein: 9, carbs: 46, fat: 3 }, defaultGram: 60, portionDesc: '2 dilim (~28g karb)' },
  { id: 'muz', name: 'Muz (1 orta boy ~120g)', category: 'carbs', per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 }, defaultGram: 120, portionDesc: '1 adet (~27g karb)' },
  { id: 'elma', name: 'Elma', category: 'carbs', per100g: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 }, defaultGram: 150, portionDesc: '1 adet (~21g karb)' },

  // Bakliyat & Ev Yemekleri
  { id: 'mercimek-corbasi', name: 'Mercimek Çorbası', category: 'meals', per100g: { calories: 65, protein: 3.2, carbs: 9.5, fat: 1.5 }, defaultGram: 250, portionDesc: '1 kase 250ml (~8g protein)' },
  { id: 'kuru-fasulye', name: 'Kuru Fasulye Yemeği (Pişmiş)', category: 'meals', per100g: { calories: 110, protein: 6.5, carbs: 16, fat: 2.5 }, defaultGram: 200, portionDesc: '1 tabak 200g (~13g protein)' },
  { id: 'nohut-yemegi', name: 'Nohut Yemeği (Pişmiş)', category: 'meals', per100g: { calories: 125, protein: 6.8, carbs: 18, fat: 3.0 }, defaultGram: 200, portionDesc: '1 tabak 200g (~14g protein)' },
  { id: 'kiymali-yumurta', name: 'Kıymalı Yumurta', category: 'meals', per100g: { calories: 185, protein: 16, carbs: 1.2, fat: 13 }, defaultGram: 180, portionDesc: '1 porsiyon (~29g protein)' },
  { id: 'menemen', name: 'Menemen (Az yağlı)', category: 'meals', per100g: { calories: 110, protein: 6.5, carbs: 4.5, fat: 7.5 }, defaultGram: 200, portionDesc: '1 porsiyon (~13g protein)' },

  // Sağlıklı Yağlar & Kuruyemişler
  { id: 'zeytinyagi', name: 'Zeytinyağı (1 yemek kaşığı ~10g)', category: 'fats', per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 }, defaultGram: 10, portionDesc: '1 yemek kaşığı (~10g yağ)' },
  { id: 'fistik-ezmesi', name: 'Doğal Fıstık Ezmesi', category: 'fats', per100g: { calories: 590, protein: 25, carbs: 19, fat: 49 }, defaultGram: 25, portionDesc: '1 tatlı kaşığı (~6g pro, 12g yağ)' },
  { id: 'cig-badem', name: 'Çiğ Badem', category: 'fats', per100g: { calories: 579, protein: 21, carbs: 22, fat: 50 }, defaultGram: 25, portionDesc: '1 avuç ~25g (~5g pro, 12g yağ)' },
  { id: 'ceviz-ici', name: 'Ceviz İçi', category: 'fats', per100g: { calories: 654, protein: 15, carbs: 14, fat: 65 }, defaultGram: 25, portionDesc: '3-4 tam ceviz (~16g yağ)' }
];

/**
 * Verilen gramaja göre kalori ve makro hesaplar
 */
export function calculateFoodNutrition(food, grams) {
  const ratio = (Number(grams) || 0) / 100;
  return {
    calories: Math.round(food.per100g.calories * ratio),
    protein: Math.round((food.per100g.protein * ratio) * 10) / 10,
    carbs: Math.round((food.per100g.carbs * ratio) * 10) / 10,
    fat: Math.round((food.per100g.fat * ratio) * 10) / 10
  };
}
