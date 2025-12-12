# Layout System Implementation Plan

> Created: December 2024
> Status: In Progress

## Executive Summary

| Category | Pages | Status |
|----------|-------|--------|
| 🔴 HIGH PRIORITY - Core CRUD | 21 pages | Pending |
| 🟡 MEDIUM PRIORITY - Management | 15 pages | Pending |
| 🔧 Component Standardization | 5 new components | Pending |
| 📚 Documentation Updates | 3 files | In Progress |

---

## Current State Analysis

### Pages Using PersonaPageLayout
- **Total pages with PageLayout**: 67+
- **Total pages without PageLayout**: ~496
- **Coverage**: ~12%

### Citizen Pages (CitizenPageLayout)
- **Coverage**: 100% ✅ (8 pages)

### Components Available

| Component | Path | Status |
|-----------|------|--------|
| `PageLayout` | `PersonaPageLayout.jsx` | ✅ Complete |
| `PageHeader` | `PersonaPageLayout.jsx` | ✅ Complete |
| `SearchFilter` | `PersonaPageLayout.jsx` | ✅ Complete |
| `CardGrid` | `PersonaPageLayout.jsx` | ✅ Complete |
| `EmptyState` | `PersonaPageLayout.jsx` | ✅ Complete |
| `PersonaButton` | `PersonaPageLayout.jsx` | ✅ Complete |
| `usePersonaColors` | `PersonaPageLayout.jsx` | ✅ Complete |

---

## 🔴 HIGH PRIORITY: Core CRUD Pages (21 Pages)

### Phase H1: Challenge CRUD (3 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Challenge Create | `ChallengeCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Challenge Edit | `ChallengeEdit.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Challenge Detail | `ChallengeDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |

### Phase H2: Pilot CRUD (3 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Pilot Create | `PilotCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Pilot Edit | `PilotEdit.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Pilot Detail | `PilotDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |

### Phase H3: Program CRUD (3 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Program Create | `ProgramCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Program Edit | `ProgramEdit.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Program Detail | `ProgramDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |

### Phase H4: Solution CRUD (3 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Solution Create | `SolutionCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Solution Edit | `SolutionEdit.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Solution Detail | `SolutionDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |

### Phase H5: R&D CRUD (5 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| R&D Project Create | `RDProjectCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| R&D Project Edit | `RDProjectEdit.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| R&D Call Create | `RDCallCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| R&D Call Detail | `RDCallDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |
| R&D Proposal Create | `RDProposalCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |

### Phase H6: Living Lab CRUD (3 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Living Lab Create | `LivingLabCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Living Lab Edit | `LivingLabEdit.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Living Lab Detail | `LivingLabDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |

### Phase H7: Expert Pages (2 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Expert Detail | `ExpertDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |
| Browse Experts | `BrowseExperts.jsx` | Custom layout | PageLayout + SearchFilter + CardGrid | ⏳ |

---

## 🟡 MEDIUM PRIORITY: Management Pages (15 Pages)

### Phase M1: Admin Core (5 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| User Management | `UserManagement.jsx` | Custom layout | PageLayout + PageHeader + SearchFilter | ⏳ |
| Role Management | `RoleManagement.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Audit Registry | `AuditRegistry.jsx` | Custom layout | PageLayout + PageHeader + SearchFilter | ⏳ |
| Audit Trail | `AuditTrail.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Data Management Hub | `DataManagementHub.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |

### Phase M2: Matchmaker (4 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Matchmaker Journey | `MatchmakerJourney.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Matchmaker Applications | `MatchmakerApplications.jsx` | Custom layout | PageLayout + SearchFilter | ⏳ |
| Matchmaker Application Create | `MatchmakerApplicationCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Matchmaker Application Detail | `MatchmakerApplicationDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |

### Phase M3: Policy CRUD (3 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Policy Create | `PolicyCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Policy Edit | `PolicyEdit.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Policy Detail | `PolicyDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |

### Phase M4: Organization (3 pages)

| Page | File | Current State | Target State | Status |
|------|------|---------------|--------------|--------|
| Organization Create | `OrganizationCreate.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Organization Edit | `OrganizationEdit.jsx` | Custom layout | PageLayout + PageHeader | ⏳ |
| Organization Detail | `OrganizationDetail.jsx` | Custom layout | PageLayout + EntityDetailHeader | ⏳ |

---

## 🔧 Component Standardization

### New Components to Create

| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `EntityDetailHeader` | `src/components/layout/EntityDetailHeader.jsx` | Unified detail page headers | ⏳ |
| `EntityFormLayout` | `src/components/layout/EntityFormLayout.jsx` | Consistent form layouts | ⏳ |
| `EntityListLayout` | `src/components/layout/EntityListLayout.jsx` | List pages with filters | ⏳ |
| `EntityStatusBadge` | `src/components/layout/EntityStatusBadge.jsx` | Unified status badges | ⏳ |

### Component Specifications

#### EntityDetailHeader

```jsx
/**
 * Unified header for entity detail pages
 * 
 * @param {Object} props
 * @param {string} props.entityType - 'challenge' | 'pilot' | 'program' | 'solution' | 'rd_project' | 'living_lab'
 * @param {Object} props.entity - The entity data object
 * @param {string|Object} props.title - Title (string or bilingual {en, ar})
 * @param {string|Object} props.subtitle - Subtitle (optional)
 * @param {string} props.status - Entity status
 * @param {Array} props.breadcrumbs - Breadcrumb items [{label, path}]
 * @param {ReactNode} props.actions - Action buttons (Edit, Delete, etc.)
 * @param {Array} props.metadata - [{icon, label, value}]
 * @param {ReactNode} props.children - Additional header content
 */
