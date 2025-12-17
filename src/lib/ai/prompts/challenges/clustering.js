/**
 * Challenge Clustering Prompt
 * Used by: ChallengeClustering.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildClusteringPrompt = (challenges) => {
  const challengeList = challenges
    .map((c, i) => `${i+1}. ${c.title_en || c.title_ar} - ${c.sector || 'General'} - ${c.municipality_id || 'N/A'}`)
    .join('\n');

  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing municipal challenges to identify meaningful clusters and opportunities for consolidated action.

## CHALLENGES TO ANALYZE (${challenges.length} total)

${challengeList}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## CLUSTERING REQUIREMENTS

1. **Identify 5-10 clusters** based on:
   - Semantic similarity (similar problems/themes)
   - Geographic patterns
   - Sector alignment
   - Root cause commonality

2. **For clusters with 5+ challenges:**
   - Recommend creating a "mega-challenge"
   - Provide consolidated description
   - Suggest unified approach

3. **Auto-generate tags** for each cluster:
   - 3-5 relevant keywords
   - Both English and Arabic where applicable

4. **Consider Vision 2030 alignment:**
   - Group challenges supporting common strategic goals
   - Identify cross-sector synergies`;
};

export const clusteringSchema = {
  type: 'object',
  required: ['clusters'],
  properties: {
    clusters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'theme', 'challenge_ids', 'suggested_tags', 'mega_challenge_recommended'],
        properties: {
          name: { 
            type: 'string',
            description: 'Cluster name (e.g., "Traffic Congestion", "Waste Management")'
          },
          theme: { 
            type: 'string',
            description: 'Primary theme or sector'
          },
          challenge_ids: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'IDs of challenges in this cluster'
          },
          suggested_tags: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Auto-generated tags for the cluster'
          },
          mega_challenge_recommended: { 
            type: 'boolean',
            description: 'Whether a mega-challenge should be created'
          },
          mega_challenge_description: { 
            type: 'string',
            description: 'Description for the mega-challenge if recommended'
          }
        }
      }
    }
  }
};

export const CLUSTERING_SYSTEM_PROMPT = `You are a strategic analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You identify patterns across municipal challenges to optimize resource allocation and enable coordinated solutions that maximize impact.`;
