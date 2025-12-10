# Phase 11: Challenge Lifecycle Validation Plan
## Create → Review → Assign → Match → Resolve

**Reference**: PLATFORM_FLOWS_AND_PERSONAS.md
**Total Checks**: 156

---

## 11.1 Challenge Creation (32 checks)

### 11.1.1 Municipality Staff Creates Challenge
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | Navigate to Challenges → New Challenge | Form loads with all fields | ⬜ |
| 2 | Title (EN) field required | Validation error if empty | ⬜ |
| 3 | Title (AR) field available | RTL input support | ⬜ |
| 4 | Description rich text editor | Formatting tools available | ⬜ |
| 5 | Sector dropdown populated | All sectors from sectors table | ⬜ |
| 6 | Sub-sector cascades from sector | Filtered by parent sector | ⬜ |
| 7 | Priority selector (Low/Medium/High/Critical) | Default to Medium | ⬜ |
| 8 | Category selector | Options match challenge_type enum | ⬜ |
| 9 | Budget estimate field | Currency formatted (SAR) | ⬜ |
| 10 | Timeline estimate field | Date range picker | ⬜ |
| 11 | Affected population size | Number input with validation | ⬜ |
| 12 | Location/Region selector | Links to regions/cities tables | ⬜ |
| 13 | Image upload | Stores in uploads bucket | ⬜ |
| 14 | Gallery upload (multiple) | Array stored in gallery_urls | ⬜ |
| 15 | Tags input | Multi-select or free text | ⬜ |
| 16 | Keywords auto-suggest | AI-powered suggestions | ⬜ |
| 17 | Problem statement field | Separate EN/AR fields | ⬜ |
| 18 | Root cause analysis | Text or structured input | ⬜ |
| 19 | Desired outcome field | Clear success criteria | ⬜ |
| 20 | Current situation field | Baseline documentation | ⬜ |
| 21 | Stakeholders multi-select | Links to organizations | ⬜ |
| 22 | Data evidence upload | Supporting documents | ⬜ |
| 23 | KPIs definition | Structured JSON field | ⬜ |
| 24 | Constraints field | Budget/time/technical limits | ⬜ |
| 25 | Save as draft | Status = 'draft' | ⬜ |
| 26 | Submit for review | Status = 'pending_review' | ⬜ |
| 27 | Challenge code auto-generated | Format: CH-YYYY-XXXX | ⬜ |
| 28 | municipality_id auto-set | From user's profile | ⬜ |
| 29 | challenge_owner_email set | Current user email | ⬜ |
| 30 | created_at timestamp | Auto-populated | ⬜ |
| 31 | Audit trail initiated | First entry created | ⬜ |
| 32 | Notification sent to reviewers | Email/in-app notification | ⬜ |

### 11.1.2 GDISB Creates Challenge
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 33 | GDISB can create cross-municipality challenges | No municipality restriction | ⬜ |
| 34 | Strategic goal linkage | Links to strategic plans | ⬜ |
| 35 | Ministry service tagging | Government service catalog | ⬜ |
| 36 | National priority alignment | Vision 2030 goals | ⬜ |

---

## 11.2 Challenge Review Process (28 checks)

### 11.2.1 Reviewer Assignment
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 37 | Pending challenges visible to reviewers | Filtered list by status | ⬜ |
| 38 | Reviewer assignment | review_assigned_to field | ⬜ |
| 39 | SLA timer starts | sla_due_date calculated | ⬜ |
| 40 | Reviewer notification | Email with challenge details | ⬜ |
| 41 | Priority-based queue | Critical first | ⬜ |

### 11.2.2 Review Actions
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 42 | View full challenge details | All fields readable | ⬜ |
| 43 | Add internal comments | is_internal = true | ⬜ |
| 44 | Request more information | Status → 'needs_info' | ⬜ |
| 45 | Approve challenge | Status → 'approved' | ⬜ |
| 46 | Reject challenge | Status → 'rejected' + reason | ⬜ |
| 47 | Escalate challenge | escalation_level + 1 | ⬜ |
| 48 | Assign to expert panel | Links to expert_panels | ⬜ |
| 49 | Set review_date | Timestamp recorded | ⬜ |
| 50 | Approval triggers publishing | is_published options shown | ⬜ |

