# Onboarding Flow - Implementation Tracking

## Comprehensive Flow Diagram

```mermaid
flowchart TB
    subgraph ENTRY["🚪 Entry Points"]
        E1[Email Signup]
        E2[Google OAuth]
        E3[Invited by Admin]
    end

    subgraph AUTH["🔐 Authentication"]
        A1[Auth Page]
        A2[Email Verification]
        A3[Session Created]
    end

    subgraph PROFILE_CHECK["📋 Profile Check"]
        PC1{Profile Exists?}
        PC2{Onboarding Complete?}
        PC3[Create Profile Record]
    end

    subgraph ONBOARDING["✨ Onboarding Wizard - 6 Steps"]
        OW1[Step 1: Welcome<br/>Platform intro + benefits]
        OW2[Step 2: Import<br/>CV Upload + LinkedIn + AI Extraction]
        OW3[Step 3: Profile<br/>Name, Title, Org, Bio]
        OW4[Step 4: AI Assist<br/>Bio/Role/Expertise suggestions]
        OW5[Step 5: Role Selection<br/>Persona + Expertise Areas]
        OW6[Step 6: Complete<br/>Redirect to Specialized Wizard]
    end

    subgraph PERSONAS["👥 Persona Selection"]
        P1[🏛️ Municipality Staff]
        P2[🚀 Solution Provider/Startup]
        P3[🔬 Researcher/Academic]
        P4[👥 Citizen/Community]
        P5[🎓 Expert/Evaluator]
        P6[👁️ Explorer/Observer]
    end

    subgraph SPECIALIZED_ONBOARDING["🎯 Specialized Wizards - AUTO TRIGGERED"]
        SW1[StartupOnboarding<br/>4 steps: Info → Sectors → Challenges → Regions]
        SW2[MunicipalityStaffOnboarding<br/>5 steps: CV → Municipality → Department → Role → Complete]
        SW3[ResearcherOnboarding<br/>5 steps: CV → Institution → Research → Links → Complete]
        SW4[CitizenOnboarding<br/>4 steps: Location → Interests → Notifications → Complete]
        SW5[ExpertOnboarding<br/>CV Upload + AI Extraction + Expertise Areas]
    end

    subgraph COMPLETION["✅ Completion"]
        C1[Save Profile<br/>onboarding_completed=true]
        C2[Auto-Role Assignment<br/>Based on email/org]
        C3[Role-Based Redirect]
    end

    subgraph LANDING_PAGES["🏠 Role-Based Landing Pages"]
        LP1[AdminDashboard]
        LP2[MunicipalityDashboard]
        LP3[StartupDashboard]
        LP4[ResearcherDashboard]
        LP5[CitizenDashboard]
        LP6[Home/Explorer]
    end

    subgraph POST_ONBOARDING["📊 Post-Onboarding Integration"]
        PO1[FirstActionRecommender<br/>✅ Integrated in dashboards]
        PO2[ProfileCompletenessCoach<br/>✅ Integrated in dashboards]
        PO3[Achievement Badges]
        PO4[AI Profile Suggestions]
    end

    E1 --> A1
    E2 --> A1
    E3 --> A1
    A1 --> A2
    A2 --> A3
    A3 --> PC1
    
    PC1 -->|No| PC3
    PC1 -->|Yes| PC2
    PC3 --> OW1
    PC2 -->|No| OW1
    PC2 -->|Yes| C3

    OW1 --> OW2
    OW2 --> OW3
    OW3 --> OW4
    OW4 --> OW5
    OW5 --> OW6

    OW5 --> P1 & P2 & P3 & P4 & P5 & P6

    P1 -->|Auto redirect| SW2
    P2 -->|Auto redirect| SW1
    P3 -->|Auto redirect| SW3
    P4 -->|Auto redirect| SW4
    P5 -->|Auto redirect| SW5
    P6 --> C1

    SW1 --> C1
    SW2 --> C1
    SW3 --> C1
    SW4 --> C1
    SW5 --> C1

    C1 --> C2
    C2 --> C3

    C3 -->|admin| LP1
    C3 -->|municipality| LP2
    C3 -->|provider/startup| LP3
    C3 -->|researcher| LP4
    C3 -->|citizen| LP5
    C3 -->|viewer| LP6

    LP1 & LP2 & LP3 & LP4 & LP5 & LP6 --> PO1
    PO1 --> PO2
```

---

## ✅ ALL COMPONENTS IMPLEMENTED

### Personas & Their Journeys

| Persona | Landing Page | Specialized Wizard | Page Route | Status |
|---------|--------------|-------------------|------------|--------|
| Municipality Staff | MunicipalityDashboard | MunicipalityStaffOnboarding | `/municipality-staff-onboarding` | ✅ Complete |
| Solution Provider | StartupDashboard | StartupOnboarding | `/startup-onboarding` | ✅ Complete |
| Researcher/Academic | ResearcherDashboard | ResearcherOnboarding | `/researcher-onboarding` | ✅ Complete |
| Citizen/Community | CitizenDashboard | CitizenOnboarding | `/citizen-onboarding` | ✅ Complete |
| Expert/Evaluator | ExpertDashboard | ExpertOnboarding | `/expert-onboarding` | ✅ Complete |
| Explorer/Observer | Home | - | - | ✅ Complete |

---

### Component Status

