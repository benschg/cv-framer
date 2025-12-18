import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { debounce } from '@/services/profile-career.service';

export interface ProfileManagerConfig<T extends { id: string }> {
  fetchItems: () => Promise<{ data: T[] | null; error: unknown }>;
  createItem: (item: Partial<T>) => Promise<{ data: T | null; error: unknown }>;
  updateItem: (id: string, item: Partial<T>) => Promise<{ data: T | null; error: unknown }>;
  deleteItem: (id: string) => Promise<{ error: unknown }>;
  defaultItem: Partial<T>;
  onSavingChange?: (saving: boolean) => void;
  onSaveSuccessChange?: (success: boolean) => void;
}

export function useProfileManager<T extends { id: string; display_order?: number | null }>(
  config: ProfileManagerConfig<T>
) {
  const {
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    defaultItem,
    onSavingChange,
    onSaveSuccessChange,
  } = config;

  const { user } = useAuth();

  const [items, setItems] = useState<T[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [formDataMap, setFormDataMap] = useState<Map<string, Partial<T>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load items when user is available (wait for auth to be ready)
  useEffect(() => {
    if (user) {
      loadItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await fetchItems();
    if (error) {
      console.error('Failed to load items:', error);
    } else if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    onSavingChange?.(true);
    onSaveSuccessChange?.(false);

    const newItem = {
      ...defaultItem,
      display_order: items.length,
    };

    const { data, error } = await createItem(newItem);

    setSaving(false);
    onSavingChange?.(false);

    if (error) {
      console.error('Failed to create item:', error);
      alert('Failed to create item');
    } else if (data) {
      setItems([data, ...items]);
      // Expand the new item and set its form data
      setExpandedIds((prev) => new Set(prev).add(data.id));
      setFormDataMap((prev) => new Map(prev).set(data.id, data));
      onSaveSuccessChange?.(true);
      setTimeout(() => {
        onSaveSuccessChange?.(false);
      }, 2000);
    }
  };

  const handleEdit = (item: T) => {
    // Toggle expansion - if already expanded, collapse it; otherwise expand
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
        // Initialize form data for this item
        setFormDataMap((prevMap) => new Map(prevMap).set(item.id, item));
      }
      return newSet;
    });
  };

  const isExpanded = (id: string) => expandedIds.has(id);

  const getFormData = (id: string) => formDataMap.get(id) || {};

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setSaving(true);
    onSavingChange?.(true);
    onSaveSuccessChange?.(false);

    const { error } = await deleteItem(id);

    setSaving(false);
    onSavingChange?.(false);

    if (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    } else {
      setItems(items.filter((e) => e.id !== id));
      // Clean up expanded state and form data
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setFormDataMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      onSaveSuccessChange?.(true);
      setTimeout(() => {
        onSaveSuccessChange?.(false);
      }, 2000);
    }
  };

  const handleDone = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Auto-save handler with debouncing
  const handleFieldChange = useCallback(
    (id: string, field: keyof T, value: unknown) => {
      const currentFormData = formDataMap.get(id) || {};
      const updatedData = { ...currentFormData, [field]: value } as Partial<T>;
      setFormDataMap((prev) => new Map(prev).set(id, updatedData));

      // Auto-save
      onSavingChange?.(true);
      onSaveSuccessChange?.(false);

      const debouncedSave = debounce(
        `profile-item-${id}`,
        async () => {
          const { data, error } = await updateItem(id, updatedData);

          onSavingChange?.(false);

          if (!error && data) {
            onSaveSuccessChange?.(true);
            setItems((prevItems) => prevItems.map((item) => (item.id === id ? data : item)));
            setTimeout(() => {
              onSaveSuccessChange?.(false);
            }, 2000);
          } else if (error) {
            console.error('Auto-save failed:', error);
          }
        },
        1000
      );

      debouncedSave();
    },
    [formDataMap, onSavingChange, onSaveSuccessChange, updateItem]
  );

  // Helper to update multiple fields at once
  const handleMultiFieldChange = useCallback(
    (id: string, updates: Partial<T>) => {
      const currentFormData = formDataMap.get(id) || {};
      const updatedData = { ...currentFormData, ...updates };
      setFormDataMap((prev) => new Map(prev).set(id, updatedData));

      onSavingChange?.(true);
      onSaveSuccessChange?.(false);

      const debouncedSave = debounce(
        `profile-item-${id}`,
        async () => {
          const { data, error } = await updateItem(id, updatedData);

          onSavingChange?.(false);

          if (!error && data) {
            onSaveSuccessChange?.(true);
            setItems((prevItems) => prevItems.map((item) => (item.id === id ? data : item)));
            setTimeout(() => {
              onSaveSuccessChange?.(false);
            }, 2000);
          } else if (error) {
            console.error('Auto-save failed:', error);
          }
        },
        1000
      );

      debouncedSave();
    },
    [formDataMap, onSavingChange, onSaveSuccessChange, updateItem]
  );

  const handleDragEnd = async (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, draggedItem);

    // Update local state immediately
    setItems(newItems);

    // Update display_order in the backend
    onSavingChange?.(true);
    onSaveSuccessChange?.(false);

    try {
      await Promise.all(
        newItems.map((item, idx) => updateItem(item.id, { display_order: idx } as Partial<T>))
      );

      onSavingChange?.(false);
      onSaveSuccessChange?.(true);
      setTimeout(() => {
        onSaveSuccessChange?.(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to update order:', error);
      onSavingChange?.(false);
      loadItems();
    }
  };

  return {
    items,
    expandedIds,
    isExpanded,
    getFormData,
    loading,
    saving,
    activeId,
    setActiveId,
    handleAdd,
    handleEdit,
    handleDelete,
    handleDone,
    handleFieldChange,
    handleMultiFieldChange,
    handleDragEnd,
  };
}
