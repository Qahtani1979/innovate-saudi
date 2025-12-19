/**
 * Role Constants for the Platform
 * Use these constants instead of hardcoding role names
 * This addresses: perm-3 (Hardcoded role names)
 */

// Core Role Names - Must match database roles table exactly
export const ROLE_NAMES = {
  // Admin Roles
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  PLATFORM_ADMIN: 'Platform Admin',
  SYSTEM_ADMINISTRATOR: 'System Administrator',
  SECURITY_ADMINISTRATOR: 'Security Administrator',
  
  // Municipality Roles
  MUNICIPALITY_STAFF: 'Municipality Staff',
  MUNICIPALITY_ADMIN: 'Municipality Admin',
  MUNICIPALITY_COORDINATOR: 'Municipality Coordinator',
  MUNICIPALITY_DIRECTOR: 'Municipality Director',
  MUNICIPALITY_MANAGER: 'Municipality Manager',
  MUNICIPALITY_VIEWER: 'Municipality Viewer',
  MUNICIPALITY_INNOVATION_OFFICER: 'Municipality Innovation Officer',
  
  // Deputyship Roles
  DEPUTYSHIP_ADMIN: 'Deputyship Director',
  DEPUTYSHIP_STAFF: 'Deputyship Staff',
  DEPUTYSHIP_ANALYST: 'Deputyship Analyst',
  DEPUTYSHIP_DIRECTOR: 'Deputyship Director',
  DEPUTYSHIP_MANAGER: 'Deputyship Manager',
  
  // Challenge Roles
  CHALLENGE_LEAD: 'Challenge Lead',
  CHALLENGE_REVIEWER: 'Challenge Reviewer',
  
  // Pilot Roles
  PILOT_MANAGER: 'Pilot Manager',
  
  // Program Roles
  PROGRAM_MANAGER: 'Program Manager',
  PROGRAM_DIRECTOR: 'Program Director',
  PROGRAM_EVALUATOR: 'Program Evaluator',
  PROGRAM_OPERATOR: 'Program Operator',
  
  // Provider Roles
  PROVIDER: 'Provider',
  PROVIDER_ADMIN: 'Provider Admin',
  PROVIDER_STAFF: 'Provider Staff',
  SOLUTION_PROVIDER: 'Solution Provider',
  SOLUTION_EVALUATOR: 'Solution Evaluator',
  SOLUTION_VERIFIER: 'Solution Verifier',
  
  // Research Roles
  RESEARCHER: 'Researcher',
  RESEARCH_LEAD: 'Research Lead',
  RESEARCH_EVALUATOR: 'Research Evaluator',
  RD_MANAGER: 'R&D Manager',
  
  // Executive Roles
  EXECUTIVE: 'Executive',
  EXECUTIVE_LEADER: 'Executive Leader',
  EXECUTIVE_DIRECTOR: 'Executive Director',
  EXECUTIVE_LEADERSHIP: 'Executive Leadership',
  
  // Expert Roles
  EXPERT: 'Expert',
  DOMAIN_EXPERT: 'Domain Expert',
  EVALUATOR: 'Evaluator',
  
  // Living Lab Roles
  LIVING_LAB_ADMIN: 'Living Lab Admin',
  LIVING_LAB_DIRECTOR: 'Living Lab Director',
  LIVING_LAB_MANAGER: 'Living Lab Manager',
  
  // Sandbox Roles
  SANDBOX_MANAGER: 'Sandbox Manager',
  SANDBOX_OPERATOR: 'Sandbox Operator',
  
  // Content Roles
  MODERATOR: 'Moderator',
  CONTENT_MANAGER: 'Content Manager',
  CONTENT_MODERATOR: 'Content Moderator',
  COMMUNICATION_MANAGER: 'Communication Manager',
  COMMUNICATIONS_LEAD: 'Communications Lead',
  IDEA_MODERATOR: 'Idea Moderator',
  
  // Finance Roles
  AUDITOR: 'Auditor',
  BUDGET_OFFICER: 'Budget Officer',
  FINANCIAL_CONTROLLER: 'Financial Controller',
  LEGAL_OFFICER: 'Legal Officer',
  RISK_MANAGER: 'Risk Manager',
  
  // Data Roles
  DATA_ANALYST: 'Data Analyst',
  DATA_MANAGER: 'Data Manager',
  AI_ANALYST: 'AI Analyst',
  REPORT_ANALYST: 'Report Analyst',
  
  // Other Roles
  VIEWER: 'Viewer',
  CITIZEN: 'Citizen',
  INVESTOR: 'Investor',
  ACCELERATOR: 'Accelerator',
  MINISTRY: 'Ministry',
  MINISTRY_REPRESENTATIVE: 'Ministry Representative',
  KNOWLEDGE_MANAGER: 'Knowledge Manager',
  POLICY_OFFICER: 'Policy Officer',
  PARTNERSHIP_MANAGER: 'Partnership Manager',
  IMPLEMENTATION_OFFICER: 'Implementation Officer',
  COUNCIL_MEMBER: 'Council Member',
  MATCHMAKER_MANAGER: 'Matchmaker Manager',
  TEAM_LEAD: 'Team Lead',
  TECHNICAL_LEAD: 'Technical Lead',
  CITIZEN_ENGAGEMENT_MANAGER: 'Citizen Engagement Manager',
  STRATEGY_OFFICER: 'Strategy Officer',
  
  // GDIBS/GDISB Roles
  GDIBS_INTERNAL: 'GDIBS Internal',
  GDIBS_ANALYST: 'GDIBS Analyst',
  GDIBS_COORDINATOR: 'GDIBS Coordinator',
  GDISB_DATA_ANALYST: 'GDISB Data Analyst',
  GDISB_OPERATIONS_MANAGER: 'GDISB Operations Manager',
  GDISB_STRATEGY_LEAD: 'GDISB Strategy Lead'
};

