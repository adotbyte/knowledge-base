import { vi } from 'vitest';

// 1. Užmockiname auth() funkciją, kad ji negrautų Next.js headers()
vi.mock('@/app/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

// 2. Užmockiname Next.js revalidatePath, kad testai nekristų
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// 3. Užmockiname Prisma klientą (jei dar to nepadarėte)
vi.mock('@/app/prisma', () => ({
  default: {
    note: {
      create: vi.fn().mockResolvedValue({ id: 'note-123' }),
      delete: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { createNote, deleteNote } from '../actions';
import prisma from '../prisma';

// 1. Apgauname next/server, kad Vitest jo neieškotų
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn(),
  },
}));

// 2. Apgauname Prisma
vi.mock('../prisma', () => ({
  default: {
    note: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// 3. Apgauname revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Server Actions Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a note with admin user (Cloudflare Access mode)', async () => {
    // Nustatome, kad Prisma sėkmingai sukuria įrašą
    vi.mocked(prisma.note.create).mockResolvedValueOnce({
      id: 'note-1',
      title: 'Test',
      content: 'Test content',
      userId: 'admin',
    } as any);

    const formData = new FormData();
    formData.append('title', 'Test');
    formData.append('content', 'Test content');

    await createNote(formData);

    // Patikriname, ar Prisma buvo iškviesta su "admin"
    expect(prisma.note.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'admin', // <-- Dabar tikimės "admin"
        }),
      })
    );
  });

  it('should delete a note with admin user', async () => {
    vi.mocked(prisma.note.delete).mockResolvedValueOnce({ id: 'note-1' } as any);

    const formData = new FormData();
    formData.append('id', 'note-1');

    await deleteNote(formData);

    expect(prisma.note.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'note-1', userId: 'admin' }, // <-- Dabar tikimės "admin"
      })
    );
  });
});
