'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Save, Plus } from 'lucide-react';
import { PhotoUpload } from '@/components/profile/photo-upload';
import { PhotoGallery } from '@/components/profile/photo-gallery';
import { fetchProfilePhotos, getPhotoPublicUrl } from '@/services/profile-photo.service';
import type { ProfilePhoto } from '@/types/api.schemas';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<ProfilePhoto | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Form state - pre-filled with user data
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
    defaultTagline: '',
  });

  // Load photos
  const loadPhotos = async () => {
    setLoadingPhotos(true);
    const result = await fetchProfilePhotos();
    if (result.data) {
      setPhotos(result.data.photos);
      setPrimaryPhoto(result.data.primaryPhoto);
    }
    setLoadingPhotos(false);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Save to Supabase user_profiles table
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsSaved(true);
  };

  const userInitials = formData.firstName
    ? `${formData.firstName.charAt(0)}${formData.lastName?.charAt(0) || ''}`
    : user?.email?.charAt(0).toUpperCase() || 'U';

  const primaryPhotoUrl = primaryPhoto
    ? getPhotoPublicUrl(primaryPhoto.storage_path)
    : user?.user_metadata?.avatar_url;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and professional details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photos</CardTitle>
            <CardDescription>
              Upload multiple photos and choose which one to use for each CV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Primary Photo */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={primaryPhotoUrl} />
                <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {primaryPhoto ? 'Primary Photo' : 'No photos uploaded'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUpload(!showUpload)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showUpload ? 'Hide Upload' : 'Add Photo'}
                </Button>
              </div>
            </div>

            {/* Upload Section */}
            {showUpload && (
              <div>
                <PhotoUpload
                  onUploadComplete={() => {
                    loadPhotos();
                    setShowUpload(false);
                  }}
                  isPrimary={photos.length === 0}
                />
              </div>
            )}

            {/* Photo Gallery */}
            {loadingPhotos ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : (
              <PhotoGallery
                photos={photos}
                primaryPhoto={primaryPhoto}
                onUpdate={loadPhotos}
                userInitials={userInitials}
              />
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your name and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Email is managed through your account settings
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Links */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Links</CardTitle>
            <CardDescription>
              Add links to your professional profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Personal Website</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Default CV Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Default CV Settings</CardTitle>
            <CardDescription>
              Set default values for new CVs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultTagline">Default Tagline</Label>
              <Input
                id="defaultTagline"
                name="defaultTagline"
                value={formData.defaultTagline}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer | React & Node.js"
              />
              <p className="text-xs text-muted-foreground">
                This will be used as the default tagline for new CVs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          {isSaved && (
            <p className="text-sm text-green-600 self-center">
              Changes saved successfully!
            </p>
          )}
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
