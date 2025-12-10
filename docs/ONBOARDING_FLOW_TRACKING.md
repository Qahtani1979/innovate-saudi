# Onboarding Flow - Complete Implementation Guide

## Overview

The Saudi Innovates platform implements a comprehensive **2-Phase Onboarding System** that guides users through:
1. **Phase 1: General Onboarding** - Profile setup, persona selection (all users)
2. **Phase 2: Specialized Onboarding** - Persona-specific information collection + role request submission

This ensures proper user verification, role-based access control, and a personalized experience for each user type.

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Phase 1** | 6-step OnboardingWizard: welcome, data import, profile, AI assist, persona selection, complete |
| **Phase 2** | Persona-specific wizard collecting role-relevant information |
| **Role Request** | Submission to `role_requests` table for admin approval (most personas) |
| **Auto-Grant** | Citizen role is automatically granted without admin approval |
| **Manual Assignment** | Admin/Executive roles assigned internally, not self-requested |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   Entry      │───▶│   Auth       │───▶│   Profile    │                  │
│  │   Points     │    │   Layer      │    │   Check      │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│         │                   │                   │                          │
│         ▼                   ▼                   ▼                          │
│  • Email Signup       • Supabase Auth    • user_profiles                   │
│  • Google OAuth       • Session Mgmt     • onboarding_completed            │
│  • Admin Invite       • JWT Tokens       • user_roles                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      MAIN ONBOARDING WIZARD (6 Steps)                │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  Step 1: Welcome    │  Platform intro, language selection           │  │
│  │  Step 2: Import     │  CV upload, LinkedIn import (AI extraction)   │  │
│  │  Step 3: Profile    │  Bilingual form, expertise areas              │  │
│  │  Step 4: AI Assist  │  Bio suggestions, persona recommendations     │  │
│  │  Step 5: Role       │  Persona selection, role request              │  │
│  │  Step 6: Complete   │  Summary, welcome email                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                       │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    SPECIALIZED ONBOARDING WIZARDS                    │  │
│  ├──────────┬────────────┬────────────┬───────────┬────────────────────┤  │
│  │ Municipal│ Startup    │ Researcher │ Citizen   │ Expert             │  │
│  │ Staff    │ Provider   │            │           │                    │  │
│  ├──────────┴────────────┴────────────┴───────────┴────────────────────┤  │
│  │  Each collects persona-specific information before dashboard access  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                       │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      ROLE-BASED DASHBOARDS                           │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  + ProfileCompletenessCoach    + FirstActionRecommender              │  │
│  │  + ProgressiveProfilingPrompt  + OnboardingChecklist                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flow Diagram

```mermaid
flowchart TB
    subgraph ENTRY["🚪 Entry Points"]
        E1[Email Signup]
        E2[Google OAuth]
        E3[Invited by Admin]
    end

    subgraph AUTH["🔐 Authentication Layer"]
        A1["/auth - Auth Page"]
        A2{Already Authenticated?}
        A3[Create Session]
        A4[Redirect from location.state]
    end

    subgraph PROFILE_CHECK["👤 Profile Check - AuthContext"]
        PC1[fetchUserProfile]
        PC2[fetchUserRoles]
        PC3{Profile Exists?}
        PC4[createOAuthProfile - for OAuth users]
        PC5{onboarding_completed?}
    end

    subgraph ONBOARDING["✨ OnboardingWizard - 6 Steps"]
        OW1["Step 1: Welcome"]
        OW2["Step 2: Import Data"]
        OW3["Step 3: Profile"]
        OW4["Step 4: AI Assist"]
        OW5["Step 5: Role Selection"]
        OW6["Step 6: Complete"]
    end

    subgraph SPECIALIZED["🎯 Specialized Onboarding"]
        SW1[MunicipalityStaffOnboardingWizard]
        SW2[StartupOnboardingWizard]
        SW3[ResearcherOnboardingWizard]
        SW4[CitizenOnboardingWizard]
        SW5[ExpertOnboardingWizard]
    end

    subgraph DASHBOARDS["📊 Role-Based Dashboards"]
        D1[MunicipalityDashboard]
        D2[StartupDashboard]
        D3[ResearcherDashboard]
        D4[CitizenDashboard]
        D5[ExpertAssignmentQueue]
        D6[AdminPortal]
        D7[Home]
    end

    E1 & E2 & E3 --> A1
    A1 --> A2
    A2 -->|Yes| A4
    A2 -->|No| A3
    A3 --> PC1
    PC1 --> PC2 --> PC3
    PC3 -->|No - OAuth| PC4
    PC4 --> PC5
    PC3 -->|Yes| PC5
    PC5 -->|false| OW1
    PC5 -->|true| A4
    A4 --> D1 & D2 & D3 & D4 & D5 & D6 & D7

    OW1 --> OW2 --> OW3 --> OW4 --> OW5 --> OW6
    OW6 --> SW1 & SW2 & SW3 & SW4 & SW5
    SW1 --> D1
    SW2 --> D2
    SW3 --> D3
    SW4 --> D4
    SW5 --> D5
```

