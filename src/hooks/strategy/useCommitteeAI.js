import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useMutation } from '@/hooks/useAppQueryClient';
import { toast } from 'sonner';

// AI helpers for committee review governance flows
export function useCommitteeAI() {
  const { invokeAI, status, isLoading: isAiLoading, rateLimitInfo } = useAIWithFallback();

  const prioritizeAgenda = useMutation({
    mutationFn: async ({ agendaItems, committeeData, meetingContext }) => {
      const { success, data, error } = await invokeAI({
        system_prompt: 'You are an expert committee secretary assisting with agenda prioritization.',
        prompt: JSON.stringify({ action: 'prioritize_agenda', agendaItems, committeeData, meetingContext }),
        // Schema could be passed here if defined
      });

      if (!success) throw new Error(error || 'AI prioritization failed');
      return data.result || data; // Handle both wrapper structure and direct edge function result
    },
    onError: (error) => {
      console.error('AI prioritizeAgenda error', error);
      toast.error(`AI Error: ${error.message}`);
    }
  });

  const optimizeScheduling = useMutation({
    mutationFn: async ({ committeeData, agendaItems, meetingContext }) => {
      const { success, data, error } = await invokeAI({
        system_prompt: 'You are an expert scheduler optimizing committee meetings.',
        prompt: JSON.stringify({ action: 'optimize_scheduling', committeeData, agendaItems, meetingContext }),
      });

      if (!success) throw new Error(error || 'AI scheduling failed');
      return data.result || data;
    },
    onError: (error) => {
      console.error('AI optimizeScheduling error', error);
      toast.error(`AI Error: ${error.message}`);
    }
  });

  const predictDecisionImpact = useMutation({
    mutationFn: async ({ decisions, committeeData, meetingContext }) => {
      const { success, data, error } = await invokeAI({
        system_prompt: 'You are a strategic advisor predicting policy impacts.',
        prompt: JSON.stringify({ action: 'predict_decision_impact', decisions, committeeData, meetingContext }),
      });

      if (!success) throw new Error(error || 'AI prediction failed');
      return data.result || data;
    },
    onError: (error) => {
      console.error('AI predictDecisionImpact error', error);
      toast.error(`AI Error: ${error.message}`);
    }
  });

  const generateActionItems = useMutation({
    mutationFn: async ({ decisions, committeeData, meetingContext }) => {
      const { success, data, error } = await invokeAI({
        system_prompt: 'You are an efficient minute-taker generating action items.',
        prompt: JSON.stringify({ action: 'generate_action_items', decisions, committeeData, meetingContext }),
      });

      if (!success) throw new Error(error || 'AI generation failed');
      return data.result || data;
    },
    onError: (error) => {
      console.error('AI generateActionItems error', error);
      toast.error(`AI Error: ${error.message}`);
    }
  });

  const summarizeMeeting = useMutation({
    mutationFn: async ({ decisions, agendaItems, committeeData, meetingContext }) => {
      const { success, data, error } = await invokeAI({
        system_prompt: 'You are an expert executive summarizer.',
        prompt: JSON.stringify({ action: 'summarize_meeting', decisions, agendaItems, committeeData, meetingContext }),
      });

      if (!success) throw new Error(error || 'AI summary failed');
      return data.result || data;
    },
    onError: (error) => {
      console.error('AI summarizeMeeting error', error);
      toast.error(`AI Error: ${error.message}`);
    }
  });

  return {
    prioritizeAgenda,
    optimizeScheduling,
    predictDecisionImpact,
    generateActionItems,
    summarizeMeeting,
    // Expose shared state
    status,
    isLoading: isAiLoading || prioritizeAgenda.isPending || optimizeScheduling.isPending || predictDecisionImpact.isPending || generateActionItems.isPending || summarizeMeeting.isPending,
    rateLimitInfo
  };
}


