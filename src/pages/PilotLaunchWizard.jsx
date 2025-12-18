import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, Rocket, AlertTriangle, Users, Shield, Database, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import PreFlightRiskSimulator from '../components/pilots/PreFlightRiskSimulator';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function PilotLaunchWizard() {
  const urlParams = new URLSearchParams(window.location.search);
  const pilotId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invokeAI, status: aiStatus, isLoading: generatingChecklist, isAvailable, rateLimitInfo } = useAIWithFallback();

  const [checklist, setChecklist] = useState({
    team_onboarded: false,
    stakeholders_aligned: false,
    equipment_procured: false,
    data_systems_ready: false,
    safety_verified: false,
    regulatory_approved: false,
    communication_plan: false,
    budget_allocated: false
  });
  const [launchDate, setLaunchDate] = useState('');

  const { data: pilot, isLoading, error } = useQuery({
    queryKey: ['pilot-launch', pilotId],
    queryFn: async () => {
      if (!pilotId) return null;
      const pilots = await base44.entities.Pilot.list();
      return pilots.find(p => p.id === pilotId);
    },
    enabled: !!pilotId
  });

  if (!pilotId) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-700">
              {t({ en: 'No pilot ID provided', ar: 'لم يتم توفير معرف التجربة' })}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const launchMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Pilot.update(pilotId, {
        stage: 'active',
        timeline: {
          ...pilot.timeline,
          pilot_start: launchDate || new Date().toISOString().split('T')[0]
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot']);
      toast.success(t({ en: 'Pilot launched successfully!', ar: 'تم إطلاق التجربة بنجاح!' }));
      navigate(createPageUrl(`PilotDetail?id=${pilotId}`));
    }
  });

  const moveToPreparation = useMutation({
    mutationFn: async () => {
      await base44.entities.Pilot.update(pilotId, {
        stage: 'preparation',
        timeline: {
          ...pilot.timeline,
          prep_start: new Date().toISOString().split('T')[0]
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot']);
      toast.success(t({ en: 'Moved to preparation phase', ar: 'تم الانتقال لمرحلة الإعداد' }));
    }
  });

  const generateAIChecklist = async () => {
    try {
      const { 
        PILOT_LAUNCH_CHECKLIST_PROMPT_TEMPLATE, 
        PILOT_LAUNCH_CHECKLIST_RESPONSE_SCHEMA 
      } = await import('@/lib/ai/prompts/pilots/launchChecklist');
      
      const response = await invokeAI({
        prompt: PILOT_LAUNCH_CHECKLIST_PROMPT_TEMPLATE(pilot),
        response_json_schema: PILOT_LAUNCH_CHECKLIST_RESPONSE_SCHEMA
      });
      
      if (response.success) {
        toast.success('AI generated readiness checklist');
      } else {
        toast.error('Failed to generate checklist');
      }
    } catch (error) {
      toast.error('Failed to generate checklist');
    }
  };

  if (isLoading || !pilot) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (pilot.stage !== 'approved' && pilot.stage !== 'preparation') {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-700">
              {t({ 
                en: 'This pilot is not ready for launch. Current stage:', 
                ar: 'هذه التجربة غير جاهزة للإطلاق. المرحلة الحالية:' 
              })} {pilot.stage}
            </p>
            <Button onClick={() => navigate(createPageUrl(`PilotDetail?id=${pilotId}`))} className="mt-4">
              {t({ en: 'Back to Details', ar: 'العودة للتفاصيل' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allChecked = Object.values(checklist).every(v => v);
  const readinessScore = (Object.values(checklist).filter(v => v).length / Object.values(checklist).length) * 100;

  return (
    <PageLayout className="max-w-4xl mx-auto">
      <PageHeader
        icon={Rocket}
        title={{ en: 'Pilot Launch Wizard', ar: 'معالج إطلاق التجربة' }}
        description={pilot.title_en}
      />

      {/* Readiness Score */}
      <Card className={`border-2 ${
        readinessScore === 100 ? 'border-green-500 bg-green-50' :
        readinessScore >= 50 ? 'border-yellow-500 bg-yellow-50' :
        'border-red-500 bg-red-50'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-700">{t({ en: 'Launch Readiness', ar: 'جاهزية الإطلاق' })}</p>
              <p className="text-3xl font-bold mt-1">{Math.round(readinessScore)}%</p>
            </div>
            <Rocket className={`h-12 w-12 ${
              readinessScore === 100 ? 'text-green-600' :
              readinessScore >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`} />
          </div>
          <Progress value={readinessScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Pre-Flight Risk Simulator */}
      {pilot.stage === 'preparation' && <PreFlightRiskSimulator pilot={pilot} />}

      {/* Stage Actions */}
      {pilot.stage === 'approved' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{t({ en: 'Start Preparation Phase', ar: 'بدء مرحلة الإعداد' })}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Move to preparation to begin setup activities', ar: 'الانتقال للإعداد لبدء أنشطة التحضير' })}</p>
              </div>
              <Button onClick={() => moveToPreparation.mutate()} disabled={moveToPreparation.isPending}>
                {t({ en: 'Begin Preparation', ar: 'بدء الإعداد' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-Launch Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              {t({ en: 'Pre-Launch Checklist', ar: 'قائمة ما قبل الإطلاق' })}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAIChecklist}
              disabled={generatingChecklist}
            >
              {generatingChecklist ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> AI Checklist</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'team_onboarded', label: t({ en: 'Team onboarded and trained', ar: 'تم تأهيل وتدريب الفريق' }), icon: Users },
            { key: 'stakeholders_aligned', label: t({ en: 'Stakeholders aligned and informed', ar: 'تم توافق وإعلام أصحاب المصلحة' }), icon: Users },
            { key: 'equipment_procured', label: t({ en: 'Equipment procured and tested', ar: 'تم شراء واختبار المعدات' }), icon: Shield },
            { key: 'data_systems_ready', label: t({ en: 'Data collection systems configured', ar: 'تم تكوين أنظمة جمع البيانات' }), icon: Database },
            { key: 'safety_verified', label: t({ en: 'Safety protocols verified', ar: 'تم التحقق من بروتوكولات السلامة' }), icon: Shield },
            { key: 'regulatory_approved', label: t({ en: 'Regulatory exemptions approved', ar: 'تمت الموافقة على الاستثناءات التنظيمية' }), icon: Shield },
            { key: 'communication_plan', label: t({ en: 'Communication plan executed', ar: 'تم تنفيذ خطة التواصل' }), icon: Users },
            { key: 'budget_allocated', label: t({ en: 'Budget allocated and confirmed', ar: 'تم تخصيص وتأكيد الميزانية' }), icon: Database }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  checked={checklist[item.key]}
                  onCheckedChange={(checked) => setChecklist({ ...checklist, [item.key]: checked })}
                />
                <Icon className={`h-5 w-5 ${checklist[item.key] ? 'text-green-600' : 'text-slate-400'}`} />
                <span className={`flex-1 text-sm ${checklist[item.key] ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                  {item.label}
                </span>
                {checklist[item.key] && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Launch Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {t({ en: 'Launch Configuration', ar: 'تكوين الإطلاق' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t({ en: 'Official Launch Date', ar: 'تاريخ الإطلاق الرسمي' })}</label>
              <Input
                type="date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t({ en: 'Expected End Date', ar: 'تاريخ الانتهاء المتوقع' })}</label>
              <Input
                type="date"
                value={pilot.timeline?.pilot_end || ''}
                disabled
                className="bg-slate-50"
              />
            </div>
          </div>

          {!allChecked && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    {t({ en: 'Incomplete Readiness', ar: 'عدم اكتمال الجاهزية' })}
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    {t({ 
                      en: 'Complete all checklist items before launching', 
                      ar: 'أكمل جميع عناصر القائمة قبل الإطلاق' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(createPageUrl(`PilotDetail?id=${pilotId}`))}>
          {t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
        <Button
          onClick={() => launchMutation.mutate()}
          disabled={!allChecked || !launchDate || launchMutation.isPending}
          className="bg-gradient-to-r from-green-600 to-emerald-600"
        >
          {launchMutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Launching...</>
          ) : (
            <><Rocket className="h-4 w-4 mr-2" /> {t({ en: 'Launch Pilot', ar: 'إطلاق التجربة' })}</>
          )}
        </Button>
      </div>
    </PageLayout>
  );
}