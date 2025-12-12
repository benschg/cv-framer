'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import type { ParsedJobPosting } from '@/services/job-parser.service';

export interface AutoFillField {
  key: keyof ParsedJobPosting;
  label: string;
  value: string;
  enabled: boolean;
  multiline?: boolean;
  notFound?: boolean;
}

interface AutoFillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ParsedJobPosting | null;
  isLoading: boolean;
  onApply: (fields: Record<string, string>) => void;
  fieldLabels?: Partial<Record<keyof ParsedJobPosting, string>>;
  visibleFields?: (keyof ParsedJobPosting)[];
}

const defaultFieldLabels: Record<keyof ParsedJobPosting, string> = {
  company: 'Company',
  position: 'Position',
  jobDescription: 'Job Description',
  location: 'Location',
  employmentType: 'Employment Type',
  salary: 'Salary',
  contactName: 'Contact Name',
  contactEmail: 'Contact Email',
};

const defaultVisibleFields: (keyof ParsedJobPosting)[] = [
  'company',
  'position',
  'location',
  'salary',
  'contactName',
  'contactEmail',
  'jobDescription',
];

export function AutoFillDialog({
  open,
  onOpenChange,
  data,
  isLoading,
  onApply,
  fieldLabels = {},
  visibleFields = defaultVisibleFields,
}: AutoFillDialogProps) {
  const [fields, setFields] = useState<AutoFillField[]>([]);

  // Initialize fields when data changes
  useEffect(() => {
    if (data) {
      const newFields: AutoFillField[] = visibleFields.map((key) => ({
        key,
        label: fieldLabels[key] || defaultFieldLabels[key],
        value: data[key] || '',
        enabled: !!data[key], // Only enable fields that have values
        multiline: key === 'jobDescription',
        notFound: !data[key], // Mark fields that couldn't be extracted
      }));
      setFields(newFields);
    }
  }, [data, fieldLabels, visibleFields]);

  const handleToggleField = (index: number) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const handleUpdateValue = (index: number, value: string) => {
    setFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, value } : field))
    );
  };

  const handleApply = () => {
    const result: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.enabled && field.value.trim()) {
        result[field.key] = field.value.trim();
      }
    });
    onApply(result);
    onOpenChange(false);
  };

  const handleSelectAll = () => {
    setFields((prev) => prev.map((field) => ({ ...field, enabled: true })));
  };

  const handleDeselectAll = () => {
    setFields((prev) => prev.map((field) => ({ ...field, enabled: false })));
  };

  const enabledCount = fields.filter((f) => f.enabled).length;
  const foundCount = fields.filter((f) => !f.notFound).length;
  const notFoundCount = fields.filter((f) => f.notFound).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auto-fill Results</DialogTitle>
          <DialogDescription>
            Review and edit the extracted information. Check the fields you want to use.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Extracting job details...</span>
          </div>
        ) : foundCount === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No information could be extracted from the job posting.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-sm text-muted-foreground">
                {enabledCount} of {fields.length} fields selected
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Found fields */}
              {fields.filter(f => !f.notFound).map((field) => {
                const index = fields.findIndex(f => f.key === field.key);
                return (
                  <div
                    key={field.key}
                    className={`rounded-lg border p-4 transition-colors ${
                      field.enabled ? 'bg-background' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`field-${field.key}`}
                        checked={field.enabled}
                        onCheckedChange={() => handleToggleField(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor={`field-${field.key}`}
                          className="font-medium cursor-pointer"
                        >
                          {field.label}
                        </Label>
                        {field.multiline ? (
                          <Textarea
                            value={field.value}
                            onChange={(e) => handleUpdateValue(index, e.target.value)}
                            disabled={!field.enabled}
                            rows={4}
                            className="resize-none"
                          />
                        ) : (
                          <Input
                            value={field.value}
                            onChange={(e) => handleUpdateValue(index, e.target.value)}
                            disabled={!field.enabled}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Not found fields */}
              {notFoundCount > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <AlertCircle className="h-4 w-4" />
                    <span>Not found in job posting ({notFoundCount})</span>
                  </div>
                  <div className="space-y-2">
                    {fields.filter(f => f.notFound).map((field) => (
                      <div
                        key={field.key}
                        className="flex items-center gap-3 rounded-lg border border-dashed p-3 bg-muted/30"
                      >
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{field.label}</span>
                        <span className="text-xs text-muted-foreground/60 ml-auto">Not found</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isLoading || enabledCount === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Apply {enabledCount > 0 ? `(${enabledCount})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
