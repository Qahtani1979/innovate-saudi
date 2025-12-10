# Phase 4: Provider/Startup Specialized Onboarding + Dashboard
## Validation Plan

**Version:** 1.0  
**Last Updated:** 2024-12-10  
**Reference:** `docs/personas/PROVIDER_PERSONA.md`

---

## Phase Index
| Phase | Name | Status |
|-------|------|--------|
| 1 | Registration & Authentication | ✅ Complete |
| 2 | Main Onboarding Wizard | ✅ Complete |
| 3 | Municipality Staff Onboarding + Dashboard | ✅ Complete |
| **4** | **Provider/Startup Onboarding + Dashboard** | 📋 Current |
| 5 | Researcher Onboarding + Dashboard | Planned |

---

## 1. StartupOnboardingWizard Validation

### 1.1 Stage 1 Data Inheritance (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-001 | Company name from organization_en | Pre-populated | Critical |
| P4-002 | Company name AR from organization_ar | Pre-populated | High |
| P4-003 | Description from bio_en/bio_ar | Pre-populated | High |
| P4-004 | Sectors from expertise_areas | Pre-populated | High |
| P4-005 | LinkedIn URL from Stage 1 | Pre-populated | Medium |
| P4-006 | CV URL from Stage 1 | Pre-populated | Medium |
| P4-007 | Website from user_profiles | Pre-populated | Medium |
| P4-008 | No duplicate data entry | Compare fields | Critical |

### 1.2 Wizard Step Navigation (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-009 | Step 1 (Company Info) loads | Form renders | Critical |
| P4-010 | Company name EN required | Validation | Critical |
| P4-011 | Company name AR optional | No required | Medium |
| P4-012 | Stage dropdown works | 6 options | High |
| P4-013 | Team size input works | Number input | High |
| P4-014 | Step 2 (Sectors) - checkboxes work | Multi-select | High |
| P4-015 | Max 5 sectors enforced | Limit check | High |
| P4-016 | Challenge types selectable | Multi-select | High |
| P4-017 | Step 3 (Coverage) - regions load | From regions table | High |
| P4-018 | Progress bar accurate | Step/total | Medium |
| P4-019 | Back button works | Previous step | High |
| P4-020 | Skip button works (if available) | Optional skip | Medium |

### 1.3 Database Writes (14 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-021 | user_profiles.organization_en updated | Company name | Critical |
| P4-022 | user_profiles.organization_ar updated | Arabic name | High |
| P4-023 | user_profiles.bio_en updated | Description | High |
| P4-024 | user_profiles.expertise_areas updated | Sectors array | High |
| P4-025 | user_profiles.linkedin_url updated | URL | Medium |
| P4-026 | user_profiles.onboarding_completed = true | Flag | Critical |
| P4-027 | user_profiles.persona_onboarding_completed = true | Flag | Critical |
| P4-028 | user_profiles.metadata.company_stage saved | JSON | High |
| P4-029 | user_profiles.metadata.team_size saved | JSON | High |
| P4-030 | providers table - upsert works | New row | Critical |
| P4-031 | providers.company_name_en saved | Text | Critical |
| P4-032 | providers.sectors saved | Array | High |
| P4-033 | providers.geographic_coverage saved | Array | High |
| P4-034 | providers.status = 'pending_verification' | Initial | Critical |

---

## 2. StartupDashboard Validation

### 2.1 Dashboard Access (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-035 | Authenticated user can access | Auth required | Critical |
| P4-036 | User with provider role sees full | All sections | Critical |
| P4-037 | Pending user sees limited view | Approval message | High |
| P4-038 | Dashboard loads < 3 seconds | Performance | High |
| P4-039 | No console errors | Clean load | Critical |
| P4-040 | RTL layout correct | Arabic support | High |
| P4-041 | Responsive on mobile | Layout adjusts | High |
| P4-042 | Blue theme applied | Brand color | Medium |

### 2.2 Statistics Cards (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-043 | Open challenges count | Published challenges | High |
| P4-044 | AI matches count | Matched count | High |
| P4-045 | My solutions count | Own solutions | High |
| P4-046 | Open programs count | Published programs | High |
| P4-047 | Applications count | Own applications | High |
| P4-048 | Cards link to detail pages | Navigation | Medium |
| P4-049 | Zero states handled | Empty messages | Medium |
| P4-050 | Numbers animate on load | Visual feedback | Low |

### 2.3 Profile Completeness (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-051 | ProfileCompletenessCoach renders | Component | High |
| P4-052 | FirstActionRecommender renders | Component | High |
| P4-053 | ProgressiveProfilingPrompt renders | Component | Medium |
| P4-054 | Profile percentage accurate | Calculation | High |
| P4-055 | AI suggestions available | Lovable AI | Medium |
| P4-056 | Actions navigate correctly | Links work | High |

### 2.4 Opportunity Pipeline (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-057 | OpportunityPipelineDashboard loads | Component | High |
| P4-058 | Pipeline stages display | Funnel visual | High |
| P4-059 | ProposalWorkflowTracker loads | Component | High |
| P4-060 | Proposal statuses shown | Status badges | High |
| P4-061 | Click navigates to detail | Routing | High |
| P4-062 | Empty state handled | No proposals | Medium |
| P4-063 | Filtering works | By status | Medium |
| P4-064 | Sorting works | By date | Medium |

### 2.5 Market Intelligence (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-065 | MarketIntelligenceFeed loads | Component | High |
| P4-066 | Sector trends display | Chart/cards | High |
| P4-067 | ProviderPerformanceDashboard loads | Component | High |
| P4-068 | Performance metrics display | Numbers | High |
| P4-069 | AI insights available | Lovable AI | Medium |
| P4-070 | Data refresh works | Manual/auto | Medium |

