'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Save,
  Download,
  Sparkles,
  Loader2,
  Eye,
  Check,
  UserX,
} from 'lucide-react';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { EditableBreadcrumb } from '@/components/shared/editable-breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { fetchCV, updateCV } from '@/services/cv.service';
import { generateCVWithAI, regenerateItem } from '@/services/ai.service';
import { PhotoSelector } from '@/components/cv/photo-selector';
import { FormatSettings } from '@/components/cv/format-settings';
import { CVPreviewSection } from '@/components/cv/cv-preview-section';
import { CVWorkExperienceSection } from '@/components/cv/cv-work-experience-section';
import { CVEducationSection } from '@/components/cv/cv-education-section';
import { CVSkillCategoriesSection } from '@/components/cv/cv-skill-categories-section';
import { CVKeyCompetencesSection } from '@/components/cv/cv-key-competences-section';
import { CVProjectsSection } from '@/components/cv/cv-projects-section';
import { useAuth } from '@/contexts/auth-context';
import { getUserInitials, getUserName, getUserPhone, getUserLocation } from '@/lib/user-utils';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { fetchCVWorkExperiences, bulkUpsertCVWorkExperienceSelections } from '@/services/cv-work-experience.service';
import { fetchCVEducations, bulkUpsertCVEducationSelections } from '@/services/cv-education.service';
import { fetchCVSkillCategories, bulkUpsertCVSkillCategorySelections } from '@/services/cv-skill-categories.service';
import { fetchCVKeyCompetences, bulkUpsertCVKeyCompetenceSelections } from '@/services/cv-key-competences.service';
import { fetchCVProjects, bulkUpsertCVProjectSelections } from '@/services/cv-projects.service';
import type { CVDocument, CVContent, DisplaySettings } from '@/types/cv.types';
import type { ProfilePhoto } from '@/types/api.schemas';
import type { CVWorkExperienceWithSelection, CVEducationWithSelection, CVSkillCategoryWithSelection, CVKeyCompetenceWithSelection, CVProjectWithSelection } from '@/types/profile-career.types';

