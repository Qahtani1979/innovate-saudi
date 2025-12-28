import React, { useEffect } from 'react';
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
    const { activeSessionId } = useCopilotStore();
    const { useSessionMessages } = useCopilotHistory();
    const { requestExecution } = useToolExecutor(); // Initialize the Bridge
    const { askBrain } = useCopilotAgent(); // Initialize the Intelligence

    // Inject the "Hands" and "Brain Connection"
    useEffect(() => {
        orchestrator.setExecutor(requestExecution);
        orchestrator.setCaller(askBrain);
    }, [requestExecution, askBrain]);

    // Prefetch logic or hydration logic can go here

    return (
        <>
            {children}
        </>
    );
}
