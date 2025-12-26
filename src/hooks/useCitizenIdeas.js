import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

/**
 * Hook for managing citizen ideas
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useCitizenIdeas(options = {}) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const { municipalityId, status = 'all', limit = 1000, citizenEmail } = options;

    const ideas = useQuery({
        queryKey: ['citizen-ideas', { municipalityId, status, limit, citizenEmail }],
        queryFn: async () => {
            let query = supabase
                .from('citizen_ideas')
                .select('*')
                .order('created_at', { ascending: false });

            if (municipalityId) {
                query = query.eq('municipality_id', municipalityId);
            }

            if (citizenEmail) {
                // @ts-ignore - Type instantiation deep
                query = query.eq('citizen_email', citizenEmail);
            }

            if (status !== 'all') {
                query = query.eq('status', status);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, {id: string, updates: any}>}
     */
    const updateIdea = useMutation({
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
            toast.success(t({ en: 'Idea updated successfully', ar: 'تم تحديث الفكرة بنجاح' }));
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error(t({ en: 'Failed to update idea', ar: 'فشل تحديث الفكرة' }));
        }
    });

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, any>}
     */
    const submitIdea = useMutation({
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

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, {ids: string[], updates: any}>}
     */
    const bulkUpdateIdeas = useMutation({
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

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, {primaryId: string, duplicateIds: string[], totalVotes: number, mergedDescription: string}>}
     */
    const mergeIdeas = useMutation({
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

    return {
        ideas,
        updateIdea,
        submitIdea,
        bulkUpdateIdeas,
        mergeIdeas
    };
}

/**
 * Hook for fetching a single citizen idea
 */
export function useSingleCitizenIdea(id) {
    return useQuery({
        queryKey: ['citizen-idea', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

/**
 * Hook for voting on a citizen idea
 */
export function useVoteOnIdea() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, string>}
     */
    return useMutation({
        /** @param {string} ideaId */
        mutationFn: async (ideaId) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required to vote");

            // 1. Check if already voted
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

            // 2. Insert vote
            const { error: voteError } = await supabase
                .from('citizen_votes')
                .insert({
                    entity_id: ideaId,
                    entity_type: 'idea',
                    user_id: user.id,
                    vote_type: 'upvote'
                });

            if (voteError) throw voteError;

            // 3. Update vote count on the idea (optional, depends if there's a trigger)
            // If the DB has a trigger, we don't need this. Assuming trigger exists.
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
}

/**
 * Hook for fetching user's own ideas
 */
export function useMyCitizenIdeas(userId) {
    return useQuery({
        queryKey: ['my-citizen-ideas', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!userId
    });
}

/**
 * Hook for Idea conversion to other entities
 */
export function useIdeaConversion() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, {ideaId: string, targetTable: string, targetData: any, statusUpdate: any}>}
     */
    return useMutation({
        /** @param {{ideaId: string, targetTable: string, targetData: any, statusUpdate: any}} params */
        mutationFn: async (params) => {
            const { ideaId, targetTable, targetData, statusUpdate } = params;
            // 1. Create target entity
            const { data: entity, error: entityError } = await supabase
                .from(targetTable)
                .insert(targetData)
                .select()
                .single();

            if (entityError) throw entityError;

            // 2. Update Idea status and link
            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({
                    ...statusUpdate,
                    [`converted_${targetTable.replace(/s$/, '')}_id`]: entity.id
                })
                .eq('id', ideaId);

            if (ideaError) throw ideaError;

            // 3. Trigger embedding generation if applicable
            await supabase.functions.invoke('generateEmbeddings', {
                body: { entity_name: targetTable.replace(/s$/, '').charAt(0).toUpperCase() + targetTable.replace(/s$/, '').slice(1), mode: 'id', entity_id: entity.id }
            }).catch(e => console.error('Embedding error:', e));

            return entity;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'Successfully converted idea', ar: 'تم تحويل الفكرة بنجاح' }));
        },
        onError: (error) => {
            console.error('Conversion error:', error);
            toast.error(t({ en: 'Conversion failed', ar: 'فشل التحويل' }));
        }
    });
}

/**
 * Specialized hook for converting an Idea to a Pilot
 * Encapsulates all side effects (notifications, status updates)
 */
export function useConvertIdeaToPilot() {
    const queryClient = useQueryClient();
    const { t, language } = useLanguage();

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, {idea: any, pilotData: any, targetData: any}>}
     */
    return useMutation({
        /** @param {{idea: any, pilotData: any, targetData: any}} params */
        mutationFn: async ({ idea, pilotData, targetData }) => {
            // 1. Create Pilot
            const { data: pilot, error: pilotError } = await supabase
                .from('pilots')
                .insert(targetData)
                .select()
                .single();

            if (pilotError) throw pilotError;

            // 2. Update Idea status and link
            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({
                    status: 'converted',
                    is_published: false,
                    converted_pilot_id: pilot.id
                })
                .eq('id', idea.id);

            if (ideaError) throw ideaError;

            // 3. Trigger embedding generation
            await supabase.functions.invoke('generateEmbeddings', {
                body: { entity_name: 'Pilot', mode: 'id', entity_id: pilot.id }
            }).catch(e => console.error('Embedding error:', e));

            // 4. Send pilot created email notification via email-trigger-hub
            await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: 'pilot.created',
                    recipient_email: idea.user_email || idea.submitter_email,
                    entity_type: 'pilot',
                    entity_id: pilot.id,
                    variables: {
                        pilotTitle: pilotData.title_en || pilotData.title_ar,
                        pilotCode: targetData.code,
                        startDate: new Date().toISOString().split('T')[0],
                        dashboardUrl: window.location.origin + '/pilots/' + pilot.id
                    },
                    language: language,
                    triggered_by: 'system'
                }
            });

            // 5. Also notify about idea conversion
            try {
                await supabase.functions.invoke('email-trigger-hub', {
                    body: {
                        trigger: 'idea.converted',
                        recipient_email: idea.user_email || idea.submitter_email,
                        entity_type: 'citizen_idea',
                        entity_id: idea.id,
                        variables: {
                            ideaTitle: idea.title,
                            pilotTitle: pilotData.title_en || pilotData.title_ar,
                            pilotUrl: window.location.origin + '/pilots/' + pilot.id
                        },
                        language: language,
                        triggered_by: 'system'
                    }
                });
            } catch (emailError) {
                console.error('Failed to send idea converted email:', emailError);
            }

            return pilot;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'Pilot created successfully!', ar: 'تم إنشاء التجربة بنجاح!' }));
        },
        onError: (error) => {
            console.error('Pilot conversion error:', error);
            toast.error(t({ en: 'Failed to create pilot', ar: 'فشل إنشاء التجربة' }));
        }
    });
}

