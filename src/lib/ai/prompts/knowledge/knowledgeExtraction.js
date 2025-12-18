/**
 * Knowledge Base AI Prompts
 * Centralized prompts for knowledge extraction and organization
 * @module knowledge/knowledgeExtraction
 */

export const KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT = `You are an expert knowledge management specialist for Saudi Arabian innovation ecosystems.

KNOWLEDGE FRAMEWORK:
1. Content Analysis
   - Key concepts extraction
   - Topic identification
   - Relationship mapping
   - Taxonomy alignment

2. Knowledge Organization
   - Category assignment
   - Tag generation
   - Cross-referencing
   - Search optimization

3. Quality Assessment
   - Accuracy verification
   - Completeness check
   - Currency evaluation
   - Relevance scoring

4. Application
   - Use case identification
   - Audience targeting
   - Access recommendations
   - Update scheduling

CONTEXT:
- Saudi innovation ecosystem
- Vision 2030 knowledge priorities
- Arabic/English bilingual support`;

export const KNOWLEDGE_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    key_concepts: { type: "array", items: { type: "string" } },
    topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          relevance: { type: "number" },
          related_topics: { type: "array", items: { type: "string" } }
        }
      }
    },
    taxonomy: {
      type: "object",
      properties: {
        primary_category: { type: "string" },
        secondary_categories: { type: "array", items: { type: "string" } },
        tags: { type: "array", items: { type: "string" } }
      }
    },
    quality_score: { type: "number" },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["summary", "key_concepts", "topics"]
};

export const buildKnowledgeExtractionPrompt = (contentData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Extract knowledge from:

CONTENT TYPE: ${contentData.type || 'Document'}
TITLE: ${contentData.title || 'Not specified'}
SOURCE: ${contentData.source || 'Not specified'}

CONTENT:
${contentData.content?.substring(0, 2000) || 'No content provided'}

EXISTING TAGS: ${contentData.tags?.join(', ') || 'None'}

Provide comprehensive knowledge extraction with taxonomy classification.`;
};

export const KNOWLEDGE_EXTRACTION_PROMPTS = {
  system: KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT,
  schema: KNOWLEDGE_EXTRACTION_SCHEMA,
  buildPrompt: buildKnowledgeExtractionPrompt
};

export default KNOWLEDGE_EXTRACTION_PROMPTS;
