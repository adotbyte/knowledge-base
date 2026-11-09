// Paprastas rate limiter, veikiantis atmintyje
// Kiekvienam vartotojui (userId) saugome jo užklausų laikus

const requestCounts = new Map<string, number[]>();

/**
 * Patikrina, ar vartotojas neviršijo limito
 * @param userId - vartotojo ID
 * @param limit - maksimalus užklausų skaičius per laiko intervalą
 * @param windowMs - laiko intervalas milisekundėmis (pvz., 60000 = 1 minutė)
 * @returns true, jei užklausa leidžiama, false - jei limitas viršytas
 */
export function checkRateLimit(
  userId: string,
  limit: number = 5,
  windowMs: number = 60000 // 1 minutė
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const timestamps = requestCounts.get(userId) || [];

  // Išmetame pasenusius laikus (senesnius nei windowMs)
  const validTimestamps = timestamps.filter((time) => now - time < windowMs);

  if (validTimestamps.length >= limit) {
    // Limitas viršytas
    const oldestTimestamp = validTimestamps[0];
    const retryAfter = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Pridedame naują laiką
  validTimestamps.push(now);
  requestCounts.set(userId, validTimestamps);

  return {
    allowed: true,
    remaining: limit - validTimestamps.length,
    retryAfter: 0,
  };
}

// Periodinis valymas, kad Map neužimtų per daug atminties
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamps] of requestCounts.entries()) {
    const validTimestamps = timestamps.filter((time) => now - time < 60000);
    if (validTimestamps.length === 0) {
      requestCounts.delete(userId);
    } else {
      requestCounts.set(userId, validTimestamps);
    }
  }
}, 60000); // Kas minutę
