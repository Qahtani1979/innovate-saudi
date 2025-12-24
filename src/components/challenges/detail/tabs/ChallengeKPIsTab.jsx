import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageContext';
import { Target, ArrowRight } from 'lucide-react';

export default function ChallengeKPIsTab({ challenge }) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            {t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {challenge.kpis && challenge.kpis.length > 0 ? (
            <div className="space-y-3">
              {challenge.kpis.map((kpi, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg border">
                  <p className="font-medium">
                    {language === 'ar' && kpi.name_ar ? kpi.name_ar : kpi.name_en || kpi.name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Baseline:</span>{' '}
                      <span className="font-medium">{kpi.baseline}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Target:</span>{' '}
                      <span className="font-medium text-green-600">{kpi.target}</span>
                    </div>
                    {kpi.unit && (
                      <div className="text-muted-foreground">({kpi.unit})</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">{t({ en: 'No KPIs defined yet', ar: 'لم يتم تحديد مؤشرات بعد' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Score Breakdown', ar: 'تفصيل النقاط' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{challenge.severity_score || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">{t({ en: 'Severity', ar: 'الخطورة' })}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{challenge.impact_score || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">{t({ en: 'Impact', ar: 'التأثير' })}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{challenge.overall_score || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">{t({ en: 'Overall', ar: 'الإجمالي' })}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
