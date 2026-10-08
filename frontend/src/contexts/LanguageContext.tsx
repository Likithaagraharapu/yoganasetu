'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  LANGUAGES,
  DEFAULT_LANG,
  t as translate,
  type LanguageCode,
} from '@/lib/i18n';

// ─── Context shape ────────────────────────────────────────────────────────────
interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: Parameters<typeof translate>[0]) => string;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANG,
  setLanguage: () => {},
  t: (key) => key as string,
  languages: LANGUAGES,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'ys-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANG);

  // Hydrate from localStorage on mount (client-only, no SSR mismatch)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
        if (saved && LANGUAGES.some((l) => l.code === saved)) {
          setLanguageState(saved);
        }
      } catch {
        // localStorage unavailable (e.g. private browsing with restrictions) — ignore
      }
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  const tFn = useCallback(
    (key: Parameters<typeof translate>[0]) => translate(key, language),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: tFn, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLanguage() {
  return useContext(LanguageContext);
}
