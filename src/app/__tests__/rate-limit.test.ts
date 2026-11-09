import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Išvalome visus ankstesnius įrašus tarp testų
    // (Kadangi checkRateLimit naudoja Map, mes galime jį išvalyti per naują userId)
  });

  it('should allow requests within the limit', () => {
    const userId = 'test-user-1';

    // 5 užklausos turėtų būti leidžiamos
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(userId, 5, 60000);
      expect(result.allowed).toBe(true);
    }
  });

  it('should block requests after the limit is reached', () => {
    const userId = 'test-user-2';

    // Išnaudojame limitą (5 užklausos)
    for (let i = 0; i < 5; i++) {
      checkRateLimit(userId, 5, 60000);
    }

    // 6-oji užklausa turėtų būti užblokuota
    const result = checkRateLimit(userId, 5, 60000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should reset after the time window passes', async () => {
    const userId = 'test-user-3';

    // Išnaudojame limitą
    for (let i = 0; i < 5; i++) {
      checkRateLimit(userId, 5, 100); // 100ms langas
    }

    // Palaukiame, kol langas pasibaigs
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Dabar vėl turėtų būti leidžiama
    const result = checkRateLimit(userId, 5, 100);
    expect(result.allowed).toBe(true);
  });
});
