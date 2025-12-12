import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook for managing media file dependencies and safe deletion
 */
export function useMediaDependencies() {
  const { t } = useLanguage();

  /**
   * Check if a media file can be safely deleted
   * Returns usage information for cascade decisions
   */
  const checkDependencies = useCallback(async (mediaFileId) => {
    if (!mediaFileId) return { canDelete: true, usageCount: 0, usages: [] };

    try {
      const { data, error } = await supabase.rpc('can_delete_media', {
        p_media_file_id: mediaFileId
      });

      if (error) {
        console.error('Error checking media dependencies:', error);
        return { canDelete: true, usageCount: 0, usages: [], error };
      }

      return {
        canDelete: data.can_delete,
        usageCount: data.usage_count,
        usages: data.usages || []
      };
    } catch (err) {
      console.error('Error in checkDependencies:', err);
      return { canDelete: true, usageCount: 0, usages: [], error: err };
    }
  }, []);

  /**
   * Delete media file with cascade handling
   * @param mediaFileId - UUID of the media file
   * @param cascadeAction - 'nullify' to clear references, 'archive' to soft-delete only
   */
  const deleteWithCascade = useCallback(async (mediaFileId, cascadeAction = 'nullify') => {
    if (!mediaFileId) return { success: false, error: 'No media file ID provided' };

    try {
      const { data, error } = await supabase.rpc('delete_media_with_cascade', {
        p_media_file_id: mediaFileId,
        p_cascade_action: cascadeAction
      });

      if (error) {
        console.error('Error deleting media with cascade:', error);
        return { success: false, error };
      }

      return {
        success: data.success,
        affectedEntities: data.affected_entities,
        action: data.action
      };
    } catch (err) {
      console.error('Error in deleteWithCascade:', err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Register media usage by an entity
   */
  const registerUsage = useCallback(async ({
    mediaFileId,
    entityType,
    entityId,
    fieldName,
    usageType = 'reference',
    isPrimary = false
  }) => {
    if (!mediaFileId || !entityType || !entityId || !fieldName) {
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      const { data, error } = await supabase
        .from('media_usages')
        .upsert({
          media_file_id: mediaFileId,
          entity_type: entityType,
          entity_id: entityId,
          field_name: fieldName,
          usage_type: usageType,
          is_primary: isPrimary
        }, {
          onConflict: 'media_file_id,entity_type,entity_id,field_name'
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering media usage:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error in registerUsage:', err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Remove media usage record
   */
  const removeUsage = useCallback(async ({
    mediaFileId,
    entityType,
    entityId,
    fieldName
  }) => {
    try {
      const { error } = await supabase
        .from('media_usages')
        .delete()
        .match({
          media_file_id: mediaFileId,
          entity_type: entityType,
          entity_id: entityId,
          field_name: fieldName
        });

      if (error) {
        console.error('Error removing media usage:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (err) {
      console.error('Error in removeUsage:', err);
      return { success: false, error: err };
    }
  }, []);

  /**
   * Get all usages for a specific entity
   */
  const getEntityMediaUsages = useCallback(async (entityType, entityId) => {
    try {
      const { data, error } = await supabase
        .from('media_usages')
        .select(`
          *,
          media_files (
            id, original_filename, display_name, public_url, 
            file_type, file_size, mime_type
          )
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) {
        console.error('Error fetching entity media usages:', error);
        return { success: false, data: [], error };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('Error in getEntityMediaUsages:', err);
      return { success: false, data: [], error: err };
    }
  }, []);

  /**
   * Get entity name for display purposes
   */
  const getEntityDisplayName = useCallback((entityType) => {
    const entityNames = {
      challenges: t({ en: 'Challenge', ar: 'تحدي' }),
      solutions: t({ en: 'Solution', ar: 'حل' }),
      pilots: t({ en: 'Pilot', ar: 'تجربة' }),
      programs: t({ en: 'Program', ar: 'برنامج' }),
      events: t({ en: 'Event', ar: 'فعالية' }),
      knowledge_resources: t({ en: 'Knowledge Resource', ar: 'مورد معرفي' }),
      case_studies: t({ en: 'Case Study', ar: 'دراسة حالة' }),
      organizations: t({ en: 'Organization', ar: 'منظمة' }),
      municipalities: t({ en: 'Municipality', ar: 'بلدية' }),
    };
    return entityNames[entityType] || entityType;
  }, [t]);

  return {
    checkDependencies,
    deleteWithCascade,
    registerUsage,
    removeUsage,
    getEntityMediaUsages,
    getEntityDisplayName
  };
}

export default useMediaDependencies;
