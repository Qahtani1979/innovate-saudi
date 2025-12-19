# Shared/Common System Inventory

> **Version:** 1.1  
> **Last Updated:** 2025-12-19  
> **Total Assets:** 36 files (12 pages, 17 components, 2 hooks)  
> **Parent System:** Platform-Wide Shared Features  
> **Purpose:** Cross-cutting features available to all personas

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| - | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Strategy →](../strategy/strategy-system-inventory.md) |

---

## Overview

The Shared System contains platform-wide features that are accessible across all personas and systems. These are foundational components that provide consistent functionality throughout the platform.

---

## 📄 Pages (12)

### Platform-Wide Pages

| Page | File | Route | Permission | Description |
|------|------|-------|------------|-------------|
| **What's New Hub** | `WhatsNewHub.jsx` | `/whats-new-hub` | `authenticated` | Platform updates, announcements, and new features |
| Messaging | `Messaging.jsx` | `/messaging` | `authenticated` | Platform messaging system |
| News | `News.jsx` | `/news` | `public` | Platform news and updates |
| Help Center | `HelpCenter.jsx` | `/help-center` | `public` | Help documentation |
| Feedback | `Feedback.jsx` | `/feedback` | `authenticated` | Platform feedback submission |

### Profile Pages

| Page | File | Route | Permission | Description |
|------|------|-------|------------|-------------|
| **UserProfileHub** | `UserProfileHub.jsx` | `/user-profile-hub` | `authenticated` | Main profile dashboard with tabs |
| **PublicProfilePage** | `PublicProfilePage.jsx` | `/profile/:userId` | `public` | Public-facing profile view |
| UserProfileTab | `profile-tabs/UserProfileTab.jsx` | Tab | `authenticated` | Basic profile info editing |
| MyProfilesTab | `profile-tabs/MyProfilesTab.jsx` | Tab | `authenticated` | Multi-profile management |
| ActivityTab | `profile-tabs/ActivityTab.jsx` | Tab | `authenticated` | Activity history |
| GamificationTab | `profile-tabs/GamificationTab.jsx` | Tab | `authenticated` | Points, badges, leaderboard |
| ProgressTab | `profile-tabs/ProgressTab.jsx` | Tab | `authenticated` | Progress tracking |

> 📖 **See Also:** [Profile System Documentation](PROFILE_SYSTEM.md) for complete profile system details.

---

## 🧩 Components (17)

### Notification Components
**Location:** `src/components/shared/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `PlatformInsightsWidget.jsx` | Platform insights display | All dashboards |
| `WhatsNewNotification.jsx` | New feature notifications | Headers |
| `AnnouncementBanner.jsx` | Global announcements | All pages |

### Common UI Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `LanguageSelector.jsx` | EN/AR language toggle | All pages |
| `ThemeToggle.jsx` | Dark/light mode | All pages |
| `BreadcrumbNav.jsx` | Navigation breadcrumbs | All pages |
| `GlobalSearch.jsx` | Platform-wide search | Headers |

### Messaging Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `MessageThread.jsx` | Message display | Messaging |
| `NotificationCenter.jsx` | Notification hub | Headers |
| `QuickActions.jsx` | Quick action buttons | Dashboards |

### Profile Components
**Location:** `src/components/profile/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `ProfileHeader.jsx` | Profile header with avatar/name | Profile pages |
| `ProfileStatCard.jsx` | Statistics display card | Profile pages |
| `ProfileBadgeCard.jsx` | Badge/achievement display | Gamification |
| `ProfileActivityTimeline.jsx` | Activity feed timeline | Activity tab |
| `ProfileEditForm.jsx` | Profile editing form | Profile editing |
| `UserProfileLink.jsx` | Clickable user link/avatar | All pages |
| `PublicProfileCard.jsx` | Public profile summary | Public views |

---

## 🪝 Hooks (2)

| Hook | File | Purpose |
|------|------|---------|
| `useProfileData` | `src/hooks/useProfileData.js` | Profile data fetching & mutations |
| `useRowLevelSecurity` | `src/components/security/RowLevelSecurity.jsx` | Client-side RLS helpers |

---

## 🗄️ Database Tables

### Platform Tables

| Table | Purpose |
|-------|---------|
| `platform_insights` | Platform announcements and insights |
| `notifications` | User notifications |
| `messages` | Platform messages |

### Profile Tables

| Table | Purpose |
|-------|---------|
| `user_profiles` | Main user profile data |
| `citizen_profiles` | Citizen-specific extensions |
| `citizen_points` | Gamification points tracking |
| `citizen_badges` | Achievement badges |
| `achievements` | Achievement definitions |
| `user_achievements` | User-achievement mapping |

> 📖 **See Also:** [Profile System Documentation](PROFILE_SYSTEM.md) for schema details.

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `authenticated` | Any logged-in user |
| `public` | Public access |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| All Systems | Provides shared functionality |
| Admin | Manages announcements |
| Communications | Messaging integration |
| RBAC | Profile-role integration |
| Visibility | Profile visibility rules |

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| [Profile System](PROFILE_SYSTEM.md) | Complete profile system documentation |
| [RBAC System](../RBAC_SYSTEM.md) | Role-based access control |
| [Visibility System](../VISIBILITY_SYSTEM.md) | Entity visibility rules |
