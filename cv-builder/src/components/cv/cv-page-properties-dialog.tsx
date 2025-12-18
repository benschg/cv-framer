'use client';

import { Settings } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DisplaySettings } from '@/types/cv.types';

interface CVPagePropertiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageIndex: number;
  displaySettings?: Partial<DisplaySettings> | null;
  onSettingChange?: (key: keyof DisplaySettings, value: unknown) => void;
}

export function CVPagePropertiesDialog({
  open,
  onOpenChange,
  pageIndex,
  displaySettings,
  onSettingChange,
}: CVPagePropertiesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Page {pageIndex + 1} Properties
          </DialogTitle>
          <DialogDescription>Configure the layout and appearance for this page</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Page Format */}
          <div className="space-y-2">
            <Label>Page Format</Label>
            <Select
              value={displaySettings?.format || 'A4'}
              onValueChange={(value) => onSettingChange?.('format', value as 'A4' | 'Letter')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="Letter">Letter (216 × 279 mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Layout Mode */}
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={displaySettings?.layoutMode || 'two-column'}
              onValueChange={(value) => onSettingChange?.('layoutMode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="two-column">Two Column (Sidebar)</SelectItem>
                <SelectItem value="single-column">Single Column</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={displaySettings?.accentColor || '#2563eb'}
                onChange={(e) => onSettingChange?.('accentColor', e.target.value)}
                className="h-9 w-12 cursor-pointer p-1"
              />
              <Input
                type="text"
                value={displaySettings?.accentColor || '#2563eb'}
                onChange={(e) => onSettingChange?.('accentColor', e.target.value)}
                placeholder="#2563eb"
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>Font</Label>
            <Select
              value={displaySettings?.fontFamily || 'sans-serif'}
              onValueChange={(value) => onSettingChange?.('fontFamily', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans-serif">Sans Serif</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                <SelectItem value="'Georgia', serif">Georgia</SelectItem>
                <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Tip: Right-click on sections to move them up or down
        </div>
      </DialogContent>
    </Dialog>
  );
}
