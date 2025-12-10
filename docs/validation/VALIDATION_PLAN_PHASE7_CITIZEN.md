# Phase 7: Citizen Specialized Onboarding + Dashboard + Gamification
## Validation Plan

**Version:** 1.0  
**Last Updated:** 2024-12-10  
**Reference:** `docs/personas/CITIZEN_PERSONA.md`

---

## 1. CitizenOnboardingWizard Validation

### 1.1 Stage 1 Data Inheritance (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-001 | City ID pre-populated | city_id from user_profiles | High |
| C7-002 | Interests pre-populated | interests array | High |
| C7-003 | Notification preferences pre-populated | notification_preferences | Medium |
| C7-004 | useAuth provides userProfile | Data available | Critical |
| C7-005 | No duplicate location selection | If already set | Medium |
| C7-006 | Language preference inherited | preferred_language | Medium |

### 1.2 Wizard Steps (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-007 | Step 1 (Location) - city dropdown | Cities from DB | Critical |
| C7-008 | City selection required | Validation | Critical |
| C7-009 | Neighborhood optional | Text input | Medium |
| C7-010 | Location info tooltip | Privacy info | Low |
| C7-011 | Step 2 (Interests) - multi-select | Max 5 | High |
| C7-012 | Interest areas display | 10 categories | High |
| C7-013 | Participation types selectable | 5 options | High |
| C7-014 | Step 3 (Notifications) - toggles | 4 settings | High |
| C7-015 | New challenges toggle | Default on | Medium |
| C7-016 | Pilot opportunities toggle | Default on | Medium |
| C7-017 | Community events toggle | Default on | Medium |
| C7-018 | Weekly digest toggle | Default off | Medium |

### 1.3 Database Writes (12 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-019 | user_profiles.city_id updated | UUID | High |
| C7-020 | user_profiles.interests updated | Array | High |
| C7-021 | user_profiles.onboarding_completed = true | Boolean | Critical |
| C7-022 | user_profiles.persona_onboarding_completed = true | Boolean | Critical |
| C7-023 | user_profiles.notification_preferences saved | JSON | High |
| C7-024 | user_profiles.metadata.neighborhood saved | JSON | Medium |
| C7-025 | user_profiles.metadata.participation_types saved | JSON | High |
| C7-026 | citizen_profiles upsert | New/update | Critical |
| C7-027 | citizen_profiles.participation_areas saved | Array | High |
| C7-028 | citizen_profiles.language_preference saved | Text | Medium |
| C7-029 | citizen_profiles.is_verified = false | Initial | High |
| C7-030 | citizen_points initialized | 10 welcome pts | High |

### 1.4 Auto-Approval (4 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-031 | No role_request created | Auto-approved | Critical |
| C7-032 | citizen role auto-granted | user_roles entry | Critical |
| C7-033 | Immediate dashboard access | No wait | Critical |
| C7-034 | Welcome points awarded | 10 points | High |

---

## 2. CitizenDashboard Validation

### 2.1 Dashboard Access (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-035 | Authenticated access required | Auth check | Critical |
| C7-036 | Citizen role provides access | Permission | Critical |
| C7-037 | Dashboard loads < 3 seconds | Performance | High |
| C7-038 | No console errors | Clean load | Critical |
| C7-039 | RTL layout correct | Arabic | High |
| C7-040 | Responsive on mobile | Layout | High |
| C7-041 | Orange theme applied | Brand color | Medium |
| C7-042 | Welcome message for new users | First visit | Medium |

### 2.2 Statistics Cards (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-043 | Ideas submitted count | Own ideas | High |
| C7-044 | Votes cast count | Own votes | High |
| C7-045 | Total points display | From citizen_points | High |
| C7-046 | Ideas converted count | To challenges | Medium |
| C7-047 | Cards link to detail | Navigation | Medium |
| C7-048 | Zero states handled | Empty messages | Medium |
| C7-049 | Numbers accurate | DB counts | Critical |
| C7-050 | Animated on load | Visual feedback | Low |

### 2.3 Impact Level Card (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-051 | Current level displayed | bronze/silver/gold/platinum | High |
| C7-052 | Level badge visual | Icon/badge | Medium |
| C7-053 | Points to next level | Progress indicator | High |
| C7-054 | Badges earned display | Badge gallery | Medium |
| C7-055 | National rank shown | If available | Medium |
| C7-056 | Level color coding | Bronze=brown, etc | Medium |
| C7-057 | Progress bar accurate | % to next level | High |
| C7-058 | Click shows level details | Modal/page | Low |

### 2.4 Dashboard Tabs (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-059 | "My Ideas" tab works | Tab switch | High |
| C7-060 | My ideas list loads | Own ideas | Critical |
| C7-061 | Idea status badges | Status indicator | High |
| C7-062 | "My Votes" tab works | Tab switch | High |
| C7-063 | Voted items list | With vote direction | High |
| C7-064 | "Updates" tab works | Tab switch | High |
| C7-065 | Notifications list | citizen_notifications | High |
| C7-066 | Mark as read works | is_read update | Medium |
| C7-067 | Click navigates to entity | Notification link | High |
| C7-068 | Empty states per tab | Informative | Medium |

---

## 3. Gamification System

