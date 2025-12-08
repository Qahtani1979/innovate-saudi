import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles, BarChart3, Globe } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function TrendsPage() {
  const { language, isRTL, t } = useLanguage();

  const { data: trends = [] } = useQuery({
    queryKey: ['trends'],
    queryFn: () => base44.entities.TrendEntry.list()
  });

  const { data: globalTrends = [] } = useQuery({
    queryKey: ['global-trends'],
    queryFn: () => base44.entities.GlobalTrend.list()
  });

  const mockTrendData = [
    { month: 'Jan', complaints: 120, pilots: 8, solutions: 15 },
    { month: 'Feb', complaints: 135, pilots: 10, solutions: 18 },
    { month: 'Mar', complaints: 125, pilots: 12, solutions: 22 },
    { month: 'Apr', complaints: 110, pilots: 15, solutions: 25 },
    { month: 'May', complaints: 95, pilots: 18, solutions: 28 },
    { month: 'Jun', complaints: 80, pilots: 20, solutions: 32 }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Innovation Trends', ar: 'اتجاهات الابتكار' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Monitor innovation patterns and emerging opportunities', ar: 'مراقبة أنماط الابتكار والفرص الناشئة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Complaint Reduction', ar: 'تقليل الشكاوى' })}</p>
                <p className="text-3xl font-bold text-green-600">-33%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
                <p className="text-3xl font-bold text-blue-600">+150%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Solution Growth', ar: 'نمو الحلول' })}</p>
                <p className="text-3xl font-bold text-purple-600">+113%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: '6-Month Trend Analysis', ar: 'تحليل اتجاهات 6 أشهر' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="complaints" stroke="#ef4444" strokeWidth={2} name="Complaints" />
              <Line type="monotone" dataKey="pilots" stroke="#3b82f6" strokeWidth={2} name="Pilots" />
              <Line type="monotone" dataKey="solutions" stroke="#8b5cf6" strokeWidth={2} name="Solutions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {t({ en: 'Emerging Challenges', ar: 'تحديات ناشئة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Drainage overflow in rainy season', 'Smart parking demand', 'Green space accessibility'].map((trend, i) => (
                <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-red-900">{trend}</p>
                    <Badge className="bg-red-600 text-white">+{15 + i * 5}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              {t({ en: 'Global Best Practices', ar: 'أفضل الممارسات العالمية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {globalTrends.slice(0, 3).map((trend) => (
                <div key={trend.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    {language === 'ar' && trend.title_ar ? trend.title_ar : trend.title_en}
                  </p>
                  {trend.source && (
                    <p className="text-xs text-slate-600 mt-1">{trend.source}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(TrendsPage, { requiredPermissions: [] });