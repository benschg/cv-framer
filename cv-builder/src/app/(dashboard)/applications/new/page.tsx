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
import { ArrowLeft, Loader2, Briefcase, Link as LinkIcon, Wand2 } from 'lucide-react';
import { createApplication } from '@/services/application.service';
import { fetchAllCVs } from '@/services/cv.service';
import { fetchCoverLetters } from '@/services/cover-letter.service';
import { parseJobPostingUrl, type ParsedJobPosting } from '@/services/job-parser.service';
import { AutoFillDialog } from '@/components/auto-fill-dialog';
import type { CVDocument, CoverLetter, ApplicationStatus } from '@/types/cv.types';
import { APPLICATION_STATUS_CONFIG } from '@/types/cv.types';

export default function NewApplicationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [showAutoFillDialog, setShowAutoFillDialog] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedJobPosting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cvList, setCvList] = useState<CVDocument[]>([]);
  const [coverLetterList, setCoverLetterList] = useState<CoverLetter[]>([]);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('draft');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [linkedCvId, setLinkedCvId] = useState('');
  const [linkedCoverLetterId, setLinkedCoverLetterId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [cvResult, clResult] = await Promise.all([
        fetchAllCVs(),
        fetchCoverLetters(),
      ]);
      if (cvResult.data) setCvList(cvResult.data);
      if (clResult.data) setCoverLetterList(clResult.data);
    };
    loadData();
  }, []);

  // Parse job posting URL
  const handleParseUrl = async () => {
    if (!jobUrl.trim()) return;

    setIsParsingUrl(true);
    setShowAutoFillDialog(true);
    setParsedData(null);
    setError(null);

    const result = await parseJobPostingUrl(jobUrl.trim());

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
    if (fields.company) setCompanyName(fields.company);
    if (fields.position) setJobTitle(fields.position);
    if (fields.jobDescription) setJobDescription(fields.jobDescription);
    if (fields.location) setLocation(fields.location);
    if (fields.salary) setSalaryRange(fields.salary);
    if (fields.contactName) setContactName(fields.contactName);
    if (fields.contactEmail) setContactEmail(fields.contactEmail);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !jobTitle.trim()) {
      setError('Company name and job title are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await createApplication({
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      job_url: jobUrl.trim() || undefined,
      job_description: jobDescription.trim() || undefined,
      location: location.trim() || undefined,
      salary_range: salaryRange.trim() || undefined,
      status,
      deadline: deadline || undefined,
      notes: notes.trim() || undefined,
      contact_name: contactName.trim() || undefined,
      contact_email: contactEmail.trim() || undefined,
      cv_id: linkedCvId || undefined,
      cover_letter_id: linkedCoverLetterId || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    if (result.data) {
      router.push(`/applications/${result.data.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Add Application</h1>
        <p className="text-muted-foreground mt-2">
          Track a new job application
        </p>
      </div>

      <form onSubmit={handleCreate}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Details
            </CardTitle>
            <CardDescription>
              Enter the details of the position you&apos;re applying for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobUrl" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Job Posting URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="jobUrl"
                  type="url"
                  placeholder="https://..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleParseUrl}
                  disabled={isParsingUrl || !jobUrl.trim()}
                >
                  {isParsingUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  <span className="ml-2">Auto-fill</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a job posting URL and click Auto-fill to extract details automatically
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA (Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range</Label>
                <Input
                  id="salaryRange"
                  placeholder="e.g., $150k - $200k"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v: string) => setStatus(v as ApplicationStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(APPLICATION_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="e.g., John Smith"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="e.g., john@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedCv">Link to CV</Label>
                <Select value={linkedCvId || '__none__'} onValueChange={(v) => setLinkedCvId(v === '__none__' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a CV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No linked CV</SelectItem>
                    {cvList.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id}>
                        {cv.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedCoverLetter">Link to Cover Letter</Label>
                <Select value={linkedCoverLetterId || '__none__'} onValueChange={(v) => setLinkedCoverLetterId(v === '__none__' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cover letter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No linked cover letter</SelectItem>
                    {coverLetterList.map((cl) => (
                      <SelectItem key={cl.id} value={cl.id}>
                        {cl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this application..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/applications')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Application'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <AutoFillDialog
        open={showAutoFillDialog}
        onOpenChange={setShowAutoFillDialog}
        data={parsedData}
        isLoading={isParsingUrl}
        onApply={handleApplyAutoFill}
        fieldLabels={{
          company: 'Company Name',
          position: 'Job Title',
          salary: 'Salary Range',
        }}
      />
    </div>
  );
}
