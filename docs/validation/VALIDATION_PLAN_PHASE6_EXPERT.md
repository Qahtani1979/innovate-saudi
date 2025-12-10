# Phase 6: Expert Specialized Onboarding + Evaluation System
## Validation Plan

**Version:** 1.0  
**Last Updated:** 2024-12-10  
**Reference:** `docs/personas/EXPERT_PERSONA.md`

---

## 1. ExpertOnboardingWizard Validation

### 1.1 Stage 1 Data Inheritance (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-001 | Full name pre-populated | full_name from user_profiles | Critical |
| E6-002 | Job title pre-populated | job_title | High |
| E6-003 | Organization pre-populated | organization | High |
| E6-004 | Expertise areas pre-populated | expertise_areas array | High |
| E6-005 | CV URL pre-populated | cv_url | High |
| E6-006 | LinkedIn URL pre-populated | linkedin_url | Medium |
| E6-007 | Bio pre-populated | bio | High |
| E6-008 | No duplicate data entry | Compare fields | Critical |

### 1.2 Wizard Steps (14 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-009 | Step 1 (Basic Info) - CV upload optional | Can skip | High |
| E6-010 | CV extraction works | AI extracts data | High |
| E6-011 | Full name required | Validation | Critical |
| E6-012 | Job title required | Validation | Critical |
| E6-013 | Years of experience required | Number | Critical |
| E6-014 | Step 2 (Expertise) - multi-select | Max 5 areas | High |
| E6-015 | Professional bio entry | Textarea | High |
| E6-016 | Step 3 (Credentials) - certifications | Add/remove | High |
| E6-017 | Portfolio URL optional | URL field | Medium |
| E6-018 | Step 4 (Availability) - hours/week | Number | High |
| E6-019 | Hourly rate optional | Number | Medium |
| E6-020 | Engagement types selectable | Multi-select | High |
| E6-021 | Languages selectable | Multi-select | Medium |
| E6-022 | Progress bar accurate | Step/total | Medium |

### 1.3 Database Writes (14 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-023 | user_profiles.full_name updated | Text | High |
| E6-024 | user_profiles.job_title updated | Text | High |
| E6-025 | user_profiles.organization updated | Text | High |
| E6-026 | user_profiles.bio updated | Text | High |
| E6-027 | user_profiles.expertise_areas updated | Array | High |
| E6-028 | user_profiles.cv_url updated | URL | High |
| E6-029 | user_profiles.linkedin_url updated | URL | Medium |
| E6-030 | user_profiles.onboarding_completed = true | Boolean | Critical |
| E6-031 | user_profiles.persona_onboarding_completed = true | Boolean | Critical |
| E6-032 | expert_profiles created/updated | Upsert | Critical |
| E6-033 | expert_profiles.certifications saved | Array | High |
| E6-034 | expert_profiles.years_of_experience saved | Number | High |
| E6-035 | expert_profiles.status = 'pending_verification' | Initial | Critical |
| E6-036 | expert_profiles.is_available = true | Initial | High |

---

## 2. ExpertAssignmentQueue (Primary Dashboard)

### 2.1 Dashboard Access (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-037 | Authenticated access required | Auth check | Critical |
| E6-038 | Expert role required | Permission | Critical |
| E6-039 | is_verified required for assignments | Verification | Critical |
| E6-040 | Dashboard loads < 3 seconds | Performance | High |
| E6-041 | No console errors | Clean load | Critical |
| E6-042 | RTL layout correct | Arabic | High |
| E6-043 | Responsive on mobile | Layout | High |
| E6-044 | Amber theme applied | Brand color | Medium |

### 2.2 Assignment Tabs (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-045 | Pending tab shows pending | status='pending' | Critical |
| E6-046 | Active tab shows in-progress | status='in_progress' | Critical |
| E6-047 | Completed tab shows done | status='completed' | High |
| E6-048 | Tab counts accurate | Badge numbers | High |
| E6-049 | Assignment cards display | Entity info | High |
| E6-050 | Due date visible | Deadline | High |
| E6-051 | Accept button works | Status change | Critical |
| E6-052 | Decline button works | Return to pool | High |
| E6-053 | View details navigates | To workflow | High |
| E6-054 | Only own assignments visible | expert_email filter | Critical |

### 2.3 Assignment Data (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-055 | Entity type displayed | challenge/pilot/etc | High |
| E6-056 | Entity title displayed | From linked entity | High |
| E6-057 | Assignment date shown | assigned_at | Medium |
| E6-058 | SLA deadline shown | deadline | High |
| E6-059 | Priority indicator | High/medium/low | Medium |
| E6-060 | Sector tag displayed | From entity | Medium |
| E6-061 | Municipality shown | If applicable | Medium |
| E6-062 | Previous evaluations count | If re-evaluation | Low |

---

## 3. ExpertEvaluationWorkflow

### 3.1 Workflow Access (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-063 | Only assigned expert can access | Permission | Critical |
| E6-064 | Assignment must be accepted | Status check | Critical |
| E6-065 | Entity data loads | From assignment | Critical |
| E6-066 | Previous evaluations visible | If exists | Medium |
| E6-067 | Conflict of interest check | COI flag | High |
| E6-068 | Workflow loads < 2 seconds | Performance | High |

