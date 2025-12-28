import {
    useQueryClient as useReactQueryClient,
    useQuery as useReactQuery,
    useMutation as useReactMutation,
    keepPreviousData as keepPreviousDataFn,
    useInfiniteQuery as useReactInfiniteQuery,
    useSuspenseQuery as useReactSuspenseQuery,
    QueryClientProvider as useReactQueryClientProvider,
    QueryClient as useReactQueryClientClass
} from '@tanstack/react-query';

/**
 * Wrapper for useQueryClient to enforce "hooks-only" access to react-query.
 * Use this instead of importing useQueryClient directly in components.
 */
export function useAppQueryClient() {
    return useReactQueryClient();
}
// Create a singleton instance
export const queryClientInstance = new useReactQueryClientClass({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export const useQuery = useReactQuery;
export const useMutation = useReactMutation;
export const useInfiniteQuery = useReactInfiniteQuery;
export const useSuspenseQuery = useReactSuspenseQuery;
export const keepPreviousData = keepPreviousDataFn;
export const useQueryClient = useReactQueryClient; // Export as alias for compat
export const QueryClientProvider = useReactQueryClientProvider;
export const QueryClient = useReactQueryClientClass;
