/**
 * Hook for AI calls with graceful degradation
 * Handles rate limits, failures, and provides fallback behavior
 * @version 2.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AI_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  RATE_LIMITED: 'rate_limited',
  ERROR: 'error',
  UNAVAILABLE: 'unavailable'
};

// Get or create session ID for anonymous rate limiting
function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sessionId = sessionStorage.getItem('ai_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ai_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Lightweight, non-reactive AI helper.
 *
 * NOTE: This is intentionally NOT a real React hook anymore to avoid
 * duplicate-React / invalid hook call issues in the current bundle.
 * It keeps the same API shape so existing callers keep working,
 * but `status`/`isLoading` etc. are not reactive (no re-renders).
 */
export function useAIWithFallback(options = {}) {
  const {
    showToasts = true,
    fallbackData = null,
    onRateLimited = null,
    onError = null
  } = options;

  // Internal mutable state (non-reactive)
  let status = AI_STATUS.IDLE;
  let error = null;
  let rateLimitInfo = null;

  const setStatus = (nextStatus) => {
    status = nextStatus;
  };

  const setError = (nextError) => {
    error = nextError;
  };

  const setRateLimitInfo = (info) => {
    rateLimitInfo = info;
  };

  const invokeAI = async ({ prompt, response_json_schema, system_prompt }) => {
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
        const rateLimitError = new Error(result.error);
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
  };

  const reset = () => {
    setStatus(AI_STATUS.IDLE);
    setError(null);
    setRateLimitInfo(null);
  };

  return {
    invokeAI,
    status,
    error,
    rateLimitInfo,
    reset,
    isLoading: status === AI_STATUS.LOADING,
    isRateLimited: status === AI_STATUS.RATE_LIMITED,
    isError: status === AI_STATUS.ERROR,
    isAvailable: status !== AI_STATUS.RATE_LIMITED && status !== AI_STATUS.UNAVAILABLE,
  };
}

export default useAIWithFallback;
