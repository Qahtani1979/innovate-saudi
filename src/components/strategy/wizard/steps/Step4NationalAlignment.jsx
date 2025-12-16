import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Loader2, Link2, ExternalLink, CheckCircle2, Target, Grid3X3, List, Info } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

// Comprehensive Vision 2030 Programs aligned with AI prompt
const VISION_2030_PROGRAMS = [
  {
    code: 'QOL',
    name_en: 'Quality of Life Program',
    name_ar: 'برنامج جودة الحياة',
    color: 'bg-emerald-500',
    targets: [
      { code: 'QOL_1', text_en: 'Improve livability of Saudi cities', text_ar: 'تحسين جودة الحياة في المدن السعودية' },
      { code: 'QOL_2', text_en: 'Enhance environmental sustainability', text_ar: 'تعزيز الاستدامة البيئية' },
      { code: 'QOL_3', text_en: 'Develop cultural and entertainment options', text_ar: 'تطوير الخيارات الثقافية والترفيهية' },
      { code: 'QOL_4', text_en: 'Promote sports and healthy lifestyles', text_ar: 'تعزيز الرياضة وأنماط الحياة الصحية' }
    ]
  },
  {
    code: 'HSG',
    name_en: 'Housing Program',
    name_ar: 'برنامج الإسكان',
    color: 'bg-blue-500',
    targets: [
      { code: 'HSG_1', text_en: 'Increase home ownership to 70%', text_ar: 'زيادة نسبة التملك إلى 70%' },
      { code: 'HSG_2', text_en: 'Improve housing quality and affordability', text_ar: 'تحسين جودة الإسكان والقدرة على تحمل التكاليف' },
      { code: 'HSG_3', text_en: 'Develop real estate sector', text_ar: 'تطوير القطاع العقاري' }
    ]
  },
  {
    code: 'NTP',
    name_en: 'National Transformation Program',
    name_ar: 'برنامج التحول الوطني',
    color: 'bg-purple-500',
    targets: [
      { code: 'NTP_1', text_en: 'Government effectiveness and efficiency', text_ar: 'فعالية وكفاءة الحكومة' },
      { code: 'NTP_2', text_en: 'Digital transformation of government services', text_ar: 'التحول الرقمي للخدمات الحكومية' },
      { code: 'NTP_3', text_en: 'Private sector enablement', text_ar: 'تمكين القطاع الخاص' },
      { code: 'NTP_4', text_en: 'Labor market development', text_ar: 'تطوير سوق العمل' }
    ]
  },
  {
    code: 'TRC',
    name_en: 'Thriving Cities Program',
    name_ar: 'برنامج المدن المزدهرة',
    color: 'bg-amber-500',
    targets: [
      { code: 'TRC_1', text_en: 'Urban development and planning', text_ar: 'التخطيط والتنمية الحضرية' },
      { code: 'TRC_2', text_en: 'Municipal infrastructure improvement', text_ar: 'تحسين البنية التحتية البلدية' },
      { code: 'TRC_3', text_en: 'Smart city implementation', text_ar: 'تنفيذ المدن الذكية' },
      { code: 'TRC_4', text_en: 'Sustainable urban development', text_ar: 'التنمية الحضرية المستدامة' }
    ]
  },
  {
    code: 'INN',
    name_en: 'National Innovation & Technology',
    name_ar: 'الابتكار والتقنية الوطنية',
    color: 'bg-rose-500',
    targets: [
      { code: 'INN_1', text_en: 'R&D investment and capability building', text_ar: 'الاستثمار في البحث والتطوير وبناء القدرات' },
      { code: 'INN_2', text_en: 'Technology adoption and digital transformation', text_ar: 'تبني التقنية والتحول الرقمي' },
      { code: 'INN_3', text_en: 'AI and emerging technology deployment (SDAIA)', text_ar: 'نشر الذكاء الاصطناعي والتقنيات الناشئة (سدايا)' },
      { code: 'INN_4', text_en: 'Innovation ecosystem and partnerships', text_ar: 'منظومة الابتكار والشراكات' },
      { code: 'INN_5', text_en: 'Tech talent development and Saudization', text_ar: 'تطوير الكفاءات التقنية والتوطين' }
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
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'list'
  const objectives = data.objectives || [];
  const alignments = data.national_alignments || [];

  // Toggle alignment between objective and target
  const toggleAlignment = (objectiveIndex, programCode, targetCode, innovationAlignment = '') => {
    const key = `${objectiveIndex}-${targetCode}`;
    const existingIndex = alignments.findIndex(a => a.key === key);
    
    if (existingIndex >= 0) {
      onChange({ national_alignments: alignments.filter((_, i) => i !== existingIndex) });
    } else {
      onChange({ 
        national_alignments: [...alignments, { 
          key,
          objective_index: objectiveIndex,
          goal_code: programCode,
          target_code: targetCode,
          objective_name: objectives[objectiveIndex]?.name_en,
          innovation_alignment: innovationAlignment
        }]
      });
    }
  };

  // Check if objective is aligned with target
  const isAligned = (objectiveIndex, targetCode) => {
    const key = `${objectiveIndex}-${targetCode}`;
    return alignments.some(a => a.key === key);
  };

  // Get alignment details
  const getAlignmentDetails = (objectiveIndex, targetCode) => {
    const key = `${objectiveIndex}-${targetCode}`;
    return alignments.find(a => a.key === key);
  };

  // Get alignments for an objective
  const getObjectiveAlignments = (objectiveIndex) => {
    return alignments.filter(a => a.objective_index === objectiveIndex);
  };

  // Get alignments for a program
  const getProgramAlignmentCount = (programCode) => {
    return alignments.filter(a => a.goal_code === programCode).length;
  };

  // Calculate coverage stats
  const getCoverageStats = () => {
    const alignedObjectives = new Set(alignments.map(a => a.objective_index)).size;
    const alignedPrograms = new Set(alignments.map(a => a.goal_code)).size;
    const totalTargets = VISION_2030_PROGRAMS.reduce((sum, p) => sum + p.targets.length, 0);
    const alignedTargets = new Set(alignments.map(a => a.target_code)).size;
    
    return {
      objectiveCoverage: objectives.length > 0 ? Math.round((alignedObjectives / objectives.length) * 100) : 0,
      programCoverage: Math.round((alignedPrograms / VISION_2030_PROGRAMS.length) * 100),
      targetCoverage: Math.round((alignedTargets / totalTargets) * 100),
      totalAlignments: alignments.length
    };
  };

  const stats = getCoverageStats();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered Alignment Suggestions', ar: 'اقتراحات التوافق بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Auto-detect alignment between your objectives and Vision 2030 programs', ar: 'الكشف التلقائي عن التوافق بين أهدافك وبرامج رؤية 2030' })}
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
            <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t({ en: 'Please define objectives first (Step 9) before aligning with national goals.', ar: 'يرجى تحديد الأهداف أولاً (الخطوة 9) قبل التوافق مع الأهداف الوطنية.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Coverage Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t({ en: 'Alignment Coverage', ar: 'تغطية التوافق' })}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'matrix' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('matrix')}
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    {t({ en: 'Matrix', ar: 'مصفوفة' })}
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4 mr-1" />
                    {t({ en: 'List', ar: 'قائمة' })}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.objectiveCoverage}%</div>
                  <div className="text-xs text-muted-foreground">{t({ en: 'Objectives Aligned', ar: 'الأهداف المتوافقة' })}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.programCoverage}%</div>
                  <div className="text-xs text-muted-foreground">{t({ en: 'Programs Covered', ar: 'البرامج المغطاة' })}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.targetCoverage}%</div>
                  <div className="text-xs text-muted-foreground">{t({ en: 'Targets Linked', ar: 'الأهداف المرتبطة' })}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.totalAlignments}</div>
                  <div className="text-xs text-muted-foreground">{t({ en: 'Total Alignments', ar: 'إجمالي التوافقات' })}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {viewMode === 'matrix' ? (
            /* Alignment Matrix View */
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Alignment Matrix', ar: 'مصفوفة التوافق' })}</CardTitle>
                <CardDescription>
                  {t({ en: 'Click cells to toggle alignment between objectives and Vision 2030 targets', ar: 'انقر على الخلايا لتبديل التوافق بين الأهداف وأهداف رؤية 2030' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <TooltipProvider>
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2 border-b sticky left-0 bg-background min-w-[200px]">
                          {t({ en: 'Objectives', ar: 'الأهداف' })}
                        </th>
                        {VISION_2030_PROGRAMS.map(program => (
                          <th 
                            key={program.code} 
                            colSpan={program.targets.length}
                            className={`text-center p-2 border-b ${program.color} text-white`}
                          >
                            <div className="text-xs font-medium">
                              {language === 'ar' ? program.name_ar : program.name_en}
                            </div>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {getProgramAlignmentCount(program.code)}
                            </Badge>
                          </th>
                        ))}
                      </tr>
                      <tr>
                        <th className="p-1 border-b sticky left-0 bg-background"></th>
                        {VISION_2030_PROGRAMS.flatMap(program => 
                          program.targets.map(target => (
                            <th 
                              key={target.code} 
                              className="text-center p-1 border-b text-xs text-muted-foreground min-w-[60px]"
                            >
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="cursor-help">{target.code.split('_')[1]}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[200px]">
                                  <p className="text-xs">{language === 'ar' ? target.text_ar : target.text_en}</p>
                                </TooltipContent>
                              </Tooltip>
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {objectives.map((obj, objIndex) => (
                        <tr key={objIndex} className="hover:bg-muted/50">
                          <td className="p-2 border-b sticky left-0 bg-background">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="shrink-0">#{objIndex + 1}</Badge>
                              <span className="line-clamp-1 text-xs">
                                {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                              </span>
                            </div>
                          </td>
                          {VISION_2030_PROGRAMS.flatMap(program => 
                            program.targets.map(target => {
                              const aligned = isAligned(objIndex, target.code);
                              const details = getAlignmentDetails(objIndex, target.code);
                              return (
                                <td 
                                  key={target.code} 
                                  className="p-1 border-b text-center"
                                >
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => toggleAlignment(objIndex, program.code, target.code)}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center transition-all
                                          ${aligned 
                                            ? `${program.color} text-white shadow-md` 
                                            : 'bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground'
                                          }`}
                                      >
                                        {aligned ? (
                                          <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                          <span className="text-xs opacity-30">+</span>
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[250px]">
                                      <p className="font-medium text-xs">{target.code}</p>
                                      <p className="text-xs">{language === 'ar' ? target.text_ar : target.text_en}</p>
                                      {details?.innovation_alignment && (
                                        <p className="text-xs mt-1 text-primary-foreground/80 italic">
                                          {details.innovation_alignment}
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </td>
                              );
                            })
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TooltipProvider>
              </CardContent>
            </Card>
          ) : (
            /* List View */
            <div className="space-y-4">
              <Tabs defaultValue={VISION_2030_PROGRAMS[0].code}>
                <TabsList className="flex flex-wrap h-auto gap-1">
                  {VISION_2030_PROGRAMS.map(program => (
                    <TabsTrigger key={program.code} value={program.code} className="text-xs">
                      {language === 'ar' ? program.name_ar : program.name_en}
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getProgramAlignmentCount(program.code)}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {VISION_2030_PROGRAMS.map(program => (
                  <TabsContent key={program.code} value={program.code}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${program.color} flex items-center justify-center text-white font-bold`}>
                            {program.code}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {language === 'ar' ? program.name_ar : program.name_en}
                            </CardTitle>
                            <CardDescription>
                              {program.targets.length} {t({ en: 'targets', ar: 'أهداف' })}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {program.targets.map(target => (
                            <div key={target.code} className="p-4 border rounded-lg">
                              <div className="flex items-start gap-3 mb-3">
                                <Badge className={`shrink-0 ${program.color} text-white`}>{target.code}</Badge>
                                <p className="text-sm">{language === 'ar' ? target.text_ar : target.text_en}</p>
                              </div>
                              
                              <div className="ml-8">
                                <p className="text-xs text-muted-foreground font-medium mb-2">
                                  {t({ en: 'Aligned Objectives:', ar: 'الأهداف المتوافقة:' })}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {objectives.map((obj, objIndex) => {
                                    const aligned = isAligned(objIndex, target.code);
                                    const details = getAlignmentDetails(objIndex, target.code);
                                    return (
                                      <TooltipProvider key={objIndex}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge
                                              variant={aligned ? 'default' : 'outline'}
                                              className={`cursor-pointer transition-all ${aligned ? program.color + ' text-white' : 'opacity-60 hover:opacity-100'}`}
                                              onClick={() => toggleAlignment(objIndex, program.code, target.code)}
                                            >
                                              #{objIndex + 1} {(obj.name_en || '').slice(0, 25)}...
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs font-medium">{obj.name_en}</p>
                                            {details?.innovation_alignment && (
                                              <p className="text-xs mt-1 italic">{details.innovation_alignment}</p>
                                            )}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* Objective Alignment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Objective Alignment Summary', ar: 'ملخص توافق الأهداف' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {objectives.map((obj, index) => {
                  const objAlignments = getObjectiveAlignments(index);
                  const programs = [...new Set(objAlignments.map(a => a.goal_code))];
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="text-sm font-medium truncate">
                          {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {programs.map(programCode => {
                          const program = VISION_2030_PROGRAMS.find(p => p.code === programCode);
                          return (
                            <Badge key={programCode} className={`${program?.color} text-white text-xs`}>
                              {programCode}
                            </Badge>
                          );
                        })}
                        <Badge variant={objAlignments.length > 0 ? 'default' : 'secondary'}>
                          {objAlignments.length} {t({ en: 'links', ar: 'روابط' })}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {t({ 
                    en: 'Click cells in the matrix or badges in the list view to toggle alignment. AI suggestions will automatically map objectives to relevant Vision 2030 targets.', 
                    ar: 'انقر على الخلايا في المصفوفة أو الشارات في عرض القائمة لتبديل التوافق. ستقوم اقتراحات الذكاء الاصطناعي بربط الأهداف تلقائياً مع أهداف رؤية 2030 ذات الصلة.' 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
