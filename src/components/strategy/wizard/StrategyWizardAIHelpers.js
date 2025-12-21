import * as Prompts from './prompts';

/**
 * Get the prompt string for a given step.
 * Uses the mapping in Prompts.STEP_PROMPT_MAP to find the correct generator function.
 */
export const getStepPrompt = (step, context, wizardData) => {
    const config = Prompts.getStepPromptConfig(step);
    if (!config || !config.getPrompt) return '';

    const generator = Prompts[config.getPrompt];
    if (typeof generator !== 'function') return '';

    return generator(context, wizardData);
};

/**
 * Get the JSON schema for a given step.
 * Uses the mapping in Prompts.STEP_PROMPT_MAP.
 */
export const getStepSchema = (step) => {
    const config = Prompts.getStepPromptConfig(step);
    if (!config || !config.schema) return null;

    return Prompts[config.schema];
};

/**
 * Process the AI response data and return the updates object for wizardData.
 * Refactored from StrategyWizardWrapper.jsx
 */
export const processAIResponse = (step, data, wizardData) => {
    const config = Prompts.getStepPromptConfig(step);
    if (!config) return {};
    const stepKey = config.key;

    const updates = {};

    if (stepKey === 'context') {
        if (data.name_ar) updates.name_ar = data.name_ar;

        if (data.vision_en) updates.vision_en = data.vision_en;
        if (data.vision_ar) updates.vision_ar = data.vision_ar;
        if (data.mission_en) updates.mission_en = data.mission_en;
        if (data.mission_ar) updates.mission_ar = data.mission_ar;
        if (data.description_en) updates.description_en = data.description_en;
        if (data.description_ar) updates.description_ar = data.description_ar;

        // Duration & Resources
        if (data.start_year) updates.start_year = parseInt(data.start_year) || updates.start_year;
        if (data.end_year) updates.end_year = parseInt(data.end_year) || updates.end_year;
        if (data.budget_range) updates.budget_range = data.budget_range;

        // Target Sectors, Themes, Technologies, Programs, Regions
        if (Array.isArray(data.target_sectors)) updates.target_sectors = data.target_sectors;
        // Handle both strategic_themes and suggested_themes from AI
        if (Array.isArray(data.strategic_themes)) {
            updates.strategic_themes = data.strategic_themes;
        } else if (Array.isArray(data.suggested_themes)) {
            updates.strategic_themes = data.suggested_themes;
        }
        // Handle both focus_technologies and suggested_technologies from AI
        if (Array.isArray(data.focus_technologies)) {
            updates.focus_technologies = data.focus_technologies;
        } else if (Array.isArray(data.suggested_technologies)) {
            updates.focus_technologies = data.suggested_technologies;
        }
        // Handle both vision_2030_programs and suggested_vision_programs from AI
        if (Array.isArray(data.vision_2030_programs)) {
            updates.vision_2030_programs = data.vision_2030_programs;
        } else if (Array.isArray(data.suggested_vision_programs)) {
            updates.vision_2030_programs = data.suggested_vision_programs;
        }
        if (Array.isArray(data.target_regions)) updates.target_regions = data.target_regions;

        // Core values from AI (Step 1 can pre-generate these)
        if (Array.isArray(data.core_values) && data.core_values.length > 0) {
            updates.core_values = data.core_values.map((v, i) => ({
                ...v,
                id: Date.now().toString() + 'cv' + i,
                name_en: v.name_en || '',
                name_ar: v.name_ar || '',
                description_en: v.description_en || ''
            }));
        }

        // Innovation focus and strategic rationale metadata
        if (data.innovation_focus) updates.innovation_focus = data.innovation_focus;
        if (data.strategic_rationale) updates.strategic_rationale = data.strategic_rationale;

        // Bilingual stakeholders
        if (Array.isArray(data.quick_stakeholders)) {
            updates.quick_stakeholders = data.quick_stakeholders.map(s => {
                if (typeof s === 'object' && s !== null) {
                    return { name_en: s.name_en || '', name_ar: s.name_ar || '' };
                }
                // Backward compatibility for string format
                return { name_en: String(s).trim(), name_ar: '' };
            }).filter(s => s.name_en || s.name_ar);
        }

        // Bilingual discovery inputs
        if (typeof data.key_challenges_en === 'string') updates.key_challenges_en = data.key_challenges_en;
        if (typeof data.key_challenges_ar === 'string') updates.key_challenges_ar = data.key_challenges_ar;
        if (typeof data.available_resources_en === 'string') updates.available_resources_en = data.available_resources_en;
        if (typeof data.available_resources_ar === 'string') updates.available_resources_ar = data.available_resources_ar;
        if (typeof data.initial_constraints_en === 'string') updates.initial_constraints_en = data.initial_constraints_en;
        if (typeof data.initial_constraints_ar === 'string') updates.initial_constraints_ar = data.initial_constraints_ar;

        // Backward compatibility (old single-language fields)
        if (typeof data.key_challenges === 'string' && typeof updates.key_challenges_en !== 'string') updates.key_challenges_en = data.key_challenges;
        if (typeof data.available_resources === 'string' && typeof updates.available_resources_en !== 'string') updates.available_resources_en = data.available_resources;
        if (typeof data.initial_constraints === 'string' && typeof updates.initial_constraints_en !== 'string') updates.initial_constraints_en = data.initial_constraints;
    } else if (stepKey === 'vision') {
        // Step 2 focuses only on Core Values and Strategic Pillars (Vision/Mission are in Step 1)
        if (Array.isArray(data.core_values) && data.core_values.length > 0) {
            updates.core_values = data.core_values.map((v, i) => ({
                ...v,
                id: Date.now().toString() + i,
                name_en: v.name_en || '',
                name_ar: v.name_ar || '',
                description_en: v.description_en || '',
                description_ar: v.description_ar || ''
            }));
        }
        if (Array.isArray(data.strategic_pillars) && data.strategic_pillars.length > 0) {
            updates.strategic_pillars = data.strategic_pillars.map((p, i) => ({
                ...p,
                id: Date.now().toString() + 'p' + i,
                icon: 'Target',
                name_en: p.name_en || '',
                name_ar: p.name_ar || '',
                description_en: p.description_en || '',
                description_ar: p.description_ar || ''
            }));
        }
    } else if (stepKey === 'stakeholders') {
        if (data.stakeholders) {
            updates.stakeholders = data.stakeholders.map((s, i) => ({
                ...s,
                id: Date.now().toString() + i,
                name_en: s.name_en || s.name || '',
                name_ar: s.name_ar || '',
                influence_strategy_en: s.influence_strategy_en || s.influence_strategy || '',
                influence_strategy_ar: s.influence_strategy_ar || '',
                type: s.type || 'GOVERNMENT',
                power: s.power || 'medium',
                interest: s.interest || 'medium',
                engagement_level: s.engagement_level || 'consult',
                contact_person_en: s.contact_person_en || s.contact_person || '',
                contact_person_ar: s.contact_person_ar || '',
                notes_en: s.notes_en || s.notes || '',
                notes_ar: s.notes_ar || ''
            }));
        }
        if (data.stakeholder_engagement_plan_en) {
            updates.stakeholder_engagement_plan_en = data.stakeholder_engagement_plan_en;
        }
        if (data.stakeholder_engagement_plan_ar) {
            updates.stakeholder_engagement_plan_ar = data.stakeholder_engagement_plan_ar;
        }
        // Backward compatibility
        if (data.stakeholder_engagement_plan && !data.stakeholder_engagement_plan_en) {
            updates.stakeholder_engagement_plan_en = data.stakeholder_engagement_plan;
        }
    } else if (stepKey === 'pestel') {
        // PESTEL UI expects bilingual objects with extended fields
        const mapPestelItems = (items) => (items || []).map((item, i) => ({
            id: Date.now().toString() + i,
            factor_en: item.factor_en || item.factor || '',
            factor_ar: item.factor_ar || '',
            description_en: item.description_en || item.description || '',
            description_ar: item.description_ar || '',
            impact: item.impact || 'medium',
            trend: item.trend || 'stable',
            timeframe: item.timeframe || 'medium_term',
            implications_en: item.implications_en || item.implications || '',
            implications_ar: item.implications_ar || '',
            recommendations: Array.isArray(item.recommendations) ? item.recommendations : []
        }));
        updates.pestel = {
            political: mapPestelItems(data.political),
            economic: mapPestelItems(data.economic),
            social: mapPestelItems(data.social),
            technological: mapPestelItems(data.technological),
            environmental: mapPestelItems(data.environmental),
            legal: mapPestelItems(data.legal)
        };
        // Include summary if provided
        if (data.summary) {
            updates.pestel_summary = {
                key_opportunities: data.summary.key_opportunities || [],
                key_threats: data.summary.key_threats || [],
                critical_success_factors: data.summary.critical_success_factors || [],
                priority_actions: data.summary.priority_actions || []
            };
        }
    } else if (stepKey === 'swot') {
        // SWOT UI expects bilingual objects
        const mapSwotItems = (items) => (items || []).map((item, i) => ({
            id: Date.now().toString() + i,
            text_en: item.text_en || item.text || '',
            text_ar: item.text_ar || '',
            priority: item.priority || 'medium'
        }));
        updates.swot = {
            strengths: mapSwotItems(data.strengths),
            weaknesses: mapSwotItems(data.weaknesses),
            opportunities: mapSwotItems(data.opportunities),
            threats: mapSwotItems(data.threats)
        };
    } else if (stepKey === 'scenarios') {
        // Scenarios UI expects bilingual outcomes
        const parseProbability = (value, fallback) => {
            if (typeof value === 'number' && Number.isFinite(value)) {
                return Math.max(0, Math.min(100, value));
            }
            if (typeof value === 'string') {
                const n = Number(value.replace('%', '').trim());
                if (Number.isFinite(n)) return Math.max(0, Math.min(100, n));
            }
            return fallback;
        };

        const mapScenario = (scenario, fallbackProbability) => ({
            description_en: scenario?.description_en || scenario?.description || '',
            description_ar: scenario?.description_ar || '',
            assumptions: (scenario?.assumptions || []).map(a =>
                typeof a === 'string' ? { text_en: a, text_ar: '' } : { text_en: a.text_en || a.text || '', text_ar: a.text_ar || '' }
            ),
            outcomes: (scenario?.outcomes || []).map(o =>
                typeof o === 'string'
                    ? { metric_en: o, metric_ar: '', value: '' }
                    : { metric_en: o.metric_en || o.metric || '', metric_ar: o.metric_ar || '', value: o.value || '' }
            ),
            probability: parseProbability(scenario?.probability, fallbackProbability)
        });

        updates.scenarios = {
            best_case: mapScenario(data.best_case, 20),
            worst_case: mapScenario(data.worst_case, 20),
            most_likely: mapScenario(data.most_likely, 60)
        };
    } else if (stepKey === 'risks' && data.risks) {
        const scoreMap = { low: 1, medium: 2, high: 3 };
        updates.risks = data.risks.map((r, i) => {
            const likelihood = r.likelihood || 'medium';
            const impact = r.impact || 'medium';
            return {
                id: Date.now().toString() + i,
                title_en: r.title_en || r.title || '',
                title_ar: r.title_ar || '',
                description_en: r.description_en || r.description || '',
                description_ar: r.description_ar || '',
                category: r.category || 'OPERATIONAL',
                likelihood,
                impact,
                risk_score: (scoreMap[likelihood] || 0) * (scoreMap[impact] || 0),
                mitigation_strategy_en: r.mitigation_strategy_en || r.mitigation_strategy || r.mitigation || '',
                mitigation_strategy_ar: r.mitigation_strategy_ar || '',
                contingency_plan_en: r.contingency_plan_en || r.contingency_plan || '',
                contingency_plan_ar: r.contingency_plan_ar || '',
                owner: r.owner || '',
                status: 'identified'
            };
        });
    } else if (stepKey === 'dependencies') {
        if (data.dependencies) {
            updates.dependencies = data.dependencies.map((d, i) => ({
                ...d,
                id: Date.now().toString() + i,
                name_en: d.name_en || d.name || '',
                name_ar: d.name_ar || '',
                type: d.type || 'internal',
                source: d.source || '',
                target: d.target || '',
                criticality: d.criticality || 'medium',
                status: d.status || 'pending',
                notes: d.notes || ''
            }));
        }
        if (data.constraints) {
            updates.constraints = data.constraints.map((c, i) => ({
                ...c,
                id: Date.now().toString() + i,
                description_en: c.description_en || c.description || '',
                description_ar: c.description_ar || '',
                mitigation_en: c.mitigation_en || c.mitigation || '',
                mitigation_ar: c.mitigation_ar || ''
            }));
        }
        if (data.assumptions) {
            updates.assumptions = data.assumptions.map((a, i) => ({
                ...a,
                id: Date.now().toString() + i,
                statement_en: a.statement_en || a.statement || '',
                statement_ar: a.statement_ar || '',
                validation_method_en: a.validation_method_en || a.validation_method || '',
                validation_method_ar: a.validation_method_ar || ''
            }));
        }
    } else if (stepKey === 'objectives' && data.objectives) {
        updates.objectives = data.objectives.map((o, i) => ({
            ...o,
            priority: o.priority || 'medium',
            target_year: wizardData.end_year
        }));
    } else if (stepKey === 'national' && data.alignments) {
        updates.national_alignments = data.alignments.map(a => ({
            key: `${a.objective_index}-${a.target_code}`,
            objective_index: a.objective_index,
            goal_code: a.goal_code,
            target_code: a.target_code,
            objective_name: (wizardData.objectives || [])[a.objective_index]?.name_en || '',
            innovation_alignment: a.innovation_alignment || ''
        }));
    } else if (stepKey === 'kpis' && data.kpis) {
        updates.kpis = data.kpis.map((k, i) => ({
            id: Date.now().toString() + i,
            name_en: k.name_en || '',
            name_ar: k.name_ar || '',
            category: k.category || 'outcome',
            objective_index: typeof k.objective_index === 'number' ? k.objective_index : null,
            unit: k.unit || '',
            baseline_value: String(k.baseline_value ?? k.baseline ?? ''),
            target_value: String(k.target_value ?? k.target ?? ''),
            target_year: wizardData.end_year,
            frequency: k.frequency || 'quarterly',
            data_source: k.data_source || '',
            data_collection_method: k.data_collection_method || '',
            owner: k.owner || '',
            milestones: Array.isArray(k.milestones) ? k.milestones.map(m => ({
                year: m.year,
                target: String(m.target || '')
            })) : []
        }));
    } else if (stepKey === 'actions' && data.action_plans) {
        updates.action_plans = data.action_plans.map((a, i) => ({
            id: Date.now().toString() + i,
            name_en: a.name_en || '',
            name_ar: a.name_ar || '',
            description_en: a.description_en || '',
            description_ar: a.description_ar || '',
            objective_index: typeof a.objective_index === 'number' ? a.objective_index : null,
            type: a.type || 'challenge',
            priority: a.priority || 'medium',
            budget_estimate: a.budget_estimate || '',
            start_date: a.start_date || '',
            end_date: a.end_date || '',
            owner: a.owner || '',
            deliverables: Array.isArray(a.deliverables) ? a.deliverables : [],
            dependencies: Array.isArray(a.dependencies) ? a.dependencies : [],
            innovation_impact: typeof a.innovation_impact === 'number' ? a.innovation_impact : 2,
            success_criteria_en: a.success_criteria_en || '',
            success_criteria_ar: a.success_criteria_ar || '',
            linked_risks: Array.isArray(a.linked_risks) ? a.linked_risks : [],
            should_create_entity: a.should_create_entity || false
        }));
    } else if (stepKey === 'resources') {
        const mapResource = (r, i, prefix) => ({
            ...r,
            id: Date.now().toString() + prefix + i,
            name_en: r.name_en || r.name || '',
            name_ar: r.name_ar || '',
            quantity: r.quantity || '1',
            cost: r.cost || '',
            category: r.category || '',
            acquisition_phase: r.acquisition_phase || 'short_term',
            priority: r.priority || 'medium',
            justification_en: r.justification_en || r.notes_en || r.notes || '',
            justification_ar: r.justification_ar || r.notes_ar || '',
            notes_en: r.notes_en || r.notes || '',
            notes_ar: r.notes_ar || '',
            entity_allocations: Array.isArray(r.entity_allocations) ? r.entity_allocations : []
        });
        updates.resource_plan = {
            hr_requirements: (data.hr_requirements || []).map((r, i) => mapResource(r, i, 'hr')),
            technology_requirements: (data.technology_requirements || []).map((r, i) => mapResource(r, i, 'tech')),
            infrastructure_requirements: (data.infrastructure_requirements || []).map((r, i) => mapResource(r, i, 'infra')),
            budget_allocation: (data.budget_allocation || []).map((r, i) => mapResource(r, i, 'budget'))
        };
    } else if (stepKey === 'timeline') {
        if (data.phases) {
            updates.phases = data.phases.map((p, i) => ({
                ...p,
                id: Date.now().toString() + 'phase' + i,
                category: p.category || 'foundation',
                description_en: p.description_en || p.description || '',
                description_ar: p.description_ar || '',
                objectives_covered: Array.isArray(p.objectives_covered) ? p.objectives_covered : [],
                key_deliverables_en: p.key_deliverables_en || '',
                key_deliverables_ar: p.key_deliverables_ar || '',
                success_metrics_en: p.success_metrics_en || '',
                success_metrics_ar: p.success_metrics_ar || '',
                budget_allocation: p.budget_allocation || ''
            }));
        }
        if (data.milestones) {
            updates.milestones = data.milestones.map((m, i) => ({
                ...m,
                id: Date.now().toString() + 'ms' + i,
                status: 'planned',
                criticality: m.criticality || 'medium',
                description_en: m.description_en || m.description || '',
                description_ar: m.description_ar || '',
                linked_phase: m.linked_phase ?? null,
                success_criteria_en: m.success_criteria_en || '',
                success_criteria_ar: m.success_criteria_ar || ''
            }));
        }
    } else if (stepKey === 'governance') {
        // Map escalation path - handle both array of objects and legacy string/array formats
        const mapEscalationPath = (path) => {
            if (!path) return [];
            if (Array.isArray(path)) {
                return path.map((item, i) => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            id: Date.now().toString() + 'esc' + i,
                            level: item.level || i + 1,
                            role_en: item.role_en || item.role || '',
                            role_ar: item.role_ar || '',
                            timeframe_en: item.timeframe_en || item.timeframe || '',
                            timeframe_ar: item.timeframe_ar || '',
                            description_en: item.description_en || item.description || '',
                            description_ar: item.description_ar || ''
                        };
                    }
                    // Legacy string format - convert to object
                    return {
                        id: Date.now().toString() + 'esc' + i,
                        level: i + 1,
                        role_en: String(item).trim(),
                        role_ar: '',
                        timeframe_en: '',
                        timeframe_ar: '',
                        description_en: '',
                        description_ar: ''
                    };
                });
            }
            // Legacy string format
            if (typeof path === 'string') {
                return path.split(/\n|;/).map((s, i) => ({
                    id: Date.now().toString() + 'esc' + i,
                    level: i + 1,
                    role_en: s.trim(),
                    role_ar: '',
                    timeframe_en: '',
                    timeframe_ar: '',
                    description_en: '',
                    description_ar: ''
                })).filter(e => e.role_en);
            }
            return [];
        };

        updates.governance = {
            ...wizardData.governance,
            committees: (data.committees || []).map((c, i) => ({
                ...c,
                id: Date.now().toString() + 'comm' + i,
                name_en: c.name_en || c.name || '',
                name_ar: c.name_ar || '',
                type: c.type || 'steering',
                chair_role_en: c.chair_role_en || c.chair_role || '',
                chair_role_ar: c.chair_role_ar || '',
                responsibilities_en: c.responsibilities_en || c.responsibilities || '',
                responsibilities_ar: c.responsibilities_ar || '',
                members: Array.isArray(c.members) ? c.members.map(m => String(m).trim()).filter(Boolean) : []
            })),
            roles: (data.roles || []).map((r, i) => ({
                ...r,
                id: Date.now().toString() + 'role' + i,
                title_en: r.title_en || r.title || '',
                title_ar: r.title_ar || '',
                type: r.type || 'management',
                department_en: r.department_en || r.department || '',
                department_ar: r.department_ar || '',
                key_responsibilities_en: r.key_responsibilities_en || (Array.isArray(r.key_responsibilities) ? r.key_responsibilities.join('\n') : r.key_responsibilities || ''),
                key_responsibilities_ar: r.key_responsibilities_ar || '',
                reports_to_en: r.reports_to_en || r.reports_to || '',
                reports_to_ar: r.reports_to_ar || ''
            })),
            dashboards: (data.dashboards || []).map((d, i) => ({
                ...d,
                id: Date.now().toString() + 'dash' + i,
                name_en: d.name_en || d.name || '',
                name_ar: d.name_ar || '',
                type: d.type || 'executive',
                description_en: d.description_en || d.description || '',
                description_ar: d.description_ar || '',
                key_metrics_en: d.key_metrics_en || (Array.isArray(d.key_metrics) ? d.key_metrics.join('\n') : d.key_metrics || ''),
                key_metrics_ar: d.key_metrics_ar || '',
                update_frequency: d.update_frequency || 'weekly',
                audience_en: d.audience_en || d.audience || '',
                audience_ar: d.audience_ar || ''
            })),
            raci_matrix: (data.raci_matrix || data.decision_rights || []).map((r, i) => ({
                ...r,
                id: Date.now().toString() + 'raci' + i,
                area: r.area || 'strategic_decisions',
                responsible_en: r.responsible_en || r.responsible || '',
                responsible_ar: r.responsible_ar || '',
                accountable_en: r.accountable_en || r.accountable || '',
                accountable_ar: r.accountable_ar || '',
                consulted_en: r.consulted_en || r.consulted || '',
                consulted_ar: r.consulted_ar || '',
                informed_en: r.informed_en || r.informed || '',
                informed_ar: r.informed_ar || ''
            })),
            reporting_frequency: data.reporting_frequency || 'monthly',
            escalation_path: mapEscalationPath(data.escalation_path)
        };
    } else if (stepKey === 'communication') {
        // Convert string key_messages to bilingual objects with type
        const keyMessages = (data.key_messages || []).map((m, i) =>
            typeof m === 'string'
                ? { id: Date.now().toString() + i, text_en: m, text_ar: '', type: 'announcement', audience: '', channel: '' }
                : {
                    id: Date.now().toString() + i,
                    text_en: m.text_en || '',
                    text_ar: m.text_ar || '',
                    type: m.type || 'announcement',
                    audience: m.audience || '',
                    channel: m.channel || ''
                }
        );
        updates.communication_plan = {
            ...wizardData.communication_plan,
            master_narrative_en: data.master_narrative_en || wizardData.communication_plan?.master_narrative_en || '',
            master_narrative_ar: data.master_narrative_ar || wizardData.communication_plan?.master_narrative_ar || '',
            target_audiences: data.target_audiences || wizardData.communication_plan?.target_audiences || [],
            key_messages: keyMessages,
            internal_channels: data.internal_channels || [],
            external_channels: data.external_channels || []
        };
    } else if (stepKey === 'change') {
        updates.change_management = {
            ...wizardData.change_management,
            readiness_assessment_en: data.readiness_assessment_en || data.readiness_assessment || '',
            readiness_assessment_ar: data.readiness_assessment_ar || '',
            change_approach_en: data.change_approach_en || data.change_approach || '',
            change_approach_ar: data.change_approach_ar || '',
            resistance_management_en: data.resistance_management_en || data.resistance_management || '',
            resistance_management_ar: data.resistance_management_ar || '',
            training_plan: (data.training_plan || []).map((tp, i) => ({
                id: Date.now().toString() + 'train' + i,
                name_en: tp.name_en || tp.name || '',
                name_ar: tp.name_ar || '',
                type: tp.type || 'workshop',
                category: tp.category || 'technical',
                target_audience_en: tp.target_audience_en || tp.target_audience || '',
                target_audience_ar: tp.target_audience_ar || '',
                duration_en: tp.duration_en || tp.duration || '',
                duration_ar: tp.duration_ar || '',
                timeline_en: tp.timeline_en || tp.timeline || '',
                timeline_ar: tp.timeline_ar || '',
                priority: tp.priority || 'medium',
                entity_training: []
            })),
            stakeholder_impacts: (data.stakeholder_impacts || []).map((si, i) => ({
                id: Date.now().toString() + 'si' + i,
                group_en: si.group_en || si.group || '',
                group_ar: si.group_ar || '',
                impact_level: si.impact_level || 'moderate',
                readiness: si.readiness || 'preparing',
                description_en: si.description_en || si.description || '',
                description_ar: si.description_ar || '',
                support_needs_en: si.support_needs_en || si.support_needs || '',
                support_needs_ar: si.support_needs_ar || ''
            })),
            change_activities: (data.change_activities || []).map((ca, i) => ({
                id: Date.now().toString() + 'ca' + i,
                phase: ca.phase || 'awareness',
                name_en: ca.name_en || ca.name || '',
                name_ar: ca.name_ar || '',
                owner: ca.owner || '',
                timeline: ca.timeline || '',
                status: ca.status || 'planned'
            })),
            resistance_strategies: (data.resistance_strategies || []).map((rs, i) => ({
                id: Date.now().toString() + 'rs' + i,
                type: rs.type || 'fear_unknown',
                mitigation_en: rs.mitigation_en || rs.mitigation || '',
                mitigation_ar: rs.mitigation_ar || '',
                owner: rs.owner || '',
                timeline: rs.timeline || ''
            }))
        };
    }

    return updates;
};
