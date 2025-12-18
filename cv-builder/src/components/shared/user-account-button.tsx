'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Settings, LogOut } from 'lucide-react';
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
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import { getUserInitials, getDisplayName } from '@/lib/user-utils';
import { useTranslations } from '@/hooks/use-translations';
import type { ProfilePhoto } from '@/types/api.schemas';

export function UserAccountButton() {
  const { user } = useAuth();
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
  const [mounted, setMounted] = useState(false);

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

  const avatarUrl = useMemo(
    () => primaryPhoto
      ? getPhotoPublicUrl(primaryPhoto.storage_path)
      : user?.user_metadata?.avatar_url,
    [primaryPhoto, user?.user_metadata?.avatar_url]
  );

  const userInitials = useMemo(
    () => getUserInitials(user),
    [user]
  );

  const displayName = useMemo(
    () => getDisplayName(user),
    [user]
  );

  if (!mounted || !user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:block text-left text-sm">
          <p className="font-medium truncate max-w-[120px]">
            {displayName}
          </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm">
            <p className="font-medium truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/cv" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('nav.items.dashboard')}
          </Link>
        </DropdownMenuItem>
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
  );
}
