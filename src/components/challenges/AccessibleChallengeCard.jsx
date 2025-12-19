/**
 * Accessible Challenge Card Component
 * Implements: a11y-1 (heading hierarchy), a11y-2 (alt text), a11y-3 (keyboard nav),
 * a11y-4 (focus indicators), a11y-5 (color contrast), i18n-1-4 (RTL/bilingual),
 * resp-1-4 (responsive design)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/TranslationContext';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { 
  MapPin, Calendar, Users, ArrowRight, ArrowLeft, 
  AlertCircle, CheckCircle, Clock, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Status configuration with accessible colors (WCAG AA compliant)
const STATUS_CONFIG = {
  draft: { label: { en: 'Draft', ar: 'مسودة' }, variant: 'secondary', icon: Clock },
  submitted: { label: { en: 'Submitted', ar: 'مقدم' }, variant: 'default', icon: Loader2 },
  processing: { label: { en: 'Processing', ar: 'قيد المعالجة' }, variant: 'default', icon: Loader2 },
  approved: { label: { en: 'Approved', ar: 'موافق عليه' }, variant: 'success', icon: CheckCircle },
  rejected: { label: { en: 'Rejected', ar: 'مرفوض' }, variant: 'destructive', icon: AlertCircle },
  resolved: { label: { en: 'Resolved', ar: 'تم الحل' }, variant: 'success', icon: CheckCircle },
};

// Priority configuration
const PRIORITY_CONFIG = {
  low: { label: { en: 'Low', ar: 'منخفض' }, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: { en: 'Medium', ar: 'متوسط' }, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  high: { label: { en: 'High', ar: 'عالي' }, className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  critical: { label: { en: 'Critical', ar: 'حرج' }, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export function AccessibleChallengeCard({ 
  challenge, 
  showActions = true,
  onClick,
  className 
}) {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const locale = language === 'ar' ? ar : enUS;
  
  // Bilingual content helpers
  const getLocalizedText = (enText, arText) => language === 'ar' ? (arText || enText) : enText;
  const title = getLocalizedText(challenge.title_en, challenge.title_ar);
  const description = getLocalizedText(challenge.description_en, challenge.description_ar);
  
  // Status and priority
  const status = STATUS_CONFIG[challenge.status] || STATUS_CONFIG.draft;
  const priority = PRIORITY_CONFIG[challenge.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = status.icon;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  
  // Format date with locale
  const formattedDate = challenge.created_at 
    ? format(new Date(challenge.created_at), 'PPP', { locale })
    : null;
  
  // Accessibility: handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick(challenge);
    } else {
      navigate(`/challenges/${challenge.id}`);
    }
  };
  
  // Generate accessible alt text
  const imageAlt = `${title} - ${getLocalizedText(
    challenge.sector?.name_en || 'General',
    challenge.sector?.name_ar
  )} ${getLocalizedText('challenge', 'تحدي')}`;

  return (
    <Card
      role="article"
      aria-labelledby={`challenge-title-${challenge.id}`}
      aria-describedby={`challenge-desc-${challenge.id}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn(
        // Base styles
        'cursor-pointer transition-all duration-200',
        // Focus indicator (a11y-4)
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        // Hover state
        'hover:shadow-lg hover:border-primary/50',
        // Responsive (resp-1)
        'w-full',
        className
      )}
    >
      {/* Image with alt text (a11y-2) */}
      {challenge.image_url && (
        <div className="relative w-full h-40 sm:h-48 overflow-hidden rounded-t-lg">
          <img
            src={challenge.image_url}
            alt={imageAlt}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {/* Status badge overlay */}
          <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2">
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" aria-hidden="true" />
              <span>{getLocalizedText(status.label.en, status.label.ar)}</span>
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-2">
        {/* Heading hierarchy (a11y-1) - h3 for card title */}
        <h3 
          id={`challenge-title-${challenge.id}`}
          className="text-lg font-semibold line-clamp-2 text-foreground"
        >
          {title}
        </h3>
        
        {/* Priority and sector badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          {challenge.priority && (
            <Badge className={cn('text-xs', priority.className)}>
              {getLocalizedText(priority.label.en, priority.label.ar)}
            </Badge>
          )}
          {challenge.sector && (
            <Badge variant="outline" className="text-xs">
              {getLocalizedText(challenge.sector.name_en, challenge.sector.name_ar)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Description with proper contrast (a11y-5) */}
        <p 
          id={`challenge-desc-${challenge.id}`}
          className="text-sm text-muted-foreground line-clamp-3 mb-4"
        >
          {description || getLocalizedText('No description available', 'لا يوجد وصف متاح')}
        </p>
        
        {/* Metadata with icons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
          {challenge.municipality && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              <span>{getLocalizedText(challenge.municipality.name_en, challenge.municipality.name_ar)}</span>
            </div>
          )}
          
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <time dateTime={challenge.created_at}>{formattedDate}</time>
            </div>
          )}
          
          {challenge.citizen_votes_count > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden="true" />
              <span>
                {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(challenge.citizen_votes_count)}
                {' '}{getLocalizedText('votes', 'صوت')}
              </span>
            </div>
          )}
        </div>
        
        {/* Action button with touch target (resp-2: min 44x44px) */}
        {showActions && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full sm:w-auto min-h-[44px] group"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            aria-label={getLocalizedText(`View details for ${title}`, `عرض تفاصيل ${title}`)}
          >
            {getLocalizedText('View Details', 'عرض التفاصيل')}
            <ArrowIcon className="h-4 w-4 ms-2 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default AccessibleChallengeCard;
