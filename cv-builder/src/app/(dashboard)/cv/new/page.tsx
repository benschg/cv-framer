'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Loader2, FileText, Sparkles, Upload, Link as LinkIcon } from 'lucide-react';
import { createCV, getDefaultDisplaySettings, getDefaultCVContent } from '@/services/cv.service';

type Step = 'basic' | 'job' | 'create';

export default function NewCVPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [jobPosting, setJobPosting] = useState('');
  const [jobPostingUrl, setJobPostingUrl] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

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
              <Input
                id="jobPostingUrl"
                type="url"
                placeholder="https://..."
                value={jobPostingUrl}
                onChange={(e) => setJobPostingUrl(e.target.value)}
              />
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
    </div>
  );
}
