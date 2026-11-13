/**
 * Supabase Client and Multi-Device Synchronization
 * Handles authentication, cloud synchronization with conflict resolution (latest wins),
 * tombstone deletions, and Edge Function invocation for AI coach.
 */

import { createClient } from '@supabase/supabase-js';
import { getStore, persist, setStoreUser } from './store.js';

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
let authReady = false;
let lastSyncAt = null;
let lastSyncError = null;

/** @returns {{ inProgress: boolean, lastSyncAt: string|null, error: string|null }} */
export function getSyncState() {
  return { inProgress: syncInProgress, lastSyncAt, error: lastSyncError };
}

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
  if (!supabase || !currentUser || currentUser.isLocal) {
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
    lastSyncAt = new Date().toISOString();
    lastSyncError = null;
  } catch (err) {
    console.error('[Fit Supabase] Sync failed:', err);
    lastSyncError = err?.message || String(err);
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
export async function signup(email, password, fullName = '') {
  if (!supabase) {
    throw new Error('Önce Supabase yapılandırılmalı (.env dosyasını kontrol edin).');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
    }
  });
  if (error) {
    throw error;
  }

  const saveInitialName = () => {
    if (!fullName) return;
    const store = getStore();
    const existing = store.settings?.profile?.value || {};
    store.settings.profile = {
      value: { ...existing, name: fullName },
      modified: new Date().toISOString()
    };
    persist();
  };

  if (data?.session?.user) {
    currentUser = data.session.user;
    setStoreUser(currentUser.id);
    saveInitialName();
    dispatchSyncChange();
    await sync().catch(console.error);
    return { loggedIn: true, message: 'Hesabın oluşturuldu. Hoş geldin!' };
  }

  // Supabase e-posta onayı bekliyorsa bile kullanıcıyı kapıda bekletme; anında içeri al!
  if (data?.user?.id) {
    const tempUser = { ...data.user, isLocal: true };
    if (typeof window !== 'undefined') {
      localStorage.setItem('fit-local-session-user', JSON.stringify(tempUser));
    }
    currentUser = tempUser;
    setStoreUser(tempUser.id);
    saveInitialName();
    dispatchSyncChange();
    return { loggedIn: true, message: 'Hesabın açıldı ve giriş yapıldı!' };
  }

  return { loggedIn: false, message: 'Hesabın oluşturuldu. E-posta adresine gelen onay bağlantısına tıkla.' };
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
  setStoreUser(currentUser.id);
  dispatchSyncChange();
  await sync().catch(console.error);
}

/**
 * Signs out current user
 */
export async function signout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fit-local-session-user');
  }
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
  currentUser = null;
  setStoreUser(null);
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

const LOCAL_USER_KEY = 'fit-local-session-user';

function getSavedLocalUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function continueAsLocalUser(name = '') {
  const localUser = {
    id: 'local-primary',
    email: 'yerel@fit.app',
    user_metadata: { name: name || 'Sporcu' },
    isLocal: true
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
  }
  currentUser = localUser;
  setStoreUser(localUser.id);
  if (name) {
    const existing = getStore().settings?.profile?.value || {};
    getStore().settings.profile = {
      value: { ...existing, name },
      modified: new Date().toISOString()
    };
    persist();
  }
  authReady = true;
  dispatchSyncChange();
  return localUser;
}

export function setupAuthListener() {
  if (!supabase) {
    const local = getSavedLocalUser();
    if (local) {
      currentUser = local;
      setStoreUser(local.id);
    }
    authReady = true;
    dispatchSyncChange();
    return;
  }

  // getSession() yerel oturumu okur: çevrimdışıyken de uygulama açılır.
  supabase.auth.getSession().then(async ({ data }) => {
    const supaUser = data?.session?.user || null;
    if (supaUser) {
      currentUser = supaUser;
      setStoreUser(currentUser.id);
      authReady = true;
      dispatchSyncChange();
      await sync().catch(console.error);
    } else {
      const local = getSavedLocalUser();
      if (local) {
        currentUser = local;
        setStoreUser(local.id);
      }
      authReady = true;
      dispatchSyncChange();
    }
  }).catch((err) => {
    console.error(err);
    const local = getSavedLocalUser();
    if (local) {
      currentUser = local;
      setStoreUser(local.id);
    }
    authReady = true;
    dispatchSyncChange();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    const nextUser = session?.user || getSavedLocalUser() || null;
    const changed = (nextUser?.id || null) !== (currentUser?.id || null);
    currentUser = nextUser;
    if (changed) setStoreUser(currentUser?.id || null);
    authReady = true;
    dispatchSyncChange();
    if (currentUser && !currentUser.isLocal && changed) {
      setTimeout(scheduleSync, 0);
    }
  });
}

/**
 * Oturum durumu (senkron). App bileşeni 'fit-sync-change' olayında bunu okur.
 * @returns {{ ready: boolean, user: object|null }}
 */
export function getAuthState() {
  return { ready: authReady, user: currentUser };
}

/**
 * OAuth sağlayıcıları ile tek tıkla giriş (Google / Apple).
 * Varsa URL'deki ?family= davet kodunu OAuth yönlendirmesi öncesinde güvenceye alır.
 */
export async function signinWithOAuth(provider) {
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search || '');
    const familyCode = params.get('family');
    if (familyCode) {
      try {
        localStorage.setItem('fit-pending-family-code', familyCode.trim().toUpperCase());
      } catch {
        /* yoksay */
      }
    }
  }
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}${window.location.search || ''}`
      : undefined;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });
  if (error) throw error;
}

/**
 * Google ile giriş (Supabase panelinde Google sağlayıcısı açık olmalı).
 */
export async function signinWithGoogle() {
  return signinWithOAuth('google');
}

/**
 * Apple ID ile giriş (Supabase panelinde Apple sağlayıcısı açık olmalı).
 */
export async function signinWithApple() {
  return signinWithOAuth('apple');
}

/**
 * Şifre sıfırlama e-postası gönderir.
 */
export async function resetPassword(email) {
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });
  if (error) throw error;
}

/**
 * Hesabı ve buluttaki tüm verileri kalıcı olarak siler (schema.sql -> delete_my_account).
 * Bu cihazdaki yerel kopya da temizlenir.
 */
export async function deleteAccount() {
  if (!supabase || !currentUser) throw new Error('Önce giriş yapmalısın.');
  const uid = currentUser.id;
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error('Hesap silinemedi: ' + error.message);
  try {
    localStorage.removeItem(`fit-pwa-local-v1:${uid}`);
    if (localStorage.getItem('fit-legacy-owner') === uid) {
      localStorage.removeItem('fit-pwa-local-v1');
    }
  } catch {}
  await supabase.auth.signOut().catch(() => {});
  currentUser = null;
  setStoreUser(null);
  dispatchSyncChange();
}

setupAuthListener();
