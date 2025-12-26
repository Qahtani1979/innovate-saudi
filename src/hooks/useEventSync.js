import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { eventSyncService } from '@/services/eventSyncService';

/**
 * useEventSync Hook
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useEventSync(programId) {
    const queryClient = useAppQueryClient();

    /**
     * Get sync status for program events
     */
    const syncStatus = useQuery({
        queryKey: ['event-sync-status', programId],
        queryFn: () => eventSyncService.getSyncStatus(programId),
        enabled: !!programId
    });

    /**
     * Sync a single event
     */
    const syncEvent = useMutation({
        mutationFn: ({ eventData, eventIndex }) =>
            eventSyncService.syncEventToTable(programId, eventData, eventIndex),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event-sync-status', programId] });
        }
    });

    /**
     * Sync all program events
     */
    const syncAllEvents = useMutation({
        mutationFn: (events) =>
            eventSyncService.syncAllProgramEvents(programId, events),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event-sync-status', programId] });
        }
    });

    /**
     * Delete a synced event
     */
    const deleteEvent = useMutation({
        mutationFn: (syncId) => eventSyncService.deleteSyncedEvent(syncId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event-sync-status', programId] });
        }
    });

    /**
     * Sync event back to program
     */
    const syncToProgram = useMutation({
        mutationFn: (eventId) => eventSyncService.syncEventToProgram(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event-sync-status', programId] });
        }
    });

    return {
        syncStatus,
        syncEvent,
        syncAllEvents,
        deleteEvent,
        syncToProgram,
        updateEventsWithSyncIds: eventSyncService.updateEventsWithSyncIds
    };
}

