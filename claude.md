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
```
