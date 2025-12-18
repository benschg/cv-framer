import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the auth context
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    avatar_url: 'https://oauth.provider.com/avatar.jpg',
  },
};

vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
  })),
}));

// Mock the profile photo service
const mockFetchProfilePhotos = vi.fn();

vi.mock('@/services/profile-photo.service', () => ({
  fetchProfilePhotos: () => mockFetchProfilePhotos(),
}));

// Import after mocking
const { usePrimaryPhoto } = await import('./use-primary-photo');
const { useAuth } = await import('@/contexts/auth-context');

describe('usePrimaryPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: mockUser });
  });

  it('should return loading true initially', async () => {
    mockFetchProfilePhotos.mockResolvedValue({
      data: { photos: [], primaryPhoto: null },
    });

    const { result } = renderHook(() => usePrimaryPhoto());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return primaryPhoto after loading', async () => {
    const mockPrimaryPhoto = {
      id: 'photo-1',
      signedUrl: 'https://supabase.co/storage/sign/photo.jpg?token=abc',
      filename: 'photo.jpg',
      is_primary: true,
    };

    mockFetchProfilePhotos.mockResolvedValue({
      data: {
        photos: [mockPrimaryPhoto],
        primaryPhoto: mockPrimaryPhoto,
      },
    });

    const { result } = renderHook(() => usePrimaryPhoto());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.primaryPhoto).toEqual(mockPrimaryPhoto);
    expect(result.current.avatarUrl).toBe(mockPrimaryPhoto.signedUrl);
  });

  it('should fallback to OAuth avatar when no primary photo', async () => {
    mockFetchProfilePhotos.mockResolvedValue({
      data: { photos: [], primaryPhoto: null },
    });

    const { result } = renderHook(() => usePrimaryPhoto());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.primaryPhoto).toBeNull();
    expect(result.current.avatarUrl).toBe(mockUser.user_metadata.avatar_url);
  });

  it('should return undefined avatarUrl when no photo and no OAuth avatar', async () => {
    const userWithoutAvatar = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {},
    };

    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: userWithoutAvatar });

    mockFetchProfilePhotos.mockResolvedValue({
      data: { photos: [], primaryPhoto: null },
    });

    const { result } = renderHook(() => usePrimaryPhoto());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.avatarUrl).toBeUndefined();
  });

  it('should not fetch photos when user is null', async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: null });

    const { result } = renderHook(() => usePrimaryPhoto());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchProfilePhotos).not.toHaveBeenCalled();
    expect(result.current.primaryPhoto).toBeNull();
  });

  it('should handle fetch error gracefully', async () => {
    mockFetchProfilePhotos.mockResolvedValue({
      error: 'Network error',
    });

    const { result } = renderHook(() => usePrimaryPhoto());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should still complete without crashing
    expect(result.current.primaryPhoto).toBeNull();
    expect(result.current.avatarUrl).toBe(mockUser.user_metadata.avatar_url);
  });

  it('should refetch when user changes', async () => {
    const initialPhoto = {
      id: 'photo-1',
      signedUrl: 'https://supabase.co/photo1.jpg?token=abc',
      is_primary: true,
    };

    mockFetchProfilePhotos.mockResolvedValue({
      data: { photos: [initialPhoto], primaryPhoto: initialPhoto },
    });

    const { result, rerender } = renderHook(() => usePrimaryPhoto());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchProfilePhotos).toHaveBeenCalledTimes(1);

    // Simulate user change
    const newUser = { ...mockUser, id: 'new-user-id' };
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ user: newUser });

    const newPhoto = {
      id: 'photo-2',
      signedUrl: 'https://supabase.co/photo2.jpg?token=xyz',
      is_primary: true,
    };

    mockFetchProfilePhotos.mockResolvedValue({
      data: { photos: [newPhoto], primaryPhoto: newPhoto },
    });

    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(mockFetchProfilePhotos).toHaveBeenCalledTimes(2);
    });
  });

  it('should prefer signedUrl over OAuth avatar', async () => {
    const mockPrimaryPhoto = {
      id: 'photo-1',
      signedUrl: 'https://supabase.co/storage/sign/photo.jpg?token=abc',
      filename: 'photo.jpg',
      is_primary: true,
    };

    mockFetchProfilePhotos.mockResolvedValue({
      data: {
        photos: [mockPrimaryPhoto],
        primaryPhoto: mockPrimaryPhoto,
      },
    });

    const { result } = renderHook(() => usePrimaryPhoto());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use signed URL, not OAuth avatar
    expect(result.current.avatarUrl).toBe(mockPrimaryPhoto.signedUrl);
    expect(result.current.avatarUrl).not.toBe(mockUser.user_metadata.avatar_url);
  });
});
