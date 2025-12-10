# Phase 13: Pilot Lifecycle Validation Plan
## Initiate → Execute → Evaluate → Scale

**Reference**: PLATFORM_FLOWS_AND_PERSONAS.md
**Total Checks**: 168

---

## 13.1 Pilot Initiation (36 checks)

### 13.1.1 Pilot Creation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | Create pilot from challenge | Challenge linked | ⬜ |
| 2 | Create pilot from solution match | Solution linked | ⬜ |
| 3 | Create standalone pilot | No prerequisites | ⬜ |
| 4 | Title (EN) required | Validation | ⬜ |
| 5 | Title (AR) optional | RTL support | ⬜ |
| 6 | Description rich editor | Formatting | ⬜ |
| 7 | Pilot type selector | Technology/Process/Service | ⬜ |
| 8 | Sector assignment | sector_id | ⬜ |
| 9 | Municipality assignment | municipality_id | ⬜ |
| 10 | Provider assignment | provider_id | ⬜ |
| 11 | Solution reference | solution_id | ⬜ |
| 12 | Challenge reference | challenge_id | ⬜ |
| 13 | Start date | Date picker | ⬜ |
| 14 | End date | Date picker | ⬜ |
| 15 | Duration calculation | Auto-computed | ⬜ |
| 16 | Budget total | Currency input | ⬜ |
| 17 | Budget allocated | Initial allocation | ⬜ |
| 18 | Budget currency | Default SAR | ⬜ |
| 19 | Target participants | Number input | ⬜ |
| 20 | Location/scope | Geographic coverage | ⬜ |
| 21 | Objectives definition | Structured list | ⬜ |
| 22 | Success criteria | Measurable KPIs | ⬜ |
| 23 | Risk assessment | Identified risks | ⬜ |
| 24 | Mitigation strategies | For each risk | ⬜ |
| 25 | Stakeholders list | Contact information | ⬜ |
| 26 | Team members | pilot_team_members | ⬜ |
| 27 | Image upload | Pilot branding | ⬜ |
| 28 | Documents upload | Pilot documents | ⬜ |
| 29 | Tags assignment | Searchability | ⬜ |
| 30 | Pilot code generated | Format: PLT-YYYY-XXXX | ⬜ |
| 31 | Status = 'draft' | Initial state | ⬜ |
| 32 | Pilot manager assigned | pilot_manager field | ⬜ |
| 33 | created_at timestamp | Auto-populated | ⬜ |
| 34 | Approval workflow | If required | ⬜ |
| 35 | Contract reference | If applicable | ⬜ |
| 36 | Notification to stakeholders | Email/in-app | ⬜ |

### 13.1.2 Pilot Approval
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 37 | Submit for approval | Status → 'pending_approval' | ⬜ |
| 38 | Approver assignment | Based on rules | ⬜ |
| 39 | Approval notification | To approvers | ⬜ |
| 40 | Review pilot details | Full information view | ⬜ |
| 41 | Approve pilot | Status → 'approved' | ⬜ |
| 42 | Reject pilot | Status → 'rejected' + reason | ⬜ |
| 43 | Request changes | Status → 'needs_revision' | ⬜ |
| 44 | Approval date recorded | approval_date field | ⬜ |

---

## 13.2 Pilot Execution (40 checks)

### 13.2.1 Pilot Launch
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 45 | Launch pilot | Status → 'active' | ⬜ |
| 46 | Actual start date | actual_start_date recorded | ⬜ |
| 47 | Launch notification | To all stakeholders | ⬜ |
| 48 | Public visibility | If is_published = true | ⬜ |
| 49 | Citizen enrollment opens | If applicable | ⬜ |

### 13.2.2 Milestone Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 50 | Create milestones | pilot_milestones table | ⬜ |
| 51 | Milestone title | Required field | ⬜ |
| 52 | Milestone description | Details | ⬜ |
| 53 | Due date | Target completion | ⬜ |
| 54 | Milestone order | Sequential display | ⬜ |
| 55 | Milestone status | pending/in_progress/completed | ⬜ |
| 56 | Mark complete | Status update + date | ⬜ |
| 57 | Progress percentage | Calculated from milestones | ⬜ |
| 58 | Overdue alerts | If past due date | ⬜ |
| 59 | Milestone dependencies | Optional linking | ⬜ |

