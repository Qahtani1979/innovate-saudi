
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ServiceChallengeAggregation({ serviceId }) {
  const { t, language } = useLanguage();

  const { data: service } = useQuery({
    queryKey: ['service-detail', serviceId],
    queryFn: async () => {
      const services = await base44.entities.Service.list();
      return services.find(s => s.id === serviceId);
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['service-challenges', serviceId],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.service_id === serviceId || c.affected_services?.includes(serviceId));
    }
  });

  const { data: performance = [] } = useQuery({
    queryKey: ['service-performance', serviceId],
    queryFn: async () => {
      const all = await base44.entities.ServicePerformance.list();
      return all.filter(p => p.service_id === serviceId)
        .sort((a, b) => new Date(b.period_end) - new Date(a.period_end));
    }
  });

  const openChallenges = challenges.filter(c => !['resolved', 'archived'].includes(c.status));
  const resolvedChallenges = challenges.filter(c => c.status === 'resolved');
  const resolutionRate = challenges.length > 0 
    ? Math.round((resolvedChallenges.length / challenges.length) * 100)
    : 0;

  const latestPerformance = performance[0];
  const challengesByType = challenges.reduce((acc, c) => {
    acc[c.challenge_type] = (acc[c.challenge_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {t({ en: 'Service Challenge Analytics', ar: 'تحليلات تحديات الخدمة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded">
            <p className="text-2xl font-bold text-red-600">{openChallenges.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Open Issues', ar: 'مشاكل مفتوحة' })}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-2xl font-bold text-green-600">{resolvedChallenges.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Resolved', ar: 'محلولة' })}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <p className="text-2xl font-bold text-blue-600">{resolutionRate}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Resolution Rate', ar: 'معدل الحل' })}</p>
          </div>
        </div>

        {latestPerformance && (
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs font-semibold text-amber-900 mb-2">
              {t({ en: 'Latest Performance', ar: 'آخر أداء' })}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-600">SLA Compliance</p>
                <p className="font-bold">{latestPerformance.sla_compliance_rate}%</p>
              </div>
              <div>
                <p className="text-slate-600">Quality Score</p>
                <p className="font-bold">{latestPerformance.quality_score}%</p>
              </div>
            </div>
          </div>
        )}

        {Object.keys(challengesByType).length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">{t({ en: 'Challenges by Type', ar: 'التحديات حسب النوع' })}</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(challengesByType).map(([type, count]) => (
                <Badge key={type} variant="outline">
                  {type?.replace(/_/g, ' ')}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {openChallenges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t({ en: 'Active Challenges', ar: 'التحديات النشطة' })}</p>
            {openChallenges.slice(0, 3).map(c => (
              <Link key={c.id} to={createPageUrl(`ChallengeDetail?id=${c.id}`)}>
                <div className="p-2 bg-white rounded border hover:border-blue-300 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm flex-1">{language === 'ar' && c.title_ar ? c.title_ar : c.title_en}</p>
                    <Badge className="text-xs">{c.priority}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}