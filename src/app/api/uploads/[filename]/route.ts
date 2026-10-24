import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  // Saugumo patikrinimas, kad nebandytų išeiti už katalogo ribų
  if (filename.includes('..')) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  try {
    const filePath = join(process.cwd(), 'uploads', filename);
    const fileBuffer = await readFile(filePath);
    
    // Nustatome turinio tipą pagal plėtinį (galima patobulinti)
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.png')) contentType = 'image/png';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';
    if (filename.endsWith('.pdf')) contentType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}