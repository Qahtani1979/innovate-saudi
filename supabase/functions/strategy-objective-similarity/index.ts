import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate Jaccard similarity between two sets of words
function jaccardSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// Calculate cosine similarity using term frequency
function cosineSimilarity(text1: string, text2: string): number {
  const getTermFreq = (text: string): Map<string, number> => {
    const freq = new Map<string, number>();
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
    return freq;
  };

  const freq1 = getTermFreq(text1);
  const freq2 = getTermFreq(text2);
  const allWords = new Set([...freq1.keys(), ...freq2.keys()]);

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const word of allWords) {
    const v1 = freq1.get(word) || 0;
    const v2 = freq2.get(word) || 0;
    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Calculate n-gram overlap
function ngramSimilarity(text1: string, text2: string, n: number = 3): number {
  const getNgrams = (text: string): Set<string> => {
    const ngrams = new Set<string>();
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.add(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  };

  const ngrams1 = getNgrams(text1);
  const ngrams2 = getNgrams(text2);
  
  if (ngrams1.size === 0 || ngrams2.size === 0) return 0;
  
  const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
  return (2 * intersection.size) / (ngrams1.size + ngrams2.size);
}

// Check sector overlap
function sectorOverlapPenalty(newSector: string, existingSectors: string[]): number {
  const sectorCount = existingSectors.filter(s => s === newSector).length;
  // More objectives in same sector = higher penalty (lower uniqueness)
  if (sectorCount === 0) return 0; // 0% penalty for new sector
  if (sectorCount === 1) return 0.1; // 10% penalty
  if (sectorCount === 2) return 0.2; // 20% penalty
  return Math.min(0.4, sectorCount * 0.1); // Max 40% penalty
}

// Keywords that indicate tactical vs strategic level
const TACTICAL_INDICATORS = [
  'implement', 'deploy', 'install', 'train', 'launch', 'create', 'develop',
  'specific', 'pilot', 'test', 'app', 'system', 'platform', 'software',
  'sensors', 'chatbot', 'portal', 'dashboard', 'mobile', 'website'
];

const STRATEGIC_INDICATORS = [
  'achieve', 'establish', 'transform', 'enhance', 'strengthen', 'optimize',
  'framework', 'ecosystem', 'capability', 'governance', 'excellence',
  'comprehensive', 'integrated', 'nationwide', 'kingdom-wide', 'national'
];

function strategicLevelScore(text: string): number {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let tacticalCount = 0;
  let strategicCount = 0;
  
  for (const word of words) {
    if (TACTICAL_INDICATORS.some(t => word.includes(t))) tacticalCount++;
    if (STRATEGIC_INDICATORS.some(s => word.includes(s))) strategicCount++;
  }
  
  // Higher score = more strategic
  const total = tacticalCount + strategicCount;
  if (total === 0) return 0.7; // Neutral
  
  return Math.max(0.3, Math.min(1, (strategicCount - tacticalCount * 0.5 + total) / (total * 2)));
}

interface Objective {
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  sector_code?: string;
}

interface SimilarityResult {
  uniqueness_score: number;
  max_similarity: number;
  most_similar_to: number | null;
  sector_coverage_bonus: number;
  strategic_level_score: number;
  details: {
    jaccard_similarities: number[];
    cosine_similarities: number[];
    ngram_similarities: number[];
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newObjective, existingObjectives } = await req.json() as {
      newObjective: Objective;
      existingObjectives: Objective[];
    };

    console.log('[Similarity] Calculating for new objective:', newObjective.name_en);
    console.log('[Similarity] Comparing against', existingObjectives.length, 'existing objectives');

    // If no existing objectives, it's 100% unique
    if (!existingObjectives || existingObjectives.length === 0) {
      const stratScore = strategicLevelScore(
        `${newObjective.name_en || ''} ${newObjective.description_en || ''}`
      );
      
      return new Response(JSON.stringify({
        uniqueness_score: Math.round(90 + stratScore * 10), // 90-100 for first objective
        max_similarity: 0,
        most_similar_to: null,
        sector_coverage_bonus: 15,
        strategic_level_score: Math.round(stratScore * 100),
        details: {
          jaccard_similarities: [],
          cosine_similarities: [],
          ngram_similarities: []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Combine name and description for comparison
    const newText = `${newObjective.name_en || ''} ${newObjective.description_en || ''} ${newObjective.name_ar || ''} ${newObjective.description_ar || ''}`;
    
    const jaccardSims: number[] = [];
    const cosineSims: number[] = [];
    const ngramSims: number[] = [];

    for (const existing of existingObjectives) {
      const existingText = `${existing.name_en || ''} ${existing.description_en || ''} ${existing.name_ar || ''} ${existing.description_ar || ''}`;
      
      jaccardSims.push(jaccardSimilarity(newText, existingText));
      cosineSims.push(cosineSimilarity(newText, existingText));
      ngramSims.push(ngramSimilarity(newText, existingText));
    }

    // Find max similarity (weighted average of all methods)
    const combinedSims = jaccardSims.map((j, i) => 
      j * 0.3 + cosineSims[i] * 0.4 + ngramSims[i] * 0.3
    );
    
    const maxSimilarity = Math.max(...combinedSims);
    const mostSimilarIndex = combinedSims.indexOf(maxSimilarity);

    // Calculate sector coverage bonus
    const existingSectors = existingObjectives.map(o => o.sector_code || '');
    const sectorPenalty = sectorOverlapPenalty(newObjective.sector_code || '', existingSectors);
    const sectorBonus = 15 - (sectorPenalty * 15); // 0-15 bonus

    // Calculate strategic level score
    const stratScore = strategicLevelScore(newText);

    // Final uniqueness score calculation:
    // Base: 100 - (similarity * 100)
    // Add sector bonus (0-15)
    // Multiply by strategic score (0.3-1.0)
    const baseDifferentiation = (1 - maxSimilarity) * 100;
    const withSectorBonus = baseDifferentiation + sectorBonus;
    const finalScore = Math.round(Math.min(100, Math.max(10, withSectorBonus * stratScore)));

    console.log('[Similarity] Results:', {
      maxSimilarity: maxSimilarity.toFixed(3),
      sectorBonus,
      stratScore: stratScore.toFixed(2),
      finalScore
    });

    const result: SimilarityResult = {
      uniqueness_score: finalScore,
      max_similarity: Math.round(maxSimilarity * 100),
      most_similar_to: mostSimilarIndex,
      sector_coverage_bonus: Math.round(sectorBonus),
      strategic_level_score: Math.round(stratScore * 100),
      details: {
        jaccard_similarities: jaccardSims.map(s => Math.round(s * 100)),
        cosine_similarities: cosineSims.map(s => Math.round(s * 100)),
        ngram_similarities: ngramSims.map(s => Math.round(s * 100))
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Similarity] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      uniqueness_score: 50 // Fallback to neutral score
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
