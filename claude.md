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
    werbeflaechen.json # Werbeflaechen module
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
import { useTranslations } from '@/hooks/use-translations';

export function MyComponent() {
  const { t } = useTranslations('en'); // TODO: Get language from user settings context

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
const { t } = useTranslations('en');

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
3. **Add TODO comments** for language context: `const { t } = useTranslations('en'); // TODO: Get language from user settings context`
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
- Werbeflaechen module
- Settings page
- Testing & validation

### Adding New Translations
1. Add keys to both `src/i18n/en/module.json` and `src/i18n/de/module.json`
2. Use nested objects for logical grouping
3. Follow existing naming patterns (camelCase for keys)
4. Include both labels and placeholders where applicable
5. Test language switching works correctly
