import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabaseClient, type MockSupabaseClient } from '@/test/mocks/supabase';

// Mock the supabase server client
let mockSupabase: MockSupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Import after mocking
const { POST } = await import('./route');

describe('POST /api/profile-photos/upload', () => {
  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase = createMockSupabaseClient({
      user: null,
      authError: { message: 'Not authenticated' },
    });

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('should return 400 if no file is provided', async () => {
    const formData = new FormData();

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('No file provided');
  });

  it('should return 400 for invalid file type', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.txt', { type: 'text/plain' }));

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Invalid file type');
  });

  it('should accept valid image types (jpeg, png, webp)', async () => {
    const validTypes = [
      { mime: 'image/jpeg', ext: 'jpg' },
      { mime: 'image/png', ext: 'png' },
      { mime: 'image/webp', ext: 'webp' },
    ];

    for (const { mime, ext } of validTypes) {
      mockSupabase = createMockSupabaseClient();

      // Mock the photo count query
      mockSupabase._mockQueryBuilder.select.mockReturnThis();
      mockSupabase._mockQueryBuilder.eq.mockReturnThis();

      // Mock insert returning the photo
      const mockPhoto = {
        id: 'new-photo-id',
        user_id: 'test-user-id',
        storage_path: `test-user-id/123_abc_test.${ext}`,
        filename: `test.${ext}`,
        file_size: 12,
        mime_type: mime,
        width: null,
        height: null,
        is_primary: true,
        display_order: 0,
        upload_source: 'manual',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase._mockQueryBuilder.single.mockResolvedValue({
        data: mockPhoto,
        error: null,
      });

      const formData = new FormData();
      formData.append('file', new File(['test content'], `test.${ext}`, { type: mime }));

      const request = new Request('http://localhost/api/profile-photos/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request as never);

      expect(response.status).toBe(200);
    }
  });

  it('should upload file and return photo with signed URL', async () => {
    const mockPhoto = {
      id: 'new-photo-id',
      user_id: 'test-user-id',
      storage_path: 'test-user-id/123_abc_test.jpg',
      filename: 'test.jpg',
      file_size: 12,
      mime_type: 'image/jpeg',
      width: 800,
      height: 800,
      is_primary: true,
      display_order: 0,
      upload_source: 'manual',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    mockSupabase._mockQueryBuilder.single.mockResolvedValue({
      data: mockPhoto,
      error: null,
    });

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'test.jpg', { type: 'image/jpeg' }));
    formData.append('width', '800');
    formData.append('height', '800');

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.photo).toBeDefined();
    expect(body.photo.id).toBe('new-photo-id');
    expect(body.photo.signedUrl).toBeDefined();
    expect(body.photo.signedUrl).toContain('token=');

    // Verify storage upload was called
    expect(mockSupabase._mockStorage.upload).toHaveBeenCalled();

    // Verify createSignedUrl was called
    expect(mockSupabase._mockStorage.createSignedUrl).toHaveBeenCalled();
  });

  it('should set first photo as primary automatically', async () => {
    // Mock count = 0 (no existing photos)
    mockSupabase._mockQueryBuilder.select.mockReturnValue({
      ...mockSupabase._mockQueryBuilder,
      count: 0,
    });

    const mockPhoto = {
      id: 'first-photo-id',
      user_id: 'test-user-id',
      storage_path: 'test-user-id/123_abc_test.jpg',
      filename: 'test.jpg',
      file_size: 12,
      mime_type: 'image/jpeg',
      width: null,
      height: null,
      is_primary: true,
      display_order: 0,
      upload_source: 'manual',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    mockSupabase._mockQueryBuilder.single.mockResolvedValue({
      data: mockPhoto,
      error: null,
    });

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'test.jpg', { type: 'image/jpeg' }));

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.photo.is_primary).toBe(true);
  });

  it('should return 500 if storage upload fails', async () => {
    mockSupabase._mockStorage.upload.mockResolvedValue({
      error: { message: 'Storage error' },
    });

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'test.jpg', { type: 'image/jpeg' }));

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to upload file');
  });

  it('should return 500 if signed URL generation fails', async () => {
    mockSupabase._mockStorage.createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: 'Signed URL error' },
    });

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'test.jpg', { type: 'image/jpeg' }));

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to generate signed URL');
  });

  it('should cleanup storage if database insert fails', async () => {
    mockSupabase._mockQueryBuilder.single.mockResolvedValue({
      data: null,
      error: { message: 'Insert failed' },
    });

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'test.jpg', { type: 'image/jpeg' }));

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to save photo record');

    // Verify storage cleanup was called
    expect(mockSupabase._mockStorage.remove).toHaveBeenCalled();
  });

  it('should update user profile primary_photo_id for primary photos', async () => {
    const mockPhoto = {
      id: 'primary-photo-id',
      user_id: 'test-user-id',
      storage_path: 'test-user-id/123_abc_test.jpg',
      filename: 'test.jpg',
      file_size: 12,
      mime_type: 'image/jpeg',
      width: null,
      height: null,
      is_primary: true,
      display_order: 0,
      upload_source: 'manual',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    mockSupabase._mockQueryBuilder.single.mockResolvedValue({
      data: mockPhoto,
      error: null,
    });

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'test.jpg', { type: 'image/jpeg' }));
    formData.append('is_primary', 'true');

    const request = new Request('http://localhost/api/profile-photos/upload', {
      method: 'POST',
      body: formData,
    });

    await POST(request as never);

    // Verify update was called on user_profiles
    expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    expect(mockSupabase._mockQueryBuilder.update).toHaveBeenCalledWith({
      primary_photo_id: 'primary-photo-id',
    });
  });
});
