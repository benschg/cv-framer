'use client';

import { AlertTriangle, ExternalLink, FileText, Loader2, Trash2 } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { useProfileManager } from '@/hooks/use-profile-manager';
import { formatMonthYear } from '@/lib/utils';
import {
  createCertification,
  deleteCertification,
  fetchCertifications,
  type ProfileCertification,
  updateCertification,
} from '@/services/profile-career.service';

import { CertificationDocumentsManager } from './certification-documents-manager';
import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';

interface CertificationsManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface CertificationsManagerRef {
  handleAdd: () => void;
  handleAddWithData: (data: Partial<ProfileCertification>, file?: File) => Promise<void>;
}

export const CertificationsManager = forwardRef<
  CertificationsManagerRef,
  CertificationsManagerProps
>(({ onSavingChange, onSaveSuccessChange }, ref) => {
  const { t } = useAppTranslation();
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
    createItem: (item) =>
      createCertification(
        item as Omit<ProfileCertification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
      ),
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

  const handleAddWithData = async (data: Partial<ProfileCertification>, file?: File) => {
    try {
      const result = await createCertification(
        data as Omit<ProfileCertification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
      );
      if (result.error) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Creation failed');
      }

      const certificationId = result.data?.id;
      const certificationName = result.data?.name || 'Certification';

      // If a file was provided, upload it to the newly created certification
      if (file && certificationId) {
        toast.loading(t('profile.certifications.uploadingDocument'), { id: 'cert-upload' });

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('certification_id', certificationId);

        const uploadResponse = await fetch('/api/certification-documents/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          console.error('Error uploading document:', uploadResult.error);
          toast.error(t('profile.certifications.uploadFailed'), {
            id: 'cert-upload',
            description: t('profile.certifications.uploadFailedDescription'),
          });
        } else {
          toast.success(t('profile.certifications.addedSuccess'), {
            id: 'cert-upload',
            description: `${certificationName} with ${file.name}`,
          });
        }
      }

      // Manually refresh the list
      const { data: refreshedData } = await fetchCertifications();
      if (refreshedData) {
        // Small delay to show the success toast before reload
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
          <SortableCard id={certification.id} disabled={false} showDragHandle={!expanded}>
            {expanded ? (
              <CertificationEditForm
                formData={formData}
                onFieldChange={(field, value) => handleFieldChange(certification.id, field, value)}
                onMultiFieldChange={(updates) => handleMultiFieldChange(certification.id, updates)}
                onDone={() => handleDone(certification.id)}
                isSaving={saving}
                t={t}
              />
            ) : (
              <CertificationViewCard
                certification={certification}
                onEdit={() => handleEdit(certification)}
                onDelete={() => handleDelete(certification.id)}
                disabled={saving}
                t={t}
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
            <p>{t('profile.certifications.empty')}</p>
            <p className="mt-1 text-sm">{t('profile.certifications.emptyAction')}</p>
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
  onFieldChange: (field: keyof ProfileCertification, value: string | boolean) => void;
  onMultiFieldChange: (updates: Partial<ProfileCertification>) => void;
  onDone: () => void;
  isSaving?: boolean;
  t: (key: string) => string;
}

function CertificationEditForm({
  formData,
  onFieldChange,
  onMultiFieldChange: _onMultiFieldChange,
  onDone,
  isSaving = false,
  t,
}: CertificationEditFormProps) {
  // Check if expiry date is before issue date
  const isExpiryBeforeIssue = (() => {
    if (!formData.date || !formData.expiry_date) return false;
    return formData.expiry_date < formData.date;
  })();

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('profile.certifications.edit')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDone}>
            {t('profile.certifications.done')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.certifications.name')} *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder={t('profile.certifications.namePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issuer">{t('profile.certifications.organization')} *</Label>
            <Input
              id="issuer"
              value={formData.issuer || ''}
              onChange={(e) => onFieldChange('issuer', e.target.value)}
              placeholder={t('profile.certifications.organizationPlaceholder')}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('profile.certifications.issueDate')}</Label>
            <MonthYearPicker
              value={formData.date || ''}
              onChange={(value) => onFieldChange('date', value)}
              placeholder={t('profile.certifications.issueDatePlaceholder')}
              showFutureWarning
            />
          </div>
          <div className="space-y-2">
            <Label>{t('profile.certifications.expiryDate')}</Label>
            <MonthYearPicker
              value={formData.expiry_date || ''}
              onChange={(value) => onFieldChange('expiry_date', value)}
              placeholder={t('profile.certifications.expiryDatePlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('profile.certifications.expiryNote')}
            </p>
          </div>
        </div>

        {isExpiryBeforeIssue && (
          <p className="flex items-center gap-1 text-sm text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            {t('profile.certifications.expiryDateError')}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="credential_id">{t('profile.certifications.credentialId')}</Label>
          <Input
            id="credential_id"
            value={formData.credential_id || ''}
            onChange={(e) => onFieldChange('credential_id', e.target.value)}
            placeholder={t('profile.certifications.credentialIdPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">{t('profile.certifications.verificationUrl')}</Label>
          <Input
            id="url"
            type="url"
            value={formData.url || ''}
            onChange={(e) => onFieldChange('url', e.target.value)}
            placeholder={t('profile.certifications.verificationUrlPlaceholder')}
          />
        </div>

        {/* Certificate Documents */}
        {formData.id && (
          <div className="space-y-2">
            <Label>{t('profile.certifications.documents')}</Label>
            <CertificationDocumentsManager certificationId={formData.id} disabled={isSaving} />
          </div>
        )}
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
  t: (key: string) => string;
}

function CertificationViewCard({
  certification,
  onEdit,
  onDelete,
  disabled,
  t,
}: CertificationViewCardProps) {
  const [showDocuments, setShowDocuments] = useState(false);

  return (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{certification.name}</CardTitle>
            <CardDescription>{certification.issuer}</CardDescription>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {certification.date && (
                <span>
                  {t('profile.certifications.issued')} {formatMonthYear(certification.date)}
                </span>
              )}
              {certification.expiry_date && (
                <span>
                  • {t('profile.certifications.expires')}{' '}
                  {formatMonthYear(certification.expiry_date)}
                </span>
              )}
              {certification.credential_id && (
                <span>
                  • {t('profile.certifications.id')}: {certification.credential_id}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {certification.url && (
                <a
                  href={certification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {t('profile.certifications.verifyCredential')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setShowDocuments(!showDocuments)}
                className="h-auto p-0 text-sm"
              >
                <FileText className="mr-1 h-3 w-3" />
                {showDocuments
                  ? t('profile.certifications.hideDocuments')
                  : t('profile.certifications.viewDocuments')}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled}>
              {t('profile.certifications.editButton')}
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} disabled={disabled}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {showDocuments && (
        <CardContent>
          <CertificationDocumentsManager certificationId={certification.id} disabled={disabled} />
        </CardContent>
      )}
    </>
  );
}

// Overlay component shown while dragging
function CertificationCardOverlay({ certification }: { certification: ProfileCertification }) {
  return (
    <Card className="rotate-3 cursor-grabbing opacity-80 shadow-xl">
      <CardHeader>
        <div>
          <CardTitle>{certification.name}</CardTitle>
          <CardDescription>{certification.issuer}</CardDescription>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            {certification.date && <span>Issued {formatMonthYear(certification.date)}</span>}
            {certification.expiry_date && (
              <span>• Expires {formatMonthYear(certification.expiry_date)}</span>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
