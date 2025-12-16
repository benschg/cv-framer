'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Loader2, ExternalLink, Upload, FileText, Image as ImageIcon, X, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchReferences,
  createReference,
  deleteReference,
  updateReference,
  uploadReferenceLetter,
  type ProfileReference,
} from '@/services/profile-career.service';
import { useProfileManager } from '@/hooks/use-profile-manager';
import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';
import { useTranslations } from '@/hooks/use-translations';

interface ReferencesManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface ReferencesManagerRef {
  handleAdd: () => void;
  handleAddWithData: (data: Partial<ProfileReference>, file?: File) => Promise<void>;
}

export const ReferencesManager = forwardRef<ReferencesManagerRef, ReferencesManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
  const {
    items: references,
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
  } = useProfileManager<ProfileReference>({
    fetchItems: fetchReferences,
    createItem: createReference,
    updateItem: updateReference,
    deleteItem: deleteReference,
    defaultItem: {
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
    },
    onSavingChange,
    onSaveSuccessChange,
  });

  const handleAddWithData = async (data: Partial<ProfileReference>, file?: File) => {
    try {
      let documentUrl = '';
      let documentName = '';
      let storagePath = '';

      // If a file was provided, upload it first and get the URL
      if (file) {
        toast.loading('Uploading document...', { id: 'ref-upload' });

        // We need to create the reference first to get an ID, then upload the document
        // For now, create without the document, then update with document info
        const tempResult = await createReference(data as any);
        if (tempResult.error) {
          throw new Error(tempResult.error);
        }

        const referenceId = tempResult.data?.id;
        const referenceName = tempResult.data?.name || 'Reference';

        if (referenceId) {
          // Get current user ID for upload
          const { data: { user } } = await (await import('@/lib/supabase/client')).createClient().auth.getUser();
          if (!user) {
            throw new Error('User not authenticated');
          }

          const uploadResult = await uploadReferenceLetter(user.id, referenceId, file);
          if (uploadResult.error) {
            console.error('Error uploading document:', uploadResult.error);
            toast.error('Document upload failed', {
              id: 'ref-upload',
              description: 'The reference was created but the document could not be uploaded. You can add it later.',
            });
          } else {
            documentUrl = uploadResult.data?.url || '';
            storagePath = uploadResult.data?.path || '';
            documentName = file.name;

            // Update the reference with document info
            await updateReference(referenceId, {
              document_url: documentUrl,
              document_name: documentName,
              storage_path: storagePath,
            });

            toast.success('Reference and document added!', {
              id: 'ref-upload',
              description: `${referenceName} with ${file.name}`,
            });
          }
        }

        // Manually refresh the list
        const { data: refreshedData } = await fetchReferences();
        if (refreshedData) {
          // The useProfileManager hook doesn't expose a way to refresh,
          // so we need to reload the page
          await new Promise(resolve => setTimeout(resolve, 1000)); // Show toast before reload
          window.location.reload();
        }
      } else {
        // No file, just create the reference
        const result = await createReference(data as any);
        if (result.error) {
          throw new Error(result.error);
        }

        toast.success('Reference added!');

        // Manually refresh the list
        const { data: refreshedData } = await fetchReferences();
        if (refreshedData) {
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error adding reference:', error);
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
      items={references}
      onDragEnd={handleDragEnd}
      renderCard={(reference) => {
        const expanded = isExpanded(reference.id);
        const formData = getFormData(reference.id);
        return (
          <SortableCard
            id={reference.id}
            disabled={false}
            showDragHandle={!expanded}
          >
            {expanded ? (
              <ReferenceEditForm
                formData={formData}
                onFieldChange={(field, value) => handleFieldChange(reference.id, field, value)}
                onMultiFieldChange={(updates) => handleMultiFieldChange(reference.id, updates)}
                onDone={() => handleDone(reference.id)}
              />
            ) : (
              <ReferenceViewCard
                reference={reference}
                onEdit={() => handleEdit(reference)}
                onDelete={() => handleDelete(reference.id)}
                disabled={saving}
              />
            )}
          </SortableCard>
        );
      }}
      renderDragOverlay={(reference) => (
        <ReferenceCardOverlay reference={reference} />
      )}
      emptyState={
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No references added yet.</p>
            <p className="text-sm mt-1">Click "Add Reference" to get started.</p>
          </CardContent>
        </Card>
      }
    />
  );
});

ReferencesManager.displayName = 'ReferencesManager';

// Edit Form Component
interface ReferenceEditFormProps {
  formData: Partial<ProfileReference>;
  onFieldChange: (field: keyof ProfileReference, value: any) => void;
  onMultiFieldChange: (updates: Partial<ProfileReference>) => void;
  onDone: () => void;
}

function ReferenceEditForm({
  formData,
  onFieldChange,
  onMultiFieldChange,
  onDone,
}: ReferenceEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images and PDFs only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload an image (JPG, PNG, WebP) or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadingFile(true);

    try {
      // TODO: Upload to storage when API is ready
      // For now, create a local object URL for preview
      const objectUrl = URL.createObjectURL(file);

      onMultiFieldChange({
        document_url: objectUrl,
        document_name: file.name,
      });
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
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
          <CardTitle className="text-lg">Edit Reference</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDone}>
            Done
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select
              value={formData.relationship || ''}
              onValueChange={(value) => onFieldChange('relationship', value)}
            >
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Colleague">Colleague</SelectItem>
                <SelectItem value="Team Lead">Team Lead</SelectItem>
                <SelectItem value="Professor">Professor</SelectItem>
                <SelectItem value="Academic Advisor">Academic Advisor</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Mentor">Mentor</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => onFieldChange('title', e.target.value)}
              placeholder="Senior Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company || ''}
              onChange={(e) => onFieldChange('company', e.target.value)}
              placeholder="Acme Inc."
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="john.smith@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linked_position">Link to Work Experience (Optional)</Label>
          <Input
            id="linked_position"
            value={formData.linked_position || ''}
            onChange={(e) => onFieldChange('linked_position', e.target.value)}
            placeholder="Software Engineer at Acme Inc."
          />
          <p className="text-xs text-muted-foreground">
            Link this reference to a specific position from your work experience
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quote">Testimonial Quote (Optional)</Label>
          <Textarea
            id="quote"
            value={formData.quote || ''}
            onChange={(e) => onFieldChange('quote', e.target.value)}
            placeholder="A brief testimonial or recommendation quote..."
            rows={3}
          />
        </div>

        {/* Reference Letter Upload */}
        <div className="space-y-2">
          <Label>Reference Letter</Label>
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
                {uploadingFile ? 'Uploading...' : 'Upload Reference Letter (Image or PDF)'}
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
interface ReferenceViewCardProps {
  reference: ProfileReference;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}

function ReferenceViewCard({
  reference,
  onEdit,
  onDelete,
  disabled,
}: ReferenceViewCardProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{reference.name}</CardTitle>
            <CardDescription>
              {reference.relationship && `${reference.relationship} • `}
              {reference.title} at {reference.company}
            </CardDescription>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              {reference.email && (
                <a
                  href={`mailto:${reference.email}`}
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  <Mail className="h-3 w-3" />
                  {reference.email}
                </a>
              )}
              {reference.phone && (
                <a
                  href={`tel:${reference.phone}`}
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  <Phone className="h-3 w-3" />
                  {reference.phone}
                </a>
              )}
            </div>
            {reference.linked_position && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Linked to: </span>
                <span className="font-medium">{reference.linked_position}</span>
              </div>
            )}
            {reference.quote && (
              <blockquote className="mt-3 pl-4 border-l-2 border-muted text-sm italic text-muted-foreground">
                "{reference.quote}"
              </blockquote>
            )}
            {reference.document_url && (
              <div className="mt-3">
                <a
                  href={reference.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {reference.document_name?.toLowerCase().endsWith('.pdf') ? (
                    <FileText className="h-3 w-3" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                  View reference letter
                </a>
              </div>
            )}
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
function ReferenceCardOverlay({ reference }: { reference: ProfileReference }) {
  return (
    <Card className="shadow-xl rotate-3 cursor-grabbing opacity-80">
      <CardHeader>
        <div>
          <CardTitle>{reference.name}</CardTitle>
          <CardDescription>
            {reference.relationship && `${reference.relationship} • `}
            {reference.title} at {reference.company}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