### 11.2.3 AI-Assisted Review
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 51 | AI summary generation | ai_summary field populated | ⬜ |
| 52 | AI suggestions | ai_suggestions JSON | ⬜ |
| 53 | Similar challenges detected | Based on embeddings | ⬜ |
| 54 | Auto-categorization | sector/category suggestions | ⬜ |
| 55 | Impact score calculation | impact_score computed | ⬜ |
| 56 | Severity assessment | severity_score computed | ⬜ |
| 57 | Overall score | Weighted combination | ⬜ |

### 11.2.4 Multi-Level Approval
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 58 | Level 1: Department head | First approval gate | ⬜ |
| 59 | Level 2: Municipality director | For high-budget items | ⬜ |
| 60 | Level 3: GDISB approval | For cross-entity challenges | ⬜ |
| 61 | Approval workflow tracks all | approval_requests table | ⬜ |
| 62 | Delegation rules honored | If approver unavailable | ⬜ |
| 63 | Timeout escalation | Auto-escalate if SLA breached | ⬜ |
| 64 | Final approval date recorded | approval_date field | ⬜ |

---

## 11.3 Challenge Publishing (20 checks)

### 11.3.1 Publishing Options
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 65 | Publish to platform | is_published = true | ⬜ |
| 66 | Feature on homepage | is_featured = true | ⬜ |
| 67 | Confidential flag | is_confidential limits visibility | ⬜ |
| 68 | Publishing approval tracking | publishing_approved_by/date | ⬜ |
| 69 | Public view counter starts | view_count tracking | ⬜ |

### 11.3.2 Public Challenge Display
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 70 | Challenge appears in public list | Filtered by is_published | ⬜ |
| 71 | Challenge detail page | Full public info shown | ⬜ |
| 72 | Municipality branding | Logo and name displayed | ⬜ |
| 73 | Sector badge | Visual categorization | ⬜ |
| 74 | Priority indicator | Color-coded priority | ⬜ |
| 75 | Budget range shown | If not confidential | ⬜ |
| 76 | Timeline displayed | Expected duration | ⬜ |
| 77 | Tags and keywords | Searchable metadata | ⬜ |
| 78 | Share functionality | Social/link sharing | ⬜ |
| 79 | Bookmark capability | For logged-in users | ⬜ |

### 11.3.3 Provider Interaction
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 80 | Express interest button | Creates challenge_interests | ⬜ |
| 81 | Submit proposal button | Opens proposal form | ⬜ |
| 82 | Ask question feature | Creates comments | ⬜ |
| 83 | Download challenge brief | PDF generation | ⬜ |
| 84 | Related solutions shown | Based on matching | ⬜ |

---

## 11.4 Solution Matching (24 checks)

### 11.4.1 Automatic Matching
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 85 | Embedding generated for challenge | embedding field populated | ⬜ |
| 86 | Similar solutions identified | Vector similarity search | ⬜ |
| 87 | Match scores calculated | match_score in matches table | ⬜ |
| 88 | Matches stored | challenge_solution_matches | ⬜ |
| 89 | Match type recorded | 'auto' or 'manual' | ⬜ |
| 90 | Notification to challenge owner | New matches alert | ⬜ |

### 11.4.2 Manual Matching
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 91 | Search solutions manually | Filter by sector/tags | ⬜ |
| 92 | View solution details | Modal or page | ⬜ |
| 93 | Create manual match | matched_by = user email | ⬜ |
| 94 | Add match notes | Justification for match | ⬜ |
| 95 | Match status workflow | pending → approved → active | ⬜ |

### 11.4.3 Proposal Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 96 | Provider submits proposal | challenge_proposals created | ⬜ |
| 97 | Proposal required fields | title, description, budget | ⬜ |
| 98 | Timeline specification | Implementation plan | ⬜ |
| 99 | Team description | Who will work on it | ⬜ |
| 100 | Attachments support | Documents/presentations | ⬜ |
| 101 | Proposal status tracking | draft → submitted → reviewed | ⬜ |
| 102 | Scoring by reviewers | score field (0-100) | ⬜ |
| 103 | Feedback to provider | feedback field | ⬜ |
| 104 | Accept/reject proposal | Status update | ⬜ |
| 105 | Multiple proposals comparison | Side-by-side view | ⬜ |
| 106 | Winner selection | Triggers pilot creation | ⬜ |
| 107 | Notification to all proposers | Result communication | ⬜ |
| 108 | Activity log | challenge_activities | ⬜ |

---

## 11.5 Challenge Resolution (28 checks)

