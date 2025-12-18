import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabaseClient, type MockSupabaseClient } from '@/test/mocks/supabase';

// Mock the supabase server client
let mockSupabase: MockSupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Import after mocking
const { POST } = await import('./route');

describe('POST /api/reference-documents/upload', () => {
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
    formData.append('reference_id', 'ref-123');

    const request = new Request('http://localhost/api/reference-documents/upload', {
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
    formData.append('reference_id', 'ref-123');

    const request = new Request('http://localhost/api/reference-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('No file provided');
  });

  it('should return 400 if no reference_id is provided', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const request = new Request('http://localhost/api/reference-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('No reference_id provided');
  });

  it('should return 400 for invalid file type', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.txt', { type: 'text/plain' }));
    formData.append('reference_id', 'ref-123');

    const request = new Request('http://localhost/api/reference-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Invalid file type');
  });

  it('should return 404 if reference is not found', async () => {
    mockSupabase._mockQueryBuilder.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('reference_id', 'ref-123');

    const request = new Request('http://localhost/api/reference-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Reference not found');
  });

  it('should return 403 if reference belongs to different user', async () => {
    mockSupabase._mockQueryBuilder.single.mockResolvedValue({
      data: { id: 'ref-123', user_id: 'different-user-id', document_url: null },
      error: null,
    });

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('reference_id', 'ref-123');

    const request = new Request('http://localhost/api/reference-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Unauthorized');
  });

  it('should upload file and return document info on success', async () => {
    // Mock reference lookup - first call
    mockSupabase._mockQueryBuilder.single
      .mockResolvedValueOnce({
        data: { id: 'ref-123', user_id: 'test-user-id', document_url: null },
        error: null,
      })
      // Mock update - returns nothing
      .mockResolvedValueOnce({ data: null, error: null });

    // Mock successful update
    mockSupabase._mockQueryBuilder.eq.mockReturnThis();
    mockSupabase._mockQueryBuilder.update.mockReturnThis();

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'test.pdf', { type: 'application/pdf' }));
    formData.append('reference_id', 'ref-123');

    const request = new Request('http://localhost/api/reference-documents/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.document_url).toBeDefined();
    expect(body.document_name).toBeDefined();

    // Verify storage upload was called
    expect(mockSupabase._mockStorage.upload).toHaveBeenCalled();
  });

  it('should delete old document before uploading new one', async () => {
    const oldDocUrl =
      'https://example.supabase.co/storage/v1/object/public/reference-documents/old/path.pdf';

    mockSupabase._mockQueryBuilder.single.mockResolvedValueOnce({
      data: { id: 'ref-123', user_id: 'test-user-id', document_url: oldDocUrl },
      error: null,
    });

    const formData = new FormData();
    formData.append('file', new File(['test content'], 'new.pdf', { type: 'application/pdf' }));
    formData.append('reference_id', 'ref-123');

    const request = new Request('http://localhost/api/reference-documents/upload', {
      method: 'POST',
      body: formData,
    });

    await POST(request as never);

    // Verify remove was called for old document
    expect(mockSupabase._mockStorage.remove).toHaveBeenCalled();
  });
});
