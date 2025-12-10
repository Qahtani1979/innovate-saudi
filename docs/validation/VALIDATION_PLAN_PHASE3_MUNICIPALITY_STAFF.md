# Phase 3: Municipality Staff Specialized Onboarding + Dashboard
## Validation Plan

**Version:** 1.0  
**Last Updated:** 2024-12-10  
**Reference:** `docs/personas/MUNICIPALITY_STAFF_PERSONA.md`

---

## Phase Index
| Phase | Name | Status |
|-------|------|--------|
| 1 | Registration & Authentication | ✅ Complete |
| 2 | Main Onboarding Wizard | ✅ Complete |
| **3** | **Municipality Staff Onboarding + Dashboard** | 📋 Current |
| 4 | Provider/Startup Onboarding + Dashboard | Planned |
| 5 | Researcher Onboarding + Dashboard | Planned |
| 6 | Expert Onboarding + Evaluation | Planned |
| 7 | Citizen Onboarding + Dashboard | Planned |
| 8 | Viewer/Public Portal | Planned |
| 9 | Admin Portal + User Management | Planned |
| 10 | GDISB/Executive Dashboard | Planned |

---

## 1. MunicipalityStaffOnboardingWizard Validation

### 1.1 Stage 1 Data Inheritance (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-001 | CV URL pre-populated from Stage 1 | cv_url from user_profiles | Critical |
| M3-002 | Municipality pre-selected if set in Stage 1 | municipality_id from user_profiles | High |
| M3-003 | Department pre-populated from Stage 1 | department_en/department | High |
| M3-004 | Job title pre-populated | job_title_en/job_title | High |
| M3-005 | Work phone pre-populated | work_phone | Medium |
| M3-006 | Years of experience pre-populated | years_experience | Medium |
| M3-007 | Specializations from expertise_areas | expertise_areas array | High |
| M3-008 | No duplicate data entry required | Compare Stage 1 vs Stage 2 fields | Critical |

### 1.2 Wizard Step Navigation (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-009 | Step 1 (CV Import) - Skip if CV exists | Show "CV already uploaded" | Medium |
| M3-010 | Step 1 - CV extraction works | AI extracts job_title, department | High |
| M3-011 | Step 2 (Municipality) - Dropdown loads | municipalities table loads | Critical |
| M3-012 | Step 2 - Municipality required validation | Cannot proceed without selection | Critical |
| M3-013 | Step 3 (Department) - Dropdown loads | DEPARTMENTS array loads | High |
| M3-014 | Step 3 - Job title field works | Free text input | High |
| M3-015 | Step 4 (Role Setup) - Role levels display | staff/coordinator/manager options | High |
| M3-016 | Step 4 - Justification for elevated roles | Required for coordinator/manager | Critical |
| M3-017 | Progress bar accurate | Shows correct step/total | Medium |
| M3-018 | Back button works | Returns to previous step | High |

### 1.3 Database Writes (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-019 | user_profiles.municipality_id updated | UUID reference saved | Critical |
| M3-020 | user_profiles.department updated | department_en field | High |
| M3-021 | user_profiles.job_title updated | job_title field | High |
| M3-022 | user_profiles.work_phone updated | Phone number | Medium |
| M3-023 | user_profiles.cv_url updated | CV file URL | High |
| M3-024 | user_profiles.onboarding_completed = true | Boolean flag | Critical |
| M3-025 | user_profiles.persona_onboarding_completed = true | Boolean flag | Critical |
| M3-026 | user_profiles.onboarding_completed_at set | Timestamp | High |
| M3-027 | municipality_staff_profiles created | New row in table | Critical |
| M3-028 | municipality_staff_profiles.employee_id saved | Optional field | Medium |
| M3-029 | municipality_staff_profiles.specializations saved | Array field | High |
| M3-030 | municipality_staff_profiles.is_verified = false | Initial state | Critical |

### 1.4 Role Request Flow (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-031 | Staff role - no role_request created | Auto-approved path | High |
| M3-032 | Coordinator role - role_request created | Pending approval | Critical |
| M3-033 | Manager role - role_request created | Pending approval | Critical |
| M3-034 | role_request.requested_role correct | municipality_staff or municipality_admin | Critical |
| M3-035 | role_request.justification saved | User's justification text | High |
| M3-036 | role_request.metadata contains municipality_id | JSON field | High |
| M3-037 | role_request.status = 'pending' | Initial status | Critical |
| M3-038 | Toast notification shown | "Role request submitted" | High |

---

## 2. MunicipalityDashboard Validation

