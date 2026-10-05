import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../auth.service';
import { prisma } from '../../lib/prisma';
// import { ConflictError, UnauthorizedError } from '../../lib/errors';

// Mock the entire Prisma client
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Mock the events so they don't actually fire
vi.mock('../../lib/events', () => ({
  appEvents: { emit: vi.fn(), on: vi.fn() },
}));

describe('auth.service.register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws ConflictError if email exists', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' });

    await expect(
      authService.register({
        name: 'Test User',
        email: 'taken@example.com',
        password: 'SecurePass1',
      })
    ).rejects.toThrow('Email already registered'); // Ensure your service throws this exact error
  });
});