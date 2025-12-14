import { useState, useCallback, useEffect } from 'react';
import { useDemandQueue } from './useDemandQueue';

export function useQueueAutoPopulation(entityType, strategicPlanId) {
  const [queueItem, setQueueItem] = useState(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  
  const { 
    getNextItem, 
    getPendingByType,
    updateItemStatus, 
    completeItem,
    refetch 
  } = useDemandQueue(strategicPlanId);

  // Count pending items for this type
  const pendingCount = getPendingByType(entityType)?.length || 0;

  // Load next item from queue
  const loadNextFromQueue = useCallback(async () => {
    const item = getNextItem(entityType);
    if (item) {
      await updateItemStatus.mutateAsync({ id: item.id, status: 'in_progress' });
      setQueueItem(item);
      setIsAutoMode(true);
      return item.prefilled_spec;
    }
    setIsAutoMode(false);
    return null;
  }, [entityType, getNextItem, updateItemStatus]);

  // Complete current queue item
  const completeQueueItem = useCallback(async (entityId, qualityScore, entityType) => {
    if (queueItem) {
      await completeItem.mutateAsync({
        id: queueItem.id,
        generated_entity_id: entityId,
        generated_entity_type: entityType || queueItem.entity_type,
        quality_score: qualityScore,
        status: qualityScore >= 70 ? 'accepted' : 'review'
      });
      setQueueItem(null);
      
      // Refetch to get updated queue
      await refetch();
    }
  }, [queueItem, completeItem, refetch]);

  // Skip current item
  const skipItem = useCallback(async (reason = 'manual_skip') => {
    if (queueItem) {
      await updateItemStatus.mutateAsync({ 
        id: queueItem.id, 
        status: 'skipped',
        quality_feedback: { skip_reason: reason, skipped_at: new Date().toISOString() }
      });
      setQueueItem(null);
      await refetch();
    }
  }, [queueItem, updateItemStatus, refetch]);

  // Reject current item
  const rejectItem = useCallback(async (reason) => {
    if (queueItem) {
      await updateItemStatus.mutateAsync({ 
        id: queueItem.id, 
        status: 'rejected',
        quality_feedback: { rejection_reason: reason, rejected_at: new Date().toISOString() }
      });
      setQueueItem(null);
      await refetch();
    }
  }, [queueItem, updateItemStatus, refetch]);

  // Exit auto mode
  const exitAutoMode = useCallback(() => {
    setIsAutoMode(false);
    setQueueItem(null);
  }, []);

  // Load next automatically after completing one
  const completeAndLoadNext = useCallback(async (entityId, qualityScore, entityType) => {
    await completeQueueItem(entityId, qualityScore, entityType);
    // Automatically load next item
    return loadNextFromQueue();
  }, [completeQueueItem, loadNextFromQueue]);

  return {
    queueItem,
    isAutoMode,
    setIsAutoMode,
    loadNextFromQueue,
    completeQueueItem,
    completeAndLoadNext,
    skipItem,
    rejectItem,
    exitAutoMode,
    prefillData: queueItem?.prefilled_spec || null,
    pendingCount,
    isProcessing: updateItemStatus.isPending || completeItem.isPending
  };
}
