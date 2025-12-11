'use client';

import { CategoryCard } from './category-card';
import { getCategoriesByRow, ROW_METADATA, getBeginnerCategories } from '@/data/category-metadata';
import { useTranslations } from '@/hooks/use-translations';
import type { CategoryDefinition, RowNumber, WerbeflaechenEntry } from '@/types/werbeflaechen.types';

interface GridViewProps {
  language: 'en' | 'de';
  entries?: WerbeflaechenEntry[];
  beginnerMode?: boolean;
}

export function GridView({ language, entries = [], beginnerMode = false }: GridViewProps) {
  const { translations } = useTranslations(language);
  const rows: RowNumber[] = [1, 2, 3];

  // Get categories based on mode
  const getVisibleCategories = (row: RowNumber): CategoryDefinition[] => {
    const allRowCategories = getCategoriesByRow(row);
    if (!beginnerMode) return allRowCategories;

    const beginnerCategories = getBeginnerCategories();
    return allRowCategories.filter((cat) =>
      beginnerCategories.some((bc) => bc.key === cat.key)
    );
  };

  // Check if a category is complete
  const isCategoryComplete = (categoryKey: string): boolean => {
    const entry = entries.find((e) => e.category_key === categoryKey);
    return entry?.is_complete ?? false;
  };

  // Calculate completion percentage based on content fields
  const getCompletionPercentage = (categoryKey: string): number => {
    const entry = entries.find((e) => e.category_key === categoryKey);
    if (!entry) return 0;
    if (entry.is_complete) return 100;

    const content = entry.content || {};
    const contentValues = Object.values(content).filter(
      (val) => val !== null && val !== undefined && val !== ''
    );

    // Estimate based on number of filled fields (assume ~5 fields per category)
    const estimatedFields = 5;
    return Math.min(Math.round((contentValues.length / estimatedFields) * 100), 99);
  };

  // Calculate match score (1-10) based on content completeness
  const getMatchScore = (categoryKey: string): number => {
    const entry = entries.find((e) => e.category_key === categoryKey);
    if (!entry) return 0;
    if (entry.is_complete) return 10;

    const content = entry.content || {};
    const contentValues = Object.values(content).filter(
      (val) => val !== null && val !== undefined && val !== ''
    );

    if (contentValues.length === 0) return 0;

    // Calculate score based on filled content
    // More fields filled = higher score, text length also matters
    const totalTextLength = contentValues.reduce((sum: number, val) => {
      if (typeof val === 'string') return sum + val.length;
      if (Array.isArray(val)) return sum + val.join('').length;
      return sum;
    }, 0);

    // Base score from number of fields (max 5 points)
    const fieldScore = Math.min(contentValues.length, 5);

    // Bonus points for content depth (max 5 points)
    // 50 chars = 1 point, up to 250+ chars for 5 points
    const depthScore = Math.min(Math.floor(totalTextLength / 50), 5);

    return Math.min(fieldScore + depthScore, 10);
  };

  return (
    <div className="space-y-8">
      {rows.map((row) => {
        const categories = getVisibleCategories(row);
        if (categories.length === 0) return null;

        const rowMeta = ROW_METADATA[row];
        const rowTitle = language === 'de' ? rowMeta.de : rowMeta.en;
        const rowKey = row.toString() as '1' | '2' | '3';
        const rowQuestion = translations.werbeflaechen.rows[rowKey];

        return (
          <section key={row} className="space-y-4">
            <div className="border-b pb-2">
              <h2 className="text-xl font-semibold">{rowTitle}</h2>
              <p className="text-sm text-muted-foreground italic">{rowQuestion}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.key}
                  category={category}
                  language={language}
                  isComplete={isCategoryComplete(category.key)}
                  completionPercentage={getCompletionPercentage(category.key)}
                  matchScore={getMatchScore(category.key)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
