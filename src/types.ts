export interface RelatedInitiative {
    name: string;
    status: string;
    outcome?: string;
    related_entity_id?: string;
    related_entity_type?: string;
}

export interface LessonLearned {
    lesson: string;
    category: string;
    recommendation?: string;
}

export interface KPI {
    name_en: string;
    name_ar?: string;
    baseline?: string | number;
    target?: string | number;
    unit?: string;
}

export interface Stakeholder {
    name: string;
    role: string;
    involvement?: string;
}

export interface DataEvidence {
    type: string;
    source: string;
    value: string;
    date?: string;
}

export interface Constraint {
    type: string;
    description: string;
}

export interface Milestone {
    title: string;
    date?: string;
    status?: string;
}

export interface AffectedPopulation {
    size?: number;
    demographics?: string;
    location?: string;
}

export interface ChallengeProposal {
    id: string;
    proposal_title: string;
    proposer_email: string;
    approach_summary: string;
    timeline_weeks: number;
    estimated_cost: number;
    status: string;
}
