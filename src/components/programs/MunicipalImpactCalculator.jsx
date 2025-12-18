import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Building2, Sparkles, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  IMPACT_CALCULATOR_SYSTEM_PROMPT,
  buildImpactCalculatorPrompt,
  IMPACT_CALCULATOR_SCHEMA
} from '@/lib/ai/prompts/programs';

export default function MunicipalImpactCalculator({ programId }) {
  const { t, language } = useLanguage();
  const [impact, setImpact] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const programs = await base44.entities.Program.list();
      return programs.find(p => p.id === programId);
    },
    enabled: !!programId
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['program-applications', programId],
    queryFn: async () => {
      const all = await base44.entities.ProgramApplication.list();
      return all.filter(a => a.program_id === programId && a.status === 'accepted');
    },
    enabled: !!programId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const calculateImpact = async () => {
    const alumniEmails = applications.map(a => a.applicant_email);
    const alumniPilots = pilots.filter(p => alumniEmails.includes(p.created_by));
    const alumniSolutions = solutions.filter(s => alumniEmails.includes(s.created_by));

    const municipalityCounts = alumniPilots.reduce((acc, p) => {
      const munId = p.municipality_id;
      if (!acc[munId]) acc[munId] = { pilots: 0, solutions: 0, municipalities: [] };
      acc[munId].pilots++;
      return acc;
    }, {});

    alumniSolutions.forEach(s => {
      const deployments = s.deployments || [];
      deployments.forEach(d => {
        const munId = d.municipality_id;
        if (municipalityCounts[munId]) {
          municipalityCounts[munId].solutions++;
        }
      });
    });

    const municipalityCount = Object.keys(municipalityCounts).length;
    const durationMonths = program.duration_weeks ? Math.round(program.duration_weeks / 4) : 12;

    const result = await invokeAI({
      systemPrompt: IMPACT_CALCULATOR_SYSTEM_PROMPT,
      prompt: buildImpactCalculatorPrompt(program, municipalityCount, durationMonths),
      response_json_schema: IMPACT_CALCULATOR_SCHEMA
    });

    if (result.success) {
      setImpact({
        overall_ecosystem_score: result.data.capacity_score,
        municipal_impacts: [{
          municipality_id: 'aggregated',
          capacity_score: result.data.capacity_score,
          innovation_readiness_gain: result.data.innovation_readiness?.projected - result.data.innovation_readiness?.current,
          recommendation: language === 'ar' ? result.data.sustainability?.factors_ar?.[0] : result.data.sustainability?.factors_en?.[0]
        }],
        recommendations: language === 'ar' ? result.data.staff_competency?.skills_gained_ar : result.data.staff_competency?.skills_gained_en,
        raw_data: { municipalityCounts, alumniPilots: alumniPilots.length, alumniSolutions: alumniSolutions.length }
      });
      toast.success(t({ en: 'Impact calculated', ar: 'تم حساب التأثير' }));
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            {t({ en: 'Municipal Capacity Impact', ar: 'تأثير القدرات البلدية' })}
          </CardTitle>
          {!impact && (
            <Button onClick={calculateImpact} disabled={isLoading || !isAvailable} size="sm">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Calculate Impact', ar: 'حساب التأثير' })}
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mb-4" />
        
        {impact && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 rounded text-center">
                <p className="text-2xl font-bold text-green-600">{impact.overall_ecosystem_score || 0}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Ecosystem Score', ar: 'نقاط النظام' })}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded text-center">
                <p className="text-2xl font-bold text-blue-600">{impact.raw_data.alumniPilots}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Alumni Pilots', ar: 'تجارب الخريجين' })}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded text-center">
                <p className="text-2xl font-bold text-purple-600">{impact.raw_data.alumniSolutions}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Alumni Solutions', ar: 'حلول الخريجين' })}</p>
              </div>
            </div>

            {impact.municipal_impacts && impact.municipal_impacts.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3">{t({ en: 'Municipal Impact Breakdown', ar: 'تفصيل التأثير البلدي' })}</h4>
                <div className="space-y-2">
                  {impact.municipal_impacts.map((m, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Municipality {m.municipality_id}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          {m.capacity_score}/100
                        </Badge>
                      </div>
                      {m.recommendation && (
                        <p className="text-xs text-slate-600">{m.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {impact.recommendations && impact.recommendations.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-sm text-amber-900 mb-2">
                  {t({ en: 'Recommendations', ar: 'التوصيات' })}
                </h4>
                <ul className="space-y-1">
                  {impact.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
