import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Archive,
  Send,
  Eye,
  FileText,
  Rocket,
  TrendingUp,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';

/**
 * Comprehensive status configuration
 * Each status has: color classes, icon, and bilingual labels
 */
const STATUS_CONFIG = {
  // Universal statuses
  draft: {
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: FileText,
    label: { en: 'Draft', ar: 'مسودة' }
  },
  pending: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock,
    label: { en: 'Pending', ar: 'قيد الانتظار' }
  },
  active: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: Play,
    label: { en: 'Active', ar: 'نشط' }
  },
  approved: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    label: { en: 'Approved', ar: 'معتمد' }
  },
  rejected: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
    label: { en: 'Rejected', ar: 'مرفوض' }
  },
  completed: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: CheckCircle,
    label: { en: 'Completed', ar: 'مكتمل' }
  },
  archived: {
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: Archive,
    label: { en: 'Archived', ar: 'مؤرشف' }
  },
  cancelled: {
    color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
    label: { en: 'Cancelled', ar: 'ملغي' }
  },

  // Challenge-specific
  submitted: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Send,
    label: { en: 'Submitted', ar: 'مقدم' }
  },
  under_review: {
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    icon: Eye,
    label: { en: 'Under Review', ar: 'قيد المراجعة' }
  },
  in_treatment: {
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon: Play,
    label: { en: 'In Treatment', ar: 'قيد المعالجة' }
  },
  resolved: {
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    icon: CheckCircle,
    label: { en: 'Resolved', ar: 'تم الحل' }
  },

  // Pilot-specific
  planning: {
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    icon: FileText,
    label: { en: 'Planning', ar: 'تخطيط' }
  },
  running: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: Play,
    label: { en: 'Running', ar: 'قيد التشغيل' }
  },
  paused: {
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: Pause,
    label: { en: 'Paused', ar: 'متوقف' }
  },
  scaling: {
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon: TrendingUp,
    label: { en: 'Scaling', ar: 'توسع' }
  },

  // Program-specific
  open: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: Unlock,
    label: { en: 'Open', ar: 'مفتوح' }
  },
  closed: {
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: Lock,
    label: { en: 'Closed', ar: 'مغلق' }
  },
  accepting_applications: {
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: Send,
    label: { en: 'Accepting Applications', ar: 'يقبل الطلبات' }
  },

  // Solution-specific
  verified: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: Shield,
    label: { en: 'Verified', ar: 'موثق' }
  },
  unverified: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: AlertCircle,
    label: { en: 'Unverified', ar: 'غير موثق' }
  },

  // R&D-specific
  published: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Rocket,
    label: { en: 'Published', ar: 'منشور' }
  },
  in_progress: {
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon: Play,
    label: { en: 'In Progress', ar: 'قيد التنفيذ' }
  },

  // Living Lab specific
  operational: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: Play,
    label: { en: 'Operational', ar: 'تشغيلي' }
  },
  setup: {
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    icon: FileText,
    label: { en: 'Setup', ar: 'إعداد' }
  }
};

/**
 * EntityStatusBadge - Unified status badge with consistent colors across all entities
 * 
 * @param {Object} props
 * @param {string} props.status - Status value (e.g., 'active', 'pending', 'draft')
 * @param {string} props.entityType - Optional entity type for context-specific styling
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {boolean} props.showIcon - Whether to show the status icon
 * @param {boolean} props.showLabel - Whether to show translated label (vs raw status)
 * @param {string} props.className - Additional CSS classes
 */
export function EntityStatusBadge({
  status,
  entityType,
  size = 'md',
  showIcon = false,
  showLabel = true,
  className = ''
}) {
  const { language } = useLanguage();

  if (!status) return null;

  // Normalize status to lowercase with underscores
  const normalizedStatus = status.toLowerCase().replace(/[\s-]+/g, '_');

  // Get config or use default
  const config = STATUS_CONFIG[normalizedStatus] || {
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: FileText,
    label: { en: status, ar: status }
  };

  const StatusIcon = config.icon;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  // Determine display text
  const displayText = showLabel
    ? (language === 'ar' && config.label.ar ? config.label.ar : config.label.en)
    : status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Badge
      className={`
        ${config.color} 
        ${sizeClasses[size]} 
        font-medium 
        inline-flex items-center
        ${className}
      `}
      variant="secondary"
    >
      {showIcon && StatusIcon && (
        <StatusIcon className={iconSizes[size]} />
      )}
      <span>{displayText}</span>
    </Badge>
  );
}

/**
 * Get all available statuses for a specific entity type
 * Useful for filter dropdowns
 */
export function getStatusOptionsForEntity(entityType, language = 'en') {
  // const { language } = useLanguage(); // Removed hook usage

  const entityStatusMap = {
    challenge: ['draft', 'submitted', 'under_review', 'approved', 'in_treatment', 'resolved', 'rejected', 'archived'],
    pilot: ['draft', 'planning', 'active', 'running', 'paused', 'completed', 'scaling', 'cancelled'],
    program: ['draft', 'open', 'accepting_applications', 'active', 'closed', 'completed', 'archived'],
    solution: ['draft', 'pending', 'verified', 'unverified', 'active', 'archived'],
    rd_project: ['draft', 'pending', 'approved', 'in_progress', 'completed', 'cancelled'],
    rd_call: ['draft', 'published', 'open', 'closed', 'archived'],
    living_lab: ['draft', 'setup', 'operational', 'active', 'paused', 'archived'],
    organization: ['pending', 'active', 'verified', 'suspended', 'archived'],
    proposal: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn']
  };

  const statuses = entityStatusMap[entityType] || Object.keys(STATUS_CONFIG);

  return statuses.map(status => {
    const config = STATUS_CONFIG[status] || { label: { en: status, ar: status } };
    return {
      value: status,
      label: language === 'ar' && config.label.ar ? config.label.ar : config.label.en
    };
  });
}

/**
 * Hook to get status color for use in custom components
 */
export function useStatusColor(status) {
  if (!status) return null;
  const normalizedStatus = status.toLowerCase().replace(/[\s-]+/g, '_');
  const config = STATUS_CONFIG[normalizedStatus];
  return config?.color || 'bg-slate-100 text-slate-700';
}

export default EntityStatusBadge;
