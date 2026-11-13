/**
 * Egzersiz Performansı, Kişisel Rekorlar (PR) ve Progressive Overload Analizi
 */

/**
 * Tüm antrenman geçmişinden egzersiz bazında kişisel rekorları (PR) çıkarır
 * @param {Array} workoutEntries
 * @returns {Record<string, { maxWeight: number, maxRepsAtMaxWeight: number, bestSetVolume: number, lastDate: string }>}
 */
export function calculatePersonalRecords(workoutEntries = []) {
  const prs = {};

  for (const entry of workoutEntries) {
    const sets = entry.payload?.sets || {};
    const date = entry.day;

    for (const [exerciseName, setInfo] of Object.entries(sets)) {
      if (!setInfo || typeof setInfo !== 'object') continue;

      const kg = Number(setInfo.kg) || 0;
      const reps = Number(setInfo.reps) || 0;
      const setVolume = kg * reps;

      if (!prs[exerciseName]) {
        prs[exerciseName] = {
          maxWeight: kg,
          maxRepsAtMaxWeight: reps,
          bestSetVolume: setVolume,
          lastDate: date
        };
      } else {
        const cur = prs[exerciseName];
        if (kg > cur.maxWeight) {
          cur.maxWeight = kg;
          cur.maxRepsAtMaxWeight = reps;
          cur.lastDate = date;
        } else if (kg === cur.maxWeight && reps > cur.maxRepsAtMaxWeight) {
          cur.maxRepsAtMaxWeight = reps;
        }

        if (setVolume > cur.bestSetVolume) {
          cur.bestSetVolume = setVolume;
        }
      }
    }
  }

  return prs;
}

/**
 * Belirli bir egzersiz için zaman içindeki ağırlık gelişim geçmişini döner
 * @param {Array} workoutEntries
 * @param {string} exerciseName
 * @returns {Array<{ day: string, value: number, reps: number }>}
 */
export function getExerciseHistory(workoutEntries = [], exerciseName) {
  const history = [];

  for (const entry of workoutEntries) {
    const setInfo = entry.payload?.sets?.[exerciseName];
    if (setInfo && typeof setInfo.kg !== 'undefined' && setInfo.kg !== null) {
      history.push({
        day: entry.day,
        value: Number(setInfo.kg) || 0,
        reps: Number(setInfo.reps) || 0
      });
    }
  }

  // Tarihe göre artan sırala
  return history.sort((a, b) => a.day.localeCompare(b.day));
}

/**
 * Progressive Overload Analizi ve Önerisi
 * Son antrenmandaki performans hedeflenen aralığı aştıysa veya tüm setlerde temiz tamamlandıysa artış önerir
 * @param {object} lastPerformance - { kg, reps, sets }
 * @param {string} targetRepsStr - örn: "8–12" veya "12–15"
 * @returns {{ shouldIncrease: boolean, suggestedKg: number, reason: string } | null}
 */
export function getProgressiveOverloadAdvice(lastPerformance, targetRepsStr = '8-12') {
  if (!lastPerformance || !lastPerformance.kg) return null;

  const kg = Number(lastPerformance.kg);
  const reps = Number(lastPerformance.reps);

  // Reps aralığını parse et
  const match = String(targetRepsStr).match(/(\d+)[–-](\d+)/);
  const maxTargetRep = match ? Number(match[2]) : 12;

  if (reps >= maxTargetRep) {
    // Üst tekrar aralığına ulaşıldı, 1-2 kg veya küçük artış öner
    const inc = kg <= 10 ? 1 : 2;
    return {
      shouldIncrease: true,
      suggestedKg: kg + inc,
      reason: `Önceki antrenmanda ${reps} tekrarı başarıyla tamamladın. Sonraki adımda ağırlığı ${kg + inc} kg'a çıkarmayı deneyebilirsin.`
    };
  } else {
    return {
      shouldIncrease: false,
      suggestedKg: kg,
      reason: `Mevcut ${kg} kg ile devam et; hedef tekrara (${maxTargetRep} tekrar) temiz formla ulaşana kadar ağırlığı koru.`
    };
  }
}

/**
 * Bir antrenman kaydındaki toplam kaldırılan hacmi (Volume: kg x tekrar x set) hesaplar
 * @param {object} sets
 * @returns {number} Toplam kg
 */
export function calculateWorkoutVolume(sets = {}) {
  let totalVolume = 0;
  for (const setInfo of Object.values(sets)) {
    if (!setInfo) continue;
    const kg = Number(setInfo.kg) || 0;
    const reps = Number(setInfo.reps) || 0;
    const numSets = Number(setInfo.sets) || 1;
    totalVolume += kg * reps * numSets;
  }
  return Math.round(totalVolume);
}

