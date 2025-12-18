'use client';

import { Github, Globe,Linkedin, Mail, MapPin, Phone } from 'lucide-react';

import type { CVContent,UserProfile } from '@/types/cv.types';

interface CVHeaderSectionProps {
  content: CVContent;
  userProfile?: UserProfile;
  language?: 'en' | 'de';
}

export function CVHeaderSection({ content, userProfile, language = 'en' }: CVHeaderSectionProps) {
  const name = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
    : language === 'de'
      ? 'Ihr Name'
      : 'Your Name';

  return (
    <div className="cv-header cv-section">
      <div className="cv-header-main">
        <div className="cv-header-info">
          <h1>{name}</h1>
          {content.tagline && <p className="cv-header-title">{content.tagline}</p>}
          <div className="cv-header-contact">
            {userProfile?.email && (
              <span className="cv-header-contact-item">
                <Mail className="h-3.5 w-3.5" />
                {userProfile.email}
              </span>
            )}
            {userProfile?.phone && (
              <span className="cv-header-contact-item">
                <Phone className="h-3.5 w-3.5" />
                {userProfile.phone}
              </span>
            )}
            {userProfile?.location && (
              <span className="cv-header-contact-item">
                <MapPin className="h-3.5 w-3.5" />
                {userProfile.location}
              </span>
            )}
            {userProfile?.linkedin_url && (
              <span className="cv-header-contact-item">
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </span>
            )}
            {userProfile?.github_url && (
              <span className="cv-header-contact-item">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </span>
            )}
            {userProfile?.website_url && (
              <span className="cv-header-contact-item">
                <Globe className="h-3.5 w-3.5" />
                Website
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