### 2.1 Dashboard Access (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-039 | Authenticated user can access | Auth required | Critical |
| M3-040 | User with municipality_staff role sees full dashboard | All sections visible | Critical |
| M3-041 | User without role sees limited view | Pending approval message | High |
| M3-042 | Municipality ID required for data | user_profiles.municipality_id | Critical |
| M3-043 | Dashboard loads within 3 seconds | Performance check | High |
| M3-044 | No console errors on load | Clean load | Critical |
| M3-045 | RTL layout correct for Arabic | Direction switching | High |
| M3-046 | Responsive on mobile | Layout adjusts | High |

### 2.2 Alert Banners (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-047 | Escalated challenges banner shows | Count of escalated | High |
| M3-048 | Pending reviews banner shows | Assigned reviews count | High |
| M3-049 | Citizen ideas banner shows | Ready for conversion count | Medium |
| M3-050 | Banner links navigate correctly | Correct page routing | High |
| M3-051 | Banners hide when no items | Conditional rendering | Medium |
| M3-052 | Banners update on data change | React to changes | Medium |

### 2.3 MII Profile Card (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-053 | MII score displays correctly | From municipality.mii_score | High |
| M3-054 | National rank displays | Calculated rank | High |
| M3-055 | Active challenges count | Filtered by municipality_id | High |
| M3-056 | Active pilots count | Filtered by municipality_id | High |
| M3-057 | Score color coding | Green/yellow/red based on score | Medium |
| M3-058 | Rank badge displays | Numeric rank | Medium |
| M3-059 | Trend indicator shows | Up/down arrow | Low |
| M3-060 | Card links to detailed view | Navigation works | Medium |

### 2.4 Profile Completeness Components (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-061 | ProfileCompletenessCoach renders | Component loads | High |
| M3-062 | FirstActionRecommender renders | Component loads | High |
| M3-063 | ProgressiveProfilingPrompt renders | Component loads | Medium |
| M3-064 | Profile percentage accurate | Calculated correctly | High |
| M3-065 | AI suggestions work | Lovable AI integration | Medium |
| M3-066 | Actions navigate correctly | Links work | High |

### 2.5 AI Tools (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-067 | MIIImprovementAI loads | Component renders | High |
| M3-068 | MIIImprovementAI provides suggestions | AI response received | High |
| M3-069 | PeerBenchmarkingTool loads | Component renders | Medium |
| M3-070 | PeerBenchmarkingTool shows comparisons | Peer data displayed | Medium |
| M3-071 | QuickSolutionsMarketplace loads | Component renders | Medium |
| M3-072 | QuickSolutionsMarketplace shows solutions | Solution cards | Medium |
| M3-073 | AI rate limiting handled | 429/402 errors shown | High |
| M3-074 | AI fallback works | Graceful degradation | High |

### 2.6 Data Queries (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-075 | Own municipality data loads | municipality_id filter | Critical |
| M3-076 | Own challenges load | municipality_id OR created_by | Critical |
| M3-077 | Own pilots load | municipality_id filter | High |
| M3-078 | Citizen ideas load | municipality_id filter | High |
| M3-079 | Challenge activities load | Activity feed | Medium |
| M3-080 | Strategic plans visible | Read-only access | Medium |
| M3-081 | RLS enforced on challenges | Cannot see other municipalities | Critical |
| M3-082 | RLS enforced on pilots | Cannot see other municipalities | Critical |
| M3-083 | Solution matches load | For own challenges | High |
| M3-084 | Data refresh on focus | useQuery refetch | Medium |

---

## 3. Key Workflows

### 3.1 Challenge Submission Flow (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-085 | "New Challenge" button visible | Based on permission | Critical |
| M3-086 | ChallengeCreate page loads | 6-step wizard | Critical |
| M3-087 | AI assistance works in wizard | Bio/description help | High |
| M3-088 | Challenge saved as draft | status = 'draft' | High |
| M3-089 | Challenge submitted | status = 'submitted' | Critical |
| M3-090 | municipality_id auto-set | From user profile | Critical |
| M3-091 | created_by set to user email | Audit trail | High |
| M3-092 | Challenge appears in MyChallenges | After submission | High |
| M3-093 | Toast notifications work | Success/error messages | High |
| M3-094 | Validation errors display | Required field messages | High |

### 3.2 Citizen Idea Conversion (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-095 | IdeasManagement page accessible | Permission check | High |
| M3-096 | Approved ideas list loads | municipality_id filter | High |
| M3-097 | "Convert to Challenge" action works | New challenge created | High |
| M3-098 | citizen_origin_idea_id linked | FK reference | High |
| M3-099 | Original idea status updated | Converted flag | Medium |
| M3-100 | Idea submitter notified | Notification sent | Medium |

