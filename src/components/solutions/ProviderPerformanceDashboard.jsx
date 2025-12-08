import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Award, TrendingUp, DollarSign, ThumbsUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProviderPerformanceDashboard({ providerId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: solutions = [] } = useQuery({
    queryKey: ['provider-solutions', providerId],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.provider_id === providerId);
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['provider-pilots', providerId],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => solutions.some(s => s.id === p.solution_id));
    },
    enabled: solutions.length > 0
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['solution-matches', providerId],
    queryFn: async () => {
      const all = await base44.entities.ChallengeSolutionMatch.list();
      return all.filter(m => solutions.some(s => s.id === m.solution_id));
    },
    enabled: solutions.length > 0
  });

  const winRate = matches.length > 0 ? (pilots.length / matches.length) * 100 : 0;
  const successRate = pilots.length > 0 
    ? (pilots.filter(p => p.recommendation === 'scale').length / pilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length) * 100 
    : 0;
  const avgRating = solutions.reduce((sum, s) => sum + (s.ratings?.average || 0), 0) / Math.max(solutions.length, 1);
  const totalDeployments = solutions.reduce((sum, s) => sum + (s.deployment_count || 0), 0);

  const sectorData = solutions.reduce((acc, s) => {
    s.sectors?.forEach(sector => {
      acc[sector] = (acc[sector] || 0) + 1;
    });
    return acc;
  }, {});

  const chartData = Object.entries(sectorData).map(([sector, count]) => ({
    sector: sector.replace(/_/g, ' '),
    count
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{winRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Win Rate', ar: 'معدل الفوز' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{successRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <ThumbsUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Rating', ar: 'متوسط التقييم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{totalDeployments}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Deployments', ar: 'عمليات النشر' })}</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {t({ en: 'Solutions by Sector', ar: 'الحلول حسب القطاع' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}