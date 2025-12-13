'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Mail,
  FileText,
  Clock,
  Trash2,
  Star,
  Check,
} from 'lucide-react';
import {
  fetchApplication,
  updateApplication,
  deleteApplication,
} from '@/services/application.service';
import { fetchAllCVs } from '@/services/cv.service';
import { fetchCoverLetters } from '@/services/cover-letter.service';
import type { JobApplication, CVDocument, CoverLetter, ApplicationStatus } from '@/types/cv.types';
import { APPLICATION_STATUS_CONFIG } from '@/types/cv.types';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cvList, setCvList] = useState<CVDocument[]>([]);
  const [coverLetterList, setCoverLetterList] = useState<CoverLetter[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('draft');
  const [appliedAt, setAppliedAt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [linkedCvId, setLinkedCvId] = useState('');
  const [linkedCoverLetterId, setLinkedCoverLetterId] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [appResult, cvResult, clResult] = await Promise.all([
        fetchApplication(applicationId),
        fetchAllCVs(),
        fetchCoverLetters(),
      ]);

      if (appResult.error) {
        setError(appResult.error);
      } else if (appResult.data) {
        const app = appResult.data;
        setApplication(app);
        setCompanyName(app.company_name);
        setJobTitle(app.job_title);
        setJobUrl(app.job_url || '');
        setJobDescription(app.job_description || '');
        setLocation(app.location || '');
        setSalaryRange(app.salary_range || '');
        setStatus(app.status);
        setAppliedAt(app.applied_at ? app.applied_at.split('T')[0] : '');
        setDeadline(app.deadline ? app.deadline.split('T')[0] : '');
        setNotes(app.notes || '');
        setContactName(app.contact_name || '');
        setContactEmail(app.contact_email || '');
        setLinkedCvId(app.cv_id || '');
        setLinkedCoverLetterId(app.cover_letter_id || '');
        setIsFavorite(app.is_favorite || false);
        // Mark as initialized after loading data
        setTimeout(() => setIsInitialized(true), 100);
      }

      if (cvResult.data) setCvList(cvResult.data);
      if (clResult.data) setCoverLetterList(clResult.data);
      setLoading(false);
    };
    loadData();
  }, [applicationId]);

  // Auto-save function
  const performSave = useCallback(async () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      return;
    }

    setSaving(true);
    setSaveStatus('saving');
    setError(null);

    const result = await updateApplication(applicationId, {
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      job_url: jobUrl.trim() || undefined,
      job_description: jobDescription.trim() || undefined,
      location: location.trim() || undefined,
      salary_range: salaryRange.trim() || undefined,
      status,
      applied_at: appliedAt || undefined,
      deadline: deadline || undefined,
      notes: notes.trim() || undefined,
      contact_name: contactName.trim() || undefined,
      contact_email: contactEmail.trim() || undefined,
      cv_id: linkedCvId || undefined,
      cover_letter_id: linkedCoverLetterId || undefined,
      is_favorite: isFavorite,
    });

    if (result.error) {
      setError(result.error);
      setSaveStatus('error');
    } else if (result.data) {
      setApplication(result.data);
      setSaveStatus('saved');
      // Clear "saved" status after 2 seconds
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }

    setSaving(false);
  }, [
    applicationId, companyName, jobTitle, jobUrl, jobDescription, location,
    salaryRange, status, appliedAt, deadline, notes, contactName, contactEmail,
    linkedCvId, linkedCoverLetterId, isFavorite
  ]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isInitialized) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (500ms debounce)
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    isInitialized, companyName, jobTitle, jobUrl, jobDescription, location,
    salaryRange, status, appliedAt, deadline, notes, contactName, contactEmail,
    linkedCvId, linkedCoverLetterId, isFavorite, performSave
  ]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setStatus(newStatus);

    // Auto-set applied_at when changing to 'applied' status
    if (newStatus === 'applied' && !appliedAt) {
      setAppliedAt(new Date().toISOString().split('T')[0]);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    const result = await deleteApplication(applicationId);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/applications');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (error && !application) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Application not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = APPLICATION_STATUS_CONFIG[status];
  const isOverdue = deadline && new Date(deadline) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/applications">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{companyName}</h1>
              <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Star
                  className={`h-5 w-5 ${
                    isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  }`}
                />
              </Button>
            </div>
            <p className="text-muted-foreground">{jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {jobUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={jobUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Posting
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[80px] justify-end">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <span className="text-destructive">Error</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {location}
                </div>
              )}
              {salaryRange && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  {salaryRange}
                </div>
              )}
              {appliedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Applied {formatDate(appliedAt)}
                </div>
              )}
              {deadline && (
                <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Clock className="h-4 w-4" />
                  Deadline {formatDate(deadline)}
                </div>
              )}
            </div>
            <Select value={status} onValueChange={(v: string) => handleStatusChange(v as ApplicationStatus)}>
              <SelectTrigger className="w-40">
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
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryRange">Salary Range</Label>
                  <Input
                    id="salaryRange"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobUrl">Job Posting URL</Label>
                <Input
                  id="jobUrl"
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
              <CardDescription>
                Keep track of important information about this application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Interview notes, follow-up reminders, thoughts..."
                rows={6}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appliedAt">Applied Date</Label>
                <Input
                  id="appliedAt"
                  type="date"
                  value={appliedAt}
                  onChange={(e) => setAppliedAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Recruiter or hiring manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                  {contactEmail && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={`mailto:${contactEmail}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Linked Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CV</Label>
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
                {linkedCvId && (
                  <Link href={`/cv/${linkedCvId}`}>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      View CV
                    </Button>
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                <Label>Cover Letter</Label>
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
                {linkedCoverLetterId && (
                  <Link href={`/cover-letter/${linkedCoverLetterId}`}>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      View Cover Letter
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          {application && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {formatDate(application.created_at)}</p>
                  <p>Updated: {formatDate(application.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
