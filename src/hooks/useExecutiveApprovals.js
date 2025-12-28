import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAIWithFallback } from './useAIWithFallback';

export function useExecutiveApprovals() {
    const queryClient = useAppQueryClient();
    const [selectedItem, setSelectedItem] = useState(null);
    const [decision, setDecision] = useState('');
    const [comments, setComments] = useState('');
    const [aiBrief, setAiBrief] = useState(null);
    const { invokeAI, status, isLoading: generatingBrief, isAvailable, rateLimitInfo } = useAIWithFallback();

    const { data: pilots = [], isLoading: isLoadingPilots } = useQuery({
        queryKey: ['pilots-pending-approval'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .or('stage.eq.approval_pending,and(budget.gt.1000000,stage.eq.design)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    const { data: rdCalls = [], isLoading: isLoadingRD } = useQuery({
        queryKey: ['rd-calls-pending'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_calls')
                .select('*')
                .eq('status', 'draft')
                .gt('budget_total', 5000000)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    const { data: sandboxApps = [], isLoading: isLoadingSandbox } = useQuery({
        queryKey: ['sandbox-apps-pending'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandbox_applications')
                .select('*')
                .eq('status', 'pending_approval')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    const approveMutation = useMutation({
        mutationFn: async ({ id, type, approved, comments }) => {
            if (type === 'pilot') {
                const { error } = await supabase
                    .from('pilots')
                    .update({
                        stage: approved ? 'approved' : 'design',
                        approval_notes: comments
                    })
                    .eq('id', id);
                if (error) throw error;
            } else if (type === 'rd_call') {
                const { error } = await supabase
                    .from('rd_calls')
                    .update({
                        status: approved ? 'approved' : 'draft',
                        approval_notes: comments
                    })
                    .eq('id', id);
                if (error) throw error;
            }
            // Add sandbox approval logic if needed, currently not in original component but good to have
            else if (type === 'sandbox') {
                // Assuming sandbox_applications has a status field
                const { error } = await supabase
                    .from('sandbox_applications')
                    .update({
                        status: approved ? 'approved' : 'rejected', // Or whatever status is appropriate
                        // approval_notes: comments // Check if sandbox_applications has approval_notes
                    })
                    .eq('id', id);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success('Decision recorded successfully');
            setSelectedItem(null);
            setDecision('');
            setComments('');
            setAiBrief(null);
        },
        onError: (error) => {
            console.error('Approval error:', error);
            toast.error('Failed to record decision');
        }
    });

    const generateAIBrief = async (item, type) => {
        const prompt = type === 'pilot' ?
            `Generate executive decision brief for this pilot:
Title: ${item.title_en}
Budget: ${item.budget} SAR
Municipality: ${item.municipality_id}
Sector: ${item.sector}
Objective: ${item.objective_en}

Provide:
1. Strategic alignment (how it fits national goals)
2. Risk assessment (high/medium/low with reasons)
3. Expected impact (quantified if possible)
4. Budget justification
5. Recommendation (approve/conditional/defer/reject)` :
            `Generate executive brief for R&D Call:
Title: ${item.title_en}
Budget: ${item.budget_total} SAR
Theme: ${item.theme_en}

Provide strategic analysis and recommendation.`;

        const result = await invokeAI({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    strategic_alignment: { type: 'string' },
                    risk_level: { type: 'string' },
                    risk_reasons: { type: 'array', items: { type: 'string' } },
                    expected_impact: { type: 'string' },
                    budget_justification: { type: 'string' },
                    recommendation: { type: 'string' },
                    key_considerations: { type: 'array', items: { type: 'string' } }
                }
            }
        });

        if (result.success) {
            setAiBrief(result.data);
        }
    };

    return {
        pilots,
        rdCalls,
        sandboxApps,
        isLoading: isLoadingPilots || isLoadingRD || isLoadingSandbox,
        approveMutation,
        selectedItem,
        setSelectedItem,
        decision,
        setDecision,
        comments,
        setComments,
        aiBrief,
        generateAIBrief,
        generatingBrief,
        aiStatus: status,
        aiRateLimitInfo: rateLimitInfo,
        aiIsAvailable: isAvailable
    };
}



