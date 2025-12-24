
import { Database } from '../integrations/supabase/types';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];


export type Program = Database['public']['Tables']['programs']['Row'] & {
    embedding?: number[] | string | null;
    is_open?: boolean | null;
    // graduated_count might be graduates_count or just missing from types
    graduated_count?: number | null;
    graduates_count?: number | null;
    is_flagship?: boolean | null;
    application_count?: number | null;
    accepted_count?: number | null;

    // JSON fields that might be typed as Json but we want specific shape
    benefits?: any[] | null;
    curriculum?: any[] | null;
    timeline?: any | null;
    funding_details?: any | null;
    expert_reviewers?: any | null;
    mentor_pool?: any | null;
};

export type ProgramApplication = Database['public']['Tables']['program_applications']['Row'] & {
    team_members?: any[] | null;
    linked_challenges?: any[] | null;
    linked_solutions?: any[] | null;
    motivation?: string | null;
    expected_outcomes?: string | null;
    organization_name?: string | null;
    applicant_name?: string | null;
};

export type Challenge = Database['public']['Tables']['challenges']['Row'] & {
    // Add any missing challenge fields if needed
};

export type PolicyTemplate = Database['public']['Tables']['policy_templates']['Row'] & {
    name_ar?: string | null;
    name_en?: string | null;
    description_ar?: string | null;
    description_en?: string | null;
    usage_count?: number | null;
    template_data?: any | null;
    icon?: string | null;
};

export type PolicyRecommendation = Database['public']['Tables']['policy_recommendations']['Row'] & {
    title_ar?: string | null;
    title_en?: string | null;
    recommendation_text_ar?: string | null;
    recommendation_text_en?: string | null;
    description_ar?: string | null;
    description_en?: string | null;
    workflow_stage?: string | null;
    priority_level?: string | null;
    regulatory_change_needed?: boolean | null;
    embedding?: number[] | string | null;
    challenge_id?: string | null;
    pilot_id?: string | null;
    rd_project_id?: string | null;
    program_id?: string | null;
    submitted_by?: string | null;
    timeline_months?: number | null;
    regulatory_framework?: string | null;
    impact_score?: number | null;
    status?: string | null;
};

export type PolicyDocument = Database['public']['Tables']['policy_documents']['Row'] & {
    title_ar?: string | null;
    title_en?: string | null;
    description_ar?: string | null;
    description_en?: string | null;
    summary_ar?: string | null;
    summary_en?: string | null;
    code?: string | null;
    policy_code?: string | null;
    document_url?: string | null;
    effective_date?: string | null;
};

export type Sandbox = Database['public']['Tables']['sandboxes']['Row'] & {
    name_ar?: string | null;
    name_en?: string | null;
    domain?: string | null;
    status?: string | null;
    capacity?: number | null;
    current_pilots?: number | null;
    code?: string | null;
    manager_email?: string | null;
    created_by?: string | null;
};

export type SandboxApplication = Database['public']['Tables']['sandbox_applications']['Row'] & {
    project_title?: string | null;
    applicant_organization?: string | null;
    status?: string | null;
    sandbox_id?: string | null;
    current_review_stage?: string | null;
    duration_months?: number | null;
    start_date?: string | null;
    budget_range?: string | null;
    team_members?: any[] | null;
    requested_exemptions?: string[] | null;
    risk_assessment?: string | null;
    risk_mitigation_plan?: string | null;
    public_safety_plan?: string | null;
    environmental_impact?: string | null;
    success_metrics?: any[] | null;
    review_comments?: any[] | null;
    project_description?: string | null;
    testing_scope?: string | null;
    expected_outcomes?: string | null;
    funding_source?: string | null;
};

export type SandboxIncident = Database['public']['Tables']['sandbox_incidents']['Row'] & {
    severity?: string | null;
    sandbox_id?: string | null;
    description?: string | null;
    incident_date?: string | null;
    status?: string | null;
};

export type RegulatoryExemption = Database['public']['Tables']['regulatory_exemptions']['Row'] & {
    sandbox_id?: string | null;
    exemption_type?: string | null;
    status?: string | null;
    description?: string | null;
};

