import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MatchmakerMarketIntelligence() {
  const { language, t } = useLanguage();

  const trendData = [
    { sector: 'AI/ML', demand: 15, supply: 8 },
    { sector: 'IoT', demand: 12, supply: 14 },
    { sector: 'Transport', demand: 9, supply: 6 },
    { sector: 'Environment', demand: 7, supply: 11 }
  ];

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Market Intelligence', ar: 'ذكاء السوق' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-3">{t({ en: 'Supply-Demand Gap', ar: 'فجوة العرض والطلب' })}</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={trendData}>
              <XAxis dataKey="sector" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="demand" fill="#3b82f6" name="Demand" />
              <Bar dataKey="supply" fill="#10b981" name="Supply" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-red-50 rounded border-2 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-900">{t({ en: 'Supply Gaps:', ar: 'فجوات العرض:' })}</p>
              <p className="text-xs text-red-700">AI/ML and Transport sectors have high demand, low supply</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}