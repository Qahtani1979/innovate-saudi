import { useMutation } from '@/hooks/useAppQueryClient';
/**
 * Standardized Archiving Hook
 * Provides unified logic for soft-delete and archiving operations.
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';

/**
 * @typedef {Object} ArchiveOptions
 * @property {string} table - Table name
 * @property {string} entityType - Entity type for audit logging
 * @property {string} [idColumn='id'] - ID column name
 * @property {boolean} [showToast=true] - Whether to show success toast
 */

export function useArchiving() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    /**
     * Soft Delete Entity (is_deleted = true)
     */
    const softDelete = useMutation({
        /** @param {{ id: string, options: ArchiveOptions }} params */
        mutationFn: async ({ id, options }) => {
            const { table, entityType, idColumn = 'id' } = options;

            const { error } = await supabase
                .from(table)
                .update({
                    is_deleted: true,
                    deleted_by: user?.email,
                    deleted_at: new Date().toISOString()
                })
                .eq(idColumn, id);

            if (error) throw error;

            await logCrudOperation('soft_delete', entityType, id, { id }, { is_deleted: true });
            return { id, table, entityType };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [data.table] });
            queryClient.invalidateQueries({ queryKey: [data.entityType + 's'] }); // specific plural convention guess
            toast.success('Item deleted successfully'); // Generic message, can be customized
        },
        onError: (error) => {
            console.error('Soft delete failed:', error);
            toast.error('Failed to delete item');
        }
    });

    /**
     * Archive Entity (status = 'archived', is_archived = true)
     */
    const archive = useMutation({
        /** @param {{ id: string, options: ArchiveOptions }} params */
        mutationFn: async ({ id, options }) => {
            const { table, entityType, idColumn = 'id' } = options;

            const { error } = await supabase
                .from(table)
                .update({
                    status: 'archived',
                    is_archived: true,
                    archived_by: user?.email,
                    archived_at: new Date().toISOString()
                })
                .eq(idColumn, id);

            if (error) throw error;

            await logCrudOperation('archive', entityType, id, { id }, { status: 'archived' });
            return { id, table, entityType };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [data.table] });
            queryClient.invalidateQueries({ queryKey: [data.entityType + 's'] });
            toast.success('Item archived successfully');
        },
        onError: (error) => {
            console.error('Archive failed:', error);
            toast.error('Failed to archive item');
        }
    });

    /**
     * Restore Entity (is_deleted = false, is_archived = false)
     */
    const restore = useMutation({
        /** @param {{ id: string, options: ArchiveOptions }} params */
        mutationFn: async ({ id, options }) => {
            const { table, entityType, idColumn = 'id' } = options;

            const { error } = await supabase
                .from(table)
                .update({
                    is_deleted: false,
                    is_archived: false,
                    status: 'active', // Reset to active? Or previous status? 
                    // Safest is to just remove deleted/archived flags, but status might need manual reset.
                    // For now, let's assume 'active' is safe for restore, or keep existing status if just undeleting.
                    // But if it was archived, status was 'archived'.
                    // Let's set status to 'active' for restoration effectively.
                    updated_at: new Date().toISOString()
                })
                .eq(idColumn, id);

            if (error) throw error;

            await logCrudOperation('restore', entityType, id, { id }, { is_deleted: false, is_archived: false });
            return { id, table, entityType };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [data.table] });
            queryClient.invalidateQueries({ queryKey: [data.entityType + 's'] });
            toast.success('Item restored successfully');
        }
    });

    return {
        softDelete,
        archive,
        restore
    };
}



