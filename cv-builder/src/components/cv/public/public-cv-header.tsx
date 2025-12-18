import { Github, Linkedin, Lock, Mail, MapPin, Phone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  getDisplayName,
  shouldShowContactInfo,
  shouldShowPrivacyBadge,
} from '@/lib/cv-privacy-utils';
import type { CVContent, ShareLink, UserProfile } from '@/types/cv.types';

interface PublicCVHeaderProps {
  content: CVContent;
  userProfile?: UserProfile;
  privacyLevel: ShareLink['privacy_level'];
}

export function PublicCVHeader({ content, userProfile, privacyLevel }: PublicCVHeaderProps) {
  const displayName = getDisplayName(privacyLevel, userProfile);
  const showContactInfo = shouldShowContactInfo(privacyLevel);
  const showPrivacyBadge = shouldShowPrivacyBadge(privacyLevel);

  return (
    <header className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
          {content.tagline && <p className="mt-1 text-lg text-primary">{content.tagline}</p>}

          {/* Contact info - shown when privacy level is 'none' */}
          {showContactInfo && userProfile && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {userProfile.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {userProfile.email}
                </span>
              )}
              {userProfile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {userProfile.phone}
                </span>
              )}
              {userProfile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {userProfile.location}
                </span>
              )}
              {userProfile.linkedin_url && (
                <a
                  href={userProfile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {userProfile.github_url && (
                <a
                  href={userProfile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              )}
            </div>
          )}

          {/* Location only - shown when privacy level is 'personal' */}
          {privacyLevel === 'personal' && userProfile?.location && (
            <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {userProfile.location}
            </div>
          )}
        </div>

        {/* Privacy badge - shown when privacy level is 'full' */}
        {showPrivacyBadge && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Private
          </Badge>
        )}
      </div>
    </header>
  );
}
