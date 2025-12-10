# Gap Analysis: Onboarding Wizard Fields vs Database Tables

## Overview
This document identifies discrepancies between:
1. Fields collected in onboarding wizards
2. Fields available in database tables
3. Missing relationships between tables
4. Data flow issues between Stage 1 and Stage 2 onboarding

---

## 1. Main OnboardingWizard (Stage 1) - Field Analysis

### 1.1 Fields Collected in Wizard

| Wizard Field | Type | Expected DB Column | Status |
|--------------|------|-------------------|--------|
| `full_name_en` | text | `user_profiles.full_name_en` | ✅ Exists |
| `full_name_ar` | text | `user_profiles.full_name_ar` | ✅ Exists |
| `job_title_en` | text | `user_profiles.job_title_en` | ✅ Exists |
| `job_title_ar` | text | `user_profiles.job_title_ar` | ✅ Exists |
| `department_en` | text | `user_profiles.department_en` | ✅ Exists |
| `department_ar` | text | `user_profiles.department_ar` | ✅ Exists |
| `organization_en` | text | `user_profiles.organization_en` | ✅ Exists |
| `organization_ar` | text | `user_profiles.organization_ar` | ✅ Exists |
| `bio_en` | text | `user_profiles.bio_en` | ✅ Exists |
| `bio_ar` | text | `user_profiles.bio_ar` | ✅ Exists |
| `expertise_areas` | text[] | `user_profiles.expertise_areas` | ✅ Exists |
| `interests` | text[] | `user_profiles.interests` | ✅ Exists |
| `cv_url` | text | `user_profiles.cv_url` | ✅ Exists |
| `linkedin_url` | text | `user_profiles.linkedin_url` | ✅ Exists |
| `national_id` | text | `user_profiles.national_id` | ✅ Exists |
| `date_of_birth` | date | `user_profiles.date_of_birth` | ✅ Exists |
| `gender` | text | `user_profiles.gender` | ✅ Exists |
| `education_level` | text | `user_profiles.education_level` | ✅ Exists |
| `degree` | text | `user_profiles.degree` | ✅ Exists |
| `certifications` | jsonb | `user_profiles.certifications` | ✅ Exists |
| `languages` | jsonb | `user_profiles.languages` | ✅ Exists |
| `location_city` | text | `user_profiles.location_city` | ✅ Exists |
| `location_region` | text | `user_profiles.location_region` | ✅ Exists |
| `mobile_number` | text | `user_profiles.mobile_number` | ✅ Exists |
| `mobile_country_code` | text | `user_profiles.mobile_country_code` | ✅ Exists |
| `work_phone` | text | `user_profiles.work_phone` | ✅ Exists |
| `years_of_experience` | int | `user_profiles.years_experience` | ⚠️ Name mismatch |
| `preferred_language` | text | `user_profiles.preferred_language` | ✅ Exists |
| `selectedPersona` | text | ❌ NOT saved to user_profiles | ❌ Missing |
| `roleJustification` | text | `role_requests.justification` | ✅ Exists |

### 1.2 user_profiles Columns NOT Used in Wizard

| DB Column | Type | Should Be Collected? | Priority |
|-----------|------|---------------------|----------|
| `title_en` | text | Yes - professional title | High |
| `title_ar` | text | Yes | High |
| `organization_id` | uuid | Yes - link to organizations table | High |
| `municipality_id` | uuid | Auto-set based on persona | Medium |
| `city_id` | uuid | Should use instead of location_city | High |
| `phone_number` | text | Legacy, keep mobile_number | Low |
| `avatar_url` | text | Could collect via upload | Medium |
| `cover_image_url` | text | Optional | Low |
| `timezone` | text | Could auto-detect | Low |
| `skills` | text[] | Separate from expertise_areas | Medium |
| `social_links` | jsonb | Could collect LinkedIn, Twitter | Low |
| `contact_preferences` | jsonb | When to contact | Low |
| `visibility_settings` | jsonb | Profile privacy settings | Medium |
| `work_experience` | jsonb | From CV extraction | Medium |
| `extracted_data` | jsonb | CV/LinkedIn raw data | High |
| `onboarding_step` | int | Track progress | ⚠️ Not being updated |

---

## 2. Stage 2 Onboarding - Data Flow Issues

### 2.1 StartupOnboardingWizard

**CRITICAL ISSUE:** Does NOT receive or use ANY data from Stage 1!

