'use client';

import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  Phone,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { useProfileManager } from '@/hooks/use-profile-manager';
import {
  createReference,
  deleteReference,
  fetchReferences,
  type ProfileReference,
  updateReference,
  uploadReferenceLetter,
} from '@/services/profile-career.service';

import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';

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
    const { t } = useAppTranslation();
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
          toast.loading(t('profile.references.uploadingDocument'), { id: 'ref-upload' });

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
            const {
              data: { user },
            } = await (await import('@/lib/supabase/client')).createClient().auth.getUser();
            if (!user) {
              throw new Error('User not authenticated');
            }

            const uploadResult = await uploadReferenceLetter(user.id, referenceId, file);
            if (uploadResult.error) {
              console.error('Error uploading document:', uploadResult.error);
              toast.error(t('profile.references.uploadFailed'), {
                id: 'ref-upload',
                description: t('profile.references.uploadFailedDescription'),
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

              toast.success(t('profile.references.addedSuccess'), {
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
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Show toast before reload
            window.location.reload();
          }
        } else {
          // No file, just create the reference
          const result = await createReference(data as any);
          if (result.error) {
            throw new Error(result.error);
          }

          toast.success(t('profile.references.addedSuccessOnly'));

          // Manually refresh the list
          const { data: refreshedData } = await fetchReferences();
          if (refreshedData) {
            await new Promise((resolve) => setTimeout(resolve, 500));
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
            <SortableCard id={reference.id} disabled={false} showDragHandle={!expanded}>
              {expanded ? (
                <ReferenceEditForm
                  formData={formData}
                  onFieldChange={(field, value) => handleFieldChange(reference.id, field, value)}
                  onMultiFieldChange={(updates) => handleMultiFieldChange(reference.id, updates)}
                  onDone={() => handleDone(reference.id)}
                  t={t}
                />
              ) : (
                <ReferenceViewCard
                  reference={reference}
                  onEdit={() => handleEdit(reference)}
                  onDelete={() => handleDelete(reference.id)}
                  disabled={saving}
                  t={t}
                />
              )}
            </SortableCard>
          );
        }}
        renderDragOverlay={(reference) => <ReferenceCardOverlay reference={reference} />}
        emptyState={
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>{t('profile.references.empty')}</p>
              <p className="mt-1 text-sm">{t('profile.references.emptyAction')}</p>
            </CardContent>
          </Card>
        }
      />
    );
  }
);

ReferencesManager.displayName = 'ReferencesManager';

// Edit Form Component
interface ReferenceEditFormProps {
  formData: Partial<ProfileReference>;
  onFieldChange: (field: keyof ProfileReference, value: any) => void;
  onMultiFieldChange: (updates: Partial<ProfileReference>) => void;
  onDone: () => void;
  t: (key: string) => string;
}

function ReferenceEditForm({
  formData,
  onFieldChange,
  onMultiFieldChange,
  onDone,
  t,
}: ReferenceEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images and PDFs only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert(t('profile.references.invalidFileType'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(t('profile.references.fileTooLarge'));
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
      alert(t('profile.references.uploadError'));
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
          <CardTitle className="text-lg">{t('profile.references.edit')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDone}>
            {t('profile.references.done')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.references.fullName')} *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder={t('profile.references.fullNamePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">{t('profile.references.relationship')} *</Label>
            <Select
              value={formData.relationship || ''}
              onValueChange={(value) => onFieldChange('relationship', value)}
            >
              <SelectTrigger id="relationship">
                <SelectValue placeholder={t('profile.references.relationshipPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">
                  {t('profile.references.relationshipManager')}
                </SelectItem>
                <SelectItem value="Supervisor">
                  {t('profile.references.relationshipSupervisor')}
                </SelectItem>
                <SelectItem value="Colleague">
                  {t('profile.references.relationshipColleague')}
                </SelectItem>
                <SelectItem value="Team Lead">
                  {t('profile.references.relationshipTeamLead')}
                </SelectItem>
                <SelectItem value="Professor">
                  {t('profile.references.relationshipProfessor')}
                </SelectItem>
                <SelectItem value="Academic Advisor">
                  {t('profile.references.relationshipAdvisor')}
                </SelectItem>
                <SelectItem value="Client">{t('profile.references.relationshipClient')}</SelectItem>
                <SelectItem value="Mentor">{t('profile.references.relationshipMentor')}</SelectItem>
                <SelectItem value="Other">{t('profile.references.relationshipOther')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">{t('profile.references.jobTitle')} *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => onFieldChange('title', e.target.value)}
              placeholder={t('profile.references.jobTitlePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">{t('profile.references.company')} *</Label>
            <Input
              id="company"
              value={formData.company || ''}
              onChange={(e) => onFieldChange('company', e.target.value)}
              placeholder={t('profile.references.companyPlaceholder')}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">{t('profile.references.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder={t('profile.references.emailPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('profile.references.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              placeholder={t('profile.references.phonePlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linked_position">{t('profile.references.linkedWorkExperience')}</Label>
          <Input
            id="linked_position"
            value={formData.linked_position || ''}
            onChange={(e) => onFieldChange('linked_position', e.target.value)}
            placeholder={t('profile.references.linkedWorkPlaceholder')}
          />
          <p className="text-xs text-muted-foreground">{t('profile.references.linkedWorkNote')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quote">{t('profile.references.testimonial')}</Label>
          <Textarea
            id="quote"
            value={formData.quote || ''}
            onChange={(e) => onFieldChange('quote', e.target.value)}
            placeholder={t('profile.references.testimonialPlaceholder')}
            rows={3}
          />
        </div>

        {/* Reference Letter Upload */}
        <div className="space-y-2">
          <Label>{t('profile.references.referenceLetter')}</Label>
          {formData.document_url ? (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <div className="flex-shrink-0">
                {formData.document_name?.toLowerCase().endsWith('.pdf') ? (
                  <FileText className="h-8 w-8 text-red-500" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{formData.document_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formData.document_name?.toLowerCase().endsWith('.pdf')
                    ? t('profile.references.pdfDocument')
                    : t('profile.references.image')}
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
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveDocument}>
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
                <Upload className="mr-2 h-4 w-4" />
                {uploadingFile
                  ? t('profile.photoUpload.uploading')
                  : t('profile.references.uploadButton')}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('profile.references.uploadNote')}
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
  t: (key: string) => string;
}

function ReferenceViewCard({ reference, onEdit, onDelete, disabled, t }: ReferenceViewCardProps) {
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
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
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
              <blockquote className="mt-3 border-l-2 border-muted pl-4 text-sm italic text-muted-foreground">
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
                  {t('profile.references.viewLetter')}
                </a>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled}>
              {t('profile.references.editButton')}
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} disabled={disabled}>
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
    <Card className="rotate-3 cursor-grabbing opacity-80 shadow-xl">
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
