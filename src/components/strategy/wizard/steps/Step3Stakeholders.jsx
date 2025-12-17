import React, { useState, useMemo, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Sparkles, Users, Plus, X, Grid3X3, ChevronDown, ChevronRight,
  Loader2, Building, User, Briefcase, Globe, CheckCircle2, AlertCircle,
  UserCheck, UserX, MessageSquare, FileText, TrendingUp, BarChart3
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { useStakeholderAnalysis } from '@/hooks/strategy/useStakeholderAnalysis';
import { cn } from '@/lib/utils';

export default function Step3Stakeholders({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly,
  strategicPlanId = null
}) {
  const { language, t, isRTL } = useLanguage();
  const { stakeholderTypes } = useTaxonomy();
  const [activeTab, setActiveTab] = useState('list');
  const [expandedSections, setExpandedSections] = useState({
    engagement: true
  });
  
  // DB persistence hook
  const {
    stakeholders: dbStakeholders,
    loading: dbLoading,
    saving: dbSaving,
    saveStakeholder,
    deleteStakeholder
  } = useStakeholderAnalysis(strategicPlanId);
  
  // Sync DB data on load
  useEffect(() => {
    if (strategicPlanId && dbStakeholders?.length > 0 && !dbLoading && !data.stakeholders?.length) {
      onChange({ stakeholders: dbStakeholders });
    }
  }, [strategicPlanId, dbStakeholders, dbLoading]);

  // Calculate completeness metrics
  const completenessMetrics = useMemo(() => {
    const stakeholders = data.stakeholders || [];
    const complete = stakeholders.filter(s => 
      s.name_en && s.type && s.power && s.interest && s.engagement_level
    ).length;
    
    const byQuadrant = {
      manageClosely: stakeholders.filter(s => s.power === 'high' && s.interest === 'high').length,
      keepSatisfied: stakeholders.filter(s => s.power === 'high' && s.interest !== 'high').length,
      keepInformed: stakeholders.filter(s => s.power !== 'high' && s.interest === 'high').length,
      monitor: stakeholders.filter(s => s.power !== 'high' && s.interest !== 'high').length
    };

    const byType = stakeholderTypes.reduce((acc, type) => {
      acc[type.code] = stakeholders.filter(s => s.type === type.code).length;
      return acc;
    }, {});

    const hasEngagementPlan = !!(data.stakeholder_engagement_plan_en || data.stakeholder_engagement_plan_ar);
    
    const score = stakeholders.length > 0 
      ? Math.round((complete / stakeholders.length) * 80 + (hasEngagementPlan ? 20 : 0))
      : 0;

    return {
      total: stakeholders.length,
      complete,
      byQuadrant,
      byType,
      hasEngagementPlan,
      score
    };
  }, [data.stakeholders, data.stakeholder_engagement_plan_en, data.stakeholder_engagement_plan_ar, stakeholderTypes]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addStakeholder = () => {
    if (isReadOnly) return;
    const newStakeholder = { 
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      type: 'GOVERNMENT',
      power: 'medium',
      interest: 'medium',
      influence_strategy_en: '',
      influence_strategy_ar: '',
      contact_person_en: '',
      contact_person_ar: '',
      engagement_level: 'inform',
      notes_en: '',
      notes_ar: ''
    };
    onChange({ stakeholders: [...(data.stakeholders || []), newStakeholder] });
  };

  const updateStakeholder = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...(data.stakeholders || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ stakeholders: updated });
  };

  const removeStakeholder = (index) => {
    if (isReadOnly) return;
    onChange({ stakeholders: data.stakeholders.filter((_, i) => i !== index) });
  };

  const getQuadrant = (power, interest) => {
    if (power === 'high' && interest === 'high') return { name: 'Manage Closely', nameAr: 'إدارة عن كثب', color: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200' };
    if (power === 'high' && interest !== 'high') return { name: 'Keep Satisfied', nameAr: 'إبقاء الرضا', color: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200' };
    if (power !== 'high' && interest === 'high') return { name: 'Keep Informed', nameAr: 'إبقاء على اطلاع', color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200' };
    return { name: 'Monitor', nameAr: 'مراقبة', color: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-200' };
  };

  const engagementLevels = [
    { value: 'inform', label: { en: 'Inform', ar: 'إبلاغ' }, icon: MessageSquare },
    { value: 'consult', label: { en: 'Consult', ar: 'استشارة' }, icon: User },
    { value: 'involve', label: { en: 'Involve', ar: 'إشراك' }, icon: Users },
    { value: 'collaborate', label: { en: 'Collaborate', ar: 'تعاون' }, icon: UserCheck },
    { value: 'empower', label: { en: 'Empower', ar: 'تمكين' }, icon: TrendingUp }
  ];

  const powerInterestOptions = [
    { value: 'low', label: { en: 'Low', ar: 'منخفض' } },
    { value: 'medium', label: { en: 'Medium', ar: 'متوسط' } },
    { value: 'high', label: { en: 'High', ar: 'مرتفع' } }
  ];

  const getDisplayName = (stakeholder) => {
    if (stakeholder.name_en || stakeholder.name_ar) {
      return language === 'ar' ? (stakeholder.name_ar || stakeholder.name_en) : (stakeholder.name_en || stakeholder.name_ar);
    }
    return stakeholder.name || '?';
  };

  const groupedStakeholders = {
    'Manage Closely': data.stakeholders?.filter(s => s.power === 'high' && s.interest === 'high') || [],
    'Keep Satisfied': data.stakeholders?.filter(s => s.power === 'high' && s.interest !== 'high') || [],
    'Keep Informed': data.stakeholders?.filter(s => s.power !== 'high' && s.interest === 'high') || [],
    'Monitor': data.stakeholders?.filter(s => s.power !== 'high' && s.interest !== 'high') || []
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'GOVERNMENT': return Building;
      case 'PRIVATE': return Briefcase;
      case 'CITIZEN': return User;
      case 'INTERNATIONAL': return Globe;
      default: return Users;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Score */}
            <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-xl">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
                  <circle 
                    cx="48" cy="48" r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${completenessMetrics.score * 2.51} 251`}
                    className={getScoreColor(completenessMetrics.score)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreColor(completenessMetrics.score)}`}>
                    {completenessMetrics.score}%
                  </span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground mt-2">
                {t({ en: 'Analysis Score', ar: 'نتيجة التحليل' })}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">{t({ en: 'Total', ar: 'الإجمالي' })}</span>
                </div>
                <p className="text-lg font-semibold">{completenessMetrics.total}</p>
                <p className="text-xs text-muted-foreground">
                  {completenessMetrics.complete} {t({ en: 'complete', ar: 'مكتمل' })}
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs">{t({ en: 'Manage Closely', ar: 'إدارة عن كثب' })}</span>
                </div>
                <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                  {completenessMetrics.byQuadrant.manageClosely}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-xs">{t({ en: 'Keep Satisfied', ar: 'إبقاء الرضا' })}</span>
                </div>
                <p className="text-lg font-semibold text-amber-700 dark:text-amber-300">
                  {completenessMetrics.byQuadrant.keepSatisfied}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">{t({ en: 'Keep Informed', ar: 'إبقاء على اطلاع' })}</span>
                </div>
                <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {completenessMetrics.byQuadrant.keepInformed}
                </p>
              </div>
            </div>
          </div>

          {/* AI Generation */}
          {!isReadOnly && (
            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {t({ en: 'AI Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة بالذكاء الاصطناعي' })}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Auto-identify stakeholders based on your plan context', ar: 'تحديد أصحاب المصلحة تلقائيًا بناءً على سياق خطتك' })}
                </p>
              </div>
              <Button onClick={onGenerateAI} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {t({ en: 'Suggest Stakeholders', ar: 'اقتراح أصحاب المصلحة' })}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'List', ar: 'القائمة' })}</span>
            <Badge variant="secondary" className="ml-1">{completenessMetrics.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Matrix', ar: 'المصفوفة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Plan', ar: 'الخطة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Stakeholders List Tab */}
        <TabsContent value="list" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Stakeholder Registry', ar: 'سجل أصحاب المصلحة' })}</CardTitle>
                    <CardDescription>
                      {t({ en: 'Define and analyze key stakeholders for your strategy', ar: 'تحديد وتحليل أصحاب المصلحة الرئيسيين لاستراتيجيتك' })}
                    </CardDescription>
                  </div>
                </div>
                {!isReadOnly && (
                  <Button variant="outline" size="sm" onClick={addStakeholder}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add Stakeholder', ar: 'إضافة صاحب مصلحة' })}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data.stakeholders || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">{t({ en: 'No stakeholders added yet', ar: 'لم يتم إضافة أصحاب مصلحة بعد' })}</p>
                  <p className="text-sm">{t({ en: 'Identify key stakeholders to engage with your strategy', ar: 'حدد أصحاب المصلحة الرئيسيين للتعامل مع استراتيجيتك' })}</p>
                  {!isReadOnly && (
                    <Button variant="outline" className="mt-4" onClick={addStakeholder}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t({ en: 'Add First Stakeholder', ar: 'إضافة أول صاحب مصلحة' })}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {data.stakeholders.map((stakeholder, index) => {
                    const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);
                    const isComplete = stakeholder.name_en && stakeholder.type && stakeholder.power && stakeholder.interest;
                    const TypeIcon = getTypeIcon(stakeholder.type);
                    
                    return (
                      <div 
                        key={stakeholder.id || index} 
                        className={cn(
                          "p-4 border rounded-lg space-y-4 transition-all",
                          quadrant.color,
                          isComplete && "ring-1 ring-green-500/30"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="p-1.5 rounded bg-background/50">
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <Badge variant="outline" className="bg-background/50">
                              {language === 'ar' ? quadrant.nameAr : quadrant.name}
                            </Badge>
                            <Badge variant="secondary">
                              {stakeholderTypes.find(t => t.code === stakeholder.type)?.[`name_${language}`] || stakeholder.type}
                            </Badge>
                            {isComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </div>
                          {!isReadOnly && (
                            <Button variant="ghost" size="icon" onClick={() => removeStakeholder(index)} className="h-8 w-8 text-destructive hover:text-destructive">
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })} *</Label>
                            <Input
                              value={stakeholder.name_en || stakeholder.name || ''}
                              onChange={(e) => updateStakeholder(index, 'name_en', e.target.value)}
                              placeholder={t({ en: 'e.g., Ministry of Finance', ar: 'مثال: وزارة المالية' })}
                              disabled={isReadOnly}
                              className={cn("bg-background/50", stakeholder.name_en && "border-green-500/50")}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                            <Input
                              value={stakeholder.name_ar || ''}
                              onChange={(e) => updateStakeholder(index, 'name_ar', e.target.value)}
                              placeholder={t({ en: 'Arabic name', ar: 'الاسم بالعربية' })}
                              dir="rtl"
                              disabled={isReadOnly}
                              className={cn("bg-background/50", stakeholder.name_ar && "border-green-500/50")}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                            <Select
                              value={stakeholder.type}
                              onValueChange={(v) => updateStakeholder(index, 'type', v)}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {stakeholderTypes.map(type => (
                                  <SelectItem key={type.code} value={type.code}>
                                    {type[`name_${language}`]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Power Level', ar: 'مستوى القوة' })}</Label>
                            <Select
                              value={stakeholder.power}
                              onValueChange={(v) => updateStakeholder(index, 'power', v)}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {powerInterestOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label[language]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Interest Level', ar: 'مستوى الاهتمام' })}</Label>
                            <Select
                              value={stakeholder.interest}
                              onValueChange={(v) => updateStakeholder(index, 'interest', v)}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {powerInterestOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label[language]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Engagement', ar: 'المشاركة' })}</Label>
                            <Select
                              value={stakeholder.engagement_level}
                              onValueChange={(v) => updateStakeholder(index, 'engagement_level', v)}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger className="bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {engagementLevels.map(level => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label[language]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Contact Person', ar: 'جهة الاتصال' })}</Label>
                            <Input
                              value={stakeholder.contact_person_en || stakeholder.contact_person || ''}
                              onChange={(e) => updateStakeholder(index, 'contact_person_en', e.target.value)}
                              placeholder={t({ en: 'Role/Title', ar: 'الدور/المنصب' })}
                              disabled={isReadOnly}
                              className="bg-background/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Influence Strategy', ar: 'استراتيجية التأثير' })}</Label>
                            <Input
                              value={stakeholder.influence_strategy_en || stakeholder.influence_strategy || ''}
                              onChange={(e) => updateStakeholder(index, 'influence_strategy_en', e.target.value)}
                              placeholder={t({ en: 'How to engage?', ar: 'كيفية التعامل؟' })}
                              disabled={isReadOnly}
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Grid3X3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t({ en: 'Power/Interest Matrix', ar: 'مصفوفة القوة/الاهتمام' })}</CardTitle>
                  <CardDescription>
                    {t({ en: 'Visual mapping of stakeholder positions', ar: 'خريطة بصرية لمواقع أصحاب المصلحة' })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(data.stakeholders || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Grid3X3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{t({ en: 'Add stakeholders to see the matrix', ar: 'أضف أصحاب المصلحة لرؤية المصفوفة' })}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Matrix Labels */}
                  <div className="flex justify-between text-sm text-muted-foreground px-2">
                    <span>{t({ en: 'Low Interest', ar: 'اهتمام منخفض' })}</span>
                    <span>{t({ en: 'High Interest', ar: 'اهتمام عالي' })}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* High Power Row */}
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 min-h-[140px]">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-amber-500">{t({ en: 'Keep Satisfied', ar: 'إبقاء الرضا' })}</Badge>
                        <span className="text-xs text-muted-foreground">
                          ({t({ en: 'High Power, Low Interest', ar: 'قوة عالية، اهتمام منخفض' })})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {groupedStakeholders['Keep Satisfied'].map(s => (
                          <Badge key={s.id} variant="secondary" className="text-xs">
                            {getDisplayName(s)}
                          </Badge>
                        ))}
                        {groupedStakeholders['Keep Satisfied'].length === 0 && (
                          <span className="text-muted-foreground text-xs italic">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 min-h-[140px]">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-red-500">{t({ en: 'Manage Closely', ar: 'إدارة عن كثب' })}</Badge>
                        <span className="text-xs text-muted-foreground">
                          ({t({ en: 'High Power, High Interest', ar: 'قوة عالية، اهتمام عالي' })})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {groupedStakeholders['Manage Closely'].map(s => (
                          <Badge key={s.id} variant="secondary" className="text-xs">
                            {getDisplayName(s)}
                          </Badge>
                        ))}
                        {groupedStakeholders['Manage Closely'].length === 0 && (
                          <span className="text-muted-foreground text-xs italic">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Low Power Row */}
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 min-h-[140px]">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{t({ en: 'Monitor', ar: 'مراقبة' })}</Badge>
                        <span className="text-xs text-muted-foreground">
                          ({t({ en: 'Low Power, Low Interest', ar: 'قوة منخفضة، اهتمام منخفض' })})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {groupedStakeholders['Monitor'].map(s => (
                          <Badge key={s.id} variant="outline" className="text-xs">
                            {getDisplayName(s)}
                          </Badge>
                        ))}
                        {groupedStakeholders['Monitor'].length === 0 && (
                          <span className="text-muted-foreground text-xs italic">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 min-h-[140px]">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-500">{t({ en: 'Keep Informed', ar: 'إبقاء على اطلاع' })}</Badge>
                        <span className="text-xs text-muted-foreground">
                          ({t({ en: 'Low Power, High Interest', ar: 'قوة منخفضة، اهتمام عالي' })})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {groupedStakeholders['Keep Informed'].map(s => (
                          <Badge key={s.id} variant="secondary" className="text-xs">
                            {getDisplayName(s)}
                          </Badge>
                        ))}
                        {groupedStakeholders['Keep Informed'].length === 0 && (
                          <span className="text-muted-foreground text-xs italic">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Axis Labels */}
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
                    <span>↑ {t({ en: 'Power', ar: 'القوة' })}</span>
                    <span>→ {t({ en: 'Interest', ar: 'الاهتمام' })}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Type Distribution */}
          {(data.stakeholders || []).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t({ en: 'Stakeholder Distribution by Type', ar: 'توزيع أصحاب المصلحة حسب النوع' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stakeholderTypes.map(type => {
                    const count = completenessMetrics.byType[type.code] || 0;
                    const TypeIcon = getTypeIcon(type.code);
                    return (
                      <div key={type.code} className="p-3 border rounded-lg text-center">
                        <TypeIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-lg font-semibold">{count}</p>
                        <p className="text-xs text-muted-foreground">{type[`name_${language}`]}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Engagement Plan Tab */}
        <TabsContent value="engagement" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Stakeholder Engagement Plan', ar: 'خطة إشراك أصحاب المصلحة' })}</CardTitle>
                    <CardDescription>
                      {t({ en: 'Overall approach to stakeholder engagement', ar: 'النهج العام لإشراك أصحاب المصلحة' })}
                    </CardDescription>
                  </div>
                </div>
                {completenessMetrics.hasEngagementPlan && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Engagement Plan (English)', ar: 'خطة الإشراك (إنجليزي)' })}</Label>
                  <Textarea
                    value={data.stakeholder_engagement_plan_en || data.stakeholder_engagement_plan || ''}
                    onChange={(e) => onChange({ stakeholder_engagement_plan_en: e.target.value })}
                    placeholder={t({ 
                      en: 'Describe the overall approach to stakeholder engagement throughout the strategy lifecycle...',
                      ar: 'وصف النهج العام لإشراك أصحاب المصلحة طوال دورة حياة الاستراتيجية...'
                    })}
                    rows={6}
                    disabled={isReadOnly}
                    className={(data.stakeholder_engagement_plan_en || data.stakeholder_engagement_plan) ? 'border-green-500/50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Engagement Plan (Arabic)', ar: 'خطة الإشراك (عربي)' })}</Label>
                  <Textarea
                    value={data.stakeholder_engagement_plan_ar || ''}
                    onChange={(e) => onChange({ stakeholder_engagement_plan_ar: e.target.value })}
                    placeholder={t({ 
                      en: 'Arabic engagement plan...',
                      ar: 'خطة الإشراك بالعربية...'
                    })}
                    rows={6}
                    dir="rtl"
                    disabled={isReadOnly}
                    className={data.stakeholder_engagement_plan_ar ? 'border-green-500/50' : ''}
                  />
                </div>
              </div>

              {/* Engagement Level Guide */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">{t({ en: 'Engagement Level Guide', ar: 'دليل مستويات المشاركة' })}</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {engagementLevels.map(level => {
                    const Icon = level.icon;
                    return (
                      <div key={level.value} className="p-2 border rounded text-center bg-background">
                        <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-xs font-medium">{level.label[language]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t({ en: 'Stakeholder Summary', ar: 'ملخص أصحاب المصلحة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quadrant Distribution */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 text-center">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{completenessMetrics.byQuadrant.manageClosely}</p>
                  <p className="text-xs font-medium">{t({ en: 'Manage Closely', ar: 'إدارة عن كثب' })}</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{completenessMetrics.byQuadrant.keepSatisfied}</p>
                  <p className="text-xs font-medium">{t({ en: 'Keep Satisfied', ar: 'إبقاء الرضا' })}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-300 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{completenessMetrics.byQuadrant.keepInformed}</p>
                  <p className="text-xs font-medium">{t({ en: 'Keep Informed', ar: 'إبقاء على اطلاع' })}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{completenessMetrics.byQuadrant.monitor}</p>
                  <p className="text-xs font-medium">{t({ en: 'Monitor', ar: 'مراقبة' })}</p>
                </div>
              </div>

              {/* Completion Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground">{t({ en: 'Total Stakeholders', ar: 'إجمالي أصحاب المصلحة' })}</p>
                  <p className="text-3xl font-bold">{completenessMetrics.total}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground">{t({ en: 'Fully Defined', ar: 'محددين بالكامل' })}</p>
                  <p className="text-3xl font-bold text-green-600">{completenessMetrics.complete}</p>
                </div>
              </div>

              {/* Recommendations */}
              {completenessMetrics.total === 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <Users className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{t({ en: 'Identify key stakeholders who will be impacted by or influence your strategy', ar: 'حدد أصحاب المصلحة الرئيسيين الذين سيتأثرون أو يؤثرون في استراتيجيتك' })}</p>
                </div>
              )}
              {completenessMetrics.byQuadrant.manageClosely === 0 && completenessMetrics.total > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{t({ en: 'Consider identifying high-power, high-interest stakeholders who need close management', ar: 'فكر في تحديد أصحاب المصلحة ذوي القوة والاهتمام العاليين الذين يحتاجون إلى إدارة وثيقة' })}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
