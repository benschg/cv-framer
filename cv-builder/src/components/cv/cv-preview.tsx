'use client';

import type { CVContent, UserProfile, DisplaySettings } from '@/types/cv.types';
import type { CVWorkExperienceWithSelection } from '@/types/profile-career.types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { ReactNode } from 'react';
import { formatDateRange } from '@/lib/utils';

interface CVPreviewProps {
  content: CVContent;
  userProfile?: UserProfile;
  settings?: Partial<DisplaySettings> | null;
  language?: 'en' | 'de';
  photoUrl?: string | null;
  userInitials?: string;
  /** Optional: Custom render for the photo (e.g., wrapped in a Popover) */
  photoElement?: ReactNode;
  /** Work experiences with per-CV selections */
  workExperiences?: CVWorkExperienceWithSelection[];
}

export function CVPreview({ content, userProfile, settings, language = 'en', photoUrl, userInitials = 'U', photoElement, workExperiences }: CVPreviewProps) {
  const accentColor = settings?.accentColor || '#2563eb';
  const textColor = settings?.textColor || '#111827';
  const fontFamily = settings?.fontFamily || 'sans-serif';
  const showPhoto = settings?.showPhoto !== false && photoUrl;
  const format = settings?.format || 'A4';

  // Page dimensions in mm
  const pageDimensions = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 }
  };

  const { width: pageWidth, height: pageHeight } = pageDimensions[format];

  const name = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : language === 'de' ? 'Ihr Name' : 'Your Name';

  const labels = {
    profile: language === 'de' ? 'Profil' : 'Profile',
    workExperience: language === 'de' ? 'Berufserfahrung' : 'Work Experience',
  };

  // Only show work experiences if the setting is enabled
  const showWorkExperience = settings?.showWorkExperience !== false;

  // Filter to only selected work experiences
  const selectedWorkExperiences = showWorkExperience
    ? (workExperiences?.filter(exp => exp.selection.is_selected) || [])
    : [];

  return (
    <div
      className="bg-white p-8 rounded-lg shadow-sm border mx-auto text-[10pt] leading-relaxed"
      style={{
        width: `${pageWidth}mm`,
        minHeight: `${pageHeight}mm`,
        aspectRatio: `${pageWidth} / ${pageHeight}`,
        fontFamily: fontFamily,
        color: textColor
      }}
    >
      {/* Header */}
      <header
        className="mb-5 pb-4"
        style={{ borderBottom: `2px solid ${accentColor}` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
            {content.tagline && (
              <p className="text-sm font-medium mb-2" style={{ color: accentColor }}>
                {content.tagline}
              </p>
            )}
            <div className="text-xs text-gray-500 flex flex-wrap gap-3">
              {userProfile?.email && <span>{userProfile.email}</span>}
              {userProfile?.phone && <span>{userProfile.phone}</span>}
              {userProfile?.location && <span>{userProfile.location}</span>}
              {userProfile?.linkedin_url && <span>LinkedIn</span>}
              {userProfile?.github_url && <span>GitHub</span>}
            </div>
          </div>
          {showPhoto && (
            photoElement || (
              <Avatar className="h-24 w-24 flex-shrink-0">
                <AvatarImage src={photoUrl} alt={name} />
                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
            )
          )}
        </div>
      </header>

      {/* Profile */}
      {content.profile && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.profile}
          </h2>
          <p className="text-gray-700 text-justify">{content.profile}</p>
        </section>
      )}

      {/* Work Experience */}
      {selectedWorkExperiences.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.workExperience}
          </h2>
          <div className="space-y-3">
            {selectedWorkExperiences.map((exp) => {
              // Use override or fall back to profile description
              const description = exp.selection.description_override ?? exp.description;
              // Filter bullets based on selection
              const bullets = exp.selection.selected_bullet_indices === null
                ? exp.bullets
                : (exp.bullets || []).filter((_, i) =>
                    exp.selection.selected_bullet_indices!.includes(i)
                  );

              return (
                <div key={exp.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{exp.title}</span>
                      {exp.selection.is_favorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateRange(exp.start_date, exp.end_date, exp.current)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {exp.company}
                    {exp.location && `, ${exp.location}`}
                  </p>
                  {description && (
                    <p className="text-gray-700 mt-1">{description}</p>
                  )}
                  {bullets && bullets.length > 0 && (
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-700">
                      {bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!content.profile && selectedWorkExperiences.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">
              {language === 'de'
                ? 'Beginnen Sie mit der Bearbeitung Ihres Lebenslaufs, um eine Vorschau zu sehen'
                : 'Start editing your CV to see a preview'}
            </p>
          </div>
        )}
    </div>
  );
}