---

## 4. Bilingual & RTL Validation (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-101 | All labels bilingual | EN/AR text objects | Critical |
| M3-102 | Language toggle works | Switches all text | Critical |
| M3-103 | RTL layout for Arabic | direction: rtl | Critical |
| M3-104 | Form inputs RTL aware | Text alignment | High |
| M3-105 | Buttons RTL positioning | Correct order | High |
| M3-106 | Icons don't flip (arrows ok) | Logical vs physical | Medium |
| M3-107 | Numbers display correctly | 123 not ١٢٣ | Medium |
| M3-108 | Dates format correctly | Locale-aware | High |
| M3-109 | Error messages bilingual | Validation text | High |
| M3-110 | Toast messages bilingual | Success/error | High |
| M3-111 | Municipality names bilingual | name_en/name_ar | High |
| M3-112 | Department names bilingual | Available in both | Medium |

---

## 5. Theme & Style Validation (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-113 | Purple theme for municipality | Brand color | High |
| M3-114 | Dark mode support | Theme toggle | Medium |
| M3-115 | Consistent card styling | Shadcn components | High |
| M3-116 | Icons consistent | Lucide icons | Medium |
| M3-117 | Loading states | Skeleton/spinner | High |
| M3-118 | Empty states | Informative messages | Medium |
| M3-119 | Hover states | Interactive feedback | Medium |
| M3-120 | Focus states | Accessibility | High |

---

## 6. Error Handling (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-121 | Network error handling | Toast + retry option | High |
| M3-122 | Supabase error handling | User-friendly message | High |
| M3-123 | 401 redirects to login | Auth required | Critical |
| M3-124 | 403 shows permission denied | Access denied message | High |
| M3-125 | Form validation errors | Field-level messages | High |
| M3-126 | No unhandled promise rejections | Console clean | Critical |
| M3-127 | Error boundaries in place | Graceful fallback | High |
| M3-128 | AI error handling | Fallback content | High |

---

## 7. Performance (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| M3-129 | Dashboard LCP < 2.5s | Core Web Vitals | High |
| M3-130 | No layout shift on load | CLS < 0.1 | Medium |
| M3-131 | Queries use proper caching | staleTime set | High |
| M3-132 | Images lazy loaded | Deferred loading | Medium |
| M3-133 | No memory leaks | useEffect cleanup | High |
| M3-134 | Bundle size reasonable | Code splitting | Medium |

---

## Summary

| Category | Total Checks |
|----------|--------------|
| Stage 1 Data Inheritance | 8 |
| Wizard Step Navigation | 10 |
| Database Writes | 12 |
| Role Request Flow | 8 |
| Dashboard Access | 8 |
| Alert Banners | 6 |
| MII Profile Card | 8 |
| Profile Completeness | 6 |
| AI Tools | 8 |
| Data Queries | 10 |
| Challenge Submission | 10 |
| Citizen Idea Conversion | 6 |
| Bilingual & RTL | 12 |
| Theme & Style | 8 |
| Error Handling | 8 |
| Performance | 6 |
| **TOTAL** | **134 checks** |

---

## Test Cases

### TC-M3-01: New Municipality Staff Full Onboarding
1. Complete Phase 1 as municipality_staff persona
2. Navigate to MunicipalityStaffOnboarding
3. Verify Stage 1 data pre-populated
4. Select municipality, department, role
5. Complete wizard
6. Verify all database tables updated
7. Verify redirect to MunicipalityDashboard

### TC-M3-02: Role Request for Coordinator
1. Complete onboarding selecting "Coordinator" role
2. Provide justification
3. Verify role_request created
4. Verify user gets viewer-level access initially
5. Admin approves request
6. Verify user gains municipality_staff permissions

### TC-M3-03: Dashboard Data Isolation
1. Login as Municipality A staff
2. Verify only Municipality A challenges visible
3. Try to access Municipality B challenge directly
4. Verify 403 or redirect
5. Verify no cross-municipality data leakage

---

## Files to Validate

| File | Purpose |
|------|---------|
| `src/components/onboarding/MunicipalityStaffOnboardingWizard.jsx` | Stage 2 wizard |
| `src/pages/MunicipalityStaffOnboarding.jsx` | Page wrapper |
| `src/pages/MunicipalityDashboard.jsx` | Main dashboard |
| `src/components/profiles/ProfileCompletenessCoach.jsx` | Profile helper |
| `src/components/ai/MIIImprovementAI.jsx` | AI component |
| `src/components/ai/PeerBenchmarkingTool.jsx` | AI component |
