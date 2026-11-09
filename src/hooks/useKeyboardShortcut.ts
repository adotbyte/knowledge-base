// src/hooks/useKeyboardShortcut.ts
import { useEffect } from 'react';

interface ShortcutOptions {
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  key: string;
}

export function useKeyboardShortcut(
  options: ShortcutOptions,
  callback: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const { ctrlKey = false, metaKey = false, shiftKey = false, key } = options;

      const ctrlMatch = ctrlKey ? e.ctrlKey : !e.ctrlKey;
      const metaMatch = metaKey ? e.metaKey : !e.metaKey;
      const shiftMatch = shiftKey ? e.shiftKey : !e.shiftKey;
      const keyMatch = e.key.toLowerCase() === key.toLowerCase();

      if (ctrlMatch && metaMatch && shiftMatch && keyMatch) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [options, callback, enabled]);
}
