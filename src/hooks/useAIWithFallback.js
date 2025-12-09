/**
 * Hook for AI calls with graceful degradation
 * Handles rate limits, failures, and provides fallback behavior
 */

import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export const AI_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  RATE_LIMITED: 'rate_limited',
  ERROR: 'error',
  UNAVAILABLE: 'unavailable'
};

export function useAIWithFallback(options = {}) {
  const {
    showToasts = true,
    fallbackData = null,
    onRateLimited = null,
    onError = null
  } = options;

  const [status, setStatus] = useState(AI_STATUS.IDLE);
  const [error, setError] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  const invokeAI = useCallback(async ({ prompt, response_json_schema, system_prompt }) => {
    setStatus(AI_STATUS.LOADING);
    setError(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema,
        system_prompt
      });

      // Check if result contains rate limit info
      if (result?.rate_limit_info) {
        setRateLimitInfo(result.rate_limit_info);
        
        // Check for 80% warning
        if (result.rate_limit_info.daily_remaining <= result.rate_limit_info.daily_limit * 0.2) {
          if (showToasts) {
            toast.warning(`AI usage warning: ${result.rate_limit_info.daily_remaining} requests remaining today`);
          }
        }
      }

      setStatus(AI_STATUS.SUCCESS);
      return { success: true, data: result, fallback: false };
    } catch (err) {
      console.error('AI invocation error:', err);
      
      // Handle rate limiting
      if (err?.message?.includes('Rate limit') || err?.status === 429) {
        setStatus(AI_STATUS.RATE_LIMITED);
        setError('You have reached your AI usage limit. Please try again later.');
        
        if (showToasts) {
          toast.error('AI rate limit reached. Feature available without AI assistance.');
        }
        
        if (onRateLimited) {
          onRateLimited(err);
        }
        
        return { success: false, data: fallbackData, fallback: true, rateLimited: true };
      }
      
      // Handle other errors
      setStatus(AI_STATUS.ERROR);
      setError(err?.message || 'AI service temporarily unavailable');
      
      if (showToasts) {
        toast.error('AI assistance unavailable. You can continue manually.');
      }
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, data: fallbackData, fallback: true, error: err };
    }
  }, [showToasts, fallbackData, onRateLimited, onError]);

  const reset = useCallback(() => {
    setStatus(AI_STATUS.IDLE);
    setError(null);
    setRateLimitInfo(null);
  }, []);

  return {
    invokeAI,
    status,
    error,
    rateLimitInfo,
    reset,
    isLoading: status === AI_STATUS.LOADING,
    isRateLimited: status === AI_STATUS.RATE_LIMITED,
    isError: status === AI_STATUS.ERROR,
    isAvailable: status !== AI_STATUS.RATE_LIMITED && status !== AI_STATUS.UNAVAILABLE
  };
}

export default useAIWithFallback;
