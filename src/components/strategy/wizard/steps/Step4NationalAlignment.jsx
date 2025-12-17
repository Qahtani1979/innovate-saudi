import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Sparkles, Loader2, Link2, CheckCircle2, Target, Grid3X3, List, 
  Building2, BarChart3, AlertTriangle, Flag, ExternalLink, Layers
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { cn } from "@/lib/utils";

// Vision 2030 Programs
const VISION_2030_PROGRAMS = [
  {
    code: 'QOL',
    name_en: 'Quality of Life Program',
    name_ar: 'برنامج جودة الحياة',
    color: 'bg-emerald-500',
    colorLight: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
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
    colorLight: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
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
    colorLight: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-400',
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
    colorLight: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-400',
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
    colorLight: 'bg-rose-100 dark:bg-rose-900/30',
    textColor: 'text-rose-700 dark:text-rose-400',
    targets: [
      { code: 'INN_1', text_en: 'R&D investment and capability building', text_ar: 'الاستثمار في البحث والتطوير وبناء القدرات' },
      { code: 'INN_2', text_en: 'Technology adoption and digital transformation', text_ar: 'تبني التقنية والتحول الرقمي' },
      { code: 'INN_3', text_en: 'AI and emerging technology deployment', text_ar: 'نشر الذكاء الاصطناعي والتقنيات الناشئة' },
      { code: 'INN_4', text_en: 'Innovation ecosystem and partnerships', text_ar: 'منظومة الابتكار والشراكات' },
      { code: 'INN_5', text_en: 'Tech talent development and Saudization', text_ar: 'تطوير الكفاءات التقنية والتوطين' }
    ]
  }
];

