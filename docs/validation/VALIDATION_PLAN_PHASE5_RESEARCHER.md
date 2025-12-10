# Phase 5: Researcher Specialized Onboarding + Dashboard
## Validation Plan

**Version:** 1.0  
**Last Updated:** 2024-12-10  
**Reference:** `docs/personas/RESEARCHER_PERSONA.md`

---

## 1. ResearcherOnboardingWizard Validation

### 1.1 Stage 1 Data Inheritance (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-001 | CV URL pre-populated | cv_url from user_profiles | Critical |
| R5-002 | Institution from organization_en | Pre-populated | High |
| R5-003 | Department pre-populated | department_en/department | High |
| R5-004 | Academic title from job_title | Pre-populated | High |
| R5-005 | Research areas from expertise_areas | Pre-populated | High |
| R5-006 | Bio pre-populated | bio_en/bio | High |
| R5-007 | useAuth provides userProfile | Data available | Critical |
| R5-008 | No duplicate CV upload required | Show existing | High |

### 1.2 Wizard Steps (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-009 | Step 1 (CV Import) optional | Can skip | High |
| R5-010 | CV extraction works | AI extracts data | High |
| R5-011 | Step 2 (Institution) - required | Validation | Critical |
| R5-012 | Department field works | Text input | High |
| R5-013 | Academic title field works | Text input | High |
| R5-014 | Bio textarea works | Multi-line | High |
| R5-015 | Step 3 (Research Areas) - multi-select | Max 5 | Critical |
| R5-016 | Collaboration types selectable | Checkboxes | High |
| R5-017 | Step 4 (Links) - ORCID field | Optional | Medium |
| R5-018 | Google Scholar URL field | Optional | Medium |
| R5-019 | ResearchGate URL field | Optional | Medium |
| R5-020 | Progress bar updates | Step/total | Medium |

### 1.3 Database Writes (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-021 | user_profiles.organization updated | Institution | High |
| R5-022 | user_profiles.department updated | Department | High |
| R5-023 | user_profiles.job_title updated | Academic title | High |
| R5-024 | user_profiles.expertise_areas updated | Research areas | High |
| R5-025 | user_profiles.bio updated | Bio text | High |
| R5-026 | user_profiles.cv_url updated | CV file | High |
| R5-027 | user_profiles.onboarding_completed = true | Flag | Critical |
| R5-028 | user_profiles.persona_onboarding_completed = true | Flag | Critical |
| R5-029 | researcher_profiles upsert | New/update row | Critical |
| R5-030 | researcher_profiles.orcid_id saved | If provided | Medium |
| R5-031 | researcher_profiles.collaboration_interests | Array | High |
| R5-032 | researcher_profiles.is_verified = false | Initial | Critical |

---

## 2. AcademiaDashboard Validation

### 2.1 Dashboard Access (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-033 | Authenticated access required | Auth check | Critical |
| R5-034 | Researcher role sees full dashboard | All sections | Critical |
| R5-035 | Pending user sees limited view | Approval msg | High |
| R5-036 | Dashboard loads < 3 seconds | Performance | High |
| R5-037 | No console errors | Clean load | Critical |
| R5-038 | RTL layout correct | Arabic mode | High |
| R5-039 | Responsive on mobile | Layout | High |
| R5-040 | Green theme applied | Brand color | Medium |

### 2.2 Urgent Deadlines Banner (4 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-041 | Banner shows R&D calls closing soon | Within 2 weeks | High |
| R5-042 | Animated pulse effect | Visual alert | Medium |
| R5-043 | Links to R&D call detail | Navigation | High |
| R5-044 | Hides when no urgent items | Conditional | Medium |

### 2.3 Statistics Cards (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-045 | Open R&D calls count | With total funding | High |
| R5-046 | My projects count | Active/total | High |
| R5-047 | Proposals count | Under review | High |
| R5-048 | Living labs count | Own bookings | Medium |
| R5-049 | R&D challenges count | Linked count | Medium |
| R5-050 | Cards link to detail pages | Navigation | High |
| R5-051 | Zero states handled | Empty msg | Medium |
| R5-052 | Numbers accurate | Query results | Critical |

### 2.4 Open R&D Calls Section (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-053 | Open calls list loads | status='open' | Critical |
| R5-054 | Deadline displays correctly | Date format | High |
| R5-055 | Budget information shows | Funding amount | High |
| R5-056 | Linked challenges count | Relation count | Medium |
| R5-057 | Direct submit button works | Navigate | High |
| R5-058 | Only published calls visible | is_published | Critical |

