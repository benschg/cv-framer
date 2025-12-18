'use client';

import { Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ProfileHighlight } from '@/types/profile-career.types';

interface HighlightViewCardProps {
  highlight: ProfileHighlight;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  t: (key: string) => string;
}

export function HighlightViewCard({
  highlight,
  onEdit,
  onDelete,
  disabled,
  t,
}: HighlightViewCardProps) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent/50" onClick={onEdit}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{t(`profile.highlights.types.${highlight.type}`)}</Badge>
              {highlight.metric && <Badge variant="outline">{highlight.metric}</Badge>}
            </div>
            <div>
              <h3 className="font-medium">{highlight.title}</h3>
              {highlight.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {highlight.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              disabled={disabled}
            >
              {t('profile.highlights.editButton')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
