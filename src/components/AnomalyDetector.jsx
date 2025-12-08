import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from './LanguageContext';
import { AlertTriangle, TrendingDown, TrendingUp, Zap } from 'lucide-react';

export default function AnomalyDetector({ kpis = [], entityName }) {
  const { language, isRTL, t } = useLanguage();

  // Mock anomaly detection logic
  const detectAnomalies = (kpi) => {
    const baseline = parseFloat(kpi.baseline) || 100;
    const current = parseFloat(kpi.current) || baseline;
    const target = parseFloat(kpi.target) || baseline * 0.7;
    
    const changePercent = ((current - baseline) / baseline) * 100;
    const targetProgress = ((baseline - current) / (baseline - target)) * 100;

    // Anomaly rules
    if (changePercent > 20) return { type: 'spike', severity: 'high', message: 'Unexpected spike detected' };
    if (changePercent < -20 && targetProgress < 50) return { type: 'slowdown', severity: 'medium', message: 'Progress slower than expected' };
    if (targetProgress > 150) return { type: 'overperformance', severity: 'low', message: 'Exceeding target trajectory' };
    
    return null;
  };

  const anomalies = kpis.map((kpi, idx) => ({
    kpi,
    anomaly: detectAnomalies(kpi),
    index: idx
  })).filter(item => item.anomaly);

  if (anomalies.length === 0) return null;

  const severityColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300'
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          {t({ en: 'AI Anomaly Detection', ar: 'كشف الشذوذ بالذكاء الاصطناعي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm font-medium text-orange-900">
            ⚡ {anomalies.length} {t({ en: 'anomalies detected in KPI performance', ar: 'شذوذ تم اكتشافه في أداء المؤشرات' })}
          </p>
        </div>

        {anomalies.map(({ kpi, anomaly, index }) => (
          <div key={index} className={`p-4 rounded-lg border-2 ${severityColors[anomaly.severity]}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {anomaly.type === 'spike' && <TrendingUp className="h-4 w-4 text-red-600" />}
                  {anomaly.type === 'slowdown' && <TrendingDown className="h-4 w-4 text-yellow-600" />}
                  {anomaly.type === 'overperformance' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                  <span className="font-medium text-sm">{kpi.name}</span>
                </div>
                <p className="text-xs text-slate-600">{anomaly.message}</p>
              </div>
              <Badge className={severityColors[anomaly.severity]} variant="outline">
                {anomaly.severity}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs mt-2">
              <span className="text-slate-600">
                {t({ en: 'Baseline:', ar: 'الأساس:' })} <strong>{kpi.baseline}</strong>
              </span>
              <span className="text-slate-600">
                {t({ en: 'Current:', ar: 'الحالي:' })} <strong className="text-blue-600">{kpi.current || 'N/A'}</strong>
              </span>
              <span className="text-slate-600">
                {t({ en: 'Target:', ar: 'الهدف:' })} <strong className="text-green-600">{kpi.target}</strong>
              </span>
            </div>

            <Button size="sm" variant="outline" className="mt-3 w-full">
              {t({ en: 'View Detailed Analysis', ar: 'عرض التحليل التفصيلي' })}
            </Button>
          </div>
        ))}

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            💡 {t({ en: 'AI recommendations will be generated within 24 hours', ar: 'سيتم إنشاء التوصيات الذكية خلال 24 ساعة' })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}