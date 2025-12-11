// Force cache invalidation: 1765466913208
import { usePermissions } from '@/components/permissions/usePermissions';

/**
 * Hook to determine the appropriate dashboard and navigation for a user based on their persona/role
 */
export function usePersonaRouting() {
  const permissions = usePermissions();
  
  // Handle case where permissions haven't loaded yet
  const { 
    isAdmin = false, 
    roles = [], 
    hasPermission = () => false,
    isDeputyship = false,
    isMunicipality = false,
    isNationalEntity = false,
    hasAnyPermission = () => false
  } = permissions || {};

  // Determine persona config based on roles
  let personaConfig;
  
  // Platform Admin
  if (isAdmin || roles.includes('admin')) {
    personaConfig = {
      persona: 'admin',
      defaultDashboard: '/home',
      dashboardLabel: { en: 'Admin Dashboard', ar: 'لوحة المدير' },
      onboardingWizard: null,
      portalType: 'admin',
    };
  }
  // Executive / GDISB Leadership
  else if (hasAnyPermission(['view_all_dashboards', 'approve_strategic_initiatives', 'strategy_manage'])) {
    personaConfig = {
      persona: 'executive',
      defaultDashboard: '/executive-dashboard',
      dashboardLabel: { en: 'Executive Dashboard', ar: 'اللوحة التنفيذية' },
      onboardingWizard: 'DeputyshipOnboarding',
      portalType: 'executive',
    };
  }
  // Deputyship (National entity with sector focus)
  else if (isDeputyship || isNationalEntity) {
    personaConfig = {
      persona: 'deputyship',
      defaultDashboard: '/executive-dashboard',
      dashboardLabel: { en: 'Deputyship Dashboard', ar: 'لوحة الوكالة' },
      onboardingWizard: 'DeputyshipOnboarding',
      portalType: 'deputyship',
    };
  }
  // Municipality Staff
  else if (isMunicipality || roles.some(r => r.includes('municipality'))) {
    personaConfig = {
      persona: 'municipality',
      defaultDashboard: '/municipality-dashboard',
      dashboardLabel: { en: 'Municipality Dashboard', ar: 'لوحة البلدية' },
      onboardingWizard: 'MunicipalityStaffOnboarding',
      portalType: 'municipality',
    };
  }
  // Provider/Startup
  else if (hasAnyPermission(['solution_create', 'solution_edit_own', 'provider_dashboard']) || 
      roles.some(r => r.includes('provider') || r.includes('startup'))) {
    personaConfig = {
      persona: 'provider',
      defaultDashboard: '/startup-dashboard',
      dashboardLabel: { en: 'Provider Dashboard', ar: 'لوحة المزود' },
      onboardingWizard: 'StartupOnboarding',
      portalType: 'provider',
    };
  }
  // Expert/Evaluator
  else if (hasAnyPermission(['expert_evaluate', 'expert_view_assignments']) || 
      roles.some(r => r.includes('expert') || r.includes('evaluator'))) {
    personaConfig = {
      persona: 'expert',
      defaultDashboard: '/expert-dashboard',
      dashboardLabel: { en: 'Expert Dashboard', ar: 'لوحة الخبير' },
      onboardingWizard: 'ExpertOnboarding',
      portalType: 'expert',
    };
  }
  // Researcher
  else if (hasAnyPermission(['rd_project_create', 'rd_proposal_view_all']) || 
      roles.some(r => r.includes('researcher'))) {
    personaConfig = {
      persona: 'researcher',
      defaultDashboard: '/researcher-dashboard',
      dashboardLabel: { en: 'Research Dashboard', ar: 'لوحة البحث' },
      onboardingWizard: 'ResearcherOnboarding',
      portalType: 'researcher',
    };
  }
  // Citizen - users with citizen role
  else if (hasAnyPermission(['citizen_idea_submit', 'citizen_dashboard_view']) || 
      roles.some(r => r === 'citizen')) {
    personaConfig = {
      persona: 'citizen',
      defaultDashboard: '/citizen-dashboard',
      dashboardLabel: { en: 'Citizen Dashboard', ar: 'لوحة المواطن' },
      onboardingWizard: 'CitizenOnboarding',
      portalType: 'citizen',
    };
  }
  // Viewer - users with viewer role (browse-only access)
  else if (roles.some(r => r === 'viewer')) {
    personaConfig = {
      persona: 'viewer',
      defaultDashboard: '/viewer-dashboard',
      dashboardLabel: { en: 'Visitor Dashboard', ar: 'لوحة الزائر' },
      onboardingWizard: null,
      portalType: 'viewer',
    };
  }
  // Default fallback for authenticated users without roles - treat as citizen
  else {
    personaConfig = {
      persona: 'user',
      defaultDashboard: '/citizen-dashboard',
      dashboardLabel: { en: 'Dashboard', ar: 'لوحة التحكم' },
      onboardingWizard: 'Onboarding',
      portalType: 'citizen',
    };
  }

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
    isAdmin,
    isDeputyship,
    isMunicipality,
    isNationalEntity,
  };
}

export default usePersonaRouting;
