import { useState } from 'react';
import { useAppQueryClient } from './useAppQueryClient';

/**
 * Hook to manage refreshing of RBAC-related data for the Audit Dashboard.
 * Encapsulates cache invalidation logic for multiple queries.
 */
export function useRBACRefresh() {
    const queryClient = useAppQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);

    const refreshRBACData = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['all-user-profiles'] }),
                queryClient.invalidateQueries({ queryKey: ['rbac-user-roles'] }),
                queryClient.invalidateQueries({ queryKey: ['roles'] }),
                queryClient.invalidateQueries({ queryKey: ['system-permissions'] }),
                queryClient.invalidateQueries({ queryKey: ['role-permissions'] }),
                queryClient.invalidateQueries({ queryKey: ['rbac-delegations'] }),
                queryClient.invalidateQueries({ queryKey: ['rbac-access-logs'] })
            ]);
            setLastRefresh(new Date());
        } finally {
            setIsRefreshing(false);
        }
    };

    return {
        isRefreshing,
        lastRefresh,
        refreshRBACData
    };
}
