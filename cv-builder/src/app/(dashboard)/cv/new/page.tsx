'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Loader2, FileText, Sparkles, Upload, Link as LinkIcon, Wand2 } from 'lucide-react';
import { createCV, getDefaultDisplaySettings, getDefaultCVContent } from '@/services/cv.service';
import { parseJobPostingUrl, type ParsedJobPosting } from '@/services/job-parser.service';
import { AutoFillDialog } from '@/components/auto-fill-dialog';

type Step = 'basic' | 'job' | 'create';

export default function NewCVPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [showAutoFillDialog, setShowAutoFillDialog] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedJobPosting | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [jobPosting, setJobPosting] = useState('');
  const [jobPostingUrl, setJobPostingUrl] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

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
      setError('Please enter a name for your CV');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await createCV({
      name: name.trim(),
      description: description.trim() || undefined,
      language,
      content: getDefaultCVContent(),
      job_context: skipJobContext ? undefined : {
        company: company.trim() || undefined,
        position: position.trim() || undefined,
        jobPosting: jobPosting.trim() || undefined,
        jobPostingUrl: jobPostingUrl.trim() || undefined,
      },
      display_settings: getDefaultDisplaySettings(),
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // Navigate to the editor
    if (result.data) {
      router.push(`/cv/${result.data.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/cv">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to CVs
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step === 'basic' ? 'font-medium text-foreground' : ''}>
            1. Basic Info
          </span>
          <ArrowRight className="h-3 w-3" />
          <span className={step === 'job' ? 'font-medium text-foreground' : ''}>
            2. Job Context
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create New CV</h1>
        <p className="text-muted-foreground mt-2">
          {step === 'basic'
            ? 'Start by naming your CV and choosing a language'
            : 'Optionally add job context for AI-powered customization'}
        </p>
      </div>

      {/* Step 1: Basic Info */}
      {step === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Give your CV a name and choose the language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">CV Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Software Engineer - Google"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use a descriptive name to easily identify this CV later
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief notes about this CV version..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={language === 'en' ? 'default' : 'outline'}
                  onClick={() => setLanguage('en')}
                >
                  English
                </Button>
                <Button
                  type="button"
                  variant={language === 'de' ? 'default' : 'outline'}
                  onClick={() => setLanguage('de')}
                >
                  Deutsch
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => handleCreate(true)} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Skip & Create
              </Button>
              <Button onClick={() => setStep('job')} disabled={!name.trim()}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
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
              Job Context (Optional)
            </CardTitle>
            <CardDescription>
              Add job posting details for AI-powered CV customization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="e.g., Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
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
                Job Posting URL
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
                  disabled={!jobPostingUrl.trim() || isParsingUrl}
                  className="gap-2"
                >
                  {isParsingUrl ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Auto-fill
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a job posting URL and click Auto-fill to extract company, position, and description
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobPosting" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Job Description
              </Label>
              <Textarea
                id="jobPosting"
                placeholder="Paste the full job description here..."
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                The AI will analyze this to tailor your CV content
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('basic')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => handleCreate(false)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create CV
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
