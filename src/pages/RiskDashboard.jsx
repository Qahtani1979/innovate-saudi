import { useRisksWithVisibility } from '@/hooks/useRisksWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { AlertTriangle, Target, Shield } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RiskDashboard() {
  const { t } = useLanguage();

  const { data: risks = [], isLoading } = useRisksWithVisibility();

  const impactMap = { low: 1, medium: 2, high: 3, critical: 4 };
  const likelihoodMap = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };

  const matrixData = risks.map(r => ({
    name: r.risk_title,
    likelihood: likelihoodMap[r.likelihood] || 3,
    impact: impactMap[r.impact] || 2,
    severity: r.severity,
    id: r.id
  }));

  const severityColors = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
  };

  const stats = {
    total: risks.length,
    critical: risks.filter(r => r.severity === 'critical').length,
    mitigated: risks.filter(r => r.status === 'mitigated').length,
    active: risks.filter(r => r.status === 'active').length
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
          {t({ en: 'Risk Dashboard', ar: 'لوحة المخاطر' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Risk matrix and mitigation tracking', ar: 'مصفوفة المخاطر وتتبع التخفيف' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Risks', ar: 'إجمالي المخاطر' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Critical', ar: 'حرج' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.active}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <Shield className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.mitigated}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Mitigated', ar: 'مُخفّف' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Risk Matrix (Likelihood vs Impact)', ar: 'مصفوفة المخاطر (الاحتمالية مقابل التأثير)' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="likelihood"
                name="Likelihood"
                domain={[0, 6]}
                label={{ value: t({ en: 'Likelihood →', ar: 'الاحتمالية ←' }), position: 'bottom' }}
              />
              <YAxis
                type="number"
                dataKey="impact"
                name="Impact"
                domain={[0, 5]}
                label={{ value: t({ en: '↑ Impact', ar: '↑ التأثير' }), angle: -90, position: 'left' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={matrixData} fill="#3b82f6">
                {matrixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={severityColors[entry.severity] || '#3b82f6'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: severityColors.low }}></div>
              <span>{t({ en: 'Low', ar: 'منخفض' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: severityColors.medium }}></div>
              <span>{t({ en: 'Medium', ar: 'متوسط' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: severityColors.high }}></div>
              <span>{t({ en: 'High', ar: 'عالي' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: severityColors.critical }}></div>
              <span>{t({ en: 'Critical', ar: 'حرج' })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RiskDashboard, { requireAdmin: true });