import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CustomReport {
  id: string;
  name_en: string;
  name_ar?: string;
  description?: string;
  report_type: string;
  config: Record<string, unknown>;
  created_by?: string;
  is_public: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomReportInput {
  name_en: string;
  name_ar?: string;
  description?: string;
  report_type: string;
  config?: Record<string, unknown>;
  is_public?: boolean;
}

export interface UpdateCustomReportInput {
  name_en?: string;
  name_ar?: string;
  description?: string;
  report_type?: string;
  config?: Record<string, unknown>;
  is_public?: boolean;
}

export function useCustomReports(filters?: { report_type?: string; is_public?: boolean }) {
  return useQuery({
    queryKey: ['custom-reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('custom_reports')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (filters?.report_type) {
        query = query.eq('report_type', filters.report_type);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CustomReport[];
    },
  });
}

export function useCustomReport(id: string | undefined) {
  return useQuery({
    queryKey: ['custom-report', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();
      if (error) throw error;
      return data as CustomReport;
    },
    enabled: !!id,
  });
}

export function useCreateCustomReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCustomReportInput) => {
      const { data, error } = await supabase
        .from('custom_reports')
        .insert({
          name_en: input.name_en,
          name_ar: input.name_ar,
          description: input.description,
          report_type: input.report_type,
          config: input.config || {},
          is_public: input.is_public ?? false,
        })
        .select()
        .single();
      if (error) throw error;
      return data as CustomReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
      toast.success('Report created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create report: ${error.message}`);
    },
  });
}

export function useUpdateCustomReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCustomReportInput & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_reports')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CustomReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
      queryClient.invalidateQueries({ queryKey: ['custom-report', data.id] });
      toast.success('Report updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update report: ${error.message}`);
    },
  });
}

export function useDeleteCustomReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_reports')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
      toast.success('Report deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });
}