### 13.2.3 Activity Tracking
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 60 | Log activity | pilot_activities table | ⬜ |
| 61 | Activity type | Update/meeting/issue/etc | ⬜ |
| 62 | Activity description | Free text | ⬜ |
| 63 | Activity date | Timestamp | ⬜ |
| 64 | Activity author | User email | ⬜ |
| 65 | Attachments | Supporting files | ⬜ |
| 66 | Activity timeline | Chronological view | ⬜ |
| 67 | Filter by type | Activity filtering | ⬜ |

### 13.2.4 Budget Tracking
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 68 | Record expenditure | budget_spent updates | ⬜ |
| 69 | Budget remaining | Auto-calculated | ⬜ |
| 70 | Budget utilization % | Visual indicator | ⬜ |
| 71 | Budget alerts | If overspending | ⬜ |
| 72 | Budget reallocation | Request more funds | ⬜ |
| 73 | Expense categories | Breakdown by type | ⬜ |
| 74 | Invoice tracking | Optional linking | ⬜ |

### 13.2.5 Participant Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 75 | Citizen enrollment | citizen_pilot_enrollments | ⬜ |
| 76 | Enrollment approval | If required | ⬜ |
| 77 | Participant count | current_participants | ⬜ |
| 78 | Capacity management | vs target_participants | ⬜ |
| 79 | Participant communication | Bulk messaging | ⬜ |
| 80 | Attendance tracking | For events/sessions | ⬜ |
| 81 | Participant feedback | Mid-pilot surveys | ⬜ |
| 82 | Withdrawal handling | Status updates | ⬜ |

### 13.2.6 Issue Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 83 | Report issue | Activity type = 'issue' | ⬜ |
| 84 | Issue severity | Low/medium/high/critical | ⬜ |
| 85 | Issue assignment | Responsible party | ⬜ |
| 86 | Issue resolution | Status tracking | ⬜ |
| 87 | Escalation path | To pilot manager | ⬜ |
| 88 | Issue notifications | Alert stakeholders | ⬜ |

---

## 13.3 Pilot Monitoring (28 checks)

### 13.3.1 KPI Tracking
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 89 | Define KPIs | pilot_metrics table | ⬜ |
| 90 | KPI name | Metric identifier | ⬜ |
| 91 | KPI target | Expected value | ⬜ |
| 92 | KPI unit | Measurement unit | ⬜ |
| 93 | Record KPI value | Actual measurements | ⬜ |
| 94 | KPI trend | Over time visualization | ⬜ |
| 95 | Target vs actual | Gap analysis | ⬜ |
| 96 | KPI dashboard | Summary view | ⬜ |
| 97 | Alert thresholds | If off-track | ⬜ |

### 13.3.2 Status Reports
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 98 | Generate status report | pilot_reports table | ⬜ |
| 99 | Report template | Standardized format | ⬜ |
| 100 | Executive summary | High-level overview | ⬜ |
| 101 | Progress against plan | Timeline comparison | ⬜ |
| 102 | Budget status | Financial overview | ⬜ |
| 103 | Risk updates | Current risk status | ⬜ |
| 104 | Issues summary | Open/resolved counts | ⬜ |
| 105 | Next steps | Upcoming activities | ⬜ |
| 106 | Report distribution | To stakeholders | ⬜ |
| 107 | Report archive | Historical access | ⬜ |

### 13.3.3 Dashboard Views
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 108 | Pilot detail dashboard | All metrics | ⬜ |
| 109 | Timeline Gantt view | Milestones on timeline | ⬜ |
| 110 | Budget chart | Spend visualization | ⬜ |
| 111 | KPI charts | Trend graphs | ⬜ |
| 112 | Activity feed | Recent updates | ⬜ |
| 113 | Team view | Members and roles | ⬜ |
| 114 | Documents tab | All attachments | ⬜ |
| 115 | Comments section | Discussion thread | ⬜ |
| 116 | Risk matrix | Visual risk display | ⬜ |

---

## 13.4 Pilot Evaluation (32 checks)

