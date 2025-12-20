import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Award, AlertCircle } from 'lucide-react';

export default function PerformanceBenchmarking({ challenge }) {
  const { language, isRTL, t } = useLanguage();

  const { data: similarChallenges = [] } = useQuery({
    queryKey: ['similar-challenges-benchmark', challenge.sector],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('sector', challenge.sector)
        .eq('status', 'resolved')
        .neq('id', challenge.id);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('municipalities').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  if (similarChallenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {t({ en: 'Not enough data for benchmarking', ar: 'بيانات غير كافية للمقارنة' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate benchmarks
  const avgResolutionTime = similarChallenges.reduce((sum, c) => {
    if (c.created_date && c.resolution_date) {
      const days = (new Date(c.resolution_date) - new Date(c.created_date)) / (1000 * 60 * 60 * 24);
      return sum + days;
    }
    return sum;
  }, 0) / similarChallenges.filter(c => c.created_date && c.resolution_date).length;

  const avgScore = similarChallenges.reduce((sum, c) => sum + (c.overall_score || 0), 0) / similarChallenges.length;

  const thisResolutionTime = challenge.created_date && challenge.resolution_date
    ? (new Date(challenge.resolution_date) - new Date(challenge.created_date)) / (1000 * 60 * 60 * 24)
    : null;

  const chartData = [
    {
      name: t({ en: 'This Challenge', ar: 'هذا التحدي' }),
      score: challenge.overall_score || 0,
      days: thisResolutionTime || 0
    },
    {
      name: t({ en: 'Sector Average', ar: 'متوسط القطاع' }),
      score: Math.round(avgScore),
      days: Math.round(avgResolutionTime)
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Award className="h-5 w-5" />
            {t({ en: 'Performance Benchmarking', ar: 'قياس الأداء' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-500 mb-1">
                {t({ en: 'Overall Score', ar: 'النقاط الإجمالية' })}
              </p>
              <p className="text-3xl font-bold text-blue-600">{challenge.overall_score || 0}</p>
              <p className="text-xs text-slate-600 mt-1">
                {t({ en: 'vs sector avg:', ar: 'مقابل متوسط القطاع:' })} {Math.round(avgScore)}
              </p>
              {challenge.overall_score > avgScore && (
                <Badge className="bg-green-100 text-green-700 text-xs mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t({ en: 'Above average', ar: 'فوق المتوسط' })}
                </Badge>
              )}
            </div>

            {thisResolutionTime && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-slate-500 mb-1">
                  {t({ en: 'Resolution Time', ar: 'وقت الحل' })}
                </p>
                <p className="text-3xl font-bold text-purple-600">{Math.round(thisResolutionTime)}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {t({ en: 'days (avg:', ar: 'أيام (المتوسط:' })} {Math.round(avgResolutionTime)})
                </p>
                {thisResolutionTime < avgResolutionTime && (
                  <Badge className="bg-green-100 text-green-700 text-xs mt-2">
                    {t({ en: 'Faster than average', ar: 'أسرع من المتوسط' })}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Comparison Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="score" fill="#3b82f6" name={t({ en: 'Score', ar: 'النقاط' })} />
                <Bar yAxisId="right" dataKey="days" fill="#8b5cf6" name={t({ en: 'Days', ar: 'الأيام' })} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peer Comparison */}
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">
              {t({ en: 'Top Performing Municipalities (Same Sector)', ar: 'البلديات الأفضل أداءً (نفس القطاع)' })}
            </p>
            <div className="space-y-2">
              {similarChallenges
                .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
                .slice(0, 5)
                .map((c, i) => {
                  const muni = municipalities.find(m => m.id === c.municipality_id);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {i + 1}
                        </div>
                        <span className="text-sm text-slate-700">
                          {muni?.name_en || c.municipality_id?.substring(0, 20)}
                        </span>
                      </div>
                      <Badge variant="outline">{c.overall_score || 0}</Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}