/**
 * R&D Module Prompts Index
 * Central export for all R&D-related AI prompts
 */

export { PROPOSAL_SCORER_PROMPTS } from './proposalScorer';
export { PROPOSAL_WRITER_PROMPTS } from './proposalWriter';
export { RESEARCHER_MATCHER_PROMPTS } from './researcherMatcher';
export { PILOT_TRANSITION_PROMPTS } from './pilotTransition';
export { TRL_ASSESSMENT_PROMPTS } from './trlAssessment';

export const RD_PROMPT_MANIFEST = {
  proposalScorer: {
    file: 'proposalScorer.js',
    purpose: 'Score R&D proposals on quality dimensions',
    component: 'AIProposalScorer'
  },
  proposalWriter: {
    file: 'proposalWriter.js',
    purpose: 'Generate comprehensive R&D proposals',
    component: 'AIProposalWriter'
  },
  researcherMatcher: {
    file: 'researcherMatcher.js',
    purpose: 'Match researchers with municipalities',
    component: 'ResearcherMunicipalityMatcher'
  },
  pilotTransition: {
    file: 'pilotTransition.js',
    purpose: 'Generate pilot designs from R&D projects',
    component: 'RDToPilotTransition'
  },
  trlAssessment: {
    file: 'trlAssessment.js',
    purpose: 'Assess Technology Readiness Level',
    component: 'TRLAssessmentWorkflow'
  }
};
