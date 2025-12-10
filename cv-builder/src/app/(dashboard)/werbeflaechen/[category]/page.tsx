'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getCategoryByKey, ROW_METADATA } from '@/data/category-metadata';
import type { CategoryKey, CategoryDefinition } from '@/types/werbeflaechen.types';
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
  Plus,
  Trash2,
  Globe,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target, Flame, Heart, MessageSquare, Quote, Star, Trophy, TrendingUp,
  Folder, Users, Sparkles, Palette, Brain, Wrench, Key, User, Briefcase, GraduationCap,
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryKey = params.category as CategoryKey;

  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [content, setContent] = useState<Record<string, unknown>>({});

  // Get category metadata
  const category = getCategoryByKey(categoryKey);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link href="/werbeflaechen">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Werbeflaechen
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = iconMap[category.icon] || Target;
  const title = language === 'de' ? category.de : category.en;
  const description = language === 'de' ? category.description_de : category.description_en;
  const rowMeta = ROW_METADATA[category.row];
  const rowQuestion = language === 'de' ? rowMeta.de : rowMeta.en;

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/werbeflaechen">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {language === 'de' ? 'Zurück' : 'Back'}
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
                  {language === 'de' ? `Reihe ${category.row}` : `Row ${category.row}`}
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

      {/* Form Card */}
      <Card>
        <CardContent className="pt-6">
          {renderCategoryForm(categoryKey, language, content, setContent)}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {isSaved && (
            <span className="text-sm text-green-600">
              {language === 'de' ? 'Änderungen gespeichert!' : 'Changes saved!'}
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === 'de' ? 'Speichern...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {language === 'de' ? 'Speichern' : 'Save'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Render form based on category type
function renderCategoryForm(
  categoryKey: CategoryKey,
  language: 'en' | 'de',
  content: Record<string, unknown>,
  setContent: (content: Record<string, unknown>) => void
) {
  const updateField = (field: string, value: unknown) => {
    setContent({ ...content, [field]: value });
  };

  switch (categoryKey) {
    case 'kurzprofil':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="professionalTitle">
              {language === 'de' ? 'Berufsbezeichnung' : 'Professional Title'}
            </Label>
            <Input
              id="professionalTitle"
              placeholder={language === 'de' ? 'z.B. Senior Software Engineer' : 'e.g., Senior Software Engineer'}
              value={(content.professionalTitle as string) || ''}
              onChange={(e) => updateField('professionalTitle', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearsExperience">
              {language === 'de' ? 'Jahre Berufserfahrung' : 'Years of Experience'}
            </Label>
            <Input
              id="yearsExperience"
              type="number"
              placeholder="10"
              value={(content.yearsExperience as number) || ''}
              onChange={(e) => updateField('yearsExperience', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">
              {language === 'de' ? 'Zusammenfassung' : 'Summary'}
            </Label>
            <Textarea
              id="summary"
              placeholder={language === 'de'
                ? 'Schreiben Sie eine kurze Zusammenfassung Ihres beruflichen Profils...'
                : 'Write a brief summary of your professional profile...'}
              rows={5}
              value={(content.summary as string) || ''}
              onChange={(e) => updateField('summary', e.target.value)}
            />
          </div>
        </div>
      );

    case 'vision_mission':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vision">
              {language === 'de' ? 'Ihre Vision' : 'Your Vision'}
            </Label>
            <Textarea
              id="vision"
              placeholder={language === 'de'
                ? 'Wo sehen Sie sich in 5-10 Jahren?'
                : 'Where do you see yourself in 5-10 years?'}
              rows={4}
              value={(content.vision as string) || ''}
              onChange={(e) => updateField('vision', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mission">
              {language === 'de' ? 'Ihre Mission' : 'Your Mission'}
            </Label>
            <Textarea
              id="mission"
              placeholder={language === 'de'
                ? 'Was ist Ihr beruflicher Auftrag?'
                : 'What is your professional mission?'}
              rows={4}
              value={(content.mission as string) || ''}
              onChange={(e) => updateField('mission', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">
              {language === 'de' ? 'Ihr Zweck' : 'Your Purpose'}
            </Label>
            <Textarea
              id="purpose"
              placeholder={language === 'de'
                ? 'Warum tun Sie, was Sie tun?'
                : 'Why do you do what you do?'}
              rows={3}
              value={(content.purpose as string) || ''}
              onChange={(e) => updateField('purpose', e.target.value)}
            />
          </div>
        </div>
      );

    case 'motivation':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatDrivesYou">
              {language === 'de' ? 'Was treibt Sie an?' : 'What drives you?'}
            </Label>
            <Textarea
              id="whatDrivesYou"
              placeholder={language === 'de'
                ? 'Beschreiben Sie, was Sie jeden Tag motiviert...'
                : 'Describe what motivates you every day...'}
              rows={4}
              value={(content.whatDrivesYou as string) || ''}
              onChange={(e) => updateField('whatDrivesYou', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whyThisField">
              {language === 'de' ? 'Warum dieses Berufsfeld?' : 'Why this field?'}
            </Label>
            <Textarea
              id="whyThisField"
              placeholder={language === 'de'
                ? 'Warum haben Sie sich für dieses Berufsfeld entschieden?'
                : 'Why did you choose this professional field?'}
              rows={4}
              value={(content.whyThisField as string) || ''}
              onChange={(e) => updateField('whyThisField', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careerGoals">
              {language === 'de' ? 'Karriereziele' : 'Career Goals'}
            </Label>
            <Textarea
              id="careerGoals"
              placeholder={language === 'de'
                ? 'Was sind Ihre kurzfristigen und langfristigen Karriereziele?'
                : 'What are your short-term and long-term career goals?'}
              rows={4}
              value={(content.careerGoals as string) || ''}
              onChange={(e) => updateField('careerGoals', e.target.value)}
            />
          </div>
        </div>
      );

    case 'slogan':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slogan">
              {language === 'de' ? 'Ihr Slogan' : 'Your Slogan'}
            </Label>
            <Input
              id="slogan"
              placeholder={language === 'de'
                ? 'Ein prägnanter Satz, der Sie beschreibt'
                : 'A concise sentence that describes you'}
              value={(content.slogan as string) || ''}
              onChange={(e) => updateField('slogan', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {language === 'de'
                ? 'Kurz und einprägsam - wird als Tagline in Ihrem CV verwendet'
                : 'Short and memorable - used as a tagline in your CV'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">
              {language === 'de' ? 'Alternative Tagline' : 'Alternative Tagline'}
            </Label>
            <Input
              id="tagline"
              placeholder={language === 'de'
                ? 'Eine alternative Version Ihres Slogans'
                : 'An alternative version of your slogan'}
              value={(content.tagline as string) || ''}
              onChange={(e) => updateField('tagline', e.target.value)}
            />
          </div>
        </div>
      );

    // Default form for categories without specific forms yet
    default:
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">
              {language === 'de' ? 'Notizen' : 'Notes'}
            </Label>
            <Textarea
              id="notes"
              placeholder={language === 'de'
                ? 'Fügen Sie hier Ihre Notizen und Inhalte hinzu...'
                : 'Add your notes and content here...'}
              rows={6}
              value={(content.notes as string) || ''}
              onChange={(e) => updateField('notes', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {language === 'de'
                ? 'Spezifische Formularfelder für diese Kategorie werden bald verfügbar sein'
                : 'Specific form fields for this category will be available soon'}
            </p>
          </div>
        </div>
      );
  }
}
