'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  PublicCVError,
  PublicCVHeader,
  PublicCVLoading,
  PublicCVProfile,
} from '@/components/cv/public';
import { Footer } from '@/components/shared/footer';
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
    return <PublicCVLoading />;
  }

  if (error) {
    return <PublicCVError message={error} />;
  }

  if (!data) return null;

  const { cv, userProfile, shareLink } = data;
  const content = cv.content as CVContent;
  const privacyLevel = shareLink.privacy_level;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <PublicCVHeader content={content} userProfile={userProfile} privacyLevel={privacyLevel} />
        <PublicCVProfile content={content} />
        <Footer />
      </div>
    </div>
  );
}
