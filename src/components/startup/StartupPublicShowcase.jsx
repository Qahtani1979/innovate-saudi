import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Rocket, Award, CheckCircle2, Star } from 'lucide-react';

export default function StartupPublicShowcase() {
  const { language, isRTL, t } = useLanguage();

  const { data: startups = [] } = useQuery({
    queryKey: ['verified-startups'],
    queryFn: async () => {
      const all = await base44.entities.StartupProfile.list();
      return all.filter(s => s.is_verified);
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['all-solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: awards = [] } = useQuery({
    queryKey: ['provider-awards'],
    queryFn: () => base44.entities.ProviderAward.list()
  });

  const enrichedStartups = startups.map(startup => {
    const startupSolutions = solutions.filter(s => s.provider_type === 'startup' && s.provider_name === startup.name_en);
    const startupAwards = awards.filter(a => a.provider_id === startup.id);
    
    return {
      ...startup,
      solutions_count: startupSolutions.length,
      total_deployments: startupSolutions.reduce((sum, s) => sum + (s.deployment_count || 0), 0),
      avg_rating: startupSolutions.reduce((sum, s) => sum + (s.average_rating || 0), 0) / Math.max(startupSolutions.length, 1),
      awards_count: startupAwards.length
    };
  }).sort((a, b) => b.total_deployments - a.total_deployments);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-700 to-pink-600 bg-clip-text text-transparent">
          {t({ en: '🚀 Featured Solution Providers', ar: '🚀 مزودو الحلول المميزون' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Verified startups successfully deploying solutions across Saudi municipalities', ar: 'الشركات الناشئة المعتمدة التي تنشر الحلول بنجاح عبر البلديات السعودية' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedStartups.map((startup) => (
          <Link key={startup.id} to={createPageUrl(`StartupProfile?id=${startup.id}`)}>
            <Card className="hover:shadow-xl transition-all border-2 hover:border-orange-400">
              <CardHeader className="bg-gradient-to-br from-orange-50 to-pink-50">
                <div className="flex items-center gap-3 mb-2">
                  {startup.logo_url ? (
                    <img src={startup.logo_url} className="h-12 w-12 rounded-lg object-cover" alt={startup.name_en} />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base">{language === 'ar' && startup.name_ar ? startup.name_ar : startup.name_en}</CardTitle>
                    <div className="flex gap-1 mt-1">
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'Verified', ar: 'معتمد' })}
                      </Badge>
                      {startup.awards_count > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {startup.awards_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm text-slate-700 line-clamp-2">
                  {language === 'ar' && startup.description_ar ? startup.description_ar : startup.description_en}
                </p>

                <div className="flex flex-wrap gap-1">
                  {startup.sectors?.slice(0, 3).map(sector => (
                    <Badge key={sector} variant="outline" className="text-xs">
                      {sector.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center text-xs">
                  <div>
                    <p className="font-bold text-blue-600">{startup.solutions_count}</p>
                    <p className="text-slate-600">{t({ en: 'Solutions', ar: 'حلول' })}</p>
                  </div>
                  <div>
                    <p className="font-bold text-green-600">{startup.total_deployments}</p>
                    <p className="text-slate-600">{t({ en: 'Deployed', ar: 'منشور' })}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-bold text-amber-600 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-600" />
                      {startup.avg_rating.toFixed(1)}
                    </p>
                    <p className="text-slate-600">{t({ en: 'Rating', ar: 'تقييم' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}