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
