import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Gauname duomenis iš priekinės dalies
    const body = await request.json();
    const { token } = body;

    // 2. Patikriname, ar tokenas apskritai atėjo
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Trūksta Turnstile žetono' },
        { status: 400 }
      );
    }

    // 3. Paimame slaptąjį raktą iš .env failo
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error('KLAIDA: TURNSTILE_SECRET_KEY nėra nustatytas .env faile');
      return NextResponse.json(
        { success: false, error: 'Serverio konfigūracijos klaida' },
        { status: 500 }
      );
    }

    // 4. Siunčiame užklausą Cloudflare siteverify API
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    // Jei norite, galite pridėti vartotojo IP adresą (patikimesniam patikrinimui)
    // const ip = request.headers.get('x-forwarded-for') || '';
    // if (ip) formData.append('remoteip', ip);

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    // 5. Grąžiname Cloudflare atsakymą priekinei daliai
    if (data.success) {
      return NextResponse.json({ success: true, message: 'Patvirtinta' });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nepavyko patvirtinti, kad esate žmogus', 
          details: data['error-codes'] 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Turnstile patikrinimo klaida:', error);
    return NextResponse.json(
      { success: false, error: 'Vidinė serverio klaida' },
      { status: 500 }
    );
  }
}