/**
 * R&D Module Prompts Index
 * Central export for all R&D-related AI prompts
 * @version 1.3.0
 */

export { PROPOSAL_SCORER_PROMPTS } from './proposalScorer';
export { PROPOSAL_WRITER_PROMPTS } from './proposalWriter';
export { RESEARCHER_MATCHER_PROMPTS } from './researcherMatcher';
export { PILOT_TRANSITION_PROMPTS } from './pilotTransition';
export { TRL_ASSESSMENT_PROMPTS } from './trlAssessment';
export { buildProposalFeedbackPrompt, PROPOSAL_FEEDBACK_SYSTEM_PROMPT } from './proposalFeedback';
export { buildReviewerAssignmentPrompt, REVIEWER_ASSIGNMENT_SCHEMA } from './reviewerAssignment';
export { buildEligibilityCheckPrompt, ELIGIBILITY_CHECK_SCHEMA } from './eligibilityCheck';
export { 
  RD_SOLUTION_CONVERTER_SYSTEM_PROMPT, buildRDSolutionConverterPrompt, RD_SOLUTION_CONVERTER_SCHEMA,
  IP_COMMERCIALIZATION_SYSTEM_PROMPT, buildIPCommercializationPrompt, IP_COMMERCIALIZATION_SCHEMA
} from './commercialization';
export {
  RD_SPINOFF_SYSTEM_PROMPT, buildRDSpinoffPrompt, RD_SPINOFF_SCHEMA,
  PATENT_LANDSCAPE_SYSTEM_PROMPT, buildPatentLandscapePrompt, PATENT_LANDSCAPE_SCHEMA,
  TECH_TRANSFER_SYSTEM_PROMPT, buildTechTransferPrompt, TECH_TRANSFER_SCHEMA
} from './rdSpinoff';
export {
  RD_PORTFOLIO_SYSTEM_PROMPT, createRDPortfolioPlanPrompt, RD_PORTFOLIO_SCHEMA
} from './portfolioPlanner';

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
  },
  proposalFeedback: {
    file: 'proposalFeedback.js',
    purpose: 'Generate constructive feedback for proposals',
    component: 'ProposalFeedbackWorkflow'
  },
  reviewerAssignment: {
    file: 'reviewerAssignment.js',
    purpose: 'Auto-assign reviewers to proposals',
    component: 'ReviewerAutoAssignment'
  },
  eligibilityCheck: {
    file: 'eligibilityCheck.js',
    purpose: 'Check proposal eligibility',
    component: 'ProposalEligibilityChecker'
  },
  rdSpinoff: {
    file: 'rdSpinoff.js',
    purpose: 'Assess R&D commercialization potential',
    component: 'RDToStartupSpinoff'
  },
  patentLandscape: {
    file: 'rdSpinoff.js',
    purpose: 'Analyze patent landscapes',
    component: 'PatentLandscapeAnalyzer'
  },
  techTransfer: {
    file: 'rdSpinoff.js',
    purpose: 'Guide technology transfer',
    component: 'TechTransferAdvisor'
  },
  portfolioPlanner: {
    file: 'portfolioPlanner.js',
    purpose: 'Strategic R&D portfolio planning',
    component: 'RDPortfolioPlanner'
  }
};
