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

  // Calculate completion percentage (placeholder - would need actual logic based on content)
  const getCompletionPercentage = (categoryKey: string): number => {
    const entry = entries.find((e) => e.category_key === categoryKey);
    if (!entry) return 0;
    if (entry.is_complete) return 100;
    // TODO: Calculate based on content fields
    return Object.keys(entry.content || {}).length > 0 ? 50 : 0;
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
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