| Stage 1 Field | Should Pre-fill | Currently Used? |
|---------------|-----------------|-----------------|
| `full_name_en` | Founder name | ❌ No |
| `organization_en` | Company name | ❌ No |
| `bio_en` | Company description | ❌ No |
| `expertise_areas` | Sectors | ❌ No |
| `linkedin_url` | Company LinkedIn | ❌ No |
| `location_region` | Geographic coverage | ❌ No |

**Wizard saves to wrong table:** Saves to `StartupProfile` (base44 entity) instead of `startup_profiles` or `providers` table.

**Missing from Wizard:**
- Contact person details (should be from user_profile)
- Bilingual fields (name_ar, description_ar)
- Legal entity info (CR number, license)
- Team members list
- Funding stage details

### 2.2 CitizenOnboardingWizard

**PARTIAL DATA FLOW:** Uses some Stage 1 data via `useAuth().user`

| Stage 1 Field | Should Pre-fill | Currently Used? |
|---------------|-----------------|-----------------|
| `user.email` | Email | ✅ Yes |
| `location_region` | Region pre-select | ❌ No |
| `location_city` | City pre-select | ❌ No |
| `interests` | Interest areas | ❌ No |
| `preferred_language` | Language | ❌ Uses context instead |

**Data Flow Issues:**
- Creates DUPLICATE `citizen_profiles` record instead of updating
- Doesn't link `city_id` from Stage 1 profile
- `neighborhood` stored in metadata, not proper column

### 2.3 ResearcherOnboardingWizard

**CRITICAL ISSUE:** Requests CV upload AGAIN! Should use Stage 1 CV.

| Stage 1 Field | Should Pre-fill | Currently Used? |
|---------------|-----------------|-----------------|
| `cv_url` | Already uploaded CV | ❌ Asks again |
| `organization_en` | Institution | ❌ No |
| `department_en` | Department | ❌ No |
| `job_title_en` | Academic title | ❌ No |
| `bio_en` | Research bio | ❌ No |
| `expertise_areas` | Research areas | ❌ No |
| `linkedin_url` | LinkedIn | ❌ No |

**Table Issues:**
- Saves to non-existent `researcher_profiles` table (not in schema)
- Should link to `user_profiles` properly

### 2.4 ExpertOnboardingWizard

**Needs Analysis** - Check if expert_profiles exists and data flow.

### 2.5 MunicipalityStaffOnboardingWizard

**Needs Analysis** - Check municipality linking.

---

## 3. Database Tables & Columns - VERIFIED STATUS

### 3.1 Persona Profile Tables (ALL EXIST ✅)

| Table | Purpose | Status |
|-------|---------|--------|
| `user_profiles` | Core user data | ✅ Exists |
| `citizen_profiles` | Citizen-specific data | ✅ Exists |
| `researcher_profiles` | Academic-specific data | ✅ Exists |
| `expert_profiles` | Expert-specific data | ✅ Exists |
| `startup_profiles` | Startup company data | ✅ Exists |
| `municipality_staff_profiles` | Municipality staff data | ✅ Exists |

### 3.2 user_profiles Columns - VERIFIED

**Columns that EXIST (58 total):**
- Identity: `id`, `user_id`, `user_email`
- Names: `full_name`, `full_name_en`, `full_name_ar`
- Titles: `title_en`, `title_ar`, `job_title`, `job_title_en`, `job_title_ar`
- Organization: `organization_id`, `organization_en`, `organization_ar`, `municipality_id`
- Department: `department`, `department_en`, `department_ar`
- Bio: `bio`, `bio_en`, `bio_ar`
- Contact: `phone_number`, `mobile_number`, `mobile_country_code`, `work_phone`
- Location: `city_id`, `location_city`, `location_region`, `timezone`
- Personal: `national_id`, `date_of_birth`, `gender`
- Education: `education_level`, `degree`, `certifications`
- Skills: `skills`, `expertise_areas`, `interests`, `languages`
- Experience: `work_experience`, `years_experience`
- Files: `avatar_url`, `cover_image_url`, `cv_url`, `linkedin_url`
- Social: `social_links`, `contact_preferences`, `visibility_settings`
- Status: `is_active`, `is_public`, `verified`
- Onboarding: `onboarding_completed`, `onboarding_completed_at`, `profile_completion_percentage`
- Settings: `preferred_language`, `notification_preferences`
- Tracking: `extracted_data`, `achievement_badges`, `contribution_count`, `last_profile_update`
- Timestamps: `created_at`, `updated_at`

