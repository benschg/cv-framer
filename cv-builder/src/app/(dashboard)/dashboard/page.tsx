'use client';

import {
  Award,
  Briefcase,
  FileText,
  GraduationCap,
  Mail,
  Plus,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppLanguage } from '@/hooks/use-app-language';
import { useProfileCompletion } from '@/hooks/use-profile-completion';
import { useTranslations } from '@/hooks/use-translations';
import { fetchAllCVs } from '@/services/cv.service';
import type { CVDocument } from '@/types/cv.types';

export default function DashboardOverviewPage() {
  const [cvs, setCvs] = useState<CVDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useAppLanguage();
  const { translations } = useTranslations(language);
  const { completion } = useProfileCompletion();

  useEffect(() => {
    const loadCVs = async () => {
      const result = await fetchAllCVs();
      if (!result.error) {
        setCvs(result.data || []);
      }
      setLoading(false);
    };
    loadCVs();
  }, []);

  const recentCVs = cvs.slice(0, 3);
  const profileSections = completion
    ? [
        {
          name: language === 'de' ? 'Motivation & Vision' : 'Motivation & Vision',
          href: '/profile/motivation-vision',
          complete: completion.completionByHref['/profile/motivation-vision']?.isComplete ?? false,
        },
        {
          name: language === 'de' ? 'Highlights' : 'Highlights',
          href: '/profile/highlights',
          complete: completion.completionByHref['/profile/highlights']?.isComplete ?? false,
        },
        {
          name: language === 'de' ? 'Berufserfahrung' : 'Work Experience',
          href: '/profile/experience',
          complete: completion.completionByHref['/profile/experience']?.isComplete ?? false,
        },
        {
          name: language === 'de' ? 'Ausbildung' : 'Education',
          href: '/profile/education',
          complete: completion.completionByHref['/profile/education']?.isComplete ?? false,
        },
        {
          name: language === 'de' ? 'Fähigkeiten' : 'Skills',
          href: '/profile/skills',
          complete: completion.completionByHref['/profile/skills']?.isComplete ?? false,
        },
      ]
    : [];

  const incompleteSections = profileSections.filter((section) => !section.complete);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {language === 'de' ? 'Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'de'
            ? 'Übersicht über Ihren Fortschritt und schnelle Aktionen'
            : 'Overview of your progress and quick actions'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'de' ? 'Profil-Fortschritt' : 'Profile Completion'}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{completion?.totalPercentage ?? 0}%</div>
                <Progress value={completion?.totalPercentage ?? 0} className="mt-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {completion
                    ? `${completion.completedSections}/${completion.totalSections} ${language === 'de' ? 'Abschnitte abgeschlossen' : 'sections complete'}`
                    : language === 'de'
                      ? 'Profil vervollständigen'
                      : 'Complete your profile'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'de' ? 'Meine CVs' : 'My CVs'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{cvs.length}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {cvs.length === 0
                    ? language === 'de'
                      ? 'Erstellen Sie Ihren ersten CV'
                      : 'Create your first CV'
                    : language === 'de'
                      ? 'Gesamt erstellt'
                      : 'Total created'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'de' ? 'Anschreiben' : 'Cover Letters'}
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {language === 'de' ? 'Generiert' : 'Generated'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'de' ? 'Bewerbungen' : 'Applications'}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {language === 'de' ? 'Aktiv verfolgt' : 'Actively tracked'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === 'de' ? 'Schnellaktionen' : 'Quick Actions'}
            </CardTitle>
            <CardDescription>
              {language === 'de'
                ? 'Häufig verwendete Aktionen'
                : 'Frequently used actions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/cv/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                {language === 'de' ? 'Neuen CV erstellen' : 'Create New CV'}
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                {language === 'de' ? 'Profil bearbeiten' : 'Edit Profile'}
              </Button>
            </Link>
            <Link href="/cover-letter/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                {language === 'de' ? 'Anschreiben erstellen' : 'Create Cover Letter'}
              </Button>
            </Link>
            <Link href="/applications">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Briefcase className="h-4 w-4" />
                {language === 'de' ? 'Bewerbungen verwalten' : 'Manage Applications'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {language === 'de' ? 'Profil vervollständigen' : 'Complete Your Profile'}
            </CardTitle>
            <CardDescription>
              {incompleteSections.length === 0
                ? language === 'de'
                  ? 'Ihr Profil ist vollständig!'
                  : 'Your profile is complete!'
                : language === 'de'
                  ? `Noch ${incompleteSections.length} ${incompleteSections.length === 1 ? 'Abschnitt' : 'Abschnitte'} zu vervollständigen`
                  : `${incompleteSections.length} ${incompleteSections.length === 1 ? 'section' : 'sections'} remaining`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : incompleteSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Award className="mb-2 h-12 w-12 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {language === 'de'
                    ? 'Großartig! Alle Profilabschnitte sind vollständig.'
                    : 'Great! All profile sections are complete.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {incompleteSections.slice(0, 5).map((section) => (
                  <Link key={section.href} href={section.href}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      {section.href.includes('motivation') && <Target className="h-4 w-4" />}
                      {section.href.includes('highlights') && <Award className="h-4 w-4" />}
                      {section.href.includes('experience') && <Briefcase className="h-4 w-4" />}
                      {section.href.includes('education') && <GraduationCap className="h-4 w-4" />}
                      {section.href.includes('skills') && <Target className="h-4 w-4" />}
                      {section.name}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent CVs */}
      {!loading && cvs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === 'de' ? 'Zuletzt bearbeitet' : 'Recently Edited'}
                </CardTitle>
                <CardDescription>
                  {language === 'de' ? 'Ihre neuesten CVs' : 'Your most recent CVs'}
                </CardDescription>
              </div>
              <Link href="/cv">
                <Button variant="outline" size="sm">
                  {language === 'de' ? 'Alle anzeigen' : 'View All'}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCVs.map((cv) => (
                <Link key={cv.id} href={`/cv/${cv.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{cv.name}</p>
                      {cv.description && (
                        <p className="truncate text-sm text-muted-foreground">{cv.description}</p>
                      )}
                    </div>
                    <div className="ml-4 text-sm text-muted-foreground">
                      {new Date(cv.updated_at).toLocaleDateString(
                        language === 'de' ? 'de-DE' : 'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started - Only show if no CVs */}
      {!loading && cvs.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'de' ? 'Erste Schritte' : 'Getting Started'}
            </CardTitle>
            <CardDescription>
              {language === 'de'
                ? 'Beginnen Sie mit dem Aufbau Ihres professionellen CVs'
                : 'Start building your professional CV'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">
                {language === 'de' ? '1. Profil vervollständigen' : '1. Complete Profile'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'de'
                  ? 'Fügen Sie Ihre Erfahrungen, Ausbildung und Fähigkeiten hinzu'
                  : 'Add your experience, education, and skills'}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">
                {language === 'de' ? '2. CV erstellen' : '2. Create CV'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'de'
                  ? 'Erstellen Sie Ihren ersten professionellen CV'
                  : 'Build your first professional CV'}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">
                {language === 'de' ? '3. Anschreiben generieren' : '3. Generate Cover Letter'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'de'
                  ? 'Erstellen Sie passende Anschreiben für Ihre Bewerbungen'
                  : 'Create tailored cover letters for your applications'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}