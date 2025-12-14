import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNationalAlignments } from '@/hooks/strategy';
import { supabase } from '@/integrations/supabase/client';
import {
  Link2,
  Target,
  Globe,
  Flag,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Building2,
  Leaf,
  Users,
  Lightbulb
} from 'lucide-react';

const VISION_2030_GOALS = [
  { id: 'v2030-1', code: 'V1', name_en: 'Vibrant Society', name_ar: 'مجتمع حيوي', icon: Users, color: 'bg-pink-500' },
  { id: 'v2030-2', code: 'V2', name_en: 'Thriving Economy', name_ar: 'اقتصاد مزدهر', icon: TrendingUp, color: 'bg-emerald-500' },
  { id: 'v2030-3', code: 'V3', name_en: 'Ambitious Nation', name_ar: 'وطن طموح', icon: Flag, color: 'bg-blue-500' }
];

const SDG_GOALS = [
  { id: 'sdg-9', code: 'SDG 9', name_en: 'Industry, Innovation & Infrastructure', name_ar: 'الصناعة والابتكار والبنية التحتية', icon: Lightbulb, color: 'bg-orange-500' },
  { id: 'sdg-11', code: 'SDG 11', name_en: 'Sustainable Cities & Communities', name_ar: 'مدن ومجتمعات مستدامة', icon: Building2, color: 'bg-amber-500' },
  { id: 'sdg-13', code: 'SDG 13', name_en: 'Climate Action', name_ar: 'العمل المناخي', icon: Leaf, color: 'bg-green-500' },
  { id: 'sdg-17', code: 'SDG 17', name_en: 'Partnerships for the Goals', name_ar: 'عقد الشراكات لتحقيق الأهداف', icon: Users, color: 'bg-blue-500' }
];

const NATIONAL_PRIORITIES = [
  { id: 'np-1', code: 'NIS-1', name_en: 'Digital Government Transformation', name_ar: 'التحول الرقمي الحكومي' },
  { id: 'np-2', code: 'NIS-2', name_en: 'Smart City Development', name_ar: 'تطوير المدن الذكية' },
  { id: 'np-3', code: 'NIS-3', name_en: 'Innovation Ecosystem Building', name_ar: 'بناء منظومة الابتكار' },
  { id: 'np-4', code: 'NIS-4', name_en: 'Public Service Excellence', name_ar: 'التميز في الخدمات العامة' },
  { id: 'np-5', code: 'NIS-5', name_en: 'Research & Development Investment', name_ar: 'الاستثمار في البحث والتطوير' }
];

const SAMPLE_OBJECTIVES = [
  { id: '1', title_en: 'Increase Digital Service Adoption', title_ar: 'زيادة تبني الخدمات الرقمية' },
  { id: '2', title_en: 'Reduce Response Time for Citizen Requests', title_ar: 'تقليل وقت الاستجابة لطلبات المواطنين' },
  { id: '3', title_en: 'Expand Innovation Partnerships', title_ar: 'توسيع شراكات الابتكار' },
  { id: '4', title_en: 'Improve Municipal MII Scores', title_ar: 'تحسين درجات مؤشر الابتكار البلدي' }
];

