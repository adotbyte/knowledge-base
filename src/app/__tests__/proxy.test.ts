import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ✅ 1. Užmockiname next-intl middleware (PRIEŠ importą)
//    Mock'as imituoja „praleidžiančią" intl middleware elgseną.
//    Locale peradresavimas yra next-intl bibliotekos atsakomybė,
//    todėl jo ne.testuojame šiame faile.
vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => {
    return (_req: NextRequest) => NextResponse.next();
  }),
}));

// ✅ 2. Užmockiname next-auth/jwt (getToken)
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// ✅ 3. Užmockiname next-intl routing
vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['lt', 'en'],
    defaultLocale: 'lt',
  },
}));

// ✅ 4. Importuojame PO vi.mock
import proxy from '@/proxy';
import { getToken } from 'next-auth/jwt';

describe('Proxy Middleware', () => {
  beforeEach(() => {
    // ✅ clearAllMocks išvalo tik call history.
    //    Naudojame `mockResolvedValue` (ne `Once`), todėl
    //    kiekvienas testas aiškiai nustato savo getToken reikšmę.
    vi.clearAllMocks();
  });

  // ✅ 1. Šakninis URL nukreipia į /lt
  it('should redirect root URL to /lt', async () => {
    const req = new NextRequest('http://localhost:3000/');
    const res = await proxy(req);

    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toBe('http://localhost:3000/lt');
  });

  // ✅ 2. Viešas puslapis (/login) praleidžiamas be sesijos
  it('should allow public route /login without auth', async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/login');
    const res = await proxy(req);

    // Neautentifikuota, bet /login yra viešas → praleidžiama.
    expect(res?.status).toBe(200);
  });

  // ✅ 3. Privatus puslapis be sesijos nukreipiamas į /lt/login
  it('should redirect private route without auth to /lt/login', async () => {
    vi.mocked(getToken).mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await proxy(req);

    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toBe('http://localhost:3000/lt/login');
  });

  // ✅ 4. Privatus puslapis su sesija praleidžiamas
  it('should allow private route with valid auth', async () => {
    vi.mocked(getToken).mockResolvedValue({ sub: 'user-123' } as any);

    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await proxy(req);

    // Autentifikuota → auth patikra praeina ir proxy perduoda
    // valdymą intl middleware'ui (mock'as → NextResponse.next() → 200).
    // Locale peradresavimą (/dashboard → /lt/dashboard) dengia
    // next-intl biblioteka, o ne mūsų proxy logika.
    expect(res?.status).toBe(200);
  });

  // ✅ 5. Statiniai failai praleidžiami
  it('should allow manifest.json', async () => {
    const req = new NextRequest('http://localhost:3000/manifest.json');
    const res = await proxy(req);

    expect(res?.status).toBe(200);
  });

  it('should allow sw.js', async () => {
    const req = new NextRequest('http://localhost:3000/sw.js');
    const res = await proxy(req);

    expect(res?.status).toBe(200);
  });
});
