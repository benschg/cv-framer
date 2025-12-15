'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { generateId } from '@/services/cv.service';
import type { SkillCategory } from '@/types/cv.types';

export function SkillsManager() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SkillCategory>>({});
  const [skillInput, setSkillInput] = useState('');

  const handleAdd = () => {
    const newCategory: SkillCategory = {
      id: generateId(),
      category: '',
      skills: [],
    };
    setSkillCategories([newCategory, ...skillCategories]);
    setEditingId(newCategory.id);
    setFormData(newCategory);
  };

  const handleEdit = (category: SkillCategory) => {
    setEditingId(category.id);
    setFormData(category);
    setSkillInput('');
  };

  const handleSave = () => {
    if (!editingId) return;

    setSkillCategories(skillCategories.map(cat =>
      cat.id === editingId
        ? { ...cat, ...formData }
        : cat
    ));
    setEditingId(null);
    setFormData({});
    setSkillInput('');
  };

  const handleCancel = () => {
    // If it's a new unsaved category, remove it
    if (editingId && !skillCategories.find(c => c.id === editingId)?.category) {
      setSkillCategories(skillCategories.filter(c => c.id !== editingId));
    }
    setEditingId(null);
    setFormData({});
    setSkillInput('');
  };

  const handleDelete = (id: string) => {
    setSkillCategories(skillCategories.filter(c => c.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormData({});
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;

    setFormData({
      ...formData,
      skills: [...(formData.skills || []), skillInput.trim()]
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...(formData.skills || [])];
    newSkills.splice(index, 1);
    setFormData({ ...formData, skills: newSkills });
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={editingId !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Skills List */}
      {skillCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No skill categories added yet.</p>
            <p className="text-sm mt-1">Click "Add Category" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {skillCategories.map((category) => (
            <Card key={category.id}>
              {editingId === category.id ? (
                // Edit Mode
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category Name *</Label>
                    <Input
                      id="category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Programming Languages, Tools, Frameworks"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Type a skill and press Enter"
                      />
                      <Button type="button" variant="outline" onClick={handleAddSkill}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {(formData.skills || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(formData.skills || []).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(index)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!formData.category || !formData.skills || formData.skills.length === 0}
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
                        <CardTitle>{category.category}</CardTitle>
                        <CardDescription>{category.skills.length} skills</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          disabled={editingId !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={editingId !== null}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
