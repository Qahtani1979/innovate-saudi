# Municipality Persona - Layout System Coverage

> Last Updated: December 2024

## Overview

The **Municipality** persona serves local government staff managing urban challenges, pilots, and innovation initiatives.

---

## Route Configuration (usePersonaRouting.js)

```javascript
{
  persona: 'municipality',
  defaultDashboard: '/municipality-dashboard',
  dashboardLabel: { en: 'Municipality Dashboard', ar: 'لوحة البلدية' },
  onboardingWizard: 'MunicipalityStaffOnboarding',
  portalType: 'municipality',
}
```

**Roles Mapped:**
- `municipality_admin`
- `municipality_staff`
- `municipality_coordinator`
- `municipality_manager`
- `municipality_director`
- `municipality_innovation_officer`
- `municipality_viewer`

---

## Summary Statistics

| Category | With PageLayout | Total | Coverage |
|----------|-----------------|-------|----------|
| **Dashboard** | 1 | 1 | 100% ✅ |
| **Municipality Pages** | 3 | 11 | 27% |
| **City/MII Pages** | 0 | 4 | 0% |
| **Cross-City Pages** | 0 | 3 | 0% |
| **Related Components** | - | 7 | N/A |
| **TOTAL** | 4 | 18+ | 22% |

---

## Pages Status

### ✅ Pages WITH PageLayout (4 pages)

| Page | File | Layout Type |
|------|------|-------------|
| Municipality Dashboard | `MunicipalityDashboard.jsx` | `PageLayout` ✅ |
| Municipal Proposal Inbox | `MunicipalProposalInbox.jsx` | `PageLayout` ✅ |
| Municipality Peer Matcher | `MunicipalityPeerMatcher.jsx` | `PageLayout` ✅ |
| Municipality Ideas View | `MunicipalityIdeasView.jsx` | `PageLayout` ✅ |

---

### ❌ Pages WITHOUT PageLayout (14+ pages)

#### Municipality Core Pages (HIGH PRIORITY)

| Page | File | Lines | Priority |
|------|------|-------|----------|
| Municipality Profile | `MunicipalityProfile.jsx` | 573 | 🔴 High |
| Municipality Create | `MunicipalityCreate.jsx` | 233 | 🔴 High |
| Municipality Edit | `MunicipalityEdit.jsx` | ~200 | 🔴 High |

#### MII (Municipal Innovation Index) Pages (HIGH PRIORITY)

| Page | File | Lines | Priority |
|------|------|-------|----------|
| MII | `MII.jsx` | 454 | 🔴 High |
| MII Drill Down | `MIIDrillDown.jsx` | 290 | 🔴 High |

#### City Management Pages (MEDIUM PRIORITY)

| Page | File | Lines | Priority |
|------|------|-------|----------|
| City Management | `CityManagement.jsx` | 352 | 🟡 Medium |
| City Dashboard | `CityDashboard.jsx` | 204 | 🟡 Medium |

#### Cross-City Collaboration Pages (MEDIUM PRIORITY)

| Page | File | Lines | Priority |
|------|------|-------|----------|
| Cross City Learning Hub | `CrossCityLearningHub.jsx` | 242 | 🟡 Medium |
| Multi City Coordination | `MultiCityCoordination.jsx` | 159 | 🟡 Medium |
| Multi City Orchestration | `MultiCityOrchestration.jsx` | ~150 | 🟡 Medium |

#### Municipality Staff Pages (MEDIUM PRIORITY)

| Page | File | Priority |
|------|------|----------|
| Municipality Staff Onboarding | `MunicipalityStaffOnboarding.jsx` | 🟡 Wizard |
| My Municipality Staff Profile | `MyMunicipalityStaffProfile.jsx` | 🟡 Medium |

#### Coverage Reports (LOW PRIORITY - Internal)

| Page | File | Priority |
|------|------|----------|
| Municipality Coverage Report | `MunicipalityCoverageReport.jsx` | 🟢 Low |
| MII Coverage Report | `MIICoverageReport.jsx` | 🟢 Low |

---

## Municipality Components

### Located in `src/components/municipalities/`

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| MII Improvement AI | `MIIImprovementAI.jsx` | AI recommendations for improving MII score | ✅ Active |
| Municipality Best Practices | `MunicipalityBestPractices.jsx` | Best practices library | ✅ Active |
| Municipality Knowledge Base | `MunicipalityKnowledgeBase.jsx` | Knowledge resources | ✅ Active |
| Municipality Training Enrollment | `MunicipalityTrainingEnrollment.jsx` | Training signup | ✅ Active |
| Municipality Training Progress | `MunicipalityTrainingProgress.jsx` | Training tracking | ✅ Active |
| Peer Benchmarking Tool | `PeerBenchmarkingTool.jsx` | Compare with peer municipalities | ✅ Active |
| Quick Solutions Marketplace | `QuickSolutionsMarketplace.jsx` | Browse solutions | ✅ Active |

---

## Search/Filter Components Used

