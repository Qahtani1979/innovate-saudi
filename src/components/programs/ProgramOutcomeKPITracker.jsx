import { useState } from 'react';
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useStrategicKPIs } from '@/hooks/useStrategicKPIs';
import { usePrograms } from '@/hooks/usePrograms';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { TrendingUp, Target, ArrowUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';

export default function ProgramOutcomeKPITracker({ program }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { kpis: strategicKPIs, isLoading: isLoadingKPIs, recordContribution, isRecording } = useStrategicKPIs({
    planIds: program?.['strategic_plan_ids'] || program?.['strategic_objective_ids'] || [],
    strategicPlans
  });

  // Get program outcomes
  const programOutcomes = program?.['target_outcomes'] || program?.['outcomes'] || [];
  const completedOutcomes = programOutcomes.filter(o =>
    (o.current >= o.target) || o.status === 'achieved'
  );

  // Calculate contribution score
  const contributionScore = programOutcomes.length > 0
    ? Math.round((completedOutcomes.length / programOutcomes.length) * 100)
    : 0;

  const { updateProgram } = usePrograms();

  const handleRecordContribution = async (kpiId, contribution) => {
    try {
      const kpi = strategicKPIs.find(k => k.id === kpiId);
      const existingContributions = program?.['kpi_contributions'] || [];
      const newContribution = {
        kpi_id: kpiId,
        contribution_value: contribution,
        contributed_at: new Date().toISOString(),
        program_id: program?.['id']
      };

      await Promise.all([
        updateProgram({
          programId: program?.['id'],
          updates: {
            kpi_contributions: [...existingContributions, newContribution],
            last_kpi_contribution_date: new Date().toISOString()
          }
        }),
        recordContribution({
          kpiId,
          contribution,
          programId: program?.['id'],
          currentKpi: kpi
        }).catch(e => console.warn('Could not update strategic_kpis table:', e))
      ]);

      toast.success(t({ en: 'KPI contribution recorded', ar: 'تم تسجيل المساهمة في مؤشر الأداء' }));
      setKpiContributions(prev => {
        const next = { ...prev };
        delete next[kpiId];
        return next;
      });
    } catch (error) {
      toast.error(t({ en: 'Failed to record contribution', ar: 'فشل في تسجيل المساهمة' }));
    }
  };

  if (!program.strategic_plan_ids?.length && !program.strategic_objective_ids?.length) {
    return (
      <Card className="border border-amber-200 bg-amber-50">
        <CardContent className="py-6 text-center">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-800 font-medium">
            {t({ en: 'Program not linked to strategic objectives', ar: 'البرنامج غير مرتبط بالأهداف الاستراتيجية' })}
          </p>
          <p className="text-sm text-amber-600 mt-1">
            {t({ en: 'Link this program to strategic plans to track KPI contributions', ar: 'اربط هذا البرنامج بالخطط الاستراتيجية لتتبع مساهمات مؤشرات الأداء' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <TrendingUp className="h-5 w-5" />
          {t({ en: 'Program → Strategic KPI Tracker', ar: 'متتبع مؤشرات الأداء الاستراتيجية للبرنامج' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          {t({
            en: 'Track how program outcomes contribute to strategic KPIs',
            ar: 'تتبع كيف تساهم نتائج البرنامج في مؤشرات الأداء الاستراتيجية'
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Contribution Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-slate-600">{t({ en: 'Contribution Score', ar: 'درجة المساهمة' })}</p>
            <p className="text-3xl font-bold text-green-600">{contributionScore}%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-slate-600">{t({ en: 'Linked KPIs', ar: 'مؤشرات مرتبطة' })}</p>
            <p className="text-3xl font-bold text-blue-600">{strategicKPIs.length}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-sm text-slate-600">{t({ en: 'Outcomes Achieved', ar: 'نتائج محققة' })}</p>
            <p className="text-3xl font-bold text-purple-600">{completedOutcomes.length}/{programOutcomes.length}</p>
          </div>
        </div>

        {/* Program Outcomes */}
        {programOutcomes.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">
              {t({ en: 'Program Outcomes', ar: 'نتائج البرنامج' })}
            </h4>
            {programOutcomes.map((outcome, index) => {
              const progress = outcome.target ? Math.round((outcome.current / outcome.target) * 100) : 0;
              const isComplete = progress >= 100;

              return (
                <div key={index} className={`p-3 rounded-lg border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Target className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="font-medium text-sm text-slate-800">
                        {outcome.description || outcome.name_en || outcome.title}
                      </span>
                    </div>
                    <Badge variant={isComplete ? 'default' : 'secondary'} className={isComplete ? 'bg-green-600' : ''}>
                      {outcome.current || 0}/{outcome.target || 100} {outcome.unit || ''}
                    </Badge>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* Strategic KPIs */}
        {strategicKPIs.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">
              {t({ en: 'Contributing to Strategic KPIs', ar: 'المساهمة في مؤشرات الأداء الاستراتيجية' })}
            </h4>
            {strategicKPIs.map((kpi) => {
              const progress = kpi.target ? Math.round((kpi.current / kpi.target) * 100) : 0;
              const contribution = kpiContributions[kpi.id] || '';

              return (
                <div key={kpi.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-slate-800">
                        {language === 'ar' && kpi.name_ar ? kpi.name_ar : kpi.name_en}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {kpi.current || 0}/{kpi.target || 100} {kpi.unit || '%'}
                    </Badge>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2 mb-3" />

                  {/* Contribution Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={t({ en: 'Contribution value', ar: 'قيمة المساهمة' })}
                      value={contribution}
                      onChange={(e) => setKpiContributions(prev => ({
                        ...prev,
                        [kpi.id]: e.target.value
                      }))}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRecordContribution(kpi.id, parseFloat(contribution))}
                      disabled={!contribution || isRecording}
                    >
                      {isRecording ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowUp className="h-4 w-4 mr-1" />
                          {t({ en: 'Report', ar: 'إبلاغ' })}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Past Contributions */}
        {program.kpi_contributions?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 text-sm">
              {t({ en: 'Recent Contributions', ar: 'المساهمات الأخيرة' })}
            </h4>
            <div className="space-y-1">
              {program.kpi_contributions.slice(-5).reverse().map((contrib, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                  <span className="text-slate-600">
                    {new Date(contrib.contributed_at).toLocaleDateString()}
                  </span>
                  <Badge variant="outline" className="text-green-600">
                    +{contrib.contribution_value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
