import { useState } from 'react';
import { useTaxonomyMutations } from './useTaxonomyMutations';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useTaxonomyPublisher() {
    const [isPublishing, setIsPublishing] = useState(false);
    const [progress, setProgress] = useState(0);
    const queryClient = useQueryClient();
    const { createSector, createSubsector, createService } = useTaxonomyMutations();

    const publish = async (sectors, subsectors, services, onComplete) => {
        setIsPublishing(true);
        setProgress(0);
        const totalItems = sectors.length + subsectors.length + services.length;
        let completed = 0;

        const updateProgress = () => {
            completed++;
            setProgress(Math.round((completed / totalItems) * 100));
        };

        try {
            // 1. Create Sectors
            const createdSectors = [];
            for (const s of sectors) {
                const result = await createSector.mutateAsync({
                    name_en: s.name_en,
                    name_ar: s.name_ar,
                    code: s.code,
                    description_en: s.description_en,
                    description_ar: s.description_ar
                }, { onSuccess: () => { } }); // Suppress individual toasts/invalidation for speed
                createdSectors.push(result);
                updateProgress();
            }

            // 2. Create Subsectors
            const createdSubsectors = [];
            for (const ss of subsectors) {
                const sector = createdSectors.find(s => s.code === ss.sector_code);
                if (sector) {
                    const result = await createSubsector.mutateAsync({
                        sector_id: sector.id,
                        name_en: ss.name_en,
                        name_ar: ss.name_ar,
                        code: ss.code
                    }, { onSuccess: () => { } });
                    createdSubsectors.push(result);
                }
                updateProgress();
            }

            // 3. Create Services
            for (const srv of services) {
                const subsector = createdSubsectors.find(ss => ss.code === srv.subsector_code);
                if (subsector) {
                    await createService.mutateAsync({
                        subsector_id: subsector.id,
                        name_en: srv.name_en,
                        name_ar: srv.name_ar,
                        service_code: srv.service_code,
                        description_en: srv.description_en,
                        description_ar: srv.description_ar,
                        service_type: srv.service_type || 'administrative',
                        is_digital: srv.is_digital || false,
                        digitalization_priority: srv.digitalization_priority || 'medium'
                    }, { onSuccess: () => { } });
                }
                updateProgress();
            }

            // Final Invalidation
            queryClient.invalidateQueries(['sectors']);
            queryClient.invalidateQueries(['subsectors']);
            queryClient.invalidateQueries(['services']);

            toast.success('Taxonomy published successfully');
            if (onComplete) onComplete();

        } catch (error) {
            console.error('Publishing failed:', error);
            toast.error('Failed to publish taxonomy');
        } finally {
            setIsPublishing(false);
            setProgress(0);
        }
    };

    return {
        publish,
        isPublishing,
        progress
    };
}
