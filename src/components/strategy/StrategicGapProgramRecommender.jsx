import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, Lightbulb, Target, Loader2, CheckCircle2, 
  TrendingUp, Users, Zap, BookOpen, Plus 
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function StrategicGapProgramRecommender({ onProgramCreated }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecs, setSelectedRecs] = useState([]);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-gap'],
    queryFn: async () => {
      const { data, error } = await supabase.from('strategic_plans').select('*');
      if (error) throw error;
      return data || [];
    }
  });
 
  const { data: programs = [] } = useQuery({
    queryKey: ['programs-gap'],
    queryFn: async () => {
      const { data, error } = await supabase.from('programs').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });
 
  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-gap'],
    queryFn: async () => {
      const { data, error } = await supabase.from('challenges').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sectors').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate strategic gaps
  const calculateGaps = () => {
    const gaps = [];
    
    // Gap 1: Strategic plans without programs
    strategicPlans.forEach(plan => {
      const linkedPrograms = programs.filter(p => 
        p.strategic_plan_ids?.includes(plan.id)
      );
      
      if (linkedPrograms.length === 0) {
        gaps.push({
          type: 'no_programs',
          severity: 'high',
          plan,
          title: { 
            en: `No programs for: ${plan.name_en || plan.title_en}`, 
            ar: `لا توجد برامج لـ: ${plan.name_ar || plan.name_en}` 
          },
          description: {
            en: 'This strategic plan has no linked programs to execute its objectives',
            ar: 'هذه الخطة الاستراتيجية لا ترتبط ببرامج لتنفيذ أهدافها'
          }
        });
      }
    });

    // Gap 2: Objectives without coverage
    strategicPlans.forEach(plan => {
      const objectives = plan.objectives || plan.strategic_objectives || [];
      objectives.forEach((obj, i) => {
        const objName = typeof obj === 'object' ? obj.name_en || obj.title : obj;
        const objId = typeof obj === 'object' ? obj.id : `${plan.id}-obj-${i}`;
        
        const coveringPrograms = programs.filter(p => 
          p.strategic_objective_ids?.includes(objId) ||
          p.strategic_objective_ids?.includes(plan.id)
        );
        
        if (coveringPrograms.length === 0) {
          gaps.push({
            type: 'uncovered_objective',
            severity: 'medium',
            plan,
            objective: obj,
            title: { 
              en: `Uncovered objective: ${objName}`, 
              ar: `هدف غير مغطى: ${objName}` 
            },
            description: {
              en: 'No programs are addressing this strategic objective',
              ar: 'لا توجد برامج تعالج هذا الهدف الاستراتيجي'
            }
          });
        }
      });
    });

    // Gap 3: High-priority challenges without programs
    challenges
      .filter(c => c.priority === 'tier_1' || c.priority === 'tier_2' || c.is_featured)
      .forEach(challenge => {
        const linkedPrograms = programs.filter(p => 
          p.linked_challenge_ids?.includes(challenge.id)
        );
        
        if (linkedPrograms.length === 0) {
          gaps.push({
            type: 'unaddressed_challenge',
            severity: 'medium',
            challenge,
            title: { 
              en: `High-priority challenge: ${challenge.title_en}`, 
              ar: `تحدي عالي الأولوية: ${challenge.title_ar || challenge.title_en}` 
            },
            description: {
              en: 'This high-priority challenge has no program addressing it',
              ar: 'هذا التحدي عالي الأولوية ليس له برنامج يعالجه'
            }
          });
        }
      });

    // Gap 4: Sectors without active programs
    sectors.forEach(sector => {
      const sectorPrograms = programs.filter(p => 
        p.sector_id === sector.id && 
        (p.status === 'active' || p.status === 'approved')
      );
      
      if (sectorPrograms.length === 0) {
        gaps.push({
          type: 'sector_gap',
          severity: 'low',
          sector,
          title: { 
            en: `No active programs in: ${sector.name_en}`, 
            ar: `لا برامج نشطة في: ${sector.name_ar || sector.name_en}` 
          },
          description: {
            en: 'This sector has no active innovation programs',
            ar: 'هذا القطاع ليس له برامج ابتكار نشطة'
          }
        });
      }
    });

    return gaps;
  };

  const gaps = calculateGaps();

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const result = await invokeAI({
        prompt: `Based on these strategic gaps, recommend specific innovation programs to address them:

GAPS:
${gaps.map(g => `- ${g.title.en}: ${g.description.en}`).join('\n')}

EXISTING PROGRAMS: ${programs.length}
STRATEGIC PLANS: ${strategicPlans.map(p => p.name_en || p.title_en).join(', ')}

For each gap, recommend a specific program with:
- Program name (bilingual)
- Program type (capacity_building, innovation_challenge, mentorship, accelerator, training)
- Key objectives (3)
- Expected outcomes (3)
- Priority level (P0, P1, P2)
- Estimated duration (months)`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  gap_type: { type: 'string' },
                  program_name_en: { type: 'string' },
                  program_name_ar: { type: 'string' },
                  program_type: { type: 'string' },
                  objectives: { type: 'array', items: { type: 'string' } },
                  outcomes: { type: 'array', items: { type: 'string' } },
                  priority: { type: 'string' },
                  duration_months: { type: 'number' }
                }
              }
            }
          }
        }
      });

      if (result.success && result.data?.recommendations) {
        return result.data.recommendations;
      }

      // Fallback recommendations
      return gaps.slice(0, 5).map(gap => ({
        gap_type: gap.type,
        program_name_en: `${gap.type === 'no_programs' ? 'Strategy Execution' : 'Gap Coverage'} Program`,
        program_name_ar: `برنامج ${gap.type === 'no_programs' ? 'تنفيذ الاستراتيجية' : 'تغطية الفجوات'}`,
        program_type: 'capacity_building',
        objectives: ['Address identified gap', 'Build organizational capacity', 'Deliver measurable outcomes'],
        outcomes: ['Gap closure', 'Skill development', 'Strategic alignment'],
        priority: gap.severity === 'high' ? 'P0' : gap.severity === 'medium' ? 'P1' : 'P2',
        duration_months: 6,
        related_gap: gap
      }));
    },
    onSuccess: (recs) => {
      setRecommendations(recs);
      toast.success(t({ en: `Generated ${recs.length} program recommendations`, ar: `تم توليد ${recs.length} توصيات برنامج` }));
    },
    onError: (error) => {
      console.error('Recommendation error:', error);
      toast.error(t({ en: 'Failed to generate recommendations', ar: 'فشل في توليد التوصيات' }));
    }
  });

  const createProgramMutation = useMutation({
    mutationFn: async (rec) => {
      const { data: program, error } = await supabase.from('programs').insert({
        name_en: rec.program_name_en,
        name_ar: rec.program_name_ar,
        program_type: rec.program_type,
        status: 'draft',
        objectives: rec.objectives,
        target_outcomes: rec.outcomes?.map(o => ({ description: o, target: 100, current: 0 })),
        is_gap_derived: true,
        gap_derivation_date: new Date().toISOString(),
        priority: rec.priority,
        duration_months: rec.duration_months,
        strategic_plan_ids: rec.related_gap?.plan ? [rec.related_gap.plan.id] : []
      }).select().single();
      
      if (error) throw error;
      return program;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success(t({ en: 'Program created from recommendation', ar: 'تم إنشاء البرنامج من التوصية' }));
      onProgramCreated?.();
    },
    onError: (error) => {
      console.error('Program creation error:', error);
      toast.error(t({ en: 'Failed to create program', ar: 'فشل في إنشاء البرنامج' }));
    }
  });

  const severityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const gapTypeIcons = {
    no_programs: Target,
    uncovered_objective: Lightbulb,
    unaddressed_challenge: AlertTriangle,
    sector_gap: Users
  };

  return (
    <Card className="border-2 border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          {t({ en: 'Strategic Gap → Program Recommender', ar: 'موصي البرامج من الفجوات الاستراتيجية' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          {t({ 
            en: 'Identify strategic gaps and get AI-powered program recommendations', 
            ar: 'تحديد الفجوات الاستراتيجية والحصول على توصيات برامج بالذكاء الاصطناعي' 
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />

        {/* Gap Summary */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-slate-700">{gaps.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Gaps', ar: 'إجمالي الفجوات' })}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">{gaps.filter(g => g.severity === 'high').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'High Priority', ar: 'أولوية عالية' })}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">{gaps.filter(g => g.severity === 'medium').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Medium', ar: 'متوسط' })}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{gaps.filter(g => g.severity === 'low').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Low', ar: 'منخفض' })}</p>
          </div>
        </div>

        <Tabs defaultValue="gaps" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="gaps">
              {t({ en: 'Identified Gaps', ar: 'الفجوات المحددة' })} ({gaps.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              {t({ en: 'Recommendations', ar: 'التوصيات' })} ({recommendations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gaps" className="space-y-3 mt-4">
            {gaps.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">
                  {t({ en: 'No strategic gaps identified!', ar: 'لم يتم تحديد فجوات استراتيجية!' })}
                </p>
              </div>
            ) : (
              gaps.map((gap, index) => {
                const GapIcon = gapTypeIcons[gap.type] || AlertTriangle;
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${severityColors[gap.severity]}`}
                  >
                    <div className="flex items-start gap-3">
                      <GapIcon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {language === 'ar' ? gap.title.ar : gap.title.en}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {gap.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1 opacity-80">
                          {language === 'ar' ? gap.description.ar : gap.description.en}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {gaps.length > 0 && (
              <Button 
                onClick={() => generateRecommendationsMutation.mutate()}
                disabled={generateRecommendationsMutation.isPending || aiLoading}
                className="w-full mt-4"
              >
                {generateRecommendationsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Analyzing gaps...', ar: 'جاري تحليل الفجوات...' })}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {t({ en: 'Generate Program Recommendations', ar: 'توليد توصيات البرامج' })}
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-3 mt-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'Generate recommendations from the Gaps tab', ar: 'قم بتوليد التوصيات من تبويب الفجوات' })}</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={rec.priority === 'P0' ? 'text-red-600' : rec.priority === 'P1' ? 'text-amber-600' : 'text-blue-600'}>
                          {rec.priority}
                        </Badge>
                        <h4 className="font-semibold text-slate-800">
                          {language === 'ar' ? rec.program_name_ar : rec.program_name_en}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Badge variant="secondary">{rec.program_type?.replace(/_/g, ' ')}</Badge>
                        <span>•</span>
                        <span>{rec.duration_months} {t({ en: 'months', ar: 'شهور' })}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rec.objectives?.slice(0, 3).map((obj, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => createProgramMutation.mutate(rec)}
                      disabled={createProgramMutation.isPending}
                    >
                      {createProgramMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          {t({ en: 'Create', ar: 'إنشاء' })}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
