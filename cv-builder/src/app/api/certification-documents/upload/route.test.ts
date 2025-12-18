import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabaseClient, type MockSupabaseClient } from '@/test/mocks/supabase';

// Mock the supabase server client
let mockSupabase: MockSupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Import after mocking
const { POST } = await import('./route');

describe('POST /api/certification-documents/upload', () => {
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
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('certification_id', 'cert-123');

    const request = new Request('http://localhost/api/certification-documents/upload', {
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
    formData.append('certification_id', 'cert-123');

    const request = new Request('http://localhost/api/certification-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('No file provided');
  });

  it('should return 400 if no certification_id is provided', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const request = new Request('http://localhost/api/certification-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('No certification_id provided');
  });

  it('should return 400 for invalid file type', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.exe', { type: 'application/x-msdownload' }));
    formData.append('certification_id', 'cert-123');

    const request = new Request('http://localhost/api/certification-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Invalid file type');
  });

  it('should return 404 if certification is not found', async () => {
    mockSupabase._mockQueryBuilder.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('certification_id', 'cert-123');

    const request = new Request('http://localhost/api/certification-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Certification not found');
  });

  it('should return 403 if certification belongs to different user', async () => {
    mockSupabase._mockQueryBuilder.single.mockResolvedValue({
      data: { id: 'cert-123', user_id: 'different-user-id' },
      error: null,
    });

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('certification_id', 'cert-123');

    const request = new Request('http://localhost/api/certification-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Unauthorized');
  });

  it('should upload file and create document record on success', async () => {
    const mockDocRecord = {
      id: 'doc-123',
      certification_id: 'cert-123',
      document_url: 'https://example.com/file.pdf',
      document_name: 'test.pdf',
      storage_path: 'user-123/cert-123/123_abc_test.pdf',
      file_type: 'application/pdf',
      file_size: 12,
      display_order: 0,
    };

    // Mock certification lookup
    mockSupabase._mockQueryBuilder.single
      .mockResolvedValueOnce({
        data: { id: 'cert-123', user_id: 'test-user-id' },
        error: null,
      })
      // Mock insert result
      .mockResolvedValueOnce({
        data: mockDocRecord,
        error: null,
      });

    // Mock empty existing docs
    mockSupabase._mockQueryBuilder.limit.mockReturnValue({
      then: (cb: (result: { data: never[] }) => void) => cb({ data: [] }),
    });

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('certification_id', 'cert-123');

    const request = new Request('http://localhost/api/certification-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);

    expect(response.status).toBe(200);

    // Verify storage upload was called
    expect(mockSupabase._mockStorage.upload).toHaveBeenCalled();
  });

  it('should accept various image formats', async () => {
    mockSupabase._mockQueryBuilder.single.mockResolvedValueOnce({
      data: { id: 'cert-123', user_id: 'test-user-id' },
      error: null,
    });

    const testCases = [
      { name: 'test.jpg', type: 'image/jpeg' },
      { name: 'test.png', type: 'image/png' },
      { name: 'test.webp', type: 'image/webp' },
    ];

    for (const { name, type } of testCases) {
      mockSupabase = createMockSupabaseClient();
      mockSupabase._mockQueryBuilder.single.mockResolvedValueOnce({
        data: { id: 'cert-123', user_id: 'test-user-id' },
        error: null,
      });

      const formData = new FormData();
      formData.append('file', new File(['test'], name, { type }));
      formData.append('certification_id', 'cert-123');

      const request = new Request('http://localhost/api/certification-documents/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request as never);

      // Should not return validation error
      expect(response.status).not.toBe(400);
    }
  });
});
