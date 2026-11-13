/**
 * Çoklu Hesaplı Aile & Squad Planı Motoru (Maksimum 4 Kişi: 1 Sahip + 3 Arkadaş)
 * Her üye KENDİ hesabıyla giriş yapar; davet kodu/linki ile kendi hesabına Pro açar.
 * Supabase RPC varsa bulutla senkronize çalışır, yoksa cihaz içi çoklu-hesap kayıt defterini kullanır.
 */

import { supabase } from './supabase.js';
import {
  getAiMembership,
  upgradeToPro,
  cancelPro,
  setProForUser,
  clearProForUser
} from './aiQuota.js';

export const FAMILY_MAX_SEATS = 4;
const PENDING_INVITE_KEY = 'fit-pending-family-code';
const LOCAL_REGISTRY_KEY = 'fit-family-registry-v1';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeInviteCode(raw) {
  if (!raw) return '';
  return String(raw).trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FIT-FAM-${suffix}`;
}

export function buildFamilyInviteUrl(code, origin = null) {
  const cleanCode = normalizeInviteCode(code);
  if (!cleanCode) return '';
  const base =
    origin ||
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://fit-atelier.app');
  return `${base}/?family=${encodeURIComponent(cleanCode)}`;
}

export function capturePendingFamilyInviteFromUrl() {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search || '');
    const code = normalizeInviteCode(params.get('family') || '');
    if (code) {
      localStorage.setItem(PENDING_INVITE_KEY, code);
      return code;
    }
  } catch {}
  return getPendingFamilyInvite();
}

export function getPendingFamilyInvite() {
  if (typeof window === 'undefined') return '';
  try {
    return normalizeInviteCode(localStorage.getItem(PENDING_INVITE_KEY) || '');
  } catch {
    return '';
  }
}

export function clearPendingFamilyInvite() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PENDING_INVITE_KEY);
  } catch {}
}

function readLocalRegistry() {
  if (typeof window === 'undefined') return { groups: {} };
  try {
    const raw = localStorage.getItem(LOCAL_REGISTRY_KEY);
    if (!raw) return { groups: {} };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.groups === 'object' ? parsed : { groups: {} };
  } catch {
    return { groups: {} };
  }
}

function writeLocalRegistry(reg) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(reg));
  } catch {}
}

function findLocalGroupForUser(reg, userId) {
  if (!userId) return null;
  return (
    Object.values(reg.groups).find(
      (g) => g.ownerId === userId || (g.members || []).some((m) => m.userId === userId)
    ) || null
  );
}

function isCloudCapableUser(user) {
  return Boolean(supabase && user?.id && !user.isLocal && UUID_REGEX.test(user.id));
}

function isMissingSqlMigration(err) {
  const msg = String(err?.message || '').toLowerCase();
  const code = String(err?.code || '');
  return (
    code === '42883' ||
    code === '42P01' ||
    code === 'PGRST202' ||
    msg.includes('could not find the function') ||
    msg.includes('does not exist')
  );
}

function translateFamilyError(rawMsg) {
  const m = String(rawMsg || '').toUpperCase();
  if (m.includes('DAVET_KODU_BULUNAMADI')) {
    return 'Bu Aile Planı davet kodu geçersiz veya süresi dolmuş.';
  }
  if (m.includes('AILE_DOLU')) {
    return `Bu Aile Planı maksimum ${FAMILY_MAX_SEATS} kişilik kontenjana ulaşmış (${FAMILY_MAX_SEATS}/${FAMILY_MAX_SEATS}).`;
  }
  if (m.includes('ZATEN_BASKA_AILE_GRUBUNDA')) {
    return 'Hesabınız zaten başka bir Aile Planına bağlı. Yeni gruba katılmadan önce mevcut gruptan ayrılın.';
  }
  if (m.includes('YETKISIZ_ISLEM')) {
    return 'Bu işlem için yalnızca Aile Planı sahibi yetkilidir.';
  }
  return rawMsg || 'Aile planı işlemi tamamlanamadı.';
}

function syncUserProFromGroup(user, group) {
  if (!user?.id) return;
  if (group) {
    const myRow = (group.members || []).find((m) => m.userId === user.id);
    const role = myRow?.role || (group.ownerId === user.id ? 'owner' : 'member');
    upgradeToPro('family', {
      familyGroupId: group.id,
      familyCode: group.inviteCode,
      familyRole: role,
      ownerName: group.ownerName
    });
  } else {
    const current = getAiMembership();
    if (current?.plan === 'family') {
      cancelPro();
    }
  }
}

function emitFamilyChanged(group) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fit-family-changed', { detail: { group } }));
  }
}

/**
 * Aktif kullanıcının Aile Planı durumunu (bulut veya yerel kayıt defterinden) getirir.
 */
export async function getFamilyStatus(user) {
  if (!user?.id) return { source: 'none', group: null, migrationNeeded: false };

  if (isCloudCapableUser(user)) {
    const { data, error } = await supabase.rpc('get_my_family_status');
    if (!error) {
      syncUserProFromGroup(user, data || null);
      return { source: 'supabase', group: data || null, migrationNeeded: false };
    }
    if (!isMissingSqlMigration(error)) {
      return { source: 'supabase', group: null, error: translateFamilyError(error.message), migrationNeeded: false };
    }
    const localReg = readLocalRegistry();
    const localGroup = findLocalGroupForUser(localReg, user.id);
    syncUserProFromGroup(user, localGroup);
    return { source: 'local', group: localGroup, migrationNeeded: true };
  }

  const localReg = readLocalRegistry();
  const localGroup = findLocalGroupForUser(localReg, user.id);
  syncUserProFromGroup(user, localGroup);
  return { source: 'local', group: localGroup, migrationNeeded: false };
}

/**
 * Aile Planı başlatır / mevcut davet kodunu döner (Owner kendi hesabında aktive eder).
 */
export async function activateFamilyPlan(user, displayName = '') {
  if (!user?.id) throw new Error('Önce kendi hesabınızla giriş yapmalısınız.');
  const ownerName = (displayName || user.email?.split('@')[0] || 'Kaptan').trim();

  if (isCloudCapableUser(user)) {
    const { data, error } = await supabase.rpc('create_or_get_family_group', {
      p_owner_name: ownerName,
      p_custom_code: generateInviteCode()
    });
    if (!error && data) {
      syncUserProFromGroup(user, data);
      emitFamilyChanged(data);
      return { source: 'supabase', group: data, migrationNeeded: false };
    }
    if (error && !isMissingSqlMigration(error)) {
      throw new Error(translateFamilyError(error.message));
    }
  }

  const reg = readLocalRegistry();
  let group = findLocalGroupForUser(reg, user.id);
  if (!group) {
    const id = 'fam_' + Date.now();
    group = {
      id,
      ownerId: user.id,
      ownerName,
      inviteCode: generateInviteCode(),
      maxSeats: FAMILY_MAX_SEATS,
      members: [
        {
          userId: user.id,
          name: ownerName,
          email: user.email || '',
          role: 'owner',
          joinedAt: new Date().toISOString()
        }
      ]
    };
    reg.groups[id] = group;
    writeLocalRegistry(reg);
  }
  syncUserProFromGroup(user, group);
  emitFamilyChanged(group);
  return {
    source: 'local',
    group,
    migrationNeeded: isCloudCapableUser(user)
  };
}

/**
 * Arkadaş kendi hesabıyla davet kodunu / linkini kullanarak Aile Planına katılır ve Pro olur.
 */
export async function joinFamilyByCode(user, rawCode, displayName = '') {
  if (!user?.id) throw new Error('Davete katılmak için kendi hesabınıza giriş yapın.');
  const code = normalizeInviteCode(rawCode);
  if (!code) throw new Error('Lütfen geçerli bir davet kodu girin (Örn: FIT-FAM-ABC123).');

  const memberName = (displayName || user.email?.split('@')[0] || 'Arkadaş').trim();

  if (isCloudCapableUser(user)) {
    const { data, error } = await supabase.rpc('join_family_by_code', {
      p_code: code,
      p_member_name: memberName
    });
    if (!error && data) {
      clearPendingFamilyInvite();
      syncUserProFromGroup(user, data);
      emitFamilyChanged(data);
      return { source: 'supabase', group: data, migrationNeeded: false };
    }
    if (error && !isMissingSqlMigration(error)) {
      throw new Error(translateFamilyError(error.message));
    }
  }

  const reg = readLocalRegistry();
  const targetGroup = Object.values(reg.groups).find(
    (g) => normalizeInviteCode(g.inviteCode) === code
  );
  if (!targetGroup) {
    throw new Error(translateFamilyError('DAVET_KODU_BULUNAMADI'));
  }

  const existingGroup = findLocalGroupForUser(reg, user.id);
  if (existingGroup && existingGroup.id !== targetGroup.id) {
    throw new Error(translateFamilyError('ZATEN_BASKA_AILE_GRUBUNDA'));
  }

  const alreadyMember = (targetGroup.members || []).some((m) => m.userId === user.id);
  if (!alreadyMember) {
    if ((targetGroup.members || []).length >= (targetGroup.maxSeats || FAMILY_MAX_SEATS)) {
      throw new Error(translateFamilyError('AILE_DOLU'));
    }
    targetGroup.members.push({
      userId: user.id,
      name: memberName,
      email: user.email || '',
      role: 'member',
      joinedAt: new Date().toISOString()
    });
    reg.groups[targetGroup.id] = targetGroup;
    writeLocalRegistry(reg);
  }

  clearPendingFamilyInvite();
  syncUserProFromGroup(user, targetGroup);
  setProForUser(user.id, 'family', {
    familyGroupId: targetGroup.id,
    familyCode: targetGroup.inviteCode,
    familyRole: targetGroup.ownerId === user.id ? 'owner' : 'member',
    ownerName: targetGroup.ownerName
  });
  emitFamilyChanged(targetGroup);
  return {
    source: 'local',
    group: targetGroup,
    migrationNeeded: isCloudCapableUser(user)
  };
}

/**
 * Sahip bir arkadaşı koltuktan çıkarır veya üye kendi rızasıyla gruptan ayrılır.
 */
export async function leaveOrRemoveFamilyMember(currentUser, targetUserId = null) {
  if (!currentUser?.id) return null;
  const targetId = targetUserId || currentUser.id;

  if (isCloudCapableUser(currentUser)) {
    const { data, error } = await supabase.rpc('leave_or_remove_family_member', {
      p_target_user_id: targetId
    });
    if (!error) {
      if (targetId === currentUser.id) {
        syncUserProFromGroup(currentUser, null);
      }
      emitFamilyChanged(data || null);
      return { source: 'supabase', group: data || null };
    }
    if (!isMissingSqlMigration(error)) {
      throw new Error(translateFamilyError(error.message));
    }
  }

  const reg = readLocalRegistry();
  const group = findLocalGroupForUser(reg, targetId);
  if (!group) return { source: 'local', group: null };

  if (currentUser.id !== targetId && group.ownerId !== currentUser.id) {
    throw new Error(translateFamilyError('YETKISIZ_ISLEM'));
  }

  if (targetId === group.ownerId) {
    // Grup tamamen kapatılır: tüm üyelerin aile Pro erişimi sonlandırılır
    (group.members || []).forEach((m) => clearProForUser(m.userId));
    delete reg.groups[group.id];
    writeLocalRegistry(reg);
    syncUserProFromGroup(currentUser, null);
    emitFamilyChanged(null);
    return { source: 'local', group: null };
  }

  group.members = (group.members || []).filter((m) => m.userId !== targetId);
  clearProForUser(targetId);
  reg.groups[group.id] = group;
  writeLocalRegistry(reg);

  if (targetId === currentUser.id) {
    syncUserProFromGroup(currentUser, null);
  }
  emitFamilyChanged(group);
  return { source: 'local', group };
}
