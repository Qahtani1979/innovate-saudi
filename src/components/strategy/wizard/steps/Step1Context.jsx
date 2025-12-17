import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Sparkles, Loader2, X, ChevronDown, ChevronRight, Target, Calendar, 
  DollarSign, MapPin, Users, Lightbulb, Flag, Building, Cpu, Eye,
  CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { 
  StepDashboardHeader, 
  DistributionChart, 
  QualityMetrics, 
  RecommendationsCard,
  MainAIGeneratorCard 
} from '../shared';
import { useTaxonomy } from '@/contexts/TaxonomyContext';

export default function Step1Context({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly 
}) {
  const { language, t, isRTL } = useLanguage();
  const { 
    sectors, 
    regions, 
    strategicThemes, 
    technologies, 
    visionPrograms 
  } = useTaxonomy();

  const [activeTab, setActiveTab] = useState('identity');
  const [expandedSections, setExpandedSections] = useState({
    identity: true,
    duration: true,
    scope: true,
    stakeholders: false,
    discovery: false
  });

  // Calculate completeness metrics
  const completenessMetrics = useMemo(() => {
    const checks = {
      identity: {
        name: !!(data.name_en || data.name_ar),
        vision: !!(data.vision_en || data.vision_ar),
        mission: !!(data.mission_en || data.mission_ar)
      },
      duration: {
        years: !!(data.start_year && data.end_year),
        budget: !!data.budget_range
      },
      scope: {
        sectors: (data.target_sectors?.length || 0) > 0,
        themes: (data.strategic_themes?.length || 0) > 0,
        technologies: (data.focus_technologies?.length || 0) > 0,
        vision2030: (data.vision_2030_programs?.length || 0) > 0
      },
      stakeholders: {
        listed: (data.quick_stakeholders?.length || 0) > 0
      },
      discovery: {
        challenges: !!(data.key_challenges_en || data.key_challenges_ar || data.key_challenges),
        resources: !!(data.available_resources_en || data.available_resources_ar || data.available_resources),
        constraints: !!(data.initial_constraints_en || data.initial_constraints_ar || data.initial_constraints)
      }
    };

    const sectionScores = {
      identity: Object.values(checks.identity).filter(Boolean).length / Object.keys(checks.identity).length * 100,
      duration: Object.values(checks.duration).filter(Boolean).length / Object.keys(checks.duration).length * 100,
      scope: Object.values(checks.scope).filter(Boolean).length / Object.keys(checks.scope).length * 100,
      stakeholders: Object.values(checks.stakeholders).filter(Boolean).length / Object.keys(checks.stakeholders).length * 100,
      discovery: Object.values(checks.discovery).filter(Boolean).length / Object.keys(checks.discovery).length * 100
    };

    const overallScore = Math.round(
      (sectionScores.identity * 0.3 + sectionScores.duration * 0.15 + 
       sectionScores.scope * 0.25 + sectionScores.stakeholders * 0.1 + 
       sectionScores.discovery * 0.2)
    );

    return { checks, sectionScores, overallScore };
  }, [data]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleItem = (field, code) => {
    if (isReadOnly) return;
    const current = data[field] || [];
    const updated = current.includes(code) 
      ? current.filter(c => c !== code)
      : [...current, code];
    onChange({ [field]: updated });
  };

  const addQuickStakeholder = (nameEn, nameAr = '') => {
    if (isReadOnly) return;
    if (nameEn.trim() || nameAr.trim()) {
      const newStakeholder = { name_en: nameEn.trim(), name_ar: nameAr.trim() };
      onChange({ quick_stakeholders: [...(data.quick_stakeholders || []), newStakeholder] });
    }
  };

  const removeQuickStakeholder = (index) => {
    if (isReadOnly) return;
    const updated = [...(data.quick_stakeholders || [])];
    updated.splice(index, 1);
    onChange({ quick_stakeholders: updated });
  };

  const getStakeholderName = (s, index) => {
    if (typeof s === 'object' && s !== null) {
      return language === 'ar' ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar);
    }
    return String(s);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const SectionHeader = ({ icon: Icon, title, description, section, score }) => (
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
          <div className="flex items-center gap-2">
            <Progress value={score} className="w-20 h-2" />
            <span className={`text-sm font-medium ${getScoreColor(score)}`}>{Math.round(score)}%</span>
          </div>
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
      {/* Dashboard Header - Using Shared Component */}
      <StepDashboardHeader
        score={completenessMetrics.overallScore}
        title={t({ en: 'Strategic Context', ar: 'السياق الاستراتيجي' })}
        subtitle={t({ en: 'Define plan identity, scope, and discovery inputs', ar: 'تحديد هوية الخطة والنطاق ومدخلات الاستكشاف' })}
        language={language}
        stats={[
          {
            icon: Calendar,
            value: data.start_year && data.end_year 
              ? `${data.end_year - data.start_year} ${t({ en: 'Yrs', ar: 'سنوات' })}`
              : '-',
            label: t({ en: 'Duration', ar: 'المدة' })
          },
          {
            icon: Building,
            value: data.target_sectors?.length || 0,
            label: t({ en: 'Sectors', ar: 'القطاعات' })
          },
          {
            icon: Users,
            value: data.quick_stakeholders?.length || 0,
            label: t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })
          },
          {
            icon: Cpu,
            value: data.focus_technologies?.length || 0,
            label: t({ en: 'Technologies', ar: 'التقنيات' })
          }
        ]}
      />

      {/* AI Generation Card */}
      {!isReadOnly && (
        <MainAIGeneratorCard
          title={{ en: 'AI-Powered Context Generation', ar: 'إنشاء السياق بالذكاء الاصطناعي' }}
          description={{ en: 'Fill in basic details and let AI suggest vision, mission, and themes', ar: 'أدخل التفاصيل الأساسية ودع الذكاء الاصطناعي يقترح الرؤية والرسالة والمحاور' }}
          onGenerate={onGenerateAI}
          isGenerating={isGenerating}
          disabled={!data.name_en}
        />
      )}

      {/* Tabs for Organization */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Identity', ar: 'الهوية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="scope" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Scope', ar: 'النطاق' })}</span>
          </TabsTrigger>
          <TabsTrigger value="discovery" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Discovery', ar: 'الاستكشاف' })}</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Identity Tab */}
        <TabsContent value="identity" className="space-y-4 mt-4">
          {/* Plan Identity Section */}
          <Card>
            <Collapsible open={expandedSections.identity} onOpenChange={() => toggleSection('identity')}>
              <SectionHeader 
                icon={Target} 
                title={t({ en: 'Plan Identity', ar: 'هوية الخطة' })}
                description={t({ en: 'Core information about the strategic plan', ar: 'المعلومات الأساسية عن الخطة الاستراتيجية' })}
                section="identity"
                score={completenessMetrics.sectionScores.identity}
              />
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {/* Plan Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        {t({ en: 'Plan Title (English)', ar: 'عنوان الخطة (إنجليزي)' })}
                        <Badge variant="destructive" className="text-xs">*</Badge>
                      </Label>
                      <Input
                        value={data.name_en || ''}
                        onChange={(e) => onChange({ name_en: e.target.value })}
                        placeholder={t({ en: 'e.g., MoMAH Digital Transformation Strategy 2025-2030', ar: 'مثال: استراتيجية التحول الرقمي لوزارة البلديات والإسكان' })}
                        dir="ltr"
                        disabled={isReadOnly}
                        className={data.name_en ? 'border-green-500/50' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        {t({ en: 'Plan Title (Arabic)', ar: 'عنوان الخطة (عربي)' })}
                        <Badge variant="destructive" className="text-xs">*</Badge>
                      </Label>
                      <Input
                        value={data.name_ar || ''}
                        onChange={(e) => onChange({ name_ar: e.target.value })}
                        placeholder={t({ en: 'Enter Arabic title', ar: 'أدخل العنوان بالعربية' })}
                        dir="rtl"
                        disabled={isReadOnly}
                        className={data.name_ar ? 'border-green-500/50' : ''}
                      />
                    </div>
                  </div>

                  {/* Vision */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {t({ en: 'Vision Statement (English)', ar: 'بيان الرؤية (إنجليزي)' })}
                      </Label>
                      <Textarea
                        value={data.vision_en || ''}
                        onChange={(e) => onChange({ vision_en: e.target.value })}
                        rows={3}
                        placeholder={t({ en: 'What future state do you aspire to achieve?', ar: 'ما هو المستقبل الذي تطمح لتحقيقه؟' })}
                        dir="ltr"
                        disabled={isReadOnly}
                        className={data.vision_en ? 'border-green-500/50' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {t({ en: 'Vision Statement (Arabic)', ar: 'بيان الرؤية (عربي)' })}
                      </Label>
                      <Textarea
                        value={data.vision_ar || ''}
                        onChange={(e) => onChange({ vision_ar: e.target.value })}
                        rows={3}
                        placeholder={t({ en: 'Enter Arabic vision', ar: 'أدخل الرؤية بالعربية' })}
                        dir="rtl"
                        disabled={isReadOnly}
                        className={data.vision_ar ? 'border-green-500/50' : ''}
                      />
                    </div>
                  </div>

                  {/* Mission */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        {t({ en: 'Mission Statement (English)', ar: 'بيان المهمة (إنجليزي)' })}
                      </Label>
                      <Textarea
                        value={data.mission_en || ''}
                        onChange={(e) => onChange({ mission_en: e.target.value })}
                        rows={2}
                        placeholder={t({ en: 'How will you achieve the vision?', ar: 'كيف ستحقق الرؤية؟' })}
                        dir="ltr"
                        disabled={isReadOnly}
                        className={data.mission_en ? 'border-green-500/50' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        {t({ en: 'Mission Statement (Arabic)', ar: 'بيان المهمة (عربي)' })}
                      </Label>
                      <Textarea
                        value={data.mission_ar || ''}
                        onChange={(e) => onChange({ mission_ar: e.target.value })}
                        rows={2}
                        dir="rtl"
                        disabled={isReadOnly}
                        className={data.mission_ar ? 'border-green-500/50' : ''}
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Duration & Resources Section */}
          <Card>
            <Collapsible open={expandedSections.duration} onOpenChange={() => toggleSection('duration')}>
              <SectionHeader 
                icon={Calendar} 
                title={t({ en: 'Duration & Resources', ar: 'المدة والموارد' })}
                description={t({ en: 'Timeline and budget allocation', ar: 'الجدول الزمني وتخصيص الميزانية' })}
                section="duration"
                score={completenessMetrics.sectionScores.duration}
              />
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Start Year', ar: 'سنة البداية' })}</Label>
                      <Select 
                        value={String(data.start_year || new Date().getFullYear())} 
                        onValueChange={(v) => onChange({ start_year: parseInt(v) })}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className={data.start_year ? 'border-green-500/50' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2025, 2026, 2027, 2028].map(y => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'End Year', ar: 'سنة النهاية' })}</Label>
                      <Select 
                        value={String(data.end_year || new Date().getFullYear() + 5)} 
                        onValueChange={(v) => onChange({ end_year: parseInt(v) })}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className={data.end_year ? 'border-green-500/50' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2027, 2028, 2029, 2030, 2031, 2035, 2040].map(y => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {t({ en: 'Budget Range', ar: 'نطاق الميزانية' })}
                      </Label>
                      <Select 
                        value={data.budget_range || ''} 
                        onValueChange={(v) => onChange({ budget_range: v })}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className={data.budget_range ? 'border-green-500/50' : ''}>
                          <SelectValue placeholder={t({ en: 'Select range', ar: 'اختر النطاق' })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<10M">{'< 10M SAR'}</SelectItem>
                          <SelectItem value="10-50M">10-50M SAR</SelectItem>
                          <SelectItem value="50-100M">50-100M SAR</SelectItem>
                          <SelectItem value="100-500M">100-500M SAR</SelectItem>
                          <SelectItem value=">500M">{'>500M SAR'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Duration', ar: 'المدة' })}</Label>
                      <div className="h-10 px-3 flex items-center border rounded-md bg-muted">
                        <span className="font-medium">
                          {(data.end_year || new Date().getFullYear() + 5) - (data.start_year || new Date().getFullYear())} {t({ en: 'years', ar: 'سنوات' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </TabsContent>

        {/* Scope Tab */}
        <TabsContent value="scope" className="space-y-4 mt-4">
          {/* Target Sectors */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Target Sectors', ar: 'القطاعات المستهدفة' })}</CardTitle>
                    <CardDescription>{t({ en: 'Select MoMAH sectors this plan will address', ar: 'اختر قطاعات الوزارة التي ستتناولها هذه الخطة' })}</CardDescription>
                  </div>
                </div>
                <Badge variant={data.target_sectors?.length > 0 ? 'default' : 'outline'}>
                  {data.target_sectors?.length || 0} {t({ en: 'selected', ar: 'مختار' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sectors.map(sector => (
                  <Badge 
                    key={sector.code}
                    variant={data.target_sectors?.includes(sector.code) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'hover:bg-primary/20'}`}
                    onClick={() => toggleItem('target_sectors', sector.code)}
                  >
                    {data.target_sectors?.includes(sector.code) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {language === 'ar' ? sector.name_ar : sector.name_en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategic Themes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Strategic Themes', ar: 'المحاور الاستراتيجية' })}</CardTitle>
                    <CardDescription>{t({ en: 'Key strategic focus areas', ar: 'مجالات التركيز الاستراتيجية الرئيسية' })}</CardDescription>
                  </div>
                </div>
                <Badge variant={data.strategic_themes?.length > 0 ? 'default' : 'outline'}>
                  {data.strategic_themes?.length || 0} {t({ en: 'selected', ar: 'مختار' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {strategicThemes.map(theme => (
                  <Badge 
                    key={theme.code}
                    variant={data.strategic_themes?.includes(theme.code) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'hover:bg-primary/20'}`}
                    onClick={() => toggleItem('strategic_themes', theme.code)}
                  >
                    {data.strategic_themes?.includes(theme.code) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {language === 'ar' ? theme.name_ar : theme.name_en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Focus Technologies */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Focus Technologies', ar: 'التقنيات المركزة' })}</CardTitle>
                    <CardDescription>{t({ en: 'Innovation and emerging tech priorities', ar: 'أولويات الابتكار والتقنيات الناشئة' })}</CardDescription>
                  </div>
                </div>
                <Badge variant={data.focus_technologies?.length > 0 ? 'default' : 'outline'}>
                  {data.focus_technologies?.length || 0} {t({ en: 'selected', ar: 'مختار' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technologies.map(tech => (
                  <Badge 
                    key={tech.code}
                    variant={data.focus_technologies?.includes(tech.code) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'hover:bg-primary/20'}`}
                    onClick={() => toggleItem('focus_technologies', tech.code)}
                  >
                    {data.focus_technologies?.includes(tech.code) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {language === 'ar' ? tech.name_ar : tech.name_en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vision 2030 Programs */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Flag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Vision 2030 Programs', ar: 'برامج رؤية 2030' })}</CardTitle>
                    <CardDescription>{t({ en: 'Alignment with national vision programs', ar: 'التوافق مع برامج الرؤية الوطنية' })}</CardDescription>
                  </div>
                </div>
                <Badge variant={data.vision_2030_programs?.length > 0 ? 'default' : 'outline'}>
                  {data.vision_2030_programs?.length || 0} {t({ en: 'selected', ar: 'مختار' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {visionPrograms.map(program => (
                  <Badge 
                    key={program.code}
                    variant={data.vision_2030_programs?.includes(program.code) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'hover:bg-primary/20'}`}
                    onClick={() => toggleItem('vision_2030_programs', program.code)}
                  >
                    {data.vision_2030_programs?.includes(program.code) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {language === 'ar' ? program.name_ar : program.name_en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Regions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t({ en: 'Target Regions', ar: 'المناطق المستهدفة' })}</CardTitle>
                    <CardDescription>{t({ en: 'Leave empty for kingdom-wide scope', ar: 'اتركها فارغة للنطاق على مستوى المملكة' })}</CardDescription>
                  </div>
                </div>
                <Badge variant={data.target_regions?.length > 0 ? 'default' : 'secondary'}>
                  {data.target_regions?.length > 0 
                    ? `${data.target_regions.length} ${t({ en: 'selected', ar: 'مختار' })}`
                    : t({ en: 'Kingdom-wide', ar: 'على مستوى المملكة' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {regions.filter(r => r.code !== 'NATIONAL').map(region => (
                  <Badge 
                    key={region.code}
                    variant={data.target_regions?.includes(region.code) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all text-xs ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'hover:bg-primary/20'}`}
                    onClick={() => toggleItem('target_regions', region.code)}
                  >
                    {data.target_regions?.includes(region.code) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {language === 'ar' ? region.name_ar : region.name_en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discovery Tab */}
        <TabsContent value="discovery" className="space-y-4 mt-4">
          {/* Quick Stakeholders */}
          <Card>
            <Collapsible open={expandedSections.stakeholders} onOpenChange={() => toggleSection('stakeholders')}>
              <SectionHeader 
                icon={Users} 
                title={t({ en: 'Key Stakeholders (Quick List)', ar: 'أصحاب المصلحة الرئيسيون (قائمة سريعة)' })}
                description={t({ en: 'Add stakeholder names here. Detailed analysis is in Step 3.', ar: 'أضف أسماء أصحاب المصلحة هنا. التحليل التفصيلي في الخطوة 3.' })}
                section="stakeholders"
                score={completenessMetrics.sectionScores.stakeholders}
              />
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  {!isReadOnly && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          id="new-stakeholder-en"
                          placeholder={t({ en: 'Stakeholder name (English)', ar: 'اسم صاحب المصلحة (إنجليزي)' })}
                          dir="ltr"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const enInput = document.getElementById('new-stakeholder-en');
                              const arInput = document.getElementById('new-stakeholder-ar');
                              addQuickStakeholder(enInput.value, arInput.value);
                              enInput.value = '';
                              arInput.value = '';
                            }
                          }}
                        />
                        <Input
                          id="new-stakeholder-ar"
                          placeholder={t({ en: 'Stakeholder name (Arabic)', ar: 'اسم صاحب المصلحة (عربي)' })}
                          dir="rtl"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const enInput = document.getElementById('new-stakeholder-en');
                              const arInput = document.getElementById('new-stakeholder-ar');
                              addQuickStakeholder(enInput.value, arInput.value);
                              enInput.value = '';
                              arInput.value = '';
                            }
                          }}
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        const enInput = document.getElementById('new-stakeholder-en');
                        const arInput = document.getElementById('new-stakeholder-ar');
                        addQuickStakeholder(enInput.value, arInput.value);
                        enInput.value = '';
                        arInput.value = '';
                      }}>
                        {t({ en: 'Add Stakeholder', ar: 'إضافة صاحب مصلحة' })}
                      </Button>
                    </>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(data.quick_stakeholders || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        {t({ en: 'No stakeholders added yet', ar: 'لم يتم إضافة أصحاب مصلحة بعد' })}
                      </p>
                    ) : (
                      (data.quick_stakeholders || []).map((s, i) => (
                        <Badge key={i} variant="secondary" className="gap-1">
                          {getStakeholderName(s, i)}
                          {!isReadOnly && (
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeQuickStakeholder(i)} />
                          )}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Discovery Inputs */}
          <Card>
            <Collapsible open={expandedSections.discovery} onOpenChange={() => toggleSection('discovery')}>
              <SectionHeader 
                icon={Lightbulb} 
                title={t({ en: 'Discovery Inputs', ar: 'مدخلات الاستكشاف' })}
                description={t({ en: 'Current situation analysis', ar: 'تحليل الوضع الحالي' })}
                section="discovery"
                score={completenessMetrics.sectionScores.discovery}
              />
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {/* Key Challenges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        {t({ en: 'Key Challenges (English)', ar: 'التحديات الرئيسية (إنجليزي)' })}
                      </Label>
                      <Textarea
                        value={data.key_challenges_en || data.key_challenges || ''}
                        onChange={(e) => onChange({ key_challenges_en: e.target.value })}
                        rows={3}
                        placeholder={t({ en: 'What are the main challenges to address?', ar: 'ما هي التحديات الرئيسية التي يجب معالجتها؟' })}
                        dir="ltr"
                        disabled={isReadOnly}
                        className={(data.key_challenges_en || data.key_challenges) ? 'border-green-500/50' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        {t({ en: 'Key Challenges (Arabic)', ar: 'التحديات الرئيسية (عربي)' })}
                      </Label>
                      <Textarea
                        value={data.key_challenges_ar || ''}
                        onChange={(e) => onChange({ key_challenges_ar: e.target.value })}
                        rows={3}
                        placeholder={t({ en: 'Enter challenges in Arabic', ar: 'أدخل التحديات بالعربية' })}
                        dir="rtl"
                        disabled={isReadOnly}
                        className={data.key_challenges_ar ? 'border-green-500/50' : ''}
                      />
                    </div>
                  </div>

                  {/* Available Resources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {t({ en: 'Available Resources (English)', ar: 'الموارد المتاحة (إنجليزي)' })}
                      </Label>
                      <Textarea
                        value={data.available_resources_en || data.available_resources || ''}
                        onChange={(e) => onChange({ available_resources_en: e.target.value })}
                        rows={2}
                        placeholder={t({ en: 'Human resources, technology, partnerships, etc.', ar: 'الموارد البشرية، التقنية، الشراكات، إلخ' })}
                        dir="ltr"
                        disabled={isReadOnly}
                        className={(data.available_resources_en || data.available_resources) ? 'border-green-500/50' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {t({ en: 'Available Resources (Arabic)', ar: 'الموارد المتاحة (عربي)' })}
                      </Label>
                      <Textarea
                        value={data.available_resources_ar || ''}
                        onChange={(e) => onChange({ available_resources_ar: e.target.value })}
                        rows={2}
                        placeholder={t({ en: 'Enter resources in Arabic', ar: 'أدخل الموارد بالعربية' })}
                        dir="rtl"
                        disabled={isReadOnly}
                        className={data.available_resources_ar ? 'border-green-500/50' : ''}
                      />
                    </div>
                  </div>

                  {/* Initial Constraints */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        {t({ en: 'Initial Constraints & Limitations (English)', ar: 'القيود والحدود الأولية (إنجليزي)' })}
                      </Label>
                      <Textarea
                        value={data.initial_constraints_en || data.initial_constraints || ''}
                        onChange={(e) => onChange({ initial_constraints_en: e.target.value })}
                        rows={2}
                        placeholder={t({ en: 'Budget limits, regulatory constraints, timeline pressures', ar: 'حدود الميزانية، القيود التنظيمية، ضغوط الجدول الزمني' })}
                        dir="ltr"
                        disabled={isReadOnly}
                        className={(data.initial_constraints_en || data.initial_constraints) ? 'border-green-500/50' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        {t({ en: 'Initial Constraints & Limitations (Arabic)', ar: 'القيود والحدود الأولية (عربي)' })}
                      </Label>
                      <Textarea
                        value={data.initial_constraints_ar || ''}
                        onChange={(e) => onChange({ initial_constraints_ar: e.target.value })}
                        rows={2}
                        placeholder={t({ en: 'Enter constraints in Arabic', ar: 'أدخل القيود بالعربية' })}
                        dir="rtl"
                        disabled={isReadOnly}
                        className={data.initial_constraints_ar ? 'border-green-500/50' : ''}
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </TabsContent>

        {/* Summary Tab - Using Shared Components */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section Scores */}
            <QualityMetrics
              title={t({ en: 'Section Completion', ar: 'اكتمال الأقسام' })}
              language={language}
              metrics={[
                { icon: Target, value: `${Math.round(completenessMetrics.sectionScores.identity)}%`, label: { en: 'Identity', ar: 'الهوية' }, iconColor: 'text-blue-600' },
                { icon: Calendar, value: `${Math.round(completenessMetrics.sectionScores.duration)}%`, label: { en: 'Duration', ar: 'المدة' }, iconColor: 'text-purple-600' },
                { icon: MapPin, value: `${Math.round(completenessMetrics.sectionScores.scope)}%`, label: { en: 'Scope', ar: 'النطاق' }, iconColor: 'text-green-600' },
                { icon: Lightbulb, value: `${Math.round(completenessMetrics.sectionScores.discovery)}%`, label: { en: 'Discovery', ar: 'الاستكشاف' }, iconColor: 'text-amber-600' }
              ]}
            />

            {/* Recommendations */}
            <RecommendationsCard
              title={t({ en: 'Recommendations', ar: 'التوصيات' })}
              language={language}
              recommendations={[
                ...(!data.name_en && !data.name_ar ? [{ type: 'warning', message: { en: 'Add a plan name to establish identity', ar: 'أضف اسم الخطة لتأسيس الهوية' } }] : []),
                ...(!data.vision_en && !data.vision_ar ? [{ type: 'warning', message: { en: 'Define a vision statement', ar: 'حدد بيان الرؤية' } }] : []),
                ...(!data.mission_en && !data.mission_ar ? [{ type: 'info', message: { en: 'Add a mission statement', ar: 'أضف بيان المهمة' } }] : []),
                ...(data.target_sectors?.length === 0 ? [{ type: 'info', message: { en: 'Select target sectors', ar: 'اختر القطاعات المستهدفة' } }] : []),
                ...(completenessMetrics.overallScore >= 80 ? [{ type: 'success', message: { en: 'Context is well-defined. Ready for next steps.', ar: 'السياق محدد جيداً. جاهز للخطوات التالية.' } }] : [])
              ]}
            />
          </div>

          {/* Scope Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DistributionChart
              title={t({ en: 'Scope Coverage', ar: 'تغطية النطاق' })}
              language={language}
              data={[
                { label: { en: 'Sectors', ar: 'القطاعات' }, value: data.target_sectors?.length || 0, icon: Building, iconColor: 'text-blue-600' },
                { label: { en: 'Themes', ar: 'المحاور' }, value: data.strategic_themes?.length || 0, icon: Target, iconColor: 'text-purple-600' },
                { label: { en: 'Technologies', ar: 'التقنيات' }, value: data.focus_technologies?.length || 0, icon: Cpu, iconColor: 'text-green-600' },
                { label: { en: 'Vision 2030', ar: 'رؤية 2030' }, value: data.vision_2030_programs?.length || 0, icon: Flag, iconColor: 'text-amber-600' }
              ]}
              showPercentage={false}
            />

            <DistributionChart
              title={t({ en: 'Discovery Progress', ar: 'تقدم الاستكشاف' })}
              language={language}
              data={[
                { label: { en: 'Stakeholders', ar: 'أصحاب المصلحة' }, value: data.quick_stakeholders?.length || 0, icon: Users, iconColor: 'text-blue-600' },
                { label: { en: 'Challenges', ar: 'التحديات' }, value: (data.key_challenges_en || data.key_challenges) ? 1 : 0, icon: AlertCircle, iconColor: 'text-red-600' },
                { label: { en: 'Resources', ar: 'الموارد' }, value: (data.available_resources_en || data.available_resources) ? 1 : 0, icon: CheckCircle2, iconColor: 'text-green-600' },
                { label: { en: 'Constraints', ar: 'القيود' }, value: (data.initial_constraints_en || data.initial_constraints) ? 1 : 0, icon: Info, iconColor: 'text-amber-600' }
              ]}
              showPercentage={false}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
