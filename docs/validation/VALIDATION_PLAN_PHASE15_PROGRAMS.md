# Phase 15: Programs Validation Plan
## Create → Applications → Cohort → Alumni

**Reference**: PLATFORM_FLOWS_AND_PERSONAS.md
**Total Checks**: 132

---

## 15.1 Program Creation (28 checks)

### 15.1.1 Program Setup
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | Navigate to Programs → Create | Form loads | ⬜ |
| 2 | Title (EN) required | Validation | ⬜ |
| 3 | Title (AR) optional | RTL support | ⬜ |
| 4 | Description rich editor | Formatting | ⬜ |
| 5 | Program type selector | Accelerator/Incubator/Training | ⬜ |
| 6 | Target audience | Startups/researchers/etc | ⬜ |
| 7 | Sector focus | sector_id link | ⬜ |
| 8 | Program duration | Weeks/months | ⬜ |
| 9 | Start date | program_start_date | ⬜ |
| 10 | End date | program_end_date | ⬜ |
| 11 | Application deadline | Cutoff date | ⬜ |
| 12 | Cohort size | Max participants | ⬜ |
| 13 | Location | Physical/virtual/hybrid | ⬜ |
| 14 | Venue details | If physical | ⬜ |
| 15 | Virtual platform | If online | ⬜ |
| 16 | Program benefits | What's offered | ⬜ |
| 17 | Eligibility criteria | Requirements | ⬜ |
| 18 | Selection process | How chosen | ⬜ |
| 19 | Curriculum outline | Sessions/topics | ⬜ |
| 20 | Mentors/speakers | Expert lineup | ⬜ |
| 21 | Partners/sponsors | Supporting orgs | ⬜ |
| 22 | Image upload | Program branding | ⬜ |
| 23 | Program code generated | Format: PRG-YYYY-XXXX | ⬜ |
| 24 | Status = 'draft' | Initial state | ⬜ |
| 25 | program_manager assigned | Owner email | ⬜ |
| 26 | created_at timestamp | Auto-populated | ⬜ |
| 27 | Budget allocation | Program budget | ⬜ |
| 28 | Tags/keywords | Searchability | ⬜ |

---

## 15.2 Program Publishing (16 checks)

### 15.2.1 Approval & Publishing
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 29 | Submit for approval | Status → 'pending' | ⬜ |
| 30 | Approve program | Status → 'approved' | ⬜ |
| 31 | Publish program | is_published = true | ⬜ |
| 32 | Status → 'accepting_applications' | Open for apps | ⬜ |
| 33 | Featured program | is_featured flag | ⬜ |
| 34 | Announcement notification | To potential applicants | ⬜ |

### 15.2.2 Public Display
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 35 | Program listing page | Browse programs | ⬜ |
| 36 | Program detail page | Full information | ⬜ |
| 37 | Application button | Opens form | ⬜ |
| 38 | Deadline countdown | Visual timer | ⬜ |
| 39 | Share functionality | Social sharing | ⬜ |
| 40 | Bookmark capability | Save for later | ⬜ |
| 41 | Related programs | Suggestions | ⬜ |
| 42 | Past cohort showcase | Alumni success | ⬜ |
| 43 | FAQ section | Common questions | ⬜ |
| 44 | Contact information | Inquiries | ⬜ |

---

## 15.3 Application Process (32 checks)

### 15.3.1 Application Submission
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 45 | Start application | Create draft | ⬜ |
| 46 | Personal information | Name/email/phone | ⬜ |
| 47 | Organization details | If applicable | ⬜ |
| 48 | Startup information | For startup programs | ⬜ |
| 49 | Research background | For researcher programs | ⬜ |
| 50 | Motivation statement | Why applying | ⬜ |
| 51 | Relevant experience | Background | ⬜ |
| 52 | Goals/expectations | What to achieve | ⬜ |
| 53 | Team members | If team application | ⬜ |
| 54 | Pitch deck upload | Presentation | ⬜ |
| 55 | CV/resume upload | Required doc | ⬜ |
| 56 | Additional documents | Supporting materials | ⬜ |
| 57 | Video pitch | Optional/required | ⬜ |
| 58 | References | Contact info | ⬜ |
| 59 | Availability confirmation | Schedule fit | ⬜ |
| 60 | Terms acceptance | Agreement checkbox | ⬜ |
| 61 | Save draft | Preserve progress | ⬜ |
| 62 | Submit application | Status → 'submitted' | ⬜ |
| 63 | Confirmation email | Receipt sent | ⬜ |
| 64 | Application code | Unique reference | ⬜ |

### 15.3.2 Application Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 65 | View my applications | Applicant dashboard | ⬜ |
| 66 | Application status | Real-time updates | ⬜ |
| 67 | Edit before deadline | Modification allowed | ⬜ |
| 68 | Withdraw application | Cancel submission | ⬜ |
| 69 | Communication thread | Q&A with admin | ⬜ |
| 70 | Interview scheduling | If required | ⬜ |
| 71 | Additional info request | Admin can ask | ⬜ |
| 72 | Status notifications | Email/in-app | ⬜ |

