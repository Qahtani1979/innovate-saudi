/**
 * Sector Benchmarking Prompts
 * @module taxonomy/sectorBenchmark
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const SECTOR_BENCHMARK_SYSTEM_PROMPT = getSystemPrompt('sector_benchmark', `
You are a sector benchmarking specialist for Saudi Arabia's municipal innovation platform.
Your role is to compare sector performance against national and international standards.
Provide actionable insights for improving sector innovation outcomes.
Consider Vision 2030 targets and global best practices.
`);

/**
 * Build sector benchmarking prompt
 * @param {Object} params - Sector performance details
 * @returns {string} Formatted prompt
 */
export function buildSectorBenchmarkPrompt({ challengeCount, activePilots, completedPilots, successRate }) {
  return `Benchmark this sector against national/international standards:

Sector Performance:
- Total Challenges: ${challengeCount}
- Active Pilots: ${activePilots}
- Completed Pilots: ${completedPilots}
- Success Rate: ${successRate}%

Provide benchmarking against:
1. National average for this sector
2. International best practices
3. Top performing municipalities in this sector
4. Areas for improvement
5. Recommendations`;
}

export const SECTOR_BENCHMARK_SCHEMA = {
  type: 'object',
  properties: {
    national_average: {
      type: 'object',
      properties: {
        challenges_per_municipality: { type: 'number' },
        pilot_success_rate: { type: 'number' },
        innovation_score: { type: 'number' }
      }
    },
    international_benchmarks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          country: { type: 'string' },
          metric: { type: 'string' },
          value: { type: 'number' },
          source: { type: 'string' }
        }
      }
    },
    performance_gap: { type: 'number' },
    strengths: { type: 'array', items: { type: 'string' } },
    areas_for_improvement: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } }
  },
  required: ['performance_gap', 'recommendations']
};

export const SECTOR_BENCHMARK_PROMPTS = {
  systemPrompt: SECTOR_BENCHMARK_SYSTEM_PROMPT,
  buildPrompt: buildSectorBenchmarkPrompt,
  schema: SECTOR_BENCHMARK_SCHEMA
};