// Role Categories for Permission Grouping
export const ROLE_CATEGORIES = {
  ADMIN_ROLES: [
    ROLE_NAMES.ADMIN,
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.PLATFORM_ADMIN,
    ROLE_NAMES.SYSTEM_ADMINISTRATOR
  ],
  
  STAFF_ROLES: [
    ROLE_NAMES.MUNICIPALITY_STAFF,
    ROLE_NAMES.MUNICIPALITY_ADMIN,
    ROLE_NAMES.MUNICIPALITY_COORDINATOR,
    ROLE_NAMES.DEPUTYSHIP_STAFF,
    ROLE_NAMES.DEPUTYSHIP_ANALYST
  ],
  
  CHALLENGE_ROLES: [
    ROLE_NAMES.CHALLENGE_LEAD,
    ROLE_NAMES.CHALLENGE_REVIEWER,
    ROLE_NAMES.MUNICIPALITY_INNOVATION_OFFICER
  ],
  
  PILOT_ROLES: [
    ROLE_NAMES.PILOT_MANAGER,
    ROLE_NAMES.PROGRAM_MANAGER
  ],
  
  SOLUTION_ROLES: [
    ROLE_NAMES.SOLUTION_PROVIDER,
    ROLE_NAMES.SOLUTION_EVALUATOR,
    ROLE_NAMES.SOLUTION_VERIFIER,
    ROLE_NAMES.PROVIDER,
    ROLE_NAMES.PROVIDER_ADMIN
  ],
  
  RESEARCH_ROLES: [
    ROLE_NAMES.RESEARCHER,
    ROLE_NAMES.RESEARCH_LEAD,
    ROLE_NAMES.RESEARCH_EVALUATOR,
    ROLE_NAMES.RD_MANAGER
  ],
  
  EXECUTIVE_ROLES: [
    ROLE_NAMES.EXECUTIVE,
    ROLE_NAMES.EXECUTIVE_LEADER,
    ROLE_NAMES.EXECUTIVE_DIRECTOR,
    ROLE_NAMES.EXECUTIVE_LEADERSHIP
  ],
  
  VIEWER_ROLES: [
    ROLE_NAMES.VIEWER,
    ROLE_NAMES.CITIZEN,
    ROLE_NAMES.MUNICIPALITY_VIEWER
  ],
  
  CONTENT_ROLES: [
    ROLE_NAMES.MODERATOR,
    ROLE_NAMES.CONTENT_MANAGER,
    ROLE_NAMES.CONTENT_MODERATOR,
    ROLE_NAMES.IDEA_MODERATOR
  ],
  
  FINANCE_ROLES: [
    ROLE_NAMES.AUDITOR,
    ROLE_NAMES.BUDGET_OFFICER,
    ROLE_NAMES.FINANCIAL_CONTROLLER
  ]
};

// Permission Check Helpers
export const isAdminRole = (roleName) => ROLE_CATEGORIES.ADMIN_ROLES.includes(roleName);
export const isStaffRole = (roleName) => ROLE_CATEGORIES.STAFF_ROLES.includes(roleName);
export const isChallengeRole = (roleName) => ROLE_CATEGORIES.CHALLENGE_ROLES.includes(roleName);
export const isViewerRole = (roleName) => ROLE_CATEGORIES.VIEWER_ROLES.includes(roleName);

// Role Check by Category
export const hasAnyRole = (userRoles, categoryRoles) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.some(role => categoryRoles.includes(role));
};

export const hasRole = (userRoles, roleName) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.includes(roleName);
};

// Challenge-specific role checks
export const canManageChallenges = (userRoles) => {
  return hasAnyRole(userRoles, [
    ...ROLE_CATEGORIES.ADMIN_ROLES,
    ...ROLE_CATEGORIES.CHALLENGE_ROLES,
    ROLE_NAMES.MUNICIPALITY_ADMIN,
    ROLE_NAMES.MUNICIPALITY_DIRECTOR
  ]);
};

export const canReviewChallenges = (userRoles) => {
  return hasAnyRole(userRoles, [
    ...ROLE_CATEGORIES.ADMIN_ROLES,
    ROLE_NAMES.CHALLENGE_REVIEWER,
    ROLE_NAMES.DEPUTYSHIP_STAFF,
    ROLE_NAMES.DEPUTYSHIP_ANALYST
  ]);
};

export const canPublishChallenges = (userRoles) => {
  return hasAnyRole(userRoles, [
    ...ROLE_CATEGORIES.ADMIN_ROLES,
    ROLE_NAMES.CHALLENGE_LEAD,
    ROLE_NAMES.MUNICIPALITY_ADMIN,
    ROLE_NAMES.DEPUTYSHIP_DIRECTOR
  ]);
};
