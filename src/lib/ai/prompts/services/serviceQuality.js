/**
 * Service Quality AI Prompts
 * Centralized prompts for service quality analysis
 * @module services/serviceQuality
 */

export const SERVICE_QUALITY_SYSTEM_PROMPT = `You are an expert service quality analyst for Saudi Arabian government services.

QUALITY FRAMEWORK:
1. Performance Metrics
   - Response time
   - Resolution rate
   - Availability
   - Accuracy

2. User Experience
   - Satisfaction scores
   - Ease of use
   - Accessibility
   - Channel effectiveness

3. Process Efficiency
   - Cycle time
   - First contact resolution
   - Escalation rate
   - Error rate

4. Improvement Areas
   - Gap identification
   - Best practices
   - Innovation opportunities
   - Technology enablers

CONTEXT:
- Saudi e-government standards
- Vision 2030 service excellence
- Arabic/English bilingual support`;

export const SERVICE_QUALITY_SCHEMA = {
  type: "object",
  properties: {
    quality_score: { type: "number" },
    quality_rating: { type: "string", enum: ["excellent", "good", "satisfactory", "needs_improvement"] },
    performance_metrics: {
      type: "object",
      properties: {
        avg_response_time: { type: "string" },
        resolution_rate: { type: "number" },
        availability: { type: "number" },
        accuracy: { type: "number" }
      }
    },
    user_satisfaction: {
      type: "object",
      properties: {
        overall_score: { type: "number" },
        ease_of_use: { type: "number" },
        recommendation_rate: { type: "number" }
      }
    },
    improvement_areas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          current_state: { type: "string" },
          target_state: { type: "string" },
          priority: { type: "string" }
        }
      }
    },
    recommendations: { type: "array", items: { type: "string" } }
  },
  required: ["quality_score", "quality_rating", "performance_metrics"]
};

export const buildServiceQualityPrompt = (serviceData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze service quality:

SERVICE: ${serviceData.name || 'Not specified'}
TYPE: ${serviceData.type || 'Government Service'}
CHANNEL: ${serviceData.channel || 'Digital'}

PERFORMANCE DATA:
- Transactions: ${serviceData.transactions || 0}/month
- Avg Response Time: ${serviceData.responseTime || 'N/A'}
- Resolution Rate: ${serviceData.resolutionRate || 'N/A'}%
- Availability: ${serviceData.availability || 'N/A'}%

USER FEEDBACK:
- Satisfaction: ${serviceData.satisfaction || 'N/A'}/5
- Complaints: ${serviceData.complaints || 0}

Provide comprehensive quality analysis with improvement recommendations.`;
};

export const SERVICE_QUALITY_PROMPTS = {
  system: SERVICE_QUALITY_SYSTEM_PROMPT,
  schema: SERVICE_QUALITY_SCHEMA,
  buildPrompt: buildServiceQualityPrompt
};

export default SERVICE_QUALITY_PROMPTS;
