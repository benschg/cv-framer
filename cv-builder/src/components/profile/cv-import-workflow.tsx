'use client';

import { useState, useRef, DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

interface SectionSelection {
  workExperiences: boolean;
  educations: boolean;
  skillCategories: boolean;
  keyCompetences: boolean;
  certifications: boolean;
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
  const [sectionSelection, setSectionSelection] = useState<SectionSelection>({
    workExperiences: true,
    educations: true,
    skillCategories: true,
    keyCompetences: true,
    certifications: true,
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

      // Show success feedback
      toast.success(`Extracted ${totalItems} items from CV`, {
        description: 'Review the data below and select sections to import.',
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

  const handleImport = async () => {
    if (!extractionResult) return;

    setCurrentStep('importing');
    const results: Record<string, ImportResult> = {};

    try {
      // Import selected sections sequentially
      // Filter out incomplete entries (null required fields) before importing
      if (sectionSelection.workExperiences && extractionResult.extractedData.workExperiences.length > 0) {
        const validExperiences = extractionResult.extractedData.workExperiences.filter(
          (exp) => exp.company && exp.title && exp.start_date
        );
        if (validExperiences.length > 0) {
          const { data, error } = await bulkCreateWorkExperiences(
            validExperiences as any // Cast to bypass null check since we filtered
          );
          results.workExperiences = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      if (sectionSelection.educations && extractionResult.extractedData.educations.length > 0) {
        const validEducations = extractionResult.extractedData.educations.filter(
          (edu) => edu.institution && edu.degree && edu.start_date
        );
        if (validEducations.length > 0) {
          const { data, error } = await bulkCreateEducations(
            validEducations as any // Cast to bypass null check since we filtered
          );
          results.educations = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      if (sectionSelection.skillCategories && extractionResult.extractedData.skillCategories.length > 0) {
        const validCategories = extractionResult.extractedData.skillCategories.filter(
          (cat) => cat.category && cat.skills.length > 0
        );
        if (validCategories.length > 0) {
          const { data, error } = await bulkCreateSkillCategories(
            validCategories as any // Cast to bypass null check since we filtered
          );
          results.skillCategories = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      if (sectionSelection.keyCompetences && extractionResult.extractedData.keyCompetences.length > 0) {
        const validCompetences = extractionResult.extractedData.keyCompetences.filter(
          (comp) => comp.title
        );
        if (validCompetences.length > 0) {
          const { data, error } = await bulkCreateKeyCompetences(
            validCompetences as any // Cast to bypass null check since we filtered
          );
          results.keyCompetences = {
            success: !error,
            count: data?.length || 0,
            error: error?.message,
          };
        }
      }

      if (sectionSelection.certifications && extractionResult.extractedData.certifications.length > 0) {
        const validCertifications = extractionResult.extractedData.certifications.filter(
          (cert) => cert.name && cert.issuer
        );
        if (validCertifications.length > 0) {
          const { data, error } = await bulkCreateCertifications(
            validCertifications as any // Cast to bypass null check since we filtered
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
    setSectionSelection({
      workExperiences: true,
      educations: true,
      skillCategories: true,
      keyCompetences: true,
      certifications: true,
    });
    setImportResults({});
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge variant="default" className="bg-green-500">High Confidence</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge variant="secondary">Medium Confidence</Badge>;
    } else if (confidence > 0) {
      return <Badge variant="destructive">Low Confidence</Badge>;
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
    const hasAnySelection = Object.values(sectionSelection).some((v) => v);
    const totalSelected = Object.entries(sectionSelection)
      .filter(([key, value]) => value && extractionResult.sectionCounts[key as keyof typeof extractionResult.sectionCounts] > 0)
      .reduce((sum, [key]) => sum + extractionResult.sectionCounts[key as keyof typeof extractionResult.sectionCounts], 0);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Extracted Data</CardTitle>
            <CardDescription>
              Select which sections to import. Extracted data will be added to your existing profile.
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

            {/* Section checkboxes */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Select sections to import:</h3>

              {/* Work Experience */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="work-exp"
                    checked={sectionSelection.workExperiences}
                    onCheckedChange={(checked) =>
                      setSectionSelection((prev) => ({ ...prev, workExperiences: !!checked }))
                    }
                    disabled={extractionResult.sectionCounts.workExperiences === 0}
                  />
                  <label htmlFor="work-exp" className="flex items-center gap-2 cursor-pointer">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">Work Experience</span>
                    <Badge variant="outline">{extractionResult.sectionCounts.workExperiences} items</Badge>
                  </label>
                </div>
                {getConfidenceBadge(extractionResult.confidence.workExperiences)}
              </div>

              {/* Education */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="education"
                    checked={sectionSelection.educations}
                    onCheckedChange={(checked) =>
                      setSectionSelection((prev) => ({ ...prev, educations: !!checked }))
                    }
                    disabled={extractionResult.sectionCounts.educations === 0}
                  />
                  <label htmlFor="education" className="flex items-center gap-2 cursor-pointer">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-medium">Education</span>
                    <Badge variant="outline">{extractionResult.sectionCounts.educations} items</Badge>
                  </label>
                </div>
                {getConfidenceBadge(extractionResult.confidence.educations)}
              </div>

              {/* Skills */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="skills"
                    checked={sectionSelection.skillCategories}
                    onCheckedChange={(checked) =>
                      setSectionSelection((prev) => ({ ...prev, skillCategories: !!checked }))
                    }
                    disabled={extractionResult.sectionCounts.skillCategories === 0}
                  />
                  <label htmlFor="skills" className="flex items-center gap-2 cursor-pointer">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">Skills</span>
                    <Badge variant="outline">{extractionResult.sectionCounts.skillCategories} categories</Badge>
                  </label>
                </div>
                {getConfidenceBadge(extractionResult.confidence.skillCategories)}
              </div>

              {/* Key Competences */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="competences"
                    checked={sectionSelection.keyCompetences}
                    onCheckedChange={(checked) =>
                      setSectionSelection((prev) => ({ ...prev, keyCompetences: !!checked }))
                    }
                    disabled={extractionResult.sectionCounts.keyCompetences === 0}
                  />
                  <label htmlFor="competences" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Key Competences</span>
                    <Badge variant="outline">{extractionResult.sectionCounts.keyCompetences} items</Badge>
                  </label>
                </div>
                {getConfidenceBadge(extractionResult.confidence.keyCompetences)}
              </div>

              {/* Certifications */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="certifications"
                    checked={sectionSelection.certifications}
                    onCheckedChange={(checked) =>
                      setSectionSelection((prev) => ({ ...prev, certifications: !!checked }))
                    }
                    disabled={extractionResult.sectionCounts.certifications === 0}
                  />
                  <label htmlFor="certifications" className="flex items-center gap-2 cursor-pointer">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Certifications</span>
                    <Badge variant="outline">{extractionResult.sectionCounts.certifications} items</Badge>
                  </label>
                </div>
                {getConfidenceBadge(extractionResult.confidence.certifications)}
              </div>
            </div>

            {/* Confidence warning */}
            {Object.values(extractionResult.confidence).some((c) => c < 0.7 && c > 0) && (
              <div className="flex items-start gap-2 p-3 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Low confidence detected
                  </p>
                  <p className="text-amber-700 dark:text-amber-200">
                    Some sections have low extraction confidence. Please review imported data carefully and edit as needed.
                  </p>
                </div>
              </div>
            )}

            {/* Data will be merged info */}
            <div className="flex items-start gap-2 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Data will be merged
                </p>
                <p className="text-blue-700 dark:text-blue-200">
                  Imported data will be added to your existing profile. Existing entries will not be replaced or modified.
                </p>
              </div>
            </div>

            {/* Reasoning */}
            {extractionResult.reasoning && (
              <div className="text-sm text-muted-foreground italic border-l-2 pl-3">
                {extractionResult.reasoning}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!hasAnySelection || totalSelected === 0}>
            Import {totalSelected > 0 ? `${totalSelected} Items` : 'Selected Sections'}
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
