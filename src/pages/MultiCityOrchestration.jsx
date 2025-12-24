import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Building2, Network, Activity, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

function MultiCityOrchestration() {
  const { language, isRTL, t } = useLanguage();

  const { data: municipalities = [] } = useMunicipalitiesWithVisibility({ includeAll: true });
  const { data: pilots = [] } = usePilotsWithVisibility({ includeAll: true });
  const { data: challenges = [] } = useChallengesWithVisibility({ includeAll: true });

  const multiCityPilots = pilots.filter(p => p.scaling_plan?.target_locations?.length > 1);
  const activeMunicipalities = municipalities.filter(m =>
    pilots.some(p => p.municipality_id === m.id && ['active', 'monitoring'].includes(p.stage))
  );

  return (
    <PageLayout>
      <PageHeader
        icon={Network}
        title={{ en: 'Multi-City Orchestration', ar: 'Ø§Ù„ØªÙ†Ø³ÙŠÙ‚ Ù…ØªØ¹Ø¯Ø¯ Ø§Ù„Ù…Ø¯Ù†' }}
        subtitle={{ en: 'Coordinate innovation across municipalities', ar: 'تنسيق الابتكار عبر البلديات' }}
        description={{ en: '', ar: '' }}
        stats={[
          { icon: Building2, value: activeMunicipalities.length, label: { en: 'Active Cities', ar: 'Ù…Ø¯Ù† Ù†Ø´Ø·Ø©' } },
          { icon: Network, value: multiCityPilots.length, label: { en: 'Multi-City Pilots', ar: 'ØªØ¬Ø§Ø±Ø¨ Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ù…Ø¯Ù†' } },
          { icon: Activity, value: pilots.length, label: { en: 'Total Pilots', ar: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØªØ¬Ø§Ø±Ø¨' } },
        ]}
        action={<></>}
        actions={<></>}
        children={<></>}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{activeMunicipalities.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Cities', ar: 'Ù…Ø¯Ù† Ù†Ø´Ø·Ø©' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{multiCityPilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Multi-City Pilots', ar: 'ØªØ¬Ø§Ø±Ø¨ Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ù…Ø¯Ù†' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{pilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Pilots', ar: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØªØ¬Ø§Ø±Ø¨' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{challenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Challenges', ar: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØªØ­Ø¯ÙŠØ§Øª' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Municipalities */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Municipalities', ar: 'Ø§Ù„Ø¨Ù„Ø¯ÙŠØ§Øª Ø§Ù„Ù†Ø´Ø·Ø©' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMunicipalities.map((muni) => {
              const muniChallenges = challenges.filter(c => c.municipality_id === muni.id);
              const muniPilots = pilots.filter(p => p.municipality_id === muni.id);

              return (
                <Link key={muni.id} to={createPageUrl(`MunicipalityProfile?id=${muni.id}`)}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {language === 'ar' && muni.name_ar ? muni.name_ar : muni.name_en}
                          </h3>
                          <p className="text-xs text-slate-500">{muni.region}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {muniChallenges.length} {t({ en: 'challenges', ar: 'ØªØ­Ø¯ÙŠØ§Øª' })}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {muniPilots.length} {t({ en: 'pilots', ar: 'ØªØ¬Ø§Ø±Ø¨' })}
                            </Badge>
                          </div>
                          {muni.mii_score && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span className="text-sm font-medium text-slate-700">
                                  {t({ en: 'MII Score:', ar: 'Ù†Ù‚Ø§Ø· MII:' })} {muni.mii_score}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Multi-City Pilots */}
      {multiCityPilots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Multi-City Pilots', ar: 'Ø§Ù„ØªØ¬Ø§Ø±Ø¨ Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ù…Ø¯Ù†' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {multiCityPilots.map((pilot) => (
                <Link key={pilot.id} to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="mb-2">{pilot.stage}</Badge>
                        <h3 className="font-semibold text-slate-900">
                          {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {t({ en: 'Target locations:', ar: 'Ø§Ù„Ù…ÙˆØ§Ù‚Ø¹ Ø§Ù„Ù…Ø³ØªÙ‡Ø¯ÙØ©:' })} {pilot.scaling_plan.target_locations.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(MultiCityOrchestration, { requiredPermissions: [] });
