'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Loader2, ExternalLink, Upload, FileText, Image as ImageIcon, X } from 'lucide-react';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { formatMonthYear } from '@/lib/utils';
import { toast } from 'sonner';
import {
  fetchCertifications,
  createCertification,
  deleteCertification,
  updateCertification,
  type ProfileCertification,
} from '@/services/profile-career.service';
import { useProfileManager } from '@/hooks/use-profile-manager';
import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';

interface CertificationsManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface CertificationsManagerRef {
  handleAdd: () => void;
  handleAddWithData: (data: Partial<ProfileCertification>) => Promise<void>;
}

export const CertificationsManager = forwardRef<CertificationsManagerRef, CertificationsManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
  const {
    items: certifications,
    isExpanded,
    getFormData,
    loading,
    saving,
    handleAdd,
    handleEdit,
    handleDelete,
    handleDone,
    handleFieldChange,
    handleMultiFieldChange,
    handleDragEnd,
  } = useProfileManager<ProfileCertification>({
    fetchItems: fetchCertifications,
    createItem: createCertification,
    updateItem: updateCertification,
    deleteItem: deleteCertification,
    defaultItem: {
      name: '',
      issuer: '',
      date: '',
      expiry_date: '',
      url: '',
      credential_id: '',
      document_url: '',
      document_name: '',
      storage_path: '',
    },
    onSavingChange,
    onSaveSuccessChange,
  });

  const handleAddWithData = async (data: Partial<ProfileCertification>) => {
    try {
      const result = await createCertification(data as any);
      if (result.error) {
        throw new Error(result.error);
      }
      // Manually refresh the list
      const { data: refreshedData } = await fetchCertifications();
      if (refreshedData) {
        // The useProfileManager hook will handle this through its own state
        // We just need to wait for it to complete
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating certification:', error);
      throw error;
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleAdd,
    handleAddWithData,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ProfileCardManager
      items={certifications}
      onDragEnd={handleDragEnd}
      renderCard={(certification) => {
        const expanded = isExpanded(certification.id);
        const formData = getFormData(certification.id);
        return (
          <SortableCard
            id={certification.id}
            disabled={false}
            showDragHandle={!expanded}
          >
            {expanded ? (
              <CertificationEditForm
                formData={formData}
                onFieldChange={(field, value) => handleFieldChange(certification.id, field, value)}
                onMultiFieldChange={(updates) => handleMultiFieldChange(certification.id, updates)}
                onDone={() => handleDone(certification.id)}
              />
            ) : (
              <CertificationViewCard
                certification={certification}
                onEdit={() => handleEdit(certification)}
                onDelete={() => handleDelete(certification.id)}
                disabled={saving}
              />
            )}
          </SortableCard>
        );
      }}
      renderDragOverlay={(certification) => (
        <CertificationCardOverlay certification={certification} />
      )}
      emptyState={
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No certifications added yet.</p>
            <p className="text-sm mt-1">Click "Add Certification" to get started.</p>
          </CardContent>
        </Card>
      }
    />
  );
});

CertificationsManager.displayName = 'CertificationsManager';

// Edit Form Component
interface CertificationEditFormProps {
  formData: Partial<ProfileCertification>;
  onFieldChange: (field: keyof ProfileCertification, value: any) => void;
  onMultiFieldChange: (updates: Partial<ProfileCertification>) => void;
  onDone: () => void;
}

function CertificationEditForm({
  formData,
  onFieldChange,
  onMultiFieldChange,
  onDone,
}: CertificationEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Check if expiry date is before issue date
  const isExpiryBeforeIssue = (() => {
    if (!formData.date || !formData.expiry_date) return false;
    return formData.expiry_date < formData.date;
  })();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images and PDFs only)
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

    setUploadingFile(true);

    try {
      // Upload to storage
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      if (formData.id) {
        formDataToSend.append('certificationId', formData.id);
      }

      // For now, just create a preview URL
      // TODO: Implement actual storage upload in future
      const objectUrl = URL.createObjectURL(file);

      onMultiFieldChange({
        document_url: objectUrl,
        document_name: file.name,
      });

      toast.success('Document attached', {
        description: file.name,
      });

    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file', {
        description: 'Please try again or contact support if the problem persists.',
      });
    } finally {
      setUploadingFile(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDocument = () => {
    onMultiFieldChange({
      document_url: '',
      document_name: '',
    });
  };

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edit Certification</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDone}>
            Done
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Certification Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="AWS Certified Solutions Architect"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issuer">Issuing Organization *</Label>
            <Input
              id="issuer"
              value={formData.issuer || ''}
              onChange={(e) => onFieldChange('issuer', e.target.value)}
              placeholder="Amazon Web Services"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Issue Date</Label>
            <MonthYearPicker
              value={formData.date || ''}
              onChange={(value) => onFieldChange('date', value)}
              placeholder="Select issue date"
              showFutureWarning
            />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <MonthYearPicker
              value={formData.expiry_date || ''}
              onChange={(value) => onFieldChange('expiry_date', value)}
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
          <Label htmlFor="credential_id">Credential ID</Label>
          <Input
            id="credential_id"
            value={formData.credential_id || ''}
            onChange={(e) => onFieldChange('credential_id', e.target.value)}
            placeholder="ABC123XYZ"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Verification URL</Label>
          <Input
            id="url"
            type="url"
            value={formData.url || ''}
            onChange={(e) => onFieldChange('url', e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Certificate Document Upload */}
        <div className="space-y-2">
          <Label>Certificate Document</Label>
          {formData.document_url ? (
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
                  {formData.document_name?.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'Image'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(formData.document_url || '', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDocument}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingFile ? 'Uploading...' : 'Upload Certificate (Image or PDF)'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Accepted formats: JPG, PNG, WebP, PDF (Max 10MB)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
}

// View Card Component
interface CertificationViewCardProps {
  certification: ProfileCertification;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}

function CertificationViewCard({
  certification,
  onEdit,
  onDelete,
  disabled,
}: CertificationViewCardProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{certification.name}</CardTitle>
            <CardDescription>{certification.issuer}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
              {certification.date && <span>Issued {formatMonthYear(certification.date)}</span>}
              {certification.expiry_date && <span>• Expires {formatMonthYear(certification.expiry_date)}</span>}
              {certification.credential_id && <span>• ID: {certification.credential_id}</span>}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {certification.url && (
                <a
                  href={certification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Verify credential
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {certification.document_url && (
                <a
                  href={certification.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {certification.document_name?.toLowerCase().endsWith('.pdf') ? (
                    <FileText className="h-3 w-3" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                  View certificate
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </>
  );
}

// Overlay component shown while dragging
function CertificationCardOverlay({ certification }: { certification: ProfileCertification }) {
  return (
    <Card className="shadow-xl rotate-3 cursor-grabbing opacity-80">
      <CardHeader>
        <div>
          <CardTitle>{certification.name}</CardTitle>
          <CardDescription>{certification.issuer}</CardDescription>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
            {certification.date && <span>Issued {formatMonthYear(certification.date)}</span>}
            {certification.expiry_date && <span>• Expires {formatMonthYear(certification.expiry_date)}</span>}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
