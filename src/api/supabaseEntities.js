import { supabase } from '@/integrations/supabase/client';

/**
 * Entity name to Supabase table name mapping
 * Converts PascalCase entity names to snake_case table names
 */
const tableNameMap = {
  Municipality: 'municipalities',
  Challenge: 'challenges',
  Solution: 'solutions',
  Pilot: 'pilots',
  Program: 'programs',
  RDProject: 'rd_projects',
  Region: 'regions',
  City: 'cities',
  Sector: 'sectors',
  Subsector: 'subsectors',
  KPIReference: 'kpi_references',
  Tag: 'tags',
  Organization: 'organizations',
  ChallengeAttachment: 'challenge_attachments',
  ChallengeActivity: 'challenge_activities',
  Provider: 'providers',
  SolutionCase: 'solution_cases',
  ChallengeSolutionMatch: 'challenge_solution_matches',
  Sandbox: 'sandboxes',
  PilotKPI: 'pilot_kpis',
  PilotKPIDatapoint: 'pilot_kpi_datapoints',
  PilotApproval: 'pilot_approvals',
  PilotIssue: 'pilot_issues',
  PilotDocument: 'pilot_documents',
  RDCall: 'rd_calls',
  RDProposal: 'rd_proposals',
  ProgramApplication: 'program_applications',
  KnowledgeDocument: 'knowledge_documents',
  TrendEntry: 'trend_entries',
  MIIResult: 'mii_results',
  Notification: 'notifications',
  SystemActivity: 'system_activities',
  GlobalTrend: 'global_trends',
  CaseStudy: 'case_studies',
  PlatformInsight: 'platform_insights',
  Task: 'tasks',
  Message: 'messages',
  Comment: 'comments',
  ScalingPlan: 'scaling_plans',
  LivingLab: 'living_labs',
  LivingLabBooking: 'living_lab_bookings',
  LivingLabResourceBooking: 'living_lab_resource_bookings',
  SandboxApplication: 'sandbox_applications',
  SandboxIncident: 'sandbox_incidents',
  RegulatoryExemption: 'regulatory_exemptions',
  SandboxProjectMilestone: 'sandbox_project_milestones',
  SandboxCollaborator: 'sandbox_collaborators',
  ExemptionAuditLog: 'exemption_audit_logs',
  SandboxMonitoringData: 'sandbox_monitoring_data',
  MatchmakerApplication: 'matchmaker_applications',
  MatchmakerEvaluationSession: 'matchmaker_evaluation_sessions',
  StrategicPlan: 'strategic_plans',
  UserInvitation: 'user_invitations',
  Role: 'roles',
  Team: 'teams',
  AccessLog: 'access_logs',
  UserSession: 'user_sessions',
  PlatformConfig: 'platform_configs',
  UserProfile: 'user_profiles',
  StartupProfile: 'startup_profiles',
  ResearcherProfile: 'researcher_profiles',
  Service: 'services',
  CitizenFeedback: 'citizen_feedback',
  PilotExpense: 'pilot_expenses',
  StakeholderFeedback: 'stakeholder_feedback',
  ScalingReadiness: 'scaling_readiness',
  Partnership: 'partnerships',
  CitizenIdea: 'citizen_ideas',
  MIIDimension: 'mii_dimensions',
  UserActivity: 'user_activities',
  Achievement: 'achievements',
  UserAchievement: 'user_achievements',
  UserNotificationPreference: 'user_notification_preferences',
  DelegationRule: 'delegation_rules',
  NewsArticle: 'news_articles',
  CitizenVote: 'citizen_votes',
  RoleRequest: 'role_requests',
  Contract: 'contracts',
  Budget: 'budgets',
  Milestone: 'milestones',
  Risk: 'risks',
  Stakeholder: 'stakeholders',
  Vendor: 'vendors',
  Invoice: 'invoices',
  Event: 'events',
  EventRegistration: 'event_registrations',
  Follow: 'follows',
  UserFollow: 'follows',
  ProgramPilotLink: 'program_pilot_links',
  TeamMember: 'team_members',
  PilotCollaboration: 'pilot_collaborations',
  Audit: 'audits',
  PolicyDocument: 'policy_documents',
  StrategicPlanChallengeLink: 'strategic_plan_challenge_links',
  ProgramMentorship: 'program_mentorships',
  OrganizationPartnership: 'organization_partnerships',
  ExpertProfile: 'expert_profiles',
  ExpertAssignment: 'expert_assignments',
  ExpertEvaluation: 'expert_evaluations',
  ExpertPanel: 'expert_panels',
  ChallengeProposal: 'challenge_proposals',
  PolicyRecommendation: 'policy_recommendations',
  ChallengeInterest: 'challenge_interests',
  IdeaComment: 'idea_comments',
  CitizenPoints: 'citizen_points',
  CitizenBadge: 'citizen_badges',
  InnovationProposal: 'innovation_proposals',
  CitizenNotification: 'citizen_notifications',
  PolicyComment: 'policy_comments',
  PolicyTemplate: 'policy_templates',
  ApprovalRequest: 'approval_requests',
  CitizenPilotEnrollment: 'citizen_pilot_enrollments',
  DemoRequest: 'demo_requests',
  SolutionInterest: 'solution_interests',
  SolutionReview: 'solution_reviews',
  EvaluationTemplate: 'evaluation_templates',
  StartupVerification: 'startup_verifications',
  Bookmark: 'bookmarks',
};

