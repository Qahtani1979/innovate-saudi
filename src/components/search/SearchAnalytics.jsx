import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Track search queries for analytics
 */
export default function SearchAnalytics() {
  const { user } = useAuth();

  const trackSearch = async (query, resultsCount, entityType) => {
    try {
      await supabase.from('user_activities').insert({
        user_email: user?.email || 'anonymous',
        activity_type: 'search',
        activity_description: `Searched: ${query}`,
        entity_type: entityType || 'mixed',
        metadata: {
          query,
          resultsCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Silent fail - analytics shouldn't break UX
      console.error('Search analytics error:', error);
    }
  };

  return { trackSearch };
}

export function useSearchAnalytics() {
  const { user } = useAuth();

  const trackSearch = async (query, resultsCount, entityType) => {
    try {
      await supabase.from('user_activities').insert({
        user_email: user?.email || 'anonymous',
        activity_type: 'search',
        activity_description: `Searched: ${query}`,
        entity_type: entityType || 'mixed',
        metadata: {
          query,
          resultsCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Search analytics error:', error);
    }
  };

  return { trackSearch };
}
