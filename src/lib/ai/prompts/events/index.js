/**
 * Events Module AI Prompts Index
 * @version 1.0.0
 */

// Event Optimizer
export { getEventOptimizerPrompt, eventOptimizerSchema } from './eventOptimizer';

// Attendance Predictor
export { getAttendancePredictorPrompt, attendancePredictorSchema } from './attendancePredictor';

// Program-Event Correlator
export { getProgramEventCorrelatorPrompt, programEventCorrelatorSchema } from './programEventCorrelator';

/**
 * Events module prompt configuration
 */
export const EVENTS_PROMPTS = {
  optimizer: {
    promptFn: 'getEventOptimizerPrompt',
    schema: 'eventOptimizerSchema',
    description: 'Optimizes event timing, description, and capacity'
  },
  attendance: {
    promptFn: 'getAttendancePredictorPrompt',
    schema: 'attendancePredictorSchema',
    description: 'Predicts attendance and provides optimization tips'
  },
  correlator: {
    promptFn: 'getProgramEventCorrelatorPrompt',
    schema: 'programEventCorrelatorSchema',
    description: 'Analyzes program-event relationships and gaps'
  }
};

export default EVENTS_PROMPTS;
