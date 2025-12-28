import { useEffect } from 'react';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { useToolExecutor } from '@/hooks/useToolExecutor';
import { useCopilotAgent } from '@/hooks/useCopilotAgent';
import { orchestrator } from '@/lib/ai/orchestrator';
import { useCopilotHistory } from '@/hooks/useCopilotHistory';
import { useAuth } from '@/lib/AuthContext';

/**
 * Syncs the Server State (React Query / Supabase) with the Client Store (Zustand).
 * Ensures the 'Brain' always knows who the user is.
 */
export function CopilotProvider({ children }) {
    const { user } = useAuth();
    const { setMessages, addMessage } = useCopilotStore();
    useCopilotHistory();
    const { requestExecution } = useToolExecutor();
    const { askBrain, status, isLoading } = useCopilotAgent();

    useEffect(() => {
        orchestrator.setExecutor(requestExecution);
        orchestrator.setCaller(askBrain);
    }, [requestExecution, askBrain]);
    return <>{children}</>;
}
