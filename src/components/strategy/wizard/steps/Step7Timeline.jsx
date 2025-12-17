import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Sparkles, Loader2, Plus, X, Calendar, Flag, Link2, 
  Layers, Milestone, BarChart3, AlertTriangle, CheckCircle2,
  Clock, Target, Rocket, Search, Play, Pause, ArrowRight,
  GanttChart, CalendarDays, ListTree, GitBranch
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import EntityAllocationSelector from '../EntityAllocationSelector';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Phase categories with metadata
const PHASE_CATEGORIES = {
  foundation: {
    label_en: 'Foundation & Setup',
    label_ar: 'التأسيس والإعداد',
    icon: '🏗️',
    color: 'bg-blue-500',
    description_en: 'Initial setup, governance, partnerships',
    description_ar: 'الإعداد الأولي والحوكمة والشراكات'
  },
  pilot: {
    label_en: 'Pilot Development',
    label_ar: 'تطوير التجريبي',
    icon: '🧪',
    color: 'bg-purple-500',
    description_en: 'Launch and execute pilot programs',
    description_ar: 'إطلاق وتنفيذ البرامج التجريبية'
  },
  evaluation: {
    label_en: 'Evaluation & Iteration',
    label_ar: 'التقييم والتكرار',
    icon: '📊',
    color: 'bg-amber-500',
    description_en: 'Assess outcomes, iterate solutions',
    description_ar: 'تقييم النتائج وتحسين الحلول'
  },
  scale: {
    label_en: 'Scale & Integration',
    label_ar: 'التوسع والتكامل',
    icon: '📈',
    color: 'bg-green-500',
    description_en: 'Scale successful initiatives',
    description_ar: 'توسيع نطاق المبادرات الناجحة'
  },
  optimization: {
    label_en: 'Optimization',
    label_ar: 'التحسين',
    icon: '⚡',
    color: 'bg-teal-500',
    description_en: 'Continuous improvement and refinement',
    description_ar: 'التحسين المستمر والصقل'
  }
};

// Enhanced milestone types
const MILESTONE_TYPES = {
  milestone: { label_en: 'Milestone', label_ar: 'معلم', icon: '🏁', color: 'bg-gray-500' },
  launch: { label_en: 'Launch', label_ar: 'إطلاق', icon: '🚀', color: 'bg-green-500' },
  review: { label_en: 'Review', label_ar: 'مراجعة', icon: '📊', color: 'bg-blue-500' },
  gate: { label_en: 'Decision Gate', label_ar: 'بوابة قرار', icon: '🚦', color: 'bg-amber-500' },
  deliverable: { label_en: 'Deliverable', label_ar: 'تسليم', icon: '📦', color: 'bg-purple-500' },
  certification: { label_en: 'Certification', label_ar: 'شهادة', icon: '✅', color: 'bg-teal-500' },
  decision: { label_en: 'Decision Point', label_ar: 'نقطة قرار', icon: '⚖️', color: 'bg-red-500' }
};

// Milestone criticality levels
const CRITICALITY_LEVELS = {
  critical: { label_en: 'Critical Path', label_ar: 'مسار حرج', color: 'destructive' },
  high: { label_en: 'High Priority', label_ar: 'أولوية عالية', color: 'default' },
  medium: { label_en: 'Medium', label_ar: 'متوسط', color: 'secondary' },
  low: { label_en: 'Standard', label_ar: 'عادي', color: 'outline' }
};