### 2.5 Quick Actions (4 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-059 | Submit Proposal action works | Navigate | High |
| R5-060 | New R&D Project action works | Navigate | High |
| R5-061 | Book Living Lab action works | Navigate | Medium |
| R5-062 | Research Library action works | Navigate | Medium |

### 2.6 Research Portfolio (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-063 | Active projects display | Own projects | High |
| R5-064 | TRL tracking visible | Current TRL | High |
| R5-065 | Proposals with status | Status badges | High |
| R5-066 | Empty state handled | No projects msg | Medium |
| R5-067 | Click opens detail | Navigation | High |
| R5-068 | Data filtered by user | created_by/PI | Critical |

---

## 3. Data Access & RLS (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-069 | Only published R&D calls visible | is_published | Critical |
| R5-070 | Only open calls visible | status='open' | Critical |
| R5-071 | Close date not passed | close_date > now() | Critical |
| R5-072 | Own projects visible | created_by/PI/team | Critical |
| R5-073 | Own proposals visible | created_by | Critical |
| R5-074 | Own living lab bookings visible | user filter | High |
| R5-075 | Cannot see others' proposals | RLS enforced | Critical |
| R5-076 | Cannot see closed R&D calls | Status filter | High |
| R5-077 | Fellowship programs visible | type filter | High |
| R5-078 | Research library accessible | Public knowledge | High |

---

## 4. Key Workflows

### 4.1 R&D Proposal Submission (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-079 | ProposalWizard accessible | Page loads | Critical |
| R5-080 | R&D call selection works | Dropdown | High |
| R5-081 | Proposal form works | All fields | High |
| R5-082 | Team members entry | Multi-entry | High |
| R5-083 | Budget breakdown entry | Financial | High |
| R5-084 | Proposal saved | rd_proposals table | Critical |
| R5-085 | status = 'submitted' | Initial | Critical |
| R5-086 | Notification sent | To reviewers | Medium |

### 4.2 R&D Project Lifecycle (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-087 | RDProjectCreate accessible | Page loads | High |
| R5-088 | Project saved | rd_projects table | Critical |
| R5-089 | TRL tracking works | trl_start/target | High |
| R5-090 | Milestone tracking works | Progress updates | High |
| R5-091 | Project status transitions | Workflow | High |
| R5-092 | Completion evaluation | Final step | High |
| R5-093 | Output documentation | Research outputs | Medium |
| R5-094 | Transition to solution/pilot | Conversion | Medium |

### 4.3 Living Lab Booking (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-095 | LivingLabs page accessible | Page loads | High |
| R5-096 | Available labs display | Active labs | High |
| R5-097 | Capacity/equipment shown | Lab details | Medium |
| R5-098 | Time slot booking works | Calendar | High |
| R5-099 | Booking saved | living_lab_bookings | High |
| R5-100 | Confirmation shown | Toast/email | High |

---

## 5. AI Features (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| R5-101 | AIProposalWriter works | AI assistance | Medium |
| R5-102 | ExpertFinder works | Find collaborators | Medium |
| R5-103 | CredentialVerificationAI works | Verify credentials | Low |
| R5-104 | ResearcherReputationScoring works | H-index display | Low |
| R5-105 | AI uses Lovable AI | No external keys | High |
| R5-106 | AI errors handled gracefully | Fallbacks | High |

---

## Summary

| Category | Total Checks |
|----------|--------------|
| Stage 1 Data Inheritance | 8 |
| Wizard Steps | 12 |
| Database Writes | 12 |
| Dashboard Access | 8 |
| Urgent Deadlines | 4 |
| Statistics Cards | 8 |
| Open R&D Calls | 6 |
| Quick Actions | 4 |
| Research Portfolio | 6 |
| Data Access & RLS | 10 |
| R&D Proposal Submission | 8 |
| R&D Project Lifecycle | 8 |
| Living Lab Booking | 6 |
| AI Features | 6 |
| **TOTAL** | **106 checks** |

---

## Files to Validate

| File | Purpose |
|------|---------|
| `src/components/onboarding/ResearcherOnboardingWizard.jsx` | Stage 2 wizard |
| `src/pages/ResearcherOnboarding.jsx` | Page wrapper |
| `src/pages/AcademiaDashboard.jsx` | Main dashboard |
| `src/pages/RDCalls.jsx` | Browse R&D calls |
| `src/pages/RDProjectCreate.jsx` | Create projects |
| `src/pages/LivingLabs.jsx` | Lab booking |
