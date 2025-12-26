import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Monitor, Play, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SandboxDigitalTwin({ project }) {
  const { language, t } = useLanguage();
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = () => {
    setSimulating(true);
    // Simulate processing
    setTimeout(() => {
      setResults({
        traffic_impact: '12% congestion increase at peak hours',
        energy_usage: '340 kWh/day avg consumption',
        safety_score: 85,
        optimization: 'Reduce sensor density by 15% for same coverage',
        risk_detected: 'Minor safety concern at intersection B - adjust placement'
      });
      setSimulating(false);
      toast.success(t({ en: 'Simulation complete', ar: 'المحاكاة مكتملة' }));
    }, 2000);
  };

  return (
    <Card className="border-2 border-cyan-300">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-cyan-600" />
            {t({ en: 'Digital Twin Simulator', ar: 'محاكي التوأم الرقمي' })}
          </CardTitle>
          <Button onClick={runSimulation} disabled={simulating} size="sm" className="bg-cyan-600">
            <Play className="h-4 w-4 mr-2" />
            {t({ en: simulating ? 'Running...' : 'Run Simulation', ar: simulating ? 'يعمل...' : 'تشغيل المحاكاة' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!results && !simulating && (
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 text-cyan-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Pre-test your project in virtual environment before deployment', ar: 'اختبار مشروعك مسبقاً في بيئة افتراضية قبل النشر' })}
            </p>
          </div>
        )}

        {simulating && (
          <div className="text-center py-8">
            <div className="animate-spin h-12 w-12 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-600">{t({ en: 'Running simulation...', ar: 'تشغيل المحاكاة...' })}</p>
          </div>
        )}

        {results && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded border">
              <p className="text-xs text-slate-500 font-semibold">{t({ en: 'Traffic Impact:', ar: 'تأثير المرور:' })}</p>
              <p className="text-sm text-slate-900">{results.traffic_impact}</p>
            </div>
            <div className="p-3 bg-green-50 rounded border">
              <p className="text-xs text-slate-500 font-semibold">{t({ en: 'Energy Usage:', ar: 'استهلاك الطاقة:' })}</p>
              <p className="text-sm text-slate-900">{results.energy_usage}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded border">
              <p className="text-xs text-slate-500 font-semibold">{t({ en: 'Safety Score:', ar: 'درجة السلامة:' })}</p>
              <Badge className="bg-green-600 text-lg">{results.safety_score}/100</Badge>
            </div>
            <div className="p-3 bg-cyan-50 rounded border-2 border-cyan-200">
              <p className="text-xs text-cyan-700 font-semibold mb-1">💡 {t({ en: 'Optimization:', ar: 'التحسين:' })}</p>
              <p className="text-sm text-cyan-900">{results.optimization}</p>
            </div>
            {results.risk_detected && (
              <div className="p-3 bg-red-50 rounded border-2 border-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-700 font-semibold">{t({ en: 'Risk Detected:', ar: 'خطر مكتشف:' })}</p>
                    <p className="text-sm text-red-900">{results.risk_detected}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
