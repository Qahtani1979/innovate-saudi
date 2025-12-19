/**
 * Challenge Realtime Subscriptions Hook
 * Implements: rt-1 to rt-5, live-1 to live-4
 */

import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useChallengeRealtime(options = {}) {
  const queryClient = useQueryClient();
  const { 
    enabled = true, 
    challengeId = null,
    onInsert = null,
    onUpdate = null,
    onDelete = null
  } = options;

  const [connectionState, setConnectionState] = useState('disconnected');
  const [lastEvent, setLastEvent] = useState(null);

  // Handle realtime payload
  const handlePayload = useCallback((payload) => {
    console.log('[ChallengeRealtime] Received:', payload.eventType, payload);
    setLastEvent({ type: payload.eventType, timestamp: new Date().toISOString() });

    // Invalidate relevant queries
    if (challengeId) {
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge-activities', challengeId] });
    }
    queryClient.invalidateQueries({ queryKey: ['challenges'] });
    queryClient.invalidateQueries({ queryKey: ['challenges-with-visibility'] });

    // Call custom handlers
    switch (payload.eventType) {
      case 'INSERT':
        onInsert?.(payload.new);
        break;
      case 'UPDATE':
        onUpdate?.(payload.new, payload.old);
        break;
      case 'DELETE':
        onDelete?.(payload.old);
        break;
    }
  }, [challengeId, queryClient, onInsert, onUpdate, onDelete]);

  useEffect(() => {
    if (!enabled) {
      setConnectionState('disabled');
      return;
    }

    console.log('[ChallengeRealtime] Setting up subscription', { challengeId });

    // Create channel for challenges table
    const channelName = challengeId 
      ? `challenges-realtime-${challengeId}` 
      : 'challenges-realtime-all';

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          ...(challengeId && { filter: `id=eq.${challengeId}` })
        },
        handlePayload
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_activities',
          ...(challengeId && { filter: `challenge_id=eq.${challengeId}` })
        },
        (payload) => {
          console.log('[ChallengeRealtime] Activity update:', payload);
          if (challengeId) {
            queryClient.invalidateQueries({ queryKey: ['challenge-activities', challengeId] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_proposals',
          ...(challengeId && { filter: `challenge_id=eq.${challengeId}` })
        },
        (payload) => {
          console.log('[ChallengeRealtime] Proposal update:', payload);
          if (challengeId) {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals', challengeId] });
          }
        }
      );

    // Subscribe and track connection state
    channel.subscribe((status) => {
      console.log('[ChallengeRealtime] Subscription status:', status);
      setConnectionState(status === 'SUBSCRIBED' ? 'connected' : status.toLowerCase());
    });

    // Cleanup on unmount (rt-2: Subscription cleans up on unmount)
    return () => {
      console.log('[ChallengeRealtime] Cleaning up subscription');
      supabase.removeChannel(channel);
      setConnectionState('disconnected');
    };
  }, [enabled, challengeId, handlePayload, queryClient]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    lastEvent
  };
}

/**
 * Hook for realtime challenge list updates
 */
export function useChallengeListRealtime(options = {}) {
  return useChallengeRealtime({
    ...options,
    challengeId: null // Subscribe to all challenges
  });
}

/**
 * Hook for realtime single challenge updates
 */
export function useChallengeDetailRealtime(challengeId, options = {}) {
  return useChallengeRealtime({
    ...options,
    challengeId,
    enabled: !!challengeId && (options.enabled !== false)
  });
}

export default useChallengeRealtime;
