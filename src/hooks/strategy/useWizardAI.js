/**
 * Centralized AI Router for Strategy Wizard
 * Routes AI generation requests to appropriate edge functions based on step
 * Uses comprehensive Saudi/MoMAH context from saudiContext.ts
 * @version 2.0.2
 */

import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { toast } from 'sonner';

// Edge function mapping per step - specialized functions for most steps
const EDGE_FUNCTION_MAP = {
  1: 'strategy-context-generator',    // Context Definition (specialized)
  2: 'strategy-vision-generator',     // Core Values & Strategic Pillars (specialized)
  3: 'strategy-stakeholder-generator', // Stakeholders
  4: 'strategy-environmental-generator', // PESTEL
  5: 'strategy-swot-generator',       // SWOT
  6: 'strategy-scenario-generator',   // Scenarios
  7: 'strategy-risk-generator',       // Risks
  8: 'strategy-dependency-generator', // Dependencies, Constraints, Assumptions
  9: 'strategy-objective-generator',  // Objectives
  10: 'strategy-national-linker',     // National Alignment
  11: 'strategy-kpi-generator',       // KPIs
  12: 'strategy-action-generator',    // Action Plans
  13: 'invoke-llm',                   // Resources
  14: 'strategy-timeline-generator',  // Timeline
  15: 'strategy-signoff-ai',          // Governance
  16: 'strategy-campaign-generator',  // Communication
  17: 'invoke-llm',                   // Change Management
  18: 'strategy-validation-ai'        // Review & Submit
};

// Comprehensive Saudi context for prompts - aligned with saudiContext.ts exports
export const SAUDI_CONTEXT = {
  FULL: `MoMAH (Ministry of Municipalities and Housing) oversees:
- 13 administrative regions, 285+ municipalities, 17 Amanats
- Municipal services: waste, lighting, parks, markets, permits, inspections
- Housing programs: Sakani, Wafi, Ejar, Mulkiya, REDF, NHC
- Vision 2030: Quality of Life, Housing (70% ownership), NTP, Thriving Cities
- Innovation: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, ConTech
- Partners: KACST, SDAIA, MCIT, KAUST, KFUPM, Monsha'at
- Systems: Balady Platform, Sakani, ANSA, Baladiya, Mostadam`,

  COMPACT: `MoMAH - Saudi Ministry of Municipalities & Housing. Vision 2030 aligned.
13 regions, 285+ municipalities. Programs: Sakani, Wafi, Ejar.
Innovation: KACST, SDAIA, MCIT. Platforms: Balady, Sakani, Mostadam.`,

  INNOVATION: `CRITICAL: Include innovation/R&D focus in all outputs.
- Technologies: AI/ML, IoT, Digital Twins, Smart Cities, GovTech, PropTech, ConTech
- Innovation Partners: KACST, SDAIA, KAUST, KFUPM, Monsha'at, Badir Program
- PropTech: BIM, modular construction, 3D printing, smart homes
- Metrics: Pilot success rates, technology adoption %, R&D investment %
- Green Building: Mostadam certification, energy efficiency, sustainability`,

  HOUSING: `Housing Mandate (Critical Priority):
- Goal: 70% homeownership by 2030 (from 47% baseline)
- Programs: Sakani (subsidies), Wafi (off-plan), Ejar (rental), Mulkiya (ownership)
- Finance: REDF mortgages, SRC refinancing
- Stakeholders: NHC, REDF, SRC, developers, PropTech startups
- Innovation: BIM, modular, 3D printing, smart homes, Mostadam green buildings`,

  MUNICIPAL: `Municipal Operations:
- Services: Waste, lighting, parks, markets, drainage, permits, inspections
- Platforms: Balady (citizen services), unified CRM
- Governance: Amanat (17 major cities), municipalities (285+), districts
- Compliance: Saudi Building Code, fire safety, accessibility standards
- Investment: PPP, concessions, asset commercialization`
};

