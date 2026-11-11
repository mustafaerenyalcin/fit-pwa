/**
 * Web Bridge & Global Window.fit API
 * Delegates seamlessly to modular store and supabase engines.
 */

import {
  getSetting,
  setSetting,
  list,
  add,
  remove,
  exportBackup,
  importBackup
} from './lib/store.js';

import {
  supabase,
  status as supabaseStatus,
  signup as supabaseSignup,
  signin as supabaseSignin,
  signout as supabaseSignout,
  sync as supabaseSync,
  aiAsk as supabaseAiAsk,
  getUser,
  configureSupabase,
  getCredentials
} from './lib/supabase.js';

export const cloud = () => supabase;

export const fitAuth = {
  get cloud() {
    return supabase;
  },
  status: supabaseStatus,
  signup: supabaseSignup,
  signin: supabaseSignin,
  signout: supabaseSignout,
  sync: supabaseSync,
  configure: configureSupabase,
  getCredentials: getCredentials
};

import { askCoach } from './lib/aiCoach.js';

if (typeof window !== 'undefined') {
  window.fit = {
    status: async () => ({ ok: true }),
    getSetting: async (key) => getSetting(key),
    setSetting: async (key, val) => setSetting(key, val),
    list: async (cat) => list(cat),
    add: async (cat, day, payload) => add(cat, day, payload),
    remove: async (id) => remove(id),
    exportBackup: async () => exportBackup(),
    importBackup: async (raw) => importBackup(raw),
    aiStatus: async () => ({ configured: true, available: true }),
    aiAsk: async (profile, summary, question) => askCoach(profile, summary, question),
    aiSaveKey: async () => {
      throw new Error('API anahtarı tarayıcıya girilmez; sunucuda güvenle yapılandırılır.');
    },
    aiDeleteKey: async () => {
      throw new Error('Anahtar yönetimi sunucu panelinden yapılır.');
    }
  };
}
