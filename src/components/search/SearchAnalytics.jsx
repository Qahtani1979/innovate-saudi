import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Track search queries for analytics
 */
export default function SearchAnalytics() {
  const { trackSearch } = useAnalytics();

  return { trackSearch };
}

export function useSearchAnalytics() {
  const { trackSearch } = useAnalytics();
  return { trackSearch };
}
