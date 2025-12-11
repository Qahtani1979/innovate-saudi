/**
 * Hook for AI calls with graceful degradation
 * Handles rate limits, failures, and provides fallback behavior
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AI_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  RATE_LIMITED: 'rate_limited',
  ERROR: 'error',
  UNAVAILABLE: 'unavailable'
} as const;

type AIStatusType = typeof AI_STATUS[keyof typeof AI_STATUS];

interface RateLimitInfo {
  daily_remaining: number;
  daily_limit: number;
  [key: string]: unknown;
}

interface AIInvokeParams {
  prompt: string;
  response_json_schema?: Record<string, unknown>;
  system_prompt?: string;
}

interface AIInvokeResult {
  success: boolean;
  data: unknown;
  fallback: boolean;
  rateLimited?: boolean;
  error?: Error;
}

interface UseAIWithFallbackOptions {
  showToasts?: boolean;
  fallbackData?: unknown;
  onRateLimited?: ((error: Error) => void) | null;
  onError?: ((error: Error) => void) | null;
}

// Get or create session ID for anonymous rate limiting
const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  let sessionId = sessionStorage.getItem('ai_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ai_session_id', sessionId);
  }
  return sessionId;
};

export function useAIWithFallback(options: UseAIWithFallbackOptions = {}) {
  const {
    showToasts = true,
    fallbackData = null,
    onRateLimited = null,
    onError = null
  } = options;

  const [status, setStatus] = useState<AIStatusType>(AI_STATUS.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  const invokeAI = useCallback(async ({ prompt, response_json_schema, system_prompt }: AIInvokeParams): Promise<AIInvokeResult> => {
    setStatus(AI_STATUS.LOADING);
    setError(null);

    try {
      const sessionId = getSessionId();
      
      const { data: result, error: invokeError } = await supabase.functions.invoke('invoke-llm', {
        body: { prompt, response_json_schema, system_prompt, session_id: sessionId }
      });

      if (invokeError) {
        throw invokeError;
      }

      // Check for error in response body (edge function returns 429 with error in body)
      if (result?.error && result?.rate_limit_info) {
        const rateLimitError = new Error(result.error) as Error & { status?: number; rateLimitInfo?: RateLimitInfo };
        rateLimitError.status = 429;
        rateLimitError.rateLimitInfo = result.rate_limit_info;
        throw rateLimitError;
      }

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
    } catch (err: unknown) {
      console.error('AI invocation error:', err);
      
      const errorObj = err as Error & { status?: number; message?: string };
      
      // Handle rate limiting
      if (errorObj?.message?.includes('Rate limit') || errorObj?.status === 429) {
        setStatus(AI_STATUS.RATE_LIMITED);
        setError('You have reached your AI usage limit. Please try again later.');
        
        if (showToasts) {
          toast.error('AI rate limit reached. Feature available without AI assistance.');
        }
        
        if (onRateLimited) {
          onRateLimited(errorObj);
        }
        
        return { success: false, data: fallbackData, fallback: true, rateLimited: true };
      }
      
      // Handle other errors
      setStatus(AI_STATUS.ERROR);
      setError(errorObj?.message || 'AI service temporarily unavailable');
      
      if (showToasts) {
        toast.error('AI assistance unavailable. You can continue manually.');
      }
      
      if (onError) {
        onError(errorObj);
      }
      
      return { success: false, data: fallbackData, fallback: true, error: errorObj };
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
