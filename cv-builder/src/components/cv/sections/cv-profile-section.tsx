'use client';

interface CVProfileSectionProps {
  profile: string;
  title?: string;
}

export function CVProfileSection({ profile, title = 'Profile' }: CVProfileSectionProps) {
  if (!profile) return null;

  return (
    <section className="cv-section cv-profile">
      <h2>{title}</h2>
      <p className="cv-text-justify">{profile}</p>
    </section>
  );
}
