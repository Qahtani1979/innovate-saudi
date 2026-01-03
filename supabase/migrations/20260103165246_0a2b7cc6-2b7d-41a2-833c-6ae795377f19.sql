-- Create custom_reports table for Portfolio system
CREATE TABLE public.custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  report_type TEXT NOT NULL DEFAULT 'custom',
  query_config JSONB NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  columns JSONB DEFAULT '[]',
  chart_config JSONB DEFAULT '{}',
  created_by TEXT,
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create report_schedules table
CREATE TABLE public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
  schedule_config JSONB DEFAULT '{}',
  recipients TEXT[] DEFAULT '{}',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_reports
CREATE POLICY "Users can view public reports"
  ON public.custom_reports FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own reports"
  ON public.custom_reports FOR SELECT
  USING (created_by = (SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create reports"
  ON public.custom_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own reports"
  ON public.custom_reports FOR UPDATE
  USING (created_by = (SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own reports"
  ON public.custom_reports FOR DELETE
  USING (created_by = (SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()));

-- RLS Policies for report_schedules
CREATE POLICY "Users can view own schedules"
  ON public.report_schedules FOR SELECT
  USING (created_by = (SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create schedules"
  ON public.report_schedules FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own schedules"
  ON public.report_schedules FOR UPDATE
  USING (created_by = (SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own schedules"
  ON public.report_schedules FOR DELETE
  USING (created_by = (SELECT user_email FROM public.user_profiles WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_custom_reports_created_by ON public.custom_reports(created_by);
CREATE INDEX idx_custom_reports_is_public ON public.custom_reports(is_public);
CREATE INDEX idx_report_schedules_report_id ON public.report_schedules(report_id);
CREATE INDEX idx_report_schedules_next_run ON public.report_schedules(next_run_at) WHERE is_active = true;

-- Updated_at trigger
CREATE TRIGGER update_custom_reports_updated_at
  BEFORE UPDATE ON public.custom_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at
  BEFORE UPDATE ON public.report_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();