/**
 * Convert Base44-style filter operators to Supabase query
 */
function applyFilters(query, filters) {
  if (!filters || typeof filters !== 'object') return query;

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      query = query.is(key, null);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle operators like $regex, $gt, $lt, $in, etc.
      Object.entries(value).forEach(([op, opValue]) => {
        switch (op) {
          case '$regex':
            query = query.ilike(key, `%${opValue}%`);
            break;
          case '$eq':
            query = query.eq(key, opValue);
            break;
          case '$neq':
          case '$ne':
            query = query.neq(key, opValue);
            break;
          case '$gt':
            query = query.gt(key, opValue);
            break;
          case '$gte':
            query = query.gte(key, opValue);
            break;
          case '$lt':
            query = query.lt(key, opValue);
            break;
          case '$lte':
            query = query.lte(key, opValue);
            break;
          case '$in':
            query = query.in(key, opValue);
            break;
          case '$contains':
            query = query.contains(key, opValue);
            break;
          case '$options':
            // Ignore options (used with $regex)
            break;
          default:
            // Treat as nested object comparison
            query = query.eq(key, value);
        }
      });
    } else if (Array.isArray(value)) {
      query = query.in(key, value);
    } else {
      query = query.eq(key, value);
    }
  });

  return query;
}

/**
 * Parse sort string to Supabase order format
 * Supports: "-created_date" for desc, "created_date" for asc
 */
function parseSort(sortStr) {
  if (!sortStr) return { column: 'created_at', ascending: false };
  
  const isDesc = sortStr.startsWith('-');
  let column = isDesc ? sortStr.slice(1) : sortStr;
  
  // Map common field names
  const fieldMap = {
    'created_date': 'created_at',
    'updated_date': 'updated_at',
    'createdDate': 'created_at',
    'updatedDate': 'updated_at',
  };
  
  column = fieldMap[column] || column;
  
  return { column, ascending: !isDesc };
}

/**
 * Create an entity handler for a specific table
 */
function createEntityHandler(entityName) {
  const tableName = tableNameMap[entityName];
  
  if (!tableName) {
    console.warn(`Unknown entity: ${entityName}, using snake_case conversion`);
    // Fall back to simple snake_case conversion
    return createEntityHandler(entityName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '') + 's');
  }

  return {
    /**
     * List all records with optional sort and limit
     */
    async list(sort, limit) {
      let query = supabase.from(tableName).select('*');
      
      // Handle soft delete
      query = query.or('is_deleted.is.null,is_deleted.eq.false');
      
      const { column, ascending } = parseSort(sort);
      query = query.order(column, { ascending });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error(`Error listing ${entityName}:`, error);
        throw error;
      }
      return data || [];
    },

    /**
     * Filter records with conditions
     */
    async filter(filters, sort, limit) {
      let query = supabase.from(tableName).select('*');
      
      // Handle soft delete
      if (!filters?.is_deleted) {
        query = query.or('is_deleted.is.null,is_deleted.eq.false');
      }
      
      query = applyFilters(query, filters);
      
      const { column, ascending } = parseSort(sort);
      query = query.order(column, { ascending });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error(`Error filtering ${entityName}:`, error);
        throw error;
      }
      return data || [];
    },

    /**
     * Get a single record by ID
     */
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error getting ${entityName} ${id}:`, error);
        throw error;
      }
      return data;
    },

    /**
     * Create a new record
     */
    async create(recordData) {
      // Remove any id field if it's empty/null to let DB generate
      const cleanData = { ...recordData };
      if (!cleanData.id) delete cleanData.id;
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(cleanData)
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating ${entityName}:`, error);
        throw error;
      }
      return data;
    },

    /**
     * Update an existing record
     */
    async update(id, updates) {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating ${entityName} ${id}:`, error);
        throw error;
      }
      return data;
    },

    /**
     * Soft delete a record
     */
    async delete(id) {
      // Try soft delete first
      const { data, error } = await supabase
        .from(tableName)
        .update({ is_deleted: true, deleted_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        // If soft delete fails (no is_deleted column), try hard delete
        const { error: hardDeleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
        
        if (hardDeleteError) {
          console.error(`Error deleting ${entityName} ${id}:`, hardDeleteError);
          throw hardDeleteError;
        }
        return { id, deleted: true };
      }
      return data;
    },

    /**
     * Count records with optional filters
     */
    async count(filters) {
      let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
      
      // Handle soft delete
      query = query.or('is_deleted.is.null,is_deleted.eq.false');
      
      if (filters) {
        query = applyFilters(query, filters);
      }
      
      const { count, error } = await query;
      if (error) {
        console.error(`Error counting ${entityName}:`, error);
        throw error;
      }
      return count || 0;
    }
  };
}

/**
 * Create a proxy that lazily creates entity handlers
 */
const entitiesProxy = new Proxy({}, {
  get(target, entityName) {
    if (typeof entityName !== 'string') return undefined;
    
    // Cache the handler
    if (!target[entityName]) {
      target[entityName] = createEntityHandler(entityName);
    }
    return target[entityName];
  }
});

export const entities = entitiesProxy;
export default entities;