/**
 * Hedef set / tekrar metnini (örn: "3 × 8–12", "4 × 12-15", "3 × Maks", "3 × 45–60 sn")
 * ortalama varsayılan sayılara çevirir.
 * @param {string} rawTarget
 * @param {number} defaultSetsFallback
 * @param {number|string} defaultRepsFallback
 * @returns {{ sets: number, reps: number, isTimeBased: boolean }}
 */
export function parseSetRepTarget(rawTarget = '', defaultSetsFallback = 3, defaultRepsFallback = 10) {
  const txt = String(rawTarget || '').trim();
  const isTimeBased = /\b(sn|dk|sec|min)\b/i.test(txt);

  let sets = Math.min(10, Math.max(1, Number(defaultSetsFallback) || 3));
  const setMatch = txt.match(/^(\d+)\s*[×xX]/);
  if (setMatch) {
    sets = Math.min(10, Math.max(1, Number(setMatch[1]) || 3));
  }

  const afterX = setMatch ? txt.slice(setMatch[0].length) : txt;
  const rangeMatch = afterX.match(/(\d+)\s*[–-]\s*(\d+)/);
  let reps = Number(defaultRepsFallback) || 10;

  if (rangeMatch) {
    const lo = Number(rangeMatch[1]);
    const hi = Number(rangeMatch[2]);
    reps = isTimeBased ? Math.round(((lo + hi) / 2) / 5) * 5 : Math.round((lo + hi) / 2);
  } else if (/maks|max/i.test(afterX)) {
    reps = 12;
  } else {
    const singleMatch = afterX.match(/(\d+)/);
    if (singleMatch) {
      reps = Math.max(1, Number(singleMatch[1]));
    }
  }

  return { sets, reps, isTimeBased };
}

/**
 * Kullanıcıyı her sete girerken sayı yazmaktan kurtaran ortalama ağırlık/tekrar/set üretici.
 * @param {object} move
 * @param {object|null} prevSet
 * @param {string} equipmentTr
 * @returns {{ kg: number, reps: number, sets: number, isBodyweight: boolean, isTimeBased: boolean }}
 */
export function getSmartExerciseDefaults(move = {}, prevSet = null, equipmentTr = '') {
  const name = String(move?.name || move?.[0] || '');
  const rawTarget = String(move?.sets || move?.[1] || move?.targetReps || '');
  const parsed = parseSetRepTarget(rawTarget, move?.defaultSets || 3, move?.defaultReps || 10);

  const equipLower = String(equipmentTr || '').toLowerCase();
  const explicitWeightedName = /(dumbbell|dambıl|barbell|halter|goblet|cable|kablo|machine|makine|smith|kettlebell|plate|weighted|ağırlıklı|lat pulldown|leg press|chest press)/i.test(name);
  const explicitBodyweightName = /(şınav|push-?up|plank|crunch|mekik|burpee|jumping|twist|dead bug|bridge|calf raise|pull-?up|chin-?up|inverted row|hollow|mountain climber|superman|bird dog|wall sit|glute|step-up)/i.test(name);

  const isBodyweight = !explicitWeightedName && (
    equipLower.includes('ekipmansız') ||
    equipLower.includes('kardiyo') ||
    equipLower.includes('duvar') ||
    equipLower.includes('sandalye') ||
    equipLower.includes('havlu') ||
    equipLower.includes('kapı') ||
    explicitBodyweightName
  );

  let kg = 0;
  if (prevSet && prevSet.kg !== undefined && prevSet.kg !== '') {
    kg = Number(prevSet.kg) || 0;
  } else if (move?.suggestedKg !== undefined && move?.suggestedKg !== '' && Number(move.suggestedKg) > 0) {
    kg = Number(move.suggestedKg);
  } else if (isBodyweight) {
    kg = 0;
  } else if (equipLower.includes('halter') || equipLower.includes('barbell')) {
    kg = 30;
  } else if (equipLower.includes('makine') || equipLower.includes('kablo')) {
    kg = 25;
  } else if (/(curl|raise|fly|extension|kickback|pushdown|delt)/i.test(name)) {
    kg = 6;
  } else {
    kg = 10;
  }

  return {
    kg,
    reps: prevSet?.reps ? Math.max(1, Number(prevSet.reps)) : parsed.reps,
    sets: prevSet?.sets ? Math.max(1, Number(prevSet.sets)) : parsed.sets,
    isBodyweight: kg === 0 && isBodyweight,
    isTimeBased: parsed.isTimeBased
  };
}
