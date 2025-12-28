/**
 * Hook for User Analytics
 * Tracks user interactions like searches, views, etc.
 */

import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export function useAnalytics() {
    const { user } = useAuth();

    const trackSearchMutation = useMutation({
        mutationFn: async ({ query, resultsCount, entityType }) => {
            const { error } = await supabase.from('user_activities').insert({
                user_email: user?.email || 'anonymous',
                user_id: user?.id, // Add user_id
                activity_type: 'search',
                activity_description: `Searched: ${query}`,
                entity_type: entityType || 'mixed',
                metadata: {
                    query,
                    resultsCount,
                    timestamp: new Date().toISOString()
                }
            });
            if (error) throw error;
        },
        onError: (error) => {
            console.error('Analytics tracking error:', error);
            // Silent fail is intentional for analytics
        }
    });

    const trackSearch = useCallback((query, resultsCount, entityType) => {
        trackSearchMutation.mutate({ query, resultsCount, entityType });
    }, [trackSearchMutation]);

    const trackActivityMutation = useMutation({
        mutationFn: async ({ activityType, activityDescription, entityType, entityId, metadata }) => {
            const { error } = await supabase.from('user_activities').insert({
                user_email: user?.email || 'anonymous',
                user_id: user?.id,
                activity_type: activityType,
                activity_description: activityDescription,
                entity_type: entityType || 'mixed',
                entity_id: entityId,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString()
                }
            });
            if (error) throw error;
        },
        onError: (error) => {
            console.error('Analytics tracking error:', error);
        }
    });

    const trackActivity = useCallback((activityType, activityDescription, entityType, entityId, metadata) => {
        trackActivityMutation.mutate({ activityType, activityDescription, entityType, entityId, metadata });
    }, [trackActivityMutation]);

    const trackPageView = useCallback((pageName, pageUrl, metadata = {}) => {
        trackActivity('page_view', `Viewed page: ${pageName}`, 'page', null, {
            page_name: pageName,
            page_url: pageUrl,
            ...metadata
        });
    }, [trackActivity]);

    return {
        trackSearch,
        trackActivity,
        trackPageView
    };
}
