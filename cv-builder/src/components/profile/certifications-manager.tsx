'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, X, ExternalLink, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { generateId } from '@/services/cv.service';
import type { Certification } from '@/types/cv.types';

export function CertificationsManager() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Certification>>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const newCertification: Certification = {
      id: generateId(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      url: '',
      credentialId: '',
    };
    setCertifications([newCertification, ...certifications]);
    setEditingId(newCertification.id);
    setFormData(newCertification);
  };

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setFormData(cert);
  };

  const handleSave = () => {
    if (!editingId) return;

    setCertifications(certifications.map(cert =>
      cert.id === editingId
        ? { ...cert, ...formData }
        : cert
    ));
    setEditingId(null);
    setFormData({});
  };

  const handleCancel = () => {
    // If it's a new unsaved certification, remove it
    if (editingId && !certifications.find(c => c.id === editingId)?.name) {
      setCertifications(certifications.filter(c => c.id !== editingId));
    }
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setCertifications(certifications.filter(c => c.id !== id));
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
          Add Certification
        </Button>
      </div>

      {/* Certifications List */}
      {certifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No certifications added yet.</p>
            <p className="text-sm mt-1">Click "Add Certification" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <Card key={cert.id}>
              {editingId === cert.id ? (
                // Edit Mode
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Certification Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issuer">Issuing Organization *</Label>
                      <Input
                        id="issuer"
                        value={formData.issuer || ''}
                        onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                        placeholder="Amazon Web Services"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Issue Date</Label>
                      <Input
                        id="date"
                        type="month"
                        value={formData.date || ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="month"
                        value={formData.expiryDate || ''}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty if it doesn't expire
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentialId">Credential ID</Label>
                    <Input
                      id="credentialId"
                      value={formData.credentialId || ''}
                      onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                      placeholder="ABC123XYZ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Verification URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url || ''}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  {/* Certificate Document Upload */}
                  <div className="space-y-2">
                    <Label>Certificate Document</Label>
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
                          {uploadingFile ? 'Uploading...' : 'Upload Certificate (Image or PDF)'}
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
                      disabled={!formData.name || !formData.issuer}
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
                        <CardTitle>{cert.name}</CardTitle>
                        <CardDescription>{cert.issuer}</CardDescription>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                          {cert.date && <span>Issued {cert.date}</span>}
                          {cert.expiryDate && <span>• Expires {cert.expiryDate}</span>}
                          {cert.credentialId && <span>• ID: {cert.credentialId}</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              Verify credential
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {cert.documentUrl && (
                            <a
                              href={cert.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              {cert.documentName?.toLowerCase().endsWith('.pdf') ? (
                                <FileText className="h-3 w-3" />
                              ) : (
                                <ImageIcon className="h-3 w-3" />
                              )}
                              View certificate
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(cert)}
                          disabled={editingId !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cert.id)}
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