### 2.6 Ecosystem Features (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-071 | StartupJourneyAnalytics loads | Component | Medium |
| P4-072 | EcosystemContributionScore loads | Component | Medium |
| P4-073 | MultiMunicipalityExpansionTracker loads | Component | Medium |
| P4-074 | StartupCollaborationHub loads | Component | Medium |
| P4-075 | StartupReferralProgram loads | Component | Low |
| P4-076 | StartupMentorshipMatcher loads | Component | Low |
| P4-077 | StartupChurnPredictor loads | Component | Low |
| P4-078 | Components handle loading | Skeletons | High |
| P4-079 | Components handle errors | Fallbacks | High |
| P4-080 | AI features use Lovable AI | No external keys | High |

---

## 3. Data Access & RLS (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-081 | Only published challenges visible | is_published=true | Critical |
| P4-082 | Own solutions visible | provider_id filter | Critical |
| P4-083 | Own proposals visible | created_by filter | Critical |
| P4-084 | Own pilots visible | solution involvement | High |
| P4-085 | Own matchmaker application visible | user filter | High |
| P4-086 | Published programs visible | is_published=true | High |
| P4-087 | Cannot see draft challenges | RLS enforced | Critical |
| P4-088 | Cannot see confidential challenges | is_confidential filter | Critical |
| P4-089 | Cannot see other providers' solutions | RLS enforced | Critical |
| P4-090 | Cannot see other providers' proposals | RLS enforced | Critical |
| P4-091 | Organization data isolated | organization_id | High |
| P4-092 | Audit trail for data access | access_logs | Medium |

---

## 4. Key Workflows

### 4.1 Solution Registration (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-093 | SolutionCreate page accessible | Permission | Critical |
| P4-094 | Multi-step wizard works | All steps | Critical |
| P4-095 | Basic info step works | Name, description | High |
| P4-096 | Technical specs step works | TRL, categories | High |
| P4-097 | Deployment history step works | Past deployments | Medium |
| P4-098 | Case studies step works | Success stories | Medium |
| P4-099 | Pricing tiers step works | Pricing info | Medium |
| P4-100 | Solution saved to solutions table | Database write | Critical |
| P4-101 | provider_id auto-set | From organization | Critical |
| P4-102 | status = 'pending_verification' | Initial status | Critical |

### 4.2 Proposal Submission (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-103 | ProposalWizard accessible | Permission | Critical |
| P4-104 | Challenge selection works | Dropdown | High |
| P4-105 | Proposal details entry works | Form fields | High |
| P4-106 | Solution linkage works | Select solution | High |
| P4-107 | Proposal saved | challenge_proposals table | Critical |
| P4-108 | status = 'submitted' | Initial status | Critical |
| P4-109 | Toast confirmation shown | Success message | High |
| P4-110 | Proposal appears in dashboard | List update | High |

### 4.3 Matchmaker Application (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-111 | MatchmakerApplicationCreate accessible | Page loads | High |
| P4-112 | Application form works | All fields | High |
| P4-113 | Application saved | Database write | Critical |
| P4-114 | Status tracking works | Application status | High |
| P4-115 | AI matching visible after approval | Matched challenges | High |
| P4-116 | Notification on status change | Email/in-app | Medium |

---

## 5. Bilingual & RTL (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-117 | All labels bilingual | EN/AR | Critical |
| P4-118 | Language toggle works | Full switch | Critical |
| P4-119 | RTL layout correct | Arabic mode | Critical |
| P4-120 | Form inputs RTL aware | Text align | High |
| P4-121 | Sector names bilingual | name_en/ar | High |
| P4-122 | Region names bilingual | name_en/ar | High |
| P4-123 | Error messages bilingual | Validation | High |
| P4-124 | Toast messages bilingual | Notifications | High |

---

## 6. Error Handling (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| P4-125 | Network error handling | Toast + retry | High |
| P4-126 | Supabase error handling | User message | High |
| P4-127 | 401 redirects to login | Auth check | Critical |
| P4-128 | 403 shows permission denied | Access denied | High |
| P4-129 | Form validation errors | Field messages | High |
| P4-130 | No unhandled rejections | Console clean | Critical |
| P4-131 | Error boundaries work | Graceful fallback | High |
| P4-132 | AI error handling | Fallback content | High |

---

## Summary

| Category | Total Checks |
|----------|--------------|
| Stage 1 Data Inheritance | 8 |
| Wizard Step Navigation | 12 |
| Database Writes | 14 |
| Dashboard Access | 8 |
| Statistics Cards | 8 |
| Profile Completeness | 6 |
| Opportunity Pipeline | 8 |
| Market Intelligence | 6 |
| Ecosystem Features | 10 |
| Data Access & RLS | 12 |
| Solution Registration | 10 |
| Proposal Submission | 8 |
| Matchmaker Application | 6 |
| Bilingual & RTL | 8 |
| Error Handling | 8 |
| **TOTAL** | **132 checks** |

---

## Files to Validate

| File | Purpose |
|------|---------|
| `src/components/startup/StartupOnboardingWizard.jsx` | Stage 2 wizard |
| `src/pages/StartupOnboarding.jsx` | Page wrapper |
| `src/pages/StartupDashboard.jsx` | Main dashboard |
| `src/pages/SolutionCreate.jsx` | Solution registration |
| `src/pages/ProposalWizard.jsx` | Proposal submission |
| `src/pages/MatchmakerApplicationCreate.jsx` | Matchmaker app |
