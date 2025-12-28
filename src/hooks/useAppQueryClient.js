import {
    useQueryClient as useReactQueryClient,
    useQuery as useReactQuery,
    useMutation as useReactMutation,
    keepPreviousData as keepPreviousDataFn,
    useInfiniteQuery as useReactInfiniteQuery,
    useSuspenseQuery as useReactSuspenseQuery
} from '@tanstack/react-query';

/**
 * Wrapper for useQueryClient to enforce "hooks-only" access to react-query.
 * Use this instead of importing useQueryClient directly in components.
 */
export function useAppQueryClient() {
    return useReactQueryClient();
}

export const useQuery = useReactQuery;
export const useMutation = useReactMutation;
export const useInfiniteQuery = useReactInfiniteQuery;
export const useSuspenseQuery = useReactSuspenseQuery;
export const keepPreviousData = keepPreviousDataFn;
export const useQueryClient = useReactQueryClient; // Export as alias for compat
