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
      ab_assignments: {
        Row: {
          assigned_at: string
          experiment_id: string | null
          id: string
          user_email: string | null
          user_id: string | null
          variant: string
        }
        Insert: {
          assigned_at?: string
          experiment_id?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
          variant: string
        }
        Update: {
          assigned_at?: string
          experiment_id?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_conversions: {
        Row: {
          assignment_id: string | null
          conversion_type: string
          conversion_value: number | null
          created_at: string
          experiment_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          conversion_type: string
          conversion_value?: number | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          conversion_type?: string
          conversion_value?: number | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_conversions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "ab_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_conversions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_experiments: {
        Row: {
          allocation_percentages: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string
          variants: Json
        }
        Insert: {
          allocation_percentages?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
          variants?: Json
        }
        Update: {
          allocation_percentages?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
          variants?: Json
        }
        Relationships: []
      }
      access_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          is_admin_action: boolean | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          is_admin_action?: boolean | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          is_admin_action?: boolean | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          points: number | null
          requirements: Json | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          points?: number | null
          requirements?: Json | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          points?: number | null
          requirements?: Json | null
        }
        Relationships: []
      }
      action_items: {
        Row: {
          action_plan_id: string | null
          budget: number | null
          created_at: string | null
          deliverables: string[] | null
          dependencies: string[] | null
          description: string | null
          end_date: string | null
          id: string
          owner_email: string | null
          progress_percentage: number | null
          start_date: string | null
          status: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
        }
        Insert: {
          action_plan_id?: string | null
          budget?: number | null
          created_at?: string | null
          deliverables?: string[] | null
          dependencies?: string[] | null
          description?: string | null
          end_date?: string | null
          id?: string
          owner_email?: string | null
          progress_percentage?: number | null
          start_date?: string | null
          status?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
        }
        Update: {
          action_plan_id?: string | null
          budget?: number | null
          created_at?: string | null
          deliverables?: string[] | null
          dependencies?: string[] | null
          description?: string | null
          end_date?: string | null
          id?: string
          owner_email?: string | null
          progress_percentage?: number | null
          start_date?: string | null
          status?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          end_date: string | null
          id: string
          objective_id: string | null
          objective_title: string | null
          owner_email: string | null
          start_date: string | null
          status: string | null
          strategic_plan_id: string | null
          title_ar: string | null
          title_en: string
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          objective_id?: string | null
          objective_title?: string | null
          owner_email?: string | null
          start_date?: string | null
          status?: string | null
          strategic_plan_id?: string | null
          title_ar?: string | null
          title_en: string
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          objective_id?: string | null
          objective_title?: string | null
          owner_email?: string | null
          start_date?: string | null
          status?: string | null
          strategic_plan_id?: string | null
          title_ar?: string | null
          title_en?: string
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analysis_cache: {
        Row: {
          created_at: string
          endpoint: string
          expires_at: string
          hit_count: number | null
          id: string
          input_hash: string
          input_text: string
          result: Json
        }
        Insert: {
          created_at?: string
          endpoint: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          input_hash: string
          input_text: string
          result: Json
        }
        Update: {
          created_at?: string
          endpoint?: string
          expires_at?: string
          hit_count?: number | null
          id?: string
          input_hash?: string
          input_text?: string
          result?: Json
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          agent_name: string
          created_at: string
          id: string
          metadata: Json | null
          updated_at: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_rate_limits: {
        Row: {
          created_at: string
          daily_limit: number
          description: string | null
          hourly_limit: number | null
          id: string
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          daily_limit: number
          description?: string | null
          hourly_limit?: number | null
          id?: string
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          daily_limit?: number
          description?: string | null
          hourly_limit?: number | null
          id?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      ai_usage_tracking: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          session_id: string
          tokens_used: number | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          session_id: string
          tokens_used?: number | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          session_id?: string
          tokens_used?: number | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approver_email: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          escalation_level: number | null
          id: string
          is_deleted: boolean | null
          metadata: Json | null
          rejection_reason: string | null
          request_type: string
          requester_email: string
          requester_notes: string | null
          sla_due_date: string | null
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approver_email?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          escalation_level?: number | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          rejection_reason?: string | null
          request_type: string
          requester_email: string
          requester_notes?: string | null
          sla_due_date?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approver_email?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          escalation_level?: number | null
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          rejection_reason?: string | null
          request_type?: string
          requester_email?: string
          requester_notes?: string | null
          sla_due_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audits: {
        Row: {
          audit_code: string
          audit_end_date: string | null
          audit_scope: string | null
          audit_start_date: string
          audit_trail: Json | null
          audit_type: string
          auditor_email: string
          auditor_name: string | null
          auditor_organization: string | null
          compliance_score: number | null
          corrective_actions: Json | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          entity_id: string
          entity_type: string
          findings: Json | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          is_deleted: boolean | null
          issues_critical: number | null
          issues_high: number | null
          issues_identified: number | null
          overall_rating: string | null
          report_url: string | null
          status: string | null
          supporting_documents: string[] | null
          updated_at: string | null
        }
        Insert: {
          audit_code: string
          audit_end_date?: string | null
          audit_scope?: string | null
          audit_start_date: string
          audit_trail?: Json | null
          audit_type: string
          auditor_email: string
          auditor_name?: string | null
          auditor_organization?: string | null
          compliance_score?: number | null
          corrective_actions?: Json | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          entity_id: string
          entity_type: string
          findings?: Json | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          is_deleted?: boolean | null
          issues_critical?: number | null
          issues_high?: number | null
          issues_identified?: number | null
          overall_rating?: string | null
          report_url?: string | null
          status?: string | null
          supporting_documents?: string[] | null
          updated_at?: string | null
        }
        Update: {
          audit_code?: string
          audit_end_date?: string | null
          audit_scope?: string | null
          audit_start_date?: string
          audit_trail?: Json | null
          audit_type?: string
          auditor_email?: string
          auditor_name?: string | null
          auditor_organization?: string | null
          compliance_score?: number | null
          corrective_actions?: Json | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          entity_id?: string
          entity_type?: string
          findings?: Json | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          is_deleted?: boolean | null
          issues_critical?: number | null
          issues_high?: number | null
          issues_identified?: number | null
          overall_rating?: string | null
          report_url?: string | null
          status?: string | null
          supporting_documents?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      auto_approval_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          municipality_id: string | null
          organization_id: string | null
          persona_type: string
          priority: number | null
          role_to_assign: string
          rule_type: string
          rule_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          municipality_id?: string | null
          organization_id?: string | null
          persona_type: string
          priority?: number | null
          role_to_assign: string
          rule_type: string
          rule_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          municipality_id?: string | null
          organization_id?: string | null
          persona_type?: string
          priority?: number | null
          role_to_assign?: string
          rule_type?: string
          rule_value?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_approval_rules_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_approval_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          user_email?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          allocated_amount: number | null
          approval_status: string | null
          approved_by: string | null
          approved_date: string | null
          budget_code: string | null
          created_at: string | null
          currency: string | null
          deleted_by: string | null
          deleted_date: string | null
          entity_id: string | null
          entity_type: string | null
          fiscal_year: number | null
          id: string
          is_deleted: boolean | null
          is_strategy_allocated: boolean | null
          line_items: Json | null
          name_ar: string | null
          name_en: string
          notes: string | null
          remaining_amount: number | null
          spent_amount: number | null
          status: string | null
          strategic_objective_id: string | null
          strategic_plan_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number | null
          approval_status?: string | null
          approved_by?: string | null
          approved_date?: string | null
          budget_code?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          fiscal_year?: number | null
          id?: string
          is_deleted?: boolean | null
          is_strategy_allocated?: boolean | null
          line_items?: Json | null
          name_ar?: string | null
          name_en: string
          notes?: string | null
          remaining_amount?: number | null
          spent_amount?: number | null
          status?: string | null
          strategic_objective_id?: string | null
          strategic_plan_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number | null
          approval_status?: string | null
          approved_by?: string | null
          approved_date?: string | null
          budget_code?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          fiscal_year?: number | null
          id?: string
          is_deleted?: boolean | null
          is_strategy_allocated?: boolean | null
          line_items?: Json | null
          name_ar?: string | null
          name_en?: string
          notes?: string | null
          remaining_amount?: number | null
          spent_amount?: number | null
          status?: string | null
          strategic_objective_id?: string | null
          strategic_plan_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string
          email_log_id: string | null
          error_message: string | null
          id: string
          recipient_email: string
          recipient_user_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email_log_id?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email_log_id?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_email_log_id_fkey"
            columns: ["email_log_id"]
            isOneToOne: false
            referencedRelation: "email_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          challenge_description: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          entity_id: string | null
          entity_type: string | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          implementation_details: string | null
          is_featured: boolean | null
          is_published: boolean | null
          lessons_learned: string | null
          metrics: Json | null
          municipality_id: string | null
          results_achieved: string | null
          sector_id: string | null
          solution_description: string | null
          tags: string[] | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          challenge_description?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          implementation_details?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          lessons_learned?: string | null
          metrics?: Json | null
          municipality_id?: string | null
          results_achieved?: string | null
          sector_id?: string | null
          solution_description?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          challenge_description?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          implementation_details?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          lessons_learned?: string | null
          metrics?: Json | null
          municipality_id?: string | null
          results_achieved?: string | null
          sector_id?: string | null
          solution_description?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_activities: {
        Row: {
          activity_type: string
          challenge_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_activities_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_activities_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_attachments: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_deleted: boolean | null
          is_public: boolean | null
          upload_date: string | null
          uploaded_by: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_deleted?: boolean | null
          is_public?: boolean | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_deleted?: boolean | null
          is_public?: boolean | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_attachments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_attachments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_interests: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          id: string
          interest_type: string | null
          notes: string | null
          organization_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          interest_type?: string | null
          notes?: string | null
          organization_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          interest_type?: string | null
          notes?: string | null
          organization_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_interests_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_interests_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_interests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_proposals: {
        Row: {
          attachments: string[] | null
          budget_estimate: number | null
          challenge_id: string | null
          created_at: string | null
          description: string | null
          feedback: string | null
          id: string
          is_deleted: boolean | null
          organization_id: string | null
          proposed_solution: string | null
          provider_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          status: string | null
          submitted_at: string | null
          team_description: string | null
          timeline: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          budget_estimate?: number | null
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          feedback?: string | null
          id?: string
          is_deleted?: boolean | null
          organization_id?: string | null
          proposed_solution?: string | null
          provider_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: string | null
          submitted_at?: string | null
          team_description?: string | null
          timeline?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          budget_estimate?: number | null
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          feedback?: string | null
          id?: string
          is_deleted?: boolean | null
          organization_id?: string | null
          proposed_solution?: string | null
          provider_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          status?: string | null
          submitted_at?: string | null
          team_description?: string | null
          timeline?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_proposals_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_proposals_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_proposals_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_solution_matches: {
        Row: {
          challenge_id: string | null
          created_at: string | null
          id: string
          match_score: number | null
          match_type: string | null
          matched_at: string | null
          matched_by: string | null
          notes: string | null
          solution_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          match_score?: number | null
          match_type?: string | null
          matched_at?: string | null
          matched_by?: string | null
          notes?: string | null
          solution_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string | null
          id?: string
          match_score?: number | null
          match_type?: string | null
          matched_at?: string | null
          matched_by?: string | null
          notes?: string | null
          solution_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_solution_matches_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_solution_matches_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_solution_matches_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
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
          created_by: string | null
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
          is_strategy_derived: boolean | null
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
          strategy_derivation_date: string | null
          sub_sector: string | null
          submission_date: string | null
          subsector_id: string | null
          tagline_ar: string | null
          tagline_en: string | null
          tags: string[] | null
          theme: string | null
          timeline_estimate: string | null
          title_ar: string
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
          created_by?: string | null
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
          is_strategy_derived?: boolean | null
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
          strategy_derivation_date?: string | null
          sub_sector?: string | null
          submission_date?: string | null
          subsector_id?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          theme?: string | null
          timeline_estimate?: string | null
          title_ar: string
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
          created_by?: string | null
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
          is_strategy_derived?: boolean | null
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
          strategy_derivation_date?: string | null
          sub_sector?: string | null
          submission_date?: string | null
          subsector_id?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          tags?: string[] | null
          theme?: string | null
          timeline_estimate?: string | null
          title_ar?: string
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
      cities: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          municipality_id: string | null
          name_ar: string
          name_en: string
          population: number | null
          region_id: string | null
          updated_at: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          municipality_id?: string | null
          name_ar: string
          name_en: string
          population?: number | null
          region_id?: string | null
          updated_at?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          municipality_id?: string | null
          name_ar?: string
          name_en?: string
          population?: number | null
          region_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_badges: {
        Row: {
          badge_name: string | null
          badge_type: string
          earned_at: string | null
          id: string
          metadata: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          badge_name?: string | null
          badge_type: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          badge_name?: string | null
          badge_type?: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      citizen_feedback: {
        Row: {
          category: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          feedback_text: string | null
          feedback_type: string | null
          id: string
          is_anonymous: boolean | null
          is_published: boolean | null
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_published?: boolean | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_published?: boolean | null
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      citizen_ideas: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          municipality_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          votes_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          municipality_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          votes_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          municipality_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_ideas_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          notification_type: string
          read_at: string | null
          title: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          title?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          title?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      citizen_pilot_enrollments: {
        Row: {
          created_at: string | null
          enrolled_at: string | null
          enrollment_type: string | null
          feedback: string | null
          id: string
          participation_notes: string | null
          pilot_id: string | null
          rating: number | null
          status: string | null
          user_email: string | null
          user_id: string | null
          withdrawal_reason: string | null
          withdrawn_at: string | null
        }
        Insert: {
          created_at?: string | null
          enrolled_at?: string | null
          enrollment_type?: string | null
          feedback?: string | null
          id?: string
          participation_notes?: string | null
          pilot_id?: string | null
          rating?: number | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
          withdrawal_reason?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          created_at?: string | null
          enrolled_at?: string | null
          enrollment_type?: string | null
          feedback?: string | null
          id?: string
          participation_notes?: string | null
          pilot_id?: string | null
          rating?: number | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
          withdrawal_reason?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_pilot_enrollments_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_pilot_enrollments_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_points: {
        Row: {
          created_at: string | null
          id: string
          last_activity_date: string | null
          level: number | null
          points: number | null
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          points?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          points?: number | null
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      citizen_profiles: {
        Row: {
          accessibility_needs: string | null
          city_id: string | null
          created_at: string | null
          id: string
          interests: string[] | null
          is_verified: boolean | null
          language_preference: string | null
          municipality_id: string | null
          neighborhood: string | null
          notification_preferences: Json | null
          participation_areas: string[] | null
          region_id: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          accessibility_needs?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          language_preference?: string | null
          municipality_id?: string | null
          neighborhood?: string | null
          notification_preferences?: Json | null
          participation_areas?: string[] | null
          region_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          accessibility_needs?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          language_preference?: string | null
          municipality_id?: string | null
          neighborhood?: string | null
          notification_preferences?: Json | null
          participation_areas?: string[] | null
          region_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_profiles_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_votes: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          user_email: string | null
          user_id: string | null
          vote_type: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          user_email?: string | null
          user_id?: string | null
          vote_type?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_email?: string | null
          user_id?: string | null
          vote_type?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          comment_text: string
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          entity_id: string
          entity_type: string
          id: string
          is_deleted: boolean | null
          is_internal: boolean | null
          is_resolved: boolean | null
          likes_count: number | null
          parent_comment_id: string | null
          resolved_by: string | null
          resolved_date: string | null
          updated_at: string | null
          user_email: string
          user_name: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_deleted?: boolean | null
          is_internal?: boolean | null
          is_resolved?: boolean | null
          likes_count?: number | null
          parent_comment_id?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          updated_at?: string | null
          user_email: string
          user_name?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_deleted?: boolean | null
          is_internal?: boolean | null
          is_resolved?: boolean | null
          likes_count?: number | null
          parent_comment_id?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          updated_at?: string | null
          user_email?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_decisions: {
        Row: {
          action_items: Json | null
          committee_name: string
          conditions: string[] | null
          created_at: string | null
          created_by: string | null
          decision_text: string | null
          decision_type: string | null
          due_date: string | null
          id: string
          meeting_date: string | null
          rationale: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          responsible_email: string | null
          strategic_plan_id: string | null
          subject: string
          vote_abstain: number | null
          vote_against: number | null
          vote_for: number | null
        }
        Insert: {
          action_items?: Json | null
          committee_name: string
          conditions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          decision_text?: string | null
          decision_type?: string | null
          due_date?: string | null
          id?: string
          meeting_date?: string | null
          rationale?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          responsible_email?: string | null
          strategic_plan_id?: string | null
          subject: string
          vote_abstain?: number | null
          vote_against?: number | null
          vote_for?: number | null
        }
        Update: {
          action_items?: Json | null
          committee_name?: string
          conditions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          decision_text?: string | null
          decision_type?: string | null
          due_date?: string | null
          id?: string
          meeting_date?: string | null
          rationale?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          responsible_email?: string | null
          strategic_plan_id?: string | null
          subject?: string
          vote_abstain?: number | null
          vote_against?: number | null
          vote_for?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_decisions_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_analytics: {
        Row: {
          channel: string
          communication_plan_id: string | null
          created_at: string | null
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number | null
        }
        Insert: {
          channel: string
          communication_plan_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number | null
        }
        Update: {
          channel?: string
          communication_plan_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_analytics_communication_plan_id_fkey"
            columns: ["communication_plan_id"]
            isOneToOne: false
            referencedRelation: "communication_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_notifications: {
        Row: {
          communication_plan_id: string | null
          content_ar: string | null
          content_en: string | null
          created_at: string | null
          created_by: string | null
          delivery_stats: Json | null
          error_message: string | null
          id: string
          notification_type: string
          recipient_audience_id: string | null
          recipient_emails: string[] | null
          recipient_type: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject_ar: string | null
          subject_en: string | null
        }
        Insert: {
          communication_plan_id?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_stats?: Json | null
          error_message?: string | null
          id?: string
          notification_type: string
          recipient_audience_id?: string | null
          recipient_emails?: string[] | null
          recipient_type: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject_ar?: string | null
          subject_en?: string | null
        }
        Update: {
          communication_plan_id?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_stats?: Json | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_audience_id?: string | null
          recipient_emails?: string[] | null
          recipient_type?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject_ar?: string | null
          subject_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_notifications_communication_plan_id_fkey"
            columns: ["communication_plan_id"]
            isOneToOne: false
            referencedRelation: "communication_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_plans: {
        Row: {
          channel_strategy: Json | null
          content_calendar: Json | null
          created_at: string | null
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          end_date: string | null
          id: string
          key_messages: Json | null
          master_narrative_ar: string | null
          master_narrative_en: string | null
          name_ar: string | null
          name_en: string
          owner_email: string | null
          start_date: string | null
          status: string | null
          strategic_plan_id: string | null
          target_audiences: Json | null
          updated_at: string | null
        }
        Insert: {
          channel_strategy?: Json | null
          content_calendar?: Json | null
          created_at?: string | null
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          end_date?: string | null
          id?: string
          key_messages?: Json | null
          master_narrative_ar?: string | null
          master_narrative_en?: string | null
          name_ar?: string | null
          name_en: string
          owner_email?: string | null
          start_date?: string | null
          status?: string | null
          strategic_plan_id?: string | null
          target_audiences?: Json | null
          updated_at?: string | null
        }
        Update: {
          channel_strategy?: Json | null
          content_calendar?: Json | null
          created_at?: string | null
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          end_date?: string | null
          id?: string
          key_messages?: Json | null
          master_narrative_ar?: string | null
          master_narrative_en?: string | null
          name_ar?: string | null
          name_en?: string
          owner_email?: string | null
          start_date?: string | null
          status?: string | null
          strategic_plan_id?: string | null
          target_audiences?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_plans_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_code: string
          contract_type: string | null
          contract_value: number | null
          created_at: string | null
          currency: string | null
          deleted_by: string | null
          deleted_date: string | null
          deliverables: Json | null
          document_url: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          milestones: Json | null
          municipality_id: string | null
          payment_terms: Json | null
          pilot_id: string | null
          provider_id: string | null
          signed_by_municipality: string | null
          signed_by_provider: string | null
          signed_date: string | null
          solution_id: string | null
          start_date: string | null
          status: string | null
          terms_and_conditions: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
        }
        Insert: {
          contract_code: string
          contract_type?: string | null
          contract_value?: number | null
          created_at?: string | null
          currency?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          deliverables?: Json | null
          document_url?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          milestones?: Json | null
          municipality_id?: string | null
          payment_terms?: Json | null
          pilot_id?: string | null
          provider_id?: string | null
          signed_by_municipality?: string | null
          signed_by_provider?: string | null
          signed_date?: string | null
          solution_id?: string | null
          start_date?: string | null
          status?: string | null
          terms_and_conditions?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
        }
        Update: {
          contract_code?: string
          contract_type?: string | null
          contract_value?: number | null
          created_at?: string | null
          currency?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          deliverables?: Json | null
          document_url?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          milestones?: Json | null
          municipality_id?: string | null
          payment_terms?: Json | null
          pilot_id?: string | null
          provider_id?: string | null
          signed_by_municipality?: string | null
          signed_by_provider?: string | null
          signed_date?: string | null
          solution_id?: string | null
          start_date?: string | null
          status?: string | null
          terms_and_conditions?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      coverage_snapshots: {
        Row: {
          created_at: string
          entity_coverage: Json
          fully_covered_objectives: number | null
          gap_analysis: Json
          id: string
          objective_coverage: Json
          overall_coverage_pct: number | null
          snapshot_date: string
          strategic_plan_id: string | null
          total_gap_items: number | null
          total_objectives: number | null
        }
        Insert: {
          created_at?: string
          entity_coverage?: Json
          fully_covered_objectives?: number | null
          gap_analysis?: Json
          id?: string
          objective_coverage?: Json
          overall_coverage_pct?: number | null
          snapshot_date?: string
          strategic_plan_id?: string | null
          total_gap_items?: number | null
          total_objectives?: number | null
        }
        Update: {
          created_at?: string
          entity_coverage?: Json
          fully_covered_objectives?: number | null
          gap_analysis?: Json
          id?: string
          objective_coverage?: Json
          overall_coverage_pct?: number | null
          snapshot_date?: string
          strategic_plan_id?: string | null
          total_gap_items?: number | null
          total_objectives?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coverage_snapshots_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_entries: {
        Row: {
          created_at: string | null
          entry_type: string
          id: string
          merged_into_id: string | null
          name_ar: string | null
          name_en: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_by_email: string
          submitted_by_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entry_type: string
          id?: string
          merged_into_id?: string | null
          name_ar?: string | null
          name_en: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_by_email: string
          submitted_by_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entry_type?: string
          id?: string
          merged_into_id?: string | null
          name_ar?: string | null
          name_en?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_by_email?: string
          submitted_by_user_id?: string | null
        }
        Relationships: []
      }
      custom_expertise_areas: {
        Row: {
          ai_validation_notes: string | null
          ai_validation_score: number | null
          created_at: string | null
          id: string
          merged_into_sector_id: string | null
          name_ar: string | null
          name_en: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          similar_to_sector_id: string | null
          status: string | null
          submitted_by_email: string
          submitted_by_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          ai_validation_notes?: string | null
          ai_validation_score?: number | null
          created_at?: string | null
          id?: string
          merged_into_sector_id?: string | null
          name_ar?: string | null
          name_en: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          similar_to_sector_id?: string | null
          status?: string | null
          submitted_by_email: string
          submitted_by_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_validation_notes?: string | null
          ai_validation_score?: number | null
          created_at?: string | null
          id?: string
          merged_into_sector_id?: string | null
          name_ar?: string | null
          name_en?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          similar_to_sector_id?: string | null
          status?: string | null
          submitted_by_email?: string
          submitted_by_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_expertise_areas_merged_into_sector_id_fkey"
            columns: ["merged_into_sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_expertise_areas_similar_to_sector_id_fkey"
            columns: ["similar_to_sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      delegation_rules: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          created_at: string | null
          delegate_email: string
          delegator_email: string
          end_date: string
          id: string
          is_active: boolean | null
          permission_types: string[] | null
          reason: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string | null
          delegate_email: string
          delegator_email: string
          end_date: string
          id?: string
          is_active?: boolean | null
          permission_types?: string[] | null
          reason?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string | null
          delegate_email?: string
          delegator_email?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          permission_types?: string[] | null
          reason?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      demand_queue: {
        Row: {
          attempts: number
          batch_id: string | null
          created_at: string
          created_by: string | null
          entity_type: string
          generated_entity_id: string | null
          generated_entity_type: string | null
          generator_component: string
          id: string
          last_attempt_at: string | null
          max_attempts: number
          objective_id: string | null
          pillar_id: string | null
          prefilled_spec: Json
          priority_factors: Json | null
          priority_score: number
          quality_feedback: Json | null
          quality_score: number | null
          status: string
          strategic_plan_id: string | null
          updated_at: string
        }
        Insert: {
          attempts?: number
          batch_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_type: string
          generated_entity_id?: string | null
          generated_entity_type?: string | null
          generator_component: string
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          objective_id?: string | null
          pillar_id?: string | null
          prefilled_spec?: Json
          priority_factors?: Json | null
          priority_score?: number
          quality_feedback?: Json | null
          quality_score?: number | null
          status?: string
          strategic_plan_id?: string | null
          updated_at?: string
        }
        Update: {
          attempts?: number
          batch_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_type?: string
          generated_entity_id?: string | null
          generated_entity_type?: string | null
          generator_component?: string
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          objective_id?: string | null
          pillar_id?: string | null
          prefilled_spec?: Json
          priority_factors?: Json | null
          priority_score?: number
          quality_feedback?: Json | null
          quality_score?: number | null
          status?: string
          strategic_plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_queue_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          completed_date: string | null
          created_at: string | null
          feedback: string | null
          id: string
          is_deleted: boolean | null
          notes: string | null
          organization_id: string | null
          organization_name: string | null
          preferred_date: string | null
          preferred_time: string | null
          requester_email: string
          requester_name: string | null
          requester_phone: string | null
          scheduled_date: string | null
          solution_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          organization_id?: string | null
          organization_name?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          requester_email: string
          requester_name?: string | null
          requester_phone?: string | null
          scheduled_date?: string | null
          solution_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          organization_id?: string | null
          organization_name?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          requester_email?: string
          requester_name?: string | null
          requester_phone?: string | null
          scheduled_date?: string | null
          solution_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_requests_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      deputyships: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          domain_id: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          domain_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          domain_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deputyships_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          audience_filter: Json | null
          audience_type: string
          campaign_variables: Json | null
          challenge_id: string | null
          clicked_count: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          failed_count: number | null
          id: string
          name: string
          opened_count: number | null
          program_id: string | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          audience_filter?: Json | null
          audience_type?: string
          campaign_variables?: Json | null
          challenge_id?: string | null
          clicked_count?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name: string
          opened_count?: number | null
          program_id?: string | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          audience_filter?: Json | null
          audience_type?: string
          campaign_variables?: Json | null
          challenge_id?: string | null
          clicked_count?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name?: string
          opened_count?: number | null
          program_id?: string | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_digest_queue: {
        Row: {
          created_at: string
          digest_id: string | null
          digest_type: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          language: string | null
          priority: number | null
          processed_at: string | null
          template_key: string
          trigger_key: string
          user_email: string
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string
          digest_id?: string | null
          digest_type?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          language?: string | null
          priority?: number | null
          processed_at?: string | null
          template_key: string
          trigger_key: string
          user_email: string
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string
          digest_id?: string | null
          digest_type?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          language?: string | null
          priority?: number | null
          processed_at?: string | null
          template_key?: string
          trigger_key?: string
          user_email?: string
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          body_preview: string | null
          bounced_at: string | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          language: string | null
          opened_at: string | null
          recipient_email: string
          recipient_user_id: string | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          template_key: string | null
          triggered_by: string | null
          variables_used: Json | null
        }
        Insert: {
          body_preview?: string | null
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          language?: string | null
          opened_at?: string | null
          recipient_email: string
          recipient_user_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          template_key?: string | null
          triggered_by?: string | null
          variables_used?: Json | null
        }
        Update: {
          body_preview?: string | null
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          language?: string | null
          opened_at?: string | null
          recipient_email?: string
          recipient_user_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          template_key?: string | null
          triggered_by?: string | null
          variables_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          attempts: number | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          language: string | null
          last_attempt_at: string | null
          max_attempts: number | null
          priority: number | null
          recipient_email: string
          recipient_user_id: string | null
          scheduled_for: string
          source_id: string | null
          source_type: string | null
          status: string | null
          template_key: string | null
          triggered_by: string | null
          variables: Json | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          language?: string | null
          last_attempt_at?: string | null
          max_attempts?: number | null
          priority?: number | null
          recipient_email: string
          recipient_user_id?: string | null
          scheduled_for?: string
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          template_key?: string | null
          triggered_by?: string | null
          variables?: Json | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          language?: string | null
          last_attempt_at?: string | null
          max_attempts?: number | null
          priority?: number | null
          recipient_email?: string
          recipient_user_id?: string | null
          scheduled_for?: string
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          template_key?: string | null
          triggered_by?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_ar: string | null
          body_en: string
          category: string
          created_at: string | null
          created_by: string | null
          cta_text_ar: string | null
          cta_text_en: string | null
          cta_url_variable: string | null
          description: string | null
          header_gradient_end: string | null
          header_gradient_start: string | null
          header_icon: string | null
          header_title_ar: string | null
          header_title_en: string | null
          id: string
          is_active: boolean | null
          is_critical: boolean | null
          is_html: boolean | null
          is_system: boolean | null
          name_ar: string | null
          name_en: string
          preference_category: string | null
          subject_ar: string | null
          subject_en: string
          template_key: string
          updated_at: string | null
          updated_by: string | null
          use_footer: boolean | null
          use_header: boolean | null
          variables: Json | null
          version: number | null
        }
        Insert: {
          body_ar?: string | null
          body_en: string
          category: string
          created_at?: string | null
          created_by?: string | null
          cta_text_ar?: string | null
          cta_text_en?: string | null
          cta_url_variable?: string | null
          description?: string | null
          header_gradient_end?: string | null
          header_gradient_start?: string | null
          header_icon?: string | null
          header_title_ar?: string | null
          header_title_en?: string | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          is_html?: boolean | null
          is_system?: boolean | null
          name_ar?: string | null
          name_en: string
          preference_category?: string | null
          subject_ar?: string | null
          subject_en: string
          template_key: string
          updated_at?: string | null
          updated_by?: string | null
          use_footer?: boolean | null
          use_header?: boolean | null
          variables?: Json | null
          version?: number | null
        }
        Update: {
          body_ar?: string | null
          body_en?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          cta_text_ar?: string | null
          cta_text_en?: string | null
          cta_url_variable?: string | null
          description?: string | null
          header_gradient_end?: string | null
          header_gradient_start?: string | null
          header_icon?: string | null
          header_title_ar?: string | null
          header_title_en?: string | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          is_html?: boolean | null
          is_system?: boolean | null
          name_ar?: string | null
          name_en?: string
          preference_category?: string | null
          subject_ar?: string | null
          subject_en?: string
          template_key?: string
          updated_at?: string | null
          updated_by?: string | null
          use_footer?: boolean | null
          use_header?: boolean | null
          variables?: Json | null
          version?: number | null
        }
        Relationships: []
      }
      email_trigger_config: {
        Row: {
          additional_recipients_field: string | null
          created_at: string
          delay_seconds: number | null
          id: string
          is_active: boolean | null
          priority: number | null
          recipient_field: string | null
          recipient_query: Json | null
          respect_preferences: boolean | null
          template_key: string
          trigger_key: string
          updated_at: string
          variable_mapping: Json | null
        }
        Insert: {
          additional_recipients_field?: string | null
          created_at?: string
          delay_seconds?: number | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          recipient_field?: string | null
          recipient_query?: Json | null
          respect_preferences?: boolean | null
          template_key: string
          trigger_key: string
          updated_at?: string
          variable_mapping?: Json | null
        }
        Update: {
          additional_recipients_field?: string | null
          created_at?: string
          delay_seconds?: number | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          recipient_field?: string | null
          recipient_query?: Json | null
          respect_preferences?: boolean | null
          template_key?: string
          trigger_key?: string
          updated_at?: string
          variable_mapping?: Json | null
        }
        Relationships: []
      }
      environmental_factors: {
        Row: {
          category: string
          created_at: string | null
          created_by_email: string | null
          date_identified: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          impact_level: string | null
          impact_type: string | null
          source: string | null
          strategic_plan_id: string | null
          title_ar: string | null
          title_en: string
          trend: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by_email?: string | null
          date_identified?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          impact_level?: string | null
          impact_type?: string | null
          source?: string | null
          strategic_plan_id?: string | null
          title_ar?: string | null
          title_en: string
          trend?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by_email?: string | null
          date_identified?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          impact_level?: string | null
          impact_type?: string | null
          source?: string | null
          strategic_plan_id?: string | null
          title_ar?: string | null
          title_en?: string
          trend?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "environmental_factors_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_templates: {
        Row: {
          created_at: string | null
          criteria: Json | null
          description_ar: string | null
          description_en: string | null
          entity_type: string | null
          id: string
          is_active: boolean | null
          max_score: number | null
          name_ar: string | null
          name_en: string
          scoring_method: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          criteria?: Json | null
          description_ar?: string | null
          description_en?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          name_ar?: string | null
          name_en: string
          scoring_method?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: Json | null
          description_ar?: string | null
          description_en?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          name_ar?: string | null
          name_en?: string
          scoring_method?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attendance_status: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          event_id: string
          feedback_submitted: boolean | null
          id: string
          notes: string | null
          organization_id: string | null
          registration_date: string | null
          status: string | null
          user_email: string
          user_name: string | null
        }
        Insert: {
          attendance_status?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          event_id: string
          feedback_submitted?: boolean | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          registration_date?: string | null
          status?: string | null
          user_email: string
          user_name?: string | null
        }
        Update: {
          attendance_status?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          event_id?: string
          feedback_submitted?: boolean | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          registration_date?: string | null
          status?: string | null
          user_email?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          budget_actual: number | null
          budget_currency: string | null
          budget_estimate: number | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          end_date: string | null
          event_type: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          is_strategy_derived: boolean | null
          is_virtual: boolean | null
          location: string | null
          location_ar: string | null
          max_participants: number | null
          municipality_id: string | null
          program_id: string | null
          program_sync_source: string | null
          program_synced: boolean | null
          registration_deadline: string | null
          reminder_sent_at: string | null
          start_date: string | null
          status: string | null
          strategic_alignment_score: number | null
          strategic_objective_ids: string[] | null
          strategic_pillar_id: string | null
          strategic_plan_ids: string[] | null
          strategy_derivation_date: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          virtual_link: string | null
        }
        Insert: {
          budget_actual?: number | null
          budget_currency?: string | null
          budget_estimate?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          is_strategy_derived?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          location_ar?: string | null
          max_participants?: number | null
          municipality_id?: string | null
          program_id?: string | null
          program_sync_source?: string | null
          program_synced?: boolean | null
          registration_deadline?: string | null
          reminder_sent_at?: string | null
          start_date?: string | null
          status?: string | null
          strategic_alignment_score?: number | null
          strategic_objective_ids?: string[] | null
          strategic_pillar_id?: string | null
          strategic_plan_ids?: string[] | null
          strategy_derivation_date?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          virtual_link?: string | null
        }
        Update: {
          budget_actual?: number | null
          budget_currency?: string | null
          budget_estimate?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          is_strategy_derived?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          location_ar?: string | null
          max_participants?: number | null
          municipality_id?: string | null
          program_id?: string | null
          program_sync_source?: string | null
          program_synced?: boolean | null
          registration_deadline?: string | null
          reminder_sent_at?: string | null
          start_date?: string | null
          status?: string | null
          strategic_alignment_score?: number | null
          strategic_objective_ids?: string[] | null
          strategic_pillar_id?: string | null
          strategic_plan_ids?: string[] | null
          strategy_derivation_date?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          virtual_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      exemption_audit_logs: {
        Row: {
          action: string
          exemption_id: string | null
          id: string
          new_values: Json | null
          notes: string | null
          old_values: Json | null
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          exemption_id?: string | null
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          exemption_id?: string | null
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exemption_audit_logs_exemption_id_fkey"
            columns: ["exemption_id"]
            isOneToOne: false
            referencedRelation: "regulatory_exemptions"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_assignments: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          assignment_type: string | null
          completed_date: string | null
          created_at: string | null
          due_date: string | null
          entity_id: string
          entity_type: string
          expert_id: string | null
          id: string
          is_deleted: boolean | null
          notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          assignment_type?: string | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          entity_id: string
          entity_type: string
          expert_id?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          assignment_type?: string | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          entity_id?: string
          entity_type?: string
          expert_id?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_assignments_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_evaluations: {
        Row: {
          comments: string | null
          created_at: string | null
          criteria_scores: Json | null
          entity_id: string
          entity_type: string
          evaluator_email: string | null
          evaluator_id: string | null
          evaluator_name: string | null
          id: string
          recommendation: string | null
          score: number | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          criteria_scores?: Json | null
          entity_id: string
          entity_type: string
          evaluator_email?: string | null
          evaluator_id?: string | null
          evaluator_name?: string | null
          id?: string
          recommendation?: string | null
          score?: number | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          criteria_scores?: Json | null
          entity_id?: string
          entity_type?: string
          evaluator_email?: string | null
          evaluator_id?: string | null
          evaluator_name?: string | null
          id?: string
          recommendation?: string | null
          score?: number | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expert_panels: {
        Row: {
          chair_email: string | null
          created_at: string | null
          description: string | null
          expertise_areas: string[] | null
          id: string
          is_active: boolean | null
          member_emails: string[] | null
          name_ar: string | null
          name_en: string
          panel_type: string | null
          sector_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          chair_email?: string | null
          created_at?: string | null
          description?: string | null
          expertise_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          member_emails?: string[] | null
          name_ar?: string | null
          name_en: string
          panel_type?: string | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          chair_email?: string | null
          created_at?: string | null
          description?: string | null
          expertise_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          member_emails?: string[] | null
          name_ar?: string | null
          name_en?: string
          panel_type?: string | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_panels_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_profiles: {
        Row: {
          availability_status: string | null
          bio_ar: string | null
          bio_en: string | null
          certifications: Json | null
          created_at: string | null
          education: Json | null
          experience: Json | null
          expertise_areas: string[] | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          linkedin_url: string | null
          name_ar: string | null
          name_en: string
          organization: string | null
          photo_url: string | null
          publications: Json | null
          rating: number | null
          review_count: number | null
          sectors: string[] | null
          title_ar: string | null
          title_en: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          availability_status?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          certifications?: Json | null
          created_at?: string | null
          education?: Json | null
          experience?: Json | null
          expertise_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          name_ar?: string | null
          name_en: string
          organization?: string | null
          photo_url?: string | null
          publications?: Json | null
          rating?: number | null
          review_count?: number | null
          sectors?: string[] | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          availability_status?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          certifications?: Json | null
          created_at?: string | null
          education?: Json | null
          experience?: Json | null
          expertise_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          linkedin_url?: string | null
          name_ar?: string | null
          name_en?: string
          organization?: string | null
          photo_url?: string | null
          publications?: Json | null
          rating?: number | null
          review_count?: number | null
          sectors?: string[] | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          follower_email: string
          id: string
          notify_on_updates: boolean | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          follower_email: string
          id?: string
          notify_on_updates?: boolean | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          follower_email?: string
          id?: string
          notify_on_updates?: boolean | null
        }
        Relationships: []
      }
      generation_history: {
        Row: {
          attempt_number: number
          completion_tokens: number | null
          created_at: string
          entity_id: string | null
          entity_type: string
          error_message: string | null
          generation_time_ms: number | null
          id: string
          input_spec: Json | null
          outcome: string
          output_entity: Json | null
          overall_score: number | null
          prompt_tokens: number | null
          quality_assessment: Json | null
          queue_item_id: string | null
          strategic_plan_id: string | null
        }
        Insert: {
          attempt_number?: number
          completion_tokens?: number | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          generation_time_ms?: number | null
          id?: string
          input_spec?: Json | null
          outcome: string
          output_entity?: Json | null
          overall_score?: number | null
          prompt_tokens?: number | null
          quality_assessment?: Json | null
          queue_item_id?: string | null
          strategic_plan_id?: string | null
        }
        Update: {
          attempt_number?: number
          completion_tokens?: number | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          generation_time_ms?: number | null
          id?: string
          input_spec?: Json | null
          outcome?: string
          output_entity?: Json | null
          overall_score?: number | null
          prompt_tokens?: number | null
          quality_assessment?: Json | null
          queue_item_id?: string | null
          strategic_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_history_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "demand_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_history_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      global_trends: {
        Row: {
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          linked_objective_ids: string[] | null
          relevance_to_saudi: string | null
          source: string | null
          source_url: string | null
          strategic_plan_ids: string[] | null
          strategic_relevance_score: number | null
          tags: string[] | null
          title_ar: string | null
          title_en: string
          trend_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          linked_objective_ids?: string[] | null
          relevance_to_saudi?: string | null
          source?: string | null
          source_url?: string | null
          strategic_plan_ids?: string[] | null
          strategic_relevance_score?: number | null
          tags?: string[] | null
          title_ar?: string | null
          title_en: string
          trend_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          linked_objective_ids?: string[] | null
          relevance_to_saudi?: string | null
          source?: string | null
          source_url?: string | null
          strategic_plan_ids?: string[] | null
          strategic_relevance_score?: number | null
          tags?: string[] | null
          title_ar?: string | null
          title_en?: string
          trend_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      idea_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          idea_id: string | null
          is_deleted: boolean | null
          likes_count: number | null
          parent_comment_id: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          idea_id?: string | null
          is_deleted?: boolean | null
          likes_count?: number | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          idea_id?: string | null
          is_deleted?: boolean | null
          likes_count?: number | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "citizen_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_stories: {
        Row: {
          after_situation: string | null
          before_situation: string | null
          created_at: string | null
          created_by: string | null
          entity_id: string | null
          entity_type: string
          full_story_ar: string | null
          full_story_en: string | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          key_metrics: Json | null
          lessons_learned: string[] | null
          published_date: string | null
          share_count: number | null
          strategic_plan_id: string | null
          summary_ar: string | null
          summary_en: string | null
          tags: string[] | null
          testimonials: Json | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          after_situation?: string | null
          before_situation?: string | null
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          entity_type: string
          full_story_ar?: string | null
          full_story_en?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          key_metrics?: Json | null
          lessons_learned?: string[] | null
          published_date?: string | null
          share_count?: number | null
          strategic_plan_id?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          tags?: string[] | null
          testimonials?: Json | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          after_situation?: string | null
          before_situation?: string | null
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string
          full_story_ar?: string | null
          full_story_en?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          key_metrics?: Json | null
          lessons_learned?: string[] | null
          published_date?: string | null
          share_count?: number | null
          strategic_plan_id?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          tags?: string[] | null
          testimonials?: Json | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_stories_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          corrective_actions: Json | null
          created_at: string | null
          description: string | null
          id: string
          incident_date: string | null
          incident_type: string
          investigation_status: string | null
          is_closed: boolean | null
          lessons_learned: string | null
          pilot_id: string | null
          reported_by: string | null
          reported_date: string | null
          resolution_date: string | null
          root_cause: string | null
          sandbox_id: string | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          corrective_actions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          incident_date?: string | null
          incident_type: string
          investigation_status?: string | null
          is_closed?: boolean | null
          lessons_learned?: string | null
          pilot_id?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution_date?: string | null
          root_cause?: string | null
          sandbox_id?: string | null
          severity: string
          title: string
          updated_at?: string | null
        }
        Update: {
          corrective_actions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          incident_date?: string | null
          incident_type?: string
          investigation_status?: string | null
          is_closed?: boolean | null
          lessons_learned?: string | null
          pilot_id?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution_date?: string | null
          root_cause?: string | null
          sandbox_id?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_sandbox_id_fkey"
            columns: ["sandbox_id"]
            isOneToOne: false
            referencedRelation: "sandboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_proposals: {
        Row: {
          attachments: string[] | null
          budget_estimate: number | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          expected_impact: string | null
          feedback: string | null
          id: string
          is_deleted: boolean | null
          organization_id: string | null
          proposal_type: string | null
          proposed_solution: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          sector_id: string | null
          status: string | null
          submitted_at: string | null
          submitter_email: string | null
          submitter_id: string | null
          target_challenges: string[] | null
          team_info: Json | null
          timeline: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          budget_estimate?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          expected_impact?: string | null
          feedback?: string | null
          id?: string
          is_deleted?: boolean | null
          organization_id?: string | null
          proposal_type?: string | null
          proposed_solution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          sector_id?: string | null
          status?: string | null
          submitted_at?: string | null
          submitter_email?: string | null
          submitter_id?: string | null
          target_challenges?: string[] | null
          team_info?: Json | null
          timeline?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          budget_estimate?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          expected_impact?: string | null
          feedback?: string | null
          id?: string
          is_deleted?: boolean | null
          organization_id?: string | null
          proposal_type?: string | null
          proposed_solution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          sector_id?: string | null
          status?: string | null
          submitted_at?: string | null
          submitter_email?: string | null
          submitter_id?: string | null
          target_challenges?: string[] | null
          team_info?: Json | null
          timeline?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "innovation_proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_proposals_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string | null
          currency: string | null
          deleted_by: string | null
          deleted_date: string | null
          description: string | null
          document_url: string | null
          due_date: string | null
          id: string
          invoice_number: string
          is_deleted: boolean | null
          issue_date: string | null
          line_items: Json | null
          municipality_id: string | null
          paid_date: string | null
          payment_reference: string | null
          pilot_id: string | null
          provider_id: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          description?: string | null
          document_url?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          is_deleted?: boolean | null
          issue_date?: string | null
          line_items?: Json | null
          municipality_id?: string | null
          paid_date?: string | null
          payment_reference?: string | null
          pilot_id?: string | null
          provider_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          description?: string | null
          document_url?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          is_deleted?: boolean | null
          issue_date?: string | null
          line_items?: Json | null
          municipality_id?: string | null
          paid_date?: string | null
          payment_reference?: string | null
          pilot_id?: string | null
          provider_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          author: string | null
          category: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          document_type: string | null
          download_count: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_published: boolean | null
          sector_id: string | null
          tags: string[] | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          document_type?: string | null
          download_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          sector_id?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          document_type?: string | null
          download_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          sector_id?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_references: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          measurement_type: string | null
          name_ar: string | null
          name_en: string
          sector_id: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          measurement_type?: string | null
          name_ar?: string | null
          name_en: string
          sector_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          measurement_type?: string | null
          name_ar?: string | null
          name_en?: string
          sector_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_references_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      living_lab_bookings: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_deleted: boolean | null
          living_lab_id: string | null
          notes: string | null
          organization_id: string | null
          pilot_id: string | null
          project_id: string | null
          project_name: string | null
          project_type: string | null
          rd_project_id: string | null
          resources_needed: Json | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_deleted?: boolean | null
          living_lab_id?: string | null
          notes?: string | null
          organization_id?: string | null
          pilot_id?: string | null
          project_id?: string | null
          project_name?: string | null
          project_type?: string | null
          rd_project_id?: string | null
          resources_needed?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_deleted?: boolean | null
          living_lab_id?: string | null
          notes?: string | null
          organization_id?: string | null
          pilot_id?: string | null
          project_id?: string | null
          project_name?: string | null
          project_type?: string | null
          rd_project_id?: string | null
          resources_needed?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "living_lab_bookings_living_lab_id_fkey"
            columns: ["living_lab_id"]
            isOneToOne: false
            referencedRelation: "living_labs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "living_lab_bookings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "living_lab_bookings_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "living_lab_bookings_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "living_lab_bookings_rd_project_id_fkey"
            columns: ["rd_project_id"]
            isOneToOne: false
            referencedRelation: "rd_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      living_lab_resource_bookings: {
        Row: {
          booked_by: string | null
          booking_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          living_lab_id: string | null
          notes: string | null
          resource_name: string | null
          resource_type: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          booked_by?: string | null
          booking_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          living_lab_id?: string | null
          notes?: string | null
          resource_name?: string | null
          resource_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          booked_by?: string | null
          booking_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          living_lab_id?: string | null
          notes?: string | null
          resource_name?: string | null
          resource_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "living_lab_resource_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "living_lab_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "living_lab_resource_bookings_living_lab_id_fkey"
            columns: ["living_lab_id"]
            isOneToOne: false
            referencedRelation: "living_labs"
            referencedColumns: ["id"]
          },
        ]
      }
      living_labs: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          coordinates: Json | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          domain: string | null
          facilities: Json | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_strategy_derived: boolean | null
          location: string | null
          municipality_id: string | null
          name_ar: string | null
          name_en: string
          region_id: string | null
          research_priorities: string[] | null
          status: string | null
          strategic_objective_ids: string[] | null
          strategic_plan_ids: string[] | null
          strategic_taxonomy_codes: string[] | null
          strategy_derivation_date: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coordinates?: Json | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          domain?: string | null
          facilities?: Json | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_strategy_derived?: boolean | null
          location?: string | null
          municipality_id?: string | null
          name_ar?: string | null
          name_en: string
          region_id?: string | null
          research_priorities?: string[] | null
          status?: string | null
          strategic_objective_ids?: string[] | null
          strategic_plan_ids?: string[] | null
          strategic_taxonomy_codes?: string[] | null
          strategy_derivation_date?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          coordinates?: Json | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          domain?: string | null
          facilities?: Json | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_strategy_derived?: boolean | null
          location?: string | null
          municipality_id?: string | null
          name_ar?: string | null
          name_en?: string
          region_id?: string | null
          research_priorities?: string[] | null
          status?: string | null
          strategic_objective_ids?: string[] | null
          strategic_plan_ids?: string[] | null
          strategic_taxonomy_codes?: string[] | null
          strategy_derivation_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "living_labs_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "living_labs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      lookup_departments: {
        Row: {
          code: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookup_departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lookup_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      lookup_governance_roles: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
        }
        Relationships: []
      }
      lookup_risk_categories: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
        }
        Relationships: []
      }
      lookup_specializations: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lookup_stakeholder_types: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
        }
        Relationships: []
      }
      lookup_strategic_themes: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
        }
        Relationships: []
      }
      lookup_technologies: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
        }
        Relationships: []
      }
      lookup_vision_programs: {
        Row: {
          code: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          official_url: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          official_url?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          official_url?: string | null
        }
        Relationships: []
      }
      matchmaker_applications: {
        Row: {
          ai_match_score: number | null
          application_code: string | null
          application_date: string | null
          classification: string | null
          contact_email: string
          contact_name: string | null
          contact_phone: string | null
          conversion_status: string | null
          converted_pilot_id: string | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          id: string
          is_deleted: boolean | null
          matched_challenges: string[] | null
          organization_id: string | null
          organization_name_ar: string | null
          organization_name_en: string
          proposed_capabilities: string | null
          rejection_reason: string | null
          solution_id: string | null
          status: string | null
          tags: string[] | null
          target_challenges: string[] | null
          updated_at: string | null
          workflow_stage: string | null
        }
        Insert: {
          ai_match_score?: number | null
          application_code?: string | null
          application_date?: string | null
          classification?: string | null
          contact_email: string
          contact_name?: string | null
          contact_phone?: string | null
          conversion_status?: string | null
          converted_pilot_id?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          id?: string
          is_deleted?: boolean | null
          matched_challenges?: string[] | null
          organization_id?: string | null
          organization_name_ar?: string | null
          organization_name_en: string
          proposed_capabilities?: string | null
          rejection_reason?: string | null
          solution_id?: string | null
          status?: string | null
          tags?: string[] | null
          target_challenges?: string[] | null
          updated_at?: string | null
          workflow_stage?: string | null
        }
        Update: {
          ai_match_score?: number | null
          application_code?: string | null
          application_date?: string | null
          classification?: string | null
          contact_email?: string
          contact_name?: string | null
          contact_phone?: string | null
          conversion_status?: string | null
          converted_pilot_id?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          id?: string
          is_deleted?: boolean | null
          matched_challenges?: string[] | null
          organization_id?: string | null
          organization_name_ar?: string | null
          organization_name_en?: string
          proposed_capabilities?: string | null
          rejection_reason?: string | null
          solution_id?: string | null
          status?: string | null
          tags?: string[] | null
          target_challenges?: string[] | null
          updated_at?: string | null
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matchmaker_applications_converted_pilot_id_fkey"
            columns: ["converted_pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaker_applications_converted_pilot_id_fkey"
            columns: ["converted_pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaker_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaker_applications_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaker_evaluation_sessions: {
        Row: {
          created_at: string | null
          decision_rationale: string | null
          deleted_by: string | null
          deleted_date: string | null
          evaluators: string[] | null
          follow_up_actions: Json | null
          id: string
          is_deleted: boolean | null
          matchmaker_application_id: string | null
          meeting_notes: string | null
          presentation_url: string | null
          recommendation: string | null
          recording_url: string | null
          scores: Json | null
          session_code: string | null
          session_date: string | null
          session_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decision_rationale?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          evaluators?: string[] | null
          follow_up_actions?: Json | null
          id?: string
          is_deleted?: boolean | null
          matchmaker_application_id?: string | null
          meeting_notes?: string | null
          presentation_url?: string | null
          recommendation?: string | null
          recording_url?: string | null
          scores?: Json | null
          session_code?: string | null
          session_date?: string | null
          session_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decision_rationale?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          evaluators?: string[] | null
          follow_up_actions?: Json | null
          id?: string
          is_deleted?: boolean | null
          matchmaker_application_id?: string | null
          meeting_notes?: string | null
          presentation_url?: string | null
          recommendation?: string | null
          recording_url?: string | null
          scores?: Json | null
          session_code?: string | null
          session_date?: string | null
          session_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matchmaker_evaluation_sessions_matchmaker_application_id_fkey"
            columns: ["matchmaker_application_id"]
            isOneToOne: false
            referencedRelation: "matchmaker_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          ai_description: string | null
          ai_tags: string[] | null
          alt_text: string | null
          archived_at: string | null
          archived_by: string | null
          bucket_id: string
          category: string | null
          checksum: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          display_name: string | null
          download_count: number | null
          duration_seconds: number | null
          entity_field: string | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          file_extension: string | null
          file_size: number | null
          folder_path: string | null
          height: number | null
          id: string
          is_deleted: boolean | null
          is_processed: boolean | null
          is_public: boolean | null
          last_accessed_at: string | null
          mime_type: string | null
          original_filename: string
          processing_metadata: Json | null
          public_url: string | null
          status: string | null
          storage_path: string
          tags: string[] | null
          updated_at: string | null
          upload_context: Json | null
          upload_source: string | null
          uploaded_by_email: string | null
          uploaded_by_user_id: string | null
          view_count: number | null
          width: number | null
        }
        Insert: {
          ai_description?: string | null
          ai_tags?: string[] | null
          alt_text?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bucket_id: string
          category?: string | null
          checksum?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_name?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          entity_field?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          file_extension?: string | null
          file_size?: number | null
          folder_path?: string | null
          height?: number | null
          id?: string
          is_deleted?: boolean | null
          is_processed?: boolean | null
          is_public?: boolean | null
          last_accessed_at?: string | null
          mime_type?: string | null
          original_filename: string
          processing_metadata?: Json | null
          public_url?: string | null
          status?: string | null
          storage_path: string
          tags?: string[] | null
          updated_at?: string | null
          upload_context?: Json | null
          upload_source?: string | null
          uploaded_by_email?: string | null
          uploaded_by_user_id?: string | null
          view_count?: number | null
          width?: number | null
        }
        Update: {
          ai_description?: string | null
          ai_tags?: string[] | null
          alt_text?: string | null
          archived_at?: string | null
          archived_by?: string | null
          bucket_id?: string
          category?: string | null
          checksum?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_name?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          entity_field?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          file_extension?: string | null
          file_size?: number | null
          folder_path?: string | null
          height?: number | null
          id?: string
          is_deleted?: boolean | null
          is_processed?: boolean | null
          is_public?: boolean | null
          last_accessed_at?: string | null
          mime_type?: string | null
          original_filename?: string
          processing_metadata?: Json | null
          public_url?: string | null
          status?: string | null
          storage_path?: string
          tags?: string[] | null
          updated_at?: string | null
          upload_context?: Json | null
          upload_source?: string | null
          uploaded_by_email?: string | null
          uploaded_by_user_id?: string | null
          view_count?: number | null
          width?: number | null
        }
        Relationships: []
      }
      media_folders: {
        Row: {
          bucket_id: string | null
          color: string | null
          created_at: string | null
          depth: number | null
          description: string | null
          entity_type: string | null
          icon: string | null
          id: string
          is_shared: boolean | null
          name_ar: string | null
          name_en: string
          owner_email: string | null
          owner_user_id: string | null
          parent_folder_id: string | null
          path: string
          shared_with: string[] | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          color?: string | null
          created_at?: string | null
          depth?: number | null
          description?: string | null
          entity_type?: string | null
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          name_ar?: string | null
          name_en: string
          owner_email?: string | null
          owner_user_id?: string | null
          parent_folder_id?: string | null
          path: string
          shared_with?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          color?: string | null
          created_at?: string | null
          depth?: number | null
          description?: string | null
          entity_type?: string | null
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          name_ar?: string | null
          name_en?: string
          owner_email?: string | null
          owner_user_id?: string | null
          parent_folder_id?: string | null
          path?: string
          shared_with?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      media_usage: {
        Row: {
          added_at: string | null
          added_by: string | null
          display_order: number | null
          entity_id: string
          entity_type: string
          field_name: string
          id: string
          media_file_id: string | null
          removed_at: string | null
          usage_type: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          display_order?: number | null
          entity_id: string
          entity_type: string
          field_name: string
          id?: string
          media_file_id?: string | null
          removed_at?: string | null
          usage_type?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          display_order?: number | null
          entity_id?: string
          entity_type?: string
          field_name?: string
          id?: string
          media_file_id?: string | null
          removed_at?: string | null
          usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      media_usages: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          field_name: string
          id: string
          is_primary: boolean | null
          media_file_id: string | null
          updated_at: string | null
          usage_type: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          field_name: string
          id?: string
          is_primary?: boolean | null
          media_file_id?: string | null
          updated_at?: string | null
          usage_type?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          field_name?: string
          id?: string
          is_primary?: boolean | null
          media_file_id?: string | null
          updated_at?: string | null
          usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_usages_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      media_versions: {
        Row: {
          change_reason: string | null
          change_type: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          media_file_id: string | null
          previous_checksum: string | null
          previous_file_size: number | null
          previous_storage_path: string | null
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          change_type?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          media_file_id?: string | null
          previous_checksum?: string | null
          previous_file_size?: number | null
          previous_storage_path?: string | null
          version_number: number
        }
        Update: {
          change_reason?: string | null
          change_type?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          media_file_id?: string | null
          previous_checksum?: string | null
          previous_file_size?: number | null
          previous_storage_path?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "media_versions_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_deleted: boolean | null
          is_read: boolean | null
          read_at: string | null
          recipient_email: string
          sender_email: string
          subject: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          read_at?: string | null
          recipient_email: string
          sender_email: string
          subject?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          read_at?: string | null
          recipient_email?: string
          sender_email?: string
          subject?: string | null
        }
        Relationships: []
      }
      mii_dimensions: {
        Row: {
          code: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          indicators: Json | null
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          sort_order: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          indicators?: Json | null
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          sort_order?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          indicators?: Json | null
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          sort_order?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      mii_results: {
        Row: {
          assessment_date: string | null
          assessment_year: number
          assessor_notes: string | null
          created_at: string | null
          dimension_scores: Json | null
          id: string
          improvement_areas: Json | null
          is_published: boolean | null
          municipality_id: string | null
          overall_score: number | null
          previous_rank: number | null
          rank: number | null
          strengths: Json | null
          trend: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_date?: string | null
          assessment_year: number
          assessor_notes?: string | null
          created_at?: string | null
          dimension_scores?: Json | null
          id?: string
          improvement_areas?: Json | null
          is_published?: boolean | null
          municipality_id?: string | null
          overall_score?: number | null
          previous_rank?: number | null
          rank?: number | null
          strengths?: Json | null
          trend?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_date?: string | null
          assessment_year?: number
          assessor_notes?: string | null
          created_at?: string | null
          dimension_scores?: Json | null
          id?: string
          improvement_areas?: Json | null
          is_published?: boolean | null
          municipality_id?: string | null
          overall_score?: number | null
          previous_rank?: number | null
          rank?: number | null
          strengths?: Json | null
          trend?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mii_results_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          deliverables: Json | null
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          entity_id: string
          entity_type: string
          id: string
          is_deleted: boolean | null
          sort_order: number | null
          status: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          deliverables?: Json | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_deleted?: boolean | null
          sort_order?: number | null
          status?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          deliverables?: Json | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_deleted?: boolean | null
          sort_order?: number | null
          status?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ministries: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name_ar: string | null
          name_en: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name_ar?: string | null
          name_en: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name_ar?: string | null
          name_en?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      municipalities: {
        Row: {
          active_challenges: number | null
          active_pilots: number | null
          approved_email_domains: string[] | null
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
          focus_sectors: string[] | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          mii_last_calculated_at: string | null
          mii_rank: number | null
          mii_recalc_pending: boolean | null
          mii_score: number | null
          ministry_id: string | null
          name_ar: string
          name_en: string
          population: number | null
          region: string
          region_id: string | null
          sector_id: string | null
          strategic_plan_id: string | null
          updated_at: string
          verification_date: string | null
          website: string | null
        }
        Insert: {
          active_challenges?: number | null
          active_pilots?: number | null
          approved_email_domains?: string[] | null
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
          focus_sectors?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          mii_last_calculated_at?: string | null
          mii_rank?: number | null
          mii_recalc_pending?: boolean | null
          mii_score?: number | null
          ministry_id?: string | null
          name_ar: string
          name_en: string
          population?: number | null
          region: string
          region_id?: string | null
          sector_id?: string | null
          strategic_plan_id?: string | null
          updated_at?: string
          verification_date?: string | null
          website?: string | null
        }
        Update: {
          active_challenges?: number | null
          active_pilots?: number | null
          approved_email_domains?: string[] | null
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
          focus_sectors?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          mii_last_calculated_at?: string | null
          mii_rank?: number | null
          mii_recalc_pending?: boolean | null
          mii_score?: number | null
          ministry_id?: string | null
          name_ar?: string
          name_en?: string
          population?: number | null
          region?: string
          region_id?: string | null
          sector_id?: string | null
          strategic_plan_id?: string | null
          updated_at?: string
          verification_date?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "municipalities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "municipalities_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      municipality_staff_profiles: {
        Row: {
          certifications: Json | null
          created_at: string | null
          cv_url: string | null
          department: string | null
          employee_id: string | null
          extracted_cv_data: Json | null
          id: string
          is_verified: boolean | null
          job_title: string | null
          municipality_id: string | null
          specializations: string[] | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          verified_at: string | null
          verified_by: string | null
          years_of_experience: number | null
        }
        Insert: {
          certifications?: Json | null
          created_at?: string | null
          cv_url?: string | null
          department?: string | null
          employee_id?: string | null
          extracted_cv_data?: Json | null
          id?: string
          is_verified?: boolean | null
          job_title?: string | null
          municipality_id?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          years_of_experience?: number | null
        }
        Update: {
          certifications?: Json | null
          created_at?: string | null
          cv_url?: string | null
          department?: string | null
          employee_id?: string | null
          extracted_cv_data?: Json | null
          id?: string
          is_verified?: boolean | null
          job_title?: string | null
          municipality_id?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "municipality_staff_profiles_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      national_strategy_alignments: {
        Row: {
          alignment_notes: string | null
          alignment_score: number | null
          contribution_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          national_goal_code: string | null
          national_goal_name_ar: string | null
          national_goal_name_en: string | null
          national_strategy_type: string | null
          objective_id: string | null
          strategic_plan_id: string | null
        }
        Insert: {
          alignment_notes?: string | null
          alignment_score?: number | null
          contribution_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          national_goal_code?: string | null
          national_goal_name_ar?: string | null
          national_goal_name_en?: string | null
          national_strategy_type?: string | null
          objective_id?: string | null
          strategic_plan_id?: string | null
        }
        Update: {
          alignment_notes?: string | null
          alignment_score?: number | null
          contribution_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          national_goal_code?: string | null
          national_goal_name_ar?: string | null
          national_goal_name_en?: string | null
          national_strategy_type?: string | null
          objective_id?: string | null
          strategic_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "national_strategy_alignments_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: string | null
          category: string | null
          content_ar: string | null
          content_en: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          publish_date: string | null
          source_url: string | null
          summary_ar: string | null
          summary_en: string | null
          tags: string[] | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          publish_date?: string | null
          source_url?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          publish_date?: string | null
          source_url?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          title: string | null
          type: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          title?: string | null
          type: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          title?: string | null
          type?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_events: {
        Row: {
          created_at: string
          duration_seconds: number | null
          event_data: Json | null
          event_type: string
          id: string
          persona: string | null
          step_name: string | null
          step_number: number | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          event_data?: Json | null
          event_type: string
          id?: string
          persona?: string | null
          step_name?: string | null
          step_number?: number | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          event_data?: Json | null
          event_type?: string
          id?: string
          persona?: string | null
          step_name?: string | null
          step_number?: number | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_partnerships: {
        Row: {
          agreement_url: string | null
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          organization_id: string | null
          partner_organization_id: string | null
          partnership_type: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agreement_url?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          partner_organization_id?: string | null
          partnership_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agreement_url?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          partner_organization_id?: string | null
          partnership_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_partnerships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_partnerships_partner_organization_id_fkey"
            columns: ["partner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name_ar: string | null
          name_en: string
          region_id: string | null
          sector_id: string | null
          type: string | null
          updated_at: string | null
          verification_date: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name_ar?: string | null
          name_en: string
          region_id?: string | null
          sector_id?: string | null
          type?: string | null
          updated_at?: string | null
          verification_date?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name_ar?: string | null
          name_en?: string
          region_id?: string | null
          sector_id?: string | null
          type?: string | null
          updated_at?: string | null
          verification_date?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          agreement_url: string | null
          budget_shared: number | null
          contact_person_a: string | null
          contact_person_b: string | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          deliverables: Json | null
          end_date: string | null
          engagement_history: Json | null
          health_score: number | null
          id: string
          is_deleted: boolean | null
          is_strategic: boolean | null
          is_strategy_derived: boolean | null
          kpis: Json | null
          linked_challenge_ids: string[] | null
          linked_pilot_ids: string[] | null
          linked_program_ids: string[] | null
          linked_rd_ids: string[] | null
          meeting_history: Json | null
          milestones: Json | null
          mou_signed_date: string | null
          name_ar: string | null
          name_en: string
          parties: Json | null
          partnership_type: string | null
          partnership_value_estimate: number | null
          performance_metrics: Json | null
          renewal_date: string | null
          scope_ar: string | null
          scope_en: string | null
          start_date: string | null
          status: string | null
          strategic_objective_ids: string[] | null
          strategic_plan_ids: string[] | null
          strategy_derivation_date: string | null
          updated_at: string | null
          value_created: Json | null
        }
        Insert: {
          agreement_url?: string | null
          budget_shared?: number | null
          contact_person_a?: string | null
          contact_person_b?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          deliverables?: Json | null
          end_date?: string | null
          engagement_history?: Json | null
          health_score?: number | null
          id?: string
          is_deleted?: boolean | null
          is_strategic?: boolean | null
          is_strategy_derived?: boolean | null
          kpis?: Json | null
          linked_challenge_ids?: string[] | null
          linked_pilot_ids?: string[] | null
          linked_program_ids?: string[] | null
          linked_rd_ids?: string[] | null
          meeting_history?: Json | null
          milestones?: Json | null
          mou_signed_date?: string | null
          name_ar?: string | null
          name_en: string
          parties?: Json | null
          partnership_type?: string | null
          partnership_value_estimate?: number | null
          performance_metrics?: Json | null
          renewal_date?: string | null
          scope_ar?: string | null
          scope_en?: string | null
          start_date?: string | null
          status?: string | null
          strategic_objective_ids?: string[] | null
          strategic_plan_ids?: string[] | null
          strategy_derivation_date?: string | null
          updated_at?: string | null
          value_created?: Json | null
        }
        Update: {
          agreement_url?: string | null
          budget_shared?: number | null
          contact_person_a?: string | null
          contact_person_b?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          deliverables?: Json | null
          end_date?: string | null
          engagement_history?: Json | null
          health_score?: number | null
          id?: string
          is_deleted?: boolean | null
          is_strategic?: boolean | null
          is_strategy_derived?: boolean | null
          kpis?: Json | null
          linked_challenge_ids?: string[] | null
          linked_pilot_ids?: string[] | null
          linked_program_ids?: string[] | null
          linked_rd_ids?: string[] | null
          meeting_history?: Json | null
          milestones?: Json | null
          mou_signed_date?: string | null
          name_ar?: string | null
          name_en?: string
          parties?: Json | null
          partnership_type?: string | null
          partnership_value_estimate?: number | null
          performance_metrics?: Json | null
          renewal_date?: string | null
          scope_ar?: string | null
          scope_en?: string | null
          start_date?: string | null
          status?: string | null
          strategic_objective_ids?: string[] | null
          strategic_plan_ids?: string[] | null
          strategy_derivation_date?: string | null
          updated_at?: string | null
          value_created?: Json | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string | null
          code: string
          created_at: string | null
          description: string | null
          description_ar: string | null
          entity_type: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string | null
        }
        Insert: {
          action?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar?: string | null
        }
        Update: {
          action?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
        }
        Relationships: []
      }
      pilot_approvals: {
        Row: {
          approval_date: string | null
          approval_type: string
          approver_email: string
          comments: string | null
          conditions: string[] | null
          created_at: string | null
          escalation_triggered: boolean | null
          id: string
          is_deleted: boolean | null
          pilot_id: string | null
          sla_due_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          approval_type: string
          approver_email: string
          comments?: string | null
          conditions?: string[] | null
          created_at?: string | null
          escalation_triggered?: boolean | null
          id?: string
          is_deleted?: boolean | null
          pilot_id?: string | null
          sla_due_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          approval_type?: string
          approver_email?: string
          comments?: string | null
          conditions?: string[] | null
          created_at?: string | null
          escalation_triggered?: boolean | null
          id?: string
          is_deleted?: boolean | null
          pilot_id?: string | null
          sla_due_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pilot_approvals_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_approvals_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_collaborations: {
        Row: {
          collaboration_type: string | null
          contact_email: string | null
          contribution: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_deleted: boolean | null
          organization_id: string | null
          pilot_id: string | null
          role: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          collaboration_type?: string | null
          contact_email?: string | null
          contribution?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_deleted?: boolean | null
          organization_id?: string | null
          pilot_id?: string | null
          role?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          collaboration_type?: string | null
          contact_email?: string | null
          contribution?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_deleted?: boolean | null
          organization_id?: string | null
          pilot_id?: string | null
          role?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pilot_collaborations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_collaborations_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_collaborations_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          is_public: boolean | null
          pilot_id: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_public?: boolean | null
          pilot_id?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_public?: boolean | null
          pilot_id?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pilot_documents_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_documents_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_expenses: {
        Row: {
          amount: number
          approved_by: string | null
          approved_date: string | null
          budget_line_item_id: string | null
          category: string
          created_at: string | null
          currency: string | null
          date: string
          deleted_by: string | null
          deleted_date: string | null
          description: string | null
          id: string
          invoice_id: string | null
          is_deleted: boolean | null
          payment_date: string | null
          payment_reference: string | null
          pilot_id: string
          receipt_url: string | null
          rejection_reason: string | null
          status: string | null
          submitted_by: string | null
          submitted_date: string | null
          tax_amount: number | null
          tax_rate: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          approved_date?: string | null
          budget_line_item_id?: string | null
          category: string
          created_at?: string | null
          currency?: string | null
          date: string
          deleted_by?: string | null
          deleted_date?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          is_deleted?: boolean | null
          payment_date?: string | null
          payment_reference?: string | null
          pilot_id: string
          receipt_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_by?: string | null
          submitted_date?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          budget_line_item_id?: string | null
          category?: string
          created_at?: string | null
          currency?: string | null
          date?: string
          deleted_by?: string | null
          deleted_date?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          is_deleted?: boolean | null
          payment_date?: string | null
          payment_reference?: string | null
          pilot_id?: string
          receipt_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_by?: string | null
          submitted_date?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pilot_expenses_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_expenses_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_issues: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          is_deleted: boolean | null
          issue_category: string | null
          issue_description: string | null
          issue_title: string
          pilot_id: string | null
          raised_by: string | null
          resolution: string | null
          resolved_date: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          issue_category?: string | null
          issue_description?: string | null
          issue_title: string
          pilot_id?: string | null
          raised_by?: string | null
          resolution?: string | null
          resolved_date?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          issue_category?: string | null
          issue_description?: string | null
          issue_title?: string
          pilot_id?: string | null
          raised_by?: string | null
          resolution?: string | null
          resolved_date?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pilot_issues_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_issues_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_kpi_datapoints: {
        Row: {
          created_at: string | null
          date: string
          id: string
          kpi_id: string | null
          notes: string | null
          pilot_id: string | null
          recorded_by: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          kpi_id?: string | null
          notes?: string | null
          pilot_id?: string | null
          recorded_by?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          kpi_id?: string | null
          notes?: string | null
          pilot_id?: string | null
          recorded_by?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pilot_kpi_datapoints_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "pilot_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_kpi_datapoints_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_kpi_datapoints_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_kpis: {
        Row: {
          baseline: number | null
          created_at: string | null
          current_value: number | null
          data_source: string | null
          description: string | null
          id: string
          measurement_frequency: string | null
          name: string
          name_ar: string | null
          pilot_id: string | null
          status: string | null
          target: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          baseline?: number | null
          created_at?: string | null
          current_value?: number | null
          data_source?: string | null
          description?: string | null
          id?: string
          measurement_frequency?: string | null
          name: string
          name_ar?: string | null
          pilot_id?: string | null
          status?: string | null
          target?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          baseline?: number | null
          created_at?: string | null
          current_value?: number | null
          data_source?: string | null
          description?: string | null
          id?: string
          measurement_frequency?: string | null
          name?: string
          name_ar?: string | null
          pilot_id?: string | null
          status?: string | null
          target?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pilot_kpis_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pilot_kpis_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
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
          created_by: string | null
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
          is_strategy_derived: boolean | null
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
          strategic_plan_ids: string[] | null
          strategy_derivation_date: string | null
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
          created_by?: string | null
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
          is_strategy_derived?: boolean | null
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
          strategic_plan_ids?: string[] | null
          strategy_derivation_date?: string | null
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
          created_by?: string | null
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
          is_strategy_derived?: boolean | null
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
          strategic_plan_ids?: string[] | null
          strategy_derivation_date?: string | null
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
            foreignKeyName: "pilots_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
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
      platform_configs: {
        Row: {
          category: string | null
          config_key: string
          config_value: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          config_key: string
          config_value?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          config_key?: string
          config_value?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      platform_insights: {
        Row: {
          created_at: string | null
          data: Json | null
          description: string | null
          generated_at: string | null
          id: string
          insight_type: string | null
          is_published: boolean | null
          period_end: string | null
          period_start: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          generated_at?: string | null
          id?: string
          insight_type?: string | null
          is_published?: boolean | null
          period_end?: string | null
          period_start?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          generated_at?: string | null
          id?: string
          insight_type?: string | null
          is_published?: boolean | null
          period_end?: string | null
          period_start?: string | null
          title?: string
        }
        Relationships: []
      }
      policy_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          policy_id: string | null
          user_email: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          policy_id?: string | null
          user_email?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          policy_id?: string | null
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_comments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_documents: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          category: string | null
          code: string | null
          content_ar: string | null
          content_en: string | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          description_ar: string | null
          description_en: string | null
          effective_date: string | null
          expiry_date: string | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          is_published: boolean | null
          is_strategy_derived: boolean | null
          policy_type: string | null
          sector_id: string | null
          status: string | null
          strategic_objective_ids: string[] | null
          strategic_plan_ids: string[] | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          category?: string | null
          code?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          description_ar?: string | null
          description_en?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_published?: boolean | null
          is_strategy_derived?: boolean | null
          policy_type?: string | null
          sector_id?: string | null
          status?: string | null
          strategic_objective_ids?: string[] | null
          strategic_plan_ids?: string[] | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          category?: string | null
          code?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          description_ar?: string | null
          description_en?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_published?: boolean | null
          is_strategy_derived?: boolean | null
          policy_type?: string | null
          sector_id?: string | null
          status?: string | null
          strategic_objective_ids?: string[] | null
          strategic_plan_ids?: string[] | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_documents_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_recommendations: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          impact_assessment: string | null
          implementation_status: string | null
          is_published: boolean | null
          priority: string | null
          proposed_by: string | null
          proposed_date: string | null
          recommendation_type: string | null
          source_entity_id: string | null
          source_entity_type: string | null
          status: string | null
          supporting_evidence: Json | null
          tags: string[] | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          impact_assessment?: string | null
          implementation_status?: string | null
          is_published?: boolean | null
          priority?: string | null
          proposed_by?: string | null
          proposed_date?: string | null
          recommendation_type?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          status?: string | null
          supporting_evidence?: Json | null
          tags?: string[] | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          impact_assessment?: string | null
          implementation_status?: string | null
          is_published?: boolean | null
          priority?: string | null
          proposed_by?: string | null
          proposed_date?: string | null
          recommendation_type?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          status?: string | null
          supporting_evidence?: Json | null
          tags?: string[] | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      policy_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          template_content: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          template_content?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          template_content?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      program_applications: {
        Row: {
          acceptance_letter_url: string | null
          ai_feedback: string | null
          ai_score: number | null
          applicant_email: string | null
          applicant_name: string | null
          applicant_org_id: string | null
          application_code: string | null
          attachments: string[] | null
          average_score: number | null
          cohort_assigned: string | null
          created_at: string | null
          decision_by: string | null
          decision_date: string | null
          deleted_by: string | null
          deleted_date: string | null
          final_decision: string | null
          id: string
          is_deleted: boolean | null
          program_id: string | null
          proposal_detailed: string | null
          proposal_summary: string | null
          rejection_reason: string | null
          related_challenge_id: string | null
          status: string | null
          submission_date: string | null
          team_members: Json | null
          updated_at: string | null
        }
        Insert: {
          acceptance_letter_url?: string | null
          ai_feedback?: string | null
          ai_score?: number | null
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_org_id?: string | null
          application_code?: string | null
          attachments?: string[] | null
          average_score?: number | null
          cohort_assigned?: string | null
          created_at?: string | null
          decision_by?: string | null
          decision_date?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          final_decision?: string | null
          id?: string
          is_deleted?: boolean | null
          program_id?: string | null
          proposal_detailed?: string | null
          proposal_summary?: string | null
          rejection_reason?: string | null
          related_challenge_id?: string | null
          status?: string | null
          submission_date?: string | null
          team_members?: Json | null
          updated_at?: string | null
        }
        Update: {
          acceptance_letter_url?: string | null
          ai_feedback?: string | null
          ai_score?: number | null
          applicant_email?: string | null
          applicant_name?: string | null
          applicant_org_id?: string | null
          application_code?: string | null
          attachments?: string[] | null
          average_score?: number | null
          cohort_assigned?: string | null
          created_at?: string | null
          decision_by?: string | null
          decision_date?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          final_decision?: string | null
          id?: string
          is_deleted?: boolean | null
          program_id?: string | null
          proposal_detailed?: string | null
          proposal_summary?: string | null
          rejection_reason?: string | null
          related_challenge_id?: string | null
          status?: string | null
          submission_date?: string | null
          team_members?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_applications_applicant_org_id_fkey"
            columns: ["applicant_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_applications_related_challenge_id_fkey"
            columns: ["related_challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_applications_related_challenge_id_fkey"
            columns: ["related_challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      program_mentorships: {
        Row: {
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          end_date: string | null
          focus_areas: string[] | null
          id: string
          is_deleted: boolean | null
          matched_by: string | null
          matching_score: number | null
          mentee_email: string
          mentee_satisfaction: number | null
          mentor_email: string
          mentor_satisfaction: number | null
          mentorship_type: string | null
          outcomes: Json | null
          program_application_id: string | null
          program_id: string
          session_frequency: string | null
          session_logs: Json | null
          sessions_completed: number | null
          sessions_planned: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          end_date?: string | null
          focus_areas?: string[] | null
          id?: string
          is_deleted?: boolean | null
          matched_by?: string | null
          matching_score?: number | null
          mentee_email: string
          mentee_satisfaction?: number | null
          mentor_email: string
          mentor_satisfaction?: number | null
          mentorship_type?: string | null
          outcomes?: Json | null
          program_application_id?: string | null
          program_id: string
          session_frequency?: string | null
          session_logs?: Json | null
          sessions_completed?: number | null
          sessions_planned?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          end_date?: string | null
          focus_areas?: string[] | null
          id?: string
          is_deleted?: boolean | null
          matched_by?: string | null
          matching_score?: number | null
          mentee_email?: string
          mentee_satisfaction?: number | null
          mentor_email?: string
          mentor_satisfaction?: number | null
          mentorship_type?: string | null
          outcomes?: Json | null
          program_application_id?: string | null
          program_id?: string
          session_frequency?: string | null
          session_logs?: Json | null
          sessions_completed?: number | null
          sessions_planned?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_mentorships_program_application_id_fkey"
            columns: ["program_application_id"]
            isOneToOne: false
            referencedRelation: "program_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_mentorships_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_pilot_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          link_type: string | null
          notes: string | null
          pilot_id: string | null
          program_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          link_type?: string | null
          notes?: string | null
          pilot_id?: string | null
          program_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          link_type?: string | null
          notes?: string | null
          pilot_id?: string | null
          program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_pilot_links_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_pilot_links_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_pilot_links_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
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
          is_strategy_derived: boolean | null
          kpis: Json | null
          lessons_learned: Json | null
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
          status: string | null
          strategic_kpi_contributions: Json | null
          strategic_objective_ids: string[] | null
          strategic_pillar_id: string | null
          strategic_plan_ids: string[] | null
          strategic_priority_level: string | null
          strategy_derivation_date: string | null
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
          is_strategy_derived?: boolean | null
          kpis?: Json | null
          lessons_learned?: Json | null
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
          status?: string | null
          strategic_kpi_contributions?: Json | null
          strategic_objective_ids?: string[] | null
          strategic_pillar_id?: string | null
          strategic_plan_ids?: string[] | null
          strategic_priority_level?: string | null
          strategy_derivation_date?: string | null
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
          is_strategy_derived?: boolean | null
          kpis?: Json | null
          lessons_learned?: Json | null
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
          status?: string | null
          strategic_kpi_contributions?: Json | null
          strategic_objective_ids?: string[] | null
          strategic_pillar_id?: string | null
          strategic_plan_ids?: string[] | null
          strategic_priority_level?: string | null
          strategy_derivation_date?: string | null
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
      progressive_profiling_prompts: {
        Row: {
          completed_at: string | null
          created_at: string
          dismissed_count: number | null
          field_name: string
          id: string
          is_completed: boolean | null
          last_shown_at: string | null
          priority: number | null
          prompt_message_ar: string | null
          prompt_message_en: string | null
          prompt_type: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dismissed_count?: number | null
          field_name: string
          id?: string
          is_completed?: boolean | null
          last_shown_at?: string | null
          priority?: number | null
          prompt_message_ar?: string | null
          prompt_message_en?: string | null
          prompt_type: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dismissed_count?: number | null
          field_name?: string
          id?: string
          is_completed?: boolean | null
          last_shown_at?: string | null
          priority?: number | null
          prompt_message_ar?: string | null
          prompt_message_en?: string | null
          prompt_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          ai_metadata: Json | null
          avg_pilot_score: number | null
          certifications: Json | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          contract_history: Json | null
          country: string | null
          cr_number: string | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          id: string
          insurance_info: Json | null
          is_deleted: boolean | null
          name_ar: string | null
          name_en: string
          organization_id: string | null
          performance_score: number | null
          profile_completeness: number | null
          provider_type: string | null
          success_rate: number | null
          total_pilots_participated: number | null
          total_solutions_count: number | null
          updated_at: string | null
          verification_date: string | null
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          ai_metadata?: Json | null
          avg_pilot_score?: number | null
          certifications?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_history?: Json | null
          country?: string | null
          cr_number?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          id?: string
          insurance_info?: Json | null
          is_deleted?: boolean | null
          name_ar?: string | null
          name_en: string
          organization_id?: string | null
          performance_score?: number | null
          profile_completeness?: number | null
          provider_type?: string | null
          success_rate?: number | null
          total_pilots_participated?: number | null
          total_solutions_count?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          ai_metadata?: Json | null
          avg_pilot_score?: number | null
          certifications?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_history?: Json | null
          country?: string | null
          cr_number?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          id?: string
          insurance_info?: Json | null
          is_deleted?: boolean | null
          name_ar?: string | null
          name_en?: string
          organization_id?: string | null
          performance_score?: number | null
          profile_completeness?: number | null
          provider_type?: string | null
          success_rate?: number | null
          total_pilots_participated?: number | null
          total_solutions_count?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rd_calls: {
        Row: {
          application_deadline: string | null
          budget_currency: string | null
          budget_total: number | null
          call_type: string | null
          challenge_ids: string[] | null
          code: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          eligibility_criteria: Json | null
          end_date: string | null
          evaluation_criteria: Json | null
          focus_areas: string[] | null
          id: string
          is_published: boolean | null
          is_strategy_derived: boolean | null
          program_id: string | null
          sector_id: string | null
          start_date: string | null
          status: string | null
          strategic_plan_ids: string[] | null
          strategy_derivation_date: string | null
          timeline: Json | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          budget_currency?: string | null
          budget_total?: number | null
          call_type?: string | null
          challenge_ids?: string[] | null
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          eligibility_criteria?: Json | null
          end_date?: string | null
          evaluation_criteria?: Json | null
          focus_areas?: string[] | null
          id?: string
          is_published?: boolean | null
          is_strategy_derived?: boolean | null
          program_id?: string | null
          sector_id?: string | null
          start_date?: string | null
          status?: string | null
          strategic_plan_ids?: string[] | null
          strategy_derivation_date?: string | null
          timeline?: Json | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          budget_currency?: string | null
          budget_total?: number | null
          call_type?: string | null
          challenge_ids?: string[] | null
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          eligibility_criteria?: Json | null
          end_date?: string | null
          evaluation_criteria?: Json | null
          focus_areas?: string[] | null
          id?: string
          is_published?: boolean | null
          is_strategy_derived?: boolean | null
          program_id?: string | null
          sector_id?: string | null
          start_date?: string | null
          status?: string | null
          strategic_plan_ids?: string[] | null
          strategy_derivation_date?: string | null
          timeline?: Json | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rd_calls_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rd_calls_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
      rd_proposals: {
        Row: {
          created_at: string | null
          evaluation_notes: string | null
          id: string
          institution_name: string | null
          rd_call_id: string | null
          rd_project_id: string | null
          reviewers: Json | null
          score: number | null
          status: string | null
          submitted_at: string | null
          submitter_email: string | null
          submitter_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evaluation_notes?: string | null
          id?: string
          institution_name?: string | null
          rd_call_id?: string | null
          rd_project_id?: string | null
          reviewers?: Json | null
          score?: number | null
          status?: string | null
          submitted_at?: string | null
          submitter_email?: string | null
          submitter_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evaluation_notes?: string | null
          id?: string
          institution_name?: string | null
          rd_call_id?: string | null
          rd_project_id?: string | null
          reviewers?: Json | null
          score?: number | null
          status?: string | null
          submitted_at?: string | null
          submitter_email?: string | null
          submitter_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rd_proposals_rd_call_id_fkey"
            columns: ["rd_call_id"]
            isOneToOne: false
            referencedRelation: "rd_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rd_proposals_rd_project_id_fkey"
            columns: ["rd_project_id"]
            isOneToOne: false
            referencedRelation: "rd_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      regulatory_exemptions: {
        Row: {
          applicable_entity_types: string[] | null
          approval_authority: string | null
          code: string | null
          conditions: Json | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          exemption_type: string | null
          id: string
          regulation_reference: string | null
          sector_id: string | null
          status: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_entity_types?: string[] | null
          approval_authority?: string | null
          code?: string | null
          conditions?: Json | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          exemption_type?: string | null
          id?: string
          regulation_reference?: string | null
          sector_id?: string | null
          status?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_entity_types?: string[] | null
          approval_authority?: string | null
          code?: string | null
          conditions?: Json | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          exemption_type?: string | null
          id?: string
          regulation_reference?: string | null
          sector_id?: string | null
          status?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_exemptions_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      researcher_profiles: {
        Row: {
          citation_count: number | null
          created_at: string | null
          department: string | null
          google_scholar_url: string | null
          h_index: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          name_ar: string | null
          name_en: string
          orcid_id: string | null
          organization_id: string | null
          patents: Json | null
          photo_url: string | null
          publications: Json | null
          research_areas: string[] | null
          researchgate_url: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          citation_count?: number | null
          created_at?: string | null
          department?: string | null
          google_scholar_url?: string | null
          h_index?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name_ar?: string | null
          name_en: string
          orcid_id?: string | null
          organization_id?: string | null
          patents?: Json | null
          photo_url?: string | null
          publications?: Json | null
          research_areas?: string[] | null
          researchgate_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          citation_count?: number | null
          created_at?: string | null
          department?: string | null
          google_scholar_url?: string | null
          h_index?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name_ar?: string | null
          name_en?: string
          orcid_id?: string | null
          organization_id?: string | null
          patents?: Json | null
          photo_url?: string | null
          publications?: Json | null
          research_areas?: string[] | null
          researchgate_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "researcher_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          category: string | null
          contingency_plan: string | null
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          impact: string | null
          is_deleted: boolean | null
          mitigation_strategy: string | null
          owner_email: string | null
          probability: string | null
          review_date: string | null
          risk_score: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          impact?: string | null
          is_deleted?: boolean | null
          mitigation_strategy?: string | null
          owner_email?: string | null
          probability?: string | null
          review_date?: string | null
          risk_score?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          impact?: string | null
          is_deleted?: boolean | null
          mitigation_strategy?: string | null
          owner_email?: string | null
          probability?: string | null
          review_date?: string | null
          risk_score?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_requests: {
        Row: {
          created_at: string | null
          id: string
          justification: string | null
          municipality_id: string | null
          organization_id: string | null
          rejection_reason: string | null
          requested_role: string
          reviewed_by: string | null
          reviewed_date: string | null
          status: string | null
          updated_at: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          justification?: string | null
          municipality_id?: string | null
          organization_id?: string | null
          rejection_reason?: string | null
          requested_role: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          justification?: string | null
          municipality_id?: string | null
          organization_id?: string | null
          rejection_reason?: string | null
          requested_role?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_requests_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          approval_required: boolean | null
          can_be_requested: boolean | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          description: string | null
          description_ar: string | null
          id: string
          is_active: boolean | null
          is_custom: boolean | null
          is_deleted: boolean | null
          is_expert_role: boolean | null
          is_system_role: boolean | null
          min_years_experience: number | null
          name: string
          name_ar: string | null
          parent_role_id: string | null
          required_certifications: string[] | null
          required_expertise_areas: string[] | null
          updated_at: string | null
          user_count: number | null
        }
        Insert: {
          approval_required?: boolean | null
          can_be_requested?: boolean | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          is_deleted?: boolean | null
          is_expert_role?: boolean | null
          is_system_role?: boolean | null
          min_years_experience?: number | null
          name: string
          name_ar?: string | null
          parent_role_id?: string | null
          required_certifications?: string[] | null
          required_expertise_areas?: string[] | null
          updated_at?: string | null
          user_count?: number | null
        }
        Update: {
          approval_required?: boolean | null
          can_be_requested?: boolean | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          is_deleted?: boolean | null
          is_expert_role?: boolean | null
          is_system_role?: boolean | null
          min_years_experience?: number | null
          name?: string
          name_ar?: string | null
          parent_role_id?: string | null
          required_certifications?: string[] | null
          required_expertise_areas?: string[] | null
          updated_at?: string | null
          user_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_parent_role_id_fkey"
            columns: ["parent_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      sandbox_applications: {
        Row: {
          applicant_email: string | null
          applicant_id: string | null
          approved_at: string | null
          created_at: string | null
          duration_months: number | null
          id: string
          organization_name: string | null
          project_description: string | null
          project_title: string | null
          requested_exemptions: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sandbox_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_email?: string | null
          applicant_id?: string | null
          approved_at?: string | null
          created_at?: string | null
          duration_months?: number | null
          id?: string
          organization_name?: string | null
          project_description?: string | null
          project_title?: string | null
          requested_exemptions?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sandbox_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_email?: string | null
          applicant_id?: string | null
          approved_at?: string | null
          created_at?: string | null
          duration_months?: number | null
          id?: string
          organization_name?: string | null
          project_description?: string | null
          project_title?: string | null
          requested_exemptions?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sandbox_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sandbox_applications_sandbox_id_fkey"
            columns: ["sandbox_id"]
            isOneToOne: false
            referencedRelation: "sandboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      sandbox_collaborators: {
        Row: {
          access_level: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          joined_date: string | null
          left_date: string | null
          organization_id: string | null
          role: string | null
          sandbox_id: string | null
          user_email: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          left_date?: string | null
          organization_id?: string | null
          role?: string | null
          sandbox_id?: string | null
          user_email?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          left_date?: string | null
          organization_id?: string | null
          role?: string | null
          sandbox_id?: string | null
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sandbox_collaborators_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sandbox_collaborators_sandbox_id_fkey"
            columns: ["sandbox_id"]
            isOneToOne: false
            referencedRelation: "sandboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      sandbox_incidents: {
        Row: {
          corrective_actions: Json | null
          created_at: string | null
          description: string | null
          id: string
          incident_date: string | null
          incident_type: string
          investigation_status: string | null
          is_closed: boolean | null
          lessons_learned: string | null
          reported_by: string | null
          reported_date: string | null
          resolution_date: string | null
          root_cause: string | null
          sandbox_id: string | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          corrective_actions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          incident_date?: string | null
          incident_type: string
          investigation_status?: string | null
          is_closed?: boolean | null
          lessons_learned?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution_date?: string | null
          root_cause?: string | null
          sandbox_id?: string | null
          severity: string
          title: string
          updated_at?: string | null
        }
        Update: {
          corrective_actions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          incident_date?: string | null
          incident_type?: string
          investigation_status?: string | null
          is_closed?: boolean | null
          lessons_learned?: string | null
          reported_by?: string | null
          reported_date?: string | null
          resolution_date?: string | null
          root_cause?: string | null
          sandbox_id?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sandbox_incidents_sandbox_id_fkey"
            columns: ["sandbox_id"]
            isOneToOne: false
            referencedRelation: "sandboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      sandbox_monitoring_data: {
        Row: {
          data_type: string | null
          id: string
          metadata: Json | null
          metric_name: string | null
          metric_value: number | null
          sandbox_id: string | null
          source: string | null
          timestamp: string | null
          unit: string | null
        }
        Insert: {
          data_type?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string | null
          metric_value?: number | null
          sandbox_id?: string | null
          source?: string | null
          timestamp?: string | null
          unit?: string | null
        }
        Update: {
          data_type?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string | null
          metric_value?: number | null
          sandbox_id?: string | null
          source?: string | null
          timestamp?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sandbox_monitoring_data_sandbox_id_fkey"
            columns: ["sandbox_id"]
            isOneToOne: false
            referencedRelation: "sandboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      sandbox_project_milestones: {
        Row: {
          completed_date: string | null
          created_at: string | null
          deliverables: Json | null
          description: string | null
          due_date: string | null
          id: string
          milestone_name: string
          notes: string | null
          project_id: string | null
          sandbox_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_name: string
          notes?: string | null
          project_id?: string | null
          sandbox_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_name?: string
          notes?: string | null
          project_id?: string | null
          sandbox_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sandbox_project_milestones_sandbox_id_fkey"
            columns: ["sandbox_id"]
            isOneToOne: false
            referencedRelation: "sandboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      sandboxes: {
        Row: {
          capacity: number | null
          created_at: string | null
          current_projects: number | null
          description: string | null
          description_ar: string | null
          domain: string | null
          end_date: string | null
          exemptions_granted: string[] | null
          id: string
          is_active: boolean | null
          is_strategy_derived: boolean | null
          living_lab_id: string | null
          municipality_id: string | null
          name: string
          name_ar: string | null
          regulatory_framework: Json | null
          start_date: string | null
          status: string | null
          strategic_gaps_addressed: string[] | null
          strategic_objective_ids: string[] | null
          strategic_plan_ids: string[] | null
          strategic_taxonomy_codes: string[] | null
          strategy_derivation_date: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          current_projects?: number | null
          description?: string | null
          description_ar?: string | null
          domain?: string | null
          end_date?: string | null
          exemptions_granted?: string[] | null
          id?: string
          is_active?: boolean | null
          is_strategy_derived?: boolean | null
          living_lab_id?: string | null
          municipality_id?: string | null
          name: string
          name_ar?: string | null
          regulatory_framework?: Json | null
          start_date?: string | null
          status?: string | null
          strategic_gaps_addressed?: string[] | null
          strategic_objective_ids?: string[] | null
          strategic_plan_ids?: string[] | null
          strategic_taxonomy_codes?: string[] | null
          strategy_derivation_date?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          current_projects?: number | null
          description?: string | null
          description_ar?: string | null
          domain?: string | null
          end_date?: string | null
          exemptions_granted?: string[] | null
          id?: string
          is_active?: boolean | null
          is_strategy_derived?: boolean | null
          living_lab_id?: string | null
          municipality_id?: string | null
          name?: string
          name_ar?: string | null
          regulatory_framework?: Json | null
          start_date?: string | null
          status?: string | null
          strategic_gaps_addressed?: string[] | null
          strategic_objective_ids?: string[] | null
          strategic_plan_ids?: string[] | null
          strategic_taxonomy_codes?: string[] | null
          strategy_derivation_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sandboxes_living_lab_id_fkey"
            columns: ["living_lab_id"]
            isOneToOne: false
            referencedRelation: "living_labs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sandboxes_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      scaling_plans: {
        Row: {
          approach: string | null
          approved_by: string | null
          approved_date: string | null
          budget_approved: boolean | null
          budget_total: number | null
          contract_status_per_city: Json | null
          contract_value_per_city: number | null
          contract_value_total: number | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          deployed_count: number | null
          estimated_cost: number | null
          go_live_dates: Json | null
          id: string
          integration_requirements: string[] | null
          is_deleted: boolean | null
          payment_terms: Json | null
          phases: Json | null
          pilot_id: string | null
          provider_revenue_total: number | null
          rd_project_id: string | null
          rollout_progress: number | null
          stakeholder_alignment_score: number | null
          status: string | null
          strategy: string | null
          success_metrics: Json | null
          success_metrics_achieved: Json | null
          target_cities: string[] | null
          target_municipalities: string[] | null
          timeline: string | null
          timeline_months: number | null
          title_ar: string | null
          title_en: string
          training_requirements: string[] | null
          updated_at: string | null
          validated_solution_id: string | null
        }
        Insert: {
          approach?: string | null
          approved_by?: string | null
          approved_date?: string | null
          budget_approved?: boolean | null
          budget_total?: number | null
          contract_status_per_city?: Json | null
          contract_value_per_city?: number | null
          contract_value_total?: number | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          deployed_count?: number | null
          estimated_cost?: number | null
          go_live_dates?: Json | null
          id?: string
          integration_requirements?: string[] | null
          is_deleted?: boolean | null
          payment_terms?: Json | null
          phases?: Json | null
          pilot_id?: string | null
          provider_revenue_total?: number | null
          rd_project_id?: string | null
          rollout_progress?: number | null
          stakeholder_alignment_score?: number | null
          status?: string | null
          strategy?: string | null
          success_metrics?: Json | null
          success_metrics_achieved?: Json | null
          target_cities?: string[] | null
          target_municipalities?: string[] | null
          timeline?: string | null
          timeline_months?: number | null
          title_ar?: string | null
          title_en: string
          training_requirements?: string[] | null
          updated_at?: string | null
          validated_solution_id?: string | null
        }
        Update: {
          approach?: string | null
          approved_by?: string | null
          approved_date?: string | null
          budget_approved?: boolean | null
          budget_total?: number | null
          contract_status_per_city?: Json | null
          contract_value_per_city?: number | null
          contract_value_total?: number | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          deployed_count?: number | null
          estimated_cost?: number | null
          go_live_dates?: Json | null
          id?: string
          integration_requirements?: string[] | null
          is_deleted?: boolean | null
          payment_terms?: Json | null
          phases?: Json | null
          pilot_id?: string | null
          provider_revenue_total?: number | null
          rd_project_id?: string | null
          rollout_progress?: number | null
          stakeholder_alignment_score?: number | null
          status?: string | null
          strategy?: string | null
          success_metrics?: Json | null
          success_metrics_achieved?: Json | null
          target_cities?: string[] | null
          target_municipalities?: string[] | null
          timeline?: string | null
          timeline_months?: number | null
          title_ar?: string | null
          title_en?: string
          training_requirements?: string[] | null
          updated_at?: string | null
          validated_solution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scaling_plans_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scaling_plans_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scaling_plans_rd_project_id_fkey"
            columns: ["rd_project_id"]
            isOneToOne: false
            referencedRelation: "rd_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scaling_plans_validated_solution_id_fkey"
            columns: ["validated_solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      scaling_readiness: {
        Row: {
          action_plan: Json | null
          assessed_by: string | null
          assessment_date: string | null
          created_at: string | null
          criteria_breakdown: Json | null
          deleted_by: string | null
          deleted_date: string | null
          dimension_scores: Json | null
          gaps: Json | null
          id: string
          improvement_recommendations: string[] | null
          is_deleted: boolean | null
          overall_score: number
          pilot_id: string
          readiness_criteria: Json | null
          readiness_level: string | null
          readiness_score: number | null
          ready_to_scale: boolean | null
          reassessment_due_date: string | null
          updated_at: string | null
        }
        Insert: {
          action_plan?: Json | null
          assessed_by?: string | null
          assessment_date?: string | null
          created_at?: string | null
          criteria_breakdown?: Json | null
          deleted_by?: string | null
          deleted_date?: string | null
          dimension_scores?: Json | null
          gaps?: Json | null
          id?: string
          improvement_recommendations?: string[] | null
          is_deleted?: boolean | null
          overall_score: number
          pilot_id: string
          readiness_criteria?: Json | null
          readiness_level?: string | null
          readiness_score?: number | null
          ready_to_scale?: boolean | null
          reassessment_due_date?: string | null
          updated_at?: string | null
        }
        Update: {
          action_plan?: Json | null
          assessed_by?: string | null
          assessment_date?: string | null
          created_at?: string | null
          criteria_breakdown?: Json | null
          deleted_by?: string | null
          deleted_date?: string | null
          dimension_scores?: Json | null
          gaps?: Json | null
          id?: string
          improvement_recommendations?: string[] | null
          is_deleted?: boolean | null
          overall_score?: number
          pilot_id?: string
          readiness_criteria?: Json | null
          readiness_level?: string | null
          readiness_score?: number | null
          ready_to_scale?: boolean | null
          reassessment_due_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scaling_readiness_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scaling_readiness_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_strategies: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          kpis: Json | null
          name_ar: string | null
          name_en: string
          objectives: Json | null
          owner_email: string | null
          parent_plan_id: string | null
          sector_id: string | null
          status: string | null
          updated_at: string | null
          vision_ar: string | null
          vision_en: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          kpis?: Json | null
          name_ar?: string | null
          name_en: string
          objectives?: Json | null
          owner_email?: string | null
          parent_plan_id?: string | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
          vision_ar?: string | null
          vision_en?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          kpis?: Json | null
          name_ar?: string | null
          name_en?: string
          objectives?: Json | null
          owner_email?: string | null
          parent_plan_id?: string | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
          vision_ar?: string | null
          vision_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sector_strategies_parent_plan_id_fkey"
            columns: ["parent_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sector_strategies_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          code: string | null
          created_at: string | null
          deputyship_id: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          deputyship_id?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          deputyship_id?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sectors_deputyship_id_fkey"
            columns: ["deputyship_id"]
            isOneToOne: false
            referencedRelation: "deputyships"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          code: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          sector_id: string | null
          subsector_id: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          sector_id?: string | null
          subsector_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          sector_id?: string | null
          subsector_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_subsector_id_fkey"
            columns: ["subsector_id"]
            isOneToOne: false
            referencedRelation: "subsectors"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_cases: {
        Row: {
          challenge_addressed: string | null
          city_id: string | null
          client: string | null
          country: string | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          deployment_date: string | null
          description_ar: string | null
          description_en: string | null
          document_url: string | null
          id: string
          implementation_duration: number | null
          is_deleted: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          kpi_improvements: Json | null
          metrics: Json | null
          municipality_id: string | null
          organization_id: string | null
          outcome_summary: string | null
          pilot_id: string | null
          publication_date: string | null
          results: string | null
          roi_achieved: number | null
          solution_applied: string | null
          solution_id: string | null
          success_rating: number | null
          testimonial_author: string | null
          testimonial_quote: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          challenge_addressed?: string | null
          city_id?: string | null
          client?: string | null
          country?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          deployment_date?: string | null
          description_ar?: string | null
          description_en?: string | null
          document_url?: string | null
          id?: string
          implementation_duration?: number | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          kpi_improvements?: Json | null
          metrics?: Json | null
          municipality_id?: string | null
          organization_id?: string | null
          outcome_summary?: string | null
          pilot_id?: string | null
          publication_date?: string | null
          results?: string | null
          roi_achieved?: number | null
          solution_applied?: string | null
          solution_id?: string | null
          success_rating?: number | null
          testimonial_author?: string | null
          testimonial_quote?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          challenge_addressed?: string | null
          city_id?: string | null
          client?: string | null
          country?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          deployment_date?: string | null
          description_ar?: string | null
          description_en?: string | null
          document_url?: string | null
          id?: string
          implementation_duration?: number | null
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          kpi_improvements?: Json | null
          metrics?: Json | null
          municipality_id?: string | null
          organization_id?: string | null
          outcome_summary?: string | null
          pilot_id?: string | null
          publication_date?: string | null
          results?: string | null
          roi_achieved?: number | null
          solution_applied?: string | null
          solution_id?: string | null
          success_rating?: number | null
          testimonial_author?: string | null
          testimonial_quote?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_cases_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_cases_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_cases_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_cases_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_cases_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_interests: {
        Row: {
          created_at: string | null
          id: string
          interest_type: string | null
          message: string | null
          municipality_id: string | null
          organization_id: string | null
          responded_at: string | null
          response_notes: string | null
          solution_id: string | null
          status: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_type?: string | null
          message?: string | null
          municipality_id?: string | null
          organization_id?: string | null
          responded_at?: string | null
          response_notes?: string | null
          solution_id?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_type?: string | null
          message?: string | null
          municipality_id?: string | null
          organization_id?: string | null
          responded_at?: string | null
          response_notes?: string | null
          solution_id?: string | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_interests_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_interests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_interests_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_reviews: {
        Row: {
          cons: string[] | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_deleted: boolean | null
          is_published: boolean | null
          organization_id: string | null
          pros: string[] | null
          rating: number | null
          review_text: string | null
          reviewer_email: string | null
          reviewer_id: string | null
          reviewer_name: string | null
          solution_id: string | null
          title: string | null
          updated_at: string | null
          use_case: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          cons?: string[] | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_deleted?: boolean | null
          is_published?: boolean | null
          organization_id?: string | null
          pros?: string[] | null
          rating?: number | null
          review_text?: string | null
          reviewer_email?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          solution_id?: string | null
          title?: string | null
          updated_at?: string | null
          use_case?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          cons?: string[] | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_deleted?: boolean | null
          is_published?: boolean | null
          organization_id?: string | null
          pros?: string[] | null
          rating?: number | null
          review_text?: string | null
          reviewer_email?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          solution_id?: string | null
          title?: string | null
          updated_at?: string | null
          use_case?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_reviews_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
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
      stakeholder_analyses: {
        Row: {
          contact_info: string | null
          created_at: string | null
          created_by_email: string | null
          current_engagement: string | null
          engagement_strategy: string | null
          expectations: string | null
          id: string
          influence_description: string | null
          interest_level: number | null
          power_level: number | null
          stakeholder_name_ar: string | null
          stakeholder_name_en: string
          stakeholder_type: string | null
          strategic_plan_id: string | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          created_by_email?: string | null
          current_engagement?: string | null
          engagement_strategy?: string | null
          expectations?: string | null
          id?: string
          influence_description?: string | null
          interest_level?: number | null
          power_level?: number | null
          stakeholder_name_ar?: string | null
          stakeholder_name_en: string
          stakeholder_type?: string | null
          strategic_plan_id?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          created_by_email?: string | null
          current_engagement?: string | null
          engagement_strategy?: string | null
          expectations?: string | null
          id?: string
          influence_description?: string | null
          interest_level?: number | null
          power_level?: number | null
          stakeholder_name_ar?: string | null
          stakeholder_name_en?: string
          stakeholder_type?: string | null
          strategic_plan_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_analyses_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_feedback: {
        Row: {
          comments: string | null
          concerns: string[] | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          feedback_text: string | null
          feedback_type: string
          id: string
          is_addressed: boolean | null
          is_deleted: boolean | null
          milestone_id: string | null
          pilot_id: string
          rating: number | null
          response_date: string | null
          response_text: string | null
          satisfaction_score: number | null
          sentiment: string | null
          stakeholder_email: string
          stakeholder_name: string | null
          stakeholder_role: string | null
          stakeholder_type: string | null
          submitted_date: string | null
        }
        Insert: {
          comments?: string | null
          concerns?: string[] | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          feedback_text?: string | null
          feedback_type: string
          id?: string
          is_addressed?: boolean | null
          is_deleted?: boolean | null
          milestone_id?: string | null
          pilot_id: string
          rating?: number | null
          response_date?: string | null
          response_text?: string | null
          satisfaction_score?: number | null
          sentiment?: string | null
          stakeholder_email: string
          stakeholder_name?: string | null
          stakeholder_role?: string | null
          stakeholder_type?: string | null
          submitted_date?: string | null
        }
        Update: {
          comments?: string | null
          concerns?: string[] | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          feedback_text?: string | null
          feedback_type?: string
          id?: string
          is_addressed?: boolean | null
          is_deleted?: boolean | null
          milestone_id?: string | null
          pilot_id?: string
          rating?: number | null
          response_date?: string | null
          response_text?: string | null
          satisfaction_score?: number | null
          sentiment?: string | null
          stakeholder_email?: string
          stakeholder_name?: string | null
          stakeholder_role?: string | null
          stakeholder_type?: string | null
          submitted_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_feedback_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_feedback_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          created_at: string | null
          email: string | null
          engagement_strategy: string | null
          entity_id: string
          entity_type: string
          id: string
          influence_level: string | null
          interest_level: string | null
          is_deleted: boolean | null
          is_primary: boolean | null
          name: string
          notes: string | null
          organization: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          engagement_strategy?: string | null
          entity_id: string
          entity_type: string
          id?: string
          influence_level?: string | null
          interest_level?: string | null
          is_deleted?: boolean | null
          is_primary?: boolean | null
          name: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          engagement_strategy?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          influence_level?: string | null
          interest_level?: string | null
          is_deleted?: boolean | null
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      startup_profiles: {
        Row: {
          business_model: string | null
          competitive_advantages: string | null
          created_at: string | null
          demo_video_url: string | null
          founders: Json | null
          founding_date: string | null
          funding_stage: string | null
          id: string
          investors: Json | null
          is_published: boolean | null
          organization_id: string | null
          pitch_deck_url: string | null
          target_market: string | null
          team_size: number | null
          total_funding: number | null
          traction_metrics: Json | null
          updated_at: string | null
        }
        Insert: {
          business_model?: string | null
          competitive_advantages?: string | null
          created_at?: string | null
          demo_video_url?: string | null
          founders?: Json | null
          founding_date?: string | null
          funding_stage?: string | null
          id?: string
          investors?: Json | null
          is_published?: boolean | null
          organization_id?: string | null
          pitch_deck_url?: string | null
          target_market?: string | null
          team_size?: number | null
          total_funding?: number | null
          traction_metrics?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_model?: string | null
          competitive_advantages?: string | null
          created_at?: string | null
          demo_video_url?: string | null
          founders?: Json | null
          founding_date?: string | null
          funding_stage?: string | null
          id?: string
          investors?: Json | null
          is_published?: boolean | null
          organization_id?: string | null
          pitch_deck_url?: string | null
          target_market?: string | null
          team_size?: number | null
          total_funding?: number | null
          traction_metrics?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_verifications: {
        Row: {
          created_at: string | null
          documents: Json | null
          id: string
          notes: string | null
          organization_id: string | null
          rejection_reason: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
          verification_status: string | null
          verification_type: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          documents?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          rejection_reason?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verification_type?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          documents?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          rejection_reason?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verification_type?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_verifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_plan_challenge_links: {
        Row: {
          budget_allocated: number | null
          challenge_id: string
          completion_date: string | null
          contribution_type: string | null
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          expected_impact: string | null
          id: string
          is_deleted: boolean | null
          kpi_targets: Json | null
          linked_by: string | null
          linked_date: string | null
          notes: string | null
          priority: string | null
          progress_percentage: number | null
          status: string | null
          strategic_objective: string
          strategic_plan_id: string
        }
        Insert: {
          budget_allocated?: number | null
          challenge_id: string
          completion_date?: string | null
          contribution_type?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          expected_impact?: string | null
          id?: string
          is_deleted?: boolean | null
          kpi_targets?: Json | null
          linked_by?: string | null
          linked_date?: string | null
          notes?: string | null
          priority?: string | null
          progress_percentage?: number | null
          status?: string | null
          strategic_objective: string
          strategic_plan_id: string
        }
        Update: {
          budget_allocated?: number | null
          challenge_id?: string
          completion_date?: string | null
          contribution_type?: string | null
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          expected_impact?: string | null
          id?: string
          is_deleted?: boolean | null
          kpi_targets?: Json | null
          linked_by?: string | null
          linked_date?: string | null
          notes?: string | null
          priority?: string | null
          progress_percentage?: number | null
          status?: string | null
          strategic_objective?: string
          strategic_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategic_plan_challenge_links_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plan_challenge_links_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plan_challenge_links_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_plans: {
        Row: {
          action_plans: Json | null
          activated_at: string | null
          activated_by: string | null
          approval_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          archived_by: string | null
          budget_range: string | null
          cascade_config: Json | null
          change_management: Json | null
          code: string | null
          communication_plan: Json | null
          completed_at: string | null
          completed_by: string | null
          constraints: Json | null
          core_values: string[] | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          dependencies: Json | null
          description_ar: string | null
          description_en: string | null
          draft_data: Json | null
          end_year: number | null
          focus_technologies: string[] | null
          governance: Json | null
          id: string
          is_deleted: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          is_template: boolean | null
          kpis: Json | null
          last_saved_step: number | null
          milestones: Json | null
          mission_ar: string | null
          mission_en: string | null
          municipality_id: string | null
          name_ar: string | null
          name_en: string
          national_alignments: Json | null
          objectives: Json | null
          owner_email: string | null
          pestel: Json | null
          phases: Json | null
          pillars: Json | null
          previous_version_id: string | null
          resource_plan: Json | null
          risks: Json | null
          scenarios: Json | null
          source_plan_id: string | null
          stakeholders: Json | null
          start_year: number | null
          status: string | null
          strategic_pillars: string[] | null
          strategic_themes: string[] | null
          submitted_at: string | null
          submitted_by: string | null
          swot: Json | null
          target_regions: string[] | null
          target_sectors: string[] | null
          template_category: string | null
          template_rating: number | null
          template_reviews: number | null
          template_tags: string[] | null
          template_type: string | null
          updated_at: string | null
          usage_count: number | null
          version_notes: string | null
          version_number: number | null
          vision_2030_programs: string[] | null
          vision_ar: string | null
          vision_en: string | null
        }
        Insert: {
          action_plans?: Json | null
          activated_at?: string | null
          activated_by?: string | null
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          archived_by?: string | null
          budget_range?: string | null
          cascade_config?: Json | null
          change_management?: Json | null
          code?: string | null
          communication_plan?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          constraints?: Json | null
          core_values?: string[] | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dependencies?: Json | null
          description_ar?: string | null
          description_en?: string | null
          draft_data?: Json | null
          end_year?: number | null
          focus_technologies?: string[] | null
          governance?: Json | null
          id?: string
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          is_template?: boolean | null
          kpis?: Json | null
          last_saved_step?: number | null
          milestones?: Json | null
          mission_ar?: string | null
          mission_en?: string | null
          municipality_id?: string | null
          name_ar?: string | null
          name_en: string
          national_alignments?: Json | null
          objectives?: Json | null
          owner_email?: string | null
          pestel?: Json | null
          phases?: Json | null
          pillars?: Json | null
          previous_version_id?: string | null
          resource_plan?: Json | null
          risks?: Json | null
          scenarios?: Json | null
          source_plan_id?: string | null
          stakeholders?: Json | null
          start_year?: number | null
          status?: string | null
          strategic_pillars?: string[] | null
          strategic_themes?: string[] | null
          submitted_at?: string | null
          submitted_by?: string | null
          swot?: Json | null
          target_regions?: string[] | null
          target_sectors?: string[] | null
          template_category?: string | null
          template_rating?: number | null
          template_reviews?: number | null
          template_tags?: string[] | null
          template_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          version_notes?: string | null
          version_number?: number | null
          vision_2030_programs?: string[] | null
          vision_ar?: string | null
          vision_en?: string | null
        }
        Update: {
          action_plans?: Json | null
          activated_at?: string | null
          activated_by?: string | null
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          archived_by?: string | null
          budget_range?: string | null
          cascade_config?: Json | null
          change_management?: Json | null
          code?: string | null
          communication_plan?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          constraints?: Json | null
          core_values?: string[] | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          dependencies?: Json | null
          description_ar?: string | null
          description_en?: string | null
          draft_data?: Json | null
          end_year?: number | null
          focus_technologies?: string[] | null
          governance?: Json | null
          id?: string
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          is_template?: boolean | null
          kpis?: Json | null
          last_saved_step?: number | null
          milestones?: Json | null
          mission_ar?: string | null
          mission_en?: string | null
          municipality_id?: string | null
          name_ar?: string | null
          name_en?: string
          national_alignments?: Json | null
          objectives?: Json | null
          owner_email?: string | null
          pestel?: Json | null
          phases?: Json | null
          pillars?: Json | null
          previous_version_id?: string | null
          resource_plan?: Json | null
          risks?: Json | null
          scenarios?: Json | null
          source_plan_id?: string | null
          stakeholders?: Json | null
          start_year?: number | null
          status?: string | null
          strategic_pillars?: string[] | null
          strategic_themes?: string[] | null
          submitted_at?: string | null
          submitted_by?: string | null
          swot?: Json | null
          target_regions?: string[] | null
          target_sectors?: string[] | null
          template_category?: string | null
          template_rating?: number | null
          template_reviews?: number | null
          template_tags?: string[] | null
          template_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          version_notes?: string | null
          version_number?: number | null
          vision_2030_programs?: string[] | null
          vision_ar?: string | null
          vision_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_plans_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plans_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plans_source_plan_id_fkey"
            columns: ["source_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_baselines: {
        Row: {
          baseline_value: number
          category: string | null
          collection_date: string | null
          created_at: string | null
          created_by_email: string | null
          id: string
          kpi_name_ar: string | null
          kpi_name_en: string
          notes: string | null
          source: string | null
          status: string | null
          strategic_plan_id: string | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          baseline_value: number
          category?: string | null
          collection_date?: string | null
          created_at?: string | null
          created_by_email?: string | null
          id?: string
          kpi_name_ar?: string | null
          kpi_name_en: string
          notes?: string | null
          source?: string | null
          status?: string | null
          strategic_plan_id?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          baseline_value?: number
          category?: string | null
          collection_date?: string | null
          created_at?: string | null
          created_by_email?: string | null
          id?: string
          kpi_name_ar?: string | null
          kpi_name_en?: string
          notes?: string | null
          source?: string | null
          status?: string | null
          strategic_plan_id?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_baselines_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_inputs: {
        Row: {
          ai_extracted_themes: string[] | null
          created_at: string | null
          created_by_email: string | null
          id: string
          input_text: string
          input_title: string | null
          priority_votes: number | null
          sentiment: string | null
          source_entity_id: string | null
          source_name: string | null
          source_type: string | null
          status: string | null
          strategic_plan_id: string | null
          theme: string | null
        }
        Insert: {
          ai_extracted_themes?: string[] | null
          created_at?: string | null
          created_by_email?: string | null
          id?: string
          input_text: string
          input_title?: string | null
          priority_votes?: number | null
          sentiment?: string | null
          source_entity_id?: string | null
          source_name?: string | null
          source_type?: string | null
          status?: string | null
          strategic_plan_id?: string | null
          theme?: string | null
        }
        Update: {
          ai_extracted_themes?: string[] | null
          created_at?: string | null
          created_by_email?: string | null
          id?: string
          input_text?: string
          input_title?: string | null
          priority_votes?: number | null
          sentiment?: string | null
          source_entity_id?: string | null
          source_name?: string | null
          source_type?: string | null
          status?: string | null
          strategic_plan_id?: string | null
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_inputs_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_milestones: {
        Row: {
          created_at: string | null
          created_by: string | null
          deliverables: string[] | null
          dependencies: string[] | null
          end_date: string
          id: string
          objective_id: string | null
          owner_email: string | null
          progress_percentage: number | null
          resources_required: string[] | null
          start_date: string
          status: string | null
          strategic_plan_id: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deliverables?: string[] | null
          dependencies?: string[] | null
          end_date: string
          id?: string
          objective_id?: string | null
          owner_email?: string | null
          progress_percentage?: number | null
          resources_required?: string[] | null
          start_date: string
          status?: string | null
          strategic_plan_id?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deliverables?: string[] | null
          dependencies?: string[] | null
          end_date?: string
          id?: string
          objective_id?: string | null
          owner_email?: string | null
          progress_percentage?: number | null
          resources_required?: string[] | null
          start_date?: string
          status?: string | null
          strategic_plan_id?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_milestones_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_ownership: {
        Row: {
          accountable_email: string | null
          consulted_emails: string[] | null
          created_at: string | null
          created_by: string | null
          delegation_allowed: boolean | null
          escalation_path: string | null
          id: string
          informed_emails: string[] | null
          notifications_enabled: boolean | null
          objective_id: string | null
          objective_title: string | null
          responsible_email: string | null
          strategic_plan_id: string | null
          updated_at: string | null
        }
        Insert: {
          accountable_email?: string | null
          consulted_emails?: string[] | null
          created_at?: string | null
          created_by?: string | null
          delegation_allowed?: boolean | null
          escalation_path?: string | null
          id?: string
          informed_emails?: string[] | null
          notifications_enabled?: boolean | null
          objective_id?: string | null
          objective_title?: string | null
          responsible_email?: string | null
          strategic_plan_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accountable_email?: string | null
          consulted_emails?: string[] | null
          created_at?: string | null
          created_by?: string | null
          delegation_allowed?: boolean | null
          escalation_path?: string | null
          id?: string
          informed_emails?: string[] | null
          notifications_enabled?: boolean | null
          objective_id?: string | null
          objective_title?: string | null
          responsible_email?: string | null
          strategic_plan_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_ownership_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_risks: {
        Row: {
          category: string | null
          contingency_plan: string | null
          created_at: string | null
          description: string | null
          id: string
          impact: number | null
          mitigation_strategy: string | null
          name_ar: string | null
          name_en: string
          owner_email: string | null
          probability: number | null
          residual_impact: number | null
          residual_probability: number | null
          status: string | null
          strategic_plan_id: string | null
          triggers: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: number | null
          mitigation_strategy?: string | null
          name_ar?: string | null
          name_en: string
          owner_email?: string | null
          probability?: number | null
          residual_impact?: number | null
          residual_probability?: number | null
          status?: string | null
          strategic_plan_id?: string | null
          triggers?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          contingency_plan?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: number | null
          mitigation_strategy?: string | null
          name_ar?: string | null
          name_en?: string
          owner_email?: string | null
          probability?: number | null
          residual_impact?: number | null
          residual_probability?: number | null
          status?: string | null
          strategic_plan_id?: string | null
          triggers?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_risks_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_signoffs: {
        Row: {
          comments: string | null
          conditions: string[] | null
          created_at: string | null
          created_by: string | null
          delegate_email: string | null
          due_date: string | null
          id: string
          reminder_count: number | null
          requested_date: string | null
          signed_date: string | null
          stakeholder_email: string | null
          stakeholder_name: string
          stakeholder_role: string
          status: string | null
          strategic_plan_id: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          conditions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          delegate_email?: string | null
          due_date?: string | null
          id?: string
          reminder_count?: number | null
          requested_date?: string | null
          signed_date?: string | null
          stakeholder_email?: string | null
          stakeholder_name: string
          stakeholder_role: string
          status?: string | null
          strategic_plan_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          conditions?: string[] | null
          created_at?: string | null
          created_by?: string | null
          delegate_email?: string | null
          due_date?: string | null
          id?: string
          reminder_count?: number | null
          requested_date?: string | null
          signed_date?: string | null
          stakeholder_email?: string | null
          stakeholder_name?: string
          stakeholder_role?: string
          status?: string | null
          strategic_plan_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_signoffs_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_versions: {
        Row: {
          change_summary: string | null
          changes: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          snapshot_data: Json | null
          status: string | null
          strategic_plan_id: string | null
          version_label: string | null
          version_number: string
        }
        Insert: {
          change_summary?: string | null
          changes?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          snapshot_data?: Json | null
          status?: string | null
          strategic_plan_id?: string | null
          version_label?: string | null
          version_number: string
        }
        Update: {
          change_summary?: string | null
          changes?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          snapshot_data?: Json | null
          status?: string | null
          strategic_plan_id?: string | null
          version_label?: string | null
          version_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_versions_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subsectors: {
        Row: {
          code: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          sector_id: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          sector_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          sector_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsectors_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      swot_analyses: {
        Row: {
          created_at: string | null
          created_by_email: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          impact_level: string | null
          priority: string | null
          quadrant: string
          related_entity_ids: string[] | null
          source: string | null
          strategic_plan_id: string | null
          title_ar: string | null
          title_en: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_email?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          impact_level?: string | null
          priority?: string | null
          quadrant: string
          related_entity_ids?: string[] | null
          source?: string | null
          strategic_plan_id?: string | null
          title_ar?: string | null
          title_en: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_email?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          impact_level?: string | null
          priority?: string | null
          quadrant?: string
          related_entity_ids?: string[] | null
          source?: string | null
          strategic_plan_id?: string | null
          title_ar?: string | null
          title_en?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swot_analyses_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      system_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_validation_summaries: {
        Row: {
          completed_checks: number | null
          created_at: string | null
          critical_completed: number | null
          critical_total: number | null
          id: string
          last_validated_at: string | null
          last_validated_by: string | null
          status: string | null
          system_id: string
          system_name: string
          total_checks: number | null
          updated_at: string | null
        }
        Insert: {
          completed_checks?: number | null
          created_at?: string | null
          critical_completed?: number | null
          critical_total?: number | null
          id?: string
          last_validated_at?: string | null
          last_validated_by?: string | null
          status?: string | null
          system_id: string
          system_name: string
          total_checks?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_checks?: number | null
          created_at?: string | null
          critical_completed?: number | null
          critical_total?: number | null
          id?: string
          last_validated_at?: string | null
          last_validated_by?: string | null
          status?: string | null
          system_id?: string
          system_name?: string
          total_checks?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_validations: {
        Row: {
          category_id: string
          check_id: string
          checked_at: string | null
          checked_by: string | null
          created_at: string | null
          id: string
          is_checked: boolean | null
          notes: string | null
          system_id: string
          system_name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          check_id: string
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          notes?: string | null
          system_id: string
          system_name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          check_id?: string
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          notes?: string | null
          system_id?: string
          system_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          tag_type: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          tag_type?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          tag_type?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_email: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          due_date: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          priority: string | null
          status: string | null
          task_type: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_email?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          assigned_to_email?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          joined_date: string | null
          left_date: string | null
          permissions: Json | null
          role: string | null
          team_id: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          left_date?: string | null
          permissions?: Json | null
          role?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          left_date?: string | null
          permissions?: Json | null
          role?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          deleted_by: string | null
          deleted_date: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          lead_user_email: string | null
          member_count: number | null
          municipality_id: string | null
          name: string
          objectives: string[] | null
          performance_metrics: Json | null
          permissions: string[] | null
          team_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          lead_user_email?: string | null
          member_count?: number | null
          municipality_id?: string | null
          name: string
          objectives?: string[] | null
          performance_metrics?: Json | null
          permissions?: string[] | null
          team_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_by?: string | null
          deleted_date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          lead_user_email?: string | null
          member_count?: number | null
          municipality_id?: string | null
          name?: string
          objectives?: string[] | null
          performance_metrics?: Json | null
          permissions?: string[] | null
          team_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_entries: {
        Row: {
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_published: boolean | null
          relevance_score: number | null
          sector_id: string | null
          source: string | null
          source_url: string | null
          tags: string[] | null
          title_ar: string | null
          title_en: string
          trend_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean | null
          relevance_score?: number | null
          sector_id?: string | null
          source?: string | null
          source_url?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_en: string
          trend_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean | null
          relevance_score?: number | null
          sector_id?: string | null
          source?: string | null
          source_url?: string | null
          tags?: string[] | null
          title_ar?: string | null
          title_en?: string
          trend_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trend_entries_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          page_url: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_date: string | null
          created_at: string | null
          custom_message: string | null
          email: string
          expires_date: string | null
          full_name: string | null
          id: string
          invitation_date: string | null
          invitation_token: string | null
          invited_by: string | null
          last_resent_date: string | null
          metadata: Json | null
          municipality_id: string | null
          organization_id: string | null
          resend_count: number | null
          role: string | null
          status: string | null
          team_ids: string[] | null
        }
        Insert: {
          accepted_date?: string | null
          created_at?: string | null
          custom_message?: string | null
          email: string
          expires_date?: string | null
          full_name?: string | null
          id?: string
          invitation_date?: string | null
          invitation_token?: string | null
          invited_by?: string | null
          last_resent_date?: string | null
          metadata?: Json | null
          municipality_id?: string | null
          organization_id?: string | null
          resend_count?: number | null
          role?: string | null
          status?: string | null
          team_ids?: string[] | null
        }
        Update: {
          accepted_date?: string | null
          created_at?: string | null
          custom_message?: string | null
          email?: string
          expires_date?: string | null
          full_name?: string | null
          id?: string
          invitation_date?: string | null
          invitation_token?: string | null
          invited_by?: string | null
          last_resent_date?: string | null
          metadata?: Json | null
          municipality_id?: string | null
          organization_id?: string | null
          resend_count?: number | null
          role?: string | null
          status?: string | null
          team_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string | null
          email_categories: Json | null
          email_notifications: boolean | null
          frequency: string | null
          id: string
          in_app_notifications: boolean | null
          notification_types: Json | null
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_categories?: Json | null
          email_notifications?: boolean | null
          frequency?: string | null
          id?: string
          in_app_notifications?: boolean | null
          notification_types?: Json | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_categories?: Json | null
          email_notifications?: boolean | null
          frequency?: string | null
          id?: string
          in_app_notifications?: boolean | null
          notification_types?: Json | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          achievement_badges: Json | null
          avatar_url: string | null
          bio: string | null
          bio_ar: string | null
          bio_en: string | null
          certifications: Json | null
          city_id: string | null
          contact_preferences: Json | null
          contribution_count: number | null
          cover_image_url: string | null
          created_at: string | null
          cv_url: string | null
          date_of_birth: string | null
          degree: string | null
          department: string | null
          department_ar: string | null
          department_en: string | null
          education_level: string | null
          expertise_areas: string[] | null
          extracted_data: Json | null
          full_name: string | null
          full_name_ar: string | null
          full_name_en: string | null
          gender: string | null
          id: string
          interests: string[] | null
          is_active: boolean | null
          is_public: boolean | null
          job_title: string | null
          job_title_ar: string | null
          job_title_en: string | null
          languages: Json | null
          last_profile_update: string | null
          linkedin_url: string | null
          location_city: string | null
          location_region: string | null
          mobile_country_code: string | null
          mobile_number: string | null
          municipality_id: string | null
          national_id: string | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_step: number | null
          organization_ar: string | null
          organization_en: string | null
          organization_id: string | null
          persona_onboarding_completed: boolean | null
          phone_number: string | null
          preferred_language: string | null
          profile_completion_percentage: number | null
          region_id: string | null
          selected_persona: string | null
          skills: string[] | null
          social_links: Json | null
          timezone: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          verified: boolean | null
          visibility_settings: Json | null
          work_experience: Json | null
          work_phone: string | null
          years_experience: number | null
        }
        Insert: {
          achievement_badges?: Json | null
          avatar_url?: string | null
          bio?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          certifications?: Json | null
          city_id?: string | null
          contact_preferences?: Json | null
          contribution_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          degree?: string | null
          department?: string | null
          department_ar?: string | null
          department_en?: string | null
          education_level?: string | null
          expertise_areas?: string[] | null
          extracted_data?: Json | null
          full_name?: string | null
          full_name_ar?: string | null
          full_name_en?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          is_public?: boolean | null
          job_title?: string | null
          job_title_ar?: string | null
          job_title_en?: string | null
          languages?: Json | null
          last_profile_update?: string | null
          linkedin_url?: string | null
          location_city?: string | null
          location_region?: string | null
          mobile_country_code?: string | null
          mobile_number?: string | null
          municipality_id?: string | null
          national_id?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          organization_ar?: string | null
          organization_en?: string | null
          organization_id?: string | null
          persona_onboarding_completed?: boolean | null
          phone_number?: string | null
          preferred_language?: string | null
          profile_completion_percentage?: number | null
          region_id?: string | null
          selected_persona?: string | null
          skills?: string[] | null
          social_links?: Json | null
          timezone?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          verified?: boolean | null
          visibility_settings?: Json | null
          work_experience?: Json | null
          work_phone?: string | null
          years_experience?: number | null
        }
        Update: {
          achievement_badges?: Json | null
          avatar_url?: string | null
          bio?: string | null
          bio_ar?: string | null
          bio_en?: string | null
          certifications?: Json | null
          city_id?: string | null
          contact_preferences?: Json | null
          contribution_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          degree?: string | null
          department?: string | null
          department_ar?: string | null
          department_en?: string | null
          education_level?: string | null
          expertise_areas?: string[] | null
          extracted_data?: Json | null
          full_name?: string | null
          full_name_ar?: string | null
          full_name_en?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          is_public?: boolean | null
          job_title?: string | null
          job_title_ar?: string | null
          job_title_en?: string | null
          languages?: Json | null
          last_profile_update?: string | null
          linkedin_url?: string | null
          location_city?: string | null
          location_region?: string | null
          mobile_country_code?: string | null
          mobile_number?: string | null
          municipality_id?: string | null
          national_id?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          organization_ar?: string | null
          organization_en?: string | null
          organization_id?: string | null
          persona_onboarding_completed?: boolean | null
          phone_number?: string | null
          preferred_language?: string | null
          profile_completion_percentage?: number | null
          region_id?: string | null
          selected_persona?: string | null
          skills?: string[] | null
          social_links?: Json | null
          timezone?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          verified?: boolean | null
          visibility_settings?: Json | null
          work_experience?: Json | null
          work_phone?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          created_at: string
          id: string
          is_active: boolean | null
          municipality_id: string | null
          organization_id: string | null
          revoked_at: string | null
          role: string | null
          role_id: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          municipality_id?: string | null
          organization_id?: string | null
          revoked_at?: string | null
          role?: string | null
          role_id: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          municipality_id?: string | null
          organization_id?: string | null
          revoked_at?: string | null
          role?: string | null
          role_id?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          device_info: Json | null
          ended_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          session_token: string | null
          started_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          session_token?: string | null
          started_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          session_token?: string | null
          started_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          allow_messages: boolean | null
          auto_save: boolean | null
          created_at: string | null
          default_view: string | null
          density: string | null
          font_size: string | null
          high_contrast: boolean | null
          id: string
          keyboard_navigation: boolean | null
          notifications_challenges: boolean | null
          notifications_digest_frequency: string | null
          notifications_email: boolean | null
          notifications_pilots: boolean | null
          notifications_programs: boolean | null
          notifications_push: boolean | null
          notifications_quiet_hours_end: string | null
          notifications_quiet_hours_start: string | null
          preferred_language: string | null
          profile_visibility: string | null
          reduce_motion: boolean | null
          screen_reader_optimized: boolean | null
          show_activity: boolean | null
          show_tutorials: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_messages?: boolean | null
          auto_save?: boolean | null
          created_at?: string | null
          default_view?: string | null
          density?: string | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          keyboard_navigation?: boolean | null
          notifications_challenges?: boolean | null
          notifications_digest_frequency?: string | null
          notifications_email?: boolean | null
          notifications_pilots?: boolean | null
          notifications_programs?: boolean | null
          notifications_push?: boolean | null
          notifications_quiet_hours_end?: string | null
          notifications_quiet_hours_start?: string | null
          preferred_language?: string | null
          profile_visibility?: string | null
          reduce_motion?: boolean | null
          screen_reader_optimized?: boolean | null
          show_activity?: boolean | null
          show_tutorials?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_messages?: boolean | null
          auto_save?: boolean | null
          created_at?: string | null
          default_view?: string | null
          density?: string | null
          font_size?: string | null
          high_contrast?: boolean | null
          id?: string
          keyboard_navigation?: boolean | null
          notifications_challenges?: boolean | null
          notifications_digest_frequency?: string | null
          notifications_email?: boolean | null
          notifications_pilots?: boolean | null
          notifications_programs?: boolean | null
          notifications_push?: boolean | null
          notifications_quiet_hours_end?: string | null
          notifications_quiet_hours_start?: string | null
          preferred_language?: string | null
          profile_visibility?: string | null
          reduce_motion?: boolean | null
          screen_reader_optimized?: boolean | null
          show_activity?: boolean | null
          show_tutorials?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          bank_details: Json | null
          certifications: Json | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          name_ar: string | null
          name_en: string
          registration_number: string | null
          tax_number: string | null
          updated_at: string | null
          vendor_type: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_details?: Json | null
          certifications?: Json | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name_ar?: string | null
          name_en: string
          registration_number?: string | null
          tax_number?: string | null
          updated_at?: string | null
          vendor_type?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_details?: Json | null
          certifications?: Json | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name_ar?: string | null
          name_en?: string
          registration_number?: string | null
          tax_number?: string | null
          updated_at?: string | null
          vendor_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      welcome_emails_sent: {
        Row: {
          email_type: string | null
          id: string
          metadata: Json | null
          persona: string | null
          sent_at: string
          status: string | null
          subject: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          email_type?: string | null
          id?: string
          metadata?: Json | null
          persona?: string | null
          sent_at?: string
          status?: string | null
          subject?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          email_type?: string | null
          id?: string
          metadata?: Json | null
          persona?: string | null
          sent_at?: string
          status?: string | null
          subject?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      challenges_public_view: {
        Row: {
          category: string | null
          citizen_votes_count: number | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string | null
          image_url: string | null
          is_featured: boolean | null
          municipality_id: string | null
          owner_email_masked: string | null
          priority: string | null
          reviewer_masked: string | null
          sector_id: string | null
          status: string | null
          tagline_ar: string | null
          tagline_en: string | null
          title_ar: string | null
          title_en: string | null
          view_count: number | null
        }
        Insert: {
          category?: string | null
          citizen_votes_count?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          municipality_id?: string | null
          owner_email_masked?: never
          priority?: string | null
          reviewer_masked?: never
          sector_id?: string | null
          status?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          title_ar?: string | null
          title_en?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string | null
          citizen_votes_count?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          municipality_id?: string | null
          owner_email_masked?: never
          priority?: string | null
          reviewer_masked?: never
          sector_id?: string | null
          status?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          title_ar?: string | null
          title_en?: string | null
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
      pilots_public_view: {
        Row: {
          budget: number | null
          budget_currency: string | null
          budget_released: number | null
          budget_spent: number | null
          challenge_id: string | null
          city_id: string | null
          code: string | null
          created_at: string | null
          created_by_masked: string | null
          description_ar: string | null
          description_en: string | null
          duration_weeks: number | null
          hypothesis: string | null
          id: string | null
          is_archived: boolean | null
          is_flagship: boolean | null
          is_published: boolean | null
          kpis: Json | null
          living_lab_id: string | null
          methodology: string | null
          milestones: Json | null
          municipality_id: string | null
          objective_ar: string | null
          objective_en: string | null
          region_id: string | null
          risk_level: string | null
          risks: Json | null
          sandbox_id: string | null
          scope: string | null
          sector: string | null
          solution_id: string | null
          stage: string | null
          sub_sector: string | null
          success_probability: number | null
          title_ar: string | null
          title_en: string | null
          trl_current: number | null
          trl_start: number | null
          trl_target: number | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          budget_currency?: string | null
          budget_released?: number | null
          budget_spent?: number | null
          challenge_id?: string | null
          city_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by_masked?: never
          description_ar?: string | null
          description_en?: string | null
          duration_weeks?: number | null
          hypothesis?: string | null
          id?: string | null
          is_archived?: boolean | null
          is_flagship?: boolean | null
          is_published?: boolean | null
          kpis?: Json | null
          living_lab_id?: string | null
          methodology?: string | null
          milestones?: Json | null
          municipality_id?: string | null
          objective_ar?: string | null
          objective_en?: string | null
          region_id?: string | null
          risk_level?: string | null
          risks?: Json | null
          sandbox_id?: string | null
          scope?: string | null
          sector?: string | null
          solution_id?: string | null
          stage?: string | null
          sub_sector?: string | null
          success_probability?: number | null
          title_ar?: string | null
          title_en?: string | null
          trl_current?: number | null
          trl_start?: number | null
          trl_target?: number | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          budget_currency?: string | null
          budget_released?: number | null
          budget_spent?: number | null
          challenge_id?: string | null
          city_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by_masked?: never
          description_ar?: string | null
          description_en?: string | null
          duration_weeks?: number | null
          hypothesis?: string | null
          id?: string | null
          is_archived?: boolean | null
          is_flagship?: boolean | null
          is_published?: boolean | null
          kpis?: Json | null
          living_lab_id?: string | null
          methodology?: string | null
          milestones?: Json | null
          municipality_id?: string | null
          objective_ar?: string | null
          objective_en?: string | null
          region_id?: string | null
          risk_level?: string | null
          risks?: Json | null
          sandbox_id?: string | null
          scope?: string | null
          sector?: string | null
          solution_id?: string | null
          stage?: string | null
          sub_sector?: string | null
          success_probability?: number | null
          title_ar?: string | null
          title_en?: string | null
          trl_current?: number | null
          trl_start?: number | null
          trl_target?: number | null
          updated_at?: string | null
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
            foreignKeyName: "pilots_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges_public_view"
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
    }
    Functions: {
      can_delete_media: { Args: { p_media_file_id: string }; Returns: Json }
      can_view_entity: {
        Args: {
          p_entity_municipality_id: string
          p_entity_sector_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      check_ai_rate_limit: {
        Args: {
          p_endpoint?: string
          p_session_id: string
          p_user_id?: string
          p_user_type?: string
        }
        Returns: Json
      }
      cleanup_old_audit_logs: {
        Args: { retention_days?: number }
        Returns: number
      }
      cleanup_old_pilot_audit_logs: {
        Args: { retention_days?: number }
        Returns: number
      }
      cleanup_orphaned_pilot_files: { Args: never; Returns: number }
      delete_media_with_cascade: {
        Args: { p_cascade_action?: string; p_media_file_id: string }
        Returns: Json
      }
      get_media_usage_count: {
        Args: { p_media_file_id: string }
        Returns: number
      }
      get_role_id_by_name: { Args: { _role_name: string }; Returns: string }
      get_user_functional_roles: {
        Args: { _user_id: string }
        Returns: {
          role_description: string
          role_id: string
          role_name: string
        }[]
      }
      get_user_permissions: { Args: { _user_id: string }; Returns: string[] }
      get_user_visibility_scope: {
        Args: { p_user_id: string }
        Returns: {
          is_national: boolean
          municipality_id: string
          scope_type: string
          sector_ids: string[]
        }[]
      }
      has_permission: {
        Args: { _permission_code: string; _user_id: string }
        Returns: boolean
      }
      has_role_by_id: {
        Args: { _role_id: string; _user_id: string }
        Returns: boolean
      }
      has_role_by_name: {
        Args: { _role_name: string; _user_id: string }
        Returns: boolean
      }
      increment_media_download: {
        Args: { p_media_id: string }
        Returns: undefined
      }
      increment_media_view: { Args: { p_media_id: string }; Returns: undefined }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_national_entity: {
        Args: { p_municipality_id: string }
        Returns: boolean
      }
      log_pilot_bulk_operation: {
        Args: {
          p_entity_ids: string[]
          p_operation: string
          p_user_email: string
        }
        Returns: undefined
      }
      log_pilot_export: {
        Args: {
          p_export_type: string
          p_filters: Json
          p_record_count: number
          p_user_email: string
        }
        Returns: undefined
      }
      map_enum_to_role_id: { Args: { _enum_role: string }; Returns: string }
      mask_email: { Args: { email: string }; Returns: string }
      rate_template: {
        Args: { p_rating: number; p_template_id: string; p_user_email: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
