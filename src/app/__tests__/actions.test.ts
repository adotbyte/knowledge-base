import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNote, deleteNote } from '../actions';
import { auth } from '../../auth';
import prisma from '../prisma'; // <-- SVARBU: Importuojame prisma

// Apgauname auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Apgauname Prisma
vi.mock('../prisma', () => ({
  default: {
    note: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Server Actions Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if user is not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const formData = new FormData();
    formData.append('title', 'Test');
    formData.append('content', 'Test content');

    await expect(createNote(formData)).rejects.toThrow('Unauthorized');
  });

  it('should throw error if user tries to delete someone else\'s note', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user_A' } } as any);

    const formData = new FormData();
    formData.append('id', 'note_of_user_B');

    // Dabar prisma kintamasis YRA apibrėžtas, nes jį importavome viršuje
    vi.mocked(prisma.note.delete).mockRejectedValueOnce(new Error('Record to delete does not exist.'));

    await expect(deleteNote(formData)).rejects.toThrow('Record to delete does not exist.');
  });
});