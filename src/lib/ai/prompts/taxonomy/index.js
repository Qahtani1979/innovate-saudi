/**
 * Taxonomy Module AI Prompts Index
 * @version 1.0.0
 */

export { 
  buildTaxonomyGeneratorPrompt, 
  taxonomyGeneratorSchema, 
  TAXONOMY_GENERATOR_SYSTEM_PROMPT 
} from './taxonomyGenerator';

export { 
  buildTaxonomyGapPrompt, 
  taxonomyGapSchema, 
  TAXONOMY_GAP_SYSTEM_PROMPT 
} from './taxonomyGap';

export const TAXONOMY_PROMPTS = {
  generator: {
    promptFn: 'buildTaxonomyGeneratorPrompt',
    schema: 'taxonomyGeneratorSchema',
    description: 'Generates taxonomy improvement suggestions'
  },
  gapDetector: {
    promptFn: 'buildTaxonomyGapPrompt',
    schema: 'taxonomyGapSchema',
    description: 'Detects gaps in taxonomy structure'
  }
};

export default TAXONOMY_PROMPTS;
