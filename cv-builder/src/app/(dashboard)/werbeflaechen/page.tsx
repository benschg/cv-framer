'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GridView } from '@/components/werbeflaechen';
import { getAllCategories, getBeginnerCategories } from '@/data/category-metadata';
import { useTranslations } from '@/hooks/use-translations';
import { Globe, LayoutGrid, Table2, FlowerIcon, Upload, Loader2, Sparkles, CheckCircle, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import type { WerbeflaechenEntry } from '@/types/werbeflaechen.types';

type ViewMode = 'grid' | 'table' | 'flower';

interface UploadedCV {
  id: string;
  filename: string;
  file_type: string;
  created_at: string;
}

export default function WerbeflaechenPage() {
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [entries, setEntries] = useState<WerbeflaechenEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Autofill state
  const [autofillOpen, setAutofillOpen] = useState(false);
  const [cvText, setCvText] = useState('');
  const [autofilling, setAutofilling] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previousUploads, setPreviousUploads] = useState<UploadedCV[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t, translations } = useTranslations(language);

  const allCategories = getAllCategories();
  const beginnerCategories = getBeginnerCategories();
  const completedCount = entries.filter(e => e.is_complete && e.language === language).length;
  const totalCount = beginnerMode ? beginnerCategories.length : allCategories.length;

  // Load entries on mount and when language changes
  useEffect(() => {
    loadEntries();
  }, [language]);

  // Load previous uploads when dialog opens
  useEffect(() => {
    if (autofillOpen) {
      loadPreviousUploads();
    }
  }, [autofillOpen]);

  const loadPreviousUploads = async () => {
    try {
      const response = await fetch('/api/cv-upload');
      if (response.ok) {
        const data = await response.json();
        setPreviousUploads(data.uploads || []);
      }
    } catch (error) {
      console.error('Failed to load previous uploads:', error);
    }
  };

  const loadEntries = async () => {
    try {
      const response = await fetch(`/api/werbeflaechen?language=${language}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cv-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }

      // Set the extracted text from the uploaded file
      setCvText(result.extractedText);
      setUploadedFile(file);
      toast.success(translations.werbeflaechen.autofill.extractedChars
        .replace('{count}', result.charCount)
        .replace('{filename}', file.name));

      // Refresh previous uploads list
      await loadPreviousUploads();
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setCvText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAutofill = async () => {
    if (!cvText.trim() || cvText.trim().length < 50) {
      toast.error(translations.werbeflaechen.autofill.minCharsError);
      return;
    }

    setAutofilling(true);
    try {
      const response = await fetch('/api/werbeflaechen/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: cvText.trim(),
          language,
          overwrite: overwriteExisting,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process CV');
      }

      toast.success(translations.werbeflaechen.autofill.successMessage
        .replace('{count}', result.savedCategories.length));
      setAutofillOpen(false);
      setCvText('');
      setUploadedFile(null);

      // Reload entries
      await loadEntries();
    } catch (error) {
      console.error('Autofill error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process CV');
    } finally {
      setAutofilling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('werbeflaechen.title')}</h1>
          <p className="text-muted-foreground">
            {t('werbeflaechen.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {completedCount}/{totalCount} {t('werbeflaechen.completed')}
          </Badge>

          {/* Autofill from CV Button */}
          <Dialog open={autofillOpen} onOpenChange={setAutofillOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t('werbeflaechen.autofillFromCV')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {translations.werbeflaechen.autofill.title}
                </DialogTitle>
                <DialogDescription>
                  {translations.werbeflaechen.autofill.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label>
                    {translations.werbeflaechen.autofill.uploadLabel}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="cv-file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {translations.werbeflaechen.autofill.uploading}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {translations.werbeflaechen.autofill.chooseFile}
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {translations.werbeflaechen.autofill.fileTypes}
                    </span>
                  </div>

                  {uploadedFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearUploadedFile}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Previous Uploads */}
                  {previousUploads.length > 0 && !uploadedFile && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        {translations.werbeflaechen.autofill.previousUploads}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {previousUploads.slice(0, 3).map((upload) => (
                          <Button
                            key={upload.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              // Fetch the extracted text from a previous upload
                              try {
                                const response = await fetch(`/api/cv-upload/${upload.id}`);
                                if (response.ok) {
                                  const data = await response.json();
                                  setCvText(data.extractedText || '');
                                  toast.success(translations.werbeflaechen.autofill.loadedFromFile
                                    .replace('{filename}', upload.filename));
                                }
                              } catch {
                                toast.error(translations.werbeflaechen.autofill.loadError);
                              }
                            }}
                            className="gap-1 text-xs"
                          >
                            <FileText className="h-3 w-3" />
                            {upload.filename.length > 20
                              ? upload.filename.slice(0, 17) + '...'
                              : upload.filename}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {translations.werbeflaechen.autofill.orPasteText}
                    </span>
                  </div>
                </div>

                {/* Text Input Section */}
                <div className="space-y-2">
                  <Label htmlFor="cv-text">
                    {translations.werbeflaechen.autofill.textLabel}
                  </Label>
                  <Textarea
                    id="cv-text"
                    placeholder={translations.werbeflaechen.autofill.textPlaceholder}
                    value={cvText}
                    onChange={(e) => {
                      setCvText(e.target.value);
                      // Clear uploaded file if user starts typing
                      if (uploadedFile && e.target.value !== cvText) {
                        setUploadedFile(null);
                      }
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    rows={10}
                    className="font-mono text-sm resize-y"
                  />
                  <p className="text-xs text-muted-foreground">
                    {cvText.length} {translations.werbeflaechen.autofill.characters}
                    {cvText.length > 0 && cvText.length < 50 && (
                      <span className="text-destructive ml-2">
                        ({translations.werbeflaechen.autofill.minRequired})
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="overwrite"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="overwrite" className="text-sm font-normal cursor-pointer">
                    {translations.werbeflaechen.autofill.overwriteExisting}
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAutofillOpen(false);
                      setCvText('');
                      setUploadedFile(null);
                    }}
                    disabled={autofilling || uploading}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleAutofill}
                    disabled={autofilling || uploading || cvText.trim().length < 50}
                    className="gap-2"
                  >
                    {autofilling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {translations.werbeflaechen.autofill.analyzing}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        {translations.werbeflaechen.autofill.extractAndSave}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('werbeflaechen.view')}:
          </span>
          <div className="flex rounded-lg border p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-7 px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-7 px-2"
              disabled
              title="Coming soon"
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'flower' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('flower')}
              className="h-7 px-2"
              disabled
              title="Coming soon"
            >
              <FlowerIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Beginner mode toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={beginnerMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBeginnerMode(true)}
            >
              {t('werbeflaechen.beginnerMode')}
            </Button>
            <Button
              variant={!beginnerMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBeginnerMode(false)}
            >
              {t('werbeflaechen.allCategories')} (18)
            </Button>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-2 border-l pl-4">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border p-1">
              <Button
                variant={language === 'en' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="h-7 px-2"
              >
                EN
              </Button>
              <Button
                variant={language === 'de' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('de')}
                className="h-7 px-2"
              >
                DE
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === 'grid' && (
        <GridView
          language={language}
          beginnerMode={beginnerMode}
          entries={entries}
        />
      )}
    </div>
  );
}