**Columns MISSING (need to add):**

| Column | Type | Purpose | Priority |
|--------|------|---------|----------|
| `onboarding_step` | integer | Track current wizard step | HIGH |
| `selected_persona` | text | Store chosen persona before approval | HIGH |
| `persona_onboarding_completed` | boolean | Track Stage 2 completion | HIGH |
| `persona_onboarding_completed_at` | timestamp | When Stage 2 finished | HIGH |
| `region_id` | uuid | Link to regions table | MEDIUM |

### 3.3 Foreign Key Relationships

| From Table | Column | To Table | Status |
|------------|--------|----------|--------|
| `user_profiles` | `city_id` | `cities` | ⚠️ Column exists, verify FK |
| `user_profiles` | `organization_id` | `organizations` | ⚠️ Verify FK |
| `user_profiles` | `municipality_id` | `municipalities` | ⚠️ Verify FK |
| `citizen_profiles` | `user_id` | `auth.users` | ⚠️ Verify FK |
| `researcher_profiles` | `user_id` | `auth.users` | ⚠️ Verify FK |
| `expert_profiles` | `user_id` | `auth.users` | ⚠️ Verify FK |
| `startup_profiles` | `user_id` | `auth.users` | ⚠️ Verify FK |
| `municipality_staff_profiles` | `user_id` | `auth.users` | ⚠️ Verify FK |

---

## 4. File Upload & Storage - VERIFIED STATUS

### 4.1 Storage Buckets

**Current Status:** Only `uploads` bucket exists!

| Bucket | Status | Action Needed |
|--------|--------|---------------|
| `uploads` | ✅ Exists | General uploads bucket |
| `cv-uploads` | ❌ MISSING | Need to create with RLS |
| `avatars` | ❌ MISSING | Need to create (public read) |
| `documents` | ❌ MISSING | For general documents |

### 4.2 CV Upload Issues

| Check | Status | Issue |
|-------|--------|-------|
| Storage bucket for CVs | ❌ | Using `uploads` instead of dedicated bucket |
| RLS policy for CV uploads | ⚠️ | Need user-specific policies |
| File URL stored correctly | ✅ | Saved to `cv_url` |
| CV uploaded TWICE | ❌ CRITICAL | ResearcherWizard asks for CV again! |
| CV data extraction | ✅ | Uses AI extraction |
| CV referenced in Stage 2 | ❌ | Should show/use existing CV |

### 4.3 Avatar Upload

| Check | Status | Issue |
|-------|--------|-------|
| Storage bucket `avatars` | ❌ | Not created |
| Avatar upload in wizard | ❌ | Not collected |
| Avatar from OAuth | ⚠️ | Google avatar should auto-populate |

### 4.4 LinkedIn Import

| Check | Status | Issue |
|-------|--------|-------|
| URL validation | ✅ | Validates linkedin.com format |
| Data extraction | ⚠️ | Depends on base44.integrations |
| Raw data storage | ⚠️ | Should save full response to `extracted_data` |
| Pre-fill form | ✅ | Pre-fills form fields |
| LinkedIn URL stored | ✅ | Saved to `linkedin_url` |

---

## 5. Role Request & Assignment Issues

### 5.1 Role Request Flow

| Check | Status | Issue |
|-------|--------|-------|
| `role_requests` table exists | ✅ | Exists |
| Request created for approval roles | ⚠️ | Verify implementation |
| Auto-approve citizen/viewer | ⚠️ | Verify implementation |
| `user_roles` created on approve | ⚠️ | Check trigger/function |
| Admin notification sent | ⚠️ | Check edge function |

### 5.2 Missing Role Assignment Data

| Data | Should Be Captured | Status |
|------|-------------------|--------|
| `municipality_id` for municipality_staff | Yes | ⚠️ Not collected |
| `organization_id` for provider | Yes | ⚠️ Not collected |
| Supporting documents | Optional | ❌ Not implemented |

---

## 6. Analytics & Tracking Issues

### 6.1 onboarding_events Table

| Event | Should Be Tracked | Status |
|-------|-------------------|--------|
| Wizard opened | Yes | ✅ |
| Each step start/complete | Yes | ✅ |
| CV uploaded | Yes | ✅ |
| LinkedIn imported | Yes | ✅ |
| Persona selected | Yes | ✅ |
| Stage 2 started | Yes | ❌ Not tracked |
| Stage 2 completed | Yes | ❌ Not tracked |
| Data pre-fill acceptance | Yes | ❌ Not tracked |