---

## Components Reference

### Core Onboarding Components

| Component | Path | Description |
|-----------|------|-------------|
| OnboardingWizard | `src/components/onboarding/OnboardingWizard.jsx` | Main 6-step wizard with CV/LinkedIn import |
| OnboardingWizardNew | `src/components/onboarding/OnboardingWizardNew.jsx` | Alternative/updated wizard implementation |
| MunicipalityStaffOnboardingWizard | `src/components/onboarding/MunicipalityStaffOnboardingWizard.jsx` | Municipality-specific onboarding |
| ResearcherOnboardingWizard | `src/components/onboarding/ResearcherOnboardingWizard.jsx` | Researcher-specific onboarding |
| CitizenOnboardingWizard | `src/components/onboarding/CitizenOnboardingWizard.jsx` | Citizen-specific onboarding |
| StartupOnboardingWizard | `src/components/startup/StartupOnboardingWizard.jsx` | Startup/provider-specific onboarding |
| ExpertOnboardingWizard | `src/components/onboarding/ExpertOnboardingWizard.jsx` | Expert-specific onboarding with CV extraction |

### Enhancement Components

| Component | Path | Description |
|-----------|------|-------------|
| FirstActionRecommender | `src/components/onboarding/FirstActionRecommender.jsx` | AI-powered action recommendations based on role |
| ProfileCompletenessCoach | `src/components/onboarding/ProfileCompletenessCoach.jsx` | Profile completion tracking with AI suggestions |
| OnboardingChecklist | `src/components/onboarding/OnboardingChecklist.jsx` | Interactive checklist for new users |
| SmartWelcomeEmail | `src/components/onboarding/SmartWelcomeEmail.jsx` | AI-powered welcome email generation |
| OnboardingAnalytics | `src/components/onboarding/OnboardingAnalytics.jsx` | Onboarding metrics dashboard |
| ProgressiveProfilingPrompt | `src/components/onboarding/ProgressiveProfilingPrompt.jsx` | Non-intrusive profile completion prompts |
| ABTestingManager | `src/components/onboarding/ABTestingManager.jsx` | A/B test management UI |
| AIRoleAssigner | `src/components/onboarding/AIRoleAssigner.jsx` | AI-based role suggestion |
| PersonalizedOnboardingWizard | `src/components/onboarding/PersonalizedOnboardingWizard.jsx` | Role-specific step-by-step guide |

### Onboarding Pages

| Page | Path | Description |
|------|------|-------------|
| Onboarding | `src/pages/Onboarding.jsx` | Main onboarding entry point |
| ExpertOnboarding | `src/pages/ExpertOnboarding.jsx` | Expert onboarding page |
| StartupOnboarding | `src/pages/StartupOnboarding.jsx` | Startup onboarding page |
| ResearcherOnboarding | `src/pages/ResearcherOnboarding.jsx` | Researcher onboarding page |
| CitizenOnboarding | `src/pages/CitizenOnboarding.jsx` | Citizen onboarding page |
| MunicipalityStaffOnboarding | `src/pages/MunicipalityStaffOnboarding.jsx` | Municipality staff onboarding page |

