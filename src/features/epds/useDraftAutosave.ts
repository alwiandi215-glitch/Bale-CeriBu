import { get, set, del } from 'idb-keyval';
import { useEffect, useRef } from 'react';

export function useDraftAutosave(key: string, value: unknown, enabled = true) {
  const t = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!enabled) return;
    clearTimeout(t.current);
    t.current = setTimeout(() => {
      void set(key, value);
    }, 600);
    return () => clearTimeout(t.current);
  }, [key, value, enabled]);
}

export const loadDraft = <T>(key: string) => get<T>(key);
export const clearDraft = (key: string) => del(key);
