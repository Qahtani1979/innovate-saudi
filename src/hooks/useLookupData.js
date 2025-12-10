import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDepartments() {
  return useQuery({
    queryKey: ['lookup-departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_departments')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

export function useSpecializations(category = null) {
  return useQuery({
    queryKey: ['lookup-specializations', category],
    queryFn: async () => {
      let query = supabase
        .from('lookup_specializations')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

export function useAutoApprovalRules(personaType) {
  return useQuery({
    queryKey: ['auto-approval-rules', personaType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auto_approval_rules')
        .select('*')
        .eq('persona_type', personaType)
        .eq('is_active', true)
        .order('priority', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

export async function submitCustomEntry({ entryType, nameEn, nameAr, userEmail, userId }) {
  const { data, error } = await supabase
    .from('custom_entries')
    .insert({
      entry_type: entryType,
      name_en: nameEn,
      name_ar: nameAr,
      submitted_by_email: userEmail,
      submitted_by_user_id: userId
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
