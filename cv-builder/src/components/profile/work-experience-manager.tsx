'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, Save, X, Loader2 } from 'lucide-react';
import {
  fetchWorkExperiences,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  autoSaveWorkExperience,
  type ProfileWorkExperience,
} from '@/services/profile-career.service';

export function WorkExperienceManager() {
  const [experiences, setExperiences] = useState<ProfileWorkExperience[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileWorkExperience>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load experiences on mount
  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    setLoading(true);
    const { data, error } = await fetchWorkExperiences();
    if (error) {
      console.error('Failed to load work experiences:', error);
    } else if (data) {
      setExperiences(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    const newExperience = {
      company: '',
      title: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      description: '',
      bullets: [],
      display_order: experiences.length,
    };

    const { data, error } = await createWorkExperience(newExperience);
    if (error) {
      console.error('Failed to create work experience:', error);
      alert('Failed to create work experience');
    } else if (data) {
      setExperiences([data, ...experiences]);
      setEditingId(data.id);
      setFormData(data);
    }
    setSaving(false);
  };

  const handleEdit = (experience: ProfileWorkExperience) => {
    setEditingId(experience.id);
    setFormData(experience);
  };

  const handleSave = async () => {
    if (!editingId) return;

    setSaving(true);
    const { data, error } = await updateWorkExperience(editingId, formData);
    if (error) {
      console.error('Failed to save work experience:', error);
      alert('Failed to save work experience');
    } else if (data) {
      setExperiences(experiences.map(exp =>
        exp.id === editingId ? data : exp
      ));
    }
    setEditingId(null);
    setFormData({});
    setSaving(false);
  };

  const handleCancel = () => {
    // If it's a new unsaved experience, delete it
    if (editingId && !experiences.find(e => e.id === editingId)?.company) {
      handleDelete(editingId);
    }
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work experience?')) {
      return;
    }

    setSaving(true);
    const { error } = await deleteWorkExperience(id);
    if (error) {
      console.error('Failed to delete work experience:', error);
      alert('Failed to delete work experience');
    } else {
      setExperiences(experiences.filter(e => e.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData({});
      }
    }
    setSaving(false);
  };

  // Auto-save handler
  const handleFieldChange = useCallback((field: keyof ProfileWorkExperience, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // Only auto-save if we're editing an existing entry with required fields
    if (editingId && updatedData.company && updatedData.title && updatedData.start_date) {
      autoSaveWorkExperience(editingId, updatedData);
    }
  }, [editingId, formData]);

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...(formData.bullets || [])];
    newBullets[index] = value;
    handleFieldChange('bullets', newBullets);
  };

  const handleAddBullet = () => {
    handleFieldChange('bullets', [...(formData.bullets || []), '']);
  };

  const handleRemoveBullet = (index: number) => {
    const newBullets = [...(formData.bullets || [])];
    newBullets.splice(index, 1);
    handleFieldChange('bullets', newBullets);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={editingId !== null || saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Experience
        </Button>
      </div>

      {/* Experience List */}
      {experiences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No work experience added yet.</p>
            <p className="text-sm mt-1">Click "Add Experience" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <Card key={experience.id}>
              {editingId === experience.id ? (
                // Edit Mode
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={formData.company || ''}
                        onChange={(e) => handleFieldChange('company', e.target.value)}
                        placeholder="Tech Corp Inc."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="month"
                        value={formData.start_date || ''}
                        onChange={(e) => handleFieldChange('start_date', e.target.value)}
                      />
                    </div>
                    {!formData.current && (
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="month"
                          value={formData.end_date || ''}
                          onChange={(e) => handleFieldChange('end_date', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="current"
                      checked={!!formData.current}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        const updatedData = {
                          ...formData,
                          current: isChecked,
                          end_date: isChecked ? '' : formData.end_date,
                        };
                        setFormData(updatedData);

                        // Auto-save if editing an existing entry with required fields
                        if (editingId && updatedData.company && updatedData.title && updatedData.start_date) {
                          autoSaveWorkExperience(editingId, updatedData);
                        }
                      }}
                    />
                    <Label htmlFor="current" className="text-sm font-normal cursor-pointer">
                      I currently work here
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Brief description of your role..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Key Achievements & Responsibilities</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddBullet}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Bullet
                      </Button>
                    </div>
                    {(formData.bullets || []).map((bullet, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={bullet}
                          onChange={(e) => handleBulletChange(index, e.target.value)}
                          placeholder="• Achieved X% increase in..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBullet(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!formData.title || !formData.company || !formData.start_date || saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              ) : (
                // View Mode
                <>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{experience.title}</CardTitle>
                        <CardDescription>
                          {experience.company}
                          {experience.location && ` • ${experience.location}`}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-1">
                          {experience.start_date} - {experience.current ? 'Present' : experience.end_date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(experience)}
                          disabled={editingId !== null || saving}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(experience.id)}
                          disabled={editingId !== null || saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {(experience.description || (experience.bullets && experience.bullets.length > 0)) && (
                    <CardContent>
                      {experience.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {experience.description}
                        </p>
                      )}
                      {experience.bullets && experience.bullets.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {experience.bullets.map((bullet, index) => (
                            <li key={index}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
