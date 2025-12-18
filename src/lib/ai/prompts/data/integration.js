/**
 * Data Integration Prompt Module
 * Handles data integration and ETL AI operations
 * @module prompts/data/integration
 */

export const DATA_INTEGRATION_SYSTEM_PROMPT = `You are an expert in data integration and ETL processes for government systems.
Your role is to design integration strategies and resolve data mapping challenges.

Guidelines:
- Ensure data lineage and traceability
- Consider system compatibility
- Maintain data integrity
- Follow government data exchange standards
- Support real-time and batch integration`;

export const DATA_INTEGRATION_PROMPTS = {
  designMapping: (source, target) => `Design data mapping between systems:

Source System: ${source.name}
Source Fields: ${source.fields?.join(', ')}
Target System: ${target.name}
Target Fields: ${target.fields?.join(', ')}

Provide:
1. Field mapping table
2. Transformation rules
3. Data type conversions
4. Default values
5. Validation requirements`,

  resolveConflicts: (conflicts) => `Resolve data integration conflicts:

Conflicts: ${JSON.stringify(conflicts)}

For each conflict:
1. Root cause analysis
2. Resolution options
3. Recommended approach
4. Implementation steps
5. Prevention measures`,

  optimizeETL: (etlProcess) => `Optimize this ETL process:

Process Name: ${etlProcess.name}
Current Duration: ${etlProcess.duration}
Record Volume: ${etlProcess.volume}
Issues: ${etlProcess.issues?.join(', ')}

Recommend:
1. Performance improvements
2. Parallel processing opportunities
3. Incremental load strategies
4. Error handling enhancements
5. Monitoring improvements`
};

export const buildDataIntegrationPrompt = (type, params) => {
  const promptFn = DATA_INTEGRATION_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown data integration prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: DATA_INTEGRATION_SYSTEM_PROMPT,
  prompts: DATA_INTEGRATION_PROMPTS,
  build: buildDataIntegrationPrompt
};
