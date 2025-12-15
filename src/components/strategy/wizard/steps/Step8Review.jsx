import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, AlertTriangle, Target, Link, Activity, 
  Lightbulb, Calendar, FileText, Save, Loader2, Send,
  Users, Globe, Shield, Megaphone, DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { MOMAH_SECTORS, STRATEGIC_THEMES, VISION_2030_PROGRAMS, EMERGING_TECHNOLOGIES, WIZARD_STEPS } from '../StrategyWizardSteps';

export default function Step8Review({ 
  data, 
  onSave,
  onSubmitForApproval,
  isSaving,
  isSubmitting,
  validationErrors = [],
  mode = 'create'
}) {
  const { language, t, isRTL } = useLanguage();

  const getSectorName = (code) => {
    const sector = MOMAH_SECTORS.find(s => s.code === code);
    return sector ? (language === 'ar' ? sector.name_ar : sector.name_en) : code;
  };

  const getThemeName = (code) => {
    const theme = STRATEGIC_THEMES.find(t => t.code === code);
    return theme ? (language === 'ar' ? theme.name_ar : theme.name_en) : code;
  };

  const getTechName = (code) => {
    const tech = EMERGING_TECHNOLOGIES.find(t => t.code === code);
    return tech ? (language === 'ar' ? tech.name_ar : tech.name_en) : code;
  };

  const objectives = data.objectives || [];
  const kpis = data.kpis || [];
  const actionPlans = data.action_plans || [];
  const alignments = data.national_alignments || [];
  const milestones = data.milestones || [];
  const phases = data.phases || [];
  const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const stakeholders = data.stakeholders || [];
  const risks = data.risks || [];
  const governance = data.governance || {};

  // Calculate completeness for all 18 steps
  const completeness = {
    context: !!(data.name_en && data.description_en),
    vision: !!(data.vision_en && data.mission_en),
    stakeholders: stakeholders.length > 0,
    pestel: Object.values(data.pestel || {}).some(arr => arr?.length > 0),
    swot: (swot.strengths?.length > 0 || swot.opportunities?.length > 0),
    scenarios: !!(data.scenarios?.best_case?.description || data.scenarios?.most_likely?.description),
    risks: risks.length > 0,
    dependencies: (data.dependencies?.length > 0 || data.constraints?.length > 0),
    objectives: objectives.length >= 3,
    national: alignments.length > 0,
    kpis: kpis.length > 0,
    actions: actionPlans.length > 0,
    resources: !!(data.resource_plan?.hr_requirements?.length || data.resource_plan?.budget_allocation?.length),
    timeline: (phases.length > 0 || milestones.length > 0),
    governance: !!(governance.structure?.length || governance.committees?.length),
    communication: !!(data.communication_plan?.internal_channels?.length || data.communication_plan?.key_messages?.length),
    change: !!(data.change_management?.readiness_assessment || data.change_management?.change_approach)
  };

  const completenessScore = Object.values(completeness).filter(Boolean).length;
  const totalSteps = Object.keys(completeness).length;
  const completionPercentage = Math.round((completenessScore / totalSteps) * 100);

  // Validation
  const getValidationErrors = () => {
    const errors = [];
    if (!data.name_en) errors.push(t({ en: 'Plan name is required', ar: 'اسم الخطة مطلوب' }));
    if (!data.vision_en) errors.push(t({ en: 'Vision statement is required', ar: 'بيان الرؤية مطلوب' }));
    if (objectives.length < 3) errors.push(t({ en: 'At least 3 objectives required', ar: 'مطلوب 3 أهداف على الأقل' }));
    if (kpis.length === 0) errors.push(t({ en: 'At least 1 KPI required', ar: 'مطلوب مؤشر أداء واحد على الأقل' }));
    return errors;
  };

  const errors = [...validationErrors, ...getValidationErrors()];
  const canSubmit = errors.length === 0 && completionPercentage >= 60;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc ml-4">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Completeness Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t({ en: 'Plan Completeness', ar: 'اكتمال الخطة' })}
          </CardTitle>
          <CardDescription className="flex items-center gap-4">
            <span>{completenessScore}/{totalSteps} {t({ en: 'sections complete', ar: 'أقسام مكتملة' })}</span>
            <Badge variant={completionPercentage >= 80 ? 'default' : completionPercentage >= 60 ? 'secondary' : 'destructive'}>
              {completionPercentage}%
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { key: 'context', icon: FileText, label: { en: 'Context', ar: 'السياق' } },
              { key: 'vision', icon: Target, label: { en: 'Vision', ar: 'الرؤية' } },
              { key: 'stakeholders', icon: Users, label: { en: 'Stakeholders', ar: 'أصحاب المصلحة' } },
              { key: 'pestel', icon: Globe, label: { en: 'PESTEL', ar: 'PESTEL' } },
              { key: 'swot', icon: Target, label: { en: 'SWOT', ar: 'SWOT' } },
              { key: 'scenarios', icon: Lightbulb, label: { en: 'Scenarios', ar: 'السيناريوهات' } },
              { key: 'risks', icon: AlertTriangle, label: { en: 'Risks', ar: 'المخاطر' } },
              { key: 'dependencies', icon: Link, label: { en: 'Dependencies', ar: 'التبعيات' } },
              { key: 'objectives', icon: Target, label: { en: 'Objectives', ar: 'الأهداف' } },
              { key: 'national', icon: Link, label: { en: 'National', ar: 'وطني' } },
              { key: 'kpis', icon: Activity, label: { en: 'KPIs', ar: 'المؤشرات' } },
              { key: 'actions', icon: Lightbulb, label: { en: 'Actions', ar: 'الإجراءات' } },
              { key: 'resources', icon: DollarSign, label: { en: 'Resources', ar: 'الموارد' } },
              { key: 'timeline', icon: Calendar, label: { en: 'Timeline', ar: 'الجدول' } },
              { key: 'governance', icon: Shield, label: { en: 'Governance', ar: 'الحوكمة' } },
              { key: 'communication', icon: Megaphone, label: { en: 'Comms', ar: 'التواصل' } },
              { key: 'change', icon: Lightbulb, label: { en: 'Change', ar: 'التغيير' } }
            ].map(item => {
              const Icon = item.icon;
              const isComplete = completeness[item.key];
              return (
                <div 
                  key={item.key} 
                  className={`p-2 rounded-lg border text-center ${isComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
                >
                  <Icon className={`h-4 w-4 mx-auto ${isComplete ? 'text-green-600' : 'text-amber-600'}`} />
                  <span className="text-xs font-medium block mt-1">{item.label[language]}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Plan Overview', ar: 'نظرة عامة على الخطة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t({ en: 'Title', ar: 'العنوان' })}</p>
              <p className="font-medium">{language === 'ar' ? (data.name_ar || data.name_en) : data.name_en}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t({ en: 'Duration', ar: 'المدة' })}</p>
              <p className="font-medium">{data.start_year} - {data.end_year}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Vision', ar: 'الرؤية' })}</p>
            <p className="text-sm">{language === 'ar' ? (data.vision_ar || data.vision_en) : data.vision_en}</p>
          </div>

          {data.mission_en && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Mission', ar: 'الرسالة' })}</p>
              <p className="text-sm">{language === 'ar' ? (data.mission_ar || data.mission_en) : data.mission_en}</p>
            </div>
          )}

          {(data.target_sectors?.length > 0) && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Target Sectors', ar: 'القطاعات المستهدفة' })}</p>
                <div className="flex flex-wrap gap-1">
                  {data.target_sectors.map(code => (
                    <Badge key={code} variant="outline" className="text-xs">{getSectorName(code)}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {(data.focus_technologies?.length > 0) && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t({ en: 'Focus Technologies', ar: 'التقنيات المركزة' })}</p>
                <div className="flex flex-wrap gap-1">
                  {data.focus_technologies.map(code => (
                    <Badge key={code} variant="secondary" className="text-xs">{getTechName(code)}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Plan Statistics', ar: 'إحصائيات الخطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{objectives.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">{alignments.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Alignments', ar: 'التوافقات' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{kpis.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'KPIs', ar: 'المؤشرات' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{actionPlans.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Actions', ar: 'الإجراءات' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{risks.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Risks', ar: 'المخاطر' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-cyan-600">{stakeholders.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objectives List */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 border rounded-lg">
                    <Badge variant="outline">#{i + 1}</Badge>
                    {obj.sector_code && <Badge className="text-xs bg-primary/10 text-primary">{getSectorName(obj.sector_code)}</Badge>}
                    <span className="text-sm flex-1 line-clamp-1">
                      {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Version Info (Edit Mode) */}
      {mode === 'edit' && data.version_number && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">v{data.version_number}</Badge>
                <span className="text-sm text-muted-foreground">
                  {t({ en: 'Current version', ar: 'النسخة الحالية' })}
                </span>
              </div>
              {data.version_notes && (
                <span className="text-xs text-muted-foreground">{data.version_notes}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {mode !== 'review' && (
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            variant="outline"
            onClick={onSave} 
            disabled={isSaving || !data.name_en}
          >
            {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
            {t({ en: 'Save as Draft', ar: 'حفظ كمسودة' })}
          </Button>
          
          <Button 
            size="lg"
            onClick={onSubmitForApproval} 
            disabled={isSubmitting || !canSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
            {t({ en: 'Submit for Approval', ar: 'إرسال للموافقة' })}
          </Button>
        </div>
      )}

      {!canSubmit && mode !== 'review' && (
        <p className="text-center text-sm text-muted-foreground">
          {t({ en: 'Complete at least 60% of the plan and fix validation errors to submit', ar: 'أكمل 60% على الأقل من الخطة وأصلح أخطاء التحقق للإرسال' })}
        </p>
      )}
    </div>
  );
}
