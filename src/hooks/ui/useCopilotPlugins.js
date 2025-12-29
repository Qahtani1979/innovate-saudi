
import { useReferenceDataTools } from '@/hooks/tools/useReferenceDataTools';
import { usePilotTools } from '@/hooks/tools/usePilotTools';
import { useContextTools } from '@/hooks/tools/useContextTools';
import { useChallengeTools } from '@/hooks/tools/useChallengeTools';
import { useNavigationTools } from '@/hooks/tools/useNavigationTools';
import { useProgramTools } from '@/hooks/tools/useProgramTools';
import { useSolutionTools } from '@/hooks/tools/useSolutionTools';
import { useOperationsTools } from '@/hooks/tools/useOperationsTools';
import { useCommunityTools } from '@/hooks/tools/useCommunityTools';
import { useStrategyTools } from '@/hooks/tools/useStrategyTools';
import { useRDInnovationTools } from '@/hooks/tools/useRDInnovationTools';

/**
 * Mounts all Copilot Feature Plugins.
 * This hook is responsible for registering all tools with the CopilotToolsContext.
 */
export function useCopilotPlugins() {
    useReferenceDataTools();
    usePilotTools();
    useContextTools();
    useChallengeTools();
    useNavigationTools();
    useProgramTools();
    useSolutionTools();
    useOperationsTools();
    useCommunityTools();
    useStrategyTools();
    useRDInnovationTools();
}
