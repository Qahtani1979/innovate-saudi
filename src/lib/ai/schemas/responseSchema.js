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
        description: 'Action buttons for user interaction. Each action should have a prompt that will be sent to the AI.',
        example: {
            type: 'action_buttons',
            content: 'What would you like to do?',
            metadata: {
                actions: [
                    { label: 'Create Pilot', action: 'create_pilot', prompt: 'Create a new pilot project', variant: 'primary' },
                    { label: 'View Details', action: 'view_details', prompt: 'Show me the details', variant: 'secondary' },
                    { label: 'Navigate', action: 'navigate', path: '/dashboard', variant: 'outline' }
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
 * Handles both English and Arabic text with proper list detection
 * @param {string} text - Plain text to convert
 * @param {string} language - 'en' or 'ar'
 * @returns {Object} Structured response object
 */
export function createFallbackStructuredResponse(text, language = 'en') {
    const isArabic = language === 'ar' || /[\u0600-\u06FF]/.test(text);
    const sections = [];
    
    // Split by double newlines for blocks
    const blocks = text.split(/\n\n+/);
    
    blocks.forEach(block => {
        const trimmed = block.trim();
        if (!trimmed) return;
        
        // Check for headers (# syntax, ** bold headers **, or Arabic colon headers)
        if (trimmed.startsWith('#')) {
            const level = (trimmed.match(/^#+/) || [''])[0].length;
            sections.push({
                type: 'header',
                content: trimmed.replace(/^#+\s*/, ''),
                metadata: { level: Math.min(level, 3) }
            });
        }
        // Bold text as headers (e.g., **Header** or **العنوان**)
        else if (trimmed.match(/^\*\*[^*]+\*\*$/)) {
            sections.push({
                type: 'header',
                content: trimmed.replace(/^\*\*|\*\*$/g, ''),
                metadata: { level: 2 }
            });
        }
        // Arabic-style headers ending with colon (e.g., "القطاعات المتاحة:")
        else if (isArabic && trimmed.match(/^[^•\-*\d\n]+:$/) && trimmed.length < 100) {
            sections.push({
                type: 'header',
                content: trimmed.replace(/:$/, ''),
                metadata: { level: 2 }
            });
        }
        // Check for bullet lists (including Arabic bullet •)
        else if (trimmed.match(/^[-•*]\s/m) || trimmed.match(/\n[-•*]\s/)) {
            // Extract list title if exists (first line without bullet)
            const lines = trimmed.split('\n');
            const firstLine = lines[0].trim();
            let listTitle = null;
            let listLines = lines;
            
            // Check if first line is a title (not a bullet)
            if (!firstLine.match(/^[-•*]\s/)) {
                listTitle = firstLine.replace(/:$/, '');
                listLines = lines.slice(1);
            }
            
            const items = listLines
                .filter(l => l.match(/^[-•*]\s/) || l.match(/^\s*[-•*]\s/))
                .map(l => l.replace(/^\s*[-•*]\s+/, '').trim())
                .filter(item => item.length > 0);
            
            if (items.length > 0) {
                sections.push({
                    type: 'bullet_list',
                    content: listTitle || undefined,
                    metadata: { items }
                });
            } else if (listTitle) {
                // No valid list items, treat as paragraph
                sections.push({
                    type: 'paragraph',
                    content: trimmed
                });
            }
        }
        // Check for numbered lists (1. or 1) syntax, also Arabic numerals)
        else if (trimmed.match(/^\d+[.)]\s/m) || trimmed.match(/\n\d+[.)]\s/)) {
            const lines = trimmed.split('\n');
            const firstLine = lines[0].trim();
            let listTitle = null;
            let listLines = lines;
            
            if (!firstLine.match(/^\d+[.)]\s/)) {
                listTitle = firstLine.replace(/:$/, '');
                listLines = lines.slice(1);
            }
            
            const items = listLines
                .filter(l => l.match(/^\d+[.)]\s/) || l.match(/^\s*\d+[.)]\s/))
                .map(l => l.replace(/^\s*\d+[.)]\s+/, '').trim())
                .filter(item => item.length > 0);
            
            if (items.length > 0) {
                sections.push({
                    type: 'numbered_list',
                    content: listTitle || undefined,
                    metadata: { items }
                });
            } else if (listTitle) {
                sections.push({
                    type: 'paragraph',
                    content: trimmed
                });
            }
        }
        // Default to paragraph
        else {
            // Check if this looks like action suggestions (contains words like "Next Steps", "الخطوات")
            const isActionPrompt = trimmed.match(/next\s*step|الخطوات|what.*do|ماذا|choose|اختر/i);
            
            sections.push({
                type: isActionPrompt ? 'highlight' : 'paragraph',
                content: trimmed,
                metadata: isActionPrompt ? { variant: 'primary' } : undefined
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
    
    // Add default action buttons if none exist in response
    const hasActions = sections.some(s => s.type === 'action_buttons');
    if (!hasActions) {
        sections.push({
            type: 'action_buttons',
            content: isArabic ? 'الخطوات التالية' : 'Next Steps',
            metadata: {
                actions: isArabic ? [
                    { label: 'عرض المزيد', action: 'more', prompt: 'أخبرني المزيد', variant: 'primary' },
                    { label: 'مساعدة أخرى', action: 'help', prompt: 'ما الذي يمكنك مساعدتي به؟', variant: 'secondary' }
                ] : [
                    { label: 'Tell me more', action: 'more', prompt: 'Tell me more about this', variant: 'primary' },
                    { label: 'Other help', action: 'help', prompt: 'What else can you help me with?', variant: 'secondary' }
                ]
            }
        });
    }
    
    return { sections, language: isArabic ? 'ar' : 'en' };
}

/**
 * JSON Schema for structured response - used with AI tool calling
 * This forces the LLM to return structured JSON instead of plain text
 */
export const STRUCTURED_RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        sections: {
            type: "array",
            description: "Array of UI sections to render",
            items: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        enum: ["header", "paragraph", "bullet_list", "numbered_list", "table", "card", "highlight", "info_box", "stats", "action_buttons", "code", "divider"],
                        description: "The UI element type to render"
                    },
                    content: {
                        type: "string",
                        description: "Primary text content for this section"
                    },
                    metadata: {
                        type: "object",
                        description: "Additional configuration for the section",
                        properties: {
                            level: { type: "number", description: "Header level (1-3)" },
                            icon: { type: "string", description: "Icon name" },
                            variant: { type: "string", enum: ["default", "primary", "secondary", "success", "warning", "danger", "info", "highlight"] },
                            title: { type: "string", description: "Title for cards/info boxes" },
                            items: { 
                                type: "array", 
                                description: "Items for lists or stats",
                                items: { 
                                    oneOf: [
                                        { type: "string" },
                                        { 
                                            type: "object",
                                            properties: {
                                                label: { type: "string" },
                                                value: { type: "string" },
                                                icon: { type: "string" },
                                                trend: { type: "string" }
                                            }
                                        }
                                    ]
                                }
                            },
                            columns: {
                                type: "array",
                                description: "Column definitions for tables",
                                items: {
                                    type: "object",
                                    properties: {
                                        key: { type: "string" },
                                        label: { type: "string" }
                                    },
                                    required: ["key", "label"]
                                }
                            },
                            rows: {
                                type: "array",
                                description: "Row data for tables",
                                items: { type: "object" }
                            },
                            actions: {
                                type: "array",
                                description: "Action button definitions",
                                items: {
                                    type: "object",
                                    properties: {
                                        label: { type: "string", description: "Button label text" },
                                        action: { type: "string", description: "Action identifier" },
                                        prompt: { type: "string", description: "Prompt to send when clicked (MUST match user's language)" },
                                        variant: { type: "string", enum: ["primary", "secondary", "outline", "ghost"] },
                                        path: { type: "string", description: "Navigation path if action is navigate" }
                                    },
                                    required: ["label", "action", "prompt"]
                                }
                            },
                            language: { type: "string", description: "Code language for syntax highlighting" }
                        }
                    }
                },
                required: ["type"]
            }
        },
        language: {
            type: "string",
            enum: ["en", "ar"],
            description: "Response language"
        }
    },
    required: ["sections", "language"]
};
