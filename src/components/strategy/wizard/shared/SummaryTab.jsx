import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Standard Summary Tab components for wizard steps
 * Provides consistent charts, stats, and recommendations layout
 */

/**
 * Distribution Chart - shows breakdown of items by category
 */
export function DistributionChart({ 
  title, 
  data = [], 
  language = 'en',
  showPercentage = true,
  className 
}) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item, idx) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.icon && <item.icon className={cn("h-3.5 w-3.5", item.iconColor)} />}
                  <span className="truncate">{typeof item.label === 'object' ? item.label[language] : item.label}</span>
                </div>
                <span className="text-muted-foreground">
                  {item.value}
                  {showPercentage && total > 0 && ` (${percentage}%)`}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className={cn("h-1.5", item.progressClass)}
              />
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Quality Metrics Card - shows quality breakdown
 */
export function QualityMetrics({ 
  title, 
  metrics = [], 
  language = 'en',
  className 
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon || CheckCircle2;
            return (
              <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <Icon className={cn("h-4 w-4 shrink-0", metric.iconColor || 'text-primary')} />
                <div className="min-w-0">
                  <p className="text-lg font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {typeof metric.label === 'object' ? metric.label[language] : metric.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Recommendations Card - shows actionable recommendations
 * Supports both simple messages and detailed recommendations with descriptions
 */
export function RecommendationsCard({ 
  title, 
  recommendations = [], 
  language = 'en',
  className,
  showDescriptions = false
}) {
  const getIcon = (type) => {
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle2;
      default: return Info;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'error': return 'bg-red-500/10 border border-red-500/30';
      case 'warning': return 'bg-amber-500/10 border border-amber-500/30';
      case 'success': return 'bg-green-500/10 border border-green-500/30';
      default: return 'bg-blue-500/10 border border-blue-500/30';
    }
  };

  const getText = (value) => {
    if (!value) return '';
    return typeof value === 'object' ? value[language] : value;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon || getIcon(rec.type);
          const message = getText(rec.message) || getText(rec.text);
          const description = getText(rec.description);
          const hasDescription = showDescriptions && description;
          
          return (
            <div key={idx} className={cn(
              "flex items-start gap-3 p-3 rounded-lg",
              hasDescription ? getBgColor(rec.type) : "bg-muted/30"
            )}>
              <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", getColor(rec.type))} />
              <div className="flex-1 min-w-0">
                {hasDescription ? (
                  <>
                    <p className={cn("font-medium", getColor(rec.type).replace('text-', 'text-').replace('-600', '-700'))}>
                      {message}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  </>
                ) : (
                  <p className="text-sm">{message}</p>
                )}
              </div>
            </div>
          );
        })}
        {recommendations.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700">
              {language === 'ar' ? 'لا توجد توصيات - القسم مكتمل!' : 'No recommendations - section is complete!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Stats Grid - compact stats display
 */
export function StatsGrid({ 
  stats = [], 
  columns = 4,
  language = 'en',
  className 
}) {
  return (
    <div className={cn(
      "grid gap-3",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-2 md:grid-cols-4",
      columns === 5 && "grid-cols-2 md:grid-cols-5",
      className
    )}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const label = typeof stat.label === 'object' ? stat.label[language] : stat.label;
        return (
          <Card key={idx} className="p-3">
            <div className="flex items-center gap-2">
              {Icon && <Icon className={cn("h-4 w-4", stat.iconColor || 'text-primary')} />}
              <div>
                <p className={cn("text-xl font-bold", stat.valueColor)}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Completion Grid - shows section completion status
 */
export function CompletionGrid({ 
  sections = [], 
  onNavigate,
  language = 'en',
  className 
}) {
  const getStatusIcon = (score) => {
    if (score >= 80) return CheckCircle2;
    if (score >= 50) return AlertTriangle;
    return AlertCircle;
  };

  const getStatusColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-500/10';
    if (score >= 50) return 'text-amber-600 bg-amber-500/10';
    return 'text-red-600 bg-red-500/10';
  };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
      {sections.map((section, idx) => {
        const Icon = getStatusIcon(section.score);
        const label = typeof section.label === 'object' ? section.label[language] : section.label;
        return (
          <Card 
            key={idx} 
            className={cn(
              "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
              onNavigate && "cursor-pointer"
            )}
            onClick={() => onNavigate?.(section.id)}
          >
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg", getStatusColor(section.score))}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{label}</p>
                <p className="text-xs text-muted-foreground">{Math.round(section.score)}%</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Trend Indicator
 */
export function TrendIndicator({ value, previousValue, label, className }) {
  const diff = value - previousValue;
  const isPositive = diff > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Icon className={cn("h-3 w-3", isPositive ? 'text-green-600' : 'text-red-600')} />
      <span className={cn("text-xs", isPositive ? 'text-green-600' : 'text-red-600')}>
        {isPositive ? '+' : ''}{diff}
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

export default {
  DistributionChart,
  QualityMetrics,
  RecommendationsCard,
  StatsGrid,
  CompletionGrid,
  TrendIndicator,
};
