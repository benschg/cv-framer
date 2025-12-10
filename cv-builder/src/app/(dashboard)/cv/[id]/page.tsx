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
  Share2,
  Sparkles,
  Loader2,
  Eye,
  Settings,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { fetchCV, updateCV, generateId } from '@/services/cv.service';
import type { CVDocument, CVContent, WorkExperience, Education, SkillCategory, KeyCompetence } from '@/types/cv.types';

export default function CVEditorPage() {
  const params = useParams();
  const router = useRouter();
  const cvId = params.id as string;

  const [cv, setCv] = useState<CVDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable content
  const [content, setContent] = useState<CVContent>({});

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

  const handleSave = async () => {
    if (!cv) return;
    setSaving(true);
    const result = await updateCV(cvId, { content });
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
        <Link href="/cv">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to CVs
          </Button>
        </Link>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'CV not found'}</p>
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
          <Link href="/cv">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{cv.name}</h1>
            {cv.job_context?.company && (
              <p className="text-sm text-muted-foreground">
                {cv.job_context.position} at {cv.job_context.company}
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
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Share2 className="h-4 w-4" />
            Share
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
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">AI-Powered Generation</p>
                <p className="text-sm text-muted-foreground">
                  Generate content from your Werbeflaechen data
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content
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
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="e.g., Senior Software Engineer | React & Node.js"
              value={content.tagline || ''}
              onChange={(e) => updateField('tagline', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile">Professional Summary</Label>
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
                  <Label>Key Achievements (one per line)</Label>
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

      {/* Bottom Save Button */}
      <div className="flex justify-end gap-2 pb-8">
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
  );
}
