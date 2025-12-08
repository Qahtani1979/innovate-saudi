import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Track search queries for analytics
 */
export default function SearchAnalytics() {
  const trackSearch = async (query, resultsCount, entityType) => {
    try {
      const user = await base44.auth.me().catch(() => null);
      
      await base44.entities.UserActivity.create({
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
  const trackSearch = async (query, resultsCount, entityType) => {
    try {
      const user = await base44.auth.me().catch(() => null);
      
      await base44.entities.UserActivity.create({
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