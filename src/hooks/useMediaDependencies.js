/* @refresh reset */
/* Cache bust: v2 */
import { supabase } from '@/integrations/supabase/client';

/**
 * Utilities for managing media file dependencies and safe deletion.
 *
 * NOTE: This module intentionally does NOT use React hooks to avoid
 * invalid hook call issues. Pass a translation function `t` in from
 * your React components instead.
 */
export function useMediaDependencies(t) {
  const translate = (translations) => {
    if (!t) {
      // Fallback: try English string or first available
      return typeof translations === 'string'
        ? translations
        : translations?.en ?? Object.values(translations ?? {})[0] ?? '';
    }
    return t(translations);
  };

  /**
   * Check if a media file can be safely deleted.
   * Returns usage information for cascade decisions.
   */
  const checkDependencies = async (mediaFileId) => {
    if (!mediaFileId) return { canDelete: true, usageCount: 0, usages: [] };

    try {
      const { data, error } = await supabase.rpc('can_delete_media', {
        p_media_file_id: mediaFileId,
      });

      if (error) {
        console.error('Error checking media dependencies:', error);
        return { canDelete: true, usageCount: 0, usages: [], error };
      }

      return {
        canDelete: data?.can_delete ?? true,
        usageCount: data?.usage_count ?? 0,
        usages: data?.usages || [],
      };
    } catch (err) {
      console.error('Error in checkDependencies:', err);
      return { canDelete: true, usageCount: 0, usages: [], error: err };
    }
  };

  /**
   * Delete media file with cascade handling
   * @param mediaFileId - UUID of the media file
   * @param cascadeAction - 'nullify' to clear references, 'archive' to soft-delete only
   */
  const deleteWithCascade = async (mediaFileId, cascadeAction = 'nullify') => {
    if (!mediaFileId) return { success: false, error: 'No media file ID provided' };

    try {
      const { data, error } = await supabase.rpc('delete_media_with_cascade', {
        p_media_file_id: mediaFileId,
        p_cascade_action: cascadeAction,
      });

      if (error) {
        console.error('Error deleting media with cascade:', error);
        return { success: false, error };
      }

      return {
        success: data?.success ?? true,
        affectedEntities: data?.affected_entities ?? [],
        action: data?.action ?? cascadeAction,
      };
    } catch (err) {
      console.error('Error in deleteWithCascade:', err);
      return { success: false, error: err };
    }
  };

  /**
   * Register media usage by an entity
   */
  const registerUsage = async ({
    mediaFileId,
    entityType,
    entityId,
    fieldName,
    usageType = 'reference',
    isPrimary = false,
  }) => {
    if (!mediaFileId || !entityType || !entityId || !fieldName) {
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      const { data, error } = await supabase
        .from('media_usages')
        .upsert(
          {
            media_file_id: mediaFileId,
            entity_type: entityType,
            entity_id: entityId,
            field_name: fieldName,
            usage_type: usageType,
            is_primary: isPrimary,
          },
          {
            onConflict: 'media_file_id,entity_type,entity_id,field_name',
          },
        )
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
  };

  /**
   * Remove media usage record
   */
  const removeUsage = async ({ mediaFileId, entityType, entityId, fieldName }) => {
    try {
      const { error } = await supabase
        .from('media_usages')
        .delete()
        .match({
          media_file_id: mediaFileId,
          entity_type: entityType,
          entity_id: entityId,
          field_name: fieldName,
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
  };

  /**
   * Get all usages for a specific entity
   */
  const getEntityMediaUsages = async (entityType, entityId) => {
    try {
      const { data, error } = await supabase
        .from('media_usages')
        .select(
          `
          *,
          media_files (
            id, original_filename, display_name, public_url,
            file_type, file_size, mime_type
          )
        `,
        )
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
  };

  /**
   * Get entity name for display purposes
   */
  const getEntityDisplayName = (entityType) => {
    const entityNames = {
      challenges: translate({ en: 'Challenge', ar: 'تحدي' }),
      solutions: translate({ en: 'Solution', ar: 'حل' }),
      pilots: translate({ en: 'Pilot', ar: 'تجربة' }),
      programs: translate({ en: 'Program', ar: 'برنامج' }),
      events: translate({ en: 'Event', ar: 'فعالية' }),
      knowledge_resources: translate({ en: 'Knowledge Resource', ar: 'مورد معرفي' }),
      case_studies: translate({ en: 'Case Study', ar: 'دراسة حالة' }),
      organizations: translate({ en: 'Organization', ar: 'منظمة' }),
      municipalities: translate({ en: 'Municipality', ar: 'بلدية' }),
    };
    return entityNames[entityType] || entityType;
  };

  return {
    checkDependencies,
    deleteWithCascade,
    registerUsage,
    removeUsage,
    getEntityMediaUsages,
    getEntityDisplayName,
  };
}

export default useMediaDependencies;
