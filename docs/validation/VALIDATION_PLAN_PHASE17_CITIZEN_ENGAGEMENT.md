# Phase 17: Citizen Ideas & Voting & Gamification Validation Plan
## Ideas → Voting → Badges → Leaderboards

**Reference**: CITIZEN_PERSONA.md
**Total Checks**: 116

---

## 17.1 Citizen Ideas Submission (28 checks)

### 17.1.1 Idea Creation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | Navigate to Ideas → Submit Idea | Form loads | ⬜ |
| 2 | Title required | Validation | ⬜ |
| 3 | Description field | Rich text or plain | ⬜ |
| 4 | Category selector | Predefined categories | ⬜ |
| 5 | Municipality selector | Location context | ⬜ |
| 6 | Tags input | Keywords | ⬜ |
| 7 | Image upload | Optional visual | ⬜ |
| 8 | Location picker | Map integration | ⬜ |
| 9 | Anonymous option | Hide submitter | ⬜ |
| 10 | Save draft | Preserve progress | ⬜ |
| 11 | Submit idea | Status → 'submitted' | ⬜ |
| 12 | Idea record created | citizen_ideas table | ⬜ |
| 13 | user_id linked | Submitter reference | ⬜ |
| 14 | votes_count = 0 | Initial state | ⬜ |
| 15 | created_at timestamp | Auto-populated | ⬜ |
| 16 | Confirmation message | Success feedback | ⬜ |
| 17 | Points awarded | For submission | ⬜ |

### 17.1.2 Idea Moderation
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 18 | Admin moderation queue | Pending ideas | ⬜ |
| 19 | Review idea content | Appropriateness check | ⬜ |
| 20 | Approve idea | is_published = true | ⬜ |
| 21 | Reject idea | Status → 'rejected' | ⬜ |
| 22 | Request edit | Status → 'needs_edit' | ⬜ |
| 23 | Moderation notification | To submitter | ⬜ |
| 24 | Rejection reason | Feedback provided | ⬜ |
| 25 | Auto-moderation | AI content check | ⬜ |

### 17.1.3 Idea Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 26 | View my ideas | Citizen dashboard | ⬜ |
| 27 | Edit submitted idea | Before approval | ⬜ |
| 28 | Delete my idea | Soft delete | ⬜ |

---

## 17.2 Voting System (24 checks)

### 17.2.1 Voting on Ideas
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 29 | Browse published ideas | Public listing | ⬜ |
| 30 | Filter by category | Category filter | ⬜ |
| 31 | Filter by municipality | Location filter | ⬜ |
| 32 | Sort by votes | Popular first | ⬜ |
| 33 | Sort by newest | Recent first | ⬜ |
| 34 | View idea details | Full information | ⬜ |
| 35 | Upvote button | Vote action | ⬜ |
| 36 | Vote recorded | citizen_votes table | ⬜ |
| 37 | entity_type = 'idea' | Correct reference | ⬜ |
| 38 | One vote per idea per user | Unique constraint | ⬜ |
| 39 | votes_count incremented | Real-time update | ⬜ |
| 40 | Visual vote confirmation | UI feedback | ⬜ |
| 41 | Remove vote | Undo action | ⬜ |
| 42 | Points for voting | Gamification reward | ⬜ |

### 17.2.2 Voting on Challenges
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 43 | Browse published challenges | Public listing | ⬜ |
| 44 | Vote on challenge | citizen_votes record | ⬜ |
| 45 | entity_type = 'challenge' | Correct reference | ⬜ |
| 46 | citizen_votes_count update | On challenges table | ⬜ |
| 47 | Vote limit per user | If applicable | ⬜ |
| 48 | Popular challenges section | Sorted by votes | ⬜ |

### 17.2.3 Voting Analytics
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 49 | Total votes dashboard | Admin view | ⬜ |
| 50 | Votes over time | Trend chart | ⬜ |
| 51 | Most voted items | Leaderboard | ⬜ |
| 52 | Voter demographics | If available | ⬜ |

---

## 17.3 Points & Gamification (28 checks)

### 17.3.1 Points System
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 53 | Points record exists | citizen_points table | ⬜ |
| 54 | Points for registration | Initial bonus | ⬜ |
| 55 | Points for idea submission | Activity reward | ⬜ |
| 56 | Points for voting | Participation reward | ⬜ |
| 57 | Points for feedback | Engagement reward | ⬜ |
| 58 | Points for pilot enrollment | Action reward | ⬜ |
| 59 | Points for event attendance | Physical participation | ⬜ |
| 60 | Points for survey completion | Data contribution | ⬜ |
| 61 | Daily login bonus | If implemented | ⬜ |
| 62 | Streak bonuses | Consecutive engagement | ⬜ |
| 63 | Points total display | Profile widget | ⬜ |
| 64 | Points history | Transaction log | ⬜ |
| 65 | total_earned tracking | Lifetime points | ⬜ |
| 66 | total_spent tracking | If redeemable | ⬜ |

