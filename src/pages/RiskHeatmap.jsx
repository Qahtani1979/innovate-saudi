import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { AlertCircle, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RiskHeatmap() {
  const { t } = useLanguage();

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ['risks-all'],
    queryFn: () => base44.entities.Risk.list()
  });

  const impactMap = { low: 1, medium: 2, high: 3, critical: 4 };
  const likelihoodMap = { rare: 1, unlikely: 2, possible: 3, likely: 4, certain: 5 };

  const heatmapData = Array.from({ length: 4 }, (_, i) => 
    Array.from({ length: 5 }, (_, j) => ({
      impact: 4 - i,
      likelihood: j + 1,
      risks: risks.filter(r => 
        impactMap[r.impact] === (4 - i) && likelihoodMap[r.likelihood] === (j + 1)
      )
    }))
  );

  const impactLabels = ['Critical', 'High', 'Medium', 'Low'];
  const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Certain'];

  const getCellColor = (impact, likelihood) => {
    const score = impact * likelihood;
    if (score >= 12) return 'bg-red-600 text-white';
    if (score >= 8) return 'bg-red-400 text-white';
    if (score >= 6) return 'bg-amber-400 text-white';
    if (score >= 4) return 'bg-yellow-300 text-slate-900';
    return 'bg-green-200 text-slate-900';
  };

  const stats = {
    total: risks.length,
    critical: risks.filter(r => r.severity === 'critical' || impactMap[r.impact] >= 3).length,
    mitigated: risks.filter(r => r.status === 'mitigated').length,
    active: risks.filter(r => r.status === 'identified' || r.status === 'assessed' || r.status === 'mitigating').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Risk Heatmap', ar: 'خريطة المخاطر الحرارية' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Risk distribution by impact and likelihood', ar: 'توزيع المخاطر حسب التأثير والاحتمالية' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Risks', ar: 'إجمالي المخاطر' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Critical/High', ar: 'حرج/عالي' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.mitigated}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Mitigated', ar: 'مخفف' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-300">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.active}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Risk Matrix', ar: 'مصفوفة المخاطر' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 border bg-slate-100 text-sm font-semibold"></th>
                  {likelihoodLabels.map((label, idx) => (
                    <th key={idx} className="p-3 border bg-slate-100 text-sm font-semibold">
                      {t({ en: label, ar: label })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="p-3 border bg-slate-100 text-sm font-semibold">
                      {t({ en: impactLabels[rowIdx], ar: impactLabels[rowIdx] })}
                    </td>
                    {row.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        className={`p-3 border ${getCellColor(cell.impact, cell.likelihood)} cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        <div className="text-center">
                          <p className="text-2xl font-bold">{cell.risks.length}</p>
                          {cell.risks.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {cell.risks.slice(0, 2).map(risk => (
                                <p key={risk.id} className="text-xs truncate">
                                  {risk.risk_title}
                                </p>
                              ))}
                              {cell.risks.length > 2 && (
                                <p className="text-xs">+{cell.risks.length - 2} more</p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-200 border"></div>
              <span>{t({ en: 'Low Risk', ar: 'منخفض' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-300 border"></div>
              <span>{t({ en: 'Medium Risk', ar: 'متوسط' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-400 border"></div>
              <span>{t({ en: 'High Risk', ar: 'عالي' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 border"></div>
              <span>{t({ en: 'Critical Risk', ar: 'حرج' })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RiskHeatmap, { requireAdmin: true });