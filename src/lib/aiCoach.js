/**
 * Fit AI Coach - sohbet yardımcıları
 * Tüm çağrılar güvenli sunucu fonksiyonu üzerinden yapılır (bkz. ./api.js).
 * API anahtarı istemcide bulunmaz.
 */

import { callAI } from './api.js';

/**
 * Koça serbest soru sorar.
 * @param {object} profile - Kullanıcı profili
 * @param {string} context - Kullanıcının son verilerinin özeti
 * @param {string} question - Soru
 * @returns {Promise<string>}
 */
export async function askCoach(profile, context, question) {
  if (!question || !question.trim()) {
    throw new Error('Lütfen bir soru yazın.');
  }
  const res = await callAI('chat', { profile, context, question: question.trim() });
  return res.answer;
}
