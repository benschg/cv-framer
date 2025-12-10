'use client';

import { useState, useEffect } from 'react';
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
import { Globe, LayoutGrid, Table2, FlowerIcon, Upload, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { WerbeflaechenEntry } from '@/types/werbeflaechen.types';

type ViewMode = 'grid' | 'table' | 'flower';

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

  const allCategories = getAllCategories();
  const beginnerCategories = getBeginnerCategories();
  const completedCount = entries.filter(e => e.is_complete && e.language === language).length;
  const totalCount = beginnerMode ? beginnerCategories.length : allCategories.length;

  // Load entries on mount and when language changes
  useEffect(() => {
    loadEntries();
  }, [language]);

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

  const handleAutofill = async () => {
    if (!cvText.trim() || cvText.trim().length < 50) {
      toast.error('Please paste your CV text (minimum 50 characters)');
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

      toast.success(`Populated ${result.savedCategories.length} categories from your CV!`);
      setAutofillOpen(false);
      setCvText('');

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
          <h1 className="text-3xl font-bold tracking-tight">Werbeflaechen</h1>
          <p className="text-muted-foreground">
            {language === 'de'
              ? 'Ihr Selbstvermarktungs-Framework - die Grundlage für großartige Lebensläufe'
              : 'Your self-marketing framework - the foundation for great CVs'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {completedCount}/{totalCount} {language === 'de' ? 'abgeschlossen' : 'completed'}
          </Badge>

          {/* Autofill from CV Button */}
          <Dialog open={autofillOpen} onOpenChange={setAutofillOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {language === 'de' ? 'Aus Lebenslauf befüllen' : 'Fill from CV'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {language === 'de' ? 'Werbeflaechen aus Lebenslauf befüllen' : 'Auto-fill from CV'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'de'
                    ? 'Fügen Sie Ihren bestehenden Lebenslauf ein, und wir extrahieren die relevanten Informationen in Ihre Werbeflaechen-Kategorien.'
                    : 'Paste your existing CV/resume text and we\'ll extract relevant information into your Werbeflaechen categories.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="cv-text">
                    {language === 'de' ? 'Lebenslauf-Text' : 'CV/Resume Text'}
                  </Label>
                  <Textarea
                    id="cv-text"
                    placeholder={language === 'de'
                      ? 'Fügen Sie hier Ihren Lebenslauf ein...'
                      : 'Paste your CV/resume text here...'}
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {cvText.length} {language === 'de' ? 'Zeichen' : 'characters'}
                    {cvText.length > 0 && cvText.length < 50 && (
                      <span className="text-destructive ml-2">
                        ({language === 'de' ? 'Mindestens 50 erforderlich' : 'Minimum 50 required'})
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
                    {language === 'de'
                      ? 'Bestehende Einträge überschreiben'
                      : 'Overwrite existing entries'}
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setAutofillOpen(false)}
                    disabled={autofilling}
                  >
                    {language === 'de' ? 'Abbrechen' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleAutofill}
                    disabled={autofilling || cvText.trim().length < 50}
                    className="gap-2"
                  >
                    {autofilling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {language === 'de' ? 'Analysiere...' : 'Analyzing...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        {language === 'de' ? 'Extrahieren & Speichern' : 'Extract & Save'}
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
            {language === 'de' ? 'Ansicht:' : 'View:'}
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
              {language === 'de' ? 'Anfänger' : 'Beginner'}
            </Button>
            <Button
              variant={!beginnerMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBeginnerMode(false)}
            >
              {language === 'de' ? 'Alle' : 'All'} (18)
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
