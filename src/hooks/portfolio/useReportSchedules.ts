import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReportSchedule {
  id: string;
  report_id: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  schedule_config: Record<string, unknown>;
  recipients: string[];
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportScheduleInput {
  report_id: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  schedule_config?: Record<string, unknown>;
  recipients: string[];
  is_active?: boolean;
  next_run_at?: string;
}

export interface UpdateReportScheduleInput {
  schedule_type?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  schedule_config?: Record<string, unknown>;
  recipients?: string[];
  is_active?: boolean;
  next_run_at?: string;
}

export function useReportSchedules(reportId?: string) {
  return useQuery({
    queryKey: ['report-schedules', reportId],
    queryFn: async () => {
      let query = supabase
        .from('report_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportId) {
        query = query.eq('report_id', reportId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReportSchedule[];
    },
  });
}

export function useReportSchedule(id: string | undefined) {
  return useQuery({
    queryKey: ['report-schedule', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('report_schedules')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ReportSchedule;
    },
    enabled: !!id,
  });
}

export function useActiveSchedules() {
  return useQuery({
    queryKey: ['report-schedules', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_schedules')
        .select('*, custom_reports(*)')
        .eq('is_active', true)
        .order('next_run_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReportScheduleInput) => {
      const { data, error } = await supabase
        .from('report_schedules')
        .insert({
          report_id: input.report_id,
          schedule_type: input.schedule_type,
          schedule_config: input.schedule_config || {},
          recipients: input.recipients,
          is_active: input.is_active ?? true,
          next_run_at: input.next_run_at,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ReportSchedule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['report-schedules', data.report_id] });
      toast.success('Schedule created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create schedule: ${error.message}`);
    },
  });
}

export function useUpdateReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateReportScheduleInput & { id: string }) => {
      const { data, error } = await supabase
        .from('report_schedules')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ReportSchedule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['report-schedule', data.id] });
      toast.success('Schedule updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    },
  });
}

export function useDeleteReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('report_schedules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      toast.success('Schedule deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete schedule: ${error.message}`);
    },
  });
}

export function useToggleScheduleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('report_schedules')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ReportSchedule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      toast.success(`Schedule ${data.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error) => {
      toast.error(`Failed to toggle schedule: ${error.message}`);
    },
  });
}
