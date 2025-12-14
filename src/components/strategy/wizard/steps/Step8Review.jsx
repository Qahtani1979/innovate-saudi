import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, AlertTriangle, Target, Link, Activity, 
  Lightbulb, Calendar, FileText, Save, Loader2 
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { MOMAH_SECTORS, STRATEGIC_THEMES, VISION_2030_PROGRAMS, EMERGING_TECHNOLOGIES } from '../StrategyWizardSteps';

export default function Step8Review({ 
  data, 
  onSave,
  isSaving,
  validationErrors = []
}) {
  const { language, t } = useLanguage();

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

  const completeness = {
    context: !!(data.name_en && data.vision_en),
    swot: (swot.strengths?.length > 0 || swot.opportunities?.length > 0),
    objectives: objectives.length >= 3,
    national: alignments.length > 0,
    kpis: kpis.length > 0,
    actions: actionPlans.length > 0,
    timeline: (phases.length > 0 || milestones.length > 0)
  };

  const completenessScore = Object.values(completeness).filter(Boolean).length;
  const totalSteps = Object.keys(completeness).length;

  return (
    <div className="space-y-6">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc ml-4">
              {validationErrors.map((err, i) => (
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
          <CardDescription>
            {completenessScore}/{totalSteps} {t({ en: 'sections complete', ar: 'أقسام مكتملة' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'context', icon: FileText, label: { en: 'Context', ar: 'السياق' } },
              { key: 'swot', icon: Target, label: { en: 'SWOT', ar: 'SWOT' } },
              { key: 'objectives', icon: Target, label: { en: 'Objectives', ar: 'الأهداف' } },
              { key: 'national', icon: Link, label: { en: 'National', ar: 'وطني' } },
              { key: 'kpis', icon: Activity, label: { en: 'KPIs', ar: 'المؤشرات' } },
              { key: 'actions', icon: Lightbulb, label: { en: 'Actions', ar: 'الإجراءات' } },
              { key: 'timeline', icon: Calendar, label: { en: 'Timeline', ar: 'الجدول' } }
            ].map(item => {
              const Icon = item.icon;
              const isComplete = completeness[item.key];
              return (
                <div 
                  key={item.key} 
                  className={`p-3 rounded-lg border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isComplete ? 'text-green-600' : 'text-amber-600'}`} />
                    <span className="text-sm font-medium">{item.label[language]}</span>
                  </div>
                  <Badge variant={isComplete ? 'default' : 'secondary'} className="mt-2 text-xs">
                    {isComplete ? t({ en: 'Complete', ar: 'مكتمل' }) : t({ en: 'Incomplete', ar: 'غير مكتمل' })}
                  </Badge>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{objectives.length}</p>
              <p className="text-sm text-muted-foreground">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">{alignments.length}</p>
              <p className="text-sm text-muted-foreground">{t({ en: 'Alignments', ar: 'التوافقات' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{kpis.length}</p>
              <p className="text-sm text-muted-foreground">{t({ en: 'KPIs', ar: 'المؤشرات' })}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{actionPlans.length}</p>
              <p className="text-sm text-muted-foreground">{t({ en: 'Action Plans', ar: 'خطط العمل' })}</p>
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

      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <Button 
          size="lg" 
          onClick={onSave} 
          disabled={isSaving || !data.name_en}
          className="px-8"
        >
          {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
          {t({ en: 'Save Strategic Plan', ar: 'حفظ الخطة الاستراتيجية' })}
        </Button>
      </div>
    </div>
  );
}
