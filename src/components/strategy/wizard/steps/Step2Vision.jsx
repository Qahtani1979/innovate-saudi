import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Heart, Plus, X, Columns, ChevronDown, ChevronRight, 
  Loader2, Target, Lightbulb, Shield, Users, Zap, Globe, 
  CheckCircle2, Star, TrendingUp, Award, Gem
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

// Icon options for pillars
const PILLAR_ICONS = [
  { value: 'Target', icon: Target, label: 'Target' },
  { value: 'Lightbulb', icon: Lightbulb, label: 'Innovation' },
  { value: 'Shield', icon: Shield, label: 'Security' },
  { value: 'Users', icon: Users, label: 'People' },
  { value: 'Zap', icon: Zap, label: 'Performance' },
  { value: 'Globe', icon: Globe, label: 'Global' },
  { value: 'TrendingUp', icon: TrendingUp, label: 'Growth' },
  { value: 'Award', icon: Award, label: 'Excellence' },
  { value: 'Gem', icon: Gem, label: 'Quality' },
  { value: 'Star', icon: Star, label: 'Leadership' },
];

const getIconComponent = (iconName) => {
  const found = PILLAR_ICONS.find(i => i.value === iconName);
  return found ? found.icon : Target;
};

export default function Step2Vision({ data, onChange, onGenerateAI, isGenerating, isReadOnly }) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('values');
  const [expandedSections, setExpandedSections] = useState({
    values: true,
    pillars: true
  });

  // Calculate completeness metrics
  const completenessMetrics = useMemo(() => {
    const values = data.core_values || [];
    const pillars = data.strategic_pillars || [];

    const valuesComplete = values.filter(v => v.name_en && v.description_en).length;
    const pillarsComplete = pillars.filter(p => p.name_en && p.description_en).length;

    const valuesScore = values.length > 0 
      ? Math.round((valuesComplete / values.length) * 100)
      : 0;
    
    const pillarsScore = pillars.length > 0 
      ? Math.round((pillarsComplete / pillars.length) * 100)
      : 0;

    // Overall considers having at least 3 values and 3 pillars
    const hasMinValues = values.length >= 3;
    const hasMinPillars = pillars.length >= 3;
    const overallScore = Math.round(
      (hasMinValues ? 25 : (values.length / 3) * 25) +
      (valuesScore * 0.25) +
      (hasMinPillars ? 25 : (pillars.length / 3) * 25) +
      (pillarsScore * 0.25)
    );

    return {
      values: { total: values.length, complete: valuesComplete, score: valuesScore },
      pillars: { total: pillars.length, complete: pillarsComplete, score: pillarsScore },
      overallScore
    };
  }, [data.core_values, data.strategic_pillars]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addValue = () => {
    if (isReadOnly) return;
    const newValue = { 
      id: Date.now().toString(),
      name_en: '', 
      name_ar: '',
      description_en: '',
      description_ar: ''
    };
    onChange({ core_values: [...(data.core_values || []), newValue] });
  };

  const updateValue = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...(data.core_values || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ core_values: updated });
  };

  const removeValue = (index) => {
    if (isReadOnly) return;
    onChange({ core_values: data.core_values.filter((_, i) => i !== index) });
  };

  const addPillar = () => {
    if (isReadOnly) return;
    const newPillar = { 
      id: Date.now().toString(),
      name_en: '', 
      name_ar: '',
      description_en: '',
      description_ar: '',
      icon: 'Target',
      color: 'primary'
    };
    onChange({ strategic_pillars: [...(data.strategic_pillars || []), newPillar] });
  };

  const updatePillar = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...(data.strategic_pillars || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ strategic_pillars: updated });
  };

  const removePillar = (index) => {
    if (isReadOnly) return;
    onChange({ strategic_pillars: data.strategic_pillars.filter((_, i) => i !== index) });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const SectionHeader = ({ icon: Icon, title, description, section, count, complete }) => (
    <CollapsibleTrigger asChild>
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={count > 0 ? 'default' : 'outline'}>
            {complete}/{count} {t({ en: 'complete', ar: 'مكتمل' })}
          </Badge>
          {expandedSections[section] ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
    </CollapsibleTrigger>
  );

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
                    strokeDasharray={`${completenessMetrics.overallScore * 2.51} 251`}
                    className={getScoreColor(completenessMetrics.overallScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreColor(completenessMetrics.overallScore)}`}>
                    {completenessMetrics.overallScore}%
                  </span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground mt-2">
                {t({ en: 'Vision Completeness', ar: 'اكتمال الرؤية' })}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">{t({ en: 'Core Values', ar: 'القيم الجوهرية' })}</span>
                </div>
                <p className="text-lg font-semibold">{completenessMetrics.values.total}</p>
                <p className="text-xs text-muted-foreground">
                  {completenessMetrics.values.complete} {t({ en: 'complete', ar: 'مكتمل' })}
                </p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Columns className="h-4 w-4" />
                  <span className="text-xs">{t({ en: 'Pillars', ar: 'الركائز' })}</span>
                </div>
                <p className="text-lg font-semibold">{completenessMetrics.pillars.total}</p>
                <p className="text-xs text-muted-foreground">
                  {completenessMetrics.pillars.complete} {t({ en: 'complete', ar: 'مكتمل' })}
                </p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs">{t({ en: 'Values Score', ar: 'نتيجة القيم' })}</span>
                </div>
                <p className={`text-lg font-semibold ${getScoreColor(completenessMetrics.values.score)}`}>
                  {completenessMetrics.values.score}%
                </p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs">{t({ en: 'Pillars Score', ar: 'نتيجة الركائز' })}</span>
                </div>
                <p className={`text-lg font-semibold ${getScoreColor(completenessMetrics.pillars.score)}`}>
                  {completenessMetrics.pillars.score}%
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
                  {t({ en: 'AI-Powered Generation', ar: 'الإنشاء بالذكاء الاصطناعي' })}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Generate core values and strategic pillars based on your plan context', ar: 'إنشاء القيم الجوهرية والركائز الاستراتيجية بناءً على سياق خطتك' })}
                </p>
              </div>
              <Button onClick={onGenerateAI} disabled={isGenerating || !data.name_en}>
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {t({ en: 'Generate', ar: 'إنشاء' })}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="values" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {t({ en: 'Core Values', ar: 'القيم الجوهرية' })}
            <Badge variant="secondary" className="ml-1">{completenessMetrics.values.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pillars" className="flex items-center gap-2">
            <Columns className="h-4 w-4" />
            {t({ en: 'Strategic Pillars', ar: 'الركائز الاستراتيجية' })}
            <Badge variant="secondary" className="ml-1">{completenessMetrics.pillars.total}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Core Values Tab */}
        <TabsContent value="values" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Core Values', ar: 'القيم الجوهرية' })}</CardTitle>
                    <CardDescription>
                      {t({ en: 'Define the guiding principles that shape the organization\'s culture', ar: 'تحديد المبادئ التوجيهية التي تشكل ثقافة المنظمة' })}
                    </CardDescription>
                  </div>
                </div>
                {!isReadOnly && (
                  <Button variant="outline" size="sm" onClick={addValue}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add Value', ar: 'إضافة قيمة' })}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data.core_values || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">{t({ en: 'No core values defined yet', ar: 'لم يتم تحديد قيم جوهرية بعد' })}</p>
                  <p className="text-sm">{t({ en: 'Add values to define your organization\'s principles', ar: 'أضف قيمًا لتحديد مبادئ منظمتك' })}</p>
                  {!isReadOnly && (
                    <Button variant="outline" className="mt-4" onClick={addValue}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t({ en: 'Add First Value', ar: 'إضافة أول قيمة' })}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {data.core_values.map((value, index) => {
                    const isComplete = value.name_en && value.description_en;
                    return (
                      <div 
                        key={value.id || index} 
                        className={`p-4 border rounded-lg space-y-3 transition-all ${isComplete ? 'border-green-500/30 bg-green-50/5' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={isComplete ? 'default' : 'secondary'}>
                              {isComplete && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              #{index + 1}
                            </Badge>
                            {value.name_en && (
                              <span className="font-medium text-sm">
                                {language === 'ar' ? (value.name_ar || value.name_en) : value.name_en}
                              </span>
                            )}
                          </div>
                          {!isReadOnly && (
                            <Button variant="ghost" size="icon" onClick={() => removeValue(index)} className="h-8 w-8 text-destructive hover:text-destructive">
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}</Label>
                            <Input
                              placeholder={t({ en: 'e.g., Integrity, Innovation', ar: 'مثال: النزاهة، الابتكار' })}
                              value={value.name_en || ''}
                              onChange={(e) => updateValue(index, 'name_en', e.target.value)}
                              disabled={isReadOnly}
                              className={value.name_en ? 'border-green-500/50' : ''}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                            <Input
                              placeholder={t({ en: 'Value name in Arabic', ar: 'اسم القيمة بالعربية' })}
                              value={value.name_ar || ''}
                              onChange={(e) => updateValue(index, 'name_ar', e.target.value)}
                              dir="rtl"
                              disabled={isReadOnly}
                              className={value.name_ar ? 'border-green-500/50' : ''}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                            <Textarea
                              placeholder={t({ en: 'What does this value mean for your organization?', ar: 'ماذا تعني هذه القيمة لمنظمتك؟' })}
                              value={value.description_en || ''}
                              onChange={(e) => updateValue(index, 'description_en', e.target.value)}
                              rows={2}
                              disabled={isReadOnly}
                              className={value.description_en ? 'border-green-500/50' : ''}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                            <Textarea
                              placeholder={t({ en: 'Description in Arabic', ar: 'الوصف بالعربية' })}
                              value={value.description_ar || ''}
                              onChange={(e) => updateValue(index, 'description_ar', e.target.value)}
                              rows={2}
                              dir="rtl"
                              disabled={isReadOnly}
                              className={value.description_ar ? 'border-green-500/50' : ''}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Suggestions */}
              {!isReadOnly && (data.core_values || []).length < 5 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t({ en: 'Suggested values:', ar: 'القيم المقترحة:' })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Integrity', 'Innovation', 'Excellence', 'Collaboration', 'Transparency', 'Accountability'].map(suggestion => (
                      <Badge 
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          const existing = (data.core_values || []).some(v => v.name_en === suggestion);
                          if (!existing) {
                            const newValue = { 
                              id: Date.now().toString(),
                              name_en: suggestion, 
                              name_ar: '',
                              description_en: '',
                              description_ar: ''
                            };
                            onChange({ core_values: [...(data.core_values || []), newValue] });
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Pillars Tab */}
        <TabsContent value="pillars" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Columns className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Strategic Pillars', ar: 'الركائز الاستراتيجية' })}</CardTitle>
                    <CardDescription>
                      {t({ en: 'Main thematic areas that organize your strategic objectives', ar: 'المجالات الموضوعية الرئيسية التي تنظم أهدافك الاستراتيجية' })}
                    </CardDescription>
                  </div>
                </div>
                {!isReadOnly && (
                  <Button variant="outline" size="sm" onClick={addPillar}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add Pillar', ar: 'إضافة ركيزة' })}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data.strategic_pillars || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Columns className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">{t({ en: 'No strategic pillars defined yet', ar: 'لم يتم تحديد ركائز استراتيجية بعد' })}</p>
                  <p className="text-sm">{t({ en: 'Pillars help organize objectives into thematic areas', ar: 'تساعد الركائز في تنظيم الأهداف في مجالات موضوعية' })}</p>
                  {!isReadOnly && (
                    <Button variant="outline" className="mt-4" onClick={addPillar}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t({ en: 'Add First Pillar', ar: 'إضافة أول ركيزة' })}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {data.strategic_pillars.map((pillar, index) => {
                    const isComplete = pillar.name_en && pillar.description_en;
                    const IconComponent = getIconComponent(pillar.icon);
                    return (
                      <div 
                        key={pillar.id || index} 
                        className={`p-4 border rounded-lg space-y-3 transition-all ${isComplete ? 'border-green-500/30 bg-green-50/5' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <Badge variant={isComplete ? 'default' : 'secondary'}>
                              {isComplete && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {t({ en: 'Pillar', ar: 'ركيزة' })} #{index + 1}
                            </Badge>
                          </div>
                          {!isReadOnly && (
                            <Button variant="ghost" size="icon" onClick={() => removePillar(index)} className="h-8 w-8 text-destructive hover:text-destructive">
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Icon Selector */}
                        {!isReadOnly && (
                          <div className="space-y-1">
                            <Label className="text-xs">{t({ en: 'Icon', ar: 'الأيقونة' })}</Label>
                            <Select 
                              value={pillar.icon || 'Target'} 
                              onValueChange={(v) => updatePillar(index, 'icon', v)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PILLAR_ICONS.map(({ value, icon: Icon, label }) => (
                                  <SelectItem key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <span>{label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-1">
                          <Label className="text-xs">{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}</Label>
                          <Input
                            placeholder={t({ en: 'e.g., Digital Transformation', ar: 'مثال: التحول الرقمي' })}
                            value={pillar.name_en || ''}
                            onChange={(e) => updatePillar(index, 'name_en', e.target.value)}
                            disabled={isReadOnly}
                            className={pillar.name_en ? 'border-green-500/50' : ''}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                          <Input
                            placeholder={t({ en: 'Pillar name in Arabic', ar: 'اسم الركيزة بالعربية' })}
                            value={pillar.name_ar || ''}
                            onChange={(e) => updatePillar(index, 'name_ar', e.target.value)}
                            dir="rtl"
                            disabled={isReadOnly}
                            className={pillar.name_ar ? 'border-green-500/50' : ''}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                          <Textarea
                            placeholder={t({ en: 'What does this pillar encompass?', ar: 'ماذا تشمل هذه الركيزة؟' })}
                            value={pillar.description_en || ''}
                            onChange={(e) => updatePillar(index, 'description_en', e.target.value)}
                            rows={2}
                            disabled={isReadOnly}
                            className={pillar.description_en ? 'border-green-500/50' : ''}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                          <Textarea
                            placeholder={t({ en: 'Description in Arabic', ar: 'الوصف بالعربية' })}
                            value={pillar.description_ar || ''}
                            onChange={(e) => updatePillar(index, 'description_ar', e.target.value)}
                            rows={2}
                            dir="rtl"
                            disabled={isReadOnly}
                            className={pillar.description_ar ? 'border-green-500/50' : ''}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Suggestions */}
              {!isReadOnly && (data.strategic_pillars || []).length < 5 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t({ en: 'Suggested pillars:', ar: 'الركائز المقترحة:' })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Digital Transformation', icon: 'Zap' },
                      { name: 'Service Excellence', icon: 'Award' },
                      { name: 'Organizational Development', icon: 'Users' },
                      { name: 'Sustainability', icon: 'Globe' },
                      { name: 'Innovation & Technology', icon: 'Lightbulb' }
                    ].map(suggestion => (
                      <Badge 
                        key={suggestion.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          const existing = (data.strategic_pillars || []).some(p => p.name_en === suggestion.name);
                          if (!existing) {
                            const newPillar = { 
                              id: Date.now().toString(),
                              name_en: suggestion.name, 
                              name_ar: '',
                              description_en: '',
                              description_ar: '',
                              icon: suggestion.icon
                            };
                            onChange({ strategic_pillars: [...(data.strategic_pillars || []), newPillar] });
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {suggestion.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pillars Visual Preview */}
          {(data.strategic_pillars || []).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t({ en: 'Pillars Overview', ar: 'نظرة عامة على الركائز' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.strategic_pillars.map((pillar, index) => {
                    const IconComponent = getIconComponent(pillar.icon);
                    return (
                      <div 
                        key={pillar.id || index}
                        className="p-4 border rounded-lg text-center hover:border-primary/50 transition-colors"
                      >
                        <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-2">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <p className="font-medium text-sm truncate">
                          {language === 'ar' ? (pillar.name_ar || pillar.name_en || `Pillar ${index + 1}`) : (pillar.name_en || `Pillar ${index + 1}`)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
