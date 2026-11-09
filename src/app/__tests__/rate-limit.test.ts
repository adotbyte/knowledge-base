import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Išvalome visus ankstesnius įrašus, kad testai neturėtų įtakos vienas kitam
    // (Kadangi checkRateLimit naudoja Map, mes galime jį išvalyti per naują userId)
  });

  it('should allow requests within the limit', () => {
    const userId = 'test-user-allow';

    // 5 užklausos turėtų būti leidžiamos
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(userId, 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    }
  });

  it('should block requests after the limit is reached', () => {
    const userId = 'test-user-block';

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
    const userId = 'test-user-reset';
    const windowMs = 100; // 100ms langas

    // Išnaudojame limitą
    for (let i = 0; i < 5; i++) {
      checkRateLimit(userId, 5, windowMs);
    }

    // Patikriname, ar blokuoja
    const blockedResult = checkRateLimit(userId, 5, windowMs);
    expect(blockedResult.allowed).toBe(false);

    // Palaukiame, kol langas pasibaigs
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Dabar vėl turėtų būti leidžiama
    const allowedResult = checkRateLimit(userId, 5, windowMs);
    expect(allowedResult.allowed).toBe(true);
  });

  it('should track different users independently', () => {
    const user1 = 'test-user-1';
    const user2 = 'test-user-2';

    // Išnaudojame user1 limitą
    for (let i = 0; i < 5; i++) {
      checkRateLimit(user1, 5, 60000);
    }

    // user1 turėtų būti užblokuotas
    const user1Result = checkRateLimit(user1, 5, 60000);
    expect(user1Result.allowed).toBe(false);

    // user2 dar neturėtų būti užblokuotas
    const user2Result = checkRateLimit(user2, 5, 60000);
    expect(user2Result.allowed).toBe(true);
  });
});
