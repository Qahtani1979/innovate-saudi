/**
 * Entity Context System for Copilot
 * 
 * Manages focused entities for context-aware AI conversations.
 * Supports challenges, pilots, solutions, programs, strategic plans, and R&D projects.
 */

// Supported entity types with their configuration
export const ENTITY_TYPES = {
    challenge: {
        table: 'challenges',
        idField: 'id',
        titleField: 'title_en',
        titleFieldAr: 'title_ar',
        icon: 'target',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: { en: 'Challenge', ar: 'تحدي' },
        detailPath: '/challenges/:id'
    },
    pilot: {
        table: 'pilots',
        idField: 'id',
        titleField: 'title_en',
        titleFieldAr: 'title_ar',
        icon: 'rocket',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: { en: 'Pilot', ar: 'مشروع تجريبي' },
        detailPath: '/pilots/:id'
    },
    solution: {
        table: 'solutions',
        idField: 'id',
        titleField: 'name_en',
        titleFieldAr: 'name_ar',
        icon: 'lightbulb',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: { en: 'Solution', ar: 'حل' },
        detailPath: '/solutions/:id'
    },
    program: {
        table: 'programs',
        idField: 'id',
        titleField: 'name_en',
        titleFieldAr: 'name_ar',
        icon: 'layout-grid',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        label: { en: 'Program', ar: 'برنامج' },
        detailPath: '/programs/:id'
    },
    strategic_plan: {
        table: 'strategic_plans',
        idField: 'id',
        titleField: 'title_en',
        titleFieldAr: 'title_ar',
        icon: 'map',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        label: { en: 'Strategic Plan', ar: 'خطة استراتيجية' },
        detailPath: '/strategy/:id'
    },
    rd_project: {
        table: 'rd_projects',
        idField: 'id',
        titleField: 'title_en',
        titleFieldAr: 'title_ar',
        icon: 'flask-conical',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        label: { en: 'R&D Project', ar: 'مشروع بحثي' },
        detailPath: '/rd/:id'
    },
    municipality: {
        table: 'municipalities',
        idField: 'id',
        titleField: 'name_en',
        titleFieldAr: 'name_ar',
        icon: 'building-2',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        label: { en: 'Municipality', ar: 'بلدية' },
        detailPath: '/municipalities/:id'
    },
    sector: {
        table: 'sectors',
        idField: 'id',
        titleField: 'name_en',
        titleFieldAr: 'name_ar',
        icon: 'layers',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        label: { en: 'Sector', ar: 'قطاع' },
        detailPath: '/sectors/:id'
    },
    organization: {
        table: 'organizations',
        idField: 'id',
        titleField: 'name_en',
        titleFieldAr: 'name_ar',
        icon: 'building',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
        label: { en: 'Organization', ar: 'منظمة' },
        detailPath: '/organizations/:id'
    }
};

/**
 * Entity Relationships Definition
 * Defines how entities relate to each other for context inheritance
 */