export default function CVEditorPage() {
  const params = useParams();
  const cvId = params.id as string;
  const { user } = useAuth();

  const [cv, setCv] = useState<CVDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoPopoverOpen, setPhotoPopoverOpen] = useState(false);

  // Editable content
  const [content, setContent] = useState<CVContent>({});

  // Photo state
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Work experience state
  const [workExperiences, setWorkExperiences] = useState<CVWorkExperienceWithSelection[]>([]);

  // Education state
  const [educations, setEducations] = useState<CVEducationWithSelection[]>([]);

  // Skill categories state
  const [skillCategories, setSkillCategories] = useState<CVSkillCategoryWithSelection[]>([]);

  // Key competences state
  const [keyCompetences, setKeyCompetences] = useState<CVKeyCompetenceWithSelection[]>([]);

  // Projects state
  const [projects, setProjects] = useState<CVProjectWithSelection[]>([]);

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

  // Load work experiences
  useEffect(() => {
    const loadWorkExperiences = async () => {
      const result = await fetchCVWorkExperiences(cvId);
      if (result.data) {
        setWorkExperiences(result.data);
      }
    };
    loadWorkExperiences();
  }, [cvId]);

  // Load educations
  useEffect(() => {
    const loadEducations = async () => {
      const result = await fetchCVEducations(cvId);
      if (result.data) {
        setEducations(result.data);
      }
    };
    loadEducations();
  }, [cvId]);

  // Load skill categories
  useEffect(() => {
    const loadSkillCategories = async () => {
      const result = await fetchCVSkillCategories(cvId);
      if (result.data) {
        setSkillCategories(result.data);
      }
    };
    loadSkillCategories();
  }, [cvId]);

  // Load key competences
  useEffect(() => {
    const loadKeyCompetences = async () => {
      const result = await fetchCVKeyCompetences(cvId);
      if (result.data) {
        setKeyCompetences(result.data);
      }
    };
    loadKeyCompetences();
  }, [cvId]);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      const result = await fetchCVProjects(cvId);
      if (result.data) {
        setProjects(result.data);
      }
    };
    loadProjects();
  }, [cvId]);

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

    // Save CV content
    const result = await updateCV(cvId, {
      content: content as Record<string, unknown>,
      display_settings: cv.display_settings as Record<string, unknown>,
    });

    // Save work experience selections
    if (workExperiences.length > 0) {
      const selectionsToSave = workExperiences.map((exp, index) => ({
        work_experience_id: exp.id,
        is_selected: exp.selection.is_selected,
        is_favorite: exp.selection.is_favorite,
        display_order: index,
        description_override: exp.selection.description_override,
        selected_bullet_indices: exp.selection.selected_bullet_indices,
      }));
      await bulkUpsertCVWorkExperienceSelections(cvId, selectionsToSave);
    }

    // Save education selections
    if (educations.length > 0) {
      const selectionsToSave = educations.map((edu, index) => ({
        education_id: edu.id,
        is_selected: edu.selection.is_selected,
        is_favorite: edu.selection.is_favorite,
        display_order: index,
        description_override: edu.selection.description_override,
      }));
      await bulkUpsertCVEducationSelections(cvId, selectionsToSave);
    }

    // Save skill category selections
    if (skillCategories.length > 0) {
      const selectionsToSave = skillCategories.map((cat, index) => ({
        skill_category_id: cat.id,
        is_selected: cat.selection.is_selected,
        is_favorite: cat.selection.is_favorite,
        display_order: index,
        selected_skill_indices: cat.selection.selected_skill_indices,
      }));
      await bulkUpsertCVSkillCategorySelections(cvId, selectionsToSave);
    }

    // Save key competence selections
    if (keyCompetences.length > 0) {
      const selectionsToSave = keyCompetences.map((comp, index) => ({
        key_competence_id: comp.id,
        is_selected: comp.selection.is_selected,
        is_favorite: comp.selection.is_favorite,
        display_order: index,
        description_override: comp.selection.description_override,
      }));
      await bulkUpsertCVKeyCompetenceSelections(cvId, selectionsToSave);
    }

    // Save project selections
    if (projects.length > 0) {
      await bulkUpsertCVProjectSelections(cvId, projects);
    }

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
      sections: ['tagline', 'profile'],
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

  // Scroll to preview
  const handlePreview = () => {
    document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
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

        <EditableBreadcrumb
          parentLabel="My CVs"
          parentHref="/cv"
          currentLabel={cv.name}
          onSave={async (newName) => {
            const result = await updateCV(cvId, { name: newName });
            if (result.data) setCv(result.data);
          }}
        />

        <Popover open={photoPopoverOpen} onOpenChange={setPhotoPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex-shrink-0 hidden sm:block ml-2 cursor-pointer hover:opacity-80 transition-opacity"
              title="Change photo"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={photoUrl || undefined} />
                <AvatarFallback className="text-xs">{getUserInitials(user)}</AvatarFallback>
              </Avatar>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="max-h-[400px] overflow-y-auto">
              {/* No Photo Option */}
              <button
                onClick={() => {
                  updateField('selected_photo_id', 'none');
                  setPhotoPopoverOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
                  content.selected_photo_id === 'none' ? 'bg-accent' : ''
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    <UserX className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">No Photo</p>
                  <p className="text-xs text-muted-foreground">
                    Generate CV without a photo
                  </p>
                </div>
                {content.selected_photo_id === 'none' && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>

              {/* Separator */}
              <div className="border-t my-1" />

              {/* Primary Photo Option */}
              <button
                onClick={() => {
                  updateField('selected_photo_id', null);
                  setPhotoPopoverOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
                  !content.selected_photo_id || content.selected_photo_id === primaryPhoto?.id ? 'bg-accent' : ''
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={primaryPhoto ? getPhotoPublicUrl(primaryPhoto.storage_path) : undefined}
                  />
                  <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">Primary Photo (Default)</p>
                  <p className="text-xs text-muted-foreground">
                    {primaryPhoto ? primaryPhoto.filename : 'No primary photo set'}
                  </p>
                </div>
                {(!content.selected_photo_id || content.selected_photo_id === primaryPhoto?.id) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>

              {/* Separator */}
              {photos.filter(p => !p.is_primary).length > 0 && (
                <div className="border-t my-1" />
              )}

              {/* Other Photos */}
              {photos.filter(p => !p.is_primary).map((photo) => {
                const isSelected = content.selected_photo_id === photo.id;
                return (
                  <button
                    key={photo.id}
                    onClick={() => {
                      updateField('selected_photo_id', photo.id);
                      setPhotoPopoverOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
                      isSelected ? 'bg-accent' : ''
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getPhotoPublicUrl(photo.storage_path)} />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{photo.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {(photo.file_size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
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

      {/* Work Experience Section */}
      <CVWorkExperienceSection
        cvId={cvId}
        workExperiences={workExperiences}
        onChange={setWorkExperiences}
        language={cv.language}
        showWorkExperience={cv.display_settings?.showWorkExperience !== false}
        onShowWorkExperienceChange={(show) => updateDisplaySettings('showWorkExperience', show)}
      />

      {/* Education Section */}
      <CVEducationSection
        cvId={cvId}
        educations={educations}
        onChange={setEducations}
        language={cv.language}
        showEducation={cv.display_settings?.showEducation !== false}
        onShowEducationChange={(show) => updateDisplaySettings('showEducation', show)}
      />

      {/* Skills Section */}
      <CVSkillCategoriesSection
        cvId={cvId}
        skillCategories={skillCategories}
        onChange={setSkillCategories}
        language={cv.language}
        showSkills={cv.display_settings?.showSkills !== false}
        onShowSkillsChange={(show) => updateDisplaySettings('showSkills', show)}
      />

      {/* Key Competences Section */}
      <CVKeyCompetencesSection
        cvId={cvId}
        keyCompetences={keyCompetences}
        onChange={setKeyCompetences}
        language={cv.language}
        showKeyCompetences={cv.display_settings?.showKeyCompetences !== false}
        onShowKeyCompetencesChange={(show) => updateDisplaySettings('showKeyCompetences', show)}
      />

      {/* Projects Section */}
      <CVProjectsSection
        cvId={cvId}
        projects={projects}
        onChange={setProjects}
        language={cv.language}
        showProjects={cv.display_settings?.showProjects !== false}
        onShowProjectsChange={(show) => updateDisplaySettings('showProjects', show)}
      />

      {/* Format Settings */}
      <FormatSettings
        displaySettings={cv.display_settings}
        onUpdateSettings={updateDisplaySettings}
      />

      {/* Preview Section */}
      <CVPreviewSection
        content={content}
        language={cv.language}
        displaySettings={cv.display_settings}
        photoUrl={photoUrl}
        userInitials={getUserInitials(user)}
        photos={photos}
        primaryPhoto={primaryPhoto}
        onPhotoSelect={(photoId) => updateField('selected_photo_id', photoId)}
        onFormatChange={(format) => updateDisplaySettings('format', format)}
        workExperiences={workExperiences}
        educations={educations}
        skillCategories={skillCategories}
        keyCompetences={keyCompetences}
        userProfile={user ? {
          id: user.id,
          user_id: user.id,
          first_name: getUserName(user).firstName,
          last_name: getUserName(user).lastName,
          email: user.email,
          phone: getUserPhone(user),
          location: getUserLocation(user),
          preferred_language: cv.language,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
        } : undefined}
      />

        </div>
      </div>
    </>
  );
}
