# Phase 14: R&D Track Validation Plan
## Calls → Proposals → Projects → Results

**Reference**: PLATFORM_FLOWS_AND_PERSONAS.md
**Total Checks**: 124

---

## 14.1 R&D Call Creation (28 checks)

### 14.1.1 Call Setup
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | Navigate to R&D → Create Call | Form loads | ⬜ |
| 2 | Title (EN) required | Validation | ⬜ |
| 3 | Title (AR) optional | RTL support | ⬜ |
| 4 | Description rich editor | Formatting tools | ⬜ |
| 5 | Call type selector | Research/Innovation/Grant | ⬜ |
| 6 | Target sectors | Multi-select | ⬜ |
| 7 | Research themes | Topic areas | ⬜ |
| 8 | Eligibility criteria | Who can apply | ⬜ |
| 9 | Funding amount | Total available | ⬜ |
| 10 | Individual grant range | Min/max per project | ⬜ |
| 11 | Application deadline | Date picker | ⬜ |
| 12 | Project duration | Expected timeline | ⬜ |
| 13 | Evaluation criteria | Scoring rubric | ⬜ |
| 14 | Required documents | Checklist | ⬜ |
| 15 | Terms and conditions | Legal text | ⬜ |
| 16 | Call code generated | Format: RD-YYYY-XXXX | ⬜ |
| 17 | Status = 'draft' | Initial state | ⬜ |
| 18 | created_at timestamp | Auto-populated | ⬜ |

### 14.1.2 Call Publishing
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 19 | Submit for approval | Status → 'pending' | ⬜ |
| 20 | Approve call | Status → 'open' | ⬜ |
| 21 | Publish call | is_published = true | ⬜ |
| 22 | Open date | application_open_date | ⬜ |
| 23 | Close date | application_close_date | ⬜ |
| 24 | Public listing | Visible to researchers | ⬜ |
| 25 | Notification to researchers | Email/in-app alert | ⬜ |
| 26 | Featured call option | is_featured flag | ⬜ |
| 27 | Announcement post | News/updates section | ⬜ |
| 28 | Download call document | PDF generation | ⬜ |

---

## 14.2 Proposal Submission (32 checks)

### 14.2.1 Researcher Application
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 29 | View call details | Full information | ⬜ |
| 30 | Check eligibility | Self-assessment | ⬜ |
| 31 | Start application | Create proposal draft | ⬜ |
| 32 | Project title | Required field | ⬜ |
| 33 | Abstract/summary | Character limit | ⬜ |
| 34 | Research objectives | Structured list | ⬜ |
| 35 | Methodology description | Detailed approach | ⬜ |
| 36 | Expected outcomes | Deliverables | ⬜ |
| 37 | Timeline/workplan | Gantt or phases | ⬜ |
| 38 | Budget breakdown | Line items | ⬜ |
| 39 | Team composition | Members and roles | ⬜ |
| 40 | Principal investigator | Lead researcher | ⬜ |
| 41 | Co-investigators | Team members | ⬜ |
| 42 | Institution affiliation | Organization link | ⬜ |
| 43 | CV uploads | For all team members | ⬜ |
| 44 | Supporting documents | Attachments | ⬜ |
| 45 | Ethics statement | If applicable | ⬜ |
| 46 | Previous work | Related experience | ⬜ |
| 47 | References/citations | Bibliography | ⬜ |
| 48 | Save draft | Preserve progress | ⬜ |
| 49 | Submit proposal | Status → 'submitted' | ⬜ |
| 50 | Submission confirmation | Email receipt | ⬜ |

### 14.2.2 Proposal Validation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 51 | Required fields check | All mandatory filled | ⬜ |
| 52 | Budget within limits | Call constraints | ⬜ |
| 53 | Document completeness | Required uploads present | ⬜ |
| 54 | Deadline check | Before close date | ⬜ |
| 55 | Duplicate detection | Prevent resubmission | ⬜ |
| 56 | Eligibility verification | Automatic checks | ⬜ |
| 57 | Submission receipt | Timestamp recorded | ⬜ |
| 58 | Proposal code generated | Unique identifier | ⬜ |
| 59 | Status tracking | Visible to applicant | ⬜ |
| 60 | Edit until deadline | Modification allowed | ⬜ |

---

## 14.3 Proposal Review (28 checks)

### 14.3.1 Administrative Review
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 61 | Proposals visible to admin | Filtered by call | ⬜ |
| 62 | Completeness check | All requirements met | ⬜ |
| 63 | Eligibility verification | Manual review | ⬜ |
| 64 | Pass admin review | Status → 'under_review' | ⬜ |
| 65 | Fail admin review | Status → 'ineligible' | ⬜ |
| 66 | Request clarification | Status → 'needs_info' | ⬜ |