### 13.4.1 Completion Process
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 117 | Mark pilot complete | Status → 'completed' | ⬜ |
| 118 | Actual end date | actual_end_date recorded | ⬜ |
| 119 | Final KPI values | All metrics captured | ⬜ |
| 120 | Final budget reconciliation | Total spend recorded | ⬜ |
| 121 | Completion notification | To all stakeholders | ⬜ |

### 13.4.2 Evaluation Criteria
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 122 | Create evaluation | pilot_evaluations table | ⬜ |
| 123 | Evaluator assignment | Expert/GDISB | ⬜ |
| 124 | Evaluation criteria | Standard template | ⬜ |
| 125 | Score each criterion | Numeric rating | ⬜ |
| 126 | Overall pilot score | pilot_score calculated | ⬜ |
| 127 | Success determination | Pass/fail threshold | ⬜ |
| 128 | Evaluator comments | Detailed feedback | ⬜ |
| 129 | Evaluation date | Timestamp | ⬜ |

### 13.4.3 Stakeholder Feedback
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 130 | Municipality feedback | Rating and review | ⬜ |
| 131 | Provider feedback | Experience rating | ⬜ |
| 132 | Participant feedback | Citizen surveys | ⬜ |
| 133 | Team member feedback | Internal review | ⬜ |
| 134 | Aggregate ratings | Combined scores | ⬜ |
| 135 | Feedback themes | Common patterns | ⬜ |

### 13.4.4 Lessons Learned
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 136 | Document lessons | lessons_learned JSON | ⬜ |
| 137 | Success factors | What worked well | ⬜ |
| 138 | Challenges faced | Obstacles encountered | ⬜ |
| 139 | Recommendations | Future improvements | ⬜ |
| 140 | Best practices | Reusable insights | ⬜ |
| 141 | Knowledge base update | Platform learning | ⬜ |

### 13.4.5 Impact Assessment
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 142 | Quantitative impact | Measured outcomes | ⬜ |
| 143 | Qualitative impact | Narrative description | ⬜ |
| 144 | Cost-benefit analysis | ROI calculation | ⬜ |
| 145 | Affected population | People impacted | ⬜ |
| 146 | Service improvement | Quality metrics | ⬜ |
| 147 | Efficiency gains | Time/resource savings | ⬜ |
| 148 | Innovation value | Novel aspects | ⬜ |

---

## 13.5 Scaling Decision (20 checks)

### 13.5.1 Scale Recommendation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 149 | Scale assessment | Based on evaluation | ⬜ |
| 150 | Scaling readiness score | Composite metric | ⬜ |
| 151 | Recommendation options | Scale/modify/discontinue | ⬜ |
| 152 | Scaling justification | Supporting evidence | ⬜ |
| 153 | Resource requirements | For scaling | ⬜ |
| 154 | Risk assessment | Scaling risks | ⬜ |

### 13.5.2 Scaling Execution
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 155 | Approve scaling | Decision recorded | ⬜ |
| 156 | Status → 'scaling' | Transition state | ⬜ |
| 157 | Create full program | From pilot | ⬜ |
| 158 | Expand to regions | Geographic scaling | ⬜ |
| 159 | Contract extension | Provider agreement | ⬜ |
| 160 | Budget allocation | Scaling budget | ⬜ |
| 161 | Timeline extension | New dates | ⬜ |
| 162 | Status → 'scaled' | Final state | ⬜ |

### 13.5.3 Case Study Creation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 163 | Generate case study | From pilot data | ⬜ |
| 164 | Case study template | Structured format | ⬜ |
| 165 | Success metrics | Highlighted results | ⬜ |
| 166 | Visual assets | Photos/charts | ⬜ |
| 167 | Publication approval | Review process | ⬜ |
| 168 | Case study publishing | Public showcase | ⬜ |

---

## Summary

| Section | Checks | Critical |
|---------|--------|----------|
| 13.1 Pilot Initiation | 44 | 16 |
| 13.2 Pilot Execution | 44 | 14 |
| 13.3 Pilot Monitoring | 28 | 10 |
| 13.4 Pilot Evaluation | 32 | 12 |
| 13.5 Scaling Decision | 20 | 8 |
| **Total** | **168** | **60** |
