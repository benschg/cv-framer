import { describe, expect, it } from 'vitest';

import {
  DOCUMENT_ALLOWED_TYPES,
  DOCUMENT_MAX_FILE_SIZE,
  extractStoragePath,
  generateStoragePath,
  validateDocumentFile,
} from './storage-utils';

describe('storage-utils', () => {
  describe('constants', () => {
    it('should have correct max file size (10MB)', () => {
      expect(DOCUMENT_MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should allow PDF and image types', () => {
      expect(DOCUMENT_ALLOWED_TYPES).toContain('application/pdf');
      expect(DOCUMENT_ALLOWED_TYPES).toContain('image/jpeg');
      expect(DOCUMENT_ALLOWED_TYPES).toContain('image/png');
      expect(DOCUMENT_ALLOWED_TYPES).toContain('image/webp');
    });
  });

  describe('validateDocumentFile', () => {
    it('should return error if file is null', async () => {
      const response = validateDocumentFile(null);
      expect(response).not.toBeNull();
      const body = await response!.json();
      expect(body.error).toBe('No file provided');
    });

    it('should return error for invalid file type', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const response = validateDocumentFile(file);
      expect(response).not.toBeNull();
      const body = await response!.json();
      expect(body.error).toContain('Invalid file type');
    });

    it('should return error for file too large', async () => {
      // Create a mock file larger than 10MB
      const largeContent = new ArrayBuffer(11 * 1024 * 1024);
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      const response = validateDocumentFile(file);
      expect(response).not.toBeNull();
      const body = await response!.json();
      expect(body.error).toContain('File too large');
    });

    it('should return null for valid PDF file', () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const response = validateDocumentFile(file);
      expect(response).toBeNull();
    });

    it('should return null for valid JPEG file', () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const response = validateDocumentFile(file);
      expect(response).toBeNull();
    });

    it('should return null for valid PNG file', () => {
      const file = new File(['test content'], 'test.png', { type: 'image/png' });
      const response = validateDocumentFile(file);
      expect(response).toBeNull();
    });

    it('should return null for valid WebP file', () => {
      const file = new File(['test content'], 'test.webp', { type: 'image/webp' });
      const response = validateDocumentFile(file);
      expect(response).toBeNull();
    });
  });

  describe('generateStoragePath', () => {
    it('should generate a path with userId, parentId, timestamp, and filename', () => {
      const userId = 'user-123';
      const parentId = 'parent-456';
      const filename = 'document.pdf';

      const path = generateStoragePath(userId, parentId, filename);

      expect(path).toMatch(/^user-123\/parent-456\/\d+_[a-z0-9]+_document\.pdf$/);
    });

    it('should sanitize special characters in filename', () => {
      const userId = 'user-123';
      const parentId = 'parent-456';
      const filename = 'my document (1).pdf';

      const path = generateStoragePath(userId, parentId, filename);

      expect(path).toMatch(/^user-123\/parent-456\/\d+_[a-z0-9]+_my_document__1_\.pdf$/);
    });

    it('should generate unique paths for same inputs', () => {
      const userId = 'user-123';
      const parentId = 'parent-456';
      const filename = 'document.pdf';

      const path1 = generateStoragePath(userId, parentId, filename);
      const path2 = generateStoragePath(userId, parentId, filename);

      // Paths should be different due to timestamp/random components
      expect(path1).not.toBe(path2);
    });
  });

  describe('extractStoragePath', () => {
    it('should extract path from reference-documents URL', () => {
      const url =
        'https://example.supabase.co/storage/v1/object/public/reference-documents/user-123/ref-456/file.pdf';
      const path = extractStoragePath(url, 'reference-documents');

      expect(path).toBe('user-123/ref-456/file.pdf');
    });

    it('should extract path from certification-documents URL', () => {
      const url =
        'https://example.supabase.co/storage/v1/object/public/certification-documents/user-123/cert-456/file.pdf';
      const path = extractStoragePath(url, 'certification-documents');

      expect(path).toBe('user-123/cert-456/file.pdf');
    });

    it('should return null for invalid URL', () => {
      const path = extractStoragePath('not-a-valid-url', 'reference-documents');
      expect(path).toBeNull();
    });

    it('should return null for URL with wrong bucket', () => {
      const url =
        'https://example.supabase.co/storage/v1/object/public/other-bucket/user-123/file.pdf';
      const path = extractStoragePath(url, 'reference-documents');
      expect(path).toBeNull();
    });

    it('should handle complex file paths', () => {
      const url =
        'https://example.supabase.co/storage/v1/object/public/reference-documents/user-123/ref-456/1234567890_abc123_my_document.pdf';
      const path = extractStoragePath(url, 'reference-documents');

      expect(path).toBe('user-123/ref-456/1234567890_abc123_my_document.pdf');
    });
  });
});
