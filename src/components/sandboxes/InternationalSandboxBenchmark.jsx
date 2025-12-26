import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Globe } from 'lucide-react';

export default function InternationalSandboxBenchmark() {
  const { language, t } = useLanguage();

  const benchmarks = [
    {
      name: 'UK FCA Regulatory Sandbox',
      country: 'United Kingdom',
      domain: 'Fintech',
      approval_time: '6 months',
      success_rate: 75,
      best_practice: 'Fast-track pathway for proven tech reduced approval by 60%'
    },
    {
      name: 'Singapore MAS Sandbox',
      country: 'Singapore',
      domain: 'Fintech, Digital',
      approval_time: '4 months',
      success_rate: 82,
      best_practice: 'Pre-approved frameworks for common use cases'
    },
    {
      name: 'UAE AI Sandbox',
      country: 'UAE',
      domain: 'AI, Smart Cities',
      approval_time: '3 months',
      success_rate: 78,
      best_practice: 'Automated compliance checking reduces manual review'
    },
    {
      name: 'Australia ASIC Sandbox',
      country: 'Australia',
      domain: 'Fintech',
      approval_time: '8 months',
      success_rate: 68,
      best_practice: 'Graduated regulatory relief based on project maturity'
    }
  ];

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          {t({ en: 'International Benchmarking', ar: 'المعايير الدولية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {benchmarks.map((bench, i) => (
          <div key={i} className="p-4 bg-white rounded-lg border-2 border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-slate-900">{bench.name}</h4>
                <p className="text-xs text-slate-600">{bench.country} • {bench.domain}</p>
              </div>
              <Badge className="bg-green-600">{bench.success_rate}%</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded text-center">
                <p className="text-xs text-slate-500">{t({ en: 'Approval Time', ar: 'وقت الموافقة' })}</p>
                <p className="text-sm font-semibold text-blue-900">{bench.approval_time}</p>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <p className="text-xs text-slate-500">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
                <p className="text-sm font-semibold text-green-900">{bench.success_rate}%</p>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-1">
                {t({ en: '💡 Best Practice:', ar: '💡 أفضل ممارسة:' })}
              </p>
              <p className="text-xs text-purple-700">{bench.best_practice}</p>
            </div>
          </div>
        ))}

        <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-300 mt-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            {t({ en: '🎯 Recommendations for Saudi Context', ar: '🎯 توصيات للسياق السعودي' })}
          </p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Adopt fast-track pathway for proven technologies (UK model)</li>
            <li>• Implement automated compliance checks (UAE model)</li>
            <li>• Target 4-6 month approval time (Singapore benchmark)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
