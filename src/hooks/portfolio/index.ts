/**
 * Portfolio Hooks Index
 * Central export for all portfolio-related hooks
 * @version 1.1.0
 */

// Custom Reports
export {
  useCustomReports,
  useCustomReport,
  useCreateCustomReport,
  useUpdateCustomReport,
  useDeleteCustomReport,
} from './useCustomReports';

// Report Schedules
export {
  useReportSchedules,
  useReportSchedule,
  useActiveSchedules,
  useCreateReportSchedule,
  useUpdateReportSchedule,
  useDeleteReportSchedule,
  useToggleScheduleActive,
} from './useReportSchedules';

// Re-export types
export type {
  CustomReport,
  CreateCustomReportInput,
  UpdateCustomReportInput,
} from './useCustomReports';

export type {
  ReportSchedule,
  CreateReportScheduleInput,
  UpdateReportScheduleInput,
} from './useReportSchedules';
