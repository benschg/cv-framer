'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Save,
  Download,
  Share2,
  Sparkles,
  Loader2,
  Eye,
  Settings,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { fetchCV, updateCV, generateId } from '@/services/cv.service';
import { generateCVWithAI, regenerateItem } from '@/services/ai.service';
import { CVPreview } from '@/components/cv/cv-preview';
import { PhotoSelector } from '@/components/cv/photo-selector';
import { useAuth } from '@/contexts/auth-context';
import { getUserInitials } from '@/lib/user-utils';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { createClient } from '@/lib/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CVDocument, CVContent, WorkExperience, Education, SkillCategory, KeyCompetence, DisplaySettings } from '@/types/cv.types';
import type { ProfilePhoto } from '@/types/api.schemas';

export default function CVEditorPage() {
  const params = useParams();
  const router = useRouter();
  const cvId = params.id as string;
  const { user } = useAuth();

  const [cv, setCv] = useState<CVDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable content
  const [content, setContent] = useState<CVContent>({});

  // Photo state
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadCV = async () => {
      const result = await fetchCV(cvId);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setCv(result.data);
        setContent(result.data.content || {});
      }
      setLoading(false);
    };
    loadCV();
  }, [cvId]);

  // Load photos
  useEffect(() => {
    const loadPhotos = async () => {
      const result = await fetchProfilePhotos();
      if (result.data) {
        setPhotos(result.data.photos);
        setPrimaryPhoto(result.data.primaryPhoto);
      }
    };
    if (user) {
      loadPhotos();
    }
  }, [user]);

  // Update photo URL when selected photo or primary photo changes
  useEffect(() => {
    const updatePhotoUrl = async () => {
      const selectedPhotoId = content.selected_photo_id;

      if (selectedPhotoId === 'none') {
        // No photo
        setPhotoUrl(null);
      } else if (selectedPhotoId && selectedPhotoId !== 'none') {
        // User selected a specific photo
        const selectedPhoto = photos.find(p => p.id === selectedPhotoId);
        if (selectedPhoto) {
          setPhotoUrl(getPhotoPublicUrl(selectedPhoto.storage_path));
        } else {
          // Photo not found in list, fallback to primary
          setPhotoUrl(primaryPhoto ? getPhotoPublicUrl(primaryPhoto.storage_path) : null);
        }
      } else if (!selectedPhotoId || selectedPhotoId === null) {
        // Use primary photo
        if (primaryPhoto) {
          setPhotoUrl(getPhotoPublicUrl(primaryPhoto.storage_path));
        } else if (user?.user_metadata?.avatar_url) {
          // Fallback to OAuth avatar
          setPhotoUrl(user.user_metadata.avatar_url);
        } else {
          setPhotoUrl(null);
        }
      }
    };

    updatePhotoUrl();
  }, [content.selected_photo_id, photos, primaryPhoto, user]);

  const handleSave = async () => {
    if (!cv) return;
    setSaving(true);
    const result = await updateCV(cvId, {
      content: content as Record<string, unknown>,
      display_settings: cv.display_settings as Record<string, unknown>,
    });
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setCv(result.data);
    }
    setSaving(false);
  };

  const updateField = (field: keyof CVContent, value: unknown) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const updateDisplaySettings = (field: keyof DisplaySettings, value: unknown) => {
    if (!cv) return;
    const updatedSettings = {
      ...cv.display_settings,
      [field]: value,
    };
    setCv(prev => prev ? { ...prev, display_settings: updatedSettings } : null);
  };

  // Export PDF
  const handleExport = async () => {
    if (!cv) return;
    setExporting(true);

    try {
      const format = cv.display_settings?.format || 'A4';
      const response = await fetch(`/api/cv/${cvId}/export?format=${format}`);

      if (!response.ok) {
        const json = await response.json();
        setError(json.error || 'Failed to export PDF');
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  // AI Generation
  const handleGenerateAll = async () => {
    if (!cv) return;
    setGenerating(true);
    setError(null);

    const result = await generateCVWithAI({
      cvId,
      language: cv.language,
      sections: ['tagline', 'profile', 'keyCompetences'],
      jobContext: cv.job_context ?? undefined,
      analyzeJobPosting: true,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.data?.content) {
      const newContent = result.data.content;
      setContent(prev => ({
        ...prev,
        ...newContent,
      }));
    }

    setGenerating(false);
  };

  const handleRegenerateSection = async (section: string) => {
    if (!cv) return;
    setRegeneratingSection(section);

    const currentValue = content[section as keyof CVContent] as string || '';

    const result = await regenerateItem({
      cvId,
      section,
      currentContent: currentValue,
      language: cv.language,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.data && typeof result.data.content === 'string') {
      updateField(section as keyof CVContent, result.data.content);
    }

    setRegeneratingSection(null);
  };

  // Work Experience helpers
  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: generateId(),
      company: '',
      title: '',
      startDate: '',
      bullets: [],
    };
    updateField('workExperience', [...(content.workExperience || []), newExp]);
  };

  const updateWorkExperience = (index: number, updates: Partial<WorkExperience>) => {
    const experiences = [...(content.workExperience || [])];
    experiences[index] = { ...experiences[index], ...updates };
    updateField('workExperience', experiences);
  };

  const removeWorkExperience = (index: number) => {
    const experiences = [...(content.workExperience || [])];
    experiences.splice(index, 1);
    updateField('workExperience', experiences);
  };

  // Education helpers
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      startDate: '',
    };
    updateField('education', [...(content.education || []), newEdu]);
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    const educations = [...(content.education || [])];
    educations[index] = { ...educations[index], ...updates };
    updateField('education', educations);
  };

  const removeEducation = (index: number) => {
    const educations = [...(content.education || [])];
    educations.splice(index, 1);
    updateField('education', educations);
  };

  // Skills helpers
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: generateId(),
      category: '',
      skills: [],
    };
    updateField('skills', [...(content.skills || []), newCat]);
  };

  const updateSkillCategory = (index: number, updates: Partial<SkillCategory>) => {
    const skills = [...(content.skills || [])];
    skills[index] = { ...skills[index], ...updates };
    updateField('skills', skills);
  };

  const removeSkillCategory = (index: number) => {
    const skills = [...(content.skills || [])];
    skills.splice(index, 1);
    updateField('skills', skills);
  };

  // Key Competences helpers
  const addKeyCompetence = () => {
    const newComp: KeyCompetence = {
      id: generateId(),
      title: '',
      description: '',
    };
    updateField('keyCompetences', [...(content.keyCompetences || []), newComp]);
  };

  const updateKeyCompetence = (index: number, updates: Partial<KeyCompetence>) => {
    const comps = [...(content.keyCompetences || [])];
    comps[index] = { ...comps[index], ...updates };
    updateField('keyCompetences', comps);
  };

  const removeKeyCompetence = (index: number) => {
    const comps = [...(content.keyCompetences || [])];
    comps.splice(index, 1);
    updateField('keyCompetences', comps);
  };

  // Scroll to preview
  const handlePreview = () => {
    document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generate experience bullets handler
  const handleGenerateExperienceBullets = async (index: number) => {
    if (!cv) return;
    const exp = content.workExperience?.[index];
    if (!exp) return;

    setRegeneratingSection(`experience_bullets_${index}`);

    const result = await regenerateItem({
      cvId,
      section: 'experience_bullets',
      language: cv.language,
      experienceContext: {
        company: exp.company,
        title: exp.title,
        description: exp.description,
      },
    });

    if (result.error) {
      setError(result.error);
    } else if (result.data && Array.isArray(result.data.content)) {
      updateWorkExperience(index, { bullets: result.data.content });
    }

    setRegeneratingSection(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb currentLabel="CV" />
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'CV not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb currentLabel={cv.name} data={cv} />
        <Avatar className="h-8 w-8 flex-shrink-0 hidden sm:block ml-2">
          <AvatarImage src={photoUrl || undefined} />
          <AvatarFallback className="text-xs">{getUserInitials(user)}</AvatarFallback>
        </Avatar>
        {cv.job_context?.company && (
          <div className="min-w-0 flex-1 hidden lg:block ml-2">
            <p className="text-sm text-muted-foreground truncate">
              {cv.job_context.position} at {cv.job_context.company}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePreview}>
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="max-w-4xl mx-auto space-y-6">

      {/* Photo Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Settings</CardTitle>
          <CardDescription>
            Choose which photo to use for this CV (defaults to your primary photo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoSelector
            selectedPhotoId={content.selected_photo_id || null}
            onChange={(photoId) => updateField('selected_photo_id', photoId)}
            userInitials={getUserInitials(user)}
          />
        </CardContent>
      </Card>

      {/* Format Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Format Settings</CardTitle>
          <CardDescription>
            Choose the page format for your CV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="format">Page Format</Label>
            <Select
              value={cv.display_settings?.format || 'A4'}
              onValueChange={(value) => updateDisplaySettings('format', value as 'A4' | 'Letter')}
            >
              <SelectTrigger id="format" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="Letter">Letter (8.5 × 11 in / 216 × 279 mm)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {cv.display_settings?.format === 'Letter'
                ? 'Letter format is commonly used in the US and Canada'
                : 'A4 format is the international standard used in most countries'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Generate Button */}
      <Card className="border-dashed border-primary/50 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">AI-Powered Generation</p>
                <p className="text-sm text-muted-foreground">
                  Generate content from your Werbeflaechen data
                  {cv.job_context?.company && ` tailored for ${cv.job_context.company}`}
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateAll}
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

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your professional summary and tagline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tagline">Tagline</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => handleRegenerateSection('tagline')}
                disabled={regeneratingSection === 'tagline'}
              >
                {regeneratingSection === 'tagline' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Regenerate
              </Button>
            </div>
            <Input
              id="tagline"
              placeholder="e.g., Senior Software Engineer | React & Node.js"
              value={content.tagline || ''}
              onChange={(e) => updateField('tagline', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile">Professional Summary</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => handleRegenerateSection('profile')}
                disabled={regeneratingSection === 'profile'}
              >
                {regeneratingSection === 'profile' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Regenerate
              </Button>
            </div>
            <Textarea
              id="profile"
              placeholder="Write a brief summary of your professional background..."
              rows={4}
              value={content.profile || ''}
              onChange={(e) => updateField('profile', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Competences Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Key Competences
              <Badge variant="outline" className="font-normal text-xs">AI Generated</Badge>
            </CardTitle>
            <CardDescription>Your core professional strengths (best generated by AI)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addKeyCompetence}>
            <Plus className="h-4 w-4 mr-2" />
            Add Competence
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(content.keyCompetences || []).length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                No key competences added yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Use &quot;Generate Content&quot; above to auto-generate from your Werbeflaechen data
              </p>
            </div>
          ) : (
            (content.keyCompetences || []).map((comp, index) => (
              <div key={comp.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1 mr-4">
                    <Label>Competence Title</Label>
                    <Input
                      placeholder="e.g., Technical Leadership"
                      value={comp.title}
                      onChange={(e) => updateKeyCompetence(index, { title: e.target.value })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeKeyCompetence(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of this competence..."
                    rows={2}
                    value={comp.description}
                    onChange={(e) => updateKeyCompetence(index, { description: e.target.value })}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Work Experience Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>Your professional work history</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addWorkExperience}>
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(content.workExperience || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No work experience added yet. Click &quot;Add Experience&quot; to get started.
            </p>
          ) : (
            (content.workExperience || []).map((exp, index) => (
              <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeWorkExperience(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      placeholder="Company name"
                      value={exp.company}
                      onChange={(e) => updateWorkExperience(index, { company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      placeholder="Your role"
                      value={exp.title}
                      onChange={(e) => updateWorkExperience(index, { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateWorkExperience(index, { startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      placeholder="Present"
                      value={exp.endDate || ''}
                      onChange={(e) => updateWorkExperience(index, { endDate: e.target.value })}
                      disabled={exp.current}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Key Achievements (one per line)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleGenerateExperienceBullets(index)}
                      disabled={regeneratingSection === `experience_bullets_${index}` || !exp.company || !exp.title}
                      title={!exp.company || !exp.title ? 'Fill in company and job title first' : 'Generate achievement bullets'}
                    >
                      {regeneratingSection === `experience_bullets_${index}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Generate Bullets
                    </Button>
                  </div>
                  <Textarea
                    placeholder="- Led a team of 5 engineers&#10;- Reduced load time by 50%&#10;- Implemented CI/CD pipeline"
                    rows={4}
                    value={(exp.bullets || []).join('\n')}
                    onChange={(e) =>
                      updateWorkExperience(index, {
                        bullets: e.target.value.split('\n').filter((b) => b.trim()),
                      })
                    }
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Education</CardTitle>
            <CardDescription>Your academic background</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addEducation}>
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(content.education || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No education added yet. Click &quot;Add Education&quot; to get started.
            </p>
          ) : (
            (content.education || []).map((edu, index) => (
              <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      placeholder="University or school name"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, { institution: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      placeholder="e.g., Bachelor of Science"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, { degree: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      placeholder="e.g., Computer Science"
                      value={edu.field || ''}
                      onChange={(e) => updateEducation(index, { field: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={edu.endDate || ''}
                      onChange={(e) => updateEducation(index, { endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Your technical and professional skills</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addSkillCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(content.skills || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No skills added yet. Click &quot;Add Category&quot; to get started.
            </p>
          ) : (
            (content.skills || []).map((cat, index) => (
              <div key={cat.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1 mr-4">
                    <Label>Category Name</Label>
                    <Input
                      placeholder="e.g., Programming Languages"
                      value={cat.category}
                      onChange={(e) => updateSkillCategory(index, { category: e.target.value })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive mt-6"
                    onClick={() => removeSkillCategory(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    placeholder="JavaScript, TypeScript, React, Node.js"
                    value={(cat.skills || []).join(', ')}
                    onChange={(e) =>
                      updateSkillCategory(index, {
                        skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card id="preview-section">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Preview
                <Badge variant="outline" className="font-normal">Live</Badge>
              </CardTitle>
              <CardDescription>
                This is how your CV will look when exported
              </CardDescription>
            </div>
            <Select
              value={cv.display_settings?.format || 'A4'}
              onValueChange={(value) => updateDisplaySettings('format', value as 'A4' | 'Letter')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <CVPreview
            content={content}
            language={cv.language}
            settings={cv.display_settings}
            photoUrl={photoUrl}
            userInitials={getUserInitials(user)}
          />
        </CardContent>
      </Card>

      {/* Bottom Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/cv')}>
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
      </div>
    </>
  );
}