const NationalStrategyLinker = ({ strategicPlan, objectives = SAMPLE_OBJECTIVES, onSave }) => {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const strategicPlanId = strategicPlan?.id;
  
  const {
    alignments: dbAlignments,
    isLoading,
    saveAlignment,
    saveBulkAlignments,
    deleteAlignment
  } = useNationalAlignments(strategicPlanId);
  
  const [isAutoLinking, setIsAutoLinking] = useState(false);
  const [activeTab, setActiveTab] = useState('vision2030');

  const [alignments, setAlignments] = useState([]);
  
  useEffect(() => {
    if (dbAlignments && dbAlignments.length > 0) {
      setAlignments(dbAlignments);
    } else if (objectives.length > 0 && alignments.length === 0) {
      setAlignments(objectives.map(obj => ({
        objective_id: obj.id,
        objective_title: obj.title_en,
        vision_2030: [],
        sdg: [],
        national_priorities: [],
        alignment_score: 0,
        notes: ''
      })));
    }
  }, [dbAlignments, objectives]);

  const toggleAlignment = (objectiveId, category, goalId) => {
    setAlignments(prev => prev.map(a => {
      if (a.objective_id !== objectiveId) return a;
      const current = a[category];
      const updated = current.includes(goalId)
        ? current.filter(id => id !== goalId)
        : [...current, goalId];
      
      // Recalculate alignment score
      const totalLinks = updated.length + 
        (category === 'vision_2030' ? a.sdg.length + a.national_priorities.length :
         category === 'sdg' ? a.vision_2030.length + a.national_priorities.length :
         a.vision_2030.length + a.sdg.length);
      const maxPossible = VISION_2030_GOALS.length + SDG_GOALS.length + NATIONAL_PRIORITIES.length;
      const score = Math.round((totalLinks / maxPossible) * 100);

      return { ...a, [category]: updated, alignment_score: score };
    }));
  };

  const autoLinkWithAI = async () => {
    setIsAutoLinking(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-national-linker', {
        body: {
          objectives: alignments.map(a => ({ 
            objective_id: a.objective_id,
            title_en: a.objective_title 
          })),
          strategic_plan_context: strategicPlan?.vision_en || 'Municipal Innovation Strategy'
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      const { alignments: aiAlignments } = data;

      setAlignments(prev => prev.map((a, index) => {
        const suggestion = aiAlignments?.find(s => s.objective_index === index);
        if (!suggestion) return a;
        
        const newVision = [...new Set([...a.vision_2030, ...(suggestion.vision_2030 || [])])];
        const newSDG = [...new Set([...a.sdg, ...(suggestion.sdg || [])])];
        const newNP = [...new Set([...a.national_priorities, ...(suggestion.national_priorities || [])])];
        
        const totalLinks = newVision.length + newSDG.length + newNP.length;
        const maxPossible = VISION_2030_GOALS.length + SDG_GOALS.length + NATIONAL_PRIORITIES.length;
        
        return {
          ...a,
          vision_2030: newVision,
          sdg: newSDG,
          national_priorities: newNP,
          alignment_score: Math.round((totalLinks / maxPossible) * 100)
        };
      }));

      toast({
        title: t({ en: 'Auto-Linking Complete', ar: 'اكتمل الربط التلقائي' }),
        description: t({ en: 'AI has suggested alignments based on objective text analysis', ar: 'اقترح الذكاء الاصطناعي المحاذاة بناءً على تحليل نص الهدف' })
      });
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsAutoLinking(false);
    }
  };

  const handleSave = async () => {
    try {
      const success = await saveBulkAlignments(alignments);
      if (success && onSave) onSave(alignments);
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getOverallCoverage = () => {
    const allGoals = new Set();
    alignments.forEach(a => {
      a.vision_2030.forEach(g => allGoals.add(`v-${g}`));
      a.sdg.forEach(g => allGoals.add(`s-${g}`));
      a.national_priorities.forEach(g => allGoals.add(`n-${g}`));
    });
    const totalPossible = VISION_2030_GOALS.length + SDG_GOALS.length + NATIONAL_PRIORITIES.length;
    return Math.round((allGoals.size / totalPossible) * 100);
  };

  const getUnmappedGoals = () => {
    const mappedVision = new Set(alignments.flatMap(a => a.vision_2030));
    const mappedSDG = new Set(alignments.flatMap(a => a.sdg));
    const mappedNP = new Set(alignments.flatMap(a => a.national_priorities));

    return {
      vision: VISION_2030_GOALS.filter(g => !mappedVision.has(g.id)),
      sdg: SDG_GOALS.filter(g => !mappedSDG.has(g.id)),
      national: NATIONAL_PRIORITIES.filter(g => !mappedNP.has(g.id))
    };
  };

  const unmapped = getUnmappedGoals();
  const overallCoverage = getOverallCoverage();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Link2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">
                  {t({ en: 'National Strategy Linker', ar: 'رابط الاستراتيجية الوطنية' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Align objectives with Vision 2030, SDGs, and National Priorities', ar: 'مواءمة الأهداف مع رؤية 2030 وأهداف التنمية المستدامة والأولويات الوطنية' })}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">{t({ en: 'Overall Coverage', ar: 'التغطية الإجمالية' })}</p>
                <p className="text-2xl font-bold text-blue-600">{overallCoverage}%</p>
              </div>
              <Button
                variant="outline"
                onClick={autoLinkWithAI}
                disabled={isAutoLinking}
              >
                {isAutoLinking ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                )}
                {t({ en: 'Auto-Link with AI', ar: 'ربط تلقائي بالذكاء الاصطناعي' })}
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {t({ en: 'Save Alignments', ar: 'حفظ المحاذاة' })}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Unmapped Goals Warning */}
      {(unmapped.vision.length > 0 || unmapped.sdg.length > 0 || unmapped.national.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-2">
                  {t({ en: 'Unmapped National Goals', ar: 'أهداف وطنية غير مرتبطة' })}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {unmapped.vision.map(g => (
                    <Badge key={g.id} variant="outline" className="bg-white">
                      {g.code}: {language === 'ar' ? g.name_ar : g.name_en}
                    </Badge>
                  ))}
                  {unmapped.sdg.map(g => (
                    <Badge key={g.id} variant="outline" className="bg-white">
                      {g.code}
                    </Badge>
                  ))}
                  {unmapped.national.map(g => (
                    <Badge key={g.id} variant="outline" className="bg-white">
                      {g.code}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vision2030" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            {t({ en: 'Vision 2030', ar: 'رؤية 2030' })}
          </TabsTrigger>
          <TabsTrigger value="sdg" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t({ en: 'SDGs', ar: 'أهداف التنمية المستدامة' })}
          </TabsTrigger>
          <TabsTrigger value="national" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t({ en: 'National Priorities', ar: 'الأولويات الوطنية' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vision2030" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {alignments.map((alignment, index) => (
                  <div key={alignment.objective_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{alignment.objective_title}</span>
                      </div>
                      <Badge className={alignment.vision_2030.length > 0 ? 'bg-green-500' : 'bg-slate-400'}>
                        {alignment.vision_2030.length} {t({ en: 'linked', ar: 'مرتبط' })}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {VISION_2030_GOALS.map(goal => {
                        const Icon = goal.icon;
                        const isLinked = alignment.vision_2030.includes(goal.id);
                        return (
                          <div
                            key={goal.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isLinked ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => toggleAlignment(alignment.objective_id, 'vision_2030', goal.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${goal.color}`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{goal.code}</p>
                                <p className="text-xs text-slate-500">
                                  {language === 'ar' ? goal.name_ar : goal.name_en}
                                </p>
                              </div>
                              {isLinked && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sdg" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {alignments.map((alignment, index) => (
                  <div key={alignment.objective_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{alignment.objective_title}</span>
                      </div>
                      <Badge className={alignment.sdg.length > 0 ? 'bg-green-500' : 'bg-slate-400'}>
                        {alignment.sdg.length} {t({ en: 'linked', ar: 'مرتبط' })}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SDG_GOALS.map(goal => {
                        const Icon = goal.icon;
                        const isLinked = alignment.sdg.includes(goal.id);
                        return (
                          <div
                            key={goal.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isLinked ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => toggleAlignment(alignment.objective_id, 'sdg', goal.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${goal.color}`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{goal.code}</p>
                                <p className="text-xs text-slate-500">
                                  {language === 'ar' ? goal.name_ar : goal.name_en}
                                </p>
                              </div>
                              {isLinked && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="national" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {alignments.map((alignment, index) => (
                  <div key={alignment.objective_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{alignment.objective_title}</span>
                      </div>
                      <Badge className={alignment.national_priorities.length > 0 ? 'bg-green-500' : 'bg-slate-400'}>
                        {alignment.national_priorities.length} {t({ en: 'linked', ar: 'مرتبط' })}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {NATIONAL_PRIORITIES.map(priority => {
                        const isLinked = alignment.national_priorities.includes(priority.id);
                        return (
                          <div
                            key={priority.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isLinked ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => toggleAlignment(alignment.objective_id, 'national_priorities', priority.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-white">{priority.code}</Badge>
                                <span className="text-sm">
                                  {language === 'ar' ? priority.name_ar : priority.name_en}
                                </span>
                              </div>
                              {isLinked && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Coverage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t({ en: 'Alignment Summary', ar: 'ملخص المحاذاة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t({ en: 'Vision 2030', ar: 'رؤية 2030' })}</span>
                <span className="text-sm text-slate-500">
                  {new Set(alignments.flatMap(a => a.vision_2030)).size}/{VISION_2030_GOALS.length}
                </span>
              </div>
              <Progress 
                value={(new Set(alignments.flatMap(a => a.vision_2030)).size / VISION_2030_GOALS.length) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t({ en: 'SDGs', ar: 'أهداف التنمية المستدامة' })}</span>
                <span className="text-sm text-slate-500">
                  {new Set(alignments.flatMap(a => a.sdg)).size}/{SDG_GOALS.length}
                </span>
              </div>
              <Progress 
                value={(new Set(alignments.flatMap(a => a.sdg)).size / SDG_GOALS.length) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t({ en: 'National Priorities', ar: 'الأولويات الوطنية' })}</span>
                <span className="text-sm text-slate-500">
                  {new Set(alignments.flatMap(a => a.national_priorities)).size}/{NATIONAL_PRIORITIES.length}
                </span>
              </div>
              <Progress 
                value={(new Set(alignments.flatMap(a => a.national_priorities)).size / NATIONAL_PRIORITIES.length) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NationalStrategyLinker;
