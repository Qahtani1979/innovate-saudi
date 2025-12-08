import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Lightbulb, Users, DollarSign, Award, CheckCircle, Rocket, Sparkles, Target, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useState } from 'react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import StartupCredentialBadges from '../components/startup/StartupCredentialBadges';

function StartupProfile() {
  const { language, isRTL, t } = useLanguage();
  const startupId = new URLSearchParams(window.location.search).get('id');
  const [aiMatches, setAiMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const { data: startup, isLoading } = useQuery({
    queryKey: ['startupProfile', startupId],
    queryFn: async () => {
      if (startupId) {
        return await base44.entities.StartupProfile.filter({ id: startupId });
      }
      return null;
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['startupSolutions', startupId],
    queryFn: () => base44.entities.Solution.filter({ provider_id: startupId }),
    enabled: !!startupId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['startup-pilots', startupId],
    queryFn: async () => {
      const solutionIds = solutions.map(s => s.id);
      const all = await base44.entities.Pilot.list();
      return all.filter(p => solutionIds.includes(p.solution_id));
    },
    enabled: solutions.length > 0
  });

  const findMatchingChallenges = async () => {
    setLoadingMatches(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this startup and suggest matching challenges:
Startup: ${startup[0]?.name_en}
Sectors: ${startup[0]?.sectors?.join(', ')}
Solutions: ${solutions.map(s => s.name_en).join(', ')}
Stage: ${startup[0]?.stage}

Find 5 best-matching challenges from the platform that align with their capabilities.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            matches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  challenge_title: { type: 'string' },
                  sector: { type: 'string' },
                  match_score: { type: 'number' },
                  reasoning: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setAiMatches(result.matches || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMatches(false);
    }
  };

  if (isLoading) return <div className="p-8">{t({ en: 'Loading...', ar: 'جارٍ التحميل...' })}</div>;
  if (!startup) return <div className="p-8">{t({ en: 'Startup not found', ar: 'لم يتم العثور على الشركة' })}</div>;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              {startup[0]?.logo_url ? (
                <img src={startup[0].logo_url} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <Lightbulb className="h-12 w-12 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{startup[0]?.[`name_${language}`]}</h1>
              <p className="text-lg text-slate-600 mt-1">{startup[0]?.[`tagline_${language}`]}</p>
              <div className="mt-3">
                <StartupCredentialBadges startup={startup[0]} solutions={solutions} pilots={pilots} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* About */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t({ en: 'About', ar: 'نبذة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{startup[0]?.[`description_${language}`]}</p>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Performance', ar: 'الأداء' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm">{t({ en: 'Solutions', ar: 'الحلول' })}</span>
              <span className="font-bold text-blue-600">{solutions.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm">{t({ en: 'Pilots', ar: 'التجارب' })}</span>
              <span className="font-bold text-purple-600">{startup[0]?.pilot_count || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</span>
              <span className="font-bold text-green-600">{startup[0]?.success_rate || 0}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Funding */}
        {startup[0]?.total_funding > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                {t({ en: 'Funding', ar: 'التمويل' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                ${(startup[0].total_funding / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {startup[0]?.funding_history?.length || 0} rounds
              </p>
            </CardContent>
          </Card>
        )}

        {/* Solutions Portfolio */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t({ en: 'Solution Portfolio', ar: 'محفظة الحلول' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {solutions.map((sol) => (
                <Link key={sol.id} to={createPageUrl(`SolutionDetail?id=${sol.id}`)}>
                  <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all cursor-pointer">
                    <h4 className="font-semibold text-slate-900">{sol[`name_${language}`]}</h4>
                    <p className="text-sm text-slate-600 mt-1">{sol[`tagline_${language}`]}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        {startup[0]?.certifications?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                {t({ en: 'Certifications', ar: 'الشهادات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {startup[0].certifications.map((cert, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-xs text-slate-600">{cert.issuer} • {cert.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Challenge Matching */}
        <Card className="md:col-span-3 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'AI Challenge Matching', ar: 'مطابقة التحديات الذكية' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={findMatchingChallenges} disabled={loadingMatches} className="bg-purple-600">
              {loadingMatches ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Find Matching Challenges', ar: 'ابحث عن التحديات المطابقة' })}
            </Button>

            {aiMatches.length > 0 && (
              <div className="space-y-3">
                {aiMatches.map((match, i) => (
                  <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{match.challenge_title}</h4>
                        <Badge className="mt-1 text-xs" variant="outline">{match.sector}</Badge>
                        <p className="text-sm text-slate-700 mt-2">{match.reasoning}</p>
                      </div>
                      <Badge className="bg-purple-600">{match.match_score}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editMode && (
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t({ en: 'Edit Startup Profile', ar: 'تحرير ملف الشركة' })}</DialogTitle>
            </DialogHeader>
            {/* Full edit form would go here */}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ProtectedPage(StartupProfile, { requiredPermissions: [] });