// Step to prompt key mapping
const STEP_PROMPT_KEYS = {
  1: 'context',
  2: 'vision',
  3: 'stakeholders',
  4: 'pestel',
  5: 'swot',
  6: 'scenarios',
  7: 'risks',
  8: 'dependencies',
  9: 'objectives',
  10: 'national',
  11: 'kpis',
  12: 'actions',
  13: 'resources',
  14: 'timeline',
  15: 'governance',
  16: 'communication',
  17: 'change',
  18: 'review'
};

/**
 * Check if step uses specialized edge function
 */
export function usesSpecializedEdgeFunction(step) {
  const fn = EDGE_FUNCTION_MAP[step];
  return fn && fn !== 'invoke-llm';
}

/**
 * Get edge function name for step
 */
export function getEdgeFunctionForStep(step) {
  return EDGE_FUNCTION_MAP[step] || 'invoke-llm';
}

/**
 * Get prompt key for step
 */
export function getPromptKeyForStep(step) {
  return STEP_PROMPT_KEYS[step] || 'context';
}

/**
 * Hook for centralized wizard AI generation
 */
export function useWizardAI(planId = null) {
  const [stepStatus, setStepStatus] = useState({});
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo, error } = useAIWithFallback();

  /**
   * Generate AI content for a specific step using the appropriate edge function
   */
  const generateForStep = useCallback(async (step, context, options = {}) => {
    const edgeFunction = EDGE_FUNCTION_MAP[step];
    const useSpecialized = edgeFunction && edgeFunction !== 'invoke-llm';

    setStepStatus(prev => ({ ...prev, [step]: 'loading' }));

    try {
      if (useSpecialized) {
        // Use specialized edge function
        const { data, error: fnError } = await supabase.functions.invoke(edgeFunction, {
          body: {
            strategic_plan_id: planId,
            context: context,
            language: options.language || 'en',
            ...options.additionalParams
          }
        });

        if (fnError) throw fnError;

        setStepStatus(prev => ({ ...prev, [step]: 'success' }));
        return { success: true, data, specialized: true };
      } else {
        // Use generic invoke-llm with prompt
        const result = await invokeAI({
          prompt: context.prompt,
          response_json_schema: context.schema,
          system_prompt: context.systemPrompt || `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). ${SAUDI_CONTEXT.FULL}`
        });

        setStepStatus(prev => ({ ...prev, [step]: result.success ? 'success' : 'error' }));
        return result;
      }
    } catch (err) {
      console.error(`AI generation failed for step ${step}:`, err);
      setStepStatus(prev => ({ ...prev, [step]: 'error' }));
      
      toast.error(options.language === 'ar' 
        ? 'فشل توليد المحتوى بالذكاء الاصطناعي' 
        : 'AI content generation failed'
      );
      
      return { success: false, error: err, fallback: true };
    }
  }, [planId, invokeAI]);

  /**
   * Get status for a specific step
   */
  const getStepStatus = useCallback((step) => {
    return stepStatus[step] || 'idle';
  }, [stepStatus]);

  /**
   * Check if step is currently generating
   */
  const isStepGenerating = useCallback((step) => {
    return stepStatus[step] === 'loading';
  }, [stepStatus]);

  /**
   * Reset status for a step
   */
  const resetStepStatus = useCallback((step) => {
    setStepStatus(prev => {
      const updated = { ...prev };
      delete updated[step];
      return updated;
    });
  }, []);

  return {
    // Core functions
    generateForStep,
    getStepStatus,
    isStepGenerating,
    resetStepStatus,
    
    // From useAIWithFallback
    status,
    isLoading,
    isAvailable,
    rateLimitInfo,
    error,
    
    // Utilities
    getEdgeFunctionForStep,
    usesSpecializedEdgeFunction,
    getPromptKeyForStep,
    
    // Constants
    EDGE_FUNCTION_MAP,
    SAUDI_CONTEXT
  };
}

export default useWizardAI;
