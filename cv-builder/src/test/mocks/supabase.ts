import { vi } from 'vitest';

export interface MockSupabaseUser {
  id: string;
  email?: string;
}

export interface MockQueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

export function createMockSupabaseClient(options?: {
  user?: MockSupabaseUser | null;
  authError?: { message: string } | null;
}) {
  const mockUser = options?.user ?? { id: 'test-user-id', email: 'test@example.com' };
  const authError = options?.authError ?? null;

  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: {
          publicUrl: 'https://example.supabase.co/storage/v1/object/public/bucket/path/to/file.pdf',
        },
      }),
    }),
  };

  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  const mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);

  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: authError ? null : mockUser },
      error: authError,
    }),
  };

  return {
    auth: mockAuth,
    from: mockFrom,
    storage: mockStorage,
    _mockQueryBuilder: mockQueryBuilder,
    _mockStorage: mockStorage.from(),
  };
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
