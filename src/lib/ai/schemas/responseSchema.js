/**
 * Structured Response Schema for Copilot LLM
 * 
 * This defines the JSON structure that the LLM should return,
 * enabling rich UI rendering for each section of the response.
 */

/**
 * Available UI Section Types
 * 
 * @typedef {'header'|'paragraph'|'bullet_list'|'numbered_list'|'table'|'card'|'highlight'|'code'|'action_buttons'|'info_box'|'stats'|'divider'} SectionType
 */

/**
 * Section Schema
 * 
 * @typedef {Object} ResponseSection
 * @property {SectionType} type - The UI element type to render
 * @property {string} content - Primary content (text, markdown for simple types)
 * @property {Object} [metadata] - Additional configuration for the section
 * @property {string} [metadata.variant] - Style variant: 'default'|'primary'|'success'|'warning'|'danger'|'info'
 * @property {string} [metadata.icon] - Icon name for headers/cards
 * @property {string} [metadata.title] - Title for cards/info boxes
 * @property {Array} [metadata.items] - Items for lists/tables
 * @property {Array} [metadata.columns] - Column definitions for tables
 * @property {Array} [metadata.actions] - Action button definitions
 */

/**
 * Structured Response Schema
 * 
 * @typedef {Object} StructuredResponse
 * @property {Array<ResponseSection>} sections - Array of sections to render
 * @property {string} [language] - Response language: 'ar'|'en'
 * @property {Object} [meta] - Response metadata
 */

// Section type definitions with their rendering rules
export const SECTION_TYPES = {
    // Text-based sections
    header: {
        name: 'header',
        description: 'Section title/heading with optional icon',
        example: { type: 'header', content: 'Overview', metadata: { level: 2, icon: 'info' } }
    },
    paragraph: {
        name: 'paragraph',
        description: 'Plain text paragraph',
        example: { type: 'paragraph', content: 'This is explanatory text...' }
    },
    
    // List sections
    bullet_list: {
        name: 'bullet_list',
        description: 'Unordered bullet list',
        example: { 
            type: 'bullet_list', 
            content: 'Key Points',
            metadata: { items: ['First point', 'Second point', 'Third point'] }
        }
    },
    numbered_list: {
        name: 'numbered_list',
        description: 'Ordered numbered list',
        example: { 
            type: 'numbered_list', 
            content: 'Steps to Follow',
            metadata: { items: ['Step one', 'Step two', 'Step three'] }
        }
    },
    
    // Data display sections
    table: {
        name: 'table',
        description: 'Data table with columns and rows',
        example: {
            type: 'table',
            content: 'Summary Data',
            metadata: {
                columns: [
                    { key: 'name', label: 'Name' },
                    { key: 'value', label: 'Value' }
                ],
                rows: [
                    { name: 'Total', value: '100' },
                    { name: 'Active', value: '75' }
                ]
            }
        }
    },
    stats: {
        name: 'stats',
        description: 'Key statistics display',
        example: {
            type: 'stats',
            content: 'Performance Metrics',
            metadata: {
                items: [
                    { label: 'Total', value: '100', icon: 'chart' },
                    { label: 'Active', value: '75', trend: 'up' }
                ]
            }
        }
    },
    
    // Card sections
    card: {
        name: 'card',
        description: 'Highlighted card with title and content',
        example: {
            type: 'card',
            content: 'Card body content here',
            metadata: { title: 'Important Notice', variant: 'highlight', icon: 'alert' }
        }
    },
    info_box: {
        name: 'info_box',
        description: 'Information callout box',
        example: {
            type: 'info_box',
            content: 'This is important information',
            metadata: { variant: 'info', title: 'Note' }
        }
    },
    highlight: {
        name: 'highlight',
        description: 'Highlighted/emphasized text block',
        example: {
            type: 'highlight',
            content: 'This is a key insight or important takeaway',
            metadata: { variant: 'primary' }
        }
    },
    
    // Interactive sections
    action_buttons: {
        name: 'action_buttons',
        description: 'Action buttons for user interaction',
        example: {
            type: 'action_buttons',
            content: 'What would you like to do?',
            metadata: {
                actions: [
                    { label: 'Create Pilot', action: 'create_pilot', variant: 'primary' },
                    { label: 'View Details', action: 'view_details', variant: 'secondary' }
                ]
            }
        }
    },
    
    // Utility sections
    code: {
        name: 'code',
        description: 'Code block with syntax highlighting',
        example: {
            type: 'code',
            content: 'const example = "code here";',
            metadata: { language: 'javascript' }
        }
    },
    divider: {
        name: 'divider',
        description: 'Visual separator between sections',
        example: { type: 'divider' }
    }
};

// Variant styles for sections
export const SECTION_VARIANTS = {
    default: 'default',
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    highlight: 'highlight'
};

/**
 * Validates a structured response object
 * @param {Object} response - The response to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStructuredResponse(response) {
    const errors = [];
    
    if (!response) {
        errors.push('Response is null or undefined');
        return { valid: false, errors };
    }
    
    if (!response.sections || !Array.isArray(response.sections)) {
        errors.push('Response must have a sections array');
        return { valid: false, errors };
    }
    
    response.sections.forEach((section, index) => {
        if (!section.type) {
            errors.push(`Section ${index} missing type`);
        } else if (!SECTION_TYPES[section.type]) {
            errors.push(`Section ${index} has unknown type: ${section.type}`);
        }
        
        if (section.type !== 'divider' && !section.content && !section.metadata?.items) {
            errors.push(`Section ${index} missing content`);
        }
    });
    
    return { valid: errors.length === 0, errors };
}

/**
 * Creates a fallback structured response from plain text
 * @param {string} text - Plain text to convert
 * @returns {Object} Structured response object
 */
export function createFallbackStructuredResponse(text) {
    // Try to intelligently parse the text into sections
    const sections = [];
    
    // Split by double newlines for paragraphs
    const blocks = text.split(/\n\n+/);
    
    blocks.forEach(block => {
        const trimmed = block.trim();
        if (!trimmed) return;
        
        // Check for headers (lines starting with # or all caps short lines)
        if (trimmed.startsWith('#')) {
            const level = (trimmed.match(/^#+/) || [''])[0].length;
            sections.push({
                type: 'header',
                content: trimmed.replace(/^#+\s*/, ''),
                metadata: { level: Math.min(level, 3) }
            });
        }
        // Check for bullet lists
        else if (trimmed.match(/^[-•*]\s/m)) {
            const items = trimmed.split(/\n/).filter(l => l.match(/^[-•*]\s/)).map(l => l.replace(/^[-•*]\s+/, ''));
            if (items.length > 0) {
                sections.push({
                    type: 'bullet_list',
                    metadata: { items }
                });
            }
        }
        // Check for numbered lists
        else if (trimmed.match(/^\d+[.)]\s/m)) {
            const items = trimmed.split(/\n/).filter(l => l.match(/^\d+[.)]\s/)).map(l => l.replace(/^\d+[.)]\s+/, ''));
            if (items.length > 0) {
                sections.push({
                    type: 'numbered_list',
                    metadata: { items }
                });
            }
        }
        // Default to paragraph
        else {
            sections.push({
                type: 'paragraph',
                content: trimmed
            });
        }
    });
    
    // Ensure at least one section
    if (sections.length === 0) {
        sections.push({
            type: 'paragraph',
            content: text
        });
    }
    
    return { sections };
}
