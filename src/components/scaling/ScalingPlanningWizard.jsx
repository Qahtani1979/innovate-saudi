import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, MapPin, Calendar, DollarSign, Users, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildScalingEstimatesPrompt, SCALING_ESTIMATES_SCHEMA } from '@/lib/ai/prompts/scaling/planningWizard';

export default function ScalingPlanningWizard({ pilot, onComplete, onCancel }) {
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [municipalities, setMunicipalities] = useState([]);
  const { invokeAI, status, isLoading: aiEstimating, isAvailable, rateLimitInfo } = useAIWithFallback();
  
  const [planData, setPlanData] = useState({
    pilot_id: pilot?.id,
    title_en: `${pilot?.title_en} - National Scaling`,
    title_ar: `${pilot?.title_ar} - التوسع الوطني`,
    target_municipalities: [],
    phases: [],
    estimated_budget: 0,
    estimated_timeline_months: 0,
    success_criteria: '',
    risk_mitigation: '',
    ai_budget_estimate: null,
    ai_timeline_estimate: null,
    ai_readiness_scores: []
  });

  useEffect(() => {
    base44.entities.Municipality.list().then(setMunicipalities);
  }, []);

  const generateAIEstimates = async () => {
    const result = await invokeAI({
      prompt: buildScalingEstimatesPrompt(pilot, planData.target_municipalities.length),
      response_json_schema: SCALING_ESTIMATES_SCHEMA
    });

    if (result.success) {
      setPlanData(prev => ({
        ...prev,
        estimated_budget: result.data.total_budget,
        estimated_timeline_months: result.data.timeline_months,
        ai_budget_estimate: result.data,
        phases: result.data.phases.map((p, i) => ({
          phase_number: i + 1,
          name_en: p.name,
          name_ar: p.name,
          duration_months: p.duration_months,
          target_municipalities: [],
          status: 'planned'
        }))
      }));
    }
  };

  const scoreMunicipalReadiness = async () => {
    const selectedMunis = municipalities.filter(m => 
      planData.target_municipalities.includes(m.id)
    );

    const scores = [];
    for (const muni of selectedMunis) {
      const result = await invokeAI({
        prompt: `Score the readiness of this municipality for scaling this pilot (0-100):
          
Municipality: ${muni.name_en}
Population: ${muni.population}
MII Score: ${muni.mii_score}
Active Pilots: ${muni.active_pilots}

Pilot to scale: ${pilot?.title_en}
Sector: ${pilot?.sector}
Requirements: ${JSON.stringify(pilot?.target_population || {})}

Consider: infrastructure, capacity, prior experience, population fit.
Return score 0-100 and brief rationale.`,
        response_json_schema: {
          type: 'object',
          properties: {
            readiness_score: { type: 'number' },
            rationale: { type: 'string' },
            concerns: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      if (result.success) {
        scores.push({
          municipality_id: muni.id,
          municipality_name: muni.name_en,
          ...result.data
        });
      }
    }

    setPlanData(prev => ({
      ...prev,
      ai_readiness_scores: scores
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await base44.entities.ScalingPlan.create(planData);
      onComplete?.();
    } catch (error) {
      console.error('Failed to create scaling plan:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 4 && <div className={`h-1 w-20 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-center text-slate-600">
            <span>{t({ en: 'Target Selection', ar: 'اختيار الأهداف' })}</span>
            <span>{t({ en: 'AI Estimates', ar: 'تقديرات ذكية' })}</span>
            <span>{t({ en: 'Phase Planning', ar: 'تخطيط المراحل' })}</span>
            <span>{t({ en: 'Review', ar: 'مراجعة' })}</span>
          </div>
        </CardContent>
      </Card>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t({ en: 'Select Target Municipalities', ar: 'اختر البلديات المستهدفة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {municipalities.map((muni) => (
                <div
                  key={muni.id}
                  onClick={() => {
                    const selected = planData.target_municipalities.includes(muni.id);
                    setPlanData(prev => ({
                      ...prev,
                      target_municipalities: selected
                        ? prev.target_municipalities.filter(id => id !== muni.id)
                        : [...prev.target_municipalities, muni.id]
                    }));
                  }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    planData.target_municipalities.includes(muni.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-sm">{isRTL ? muni.name_ar : muni.name_en}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <Badge variant="outline">{muni.population?.toLocaleString()}</Badge>
                    <Badge className="bg-purple-100 text-purple-700">MII: {muni.mii_score}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              {t({ en: 'Selected:', ar: 'المختار:' })} <strong>{planData.target_municipalities.length}</strong> {t({ en: 'municipalities', ar: 'بلدية' })}
            </p>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'AI Planning Estimates', ar: 'تقديرات التخطيط الذكية' })}
            </CardTitle>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {!planData.ai_budget_estimate && (
              <div className="text-center py-8">
                <Button onClick={generateAIEstimates} disabled={aiEstimating || !isAvailable} className="gap-2">
                  {aiEstimating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t({ en: 'AI Analyzing...', ar: 'الذكاء يحلل...' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t({ en: 'Generate AI Estimates', ar: 'إنشاء تقديرات ذكية' })}
                    </>
                  )}
                </Button>
              </div>
            )}

            {planData.ai_budget_estimate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <DollarSign className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-xs text-slate-600">{t({ en: 'Estimated Budget', ar: 'الميزانية المقدرة' })}</p>
                    <p className="text-2xl font-bold text-blue-900">{planData.estimated_budget?.toLocaleString()} SAR</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <Calendar className="h-5 w-5 text-green-600 mb-2" />
                    <p className="text-xs text-slate-600">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</p>
                    <p className="text-2xl font-bold text-green-900">{planData.estimated_timeline_months} {t({ en: 'months', ar: 'شهر' })}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">{t({ en: 'Phased Rollout Plan', ar: 'خطة النشر المرحلية' })}</h4>
                  {planData.phases?.map((phase, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg mb-2">
                      <p className="font-medium text-sm">Phase {phase.phase_number}: {phase.name_en}</p>
                      <p className="text-xs text-slate-600">{phase.duration_months} months</p>
                    </div>
                  ))}
                </div>

                <Button onClick={scoreMunicipalReadiness} disabled={aiEstimating || !isAvailable} variant="outline" className="w-full gap-2">
                  <Users className="h-4 w-4" />
                  {t({ en: 'Score Municipal Readiness (AI)', ar: 'تقييم جاهزية البلديات (ذكاء)' })}
                </Button>

                {planData.ai_readiness_scores?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">{t({ en: 'Municipality Readiness Scores', ar: 'درجات جاهزية البلديات' })}</h4>
                    {planData.ai_readiness_scores.map((score, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{score.municipality_name}</p>
                          <Badge className={score.readiness_score >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {score.readiness_score}/100
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{score.rationale}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Configure Rollout Phases', ar: 'تكوين مراحل النشر' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planData.phases?.map((phase, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Phase {phase.phase_number}</h4>
                  <Badge>{phase.duration_months} months</Badge>
                </div>
                <Input
                  placeholder={t({ en: 'Phase name', ar: 'اسم المرحلة' })}
                  value={phase.name_en}
                  onChange={(e) => {
                    const updated = [...planData.phases];
                    updated[i].name_en = e.target.value;
                    setPlanData({ ...planData, phases: updated });
                  }}
                />
                <div>
                  <label className="text-xs text-slate-600 mb-2 block">
                    {t({ en: 'Municipalities in this phase', ar: 'البلديات في هذه المرحلة' })}
                  </label>
                  <Select
                    value={phase.target_municipalities?.[0] || ''}
                    onValueChange={(value) => {
                      const updated = [...planData.phases];
                      updated[i].target_municipalities = [value];
                      setPlanData({ ...planData, phases: updated });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select municipalities', ar: 'اختر البلديات' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities
                        .filter(m => planData.target_municipalities.includes(m.id))
                        .map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {isRTL ? m.name_ar : m.name_en}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Review Scaling Plan', ar: 'مراجعة خطة التوسع' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">{t({ en: 'Target Municipalities', ar: 'البلديات المستهدفة' })}</p>
                <p className="text-2xl font-bold">{planData.target_municipalities.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">{t({ en: 'Rollout Phases', ar: 'مراحل النشر' })}</p>
                <p className="text-2xl font-bold">{planData.phases?.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">{t({ en: 'Estimated Budget', ar: 'الميزانية المقدرة' })}</p>
                <p className="text-xl font-bold">{planData.estimated_budget?.toLocaleString()} SAR</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">{t({ en: 'Timeline', ar: 'المدة' })}</p>
                <p className="text-xl font-bold">{planData.estimated_timeline_months} months</p>
              </div>
            </div>

            <Textarea
              placeholder={t({ en: 'Success criteria...', ar: 'معايير النجاح...' })}
              value={planData.success_criteria}
              onChange={(e) => setPlanData({ ...planData, success_criteria: e.target.value })}
              className="h-24"
            />
            <Textarea
              placeholder={t({ en: 'Risk mitigation strategy...', ar: 'استراتيجية تخفيف المخاطر...' })}
              value={planData.risk_mitigation}
              onChange={(e) => setPlanData({ ...planData, risk_mitigation: e.target.value })}
              className="h-24"
            />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
          {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {step === 1 ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Back', ar: 'رجوع' })}
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} disabled={step === 1 && planData.target_municipalities.length === 0}>
            {t({ en: 'Next', ar: 'التالي' })}
            {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t({ en: 'Create Scaling Plan', ar: 'إنشاء خطة التوسع' })}
          </Button>
        )}
      </div>
    </div>
  );
}
