'use client';

import { Compass, Eye, Flame, GitMerge, Heart, Lightbulb, Target, X, Zap } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppTranslation } from '@/hooks/use-app-translation';
import type { ProfileMotivationVision } from '@/types/profile-career.types';

interface MotivationVisionFormProps {
  formData: Partial<ProfileMotivationVision>;
  onChange: (field: string, value: string | string[]) => void;
}

export function MotivationVisionForm({ formData, onChange }: MotivationVisionFormProps) {
  const { t } = useAppTranslation();
  const [passionInput, setPassionInput] = useState('');

  const handleTextChange = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(field, e.target.value);
  };

  const handleAddPassion = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && passionInput.trim()) {
      e.preventDefault();
      const currentPassions = formData.passions || [];
      if (!currentPassions.includes(passionInput.trim())) {
        onChange('passions', [...currentPassions, passionInput.trim()]);
      }
      setPassionInput('');
    }
  };

  const handleRemovePassion = (passionToRemove: string) => {
    const currentPassions = formData.passions || [];
    onChange(
      'passions',
      currentPassions.filter((p) => p !== passionToRemove)
    );
  };

  return (
    <div className="space-y-6">
      {/* Vision, Mission, Purpose */}
      <Card>
        <CardHeader>
          <CardTitle>Vision, Mission & Purpose</CardTitle>
          <CardDescription>Define your professional direction and long-term goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vision" className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              {t('profile.motivationVision.visionTitle')}
            </Label>
            <Textarea
              id="vision"
              value={formData.vision || ''}
              onChange={handleTextChange('vision')}
              placeholder={t('profile.motivationVision.visionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission" className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-muted-foreground" />
              {t('profile.motivationVision.missionTitle')}
            </Label>
            <Textarea
              id="mission"
              value={formData.mission || ''}
              onChange={handleTextChange('mission')}
              placeholder={t('profile.motivationVision.missionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              {t('profile.motivationVision.purposeTitle')}
            </Label>
            <Textarea
              id="purpose"
              value={formData.purpose || ''}
              onChange={handleTextChange('purpose')}
              placeholder={t('profile.motivationVision.purposePlaceholder')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Motivation */}
      <Card>
        <CardHeader>
          <CardTitle>Motivation & Drive</CardTitle>
          <CardDescription>What motivates you in your work and career</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="what_drives_you" className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-muted-foreground" />
              {t('profile.motivationVision.whatDrivesYouTitle')}
            </Label>
            <Textarea
              id="what_drives_you"
              value={formData.what_drives_you || ''}
              onChange={handleTextChange('what_drives_you')}
              placeholder={t('profile.motivationVision.whatDrivesYouPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="why_this_field" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              {t('profile.motivationVision.whyThisFieldTitle')}
            </Label>
            <Textarea
              id="why_this_field"
              value={formData.why_this_field || ''}
              onChange={handleTextChange('why_this_field')}
              placeholder={t('profile.motivationVision.whyThisFieldPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="career_goals" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              {t('profile.motivationVision.careerGoalsTitle')}
            </Label>
            <Textarea
              id="career_goals"
              value={formData.career_goals || ''}
              onChange={handleTextChange('career_goals')}
              placeholder={t('profile.motivationVision.careerGoalsPlaceholder')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Passions */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Passions</CardTitle>
          <CardDescription>Your passions and how they connect to your work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passions" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              {t('profile.motivationVision.passionsTitle')}
            </Label>
            <Input
              id="passions"
              value={passionInput}
              onChange={(e) => setPassionInput(e.target.value)}
              onKeyDown={handleAddPassion}
              placeholder={t('profile.motivationVision.passionsPlaceholder')}
            />
            {formData.passions && formData.passions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.passions.map((passion) => (
                  <Badge key={passion} variant="secondary" className="gap-1">
                    {passion}
                    <button
                      type="button"
                      onClick={() => handleRemovePassion(passion)}
                      className="ml-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="how_passions_relate" className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-muted-foreground" />
              {t('profile.motivationVision.howPassionsRelateTitle')}
            </Label>
            <Textarea
              id="how_passions_relate"
              value={formData.how_passions_relate || ''}
              onChange={handleTextChange('how_passions_relate')}
              placeholder={t('profile.motivationVision.howPassionsRelatePlaceholder')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
