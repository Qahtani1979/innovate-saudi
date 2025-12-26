import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook for all citizen idea mutations
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useCitizenIdeaMutations() {
    const queryClient = useAppQueryClient();
    const { t, language } = useLanguage();

    // 1. Core CRUD Mutations

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, any>} */
    const submitIdea = useMutation({
        /** @param {any} newIdea */
        mutationFn: async (newIdea) => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .insert(newIdea)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'Idea submitted successfully', ar: 'تم تقديم الفكرة بنجاح' }));
        },
        onError: (error) => {
            console.error('Submit error:', error);
            toast.error(t({ en: 'Failed to submit idea', ar: 'فشل تقديم الفكرة' }));
        }
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, {id: string, updates: any}>} */
    const updateIdea = useMutation({
        /** @param {{id: string, updates: any}} params */
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            queryClient.invalidateQueries({ queryKey: ['citizen-idea'] });
            toast.success(t({ en: 'Idea updated successfully', ar: 'تم تحديث الفكرة بنجاح' }));
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error(t({ en: 'Failed to update idea', ar: 'فشل تحديث الفكرة' }));
        }
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, {ids: string[], updates: any}>} */
    const bulkUpdateIdeas = useMutation({
        /** @param {{ids: string[], updates: any}} params */
        mutationFn: async ({ ids, updates }) => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .update(updates)
                .in('id', ids)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'Bulk update successful', ar: 'تم التحديث الجماعي بنجاح' }));
        },
        onError: (error) => {
            console.error('Bulk update error:', error);
            toast.error(t({ en: 'Failed to update ideas', ar: 'فشل تحديث الأفكار' }));
        }
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, {primaryId: string, duplicateIds: string[], totalVotes: number, mergedDescription: string}>} */
    const mergeIdeas = useMutation({
        /** @param {{primaryId: string, duplicateIds: string[], totalVotes: number, mergedDescription: string}} params */
        mutationFn: async ({ primaryId, duplicateIds, totalVotes, mergedDescription }) => {
            // 1. Update primary idea
            const { error: updateError } = await supabase
                .from('citizen_ideas')
                .update({
                    vote_count: totalVotes,
                    description: mergedDescription
                })
                .eq('id', primaryId);

            if (updateError) throw updateError;

            // 2. Mark duplicates as merged
            const { error: duplicateError } = await supabase
                .from('citizen_ideas')
                .update({
                    status: 'duplicate',
                    review_notes: `Merged into idea ${primaryId}`
                })
                .in('id', duplicateIds);

            if (duplicateError) throw duplicateError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'Ideas merged successfully', ar: 'تم دمج الأفكار بنجاح' }));
        },
        onError: (error) => {
            console.error('Merge error:', error);
            toast.error(t({ en: 'Failed to merge ideas', ar: 'فشل دمج الأفكار' }));
        }
    });

    // 2. Voting Mutations

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, string>} */
    const voteOnIdea = useMutation({
        /** @param {string} ideaId */
        mutationFn: async (ideaId) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required to vote");

            const { data: existingVote } = await supabase
                .from('citizen_votes')
                .select('id')
                .eq('entity_id', ideaId)
                .eq('entity_type', 'idea')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingVote) {
                throw new Error("You have already voted on this idea.");
            }

            const { error: voteError } = await supabase
                .from('citizen_votes')
                .insert({
                    entity_id: ideaId,
                    entity_type: 'idea',
                    user_id: user.id,
                    vote_type: 'upvote'
                });

            if (voteError) throw voteError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            queryClient.invalidateQueries({ queryKey: ['citizen-idea'] });
            toast.success(t({ en: 'Vote recorded!', ar: 'تم تسجيل الصوت!' }));
        },
        onError: (error) => {
            toast.error(error.message || t({ en: 'Failed to vote', ar: 'فشل التصويت' }));
        }
    });

    // 3. Conversion Mutations

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, {idea: any, pilotData: any, targetData: any}>} */
    const convertToPilot = useMutation({
        /** @param {{idea: any, pilotData: any, targetData: any}} params */
        mutationFn: async ({ idea, pilotData, targetData }) => {
            const { data: pilot, error: pilotError } = await supabase
                .from('pilots')
                .insert(targetData)
                .select()
                .single();

            if (pilotError) throw pilotError;

            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({
                    status: 'converted',
                    is_published: false,
                    converted_pilot_id: pilot.id
                })
                .eq('id', idea.id);

            if (ideaError) throw ideaError;

            // Trigger notifications and embeddings (background)
            supabase.functions.invoke('generateEmbeddings', { body: { entity_name: 'Pilot', mode: 'id', entity_id: pilot.id } }).catch(() => { });
            supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: 'pilot.created',
                    recipient_email: idea.user_email || idea.submitter_email,
                    entity_id: pilot.id,
                    variables: { pilotTitle: pilotData.title_en || pilotData.title_ar, pilotCode: targetData.code },
                    language: language,
                    triggered_by: 'system'
                }
            }).catch(() => { });

            return pilot;
        }
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, {idea: any, proposalData: any}>} */
    const convertToProposal = useMutation({
        /** @param {{idea: any, proposalData: any}} params */
        mutationFn: async ({ idea, proposalData }) => {
            const { data: proposal, error: proposalError } = await supabase
                .from('innovation_proposals')
                .insert(proposalData)
                .select()
                .single();

            if (proposalError) throw proposalError;

            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({ status: 'converted-to-proposal' })
                .eq('id', idea.id);

            if (ideaError) throw ideaError;

            return proposal;
        }
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, {idea: any, rdData: any}>} */
    const convertToRD = useMutation({
        /** @param {{idea: any, rdData: any}} params */
        mutationFn: async ({ idea, rdData }) => {
            const { data: rdProject, error: rdError } = await supabase
                .from('rd_projects')
                .insert({
                    ...rdData,
                    code: `RD-IDEA-${Date.now()}`,
                    status: 'proposal',
                    citizen_origin_idea_id: idea.id
                })
                .select()
                .single();

            if (rdError) throw rdError;

            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({
                    status: 'converted_to_rd',
                    converted_rd_id: rdProject.id
                })
                .eq('id', idea.id);

            if (ideaError) throw ideaError;

            return rdProject;
        }
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, {idea: any, solutionData: any}>} */
    const convertToSolution = useMutation({
        /** @param {{idea: any, solutionData: any}} params */
        mutationFn: async ({ idea, solutionData }) => {
            const { data: solution, error: solError } = await supabase
                .from('solutions')
                .insert({
                    ...solutionData,
                    source_idea_id: idea.id,
                    status: 'published'
                })
                .select()
                .single();

            if (solError) throw solError;

            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({
                    status: 'converted_to_solution',
                    converted_solution_id: solution.id
                })
                .eq('id', idea.id);

            if (ideaError) throw ideaError;

            return solution;
        }
    });

    // 4. Utility Actions

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, any>} */
    const triggerNotification = useMutation({
        /** @param {any} payload */
        mutationFn: async (payload) => {
            const { data, error } = await supabase.functions.invoke('autoNotificationTriggers', { body: payload });
            if (error) throw error;
            return data;
        }
    });

    /** @type {import('@tanstack/react-query').UseMutationResult<any, any, {embedding: number[], limit?: number, threshold?: number}>} */
    const semanticSearch = useMutation({
        /** @param {{embedding: number[], limit?: number, threshold?: number}} params */
        mutationFn: async ({ embedding, limit = 5, threshold = 0.75 }) => {
            const { data, error } = await supabase.functions.invoke('semanticSearch', {
                body: { entity_name: 'CitizenIdea', query_embedding: embedding, top_k: limit, threshold }
            });
            if (error) throw error;
            return data;
        }
    });

    return {
        submitIdea,
        updateIdea,
        bulkUpdateIdeas,
        mergeIdeas,
        voteOnIdea,
        convertToPilot,
        convertToProposal,
        convertToRD,
        convertToSolution,
        triggerNotification,
        semanticSearch,
        isPending: submitIdea.isPending || updateIdea.isPending || bulkUpdateIdeas.isPending || mergeIdeas.isPending || voteOnIdea.isPending
    };
}

/**
 * Hook for generic idea conversion (e.g., to challenges)
 */
export function useIdeaConversion() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: async ({ ideaId, targetTable, targetData, statusUpdate }) => {
            // 1. Insert into target table
            const { data: targetRecord, error: targetError } = await supabase
                .from(targetTable)
                .insert(targetData)
                .select()
                .single();

            if (targetError) throw targetError;

            // 2. Update status of source idea
            const updateField = targetTable === 'challenges' ? 'converted_challenge_id' :
                targetTable === 'solutions' ? 'converted_solution_id' :
                    `converted_${targetTable.slice(0, -1)}_id`;

            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({
                    status: statusUpdate,
                    [updateField]: targetRecord.id
                })
                .eq('id', ideaId);

            if (ideaError) throw ideaError;

            return targetRecord;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'Successfully converted idea!', ar: 'تم تحويل الفكرة بنجاح!' }));
        },
        onError: (error) => {
            console.error('Conversion error:', error);
            toast.error(t({ en: 'Failed to convert idea', ar: 'فشل تحويل الفكرة' }));
        }
    });
}

