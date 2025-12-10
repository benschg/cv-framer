'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Loader2, Mail, Sparkles, Link as LinkIcon } from 'lucide-react';
import { createCoverLetter, getDefaultCoverLetterContent } from '@/services/cover-letter.service';
import { fetchAllCVs } from '@/services/cv.service';
import type { CVDocument } from '@/types/cv.types';

type Step = 'basic' | 'job';

export default function NewCoverLetterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvList, setCvList] = useState<CVDocument[]>([]);

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

  const handleCreate = async (skipJobContext: boolean = false) => {
    if (!name.trim()) {
      setError('Please enter a name for your cover letter');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await createCoverLetter({
      name: name.trim(),
      language,
      cv_id: linkedCvId || undefined,
      content: getDefaultCoverLetterContent(),
      job_context: skipJobContext ? undefined : {
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/cover-letter">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
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
        <h1 className="text-3xl font-bold tracking-tight">Create Cover Letter</h1>
        <p className="text-muted-foreground mt-2">
          {step === 'basic'
            ? 'Name your cover letter and optionally link it to a CV'
            : 'Add job details for AI-powered customization'}
        </p>
      </div>

      {/* Step 1: Basic Info */}
      {step === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Give your cover letter a name and choose the language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cover Letter Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Google - Senior Engineer Application"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use a descriptive name to easily identify this cover letter later
              </p>
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

            <div className="space-y-2">
              <Label htmlFor="linkedCv">Link to CV (optional)</Label>
              <Select value={linkedCvId} onValueChange={setLinkedCvId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a CV to link" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No linked CV</SelectItem>
                  {cvList.map((cv) => (
                    <SelectItem key={cv.id} value={cv.id}>
                      {cv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Link to a CV to use its content for AI generation
              </p>
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
              Add job posting details for AI-powered customization
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
              <Label htmlFor="jobPosting">Job Description</Label>
              <Textarea
                id="jobPosting"
                placeholder="Paste the full job description here..."
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                The AI will analyze this to tailor your cover letter
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
                    Create Cover Letter
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