### 11.5.1 Pilot Initiation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 109 | Create pilot from challenge | linked_pilot_ids updated | ⬜ |
| 110 | Challenge status → 'in_progress' | Status transition | ⬜ |
| 111 | Pilot inherits challenge data | Budget, timeline, etc. | ⬜ |
| 112 | Contract generation | If applicable | ⬜ |

### 11.5.2 Progress Tracking
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 113 | Link to pilot progress | View pilot status | ⬜ |
| 114 | Milestone tracking | From pilot milestones | ⬜ |
| 115 | KPI monitoring | Against defined KPIs | ⬜ |
| 116 | Status updates | Regular progress posts | ⬜ |
| 117 | Stakeholder notifications | Key milestone alerts | ⬜ |

### 11.5.3 Challenge Closure
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 118 | Resolution criteria met | All KPIs achieved | ⬜ |
| 119 | Status → 'resolved' | Final status | ⬜ |
| 120 | resolution_date recorded | Timestamp | ⬜ |
| 121 | Lessons learned captured | lessons_learned JSON | ⬜ |
| 122 | Success metrics documented | Final KPI values | ⬜ |
| 123 | Case study creation option | Links to case_studies | ⬜ |
| 124 | Archive challenge | is_archived = true | ⬜ |

### 11.5.4 Unsuccessful Resolution
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 125 | Status → 'cancelled' | If abandoned | ⬜ |
| 126 | Status → 'on_hold' | If paused | ⬜ |
| 127 | Reason documentation | Required for status change | ⬜ |
| 128 | Reopen capability | Back to active status | ⬜ |

---

## 11.6 Citizen Engagement (16 checks)

### 11.6.1 Citizen-Originated Challenges
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 129 | Citizen idea → Challenge | citizen_origin_idea_id linked | ⬜ |
| 130 | Vote tracking | citizen_votes_count | ⬜ |
| 131 | Threshold for promotion | Auto-escalate popular ideas | ⬜ |
| 132 | Citizen notification | When idea becomes challenge | ⬜ |

### 11.6.2 Public Voting
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 133 | Vote on published challenges | citizen_votes table | ⬜ |
| 134 | One vote per user per challenge | Unique constraint | ⬜ |
| 135 | Vote count display | Real-time update | ⬜ |
| 136 | Popular challenges section | Sorted by votes | ⬜ |

### 11.6.3 Challenge Comments
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 137 | Public comments | is_internal = false | ⬜ |
| 138 | Nested replies | parent_comment_id | ⬜ |
| 139 | Comment moderation | Admin can hide/delete | ⬜ |
| 140 | Comment likes | likes_count tracking | ⬜ |
| 141 | Question flagging | Mark as question | ⬜ |
| 142 | Official response tagging | Municipality replies marked | ⬜ |
| 143 | related_questions_count | Aggregated metric | ⬜ |
| 144 | Comment notifications | To challenge owner | ⬜ |

---

## 11.7 Analytics & Reporting (12 checks)

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 145 | Challenge dashboard stats | Total/by status/by sector | ⬜ |
| 146 | Time-to-resolution metrics | Average days to resolve | ⬜ |
| 147 | SLA compliance rate | % resolved within SLA | ⬜ |
| 148 | Proposal conversion rate | % challenges with proposals | ⬜ |
| 149 | Geographic distribution | Map visualization | ⬜ |
| 150 | Sector distribution | Pie/bar chart | ⬜ |
| 151 | Priority distribution | Status breakdown | ⬜ |
| 152 | Monthly trends | Line chart over time | ⬜ |
| 153 | Top contributors | Most active municipalities | ⬜ |
| 154 | Budget utilization | Estimated vs actual | ⬜ |
| 155 | Export functionality | CSV/Excel/PDF | ⬜ |
| 156 | Custom report builder | Filter and aggregate | ⬜ |

---

## Summary

| Section | Checks | Critical |
|---------|--------|----------|
| 11.1 Challenge Creation | 36 | 12 |
| 11.2 Challenge Review | 28 | 10 |
| 11.3 Challenge Publishing | 20 | 6 |
| 11.4 Solution Matching | 24 | 8 |
| 11.5 Challenge Resolution | 20 | 8 |
| 11.6 Citizen Engagement | 16 | 4 |
| 11.7 Analytics & Reporting | 12 | 4 |
| **Total** | **156** | **52** |
