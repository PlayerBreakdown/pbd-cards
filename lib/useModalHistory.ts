"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";

export function useModalHistory<T>(
  value: T | null,
  setValue: Dispatch<SetStateAction<T | null>>,
  key: string
) {
  const historyPushed = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      if (!historyPushed.current) return;
      historyPushed.current = false;
      setValue(null);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setValue]);

  useEffect(() => {
    if (!value || historyPushed.current) return;
    window.history.pushState({ [key]: true }, "", window.location.href);
    historyPushed.current = true;
  }, [key, value]);

  return () => {
    if (historyPushed.current) {
      window.history.back();
      return;
    }

    setValue(null);
  };
}
