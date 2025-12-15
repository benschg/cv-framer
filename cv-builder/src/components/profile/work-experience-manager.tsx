'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react';
import { generateId } from '@/services/cv.service';
import type { WorkExperience } from '@/types/cv.types';

export function WorkExperienceManager() {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WorkExperience>>({});

  const handleAdd = () => {
    const newExperience: WorkExperience = {
      id: generateId(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bullets: [],
    };
    setExperiences([newExperience, ...experiences]);
    setEditingId(newExperience.id);
    setFormData(newExperience);
  };

  const handleEdit = (experience: WorkExperience) => {
    setEditingId(experience.id);
    setFormData(experience);
  };

  const handleSave = () => {
    if (!editingId) return;

    setExperiences(experiences.map(exp =>
      exp.id === editingId
        ? { ...exp, ...formData }
        : exp
    ));
    setEditingId(null);
    setFormData({});
  };

  const handleCancel = () => {
    // If it's a new unsaved experience, remove it
    if (editingId && !experiences.find(e => e.id === editingId)?.company) {
      setExperiences(experiences.filter(e => e.id !== editingId));
    }
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setExperiences(experiences.filter(e => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormData({});
    }
  };

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...(formData.bullets || [])];
    newBullets[index] = value;
    setFormData({ ...formData, bullets: newBullets });
  };

  const handleAddBullet = () => {
    setFormData({
      ...formData,
      bullets: [...(formData.bullets || []), '']
    });
  };

  const handleRemoveBullet = (index: number) => {
    const newBullets = [...(formData.bullets || [])];
    newBullets.splice(index, 1);
    setFormData({ ...formData, bullets: newBullets });
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={editingId !== null}>
          <Plus className="h-4 w-4 mr-2" />
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
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={formData.company || ''}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Tech Corp Inc."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="month"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="month"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        disabled={formData.current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="current"
                      checked={formData.current || false}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, current: checked as boolean, endDate: checked ? undefined : formData.endDate })
                      }
                    />
                    <Label htmlFor="current" className="text-sm font-normal cursor-pointer">
                      I currently work here
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!formData.title || !formData.company || !formData.startDate}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
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
                          {experience.startDate} - {experience.current ? 'Present' : experience.endDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(experience)}
                          disabled={editingId !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(experience.id)}
                          disabled={editingId !== null}
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
