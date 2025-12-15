'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Lock, MapPin, Mail, Phone, Linkedin, Github } from 'lucide-react';
import type { CVDocument, CVContent, UserProfile, ShareLink } from '@/types/cv.types';

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
      } catch (err) {
        setError('Failed to load CV');
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">CV Not Available</h1>
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {privacyLevel !== 'full' && userProfile
                  ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Anonymous'
                  : 'Anonymous'}
              </h1>
              {content.tagline && (
                <p className="text-lg text-primary mt-1">{content.tagline}</p>
              )}

              {/* Contact info based on privacy level */}
              {privacyLevel === 'none' && userProfile && (
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
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
                    <a href={userProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {userProfile.github_url && (
                    <a href={userProfile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                </div>
              )}

              {privacyLevel === 'personal' && userProfile?.location && (
                <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
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
          <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Profile</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{content.profile}</p>
          </section>
        )}

        {/* Key Competences */}
        {content.keyCompetences && content.keyCompetences.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Competences</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {content.keyCompetences.map((comp, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{comp.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{comp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-4">
          <p>Created with CV Builder</p>
        </footer>
      </div>
    </div>
  );
}
