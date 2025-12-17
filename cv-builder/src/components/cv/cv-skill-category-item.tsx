'use client';

import { Star } from 'lucide-react';

interface CVSkillCategoryItemProps {
  category: string;
  skills: string[];
  isFavorite: boolean;
}

export function CVSkillCategoryItem({ category, skills, isFavorite }: CVSkillCategoryItemProps) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-1">
        <span className="font-semibold">{category}:</span>
        {isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
      </div>
      <p className="text-gray-700">{skills.join(', ')}</p>
    </div>
  );
}
