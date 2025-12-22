'use client';

import {
  Award,
  BookOpen,
  Briefcase,
  Code,
  FileText,
  FolderKanban,
  GraduationCap,
  Home,
  LogOut,
  Mail,
  Settings,
  Star,
  Target,
  User,
  UserCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useUserPreferences } from '@/contexts/user-preferences-context';
import { usePrimaryPhoto } from '@/hooks/use-primary-photo';
import { useProfileCompletion } from '@/hooks/use-profile-completion';
import { useTranslations } from '@/hooks/use-translations';
import { getDisplayName, getUserInitials } from '@/lib/user-utils';

import { CVBuilderLogo } from './cv-builder-logo';
import { ThemeToggle } from './theme-toggle';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);
  const { avatarUrl } = usePrimaryPhoto();
  const { completion } = useProfileCompletion();
  const [mounted, setMounted] = useState(false);

  const navigation = [
    {
      label: t('nav.groups.overview'),
      items: [{ title: t('nav.items.dashboard'), href: '/dashboard', icon: Home }],
    },
    {
      label: t('nav.groups.build'),
      items: [
        { title: t('nav.items.profile'), href: '/profile', icon: User },
        {
          title: t('nav.items.motivationVision'),
          href: '/profile/motivation-vision',
          icon: Target,
          indent: true,
          showCompletion: true,
        },
        {
          title: t('nav.items.highlights'),
          href: '/profile/highlights',
          icon: Star,
          indent: true,
          showCompletion: true,
        },
        {
          title: t('nav.items.projects'),
          href: '/profile/projects',
          icon: FolderKanban,
          indent: true,
          showCompletion: true,
        },
        {
          title: t('nav.items.workExperience'),
          href: '/profile/experience',
          icon: Briefcase,
          indent: true,
          showCompletion: true,
        },
        {
          title: t('nav.items.education'),
          href: '/profile/education',
          icon: GraduationCap,
          indent: true,
          showCompletion: true,
        },
        {
          title: t('nav.items.skills'),
          href: '/profile/skills',
          icon: Code,
          indent: true,
          showCompletion: true,
        },
        {
          title: t('nav.items.keyCompetences'),
          href: '/profile/key-competences',
          icon: Zap,
          indent: true,
          showCompletion: true,
        },
        {
          title: t('nav.items.certifications'),
          href: '/profile/certifications',
          icon: Award,
          indent: true,
          showCompletion: true,
        },
        {
          title: t('nav.items.references'),
          href: '/profile/references',
          icon: UserCheck,
          indent: true,
          showCompletion: true,
        },
        { title: t('nav.items.myCVs'), href: '/cv', icon: FileText },
        { title: t('nav.items.coverLetters'), href: '/cover-letter', icon: Mail },
      ],
    },
    {
      label: t('nav.groups.track'),
      items: [{ title: t('nav.items.applications'), href: '/applications', icon: Briefcase }],
    },
    {
      label: t('nav.groups.guides'),
      items: [
        { title: t('nav.items.atsFormatting'), href: '/guide/ats-formatting', icon: BookOpen },
      ],
    },
  ];

  useEffect(() => {
    // Valid pattern: setting mounted state to prevent hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const userInitials = useMemo(() => getUserInitials(user), [user]);

  const displayName = useMemo(() => getDisplayName(user), [user]);

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <CVBuilderLogo className="h-8 w-8" />
          <span className="text-lg font-bold">{t('nav.logo')}</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const showCompletion = 'showCompletion' in item && item.showCompletion;
                  const completionStatus = showCompletion
                    ? completion?.completionByHref[item.href]
                    : null;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                        className={'indent' in item && item.indent ? 'pl-8' : ''}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {showCompletion && completionStatus !== undefined && (
                            <CircularProgress
                              progress={completionStatus?.isComplete ?? false}
                              count={completionStatus?.count}
                              size={10}
                              strokeWidth={2}
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('nav.user.theme')}</span>
          <ThemeToggle />
        </div>
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left text-sm">
                <p className="truncate font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('nav.user.settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/logout" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  {t('nav.user.signOut')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