| Component | Path | Status | Features |
|-----------|------|--------|----------|
| OnboardingWizard | `src/components/onboarding/OnboardingWizard.jsx` | ✅ Complete | 6-step wizard, CV upload, LinkedIn import, AI extraction, **Auto-routes to specialized wizard for all 5 personas** |
| MunicipalityStaffOnboardingWizard | `src/components/onboarding/MunicipalityStaffOnboardingWizard.jsx` | ✅ Complete | 5-step: CV → Municipality → Department → Role → Complete |
| ResearcherOnboardingWizard | `src/components/onboarding/ResearcherOnboardingWizard.jsx` | ✅ Complete | 5-step: CV → Institution → Research → Links → Complete |
| CitizenOnboardingWizard | `src/components/onboarding/CitizenOnboardingWizard.jsx` | ✅ Complete | 4-step: Location → Interests → Notifications → Complete |
| StartupOnboardingWizard | `src/components/startup/StartupOnboardingWizard.jsx` | ✅ Complete | 4-step flow, sectors, challenges, regions |
| ExpertOnboarding | `src/pages/ExpertOnboarding.jsx` | ✅ Complete | CV upload, AI extraction, expertise areas |

### Page Routes

| Page | Path | Redirects To | Status |
|------|------|--------------|--------|
| MunicipalityStaffOnboarding | `src/pages/MunicipalityStaffOnboarding.jsx` | MunicipalityDashboard | ✅ Complete |
| ResearcherOnboarding | `src/pages/ResearcherOnboarding.jsx` | ResearcherDashboard | ✅ Complete |
| CitizenOnboarding | `src/pages/CitizenOnboarding.jsx` | CitizenDashboard | ✅ Complete |
| StartupOnboarding | `src/pages/StartupOnboarding.jsx` | StartupDashboard | ✅ Complete |
| ExpertOnboarding | `src/pages/ExpertOnboarding.jsx` | ExpertDashboard | ✅ Complete |
| ResearcherDashboard | `src/pages/ResearcherDashboard.jsx` | - | ✅ Complete |

### Dashboard Integrations

| Dashboard | FirstActionRecommender | ProfileCompletenessCoach | Status |
|-----------|----------------------|------------------------|--------|
| ResearcherDashboard | ✅ Integrated | ✅ Integrated | ✅ Complete |
| CitizenDashboard | ✅ Integrated | ✅ Integrated | ✅ Complete |
| MunicipalityDashboard | Existing | Existing | ✅ Complete |
| StartupDashboard | Existing | Existing | ✅ Complete |

---

## Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| user_profiles | Main user profile with cv_url, linkedin_url, city_id, work_phone, extracted_data, onboarding_completed_at | ✅ Enhanced |
| municipality_staff_profiles | Municipality staff extended data | ✅ Created |
| citizen_profiles | Citizen extended data | ✅ Exists |
| researcher_profiles | Researcher extended data | ✅ Exists |
| startup_profiles | Startup extended data | ✅ Exists |
| expert_profiles | Expert extended data | ✅ Exists |

---

## AI Features in Onboarding

| Feature | Status | Description |
|---------|--------|-------------|
| CV Data Extraction | ✅ Complete | All wizards use `base44.integrations.Core.ExtractDataFromUploadedFile` |
| LinkedIn Profile Analysis | ✅ Complete | Main wizard uses LLM for profile suggestions |
| AI Bio Generation | ✅ Complete | Bilingual bio generation |
| AI Role Suggestion | ✅ Complete | Persona recommendation based on profile |
| AI Expertise Suggestions | ✅ Complete | Relevant expertise areas |

---

## Flow Logic

### OnboardingWizard Completion Logic
```javascript
// After Step 6, the wizard checks persona and routes accordingly:
const needsSpecializedWizard = (persona) => {
  return ['municipality_staff', 'provider', 'researcher', 'citizen', 'expert'].includes(persona);
};

const getSpecializedWizardPage = (persona) => {
  const wizardMap = {
    municipality_staff: 'MunicipalityStaffOnboarding',
    provider: 'StartupOnboarding',
    researcher: 'ResearcherOnboarding',
    citizen: 'CitizenOnboarding',
    expert: 'ExpertOnboarding'
  };
  return wizardMap[persona] || null;
};
```

### Specialized Wizard Completion
Each specialized wizard:
1. Saves to both `user_profiles` AND persona-specific table
2. Sets `onboarding_completed = true`
3. Redirects to role-specific dashboard

---

## Testing Checklist

### Core Flow
- [x] Email signup → OnboardingWizard → Persona selection
- [x] CV upload extracts data correctly
- [x] LinkedIn URL triggers AI analysis
- [x] AI suggestions generate properly
- [x] Persona selection routes to specialized wizard

### Specialized Wizards
- [x] Municipality Staff → MunicipalityStaffOnboarding → MunicipalityDashboard
- [x] Provider/Startup → StartupOnboarding → StartupDashboard
- [x] Researcher → ResearcherOnboarding → ResearcherDashboard
- [x] Citizen → CitizenOnboarding → CitizenDashboard
- [x] Expert → ExpertOnboarding → ExpertDashboard
- [x] Explorer/Viewer → Direct to Home

### Dashboard Integrations
- [x] ResearcherDashboard has FirstActionRecommender + ProfileCompletenessCoach
- [x] CitizenDashboard has FirstActionRecommender + ProfileCompletenessCoach

---

## Remaining Nice-to-Haves

| Item | Priority | Status |
|------|----------|--------|
| SmartWelcomeEmail trigger on completion | Low | Not triggered automatically |
| OnboardingAnalytics tracking | Low | Component exists but not collecting |
| A/B Testing framework | Low | Not implemented |
| Progressive profiling | Low | Not implemented |

---

*Last Updated: 2025-12-09*
*Status: ✅ ALL CRITICAL ITEMS IMPLEMENTED*
