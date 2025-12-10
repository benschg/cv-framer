'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GridView } from '@/components/werbeflaechen';
import { getAllCategories, getBeginnerCategories } from '@/data/category-metadata';
import { Globe, LayoutGrid, Table2, FlowerIcon } from 'lucide-react';

type ViewMode = 'grid' | 'table' | 'flower';

export default function WerbeflaechenPage() {
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const allCategories = getAllCategories();
  const beginnerCategories = getBeginnerCategories();
  const completedCount = 0; // TODO: Calculate from actual data
  const totalCount = beginnerMode ? beginnerCategories.length : allCategories.length;

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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {completedCount}/{totalCount} {language === 'de' ? 'abgeschlossen' : 'completed'}
          </Badge>
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
      {viewMode === 'grid' && (
        <GridView
          language={language}
          beginnerMode={beginnerMode}
          entries={[]}
        />
      )}
    </div>
  );
}