export const ENTITY_RELATIONSHIPS = {
    challenge: {
        // Parent relationships (challenge belongs to these)
        parents: [
            { entity: 'municipality', field: 'municipality_id', required: false },
            { entity: 'sector', field: 'sector_id', required: false },
            { entity: 'strategic_plan', field: 'strategic_plan_ids', isArray: true, required: false }
        ],
        // Child relationships (these belong to challenge)
        children: ['pilot', 'solution', 'rd_project'],
        // Link tables
        links: [
            { entity: 'strategic_plan', table: 'strategic_plan_challenge_links', foreignKey: 'challenge_id' }
        ]
    },
    pilot: {
        parents: [
            { entity: 'challenge', field: 'challenge_id', required: false },
            { entity: 'municipality', field: 'municipality_id', required: false },
            { entity: 'solution', field: 'solution_id', required: false },
            { entity: 'program', field: 'program_id', required: false }
        ],
        children: [],
        links: [
            { entity: 'program', table: 'program_pilot_links', foreignKey: 'pilot_id' }
        ]
    },
    solution: {
        parents: [
            { entity: 'organization', field: 'provider_id', required: false },
            { entity: 'sector', field: 'sector_id', required: false },
            { entity: 'program', field: 'source_program_id', required: false },
            { entity: 'rd_project', field: 'source_rd_project_id', required: false }
        ],
        children: ['pilot'],
        links: [
            { entity: 'challenge', table: 'challenge_solution_matches', foreignKey: 'solution_id' }
        ]
    },
    program: {
        parents: [
            { entity: 'municipality', field: 'municipality_id', required: false },
            { entity: 'strategic_plan', field: 'strategic_plan_id', required: false }
        ],
        children: ['pilot', 'solution'],
        links: [
            { entity: 'pilot', table: 'program_pilot_links', foreignKey: 'program_id' }
        ]
    },
    strategic_plan: {
        parents: [
            { entity: 'municipality', field: 'municipality_id', required: false }
        ],
        children: ['challenge', 'program'],
        links: [
            { entity: 'challenge', table: 'strategic_plan_challenge_links', foreignKey: 'strategic_plan_id' }
        ]
    },
    rd_project: {
        parents: [
            { entity: 'municipality', field: 'municipality_id', required: false },
            { entity: 'sector', field: 'sector_id', required: false },
            { entity: 'organization', field: 'institution_id', required: false }
        ],
        children: ['solution'],
        links: []
    },
    municipality: {
        parents: [],
        children: ['challenge', 'pilot', 'program', 'strategic_plan', 'rd_project'],
        links: []
    },
    sector: {
        parents: [],
        children: ['challenge', 'solution', 'rd_project'],
        links: []
    },
    organization: {
        parents: [
            { entity: 'sector', field: 'sector_id', required: false },
            { entity: 'municipality', field: 'municipality_id', required: false }
        ],
        children: ['solution', 'rd_project'],
        links: []
    }
};

/**
 * Get related entity fields to pre-populate when creating a new record
 * @param {string} newEntityType - Type of entity being created
 * @param {Object} focusEntity - Current focused entity { type, id, data }
 * @returns {Object} - Fields to pre-populate { fieldName: value }
 */
export function getInheritedFields(newEntityType, focusEntity) {
    if (!focusEntity?.type || !focusEntity?.id || !focusEntity?.data) {
        return {};
    }

    const relationships = ENTITY_RELATIONSHIPS[newEntityType];
    if (!relationships) return {};

    const inheritedFields = {};
    const focusData = focusEntity.data;

    // Direct parent relationship: focus entity is a parent of new entity
    const parentRel = relationships.parents.find(p => p.entity === focusEntity.type);
    if (parentRel) {
        if (parentRel.isArray) {
            inheritedFields[parentRel.field] = [focusEntity.id];
        } else {
            inheritedFields[parentRel.field] = focusEntity.id;
        }
    }

    // Cascade inheritance: inherit parent's parents
    const focusRelationships = ENTITY_RELATIONSHIPS[focusEntity.type];
    if (focusRelationships) {
        for (const focusParent of focusRelationships.parents) {
            const newEntityParent = relationships.parents.find(p => p.entity === focusParent.entity);
            if (newEntityParent && focusData[focusParent.field]) {
                // Only set if not already set and not an array mismatch
                if (!inheritedFields[newEntityParent.field]) {
                    if (newEntityParent.isArray && !focusParent.isArray) {
                        inheritedFields[newEntityParent.field] = [focusData[focusParent.field]];
                    } else if (!newEntityParent.isArray && focusParent.isArray) {
                        inheritedFields[newEntityParent.field] = focusData[focusParent.field]?.[0];
                    } else {
                        inheritedFields[newEntityParent.field] = focusData[focusParent.field];
                    }
                }
            }
        }
    }

    return inheritedFields;
}

/**
 * Get suggested related entities when creating a new record
 * @param {string} newEntityType - Type of entity being created  
 * @param {Object} focusEntity - Current focused entity
 * @returns {Array} - Suggested relationships [{ entityType, label, required, field }]
 */
export function getSuggestedRelationships(newEntityType, focusEntity = null) {
    const relationships = ENTITY_RELATIONSHIPS[newEntityType];
    if (!relationships) return [];

    const suggestions = relationships.parents.map(parent => ({
        entityType: parent.entity,
        field: parent.field,
        required: parent.required,
        isArray: parent.isArray || false,
        label: ENTITY_TYPES[parent.entity]?.label || { en: parent.entity, ar: parent.entity },
        // Pre-filled if focus entity matches
        prefilled: focusEntity?.type === parent.entity ? focusEntity.id : null,
        // Or cascade from focus entity's data
        cascaded: focusEntity?.data?.[parent.field] || null
    }));

    return suggestions;
}