---

## Hooks

### useOnboardingAnalytics

Tracks all onboarding events to the `onboarding_events` table.

**Location:** `src/hooks/useOnboardingAnalytics.js`

**Usage:**
```javascript
import { useOnboardingAnalytics } from '@/hooks/useOnboardingAnalytics';

const { 
  trackEvent,
  trackStepStart,
  trackStepComplete,
  trackOnboardingComplete,
  trackWizardOpened,
  trackWizardAbandoned,
  trackCVUploaded,
  trackLinkedInImported,
  trackAISuggestionApplied,
  trackPersonaSelected
} = useOnboardingAnalytics();

// Track step start with duration calculation
trackStepStart(1, 'welcome');

// Track step completion (auto-calculates duration)
trackStepComplete(1, 'welcome', { language_selected: 'en' });

// Track onboarding completion
trackOnboardingComplete('municipality_staff', { profile_completion: 85 });
```

**Events Tracked:**

| Event | Method | Description |
|-------|--------|-------------|
| `wizard_opened` | `trackWizardOpened(source)` | Wizard was opened |
| `step_started` | `trackStepStart(stepNumber, stepName)` | User started a step |
| `step_completed` | `trackStepComplete(stepNumber, stepName, data)` | User completed a step |
| `wizard_abandoned` | `trackWizardAbandoned(step, stepName, reason)` | User left without completing |
| `cv_uploaded` | `trackCVUploaded(fileType, extractedFields)` | CV file uploaded |
| `linkedin_imported` | `trackLinkedInImported(fieldsExtracted)` | LinkedIn data imported |
| `ai_suggestion_applied` | `trackAISuggestionApplied(type)` | AI suggestion was applied |
| `persona_selected` | `trackPersonaSelected(persona)` | User selected a persona |
| `onboarding_completed` | `trackOnboardingComplete(persona, data)` | Onboarding finished |

### useABTesting

Handles A/B test variant assignment and conversion tracking.

**Location:** `src/hooks/useABTesting.js`

**Usage:**
```javascript
import { useABTesting } from '@/hooks/useABTesting';

const { variant, trackConversion, isLoading } = useABTesting('onboarding_flow_test');

// Render based on variant
if (variant === 'A') {
  return <ClassicOnboarding />;
} else {
  return <NewOnboarding />;
}

// Track conversion
trackConversion('onboarding_completed', { time_taken: 120 });
```

---

## Edge Functions

### send-welcome-email

**Path:** `supabase/functions/send-welcome-email/index.ts`

**Purpose:** Sends persona-specific bilingual welcome emails via Resend API.

**Trigger:** Called from OnboardingWizard on completion.

**Request:**
```typescript
{
  userEmail: string;
  userName: string;
  persona: 'municipality_staff' | 'provider' | 'researcher' | 'citizen' | 'expert' | 'viewer';
  language?: 'en' | 'ar';
}
```

