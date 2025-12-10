'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Save,
  Download,
  Sparkles,
  Loader2,
  Eye,
  Copy,
} from 'lucide-react';
import {
  fetchCoverLetter,
  updateCoverLetter,
  generateCoverLetterWithAI,
} from '@/services/cover-letter.service';
import type { CoverLetter, CoverLetterContent } from '@/types/cv.types';

export default function CoverLetterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const coverLetterId = params.id as string;

  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Editable content
  const [content, setContent] = useState<CoverLetterContent>({});

  useEffect(() => {
    const loadCoverLetter = async () => {
      const result = await fetchCoverLetter(coverLetterId);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setCoverLetter(result.data);
        setContent(result.data.content || {});
      }
      setLoading(false);
    };
    loadCoverLetter();
  }, [coverLetterId]);

  const handleSave = async () => {
    if (!coverLetter) return;
    setSaving(true);
    const result = await updateCoverLetter(coverLetterId, { content: content as Record<string, unknown> });
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setCoverLetter(result.data);
    }
    setSaving(false);
  };

  const updateField = (field: keyof CoverLetterContent, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  // AI Generation
  const handleGenerate = async () => {
    if (!coverLetter) return;
    setGenerating(true);
    setError(null);

    const result = await generateCoverLetterWithAI({
      cover_letter_id: coverLetterId,
      cv_id: coverLetter.cv_id ?? undefined,
      language: coverLetter.language ?? undefined,
      job_context: coverLetter.job_context ?? undefined,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.data?.content) {
      setContent((prev) => ({
        ...prev,
        ...result.data!.content,
      }));
    }

    setGenerating(false);
  };

  // Copy to clipboard
  const handleCopy = () => {
    const fullText = [
      content.subject && `Subject: ${content.subject}`,
      '',
      content.greeting,
      '',
      content.opening,
      '',
      content.body,
      '',
      content.closing,
      '',
      content.signature,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !coverLetter) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/cover-letter">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Cover letter not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cover-letter">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{coverLetter.name}</h1>
            {coverLetter.job_context?.company && (
              <p className="text-sm text-muted-foreground">
                {coverLetter.job_context.position} at {coverLetter.job_context.company}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* AI Generate Button */}
      <Card className="border-dashed border-primary/50 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">AI-Powered Generation</p>
                <p className="text-sm text-muted-foreground">
                  Generate content from your profile
                  {coverLetter.job_context?.company && ` tailored for ${coverLetter.job_context.company}`}
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter Content</CardTitle>
          <CardDescription>
            Edit your cover letter sections below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              placeholder="e.g., Application for Senior Software Engineer Position"
              value={content.subject || ''}
              onChange={(e) => updateField('subject', e.target.value)}
            />
          </div>

          {/* Greeting */}
          <div className="space-y-2">
            <Label htmlFor="greeting">Greeting</Label>
            <Input
              id="greeting"
              placeholder="e.g., Dear Hiring Manager,"
              value={content.greeting || ''}
              onChange={(e) => updateField('greeting', e.target.value)}
            />
          </div>

          {/* Opening Paragraph */}
          <div className="space-y-2">
            <Label htmlFor="opening">Opening Paragraph</Label>
            <Textarea
              id="opening"
              placeholder="Your hook and introduction..."
              rows={3}
              value={content.opening || ''}
              onChange={(e) => updateField('opening', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Start strong - mention the position and why you&apos;re excited about it
            </p>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Main Body</Label>
            <Textarea
              id="body"
              placeholder="Your qualifications, experience, and why you're a great fit..."
              rows={8}
              value={content.body || ''}
              onChange={(e) => updateField('body', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Highlight your relevant experience and connect your skills to the job requirements
            </p>
          </div>

          {/* Closing */}
          <div className="space-y-2">
            <Label htmlFor="closing">Closing Paragraph</Label>
            <Textarea
              id="closing"
              placeholder="Your call to action and professional sign-off..."
              rows={3}
              value={content.closing || ''}
              onChange={(e) => updateField('closing', e.target.value)}
            />
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label htmlFor="signature">Signature</Label>
            <Input
              id="signature"
              placeholder="e.g., Best regards, John Doe"
              value={content.signature || ''}
              onChange={(e) => updateField('signature', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Preview
            <Badge variant="outline" className="font-normal">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {content.subject && (
              <p className="font-medium text-primary">
                Subject: {content.subject}
              </p>
            )}
            {content.greeting && <p>{content.greeting}</p>}
            {content.opening && <p>{content.opening}</p>}
            {content.body && (
              <div className="whitespace-pre-wrap">{content.body}</div>
            )}
            {content.closing && <p>{content.closing}</p>}
            {content.signature && <p>{content.signature}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Button */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={() => router.push('/cover-letter')}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
