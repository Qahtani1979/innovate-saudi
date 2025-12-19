# Profile System Documentation

> **Version:** 1.0  
> **Last Updated:** 2025-12-19  
> **Status:** ✅ Fully Validated  
> **Total Assets:** 21 files (7 pages/tabs, 7 components, 2 hooks, 6 tables)

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [Shared System](shared-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [RBAC System](../RBAC_SYSTEM.md) |

---

## Overview

The Profile System manages user identity, achievements, activity tracking, and public presence across the platform. It integrates with the RBAC system for permissions and the visibility system for data access control.

---

## 📄 Database Tables (6)

### Core Profile Tables

| Table | Purpose | RLS | Status |
|-------|---------|-----|--------|
| `user_profiles` | Main user profile data | ✅ Enabled | ✅ Active |
| `citizen_profiles` | Citizen-specific extensions | ✅ Enabled | ✅ Active |
| `citizen_points` | Gamification points tracking | ✅ Enabled | ✅ Active |
| `citizen_badges` | Achievement badges | ✅ Enabled | ✅ Active |
| `achievements` | Achievement definitions | ✅ Enabled | ✅ Active |
| `user_achievements` | User-achievement mapping | ✅ Enabled | ✅ Active |

### Schema: `user_profiles`

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT UNIQUE,
  full_name TEXT,
  full_name_en TEXT,
  avatar_url TEXT,
  bio TEXT,
  bio_ar TEXT,
  phone TEXT,
  organization_id UUID,
  municipality_id UUID,
  department TEXT,
  position TEXT,
  position_ar TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  skills TEXT[],
  interests TEXT[],
  is_public BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Schema: `citizen_profiles`

```sql
CREATE TABLE public.citizen_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  municipality_id UUID,
  region_id UUID,
  city_id UUID,
  neighborhood TEXT,
  interests TEXT[],
  participation_areas TEXT[],
  language_preference TEXT DEFAULT 'en',
  notification_preferences JSONB,
  accessibility_needs TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔐 RLS Policies

### user_profiles

| Policy | Operation | Rule |
|--------|-----------|------|
| View own profile | SELECT | `auth.uid() = user_id` |
| View public profiles | SELECT | `is_public = true` |
| Update own profile | UPDATE | `auth.uid() = user_id` |
| Insert own profile | INSERT | `auth.uid() = user_id` |

### citizen_profiles

| Policy | Operation | Rule |
|--------|-----------|------|
| View own | SELECT | `auth.uid() = user_id` |
| Update own | UPDATE | `auth.uid() = user_id` |
| Insert own | INSERT | `auth.uid() = user_id` |

### citizen_points / citizen_badges / user_achievements

| Policy | Operation | Rule |
|--------|-----------|------|
| View own | SELECT | `auth.uid() = user_id` |
| Modify own | ALL | `auth.uid() = user_id` |

---

## 📄 Pages & Tabs (7)

### Main Profile Pages

| Page | File | Route | Description |
|------|------|-------|-------------|
| **UserProfileHub** | `src/pages/UserProfileHub.jsx` | `/user-profile-hub` | Main profile dashboard with tabs |
| **PublicProfilePage** | `src/pages/PublicProfilePage.jsx` | `/profile/:userId` | Public-facing profile view |

### Profile Tabs

| Tab | File | Parent | Description |
|-----|------|--------|-------------|
| **UserProfileTab** | `src/pages/profile-tabs/UserProfileTab.jsx` | UserProfileHub | Basic info editing |
| **MyProfilesTab** | `src/pages/profile-tabs/MyProfilesTab.jsx` | UserProfileHub | Multi-profile management |
| **ActivityTab** | `src/pages/profile-tabs/ActivityTab.jsx` | UserProfileHub | Activity history |
| **GamificationTab** | `src/pages/profile-tabs/GamificationTab.jsx` | UserProfileHub | Points, badges, leaderboard |
| **ProgressTab** | `src/pages/profile-tabs/ProgressTab.jsx` | UserProfileHub | Progress tracking |

---

## 🧩 Components (7)

### Core Profile Components

| Component | File | Purpose |
|-----------|------|---------|
| **ProfileHeader** | `src/components/profile/ProfileHeader.jsx` | Profile header with avatar/name |
| **ProfileStatCard** | `src/components/profile/ProfileStatCard.jsx` | Statistics display card |
| **ProfileBadgeCard** | `src/components/profile/ProfileBadgeCard.jsx` | Badge/achievement display |
| **ProfileActivityTimeline** | `src/components/profile/ProfileActivityTimeline.jsx` | Activity feed timeline |
| **ProfileEditForm** | `src/components/profile/ProfileEditForm.jsx` | Profile editing form |
| **UserProfileLink** | `src/components/profile/UserProfileLink.jsx` | Clickable user link/avatar |
| **PublicProfileCard** | `src/components/profile/PublicProfileCard.jsx` | Public profile summary |

---

## 🪝 Hooks (2)

### useProfileData

**Location:** `src/hooks/useProfileData.js`

```javascript
import { useProfileData } from '@/hooks/useProfileData';

const {
  profile,           // Current user's profile
  isLoading,         // Loading state
  updateProfile,     // Update function
  refreshProfile     // Refresh data
} = useProfileData();
```

### useRowLevelSecurity

**Location:** `src/components/security/RowLevelSecurity.jsx`

```javascript
import { useRowLevelSecurity } from '@/components/security/RowLevelSecurity';

const { applyRLS, canAccessRecord } = useRowLevelSecurity();

// Apply RLS filter to queries
const filter = applyRLS('Challenge', baseQuery);

// Check single record access
const hasAccess = canAccessRecord('Pilot', record);
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Profile Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│   │   Auth       │───▶│ user_profiles│───▶│ UserProfile  │ │
│   │   (Supabase) │    │   (Table)    │    │   Hub        │ │
│   └──────────────┘    └──────────────┘    └──────────────┘ │
│          │                   │                    │         │
│          │                   │                    ▼         │
│          │                   │           ┌──────────────┐  │
│          │                   │           │ Profile Tabs │  │
│          │                   │           │ - Profile    │  │
│          │                   │           │ - Activity   │  │
│          │                   │           │ - Gamification│ │
│          │                   │           │ - Progress   │  │
│          │                   │           └──────────────┘  │
│          │                   │                              │
│          ▼                   ▼                              │
│   ┌──────────────┐    ┌──────────────┐                     │
│   │ citizen_     │    │ Public       │                     │
│   │ profiles     │    │ Profile Page │                     │
│   └──────────────┘    └──────────────┘                     │
│          │                   │                              │
│          ▼                   │                              │
│   ┌──────────────┐           │                              │
│   │ citizen_     │◀──────────┘                              │
│   │ points/badges│                                          │
│   └──────────────┘                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Model

### Access Control Matrix

| User Type | Own Profile | Other Profiles | Public Profiles | Admin Features |
|-----------|-------------|----------------|-----------------|----------------|
| **Anonymous** | ❌ | ❌ | ✅ (is_public=true) | ❌ |
| **Authenticated** | ✅ Full | ❌ | ✅ View | ❌ |
| **Admin** | ✅ Full | ✅ Full | ✅ Full | ✅ |

### Privacy Controls

1. **is_public flag**: Controls profile visibility to non-owners
2. **Email masking**: Leaderboard entries show masked emails (`j***@example.com`)
3. **RLS enforcement**: All queries filtered by user_id at database level
4. **Verified badge**: Indicates identity verification status

---

## 🔗 Integration Points

### With RBAC System

```javascript
// Profile data used for role assignment
import { usePermissions } from '@/components/permissions/usePermissions';

const { user, isAdmin, hasPermission } = usePermissions();
// user.email maps to user_profiles.user_email
```

### With Visibility System

```javascript
// Profiles respect visibility rules
import { useUsersWithVisibility } from '@/hooks/useUsersWithVisibility';

// Admin: sees all users
// Municipality: sees users in same municipality
// Provider: sees users in same organization
```

### With Activity Tracking

```javascript
// Activities link to user profiles
// access_logs.user_email → user_profiles.user_email
// challenge_activities.user_email → user_profiles.user_email
```

---

## ✅ Validation Checklist

### Database Layer
- [x] All 6 tables have RLS enabled
- [x] user_profiles has public visibility policy for is_public=true
- [x] citizen_points/badges have user isolation policies
- [x] No foreign key to auth.users (uses user_id UUID)

### Component Layer
- [x] All queries use `.maybeSingle()` not `.single()`
- [x] UserProfileLink handles null profiles gracefully
- [x] PublicProfilePage checks is_public before rendering
- [x] GamificationTab masks emails in leaderboard

### Security Layer
- [x] RLS policies enforce user data isolation
- [x] Public profile access requires is_public=true
- [x] Admin bypass via is_admin() function
- [x] No PII leakage in public views

---

## 📝 Common Patterns

### Fetching Current User Profile

```javascript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', user.id)
  .maybeSingle();
```

### Fetching Public Profile

```javascript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .eq('is_public', true)
  .maybeSingle();
```

### Updating Profile

```javascript
const { error } = await supabase
  .from('user_profiles')
  .update({ full_name: newName, updated_at: new Date() })
  .eq('user_id', user.id);
```

### Masking Email for Privacy

```javascript
const maskEmail = (email) => {
  if (!email) return 'Anonymous';
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
};
```

---

## 🚀 Future Enhancements

1. **Profile Verification Flow**: Automated identity verification
2. **Profile Analytics**: View counts, engagement metrics
3. **Profile Export**: GDPR-compliant data export
4. **Social Connections**: Follow/connect with other users
5. **Profile Themes**: Customizable profile appearance

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| [RBAC System](../RBAC_SYSTEM.md) | Role-based access control |
| [Visibility System](../VISIBILITY_SYSTEM.md) | Entity visibility rules |
| [Shared System Inventory](shared-system-inventory.md) | Platform-wide features |
| [Citizens System](../citizens/citizens-system-inventory.md) | Citizen engagement features |
