'use client';

import type { CVContent, UserProfile, DisplaySettings } from '@/types/cv.types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ReactNode } from 'react';

interface CVPreviewProps {
  content: CVContent;
  userProfile?: UserProfile;
  settings?: Partial<DisplaySettings> | null;
  language?: 'en' | 'de';
  photoUrl?: string | null;
  userInitials?: string;
  /** Optional: Custom render for the photo (e.g., wrapped in a Popover) */
  photoElement?: ReactNode;
}

export function CVPreview({ content, userProfile, settings, language = 'en', photoUrl, userInitials = 'U', photoElement }: CVPreviewProps) {
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
  const aspectRatio = pageHeight / pageWidth;

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    try {
      const [year, month] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const name = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : language === 'de' ? 'Ihr Name' : 'Your Name';

  const labels = {
    profile: language === 'de' ? 'Profil' : 'Profile',
    keyCompetences: language === 'de' ? 'Kernkompetenzen' : 'Key Competences',
    workExperience: language === 'de' ? 'Berufserfahrung' : 'Work Experience',
    education: language === 'de' ? 'Ausbildung' : 'Education',
    skills: language === 'de' ? 'Fähigkeiten' : 'Skills',
    present: language === 'de' ? 'Heute' : 'Present',
  };

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

      {/* Key Competences */}
      {content.keyCompetences && content.keyCompetences.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.keyCompetences}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {content.keyCompetences.map((comp) => (
              <div key={comp.id} className="p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900 text-xs">{comp.title}</div>
                <div className="text-xs text-gray-500">{comp.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {content.workExperience && content.workExperience.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.workExperience}
          </h2>
          <div className="space-y-3">
            {content.workExperience.map((exp) => {
              const dateRange = exp.current
                ? `${formatDate(exp.startDate)} - ${labels.present}`
                : `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`;

              return (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-semibold text-gray-900">{exp.title}</div>
                      <div className="text-gray-700">
                        {exp.company}
                        {exp.location && `, ${exp.location}`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">{dateRange}</div>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-gray-700">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Education */}
      {content.education && content.education.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.education}
          </h2>
          <div className="space-y-2">
            {content.education.map((edu) => {
              const dateStr = edu.endDate ? formatDate(edu.endDate) : labels.present;

              return (
                <div key={edu.id} className="break-inside-avoid">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {edu.degree}
                        {edu.field && ` in ${edu.field}`}
                      </div>
                      <div className="text-gray-700">{edu.institution}</div>
                    </div>
                    <div className="text-xs text-gray-500">{dateStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skills */}
      {content.skills && content.skills.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-xs font-bold uppercase tracking-wide mb-2 pb-1 border-b border-gray-200"
            style={{ color: accentColor }}
          >
            {labels.skills}
          </h2>
          <div className="space-y-1">
            {content.skills.map((cat) => (
              <div key={cat.id}>
                <span className="font-semibold text-gray-900">{cat.category}:</span>{' '}
                <span className="text-gray-700">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!content.profile &&
        (!content.keyCompetences || content.keyCompetences.length === 0) &&
        (!content.workExperience || content.workExperience.length === 0) &&
        (!content.education || content.education.length === 0) &&
        (!content.skills || content.skills.length === 0) && (
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
