import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabaseClient, type MockSupabaseClient } from '@/test/mocks/supabase';

// Mock the supabase server client
let mockSupabase: MockSupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Import after mocking
const { GET } = await import('./route');

describe('GET /api/profile-photos', () => {
  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase = createMockSupabaseClient({
      user: null,
      authError: { message: 'Not authenticated' },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('should return empty photos array when user has no photos', async () => {
    mockSupabase._mockQueryBuilder.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.photos).toEqual([]);
    expect(body.primaryPhoto).toBeNull();
  });

  it('should return photos with signed URLs', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        user_id: 'test-user-id',
        storage_path: 'test-user-id/photo1.jpg',
        filename: 'photo1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        width: 800,
        height: 800,
        is_primary: true,
        display_order: 0,
        upload_source: 'manual',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'photo-2',
        user_id: 'test-user-id',
        storage_path: 'test-user-id/photo2.jpg',
        filename: 'photo2.jpg',
        file_size: 2048,
        mime_type: 'image/jpeg',
        width: 800,
        height: 800,
        is_primary: false,
        display_order: 1,
        upload_source: 'manual',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ];

    mockSupabase._mockQueryBuilder.order.mockResolvedValue({
      data: mockPhotos,
      error: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.photos).toHaveLength(2);

    // Check that signed URLs are added
    expect(body.photos[0].signedUrl).toBeDefined();
    expect(body.photos[0].signedUrl).toContain('token=');
    expect(body.photos[1].signedUrl).toBeDefined();

    // Check that primary photo is correctly identified
    expect(body.primaryPhoto).not.toBeNull();
    expect(body.primaryPhoto.id).toBe('photo-1');
    expect(body.primaryPhoto.is_primary).toBe(true);
    expect(body.primaryPhoto.signedUrl).toBeDefined();
  });

  it('should return null for primaryPhoto when no photo is marked as primary', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        user_id: 'test-user-id',
        storage_path: 'test-user-id/photo1.jpg',
        filename: 'photo1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        width: null,
        height: null,
        is_primary: false,
        display_order: 0,
        upload_source: 'manual',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    mockSupabase._mockQueryBuilder.order.mockResolvedValue({
      data: mockPhotos,
      error: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.photos).toHaveLength(1);
    expect(body.primaryPhoto).toBeNull();
  });

  it('should return 500 on database error', async () => {
    mockSupabase._mockQueryBuilder.order.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to fetch photos');
  });

  it('should call createSignedUrl for each photo', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        user_id: 'test-user-id',
        storage_path: 'test-user-id/photo1.jpg',
        filename: 'photo1.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
        width: null,
        height: null,
        is_primary: true,
        display_order: 0,
        upload_source: 'manual',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'photo-2',
        user_id: 'test-user-id',
        storage_path: 'test-user-id/photo2.jpg',
        filename: 'photo2.jpg',
        file_size: 2048,
        mime_type: 'image/jpeg',
        width: null,
        height: null,
        is_primary: false,
        display_order: 1,
        upload_source: 'manual',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ];

    mockSupabase._mockQueryBuilder.order.mockResolvedValue({
      data: mockPhotos,
      error: null,
    });

    await GET();

    // Verify createSignedUrl was called for each photo
    expect(mockSupabase._mockStorage.createSignedUrl).toHaveBeenCalledTimes(2);
    expect(mockSupabase._mockStorage.createSignedUrl).toHaveBeenCalledWith(
      'test-user-id/photo1.jpg',
      3600
    );
    expect(mockSupabase._mockStorage.createSignedUrl).toHaveBeenCalledWith(
      'test-user-id/photo2.jpg',
      3600
    );
  });
});
