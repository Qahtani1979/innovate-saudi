import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useOrganizationActivity(organizationId) {
    return useQuery({
        queryKey: ['organization-activity', organizationId],
        queryFn: async () => {
            if (!organizationId) return null;

            // Fetch organization details
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', organizationId)
                .single();

            if (orgError) throw orgError;

            // Prepare promises for related data
            // Note: We are fetching lists filtering on the server side as much as possible
            // Challenges where organization_id matches or created_by matches (if available)
            // We prioritize organization_id as it's more stable
            let challengesQuery = supabase
                .from('challenges')
                .select('*');

            if (org['created_by']) { // Bracket notation to bypass potential type mismatch
                challengesQuery = challengesQuery.or(`organization_id.eq.${organizationId},created_by.eq.${org['created_by']}`);
            } else {
                challengesQuery = challengesQuery.eq('organization_id', organizationId);
            }
            const challengesPromise = challengesQuery;

            // Solutions where provider_id is this org
            const solutionsPromise = supabase
                .from('solutions')
                .select('*')
                .eq('provider_id', organizationId);

            // Programs where operator is this org
            const programsPromise = supabase
                .from('programs')
                .select('*')
                .eq('operator_organization_id', organizationId);

            // R&D Projects where institution matches
            const rdPromise = supabase
                .from('rd_projects')
                .select('*')
                .eq('institution_en', org.name_en);

            // Pilots where team contains organization
            // This is harder to filter server-side without complex operators if 'team' is JSONB
            // We'll fetch all pilots and filter client side for now as in original code,
            // or try a better filter if possible.
            // Original: p.team?.some(t => t.organization === org[0]?.name_en)
            const pilotsPromise = supabase
                .from('pilots')
                .select('*');

            const [
                { data: challenges },
                { data: solutions },
                { data: programs },
                { data: rdProjects },
                { data: allPilots }
            ] = await Promise.all([
                challengesPromise,
                solutionsPromise,
                programsPromise,
                rdPromise,
                pilotsPromise
            ]);

            const pilots = (allPilots || []).filter(p =>
                Array.isArray(p.team) && p.team.some(t => t && typeof t === 'object' && t.organization === org.name_en)
            );

            return {
                organization: org,
                challenges: challenges || [],
                solutions: solutions || [],
                programs: programs || [],
                rdProjects: rdProjects || [],
                pilots: pilots || []
            };
        },
        enabled: !!organizationId
    });
}
