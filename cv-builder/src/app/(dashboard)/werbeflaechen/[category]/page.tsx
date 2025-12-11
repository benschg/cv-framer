'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getCategoryByKey } from '@/data/category-metadata';
import { useCategoryEntry } from '@/hooks/use-werbeflaechen';
import { useTranslations } from '@/hooks/use-translations';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CategoryKey } from '@/types/werbeflaechen.types';
import {
  ArrowLeft,
  Save,
  Loader2,
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
  Globe,
  Info,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, Flame, Heart, MessageSquare, Quote, Star, Trophy, TrendingUp,
  Folder, Users, Sparkles, Palette, Brain, Wrench, Key, User, Briefcase, GraduationCap,
};

export default function CategoryPage() {
  const params = useParams();
  const categoryKey = params.category as CategoryKey;

  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [isSaved, setIsSaved] = useState(false);

  const { t, translations } = useTranslations(language);
  const { entry, loading, error, save } = useCategoryEntry(categoryKey, { language });

  useEffect(() => {
    if (entry?.content) {
      setContent(entry.content as Record<string, unknown>);
    }
  }, [entry]);

  const category = getCategoryByKey(categoryKey);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h1 className="text-2xl font-bold">{t('werbeflaechen.categoryNotFound')}</h1>
        <Link href="/werbeflaechen">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = iconMap[category.icon] || Target;
  const categoryTranslations = translations.werbeflaechen.categories[categoryKey];
  const title = categoryTranslations?.title || category.en;
  const description = categoryTranslations?.description || category.description_en;
  const rowQuestion = t(`werbeflaechen.rows.${category.row}`);

  const aiReasoning = (entry?.ai_reasoning as Record<string, string>) || {};
  const cvCoverage = entry?.cv_coverage;
  const fitReasoning = entry?.fit_reasoning;

  const handleSave = async () => {
    const result = await save(content, true);
    if (result.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/werbeflaechen">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div className="flex items-center gap-2">
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

      {/* Header Card */}
      <Card style={{ borderLeftWidth: '4px', borderLeftColor: category.color }}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <span style={{ color: category.color }}>
                <Icon className="h-6 w-6" />
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle>{title}</CardTitle>
                <Badge
                  variant="outline"
                  style={{ borderColor: category.color, color: category.color }}
                >
                  {t('werbeflaechen.row')} {category.row}
                </Badge>
              </div>
              <CardDescription>{description}</CardDescription>
              <p className="text-xs text-muted-foreground mt-1 italic">
                {rowQuestion}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* CV Coverage Card */}
      {cvCoverage !== undefined && cvCoverage !== null && (
        <TooltipProvider>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {t('werbeflaechen.cvCoverage')}
                {fitReasoning && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">{fitReasoning}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress value={cvCoverage * 10} className="flex-1" />
                <span className="text-sm font-medium w-12 text-right">{cvCoverage}/10</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {cvCoverage >= 8
                  ? t('werbeflaechen.excellentCoverage')
                  : cvCoverage >= 5
                  ? t('werbeflaechen.goodCoverage')
                  : t('werbeflaechen.moreDetailsRecommended')}
              </p>
            </CardContent>
          </Card>
        </TooltipProvider>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Form Card */}
      <Card>
        <CardContent className="pt-6">
          <TooltipProvider>
            <CategoryForm
              categoryKey={categoryKey}
              content={content}
              setContent={setContent}
              aiReasoning={aiReasoning}
              t={t}
              translations={translations}
            />
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {isSaved && (
            <span className="text-sm text-green-600">
              {t('common.changesSaved')}
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t('common.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function FieldWithReasoning({
  fieldId,
  label,
  reasoning,
  children,
}: {
  fieldId: string;
  label: string;
  reasoning?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={fieldId}>{label}</Label>
        {reasoning && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-blue-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">{reasoning}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

interface CategoryFormProps {
  categoryKey: CategoryKey;
  content: Record<string, unknown>;
  setContent: (content: Record<string, unknown>) => void;
  aiReasoning: Record<string, string>;
  t: (path: string) => string;
  translations: ReturnType<typeof useTranslations>['translations'];
}

function CategoryForm({ categoryKey, content, setContent, aiReasoning, t, translations }: CategoryFormProps) {
  const updateField = (field: string, value: unknown) => {
    setContent({ ...content, [field]: value });
  };

  const fields = translations.werbeflaechen.fields;
  const placeholders = translations.werbeflaechen.placeholders;
  const hints = translations.werbeflaechen.hints;

  switch (categoryKey) {
    case 'kurzprofil':
      return (
        <div className="space-y-4">
          <FieldWithReasoning
            fieldId="professionalTitle"
            label={fields.professionalTitle}
            reasoning={aiReasoning.professionalTitle}
          >
            <Input
              id="professionalTitle"
              placeholder={placeholders.professionalTitle}
              value={(content.professionalTitle as string) || ''}
              onChange={(e) => updateField('professionalTitle', e.target.value)}
            />
          </FieldWithReasoning>
          <FieldWithReasoning
            fieldId="yearsExperience"
            label={fields.yearsExperience}
            reasoning={aiReasoning.yearsExperience}
          >
            <Input
              id="yearsExperience"
              type="number"
              placeholder={placeholders.yearsExperience}
              value={(content.yearsExperience as number) || ''}
              onChange={(e) => updateField('yearsExperience', parseInt(e.target.value) || 0)}
            />
          </FieldWithReasoning>
          <FieldWithReasoning
            fieldId="summary"
            label={fields.summary}
            reasoning={aiReasoning.summary}
          >
            <Textarea
              id="summary"
              placeholder={placeholders.summary}
              rows={5}
              value={(content.summary as string) || ''}
              onChange={(e) => updateField('summary', e.target.value)}
            />
          </FieldWithReasoning>
        </div>
      );

    case 'vision_mission':
      return (
        <div className="space-y-4">
          <FieldWithReasoning
            fieldId="vision"
            label={fields.vision}
            reasoning={aiReasoning.vision}
          >
            <Textarea
              id="vision"
              placeholder={placeholders.vision}
              rows={4}
              value={(content.vision as string) || ''}
              onChange={(e) => updateField('vision', e.target.value)}
            />
          </FieldWithReasoning>
          <FieldWithReasoning
            fieldId="mission"
            label={fields.mission}
            reasoning={aiReasoning.mission}
          >
            <Textarea
              id="mission"
              placeholder={placeholders.mission}
              rows={4}
              value={(content.mission as string) || ''}
              onChange={(e) => updateField('mission', e.target.value)}
            />
          </FieldWithReasoning>
          <FieldWithReasoning
            fieldId="purpose"
            label={fields.purpose}
            reasoning={aiReasoning.purpose}
          >
            <Textarea
              id="purpose"
              placeholder={placeholders.purpose}
              rows={3}
              value={(content.purpose as string) || ''}
              onChange={(e) => updateField('purpose', e.target.value)}
            />
          </FieldWithReasoning>
        </div>
      );

    case 'motivation':
      return (
        <div className="space-y-4">
          <FieldWithReasoning
            fieldId="whatDrivesYou"
            label={fields.whatDrivesYou}
            reasoning={aiReasoning.whatDrivesYou}
          >
            <Textarea
              id="whatDrivesYou"
              placeholder={placeholders.whatDrivesYou}
              rows={4}
              value={(content.whatDrivesYou as string) || ''}
              onChange={(e) => updateField('whatDrivesYou', e.target.value)}
            />
          </FieldWithReasoning>
          <FieldWithReasoning
            fieldId="whyThisField"
            label={fields.whyThisField}
            reasoning={aiReasoning.whyThisField}
          >
            <Textarea
              id="whyThisField"
              placeholder={placeholders.whyThisField}
              rows={4}
              value={(content.whyThisField as string) || ''}
              onChange={(e) => updateField('whyThisField', e.target.value)}
            />
          </FieldWithReasoning>
          <FieldWithReasoning
            fieldId="careerGoals"
            label={fields.careerGoals}
            reasoning={aiReasoning.careerGoals}
          >
            <Textarea
              id="careerGoals"
              placeholder={placeholders.careerGoals}
              rows={4}
              value={(content.careerGoals as string) || ''}
              onChange={(e) => updateField('careerGoals', e.target.value)}
            />
          </FieldWithReasoning>
        </div>
      );

    case 'slogan':
      return (
        <div className="space-y-4">
          <FieldWithReasoning
            fieldId="slogan"
            label={fields.slogan}
            reasoning={aiReasoning.slogan}
          >
            <Input
              id="slogan"
              placeholder={placeholders.slogan}
              value={(content.slogan as string) || ''}
              onChange={(e) => updateField('slogan', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{hints.slogan}</p>
          </FieldWithReasoning>
          <FieldWithReasoning
            fieldId="tagline"
            label={fields.tagline}
            reasoning={aiReasoning.tagline}
          >
            <Input
              id="tagline"
              placeholder={placeholders.tagline}
              value={(content.tagline as string) || ''}
              onChange={(e) => updateField('tagline', e.target.value)}
            />
          </FieldWithReasoning>
        </div>
      );

    default:
      return (
        <div className="space-y-4">
          <FieldWithReasoning
            fieldId="notes"
            label={fields.notes}
            reasoning={aiReasoning.notes}
          >
            <Textarea
              id="notes"
              placeholder={placeholders.notes}
              rows={6}
              value={(content.notes as string) || ''}
              onChange={(e) => updateField('notes', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{hints.defaultForm}</p>
          </FieldWithReasoning>
        </div>
      );
  }
}