export type ExpertEvaluation = Database['public']['Tables']['expert_evaluations']['Row'] & {
    entity_type?: string | null;
    entity_id?: string | null;
    expert_email?: string | null;
    evaluation_date?: string | null;
    overall_score?: number | null;
    recommendation?: string | null;
    feasibility_score?: number | null;
    technical_quality_score?: number | null;
    innovation_score?: number | null;
    risk_score?: number | null;
    feedback_text?: string | null;
    custom_criteria?: any[] | null;
    evaluation_stage?: string | null;
};

export type City = Database['public']['Tables']['cities']['Row'] & {
    name_ar?: string | null;
    name_en?: string | null;
    region_id?: string | null;
};

export type Organization = Database['public']['Tables']['organizations']['Row'] & {
    name_ar?: string | null;
    name_en?: string | null;
    type?: string | null;
};

export type LivingLab = Database['public']['Tables']['living_labs']['Row'] & {
    name_ar?: string | null;
    name_en?: string | null;
    description_ar?: string | null;
    description_en?: string | null;
    status?: string | null;
    operator_id?: string | null;
    capacity?: number | null;
    current_projects?: number | null;
    type?: string | null;
    is_featured?: boolean | null;
    tagline_en?: string | null;
    tagline_ar?: string | null;
    city_id?: string | null;
    area_sqm?: number | null;
    launch_date?: string | null;
    university_id?: string | null;
    focus_areas?: string[] | null;
    objectives_en?: string | null;
    objectives_ar?: string | null;
    research_themes?: any[] | null;
    success_stories?: any[] | null;
    total_completed_projects?: number | null;
    equipment?: any[] | null;
    software_tools?: any[] | null;
    facilities?: any[] | null;
    connectivity?: any | null;
    datasets?: any[] | null;
    technical_capabilities?: any[] | null;
    expert_network?: any[] | null;
    publications?: any[] | null;
    events?: any[] | null;
    video_url?: string | null;
    virtual_tour_url?: string | null;
    operational_hours?: string | null;
    membership_tiers?: any[] | null;
    director_name?: string | null;
    director_email?: string | null;
    director_phone?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    website_url?: string | null;
    booking_system_url?: string | null;
    accreditation?: any[] | null;
    code?: string | null;
    created_by?: string | null;
    manager_email?: string | null;
};

export type LivingLabBooking = Database['public']['Tables']['living_lab_bookings']['Row'] & {
    living_lab_id?: string | null;
    status?: string | null;
    booking_date?: string | null;
    duration_days?: number | null;
};

export type StartupProfile = Database['public']['Tables']['startup_profiles']['Row'] & {
    company_name_en?: string | null;
    name_en?: string | null;
    description_en?: string | null;
    is_verified?: boolean | null;
    verification_date?: string | null;
    user_email?: string | null;
    stage?: string | null;
    team_size?: number | null;
    solution_categories?: string[] | null;
    municipal_clients_count?: number | null;
    pilot_success_rate?: number | null;
    platform_revenue_generated?: number | null;
    overall_reputation_score?: number | null;
    website?: string | null;
    pitch_deck_url?: string | null;
    traction_metrics?: any | null;
    revenue_model?: string | null;
    municipal_experience?: string | null;
    deployment_capacity?: string | null;
    geographic_coverage?: string[] | null;
    challenge_focus_areas?: string[] | null;
    platform_opportunities_pursued?: number | null;
    reputation_factors?: any | null;
    provider_type?: string | null;
};

export type StartupVerification = Database['public']['Tables']['startup_verifications']['Row'] & {
    startup_profile_id?: string | null;
    status?: string | null;
    legal_verification?: any | null;
    financial_verification?: any | null;
    team_verification?: any | null;
    product_verification?: any | null;
    overall_verification_score?: number | null;
    verification_notes?: string | null;
    verification_date?: string | null;
};

export type MatchmakerApplication = Database['public']['Tables']['matchmaker_applications']['Row'] & {
    applicant_email?: string | null;
    classification?: string | null;
    stage?: string | null;
    score?: number | null;
    matched_challenges?: any[] | null;
};

