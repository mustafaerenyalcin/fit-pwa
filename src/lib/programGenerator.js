import { callAI } from './api.js';
import { setSetting } from './store.js';
import { scheduleSync } from './supabase.js';

/**
 * Kullanıcının profiline ve ekipmanına göre AI ile haftalık program üretir.
 * Program settings -> 'customProgram' olarak kaydedilir ve tüm cihazlara senkronize olur.
 */
export async function generateProgram(profile) {
  const res = await callAI('program', { profile });
  const program = res.data;
  if (!program || !Array.isArray(program.days) || !program.days.length) {
    throw new Error('Program oluşturulamadı, tekrar dene.');
  }
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = program.days.find((x) => Number(x.dayIndex) === i);
    return d || { dayIndex: i, rest: true, name: 'Dinlenme', focus: 'Toparlanma', tips: [] };
  });
  const saved = {
    name: program.name || 'Kişisel Programım',
    summary: program.summary || '',
    createdAt: new Date().toISOString(),
    days
  };
  setSetting('customProgram', saved);
  scheduleSync();
  return saved;
}
