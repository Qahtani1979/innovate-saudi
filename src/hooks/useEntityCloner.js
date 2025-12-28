import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const entityTypeToTable = {
    Challenge: 'challenges',
    Pilot: 'pilots',
    Solution: 'solutions',
    Program: 'programs'
};

export function useEntityCloner() {
    const queryClient = useAppQueryClient();

    const cloneEntityMutation = useMutation({
        mutationFn: async ({ entity, entityType, newCode }) => {
            const clonedData = { ...entity };
            delete clonedData.id;
            delete clonedData.created_at;
            delete clonedData.updated_at;
            delete clonedData.created_by;

            if (newCode) {
                clonedData.code = newCode;
            } else {
                clonedData.code = `${entity.code}-COPY`;
            }

            if (clonedData.title_en) {
                clonedData.title_en = `${clonedData.title_en} (Copy)`;
            }
            if (clonedData.title_ar) {
                clonedData.title_ar = `${clonedData.title_ar} (نسخة)`;
            }
            if (clonedData.name_en) {
                clonedData.name_en = `${clonedData.name_en} (Copy)`;
            }

            clonedData.status = 'draft';
            // Specialized logic per type could go here, but keeping generic for now
            if (entityType === 'Pilot') {
                clonedData.stage = 'pre_pilot';
            }
            clonedData.is_published = false;

            const tableName = entityTypeToTable[entityType];
            if (!tableName) throw new Error(`Unknown entity type: ${entityType}`);

            const { data: result, error } = await supabase.from(tableName).insert(clonedData).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: (newEntity, { entityType }) => {
            queryClient.invalidateQueries([entityTypeToTable[entityType]]);
            toast.success('Cloned successfully!');
        },
        onError: (error) => {
            console.error('Clone failed:', error);
            toast.error('Failed to clone entity');
        }
    });

    return { cloneEntityMutation };
}



