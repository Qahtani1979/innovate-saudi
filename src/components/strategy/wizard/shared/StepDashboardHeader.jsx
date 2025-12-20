import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Helper function to get color classes based on score
const getScoreConfig = (score) => {
  if (score >= 90) return { 
    color: 'bg-green-500', 
    textColor: 'text-green-700', 
    bgLight: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-500/30',
    label: { en: 'Excellent', ar: 'ممتاز' }
  };
  if (score >= 75) return { 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700', 
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-500/30',
    label: { en: 'Good', ar: 'جيد' }
  };
  if (score >= 60) return { 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-700', 
    bgLight: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-500/30',
    label: { en: 'Adequate', ar: 'كافي' }
  };
  if (score >= 40) return { 
    color: 'bg-orange-500', 
    textColor: 'text-orange-700', 
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-500/30',
    label: { en: 'Needs Work', ar: 'يحتاج عمل' }
  };
  return { 
    color: 'bg-red-500', 
    textColor: 'text-red-700', 
    bgLight: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-500/30',
    label: { en: 'Critical', ar: 'حرج' }
  };
};

const getProgressColor = (value) => {
  if (value >= 80) return 'text-green-500';
  if (value >= 60) return 'text-blue-500';
  if (value >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

/**
 * StepDashboardHeader - Dashboard header with score and stats grid (Step18 style)
 * 
 * @param {Object} props
 * @param {number} props.score - Completion/readiness score (0-100)
 * @param {Array} props.stats - Array of stat objects { icon, value, label, iconColor }
 * @param {Array} props.metrics - Array of metric objects { label, value } for progress bars
 * @param {Object|string} props.title - Title for the score section (string or { en, ar })
 * @param {Object|string} props.subtitle - Subtitle (string or { completed, total } for sections)
 * @param {string} props.language - Current language ('en' or 'ar')
 * @param {string} props.className - Additional classes
 */
export function StepDashboardHeader({ 
  score = 0, 
  stats = [], 
  metrics = [],
  title,
  subtitle,
  language = 'en',
  className 
}) {
  const scoreConfig = getScoreConfig(score);
  const t = (obj) => {
    if (typeof obj === 'string') return obj;
    return language === 'ar' ? (obj?.ar || obj?.en || '') : (obj?.en || obj?.ar || '');
  };

  // Handle subtitle - can be string or { completed, total }
  const renderSubtitle = () => {
    if (!subtitle) return null;
    if (typeof subtitle === 'string') {
      return <p className="text-xs text-muted-foreground">{subtitle}</p>;
    }
    if (subtitle.completed !== undefined && subtitle.total !== undefined) {
      return (
        <p className="text-xs text-muted-foreground">
          {subtitle.completed}/{subtitle.total} {t({ en: 'sections', ar: 'أقسام' })}
        </p>
      );
    }
    return null;
  };

  return (
    <Card className={cn(
      'bg-gradient-to-br from-background to-muted/30 border-2',
      scoreConfig.borderColor,
      className
    )}>
      <CardContent className="pt-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* Readiness Score */}
          <div className={cn(
            'col-span-2 flex items-center gap-4 p-4 rounded-xl border',
            scoreConfig.bgLight
          )}>
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center shrink-0',
              scoreConfig.color
            )}>
              <span className="text-2xl font-bold text-white">{Math.round(score)}%</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {title ? t(title) : t({ en: 'Readiness Score', ar: 'درجة الجاهزية' })}
              </p>
              <p className={cn('text-lg font-semibold', scoreConfig.textColor)}>
                {t(scoreConfig.label)}
              </p>
              {renderSubtitle()}
            </div>
          </div>

          {/* Statistics Cards */}
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={index} 
                className="p-4 bg-background/80 rounded-xl border text-center"
              >
                {IconComponent && (
                  <IconComponent className={cn('h-5 w-5 mx-auto mb-1', stat.iconColor || 'text-primary')} />
                )}
                <p className={cn('text-2xl font-bold', stat.valueColor || 'text-foreground')}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                {stat.subValue && (
                  <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Quality Metrics Progress Bars */}
        {metrics.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            {metrics.map((metric, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                  <span className={cn('text-xs font-medium', getProgressColor(metric.value))}>
                    {metric.value}%
                  </span>
                </div>
                <Progress value={metric.value} className="h-1.5" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * CompactScoreBadge - Simple score badge for inline use
 */
export function CompactScoreBadge({ score, label }) {
  const getVariant = (s) => {
    if (s >= 80) return 'default';
    if (s >= 60) return 'secondary';
    if (s >= 40) return 'outline';
    return 'destructive';
  };

  return (
    <Badge variant={getVariant(score)} className="gap-1">
      <span className="font-bold">{Math.round(score)}%</span>
      {label && <span className="text-xs opacity-80">{label}</span>}
    </Badge>
  );
}

export default StepDashboardHeader;
