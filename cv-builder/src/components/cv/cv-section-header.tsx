'use client';

interface CVSectionHeaderProps {
  title: string;
  accentColor: string;
}

export function CVSectionHeader({ title, accentColor }: CVSectionHeaderProps) {
  return (
    <div className="mb-2">
      <h2
        className="border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide"
        style={{ color: accentColor }}
      >
        {title}
      </h2>
    </div>
  );
}
