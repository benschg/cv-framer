'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, X, ExternalLink, Upload, FileText, Image as ImageIcon, Mail, Phone } from 'lucide-react';
import { generateId } from '@/services/cv.service';
import type { Reference } from '@/types/cv.types';

export function ReferencesManager() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Reference>>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const newReference: Reference = {
      id: generateId(),
      name: '',
      title: '',
      company: '',
      relationship: '',
      email: '',
      phone: '',
      quote: '',
      linkedPosition: '',
    };
    setReferences([newReference, ...references]);
    setEditingId(newReference.id);
    setFormData(newReference);
  };

  const handleEdit = (ref: Reference) => {
    setEditingId(ref.id);
    setFormData(ref);
  };

  const handleSave = () => {
    if (!editingId) return;

    setReferences(references.map(ref =>
      ref.id === editingId
        ? { ...ref, ...formData }
        : ref
    ));
    setEditingId(null);
    setFormData({});
  };

  const handleCancel = () => {
    // If it's a new unsaved reference, remove it
    if (editingId && !references.find(r => r.id === editingId)?.name) {
      setReferences(references.filter(r => r.id !== editingId));
    }
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setReferences(references.filter(r => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormData({});
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images and PDFs only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload an image (JPG, PNG, WebP) or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadingFile(true);

    try {
      // TODO: Upload to storage when API is ready
      // For now, create a local object URL for preview
      const objectUrl = URL.createObjectURL(file);

      setFormData({
        ...formData,
        documentUrl: objectUrl,
        documentName: file.name,
      });
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDocument = () => {
    setFormData({
      ...formData,
      documentUrl: undefined,
      documentName: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={editingId !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reference
        </Button>
      </div>

      {/* References List */}
      {references.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No references added yet.</p>
            <p className="text-sm mt-1">Click "Add Reference" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {references.map((ref) => (
            <Card key={ref.id}>
              {editingId === ref.id ? (
                // Edit Mode
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship *</Label>
                      <Select
                        value={formData.relationship || ''}
                        onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                      >
                        <SelectTrigger id="relationship">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Colleague">Colleague</SelectItem>
                          <SelectItem value="Team Lead">Team Lead</SelectItem>
                          <SelectItem value="Professor">Professor</SelectItem>
                          <SelectItem value="Academic Advisor">Academic Advisor</SelectItem>
                          <SelectItem value="Client">Client</SelectItem>
                          <SelectItem value="Mentor">Mentor</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john.smith@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedPosition">Link to Work Experience (Optional)</Label>
                    <Input
                      id="linkedPosition"
                      value={formData.linkedPosition || ''}
                      onChange={(e) => setFormData({ ...formData, linkedPosition: e.target.value })}
                      placeholder="Software Engineer at Acme Inc."
                    />
                    <p className="text-xs text-muted-foreground">
                      Link this reference to a specific position from your work experience
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quote">Testimonial Quote (Optional)</Label>
                    <Textarea
                      id="quote"
                      value={formData.quote || ''}
                      onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                      placeholder="A brief testimonial or recommendation quote..."
                      rows={3}
                    />
                  </div>

                  {/* Reference Letter Upload */}
                  <div className="space-y-2">
                    <Label>Reference Letter</Label>
                    {formData.documentUrl ? (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <div className="flex-shrink-0">
                          {formData.documentName?.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="h-8 w-8 text-red-500" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{formData.documentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formData.documentName?.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'Image'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(formData.documentUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveDocument}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFile}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingFile ? 'Uploading...' : 'Upload Reference Letter (Image or PDF)'}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          Accepted formats: JPG, PNG, WebP, PDF (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!formData.name || !formData.title || !formData.company}
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
                        <CardTitle>{ref.name}</CardTitle>
                        <CardDescription>
                          {ref.relationship && `${ref.relationship} • `}
                          {ref.title} at {ref.company}
                        </CardDescription>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          {ref.email && (
                            <a
                              href={`mailto:${ref.email}`}
                              className="inline-flex items-center gap-1 hover:text-primary"
                            >
                              <Mail className="h-3 w-3" />
                              {ref.email}
                            </a>
                          )}
                          {ref.phone && (
                            <a
                              href={`tel:${ref.phone}`}
                              className="inline-flex items-center gap-1 hover:text-primary"
                            >
                              <Phone className="h-3 w-3" />
                              {ref.phone}
                            </a>
                          )}
                        </div>
                        {ref.linkedPosition && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Linked to: </span>
                            <span className="font-medium">{ref.linkedPosition}</span>
                          </div>
                        )}
                        {ref.quote && (
                          <blockquote className="mt-3 pl-4 border-l-2 border-muted text-sm italic text-muted-foreground">
                            "{ref.quote}"
                          </blockquote>
                        )}
                        {ref.documentUrl && (
                          <div className="mt-3">
                            <a
                              href={ref.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              {ref.documentName?.toLowerCase().endsWith('.pdf') ? (
                                <FileText className="h-3 w-3" />
                              ) : (
                                <ImageIcon className="h-3 w-3" />
                              )}
                              View reference letter
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ref)}
                          disabled={editingId !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ref.id)}
                          disabled={editingId !== null}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
