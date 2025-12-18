'use client';

import { Loader2 } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { useProfileManager } from '@/hooks/use-profile-manager';
import {
  createHighlight,
  deleteHighlight,
  fetchHighlights,
  type HighlightType,
  type ProfileHighlight,
  updateHighlight,
} from '@/services/profile-career.service';

import { HighlightEditForm } from './highlight-edit-form';
import { HighlightViewCard } from './highlight-view-card';
import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';

interface HighlightsManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface HighlightsManagerRef {
  handleAdd: () => void;
}

export const HighlightsManager = forwardRef<HighlightsManagerRef, HighlightsManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
    const { t } = useAppTranslation();
    const [filterType, setFilterType] = useState<HighlightType | 'all'>('all');

    const {
      items: highlights,
      isExpanded,
      getFormData,
      loading,
      saving,
      handleAdd,
      handleEdit,
      handleDelete,
      handleDone,
      handleFieldChange,
      handleDragEnd,
    } = useProfileManager<ProfileHighlight>({
      fetchItems: fetchHighlights,
      createItem: (item) =>
        createHighlight(
          item as Omit<ProfileHighlight, 'id' | 'user_id' | 'created_at' | 'updated_at'>
        ),
      updateItem: updateHighlight,
      deleteItem: deleteHighlight,
      defaultItem: {
        type: 'highlight',
        title: '',
        description: '',
        metric: '',
      },
      onSavingChange,
      onSaveSuccessChange,
    });

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      handleAdd,
    }));

    // Filter highlights by type
    const filteredHighlights =
      filterType === 'all' ? highlights : highlights.filter((h) => h.type === filterType);

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            {t('profile.highlights.filterAll')}
          </Button>
          <Button
            variant={filterType === 'highlight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('highlight')}
          >
            {t('profile.highlights.filterHighlight')}
          </Button>
          <Button
            variant={filterType === 'achievement' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('achievement')}
          >
            {t('profile.highlights.filterAchievement')}
          </Button>
          <Button
            variant={filterType === 'mehrwert' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('mehrwert')}
          >
            {t('profile.highlights.filterMehrwert')}
          </Button>
          <Button
            variant={filterType === 'usp' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('usp')}
          >
            {t('profile.highlights.filterUSP')}
          </Button>
        </div>

        {/* Highlights List */}
        <ProfileCardManager
          items={filteredHighlights}
          onDragEnd={handleDragEnd}
          renderCard={(highlight) => {
            const expanded = isExpanded(highlight.id);
            const formData = getFormData(highlight.id);
            return (
              <SortableCard id={highlight.id} disabled={false} showDragHandle={!expanded}>
                {expanded ? (
                  <HighlightEditForm
                    formData={formData}
                    onFieldChange={(field, value) => handleFieldChange(highlight.id, field, value)}
                    onDone={() => handleDone(highlight.id)}
                    t={t}
                  />
                ) : (
                  <HighlightViewCard
                    highlight={highlight}
                    onEdit={() => handleEdit(highlight)}
                    onDelete={() => handleDelete(highlight.id)}
                    disabled={saving}
                    t={t}
                  />
                )}
              </SortableCard>
            );
          }}
          renderDragOverlay={(highlight) => (
            <Card className="w-full shadow-lg">
              <CardContent className="pt-6">
                <div className="font-medium">{highlight.title}</div>
              </CardContent>
            </Card>
          )}
          emptyState={
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>{t('profile.highlights.empty')}</p>
                <p className="mt-1 text-sm">{t('profile.highlights.emptyAction')}</p>
              </CardContent>
            </Card>
          }
        />
      </div>
    );
  }
);

HighlightsManager.displayName = 'HighlightsManager';