export default function Step7Timeline({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  strategicPlanId 
}) {
  const { language, t, isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState('phases');
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const milestones = data.milestones || [];
  const phases = data.phases || [];
  const objectives = data.objectives || [];

  // Calculate timeline statistics
  const stats = useMemo(() => {
    const totalPhases = phases.length;
    const totalMilestones = milestones.length;
    const planDuration = (data.end_year || new Date().getFullYear() + 5) - (data.start_year || new Date().getFullYear());
    
    // Calculate phase coverage
    const phasesWithDates = phases.filter(p => p.start_date && p.end_date);
    const coveragePercent = totalPhases > 0 ? Math.round((phasesWithDates.length / totalPhases) * 100) : 0;
    
    // Critical milestones
    const criticalMilestones = milestones.filter(m => m.criticality === 'critical' || m.type === 'gate').length;
    
    // Milestones by type
    const milestonesByType = milestones.reduce((acc, m) => {
      acc[m.type || 'milestone'] = (acc[m.type || 'milestone'] || 0) + 1;
      return acc;
    }, {});
    
    // Phases by category
    const phasesByCategory = phases.reduce((acc, p) => {
      acc[p.category || 'foundation'] = (acc[p.category || 'foundation'] || 0) + 1;
      return acc;
    }, {});

    // Check for timeline gaps
    const sortedPhases = [...phases]
      .filter(p => p.start_date && p.end_date)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    let hasGaps = false;
    for (let i = 1; i < sortedPhases.length; i++) {
      const prevEnd = new Date(sortedPhases[i - 1].end_date);
      const currStart = new Date(sortedPhases[i].start_date);
      if (currStart > prevEnd) {
        const gapDays = Math.ceil((currStart - prevEnd) / (1000 * 60 * 60 * 24));
        if (gapDays > 30) hasGaps = true;
      }
    }
    
    return {
      totalPhases,
      totalMilestones,
      planDuration,
      coveragePercent,
      criticalMilestones,
      milestonesByType,
      phasesByCategory,
      hasGaps,
      phasesWithDates: phasesWithDates.length
    };
  }, [phases, milestones, data.start_year, data.end_year]);

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    if (!searchTerm) return milestones;
    const term = searchTerm.toLowerCase();
    return milestones.filter(m => 
      (m.name_en?.toLowerCase().includes(term)) ||
      (m.name_ar?.includes(term)) ||
      (m.type?.toLowerCase().includes(term))
    );
  }, [milestones, searchTerm]);

  const addMilestone = () => {
    onChange({
      milestones: [...milestones, {
        id: Date.now().toString() + 'ms' + milestones.length,
        name_en: '',
        name_ar: '',
        date: '',
        type: 'milestone',
        criticality: 'medium',
        status: 'planned',
        description_en: '',
        description_ar: '',
        linked_phase: null,
        success_criteria_en: '',
        success_criteria_ar: '',
        entity_milestones: []
      }]
    });
  };

  const updateMilestone = (index, updates) => {
    const updated = milestones.map((m, i) => i === index ? { ...m, ...updates } : m);
    onChange({ milestones: updated });
  };

  const removeMilestone = (index) => {
    onChange({ milestones: milestones.filter((_, i) => i !== index) });
  };

  const addPhase = () => {
    onChange({
      phases: [...phases, {
        id: Date.now().toString() + 'phase' + phases.length,
        name_en: '',
        name_ar: '',
        category: 'foundation',
        start_date: '',
        end_date: '',
        description_en: '',
        description_ar: '',
        objectives_covered: [],
        key_deliverables_en: '',
        key_deliverables_ar: '',
        success_metrics_en: '',
        success_metrics_ar: '',
        budget_allocation: '',
        entity_phases: []
      }]
    });
  };

  const updatePhase = (index, updates) => {
    const updated = phases.map((p, i) => i === index ? { ...p, ...updates } : p);
    onChange({ phases: updated });
  };

  const removePhase = (index) => {
    onChange({ phases: phases.filter((_, i) => i !== index) });
  };

  const toggleObjectiveCovered = (phaseIndex, objectiveIndex, checked) => {
    const current = phases[phaseIndex]?.objectives_covered || [];
    const next = checked
      ? Array.from(new Set([...current, objectiveIndex]))
      : current.filter((i) => i !== objectiveIndex);
    updatePhase(phaseIndex, { objectives_covered: next });
  };

  // Calculate phase duration in months
  const getPhaseDuration = (phase) => {
    if (!phase.start_date || !phase.end_date) return null;
    const start = new Date(phase.start_date);
    const end = new Date(phase.end_date);
    const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  // Get milestone status color
  const getMilestoneStatusColor = (milestone) => {
    if (!milestone.date) return 'bg-muted';
    const date = new Date(milestone.date);
    const now = new Date();
    if (milestone.status === 'completed') return 'bg-green-500';
    if (date < now) return 'bg-red-500';
    if (date < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  // Render Gantt-style timeline visualization
  const renderGanttView = () => {
    const startYear = data.start_year || new Date().getFullYear();
    const endYear = data.end_year || startYear + 5;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const totalMonths = years.length * 12;
    
    const getPositionPercent = (dateStr) => {
      if (!dateStr) return 0;
      const date = new Date(dateStr);
      const planStart = new Date(startYear, 0, 1);
      const planEnd = new Date(endYear, 11, 31);
      const totalDays = (planEnd - planStart) / (1000 * 60 * 60 * 24);
      const daysSinceStart = (date - planStart) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.min(100, (daysSinceStart / totalDays) * 100));
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GanttChart className="h-5 w-5" />
            {t({ en: 'Timeline Visualization', ar: 'عرض الجدول الزمني' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Year headers */}
          <div className="mb-4">
            <div className="flex border-b">
              <div className="w-48 shrink-0 p-2 font-medium border-r bg-muted/50">
                {t({ en: 'Phase / Milestone', ar: 'المرحلة / المعلم' })}
              </div>
              <div className="flex-1 flex">
                {years.map(year => (
                  <div key={year} className="flex-1 text-center p-2 border-r text-sm font-medium bg-muted/30">
                    {year}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-2 mb-4">
            {phases.map((phase, index) => {
              const startPos = getPositionPercent(phase.start_date);
              const endPos = getPositionPercent(phase.end_date);
              const width = endPos - startPos;
              const category = PHASE_CATEGORIES[phase.category] || PHASE_CATEGORIES.foundation;

              return (
                <div key={phase.id || index} className="flex items-center">
                  <div className="w-48 shrink-0 p-2 text-sm truncate border-r">
                    <span className="mr-1">{category.icon}</span>
                    {language === 'ar' ? (phase.name_ar || phase.name_en) : (phase.name_en || phase.name_ar) || `Phase ${index + 1}`}
                  </div>
                  <div className="flex-1 relative h-8 bg-muted/20 rounded">
                    {phase.start_date && phase.end_date && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`absolute h-6 top-1 rounded ${category.color} opacity-80 cursor-pointer hover:opacity-100 transition-opacity`}
                              style={{ left: `${startPos}%`, width: `${Math.max(width, 2)}%` }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{language === 'ar' ? phase.name_ar : phase.name_en}</p>
                            <p className="text-xs text-muted-foreground">
                              {phase.start_date} → {phase.end_date}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Milestones */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2 text-muted-foreground">
              {t({ en: 'Key Milestones', ar: 'المعالم الرئيسية' })}
            </p>
            <div className="relative h-12 bg-muted/20 rounded">
              {milestones.filter(m => m.date).map((milestone, index) => {
                const pos = getPositionPercent(milestone.date);
                const type = MILESTONE_TYPES[milestone.type] || MILESTONE_TYPES.milestone;
                
                return (
                  <TooltipProvider key={milestone.id || index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer hover:scale-125 transition-transform ${getMilestoneStatusColor(milestone)}`}
                          style={{ left: `calc(${pos}% - 12px)` }}
                        >
                          {type.icon}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{language === 'ar' ? milestone.name_ar : milestone.name_en}</p>
                        <p className="text-xs text-muted-foreground">{milestone.date}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t({ en: 'AI-Powered Timeline Generation', ar: 'إنشاء الجدول الزمني بالذكاء الاصطناعي' })}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Generate implementation phases, milestones, and critical path based on objectives and action plans', ar: 'إنشاء مراحل التنفيذ والمعالم والمسار الحرج بناءً على الأهداف وخطط العمل' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating} size="lg">
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Timeline', ar: 'إنشاء الجدول' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Dashboard */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t({ en: 'Timeline Dashboard', ar: 'لوحة الجدول الزمني' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Plan Duration */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">{t({ en: 'Duration', ar: 'المدة' })}</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.planDuration}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Years', ar: 'سنوات' })}</p>
            </div>

            {/* Total Phases */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">{t({ en: 'Phases', ar: 'المراحل' })}</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.totalPhases}</p>
              <p className="text-xs text-muted-foreground">
                {stats.phasesWithDates}/{stats.totalPhases} {t({ en: 'dated', ar: 'مؤرخة' })}
              </p>
            </div>

            {/* Total Milestones */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-3 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Flag className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">{t({ en: 'Milestones', ar: 'المعالم' })}</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.totalMilestones}</p>
              <p className="text-xs text-muted-foreground">
                {stats.criticalMilestones} {t({ en: 'critical', ar: 'حرج' })}
              </p>
            </div>

            {/* Coverage */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg p-3 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">{t({ en: 'Coverage', ar: 'التغطية' })}</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.coveragePercent}%</p>
              <Progress value={stats.coveragePercent} className="h-1 mt-1" />
            </div>

            {/* Timeline Health */}
            <div className={`bg-gradient-to-br rounded-lg p-3 border ${stats.hasGaps ? 'from-red-500/10 to-red-600/5 border-red-500/20' : 'from-teal-500/10 to-teal-600/5 border-teal-500/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                {stats.hasGaps ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-teal-500" />}
                <span className="text-xs text-muted-foreground">{t({ en: 'Health', ar: 'الصحة' })}</span>
              </div>
              <p className={`text-lg font-bold ${stats.hasGaps ? 'text-red-600' : 'text-teal-600'}`}>
                {stats.hasGaps ? t({ en: 'Gaps Found', ar: 'فجوات' }) : t({ en: 'Continuous', ar: 'متصل' })}
              </p>
            </div>

            {/* Year Range */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-lg p-3 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                <span className="text-xs text-muted-foreground">{t({ en: 'Period', ar: 'الفترة' })}</span>
              </div>
              <p className="text-lg font-bold text-indigo-600">
                {data.start_year} - {data.end_year}
              </p>
            </div>
          </div>

          {/* Phase Category Distribution */}
          {Object.keys(stats.phasesByCategory).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">{t({ en: 'Phase Categories', ar: 'فئات المراحل' })}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.phasesByCategory).map(([cat, count]) => {
                  const category = PHASE_CATEGORIES[cat] || PHASE_CATEGORIES.foundation;
                  return (
                    <Badge key={cat} variant="outline" className="gap-1">
                      <span>{category.icon}</span>
                      {language === 'ar' ? category.label_ar : category.label_en}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milestone Type Distribution */}
          {Object.keys(stats.milestonesByType).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">{t({ en: 'Milestone Types', ar: 'أنواع المعالم' })}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.milestonesByType).map(([type, count]) => {
                  const msType = MILESTONE_TYPES[type] || MILESTONE_TYPES.milestone;
                  return (
                    <Badge key={type} variant="secondary" className="gap-1">
                      <span>{msType.icon}</span>
                      {language === 'ar' ? msType.label_ar : msType.label_en}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phases" className="gap-2">
            <Layers className="h-4 w-4" />
            {t({ en: 'Phases', ar: 'المراحل' })}
          </TabsTrigger>
          <TabsTrigger value="milestones" className="gap-2">
            <Flag className="h-4 w-4" />
            {t({ en: 'Milestones', ar: 'المعالم' })}
          </TabsTrigger>
          <TabsTrigger value="gantt" className="gap-2">
            <GanttChart className="h-4 w-4" />
            {t({ en: 'Gantt View', ar: 'عرض جانت' })}
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t({ en: 'Summary', ar: 'ملخص' })}
          </TabsTrigger>
        </TabsList>

        {/* Phases View */}
        <TabsContent value="phases" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t({ en: 'Implementation Phases', ar: 'مراحل التنفيذ' })}</CardTitle>
                  <CardDescription>{t({ en: 'Define major phases with categories and objectives coverage', ar: 'حدد المراحل الرئيسية مع الفئات وتغطية الأهداف' })}</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={addPhase}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t({ en: 'Add Phase', ar: 'إضافة مرحلة' })}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {phases.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    {t({ en: 'No phases defined. Add phases or use AI generation.', ar: 'لم يتم تحديد مراحل. أضف مراحل أو استخدم الإنشاء بالذكاء الاصطناعي.' })}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {phases.map((phase, index) => {
                    const category = PHASE_CATEGORIES[phase.category] || PHASE_CATEGORIES.foundation;
                    const duration = getPhaseDuration(phase);
                    const isExpanded = expandedPhase === index;

                    return (
                      <div key={phase.id || index} className="border rounded-lg overflow-hidden">
                        {/* Phase Header */}
                        <div 
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${category.color}/10`}
                          onClick={() => setExpandedPhase(isExpanded ? null : index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{t({ en: 'Phase', ar: 'مرحلة' })} {index + 1}</Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {language === 'ar' ? category.label_ar : category.label_en}
                                  </Badge>
                                </div>
                                <h4 className="font-medium mt-1">
                                  {language === 'ar' ? (phase.name_ar || phase.name_en) : (phase.name_en || phase.name_ar) || t({ en: 'Unnamed Phase', ar: 'مرحلة بدون اسم' })}
                                </h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {duration && (
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {duration} {t({ en: 'months', ar: 'شهر' })}
                                </Badge>
                              )}
                              {phase.objectives_covered?.length > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                  <Target className="h-3 w-3" />
                                  {phase.objectives_covered.length} {t({ en: 'objectives', ar: 'أهداف' })}
                                </Badge>
                              )}
                              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); removePhase(index); }}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Phase Details (Expanded) */}
                        {isExpanded && (
                          <div className="p-4 border-t bg-muted/20 space-y-4">
                            {/* Category Selection */}
                            <div className="space-y-1">
                              <Label className="text-xs">{t({ en: 'Phase Category', ar: 'فئة المرحلة' })}</Label>
                              <Select value={phase.category || 'foundation'} onValueChange={(v) => updatePhase(index, { category: v })}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(PHASE_CATEGORIES).map(([key, cat]) => (
                                    <SelectItem key={key} value={key}>
                                      <span className="flex items-center gap-2">
                                        <span>{cat.icon}</span>
                                        {language === 'ar' ? cat.label_ar : cat.label_en}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Names */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">{t({ en: 'Phase Name (EN)', ar: 'اسم المرحلة (إنجليزي)' })}</Label>
                                <Input
                                  value={phase.name_en}
                                  onChange={(e) => updatePhase(index, { name_en: e.target.value })}
                                  placeholder={t({ en: 'e.g., Foundation Phase', ar: 'مثال: مرحلة التأسيس' })}
                                  dir="ltr"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t({ en: 'Phase Name (AR)', ar: 'اسم المرحلة (عربي)' })}</Label>
                                <Input
                                  value={phase.name_ar}
                                  onChange={(e) => updatePhase(index, { name_ar: e.target.value })}
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">{t({ en: 'Start Date', ar: 'تاريخ البداية' })}</Label>
                                <Input
                                  type="date"
                                  value={phase.start_date}
                                  onChange={(e) => updatePhase(index, { start_date: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t({ en: 'End Date', ar: 'تاريخ النهاية' })}</Label>
                                <Input
                                  type="date"
                                  value={phase.end_date}
                                  onChange={(e) => updatePhase(index, { end_date: e.target.value })}
                                />
                              </div>
                            </div>

                            {/* Descriptions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">{t({ en: 'Description (EN)', ar: 'الوصف (إنجليزي)' })}</Label>
                                <Textarea
                                  value={phase.description_en || phase.description || ''}
                                  onChange={(e) => updatePhase(index, { description_en: e.target.value })}
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t({ en: 'Description (AR)', ar: 'الوصف (عربي)' })}</Label>
                                <Textarea
                                  dir="rtl"
                                  value={phase.description_ar || ''}
                                  onChange={(e) => updatePhase(index, { description_ar: e.target.value })}
                                  rows={2}
                                />
                              </div>
                            </div>

                            {/* Key Deliverables */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">{t({ en: 'Key Deliverables (EN)', ar: 'المخرجات الرئيسية (إنجليزي)' })}</Label>
                                <Textarea
                                  value={phase.key_deliverables_en || ''}
                                  onChange={(e) => updatePhase(index, { key_deliverables_en: e.target.value })}
                                  placeholder={t({ en: 'List key outputs...', ar: 'اذكر المخرجات الرئيسية...' })}
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">{t({ en: 'Key Deliverables (AR)', ar: 'المخرجات الرئيسية (عربي)' })}</Label>
                                <Textarea
                                  dir="rtl"
                                  value={phase.key_deliverables_ar || ''}
                                  onChange={(e) => updatePhase(index, { key_deliverables_ar: e.target.value })}
                                  rows={2}
                                />
                              </div>
                            </div>

                            {/* Objectives Coverage */}
                            {objectives.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-xs">{t({ en: 'Objectives Covered', ar: 'الأهداف المشمولة' })}</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {objectives.map((obj, objIndex) => {
                                    const checked = (phase.objectives_covered || []).includes(objIndex);
                                    const label = language === 'ar' ? (obj.name_ar || obj.name_en) : (obj.name_en || obj.name_ar);
                                    return (
                                      <label key={objIndex} className="flex items-start gap-2 rounded-md border p-2 hover:bg-muted/50 cursor-pointer">
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(v) => toggleObjectiveCovered(index, objIndex, Boolean(v))}
                                        />
                                        <span className="text-sm leading-5">{label || `${t({ en: 'Objective', ar: 'هدف' })} ${objIndex + 1}`}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Entity Allocation */}
                            <div className="space-y-1 pt-2 border-t">
                              <Label className="text-xs flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                {t({ en: 'Link to Entities', ar: 'ربط بالكيانات' })}
                              </Label>
                              <EntityAllocationSelector
                                strategicPlanId={strategicPlanId}
                                value={phase.entity_phases || []}
                                onChange={(allocations) => updatePhase(index, { entity_phases: allocations })}
                                multiple={true}
                                placeholder={t({ en: 'Select entities for this phase...', ar: 'اختر الكيانات لهذه المرحلة...' })}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones View */}
        <TabsContent value="milestones" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    {t({ en: 'Key Milestones', ar: 'المعالم الرئيسية' })}
                  </CardTitle>
                  <CardDescription>{t({ en: 'Important dates, checkpoints, and decision gates', ar: 'التواريخ المهمة ونقاط المراجعة وبوابات القرار' })}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t({ en: 'Search milestones...', ar: 'بحث في المعالم...' })}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={addMilestone}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Flag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    {t({ en: 'No milestones defined yet.', ar: 'لم يتم تحديد معالم بعد.' })}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMilestones.map((milestone, index) => {
                    const actualIndex = milestones.findIndex(m => m.id === milestone.id || m === milestone);
                    const msType = MILESTONE_TYPES[milestone.type] || MILESTONE_TYPES.milestone;
                    const criticality = CRITICALITY_LEVELS[milestone.criticality] || CRITICALITY_LEVELS.medium;

                    return (
                      <div key={milestone.id || index} className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors">
                        {/* Milestone Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{msType.icon}</span>
                            <Badge variant={criticality.color}>
                              {language === 'ar' ? criticality.label_ar : criticality.label_en}
                            </Badge>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => removeMilestone(actualIndex)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Name, Date, Type Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Milestone (EN)', ar: 'المعلم (إنجليزي)' })}</Label>
                            <Input
                              value={milestone.name_en}
                              onChange={(e) => updateMilestone(actualIndex, { name_en: e.target.value })}
                              placeholder={t({ en: 'Milestone name', ar: 'اسم المعلم' })}
                              dir="ltr"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Milestone (AR)', ar: 'المعلم (عربي)' })}</Label>
                            <Input
                              value={milestone.name_ar}
                              onChange={(e) => updateMilestone(actualIndex, { name_ar: e.target.value })}
                              dir="rtl"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Date', ar: 'التاريخ' })}</Label>
                            <Input
                              type="date"
                              value={milestone.date}
                              onChange={(e) => updateMilestone(actualIndex, { date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                            <Select value={milestone.type} onValueChange={(v) => updateMilestone(actualIndex, { type: v })}>
                              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Object.entries(MILESTONE_TYPES).map(([key, type]) => (
                                  <SelectItem key={key} value={key}>
                                    <span className="flex items-center gap-2">
                                      <span>{type.icon}</span>
                                      {language === 'ar' ? type.label_ar : type.label_en}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Criticality and Linked Phase */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Criticality', ar: 'الأهمية' })}</Label>
                            <Select value={milestone.criticality || 'medium'} onValueChange={(v) => updateMilestone(actualIndex, { criticality: v })}>
                              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {Object.entries(CRITICALITY_LEVELS).map(([key, level]) => (
                                  <SelectItem key={key} value={key}>
                                    {language === 'ar' ? level.label_ar : level.label_en}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Linked Phase', ar: 'المرحلة المرتبطة' })}</Label>
                            <Select value={milestone.linked_phase?.toString() || 'none'} onValueChange={(v) => updateMilestone(actualIndex, { linked_phase: v && v !== 'none' ? parseInt(v) : null })}>
                              <SelectTrigger className="h-9"><SelectValue placeholder={t({ en: 'Select phase...', ar: 'اختر المرحلة...' })} /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">{t({ en: 'None', ar: 'لا شيء' })}</SelectItem>
                                {phases.map((phase, pIndex) => (
                                  <SelectItem key={pIndex} value={pIndex.toString()}>
                                    {language === 'ar' ? (phase.name_ar || phase.name_en) : (phase.name_en || phase.name_ar) || `Phase ${pIndex + 1}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Descriptions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Description (EN)', ar: 'الوصف (إنجليزي)' })}</Label>
                            <Textarea
                              value={milestone.description_en || milestone.description || ''}
                              onChange={(e) => updateMilestone(actualIndex, { description_en: e.target.value })}
                              rows={2}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Description (AR)', ar: 'الوصف (عربي)' })}</Label>
                            <Textarea
                              dir="rtl"
                              value={milestone.description_ar || ''}
                              onChange={(e) => updateMilestone(actualIndex, { description_ar: e.target.value })}
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Success Criteria */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Success Criteria (EN)', ar: 'معايير النجاح (إنجليزي)' })}</Label>
                            <Textarea
                              value={milestone.success_criteria_en || ''}
                              onChange={(e) => updateMilestone(actualIndex, { success_criteria_en: e.target.value })}
                              placeholder={t({ en: 'How will success be measured?', ar: 'كيف سيتم قياس النجاح؟' })}
                              rows={2}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Success Criteria (AR)', ar: 'معايير النجاح (عربي)' })}</Label>
                            <Textarea
                              dir="rtl"
                              value={milestone.success_criteria_ar || ''}
                              onChange={(e) => updateMilestone(actualIndex, { success_criteria_ar: e.target.value })}
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Entity Allocation */}
                        <div className="space-y-1 pt-2 border-t">
                          <Label className="text-xs flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            {t({ en: 'Link to Entities', ar: 'ربط بالكيانات' })}
                          </Label>
                          <EntityAllocationSelector
                            strategicPlanId={strategicPlanId}
                            value={milestone.entity_milestones || []}
                            onChange={(allocations) => updateMilestone(actualIndex, { entity_milestones: allocations })}
                            multiple={true}
                            placeholder={t({ en: 'Select entities for this milestone...', ar: 'اختر الكيانات لهذا المعلم...' })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gantt View */}
        <TabsContent value="gantt" className="mt-4">
          {renderGanttView()}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-4 space-y-6">
          {/* Phase Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-primary" />
                {t({ en: 'Phase Distribution', ar: 'توزيع المراحل' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(PHASE_CATEGORIES).map(([key, cat]) => {
                  const count = stats.phasesByCategory[key] || 0;
                  const percent = stats.totalPhases > 0 ? Math.round((count / stats.totalPhases) * 100) : 0;
                  return (
                    <div key={key} className="text-center p-3 rounded-lg border bg-muted/20">
                      <span className="text-2xl">{cat.icon}</span>
                      <p className="text-xl font-bold mt-1">{count}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' ? cat.label_ar : cat.label_en}
                      </p>
                      <Progress value={percent} className="h-1 mt-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Milestone Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flag className="h-5 w-5 text-primary" />
                {t({ en: 'Milestone Distribution', ar: 'توزيع المعالم' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(MILESTONE_TYPES).map(([key, type]) => {
                  const count = stats.milestonesByType[key] || 0;
                  return (
                    <div key={key} className="text-center p-3 rounded-lg border bg-muted/20">
                      <span className="text-xl">{type.icon}</span>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {language === 'ar' ? type.label_ar : type.label_en}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                {t({ en: 'Quality Metrics', ar: 'مقاييس الجودة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">{t({ en: 'Coverage', ar: 'التغطية' })}</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.coveragePercent}%</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Phases with dates', ar: 'مراحل بتواريخ' })}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{t({ en: 'Critical', ar: 'حرج' })}</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.criticalMilestones}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Critical milestones', ar: 'معالم حرجة' })}</p>
                </div>

                <div className={`p-4 rounded-lg border ${stats.hasGaps ? 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20' : 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20'}`}>
                  <div className={`flex items-center gap-2 mb-2 ${stats.hasGaps ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.hasGaps ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span className="text-sm font-medium">{t({ en: 'Continuity', ar: 'الاستمرارية' })}</span>
                  </div>
                  <p className="text-lg font-bold">
                    {stats.hasGaps ? t({ en: 'Has Gaps', ar: 'فجوات' }) : t({ en: 'Continuous', ar: 'متصل' })}
                  </p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Timeline health', ar: 'صحة الجدول' })}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{t({ en: 'Duration', ar: 'المدة' })}</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.planDuration}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Years total', ar: 'سنوات إجمالي' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <RecommendationsCard
            title={t({ en: 'Recommendations', ar: 'التوصيات' })}
            language={language}
            showDescriptions={true}
            className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
            recommendations={[
              ...(stats.totalPhases === 0 ? [{
                type: 'warning',
                icon: AlertTriangle,
                message: { en: 'No phases defined', ar: 'لم يتم تحديد مراحل' },
                description: { en: 'Add implementation phases or use AI generation to create a structured timeline.', ar: 'أضف مراحل التنفيذ أو استخدم الإنشاء بالذكاء الاصطناعي لإنشاء جدول زمني منظم.' }
              }] : []),
              ...(stats.totalMilestones === 0 ? [{
                type: 'warning',
                icon: Flag,
                message: { en: 'No milestones defined', ar: 'لم يتم تحديد معالم' },
                description: { en: 'Define key milestones to track progress and decision points.', ar: 'حدد المعالم الرئيسية لتتبع التقدم ونقاط القرار.' }
              }] : []),
              ...(stats.criticalMilestones === 0 && stats.totalMilestones > 0 ? [{
                type: 'info',
                icon: Target,
                message: { en: 'No critical milestones', ar: 'لا توجد معالم حرجة' },
                description: { en: 'Consider marking key milestones as critical to highlight the critical path.', ar: 'فكر في تحديد المعالم الرئيسية كحرجة لتسليط الضوء على المسار الحرج.' }
              }] : []),
              ...(stats.hasGaps ? [{
                type: 'error',
                icon: AlertTriangle,
                message: { en: 'Timeline gaps detected', ar: 'تم اكتشاف فجوات في الجدول' },
                description: { en: 'Review phase dates to ensure continuous coverage throughout the plan period.', ar: 'راجع تواريخ المراحل لضمان التغطية المستمرة طوال فترة الخطة.' }
              }] : []),
              ...(stats.coveragePercent < 80 && stats.totalPhases > 0 ? [{
                type: 'warning',
                icon: Calendar,
                message: { en: 'Low date coverage', ar: 'تغطية تواريخ منخفضة' },
                description: { en: 'Add start and end dates to all phases for better timeline visualization.', ar: 'أضف تواريخ البداية والنهاية لجميع المراحل لتحسين عرض الجدول الزمني.' }
              }] : []),
              ...(stats.totalPhases > 0 && stats.totalMilestones > 0 && stats.coveragePercent >= 80 && !stats.hasGaps ? [{
                type: 'success',
                icon: CheckCircle2,
                message: { en: 'Timeline is well-structured', ar: 'الجدول الزمني منظم جيداً' },
                description: { en: 'Your implementation timeline has good coverage and structure.', ar: 'جدول التنفيذ الخاص بك يتمتع بتغطية وهيكل جيد.' }
              }] : []),
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Stats / Summary Card */}
      {(phases.length > 0 || milestones.length > 0) && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{phases.length}</strong> {t({ en: 'phases', ar: 'مراحل' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{milestones.length}</strong> {t({ en: 'milestones', ar: 'معالم' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{stats.planDuration}</strong> {t({ en: 'year plan', ar: 'سنوات' })}
                  </span>
                </div>
              </div>
              {stats.hasGaps && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t({ en: 'Timeline has gaps', ar: 'الجدول الزمني به فجوات' })}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