### 3.2 8-Dimension Scorecard (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-069 | Feasibility score (0-100) | Slider/input | Critical |
| E6-070 | Impact score (0-100) | Slider/input | Critical |
| E6-071 | Innovation score (0-100) | Slider/input | Critical |
| E6-072 | Cost effectiveness score | Slider/input | Critical |
| E6-073 | Risk score (0-100) | Slider/input | Critical |
| E6-074 | Strategic alignment score | Slider/input | Critical |
| E6-075 | Quality score (0-100) | Slider/input | Critical |
| E6-076 | Scalability score (0-100) | Slider/input | Critical |
| E6-077 | Overall score calculated | Weighted avg | High |
| E6-078 | Score validation (0-100 range) | Input validation | Critical |

### 3.3 Recommendation & Comments (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-079 | Recommendation selection | approve/reject/etc | Critical |
| E6-080 | Justification text required | Textarea | Critical |
| E6-081 | Strengths field works | Textarea | High |
| E6-082 | Weaknesses field works | Textarea | High |
| E6-083 | Recommendations field works | Textarea | High |
| E6-084 | Confidential notes option | Admin-only notes | Medium |
| E6-085 | File attachments work | Supporting docs | Medium |
| E6-086 | Character limit enforced | Max length | Low |

### 3.4 Submission (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-087 | All required fields validated | Before submit | Critical |
| E6-088 | Evaluation saved | expert_evaluations table | Critical |
| E6-089 | Assignment status updated | completed | Critical |
| E6-090 | Entity status updated | If workflow | High |
| E6-091 | Notification sent | To stakeholders | High |
| E6-092 | Performance metrics updated | Expert stats | Medium |
| E6-093 | Toast confirmation shown | Success message | High |
| E6-094 | Redirect to queue | After submit | High |

---

## 4. Expert Panel System

### 4.1 ExpertPanelDetail (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-095 | Panel members displayed | Member list | High |
| E6-096 | Entity details shown | What's being evaluated | High |
| E6-097 | Individual votes visible | After submission | High |
| E6-098 | Discussion thread works | Comments | Medium |
| E6-099 | Voting interface works | approve/revise/reject | Critical |
| E6-100 | Consensus indicator | % agreement | High |
| E6-101 | Chair identified | Role badge | High |
| E6-102 | Final decision by chair | If consensus met | Critical |
| E6-103 | Deadline visible | Panel deadline | High |
| E6-104 | Only panel members access | Permission | Critical |

### 4.2 Consensus Calculation (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-105 | Consensus threshold configurable | % threshold | High |
| E6-106 | Unanimous shown if 100% | Special indicator | Medium |
| E6-107 | Majority shown if > threshold | Status update | High |
| E6-108 | Split shown if below | Needs discussion | High |
| E6-109 | Score variance calculated | Statistical | Medium |
| E6-110 | Outlier detection | Divergent scores | Low |

---

## 5. ExpertRegistry (Public Directory)

### 5.1 Registry Features (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-111 | Registry loads publicly | No auth required | High |
| E6-112 | Only verified experts shown | is_verified=true | Critical |
| E6-113 | Search by name works | Text search | High |
| E6-114 | Filter by sector works | Dropdown | High |
| E6-115 | Filter by expertise works | Multi-select | High |
| E6-116 | Expert cards display | Name, title, areas | High |
| E6-117 | Click navigates to detail | ExpertDetail page | High |
| E6-118 | "Become Expert" CTA visible | For non-experts | High |

---

## 6. Performance Metrics

### 6.1 ExpertPerformanceDashboard (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| E6-119 | Admin access only | Permission check | Critical |
| E6-120 | Evaluations completed count | Per expert | High |
| E6-121 | Average turnaround time | Days metric | High |
| E6-122 | SLA compliance percentage | On-time % | High |
| E6-123 | Consensus agreement rate | Panel alignment | Medium |
| E6-124 | Quality score displayed | Meta-evaluation | Medium |
| E6-125 | Workload monitoring | Active assignments | High |
| E6-126 | Expert rankings | Leaderboard | Medium |

---

## Summary

| Category | Total Checks |
|----------|--------------|
| Stage 1 Data Inheritance | 8 |
| Wizard Steps | 14 |
| Database Writes | 14 |
| Dashboard Access | 8 |
| Assignment Tabs | 10 |
| Assignment Data | 8 |
| Workflow Access | 6 |
| 8-Dimension Scorecard | 10 |
| Recommendation & Comments | 8 |
| Submission | 8 |
| Expert Panel Detail | 10 |
| Consensus Calculation | 6 |
| Expert Registry | 8 |
| Performance Dashboard | 8 |
| **TOTAL** | **126 checks** |

---

## Files to Validate

| File | Purpose |
|------|---------|
| `src/components/onboarding/ExpertOnboardingWizard.jsx` | Stage 2 wizard |
| `src/pages/ExpertAssignmentQueue.jsx` | Primary dashboard |
| `src/pages/ExpertEvaluationWorkflow.jsx` | Evaluation flow |
| `src/pages/ExpertPanelDetail.jsx` | Panel view |
| `src/pages/ExpertRegistry.jsx` | Public directory |
| `src/pages/ExpertPerformanceDashboard.jsx` | Admin metrics |
| `src/components/evaluation/UnifiedEvaluationForm.jsx` | Scorecard form |