### 17.3.2 Levels System
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 67 | Level calculation | Based on points | ⬜ |
| 68 | Level thresholds | Defined boundaries | ⬜ |
| 69 | Level display | Profile badge | ⬜ |
| 70 | Level up notification | Achievement alert | ⬜ |
| 71 | Level benefits | If applicable | ⬜ |
| 72 | Level names | Descriptive titles | ⬜ |

### 17.3.3 Badges & Achievements
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 73 | Achievements table | achievements definitions | ⬜ |
| 74 | Badge earned | citizen_badges record | ⬜ |
| 75 | Badge categories | Types of achievements | ⬜ |
| 76 | Badge triggers | Automatic on action | ⬜ |
| 77 | First Idea badge | Submission milestone | ⬜ |
| 78 | Active Voter badge | Voting milestone | ⬜ |
| 79 | Community Champion | High participation | ⬜ |
| 80 | Badge display | Profile showcase | ⬜ |

---

## 17.4 Leaderboards (16 checks)

### 17.4.1 Leaderboard Types
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 81 | Points leaderboard | Top point earners | ⬜ |
| 82 | Ideas leaderboard | Most ideas submitted | ⬜ |
| 83 | Votes leaderboard | Most active voters | ⬜ |
| 84 | Municipality leaderboard | By location | ⬜ |
| 85 | Weekly leaderboard | Time-bounded | ⬜ |
| 86 | Monthly leaderboard | Period-based | ⬜ |
| 87 | All-time leaderboard | Lifetime rankings | ⬜ |

### 17.4.2 Leaderboard Display
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 88 | Top 10 display | Limited view | ⬜ |
| 89 | Current user position | "You are #X" | ⬜ |
| 90 | User avatars | Visual identification | ⬜ |
| 91 | Anonymized names | Privacy option | ⬜ |
| 92 | Share my rank | Social sharing | ⬜ |
| 93 | Filter by time period | Dropdown | ⬜ |
| 94 | Filter by location | Municipality filter | ⬜ |
| 95 | Refresh interval | Real-time or periodic | ⬜ |
| 96 | Mobile responsive | Touch-friendly | ⬜ |

---

## 17.5 Citizen Feedback (12 checks)

### 17.5.1 Feedback Submission
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 97 | Submit feedback | citizen_feedback table | ⬜ |
| 98 | Feedback type | Suggestion/complaint/praise | ⬜ |
| 99 | Entity reference | What feedback is about | ⬜ |
| 100 | Rating component | Star rating | ⬜ |
| 101 | Text feedback | Free form | ⬜ |
| 102 | Anonymous option | Hide identity | ⬜ |
| 103 | Category selection | Topic area | ⬜ |
| 104 | Attachment support | Screenshots | ⬜ |

### 17.5.2 Feedback Management
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 105 | Admin feedback queue | All submissions | ⬜ |
| 106 | Respond to feedback | Admin reply | ⬜ |
| 107 | Feedback status | New/in-progress/resolved | ⬜ |
| 108 | Response notification | To citizen | ⬜ |

---

## 17.6 Notifications & Engagement (8 checks)

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 109 | citizen_notifications table | Records exist | ⬜ |
| 110 | Idea status updates | When approved/rejected | ⬜ |
| 111 | Vote milestones | When idea hits thresholds | ⬜ |
| 112 | Badge earned notification | Achievement alerts | ⬜ |
| 113 | Level up notification | Progress alerts | ⬜ |
| 114 | New opportunities | Pilots/programs available | ⬜ |
| 115 | Mark as read | is_read toggle | ⬜ |
| 116 | Notification preferences | citizen_profiles settings | ⬜ |

---

## Summary

| Section | Checks | Critical |
|---------|--------|----------|
| 17.1 Citizen Ideas Submission | 28 | 10 |
| 17.2 Voting System | 24 | 10 |
| 17.3 Points & Gamification | 28 | 8 |
| 17.4 Leaderboards | 16 | 4 |
| 17.5 Citizen Feedback | 12 | 4 |
| 17.6 Notifications & Engagement | 8 | 4 |
| **Total** | **116** | **40** |
