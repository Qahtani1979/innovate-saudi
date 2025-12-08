import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BarChart2, TrendingUp } from 'lucide-react';

export default function ProgramBenchmarking() {
  const { language, t } = useLanguage();

  const benchmarks = [
    { metric: 'Application Conversion', ours: 35, industry: 25, best: 45 },
    { metric: 'Pilot Launch Rate', ours: 42, industry: 30, best: 60 },
    { metric: 'Alumni Satisfaction', ours: 88, industry: 75, best: 92 },
    { metric: 'Post-Program Funding', ours: 65, industry: 50, best: 80 }
  ];

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-blue-600" />
          {t({ en: 'Program Benchmarking', ar: 'معايير البرنامج' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {benchmarks.map((b, i) => (
          <div key={i} className="p-3 bg-white rounded border">
            <p className="font-semibold text-sm text-slate-900 mb-2">{b.metric}</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600">{t({ en: 'Us', ar: 'نحن' })}: {b.ours}%</Badge>
              <Badge variant="outline">{t({ en: 'Avg', ar: 'معدل' })}: {b.industry}%</Badge>
              <Badge className="bg-green-600">{t({ en: 'Best', ar: 'أفضل' })}: {b.best}%</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}