import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';

/**
 * Hook for fetching regulatory exemptions.
 */
export function useRegulatoryExemptions(options = {}) {
    const { sandboxId, status, category, limit = 100 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['regulatory-exemptions', { sandboxId, status, category, limit }],
        queryFn: async () => {
            let query = supabase
                .from('regulatory_exemptions')
                .select(`
          *,
          sandbox:sandboxes(id, name_en, name_ar, code)
        `)
                .order('created_at', { ascending: false })
                .limit(limit);

            query = applyVisibilityRules(query, 'regulatory_exemption');

            if (sandboxId) query = query.eq('sandbox_id', sandboxId);
            if (options.sandboxIds && options.sandboxIds.length > 0) query = query.in('sandbox_id', options.sandboxIds);
            if (options.applicationId) query = query.eq('sandbox_application_id', options.applicationId);
            if (status) query = query.eq('status', status);
            if (category) query = query.eq('category', category);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook for fetching single regulatory exemption
 */
export function useRegulatoryExemption(id) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['regulatory-exemption', id],
        queryFn: async () => {
            let query = supabase
                .from('regulatory_exemptions')
                .select('*')
                .eq('id', id)
                .single();

            query = applyVisibilityRules(query, 'regulatory_exemption');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

/**
 * Hook for fetching exemption audit logs
 */
export function useExemptionAuditLogs(exemptionId) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['exemption-audit', exemptionId],
        queryFn: async () => {
            let query = supabase
                .from('exemption_audit_logs')
                .select('*')
                .eq('exemption_id', exemptionId)
                .order('action_date', { ascending: false });

            query = applyVisibilityRules(query, 'exemption_audit_log');

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!exemptionId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Hook for fetching exemption audit logs for multiple exemptions
 */
export function useExemptionAuditLogsList(exemptionIds = []) {
    return useQuery({
        queryKey: ['exemption-audit-list', exemptionIds],
        queryFn: async () => {
            if (!exemptionIds.length) return [];

            const { data, error } = await supabase
                .from('exemption_audit_logs')
                .select('*')
                .in('exemption_id', exemptionIds)
                .order('action_date', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data || [];
        },
        enabled: exemptionIds.length > 0,
    });
}

/**
 * Hook for regulatory exemption mutations.
 */
export function useRegulatoryExemptionMutations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    const updateExemption = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentExemption } = await supabase
                .from('regulatory_exemptions')
                .select('*')
                .eq('id', id)
                .single();

            const { data: result, error } = await supabase
                .from('regulatory_exemptions')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'regulatory_exemption', id, currentExemption, data);

            return result;
        },
        onSuccess: (exemption) => {
            queryClient.invalidateQueries({ queryKey: ['regulatory-exemptions'] });
            queryClient.invalidateQueries({ queryKey: ['regulatory-exemption', exemption.id] });
            toast.success(t({ en: 'Exemption updated successfully', ar: 'تم تحديث الإعفاء بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update exemption', ar: 'فشل تحديث الإعفاء' }));
            console.error('Update exemption error:', error);
        }
    });

    return {
        updateExemption,
        isUpdating: updateExemption.isPending
    };
}
