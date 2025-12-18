'use client';

import { AlertCircle, Github, Linkedin, Lock, Mail, MapPin, Phone } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/shared/footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CVContent, CVDocument, ShareLink, UserProfile } from '@/types/cv.types';

interface SharedCVData {
  cv: CVDocument;
  userProfile?: UserProfile;
  shareLink: ShareLink;
}

export default function PublicCVPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<SharedCVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await fetch(`/api/public/cv/${token}`);
        const json = await response.json();

        if (!response.ok) {
          setError(json.error || 'CV not found');
          return;
        }

        setData(json);
      } catch (error: unknown) {
        setError('Failed to load CV');
        console.error('Error loading CV:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h1 className="mb-2 text-xl font-semibold">CV Not Available</h1>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { cv, userProfile, shareLink } = data;
  const content = cv.content as CVContent;
  const privacyLevel = shareLink.privacy_level;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {privacyLevel !== 'full' && userProfile
                  ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() ||
                    'Anonymous'
                  : 'Anonymous'}
              </h1>
              {content.tagline && <p className="mt-1 text-lg text-primary">{content.tagline}</p>}

              {/* Contact info based on privacy level */}
              {privacyLevel === 'none' && userProfile && (
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

              {privacyLevel === 'personal' && userProfile?.location && (
                <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {userProfile.location}
                </div>
              )}
            </div>

            {privacyLevel === 'full' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
        </header>

        {/* Profile */}
        {content.profile && (
          <section className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Profile</h2>
            <p className="whitespace-pre-wrap text-gray-700">{content.profile}</p>
          </section>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
