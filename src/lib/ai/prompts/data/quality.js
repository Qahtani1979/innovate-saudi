/**
 * Data Quality Prompt Module
 * Handles data quality assessment and improvement AI operations
 * @module prompts/data/quality
 */

export const DATA_QUALITY_SYSTEM_PROMPT = `You are an expert in data quality management for government data systems.
Your role is to assess data quality, identify issues, and recommend improvements.

Guidelines:
- Apply data quality dimensions (completeness, accuracy, consistency, timeliness)
- Consider data governance requirements
- Align with government data standards
- Provide actionable remediation steps
- Ensure data privacy compliance`;

export const DATA_QUALITY_PROMPTS = {
  assessQuality: (dataset) => `Assess data quality for this dataset:

Dataset: ${dataset.name}
Records: ${dataset.recordCount || 'Unknown'}
Fields: ${dataset.fields?.join(', ') || 'Not specified'}
Sample Issues: ${dataset.sampleIssues?.join(', ') || 'None provided'}

Evaluate:
1. Completeness score
2. Accuracy assessment
3. Consistency check
4. Timeliness evaluation
5. Overall quality score
6. Priority issues`,

  recommendImprovements: (qualityReport) => `Recommend data quality improvements:

Current Quality Score: ${qualityReport.score}
Main Issues: ${qualityReport.issues?.join(', ')}
Data Source: ${qualityReport.source}

Provide:
1. Priority improvements
2. Quick wins
3. Long-term fixes
4. Process changes needed
5. Monitoring recommendations`,

  validateData: (data, rules) => `Validate this data against rules:

Data Sample: ${JSON.stringify(data).substring(0, 500)}
Validation Rules: ${rules?.join(', ')}

Provide:
1. Validation results
2. Failed rules
3. Data anomalies
4. Correction suggestions`
};

export const buildDataQualityPrompt = (type, params) => {
  const promptFn = DATA_QUALITY_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown data quality prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: DATA_QUALITY_SYSTEM_PROMPT,
  prompts: DATA_QUALITY_PROMPTS,
  build: buildDataQualityPrompt
};
