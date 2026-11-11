/**
 * Custom React Hook: useLocalState
 * Connects React components with the Fit local store and synchronization engine.
 * 
 * Provides reactive access to:
 * - User profile (with saveProfile)
 * - Categorized records (workout, meal, habit, weight, supplement)
 * - Entry mutation helpers (addEntry, removeEntry)
 * - Current calendar day selection
 * - Ready state and flash notification messages
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSetting,
  setSetting,
  list,
  add,
  remove,
  subscribe,
  CATEGORIES
} from '../lib/store.js';
import { DEFAULT_PROFILE } from '../lib/constants.js';
import { today } from '../lib/calculations.js';
import { scheduleSync } from '../lib/supabase.js';

export function useLocalState() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [entries, setEntries] = useState({
    workout: [],
    meal: [],
    habit: [],
    weight: [],
    supplement: []
  });
  const [day, setDay] = useState(today());
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Reads profile and all category records from store
   */
  const reloadData = useCallback(() => {
    try {
      // Load profile setting
      const rawProfile = getSetting('profile');
      if (rawProfile) {
        const parsed = typeof rawProfile === 'string' ? JSON.parse(rawProfile) : rawProfile;
        setProfile(prev => ({ ...DEFAULT_PROFILE, ...prev, ...parsed }));
      }

      // Load all category records
      const updatedEntries = {};
      for (const cat of CATEGORIES) {
        updatedEntries[cat] = list(cat);
      }
      setEntries(updatedEntries);
    } catch (err) {
      console.error('[useLocalState] Failed to load store data:', err);
      setMessage('Veriler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setReady(true);
    }
  }, []);

  // Initialize on mount and subscribe to store mutations
  useEffect(() => {
    reloadData();
    const unsubscribe = subscribe(() => {
      reloadData();
    });

    return () => {
      unsubscribe();
    };
  }, [reloadData]);

  /**
   * Persists current profile to store and schedules cloud sync
   */
  const saveProfile = useCallback(async (customProfile) => {
    const toSave = customProfile || profile;
    try {
      setSetting('profile', toSave);
      scheduleSync();
      setMessage('Profil kaydedildi.');
      setTimeout(() => {
        setMessage('');
      }, 4000);
      return true;
    } catch (err) {
      console.error('[useLocalState] Failed to save profile:', err);
      setMessage('Profil kaydedilemedi: ' + err.message);
      return false;
    }
  }, [profile]);

  /**
   * Adds a new entry to the given category
   * @param {string} category
   * @param {object} payload
   * @param {string} [entryDay] - Defaults to currently selected day
   */
  const addEntry = useCallback((category, payload, entryDay = null) => {
    const targetDay = entryDay || day;
    try {
      const id = add(category, targetDay, payload);
      scheduleSync();
      setMessage('Kayıt eklendi.');
      setTimeout(() => {
        setMessage('');
      }, 3000);
      return id;
    } catch (err) {
      console.error('[useLocalState] Failed to add entry:', err);
      setMessage('Kayıt eklenemedi: ' + err.message);
      return null;
    }
  }, [day]);

  /**
   * Removes an entry by ID
   * @param {string} id
   * @param {string} [category]
   */
  const removeEntry = useCallback((id, category) => {
    try {
      remove(id);
      scheduleSync();
      return true;
    } catch (err) {
      console.error('[useLocalState] Failed to remove entry:', err);
      setMessage('Kayıt silinemedi: ' + err.message);
      return false;
    }
  }, []);

  return {
    profile,
    setProfile,
    saveProfile,
    entries,
    addEntry,
    removeEntry,
    day,
    setDay,
    ready,
    message,
    setMessage
  };
}
