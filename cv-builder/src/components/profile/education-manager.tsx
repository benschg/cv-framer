'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { generateId } from '@/services/cv.service';
import type { Education } from '@/types/cv.types';

export function EducationManager() {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Education>>({});

  const handleAdd = () => {
    const newEducation: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
      grade: '',
    };
    setEducationList([newEducation, ...educationList]);
    setEditingId(newEducation.id);
    setFormData(newEducation);
  };

  const handleEdit = (education: Education) => {
    setEditingId(education.id);
    setFormData(education);
  };

  const handleSave = () => {
    if (!editingId) return;

    setEducationList(educationList.map(edu =>
      edu.id === editingId
        ? { ...edu, ...formData }
        : edu
    ));
    setEditingId(null);
    setFormData({});
  };

  const handleCancel = () => {
    // If it's a new unsaved education, remove it
    if (editingId && !educationList.find(e => e.id === editingId)?.institution) {
      setEducationList(educationList.filter(e => e.id !== editingId));
    }
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setEducationList(educationList.filter(e => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormData({});
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={editingId !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      {/* Education List */}
      {educationList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No education added yet.</p>
            <p className="text-sm mt-1">Click "Add Education" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {educationList.map((education) => (
            <Card key={education.id}>
              {editingId === education.id ? (
                // Edit Mode
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree *</Label>
                      <Input
                        id="degree"
                        value={formData.degree || ''}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="field">Field of Study</Label>
                      <Input
                        id="field"
                        value={formData.field || ''}
                        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution *</Label>
                    <Input
                      id="institution"
                      value={formData.institution || ''}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="University of California, Berkeley"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade/GPA</Label>
                      <Input
                        id="grade"
                        value={formData.grade || ''}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="3.8 GPA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Honors, relevant coursework, thesis topic..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!formData.degree || !formData.institution || !formData.startDate}
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
                        <CardTitle>
                          {education.degree}
                          {education.field && ` in ${education.field}`}
                        </CardTitle>
                        <CardDescription>{education.institution}</CardDescription>
                        <p className="text-sm text-muted-foreground mt-1">
                          {education.startDate} - {education.endDate || 'Present'}
                          {education.grade && ` • ${education.grade}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(education)}
                          disabled={editingId !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(education.id)}
                          disabled={editingId !== null}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {education.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {education.description}
                      </p>
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
