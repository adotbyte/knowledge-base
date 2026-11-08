import { describe, it, expect, beforeEach, vi } from 'vitest';

// ✅ 1. Užmockiname next-auth, kad nereikėtų tikros sesijos
vi.mock('@/app/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

// ✅ 2. Užmockiname Prisma, kad neitume į tikrą duomenų bazę
vi.mock('@/app/prisma', () => ({
  default: {
    note: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      delete: vi.fn(),
    },
    attachment: {
      create: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// ✅ 3. Užmockiname next/cache (revalidatePath)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// ✅ 4. Užmockiname Google Gemini
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    interactions: {
      create: vi.fn().mockResolvedValue({ output_text: 'Mocked AI response' }),
    },
  })),
}));

// ✅ 5. Užmockiname fs/promises (failų įrašymas)
vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockResolvedValue(undefined),
}));

// ✅ 6. Užmockiname fs (constants)
vi.mock('fs', () => ({
  constants: { F_OK: 0 },
}));

// ✅ 7. Užmockiname path (join)
vi.mock('path', () => ({
  join: vi.fn().mockReturnValue('/mock/path/file.txt'),
}));

// Importuojame funkcijas PO mock'inimo
import { deleteAccount, deleteNote } from '../actions';
import prisma from '@/app/prisma';

describe('Server Actions Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a note only for the current user', async () => {
    // Nustatome, kad Prisma sėkmingai ištrina įrašą
    vi.mocked(prisma.note.delete).mockResolvedValueOnce({ id: 'note-1' } as any);

    const formData = new FormData();
    formData.append('id', 'note-1');

    await deleteNote(formData);

    // Patikriname, ar Prisma buvo iškviesta su teisingu userId
    expect(prisma.note.delete).toHaveBeenCalledWith({
      where: { id: 'note-1', userId: 'test-user-id' },
    });
  });

  it('should delete the user account', async () => {
    // Nustatome, kad Prisma sėkmingai ištrina vartotoją
    vi.mocked(prisma.user.delete).mockResolvedValueOnce({ id: 'test-user-id' } as any);

    await deleteAccount();

    // Patikriname, ar Prisma buvo iškviesta su teisingu userId
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'test-user-id' },
    });
  });
});