### 15.3.3 Application Review
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 73 | Admin application list | All submissions | ⬜ |
| 74 | Filter/sort options | By status/date/etc | ⬜ |
| 75 | Review application | Full details view | ⬜ |
| 76 | Scoring system | Criteria ratings | ⬜ |

---

## 15.4 Selection Process (20 checks)

### 15.4.1 Evaluation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 77 | Assign reviewers | Multiple evaluators | ⬜ |
| 78 | Score applications | Numeric ratings | ⬜ |
| 79 | Written feedback | Comments | ⬜ |
| 80 | Interview scheduling | For shortlist | ⬜ |
| 81 | Interview scoring | Panel evaluation | ⬜ |
| 82 | Ranking generation | By total score | ⬜ |
| 83 | Selection meeting | Final decisions | ⬜ |

### 15.4.2 Decisions
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 84 | Accept applicant | Status → 'accepted' | ⬜ |
| 85 | Reject applicant | Status → 'rejected' | ⬜ |
| 86 | Waitlist applicant | Status → 'waitlisted' | ⬜ |
| 87 | Conditional acceptance | With requirements | ⬜ |
| 88 | Acceptance notification | Email/in-app | ⬜ |
| 89 | Rejection notification | With feedback | ⬜ |
| 90 | Confirmation deadline | Accept offer by date | ⬜ |
| 91 | Spot confirmation | Applicant confirms | ⬜ |
| 92 | Waitlist promotion | If spots available | ⬜ |
| 93 | Final cohort list | Confirmed participants | ⬜ |
| 94 | Application deadline close | Status → 'applications_closed' | ⬜ |
| 95 | Program status update | Status → 'cohort_selected' | ⬜ |
| 96 | Onboarding communication | Welcome materials | ⬜ |

---

## 15.5 Cohort Management (24 checks)

### 15.5.1 Cohort Setup
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 97 | Create cohort | Cohort record | ⬜ |
| 98 | Cohort name | e.g., "Cohort 1 - 2024" | ⬜ |
| 99 | Link participants | From accepted apps | ⬜ |
| 100 | Participant directory | Cohort members | ⬜ |
| 101 | Schedule setup | Sessions/events | ⬜ |
| 102 | Resource sharing | Materials/links | ⬜ |
| 103 | Communication channel | Slack/Discord/etc | ⬜ |
| 104 | Mentor assignments | Pairing | ⬜ |

### 15.5.2 Program Execution
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 105 | Program kickoff | Status → 'active' | ⬜ |
| 106 | Session attendance | Tracking | ⬜ |
| 107 | Progress tracking | Participant milestones | ⬜ |
| 108 | Assignment submissions | If applicable | ⬜ |
| 109 | Mentor meetings | Session logs | ⬜ |
| 110 | Peer networking | Events/activities | ⬜ |
| 111 | Demo days | Pitch events | ⬜ |
| 112 | Guest speakers | External sessions | ⬜ |
| 113 | Feedback collection | Mid-program surveys | ⬜ |
| 114 | Issue resolution | Support tickets | ⬜ |

### 15.5.3 Program Completion
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 115 | Graduation criteria | Requirements met | ⬜ |
| 116 | Final presentations | Demo day | ⬜ |
| 117 | Certificate generation | Completion proof | ⬜ |
| 118 | Graduation event | Ceremony | ⬜ |
| 119 | Program closure | Status → 'completed' | ⬜ |
| 120 | Final feedback | Exit surveys | ⬜ |

---

## 15.6 Alumni Network (12 checks)

### 15.6.1 Alumni Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 121 | Alumni directory | Graduate listing | ⬜ |
| 122 | Alumni profiles | Updated info | ⬜ |
| 123 | Success tracking | Post-program progress | ⬜ |
| 124 | Alumni events | Reunions/networking | ⬜ |
| 125 | Mentorship by alumni | Give back | ⬜ |
| 126 | Alumni newsletter | Communications | ⬜ |

### 15.6.2 Impact Tracking
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 127 | Funding raised | By alumni startups | ⬜ |
| 128 | Jobs created | Employment impact | ⬜ |
| 129 | Revenue growth | Business metrics | ⬜ |
| 130 | Partnerships formed | Connections made | ⬜ |
| 131 | Success stories | Case studies | ⬜ |
| 132 | Program ROI | Overall impact | ⬜ |

---

## Summary

| Section | Checks | Critical |
|---------|--------|----------|
| 15.1 Program Creation | 28 | 10 |
| 15.2 Program Publishing | 16 | 4 |
| 15.3 Application Process | 32 | 12 |
| 15.4 Selection Process | 20 | 8 |
| 15.5 Cohort Management | 24 | 8 |
| 15.6 Alumni Network | 12 | 4 |
| **Total** | **132** | **46** |
