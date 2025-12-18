import type { CVContent } from '@/types/cv.types';

interface PublicCVProfileProps {
  content: CVContent;
}

export function PublicCVProfile({ content }: PublicCVProfileProps) {
  if (!content.profile) {
    return null;
  }

  return (
    <section className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Profile</h2>
      <p className="whitespace-pre-wrap text-gray-700">{content.profile}</p>
    </section>
  );
}
