"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useSessionState<T>(
  key: string,
  defaultValue: T,
  options: { load?: boolean } = {}
): [T, Dispatch<SetStateAction<T>>] {
  const shouldLoad = options.load ?? true;
  const [value, setValue] = useState<T>(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!shouldLoad) {
      setReady(true);
      return;
    }

    try {
      const stored = window.sessionStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      window.sessionStorage.removeItem(key);
    } finally {
      setReady(true);
    }
  }, [key, shouldLoad]);

  useEffect(() => {
    if (!ready) return;
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, ready, value]);

  return [value, setValue];
}