### 6.2 Missing Tracking in Stage 2

- No `useOnboardingAnalytics` hook in Stage 2 wizards
- No tracking of which fields were pre-filled vs manually entered
- No tracking of time spent in each Stage 2 step

---

## 7. Recommended Fixes

### 7.1 High Priority

1. **Pass Stage 1 data to Stage 2 wizards**
   - Modify Stage 2 pages to accept `userProfile` prop
   - Pre-fill forms with existing data
   - Don't ask for CV again in Researcher wizard

2. **Fix `onboarding_step` tracking**
   - Update step number on each navigation
   - Enable resume functionality

3. **Create missing storage buckets**
   - `cv-uploads` with proper RLS
   - `avatars` with public read access

4. **Add `selected_persona` to user_profiles**
   - Track chosen persona before role approval

### 7.2 Medium Priority

5. **Verify/create persona-specific tables**
   - `researcher_profiles`
   - `expert_profiles`
   - Update `providers` table structure

6. **Add foreign key relationships**
   - `user_profiles.city_id` → `cities.id`
   - Add `region_id` column to user_profiles

7. **Add Stage 2 analytics**
   - Import `useOnboardingAnalytics` in all Stage 2 wizards
   - Track step progress and completions

### 7.3 Low Priority

8. **Add avatar upload to wizard**
9. **Add social links collection**
10. **Add profile visibility settings**

---

## 8. Data Flow Diagram (Current vs Expected)

### Current (Broken) Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CURRENT FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stage 1 (OnboardingWizard)                                     │
│  ┌─────────────────────────────┐                               │
│  │ Collects: name, bio, CV,    │──────► user_profiles          │
│  │ expertise, location, etc.   │        (saved correctly)      │
│  └─────────────────────────────┘                               │
│              │                                                  │
│              │ (NO DATA PASSED)                                 │
│              ▼                                                  │
│  Stage 2 (Persona Wizard)                                       │
│  ┌─────────────────────────────┐                               │
│  │ Asks SAME questions again!  │──────► persona_profiles       │
│  │ CV upload repeated          │        (separate record)      │
│  │ No pre-fill                 │                               │
│  └─────────────────────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Expected (Fixed) Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXPECTED FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stage 1 (OnboardingWizard)                                     │
│  ┌─────────────────────────────┐                               │
│  │ Collects: name, bio, CV,    │──────► user_profiles          │
│  │ expertise, location, etc.   │        (saved correctly)      │
│  │ + selected_persona          │                               │
│  └─────────────────────────────┘                               │
│              │                                                  │
│              │ userProfile prop                                 │
│              │ (ALL DATA PASSED)                                │
│              ▼                                                  │
│  Stage 2 (Persona Wizard)                                       │
│  ┌─────────────────────────────┐                               │
│  │ Pre-fills from Stage 1      │──────► user_profiles UPDATE   │
│  │ Only asks NEW questions     │        + persona_profiles     │
│  │ Shows extracted CV data     │        (linked by user_id)    │
│  └─────────────────────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Action Items Checklist

- [ ] Add `selected_persona` column to `user_profiles`
- [ ] Add `persona_onboarding_completed` column
- [ ] Modify Stage 2 wizards to accept props
- [ ] Pre-fill Stage 2 forms from `userProfile`
- [ ] Remove duplicate CV upload from ResearcherWizard
- [ ] Create `cv-uploads` storage bucket with RLS
- [ ] Create `avatars` storage bucket
- [ ] Verify `researcher_profiles` table exists
- [ ] Add foreign keys to `user_profiles`
- [ ] Update `onboarding_step` on navigation
- [ ] Add analytics to Stage 2 wizards
- [ ] Fix StartupOnboardingWizard to use Supabase
- [ ] Add municipality_id collection for municipality_staff

---

## Related Documents

- [Phase 1: Registration & Authentication](./VALIDATION_PLAN_PHASE1_REGISTRATION.md)
- [Phase 2: Main Onboarding Wizard](./VALIDATION_PLAN_PHASE2_MAIN_ONBOARDING.md)
- [Onboarding Flow Tracking](../ONBOARDING_FLOW_TRACKING.md)
