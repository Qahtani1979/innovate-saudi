import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';
import { useEmailTrigger } from './useEmailTrigger';

/**
 * Hook for scaling plan mutations
 */
export function useScalingMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation, logStatusChange } = useAuditLogger();
    const { triggerEmail } = useEmailTrigger();

    const createScalingPlan = useMutation({
        mutationFn: async (data) => {
            const planData = {
                ...data,
                created_by: user?.email,
                created_at: new Date().toISOString(),
                status: data.status || 'draft',
            };

            const { data: plan, error } = await supabase
                .from('scaling_plans')
                .insert(planData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'scaling_plan', plan.id, null, planData);

            return plan;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['scaling-plans']);
            toast.success(t({ en: 'Scaling plan created', ar: 'تم إنشاء خطة التوسع' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create plan', ar: 'فشل إنشاء الخطة' }));
            console.error('Create scaling plan error:', error);
        },
    });

    const updateScalingPlan = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentPlan } = await supabase
                .from('scaling_plans')
                .select('*')
                .eq('id', id)
                .single();

            const { data: plan, error } = await supabase
                .from('scaling_plans')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'scaling_plan', id, currentPlan, data);

            return plan;
        },
        onSuccess: (plan) => {
            queryClient.invalidateQueries(['scaling-plans']);
            queryClient.invalidateQueries(['scaling-plan', plan.id]);
            toast.success(t({ en: 'Scaling plan updated', ar: 'تم تحديث خطة التوسع' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update plan', ar: 'فشل تحديث الخطة' }));
            console.error('Update scaling plan error:', error);
        },
    });

    const deleteScalingPlan = useMutation({
        mutationFn: async (id) => {
            const { data: currentPlan } = await supabase
                .from('scaling_plans')
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('scaling_plans')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.DELETE, 'scaling_plan', id, currentPlan, { deleted: true });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['scaling-plans']);
            toast.success(t({ en: 'Scaling plan deleted', ar: 'تم حذف خطة التوسع' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to delete plan', ar: 'فشل حذف الخطة' }));
            console.error('Delete scaling plan error:', error);
        },
    });

    const approveScalingPlan = useMutation({
        mutationFn: async (id) => {
            const { data: currentPlan } = await supabase
                .from('scaling_plans')
                .select('*')
                .eq('id', id)
                .single();

            const { data: plan, error } = await supabase
                .from('scaling_plans')
                .update({
                    status: 'approved',
                    approved_by: user?.email,
                    approved_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logStatusChange('scaling_plan', id, currentPlan.status, 'approved', {
                approved_by: user?.email,
            });

            // Send approval email
            await triggerEmail('scaling_plan.approved', {
                entity_type: 'scaling_plan',
                entity_id: id,
                recipient_email: plan.created_by,
                variables: {
                    plan_name: plan.name,
                    approved_by: user?.email,
                },
            }).catch(err => console.error('Email trigger failed:', err));

            return plan;
        },
        onSuccess: (plan) => {
            queryClient.invalidateQueries(['scaling-plans']);
            queryClient.invalidateQueries(['scaling-plan', plan.id]);
            toast.success(t({ en: 'Scaling plan approved', ar: 'تمت الموافقة على خطة التوسع' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to approve plan', ar: 'فشلت الموافقة على الخطة' }));
            console.error('Approve scaling plan error:', error);
        },
    });

    const executeScalingPlan = useMutation({
        mutationFn: async (id) => {
            const { data: currentPlan } = await supabase
                .from('scaling_plans')
                .select('*')
                .eq('id', id)
                .single();

            const { data: plan, error } = await supabase
                .from('scaling_plans')
                .update({
                    status: 'in_progress',
                    execution_started_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logStatusChange('scaling_plan', id, currentPlan.status, 'in_progress', {
                started_by: user?.email,
            });

            return plan;
        },
        onSuccess: (plan) => {
            queryClient.invalidateQueries(['scaling-plans']);
            queryClient.invalidateQueries(['scaling-plan', plan.id]);
            toast.success(t({ en: 'Scaling plan execution started', ar: 'بدأ تنفيذ خطة التوسع' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to execute plan', ar: 'فشل تنفيذ الخطة' }));
            console.error('Execute scaling plan error:', error);
        },
    });

    const institutionalizeScalingPlan = useMutation({
        mutationFn: async ({ scalingPlanId, programData }) => {
            // Create program
            const { data: program, error: programError } = await supabase
                .from('programs')
                .insert([programData])
                .select()
                .single();

            if (programError) throw programError;

            // Update scaling plan
            const { error: scalingError } = await supabase
                .from('scaling_plans')
                .update({
                    institutionalization_program_id: program.id,
                    institutionalization_date: new Date().toISOString()
                })
                .eq('id', scalingPlanId);

            if (scalingError) throw scalingError;

            // Log system activity
            const { error: activityError } = await supabase
                .from('system_activities')
                .insert([{
                    entity_type: 'scaling_plan',
                    entity_id: scalingPlanId,
                    action: 'institutionalized_as_program',
                    description: `Scaling knowledge institutionalized: ${program.name_en}`
                }]);

            if (activityError) throw activityError;

            return program;
        },
        onSuccess: (program) => {
            queryClient.invalidateQueries({ queryKey: ['scaling-plans'] });
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            toast.success(t({ en: 'Training program created', ar: 'تم إنشاء البرنامج التدريبي' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create program', ar: 'فشل إنشاء البرنامج' }));
            console.error('Institutionalize scaling plan error:', error);
        }
    });

    return {
        createScalingPlan,
        updateScalingPlan,
        deleteScalingPlan,
        approveScalingPlan,
        executeScalingPlan,
        institutionalizeScalingPlan,
    };
}

export default useScalingMutations;

