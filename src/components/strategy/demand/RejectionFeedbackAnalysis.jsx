import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useQueueNotifications } from '@/hooks/strategy/useQueueNotifications';
import { 
  TrendingDown,
  Lightbulb,
  BarChart3
} from 'lucide-react';

export default function RejectionFeedbackAnalysis({ strategicPlanId }) {
  const { t, isRTL } = useLanguage();
  const { 
    rejectedItems,
    rejectedCount,
    getRejectionPatterns,
    isLoading 
  } = useQueueNotifications(strategicPlanId);

  const patterns = getRejectionPatterns();
  const totalRejections = rejectedItems.length;

  if (isLoading || rejectedCount === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">{t({ en: 'No rejection data yet', ar: 'لا توجد بيانات رفض بعد' })}</p>
          <p className="text-sm mt-2">
            {t({ en: 'Rejection patterns will appear here after items are reviewed', ar: 'ستظهر أنماط الرفض هنا بعد مراجعة العناصر' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t({ en: 'Rejection Analysis', ar: 'تحليل الرفض' })}
        </CardTitle>
        <CardDescription>
          {t({ 
            en: 'Learning from rejected items to improve future generations', 
            ar: 'التعلم من العناصر المرفوضة لتحسين التوليدات المستقبلية' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-sm text-red-600">{t({ en: 'Total Rejected', ar: 'إجمالي المرفوض' })}</div>
            <div className="text-2xl font-bold text-red-700">{rejectedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">{t({ en: 'Unique Reasons', ar: 'أسباب فريدة' })}</div>
            <div className="text-2xl font-bold">{patterns.length}</div>
          </Card>
        </div>

        {/* Rejection Patterns */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            {t({ en: 'Top Rejection Reasons', ar: 'أهم أسباب الرفض' })}
          </h4>
          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <div key={index} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{pattern.reason || 'Unspecified'}</span>
                  <Badge variant="secondary">{pattern.count}</Badge>
                </div>
                <Progress 
                  value={(pattern.count / totalRejections) * 100} 
                  className="h-2 mb-2"
                />
                <div className="flex flex-wrap gap-1">
                  {pattern.entityTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs capitalize">
                      {type}
                    </Badge>
                  ))}
                </div>
                {pattern.examples.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t({ en: 'Examples', ar: 'أمثلة' })}: {pattern.examples.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4" />
            {t({ en: 'Recommendations', ar: 'التوصيات' })}
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {patterns.length > 0 && patterns[0].count > 3 && (
              <li>• {t({ 
                en: `Consider adjusting generation prompts to address "${patterns[0].reason}"`,
                ar: `فكر في تعديل موجهات التوليد لمعالجة "${patterns[0].reason}"`
              })}</li>
            )}
            <li>• {t({ 
              en: 'Review cascade configuration targets for problematic entity types',
              ar: 'راجع أهداف تكوين التسلسل لأنواع الكيانات الإشكالية'
            })}</li>
            <li>• {t({ 
              en: 'Consider enabling manual review for low-score items',
              ar: 'فكر في تمكين المراجعة اليدوية للعناصر ذات الدرجات المنخفضة'
            })}</li>
          </ul>
        </Card>
      </CardContent>
    </Card>
  );
}
