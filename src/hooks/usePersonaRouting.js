import { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';

/**
 * usePersonaRouting
 *
 * Lightweight persona + default-dashboard resolver that depends ONLY on AuthContext
 * (user roles), not on the heavier permissions hook. This avoids cascading
 * issues between public and authenticated pages while keeping behavior
 * consistent for logged-in users.
 */
export function usePersonaRouting() {
  const auth = useAuth?.();

  // Graceful fallback if hook is ever used outside provider (should not happen)
  if (!auth) {
    return {
      persona: 'guest',
      defaultDashboard: '/citizen-dashboard',
      dashboardLabel: { en: 'Dashboard', ar: 'لوحة التحكم' },
      onboardingWizard: null,
      portalType: 'public',
      menuVisibility: {},
      isAdmin: false,
      isDeputyship: false,
      isMunicipality: false,
      isNationalEntity: false,
    };
  }

  const { userRoles = [], isAdmin: isAdminFn } = auth;

  const roles = useMemo(
    () => (userRoles || []).map((r) => r.role).filter(Boolean),
    [userRoles]
  );

  const isAdmin = !!(isAdminFn?.() || roles.includes('admin'));
  const isDeputyship = roles.some((r) => r.startsWith('deputyship_'));
  const isMunicipality = roles.some((r) => r.startsWith('municipality_'));
  const isNationalEntity = roles.includes('national_entity');

  const personaConfig = useMemo(() => {
    if (isAdmin) {
      return {
        persona: 'admin',
        defaultDashboard: '/home',
        dashboardLabel: { en: 'Admin Dashboard', ar: 'لوحة المدير' },
        onboardingWizard: null,
        portalType: 'admin',
      };
    }

    if (isDeputyship || isNationalEntity) {
      return {
        persona: 'deputyship',
        defaultDashboard: '/executive-dashboard',
        dashboardLabel: { en: 'Deputyship Dashboard', ar: 'لوحة الوكالة' },
        onboardingWizard: 'DeputyshipOnboarding',
        portalType: 'deputyship',
      };
    }

    if (isMunicipality) {
      return {
        persona: 'municipality',
        defaultDashboard: '/municipality-dashboard',
        dashboardLabel: { en: 'Municipality Dashboard', ar: 'لوحة البلدية' },
        onboardingWizard: 'MunicipalityStaffOnboarding',
        portalType: 'municipality',
      };
    }

    if (roles.some((r) => r.includes('provider') || r.includes('startup'))) {
      return {
        persona: 'provider',
        defaultDashboard: '/startup-dashboard',
        dashboardLabel: { en: 'Provider Dashboard', ar: 'لوحة المزود' },
        onboardingWizard: 'StartupOnboarding',
        portalType: 'provider',
      };
    }

    if (roles.some((r) => r.includes('expert') || r.includes('evaluator'))) {
      return {
        persona: 'expert',
        defaultDashboard: '/expert-dashboard',
        dashboardLabel: { en: 'Expert Dashboard', ar: 'لوحة الخبير' },
        onboardingWizard: 'ExpertOnboarding',
        portalType: 'expert',
      };
    }

    if (roles.some((r) => r.includes('researcher'))) {
      return {
        persona: 'researcher',
        defaultDashboard: '/researcher-dashboard',
        dashboardLabel: { en: 'Research Dashboard', ar: 'لوحة البحث' },
        onboardingWizard: 'ResearcherOnboarding',
        portalType: 'researcher',
      };
    }

    if (roles.includes('citizen')) {
      return {
        persona: 'citizen',
        defaultDashboard: '/citizen-dashboard',
        dashboardLabel: { en: 'Citizen Dashboard', ar: 'لوحة المواطن' },
        onboardingWizard: 'CitizenOnboarding',
        portalType: 'citizen',
      };
    }

    // Fallback for authenticated users without a specific role – treat as citizen
    return {
      persona: 'user',
      defaultDashboard: '/citizen-dashboard',
      dashboardLabel: { en: 'Dashboard', ar: 'لوحة التحكم' },
      onboardingWizard: 'Onboarding',
      portalType: 'citizen',
    };
  }, [isAdmin, isDeputyship, isMunicipality, isNationalEntity, roles]);

  // Menu visibility now depends only on persona + high-level flags.
  const menuVisibility = useMemo(
    () => ({
      showAdminTools: isAdmin,
      showCoverageReports: isAdmin,
      showExecutiveAnalytics:
        personaConfig.persona === 'executive' || personaConfig.persona === 'deputyship',
      showNationalOversight: isDeputyship || isNationalEntity,
      showBenchmarking: false,
      showPolicyManagement: false,
      showMunicipalityTools: personaConfig.persona === 'municipality',
      showLocalChallenges: personaConfig.persona === 'municipality',
      showLocalPilots: personaConfig.persona === 'municipality',
      showProviderTools: personaConfig.persona === 'provider',
      showSolutionManagement: personaConfig.persona === 'provider',
      showOpportunities: personaConfig.persona === 'provider',
      showExpertTools: personaConfig.persona === 'expert',
      showEvaluationQueue: personaConfig.persona === 'expert',
      showCitizenTools: personaConfig.persona === 'citizen',
      showIdeaSubmission: personaConfig.persona === 'citizen',
      showInnovationPipeline: true,
      showPrograms: true,
      showRDSection: personaConfig.persona === 'researcher',
    }), [personaConfig, isAdmin, isDeputyship, isMunicipality, isNationalEntity]);

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
