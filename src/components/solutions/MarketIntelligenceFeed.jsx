import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, AlertCircle, DollarSign, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function MarketIntelligenceFeed({ providerSectors }) {
  const { language, isRTL, t } = useLanguage();

  const { data: recentChallenges = [] } = useQuery({
    queryKey: ['recent-challenges', providerSectors],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list('-created_date');
      return all
        .filter(c => c.status === 'approved' && providerSectors?.some(s => c.sector === s))
        .slice(0, 10);
    },
    enabled: !!providerSectors
  });

  const sectorDemand = recentChallenges.reduce((acc, c) => {
    acc[c.sector] = (acc[c.sector] || 0) + 1;
    return acc;
  }, {});

  const avgBudget = recentChallenges
    .filter(c => c.budget_estimate)
    .reduce((sum, c) => sum + c.budget_estimate, 0) / 
    Math.max(recentChallenges.filter(c => c.budget_estimate).length, 1);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-5 w-5" />
            {t({ en: 'Market Intelligence', ar: 'ذكاء السوق' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded text-center border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{recentChallenges.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'New Opportunities', ar: 'فرص جديدة' })}</p>
            </div>
            <div className="p-3 bg-green-50 rounded text-center border border-green-200">
              <p className="text-xl font-bold text-green-600">
                {(avgBudget / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-slate-600">{t({ en: 'Avg Budget', ar: 'متوسط الميزانية' })}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded text-center border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">{Object.keys(sectorDemand).length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Active Sectors', ar: 'قطاعات نشطة' })}</p>
            </div>
          </div>

          {Object.entries(sectorDemand).length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                {t({ en: 'Demand by Sector', ar: 'الطلب حسب القطاع' })}
              </p>
              <div className="space-y-2">
                {Object.entries(sectorDemand).slice(0, 5).map(([sector, count]) => (
                  <div key={sector} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                    <span className="text-sm text-slate-700 capitalize">{sector.replace(/_/g, ' ')}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              {t({ en: 'Latest Opportunities', ar: 'أحدث الفرص' })}
            </p>
            <div className="space-y-2">
              {recentChallenges.slice(0, 5).map((challenge) => (
                <Link
                  key={challenge.id}
                  to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}
                  className="block p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 line-clamp-1">{challenge.title_en}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{challenge.sector?.replace(/_/g, ' ')}</Badge>
                        {challenge.budget_estimate && (
                          <span className="text-xs text-slate-600">
                            {(challenge.budget_estimate / 1000).toFixed(0)}K SAR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}