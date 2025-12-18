'use client';

import { ExternalLink, FileText, Image as ImageIcon, Loader2,Trash2, Upload } from 'lucide-react';
import { useEffect, useRef,useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  createCertificationDocument,
  deleteCertificationDocumentRecord,
  fetchCertificationDocuments,
} from '@/services/profile-career.service';
import type { CertificationDocument } from '@/types/profile-career.types';

interface CertificationDocumentsManagerProps {
  certificationId: string;
  disabled?: boolean;
}

export function CertificationDocumentsManager({
  certificationId,
  disabled = false,
}: CertificationDocumentsManagerProps) {
  const [documents, setDocuments] = useState<CertificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents on mount
  useEffect(() => {
    loadDocuments();
  }, [certificationId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchCertificationDocuments(certificationId);
      if (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload an image (JPG, PNG, WebP) or PDF file.',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast.error('File too large', {
        description: `File size is ${sizeMB}MB. Maximum allowed size is 10MB.`,
      });
      return;
    }

    setUploading(true);
    try {
      const { data, error } = await createCertificationDocument(certificationId, file);

      if (error) {
        throw new Error(error.message || 'Upload failed');
      }

      toast.success('Document uploaded successfully');

      // Reload documents
      await loadDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Upload failed', {
        description: errorMessage,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (documentId: string, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingId(documentId);
    try {
      const { error } = await deleteCertificationDocumentRecord(documentId, storagePath);

      if (error) {
        throw new Error(error.message || 'Delete failed');
      }

      toast.success('Document deleted');

      // Reload documents
      await loadDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Delete failed', {
        description: errorMessage,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
          size="sm"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          Accepted formats: JPG, PNG, WebP, PDF (Max 10MB)
        </p>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No documents uploaded yet</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex-shrink-0">
                {doc.document_name.toLowerCase().endsWith('.pdf') ? (
                  <FileText className="h-6 w-6 text-red-500" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-blue-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.document_name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.file_type?.split('/')[1]?.toUpperCase() || 'File'}
                  {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.document_url, '_blank')}
                  disabled={disabled}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id, doc.storage_path)}
                  disabled={disabled || deletingId === doc.id}
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
