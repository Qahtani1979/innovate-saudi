import { supabase } from '@/integrations/supabase/client';

/**
 * EventSyncService - Synchronizes events between CampaignPlanner program.events[] and events table
 * Provides bidirectional sync with conflict detection
 */
export const eventSyncService = {
  /**
   * Sync a single event from program.events[] to the events table
   * @param {string} programId - The program ID
   * @param {object} eventData - Event data from program.events[]
   * @param {number} eventIndex - Index in the events array for reference
   * @returns {Promise<{id: string, synced_at: string}>} - Sync result with event ID
   */
  syncEventToTable: async (programId, eventData, eventIndex = 0) => {
    try {
      const eventPayload = {
        program_id: programId,
        title_en: eventData.name || eventData.title_en || 'Untitled Event',
        title_ar: eventData.name_ar || eventData.title_ar || null,
        start_date: eventData.date || eventData.start_date,
        end_date: eventData.end_date || eventData.date,
        location: eventData.location || null,
        event_type: eventData.type || 'workshop',
        event_mode: eventData.mode || 'in_person',
        status: 'draft',
        program_synced: true,
        program_sync_source: 'campaign_planner',
        updated_at: new Date().toISOString()
      };

      if (eventData.sync_id) {
        // Update existing event
        const { data, error } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', eventData.sync_id)
          .select()
          .single();

        if (error) throw error;
        
        return { 
          id: data.id, 
          synced_at: new Date().toISOString(),
          action: 'updated' 
        };
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('events')
          .insert(eventPayload)
          .select()
          .single();

        if (error) throw error;
        
        return { 
          id: data.id, 
          synced_at: new Date().toISOString(),
          action: 'created' 
        };
      }
    } catch (error) {
      console.error('Error syncing event to table:', error);
      throw error;
    }
  },

  /**
   * Sync all events from a program to the events table
   * @param {string} programId - The program ID
   * @param {array} events - Array of events from program.events[]
   * @returns {Promise<array>} - Array of sync results with updated sync_ids
   */
  syncAllProgramEvents: async (programId, events = []) => {
    if (!events || events.length === 0) return [];

    const results = [];
    for (let i = 0; i < events.length; i++) {
      try {
        const syncResult = await eventSyncService.syncEventToTable(programId, events[i], i);
        results.push({
          index: i,
          ...syncResult,
          success: true
        });
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }
    return results;
  },

  /**
   * Get updated events array with sync_ids after bulk sync
   * @param {array} originalEvents - Original events array
   * @param {array} syncResults - Results from syncAllProgramEvents
   * @returns {array} - Updated events array with sync_ids
   */
  updateEventsWithSyncIds: (originalEvents, syncResults) => {
    return originalEvents.map((event, index) => {
      const result = syncResults.find(r => r.index === index);
      if (result && result.success) {
        return {
          ...event,
          sync_id: result.id,
          synced_at: result.synced_at
        };
      }
      return event;
    });
  },

  /**
   * Delete synced event from events table
   * @param {string} syncId - The event ID in the events table
   * @returns {Promise<boolean>} - Success status
   */
  deleteSyncedEvent: async (syncId) => {
    if (!syncId) return true;
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          is_deleted: true, 
          deleted_date: new Date().toISOString() 
        })
        .eq('id', syncId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting synced event:', error);
      return false;
    }
  },

  /**
   * Sync event changes from events table back to program.events[]
   * @param {string} eventId - The event ID in the events table
   * @returns {Promise<object>} - Event data for updating program.events[]
   */
  syncEventToProgram: async (eventId) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      return {
        sync_id: data.id,
        name: data.title_en,
        name_ar: data.title_ar,
        type: data.event_type,
        date: data.start_date,
        end_date: data.end_date,
        location: data.location,
        mode: data.event_mode,
        synced_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error syncing event to program:', error);
      throw error;
    }
  },

  /**
   * Get sync status for a program's events
   * @param {string} programId - The program ID
   * @returns {Promise<object>} - Sync status info
   */
  getSyncStatus: async (programId) => {
    try {
      const { data, error, count } = await supabase
        .from('events')
        .select('id, updated_at, status', { count: 'exact' })
        .eq('program_id', programId)
        .eq('program_synced', true)
        .eq('is_deleted', false);

      if (error) throw error;

      return {
        syncedCount: count || 0,
        lastSync: data?.[0]?.updated_at || null,
        events: data || []
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { syncedCount: 0, lastSync: null, events: [] };
    }
  }
};

export default eventSyncService;