/**
 * Build relationship context for AI prompt
 * @param {string} newEntityType - Type being created
 * @param {Object} focusEntity - Current focus
 * @param {string} language - 'en' | 'ar'
 * @returns {string}
 */
export function buildRelationshipContext(newEntityType, focusEntity, language = 'en') {
    const inherited = getInheritedFields(newEntityType, focusEntity);
    const suggested = getSuggestedRelationships(newEntityType, focusEntity);
    const isArabic = language === 'ar';

    const lines = [];
    
    if (Object.keys(inherited).length > 0) {
        lines.push(isArabic ? '### الحقول الموروثة من السياق:' : '### Fields Inherited from Context:');
        for (const [field, value] of Object.entries(inherited)) {
            lines.push(`- **${field}:** ${Array.isArray(value) ? value.join(', ') : value}`);
        }
        lines.push('');
    }

    if (suggested.length > 0) {
        lines.push(isArabic ? '### العلاقات المقترحة:' : '### Suggested Relationships:');
        for (const rel of suggested) {
            const label = rel.label[language] || rel.label.en;
            const status = rel.prefilled ? (isArabic ? '(مُعبأ)' : '(pre-filled)') : 
                          rel.cascaded ? (isArabic ? '(موروث)' : '(inherited)') : 
                          rel.required ? (isArabic ? '(مطلوب)' : '(required)') : 
                          (isArabic ? '(اختياري)' : '(optional)');
            lines.push(`- **${label}** → ${rel.field} ${status}`);
        }
    }

    return lines.join('\n');
}

/**
 * Parse chat command for entity focus
 * Supports: @challenge:uuid, @pilot:uuid, /focus challenge uuid
 * 
 * @param {string} message - User message
 * @returns {{ entityType: string, entityId: string } | null}
 */
export function parseEntityCommand(message) {
    if (!message) return null;

    // Pattern 1: @entity:id (e.g., @challenge:abc-123)
    const atPattern = /@(challenge|pilot|solution|program|strategic_plan|rd_project):([a-f0-9-]+)/i;
    const atMatch = message.match(atPattern);
    if (atMatch) {
        return {
            entityType: atMatch[1].toLowerCase(),
            entityId: atMatch[2]
        };
    }

    // Pattern 2: /focus entity id (e.g., /focus pilot abc-123)
    const focusPattern = /\/focus\s+(challenge|pilot|solution|program|strategic_plan|rd_project)\s+([a-f0-9-]+)/i;
    const focusMatch = message.match(focusPattern);
    if (focusMatch) {
        return {
            entityType: focusMatch[1].toLowerCase(),
            entityId: focusMatch[2]
        };
    }

    // Pattern 3: /clear or /unfocus - clear context
    if (/^\/(clear|unfocus)\s*$/i.test(message.trim())) {
        return { entityType: null, entityId: null, clear: true };
    }

    return null;
}

/**
 * Strip entity command from message for clean processing
 * @param {string} message 
 * @returns {string}
 */
export function stripEntityCommand(message) {
    if (!message) return '';
    
    return message
        .replace(/@(challenge|pilot|solution|program|strategic_plan|rd_project):[a-f0-9-]+/gi, '')
        .replace(/\/focus\s+(challenge|pilot|solution|program|strategic_plan|rd_project)\s+[a-f0-9-]+/gi, '')
        .replace(/^\/(clear|unfocus)\s*$/gi, '')
        .trim();
}

/**
 * Build context injection for system prompt
 * @param {Object} focusEntity - { type, id, data }
 * @param {string} language - 'en' | 'ar'
 * @param {Object} options - { includeRelationships: boolean, targetEntityType: string }
 * @returns {string}
 */
