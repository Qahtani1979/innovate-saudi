import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Award, TrendingUp, Building2, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function ProviderLeaderboard() {
  const { t, language } = useLanguage();

  const { data: organizations = [] } = useQuery({
    queryKey: ['org-leaderboard'],
    queryFn: () => base44.entities.Organization.list()
  });

  const rankedOrgs = organizations
    .filter(o => o.reputation_score > 0)
    .sort((a, b) => (b.reputation_score || 0) - (a.reputation_score || 0))
    .slice(0, 20);

  const medalColors = {
    0: 'from-yellow-400 to-amber-500',
    1: 'from-slate-300 to-slate-400',
    2: 'from-amber-600 to-amber-700'
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div>
          <h1 className="text-5xl font-bold mb-2">
            {t({ en: '🏆 Provider Leaderboard', ar: '🏆 لوحة المتصدرين' })}
          </h1>
          <p className="text-xl text-white/90">
            {t({ en: 'Top-performing solution providers and organizations', ar: 'أفضل مزودي الحلول والمنظمات أداءً' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rankedOrgs.slice(0, 3).map((org, idx) => (
          <Card key={org.id} className={`border-4 ${idx === 0 ? 'border-yellow-400' : idx === 1 ? 'border-slate-300' : 'border-amber-600'}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${medalColors[idx]} mx-auto flex items-center justify-center mb-4 shadow-lg`}>
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-1">#{idx + 1}</div>
                <Link to={createPageUrl(`OrganizationDetail?id=${org.id}`)}>
                  <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-700 mb-2">
                    {org.name_en}
                  </h3>
                </Link>
                <Badge className="mb-3">{org.org_type?.replace(/_/g, ' ')}</Badge>
                <div className="text-3xl font-bold text-purple-600 mb-4">{org.reputation_score}</div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="font-semibold">{org.performance_metrics?.solution_count || 0}</p>
                    <p className="text-slate-600">{t({ en: 'Solutions', ar: 'حلول' })}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="font-semibold">{org.performance_metrics?.deployment_wins || 0}</p>
                    <p className="text-slate-600">{t({ en: 'Deployments', ar: 'نشر' })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Full Rankings', ar: 'الترتيب الكامل' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rankedOrgs.map((org, idx) => (
              <Link key={org.id} to={createPageUrl(`OrganizationDetail?id=${org.id}`)}>
                <div className="p-4 border-2 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-slate-400 w-8">#{idx + 1}</div>
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{org.name_en}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{org.org_type?.replace(/_/g, ' ')}</Badge>
                        {org.sectors?.slice(0, 2).map((sector, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{sector}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{org.reputation_score}</div>
                      <Progress value={org.reputation_score} className="w-24 h-2" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 mt-3 text-xs text-center">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="font-semibold text-blue-700">{org.reputation_factors?.delivery_quality || 0}</p>
                      <p className="text-slate-600">{t({ en: 'Quality', ar: 'جودة' })}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="font-semibold text-green-700">{org.reputation_factors?.timeliness || 0}</p>
                      <p className="text-slate-600">{t({ en: 'Time', ar: 'وقت' })}</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <p className="font-semibold text-purple-700">{org.reputation_factors?.innovation_score || 0}</p>
                      <p className="text-slate-600">{t({ en: 'Innovation', ar: 'ابتكار' })}</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded">
                      <p className="font-semibold text-amber-700">{org.reputation_factors?.stakeholder_satisfaction || 0}</p>
                      <p className="text-slate-600">{t({ en: 'Satisfaction', ar: 'رضا' })}</p>
                    </div>
                    <div className="p-2 bg-teal-50 rounded">
                      <p className="font-semibold text-teal-700">{org.reputation_factors?.impact_achievement || 0}</p>
                      <p className="text-slate-600">{t({ en: 'Impact', ar: 'تأثير' })}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}