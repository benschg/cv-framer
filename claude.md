# Claude Development Notes

## Localization (i18n) Implementation

### Overview
The application uses a custom i18n solution with module-based translation files for English (en) and German (de).

### Structure
```
src/i18n/
  en/
    common.json          # Shared UI elements
    auth.json           # Authentication flows
    nav.json            # Navigation & sidebar
    profile.json        # Profile pages & forms
    applications.json   # Application tracker
    cv.json            # CV builder
    coverLetter.json   # Cover letter pages
    settings.json      # Settings page
    errors.json        # Error messages
  de/
    [same structure]
  index.ts             # Imports and merges all modules
  types.ts            # TypeScript types
```

### Usage Pattern

**In Components:**
```typescript
import { useAppTranslation } from '@/hooks/use-app-translation';

export function MyComponent() {
  const { t } = useAppTranslation();

  return (
    <div>
      <h1>{t('module.section.key')}</h1>
      <input placeholder={t('module.section.placeholder')} />
    </div>
  );
}
```

**Translation Keys:**
- Use dot notation: `t('auth.loginPage.title')`
- Nested structure in JSON: `{ "auth": { "loginPage": { "title": "Welcome" } } }`
- Keep keys semantic and hierarchical

**For Manager Components:**
Pass `t` function as prop to child components:
```typescript
// Parent component
const { t } = useAppTranslation();

<ChildComponent t={t} />

// Child component interface
interface ChildProps {
  t: (key: string) => string;
}
```

### Localized Placeholders
- English: `you@example.com`, `John`, `San Francisco, CA`
- German: `max@beispiel.de`, `Max`, `Berlin, Deutschland`

### Important Notes
1. **Always localize user-facing strings** - never hardcode display text
2. **Keep language buttons as "EN/DE"** - these don't need translation
3. **Use `useAppTranslation()`** for language context (reads from UserPreferencesContext)
4. **Commit incrementally** - one module or feature at a time
5. **Type-check after changes** - run `npm run type-check` before committing

### Completed Modules
- ✅ Phase 1: Module-based i18n structure
- ✅ Phase 2: Authentication (login, signup, OAuth, verification)
- ✅ Phase 3: Navigation & sidebar
- ✅ Phase 4: Error handling & boundaries
- ✅ Phase 5: Profile pages (basic info, photos, work experience, education, skills, key competences, certifications, references)

### Remaining Work
- Applications tracker
- CV builder
- Cover letter pages
- Settings page
- Testing & validation

### Adding New Translations
1. Add keys to both `src/i18n/en/module.json` and `src/i18n/de/module.json`
2. Use nested objects for logical grouping
3. Follow existing naming patterns (camelCase for keys)
4. Include both labels and placeholders where applicable
5. Test language switching works correctly

## Component Architecture & Refactoring

### Page Component Structure
Page components should be clean and focused on orchestration. Extract complex logic into reusable components and utilities.

**Good Page Structure:**
```typescript
'use client';

import { PageLoading, PageError, PageHeader } from '@/components/feature/...';
import { useFeatureData } from '@/hooks/use-feature-data';

export default function FeaturePage() {
  const { data, loading, error } = useFeatureData();

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader {...data} />
      <PageContent {...data} />
    </div>
  );
}
```

### Extraction Guidelines

**1. Extract State Components**
- Loading skeletons → `feature-loading.tsx`
- Error states → `feature-error.tsx`
- Empty states → `feature-empty.tsx`

**2. Extract Complex Sections**
- Headers with conditional logic → `feature-header.tsx`
- Forms with validation → `feature-form.tsx`
- Lists with filtering → `feature-list.tsx`

**3. Extract Business Logic**
- Privacy/permission logic → `lib/feature-privacy-utils.ts`
- Data transformations → `lib/feature-data-utils.ts`
- Validation rules → `lib/feature-validation.ts`

**4. Extract Data Fetching**
- API calls → `hooks/use-feature-data.ts`
- Mutations → `hooks/use-feature-mutation.ts`
- Real-time subscriptions → `hooks/use-feature-subscription.ts`

