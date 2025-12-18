'use client';

import {
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  Loader2,
  Mail,
  Sparkles,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AutoFillDialog } from '@/components/auto-fill-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppLanguage } from '@/hooks/use-app-language';
import { useTranslations } from '@/hooks/use-translations';
import { createCoverLetter, getDefaultCoverLetterContent } from '@/services/cover-letter.service';
import { fetchAllCVs } from '@/services/cv.service';
import { type ParsedJobPosting, parseJobPostingUrl } from '@/services/job-parser.service';
import type { CVDocument } from '@/types/cv.types';

type Step = 'basic' | 'job';

export default function NewCoverLetterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [showAutoFillDialog, setShowAutoFillDialog] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedJobPosting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cvList, setCvList] = useState<CVDocument[]>([]);
  const { language: appLanguage } = useAppLanguage();
  const { translations } = useTranslations(appLanguage);

  // Form state
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [linkedCvId, setLinkedCvId] = useState<string>('');
  const [jobPosting, setJobPosting] = useState('');
  const [jobPostingUrl, setJobPostingUrl] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  useEffect(() => {
    const loadCVs = async () => {
      const result = await fetchAllCVs();
      if (result.data) {
        setCvList(result.data);
      }
    };
    loadCVs();
  }, []);

  // Parse job posting URL
  const handleParseUrl = async () => {
    if (!jobPostingUrl.trim()) return;

    setIsParsingUrl(true);
    setShowAutoFillDialog(true);
    setParsedData(null);
    setError(null);

    const result = await parseJobPostingUrl(jobPostingUrl.trim());

    if (result.error) {
      setError(result.error);
      setShowAutoFillDialog(false);
    } else if (result.data) {
      setParsedData(result.data);
    }

    setIsParsingUrl(false);
  };

  // Handle applying auto-fill data from dialog
  const handleApplyAutoFill = (fields: Record<string, string>) => {
    if (fields.company) setCompany(fields.company);
    if (fields.position) setPosition(fields.position);
    if (fields.jobDescription) setJobPosting(fields.jobDescription);
    // Also update name if empty
    if (!name && fields.position && fields.company) {
      setName(`${fields.position} - ${fields.company}`);
    }
  };

  const handleCreate = async (skipJobContext: boolean = false) => {
    if (!name.trim()) {
      setError(translations.coverLetter.new.pleaseEnterName);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await createCoverLetter({
      name: name.trim(),
      language,
      cv_id: linkedCvId || undefined,
      content: getDefaultCoverLetterContent(),
      job_context: skipJobContext
        ? undefined
        : {
            company: company.trim() || undefined,
            position: position.trim() || undefined,
            jobPosting: jobPosting.trim() || undefined,
            jobPostingUrl: jobPostingUrl.trim() || undefined,
          },
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // Navigate to the editor
    if (result.data) {
      router.push(`/cover-letter/${result.data.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/cover-letter">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {translations.coverLetter.backToCoverLetters}
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step === 'basic' ? 'font-medium text-foreground' : ''}>
            1. {translations.coverLetter.list.stepBasicInfo}
          </span>
          <ArrowRight className="h-3 w-3" />
          <span className={step === 'job' ? 'font-medium text-foreground' : ''}>
            2. {translations.coverLetter.list.stepJobContext}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{translations.coverLetter.new.title}</h1>
        <p className="mt-2 text-muted-foreground">
          {step === 'basic'
            ? translations.coverLetter.new.basicInfoSubtitle
            : translations.coverLetter.new.jobContextSubtitle}
        </p>
      </div>

      {/* Step 1: Basic Info */}
      {step === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {translations.coverLetter.new.basicInformation}
            </CardTitle>
            <CardDescription>{translations.coverLetter.new.basicInfoDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{translations.coverLetter.new.coverLetterName} *</Label>
              <Input
                id="name"
                placeholder={translations.coverLetter.new.coverLetterNamePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {translations.coverLetter.new.coverLetterNameHint}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{translations.common.language}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => setLanguage('en')}
                >
                  {translations.coverLetter.english}
                </Button>
                <Button
                  type="button"
                  variant={language === 'de' ? 'default' : 'outline'}
                  onClick={() => setLanguage('de')}
                >
                  {translations.coverLetter.german}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedCv">{translations.coverLetter.new.linkToCV}</Label>
              <Select value={linkedCvId} onValueChange={setLinkedCvId}>
                <SelectTrigger>
                  <SelectValue placeholder={translations.coverLetter.new.selectCV} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{translations.coverLetter.new.noLinkedCV}</SelectItem>
                  {cvList.map((cv) => (
                    <SelectItem key={cv.id} value={cv.id}>
                      {cv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {translations.coverLetter.new.linkToCVHint}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => handleCreate(true)} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {translations.coverLetter.new.skipAndCreate}
              </Button>
              <Button onClick={() => setStep('job')} disabled={!name.trim()}>
                {translations.coverLetter.new.continue}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Job Context */}
      {step === 'job' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {translations.coverLetter.new.jobContextOptional}
            </CardTitle>
            <CardDescription>{translations.coverLetter.new.jobContextDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">{translations.coverLetter.company}</Label>
                <Input
                  id="company"
                  placeholder="e.g., Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">{translations.coverLetter.position}</Label>
                <Input
                  id="position"
                  placeholder="e.g., Senior Software Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobPostingUrl" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                {translations.coverLetter.new.jobPostingUrl}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="jobPostingUrl"
                  type="url"
                  placeholder="https://..."
                  value={jobPostingUrl}
                  onChange={(e) => setJobPostingUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleParseUrl}
                  disabled={isParsingUrl || !jobPostingUrl.trim()}
                >
                  {isParsingUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  <span className="ml-2">{translations.coverLetter.new.autoFill}</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {translations.coverLetter.new.autoFillHint}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobPosting">{translations.coverLetter.new.jobDescription}</Label>
              <Textarea
                id="jobPosting"
                placeholder={translations.coverLetter.new.jobDescriptionPlaceholder}
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {translations.coverLetter.new.jobDescriptionHint}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('basic')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {translations.common.back}
              </Button>
              <Button onClick={() => handleCreate(false)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translations.coverLetter.creating}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {translations.coverLetter.createCoverLetter}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AutoFillDialog
        open={showAutoFillDialog}
        onOpenChange={setShowAutoFillDialog}
        data={parsedData}
        isLoading={isParsingUrl}
        onApply={handleApplyAutoFill}
        visibleFields={['company', 'position', 'jobDescription']}
      />
    </div>
  );
}
