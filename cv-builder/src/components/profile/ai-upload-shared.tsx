'use client';

import { DragEvent } from 'react';
import { Upload, Loader2, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadAreaProps {
  isDragging: boolean;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onChooseFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  documentType: string;
}

export function UploadArea({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onChooseFile,
  fileInputRef,
  onFileChange,
  documentType,
}: UploadAreaProps) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
        onChange={onFileChange}
        className="hidden"
      />
      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">Drop your {documentType} here</h3>
      <p className="text-sm text-muted-foreground mb-4">
        or click to browse your files
      </p>
      <Button onClick={onChooseFile} variant="secondary">
        Choose File
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        Accepted formats: JPG, PNG, WebP, PDF (Max 10MB)
      </p>
    </div>
  );
}

interface AnalyzingStateProps {
  documentType: string;
}

export function AnalyzingState({ documentType }: AnalyzingStateProps) {
  return (
    <div className="py-12 text-center">
      <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
      <h3 className="text-lg font-medium mb-2">Analyzing {documentType}...</h3>
      <p className="text-sm text-muted-foreground">
        AI is extracting information from your document
      </p>
    </div>
  );
}

interface DocumentPreviewProps {
  file: File;
  extractedFieldCount: number;
  documentType: string;
}

export function DocumentPreview({ file, extractedFieldCount, documentType }: DocumentPreviewProps) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
      <div className="flex-shrink-0">
        {file.name.toLowerCase().endsWith('.pdf') ? (
          <FileText className="h-8 w-8 text-red-500" />
        ) : (
          <ImageIcon className="h-8 w-8 text-blue-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {extractedFieldCount} field(s) extracted • Will be uploaded with {documentType}
        </p>
      </div>
    </div>
  );
}

interface ConfidenceWarningProps {
  confidence: number;
  hasValue: boolean;
}

export function ConfidenceWarning({ confidence, hasValue }: ConfidenceWarningProps) {
  if (confidence >= 0.7 || confidence === 0 || !hasValue) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-xs text-amber-600">
      <AlertTriangle className="h-3 w-3" />
      <span>Please verify this value</span>
    </div>
  );
}

export function validateFile(file: File): { valid: boolean; error?: string; errorDescription?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type',
      errorDescription: 'Please upload an image (JPG, PNG, WebP) or PDF file.',
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: 'File too large',
      errorDescription: `File size is ${sizeMB}MB. Maximum allowed size is 10MB.`,
    };
  }

  return { valid: true };
}
