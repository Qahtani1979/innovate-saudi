/**
 * Track Decision Prompts
 * Bridge for Track Assignment logic
 */

import { buildTrackAssignmentPrompt, TRACK_ASSIGNMENT_SCHEMA } from './trackAssignment';

// Re-export with expected names
export const getTrackDecisionPrompt = buildTrackAssignmentPrompt;
export const trackDecisionSchema = TRACK_ASSIGNMENT_SCHEMA;
