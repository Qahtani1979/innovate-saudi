import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCommunicationAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImpactStory = useCallback(async (entityData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-communication-ai', {
        body: {
          action: 'generate_impact_story',
          data: entityData
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateKeyMessages = useCallback(async (strategyData, audienceSegment) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-communication-ai', {
        body: {
          action: 'generate_key_messages',
          data: { strategy: strategyData, audience: audienceSegment }
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const suggestChannelStrategy = useCallback(async (audiences, objectives) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-communication-ai', {
        body: {
          action: 'suggest_channel_strategy',
          data: { audiences, objectives }
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateContentCalendar = useCallback(async (planData, duration) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-communication-ai', {
        body: {
          action: 'generate_content_calendar',
          data: { plan: planData, duration }
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeEngagement = useCallback(async (analyticsData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-communication-ai', {
        body: {
          action: 'analyze_engagement',
          data: analyticsData
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateContent = useCallback(async (content, targetLanguage) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-communication-ai', {
        body: {
          action: 'translate_content',
          data: { content, targetLanguage }
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateImpactStory,
    generateKeyMessages,
    suggestChannelStrategy,
    generateContentCalendar,
    analyzeEngagement,
    translateContent,
    isLoading,
    error
  };
}

export default useCommunicationAI;
