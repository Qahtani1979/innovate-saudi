import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { usePersonaColors } from './PersonaPageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Status color mapping for all entity types
 */
const STATUS_COLORS = {
  // Universal statuses
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  
  // Challenge-specific
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  under_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  in_treatment: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  resolved: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  
  // Pilot-specific
  planning: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  running: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  scaling: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  
  // Program-specific
  open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  accepting_applications: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  
  // Solution-specific
  verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  unverified: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  
  // R&D-specific
  published: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

/**
 * EntityStatusBadge - Unified status badge component
 */
export function EntityStatusBadge({ status, size = 'md', showIcon = false, className = '' }) {
  const { t } = useLanguage();
  
  if (!status) return null;
  
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const colorClass = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.draft;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  // Format status for display
  const displayStatus = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  return (
    <Badge 
      className={`${colorClass} ${sizeClasses[size]} font-medium capitalize ${className}`}
      variant="secondary"
    >
      {displayStatus}
    </Badge>
  );
}

/**
 * Breadcrumb component for navigation context
 */
function Breadcrumbs({ items = [] }) {
  const { isRTL } = useLanguage();
  
  if (!items || items.length === 0) return null;
  
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          )}
          {item.path ? (
            <Link 
              to={item.path} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * EntityDetailHeader - Unified header for entity detail pages
 * 
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Icon component
 * @param {string} props.entityType - Entity type for theming
 * @param {string|Object} props.title - Title (string or bilingual {en, ar})
 * @param {string|Object} props.subtitle - Subtitle (optional)
 * @param {string} props.status - Entity status
 * @param {Array} props.breadcrumbs - Breadcrumb items [{label, path}]
 * @param {Array} props.metadata - [{icon, label, value}]
 * @param {string} props.editPath - Path for edit action
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onShare - Share handler
 * @param {Function} props.onBookmark - Bookmark handler
 * @param {ReactNode} props.actions - Additional action buttons
 * @param {ReactNode} props.children - Additional header content
 * @param {boolean} props.showBackButton - Show back navigation button
 * @param {string} props.backPath - Custom back path
 */
export function EntityDetailHeader({
  icon: Icon,
  entityType,
  title,
  subtitle,
  status,
  breadcrumbs = [],
  metadata = [],
  editPath,
  onDelete,
  onShare,
  onBookmark,
  actions,
  children,
  showBackButton = true,
  backPath
}) {
  const { isRTL, language, t } = useLanguage();
  const navigate = useNavigate();
  const personaColors = usePersonaColors();
  
  const bgGradient = personaColors?.bgGradient || 'from-slate-500/10 via-gray-500/5 to-transparent';
  const iconColor = personaColors?.iconColor || 'text-slate-500';
  
  // Resolve bilingual text
  const resolveText = (text) => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return language === 'ar' && text.ar ? text.ar : (text.en || '');
  };
  
  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} border border-border/50`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative p-6 md:p-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Main header content */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Back button or Icon */}
            {showBackButton ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-12 w-12 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
              >
                <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            ) : Icon && (
              <div className={`p-3 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm ${iconColor}`}>
                <Icon className="h-7 w-7" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {/* Status badge */}
              {status && (
                <div className="mb-2">
                  <EntityStatusBadge status={status} size="md" />
                </div>
              )}
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                {resolveText(title)}
              </h1>
              
              {/* Subtitle */}
              {subtitle && (
                <p className="text-muted-foreground mt-1 max-w-2xl">
                  {resolveText(subtitle)}
                </p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit button */}
            {editPath && (
              <Link to={editPath}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              </Link>
            )}
            
            {/* Custom actions */}
            {actions}
            
            {/* More actions dropdown */}
            {(onDelete || onShare || onBookmark) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Share', ar: 'مشاركة' })}
                    </DropdownMenuItem>
                  )}
                  {onBookmark && (
                    <DropdownMenuItem onClick={onBookmark}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      {t({ en: 'Bookmark', ar: 'إضافة للمفضلة' })}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Delete', ar: 'حذف' })}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Metadata row */}
        {metadata.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border/50">
            {metadata.map((item, idx) => {
              if (!item) return null;
              const MetaIcon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 bg-background/60 backdrop-blur-sm rounded-lg px-4 py-2"
                >
                  {MetaIcon && <MetaIcon className={`h-4 w-4 ${iconColor}`} />}
                  <span className="text-sm text-muted-foreground">{resolveText(item.label)}:</span>
                  <span className="text-sm font-medium text-foreground">{resolveText(item.value)}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Additional content */}
        {children}
      </div>
    </div>
  );
}

export default EntityDetailHeader;
