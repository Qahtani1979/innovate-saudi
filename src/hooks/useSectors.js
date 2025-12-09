import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSectors() {
  return useQuery({
    queryKey: ['sectors-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name_en, name_ar, code, icon')
        .eq('is_active', true)
        .order('name_en');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCustomExpertise() {
  return useQuery({
    queryKey: ['custom-expertise-approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_expertise_areas')
        .select('id, name_en, name_ar')
        .eq('status', 'approved')
        .order('name_en');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
}