### 14.3.2 Expert Review
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 67 | Assign to expert panel | expert_panels link | ⬜ |
| 68 | Reviewer assignment | Individual experts | ⬜ |
| 69 | Conflict of interest check | Reviewer-applicant | ⬜ |
| 70 | Review interface | Criteria scoring | ⬜ |
| 71 | Score each criterion | Numeric ratings | ⬜ |
| 72 | Written feedback | Detailed comments | ⬜ |
| 73 | Recommendation | Fund/reject/revise | ⬜ |
| 74 | Multiple reviewers | Consensus mechanism | ⬜ |
| 75 | Average score calculation | Aggregate rating | ⬜ |
| 76 | Ranking by score | Priority list | ⬜ |

### 14.3.3 Selection Decision
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 77 | Review panel meeting | Discussion/voting | ⬜ |
| 78 | Final selection | Top proposals | ⬜ |
| 79 | Budget allocation | Available funds | ⬜ |
| 80 | Approval decision | Status → 'approved' | ⬜ |
| 81 | Rejection decision | Status → 'rejected' | ⬜ |
| 82 | Waitlist option | Status → 'waitlisted' | ⬜ |
| 83 | Notification to applicants | Result communication | ⬜ |
| 84 | Feedback provision | Review comments shared | ⬜ |
| 85 | Appeal process | If applicable | ⬜ |
| 86 | Contract preparation | For approved | ⬜ |
| 87 | Award announcement | Public listing | ⬜ |
| 88 | Call closure | Status → 'closed' | ⬜ |

---

## 14.4 Project Execution (24 checks)

### 14.4.1 Project Setup
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 89 | Create R&D project | From approved proposal | ⬜ |
| 90 | Project code generated | Format: RDP-YYYY-XXXX | ⬜ |
| 91 | Contract signing | Digital agreement | ⬜ |
| 92 | Initial funding release | First tranche | ⬜ |
| 93 | Project kickoff | Status → 'active' | ⬜ |
| 94 | Reporting schedule | Defined milestones | ⬜ |

### 14.4.2 Progress Monitoring
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 95 | Submit progress report | Periodic updates | ⬜ |
| 96 | Report template | Standardized format | ⬜ |
| 97 | Achievement tracking | vs objectives | ⬜ |
| 98 | Expenditure reporting | Budget utilization | ⬜ |
| 99 | Issue reporting | Challenges faced | ⬜ |
| 100 | Milestone verification | Deliverable check | ⬜ |
| 101 | Funding release | Based on milestones | ⬜ |
| 102 | Project amendments | Scope/timeline changes | ⬜ |
| 103 | Extension requests | If needed | ⬜ |
| 104 | Site visits/audits | If required | ⬜ |

### 14.4.3 Output Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 105 | Register outputs | Publications/patents | ⬜ |
| 106 | Publication tracking | Journal articles | ⬜ |
| 107 | Patent applications | IP management | ⬜ |
| 108 | Dataset sharing | Research data | ⬜ |
| 109 | Prototype documentation | Technical specs | ⬜ |
| 110 | Knowledge transfer | Dissemination | ⬜ |
| 111 | Collaboration records | Partners involved | ⬜ |
| 112 | Impact tracking | Citations/usage | ⬜ |

---

## 14.5 Project Completion (12 checks)

### 14.5.1 Final Reporting
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 113 | Final report submission | Comprehensive summary | ⬜ |
| 114 | Objectives achievement | Success assessment | ⬜ |
| 115 | Financial reconciliation | Final budget | ⬜ |
| 116 | Output documentation | All deliverables | ⬜ |
| 117 | Final evaluation | Expert assessment | ⬜ |
| 118 | Project closure | Status → 'completed' | ⬜ |

### 14.5.2 Post-Project
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 119 | Impact assessment | Long-term outcomes | ⬜ |
| 120 | Commercialization pathway | If applicable | ⬜ |
| 121 | Follow-up opportunities | Future calls | ⬜ |
| 122 | Lessons learned | Knowledge capture | ⬜ |
| 123 | Case study creation | Success stories | ⬜ |
| 124 | Archive project | Historical record | ⬜ |

---

## Summary

| Section | Checks | Critical |
|---------|--------|----------|
| 14.1 R&D Call Creation | 28 | 10 |
| 14.2 Proposal Submission | 32 | 12 |
| 14.3 Proposal Review | 28 | 10 |
| 14.4 Project Execution | 24 | 8 |
| 14.5 Project Completion | 12 | 4 |
| **Total** | **124** | **44** |
