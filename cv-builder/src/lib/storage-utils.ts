import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Constants for document uploads
export const DOCUMENT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DOCUMENT_ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export type DocumentBucket = 'reference-documents' | 'certification-documents';

/**
 * Validate a file for document upload
 * Returns a NextResponse error if validation fails, or null if valid
 */
export function validateDocumentFile(file: File | null): NextResponse | null {
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!DOCUMENT_ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Please upload PDF, JPEG, PNG, or WebP files.' },
      { status: 400 }
    );
  }

  if (file.size > DOCUMENT_MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
  }

  return null;
}

/**
 * Generate a unique storage path for a document
 */
export function generateStoragePath(userId: string, parentId: string, filename: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${parentId}/${timestamp}_${randomStr}_${sanitizedFilename}`;
}

/**
 * Extract the storage path from a public Supabase storage URL
 */
export function extractStoragePath(publicUrl: string, bucket: DocumentBucket): string | null {
  try {
    const url = new URL(publicUrl);
    const regex = new RegExp(`\\/${bucket}\\/(.+)$`);
    const match = url.pathname.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Upload a file to Supabase storage
 * Returns the public URL and storage path, or throws an error
 */
export async function uploadToStorage(
  supabase: SupabaseClient,
  bucket: DocumentBucket,
  storagePath: string,
  file: File
): Promise<{ publicUrl: string; storagePath: string }> {
  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error('Failed to upload file');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return { publicUrl, storagePath };
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFromStorage(
  supabase: SupabaseClient,
  bucket: DocumentBucket,
  storagePath: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) {
    console.error('Storage delete error:', error);
    // Don't throw - deletion failures are non-critical
  }
}

/**
 * Delete a file from storage using its public URL
 */
export async function deleteFromStorageByUrl(
  supabase: SupabaseClient,
  bucket: DocumentBucket,
  publicUrl: string
): Promise<void> {
  const storagePath = extractStoragePath(publicUrl, bucket);
  if (storagePath) {
    await deleteFromStorage(supabase, bucket, storagePath);
  }
}
