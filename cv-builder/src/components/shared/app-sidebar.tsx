'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Target,
  Mail,
  Briefcase,
  Settings,
  User,
  LogOut,
  Home,
  GraduationCap,
  Award,
  Code,
  Wrench,
  UserCheck,
  Zap,
  BookOpen,
  Star,
  FolderKanban,
} from 'lucide-react';
import { CVBuilderLogo } from './cv-builder-logo';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { useUserPreferences } from '@/contexts/user-preferences-context';
import { ThemeToggle } from './theme-toggle';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { getUserInitials, getDisplayName } from '@/lib/user-utils';
import { useTranslations } from '@/hooks/use-translations';
import type { ProfilePhoto } from '@/types/api.schemas';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
  const [mounted, setMounted] = useState(false);

  const navigation = [
    {
      label: t('nav.groups.overview'),
      items: [
        { title: t('nav.items.dashboard'), href: '/cv', icon: Home },
      ],
    },
    {
      label: t('nav.groups.build'),
      items: [
        { title: t('nav.items.profile'), href: '/profile', icon: User },
        { title: t('nav.items.motivationVision'), href: '/profile/motivation-vision', icon: Target, indent: true },
        { title: t('nav.items.highlights'), href: '/profile/highlights', icon: Star, indent: true },
        { title: t('nav.items.projects'), href: '/profile/projects', icon: FolderKanban, indent: true },
        { title: t('nav.items.workExperience'), href: '/profile/experience', icon: Briefcase, indent: true },
        { title: t('nav.items.education'), href: '/profile/education', icon: GraduationCap, indent: true },
        { title: t('nav.items.skills'), href: '/profile/skills', icon: Code, indent: true },
        { title: t('nav.items.keyCompetences'), href: '/profile/key-competences', icon: Zap, indent: true },
        { title: t('nav.items.certifications'), href: '/profile/certifications', icon: Award, indent: true },
        { title: t('nav.items.references'), href: '/profile/references', icon: UserCheck, indent: true },
        { title: t('nav.items.myCVs'), href: '/cv', icon: FileText },
        { title: t('nav.items.coverLetters'), href: '/cover-letter', icon: Mail },
      ],
    },
    {
      label: t('nav.groups.track'),
      items: [
        { title: t('nav.items.applications'), href: '/applications', icon: Briefcase },
      ],
    },
    {
      label: t('nav.groups.guides'),
      items: [
        { title: t('nav.items.atsFormatting'), href: '/guide/ats-formatting', icon: BookOpen },
      ],
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadPrimaryPhoto = async () => {
      const result = await fetchProfilePhotos();
      if (result.data?.primaryPhoto) {
        setPrimaryPhoto(result.data.primaryPhoto);
      }
    };

    if (user) {
      loadPrimaryPhoto();
    }
  }, [user]);

  const avatarUrl = primaryPhoto
    ? getPhotoPublicUrl(primaryPhoto.storage_path)
    : user?.user_metadata?.avatar_url;
  const userInitials = getUserInitials(user);
  const displayName = getDisplayName(user);

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/cv" className="flex items-center gap-2">
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
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                      className={'indent' in item && item.indent ? 'pl-8' : ''}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
                <p className="font-medium truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
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
              <DropdownMenuItem
                onClick={() => signOut()}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.user.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
