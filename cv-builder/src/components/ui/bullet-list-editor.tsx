'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface BulletListEditorProps {
  label?: string;
  bullets: string[];
  onChange: (bullets: string[]) => void;
  placeholder?: string;
  addButtonLabel?: string;
}

export function BulletListEditor({
  label = 'Bullet Points',
  bullets,
  onChange,
  placeholder = 'Enter bullet point...',
  addButtonLabel = 'Add Bullet',
}: BulletListEditorProps) {
  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    onChange(newBullets);
  };

  const handleAddBullet = () => {
    onChange([...bullets, '']);
  };

  const handleRemoveBullet = (index: number) => {
    const newBullets = [...bullets];
    newBullets.splice(index, 1);
    onChange(newBullets);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {bullets.map((bullet, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={bullet}
            onChange={(e) => handleBulletChange(index, e.target.value)}
            placeholder={placeholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveBullet(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleAddBullet}>
        <Plus className="h-3 w-3 mr-1" />
        {addButtonLabel}
      </Button>
    </div>
  );
}
