'use client';

import { useState, useRef, DragEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, FileText, Image as ImageIcon, AlertTriangle, Sparkles } from 'lucide-react';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { toast } from 'sonner';
import type { ProfileCertification } from '@/services/profile-career.service';

interface AICertificationUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (certification: Omit<ProfileCertification, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>) => Promise<void>;
}

export function AICertificationUploadDialog({
  open,
  onOpenChange,
  onAdd,
}: AICertificationUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);

  // Form state for editing extracted data
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    date: '',
    expiry_date: '',
    credential_id: '',
    url: '',
    document_url: '',
    document_name: '',
    storage_path: '',
  });

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
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

    setSelectedFile(file);
    setAnalyzing(true);

    try {
      // Call analysis API
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch('/api/certifications/analyze', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Store extracted data and confidence
      setExtractedData(data.extractedData);
      setConfidence(data.confidence);

      // Populate form with extracted data
      setFormData({
        name: data.extractedData.name || '',
        issuer: data.extractedData.issuer || '',
        date: data.extractedData.date || '',
        expiry_date: data.extractedData.expiry_date || '',
        credential_id: data.extractedData.credential_id || '',
        url: data.extractedData.url || '',
        document_url: data.document?.document_url || '',
        document_name: data.document?.document_name || file.name,
        storage_path: data.document?.storage_path || '',
      });

      // Success feedback
      const extractedCount = Object.values(data.extractedData).filter(v => v !== null).length;
      if (extractedCount === 0) {
        toast.warning('No data extracted', {
          description: 'AI could not read the certificate. Please enter the details manually below.',
        });
      } else if (extractedCount < 3) {
        toast.info(`Partial extraction: ${extractedCount} field(s) found`, {
          description: 'Please review and fill in the remaining fields.',
        });
      } else {
        toast.success(`Successfully extracted ${extractedCount} field(s)`, {
          description: 'Please review the information below before adding.',
        });
      }

    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast.error('Analysis failed', {
        description: errorMessage === 'Analysis failed'
          ? 'Unable to analyze the certificate. The document may be unclear or in an unsupported format. Please enter details manually.'
          : errorMessage,
      });

      // Fall back to manual entry with document preview
      const objectUrl = URL.createObjectURL(file);
      setFormData({
        name: '',
        issuer: '',
        date: '',
        expiry_date: '',
        credential_id: '',
        url: '',
        document_url: objectUrl,
        document_name: file.name,
        storage_path: '',
      });

      // Still show the form for manual entry
      setExtractedData({
        name: null,
        issuer: null,
        date: null,
        expiry_date: null,
        credential_id: null,
        url: null,
      });
      setConfidence({
        name: 0,
        issuer: 0,
        date: 0,
        expiry_date: 0,
        credential_id: 0,
        url: 0,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    // Validate required fields
    if (!formData.name || !formData.issuer) {
      toast.error('Required fields missing', {
        description: 'Please fill in at least the Certification Name and Issuing Organization.',
      });
      return;
    }

    setAdding(true);
    try {
      await onAdd(formData);

      toast.success('Certification added!', {
        description: `${formData.name} has been added to your profile.`,
      });

      // Reset and close
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding certification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast.error('Failed to add certification', {
        description: errorMessage || 'Please try again or contact support if the problem persists.',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalyzing(false);
    setExtractedData(null);
    setConfidence({});
    setFormData({
      name: '',
      issuer: '',
      date: '',
      expiry_date: '',
      credential_id: '',
      url: '',
      document_url: '',
      document_name: '',
      storage_path: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  // Check if expiry date is before issue date
  const isExpiryBeforeIssue = formData.date && formData.expiry_date && formData.expiry_date < formData.date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Certification using AI
          </DialogTitle>
          <DialogDescription>
            Upload a certificate image or PDF. AI will extract the details for you to review and edit.
          </DialogDescription>
        </DialogHeader>

        {!selectedFile && !analyzing ? (
          // Upload area
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Drop your certificate here</h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse your files
            </p>
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Accepted formats: JPG, PNG, WebP, PDF (Max 10MB)
            </p>
          </div>
        ) : analyzing ? (
          // Analyzing state
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-medium mb-2">Analyzing certificate...</h3>
            <p className="text-sm text-muted-foreground">
              AI is extracting information from your document
            </p>
          </div>
        ) : (
          // Review and edit form
          <div className="space-y-4">
            {/* Document preview */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                {formData.document_name?.toLowerCase().endsWith('.pdf') ? (
                  <FileText className="h-8 w-8 text-red-500" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{formData.document_name}</p>
                <p className="text-xs text-muted-foreground">
                  {extractedData && Object.values(extractedData).filter(v => v !== null).length} field(s) extracted
                </p>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-name">Certification Name *</Label>
                <Input
                  id="ai-name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="AWS Certified Solutions Architect"
                />
                {confidence.name < 0.7 && confidence.name > 0 && formData.name && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Please verify this value</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-issuer">Issuing Organization *</Label>
                <Input
                  id="ai-issuer"
                  value={formData.issuer}
                  onChange={(e) => handleFieldChange('issuer', e.target.value)}
                  placeholder="Amazon Web Services"
                />
                {confidence.issuer < 0.7 && confidence.issuer > 0 && formData.issuer && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Please verify this value</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <MonthYearPicker
                  value={formData.date}
                  onChange={(value) => handleFieldChange('date', value)}
                  placeholder="Select issue date"
                  showFutureWarning
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <MonthYearPicker
                  value={formData.expiry_date}
                  onChange={(value) => handleFieldChange('expiry_date', value)}
                  placeholder="Select expiry date"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if it doesn't expire
                </p>
              </div>
            </div>

            {isExpiryBeforeIssue && (
              <p className="flex items-center gap-1 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Expiry date cannot be before issue date
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="ai-credential-id">Credential ID</Label>
              <Input
                id="ai-credential-id"
                value={formData.credential_id}
                onChange={(e) => handleFieldChange('credential_id', e.target.value)}
                placeholder="ABC123XYZ"
              />
              {confidence.credential_id < 0.7 && confidence.credential_id > 0 && formData.credential_id && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Please verify this value</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-url">Verification URL</Label>
              <Input
                id="ai-url"
                type="url"
                value={formData.url}
                onChange={(e) => handleFieldChange('url', e.target.value)}
                placeholder="https://..."
              />
              {confidence.url < 0.7 && confidence.url > 0 && formData.url && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Please verify this value</span>
                </div>
              )}
            </div>
          </div>
        )}

        {extractedData && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={adding}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Certification'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
