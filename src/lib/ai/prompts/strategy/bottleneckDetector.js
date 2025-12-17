/**
 * Bottleneck Detector Prompt
 * Used by: BottleneckDetector.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildBottleneckDetectorPrompt = (challengesInReview, pilotsInApproval) => {
  const avgReviewTime = challengesInReview.reduce((sum, c) => sum + c.days_in_review, 0) / Math.max(1, challengesInReview.length);
  const avgApprovalTime = pilotsInApproval.reduce((sum, p) => sum + p.days_pending, 0) / Math.max(1, pilotsInApproval.length);

  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing the innovation pipeline for Saudi Arabia's Ministry of Municipalities and Housing.

## PIPELINE ANALYSIS DATA

### Challenges in Review
- Total: ${challengesInReview.length}
- Stuck (>30 days): ${challengesInReview.filter(c => c.days_in_review > 30).length}
- Average review time: ${avgReviewTime.toFixed(1)} days

### Pilots Pending Approval
- Total: ${pilotsInApproval.length}
- Delayed (>45 days): ${pilotsInApproval.filter(p => p.days_pending > 45).length}
- Average approval time: ${avgApprovalTime.toFixed(1)} days

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Identify the top 3 bottlenecks with:
1. Stage name (bilingual)
2. Severity level (critical, high, medium)
3. Number of items affected
4. Average delay in days
5. Root cause analysis (bilingual)
6. Specific actionable recommendation (bilingual)

Focus on Saudi municipal innovation context and Vision 2030 alignment.`;
};

export const bottleneckDetectorSchema = {
  type: 'object',
  required: ['bottlenecks'],
  properties: {
    bottlenecks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['stage_en', 'stage_ar', 'severity', 'items_affected', 'avg_delay_days'],
        properties: {
          stage_en: { type: 'string' },
          stage_ar: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium'] },
          items_affected: { type: 'number' },
          avg_delay_days: { type: 'number' },
          root_cause_en: { type: 'string' },
          root_cause_ar: { type: 'string' },
          recommendation_en: { type: 'string' },
          recommendation_ar: { type: 'string' }
        }
      }
    }
  }
};

export const BOTTLENECK_DETECTOR_SYSTEM_PROMPT = `You are a process optimization specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation ecosystem. You analyze innovation pipeline bottlenecks and provide actionable recommendations to improve throughput and reduce delays.`;
