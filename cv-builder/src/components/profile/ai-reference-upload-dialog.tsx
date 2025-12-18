'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { DragEvent,useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProfileReference } from '@/services/profile-career.service';

import {
  AnalyzingState,
  ConfidenceWarning,
  DocumentPreview,
  UploadArea,
  validateFile,
} from './ai-upload-shared';

interface AIReferenceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    reference: Omit<
      ProfileReference,
      'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'
    >,
    file?: File
  ) => Promise<void>;
}

export function AIReferenceUploadDialog({
  open,
  onOpenChange,
  onAdd,
}: AIReferenceUploadDialogProps) {
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
    title: '',
    company: '',
    relationship: '',
    email: '',
    phone: '',
    quote: '',
    linked_position: '',
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
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error!, {
        description: validation.errorDescription,
      });
      return;
    }

    setSelectedFile(file);
    setAnalyzing(true);

    try {
      // Call analysis API
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch('/api/references/analyze', {
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

      // Populate form with extracted data (document will be uploaded after reference creation)
      setFormData({
        name: data.extractedData.name || '',
        title: data.extractedData.title || '',
        company: data.extractedData.company || '',
        relationship: data.extractedData.relationship || '',
        email: data.extractedData.email || '',
        phone: data.extractedData.phone || '',
        quote: data.extractedData.quote || '',
        linked_position: '',
        document_url: '',
        document_name: '',
        storage_path: '',
      });

      // Success feedback
      const extractedCount = Object.values(data.extractedData).filter((v) => v !== null).length;
      if (extractedCount === 0) {
        toast.warning('No data extracted', {
          description:
            'AI could not read the reference letter. Please enter the details manually below.',
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
        description:
          errorMessage === 'Analysis failed'
            ? 'Unable to analyze the reference letter. The document may be unclear or in an unsupported format. Please enter details manually.'
            : errorMessage,
      });

      // Fall back to manual entry with document preview
      const objectUrl = URL.createObjectURL(file);
      setFormData({
        name: '',
        title: '',
        company: '',
        relationship: '',
        email: '',
        phone: '',
        quote: '',
        linked_position: '',
        document_url: objectUrl,
        document_name: file.name,
        storage_path: '',
      });

      // Still show the form for manual entry
      setExtractedData({
        name: null,
        title: null,
        company: null,
        relationship: null,
        email: null,
        phone: null,
        quote: null,
      });
      setConfidence({
        name: 0,
        title: 0,
        company: 0,
        relationship: 0,
        email: 0,
        phone: 0,
        quote: 0,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    // Validate required fields
    if (!formData.name || !formData.title || !formData.company) {
      toast.error('Required fields missing', {
        description: 'Please fill in at least the Name, Title, and Company.',
      });
      return;
    }

    setAdding(true);
    try {
      // Pass the selected file to the parent so it can be uploaded after reference creation
      await onAdd(formData, selectedFile || undefined);

      // Success toast is shown by the parent component with document info
      // Reset and close
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding reference:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast.error('Failed to add reference', {
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
      title: '',
      company: '',
      relationship: '',
      email: '',
      phone: '',
      quote: '',
      linked_position: '',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Reference using AI
          </DialogTitle>
          <DialogDescription>
            Upload a reference letter image or PDF. AI will extract the details for you to review
            and edit.
          </DialogDescription>
        </DialogHeader>

        {!selectedFile && !analyzing ? (
          <UploadArea
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onChooseFile={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileChange={handleFileInputChange}
            documentType="reference letter"
          />
        ) : analyzing ? (
          <AnalyzingState documentType="reference letter" />
        ) : (
          // Review and edit form
          <div className="space-y-4">
            {/* Document preview */}
            {selectedFile && extractedData && (
              <DocumentPreview
                file={selectedFile}
                extractedFieldCount={Object.values(extractedData).filter((v) => v !== null).length}
                documentType="reference"
              />
            )}

            {/* Form fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-name">Reference Name *</Label>
                <Input
                  id="ai-name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="John Smith"
                />
                <ConfidenceWarning confidence={confidence.name || 0} hasValue={!!formData.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-title">Title *</Label>
                <Input
                  id="ai-title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Senior Manager"
                />
                <ConfidenceWarning confidence={confidence.title || 0} hasValue={!!formData.title} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-company">Company *</Label>
                <Input
                  id="ai-company"
                  value={formData.company}
                  onChange={(e) => handleFieldChange('company', e.target.value)}
                  placeholder="ACME Corporation"
                />
                <ConfidenceWarning
                  confidence={confidence.company || 0}
                  hasValue={!!formData.company}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-relationship">Relationship</Label>
                <Input
                  id="ai-relationship"
                  value={formData.relationship}
                  onChange={(e) => handleFieldChange('relationship', e.target.value)}
                  placeholder="Former Manager"
                />
                <ConfidenceWarning
                  confidence={confidence.relationship || 0}
                  hasValue={!!formData.relationship}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-email">Email</Label>
                <Input
                  id="ai-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="john.smith@example.com"
                />
                <ConfidenceWarning confidence={confidence.email || 0} hasValue={!!formData.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-phone">Phone</Label>
                <Input
                  id="ai-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <ConfidenceWarning confidence={confidence.phone || 0} hasValue={!!formData.phone} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-quote">Notable Quote</Label>
              <Textarea
                id="ai-quote"
                value={formData.quote}
                onChange={(e) => handleFieldChange('quote', e.target.value)}
                placeholder="Key recommendation or quote from the reference letter..."
                rows={3}
              />
              <ConfidenceWarning confidence={confidence.quote || 0} hasValue={!!formData.quote} />
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Reference'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