| Component | Location | Used In |
|-----------|----------|---------|
| Standard Search Input | N/A | MunicipalityIdeasView, CityManagement |
| Region Filter Select | N/A | MII, CityManagement |
| No dedicated municipality filters | - | ⚠️ Gap |

---

## Widgets Used in Municipality Dashboard

| Widget | Source | Purpose |
|--------|--------|---------|
| Challenges Stats Cards | Inline | Show challenge counts |
| Pilots Stats Cards | Inline | Show pilot counts |
| MII Score Display | Inline | Show innovation index |
| AI Recommendations | Inline | AI-powered suggestions |
| Quick Actions Panel | Inline | Common actions |
| Training Progress | `MunicipalityTrainingProgress` | Training status |

---

## Features Analysis

### ✅ Implemented Features
- Municipality Dashboard with stats
- Challenge/Pilot management for municipality
- MII scoring and ranking
- Peer benchmarking
- Training enrollment
- Ideas view from citizens
- Cross-city learning
- AI-powered MII improvement suggestions

### ⚠️ Missing/Incomplete Features
- No dedicated Municipality List page (admin only?)
- No standardized municipality search/filter component
- No municipality comparison dashboard
- Profile page lacks PageLayout
- MII pages lack PageLayout

---

## Recommendations

### Phase 1 - HIGH PRIORITY (5 pages)

Apply PageLayout to core municipality pages:

1. **MunicipalityProfile.jsx** - Main profile view
2. **MunicipalityCreate.jsx** - Create form
3. **MunicipalityEdit.jsx** - Edit form
4. **MII.jsx** - MII ranking page
5. **MIIDrillDown.jsx** - Detailed MII analysis

### Phase 2 - MEDIUM PRIORITY (6 pages)

Apply PageLayout to city/collaboration pages:

1. **CityManagement.jsx** - City CRUD
2. **CityDashboard.jsx** - City overview
3. **CrossCityLearningHub.jsx** - Learning from peers
4. **MultiCityCoordination.jsx** - Multi-city pilots
5. **MultiCityOrchestration.jsx** - Orchestration
6. **MyMunicipalityStaffProfile.jsx** - Staff profile

### Phase 3 - NEW COMPONENTS

Consider creating:

1. **MunicipalitySearchFilter.jsx** - Reusable filter component
2. **MunicipalityComparisonDashboard.jsx** - Compare multiple municipalities
3. **MunicipalityWidgetLibrary.jsx** - Reusable dashboard widgets

---

## Implementation Pattern

### Standard Municipality Page Template

```jsx
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { Building2 } from 'lucide-react';

function MunicipalityPage() {
  const { t, isRTL } = useLanguage();

  const headerActions = (
    <div className="flex items-center gap-2">
      {/* Action buttons */}
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        icon={Building2}
        title={{ en: 'Page Title', ar: 'عنوان الصفحة' }}
        description={{ en: 'Description', ar: 'الوصف' }}
        actions={headerActions}
      />
      
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page content */}
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(MunicipalityPage, { requiredPermissions: [] });
```

---

## File Structure

```
src/
├── pages/
│   ├── MunicipalityDashboard.jsx     ✅ Has PageLayout
│   ├── MunicipalProposalInbox.jsx    ✅ Has PageLayout
│   ├── MunicipalityPeerMatcher.jsx   ✅ Has PageLayout
│   ├── MunicipalityIdeasView.jsx     ✅ Has PageLayout
│   ├── MunicipalityProfile.jsx       ❌ Missing
│   ├── MunicipalityCreate.jsx        ❌ Missing
│   ├── MunicipalityEdit.jsx          ❌ Missing
│   ├── MII.jsx                       ❌ Missing
│   ├── MIIDrillDown.jsx              ❌ Missing
│   ├── CityManagement.jsx            ❌ Missing
│   ├── CityDashboard.jsx             ❌ Missing
│   ├── CrossCityLearningHub.jsx      ❌ Missing
│   ├── MultiCityCoordination.jsx     ❌ Missing
│   ├── MultiCityOrchestration.jsx    ❌ Missing
│   ├── MyMunicipalityStaffProfile.jsx ❌ Missing
│   └── MunicipalityStaffOnboarding.jsx (wizard - skip)
│
├── components/
│   └── municipalities/
│       ├── MIIImprovementAI.jsx          ✅ Active
│       ├── MunicipalityBestPractices.jsx ✅ Active
│       ├── MunicipalityKnowledgeBase.jsx ✅ Active
│       ├── MunicipalityTrainingEnrollment.jsx ✅ Active
│       ├── MunicipalityTrainingProgress.jsx   ✅ Active
│       ├── PeerBenchmarkingTool.jsx      ✅ Active
│       └── QuickSolutionsMarketplace.jsx ✅ Active
│
└── hooks/
    └── useMunicipalitiesWithVisibility.js ✅ Active
```

---

## Next Steps

1. ✅ Document complete (this file)
2. ⏳ Apply PageLayout to 5 high-priority pages
3. ⏳ Apply PageLayout to 6 medium-priority pages
4. ⏳ Consider new reusable components
