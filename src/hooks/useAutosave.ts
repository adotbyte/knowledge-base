// src/hooks/useAutosave.ts
import { useEffect, useRef } from 'react';

export function useAutosave(
  key: string,
  data: { title?: string; content: string; tags?: string },
  onRestore: (data: { title?: string; content: string; tags?: string }) => void
) {
  const isFirstRender = useRef(true);

  // 1. Įkeliame juodraštį, kai komponentas užsikrauna
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.content) {
          onRestore(parsed);
        }
      } catch (e) {
        console.error('Failed to parse autosave data', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 2. Išsaugome duomenis kas 2 sekundes (debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data));
    }, 2000);

    return () => clearTimeout(timer);
  }, [key, data]);

  // 3. Funkcija, kuri ištrina juodraštį (iškvieskite po išsaugojimo)
  const clearAutosave = () => {
    localStorage.removeItem(key);
  };

  return { clearAutosave };
}
