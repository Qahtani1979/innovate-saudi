# Phase 16: Expert Panels & Evaluation Consensus Validation Plan
## Panel Setup → Assignment → Evaluation → Consensus

**Reference**: EXPERT_PERSONA.md
**Total Checks**: 108

---

## 16.1 Expert Panel Management (24 checks)

### 16.1.1 Panel Creation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | Navigate to Admin → Expert Panels | Panel list loads | ⬜ |
| 2 | Create new panel | Form opens | ⬜ |
| 3 | Panel name (EN) required | Validation | ⬜ |
| 4 | Panel name (AR) optional | RTL support | ⬜ |
| 5 | Panel description | Purpose/scope | ⬜ |
| 6 | Panel type selector | Technical/Strategic/Sector | ⬜ |
| 7 | Sector association | sector_id link | ⬜ |
| 8 | Expertise areas | Multi-select tags | ⬜ |
| 9 | Chair assignment | chair_email | ⬜ |
| 10 | Member emails | member_emails array | ⬜ |
| 11 | Add members from experts | Searchable list | ⬜ |
| 12 | Minimum panel size | Validation | ⬜ |
| 13 | Status = 'active' | Ready for assignments | ⬜ |
| 14 | Panel code generated | Unique identifier | ⬜ |
| 15 | created_at timestamp | Auto-populated | ⬜ |

### 16.1.2 Panel Administration
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 16 | Edit panel details | Update info | ⬜ |
| 17 | Add/remove members | Modify roster | ⬜ |
| 18 | Change chair | Reassign leadership | ⬜ |
| 19 | Deactivate panel | is_active = false | ⬜ |
| 20 | Reactivate panel | is_active = true | ⬜ |
| 21 | View panel history | Past assignments | ⬜ |
| 22 | Panel workload view | Current assignments | ⬜ |
| 23 | Member availability | Status tracking | ⬜ |
| 24 | Panel performance | Metrics dashboard | ⬜ |

---

## 16.2 Evaluation Assignment (24 checks)

### 16.2.1 Assignment Process
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 25 | Item requires evaluation | Challenge/solution/proposal | ⬜ |
| 26 | Select expert panel | Based on sector/type | ⬜ |
| 27 | Auto-suggest panel | AI recommendation | ⬜ |
| 28 | Create assignment | expert_assignments table | ⬜ |
| 29 | Assignment type | evaluation/review/verification | ⬜ |
| 30 | Entity reference | entity_type + entity_id | ⬜ |
| 31 | Due date setting | Deadline | ⬜ |
| 32 | Priority level | Urgency indicator | ⬜ |
| 33 | Assignment notification | To all panel members | ⬜ |
| 34 | Chair notification | Additional alert | ⬜ |
| 35 | Status = 'pending' | Initial state | ⬜ |
| 36 | assigned_by recorded | Assigner email | ⬜ |
| 37 | assigned_date recorded | Timestamp | ⬜ |

### 16.2.2 Conflict of Interest
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 38 | COI declaration required | Before evaluation | ⬜ |
| 39 | COI form | Structured questions | ⬜ |
| 40 | Self-recusal option | Member opts out | ⬜ |
| 41 | COI flagging | Mark potential conflicts | ⬜ |
| 42 | Admin COI review | Verify declarations | ⬜ |
| 43 | Replacement assignment | If COI confirmed | ⬜ |
| 44 | COI record keeping | Audit trail | ⬜ |

### 16.2.3 Assignment Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 45 | View my assignments | Expert dashboard | ⬜ |
| 46 | Assignment details | Full context | ⬜ |
| 47 | Accept assignment | Confirmation | ⬜ |
| 48 | Decline assignment | With reason | ⬜ |
| 49 | Request extension | Due date change | ⬜ |
| 50 | Reassign to another | If needed | ⬜ |
| 51 | Overdue alerts | Reminder notifications | ⬜ |
| 52 | Status tracking | Progress visibility | ⬜ |

---

## 16.3 Evaluation Execution (28 checks)

### 16.3.1 Evaluation Interface
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 53 | Open evaluation form | Start assessment | ⬜ |
| 54 | View entity details | Full information | ⬜ |
| 55 | Evaluation template | Standard criteria | ⬜ |
| 56 | Criteria display | All criteria listed | ⬜ |
| 57 | Criteria descriptions | Clear guidance | ⬜ |
| 58 | Weight display | Criteria importance | ⬜ |

