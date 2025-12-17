'use client';

import { Star } from 'lucide-react';

interface CVKeyCompetenceItemProps {
  title: string;
  description: string | null;
  isFavorite: boolean;
}

export function CVKeyCompetenceItem({ title, description, isFavorite }: CVKeyCompetenceItemProps) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-1">
        <span className="font-semibold">{title}</span>
        {isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
      </div>
      {description && <p className="text-gray-700">{description}</p>}
    </div>
  );
}