/**
 * Specialized hook for converting an Idea to a Proposal
 * Encapsulates all side effects (activity logging, status updates)
 */
export function useConvertIdeaToProposal() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, {idea: any, proposalData: any}>}
     */
    return useMutation({
        /** @param {{idea: any, proposalData: any}} params */
        mutationFn: async ({ idea, proposalData }) => {
            // 1. Create Proposal
            const { data: proposal, error: proposalError } = await supabase
                .from('innovation_proposals')
                .insert(proposalData)
                .select()
                .single();

            if (proposalError) throw proposalError;

            // 2. Update Idea status
            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({ status: 'converted-to-proposal' })
                .eq('id', idea.id);

            if (ideaError) throw ideaError;

            // 3. Trigger embedding generation
            await supabase.functions.invoke('generateEmbeddings', {
                body: { entity_name: 'InnovationProposal', mode: 'id', entity_id: proposal.id }
            }).catch(e => console.error('Embedding error:', e));

            // 4. Log system activity
            await supabase.from('system_activities').insert({
                entity_type: 'citizen_idea',
                entity_id: idea.id,
                activity_type: 'converted_to_innovation_proposal',
                description: `Idea converted to InnovationProposal: ${proposal.title_en}`,
                metadata: { proposal_id: proposal.id }
            });

            return proposal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
            toast.success(t({ en: 'Proposal created successfully!', ar: 'تم إنشاء المقترح بنجاح!' }));
        },
        onError: (error) => {
            console.error('Proposal conversion error:', error);
            toast.error(t({ en: 'Failed to create proposal', ar: 'فشل إنشاء المقترح' }));
        }
    });
}