### Directory Structure
```
components/
  feature/              # Feature-specific components
    feature-loading.tsx
    feature-error.tsx
    feature-header.tsx
    feature-content.tsx
    index.ts            # Barrel export
  shared/              # Reusable across features
    public-page-layout.tsx
    data-table.tsx
lib/
  feature-utils.ts     # Pure utility functions
hooks/
  use-feature-data.ts  # Data fetching hooks
```

### Benefits
- **Maintainability** - Single responsibility per file
- **Reusability** - Components can be used across the app
- **Testability** - Isolated logic is easier to test
- **Readability** - Page files stay under ~100 lines
- **Collaboration** - Clear boundaries between concerns

### Example: Public CV Page Refactoring
Before (174 lines):
- Mixed data fetching, state management, and UI rendering
- Inline privacy logic scattered throughout

After (71 lines):
- Extracted `PublicCVLoading`, `PublicCVError`, `PublicCVHeader`, `PublicCVProfile`
- Created `cv-privacy-utils.ts` with reusable functions
- Page focused solely on orchestration

## TypeScript & Code Quality

### No `any` Types
**Never use `any` type.** Always use proper types:
- Use `unknown` when type is truly unknown, then narrow with type guards
- Use specific types from database types, API schemas, or create new interfaces
- Use generics when working with flexible data structures
- For catch blocks: use `catch (error: unknown)` and narrow with `error instanceof Error`

```typescript
// BAD
function processData(data: any) { ... }

// GOOD
function processData(data: UserProfile) { ... }
function processData<T extends Record<string, unknown>>(data: T) { ... }
```

### Unused Variables
- Prefix unused parameters with underscore: `_unusedParam`
- Remove truly unused imports and variables
- ESLint will catch these with `@typescript-eslint/no-unused-vars`

### Pre-commit Hooks
The following checks run on commit:
1. **Prettier** - Auto-formats code
2. **ESLint** - Lints and blocks on errors
3. **TypeScript** - Type-checks and blocks on errors
4. **Knip** - Dead code detection (warning only)

### Available Scripts
```bash
bun run lint        # Check for ESLint errors
bun run lint:fix    # Auto-fix ESLint errors
bun run format      # Format with Prettier
bun run type-check  # TypeScript type check
bun run knip        # Find unused code/dependencies
bun run test        # Run tests
bun run test:ui     # Run tests with UI
bun run test:coverage # Run tests with coverage
```

## Document Storage

### Server-Side Upload API
Document uploads (reference letters, certifications) use server-side API routes for security:

| Document Type | Upload Endpoint | Delete Endpoint |
|--------------|-----------------|-----------------|
| References | `/api/reference-documents/upload` | `/api/reference-documents/[id]` |
| Certifications | `/api/certification-documents/upload` | `/api/certification-documents/[id]` |

### Storage Utilities
Shared utilities in `lib/storage-utils.ts`:
- `validateDocumentFile(file)` - Validates file type and size
- `generateStoragePath(userId, parentId, filename)` - Creates unique storage path
- `uploadToStorage(supabase, bucket, path, file)` - Uploads to Supabase Storage
- `deleteFromStorage(supabase, bucket, path)` - Deletes from storage
- `extractStoragePath(url, bucket)` - Extracts path from public URL

### File Constraints
- **Max size**: 10MB
- **Allowed types**: PDF, JPEG, PNG, WebP
- **Path format**: `{userId}/{parentId}/{timestamp}_{random}_{filename}`

## Testing

### Setup
Tests use Vitest with jsdom environment. Configuration in `vitest.config.ts`.

### Running Tests
```bash
bun run test           # Run all tests
bun run test:ui        # Run with interactive UI
bun run test:coverage  # Run with coverage report
```

### Test Structure
```
src/
  test/
    setup.ts           # Test setup and global mocks
    mocks/
      supabase.ts      # Supabase client mock helper
  lib/
    storage-utils.test.ts
  app/api/
    reference-documents/upload/route.test.ts
    certification-documents/upload/route.test.ts
```

### Writing Tests
```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockSupabaseClient } from '@/test/mocks/supabase';

let mockSupabase: MockSupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('API Route', () => {
  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  it('should handle request', async () => {
    // Test implementation
  });
});
```
