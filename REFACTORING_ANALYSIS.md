# Comprehensive Codebase Refactoring Analysis

This document summarizes the complete analysis of the CV Framer 2 codebase for refactoring opportunities.

---

## Executive Summary

- **31 page files** analyzed
- **11 pages** exceed 150 lines (candidates for refactoring)
- **Estimated savings**: 2,000+ lines of code (32% reduction in page files)
- **Shared patterns identified**: 12 major opportunities for extraction
- **Estimated additional savings**: 800-1,000 lines through shared utilities

---

## Part 1: Page-Level Refactoring

### Tier 1: CRITICAL Priority (Exceeds 300 lines)

#### 1. CV Editor Page - 948 lines
**File**: [app/(dashboard)/cv/[id]/page.tsx](src/app/(dashboard)/cv/[id]/page.tsx)

**Issues**:
- 102 lines of state declarations (12 useState hooks)
- 6 separate useEffect blocks for data fetching
- 100+ lines of inline photo selection UI
- Mixed concerns: editing, AI generation, export

**Recommended Extractions**:
- `PhotoSelectionPopover` component (~80 lines)
- `CVSaveHandler` hook (~60 lines)
- `CVDataLoader` hook (~80 lines)
- `CVAIGenerationSection` component (~30 lines)

**Impact**: Reduce from 948 to ~600 lines (37% reduction)

---

#### 2. Applications Dashboard Page - 893 lines
**File**: [app/(dashboard)/applications/page.tsx](src/app/(dashboard)/applications/page.tsx)

**Issues**:
- Multiple view modes (Kanban vs Table) with massive inline JSX
- 4 helper components embedded in same file
- Complex filtering and drag-and-drop logic

**Recommended Extractions**:
- `ApplicationsKanbanView` component
- `ApplicationsTableView` component
- `ApplicationsFilter` component
- `ApplicationCard` component (consolidate variants)

**Impact**: Reduce from 893 to ~400 lines (55% reduction)

---

#### 3. Application Detail Page - 799 lines
**File**: [app/(dashboard)/applications/[id]/page.tsx](src/app/(dashboard)/applications/[id]/page.tsx)

**Issues**:
- 15 state declarations for form fields
- Complex auto-save with debouncing (91 lines)
- Multiple form sections inline (Job Details, Fit Analysis, Notes)
- Large sidebar (145 lines)

**Recommended Extractions**:
- `JobDetailsSection` component (~70 lines)
- `FitAnalysisSection` component (~120 lines)
- `ApplicationSidebar` component (~145 lines)
- `useApplicationAutoSave` hook (~90 lines)
- `ApplicationFormState` hook (~40 lines)

**Impact**: Reduce from 799 to ~350 lines (56% reduction)

---

### Tier 2: MEDIUM Priority (150-400 lines)

#### 4. New Application Page - 393 lines
- Extract `ApplicationFormFields` component
- Extract `JobAutoFillHandler` hook
- Extract `LinkedDocumentsSelector` component
- **Impact**: ~150 lines saved (38%)

#### 5. CV Dashboard Page - 314 lines
- Extract `CVEmptyState` component
- Extract `CVCard` component
- Extract `useCVDashboard` hook
- **Impact**: ~170 lines saved (54%)

#### 6. Settings Page - 257 lines
- Extract `ThemeSelector` component
- Extract `LanguageSelector` component
- Extract `LegalSection` component
- **Impact**: ~140 lines saved (54%)

#### 7. Landing Page - 256 lines
- Move `FadeInSection` to shared components
- Extract `FeatureCard` component
- Extract `FeatureGrid` component
- **Impact**: ~160 lines saved (62%)

#### 8. Cover Letter List - 250 lines
- Extract `CoverLetterEmptyState` component
- Extract `CoverLetterCard` component
- **Impact**: ~130 lines saved (52%)

#### 9-11. New CV/Cover Letter Pages - 351-370 lines each
- Create reusable `WizardForm` framework
- Extract `JobPostingInput` component
- Share language selector across pages
- **Impact**: ~200+ lines saved per page (57%)

---

### Tier 3: Profile Pages Pattern (11 pages × 31 lines)

**All profile sub-pages follow identical pattern**:
- education, experience, skills, certifications, references, highlights, projects, key-competences

**Current Pattern**:
```typescript
export default function SectionPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const managerRef = useRef<ManagerRef>(null);

  return (
    <ProfilePageLayout
      title={t('...')}
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
    >
      <Manager ref={managerRef} onSavingChange={setIsSaving} />
    </ProfilePageLayout>
  );
}
```

**Recommendation**: Create `ProfileSectionPage` factory function
- **Impact**: 341 lines → 50 lines template (290 lines saved, 85% reduction)

---

## Part 2: Shared Code Patterns

### Priority 1: HIGH Impact Extractions

#### 1. Form Auto-Save Hook ⭐
**Pattern**: Debounced form field changes with save status indicators

**Current Usage** (duplicated in 3+ places):
- Profile page
- CV editor
- Application detail page

