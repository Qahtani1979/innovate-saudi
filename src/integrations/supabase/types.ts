export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      challenges: {
        Row: {
          affected_population: Json | null
          affected_population_size: number | null
          affected_services: string[] | null
          ai_suggestions: Json | null
          ai_summary: string | null
          approval_date: string | null
          archive_date: string | null
          budget_estimate: number | null
          category: string | null
          challenge_owner: string | null
          challenge_owner_email: string | null
          challenge_type: string | null
          citizen_origin_idea_id: string | null
          citizen_votes_count: number | null
          city_id: string | null
          code: string | null
          constraints: Json | null
          coordinates: Json | null
          created_at: string
          current_situation_ar: string | null
          current_situation_en: string | null
          data_evidence: Json | null
          deleted_by: string | null
          deleted_date: string | null
          department: string | null
          description_ar: string | null
          description_en: string | null
          desired_outcome_ar: string | null
          desired_outcome_en: string | null
          embedding: number[] | null
          embedding_generated_date: string | null
          embedding_model: string | null
          entry_date: string | null
          escalation_date: string | null
          escalation_level: number | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          impact_score: number | null
          innovation_framing: Json | null
          is_archived: boolean | null
          is_confidential: boolean | null
          is_deleted: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          keywords: string[] | null
          kpis: Json | null
          lessons_learned: Json | null
          linked_pilot_ids: string[] | null
          linked_program_ids: string[] | null
          linked_rd_ids: string[] | null
          ministry_service: string | null
          municipality_id: string | null
          overall_score: number | null
          previous_version_id: string | null
          priority: string | null
          problem_statement_ar: string | null
          problem_statement_en: string | null
          processing_date: string | null
          publishing_approved_by: string | null
          publishing_approved_date: string | null
          region_id: string | null
          related_questions_count: number | null
          resolution_date: string | null
          responsible_agency: string | null
          review_assigned_to: string | null
          review_date: string | null
          reviewer: string | null
          root_cause_ar: string | null
          root_cause_en: string | null
          root_causes: string[] | null
          sector: string | null
          sector_id: string | null
          service_id: string | null
          severity_score: number | null
          sla_due_date: string | null
          source: string | null
          stakeholders: Json | null
          status: string | null
          strategic_goal: string | null
          strategic_plan_ids: string[] | null
          sub_sector: string | null
          submission_date: string | null
          subsector_id: string | null
          tagline_ar: string | null
          tagline_en: string | null
          tags: string[] | null
          theme: string | null
          timeline_estimate: string | null
          title_ar: string | null
          title_en: string
          tracks: string[] | null
          treatment_plan: Json | null
          updated_at: string
          version_number: number | null
          view_count: number | null
        }
        Insert: {
          affected_population?: Json | null
          affected_population_size?: number | null
          affected_services?: string[] | null
          ai_suggestions?: Json | null
          ai_summary?: string | null
          approval_date?: string | null
          archive_date?: string | null
          budget_estimate?: number | null
          category?: string | null
          challenge_owner?: string | null
          challenge_owner_email?: string | null
          challenge_type?: string | null
          citizen_origin_idea_id?: string | null
          citizen_votes_count?: number | null
          city_id?: string | null
          code?: string | null
          constraints?: Json | null
          coordinates?: Json | null
          created_at?: string
          current_situation_ar?: string | null
          current_situation_en?: string | null
          data_evidence?: Json | null
          deleted_by?: string | null
          deleted_date?: string | null
          department?: string | null
          description_ar?: string | null
          description_en?: string | null
          desired_outcome_ar?: string | null
          desired_outcome_en?: string | null
          embedding?: number[] | null
          embedding_generated_date?: string | null
          embedding_model?: string | null
          entry_date?: string | null
          escalation_date?: string | null
          escalation_level?: number | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          impact_score?: number | null
          innovation_framing?: Json | null
          is_archived?: boolean | null
          is_confidential?: boolean | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          kpis?: Json | null
          lessons_learned?: Json | null
          linked_pilot_ids?: string[] | null
          linked_program_ids?: string[] | null
          linked_rd_ids?: string[] | null
          ministry_service?: string | null
          municipality_id?: string | null
          overall_score?: number | null
          previous_version_id?: string | null
          priority?: string | null
          problem_statement_ar?: string | null
          problem_statement_en?: string | null
          processing_date?: string | null
          publishing_approved_by?: string | null
          publishing_approved_date?: string | null
          region_id?: string | null
          related_questions_count?: number | null
          resolution_date?: string | null
          responsible_agency?: string | null
          review_assigned_to?: string | null
          review_date?: string | null
          reviewer?: string | null
          root_cause_ar?: string | null
          root_cause_en?: string | null
          root_causes?: string[] | null
          sector?: string | null
          sector_id?: string | null
          service_id?: string | null
          severity_score?: number | null
          sla_due_date?: string | null
          source?: string | null
          stakeholders?: Json | null
          status?: string | null
          strategic_goal?: string | null
          strategic_plan_ids?: string[] | null
          sub_sector?: string | null
          submission_date?: string | null
          subsector_id?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          theme?: string | null
          timeline_estimate?: string | null
          title_ar?: string | null
          title_en: string
          tracks?: string[] | null
          treatment_plan?: Json | null
          updated_at?: string
          version_number?: number | null
          view_count?: number | null
        }
        Update: {
          affected_population?: Json | null
          affected_population_size?: number | null
          affected_services?: string[] | null
          ai_suggestions?: Json | null
          ai_summary?: string | null
          approval_date?: string | null
          archive_date?: string | null
          budget_estimate?: number | null
          category?: string | null
          challenge_owner?: string | null
          challenge_owner_email?: string | null
          challenge_type?: string | null
          citizen_origin_idea_id?: string | null
          citizen_votes_count?: number | null
          city_id?: string | null
          code?: string | null
          constraints?: Json | null
          coordinates?: Json | null
          created_at?: string
          current_situation_ar?: string | null
          current_situation_en?: string | null
          data_evidence?: Json | null
          deleted_by?: string | null
          deleted_date?: string | null
          department?: string | null
          description_ar?: string | null
          description_en?: string | null
          desired_outcome_ar?: string | null
          desired_outcome_en?: string | null
          embedding?: number[] | null
          embedding_generated_date?: string | null
          embedding_model?: string | null
          entry_date?: string | null
          escalation_date?: string | null
          escalation_level?: number | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          impact_score?: number | null
          innovation_framing?: Json | null
          is_archived?: boolean | null
          is_confidential?: boolean | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          kpis?: Json | null
          lessons_learned?: Json | null
          linked_pilot_ids?: string[] | null
          linked_program_ids?: string[] | null
          linked_rd_ids?: string[] | null
          ministry_service?: string | null
          municipality_id?: string | null
          overall_score?: number | null
          previous_version_id?: string | null
          priority?: string | null
          problem_statement_ar?: string | null
          problem_statement_en?: string | null
          processing_date?: string | null
          publishing_approved_by?: string | null
          publishing_approved_date?: string | null
          region_id?: string | null
          related_questions_count?: number | null
          resolution_date?: string | null
          responsible_agency?: string | null
          review_assigned_to?: string | null
          review_date?: string | null
          reviewer?: string | null
          root_cause_ar?: string | null
          root_cause_en?: string | null
          root_causes?: string[] | null
          sector?: string | null
          sector_id?: string | null
          service_id?: string | null
          severity_score?: number | null
          sla_due_date?: string | null
          source?: string | null
          stakeholders?: Json | null
          status?: string | null
          strategic_goal?: string | null
          strategic_plan_ids?: string[] | null
          sub_sector?: string | null
          submission_date?: string | null
          subsector_id?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          theme?: string | null
          timeline_estimate?: string | null
          title_ar?: string | null
          title_en?: string
          tracks?: string[] | null
          treatment_plan?: Json | null
          updated_at?: string
          version_number?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      municipalities: {
        Row: {
          active_challenges: number | null
          active_pilots: number | null
          banner_url: string | null
          city_type: string | null
          completed_pilots: number | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          coordinates: Json | null
          created_at: string
          deactivation_date: string | null
          deactivation_reason: string | null
          deleted_by: string | null
          deleted_date: string | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          mii_rank: number | null
          mii_score: number | null
          name_ar: string
          name_en: string
          population: number | null
          region: string
          region_id: string | null
          strategic_plan_id: string | null
          updated_at: string
          verification_date: string | null
          website: string | null
        }
        Insert: {
          active_challenges?: number | null
          active_pilots?: number | null
          banner_url?: string | null
          city_type?: string | null
          completed_pilots?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          coordinates?: Json | null
          created_at?: string
          deactivation_date?: string | null
          deactivation_reason?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          mii_rank?: number | null
          mii_score?: number | null
          name_ar: string
          name_en: string
          population?: number | null
          region: string
          region_id?: string | null
          strategic_plan_id?: string | null
          updated_at?: string
          verification_date?: string | null
          website?: string | null
        }
        Update: {
          active_challenges?: number | null
          active_pilots?: number | null
          banner_url?: string | null
          city_type?: string | null
          completed_pilots?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          coordinates?: Json | null
          created_at?: string
          deactivation_date?: string | null
          deactivation_reason?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          mii_rank?: number | null
          mii_score?: number | null
          name_ar?: string
          name_en?: string
          population?: number | null
          region?: string
          region_id?: string | null
          strategic_plan_id?: string | null
          updated_at?: string
          verification_date?: string | null
          website?: string | null
        }
        Relationships: []
      }
      pilots: {
        Row: {
          ai_insights: string | null
          budget: number | null
          budget_approvals: Json | null
          budget_breakdown: Json | null
          budget_currency: string | null
          budget_released: number | null
          budget_spent: number | null
          challenge_id: string
          city_id: string | null
          code: string | null
          created_at: string
          deleted_by: string | null
          deleted_date: string | null
          description_ar: string | null
          description_en: string | null
          duration_weeks: number | null
          gallery_urls: string[] | null
          gate_approval_history: Json | null
          hypothesis: string | null
          id: string
          image_url: string | null
          is_archived: boolean | null
          is_deleted: boolean | null
          is_flagship: boolean | null
          is_published: boolean | null
          kpis: Json | null
          living_lab_id: string | null
          matchmaker_application_id: string | null
          media_coverage: Json | null
          methodology: string | null
          milestones: Json | null
          municipality_id: string
          objective_ar: string | null
          objective_en: string | null
          pivot_count: number | null
          pivot_history: Json | null
          previous_version_id: string | null
          public_engagement: Json | null
          recommendation: string | null
          region_id: string | null
          resource_allocation: Json | null
          risk_level: string | null
          risks: Json | null
          safety_incidents_count: number | null
          sandbox_id: string | null
          scaling_plan: Json | null
          scope: string | null
          sector: string
          solution_id: string | null
          source_program_id: string | null
          source_rd_project_id: string | null
          stage: string | null
          stakeholders: Json | null
          sub_sector: string | null
          success_probability: number | null
          tagline_ar: string | null
          tagline_en: string | null
          tags: string[] | null
          target_population: Json | null
          team: Json | null
          timeline: Json | null
          title_ar: string | null
          title_en: string
          trl_current: number | null
          trl_start: number | null
          trl_target: number | null
          updated_at: string
          version_number: number | null
          video_url: string | null
        }
        Insert: {
          ai_insights?: string | null
          budget?: number | null
          budget_approvals?: Json | null
          budget_breakdown?: Json | null
          budget_currency?: string | null
          budget_released?: number | null
          budget_spent?: number | null
          challenge_id: string
          city_id?: string | null
          code?: string | null
          created_at?: string
          deleted_by?: string | null
          deleted_date?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_weeks?: number | null
          gallery_urls?: string[] | null
          gate_approval_history?: Json | null
          hypothesis?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_deleted?: boolean | null
          is_flagship?: boolean | null
          is_published?: boolean | null
          kpis?: Json | null
          living_lab_id?: string | null
          matchmaker_application_id?: string | null
          media_coverage?: Json | null
          methodology?: string | null
          milestones?: Json | null
          municipality_id: string
          objective_ar?: string | null
          objective_en?: string | null
          pivot_count?: number | null
          pivot_history?: Json | null
          previous_version_id?: string | null
          public_engagement?: Json | null
          recommendation?: string | null
          region_id?: string | null
          resource_allocation?: Json | null
          risk_level?: string | null
          risks?: Json | null
          safety_incidents_count?: number | null
          sandbox_id?: string | null
          scaling_plan?: Json | null
          scope?: string | null
          sector: string
          solution_id?: string | null
          source_program_id?: string | null
          source_rd_project_id?: string | null
          stage?: string | null
          stakeholders?: Json | null
          sub_sector?: string | null
          success_probability?: number | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          target_population?: Json | null
          team?: Json | null
          timeline?: Json | null
          title_ar?: string | null
          title_en: string
          trl_current?: number | null
          trl_start?: number | null
          trl_target?: number | null
          updated_at?: string
          version_number?: number | null
          video_url?: string | null
        }
        Update: {
          ai_insights?: string | null
          budget?: number | null
          budget_approvals?: Json | null
          budget_breakdown?: Json | null
          budget_currency?: string | null
          budget_released?: number | null
          budget_spent?: number | null
          challenge_id?: string
          city_id?: string | null
          code?: string | null
          created_at?: string
          deleted_by?: string | null
          deleted_date?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_weeks?: number | null
          gallery_urls?: string[] | null
          gate_approval_history?: Json | null
          hypothesis?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_deleted?: boolean | null
          is_flagship?: boolean | null
          is_published?: boolean | null
          kpis?: Json | null
          living_lab_id?: string | null
          matchmaker_application_id?: string | null
          media_coverage?: Json | null
          methodology?: string | null
          milestones?: Json | null
          municipality_id?: string
          objective_ar?: string | null
          objective_en?: string | null
          pivot_count?: number | null
          pivot_history?: Json | null
          previous_version_id?: string | null
          public_engagement?: Json | null
          recommendation?: string | null
          region_id?: string | null
          resource_allocation?: Json | null
          risk_level?: string | null
          risks?: Json | null
          safety_incidents_count?: number | null
          sandbox_id?: string | null
          scaling_plan?: Json | null
          scope?: string | null
          sector?: string
          solution_id?: string | null
          source_program_id?: string | null
          source_rd_project_id?: string | null
          stage?: string | null
          stakeholders?: Json | null
          sub_sector?: string | null
          success_probability?: number | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          target_population?: Json | null
          team?: Json | null
          timeline?: Json | null
          title_ar?: string | null
          title_en?: string
          trl_current?: number | null
          trl_start?: number | null
          trl_target?: number | null
          updated_at?: string
          version_number?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pilots_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilots_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilots_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          application_url: string | null
          applications_count: number | null
          benefits: Json | null
          brochure_url: string | null
          budget: number | null
          budget_breakdown: Json | null
          budget_currency: string | null
          challenge_clusters_inspiration: string[] | null
          challenge_submissions_generated: number | null
          challenge_theme_alignment: string[] | null
          city_targets: string[] | null
          code: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          current_cohort: number | null
          curriculum: Json | null
          deleted_by: string | null
          deleted_date: string | null
          description_ar: string | null
          description_en: string | null
          eligibility_criteria: string[] | null
          focus_areas: string[] | null
          funding_sources: Json | null
          gallery_urls: string[] | null
          graduate_pilots_launched: string[] | null
          graduate_solutions_produced: string[] | null
          graduates_count: number | null
          id: string
          idea_themes_inspiration: string[] | null
          image_url: string | null
          is_archived: boolean | null
          is_deleted: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          kpis: Json | null
          mentors: Json | null
          mii_dimension_targets: string[] | null
          municipal_capacity_impact: Json | null
          municipality_targets: string[] | null
          name_ar: string | null
          name_en: string
          objectives_ar: string | null
          objectives_en: string | null
          operator_organization_id: string | null
          participants_count: number | null
          partner_organizations: string[] | null
          partner_organizations_strategic: Json | null
          partnership_agreements_formed: number | null
          previous_version_id: string | null
          program_type: string | null
          region_targets: string[] | null
          sector_id: string | null
          service_focus_ids: string[] | null
          solution_types_targeted: string[] | null
          strategic_kpi_contributions: Json | null
          strategic_objective_ids: string[] | null
          strategic_pillar_id: string | null
          strategic_plan_ids: string[] | null
          strategic_priority_level: string | null
          subsector_id: string | null
          success_metrics: Json | null
          success_rate: number | null
          tagline_ar: string | null
          tagline_en: string | null
          tags: string[] | null
          target_participants: Json | null
          taxonomy_weights: Json | null
          timeline: Json | null
          total_cohorts: number | null
          updated_at: string
          version_number: number | null
          video_url: string | null
          website: string | null
          workflow_stage: string | null
        }
        Insert: {
          application_url?: string | null
          applications_count?: number | null
          benefits?: Json | null
          brochure_url?: string | null
          budget?: number | null
          budget_breakdown?: Json | null
          budget_currency?: string | null
          challenge_clusters_inspiration?: string[] | null
          challenge_submissions_generated?: number | null
          challenge_theme_alignment?: string[] | null
          city_targets?: string[] | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          current_cohort?: number | null
          curriculum?: Json | null
          deleted_by?: string | null
          deleted_date?: string | null
          description_ar?: string | null
          description_en?: string | null
          eligibility_criteria?: string[] | null
          focus_areas?: string[] | null
          funding_sources?: Json | null
          gallery_urls?: string[] | null
          graduate_pilots_launched?: string[] | null
          graduate_solutions_produced?: string[] | null
          graduates_count?: number | null
          id?: string
          idea_themes_inspiration?: string[] | null
          image_url?: string | null
          is_archived?: boolean | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          kpis?: Json | null
          mentors?: Json | null
          mii_dimension_targets?: string[] | null
          municipal_capacity_impact?: Json | null
          municipality_targets?: string[] | null
          name_ar?: string | null
          name_en: string
          objectives_ar?: string | null
          objectives_en?: string | null
          operator_organization_id?: string | null
          participants_count?: number | null
          partner_organizations?: string[] | null
          partner_organizations_strategic?: Json | null
          partnership_agreements_formed?: number | null
          previous_version_id?: string | null
          program_type?: string | null
          region_targets?: string[] | null
          sector_id?: string | null
          service_focus_ids?: string[] | null
          solution_types_targeted?: string[] | null
          strategic_kpi_contributions?: Json | null
          strategic_objective_ids?: string[] | null
          strategic_pillar_id?: string | null
          strategic_plan_ids?: string[] | null
          strategic_priority_level?: string | null
          subsector_id?: string | null
          success_metrics?: Json | null
          success_rate?: number | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          target_participants?: Json | null
          taxonomy_weights?: Json | null
          timeline?: Json | null
          total_cohorts?: number | null
          updated_at?: string
          version_number?: number | null
          video_url?: string | null
          website?: string | null
          workflow_stage?: string | null
        }
        Update: {
          application_url?: string | null
          applications_count?: number | null
          benefits?: Json | null
          brochure_url?: string | null
          budget?: number | null
          budget_breakdown?: Json | null
          budget_currency?: string | null
          challenge_clusters_inspiration?: string[] | null
          challenge_submissions_generated?: number | null
          challenge_theme_alignment?: string[] | null
          city_targets?: string[] | null
          code?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          current_cohort?: number | null
          curriculum?: Json | null
          deleted_by?: string | null
          deleted_date?: string | null
          description_ar?: string | null
          description_en?: string | null
          eligibility_criteria?: string[] | null
          focus_areas?: string[] | null
          funding_sources?: Json | null
          gallery_urls?: string[] | null
          graduate_pilots_launched?: string[] | null
          graduate_solutions_produced?: string[] | null
          graduates_count?: number | null
          id?: string
          idea_themes_inspiration?: string[] | null
          image_url?: string | null
          is_archived?: boolean | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          kpis?: Json | null
          mentors?: Json | null
          mii_dimension_targets?: string[] | null
          municipal_capacity_impact?: Json | null
          municipality_targets?: string[] | null
          name_ar?: string | null
          name_en?: string
          objectives_ar?: string | null
          objectives_en?: string | null
          operator_organization_id?: string | null
          participants_count?: number | null
          partner_organizations?: string[] | null
          partner_organizations_strategic?: Json | null
          partnership_agreements_formed?: number | null
          previous_version_id?: string | null
          program_type?: string | null
          region_targets?: string[] | null
          sector_id?: string | null
          service_focus_ids?: string[] | null
          solution_types_targeted?: string[] | null
          strategic_kpi_contributions?: Json | null
          strategic_objective_ids?: string[] | null
          strategic_pillar_id?: string | null
          strategic_plan_ids?: string[] | null
          strategic_priority_level?: string | null
          subsector_id?: string | null
          success_metrics?: Json | null
          success_rate?: number | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          target_participants?: Json | null
          taxonomy_weights?: Json | null
          timeline?: Json | null
          total_cohorts?: number | null
          updated_at?: string
          version_number?: number | null
          video_url?: string | null
          website?: string | null
          workflow_stage?: string | null
        }
        Relationships: []
      }
      rd_projects: {
        Row: {
          abstract_ar: string | null
          abstract_en: string | null
          actual_outcomes: string | null
          budget_approved: number | null
          budget_breakdown: Json | null
          budget_currency: string | null
          budget_requested: number | null
          budget_spent: number | null
          challenge_ids: string[] | null
          co_investigators: Json | null
          code: string | null
          commercialization_potential: Json | null
          created_at: string
          data_management_plan: string | null
          datasets: Json | null
          deleted_by: string | null
          deleted_date: string | null
          deliverables: Json | null
          description_ar: string | null
          description_en: string | null
          documents: Json | null
          duration_months: number | null
          embedding: number[] | null
          embedding_generated_date: string | null
          embedding_model: string | null
          end_date: string | null
          ethics_approval: Json | null
          expected_outcomes_ar: string | null
          expected_outcomes_en: string | null
          funding_source_id: string | null
          funding_sources: Json | null
          gallery_urls: string[] | null
          hypotheses: string[] | null
          id: string
          image_url: string | null
          impact_assessment: Json | null
          industry_partnerships: Json | null
          institution_id: string | null
          institution_name: string | null
          is_archived: boolean | null
          is_confidential: boolean | null
          is_deleted: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          keywords: string[] | null
          kpis: Json | null
          lessons_learned: Json | null
          methodology: string | null
          milestones: Json | null
          partner_institutions: Json | null
          patents: Json | null
          pilot_opportunities: string[] | null
          previous_version_id: string | null
          principal_investigator_email: string | null
          principal_investigator_id: string | null
          principal_investigator_name: string | null
          progress_updates: Json | null
          prototypes: Json | null
          publications: Json | null
          rd_call_id: string | null
          research_area: string | null
          research_questions: string[] | null
          research_team: Json | null
          research_type: string | null
          risks: Json | null
          sector_id: string | null
          service_ids: string[] | null
          solution_id: string | null
          start_date: string | null
          subsector_id: string | null
          tagline_ar: string | null
          tagline_en: string | null
          tags: string[] | null
          timeline: Json | null
          title_ar: string | null
          title_en: string
          trl_current: number | null
          trl_start: number | null
          trl_target: number | null
          updated_at: string
          version_number: number | null
          video_url: string | null
          workflow_stage: string | null
        }
        Insert: {
          abstract_ar?: string | null
          abstract_en?: string | null
          actual_outcomes?: string | null
          budget_approved?: number | null
          budget_breakdown?: Json | null
          budget_currency?: string | null
          budget_requested?: number | null
          budget_spent?: number | null
          challenge_ids?: string[] | null
          co_investigators?: Json | null
          code?: string | null
          commercialization_potential?: Json | null
          created_at?: string
          data_management_plan?: string | null
          datasets?: Json | null
          deleted_by?: string | null
          deleted_date?: string | null
          deliverables?: Json | null
          description_ar?: string | null
          description_en?: string | null
          documents?: Json | null
          duration_months?: number | null
          embedding?: number[] | null
          embedding_generated_date?: string | null
          embedding_model?: string | null
          end_date?: string | null
          ethics_approval?: Json | null
          expected_outcomes_ar?: string | null
          expected_outcomes_en?: string | null
          funding_source_id?: string | null
          funding_sources?: Json | null
          gallery_urls?: string[] | null
          hypotheses?: string[] | null
          id?: string
          image_url?: string | null
          impact_assessment?: Json | null
          industry_partnerships?: Json | null
          institution_id?: string | null
          institution_name?: string | null
          is_archived?: boolean | null
          is_confidential?: boolean | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          kpis?: Json | null
          lessons_learned?: Json | null
          methodology?: string | null
          milestones?: Json | null
          partner_institutions?: Json | null
          patents?: Json | null
          pilot_opportunities?: string[] | null
          previous_version_id?: string | null
          principal_investigator_email?: string | null
          principal_investigator_id?: string | null
          principal_investigator_name?: string | null
          progress_updates?: Json | null
          prototypes?: Json | null
          publications?: Json | null
          rd_call_id?: string | null
          research_area?: string | null
          research_questions?: string[] | null
          research_team?: Json | null
          research_type?: string | null
          risks?: Json | null
          sector_id?: string | null
          service_ids?: string[] | null
          solution_id?: string | null
          start_date?: string | null
          subsector_id?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          timeline?: Json | null
          title_ar?: string | null
          title_en: string
          trl_current?: number | null
          trl_start?: number | null
          trl_target?: number | null
          updated_at?: string
          version_number?: number | null
          video_url?: string | null
          workflow_stage?: string | null
        }
        Update: {
          abstract_ar?: string | null
          abstract_en?: string | null
          actual_outcomes?: string | null
          budget_approved?: number | null
          budget_breakdown?: Json | null
          budget_currency?: string | null
          budget_requested?: number | null
          budget_spent?: number | null
          challenge_ids?: string[] | null
          co_investigators?: Json | null
          code?: string | null
          commercialization_potential?: Json | null
          created_at?: string
          data_management_plan?: string | null
          datasets?: Json | null
          deleted_by?: string | null
          deleted_date?: string | null
          deliverables?: Json | null
          description_ar?: string | null
          description_en?: string | null
          documents?: Json | null
          duration_months?: number | null
          embedding?: number[] | null
          embedding_generated_date?: string | null
          embedding_model?: string | null
          end_date?: string | null
          ethics_approval?: Json | null
          expected_outcomes_ar?: string | null
          expected_outcomes_en?: string | null
          funding_source_id?: string | null
          funding_sources?: Json | null
          gallery_urls?: string[] | null
          hypotheses?: string[] | null
          id?: string
          image_url?: string | null
          impact_assessment?: Json | null
          industry_partnerships?: Json | null
          institution_id?: string | null
          institution_name?: string | null
          is_archived?: boolean | null
          is_confidential?: boolean | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          kpis?: Json | null
          lessons_learned?: Json | null
          methodology?: string | null
          milestones?: Json | null
          partner_institutions?: Json | null
          patents?: Json | null
          pilot_opportunities?: string[] | null
          previous_version_id?: string | null
          principal_investigator_email?: string | null
          principal_investigator_id?: string | null
          principal_investigator_name?: string | null
          progress_updates?: Json | null
          prototypes?: Json | null
          publications?: Json | null
          rd_call_id?: string | null
          research_area?: string | null
          research_questions?: string[] | null
          research_team?: Json | null
          research_type?: string | null
          risks?: Json | null
          sector_id?: string | null
          service_ids?: string[] | null
          solution_id?: string | null
          start_date?: string | null
          subsector_id?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          timeline?: Json | null
          title_ar?: string | null
          title_en?: string
          trl_current?: number | null
          trl_start?: number | null
          trl_target?: number | null
          updated_at?: string
          version_number?: number | null
          video_url?: string | null
          workflow_stage?: string | null
        }
        Relationships: []
      }
      solutions: {
        Row: {
          achievement_badges: string[] | null
          api_documentation_url: string | null
          average_rating: number | null
          awards: Json | null
          brochure_url: string | null
          case_studies: Json | null
          categories: string[] | null
          certifications: Json | null
          challenges_discovered: string[] | null
          code: string | null
          compliance_certifications: Json | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_template_url: string | null
          created_at: string
          deleted_by: string | null
          deleted_date: string | null
          demo_url: string | null
          demo_video_url: string | null
          demos_requested_count: number | null
          deployment_count: number | null
          deployment_options: string[] | null
          deployment_success_rate: number | null
          deployments: Json | null
          description_ar: string | null
          description_en: string | null
          documentation_url: string | null
          embedding: number[] | null
          embedding_generated_date: string | null
          embedding_model: string | null
          escalation_level: number | null
          features: string[] | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          implementation_timeline: string | null
          integration_requirements: string[] | null
          interests_expressed_count: number | null
          is_archived: boolean | null
          is_deleted: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          last_deployed_date: string | null
          maturity_level: string | null
          name_ar: string | null
          name_en: string
          partnerships: Json | null
          pilots_won_count: number | null
          previous_version_id: string | null
          pricing_details: Json | null
          pricing_model: string | null
          proposals_submitted_count: number | null
          provider_id: string | null
          provider_name: string
          provider_type: string
          publishing_date: string | null
          ratings: Json | null
          reviewer_assigned_to: string | null
          sectors: string[] | null
          sla_due_date: string | null
          source_idea_id: string | null
          source_program_id: string | null
          source_rd_project_id: string | null
          submission_date: string | null
          success_rate: number | null
          support_contact_email: string | null
          support_services: Json | null
          tagline_ar: string | null
          tagline_en: string | null
          tags: string[] | null
          technical_specifications: Json | null
          total_reviews: number | null
          trl: number | null
          trl_assessment: Json | null
          updated_at: string
          use_cases: Json | null
          value_proposition: string | null
          verification_date: string | null
          verification_notes: string | null
          verification_status: string | null
          version_number: number | null
          video_url: string | null
          view_count: number | null
          website: string | null
          workflow_stage: string | null
        }
        Insert: {
          achievement_badges?: string[] | null
          api_documentation_url?: string | null
          average_rating?: number | null
          awards?: Json | null
          brochure_url?: string | null
          case_studies?: Json | null
          categories?: string[] | null
          certifications?: Json | null
          challenges_discovered?: string[] | null
          code?: string | null
          compliance_certifications?: Json | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_template_url?: string | null
          created_at?: string
          deleted_by?: string | null
          deleted_date?: string | null
          demo_url?: string | null
          demo_video_url?: string | null
          demos_requested_count?: number | null
          deployment_count?: number | null
          deployment_options?: string[] | null
          deployment_success_rate?: number | null
          deployments?: Json | null
          description_ar?: string | null
          description_en?: string | null
          documentation_url?: string | null
          embedding?: number[] | null
          embedding_generated_date?: string | null
          embedding_model?: string | null
          escalation_level?: number | null
          features?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          implementation_timeline?: string | null
          integration_requirements?: string[] | null
          interests_expressed_count?: number | null
          is_archived?: boolean | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          last_deployed_date?: string | null
          maturity_level?: string | null
          name_ar?: string | null
          name_en: string
          partnerships?: Json | null
          pilots_won_count?: number | null
          previous_version_id?: string | null
          pricing_details?: Json | null
          pricing_model?: string | null
          proposals_submitted_count?: number | null
          provider_id?: string | null
          provider_name: string
          provider_type: string
          publishing_date?: string | null
          ratings?: Json | null
          reviewer_assigned_to?: string | null
          sectors?: string[] | null
          sla_due_date?: string | null
          source_idea_id?: string | null
          source_program_id?: string | null
          source_rd_project_id?: string | null
          submission_date?: string | null
          success_rate?: number | null
          support_contact_email?: string | null
          support_services?: Json | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          technical_specifications?: Json | null
          total_reviews?: number | null
          trl?: number | null
          trl_assessment?: Json | null
          updated_at?: string
          use_cases?: Json | null
          value_proposition?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          version_number?: number | null
          video_url?: string | null
          view_count?: number | null
          website?: string | null
          workflow_stage?: string | null
        }
        Update: {
          achievement_badges?: string[] | null
          api_documentation_url?: string | null
          average_rating?: number | null
          awards?: Json | null
          brochure_url?: string | null
          case_studies?: Json | null
          categories?: string[] | null
          certifications?: Json | null
          challenges_discovered?: string[] | null
          code?: string | null
          compliance_certifications?: Json | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_template_url?: string | null
          created_at?: string
          deleted_by?: string | null
          deleted_date?: string | null
          demo_url?: string | null
          demo_video_url?: string | null
          demos_requested_count?: number | null
          deployment_count?: number | null
          deployment_options?: string[] | null
          deployment_success_rate?: number | null
          deployments?: Json | null
          description_ar?: string | null
          description_en?: string | null
          documentation_url?: string | null
          embedding?: number[] | null
          embedding_generated_date?: string | null
          embedding_model?: string | null
          escalation_level?: number | null
          features?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          implementation_timeline?: string | null
          integration_requirements?: string[] | null
          interests_expressed_count?: number | null
          is_archived?: boolean | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          last_deployed_date?: string | null
          maturity_level?: string | null
          name_ar?: string | null
          name_en?: string
          partnerships?: Json | null
          pilots_won_count?: number | null
          previous_version_id?: string | null
          pricing_details?: Json | null
          pricing_model?: string | null
          proposals_submitted_count?: number | null
          provider_id?: string | null
          provider_name?: string
          provider_type?: string
          publishing_date?: string | null
          ratings?: Json | null
          reviewer_assigned_to?: string | null
          sectors?: string[] | null
          sla_due_date?: string | null
          source_idea_id?: string | null
          source_program_id?: string | null
          source_rd_project_id?: string | null
          submission_date?: string | null
          success_rate?: number | null
          support_contact_email?: string | null
          support_services?: Json | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          technical_specifications?: Json | null
          total_reviews?: number | null
          trl?: number | null
          trl_assessment?: Json | null
          updated_at?: string
          use_cases?: Json | null
          value_proposition?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          version_number?: number | null
          video_url?: string | null
          view_count?: number | null
          website?: string | null
          workflow_stage?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          municipality_id: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          municipality_id?: string | null
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          municipality_id?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "municipality_staff"
        | "provider"
        | "researcher"
        | "citizen"
        | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "municipality_staff",
        "provider",
        "researcher",
        "citizen",
        "viewer",
      ],
    },
  },
} as const