### 16.3.2 Scoring
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 59 | Score each criterion | Numeric input | ⬜ |
| 60 | Score range | e.g., 1-10 | ⬜ |
| 61 | Required scores | All criteria mandatory | ⬜ |
| 62 | Sub-criteria scoring | If applicable | ⬜ |
| 63 | Weighted calculation | Auto-computed | ⬜ |
| 64 | Overall score display | Running total | ⬜ |

### 16.3.3 Feedback & Recommendations
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 65 | Comments per criterion | Specific feedback | ⬜ |
| 66 | Overall comments | General feedback | ⬜ |
| 67 | Strengths section | Positive aspects | ⬜ |
| 68 | Weaknesses section | Areas for improvement | ⬜ |
| 69 | Recommendation dropdown | Approve/reject/revise/etc | ⬜ |
| 70 | Recommendation justification | Required text | ⬜ |
| 71 | Conditions (if any) | For conditional approval | ⬜ |
| 72 | Attachments | Supporting documents | ⬜ |

### 16.3.4 Submission
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 73 | Save draft | Preserve progress | ⬜ |
| 74 | Validate completion | All fields filled | ⬜ |
| 75 | Submit evaluation | Status → 'submitted' | ⬜ |
| 76 | Submission timestamp | submitted_at recorded | ⬜ |
| 77 | Edit after submission | Lock or allow | ⬜ |
| 78 | Confirmation message | Success feedback | ⬜ |
| 79 | Notification to chair | Submission alert | ⬜ |
| 80 | Record in expert_evaluations | Data persisted | ⬜ |

---

## 16.4 Consensus Building (20 checks)

### 16.4.1 Multi-Reviewer Aggregation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 81 | All evaluations submitted | Complete set | ⬜ |
| 82 | Chair dashboard | Review all scores | ⬜ |
| 83 | Score comparison view | Side-by-side | ⬜ |
| 84 | Score variance highlight | Divergent opinions | ⬜ |
| 85 | Average score calculation | Statistical aggregate | ⬜ |
| 86 | Median score calculation | Alternative metric | ⬜ |
| 87 | Recommendation summary | All recommendations | ⬜ |

### 16.4.2 Consensus Process
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 88 | Discussion thread | Panel comments | ⬜ |
| 89 | Schedule meeting | Consensus call | ⬜ |
| 90 | Virtual meeting link | Integration | ⬜ |
| 91 | Voting mechanism | If needed | ⬜ |
| 92 | Score reconciliation | Adjust outliers | ⬜ |
| 93 | Final recommendation | Panel decision | ⬜ |
| 94 | Chair approval | Sign-off required | ⬜ |
| 95 | Consensus recorded | Final scores saved | ⬜ |

### 16.4.3 Result Communication
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 96 | Generate evaluation report | Summary document | ⬜ |
| 97 | Notification to requester | Decision communicated | ⬜ |
| 98 | Feedback compilation | All comments merged | ⬜ |
| 99 | Assignment closure | Status → 'completed' | ⬜ |
| 100 | completed_date recorded | Timestamp | ⬜ |

---

## 16.5 Quality Assurance (8 checks)

### 16.5.1 Evaluation Quality
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 101 | Evaluation audit trail | All changes logged | ⬜ |
| 102 | Score calibration | Periodic review | ⬜ |
| 103 | Expert performance metrics | Quality tracking | ⬜ |
| 104 | Feedback on experts | From entity owners | ⬜ |
| 105 | Training materials | Expert guidance | ⬜ |
| 106 | Template updates | Criteria refinement | ⬜ |
| 107 | Appeals handling | If disputed | ⬜ |
| 108 | Process improvement | Continuous feedback | ⬜ |

---

## Summary

| Section | Checks | Critical |
|---------|--------|----------|
| 16.1 Expert Panel Management | 24 | 8 |
| 16.2 Evaluation Assignment | 28 | 10 |
| 16.3 Evaluation Execution | 28 | 12 |
| 16.4 Consensus Building | 20 | 8 |
| 16.5 Quality Assurance | 8 | 4 |
| **Total** | **108** | **42** |
