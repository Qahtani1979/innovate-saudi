import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch user roles from the user_roles table
 * @param {string} userId - The user's auth ID
 * @param {string} userEmail - The user's email (fallback)
 * @returns {object} - { roles, isLoading, error, refetch }
 */
export function useUserRoles(userId, userEmail) {
  const { data: roles, isLoading, error, refetch } = useQuery({
    queryKey: ['user-roles', userId, userEmail],
    queryFn: async () => {
      if (!userId && !userEmail) return [];
      
      let query = supabase
        .from('user_roles')
        .select('role');
      
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (userEmail) {
        query = query.eq('user_email', userEmail);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data?.map(r => r.role) || [];
    },
    enabled: !!(userId || userEmail),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hasRole = (role) => roles?.includes(role) || false;
  
  const hasAnyRole = (roleList) => roleList.some(r => roles?.includes(r));
  
  const isAdmin = hasAnyRole(['admin', 'super_admin']);
  
  const isInternalStaff = hasAnyRole(['admin', 'super_admin', 'gdibs_internal', 'municipality_admin']);
  
  const isCitizen = hasRole('citizen') || (!roles?.length);

  return {
    roles: roles || [],
    isLoading,
    error,
    refetch,
    hasRole,
    hasAnyRole,
    isAdmin,
    isInternalStaff,
    isCitizen
  };
}

export default useUserRoles;
