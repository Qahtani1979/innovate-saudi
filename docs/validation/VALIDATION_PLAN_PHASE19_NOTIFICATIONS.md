# Phase 19: Notifications & Email System Validation Plan
## In-App → Email → Preferences

**Reference**: ONBOARDING_FLOW_TRACKING.md
**Total Checks**: 88

---

## 19.1 In-App Notifications (28 checks)

### 19.1.1 Notification Infrastructure
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | citizen_notifications table | For citizens | ⬜ |
| 2 | General notifications table | If exists | ⬜ |
| 3 | notification_type field | Category classification | ⬜ |
| 4 | entity_type reference | What it's about | ⬜ |
| 5 | entity_id reference | Specific item | ⬜ |
| 6 | user_id/user_email | Recipient | ⬜ |
| 7 | is_read flag | Read status | ⬜ |
| 8 | read_at timestamp | When read | ⬜ |
| 9 | created_at timestamp | When created | ⬜ |
| 10 | metadata field | Additional context | ⬜ |

### 19.1.2 Notification UI
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 11 | Notification bell icon | Header component | ⬜ |
| 12 | Unread count badge | Visual indicator | ⬜ |
| 13 | Notification dropdown | Quick preview | ⬜ |
| 14 | Notification list page | Full history | ⬜ |
| 15 | Mark as read | Individual action | ⬜ |
| 16 | Mark all as read | Bulk action | ⬜ |
| 17 | Click to navigate | Go to related item | ⬜ |
| 18 | Delete notification | Remove from list | ⬜ |
| 19 | Empty state | When no notifications | ⬜ |
| 20 | Loading state | While fetching | ⬜ |
| 21 | Real-time updates | New notifications appear | ⬜ |

### 19.1.3 Notification Triggers
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 22 | Challenge status change | Notify owner | ⬜ |
| 23 | Solution verified | Notify provider | ⬜ |
| 24 | Proposal received | Notify municipality | ⬜ |
| 25 | Pilot status change | Notify stakeholders | ⬜ |
| 26 | Comment received | Notify entity owner | ⬜ |
| 27 | Assignment created | Notify assignee | ⬜ |
| 28 | Approval required | Notify approvers | ⬜ |

---

## 19.2 Email Notifications (32 checks)

### 19.2.1 Email Infrastructure
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 29 | Email service configured | Resend API key | ⬜ |
| 30 | Send email edge function | Working endpoint | ⬜ |
| 31 | Email templates | HTML templates | ⬜ |
| 32 | From address | Verified sender | ⬜ |
| 33 | Reply-to address | Support email | ⬜ |
| 34 | Email tracking | Delivery status | ⬜ |
| 35 | Bounce handling | Error management | ⬜ |
| 36 | Unsubscribe link | In all emails | ⬜ |

### 19.2.2 Transactional Emails
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 37 | Welcome email | On registration | ⬜ |
| 38 | Email verification | Supabase auth | ⬜ |
| 39 | Password reset | Recovery flow | ⬜ |
| 40 | Account activation | If required | ⬜ |
| 41 | Profile completion reminder | Onboarding prompt | ⬜ |

### 19.2.3 Activity Emails
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 42 | Challenge approved email | To submitter | ⬜ |
| 43 | Challenge rejected email | With feedback | ⬜ |
| 44 | New proposal email | To challenge owner | ⬜ |
| 45 | Proposal accepted email | To proposer | ⬜ |
| 46 | Proposal rejected email | With feedback | ⬜ |
| 47 | Pilot invitation email | To participants | ⬜ |
| 48 | Pilot status update email | Milestone alerts | ⬜ |
| 49 | Program acceptance email | To applicant | ⬜ |
| 50 | Event reminder email | Before event | ⬜ |
| 51 | Assignment notification | To expert | ⬜ |
| 52 | Deadline reminder | Approaching due date | ⬜ |

### 19.2.4 Digest Emails
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 53 | Daily digest option | Summary of activity | ⬜ |
| 54 | Weekly digest option | Weekly summary | ⬜ |
| 55 | Digest content | Aggregated notifications | ⬜ |
| 56 | Digest scheduling | Cron job setup | ⬜ |
| 57 | Digest personalization | Based on role | ⬜ |
| 58 | Digest opt-in/out | User preference | ⬜ |
| 59 | Unread items included | Priority content | ⬜ |
| 60 | Links to platform | Call-to-action | ⬜ |

---

## 19.3 Notification Preferences (16 checks)

### 19.3.1 User Settings
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 61 | Notification settings page | User accessible | ⬜ |
| 62 | notification_preferences JSON | In profile | ⬜ |
| 63 | In-app toggle | Enable/disable | ⬜ |
| 64 | Email toggle | Enable/disable | ⬜ |
| 65 | Per-category settings | Granular control | ⬜ |
| 66 | Challenge notifications | Toggle | ⬜ |
| 67 | Solution notifications | Toggle | ⬜ |
| 68 | Pilot notifications | Toggle | ⬜ |
| 69 | Comment notifications | Toggle | ⬜ |
| 70 | Assignment notifications | Toggle | ⬜ |
| 71 | System notifications | Always on | ⬜ |
| 72 | Save preferences | Persist changes | ⬜ |

### 19.3.2 Frequency Settings
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 73 | Immediate notifications | Real-time | ⬜ |
| 74 | Daily digest preference | Once daily | ⬜ |
| 75 | Weekly digest preference | Once weekly | ⬜ |
| 76 | Quiet hours | Do not disturb | ⬜ |

---

## 19.4 Admin Notifications (12 checks)

### 19.4.1 System Notifications
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 77 | Broadcast notification | To all users | ⬜ |
| 78 | Role-based notification | To specific role | ⬜ |
| 79 | Municipality notification | To org members | ⬜ |
| 80 | Scheduled notification | Future delivery | ⬜ |
| 81 | Notification templates | Reusable content | ⬜ |
| 82 | Preview before send | Confirmation | ⬜ |

### 19.4.2 Notification Analytics
| # | Check | Expected | Status |
|---|-------|----------|--------|
| 83 | Delivery rate | Sent vs delivered | ⬜ |
| 84 | Open rate | Email opens | ⬜ |
| 85 | Click rate | Link clicks | ⬜ |
| 86 | Read rate | In-app reads | ⬜ |
| 87 | Unsubscribe rate | Opt-out tracking | ⬜ |
| 88 | Notification logs | Audit trail | ⬜ |

---

## Summary

| Section | Checks | Critical |
|---------|--------|----------|
| 19.1 In-App Notifications | 28 | 12 |
| 19.2 Email Notifications | 32 | 14 |
| 19.3 Notification Preferences | 16 | 6 |
| 19.4 Admin Notifications | 12 | 4 |
| **Total** | **88** | **36** |