export default function Step4NationalAlignment({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly = false
}) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('matrix');
  
  const objectives = data.objectives || [];
  const alignments = data.national_alignments || [];

  // Calculate stats
  const stats = useMemo(() => {
    const alignedObjectives = new Set(alignments.map(a => a.objective_index)).size;
    const alignedPrograms = new Set(alignments.map(a => a.goal_code)).size;
    const totalTargets = VISION_2030_PROGRAMS.reduce((sum, p) => sum + p.targets.length, 0);
    const alignedTargets = new Set(alignments.map(a => a.target_code)).size;
    
    const objectiveCoverage = objectives.length > 0 ? Math.round((alignedObjectives / objectives.length) * 100) : 0;
    const programCoverage = Math.round((alignedPrograms / VISION_2030_PROGRAMS.length) * 100);
    const targetCoverage = Math.round((alignedTargets / totalTargets) * 100);
    
    // Average alignments per objective
    const avgAlignments = objectives.length > 0 ? (alignments.length / objectives.length).toFixed(1) : 0;
    
    // Overall completeness
    const completeness = objectives.length > 0 
      ? Math.min(100, Math.round((objectiveCoverage + programCoverage) / 2))
      : 0;

    return {
      alignedObjectives,
      totalObjectives: objectives.length,
      alignedPrograms,
      totalPrograms: VISION_2030_PROGRAMS.length,
      alignedTargets,
      totalTargets,
      totalAlignments: alignments.length,
      objectiveCoverage,
      programCoverage,
      targetCoverage,
      avgAlignments,
      completeness
    };
  }, [alignments, objectives]);

  // Alignment functions
  const toggleAlignment = (objectiveIndex, programCode, targetCode) => {
    if (isReadOnly) return;
    
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
          objective_name: objectives[objectiveIndex]?.name_en
        }]
      });
    }
  };

  const isAligned = (objectiveIndex, targetCode) => {
    const key = `${objectiveIndex}-${targetCode}`;
    return alignments.some(a => a.key === key);
  };

  const getObjectiveAlignments = (objectiveIndex) => {
    return alignments.filter(a => a.objective_index === objectiveIndex);
  };

  const getProgramAlignmentCount = (programCode) => {
    return alignments.filter(a => a.goal_code === programCode).length;
  };

  const getTargetAlignmentCount = (targetCode) => {
    return alignments.filter(a => a.target_code === targetCode).length;
  };

  // Group alignments by program
  const alignmentsByProgram = useMemo(() => {
    const grouped = {};
    VISION_2030_PROGRAMS.forEach(p => {
      grouped[p.code] = alignments.filter(a => a.goal_code === p.code);
    });
    return grouped;
  }, [alignments]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Completeness Score */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/20" />
                  <circle 
                    cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" 
                    className="text-primary transition-all duration-500"
                    strokeDasharray={`${stats.completeness * 2.2} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{stats.completeness}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Alignment Progress', ar: 'تقدم التوافق' })}</p>
                <p className="text-lg font-semibold">{t({ en: 'Vision 2030', ar: 'رؤية 2030' })}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-background/60 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Link2 className="w-4 h-4" />
                  <span className="text-xs">{t({ en: 'Total Alignments', ar: 'إجمالي التوافقات' })}</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalAlignments}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.avgAlignments} {t({ en: 'per objective', ar: 'لكل هدف' })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs">{t({ en: 'Objectives Aligned', ar: 'الأهداف المتوافقة' })}</span>
                </div>
                <p className="text-2xl font-bold">{stats.objectiveCoverage}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.alignedObjectives}/{stats.totalObjectives}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs">{t({ en: 'Programs Covered', ar: 'البرامج المغطاة' })}</span>
                </div>
                <p className="text-2xl font-bold">{stats.programCoverage}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.alignedPrograms}/{stats.totalPrograms}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/60 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Flag className="w-4 h-4" />
                  <span className="text-xs">{t({ en: 'Targets Linked', ar: 'الأهداف المرتبطة' })}</span>
                </div>
                <p className="text-2xl font-bold">{stats.targetCoverage}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.alignedTargets}/{stats.totalTargets}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Generation */}
      {!isReadOnly && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold">{t({ en: 'AI-Powered Alignment', ar: 'التوافق بالذكاء الاصطناعي' })}</h4>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Auto-detect alignment between objectives and Vision 2030', ar: 'الكشف التلقائي عن التوافق بين الأهداف ورؤية 2030' })}
                </p>
              </div>
              <Button onClick={onGenerateAI} disabled={isGenerating || objectives.length === 0}>
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {t({ en: 'Suggest Alignments', ar: 'اقتراح التوافقات' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {objectives.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Link2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {t({ en: 'Define objectives first (Step 9) before aligning with national goals.', ar: 'حدد الأهداف أولاً (الخطوة 9) قبل التوافق مع الأهداف الوطنية.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matrix" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Matrix', ar: 'مصفوفة' })}</span>
            </TabsTrigger>
            <TabsTrigger value="objectives" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'By Objective', ar: 'بالهدف' })}</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="gap-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'By Program', ar: 'بالبرنامج' })}</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
            </TabsTrigger>
          </TabsList>

          {/* Matrix View */}
          <TabsContent value="matrix" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>
                  {t({ en: 'Click cells to toggle alignment between objectives and Vision 2030 targets', ar: 'انقر على الخلايا لتبديل التوافق' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <TooltipProvider>
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2 border-b sticky left-0 bg-background min-w-[180px] z-10">
                          {t({ en: 'Objectives', ar: 'الأهداف' })}
                        </th>
                        {VISION_2030_PROGRAMS.map(program => (
                          <th 
                            key={program.code} 
                            colSpan={program.targets.length}
                            className={cn("text-center p-2 border-b text-white", program.color)}
                          >
                            <div className="text-xs font-medium whitespace-nowrap">
                              {language === 'ar' ? program.name_ar : program.name_en}
                            </div>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {getProgramAlignmentCount(program.code)}
                            </Badge>
                          </th>
                        ))}
                      </tr>
                      <tr>
                        <th className="p-1 border-b sticky left-0 bg-background z-10"></th>
                        {VISION_2030_PROGRAMS.flatMap(program => 
                          program.targets.map(target => (
                            <th key={target.code} className="text-center p-1 border-b text-xs text-muted-foreground min-w-[50px]">
                              <Tooltip>
                                <TooltipTrigger className="cursor-help">
                                  {target.code.split('_')[1]}
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
                          <td className="p-2 border-b sticky left-0 bg-background z-10">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="shrink-0 text-xs">#{objIndex + 1}</Badge>
                              <span className="line-clamp-1 text-xs">
                                {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                              </span>
                            </div>
                          </td>
                          {VISION_2030_PROGRAMS.flatMap(program => 
                            program.targets.map(target => {
                              const aligned = isAligned(objIndex, target.code);
                              return (
                                <td key={target.code} className="p-1 border-b text-center">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => toggleAlignment(objIndex, program.code, target.code)}
                                        disabled={isReadOnly}
                                        className={cn(
                                          "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                                          aligned 
                                            ? `${program.color} text-white shadow-md` 
                                            : 'bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground',
                                          isReadOnly && 'cursor-default'
                                        )}
                                      >
                                        {aligned ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <span className="text-xs opacity-30">+</span>
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[200px]">
                                      <p className="font-medium text-xs">{target.code}</p>
                                      <p className="text-xs">{language === 'ar' ? target.text_ar : target.text_en}</p>
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
          </TabsContent>

          {/* By Objective View */}
          <TabsContent value="objectives" className="space-y-4 mt-4">
            {objectives.map((obj, objIndex) => {
              const objAlignments = getObjectiveAlignments(objIndex);
              const hasAlignments = objAlignments.length > 0;
              
              return (
                <Card key={objIndex} className={cn(!hasAlignments && "border-dashed border-orange-300 dark:border-orange-800")}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{objIndex + 1}</Badge>
                        <CardTitle className="text-base">
                          {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                        </CardTitle>
                      </div>
                      <Badge variant={hasAlignments ? "default" : "outline"} className={cn(!hasAlignments && "text-orange-600")}>
                        {objAlignments.length} {t({ en: 'alignments', ar: 'توافق' })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {hasAlignments ? (
                      <div className="flex flex-wrap gap-2">
                        {objAlignments.map(alignment => {
                          const program = VISION_2030_PROGRAMS.find(p => p.code === alignment.goal_code);
                          const target = program?.targets.find(t => t.code === alignment.target_code);
                          return (
                            <TooltipProvider key={alignment.key}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    className={cn("cursor-pointer", program?.color, "text-white")}
                                    onClick={() => !isReadOnly && toggleAlignment(objIndex, alignment.goal_code, alignment.target_code)}
                                  >
                                    {alignment.target_code}
                                    {!isReadOnly && <span className="ml-1 opacity-70">×</span>}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium text-xs">{language === 'ar' ? program?.name_ar : program?.name_en}</p>
                                  <p className="text-xs">{language === 'ar' ? target?.text_ar : target?.text_en}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {t({ en: 'No alignments yet - consider linking to Vision 2030', ar: 'لا توجد توافقات - فكر في الربط برؤية 2030' })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* By Program View */}
          <TabsContent value="programs" className="space-y-4 mt-4">
            {VISION_2030_PROGRAMS.map(program => {
              const programAlignments = alignmentsByProgram[program.code] || [];
              const hasAlignments = programAlignments.length > 0;
              
              return (
                <Card key={program.code} className={cn(program.colorLight, "border-0")}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-base flex items-center gap-2", program.textColor)}>
                        <div className={cn("w-3 h-3 rounded-full", program.color)} />
                        {language === 'ar' ? program.name_ar : program.name_en}
                      </CardTitle>
                      <Badge className={cn(program.color, "text-white")}>
                        {programAlignments.length} {t({ en: 'alignments', ar: 'توافق' })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Targets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {program.targets.map(target => {
                        const count = getTargetAlignmentCount(target.code);
                        return (
                          <div 
                            key={target.code} 
                            className={cn(
                              "p-2 rounded-lg border bg-background/60 flex items-center justify-between",
                              count > 0 && "border-green-500/50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {count > 0 ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-muted" />
                              )}
                              <span className="text-sm">{language === 'ar' ? target.text_ar : target.text_en}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{target.code}</Badge>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Linked Objectives */}
                    {hasAlignments && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">{t({ en: 'Linked Objectives:', ar: 'الأهداف المرتبطة:' })}</p>
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(programAlignments.map(a => a.objective_index))].map(objIndex => {
                            const obj = objectives[objIndex];
                            return (
                              <Badge key={objIndex} variant="outline" className="text-xs">
                                #{objIndex + 1} {(language === 'ar' ? obj?.name_ar : obj?.name_en)?.slice(0, 30)}...
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Summary View */}
          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Program Coverage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    {t({ en: 'Program Coverage', ar: 'تغطية البرامج' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {VISION_2030_PROGRAMS.map(program => {
                    const count = getProgramAlignmentCount(program.code);
                    const maxTargets = program.targets.length;
                    const percentage = Math.round((count / (maxTargets * objectives.length || 1)) * 100);
                    
                    return (
                      <div key={program.code} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", program.color)} />
                            {language === 'ar' ? program.name_ar : program.name_en}
                          </span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <Progress value={count > 0 ? Math.max(10, percentage) : 0} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Objective Coverage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    {t({ en: 'Objective Alignment Status', ar: 'حالة توافق الأهداف' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {objectives.slice(0, 8).map((obj, idx) => {
                    const count = getObjectiveAlignments(idx).length;
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2 truncate max-w-[200px]">
                          <Badge variant="outline" className="text-xs shrink-0">#{idx + 1}</Badge>
                          {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                        </span>
                        <Badge variant={count > 0 ? "default" : "outline"} className={cn(count === 0 && "text-orange-600")}>
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                  {objectives.length > 8 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{objectives.length - 8} {t({ en: 'more objectives', ar: 'أهداف أخرى' })}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Alignment Distribution */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    {t({ en: 'Alignment Distribution', ar: 'توزيع التوافقات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-32">
                    {VISION_2030_PROGRAMS.map(program => {
                      const count = getProgramAlignmentCount(program.code);
                      const maxCount = Math.max(...VISION_2030_PROGRAMS.map(p => getProgramAlignmentCount(p.code)), 1);
                      const height = (count / maxCount) * 100;
                      
                      return (
                        <div key={program.code} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className={cn("w-full rounded-t transition-all duration-300", program.color)}
                            style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                          />
                          <span className="text-xs text-muted-foreground">{program.code}</span>
                          <span className="text-xs font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Warnings */}
            {(stats.objectiveCoverage < 100 || stats.programCoverage < 60) && (
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    {t({ en: 'Recommendations', ar: 'توصيات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {stats.objectiveCoverage < 100 && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        {t({ 
                          en: `${stats.totalObjectives - stats.alignedObjectives} objectives have no national alignment`, 
                          ar: `${stats.totalObjectives - stats.alignedObjectives} أهداف بدون توافق وطني` 
                        })}
                      </li>
                    )}
                    {stats.programCoverage < 60 && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        {t({ en: 'Consider covering more Vision 2030 programs for broader impact', ar: 'فكر في تغطية المزيد من برامج رؤية 2030 لتأثير أوسع' })}
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
