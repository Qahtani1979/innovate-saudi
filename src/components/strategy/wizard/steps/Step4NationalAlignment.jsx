import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, Link, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { VISION_2030_PROGRAMS } from '../StrategyWizardSteps';

const NATIONAL_GOALS = [
  { 
    code: 'THRIVING_ECONOMY', 
    name_en: 'A Thriving Economy', 
    name_ar: 'اقتصاد مزدهر',
    targets: [
      { code: 'TE_1', text_en: 'Reduce unemployment to 7%', text_ar: 'خفض البطالة إلى 7%' },
      { code: 'TE_2', text_en: 'Increase SME GDP contribution to 35%', text_ar: 'زيادة مساهمة المنشآت الصغيرة في الناتج المحلي إلى 35%' },
      { code: 'TE_3', text_en: 'Increase women workforce participation to 30%', text_ar: 'زيادة مشاركة المرأة في سوق العمل إلى 30%' }
    ]
  },
  { 
    code: 'VIBRANT_SOCIETY', 
    name_en: 'A Vibrant Society', 
    name_ar: 'مجتمع حيوي',
    targets: [
      { code: 'VS_1', text_en: 'Increase life expectancy to 80 years', text_ar: 'زيادة متوسط العمر المتوقع إلى 80 سنة' },
      { code: 'VS_2', text_en: '3 Saudi cities in top 100 liveable cities', text_ar: '3 مدن سعودية ضمن أفضل 100 مدينة للعيش' },
      { code: 'VS_3', text_en: 'Increase household spending on culture to 6%', text_ar: 'زيادة إنفاق الأسر على الثقافة إلى 6%' }
    ]
  },
  { 
    code: 'AMBITIOUS_NATION', 
    name_en: 'An Ambitious Nation', 
    name_ar: 'وطن طموح',
    targets: [
      { code: 'AN_1', text_en: 'Enhance government effectiveness index', text_ar: 'تعزيز مؤشر فعالية الحكومة' },
      { code: 'AN_2', text_en: 'Improve e-government ranking', text_ar: 'تحسين ترتيب الحكومة الإلكترونية' },
      { code: 'AN_3', text_en: 'Increase non-profit sector contribution to 5%', text_ar: 'زيادة مساهمة القطاع غير الربحي إلى 5%' }
    ]
  }
];

export default function Step4NationalAlignment({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating 
}) {
  const { language, t, isRTL } = useLanguage();
  const objectives = data.objectives || [];
  const alignments = data.national_alignments || [];

  const toggleAlignment = (objectiveIndex, goalCode, targetCode = null) => {
    const key = `${objectiveIndex}-${goalCode}${targetCode ? `-${targetCode}` : ''}`;
    const existingIndex = alignments.findIndex(a => a.key === key);
    
    if (existingIndex >= 0) {
      onChange({ national_alignments: alignments.filter((_, i) => i !== existingIndex) });
    } else {
      onChange({ 
        national_alignments: [...alignments, { 
          key,
          objective_index: objectiveIndex,
          goal_code: goalCode,
          target_code: targetCode,
          objective_name: objectives[objectiveIndex]?.name_en
        }]
      });
    }
  };

  const isAligned = (objectiveIndex, goalCode, targetCode = null) => {
    const key = `${objectiveIndex}-${goalCode}${targetCode ? `-${targetCode}` : ''}`;
    return alignments.some(a => a.key === key);
  };

  const getObjectiveAlignments = (objectiveIndex) => {
    return alignments.filter(a => a.objective_index === objectiveIndex);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered Alignment Suggestions', ar: 'اقتراحات التوافق بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Auto-detect alignment between your objectives and Vision 2030 goals', ar: 'الكشف التلقائي عن التوافق بين أهدافك وأهداف رؤية 2030' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating || objectives.length === 0}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Suggest Alignments', ar: 'اقتراح التوافقات' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {objectives.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t({ en: 'Please define objectives first (Step 3) before aligning with national goals.', ar: 'يرجى تحديد الأهداف أولاً (الخطوة 3) قبل التوافق مع الأهداف الوطنية.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vision 2030 Goals */}
          {NATIONAL_GOALS.map((goal) => (
            <Card key={goal.code}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                    {goal.code.charAt(0)}
                  </div>
                  {language === 'ar' ? goal.name_ar : goal.name_en}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goal.targets.map((target) => (
                    <div key={target.code} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge variant="outline" className="shrink-0">{target.code}</Badge>
                        <p className="text-sm">{language === 'ar' ? target.text_ar : target.text_en}</p>
                      </div>
                      
                      <div className="ml-8 space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                          {t({ en: 'Aligned Objectives:', ar: 'الأهداف المتوافقة:' })}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {objectives.map((obj, objIndex) => {
                            const aligned = isAligned(objIndex, goal.code, target.code);
                            return (
                              <Badge
                                key={objIndex}
                                variant={aligned ? 'default' : 'outline'}
                                className={`cursor-pointer transition-all ${aligned ? '' : 'opacity-60 hover:opacity-100'}`}
                                onClick={() => toggleAlignment(objIndex, goal.code, target.code)}
                              >
                                #{objIndex + 1} {(obj.name_en || '').slice(0, 30)}...
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Alignment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Alignment Summary', ar: 'ملخص التوافق' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {objectives.map((obj, index) => {
                  const objAlignments = getObjectiveAlignments(index);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="text-sm font-medium line-clamp-1">
                          {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={objAlignments.length > 0 ? 'default' : 'secondary'}>
                          {objAlignments.length} {t({ en: 'alignments', ar: 'توافقات' })}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>{t({ en: 'Total Alignments:', ar: 'إجمالي التوافقات:' })}</strong> {alignments.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t({ en: 'Click on objective badges above to toggle alignment with each Vision 2030 target.', ar: 'انقر على شارات الأهداف أعلاه لتبديل التوافق مع كل هدف من أهداف رؤية 2030.' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
