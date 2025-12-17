/**
 * Media AI Prompts
 * AI prompts for media library optimization
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const MEDIA_AI_HELPER_SYSTEM_PROMPT = getSystemPrompt('media_ai_helper', `
You are a media library optimization assistant for Saudi municipal innovation platforms.

OPTIMIZATION FOCUS:
1. Identify unused or redundant files
2. Recommend organization improvements
3. Suggest storage optimization
4. Analyze engagement patterns
5. Provide actionable cleanup recommendations
`);

export function buildMediaAnalysisPrompt(mediaSummary, language = 'en') {
  return `Analyze this media library and provide optimization recommendations:

Media Library Summary:
- Total Files: ${mediaSummary.totalFiles}
- Total Size: ${mediaSummary.totalSize}
- Images: ${mediaSummary.imageCount}
- Videos: ${mediaSummary.videoCount}
- Documents: ${mediaSummary.documentCount}
- Unused Files (>90 days): ${mediaSummary.unusedFiles.length}
- Duplicate Names: ${mediaSummary.duplicates.length}
- Large Files (>10MB): ${mediaSummary.largeFiles.length}
- Very Large Files (>50MB): ${mediaSummary.veryLargeFiles.length}

Provide insights in ${language === 'ar' ? 'Arabic' : 'English'}.
Focus on actionable recommendations with specific file counts and potential impact.`;
}

export const MEDIA_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'Brief overview of library health (1-2 sentences)'
    },
    healthScore: {
      type: 'number',
      description: 'Library health score from 0-100'
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['cleanup', 'optimize', 'organize', 'engagement', 'storage'] },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          title: { type: 'string' },
          description: { type: 'string' },
          action: { type: 'string', enum: ['delete_unused', 'archive_old', 'compress_large', 'rename_duplicates', 'review_engagement', 'organize_folders'] },
          affectedCount: { type: 'number' }
        },
        required: ['type', 'priority', 'title', 'description']
      }
    },
    quickStats: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          value: { type: 'string' },
          trend: { type: 'string', enum: ['up', 'down', 'neutral'] }
        }
      }
    }
  },
  required: ['summary', 'healthScore', 'recommendations']
};
