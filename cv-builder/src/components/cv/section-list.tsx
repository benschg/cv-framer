import { ChevronDown, ChevronUp, GripVertical, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SectionListProps {
  sections: string[];
  allSections: readonly { id: string; label: string; labelDe: string }[];
  onToggle: (id: string, checked: boolean) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onRemove: (id: string) => void;
  type: 'sidebar' | 'main';
  language?: 'en' | 'de';
}

/**
 * Section list component with reorder controls
 * Displays a list of sections with up/down/remove buttons and an add section dropdown
 */
export function SectionList({
  sections,
  allSections,
  onToggle,
  onMove,
  onRemove,
  type,
  language = 'en',
}: SectionListProps) {
  const availableSections = allSections.filter((s) => !sections.includes(s.id));
  const getLabel = (section: { label: string; labelDe: string }) => {
    return language === 'de' ? section.labelDe : section.label;
  };

  return (
    <div className="space-y-2">
      {/* Current sections with reorder controls */}
      {sections.length > 0 ? (
        <div className="space-y-1">
          {sections.map((sectionId, index) => {
            const section = allSections.find((s) => s.id === sectionId);
            if (!section) return null;
            return (
              <div
                key={sectionId}
                className="flex items-center gap-1 rounded bg-muted/50 p-1.5 text-xs"
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className="flex-1">{getLabel(section)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onMove(index, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onMove(index, 'down')}
                  disabled={index === sections.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive"
                  onClick={() => onRemove(sectionId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          {type === 'sidebar' ? 'No sidebar sections' : 'No main sections'}
        </p>
      )}

      {/* Add section dropdown */}
      {availableSections.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 w-full text-xs">
              <Plus className="mr-1 h-3 w-3" />
              Add section
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {availableSections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-full justify-start text-xs"
                  onClick={() => onToggle(section.id, true)}
                >
                  {getLabel(section)}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
