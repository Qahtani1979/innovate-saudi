import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyAlignment } from '@/hooks/useStrategyAlignment';
import { 
  Target, AlertTriangle, CheckCircle2, RefreshCw, 
  ArrowRight, TrendingUp, Lightbulb
} from 'lucide-react';

export default function StrategyAlignmentScoreCard({ entityType, entityId, showDetails = true }) {
  const { t, language } = useLanguage();
  const { alignmentData, isLoading, error, calculateAlignment } = useStrategyAlignment(entityType, entityId);

  useEffect(() => {
    if (entityType && entityId) {
      calculateAlignment();
    }
  }, [entityType, entityId, calculateAlignment]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { variant: 'default', label: { en: 'Well Aligned', ar: 'متوافق جيداً' } };
    if (score >= 60) return { variant: 'secondary', label: { en: 'Partially Aligned', ar: 'متوافق جزئياً' } };
    return { variant: 'destructive', label: { en: 'Needs Alignment', ar: 'يحتاج توافق' } };
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive py-4">
            {t({ en: 'Error loading alignment data', ar: 'خطأ في تحميل بيانات التوافق' })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alignmentData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-4">
            {t({ en: 'No alignment data available', ar: 'لا توجد بيانات توافق' })}
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreBadge = getScoreBadge(alignmentData.score);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={calculateAlignment}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-4xl font-bold ${getScoreColor(alignmentData.score)}`}>
              {alignmentData.score}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <Badge variant={scoreBadge.variant}>
            {t(scoreBadge.label)}
          </Badge>
        </div>

        <Progress value={alignmentData.score} className="h-2" />

        {showDetails && (
          <>
            {/* Gaps */}
            {alignmentData.gaps && alignmentData.gaps.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  {t({ en: 'Alignment Gaps', ar: 'فجوات التوافق' })}
                </h4>
                <div className="space-y-2">
                  {alignmentData.gaps.map((gap, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                      {getSeverityIcon(gap.severity)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{gap.message}</p>
                        <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {alignmentData.recommendations && alignmentData.recommendations.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  {t({ en: 'Recommendations', ar: 'التوصيات' })}
                </h4>
                <ul className="space-y-2">
                  {alignmentData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Linked Objectives Count */}
            {alignmentData.linkedObjectives && alignmentData.linkedObjectives.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t({ en: 'Linked Strategic Plans', ar: 'الخطط الاستراتيجية المرتبطة' })}
                  </span>
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {alignmentData.linkedObjectives.length}
                  </Badge>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
