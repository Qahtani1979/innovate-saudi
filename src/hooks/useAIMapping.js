import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useAIWithFallback } from './useAIWithFallback';
import { useEntitySchema } from './useDataImport';
import { toast } from 'sonner';

export const useAIMapping = (entityName, csvHeaders) => {
    const { t } = useLanguage();
    const [mapping, setMapping] = useState({});
    const [validation, setValidation] = useState(null);
    const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();
    const { data: schema, isLoading: schemaLoading } = useEntitySchema(entityName);

    const analyzeMapping = async () => {
        if (!schema || generating) return;

        try {
            const result = await invokeAI({
                prompt: `Map CSV columns to entity fields:

CSV Headers: ${csvHeaders.join(', ')}

Entity Fields:
${Object.entries(schema.properties).map(([field, prop]) =>
                    `${field} (${prop.type}): ${prop.description || ''}`
                ).join('\n')}

Suggest mapping for each CSV column to the best matching entity field.
If no good match, suggest null.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        mappings: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    csv_column: { type: "string" },
                                    entity_field: { type: "string" },
                                    confidence: { type: "number" },
                                    rationale: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            if (result.success) {
                const newMapping = {};
                result.data.mappings.forEach(m => {
                    if (m.entity_field && m.entity_field !== 'null') {
                        newMapping[m.csv_column] = m.entity_field;
                    }
                });

                setMapping(newMapping);
                setValidation(result.data.mappings);
                toast.success(t({ en: 'Mapping suggested', ar: 'التخطيط مقترح' }));
            }
        } catch (error) {
            console.error('AI Mapping error:', error);
            toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
        }
    };

    return {
        mapping,
        validation,
        analyzeMapping,
        status,
        generating,
        isAvailable,
        rateLimitInfo,
        schema,
        schemaLoading
    };
};