### 3.1 Points System (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-069 | Submit idea = 10 points | citizen_points update | Critical |
| C7-070 | Idea approved = 25 points | Automatic award | High |
| C7-071 | Idea converted = 100 points | Automatic award | High |
| C7-072 | Vote cast = 1 point | citizen_points update | High |
| C7-073 | Feedback provided = 5 points | citizen_points update | Medium |
| C7-074 | Pilot enrollment = 20 points | citizen_points update | Medium |
| C7-075 | Pilot completion = 50 points | citizen_points update | Medium |
| C7-076 | total_earned accumulates | Running total | High |
| C7-077 | Points cannot go negative | Validation | High |
| C7-078 | Points history available | Transaction log | Low |

### 3.2 Level System (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-079 | Bronze: 0-99 points | Level calculation | High |
| C7-080 | Silver: 100-499 points | Level calculation | High |
| C7-081 | Gold: 500-999 points | Level calculation | High |
| C7-082 | Platinum: 1000+ points | Level calculation | High |
| C7-083 | Level auto-updates | On point change | High |
| C7-084 | Level-up notification | Toast/notification | Medium |

### 3.3 Badges (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-085 | "First Idea" badge | On first submission | High |
| C7-086 | "Idea Champion" badge | 10 ideas | Medium |
| C7-087 | "Voter" badge | 100 votes | Medium |
| C7-088 | "Influencer" badge | 50+ votes on idea | Medium |
| C7-089 | "Pioneer" badge | First converted idea | Medium |
| C7-090 | Badge auto-awarded | On criteria met | High |
| C7-091 | Badge notification | Toast/notification | Medium |
| C7-092 | Badges display in profile | Badge gallery | Medium |

---

## 4. Idea Workflows

### 4.1 Idea Submission (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-093 | PublicIdeaSubmission accessible | Page loads | Critical |
| C7-094 | Title field required | Validation | Critical |
| C7-095 | Description field required | Validation | Critical |
| C7-096 | Category selection | Dropdown | High |
| C7-097 | Municipality auto-set | From profile | High |
| C7-098 | Image upload optional | File upload | Medium |
| C7-099 | Idea saved | citizen_ideas table | Critical |
| C7-100 | status = 'submitted' | Initial | Critical |
| C7-101 | user_id set | Auth user | Critical |
| C7-102 | Points awarded | 10 points | High |

### 4.2 Idea Voting (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-103 | PublicIdeasBoard loads | Page renders | Critical |
| C7-104 | Only published ideas shown | is_published=true | Critical |
| C7-105 | Upvote button works | citizen_votes insert | High |
| C7-106 | Downvote button works | citizen_votes insert | High |
| C7-107 | Cannot vote twice | Unique constraint | Critical |
| C7-108 | Vote count updates | Real-time | High |
| C7-109 | Points awarded for vote | 1 point | High |
| C7-110 | Own ideas can't be voted | Validation | High |

### 4.3 Idea Status Tracking (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-111 | submitted status shows | Initial state | High |
| C7-112 | under_review status shows | When assigned | High |
| C7-113 | approved status shows | When approved | High |
| C7-114 | rejected status shows | With reason | High |
| C7-115 | converted_to_challenge shows | With link | High |
| C7-116 | Status change notifications | In-app + email | High |

---

## 5. Pilot Enrollment (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-117 | CitizenPilotEnrollment accessible | Page loads | High |
| C7-118 | Available pilots display | Citizen-facing | High |
| C7-119 | Eligibility check | Before enroll | High |
| C7-120 | Enrollment saved | citizen_pilot_enrollments | High |
| C7-121 | Enrollment points awarded | 20 points | Medium |
| C7-122 | Feedback submission | Post-pilot | Medium |

---

## 6. Leaderboard (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| C7-123 | CitizenLeaderboard loads | Page renders | High |
| C7-124 | Top contributors shown | Ranked list | High |
| C7-125 | Points displayed | Per citizen | High |
| C7-126 | Level badges shown | Visual indicator | Medium |
| C7-127 | Own rank highlighted | If in list | Medium |
| C7-128 | Privacy respected | Anonymous option | Medium |

---

## Summary

| Category | Total Checks |
|----------|--------------|
| Stage 1 Data Inheritance | 6 |
| Wizard Steps | 12 |
| Database Writes | 12 |
| Auto-Approval | 4 |
| Dashboard Access | 8 |
| Statistics Cards | 8 |
| Impact Level Card | 8 |
| Dashboard Tabs | 10 |
| Points System | 10 |
| Level System | 6 |
| Badges | 8 |
| Idea Submission | 10 |
| Idea Voting | 8 |
| Idea Status Tracking | 6 |
| Pilot Enrollment | 6 |
| Leaderboard | 6 |
| **TOTAL** | **128 checks** |

---

## Files to Validate

| File | Purpose |
|------|---------|
| `src/components/onboarding/CitizenOnboardingWizard.jsx` | Stage 2 wizard |
| `src/pages/CitizenOnboarding.jsx` | Page wrapper |
| `src/pages/CitizenDashboard.jsx` | Main dashboard |
| `src/pages/PublicIdeaSubmission.jsx` | Idea submission |
| `src/pages/PublicIdeasBoard.jsx` | Idea voting |
| `src/pages/CitizenLeaderboard.jsx` | Leaderboard |
| `src/pages/CitizenPilotEnrollment.jsx` | Pilot enrollment |
