import { usePermissions } from '@/components/permissions/usePermissions.jsx';

/**
 * Hook to determine the appropriate dashboard and navigation for a user based on their persona/role
 */
export function usePersonaRouting() {
  const permissionsData = usePermissions();
  
  // Safely destructure with defaults for when permissions are loading or unavailable
  const { 
    isAdmin = false, 
    roles = [], 
    hasPermission = () => false,
    isDeputyship = false,
    isMunicipality = false,
    isNationalEntity = false,
    hasAnyPermission = () => false
  } = permissionsData || {};

  // Compute persona config without using React hooks (avoids invalid hook call issues)
  const computePersonaConfig = () => {
    // Platform Admin
    if (isAdmin || roles.includes('admin')) {
      return {
        persona: 'admin',
        defaultDashboard: '/admin-portal',
        dashboardLabel: { en: 'Admin Dashboard', ar: 'لوحة المدير' },
        onboardingWizard: null, // Admins don't need onboarding
        portalType: 'admin',
      };
    }

    // Executive / GDISB Leadership
    if (hasAnyPermission(['view_all_dashboards', 'approve_strategic_initiatives', 'strategy_manage'])) {
      return {
        persona: 'executive',
        defaultDashboard: '/executive-dashboard',
        dashboardLabel: { en: 'Executive Dashboard', ar: 'اللوحة التنفيذية' },
        onboardingWizard: 'DeputyshipOnboarding',
        portalType: 'executive',
      };
    }

    // Deputyship (National entity with sector focus)
    if (isDeputyship || isNationalEntity) {
      return {
        persona: 'deputyship',
        defaultDashboard: '/executive-dashboard',
        dashboardLabel: { en: 'Deputyship Dashboard', ar: 'لوحة الوكالة' },
        onboardingWizard: 'DeputyshipOnboarding',
        portalType: 'deputyship',
      };
    }

    // Municipality Staff (all municipality roles including staff)
    if (isMunicipality || roles.some(r => 
      r.includes('municipality') || 
      r === 'municipality_admin' || 
      r === 'municipality_staff' ||
      r === 'municipality_coordinator' ||
      r === 'municipality_manager' ||
      r === 'municipality_director' ||
      r === 'municipality_innovation_officer' ||
      r === 'municipality_viewer'
    )) {
      return {
        persona: 'municipality',
        defaultDashboard: '/municipality-dashboard',
        dashboardLabel: { en: 'Municipality Dashboard', ar: 'لوحة البلدية' },
        onboardingWizard: 'MunicipalityStaffOnboarding',
        portalType: 'municipality',
      };
    }

    // Provider/Startup
    if (hasAnyPermission(['solution_create', 'solution_edit_own', 'provider_dashboard']) || 
        roles.some(r => r.includes('provider') || r.includes('startup'))) {
      return {
        persona: 'provider',
        defaultDashboard: '/startup-dashboard',
        dashboardLabel: { en: 'Provider Dashboard', ar: 'لوحة المزود' },
        onboardingWizard: 'StartupOnboarding',
        portalType: 'provider',
      };
    }

    // Expert/Evaluator
    if (hasAnyPermission(['expert_evaluate', 'expert_view_assignments']) || 
        roles.some(r => r.includes('expert') || r.includes('evaluator'))) {
      return {
        persona: 'expert',
        defaultDashboard: '/expert-dashboard',
        dashboardLabel: { en: 'Expert Dashboard', ar: 'لوحة الخبير' },
        onboardingWizard: 'ExpertOnboarding',
        portalType: 'expert',
      };
    }

    // Researcher
    if (hasAnyPermission(['rd_project_create', 'rd_proposal_view_all']) || 
        roles.some(r => r.includes('researcher'))) {
      return {
        persona: 'researcher',
        defaultDashboard: '/researcher-dashboard',
        dashboardLabel: { en: 'Research Dashboard', ar: 'لوحة البحث' },
        onboardingWizard: 'ResearcherOnboarding',
        portalType: 'researcher',
      };
    }

    // Citizen - users with citizen role
    if (hasAnyPermission(['citizen_idea_submit', 'citizen_dashboard_view']) || 
        roles.some(r => r === 'citizen')) {
      return {
        persona: 'citizen',
        defaultDashboard: '/citizen-dashboard',
        dashboardLabel: { en: 'Citizen Dashboard', ar: 'لوحة المواطن' },
        onboardingWizard: 'CitizenOnboarding',
        portalType: 'citizen',
      };
    }

    // Viewer - users with viewer role (browse-only access)
    if (roles.some(r => r === 'viewer')) {
      return {
        persona: 'viewer',
        defaultDashboard: '/viewer-dashboard',
        dashboardLabel: { en: 'Visitor Dashboard', ar: 'لوحة الزائر' },
        onboardingWizard: null,
        portalType: 'viewer',
      };
    }

    // Default fallback for authenticated users without roles - use /home as fallback
    return {
      persona: 'user',
      defaultDashboard: '/home',
      dashboardLabel: { en: 'Dashboard', ar: 'لوحة التحكم' },
      onboardingWizard: 'Onboarding',
      portalType: 'citizen',
    };
  };

  const personaConfig = computePersonaConfig();

  // Get menu sections visibility based on persona
  const menuVisibility = {
    // Admin-only sections
    showAdminTools: isAdmin,
    showCoverageReports: isAdmin,
    
    // Executive/Deputyship sections
    showExecutiveAnalytics: personaConfig.persona === 'executive' || personaConfig.persona === 'deputyship',
    showNationalOversight: isDeputyship || isNationalEntity || hasPermission('visibility_all_municipalities'),
    showBenchmarking: hasPermission('deputyship_benchmark'),
    showPolicyManagement: hasPermission('deputyship_policy_create'),
    
    // Municipality sections
    showMunicipalityTools: isMunicipality,
    showLocalChallenges: isMunicipality,
    showLocalPilots: isMunicipality,
    
    // Provider sections
    showProviderTools: personaConfig.persona === 'provider',
    showSolutionManagement: hasAnyPermission(['solution_create', 'solution_edit_own']),
    showOpportunities: personaConfig.persona === 'provider',
    
    // Expert sections
    showExpertTools: personaConfig.persona === 'expert',
    showEvaluationQueue: hasPermission('expert_evaluate'),
    
    // Citizen sections
    showCitizenTools: personaConfig.persona === 'citizen',
    showIdeaSubmission: hasPermission('citizen_idea_submit'),
    
    // Common sections
    showInnovationPipeline: hasAnyPermission(['challenge_view_all', 'pilot_view_all', 'challenge_view']),
    showPrograms: true, // Programs are generally visible
    showRDSection: hasAnyPermission(['rd_project_view_all', 'rd_project_create']),
  };

  return {
    ...personaConfig,
    menuVisibility,
    isAdmin: isAdmin || false,
    isDeputyship: isDeputyship || false,
    isMunicipality: isMunicipality || false,
    isNationalEntity: isNationalEntity || false,
  };
}

// Default config for unauthenticated or error states (kept for potential future use)
function getDefaultConfig() {
  return {
    persona: 'guest',
    defaultDashboard: '/citizen-dashboard',
    dashboardLabel: { en: 'Dashboard', ar: 'لوحة التحكم' },
    onboardingWizard: null,
    portalType: 'public',
    menuVisibility: {
      showAdminTools: false,
      showCoverageReports: false,
      showExecutiveAnalytics: false,
      showNationalOversight: false,
      showBenchmarking: false,
      showPolicyManagement: false,
      showMunicipalityTools: false,
      showLocalChallenges: false,
      showLocalPilots: false,
      showProviderTools: false,
      showSolutionManagement: false,
      showOpportunities: false,
      showExpertTools: false,
      showEvaluationQueue: false,
      showCitizenTools: false,
      showIdeaSubmission: false,
      showInnovationPipeline: false,
      showPrograms: true,
      showRDSection: false,
    },
    isAdmin: false,
    isDeputyship: false,
    isMunicipality: false,
    isNationalEntity: false,
  };
}

export default usePersonaRouting;
