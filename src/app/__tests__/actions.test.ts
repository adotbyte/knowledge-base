import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNote, deleteNote } from '../actions';
import prisma from '../prisma';

// 1. Apgauname next/server, kad Vitest jo neieškotų
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn(),
  },
}));

// 2. Apgauname auth() funkciją
vi.mock('../auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id' },
  }),
}));

// 3. Apgauname Prisma
vi.mock('../prisma', () => ({
  default: {
    note: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// 4. Apgauname revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Server Actions Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a note for the logged-in user', async () => {
    // Nustatome, kad Prisma sėkmingai sukuria įrašą
    vi.mocked(prisma.note.create).mockResolvedValueOnce({ id: 'note-1', title: 'Test', content: 'Test content', userId: 'test-user-id' } as any);

    const formData = new FormData();
    formData.append('title', 'Test');
    formData.append('content', 'Test content');

    await createNote(formData);

    // Patikriname, ar Prisma buvo iškviesta su teisingu userId
    expect(prisma.note.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'test-user-id', // <-- Dabar naudojame sesijos ID
        }),
      })
    );
  });

  it('should delete a note for the logged-in user', async () => {
    vi.mocked(prisma.note.delete).mockResolvedValueOnce({ id: 'note-1' } as any);

    const formData = new FormData();
    formData.append('id', 'note-1');

    await deleteNote(formData);

    expect(prisma.note.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'note-1', userId: 'test-user-id' }, // <-- Naudojame sesijos ID
      })
    );
  });
});