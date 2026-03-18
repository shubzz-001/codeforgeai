import { useState, useEffect } from 'react';

/**
 * useLocalStorage — synced state backed by localStorage.
 *
 * @param {string} key        - localStorage key
 * @param {*}      initialValue - default value if key is not set
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = typeof value === 'function' ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.error(`useLocalStorage: failed to set "${key}"`, err);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`useLocalStorage: failed to remove "${key}"`, err);
    }
  };

  // Sync across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== key) return;
      try {
        setStoredValue(e.newValue !== null ? JSON.parse(e.newValue) : initialValue);
      } catch {
        setStoredValue(initialValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * useSessionStorage — same API but backed by sessionStorage.
 */
export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const v = typeof value === 'function' ? value(storedValue) : value;
      setStoredValue(v);
      sessionStorage.setItem(key, JSON.stringify(v));
    } catch (err) {
      console.error(`useSessionStorage: failed to set "${key}"`, err);
    }
  };

  const removeValue = () => {
    setStoredValue(initialValue);
    sessionStorage.removeItem(key);
  };

  return [storedValue, setValue, removeValue];
}