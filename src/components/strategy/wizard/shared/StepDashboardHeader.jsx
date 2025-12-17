import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Standard Dashboard Header for all wizard steps
 * Provides consistent completeness score display and stats grid
 */
export function StepDashboardHeader({ 
  score, 
  stats = [], 
  title,
  subtitle,
  language = 'en',
  className 
}) {
  const getScoreColor = (s) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (s) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreIcon = (s) => {
    if (s >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (s >= 50) return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className={cn("bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20", className)}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-6">
          {/* Score Circle */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${score * 2.26} 226`}
                  strokeLinecap="round"
                  className={getScoreColor(score)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-xl font-bold", getScoreColor(score))}>{Math.round(score)}%</span>
              </div>
            </div>
            <div>
              {title && <h3 className="font-semibold text-lg">{title}</h3>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              <div className="flex items-center gap-2 mt-1">
                {getScoreIcon(score)}
                <span className="text-sm text-muted-foreground">
                  {score >= 80 
                    ? (language === 'ar' ? 'مكتمل' : 'Complete') 
                    : score >= 50 
                      ? (language === 'ar' ? 'قيد التقدم' : 'In Progress')
                      : (language === 'ar' ? 'يحتاج اهتمام' : 'Needs Attention')}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {stats.length > 0 && (
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="bg-background/60 rounded-lg p-3 text-center border border-border/50"
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {stat.icon && <stat.icon className={cn("h-4 w-4", stat.iconColor || 'text-primary')} />}
                    <span className={cn("text-xl font-bold", stat.valueColor || 'text-foreground')}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  {stat.subValue && (
                    <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for smaller spaces
 */
export function CompactScoreBadge({ score, label }) {
  const getVariant = (s) => {
    if (s >= 80) return 'default';
    if (s >= 50) return 'secondary';
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