```

#### EntityFormLayout

```jsx
/**
 * Consistent layout for create/edit forms
 * 
 * @param {Object} props
 * @param {'create'|'edit'} props.mode - Form mode
 * @param {string} props.entityType - Entity type for theming
 * @param {Object} props.title - Bilingual title {en, ar}
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.isSubmitting - Submitting state
 * @param {ReactNode} props.children - Form fields
 */
```

#### EntityListLayout

```jsx
/**
 * Wrapper for entity list pages with search/filter
 * 
 * @param {Object} props
 * @param {string} props.entityType - Entity type
 * @param {Object} props.title - Bilingual title {en, ar}
 * @param {Object} props.description - Bilingual description {en, ar}
 * @param {Array} props.data - Data array
 * @param {boolean} props.isLoading - Loading state
 * @param {Object} props.searchConfig - {placeholder, fields}
 * @param {Array} props.filterConfig - Filter definitions
 * @param {Object} props.columns - Grid columns {sm, md, lg}
 * @param {Function} props.renderCard - Card render function
 * @param {ReactNode} props.emptyState - Empty state component
 * @param {Object} props.createAction - {label, path}
 */
```

#### EntityStatusBadge

```jsx
/**
 * Unified status badge with consistent colors
 * 
 * @param {Object} props
 * @param {string} props.status - Status value
 * @param {string} props.entityType - Entity type for color mapping
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {boolean} props.showIcon - Show status icon
 */
```

---

## 📊 SearchFilter & CardGrid Migration

### Pages to Migrate (10 high-impact list pages)

| Page | Has Search | Has Filters | Has Grid | Priority |
|------|------------|-------------|----------|----------|
| `Challenges.jsx` | ✅ Custom | ✅ Custom | ✅ Custom | High |
| `Pilots.jsx` | ✅ Custom | ✅ Custom | ✅ Custom | High |
| `Programs.jsx` | ✅ Custom | ✅ Custom | ✅ Custom | High |
| `Solutions.jsx` | ✅ Custom | ✅ Custom | ✅ Custom | High |
| `RDProjects.jsx` | ✅ Custom | ✅ Custom | ✅ Custom | Medium |
| `LivingLabs.jsx` | ✅ Custom | ✅ Custom | ✅ Custom | Medium |
| `Organizations.jsx` | ✅ Custom | ✅ Custom | ✅ Custom | Medium |
| `ExpertRegistry.jsx` | ✅ Custom | ✅ Custom | ✅ Custom | Medium |
| `UserManagement.jsx` | ✅ Custom | ✅ Custom | ✅ Table | Low |
| `AuditRegistry.jsx` | ✅ Custom | ✅ Custom | ✅ Table | Low |

### Migration Pattern

```jsx
// BEFORE (custom implementation)
<div className="relative mb-4">
  <Search className="absolute left-3 top-3 h-4 w-4" />
  <Input value={search} onChange={...} className="pl-10" />
</div>
<Select value={filter} onValueChange={...}>
  ...custom filter options...
</Select>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(...)}
</div>

// AFTER (standardized)
import { PageLayout, PageHeader, SearchFilter, CardGrid } from '@/components/layout/PersonaPageLayout';

<PageLayout>
  <PageHeader ... />
  <SearchFilter
    searchTerm={search}
    onSearchChange={setSearch}
    searchPlaceholder={t({ en: 'Search...', ar: 'بحث...' })}
    filters={[
      { value: filter, onChange: setFilter, label: 'Status', options: statusOptions }
    ]}
    viewMode={viewMode}
    onViewModeChange={setViewMode}
  />
  <CardGrid viewMode={viewMode} columns={{ sm: 1, md: 2, lg: 3 }}>
    {items.map(...)}
  </CardGrid>
</PageLayout>
```

---

## Implementation Schedule

### Week 1: Foundation
- [x] Create implementation plan documentation
- [ ] Create `EntityDetailHeader` component
- [ ] Create `EntityFormLayout` component
- [ ] Create `EntityStatusBadge` component

### Week 2: Challenge & Pilot CRUD
- [ ] Phase H1: ChallengeCreate, ChallengeEdit, ChallengeDetail
- [ ] Phase H2: PilotCreate, PilotEdit, PilotDetail

### Week 3: Program & Solution CRUD
- [ ] Phase H3: ProgramCreate, ProgramEdit, ProgramDetail
- [ ] Phase H4: SolutionCreate, SolutionEdit, SolutionDetail

### Week 4: R&D & Living Lab CRUD
- [ ] Phase H5: RDProjectCreate, RDProjectEdit, RDCallCreate, RDCallDetail, RDProposalCreate
- [ ] Phase H6: LivingLabCreate, LivingLabEdit, LivingLabDetail

### Week 5: Expert & Admin
- [ ] Phase H7: ExpertDetail, BrowseExperts
- [ ] Phase M1: UserManagement, RoleManagement, AuditRegistry, AuditTrail, DataManagementHub

### Week 6: Remaining & Documentation
- [ ] Phase M2-M4: Matchmaker, Policy, Organization pages
- [ ] SearchFilter migration for 10 list pages
- [ ] Update all documentation

---

## Success Metrics

| Metric | Before | Target | Current |
|--------|--------|--------|---------|
| Pages with PageLayout | 67 | 103+ | 67 |
| Pages using SearchFilter | 8 | 18+ | 8 |
| Pages using CardGrid | 8 | 15+ | 8 |
| Reusable layout components | 6 | 10 | 6 |
| Documentation coverage | 60% | 95% | 60% |

---

## Changelog

| Date | Changes |
|------|---------|
| Dec 2024 | Created implementation plan |
