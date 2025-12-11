'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/hooks/use-translations';
import type { CategoryDefinition, CategoryKey } from '@/types/werbeflaechen.types';
import {
  Target,
  Flame,
  Heart,
  MessageSquare,
  Quote,
  Star,
  Trophy,
  TrendingUp,
  Folder,
  Users,
  Sparkles,
  Palette,
  Brain,
  Wrench,
  Key,
  User,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Flame,
  Heart,
  MessageSquare,
  Quote,
  Star,
  Trophy,
  TrendingUp,
  Folder,
  Users,
  Sparkles,
  Palette,
  Brain,
  Wrench,
  Key,
  User,
  Briefcase,
  GraduationCap,
};

interface CategoryCardProps {
  category: CategoryDefinition;
  language: 'en' | 'de';
  isComplete?: boolean;
  completionPercentage?: number;
  matchScore?: number; // 1-10 score
}

export function CategoryCard({
  category,
  language,
  isComplete = false,
  completionPercentage = 0,
  matchScore,
}: CategoryCardProps) {
  const { t, translations } = useTranslations(language);
  const Icon = iconMap[category.icon] || Target;

  // Get translated title and description from i18n, fallback to category definition
  const categoryKey = category.key as CategoryKey;
  const categoryTranslations = translations.werbeflaechen.categories[categoryKey];
  const title = categoryTranslations?.title || (language === 'de' ? category.de : category.en);
  const description = categoryTranslations?.description || (language === 'de' ? category.description_de : category.description_en);

  return (
    <Link href={`/werbeflaechen/${category.key}`}>
      <Card
        className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: category.color,
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <span style={{ color: category.color }}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              {matchScore !== undefined && matchScore > 0 && (
                <div
                  className="flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: matchScore >= 8 ? '#dcfce7' : matchScore >= 5 ? '#fef9c3' : '#fee2e2',
                    color: matchScore >= 8 ? '#166534' : matchScore >= 5 ? '#854d0e' : '#991b1b',
                  }}
                  title={`Match score: ${matchScore}/10`}
                >
                  {matchScore}/10
                </div>
              )}
              {isComplete && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {t('werbeflaechen.complete')}
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-base group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm line-clamp-2">
            {description}
          </CardDescription>
          {completionPercentage > 0 && !isComplete && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{t('werbeflaechen.progress')}</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${completionPercentage}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
