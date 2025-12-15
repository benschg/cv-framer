'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { DisplaySettings } from '@/types/cv.types';

interface FormatSettingsProps {
  displaySettings?: Partial<DisplaySettings> | null;
  onUpdateSettings: (key: keyof DisplaySettings, value: string) => void;
}

export function FormatSettings({ displaySettings, onUpdateSettings }: FormatSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Format Settings</CardTitle>
            <CardDescription>
              Customize the appearance and layout of your CV
            </CardDescription>
          </div>
          <div className="h-8 w-8 flex items-center justify-center">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {/* Font Family */}
          <div className="space-y-2 flex-1 min-w-[180px]">
            <Label htmlFor="fontFamily" className="text-xs">Font</Label>
            <Select
              value={displaySettings?.fontFamily || 'sans-serif'}
              onValueChange={(value) => onUpdateSettings('fontFamily', value)}
            >
              <SelectTrigger id="fontFamily" className="h-9">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {/* Default System Fonts */}
                <SelectItem value="sans-serif" style={{ fontFamily: 'sans-serif' }}>Sans Serif (Default)</SelectItem>
                <SelectItem value="serif" style={{ fontFamily: 'serif' }}>Serif (Default)</SelectItem>

                {/* Classic Professional Fonts */}
                <SelectItem value="'Arial', sans-serif" style={{ fontFamily: 'Arial, sans-serif' }}>Arial</SelectItem>
                <SelectItem value="'Helvetica', sans-serif" style={{ fontFamily: 'Helvetica, sans-serif' }}>Helvetica</SelectItem>
                <SelectItem value="'Calibri', sans-serif" style={{ fontFamily: 'Calibri, sans-serif' }}>Calibri</SelectItem>
                <SelectItem value="'Verdana', sans-serif" style={{ fontFamily: 'Verdana, sans-serif' }}>Verdana</SelectItem>
                <SelectItem value="'Tahoma', sans-serif" style={{ fontFamily: 'Tahoma, sans-serif' }}>Tahoma</SelectItem>

                {/* Serif Fonts */}
                <SelectItem value="'Times New Roman', serif" style={{ fontFamily: 'Times New Roman, serif' }}>Times New Roman</SelectItem>
                <SelectItem value="'Georgia', serif" style={{ fontFamily: 'Georgia, serif' }}>Georgia</SelectItem>
                <SelectItem value="'Garamond', serif" style={{ fontFamily: 'Garamond, serif' }}>Garamond</SelectItem>
                <SelectItem value="'Palatino', serif" style={{ fontFamily: 'Palatino, serif' }}>Palatino</SelectItem>
                <SelectItem value="'Cambria', serif" style={{ fontFamily: 'Cambria, serif' }}>Cambria</SelectItem>

                {/* Modern Sans-Serif */}
                <SelectItem value="'Roboto', sans-serif" style={{ fontFamily: 'Roboto, sans-serif' }}>Roboto</SelectItem>
                <SelectItem value="'Open Sans', sans-serif" style={{ fontFamily: 'Open Sans, sans-serif' }}>Open Sans</SelectItem>
                <SelectItem value="'Lato', sans-serif" style={{ fontFamily: 'Lato, sans-serif' }}>Lato</SelectItem>
                <SelectItem value="'Montserrat', sans-serif" style={{ fontFamily: 'Montserrat, sans-serif' }}>Montserrat</SelectItem>
                <SelectItem value="'Source Sans Pro', sans-serif" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>Source Sans Pro</SelectItem>
                <SelectItem value="'Inter', sans-serif" style={{ fontFamily: 'Inter, sans-serif' }}>Inter</SelectItem>
                <SelectItem value="'Work Sans', sans-serif" style={{ fontFamily: 'Work Sans, sans-serif' }}>Work Sans</SelectItem>

                {/* Professional Serif */}
                <SelectItem value="'Merriweather', serif" style={{ fontFamily: 'Merriweather, serif' }}>Merriweather</SelectItem>
                <SelectItem value="'Playfair Display', serif" style={{ fontFamily: 'Playfair Display, serif' }}>Playfair Display</SelectItem>
                <SelectItem value="'PT Serif', serif" style={{ fontFamily: 'PT Serif, serif' }}>PT Serif</SelectItem>

                {/* Monospace (for technical CVs) */}
                <SelectItem value="'Courier New', monospace" style={{ fontFamily: 'Courier New, monospace' }}>Courier New</SelectItem>
                <SelectItem value="'Consolas', monospace" style={{ fontFamily: 'Consolas, monospace' }}>Consolas</SelectItem>
                <SelectItem value="'Monaco', monospace" style={{ fontFamily: 'Monaco, monospace' }}>Monaco</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accent Color */}
          <div className="space-y-2 min-w-[140px]">
            <Label htmlFor="accentColor" className="text-xs">Accent</Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={displaySettings?.accentColor || '#2563eb'}
                onChange={(e) => onUpdateSettings('accentColor', e.target.value)}
                className="w-12 h-9 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={displaySettings?.accentColor || '#2563eb'}
                onChange={(e) => onUpdateSettings('accentColor', e.target.value)}
                placeholder="#2563eb"
                className="w-20 h-9 font-mono text-xs"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2 min-w-[140px]">
            <Label htmlFor="textColor" className="text-xs">Text</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={displaySettings?.textColor || '#111827'}
                onChange={(e) => onUpdateSettings('textColor', e.target.value)}
                className="w-12 h-9 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={displaySettings?.textColor || '#111827'}
                onChange={(e) => onUpdateSettings('textColor', e.target.value)}
                placeholder="#111827"
                className="w-20 h-9 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Page Format */}
        <div className="space-y-2">
          <Label htmlFor="format">Page Format</Label>
          <Select
            value={displaySettings?.format || 'A4'}
            onValueChange={(value) => onUpdateSettings('format', value as 'A4' | 'Letter')}
          >
            <SelectTrigger id="format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
              <SelectItem value="Letter">Letter (8.5 × 11 in / 216 × 279 mm)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {displaySettings?.format === 'Letter'
              ? 'Letter format is commonly used in the US and Canada'
              : 'A4 format is the international standard used in most countries'}
          </p>
        </div>

        {/* Preview Example */}
        <div className="p-4 rounded-lg border bg-white">
          <div className="space-y-2">
            <h3
              className="text-sm font-bold uppercase tracking-wide"
              style={{
                color: displaySettings?.accentColor || '#2563eb',
                fontFamily: displaySettings?.fontFamily || 'sans-serif'
              }}
            >
              Preview Example
            </h3>
            <p
              className="text-xs"
              style={{
                color: displaySettings?.textColor || '#111827',
                fontFamily: displaySettings?.fontFamily || 'sans-serif'
              }}
            >
              This is how your CV text will appear with the selected font and colors.
              The heading above uses the accent color, while this paragraph uses the text color.
            </p>
          </div>
        </div>
        </CardContent>
      )}
    </Card>
  );
}
