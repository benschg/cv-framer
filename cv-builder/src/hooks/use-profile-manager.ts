import { useState, useCallback, useEffect } from 'react';
import { debounce } from '@/services/profile-career.service';

export interface ProfileManagerConfig<T extends { id: string }> {
  fetchItems: () => Promise<{ data: T[] | null; error: any }>;
  createItem: (item: any) => Promise<{ data: T | null; error: any }>;
  updateItem: (id: string, item: any) => Promise<{ data: T | null; error: any }>;
  deleteItem: (id: string) => Promise<{ error: any }>;
  defaultItem: any;
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

  const [items, setItems] = useState<T[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

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
      setEditingId(data.id);
      setFormData(data);
      onSaveSuccessChange?.(true);
      setTimeout(() => {
        onSaveSuccessChange?.(false);
      }, 2000);
    }
  };

  const handleEdit = (item: T) => {
    setEditingId(item.id);
    setFormData(item);
  };

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
      if (editingId === id) {
        setEditingId(null);
        setFormData({});
      }
      onSaveSuccessChange?.(true);
      setTimeout(() => {
        onSaveSuccessChange?.(false);
      }, 2000);
    }
  };

  const handleDone = () => {
    setEditingId(null);
    setFormData({});
  };

  // Auto-save handler with debouncing
  const handleFieldChange = useCallback(
    (field: keyof T, value: any) => {
      const updatedData = { ...formData, [field]: value } as Partial<T>;
      setFormData(updatedData);

      // Auto-save if we're editing an existing entry
      if (editingId) {
        onSavingChange?.(true);
        onSaveSuccessChange?.(false);

        const debouncedSave = debounce(
          `profile-item-${editingId}`,
          async () => {
            const { data, error } = await updateItem(editingId, updatedData);

            onSavingChange?.(false);

            if (!error && data) {
              onSaveSuccessChange?.(true);
              setItems((prevItems) =>
                prevItems.map((item) => (item.id === editingId ? data : item))
              );
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
      }
    },
    [editingId, formData, onSavingChange, onSaveSuccessChange, updateItem]
  );

  // Helper to update multiple fields at once
  const handleMultiFieldChange = useCallback(
    (updates: Partial<T>) => {
      const updatedData = { ...formData, ...updates };
      setFormData(updatedData);

      if (editingId) {
        onSavingChange?.(true);
        onSaveSuccessChange?.(false);

        const debouncedSave = debounce(
          `profile-item-${editingId}`,
          async () => {
            const { data, error } = await updateItem(editingId, updatedData);

            onSavingChange?.(false);

            if (!error && data) {
              onSaveSuccessChange?.(true);
              setItems((prevItems) =>
                prevItems.map((item) => (item.id === editingId ? data : item))
              );
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
      }
    },
    [editingId, formData, onSavingChange, onSaveSuccessChange, updateItem]
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
        newItems.map((item, idx) =>
          updateItem(item.id, { display_order: idx } as Partial<T>)
        )
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
    editingId,
    formData,
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
    setFormData,
  };
}