export interface Solution {
    id: string;
    created_at: string;
    name_en: string;
    name_ar: string;
    description: string;
    provider_id: string;
    provider_name: string;
    sectors: string[];
    maturity_level: 'prototype' | 'mvp' | 'market_ready' | 'scaled';
    trl: number;
    website: string;
    contact_email: string;
    images: string[];
    video_url: string;
    deployment_count: number;
    is_verified: boolean;
    verification_date: string;
    approved_by: string;
    technical_specifications: any; // Extended property
}

export interface Pilot {
    id: string;
    created_at: string;
    title_en: string;
    title_ar: string;
    status: string;
    stage: 'idea' | 'design' | 'planning' | 'execution' | 'monitoring' | 'completed';
    description_en: string;
    description_ar: string;
    sector: string;
    municipality_id: string;
    solution_id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    budget: number;
    challenge_id: string;
    location_coordinates: Json;
    impact_score: number;
    is_confidential: boolean;
    reference_code: string;
    department: string;
    contact_person: string;
    risk_level: 'low' | 'medium' | 'high';
    success_criteria: Json;
    kpis: Json;
    team_members: Json;
    stakeholders: Json;
    resources: Json;
    outputs: Json;
    lessons_learned: Json;
    recommendation: 'scale' | 'sustain' | 'stop';
    scalability_score: number;
    innovation_score: number;
    citizen_feedback_score: number;
    technology_stack: any[]; // Extended property
}

export type ChallengeProposal = Database['public']['Tables']['challenge_proposals']['Row'] & {
    proposal_status?: string | null;
};

export type CitizenFeedback = Database['public']['Tables']['citizen_feedback']['Row'] & {
    pilot_id?: string | null;
    feedback_text?: string | null;
    rating?: number | null;
    satisfaction_score?: number | null;
    citizen_name?: string | null;
    citizen_email?: string | null;
    citizen_phone?: string | null;
    concerns?: string | null;
};

export type Municipality = Database['public']['Tables']['municipalities']['Row'] & {
    name_ar?: string | null;
    name_en?: string | null;
    region?: string | null;
    region_id?: string | null;
    coordinates?: any | null;
    mii_score?: number | null;
    code?: string | null;
};

export interface Vendor {
    id: string;
    created_at: string;
    name_en: string;
    name_ar: string;
    description: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    website: string;
    address: string;
    vendor_type: 'technology' | 'consulting' | 'construction' | 'other';
    registration_number: string;
    tax_number: string;
    bank_details: Json;
    certifications: Json;
    performance_rating: number; // Extended property
    total_contracts: number; // Extended property
    status: 'active' | 'inactive' | 'blacklisted'; // Extended property
}

export type Team = Database['public']['Tables']['teams']['Row'] & {
    name?: string | null;
    description?: string | null;
    member_count?: number | null;
};

export type Subsector = Database['public']['Tables']['subsectors']['Row'] & {
    name_en?: string | null;
    name_ar?: string | null;
};

export type Service = Database['public']['Tables']['services']['Row'] & {
    name_en?: string | null;
    name_ar?: string | null;
    subsector_id?: string | null;
    is_digital?: boolean | null;
    linked_challenge_ids?: string[] | null;
    quality_benchmark?: number | null;
    service_code?: string | null;
};

export type Region = Database['public']['Tables']['regions']['Row'] & {
    name_en?: string | null;
    name_ar?: string | null;
};

export type Sector = Database['public']['Tables']['sectors']['Row'] & {
    name_en?: string | null;
    name_ar?: string | null;
    code?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
};

export type Tag = Database['public']['Tables']['tags']['Row'] & {
    name_en?: string | null;
    name_ar?: string | null;
    slug?: string | null;
};

export interface RDProject {
    id: string;
    created_at: string;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    budget: number;
    start_date: string;
    end_date: string;
    lead_researcher: string;
    publications: any[];
    patents: any[];
    research_area_en: string; // Extended property
}
