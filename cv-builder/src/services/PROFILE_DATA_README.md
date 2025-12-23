# Centralized Profile Data Service

**Single source of truth for all profile section data and completion tracking.**

## Overview

The centralized profile data system provides a unified way to access all profile sections and track completion status across the application.

## Architecture

```
┌─────────────────────────────────────────┐
│  React Components                       │
│  - Dashboard                            │
│  - Profile Pages                        │
│  - Sidebar Navigation                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  useProfileData() Hook                  │
│  - Centralized data access              │
│  - Completion calculations              │
│  - Easy-to-use helpers                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  profile-data.service.ts                │
│  - Fetch functions                      │
│  - Completion calculators               │
│  - Section metadata                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  /api/profile-data                      │
│  - Single optimized API call            │
│  - Fetches all sections in parallel     │
│  - Returns data + counts                │
└─────────────────────────────────────────┘
```

## Quick Start

### Basic Usage

```tsx
import { useProfileData } from '@/hooks/use-profile-data';

function MyComponent() {
  const {
    data,
    loading,
    overallCompletion,
    getSectionStatus
  } = useProfileData();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Profile {overallCompletion}% complete</p>
    </div>
  );
}
```

### Check Section Completion

```tsx
const { getSectionStatus } = useProfileData();

// Check work experience
const workExpStatus = getSectionStatus('workExperiences');
console.log(`Work Experience: ${workExpStatus.count} entries`);
console.log(`Complete: ${workExpStatus.isComplete}`);
```

### Access Raw Section Data

```tsx
const { data } = useProfileData();

// Get work experiences
const workExperiences = data?.sections.workExperiences.data || [];

// Get education
const educations = data?.sections.educations.data || [];

// Get user profile settings
const userProfile = data?.profile.data;
const defaultTagline = userProfile?.default_tagline || '';
```

### Check Completion by Navigation Href

```tsx
const { getStatusByHref } = useProfileData();

// Useful in navigation/sidebar
const status = getStatusByHref('/profile/experience');
if (status?.isComplete) {
  // Show checkmark
}
```

## Available Sections

The system tracks these profile sections:

| Section | Key | Href | Required |
|---------|-----|------|----------|
| Motivation & Vision | `motivationVision` | `/profile/motivation-vision` | No |
| Highlights | `highlights` | `/profile/highlights` | No |
| Projects | `projects` | `/profile/projects` | No |
| Work Experience | `workExperiences` | `/profile/experience` | ✅ Yes |
| Education | `educations` | `/profile/education` | ✅ Yes |
| Skills | `skillCategories` | `/profile/skills` | ✅ Yes |
| Key Competences | `keyCompetences` | `/profile/key-competences` | No |
| Certifications | `certifications` | `/profile/certifications` | No |
| References | `references` | `/profile/references` | No |

## API Reference

### Hook: `useProfileData()`

Returns:
- `data: ProfileDataResponse | null` - All section data
- `loading: boolean` - Loading state
- `error: string | null` - Error message
- `refetch: () => Promise<void>` - Manually refetch data
- `overallCompletion: number` - Overall % (0-100)
- `completedSections: number` - Count of complete sections
- `totalSections: number` - Total section count
- `requiredComplete: boolean` - All required sections done?
- `getSectionStatus(key)` - Get specific section status
- `getStatusByHref(href)` - Get status by URL path
- `sectionMetadata` - Reference to section definitions

### Service: `fetchAllProfileData()`

Fetches all profile data in a single optimized API call.

```tsx
import { fetchAllProfileData } from '@/services/profile-data.service';

const result = await fetchAllProfileData();
if (result.data) {
  // Use result.data
}
```

### Service: `calculateOverallCompletion(data)`

Calculates completion metrics from profile data.

```tsx
import { calculateOverallCompletion } from '@/services/profile-data.service';

const metrics = calculateOverallCompletion(data);
console.log(`${metrics.overallPercentage}% complete`);
console.log(`${metrics.completedSections}/${metrics.totalSections} sections done`);
console.log(`Required sections complete: ${metrics.requiredComplete}`);
```

## Examples

### Display Completion Progress

```tsx
function ProfileCompletionCard() {
  const { overallCompletion, completedSections, totalSections } = useProfileData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={overallCompletion} />
        <p>{completedSections} of {totalSections} sections complete</p>
      </CardContent>
    </Card>
  );
}
```

### Show Section Status in Sidebar

```tsx
function SidebarItem({ href, label }: { href: string; label: string }) {
  const { getStatusByHref } = useProfileData();
  const status = getStatusByHref(href);

  return (
    <Link href={href}>
      {label}
      {status?.isComplete && <CheckIcon />}
      {status && <Badge>{status.count}</Badge>}
    </Link>
  );
}
```

### Check if Profile is Ready

```tsx
function CVCreateButton() {
  const { requiredComplete } = useProfileData();

  return (
    <Button disabled={!requiredComplete}>
      {requiredComplete ? 'Create CV' : 'Complete Profile First'}
    </Button>
  );
}
```

## Performance

The centralized system is **highly optimized**:

✅ **Single API Call** - One request fetches all data
✅ **Parallel Queries** - All Supabase queries run in parallel
✅ **No Cache** - Always fresh data with `cache: 'no-store'`
✅ **Efficient Hook** - Single hook replaces 9+ individual hooks
✅ **Computed Values** - Completion % calculated once, memoized

## Migration Guide

### Before (Multiple Hooks)

```tsx
// OLD WAY ❌
const { data: workExp } = useFetchWorkExperiences();
const { data: education } = useFetchEducations();
const { data: skills } = useFetchSkills();
const { completion } = useProfileCompletion(); // Fetches everything again!
```

### After (Single Hook)

```tsx
// NEW WAY ✅
const { data, overallCompletion, getSectionStatus } = useProfileData();

const workExp = data?.sections.workExperiences.data || [];
const education = data?.sections.educations.data || [];
const skills = data?.sections.skillCategories.data || [];
```

## Best Practices

1. **Use the hook** - Always prefer `useProfileData()` over individual fetch hooks
2. **Access data directly** - Use `data?.sections.sectionKey.data` for raw data
3. **Check completion** - Use `getSectionStatus()` for completion checks
4. **Refetch when needed** - Call `refetch()` after mutations
5. **Handle loading** - Always check `loading` before rendering

## Related Files

- `/src/hooks/use-profile-data.ts` - Main hook
- `/src/services/profile-data.service.ts` - Service layer
- `/src/app/api/profile-data/route.ts` - API endpoint
- `/src/lib/profile-completion.ts` - Legacy (still used by old code)
- `/src/hooks/use-profile-completion.ts` - Legacy hook