**Proposed**: `hooks/use-form-auto-save.ts`
```typescript
export function useFormAutoSave<T extends Record<string, unknown>>(
  initialData: T,
  onSave: (data: Partial<T>) => Promise<{ error: string | null }>
) {
  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFieldChange = useCallback((name: string, value: unknown) => {
    // Debounced save logic
  }, []);

  return { formData, isSaving, saveSuccess, handleFieldChange };
}
```

**Impact**: ~15 lines saved per usage, 3+ usages = **45+ lines**

---

#### 2. API Route Auth Middleware ⭐⭐⭐
**Pattern**: Repeated auth checks in every API route

**Current Usage**: 30+ API routes

**Proposed**: `lib/api-middleware.ts`
```typescript
export async function withAuth(
  request: NextRequest,
  handler: (supabase: SupabaseClient, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return await handler(supabase, user.id);
  } catch (error) {
    return errorResponse(error);
  }
}
```

**Impact**: ~8 lines saved per route × 30 routes = **240 lines**

---

#### 3. CV Section Customizer Component ⭐⭐
**Pattern**: Collapsible sections with visibility toggles, description overrides

**Current Usage**: 5 CV section components
- cv-education-section.tsx
- cv-work-experience-section.tsx
- cv-skill-categories-section.tsx
- cv-key-competences-section.tsx
- cv-projects-section.tsx

**Proposed**: `components/cv/CVSectionCustomizer.tsx`

**Impact**: ~100 lines saved per component × 5 = **500 lines**

---

### Priority 2: MEDIUM Impact Extractions

#### 4. API Response Wrapper
**Proposed**: `hooks/use-api-call.ts`
- Standardize `{ data, error }` pattern
- Consistent error handling
- **Impact**: ~60 lines across 5 service files

#### 5. Data Merge with Selection State
**Proposed**: `lib/data-merge-utils.ts`
- Generic function for merging profile data with CV selections
- **Impact**: ~100 lines across 5 CV service files

#### 6. Supabase Helpers
**Proposed**: `lib/supabase-helpers.ts`
- `getCurrentUserId()`
- `withAuth()` wrapper
- **Impact**: ~50-100 lines across 10+ files

---

### Priority 3: LOWER Impact (Already Good)

- ✅ Manager CRUD State - Already extracted as `use-profile-manager.ts`
- ✅ Storage Operations - Already in `lib/storage-utils.ts`
- ✅ Request Validation - Already in `lib/api-utils.ts`
- ✅ Document Upload - Partially extracted in `ai-upload-shared.tsx`

---

## Recommended Execution Plan

### Phase 1: Quick Wins (1-2 weeks)
**Focus**: Profile pages and cross-cutting patterns

1. **Create ProfileSectionPage factory** (1 day)
   - Convert 11 profile pages
   - Savings: 290 lines

2. **Extract cross-cutting patterns** (1 week)
   - `useFormAutoSave` hook → 45+ lines saved
   - `withAuth` middleware → 240 lines saved
   - Button/toggle group components → 40 lines saved
   - **Total Phase 1**: ~575 lines saved

### Phase 2: Major Page Refactoring (2-3 weeks)
**Focus**: Largest pages (CV editor, Applications dashboard, Application detail)

3. **CV Editor refactoring** (1 week)
   - Extract photo popover, data loader, save handler
   - Savings: 350 lines

4. **Applications pages** (1 week)
   - Dashboard view separation
   - Application detail sections
   - Savings: 850 lines

5. **Dashboard pages** (3-4 days)
   - CV/Cover Letter dashboards
   - Settings page
   - Savings: 400 lines

**Total Phase 2**: ~1,600 lines saved

### Phase 3: CV Section Components (1 week)
**Focus**: Standardize CV section UI

6. **CVSectionCustomizer component** (1 week)
   - Extract from 5 section components
   - Savings: 500 lines

**Total Phase 3**: 500 lines saved

---

## Total Impact Summary

| Category | Lines Saved | Files Affected | Effort |
|----------|-------------|----------------|--------|
| Profile pages pattern | 290 | 11 pages | Low |
| Cross-cutting patterns | 385 | 15+ files | Medium |
| Major page refactoring | 1,600 | 11 pages | High |
| CV section components | 500 | 5 components | Medium |
| **TOTAL** | **2,775+** | **40+ files** | **6-8 weeks** |

### Additional Benefits
- **Maintainability**: Single source of truth for patterns
- **Testability**: Isolated components and utilities
- **Consistency**: Standardized UX patterns
- **Onboarding**: Clearer code structure
- **Type Safety**: Better TypeScript coverage

---

## Next Steps

1. Review this analysis with the team
2. Prioritize based on:
   - Development bandwidth
   - Feature roadmap
   - Technical debt priorities
3. Start with Phase 1 (quick wins)
4. Track progress and measure impact
5. Update CLAUDE.md with new patterns as they're established

---

*Analysis completed: 2025-12-18*
*Agents used: Explore (thorough mode)*
*Total files analyzed: 200+ TypeScript/TSX files*
