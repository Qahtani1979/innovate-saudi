import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Sparkles, Plus, X, ChevronDown, ChevronUp, RefreshCw, Users, Target, 
  BookOpen, AlertTriangle, CheckCircle, Clock, TrendingUp, Layers,
  GraduationCap, UserCheck, Shield, Heart, Zap, ArrowRight, BarChart3,
  Calendar, Award, MessageSquare, Lightbulb, Settings, Eye, List, GitBranch,
  Info, AlertCircle, PieChart
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import EntityAllocationSelector from '../EntityAllocationSelector';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Change Phase Types (ADKAR Model)
const CHANGE_PHASES = [
  { value: 'awareness', label: { en: 'Awareness', ar: 'الوعي' }, icon: Eye, color: 'bg-blue-500', description: { en: 'Build understanding of need for change', ar: 'بناء فهم للحاجة إلى التغيير' } },
  { value: 'desire', label: { en: 'Desire', ar: 'الرغبة' }, icon: Heart, color: 'bg-pink-500', description: { en: 'Generate motivation to participate', ar: 'توليد الدافع للمشاركة' } },
  { value: 'knowledge', label: { en: 'Knowledge', ar: 'المعرفة' }, icon: BookOpen, color: 'bg-purple-500', description: { en: 'Provide skills and information', ar: 'توفير المهارات والمعلومات' } },
  { value: 'ability', label: { en: 'Ability', ar: 'القدرة' }, icon: Zap, color: 'bg-orange-500', description: { en: 'Enable practical application', ar: 'تمكين التطبيق العملي' } },
  { value: 'reinforcement', label: { en: 'Reinforcement', ar: 'التعزيز' }, icon: Award, color: 'bg-green-500', description: { en: 'Sustain the change over time', ar: 'استدامة التغيير مع مرور الوقت' } }
];

// Stakeholder Impact Levels
const IMPACT_LEVELS = [
  { value: 'transformational', label: { en: 'Transformational', ar: 'تحويلي' }, color: 'text-red-500 bg-red-50', score: 5 },
  { value: 'significant', label: { en: 'Significant', ar: 'كبير' }, color: 'text-orange-500 bg-orange-50', score: 4 },
  { value: 'moderate', label: { en: 'Moderate', ar: 'متوسط' }, color: 'text-yellow-500 bg-yellow-50', score: 3 },
  { value: 'minor', label: { en: 'Minor', ar: 'طفيف' }, color: 'text-blue-500 bg-blue-50', score: 2 },
  { value: 'minimal', label: { en: 'Minimal', ar: 'ضئيل' }, color: 'text-green-500 bg-green-50', score: 1 }
];

// Readiness Levels
const READINESS_LEVELS = [
  { value: 'ready', label: { en: 'Ready', ar: 'جاهز' }, color: 'text-green-500', icon: CheckCircle },
  { value: 'preparing', label: { en: 'Preparing', ar: 'قيد الإعداد' }, color: 'text-blue-500', icon: Clock },
  { value: 'at_risk', label: { en: 'At Risk', ar: 'معرض للخطر' }, color: 'text-orange-500', icon: AlertTriangle },
  { value: 'not_ready', label: { en: 'Not Ready', ar: 'غير جاهز' }, color: 'text-red-500', icon: X }
];

// Training Types
const TRAINING_TYPES = [
  { value: 'workshop', label: { en: 'Workshop', ar: 'ورشة عمل' }, icon: Users, duration: { en: '1-3 days', ar: '1-3 أيام' } },
  { value: 'elearning', label: { en: 'E-Learning', ar: 'تعلم إلكتروني' }, icon: BookOpen, duration: { en: 'Self-paced', ar: 'ذاتي' } },
  { value: 'coaching', label: { en: 'Coaching', ar: 'تدريب فردي' }, icon: UserCheck, duration: { en: 'Ongoing', ar: 'مستمر' } },
  { value: 'certification', label: { en: 'Certification', ar: 'شهادة معتمدة' }, icon: Award, duration: { en: 'Varies', ar: 'متفاوت' } },
  { value: 'onthejob', label: { en: 'On-the-Job', ar: 'أثناء العمل' }, icon: Settings, duration: { en: 'Continuous', ar: 'مستمر' } },
  { value: 'mentoring', label: { en: 'Mentoring', ar: 'إرشاد' }, icon: MessageSquare, duration: { en: '3-6 months', ar: '3-6 أشهر' } }
];

// Training Categories
const TRAINING_CATEGORIES = [
  { value: 'technical', label: { en: 'Technical Skills', ar: 'مهارات تقنية' }, color: 'bg-blue-100 text-blue-700' },
  { value: 'leadership', label: { en: 'Leadership', ar: 'قيادة' }, color: 'bg-purple-100 text-purple-700' },
  { value: 'process', label: { en: 'Process & Systems', ar: 'العمليات والأنظمة' }, color: 'bg-green-100 text-green-700' },
  { value: 'soft', label: { en: 'Soft Skills', ar: 'مهارات ناعمة' }, color: 'bg-pink-100 text-pink-700' },
  { value: 'compliance', label: { en: 'Compliance', ar: 'الامتثال' }, color: 'bg-orange-100 text-orange-700' },
  { value: 'culture', label: { en: 'Culture & Values', ar: 'الثقافة والقيم' }, color: 'bg-teal-100 text-teal-700' }
];

// Resistance Types
const RESISTANCE_TYPES = [
  { value: 'fear_unknown', label: { en: 'Fear of Unknown', ar: 'الخوف من المجهول' }, icon: AlertTriangle },
  { value: 'loss_control', label: { en: 'Loss of Control', ar: 'فقدان السيطرة' }, icon: Shield },
  { value: 'skill_gaps', label: { en: 'Skill Gaps', ar: 'فجوات المهارات' }, icon: BookOpen },
  { value: 'past_failures', label: { en: 'Past Failures', ar: 'إخفاقات سابقة' }, icon: Clock },
  { value: 'poor_communication', label: { en: 'Poor Communication', ar: 'ضعف التواصل' }, icon: MessageSquare },
  { value: 'lack_trust', label: { en: 'Lack of Trust', ar: 'انعدام الثقة' }, icon: Heart }
];

