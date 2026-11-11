/**
 * Supabase Client and Multi-Device Synchronization
 * Handles authentication, cloud synchronization with conflict resolution (latest wins),
 * tombstone deletions, and Edge Function invocation for AI coach.
 */

import { createClient } from '@supabase/supabase-js';
import { getStore, persist } from './store.js';

const DEFAULT_URL = 'https://igxwxfowdabiyvbcgjjp.supabase.co';
const DEFAULT_KEY = 'sb_publishable_QJM6xxpDpS49JTlq7OVl9A_MVLZLiJC';

export function getCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) return { url: envUrl, key: envKey, fromEnv: true };
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('fit_supabase_url');
    const localKey = localStorage.getItem('fit_supabase_key');
    if (localUrl && localKey) return { url: localUrl, key: localKey, fromEnv: false };
  }
  return { url: DEFAULT_URL, key: DEFAULT_KEY, fromEnv: false };
}

export function createSupabaseInstance() {
  const { url, key } = getCredentials();
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.error('[Fit Supabase] Init error:', err);
    return null;
  }
}

export let supabase = createSupabaseInstance();

export function configureSupabase(newUrl, newKey) {
  if (typeof window !== 'undefined') {
    if (newUrl && newKey) {
      localStorage.setItem('fit_supabase_url', newUrl.trim());
      localStorage.setItem('fit_supabase_key', newKey.trim());
    } else {
      localStorage.removeItem('fit_supabase_url');
      localStorage.removeItem('fit_supabase_key');
    }
  }
  supabase = createSupabaseInstance();
  setupAuthListener();
  dispatchSyncChange();
}

// Synchronization state variables
let syncInProgress = false;
let syncQueued = false;
let currentUser = null;

/**
 * Dispatches a custom window event to notify UI components of sync / auth changes
 */
export const dispatchSyncChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('fit-sync-change'));
  }
};

/**
 * Performs a two-way sync between local storage and Supabase 'fit_data' table.
 * Uses tombstone-based deletion and timestamp comparison (latest timestamp wins).
 */
export async function sync() {
  if (!supabase || !currentUser) {
    return;
  }

  if (syncInProgress) {
    syncQueued = true;
    return;
  }

  syncInProgress = true;
  dispatchSyncChange();

  try {
    const { data, error } = await supabase
      .from('fit_data')
      .select('id, data, updated_at')
      .eq('user_id', currentUser.id);

    if (error) {
      throw error;
    }

    const existingRemote = new Map((data || []).map(row => [row.id, row]));
    const store = getStore();

    // Map local state into comparable rows
    const localRows = [
      ...store.records.map(r => ({
        id: r.id,
        data: { kind: 'record', value: r },
        updated_at: r.modified || r.created
      })),
      ...store.deleted.map(d => ({
        id: 'del:' + d.id,
        data: { kind: 'deletion', value: d },
        updated_at: d.modified
      })),
      ...Object.entries(store.settings).map(([k, v]) => ({
        id: 'setting:' + k,
        data: { kind: 'setting', key: k, value: v.value },
        updated_at: v.modified
      }))
    ];

    const localMap = new Map(localRows.map(row => [row.id, row]));
    const toUpload = [];

    // Compare remote records with local records
    for (const [id, remote] of existingRemote) {
      const local = localMap.get(id);
      const remoteTime = Date.parse(remote.updated_at || 0);
      const localTime = Date.parse(local?.updated_at || 0);

      if (!local || remoteTime > localTime) {
        localMap.set(id, remote);
      } else if (localTime > remoteTime) {
        toUpload.push(local);
      }
    }

    // Records existing only locally need to be uploaded
    for (const [id, local] of localMap) {
      if (!existingRemote.has(id)) {
        toUpload.push(local);
      }
    }

    // Upload records if needed
    if (toUpload.length > 0) {
      const { error: upsertError } = await supabase.from('fit_data').upsert(
        toUpload.map(item => ({
          id: item.id,
          user_id: currentUser.id,
          data: item.data,
          updated_at: item.updated_at
        }))
      );
      if (upsertError) {
        throw upsertError;
      }
    }

    // Reconstruct merged local store state
    const mergedState = {
      settings: {},
      records: [],
      deleted: []
    };

    for (const row of localMap.values()) {
      const itemData = row.data;
      if (!itemData) continue;

      if (itemData.kind === 'record') {
        mergedState.records.push(itemData.value);
      } else if (itemData.kind === 'deletion') {
        mergedState.deleted.push(itemData.value);
      } else if (itemData.kind === 'setting') {
        mergedState.settings[itemData.key] = {
          value: itemData.value,
          modified: row.updated_at
        };
      }
    }

    // Filter out deleted records by tombstone IDs
    const tombstoneIds = new Set(mergedState.deleted.map(d => d.id));
    mergedState.records = mergedState.records.filter(r => !tombstoneIds.has(r.id));

    persist(mergedState);
  } catch (err) {
    console.error('[Fit Supabase] Sync failed:', err);
    throw err;
  } finally {
    syncInProgress = false;
    dispatchSyncChange();

    if (syncQueued) {
      syncQueued = false;
      sync().catch(e => console.error('[Fit Supabase] Queued sync error:', e));
    }
  }
}

