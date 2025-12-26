import { useMunicipality } from '@/hooks/useMunicipalities';
import { useMIIIndicators } from '@/hooks/useMIIData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function MIIDataGapAnalyzer({ municipalityId }) {
  const { language, t } = useLanguage();

  const { data: municipality } = useMunicipality(municipalityId);
  const { data: dimensions = [] } = useMIIIndicators();

  const dataGaps = dimensions.map(dim => {
    const sources = dim.data_source_config?.sources || []; // Assuming JSON B structure
    let collected = 0;
    let total = sources.length;

    sources.forEach(source => {
      if (source.type === 'Pilot') {
        if ((municipality?.active_pilots_count || 0) > 0) collected++;
      } else if (source.type === 'Challenge') {
        if ((municipality?.active_challenges_count || 0) > 0) collected++;
      }
    });

    const completeness = total > 0 ? Math.round((collected / total) * 100) : 0;
    const weight = dim.weight || 0;
    const impact = completeness < 100 ? Math.round((100 - completeness) * weight / 100) : 0;

    return {
      dimension: dim.name_en,
      dimension_ar: dim.name_ar,
      completeness,
      missing: total - collected,
      total,
      impact,
      weight
    };
  });

  const overallCompleteness = Math.round(
    dataGaps.reduce((sum, g) => sum + g.completeness, 0) / (dataGaps.length || 1)
  );

  return (
    <Card className="border-2 border-amber-300">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          {t({ en: 'MII Data Coverage', ar: 'تغطية بيانات المؤشر' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border-2 border-amber-300 text-center">
          <p className="text-4xl font-bold text-amber-900">{overallCompleteness}%</p>
          <p className="text-sm text-amber-700">{t({ en: 'Overall Data Completeness', ar: 'اكتمال البيانات الإجمالي' })}</p>
        </div>

        <div className="space-y-3">
          {dataGaps.map((gap, i) => (
            <div key={i} className="p-3 bg-white rounded border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-slate-900">{gap.dimension}</p>
                <Badge className={gap.completeness >= 80 ? 'bg-green-600' : gap.completeness >= 50 ? 'bg-amber-600' : 'bg-red-600'}>
                  {gap.completeness}%
                </Badge>
              </div>
              <Progress value={gap.completeness} className="h-2 mb-2" />
              {gap.completeness < 100 && (
                <div className="text-xs text-slate-600">
                  <p>{t({ en: `Missing ${gap.missing}/${gap.total} data sources`, ar: `${gap.missing}/${gap.total} مصدر بيانات مفقود` })}</p>
                  <p className="text-amber-700 font-semibold">
                    {t({ en: `Potential impact: +${gap.impact} MII points if filled`, ar: `التأثير المحتمل: +${gap.impact} نقاط إذا مُلئ` })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {overallCompleteness < 80 && (
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <p className="text-sm font-semibold text-red-900 mb-2">
              {t({ en: '⚠️ Action Required', ar: '⚠️ إجراء مطلوب' })}
            </p>
            <p className="text-xs text-red-700">
              {t({ en: 'Data gaps reduce MII accuracy. Priority: collect data for high-weight dimensions.', ar: 'فجوات البيانات تقلل دقة المؤشر. الأولوية: جمع البيانات للأبعاد عالية الوزن.' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}