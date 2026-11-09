import { describe, it, expect } from 'vitest';
import lt from '../../../messages/lt.json';
import en from '../../../messages/en.json';

// Funkcija, kuri surenka visus raktus iš objekto
function getAllKeys(obj: any, prefix = ''): string[] {
  return Object.keys(obj).reduce((acc: string[], key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      acc.push(...getAllKeys(obj[key], fullKey));
    } else {
      acc.push(fullKey);
    }
    return acc;
  }, []);
}

describe('Translations', () => {
  it('should have the same keys in Lithuanian and English', () => {
    const ltKeys = getAllKeys(lt).sort();
    const enKeys = getAllKeys(en).sort();

    expect(ltKeys).toEqual(enKeys);
  });
});