/**
 * Trigger background sync without awaiting
 */
export const scheduleSync = () => {
  if (currentUser) {
    sync().catch(err => {
      console.error('[Fit Supabase] Scheduled sync error:', err);
      dispatchSyncChange();
    });
  }
};

/**
 * Returns current auth and configuration status
 * @returns {Promise<{ configured: boolean, email: string|null, user: object|null }>}
 */
export async function status() {
  return {
    configured: !!supabase,
    email: currentUser?.email || null,
    user: currentUser
  };
}

/**
 * Retrieves the currently logged in user
 * @returns {Promise<object|null>}
 */
export async function getUser() {
  if (!supabase) return null;
  if (currentUser) return currentUser;

  try {
    const { data } = await supabase.auth.getUser();
    currentUser = data?.user || null;
    return currentUser;
  } catch (err) {
    console.error('[Fit Supabase] getUser error:', err);
    return null;
  }
}

/**
 * Registers a new user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function signup(email, password) {
  if (!supabase) {
    throw new Error('Önce Supabase yapılandırılmalı (.env dosyasını kontrol edin).');
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw error;
  }

  return 'Hesabın açıldı. E-posta onayı gerekiyorsa gelen kutunu kontrol et.';
}

/**
 * Signs in user with email and password
 * @param {string} email
 * @param {string} password
 */
export async function signin(email, password) {
  if (!supabase) {
    throw new Error('Önce Supabase yapılandırılmalı (.env dosyasını kontrol edin).');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  currentUser = data.user;
  dispatchSyncChange();
  await sync();
}

/**
 * Signs out current user
 */
export async function signout() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  currentUser = null;
  dispatchSyncChange();
}

/**
 * Invokes the 'fit-coach' Edge Function for AI recommendations
 * @param {object} profile - User profile data
 * @param {string} summary - Formatted history summary string
 * @param {string} question - User question
 * @returns {Promise<string>} AI Coach reply
 */
export async function aiAsk(profile, summary, question) {
  if (!supabase || !currentUser) {
    throw new Error('Önce Fit hesabınla giriş yapmalısın.');
  }

  const { data, error } = await supabase.functions.invoke('fit-coach', {
    body: { profile, summary, question }
  });

  if (error) {
    throw new Error(error.message || 'AI yanıtı alınamadı.');
  }

  if (!data?.answer) {
    throw new Error('Geçerli bir AI yanıtı alınamadı.');
  }

  return data.answer;
}

export function setupAuthListener() {
  if (!supabase) return;
  supabase.auth.getUser().then(async ({ data }) => {
    currentUser = data?.user || null;
    if (currentUser) {
      await sync().catch(console.error);
    }
    dispatchSyncChange();
  }).catch(console.error);

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    dispatchSyncChange();
    if (currentUser) {
      setTimeout(scheduleSync, 0);
    }
  });
}

setupAuthListener();