export function buildEntityContextPrompt(focusEntity, language = 'en', options = {}) {
    if (!focusEntity?.type || !focusEntity?.data) {
        return '';
    }

    const config = ENTITY_TYPES[focusEntity.type];
    if (!config) return '';

    const entityLabel = config.label[language] || config.label.en;
    const titleField = language === 'ar' ? config.titleFieldAr : config.titleField;
    const title = focusEntity.data[titleField] || focusEntity.data[config.titleField] || 'Unknown';

    const isArabic = language === 'ar';

    // Build context block
    const contextLines = [
        isArabic ? `## السياق الحالي: ${entityLabel}` : `## Current Focus: ${entityLabel}`,
        '',
        isArabic ? `**العنوان:** ${title}` : `**Title:** ${title}`,
        isArabic ? `**المعرف:** ${focusEntity.id}` : `**ID:** ${focusEntity.id}`,
    ];

    // Add entity-specific fields
    const data = focusEntity.data;
    
    if (data.status) {
        contextLines.push(isArabic ? `**الحالة:** ${data.status}` : `**Status:** ${data.status}`);
    }
    if (data.priority) {
        contextLines.push(isArabic ? `**الأولوية:** ${data.priority}` : `**Priority:** ${data.priority}`);
    }
    if (data.sector) {
        contextLines.push(isArabic ? `**القطاع:** ${data.sector}` : `**Sector:** ${data.sector}`);
    }
    if (data.sector_id) {
        contextLines.push(isArabic ? `**معرف القطاع:** ${data.sector_id}` : `**Sector ID:** ${data.sector_id}`);
    }
    if (data.municipality_id) {
        contextLines.push(isArabic ? `**معرف البلدية:** ${data.municipality_id}` : `**Municipality ID:** ${data.municipality_id}`);
    }
    if (data.stage) {
        contextLines.push(isArabic ? `**المرحلة:** ${data.stage}` : `**Stage:** ${data.stage}`);
    }
    if (data.description_en || data.description_ar) {
        const desc = (language === 'ar' ? data.description_ar : data.description_en) || data.description_en;
        if (desc) {
            const truncated = desc.length > 300 ? desc.substring(0, 300) + '...' : desc;
            contextLines.push('');
            contextLines.push(isArabic ? `**الوصف:**` : `**Description:**`);
            contextLines.push(truncated);
        }
    }

    // Add relationship context if creating a new entity
    if (options.includeRelationships && options.targetEntityType) {
        contextLines.push('');
        const relationshipContext = buildRelationshipContext(options.targetEntityType, focusEntity, language);
        if (relationshipContext) {
            contextLines.push(relationshipContext);
        }
    }

    // Add available relationships for the focused entity
    const relationships = ENTITY_RELATIONSHIPS[focusEntity.type];
    if (relationships) {
        contextLines.push('');
        contextLines.push(isArabic ? '### الكيانات المرتبطة المتاحة:' : '### Available Related Entities:');
        
        if (relationships.children.length > 0) {
            const childLabels = relationships.children.map(c => 
                ENTITY_TYPES[c]?.label[language] || ENTITY_TYPES[c]?.label.en || c
            ).join(', ');
            contextLines.push(isArabic ? `- **يمكن إنشاء:** ${childLabels}` : `- **Can create:** ${childLabels}`);
        }
        
        if (relationships.parents.length > 0) {
            const parentLabels = relationships.parents.map(p => 
                ENTITY_TYPES[p.entity]?.label[language] || ENTITY_TYPES[p.entity]?.label.en || p.entity
            ).join(', ');
            contextLines.push(isArabic ? `- **ينتمي إلى:** ${parentLabels}` : `- **Belongs to:** ${parentLabels}`);
        }
    }

    contextLines.push('');
    contextLines.push(isArabic 
        ? '**تعليمات:** جميع الأوامر والاستفسارات تتعلق بهذا الكيان ما لم يُحدد خلاف ذلك. عند إنشاء كيانات جديدة، استخدم العلاقات الموروثة تلقائياً.'
        : '**Instructions:** All commands and queries relate to this entity unless otherwise specified. When creating new entities, use inherited relationships automatically.'
    );

    return contextLines.join('\n');
}

/**
 * Parse URL params for deep-linked entity context
 * @param {URLSearchParams} searchParams 
 * @returns {{ entityType: string, entityId: string } | null}
 */
export function parseDeepLinkParams(searchParams) {
    const entity = searchParams.get('entity');
    const id = searchParams.get('id');
    
    if (entity && id && ENTITY_TYPES[entity]) {
        return { entityType: entity, entityId: id };
    }
    return null;
}

/**
 * Generate deep link URL for entity focus
 * @param {string} entityType 
 * @param {string} entityId 
 * @param {string} baseUrl 
 * @returns {string}
 */
export function generateDeepLink(entityType, entityId, baseUrl = '/copilot') {
    return `${baseUrl}?entity=${entityType}&id=${entityId}`;
}
