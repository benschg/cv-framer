'use client';

import { Image as ImageIcon,Upload } from 'lucide-react';
import { useRef,useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserPreferences } from '@/contexts/user-preferences-context';
import { useTranslations } from '@/hooks/use-translations';
import { uploadProfilePhoto } from '@/services/profile-photo.service';

import { ImageCropper } from './image-cropper';

interface PhotoUploadProps {
  onUploadComplete: () => void;
  isPrimary?: boolean;
  compact?: boolean;
}

export function PhotoUpload({
  onUploadComplete,
  isPrimary = false,
  compact = false,
}: PhotoUploadProps) {
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('profile.photoUpload.invalidType'));
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('profile.photoUpload.fileTooLarge'));
      return;
    }

    // Read file and show cropper
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedFilename(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setUploading(true);
    setSelectedImage(null);

    try {
      const result = await uploadProfilePhoto(croppedFile, {
        isPrimary,
        width: 800,
        height: 800,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t('profile.photoUpload.uploadSuccess'));
        onUploadComplete();
      }
    } catch (error) {
      toast.error(t('profile.photoUpload.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  if (compact) {
    return (
      <>
        <div
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-2 transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {uploading ? (
            <Upload className="h-4 w-4 animate-pulse text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('profile.photoUpload.dropOrClick')}
              </span>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {selectedImage && (
          <ImageCropper
            image={selectedImage}
            filename={selectedFilename}
            onComplete={handleCropComplete}
            onCancel={() => setSelectedImage(null)}
            open={!!selectedImage}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Card
        className={`cursor-pointer border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          {uploading ? (
            <>
              <Upload className="mb-4 h-12 w-12 animate-pulse text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('profile.photoUpload.uploading')}</p>
            </>
          ) : (
            <>
              <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium">{t('profile.photoUpload.dragDrop')}</p>
              <p className="mb-4 text-xs text-muted-foreground">
                {t('profile.photoUpload.orClick')}
              </p>
              <Button type="button" variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                {t('profile.photoUpload.chooseFile')}
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                {t('profile.photoUpload.helpText')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          filename={selectedFilename}
          onComplete={handleCropComplete}
          onCancel={() => setSelectedImage(null)}
          open={!!selectedImage}
        />
      )}
    </>
  );
}
