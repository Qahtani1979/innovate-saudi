import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';

export default function TeamPerformanceAnalytics({ team }) {
  const { language, isRTL, t } = useLanguage();

  const metrics = [
    { label: { en: 'Productivity', ar: 'الإنتاجية' }, value: 87, trend: 'up', color: 'green' },
    { label: { en: 'Collaboration', ar: 'التعاون' }, value: 92, trend: 'up', color: 'blue' },
    { label: { en: 'Innovation', ar: 'الابتكار' }, value: 78, trend: 'stable', color: 'purple' },
    { label: { en: 'Quality', ar: 'الجودة' }, value: 85, trend: 'up', color: 'amber' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          {t({ en: 'Team Performance Analytics', ar: 'تحليلات أداء الفريق' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className={`p-4 bg-${metric.color}-50 rounded-lg border-2 border-${metric.color}-200`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-900">{metric.label[language]}</p>
                {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
              </div>
              <p className={`text-3xl font-bold text-${metric.color}-600`}>{metric.value}%</p>
              <Progress value={metric.value} className="h-1 mt-2" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{t({ en: 'Top Contributors', ar: 'أفضل المساهمين' })}</h4>
          <div className="space-y-2">
            {[
              { name: 'Sarah Ahmed', contributions: 24, role: 'Lead' },
              { name: 'Mohammed Ali', contributions: 18, role: 'Member' },
              { name: 'Fatima Hassan', contributions: 15, role: 'Member' }
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                <Badge variant="outline">{member.contributions} actions</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}