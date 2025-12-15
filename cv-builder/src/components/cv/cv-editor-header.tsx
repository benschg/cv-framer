'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Eye, Download, Save, Loader2 } from 'lucide-react';

interface CVEditorHeaderProps {
  cvName: string;
  jobContext?: {
    position?: string;
    company?: string;
  } | null;
  photoUrl?: string | null;
  userInitials: string;
  onPreview: () => void;
  onExport: () => void;
  onSave: () => void;
  saving?: boolean;
  exporting?: boolean;
}

export function CVEditorHeader({
  cvName,
  jobContext,
  photoUrl,
  userInitials,
  onPreview,
  onExport,
  onSave,
  saving = false,
  exporting = false,
}: CVEditorHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-4xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link href="/cv">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={photoUrl || undefined} />
              <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">{cvName}</h1>
              {jobContext?.company && (
                <p className="text-xs text-muted-foreground truncate">
                  {jobContext.position} at {jobContext.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={onPreview}>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onExport}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button onClick={onSave} disabled={saving} size="sm" className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
