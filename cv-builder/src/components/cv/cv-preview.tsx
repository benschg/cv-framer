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

  const name = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : language === 'de' ? 'Ihr Name' : 'Your Name';

  const labels = {
    profile: language === 'de' ? 'Profil' : 'Profile',
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

      {/* Empty state */}
      {!content.profile && (
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
