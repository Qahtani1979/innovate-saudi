import { useQueryClient as useReactQueryClient } from '@tanstack/react-query';

/**
 * Wrapper for useQueryClient to enforce "hooks-only" access to react-query.
 * Use this instead of importing useQueryClient directly in components.
 */
export function useAppQueryClient() {
    return useReactQueryClient();
}