/**
 * Hook for expert evaluations
 */
export function useSubmitEvaluation(options = {}) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, {ideaId: string, expertEmail: string, evalData: any}>}
     */
    return useMutation({
        /** @param {{ideaId: string, expertEmail: string, evalData: any}} params */
        mutationFn: async (params) => {
            const { ideaId, expertEmail, evalData } = params;
            const { error } = await supabase
                .from('expert_evaluations')
                .insert({
                    ...evalData,
                    expert_email: expertEmail,
                    entity_type: 'citizen_idea',
                    entity_id: ideaId,
                    evaluation_date: new Date().toISOString(),
                    overall_score: (evalData.feasibility_score + evalData.impact_score + evalData.innovation_score + evalData.cost_effectiveness_score + evalData.strategic_alignment_score) / 5
                });

            if (error) throw error;
        },
        ...options,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'Evaluation submitted successfully', ar: 'تم تقديم التقييم بنجاح' }));
            if (options.onSuccess) options.onSuccess(data, variables, context);
        },
        onError: (error, variables, context) => {
            console.error('Evaluation error:', error);
            toast.error(t({ en: 'Failed to submit evaluation', ar: 'فشل تقديم التقييم' }));
            if (options.onError) options.onError(error, variables, context);
        }
    });
}

/**
 * Specialized hook for converting an Idea to a Research Project (R&D)
 */
export function useConvertIdeaToRD() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        /** @param {{idea: any, rdData: any}} params */
        mutationFn: async ({ idea, rdData }) => {
            // 1. Create RD Project
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

            // 2. Update Idea status
            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({
                    status: 'converted_to_rd',
                    converted_rd_id: rdProject.id
                })
                .eq('id', idea.id);

            if (ideaError) throw ideaError;

            // 3. Send Notification via Edge Function
            await supabase.functions.invoke('citizenNotifications', {
                body: {
                    eventType: 'idea_converted_rd',
                    ideaId: idea.id,
                    rdProjectId: rdProject.id,
                    citizenEmail: idea.submitter_email
                }
            }).catch(e => console.error('Notification error:', e));

            return rdProject;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'R&D project created!', ar: 'تم إنشاء مشروع بحثي!' }));
        },
        onError: (error) => {
            console.error('R&D conversion error:', error);
            toast.error(t({ en: 'Failed to create R&D project', ar: 'فشل إنشاء مشروع بحثي' }));
        }
    });
}

/**
 * Specialized hook for converting an Idea to a Solution
 */
export function useConvertIdeaToSolution() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        /** @param {{idea: any, solutionData: any}} params */
        mutationFn: async ({ idea, solutionData }) => {
            // 1. Create Solution
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

            // 2. Update Idea status
            const { error: ideaError } = await supabase
                .from('citizen_ideas')
                .update({
                    status: 'converted_to_solution',
                    converted_solution_id: solution.id
                })
                .eq('id', idea.id);

            if (ideaError) throw ideaError;

            return solution;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-ideas'] });
            toast.success(t({ en: 'Idea converted to solution!', ar: 'تم تحويل الفكرة إلى حل!' }));
        },
        onError: (error) => {
            console.error('Solution conversion error:', error);
            toast.error(t({ en: 'Failed to convert idea to solution', ar: 'فشل تحويل الفكرة إلى حل' }));
        }
    });
}

/**
 * Hook for Idea-related Edge Function calls
 */
export function useCitizenIdeaActions() {
    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, {embedding: number[], limit?: number, threshold?: number}>}
     */
    const semanticSearch = useMutation({
        mutationFn: async (params) => {
            const { embedding, limit = 5, threshold = 0.75 } = params;
            const { data, error } = await supabase.functions.invoke('semanticSearch', {
                body: {
                    entity_name: 'CitizenIdea',
                    query_embedding: embedding,
                    top_k: limit,
                    threshold
                }
            });
            if (error) throw error;
            return data;
        }
    });

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, any>}
     */
    const triggerNotification = useMutation({
        mutationFn: async (payload) => {
            const { data, error } = await supabase.functions.invoke('autoNotificationTriggers', {
                body: payload
            });
            if (error) throw error;
            return data;
        }
    });

    return {
        semanticSearch,
        triggerNotification
    };
}
