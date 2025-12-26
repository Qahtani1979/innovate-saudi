import { usePermissions } from '@/hooks/usePermissions';

// Storage key for active persona
const STORAGE_KEY = 'saudi_innovates_active_persona';

// Persona dashboard mapping
const PERSONA_DASHBOARDS = {
  admin: { dashboard: '/admin-portal', label: { en: 'Admin Dashboard', ar: 'لوحة المدير' }, wizard: null, portal: 'admin' },
  executive: { dashboard: '/executive-dashboard', label: { en: 'Executive Dashboard', ar: 'اللوحة التنفيذية' }, wizard: 'DeputyshipOnboarding', portal: 'executive' },
  deputyship: { dashboard: '/executive-dashboard', label: { en: 'Deputyship Dashboard', ar: 'لوحة الوكالة' }, wizard: 'DeputyshipOnboarding', portal: 'deputyship' },
  municipality: { dashboard: '/municipality-dashboard', label: { en: 'Municipality Dashboard', ar: 'لوحة البلدية' }, wizard: 'MunicipalityStaffOnboarding', portal: 'municipality' },
  provider: { dashboard: '/startup-dashboard', label: { en: 'Provider Dashboard', ar: 'لوحة المزود' }, wizard: 'StartupOnboarding', portal: 'provider' },
  expert: { dashboard: '/expert-dashboard', label: { en: 'Expert Dashboard', ar: 'لوحة الخبير' }, wizard: 'ExpertOnboarding', portal: 'expert' },
  researcher: { dashboard: '/researcher-dashboard', label: { en: 'Research Dashboard', ar: 'لوحة البحث' }, wizard: 'ResearcherOnboarding', portal: 'researcher' },
  citizen: { dashboard: '/citizen-dashboard', label: { en: 'Citizen Dashboard', ar: 'لوحة المواطن' }, wizard: 'CitizenOnboarding', portal: 'citizen' },
  viewer: { dashboard: '/viewer-dashboard', label: { en: 'Visitor Dashboard', ar: 'لوحة الزائر' }, wizard: null, portal: 'viewer' },
  user: { dashboard: '/home', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, wizard: 'Onboarding', portal: 'citizen' },
};

// Role to persona mapping
const ROLE_TO_PERSONA = {
  admin: 'admin',
  executive: 'executive',
  deputyship_admin: 'deputyship',
  deputyship_staff: 'deputyship',
  deputyship: 'deputyship',
  municipality_admin: 'municipality',
  municipality_director: 'municipality',
  municipality_manager: 'municipality',
  municipality_coordinator: 'municipality',
  municipality_staff: 'municipality',
  municipality_innovation_officer: 'municipality',
  municipality_viewer: 'municipality',
  provider_admin: 'provider',
  provider: 'provider',
  startup: 'provider',
  expert: 'expert',
  evaluator: 'expert',
  researcher: 'researcher',
  citizen: 'citizen',
  viewer: 'viewer',
  user: 'user',
};

// Role priority (lower = higher privilege)
const ROLE_PRIORITY = {
  admin: 1, executive: 2, deputyship_admin: 3, deputyship_staff: 4, deputyship: 4,
  municipality_admin: 5, municipality_director: 6, municipality_manager: 7, municipality_coordinator: 8,
  municipality_staff: 9, municipality_innovation_officer: 10, municipality_viewer: 11,
  provider_admin: 12, provider: 13, startup: 13, expert: 14, evaluator: 14,
  researcher: 15, citizen: 16, viewer: 17, user: 18,
};

/**
 * Get active persona from session storage
 */
function getStoredPersona() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.persona;
    }
  } catch (e) {
    // Invalid storage
  }
  return null;
}

/**
 * Hook to determine the appropriate dashboard and navigation for a user based on their persona/role
 * Now supports active persona switching - uses stored persona if valid, otherwise computes from roles
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

  // Get available personas from roles
  const getAvailablePersonas = () => {
    const personas = new Set();
    
    if (isAdmin || roles.includes('admin')) personas.add('admin');
    if (hasAnyPermission(['view_all_dashboards', 'approve_strategic_initiatives', 'strategy_manage'])) personas.add('executive');
    if (isDeputyship || isNationalEntity) personas.add('deputyship');
    if (isMunicipality || roles.some(r => r.includes('municipality'))) personas.add('municipality');
    if (hasAnyPermission(['solution_create', 'solution_edit_own', 'provider_dashboard']) || 
        roles.some(r => r.includes('provider') || r.includes('startup'))) personas.add('provider');
    if (hasAnyPermission(['expert_evaluate', 'expert_view_assignments']) || 
        roles.some(r => r.includes('expert') || r.includes('evaluator'))) personas.add('expert');
    if (hasAnyPermission(['rd_project_create', 'rd_proposal_view_all']) || 
        roles.some(r => r.includes('researcher'))) personas.add('researcher');
    if (hasAnyPermission(['citizen_idea_submit', 'citizen_dashboard_view']) || 
        roles.some(r => r === 'citizen')) personas.add('citizen');
    if (roles.some(r => r === 'viewer')) personas.add('viewer');
    
    return Array.from(personas);
  };

  // Compute primary persona (highest privilege)
  const computePrimaryPersona = () => {
    if (isAdmin || roles.includes('admin')) return 'admin';
    
    // Sort roles by priority and get the highest
    const sortedRoles = [...roles].sort((a, b) => 
      (ROLE_PRIORITY[a] || 99) - (ROLE_PRIORITY[b] || 99)
    );
    
    if (sortedRoles.length > 0) {
      return ROLE_TO_PERSONA[sortedRoles[0]] || 'user';
    }
    
    return 'user';
  };

  const availablePersonas = getAvailablePersonas();
  const primaryPersona = computePrimaryPersona();
  
  // Determine active persona: stored > primary > user
  const getActivePersona = () => {
    const stored = getStoredPersona();
    if (stored && availablePersonas.includes(stored)) {
      return stored;
    }
    return primaryPersona;
  };

  const activePersona = getActivePersona();
  const personaDashboard = PERSONA_DASHBOARDS[activePersona] || PERSONA_DASHBOARDS.user;

  const personaConfig = {
    persona: activePersona,
    defaultDashboard: personaDashboard.dashboard,
    dashboardLabel: personaDashboard.label,
    onboardingWizard: personaDashboard.wizard,
    portalType: personaDashboard.portal,
    // Additional info for multi-role support
    primaryPersona,
    availablePersonas,
    hasMultiplePersonas: availablePersonas.length > 1,
  };

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
