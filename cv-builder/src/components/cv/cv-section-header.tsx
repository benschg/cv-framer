'use client';

interface CVSectionHeaderProps {
  title: string;
  accentColor: string;
}

export function CVSectionHeader({ title, accentColor }: CVSectionHeaderProps) {
  return (
    <div className="mb-2">
      <h2
        className="text-xs font-bold uppercase tracking-wide pb-1 border-b border-gray-200"
        style={{ color: accentColor }}
      >
        {title}
      </h2>
    </div>
  );
}