**Response:**
```typescript
{
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Features:**
- Bilingual content (English/Arabic)
- Persona-specific welcome messages
- Role-specific action items
- Platform introduction

---

## Database Schema

### user_profiles

Primary table for user profile data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Auth user ID reference |
| `user_email` | text | User email |
| `full_name` | text | Full name (legacy) |
| `full_name_en` | text | Full name in English |
| `full_name_ar` | text | Full name in Arabic |
| `job_title` | text | Job title (legacy) |
| `job_title_en` | text | Job title in English |
| `job_title_ar` | text | Job title in Arabic |
| `bio` | text | Bio (legacy) |
| `bio_en` | text | Bio in English |
| `bio_ar` | text | Bio in Arabic |
| `title_en` | text | Title in English |
| `title_ar` | text | Title in Arabic |
| `organization_id` | uuid | Organization reference |
| `organization_en` | text | Organization in English |
| `organization_ar` | text | Organization in Arabic |
| `department` | text | Department (legacy) |
| `department_en` | text | Department in English |
| `department_ar` | text | Department in Arabic |
| `municipality_id` | uuid | Municipality reference |
| `city_id` | uuid | City reference |
| `mobile_number` | text | Mobile phone number |
| `mobile_country_code` | text | Country code (e.g., +966) |
| `phone_number` | text | Phone number (legacy) |
| `work_phone` | text | Work phone |
| `national_id` | text | Saudi National ID/Iqama |
| `date_of_birth` | date | Date of birth |
| `gender` | text | Gender |
| `education_level` | text | Education level |
| `degree` | text | Degree name |
| `location_city` | text | City |
| `location_region` | text | Region |
| `preferred_language` | text | Display language preference |
| `timezone` | text | User timezone |
| `expertise_areas` | text[] | Selected expertise areas |
| `skills` | text[] | Skills |
| `interests` | text[] | Interests |
| `linkedin_url` | text | LinkedIn profile URL |
| `cv_url` | text | Uploaded CV URL |
| `avatar_url` | text | Profile avatar URL |
| `cover_image_url` | text | Cover image URL |
| `onboarding_completed` | boolean | Whether onboarding is complete |
| `onboarding_completed_at` | timestamp | When onboarding was completed |
| `profile_completion_percentage` | integer | Profile completion score |
| `extracted_data` | jsonb | Data extracted from CV/LinkedIn |
| `languages` | jsonb | Languages spoken |
| `certifications` | jsonb | Professional certifications |
| `work_experience` | jsonb | Work experience |
| `years_experience` | integer | Years of experience |
| `social_links` | jsonb | Social media links |
| `contact_preferences` | jsonb | Contact preferences |
| `notification_preferences` | jsonb | Notification settings |
| `visibility_settings` | jsonb | Profile visibility |
| `achievement_badges` | jsonb | Earned badges |
| `contribution_count` | integer | Contribution count |
| `is_active` | boolean | Active status |
| `is_public` | boolean | Public profile |
| `verified` | boolean | Verified status |
| `last_profile_update` | timestamp | Last update time |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last modified |

> **Note:** The schema has both legacy fields (e.g., `full_name`, `job_title`) and bilingual fields (e.g., `full_name_en`, `full_name_ar`). Use bilingual fields for new implementations.

### onboarding_events

Analytics table for tracking onboarding events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | User ID |
| `user_email` | text | User email |
| `event_type` | text | Event type |
| `event_data` | jsonb | Additional event data |
| `step_number` | integer | Current step number |
| `step_name` | text | Step name |
| `persona` | text | Selected persona |
| `duration_seconds` | integer | Time spent on step |
| `created_at` | timestamp | Event timestamp |

### role_requests

Pending role upgrade requests.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Requesting user ID |
| `requested_role` | text | Role being requested |
| `justification` | text | User's justification |
| `status` | text | pending/approved/rejected |
| `reviewed_by` | text | Admin who reviewed |
| `reviewed_at` | timestamp | Review timestamp |
| `created_at` | timestamp | Request timestamp |

### ab_experiments

A/B test definitions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Experiment name |
| `description` | text | Experiment description |
| `variants` | jsonb | Variant definitions |
| `allocation_percentages` | jsonb | Traffic allocation |
| `status` | text | active/paused/completed |
| `start_date` | timestamp | Start date |
| `end_date` | timestamp | End date |

### ab_assignments

User variant assignments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `experiment_id` | uuid | Experiment ID |
| `user_id` | uuid | User ID |
| `user_email` | text | User email |
| `variant` | text | Assigned variant |
| `assigned_at` | timestamp | Assignment timestamp |

### ab_conversions

Conversion tracking for A/B tests.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `assignment_id` | uuid | Assignment ID |
| `experiment_id` | uuid | Experiment ID |
| `user_id` | uuid | User ID |
| `conversion_type` | text | Type of conversion |
| `conversion_value` | numeric | Conversion value |
| `metadata` | jsonb | Additional metadata |
| `created_at` | timestamp | Conversion timestamp |

---

## Profile Completion Calculation

```javascript
const calculateProfileCompletion = (data) => {
  let score = 0;
  
  // Core fields (50 points)
  if (data.full_name_en || data.full_name_ar) score += 15;
  if (data.full_name_en && data.full_name_ar) score += 5; // Bonus for bilingual
  if (data.job_title_en || data.job_title_ar) score += 10;
  if (data.bio_en || data.bio_ar) score += 10;
  if (data.selectedPersona) score += 15;
  
  // Professional (25 points)
  if (data.expertise_areas?.length > 0) score += 10;
  if (data.cv_url || data.linkedin_url) score += 10;
  if (data.years_of_experience > 0) score += 5;
  
  // Personal (25 points)
  if (data.mobile_number) score += 5;
  if (data.national_id) score += 5;
  if (data.education_level) score += 5;
  if (data.location_city || data.location_region) score += 5;
  if (data.languages?.length > 0) score += 5;
  
  return Math.min(score, 100);
};
```

---

## Field Validations

| Field | Validation | Format |
|-------|------------|--------|
| Mobile Number | 7-15 digits | International format with country code |
| National ID | 10 digits | Starts with 1 or 2 (Saudi format) |
| Date of Birth | Age 13-100 | Valid date |
| LinkedIn URL | URL pattern | `linkedin.com/in/...` or `linkedin.com/company/...` |
| Email | Valid email | Standard email format |

---

## Persona to Wizard/Dashboard Mapping

| Persona | Specialized Wizard | Landing Dashboard | Notes |
|---------|-------------------|-------------------|-------|
| `municipality_staff` | MunicipalityStaffOnboardingWizard | MunicipalityDashboard | |
| `provider` | StartupOnboardingWizard | StartupDashboard | |
| `researcher` | ResearcherOnboardingWizard | ResearcherDashboard | Also see `AcademiaDashboard` for R&D-focused view |
| `citizen` | CitizenOnboardingWizard | CitizenDashboard | |
| `expert` | ExpertOnboardingWizard | ExpertAssignmentQueue | |
| `viewer` | None (skip) | Home | |
| `admin` | None | AdminPortal | Manual assignment only |

---

## Portals Reference

The platform uses **Portals** as role-specific landing hubs accessible via the PortalSwitcher component.

### Available Portals (PortalSwitcher.jsx)

| Portal | Page | Required Roles |
|--------|------|----------------|
| Executive | `ExecutiveDashboard` | Executive Leadership, Super Admin |
| Admin | `AdminPortal` | Super Admin, Platform Administrator, GDISB Strategy Lead |
| Municipality | `MunicipalityDashboard` | Municipality Director, Municipality Innovation Officer |
| Startup | `StartupDashboard` | Startup/Provider, Solution Provider |
| Academia | `AcademiaDashboard` | Researcher/Academic, Research Lead |
| Program Operator | `ProgramOperatorPortal` | Program Operator |
| Public | `PublicPortal` | (Available to all) |

### Additional Operator Portals (not in PortalSwitcher)

| Portal | Page | Required Permission |
|--------|------|---------------------|
| Sandbox Operator | `SandboxOperatorPortal` | `sandbox_manage` |
| Living Lab Operator | `LivingLabOperatorPortal` | `livinglab_manage` |

---

## Dashboard Integrations

Each dashboard includes post-onboarding enhancement components:

| Dashboard | ProfileCompletenessCoach | FirstActionRecommender | ProgressiveProfilingPrompt |
|-----------|--------------------------|------------------------|----------------------------|
| MunicipalityDashboard | ✅ | ✅ | ✅ |
| StartupDashboard | ✅ | ✅ | ✅ |
| ResearcherDashboard | ✅ | ✅ | - |
| CitizenDashboard | ✅ | ✅ | - |
| ExpertAssignmentQueue | - | - | - |
| AcademiaDashboard | - | - | - |
| AdminPortal | - | - | - |

> **Note:** `ProviderDashboard` referenced in code is an alias - actual page is `StartupDashboard.jsx`.
> **Note:** `ExpertDashboard` referenced in code doesn't exist - should route to `ExpertAssignmentQueue`.
> **Note:** `AdminDashboard` referenced in code doesn't exist - should route to `AdminPortal`.

---

## Testing Checklist

### Flow Tests

- [ ] **New Email User:** Auth → OnboardingWizard → Specialized Wizard → Dashboard
- [ ] **OAuth User:** Google Auth → Profile Auto-created → OnboardingWizard → Dashboard
- [ ] **Returning User:** Auth → Skip Wizard → Dashboard (if `onboarding_completed = true`)
- [ ] **Skip Wizard:** Skip button → `onboarding_completed = true` → Home
- [ ] **Role Request:** Select persona → Request role → Pending in `role_requests`

### Feature Tests

- [ ] CV upload extracts profile data via `extract-file-data` edge function
- [ ] LinkedIn URL analysis works via `invoke-llm` edge function
- [ ] AI suggestions generate correctly (bio, persona, expertise, tips)
- [ ] Welcome email sends on completion via `send-welcome-email` edge function
- [ ] Analytics events tracked to `onboarding_events` table
- [ ] A/B testing assigns users to variants correctly
- [ ] Progressive profiling prompts appear for incomplete profiles
- [ ] ProfileCompletenessCoach shows accurate percentage

### Edge Cases

- [ ] Network errors handled gracefully with toast messages
- [ ] Form validation prevents proceeding without required fields
- [ ] Duplicate email signup shows appropriate error
- [ ] Session timeout redirects to auth page

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Main OnboardingWizard | ✅ Complete | 6-step wizard with CV/LinkedIn import |
| MunicipalityStaffOnboardingWizard | ✅ Complete | Municipality selection, department details |
| StartupOnboardingWizard | ✅ Complete | Company details, solution categories |
| ResearcherOnboardingWizard | ✅ Complete | Institution, research areas |
| CitizenOnboardingWizard | ✅ Complete | Location, interests |
| ExpertOnboardingWizard | ✅ Complete | Expertise, certifications, rates |
| Welcome Email | ✅ Complete | Bilingual, persona-specific |
| Analytics Tracking | ✅ Complete | useOnboardingAnalytics hook |
| A/B Testing | ✅ Complete | useABTesting hook + ABTestingManager |
| ProfileCompletenessCoach | ✅ Integrated | In all role dashboards |
| FirstActionRecommender | ✅ Integrated | In all role dashboards |
| ProgressiveProfilingPrompt | ✅ Integrated | In Municipality/Provider/Startup dashboards |
| OnboardingChecklist | ✅ Integrated | In UserManagementHub |

---

## Known Issues & Code Discrepancies

| Issue | Location | Severity | Description | Recommended Fix |
|-------|----------|----------|-------------|-----------------|
| ExpertDashboard doesn't exist | `OnboardingWizard.jsx:103` | Medium | Expert persona has `landingPage: 'ExpertDashboard'` but page doesn't exist | Change to `ExpertAssignmentQueue` |
| AdminDashboard doesn't exist | `OnboardingWizard.jsx:405`, `Onboarding.jsx:50` | Medium | Admin routing references `AdminDashboard` but actual page is `AdminPortal.jsx` | Change to `AdminPortal` |
| ProviderDashboard alias | `OnboardingWizard.jsx:81` | Low | References `ProviderDashboard` which doesn't exist as a file - routes to `StartupDashboard.jsx` | Working as intended but could add explicit alias |
| Duplicate researcher dashboards | `src/pages/` | Low | Both `ResearcherDashboard.jsx` and `AcademiaDashboard.jsx` exist | `ResearcherDashboard` = personal, `AcademiaDashboard` = R&D portal |

---

*Last Updated: 2025-12-10*
*Validation Status: ✅ DEEP VALIDATED against codebase with all menu/portal links verified*
