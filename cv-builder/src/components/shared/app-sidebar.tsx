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
import { ThemeToggle } from './theme-toggle';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { getUserInitials, getDisplayName } from '@/lib/user-utils';
import type { ProfilePhoto } from '@/types/api.schemas';

const navigation = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/cv', icon: Home },
    ],
  },
  {
    label: 'Build',
    items: [
      { title: 'Profile', href: '/profile', icon: User },
      { title: 'Work Experience', href: '/profile/experience', icon: Briefcase, indent: true },
      { title: 'Education', href: '/profile/education', icon: GraduationCap, indent: true },
      { title: 'Skills', href: '/profile/skills', icon: Code, indent: true },
      { title: 'Key Competences', href: '/profile/key-competences', icon: Zap, indent: true },
      { title: 'Certifications', href: '/profile/certifications', icon: Award, indent: true },
      { title: 'References', href: '/profile/references', icon: UserCheck, indent: true },
      { title: 'Werbeflaechen', href: '/werbeflaechen', icon: Target },
      { title: 'My CVs', href: '/cv', icon: FileText },
      { title: 'Cover Letters', href: '/cover-letter', icon: Mail },
    ],
  },
  {
    label: 'Track',
    items: [
      { title: 'Applications', href: '/applications', icon: Briefcase },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);

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
          <span className="text-lg font-bold">CV Builder</span>
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
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
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
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
