'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CVPreview } from '@/components/cv/cv-preview';
import { useAuth } from '@/contexts/auth-context';
import { getUserLocation, getUserName, getUserPhone } from '@/lib/user-utils';
import { fetchCVEducations } from '@/services/cv-education.service';
import { fetchCVKeyCompetences } from '@/services/cv-key-competences.service';
import { fetchCVSkillCategories } from '@/services/cv-skill-categories.service';
import { fetchCVWorkExperiences } from '@/services/cv-work-experience.service';
import { fetchProfilePhotos } from '@/services/profile-photo.service';
import type { ProfilePhotoWithUrl } from '@/types/api.schemas';
import type { CVDocument as CVDocumentType, UserProfile } from '@/types/cv.types';
import type {
  CVEducationWithSelection,
  CVKeyCompetenceWithSelection,
  CVSkillCategoryWithSelection,
  CVWorkExperienceWithSelection,
} from '@/types/profile-career.types';

interface CVThumbnailProps {
  cv: CVDocumentType;
  className?: string;
}

export function CVThumbnail({ cv, className }: CVThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.15);
  const { user } = useAuth();

  // Data state for full CV preview
  const [workExperiences, setWorkExperiences] = useState<CVWorkExperienceWithSelection[]>([]);
  const [educations, setEducations] = useState<CVEducationWithSelection[]>([]);
  const [skillCategories, setSkillCategories] = useState<CVSkillCategoryWithSelection[]>([]);
  const [keyCompetences, setKeyCompetences] = useState<CVKeyCompetenceWithSelection[]>([]);
  const [photos, setPhotos] = useState<ProfilePhotoWithUrl[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhotoWithUrl | null>(null);
  const [loading, setLoading] = useState(true);

  // Build user profile from auth context
  const userProfile: UserProfile | undefined = useMemo(() => {
    if (!user) return undefined;
    return {
      id: user.id,
      user_id: user.id,
      first_name: getUserName(user).firstName,
      last_name: getUserName(user).lastName,
      email: user.email,
      phone: getUserPhone(user),
      location: getUserLocation(user),
      preferred_language: cv.language,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    };
  }, [user, cv.language]);

  // Load all CV data
  useEffect(() => {
    const loadData = async () => {
      const [workExpResult, eduResult, skillsResult, competencesResult, photosResult] =
        await Promise.all([
          fetchCVWorkExperiences(cv.id),
          fetchCVEducations(cv.id),
          fetchCVSkillCategories(cv.id),
          fetchCVKeyCompetences(cv.id),
          fetchProfilePhotos(),
        ]);

      if (workExpResult.data) setWorkExperiences(workExpResult.data);
      if (eduResult.data) setEducations(eduResult.data);
      if (skillsResult.data) setSkillCategories(skillsResult.data);
      if (competencesResult.data) setKeyCompetences(competencesResult.data);

      if (photosResult.data) {
        setPhotos(photosResult.data.photos);
        setPrimaryPhoto(photosResult.data.primaryPhoto);
      }

      setLoading(false);
    };

    loadData();
  }, [cv.id]);

  // Derive photo URL from state (no useEffect needed)
  const photoUrl = useMemo(() => {
    // Wait for photo data to load before determining photo URL
    if (loading) return null;

    const selectedPhotoId = cv.content?.selected_photo_id;

    if (selectedPhotoId === 'none') {
      return null;
    } else if (selectedPhotoId && selectedPhotoId !== 'none') {
      const selectedPhoto = photos.find((p) => p.id === selectedPhotoId);
      if (selectedPhoto) {
        return selectedPhoto.signedUrl;
      } else {
        return primaryPhoto?.signedUrl ?? null;
      }
    } else if (!selectedPhotoId || selectedPhotoId === null) {
      // Use primary photo if available, otherwise no photo
      return primaryPhoto?.signedUrl ?? null;
    }
    return null;
  }, [cv.content?.selected_photo_id, photos, primaryPhoto, loading]);

  // Calculate zoom to fit the thumbnail container
  useEffect(() => {
    const calculateZoom = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      // A4 width is 210mm, convert to pixels at 96 DPI (210mm * 96/25.4 ≈ 794px)
      const previewWidth = 794;

      // Calculate zoom to fit within container
      const calculatedZoom = containerWidth / previewWidth;
      setZoom(calculatedZoom);
    };

    calculateZoom();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateZoom);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`group relative aspect-[1/1.414] overflow-visible ${className ?? ''}`}
    >
      <style>
        {`
          .cv-thumbnail-page-1 .cv-page:not(:first-child) {
            display: none !important;
          }
          .cv-thumbnail-page-2 .cv-page:first-child {
            display: none !important;
          }
          .cv-thumbnail-page-2 .cv-page:nth-child(2) {
            display: block !important;
          }
          .cv-thumbnail-page-2 .cv-page:nth-child(n+3) {
            display: none !important;
          }
        `}
      </style>

      {/* Back page - Page 2 (rotates right on hover, behind page 1) */}
      {!loading && (
        <div
          className="cv-thumbnail-page-2 pointer-events-none absolute inset-0 origin-bottom rounded-lg shadow-md transition-transform duration-500 ease-out group-hover:translate-x-[3%] group-hover:rotate-[6deg] group-hover:scale-105"
          style={{ zIndex: 1 }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <CVPreview
              content={cv.content}
              displaySettings={cv.display_settings}
              language={cv.language}
              isInteractive={false}
              zoom={zoom}
              workExperiences={workExperiences}
              educations={educations}
              skillCategories={skillCategories}
              keyCompetences={keyCompetences}
              userProfile={userProfile}
              photoUrl={photoUrl}
            />
          </div>
        </div>
      )}

      {/* Front page - Page 1 (rotates left on hover, in front) */}
      {!loading && (
        <div
          className="cv-thumbnail-page-1 pointer-events-none absolute inset-0 origin-bottom rounded-lg shadow-md transition-transform duration-500 ease-out group-hover:-translate-x-[3%] group-hover:-rotate-[6deg] group-hover:scale-105"
          style={{ zIndex: 2 }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <CVPreview
              content={cv.content}
              displaySettings={cv.display_settings}
              language={cv.language}
              isInteractive={false}
              zoom={zoom}
              workExperiences={workExperiences}
              educations={educations}
              skillCategories={skillCategories}
              keyCompetences={keyCompetences}
              userProfile={userProfile}
              photoUrl={photoUrl}
            />
          </div>
        </div>
      )}

      {/* Loading spinner overlay */}
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/50 backdrop-blur-sm"
          style={{ zIndex: 4 }}
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Clickable overlay - allows click events to pass through to parent Link */}
      <div className="absolute inset-0" style={{ zIndex: 3 }} />
    </div>
  );
}
