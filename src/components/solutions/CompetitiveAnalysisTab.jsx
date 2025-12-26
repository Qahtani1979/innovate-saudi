import { useSimilarSolutions } from '@/hooks/useSolutions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Target, TrendingUp, DollarSign, Award, CheckCircle2, XCircle, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function CompetitiveAnalysisTab({ solution }) {
  const { language, isRTL, t } = useLanguage();

  const { data: similarSolutions = [] } = useSimilarSolutions({
    solutionId: solution.id,
    sectors: solution.sectors || [],
    limit: 6
  });

  const competitors = similarSolutions.slice(0, 5);

  const comparisonAttributes = [
    { key: 'maturity_level', label: { en: 'Maturity', ar: 'النضج' }, format: (v) => v },
    { key: 'trl', label: { en: 'TRL', ar: 'TRL' }, format: (v) => `TRL ${v || 'N/A'}` },
    { key: 'pricing_model', label: { en: 'Pricing', ar: 'التسعير' }, format: (v) => v || 'N/A' },
    { key: 'deployment_count', label: { en: 'Deployments', ar: 'النشرات' }, format: (v) => v || 0 },
    { key: 'average_rating', label: { en: 'Rating', ar: 'التقييم' }, format: (v) => v ? `${v.toFixed(1)}/5` : 'N/A' },
    { key: 'success_rate', label: { en: 'Success Rate', ar: 'معدل النجاح' }, format: (v) => v ? `${v}%` : 'N/A' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Competitive Position */}
      <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            {t({ en: 'Competitive Position', ar: 'الموقع التنافسي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{solution.trl || 'N/A'}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Technology Readiness', ar: 'جاهزية التقنية' })}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{solution.deployment_count || 0}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Deployments', ar: 'إجمالي النشرات' })}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{solution.pricing_model || 'N/A'}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Pricing Model', ar: 'نموذج التسعير' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {competitors.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-slate-600" />
              {t({ en: 'Similar Solutions Comparison', ar: 'مقارنة الحلول المشابهة' })}
              <Badge variant="outline">{competitors.length} {t({ en: 'competitors', ar: 'منافسين' })}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">{t({ en: 'Attribute', ar: 'السمة' })}</th>
                    <th className="text-left p-2 font-semibold bg-blue-50">
                      {t({ en: 'This Solution', ar: 'هذا الحل' })}
                    </th>
                    {competitors.map((comp, idx) => (
                      <th key={idx} className="text-left p-2 font-semibold">
                        {t({ en: `Competitor ${idx + 1}`, ar: `منافس ${idx + 1}` })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-2 font-medium">{t({ en: 'Name', ar: 'الاسم' })}</td>
                    <td className="p-2 bg-blue-50">
                      <p className="font-medium text-blue-900">{solution.name_en}</p>
                    </td>
                    {competitors.map((comp, idx) => (
                      <td key={idx} className="p-2">
                        <Link to={createPageUrl('SolutionDetail') + `?id=${comp.id}`} className="text-blue-600 hover:underline">
                          {comp.name_en}
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {comparisonAttributes.map((attr, attrIdx) => (
                    <tr key={attrIdx} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{attr.label[language]}</td>
                      <td className="p-2 bg-blue-50 font-medium">
                        {attr.format(solution[attr.key])}
                      </td>
                      {competitors.map((comp, idx) => (
                        <td key={idx} className="p-2">
                          {attr.format(comp[attr.key])}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-2 font-medium">{t({ en: 'Features Count', ar: 'عدد الميزات' })}</td>
                    <td className="p-2 bg-blue-50 font-medium">{solution.features?.length || 0}</td>
                    {competitors.map((comp, idx) => (
                      <td key={idx} className="p-2">{comp.features?.length || 0}</td>
                    ))}
                  </tr>

                  <tr className="border-b hover:bg-slate-50">
                    <td className="p-2 font-medium">{t({ en: 'Verified', ar: 'محقق' })}</td>
                    <td className="p-2 bg-blue-50">
                      {solution.is_verified ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </td>
                    {competitors.map((comp, idx) => (
                      <td key={idx} className="p-2">
                        {comp.is_verified ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-center">
              <Link to={createPageUrl('SolutionComparison') + `?ids=${[solution.id, ...competitors.map(c => c.id)].join(',')}`}>
                <Button variant="outline" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  {t({ en: 'Open Full Comparison', ar: 'فتح المقارنة الكاملة' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {t({ en: 'No similar solutions found for comparison', ar: 'لم يتم العثور على حلول مشابهة للمقارنة' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
