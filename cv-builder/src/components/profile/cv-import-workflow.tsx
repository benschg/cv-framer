'use client';

import { useState, useRef, DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  UploadArea,
  AnalyzingState,
  validateFile,
} from './ai-upload-shared';
import {
  Briefcase,
  GraduationCap,
  Code,
  Zap,
  Award,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Upload as UploadIcon,
} from 'lucide-react';
import type { CVExtractionResult } from '@/lib/ai/gemini';
import {
  bulkCreateWorkExperiences,
  bulkCreateEducations,
  bulkCreateSkillCategories,
  bulkCreateKeyCompetences,
  bulkCreateCertifications,
} from '@/services/profile-career.service';

interface CVImportWorkflowProps {
  onImportComplete: () => void;
}

type WorkflowStep = 'upload' | 'analyzing' | 'review' | 'importing' | 'complete';

interface ItemSelection {
  workExperiences: number[]; // Array of indices
  educations: number[];
  skillCategories: number[];
  keyCompetences: number[];
  certifications: number[];
}

interface ImportResult {
  success: boolean;
  count: number;
  error?: string;
}

export function CVImportWorkflow({ onImportComplete }: CVImportWorkflowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<CVExtractionResult | null>(null);
  const [itemSelection, setItemSelection] = useState<ItemSelection>({
    workExperiences: [],
    educations: [],
    skillCategories: [],
    keyCompetences: [],
    certifications: [],
  });
  const [importResults, setImportResults] = useState<Record<string, ImportResult>>({});

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file (PDF only)
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error!, {
        description: validation.errorDescription,
      });
      return;
    }

    // Check PDF specifically
    if (file.type !== 'application/pdf') {
      toast.error('Invalid file type', {
        description: 'Please upload a PDF file. Other formats are not currently supported.',
      });
      return;
    }

    setSelectedFile(file);
    setCurrentStep('analyzing');

    try {
      // Call CV analysis API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cv-upload/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Could not extract data from CV');
      }

      setExtractionResult(data);

      // Calculate total extracted items
      const totalItems = Object.values(data.sectionCounts as Record<string, number>).reduce(
        (sum, count) => sum + count,
        0
      );

      if (totalItems === 0) {
        toast.warning('No data extracted', {
          description: 'AI could not extract career information from this CV. The format may be unsupported.',
        });
        setCurrentStep('upload');
        setSelectedFile(null);
        return;
      }

      // Pre-select all items by default
      setItemSelection({
        workExperiences: data.extractedData.workExperiences.map((_: any, idx: number) => idx),
        educations: data.extractedData.educations.map((_: any, idx: number) => idx),
        skillCategories: data.extractedData.skillCategories.map((_: any, idx: number) => idx),
        keyCompetences: data.extractedData.keyCompetences.map((_: any, idx: number) => idx),
        certifications: data.extractedData.certifications.map((_: any, idx: number) => idx),
      });

      // Show success feedback
      toast.success(`Extracted ${totalItems} items from CV`, {
        description: 'Review the data below and select items to import.',
      });

      setCurrentStep('review');
    } catch (error) {
      console.error('CV analysis error:', error);
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      setCurrentStep('upload');
      setSelectedFile(null);
    }
  };

  const toggleItemSelection = (section: keyof ItemSelection, index: number) => {
    setItemSelection((prev) => {
      const currentSelection = prev[section];
      const isSelected = currentSelection.includes(index);

      return {
        ...prev,
        [section]: isSelected
          ? currentSelection.filter((i) => i !== index)
          : [...currentSelection, index].sort((a, b) => a - b),
      };
    });
  };

  const toggleSectionSelection = (section: keyof ItemSelection, totalItems: number) => {
    setItemSelection((prev) => {
      const allIndices = Array.from({ length: totalItems }, (_, i) => i);
      const isAllSelected = prev[section].length === totalItems;

      return {
        ...prev,
        [section]: isAllSelected ? [] : allIndices,
      };
    });
  };

  const handleImport = async () => {
    if (!extractionResult) return;

    setCurrentStep('importing');
    const results: Record<string, ImportResult> = {};

    try {
      // Import selected items sequentially
      // Filter out incomplete entries (null required fields) before importing
      if (itemSelection.workExperiences.length > 0) {
        const selectedItems = itemSelection.workExperiences
          .map((idx) => extractionResult.extractedData.workExperiences[idx])
          .filter((exp) => exp.company && exp.title && exp.start_date);

        if (selectedItems.length > 0) {
          const { data, error } = await bulkCreateWorkExperiences(
            selectedItems as any
          );
          results.workExperiences = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      if (itemSelection.educations.length > 0) {
        const selectedItems = itemSelection.educations
          .map((idx) => extractionResult.extractedData.educations[idx])
          .filter((edu) => edu.institution && edu.degree && edu.start_date);

        if (selectedItems.length > 0) {
          const { data, error } = await bulkCreateEducations(
            selectedItems as any
          );
          results.educations = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      if (itemSelection.skillCategories.length > 0) {
        const selectedItems = itemSelection.skillCategories
          .map((idx) => extractionResult.extractedData.skillCategories[idx])
          .filter((cat) => cat.category && cat.skills.length > 0);

        if (selectedItems.length > 0) {
          const { data, error } = await bulkCreateSkillCategories(
            selectedItems as any
          );
          results.skillCategories = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      if (itemSelection.keyCompetences.length > 0) {
        const selectedItems = itemSelection.keyCompetences
          .map((idx) => extractionResult.extractedData.keyCompetences[idx])
          .filter((comp) => comp.title);

        if (selectedItems.length > 0) {
          const { data, error } = await bulkCreateKeyCompetences(
            selectedItems as any
          );
          results.keyCompetences = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      if (itemSelection.certifications.length > 0) {
        const selectedItems = itemSelection.certifications
          .map((idx) => extractionResult.extractedData.certifications[idx])
          .filter((cert) => cert.name && cert.issuer);

        if (selectedItems.length > 0) {
          const { data, error } = await bulkCreateCertifications(
            selectedItems as any
          );
          results.certifications = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      setImportResults(results);

      // Show summary toast
      const successCount = Object.values(results).filter((r) => r.success).length;
      const totalImported = Object.values(results).reduce((sum, r) => sum + r.count, 0);

      if (successCount > 0) {
        toast.success(`Imported ${totalImported} items`, {
          description: `Successfully imported ${successCount} section(s).`,
        });
      } else {
        toast.error('Import failed', {
          description: 'No sections were imported successfully.',
        });
      }

      setCurrentStep('complete');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      setCurrentStep('review');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractionResult(null);
    setItemSelection({
      workExperiences: [],
      educations: [],
      skillCategories: [],
      keyCompetences: [],
      certifications: [],
    });
    setImportResults({});
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge variant="default" className="bg-green-500 text-xs">High</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    } else if (confidence > 0) {
      return <Badge variant="destructive" className="text-xs">Low</Badge>;
    }
    return null;
  };

  // Render upload step
  if (currentStep === 'upload') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Upload Your CV
          </CardTitle>
          <CardDescription>
            Upload a PDF version of your CV. AI will extract your work experience, education, skills, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadArea
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onChooseFile={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileChange={handleFileInputChange}
            documentType="CV (PDF only)"
          />
        </CardContent>
      </Card>
    );
  }

  // Render analyzing step
  if (currentStep === 'analyzing') {
    return (
      <Card>
        <CardContent className="py-12">
          <AnalyzingState documentType="CV" />
        </CardContent>
      </Card>
    );
  }

  // Render review step
  if (currentStep === 'review' && extractionResult) {
    const totalSelected =
      itemSelection.workExperiences.length +
      itemSelection.educations.length +
      itemSelection.skillCategories.length +
      itemSelection.keyCompetences.length +
      itemSelection.certifications.length;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Review & Select Items to Import</CardTitle>
            <CardDescription>
              Select individual items to import. Imported data will be added to your existing profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File info */}
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  <UploadIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalSelected} items selected for import
                  </p>
                </div>
              </div>
            )}

            {/* Work Experience Items */}
            {extractionResult.extractedData.workExperiences.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Work Experience</h3>
                    <Badge variant="outline" className="text-xs">
                      {itemSelection.workExperiences.length}/{extractionResult.extractedData.workExperiences.length}
                    </Badge>
                    {getConfidenceBadge(extractionResult.confidence.workExperiences)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSectionSelection('workExperiences', extractionResult.extractedData.workExperiences.length)}
                  >
                    {itemSelection.workExperiences.length === extractionResult.extractedData.workExperiences.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="space-y-2">
                  {extractionResult.extractedData.workExperiences.map((exp, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={`work-${idx}`}
                        checked={itemSelection.workExperiences.includes(idx)}
                        onCheckedChange={() => toggleItemSelection('workExperiences', idx)}
                        className="mt-0.5"
                      />
                      <label htmlFor={`work-${idx}`} className="flex-1 cursor-pointer">
                        <p className="text-sm font-medium">{exp.title || 'Untitled Position'}</p>
                        <p className="text-xs text-muted-foreground">{exp.company || 'Unknown Company'}</p>
                        {(exp.start_date || exp.end_date) && (
                          <p className="text-xs text-muted-foreground">
                            {exp.start_date || '?'} - {exp.current ? 'Present' : exp.end_date || '?'}
                          </p>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Items */}
            {extractionResult.extractedData.educations.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Education</h3>
                      <Badge variant="outline" className="text-xs">
                        {itemSelection.educations.length}/{extractionResult.extractedData.educations.length}
                      </Badge>
                      {getConfidenceBadge(extractionResult.confidence.educations)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionSelection('educations', extractionResult.extractedData.educations.length)}
                    >
                      {itemSelection.educations.length === extractionResult.extractedData.educations.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {extractionResult.extractedData.educations.map((edu, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <Checkbox
                          id={`edu-${idx}`}
                          checked={itemSelection.educations.includes(idx)}
                          onCheckedChange={() => toggleItemSelection('educations', idx)}
                          className="mt-0.5"
                        />
                        <label htmlFor={`edu-${idx}`} className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium">{edu.degree || 'Untitled Degree'}</p>
                          <p className="text-xs text-muted-foreground">
                            {edu.field && `${edu.field} • `}{edu.institution || 'Unknown Institution'}
                          </p>
                          {(edu.start_date || edu.end_date) && (
                            <p className="text-xs text-muted-foreground">
                              {edu.start_date || '?'} - {edu.end_date || 'Present'}
                            </p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Skills Items */}
            {extractionResult.extractedData.skillCategories.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Skills</h3>
                      <Badge variant="outline" className="text-xs">
                        {itemSelection.skillCategories.length}/{extractionResult.extractedData.skillCategories.length}
                      </Badge>
                      {getConfidenceBadge(extractionResult.confidence.skillCategories)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionSelection('skillCategories', extractionResult.extractedData.skillCategories.length)}
                    >
                      {itemSelection.skillCategories.length === extractionResult.extractedData.skillCategories.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {extractionResult.extractedData.skillCategories.map((cat, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <Checkbox
                          id={`skill-${idx}`}
                          checked={itemSelection.skillCategories.includes(idx)}
                          onCheckedChange={() => toggleItemSelection('skillCategories', idx)}
                          className="mt-0.5"
                        />
                        <label htmlFor={`skill-${idx}`} className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium">{cat.category || 'Untitled Category'}</p>
                          <p className="text-xs text-muted-foreground">
                            {cat.skills.slice(0, 5).join(', ')}{cat.skills.length > 5 ? '...' : ''}
                          </p>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Key Competences Items */}
            {extractionResult.extractedData.keyCompetences.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Key Competences</h3>
                      <Badge variant="outline" className="text-xs">
                        {itemSelection.keyCompetences.length}/{extractionResult.extractedData.keyCompetences.length}
                      </Badge>
                      {getConfidenceBadge(extractionResult.confidence.keyCompetences)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionSelection('keyCompetences', extractionResult.extractedData.keyCompetences.length)}
                    >
                      {itemSelection.keyCompetences.length === extractionResult.extractedData.keyCompetences.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {extractionResult.extractedData.keyCompetences.map((comp, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <Checkbox
                          id={`comp-${idx}`}
                          checked={itemSelection.keyCompetences.includes(idx)}
                          onCheckedChange={() => toggleItemSelection('keyCompetences', idx)}
                          className="mt-0.5"
                        />
                        <label htmlFor={`comp-${idx}`} className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium">{comp.title || 'Untitled Competence'}</p>
                          {comp.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{comp.description}</p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Certifications Items */}
            {extractionResult.extractedData.certifications.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Certifications</h3>
                      <Badge variant="outline" className="text-xs">
                        {itemSelection.certifications.length}/{extractionResult.extractedData.certifications.length}
                      </Badge>
                      {getConfidenceBadge(extractionResult.confidence.certifications)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionSelection('certifications', extractionResult.extractedData.certifications.length)}
                    >
                      {itemSelection.certifications.length === extractionResult.extractedData.certifications.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {extractionResult.extractedData.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <Checkbox
                          id={`cert-${idx}`}
                          checked={itemSelection.certifications.includes(idx)}
                          onCheckedChange={() => toggleItemSelection('certifications', idx)}
                          className="mt-0.5"
                        />
                        <label htmlFor={`cert-${idx}`} className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium">{cert.name || 'Untitled Certification'}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer || 'Unknown Issuer'}</p>
                          {cert.date && (
                            <p className="text-xs text-muted-foreground">Issued: {cert.date}</p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Data will be merged info */}
            <div className="flex items-start gap-2 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Data will be merged
                </p>
                <p className="text-blue-700 dark:text-blue-200">
                  Imported items will be added to your existing profile. Existing entries will not be replaced or modified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={totalSelected === 0}>
            Import {totalSelected > 0 ? `${totalSelected} Item${totalSelected !== 1 ? 's' : ''}` : 'Selected Items'}
          </Button>
        </div>
      </div>
    );
  }

  // Render importing step
  if (currentStep === 'importing') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <h3 className="text-lg font-medium mb-2">Importing data...</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we import your career information
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render complete step
  if (currentStep === 'complete') {
    const successCount = Object.values(importResults).filter((r) => r.success).length;
    const totalCount = Object.keys(importResults).length;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {successCount === totalCount ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Import Complete
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Import Completed with Errors
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show import results per section */}
          {Object.entries(importResults).map(([section, result]) => (
            <div key={section} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium capitalize">
                {section.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {result.success ? (
                <Badge variant="default" className="bg-green-500">
                  {result.count} imported
                </Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Import Another CV
            </Button>
            <Button onClick={onImportComplete} className="flex-1">
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
