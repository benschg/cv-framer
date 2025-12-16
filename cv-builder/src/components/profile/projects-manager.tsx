'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAppTranslation } from '@/hooks/use-app-translation';
import {
  fetchProjects,
  createProject,
  deleteProject,
  updateProject,
  type ProfileProject,
} from '@/services/profile-career.service';
import { useProfileManager } from '@/hooks/use-profile-manager';
import { ProfileCardManager } from './ProfileCardManager';
import { SortableCard } from './SortableCard';
import { ProjectEditForm } from './project-edit-form';
import { ProjectViewCard } from './project-view-card';

interface ProjectsManagerProps {
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export interface ProjectsManagerRef {
  handleAdd: () => void;
}

export const ProjectsManager = forwardRef<ProjectsManagerRef, ProjectsManagerProps>(
  ({ onSavingChange, onSaveSuccessChange }, ref) => {
    const { t } = useAppTranslation();

    const {
      items: projects,
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
    } = useProfileManager<ProfileProject>({
      fetchItems: fetchProjects,
      createItem: createProject,
      updateItem: updateProject,
      deleteItem: deleteProject,
      defaultItem: {
        name: '',
        description: null,
        role: null,
        technologies: [],
        url: null,
        start_date: null,
        end_date: null,
        current: false,
        outcome: null,
      },
      onSavingChange,
      onSaveSuccessChange,
    });

    useImperativeHandle(ref, () => ({
      handleAdd,
    }));

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <ProfileCardManager
        items={projects}
        onDragEnd={handleDragEnd}
        renderCard={(project) => {
          const expanded = isExpanded(project.id);
          const formData = getFormData(project.id);
          return (
            <SortableCard
              id={project.id}
              disabled={false}
              showDragHandle={!expanded}
            >
              {expanded ? (
                <ProjectEditForm
                  formData={formData}
                  onFieldChange={(field, value) => handleFieldChange(project.id, field, value)}
                  onDone={() => handleDone(project.id)}
                  t={t}
                />
              ) : (
                <ProjectViewCard
                  project={project}
                  onEdit={() => handleEdit(project)}
                  onDelete={() => handleDelete(project.id)}
                  disabled={saving}
                  t={t}
                />
              )}
            </SortableCard>
          );
        }}
        renderDragOverlay={(project) => (
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="font-medium">{project.name}</div>
            </CardContent>
          </Card>
        )}
        emptyState={
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>{t('profile.projects.empty')}</p>
              <p className="text-sm mt-1">{t('profile.projects.emptyAction')}</p>
            </CardContent>
          </Card>
        }
      />
    );
  }
);

ProjectsManager.displayName = 'ProjectsManager';
