import { describe, it, expect, beforeEach, vi } from 'vitest';

// 1. Užmockiname auth() funkciją (turi būti PIRMAS, prieš bet kokius importus iš actions)
vi.mock('@/app/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

// 2. Užmockiname Prisma
vi.mock('../prisma', () => ({
  default: {
    note: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// 3. Užmockiname revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// 4. Dabar galime importuoti actions ir prisma
import { createNote, deleteNote } from '../actions';
import prisma from '../prisma';

describe('Server Actions Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a note with the session user ID', async () => {
    // Nustatome, kad Prisma sėkmingai sukuria įrašą
    vi.mocked(prisma.note.create).mockResolvedValueOnce({
      id: 'note-1',
      title: 'Test',
      content: 'Test content',
      userId: 'test-user-id',
    } as any);

    const formData = new FormData();
    formData.append('title', 'Test');
    formData.append('content', 'Test content');

    await createNote(formData);

    // Patikriname, ar Prisma buvo iškviesta su "test-user-id"
    expect(prisma.note.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'test-user-id', // <-- Dabar tikimės sesijos vartotojo ID
        }),
      })
    );
  });

  it('should delete a note with the session user ID', async () => {
    vi.mocked(prisma.note.delete).mockResolvedValueOnce({ id: 'note-1' } as any);

    const formData = new FormData();
    formData.append('id', 'note-1');

    await deleteNote(formData);

    expect(prisma.note.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'note-1', userId: 'test-user-id' }, // <-- Dabar tikimės sesijos vartotojo ID
      })
    );
  });
});
