/**
 * Researcher Prompts Index
 * Central export for all researcher-related AI prompts
 * @version 1.0.0
 */

export { 
  RESEARCHER_PROFILE_ENHANCER_PROMPTS,
  RESEARCHER_PROFILE_ENHANCER_SYSTEM_PROMPT,
  buildResearcherProfileEnhancerPrompt,
  RESEARCHER_PROFILE_ENHANCER_SCHEMA
} from './researcherProfileEnhancer';

export { 
  COLLABORATION_RECOMMENDER_PROMPTS,
  COLLABORATION_RECOMMENDER_SYSTEM_PROMPT,
  buildCollaborationRecommenderPrompt,
  COLLABORATION_RECOMMENDER_SCHEMA
} from './collaborationRecommender';

export { 
  PUBLICATION_ANALYZER_PROMPTS,
  PUBLICATION_ANALYZER_SYSTEM_PROMPT,
  buildPublicationAnalyzerPrompt,
  PUBLICATION_ANALYZER_SCHEMA
} from './publicationAnalyzer';

export { 
  RD_CALL_MATCHER_PROMPTS,
  RD_CALL_MATCHER_SYSTEM_PROMPT,
  buildRDCallMatcherPrompt,
  RD_CALL_MATCHER_SCHEMA
} from './rdCallMatcher';

// Re-export from rd/ for convenience
export { RESEARCHER_MATCHER_PROMPTS } from '../rd/researcherMatcher';

export const RESEARCHER_PROMPT_MANIFEST = {
  researcherProfileEnhancer: {
    file: 'researcherProfileEnhancer.js',
    purpose: 'Enhance researcher profiles with AI suggestions',
    component: 'ResearcherProfileEnhancer'
  },
  collaborationRecommender: {
    file: 'collaborationRecommender.js',
    purpose: 'Recommend research collaborations',
    component: 'CollaborationRecommender'
  },
  publicationAnalyzer: {
    file: 'publicationAnalyzer.js',
    purpose: 'Analyze publications for expertise extraction',
    component: 'PublicationAnalyzer'
  },
  rdCallMatcher: {
    file: 'rdCallMatcher.js',
    purpose: 'Match researchers to R&D funding calls',
    component: 'RDCallMatcher'
  },
  researcherMatcher: {
    file: '../rd/researcherMatcher.js',
    purpose: 'Match researchers with municipalities',
    component: 'ResearcherMunicipalityMatcher'
  }
};
