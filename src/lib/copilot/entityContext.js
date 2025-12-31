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
    }
};

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
 * @returns {string}
 */
export function buildEntityContextPrompt(focusEntity, language = 'en') {
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

    contextLines.push('');
    contextLines.push(isArabic 
        ? '**تعليمات:** جميع الأوامر والاستفسارات تتعلق بهذا الكيان ما لم يُحدد خلاف ذلك.'
        : '**Instructions:** All commands and queries relate to this entity unless otherwise specified.'
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