// Helper: Calculate field completeness
const getFieldCompleteness = (obj, fields) => {
  if (!obj) return 0;
  const filled = fields.filter(f => {
    const val = obj[f];
    return val && (typeof val === 'string' ? val.trim() : true);
  }).length;
  return Math.round((filled / fields.length) * 100);
};

// Helper: Get completeness color
const getCompletenessColor = (pct) => {
  if (pct >= 80) return 'text-green-500';
  if (pct >= 50) return 'text-yellow-500';
  return 'text-red-500';
};

const getProgressColor = (pct) => {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Helper functions for completeness tracking
const getFieldCompleteness = (obj, fields) => {
  if (!obj) return 0;
  const filled = fields.filter(f => obj[f]?.toString().trim()).length;
  return Math.round((filled / fields.length) * 100);
};

// ADKAR Phase Card Component
function PhaseCard({ phase, activities, onAddActivity, onRemoveActivity, onUpdateActivity, language, t, isReadOnly }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const PhaseIcon = phase.icon;
  const phaseActivities = activities.filter(a => a.phase === phase.value);

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer hover:bg-muted/50 transition-colors py-3 ${phase.color} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PhaseIcon className="w-5 h-5" />
                <div>
                  <CardTitle className="text-base">{phase.label[language]}</CardTitle>
                  <CardDescription className="text-white/80 text-xs">{phase.description[language]}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {phaseActivities.length}
                </Badge>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-3">
            {phaseActivities.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                <PhaseIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t({ en: `No ${phase.label.en.toLowerCase()} activities yet`, ar: `لا توجد أنشطة ${phase.label.ar} بعد` })}</p>
              </div>
            ) : (
              phaseActivities.map((activity) => {
                const completeness = getFieldCompleteness(activity, ['name_en', 'owner', 'timeline']);
                return (
                  <div key={activity.id} className={`border rounded-lg p-3 space-y-2 bg-muted/30 ${completeness === 100 ? 'border-green-300' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${getCompletenessColor(completeness)}`}>{completeness}%</span>
                        <Progress value={completeness} className="w-16 h-1" />
                      </div>
                      {!isReadOnly && (
                        <Button size="icon" variant="ghost" onClick={() => onRemoveActivity(activity.id)} className="h-6 w-6">
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={activity.name_en || ''}
                        onChange={(e) => onUpdateActivity(activity.id, 'name_en', e.target.value)}
                        placeholder={t({ en: 'Activity name (EN)', ar: 'اسم النشاط (إنجليزي)' })}
                        className={`text-sm ${activity.name_en?.trim() ? 'border-green-300' : ''}`}
                        disabled={isReadOnly}
                      />
                      <Input
                        dir="rtl"
                        value={activity.name_ar || ''}
                        onChange={(e) => onUpdateActivity(activity.id, 'name_ar', e.target.value)}
                        placeholder="اسم النشاط (عربي)"
                        className={`text-sm ${activity.name_ar?.trim() ? 'border-green-300' : ''}`}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        value={activity.owner || ''}
                        onChange={(e) => onUpdateActivity(activity.id, 'owner', e.target.value)}
                        placeholder={t({ en: 'Owner', ar: 'المسؤول' })}
                        className={`text-sm ${activity.owner?.trim() ? 'border-green-300' : ''}`}
                        disabled={isReadOnly}
                      />
                      <Input
                        value={activity.timeline || ''}
                        onChange={(e) => onUpdateActivity(activity.id, 'timeline', e.target.value)}
                        placeholder={t({ en: 'Timeline', ar: 'الجدول الزمني' })}
                        className={`text-sm ${activity.timeline?.trim() ? 'border-green-300' : ''}`}
                        disabled={isReadOnly}
                      />
                      <Select 
                        value={activity.status || 'planned'} 
                        onValueChange={(v) => onUpdateActivity(activity.id, 'status', v)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">{t({ en: 'Planned', ar: 'مخطط' })}</SelectItem>
                          <SelectItem value="in_progress">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</SelectItem>
                          <SelectItem value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })
            )}
            {!isReadOnly && (
              <Button size="sm" variant="outline" onClick={() => onAddActivity(phase.value)} className="w-full">
                <Plus className="w-4 h-4 mr-1" />
                {t({ en: `Add ${phase.label.en} Activity`, ar: `إضافة نشاط ${phase.label.ar}` })}
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Stakeholder Impact Card Component
function StakeholderImpactCard({ impact, index, onUpdate, onRemove, language, t, isReadOnly }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const impactLevel = IMPACT_LEVELS.find(l => l.value === impact.impact_level);
  const readinessLevel = READINESS_LEVELS.find(l => l.value === impact.readiness);
  const ReadinessIcon = readinessLevel?.icon || Clock;
  
  const completeness = getFieldCompleteness(impact, ['group_en', 'impact_level', 'readiness', 'description_en', 'support_needs_en']);

  return (
    <Card className={`overflow-hidden ${completeness === 100 ? 'border-green-300' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Users className="w-5 h-5 text-primary" />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getProgressColor(completeness)}`} />
                </div>
                <div>
                  <CardTitle className="text-sm">
                    {language === 'ar' ? (impact.group_ar || impact.group_en) : (impact.group_en || impact.group_ar) || t({ en: 'Stakeholder Group', ar: 'مجموعة أصحاب المصلحة' })}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {impactLevel && (
                      <Badge className={`text-xs ${impactLevel.color}`}>{impactLevel.label[language]}</Badge>
                    )}
                    {readinessLevel && (
                      <Badge variant="outline" className={`text-xs ${readinessLevel.color}`}>
                        <ReadinessIcon className="w-3 h-3 mr-1" />
                        {readinessLevel.label[language]}
                      </Badge>
                    )}
                    <span className={`text-xs ${getCompletenessColor(completeness)}`}>{completeness}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4 border-t">
            {/* Group Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Stakeholder Group (EN)', ar: 'مجموعة أصحاب المصلحة (إنجليزي)' })}</Label>
                <Input
                  value={impact.group_en || ''}
                  onChange={(e) => onUpdate('group_en', e.target.value)}
                  placeholder="e.g., Municipal Staff"
                  className={impact.group_en?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Stakeholder Group (AR)', ar: 'مجموعة أصحاب المصلحة (عربي)' })}</Label>
                <Input
                  dir="rtl"
                  value={impact.group_ar || ''}
                  onChange={(e) => onUpdate('group_ar', e.target.value)}
                  placeholder="مثال: موظفو البلدية"
                  className={impact.group_ar?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Impact Level & Readiness */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Impact Level', ar: 'مستوى التأثير' })}</Label>
                <Select value={impact.impact_level || 'moderate'} onValueChange={(v) => onUpdate('impact_level', v)} disabled={isReadOnly}>
                  <SelectTrigger className={impact.impact_level ? 'border-green-300' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACT_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label[language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Readiness Status', ar: 'حالة الجاهزية' })}</Label>
                <Select value={impact.readiness || 'preparing'} onValueChange={(v) => onUpdate('readiness', v)} disabled={isReadOnly}>
                  <SelectTrigger className={impact.readiness ? 'border-green-300' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {READINESS_LEVELS.map(level => {
                      const Icon = level.icon;
                      return (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${level.color}`} />
                            {level.label[language]}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Impact Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Impact Description (EN)', ar: 'وصف التأثير (إنجليزي)' })}</Label>
                <Textarea
                  value={impact.description_en || ''}
                  onChange={(e) => onUpdate('description_en', e.target.value)}
                  placeholder="How will this group be impacted?"
                  rows={2}
                  className={impact.description_en?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Impact Description (AR)', ar: 'وصف التأثير (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  value={impact.description_ar || ''}
                  onChange={(e) => onUpdate('description_ar', e.target.value)}
                  placeholder="كيف ستتأثر هذه المجموعة؟"
                  rows={2}
                  className={impact.description_ar?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Support Needs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Support Needs (EN)', ar: 'احتياجات الدعم (إنجليزي)' })}</Label>
                <Textarea
                  value={impact.support_needs_en || ''}
                  onChange={(e) => onUpdate('support_needs_en', e.target.value)}
                  placeholder="What support do they need?"
                  rows={2}
                  className={impact.support_needs_en?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Support Needs (AR)', ar: 'احتياجات الدعم (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  value={impact.support_needs_ar || ''}
                  onChange={(e) => onUpdate('support_needs_ar', e.target.value)}
                  placeholder="ما الدعم الذي يحتاجونه؟"
                  rows={2}
                  className={impact.support_needs_ar?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Training Card Component
function TrainingCard({ training, onUpdate, onRemove, strategicPlanId, language, t, isReadOnly }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const trainingType = TRAINING_TYPES.find(tt => tt.value === training.type);
  const trainingCategory = TRAINING_CATEGORIES.find(tc => tc.value === training.category);
  const TypeIcon = trainingType?.icon || BookOpen;
  
  const completeness = getFieldCompleteness(training, ['name_en', 'type', 'category', 'target_audience_en', 'duration_en']);

  return (
    <Card className={`overflow-hidden ${completeness === 100 ? 'border-green-300' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 relative">
                  <TypeIcon className="w-4 h-4 text-blue-600" />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getProgressColor(completeness)}`} />
                </div>
                <div>
                  <CardTitle className="text-sm">
                    {(language === 'ar' ? (training.name_ar || training.name_en || training.name) : (training.name_en || training.name)) || t({ en: 'Training Program', ar: 'برنامج تدريبي' })}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {trainingType && (
                      <Badge variant="outline" className="text-xs">{trainingType.label[language]}</Badge>
                    )}
                    {trainingCategory && (
                      <Badge className={`text-xs ${trainingCategory.color}`}>{trainingCategory.label[language]}</Badge>
                    )}
                    <span className={`text-xs ${getCompletenessColor(completeness)}`}>{completeness}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4 border-t">
            {/* Training Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Training Name (EN)', ar: 'اسم التدريب (إنجليزي)' })}</Label>
                <Input
                  value={training.name_en || training.name || ''}
                  onChange={(e) => onUpdate('name_en', e.target.value)}
                  placeholder="e.g., Digital Transformation Workshop"
                  className={training.name_en?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Training Name (AR)', ar: 'اسم التدريب (عربي)' })}</Label>
                <Input
                  dir="rtl"
                  value={training.name_ar || ''}
                  onChange={(e) => onUpdate('name_ar', e.target.value)}
                  placeholder="مثال: ورشة التحول الرقمي"
                  className={training.name_ar?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Type, Category, Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Training Type', ar: 'نوع التدريب' })}</Label>
                <Select value={training.type || 'workshop'} onValueChange={(v) => onUpdate('type', v)} disabled={isReadOnly}>
                  <SelectTrigger className={training.type ? 'border-green-300' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING_TYPES.map(tt => {
                      const Icon = tt.icon;
                      return (
                        <SelectItem key={tt.value} value={tt.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {tt.label[language]}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Category', ar: 'الفئة' })}</Label>
                <Select value={training.category || 'technical'} onValueChange={(v) => onUpdate('category', v)} disabled={isReadOnly}>
                  <SelectTrigger className={training.category ? 'border-green-300' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING_CATEGORIES.map(tc => (
                      <SelectItem key={tc.value} value={tc.value}>{tc.label[language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                <Select value={training.priority || 'medium'} onValueChange={(v) => onUpdate('priority', v)} disabled={isReadOnly}>
                  <SelectTrigger className={training.priority ? 'border-green-300' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">{t({ en: 'Critical', ar: 'حرج' })}</SelectItem>
                    <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                    <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                    <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Target Audience (EN)', ar: 'الفئة المستهدفة (إنجليزي)' })}</Label>
                <Input
                  value={training.target_audience_en || training.target_audience || ''}
                  onChange={(e) => onUpdate('target_audience_en', e.target.value)}
                  placeholder="e.g., IT Staff, Managers"
                  className={training.target_audience_en?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Target Audience (AR)', ar: 'الفئة المستهدفة (عربي)' })}</Label>
                <Input
                  dir="rtl"
                  value={training.target_audience_ar || ''}
                  onChange={(e) => onUpdate('target_audience_ar', e.target.value)}
                  placeholder="مثال: موظفو تقنية المعلومات، المدراء"
                  className={training.target_audience_ar?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Duration & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Duration', ar: 'المدة' })}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={training.duration_en || training.duration || ''}
                    onChange={(e) => onUpdate('duration_en', e.target.value)}
                    placeholder="e.g., 2 days"
                    className={training.duration_en?.trim() ? 'border-green-300' : ''}
                    disabled={isReadOnly}
                  />
                  <Input
                    dir="rtl"
                    value={training.duration_ar || ''}
                    onChange={(e) => onUpdate('duration_ar', e.target.value)}
                    placeholder="مثال: يومان"
                    className={training.duration_ar?.trim() ? 'border-green-300' : ''}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={training.timeline_en || training.timeline || ''}
                    onChange={(e) => onUpdate('timeline_en', e.target.value)}
                    placeholder="e.g., Q2 2026"
                    className={training.timeline_en?.trim() ? 'border-green-300' : ''}
                    disabled={isReadOnly}
                  />
                  <Input
                    dir="rtl"
                    value={training.timeline_ar || ''}
                    onChange={(e) => onUpdate('timeline_ar', e.target.value)}
                    placeholder="مثال: الربع الثاني 2026"
                    className={training.timeline_ar?.trim() ? 'border-green-300' : ''}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Entity Allocation */}
            {!isReadOnly && (
              <div className="pt-2 border-t">
                <Label className="text-xs flex items-center gap-1 mb-2">
                  <Target className="h-3 w-3" />
                  {t({ en: 'Link to Entities', ar: 'ربط بالكيانات' })}
                </Label>
                <EntityAllocationSelector
                  strategicPlanId={strategicPlanId}
                  value={training.entity_training || []}
                  onChange={(allocations) => onUpdate('entity_training', allocations)}
                  multiple={true}
                  placeholder={t({ en: 'Select entities this training supports...', ar: 'اختر الكيانات التي يدعمها هذا التدريب...' })}
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Resistance Strategy Card
function ResistanceStrategyCard({ strategy, index, onUpdate, onRemove, language, t, isReadOnly }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const resistanceType = RESISTANCE_TYPES.find(rt => rt.value === strategy.type);
  const TypeIcon = resistanceType?.icon || AlertTriangle;
  
  const completeness = getFieldCompleteness(strategy, ['type', 'mitigation_en', 'owner']);

  return (
    <Card className={`overflow-hidden ${completeness === 100 ? 'border-green-300' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 relative">
                  <TypeIcon className="w-4 h-4 text-orange-600" />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getProgressColor(completeness)}`} />
                </div>
                <div>
                  <CardTitle className="text-sm">
                    {resistanceType?.label[language] || t({ en: 'Resistance Type', ar: 'نوع المقاومة' })}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <CardDescription className="text-xs">
                      {language === 'ar' ? (strategy.mitigation_ar || strategy.mitigation_en)?.substring(0, 40) : (strategy.mitigation_en || strategy.mitigation_ar)?.substring(0, 40)}...
                    </CardDescription>
                    <span className={`text-xs ${getCompletenessColor(completeness)}`}>{completeness}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4 border-t">
            {/* Resistance Type */}
            <div>
              <Label className="text-xs">{t({ en: 'Resistance Type', ar: 'نوع المقاومة' })}</Label>
              <Select value={strategy.type || 'fear_unknown'} onValueChange={(v) => onUpdate('type', v)} disabled={isReadOnly}>
                <SelectTrigger className={strategy.type ? 'border-green-300' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESISTANCE_TYPES.map(rt => {
                    const Icon = rt.icon;
                    return (
                      <SelectItem key={rt.value} value={rt.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {rt.label[language]}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Mitigation Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Mitigation Strategy (EN)', ar: 'استراتيجية التخفيف (إنجليزي)' })}</Label>
                <Textarea
                  value={strategy.mitigation_en || ''}
                  onChange={(e) => onUpdate('mitigation_en', e.target.value)}
                  placeholder="How will you address this resistance?"
                  rows={3}
                  className={strategy.mitigation_en?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Mitigation Strategy (AR)', ar: 'استراتيجية التخفيف (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  value={strategy.mitigation_ar || ''}
                  onChange={(e) => onUpdate('mitigation_ar', e.target.value)}
                  placeholder="كيف ستعالج هذه المقاومة؟"
                  rows={3}
                  className={strategy.mitigation_ar?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Owner & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Owner', ar: 'المسؤول' })}</Label>
                <Input
                  value={strategy.owner || ''}
                  onChange={(e) => onUpdate('owner', e.target.value)}
                  placeholder={t({ en: 'Who will implement this?', ar: 'من سينفذ هذا؟' })}
                  className={strategy.owner?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</Label>
                <Input
                  value={strategy.timeline || ''}
                  onChange={(e) => onUpdate('timeline', e.target.value)}
                  placeholder={t({ en: 'When will this be implemented?', ar: 'متى سيتم تنفيذ هذا؟' })}
                  className={strategy.timeline?.trim() ? 'border-green-300' : ''}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Summary Tab Component
function SummaryTab({ changeManagement, language, t }) {
  const trainingPlan = changeManagement?.training_plan || [];
  const stakeholderImpacts = changeManagement?.stakeholder_impacts || [];
  const changeActivities = changeManagement?.change_activities || [];
  const resistanceStrategies = changeManagement?.resistance_strategies || [];

  // Calculate training by category
  const trainingByCategory = useMemo(() => {
    const counts = {};
    TRAINING_CATEGORIES.forEach(cat => counts[cat.value] = 0);
    trainingPlan.forEach(t => {
      if (t.category && counts[t.category] !== undefined) counts[t.category]++;
    });
    return counts;
  }, [trainingPlan]);

  // Calculate impacts by level
  const impactsByLevel = useMemo(() => {
    const counts = {};
    IMPACT_LEVELS.forEach(lvl => counts[lvl.value] = 0);
    stakeholderImpacts.forEach(i => {
      if (i.impact_level && counts[i.impact_level] !== undefined) counts[i.impact_level]++;
    });
    return counts;
  }, [stakeholderImpacts]);

  // Calculate ADKAR coverage
  const adkarCoverage = useMemo(() => {
    const coverage = {};
    CHANGE_PHASES.forEach(phase => {
      coverage[phase.value] = changeActivities.filter(a => a.phase === phase.value).length;
    });
    return coverage;
  }, [changeActivities]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (!changeManagement?.readiness_assessment_en?.trim()) {
      recs.push({ type: 'error', message: { en: 'Complete the readiness assessment', ar: 'أكمل تقييم الجاهزية' } });
    }
    if (!changeManagement?.change_approach_en?.trim()) {
      recs.push({ type: 'error', message: { en: 'Define the change approach', ar: 'حدد نهج التغيير' } });
    }
    if (trainingPlan.length === 0) {
      recs.push({ type: 'warning', message: { en: 'Add at least one training program', ar: 'أضف برنامج تدريب واحد على الأقل' } });
    }
    if (stakeholderImpacts.length === 0) {
      recs.push({ type: 'warning', message: { en: 'Analyze stakeholder impacts', ar: 'حلل تأثيرات أصحاب المصلحة' } });
    }
    
    const uncoveredPhases = CHANGE_PHASES.filter(p => adkarCoverage[p.value] === 0);
    if (uncoveredPhases.length > 0) {
      recs.push({ 
        type: 'info', 
        message: { 
          en: `Missing ADKAR activities: ${uncoveredPhases.map(p => p.label.en).join(', ')}`, 
          ar: `أنشطة ADKAR المفقودة: ${uncoveredPhases.map(p => p.label.ar).join('، ')}` 
        } 
      });
    }
    
    if (resistanceStrategies.length === 0) {
      recs.push({ type: 'info', message: { en: 'Consider adding resistance management strategies', ar: 'فكر في إضافة استراتيجيات إدارة المقاومة' } });
    }
    
    const highImpactGroups = stakeholderImpacts.filter(i => ['transformational', 'significant'].includes(i.impact_level));
    if (highImpactGroups.length > 0 && trainingPlan.length < highImpactGroups.length) {
      recs.push({ type: 'warning', message: { en: 'High-impact groups may need more training programs', ar: 'قد تحتاج المجموعات عالية التأثير إلى المزيد من برامج التدريب' } });
    }
    
    return recs;
  }, [changeManagement, trainingPlan, stakeholderImpacts, adkarCoverage, resistanceStrategies]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ADKAR Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-500" />
              {t({ en: 'ADKAR Coverage', ar: 'تغطية ADKAR' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CHANGE_PHASES.map(phase => {
                const PhaseIcon = phase.icon;
                const count = adkarCoverage[phase.value];
                return (
                  <div key={phase.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PhaseIcon className={`w-3 h-3 ${count > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span className="text-xs">{phase.label[language]}</span>
                    </div>
                    <Badge variant={count > 0 ? 'default' : 'outline'} className="text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Training by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              {t({ en: 'Training Categories', ar: 'فئات التدريب' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TRAINING_CATEGORIES.filter(cat => trainingByCategory[cat.value] > 0).map(cat => (
                <div key={cat.value} className="flex items-center justify-between">
                  <span className="text-xs">{cat.label[language]}</span>
                  <Badge className={`text-xs ${cat.color}`}>{trainingByCategory[cat.value]}</Badge>
                </div>
              ))}
              {Object.values(trainingByCategory).every(v => v === 0) && (
                <p className="text-xs text-muted-foreground text-center py-2">{t({ en: 'No training defined', ar: 'لم يتم تحديد تدريب' })}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Impact Levels Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              {t({ en: 'Impact Distribution', ar: 'توزيع التأثير' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {IMPACT_LEVELS.filter(lvl => impactsByLevel[lvl.value] > 0).map(lvl => (
                <div key={lvl.value} className="flex items-center justify-between">
                  <span className="text-xs">{lvl.label[language]}</span>
                  <Badge className={`text-xs ${lvl.color}`}>{impactsByLevel[lvl.value]}</Badge>
                </div>
              ))}
              {Object.values(impactsByLevel).every(v => v === 0) && (
                <p className="text-xs text-muted-foreground text-center py-2">{t({ en: 'No impacts defined', ar: 'لم يتم تحديد تأثيرات' })}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resistance Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              {t({ en: 'Resistance Addressed', ar: 'المقاومة المعالجة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resistanceStrategies.length > 0 ? (
                resistanceStrategies.map((rs, idx) => {
                  const type = RESISTANCE_TYPES.find(rt => rt.value === rs.type);
                  const TypeIcon = type?.icon || AlertTriangle;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <TypeIcon className="w-3 h-3 text-orange-500" />
                      <span className="text-xs truncate">{type?.label[language] || rs.type}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">{t({ en: 'No strategies defined', ar: 'لم يتم تحديد استراتيجيات' })}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              {t({ en: 'Recommendations', ar: 'التوصيات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <Alert key={idx} variant={rec.type === 'error' ? 'destructive' : 'default'} className="py-2">
                  {rec.type === 'error' ? <AlertCircle className="h-4 w-4" /> : rec.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                  <AlertDescription className="text-xs">{rec.message[language]}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Main Step 17 Component
export default function Step17Change({ data, onChange, onGenerateAI, isGenerating, strategicPlanId, isReadOnly = false }) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('cards');

  const changeManagement = data.change_management || {};
  const trainingPlan = changeManagement.training_plan || [];
  const stakeholderImpacts = changeManagement.stakeholder_impacts || [];
  const changeActivities = changeManagement.change_activities || [];
  const resistanceStrategies = changeManagement.resistance_strategies || [];

  const updateChangeManagement = (updates) => {
    if (isReadOnly) return;
    onChange({
      change_management: {
        ...changeManagement,
        ...updates
      }
    });
  };

  // Training handlers
  const addTraining = () => {
    const newTraining = {
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      type: 'workshop',
      category: 'technical',
      target_audience_en: '',
      target_audience_ar: '',
      duration_en: '',
      duration_ar: '',
      timeline_en: '',
      timeline_ar: '',
      priority: 'medium',
      entity_training: []
    };
    updateChangeManagement({ training_plan: [...trainingPlan, newTraining] });
  };

  const updateTraining = (id, field, value) => {
    const updated = trainingPlan.map(t => t.id === id ? { ...t, [field]: value } : t);
    updateChangeManagement({ training_plan: updated });
  };

  const removeTraining = (id) => {
    updateChangeManagement({ training_plan: trainingPlan.filter(t => t.id !== id) });
  };

  // Stakeholder Impact handlers
  const addStakeholderImpact = () => {
    const newImpact = {
      id: Date.now().toString(),
      group_en: '',
      group_ar: '',
      impact_level: 'moderate',
      readiness: 'preparing',
      description_en: '',
      description_ar: '',
      support_needs_en: '',
      support_needs_ar: ''
    };
    updateChangeManagement({ stakeholder_impacts: [...stakeholderImpacts, newImpact] });
  };

  const updateStakeholderImpact = (index, field, value) => {
    const updated = stakeholderImpacts.map((si, i) => i === index ? { ...si, [field]: value } : si);
    updateChangeManagement({ stakeholder_impacts: updated });
  };

  const removeStakeholderImpact = (index) => {
    updateChangeManagement({ stakeholder_impacts: stakeholderImpacts.filter((_, i) => i !== index) });
  };

  // Change Activity handlers
  const addChangeActivity = (phase) => {
    const newActivity = {
      id: Date.now().toString(),
      phase,
      name_en: '',
      name_ar: '',
      owner: '',
      timeline: '',
      status: 'planned'
    };
    updateChangeManagement({ change_activities: [...changeActivities, newActivity] });
  };

  const updateChangeActivity = (id, field, value) => {
    const updated = changeActivities.map(a => a.id === id ? { ...a, [field]: value } : a);
    updateChangeManagement({ change_activities: updated });
  };

  const removeChangeActivity = (id) => {
    updateChangeManagement({ change_activities: changeActivities.filter(a => a.id !== id) });
  };

  // Resistance Strategy handlers
  const addResistanceStrategy = () => {
    const newStrategy = {
      id: Date.now().toString(),
      type: 'fear_unknown',
      mitigation_en: '',
      mitigation_ar: '',
      owner: '',
      timeline: ''
    };
    updateChangeManagement({ resistance_strategies: [...resistanceStrategies, newStrategy] });
  };

  const updateResistanceStrategy = (index, field, value) => {
    const updated = resistanceStrategies.map((rs, i) => i === index ? { ...rs, [field]: value } : rs);
    updateChangeManagement({ resistance_strategies: updated });
  };

  const removeResistanceStrategy = (index) => {
    updateChangeManagement({ resistance_strategies: resistanceStrategies.filter((_, i) => i !== index) });
  };

  // Check for issues
  const hasIssues = useMemo(() => {
    const issues = [];
    if (!changeManagement?.readiness_assessment_en?.trim()) {
      issues.push({ en: 'No readiness assessment defined', ar: 'لم يتم تحديد تقييم الجاهزية' });
    }
    if (!changeManagement?.change_approach_en?.trim()) {
      issues.push({ en: 'No change approach defined', ar: 'لم يتم تحديد نهج التغيير' });
    }
    const uncoveredPhases = CHANGE_PHASES.filter(p => !changeActivities.some(a => a.phase === p.value));
    if (uncoveredPhases.length >= 3) {
      issues.push({ en: `${uncoveredPhases.length} ADKAR phases have no activities`, ar: `${uncoveredPhases.length} مراحل ADKAR ليس لها أنشطة` });
    }
    return issues;
  }, [changeManagement, changeActivities]);

  // Calculate stats for dashboard
  const adkarCoveredCount = CHANGE_PHASES.filter(p => changeActivities.some(a => a.phase === p.value)).length;
  const completenessScore = useMemo(() => {
    let score = 0;
    if (changeManagement?.readiness_assessment_en?.trim()) score += 20;
    if (changeManagement?.change_approach_en?.trim()) score += 20;
    if (trainingPlan.length >= 3) score += 20;
    else if (trainingPlan.length >= 1) score += 10;
    if (stakeholderImpacts.length >= 3) score += 15;
    else if (stakeholderImpacts.length >= 1) score += 8;
    if (changeActivities.length >= 5) score += 15;
    else if (changeActivities.length >= 2) score += 8;
    if (resistanceStrategies.length >= 2) score += 10;
    else if (resistanceStrategies.length >= 1) score += 5;
    return score;
  }, [changeManagement, trainingPlan.length, stakeholderImpacts.length, changeActivities.length, resistanceStrategies.length]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <StepDashboardHeader
        score={completenessScore}
        title={t({ en: 'Change Management', ar: 'إدارة التغيير' })}
        subtitle={t({ en: 'Plan your change strategy using the ADKAR model', ar: 'خطط لاستراتيجية التغيير باستخدام نموذج ADKAR' })}
        language={language}
        stats={[
          { icon: GraduationCap, value: trainingPlan.length, label: t({ en: 'Training', ar: 'التدريب' }) },
          { icon: Users, value: stakeholderImpacts.length, label: t({ en: 'Impacts', ar: 'التأثيرات' }) },
          { icon: RefreshCw, value: changeActivities.length, label: t({ en: 'Activities', ar: 'الأنشطة' }) },
          { icon: Shield, value: resistanceStrategies.length, label: t({ en: 'Strategies', ar: 'استراتيجيات' }) },
          { icon: Layers, value: `${adkarCoveredCount}/5`, label: t({ en: 'ADKAR', ar: 'ADKAR' }) },
        ]}
      />

      {/* View Mode & AI Button */}
      <div className="flex justify-between items-center">
        <div className="flex border rounded-lg overflow-hidden">
          <Button variant={viewMode === 'cards' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('cards')} className="rounded-none">
            <List className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'phases' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('phases')} className="rounded-none">
            <GitBranch className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'summary' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('summary')} className="rounded-none">
            <PieChart className="w-4 h-4" />
          </Button>
        </div>
        {!isReadOnly && (
          <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
          </Button>
        )}
      </div>
      {hasIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t({ en: 'Issues Found', ar: 'تم العثور على مشاكل' })}</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside text-sm">
              {hasIssues.map((issue, idx) => (
                <li key={idx}>{issue[language]}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* View Mode: Summary */}
      {viewMode === 'summary' ? (
        <SummaryTab changeManagement={changeManagement} language={language} t={t} />
      ) : viewMode === 'phases' ? (
        /* View Mode: Phases */
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            {t({ en: 'ADKAR Change Phases', ar: 'مراحل التغيير ADKAR' })}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {CHANGE_PHASES.map(phase => (
              <PhaseCard
                key={phase.value}
                phase={phase}
                activities={changeActivities}
                onAddActivity={addChangeActivity}
                onRemoveActivity={removeChangeActivity}
                onUpdateActivity={updateChangeActivity}
                language={language}
                t={t}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        </div>
      ) : (
        /* View Mode: Cards (Tabbed) */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview" className="gap-1 text-xs">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Overview', ar: 'نظرة' })}</span>
            </TabsTrigger>
            <TabsTrigger value="impacts" className="gap-1 text-xs">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Impacts', ar: 'التأثيرات' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{stakeholderImpacts.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="resistance" className="gap-1 text-xs">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Resist.', ar: 'المقاومة' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{resistanceStrategies.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-1 text-xs">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Training', ar: 'التدريب' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{trainingPlan.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-1 text-xs">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Activities', ar: 'الأنشطة' })}</span>
              <Badge variant="secondary" className="ml-1 text-xs">{changeActivities.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-1 text-xs">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Readiness Assessment */}
            <Card className={changeManagement.readiness_assessment_en?.trim() ? 'border-green-300' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  {t({ en: 'Readiness Assessment', ar: 'تقييم الجاهزية' })}
                  {changeManagement.readiness_assessment_en?.trim() && <CheckCircle className="w-4 h-4 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t({ en: 'Assessment (EN)', ar: 'التقييم (إنجليزي)' })}</Label>
                    <Textarea
                      value={changeManagement.readiness_assessment_en || ''}
                      onChange={(e) => updateChangeManagement({ readiness_assessment_en: e.target.value })}
                      placeholder="Assess organizational readiness for change..."
                      rows={4}
                      className={changeManagement.readiness_assessment_en?.trim() ? 'border-green-300' : ''}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t({ en: 'Assessment (AR)', ar: 'التقييم (عربي)' })}</Label>
                    <Textarea
                      dir="rtl"
                      value={changeManagement.readiness_assessment_ar || ''}
                      onChange={(e) => updateChangeManagement({ readiness_assessment_ar: e.target.value })}
                      placeholder="تقييم جاهزية المنظمة للتغيير..."
                      rows={4}
                      className={changeManagement.readiness_assessment_ar?.trim() ? 'border-green-300' : ''}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Approach */}
            <Card className={changeManagement.change_approach_en?.trim() ? 'border-green-300' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  {t({ en: 'Change Approach', ar: 'نهج التغيير' })}
                  {changeManagement.change_approach_en?.trim() && <CheckCircle className="w-4 h-4 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t({ en: 'Approach (EN)', ar: 'النهج (إنجليزي)' })}</Label>
                    <Textarea
                      value={changeManagement.change_approach_en || ''}
                      onChange={(e) => updateChangeManagement({ change_approach_en: e.target.value })}
                      placeholder="Describe the change management approach..."
                      rows={4}
                      className={changeManagement.change_approach_en?.trim() ? 'border-green-300' : ''}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t({ en: 'Approach (AR)', ar: 'النهج (عربي)' })}</Label>
                    <Textarea
                      dir="rtl"
                      value={changeManagement.change_approach_ar || ''}
                      onChange={(e) => updateChangeManagement({ change_approach_ar: e.target.value })}
                      placeholder="وصف نهج إدارة التغيير..."
                      rows={4}
                      className={changeManagement.change_approach_ar?.trim() ? 'border-green-300' : ''}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Resistance Management */}
            <Card className={changeManagement.resistance_management_en?.trim() ? 'border-green-300' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  {t({ en: 'General Resistance Strategy', ar: 'استراتيجية المقاومة العامة' })}
                  {changeManagement.resistance_management_en?.trim() && <CheckCircle className="w-4 h-4 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t({ en: 'Strategy (EN)', ar: 'الاستراتيجية (إنجليزي)' })}</Label>
                    <Textarea
                      value={changeManagement.resistance_management_en || ''}
                      onChange={(e) => updateChangeManagement({ resistance_management_en: e.target.value })}
                      placeholder="How will you address resistance to change?"
                      rows={3}
                      className={changeManagement.resistance_management_en?.trim() ? 'border-green-300' : ''}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t({ en: 'Strategy (AR)', ar: 'الاستراتيجية (عربي)' })}</Label>
                    <Textarea
                      dir="rtl"
                      value={changeManagement.resistance_management_ar || ''}
                      onChange={(e) => updateChangeManagement({ resistance_management_ar: e.target.value })}
                      placeholder="كيف ستتعامل مع مقاومة التغيير؟"
                      rows={3}
                      className={changeManagement.resistance_management_ar?.trim() ? 'border-green-300' : ''}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stakeholder Impacts Tab */}
          <TabsContent value="impacts" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{t({ en: 'Stakeholder Impact Analysis', ar: 'تحليل تأثير أصحاب المصلحة' })}</h3>
              {!isReadOnly && (
                <Button size="sm" variant="outline" onClick={addStakeholderImpact}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t({ en: 'Add Impact Analysis', ar: 'إضافة تحليل تأثير' })}
                </Button>
              )}
            </div>

            {stakeholderImpacts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No stakeholder impacts defined. Click "Add Impact Analysis" to start.', ar: 'لم يتم تحديد تأثيرات أصحاب المصلحة. انقر على "إضافة تحليل تأثير" للبدء.' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stakeholderImpacts.map((impact, idx) => (
                  <StakeholderImpactCard
                    key={impact.id || idx}
                    impact={impact}
                    index={idx}
                    onUpdate={(field, value) => updateStakeholderImpact(idx, field, value)}
                    onRemove={() => removeStakeholderImpact(idx)}
                    language={language}
                    t={t}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Resistance Tab */}
          <TabsContent value="resistance" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{t({ en: 'Resistance Management Strategies', ar: 'استراتيجيات إدارة المقاومة' })}</h3>
              {!isReadOnly && (
                <Button size="sm" variant="outline" onClick={addResistanceStrategy}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t({ en: 'Add Strategy', ar: 'إضافة استراتيجية' })}
                </Button>
              )}
            </div>

            {resistanceStrategies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No resistance strategies defined. Click "Add Strategy" to start.', ar: 'لم يتم تحديد استراتيجيات المقاومة. انقر على "إضافة استراتيجية" للبدء.' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resistanceStrategies.map((strategy, idx) => (
                  <ResistanceStrategyCard
                    key={strategy.id || idx}
                    strategy={strategy}
                    index={idx}
                    onUpdate={(field, value) => updateResistanceStrategy(idx, field, value)}
                    onRemove={() => removeResistanceStrategy(idx)}
                    language={language}
                    t={t}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{t({ en: 'Training Programs', ar: 'برامج التدريب' })}</h3>
              {!isReadOnly && (
                <Button size="sm" variant="outline" onClick={addTraining}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t({ en: 'Add Training', ar: 'إضافة تدريب' })}
                </Button>
              )}
            </div>

            {trainingPlan.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No training programs defined. Click "Add Training" to start.', ar: 'لم يتم تحديد برامج تدريب. انقر على "إضافة تدريب" للبدء.' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trainingPlan.map((training) => (
                  <TrainingCard
                    key={training.id}
                    training={training}
                    onUpdate={(field, value) => updateTraining(training.id, field, value)}
                    onRemove={() => removeTraining(training.id)}
                    strategicPlanId={strategicPlanId}
                    language={language}
                    t={t}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4 mt-4">
            <h3 className="font-medium flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {t({ en: 'ADKAR Change Activities', ar: 'أنشطة التغيير ADKAR' })}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {CHANGE_PHASES.map(phase => (
                <PhaseCard
                  key={phase.value}
                  phase={phase}
                  activities={changeActivities}
                  onAddActivity={addChangeActivity}
                  onRemoveActivity={removeChangeActivity}
                  onUpdateActivity={updateChangeActivity}
                  language={language}
                  t={t}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t({ en: 'Change Management Summary', ar: 'ملخص إدارة التغيير' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
                    <GraduationCap className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{trainingPlan.length}</p>
                    <p className="text-xs">{t({ en: 'Training', ar: 'التدريب' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-center">
                    <Users className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{stakeholderImpacts.length}</p>
                    <p className="text-xs">{t({ en: 'Impacts', ar: 'التأثيرات' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
                    <Shield className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{resistanceStrategies.length}</p>
                    <p className="text-xs">{t({ en: 'Resistance', ar: 'المقاومة' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
                    <RefreshCw className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{changeActivities.length}</p>
                    <p className="text-xs">{t({ en: 'Activities', ar: 'الأنشطة' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-center">
                    <Layers className="h-5 w-5 text-teal-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{Object.values(CHANGE_PHASES.reduce((acc, p) => { acc[p.value] = changeActivities.filter(a => a.phase === p.value).length; return acc; }, {})).filter(c => c > 0).length}/5</p>
                    <p className="text-xs">{t({ en: 'ADKAR Phases', ar: 'مراحل ADKAR' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
