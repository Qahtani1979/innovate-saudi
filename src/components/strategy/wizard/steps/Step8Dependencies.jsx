import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Sparkles, GitBranch, Link2, AlertCircle, Plus, X, CheckCircle, CheckCircle2,
  ChevronDown, ChevronUp, Network, FileCheck, AlertTriangle,
  ArrowRight, Shield, Lightbulb, Target, TrendingUp, BarChart3
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { cn } from "@/lib/utils";
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, MainAIGeneratorCard } from '../shared';

export default function Step8Dependencies({ data, onChange, onGenerateAI, isGenerating, isReadOnly = false }) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('dependencies');
  const [openDependencies, setOpenDependencies] = useState({});
  const [openConstraints, setOpenConstraints] = useState({});
  const [openAssumptions, setOpenAssumptions] = useState({});

  // Toggle functions
  const toggleDependency = (id) => {
    if (!isReadOnly) {
      setOpenDependencies(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };
  const toggleConstraint = (id) => {
    if (!isReadOnly) {
      setOpenConstraints(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };
  const toggleAssumption = (id) => {
    if (!isReadOnly) {
      setOpenAssumptions(prev => ({ ...prev, [id]: !prev[id] }));
    }
  };

  // Options
  const dependencyTypes = [
    { value: 'internal', label: { en: 'Internal', ar: 'داخلي' }, icon: GitBranch, color: 'text-blue-500' },
    { value: 'external', label: { en: 'External', ar: 'خارجي' }, icon: Link2, color: 'text-purple-500' },
    { value: 'technical', label: { en: 'Technical', ar: 'تقني' }, icon: Network, color: 'text-cyan-500' },
    { value: 'resource', label: { en: 'Resource', ar: 'موارد' }, icon: Target, color: 'text-orange-500' }
  ];

  const constraintTypes = [
    { value: 'budget', label: { en: 'Budget', ar: 'ميزانية' }, icon: TrendingUp, color: 'text-green-500' },
    { value: 'time', label: { en: 'Time', ar: 'وقت' }, icon: AlertCircle, color: 'text-red-500' },
    { value: 'resource', label: { en: 'Resource', ar: 'موارد' }, icon: Target, color: 'text-orange-500' },
    { value: 'regulatory', label: { en: 'Regulatory', ar: 'تنظيمي' }, icon: Shield, color: 'text-blue-500' },
    { value: 'technical', label: { en: 'Technical', ar: 'تقني' }, icon: Network, color: 'text-cyan-500' }
  ];

  const assumptionCategories = [
    { value: 'operational', label: { en: 'Operational', ar: 'تشغيلي' }, icon: Target },
    { value: 'financial', label: { en: 'Financial', ar: 'مالي' }, icon: TrendingUp },
    { value: 'market', label: { en: 'Market', ar: 'سوق' }, icon: Network },
    { value: 'stakeholder', label: { en: 'Stakeholder', ar: 'أصحاب المصلحة' }, icon: GitBranch },
    { value: 'regulatory', label: { en: 'Regulatory', ar: 'تنظيمي' }, icon: Shield }
  ];

  const criticalityOptions = [
    { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  ];

  const statusOptions = [
    { value: 'pending', label: { en: 'Pending', ar: 'معلق' }, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'resolved', label: { en: 'Resolved', ar: 'تم الحل' }, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'blocked', label: { en: 'Blocked', ar: 'محظور' }, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  ];

  const confidenceOptions = [
    { value: 'high', label: { en: 'High', ar: 'عالية' }, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'medium', label: { en: 'Medium', ar: 'متوسطة' }, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'low', label: { en: 'Low', ar: 'منخفضة' }, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  ];

  // Calculate stats
  const stats = useMemo(() => {
    const dependencies = data.dependencies || [];
    const constraints = data.constraints || [];
    const assumptions = data.assumptions || [];

    const resolvedDeps = dependencies.filter(d => d.status === 'resolved').length;
    const blockedDeps = dependencies.filter(d => d.status === 'blocked').length;
    const highCritDeps = dependencies.filter(d => d.criticality === 'high').length;
    const highImpactConstraints = constraints.filter(c => c.impact === 'high').length;
    const lowConfidenceAssumptions = assumptions.filter(a => a.confidence === 'low').length;

    // Calculate completeness
    let completedItems = 0;
    let totalItems = 0;

    dependencies.forEach(dep => {
      totalItems += 4; // name, type, source/target, status
      if (dep.name_en || dep.name_ar) completedItems++;
      if (dep.type) completedItems++;
      if (dep.source && dep.target) completedItems++;
      if (dep.status) completedItems++;
    });

    constraints.forEach(con => {
      totalItems += 3; // description, type, mitigation
      if (con.description_en || con.description_ar) completedItems++;
      if (con.type) completedItems++;
      if (con.mitigation_en || con.mitigation_ar) completedItems++;
    });

    assumptions.forEach(asmp => {
      totalItems += 3; // statement, category, validation
      if (asmp.statement_en || asmp.statement_ar) completedItems++;
      if (asmp.category) completedItems++;
      if (asmp.validation_method_en || asmp.validation_method_ar) completedItems++;
    });

    const completeness = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalDeps: dependencies.length,
      resolvedDeps,
      blockedDeps,
      highCritDeps,
      totalConstraints: constraints.length,
      highImpactConstraints,
      totalAssumptions: assumptions.length,
      lowConfidenceAssumptions,
      completeness
    };
  }, [data]);

  // CRUD operations
  const addDependency = () => {
    if (isReadOnly) return;
    const newDep = {
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      type: 'internal',
      source: '',
      target: '',
      criticality: 'medium',
      status: 'pending',
      notes: ''
    };
    onChange({ dependencies: [...(data.dependencies || []), newDep] });
    setOpenDependencies(prev => ({ ...prev, [newDep.id]: true }));
  };

  const updateDependency = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...(data.dependencies || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ dependencies: updated });
  };

  const removeDependency = (index) => {
    if (isReadOnly) return;
    onChange({ dependencies: data.dependencies.filter((_, i) => i !== index) });
  };

  const addConstraint = () => {
    if (isReadOnly) return;
    const newConstraint = {
      id: Date.now().toString(),
      description_en: '',
      description_ar: '',
      type: 'budget',
      impact: 'medium',
      mitigation_en: '',
      mitigation_ar: ''
    };
    onChange({ constraints: [...(data.constraints || []), newConstraint] });
    setOpenConstraints(prev => ({ ...prev, [newConstraint.id]: true }));
  };

  const updateConstraint = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...(data.constraints || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ constraints: updated });
  };

  const removeConstraint = (index) => {
    if (isReadOnly) return;
    onChange({ constraints: data.constraints.filter((_, i) => i !== index) });
  };

  const addAssumption = () => {
    if (isReadOnly) return;
    const newAssumption = {
      id: Date.now().toString(),
      statement_en: '',
      statement_ar: '',
      category: 'operational',
      confidence: 'high',
      validation_method_en: '',
      validation_method_ar: ''
    };
    onChange({ assumptions: [...(data.assumptions || []), newAssumption] });
    setOpenAssumptions(prev => ({ ...prev, [newAssumption.id]: true }));
  };

  const updateAssumption = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...(data.assumptions || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ assumptions: updated });
  };

  const removeAssumption = (index) => {
    if (isReadOnly) return;
    onChange({ assumptions: data.assumptions.filter((_, i) => i !== index) });
  };

  // Calculate item completeness
  const getDependencyCompleteness = (dep) => {
    let filled = 0;
    if (dep.name_en || dep.name_ar) filled++;
    if (dep.type) filled++;
    if (dep.source) filled++;
    if (dep.target) filled++;
    return Math.round((filled / 4) * 100);
  };

  const getConstraintCompleteness = (con) => {
    let filled = 0;
    if (con.description_en || con.description_ar) filled++;
    if (con.type) filled++;
    if (con.mitigation_en || con.mitigation_ar) filled++;
    return Math.round((filled / 3) * 100);
  };

  const getAssumptionCompleteness = (asmp) => {
    let filled = 0;
    if (asmp.statement_en || asmp.statement_ar) filled++;
    if (asmp.category) filled++;
    if (asmp.validation_method_en || asmp.validation_method_ar) filled++;
    return Math.round((filled / 3) * 100);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <StepDashboardHeader
        score={stats.completeness}
        title={t({ en: 'Dependencies & Constraints', ar: 'التبعيات والقيود' })}
        subtitle={t({ en: 'Map dependencies, constraints, and assumptions', ar: 'تحديد التبعيات والقيود والافتراضات' })}
        language={language}
        stats={[
          { icon: GitBranch, value: stats.totalDeps, label: t({ en: 'Dependencies', ar: 'التبعيات' }), subValue: `${stats.resolvedDeps} ${t({ en: 'resolved', ar: 'محلولة' })}` },
          { icon: AlertTriangle, value: stats.highCritDeps, label: t({ en: 'Critical', ar: 'حرجة' }), subValue: `${stats.blockedDeps} ${t({ en: 'blocked', ar: 'محظورة' })}` },
          { icon: AlertCircle, value: stats.totalConstraints, label: t({ en: 'Constraints', ar: 'القيود' }), subValue: `${stats.highImpactConstraints} ${t({ en: 'high impact', ar: 'تأثير عالي' })}` },
          { icon: Lightbulb, value: stats.totalAssumptions, label: t({ en: 'Assumptions', ar: 'الافتراضات' }), subValue: `${stats.lowConfidenceAssumptions} ${t({ en: 'low confidence', ar: 'ثقة منخفضة' })}` },
        ]}
        metrics={[
          { label: t({ en: 'Resolved', ar: 'محلولة' }), value: stats.totalDeps > 0 ? Math.round((stats.resolvedDeps / stats.totalDeps) * 100) : 0 },
          { label: t({ en: 'High Confidence', ar: 'ثقة عالية' }), value: stats.totalAssumptions > 0 ? Math.round(((stats.totalAssumptions - stats.lowConfidenceAssumptions) / stats.totalAssumptions) * 100) : 0 },
        ]}
      />

      {/* AI Generation Card */}
      {!isReadOnly && (
        <MainAIGeneratorCard
          title={{ en: 'AI-Powered Dependency Analysis', ar: 'تحليل التبعيات بالذكاء الاصطناعي' }}
          description={{ en: 'Map dependencies, identify constraints, and document key assumptions', ar: 'تحديد التبعيات والقيود وتوثيق الافتراضات الرئيسية' }}
          onGenerate={onGenerateAI}
          isGenerating={isGenerating}
          generateLabel={{ en: 'AI Analyze', ar: 'تحليل ذكي' }}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dependencies" className="gap-2">
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Deps', ar: 'التبعيات' })}</span>
            <Badge variant="secondary" className="ml-1">{stats.totalDeps}</Badge>
          </TabsTrigger>
          <TabsTrigger value="constraints" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Const.', ar: 'القيود' })}</span>
            <Badge variant="secondary" className="ml-1">{stats.totalConstraints}</Badge>
          </TabsTrigger>
          <TabsTrigger value="assumptions" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Assump.', ar: 'الافتراضات' })}</span>
            <Badge variant="secondary" className="ml-1">{stats.totalAssumptions}</Badge>
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <Network className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Overview', ar: 'نظرة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="space-y-4 mt-4">
          {!isReadOnly && (
            <Button variant="outline" onClick={addDependency} className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              {t({ en: 'Add Dependency', ar: 'إضافة تبعية' })}
            </Button>
          )}

          {(data.dependencies || []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No dependencies defined yet', ar: 'لم يتم تحديد تبعيات بعد' })}</p>
              </CardContent>
            </Card>
          ) : (
            (data.dependencies || []).map((dep, index) => {
              const isOpen = openDependencies[dep.id];
              const completeness = getDependencyCompleteness(dep);
              const typeInfo = dependencyTypes.find(dt => dt.value === dep.type);
              const TypeIcon = typeInfo?.icon || GitBranch;

              return (
                <Collapsible key={dep.id} open={isOpen} onOpenChange={() => toggleDependency(dep.id)}>
                  <Card className={cn(
                    "transition-all duration-200",
                    dep.status === 'blocked' && "border-red-500/50",
                    dep.status === 'resolved' && "border-green-500/50"
                  )}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-muted", typeInfo?.color)}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {dep.name_en || dep.name_ar || t({ en: 'Untitled Dependency', ar: 'تبعية بدون عنوان' })}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {typeInfo?.label[language]}
                                </Badge>
                                <Badge className={cn("text-xs", statusOptions.find(s => s.value === dep.status)?.color)}>
                                  {statusOptions.find(s => s.value === dep.status)?.label[language]}
                                </Badge>
                                {dep.criticality === 'high' && (
                                  <Badge variant="destructive" className="text-xs">
                                    {t({ en: 'Critical', ar: 'حرج' })}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{completeness}%</p>
                              <Progress value={completeness} className="w-20 h-1.5" />
                            </div>
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={cn((dep.name_en) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}
                              {dep.name_en && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Input
                              value={dep.name_en || ''}
                              onChange={(e) => updateDependency(index, 'name_en', e.target.value)}
                              placeholder={t({ en: 'e.g., Budget approval', ar: 'مثال: موافقة الميزانية' })}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={cn((dep.name_ar) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}
                              {dep.name_ar && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Input
                              dir="rtl"
                              value={dep.name_ar || ''}
                              onChange={(e) => updateDependency(index, 'name_ar', e.target.value)}
                              placeholder="مثال: موافقة الميزانية"
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>{t({ en: 'Type', ar: 'النوع' })}</Label>
                            <Select value={dep.type} onValueChange={(v) => updateDependency(index, 'type', v)} disabled={isReadOnly}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {dependencyTypes.map(dt => (
                                  <SelectItem key={dt.value} value={dt.value}>{dt.label[language]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t({ en: 'Criticality', ar: 'الأهمية' })}</Label>
                            <Select value={dep.criticality} onValueChange={(v) => updateDependency(index, 'criticality', v)} disabled={isReadOnly}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {criticalityOptions.map(c => (
                                  <SelectItem key={c.value} value={c.value}>{c.label[language]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                            <Select value={dep.status} onValueChange={(v) => updateDependency(index, 'status', v)} disabled={isReadOnly}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {statusOptions.map(s => (
                                  <SelectItem key={s.value} value={s.value}>{s.label[language]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label>{t({ en: 'Flow', ar: 'التدفق' })}</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={dep.source || ''}
                                onChange={(e) => updateDependency(index, 'source', e.target.value)}
                                placeholder={t({ en: 'From', ar: 'من' })}
                                className="flex-1"
                                disabled={isReadOnly}
                              />
                              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                              <Input
                                value={dep.target || ''}
                                onChange={(e) => updateDependency(index, 'target', e.target.value)}
                                placeholder={t({ en: 'To', ar: 'إلى' })}
                                className="flex-1"
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{t({ en: 'Notes', ar: 'ملاحظات' })}</Label>
                          <Textarea
                            value={dep.notes || ''}
                            onChange={(e) => updateDependency(index, 'notes', e.target.value)}
                            placeholder={t({ en: 'Additional notes...', ar: 'ملاحظات إضافية...' })}
                            rows={2}
                            disabled={isReadOnly}
                          />
                        </div>

                        {!isReadOnly && (
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => removeDependency(index)} className="text-destructive hover:text-destructive">
                              <X className="w-4 h-4 mr-1" />
                              {t({ en: 'Remove', ar: 'إزالة' })}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </TabsContent>

        {/* Constraints Tab */}
        <TabsContent value="constraints" className="space-y-4 mt-4">
          {!isReadOnly && (
            <Button variant="outline" onClick={addConstraint} className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              {t({ en: 'Add Constraint', ar: 'إضافة قيد' })}
            </Button>
          )}

          {(data.constraints || []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No constraints defined yet', ar: 'لم يتم تحديد قيود بعد' })}</p>
              </CardContent>
            </Card>
          ) : (
            (data.constraints || []).map((constraint, index) => {
              const isOpen = openConstraints[constraint.id];
              const completeness = getConstraintCompleteness(constraint);
              const typeInfo = constraintTypes.find(ct => ct.value === constraint.type);
              const TypeIcon = typeInfo?.icon || AlertCircle;

              return (
                <Collapsible key={constraint.id} open={isOpen} onOpenChange={() => toggleConstraint(constraint.id)}>
                  <Card className={cn(
                    "transition-all duration-200",
                    constraint.impact === 'high' && "border-orange-500/50"
                  )}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-muted", typeInfo?.color)}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {constraint.description_en?.slice(0, 50) || constraint.description_ar?.slice(0, 50) || t({ en: 'Untitled Constraint', ar: 'قيد بدون عنوان' })}
                                {(constraint.description_en?.length > 50 || constraint.description_ar?.length > 50) && '...'}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {typeInfo?.label[language]}
                                </Badge>
                                <Badge className={cn("text-xs", criticalityOptions.find(c => c.value === constraint.impact)?.color)}>
                                  {t({ en: 'Impact:', ar: 'التأثير:' })} {criticalityOptions.find(c => c.value === constraint.impact)?.label[language]}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{completeness}%</p>
                              <Progress value={completeness} className="w-20 h-1.5" />
                            </div>
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={cn((constraint.description_en) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
                              {constraint.description_en && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Textarea
                              value={constraint.description_en || ''}
                              onChange={(e) => updateConstraint(index, 'description_en', e.target.value)}
                              placeholder={t({ en: 'Describe the constraint...', ar: 'صف القيد...' })}
                              rows={3}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={cn((constraint.description_ar) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}
                              {constraint.description_ar && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Textarea
                              dir="rtl"
                              value={constraint.description_ar || ''}
                              onChange={(e) => updateConstraint(index, 'description_ar', e.target.value)}
                              placeholder="صف القيد..."
                              rows={3}
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t({ en: 'Type', ar: 'النوع' })}</Label>
                            <Select value={constraint.type} onValueChange={(v) => updateConstraint(index, 'type', v)} disabled={isReadOnly}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {constraintTypes.map(ct => (
                                  <SelectItem key={ct.value} value={ct.value}>{ct.label[language]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t({ en: 'Impact Level', ar: 'مستوى التأثير' })}</Label>
                            <Select value={constraint.impact} onValueChange={(v) => updateConstraint(index, 'impact', v)} disabled={isReadOnly}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {criticalityOptions.map(c => (
                                  <SelectItem key={c.value} value={c.value}>{c.label[language]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={cn((constraint.mitigation_en) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Mitigation (English)', ar: 'التخفيف (إنجليزي)' })}
                              {constraint.mitigation_en && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Input
                              value={constraint.mitigation_en || ''}
                              onChange={(e) => updateConstraint(index, 'mitigation_en', e.target.value)}
                              placeholder={t({ en: 'How to work around this?', ar: 'كيف تتعامل مع هذا؟' })}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={cn((constraint.mitigation_ar) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Mitigation (Arabic)', ar: 'التخفيف (عربي)' })}
                              {constraint.mitigation_ar && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Input
                              dir="rtl"
                              value={constraint.mitigation_ar || ''}
                              onChange={(e) => updateConstraint(index, 'mitigation_ar', e.target.value)}
                              placeholder="كيف تتعامل مع هذا؟"
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>

                        {!isReadOnly && (
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => removeConstraint(index)} className="text-destructive hover:text-destructive">
                              <X className="w-4 h-4 mr-1" />
                              {t({ en: 'Remove', ar: 'إزالة' })}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </TabsContent>

        {/* Assumptions Tab */}
        <TabsContent value="assumptions" className="space-y-4 mt-4">
          {!isReadOnly && (
            <Button variant="outline" onClick={addAssumption} className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              {t({ en: 'Add Assumption', ar: 'إضافة افتراض' })}
            </Button>
          )}

          {(data.assumptions || []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No assumptions documented yet', ar: 'لم يتم توثيق افتراضات بعد' })}</p>
              </CardContent>
            </Card>
          ) : (
            (data.assumptions || []).map((assumption, index) => {
              const isOpen = openAssumptions[assumption.id];
              const completeness = getAssumptionCompleteness(assumption);
              const catInfo = assumptionCategories.find(ac => ac.value === assumption.category);
              const CatIcon = catInfo?.icon || Lightbulb;

              return (
                <Collapsible key={assumption.id} open={isOpen} onOpenChange={() => toggleAssumption(assumption.id)}>
                  <Card className={cn(
                    "transition-all duration-200",
                    assumption.confidence === 'low' && "border-red-500/50"
                  )}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted text-amber-500">
                              <CatIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {assumption.statement_en?.slice(0, 50) || assumption.statement_ar?.slice(0, 50) || t({ en: 'Untitled Assumption', ar: 'افتراض بدون عنوان' })}
                                {(assumption.statement_en?.length > 50 || assumption.statement_ar?.length > 50) && '...'}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {catInfo?.label[language]}
                                </Badge>
                                <Badge className={cn("text-xs", confidenceOptions.find(c => c.value === assumption.confidence)?.color)}>
                                  {t({ en: 'Confidence:', ar: 'الثقة:' })} {confidenceOptions.find(c => c.value === assumption.confidence)?.label[language]}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">{completeness}%</p>
                              <Progress value={completeness} className="w-20 h-1.5" />
                            </div>
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={cn((assumption.statement_en) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Statement (English)', ar: 'البيان (إنجليزي)' })}
                              {assumption.statement_en && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Textarea
                              value={assumption.statement_en || ''}
                              onChange={(e) => updateAssumption(index, 'statement_en', e.target.value)}
                              placeholder={t({ en: 'We assume that...', ar: 'نفترض أن...' })}
                              rows={3}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={cn((assumption.statement_ar) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Statement (Arabic)', ar: 'البيان (عربي)' })}
                              {assumption.statement_ar && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Textarea
                              dir="rtl"
                              value={assumption.statement_ar || ''}
                              onChange={(e) => updateAssumption(index, 'statement_ar', e.target.value)}
                              placeholder="نفترض أن..."
                              rows={3}
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
                            <Select value={assumption.category} onValueChange={(v) => updateAssumption(index, 'category', v)} disabled={isReadOnly}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {assumptionCategories.map(ac => (
                                  <SelectItem key={ac.value} value={ac.value}>{ac.label[language]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t({ en: 'Confidence Level', ar: 'مستوى الثقة' })}</Label>
                            <Select value={assumption.confidence} onValueChange={(v) => updateAssumption(index, 'confidence', v)} disabled={isReadOnly}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {confidenceOptions.map(c => (
                                  <SelectItem key={c.value} value={c.value}>{c.label[language]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={cn((assumption.validation_method_en) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Validation Method (English)', ar: 'طريقة التحقق (إنجليزي)' })}
                              {assumption.validation_method_en && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Input
                              value={assumption.validation_method_en || ''}
                              onChange={(e) => updateAssumption(index, 'validation_method_en', e.target.value)}
                              placeholder={t({ en: 'How will you validate this?', ar: 'كيف ستتحقق من هذا؟' })}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={cn((assumption.validation_method_ar) && "text-green-600 dark:text-green-400")}>
                              {t({ en: 'Validation Method (Arabic)', ar: 'طريقة التحقق (عربي)' })}
                              {assumption.validation_method_ar && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </Label>
                            <Input
                              dir="rtl"
                              value={assumption.validation_method_ar || ''}
                              onChange={(e) => updateAssumption(index, 'validation_method_ar', e.target.value)}
                              placeholder="كيف ستتحقق من هذا؟"
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>

                        {!isReadOnly && (
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => removeAssumption(index)} className="text-destructive hover:text-destructive">
                              <X className="w-4 h-4 mr-1" />
                              {t({ en: 'Remove', ar: 'إزالة' })}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Dependencies Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" />
                  {t({ en: 'Dependencies', ar: 'التبعيات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data.dependencies || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t({ en: 'No dependencies', ar: 'لا توجد تبعيات' })}</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {dependencyTypes.map(dt => {
                        const count = (data.dependencies || []).filter(d => d.type === dt.value).length;
                        if (count === 0) return null;
                        const Icon = dt.icon;
                        return (
                          <div key={dt.value} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("w-4 h-4", dt.color)} />
                              <span>{dt.label[language]}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-2 border-t space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">{t({ en: 'Resolved', ar: 'محلولة' })}</span>
                        <span>{stats.resolvedDeps}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-600">{t({ en: 'Pending', ar: 'معلقة' })}</span>
                        <span>{stats.totalDeps - stats.resolvedDeps - stats.blockedDeps}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">{t({ en: 'Blocked', ar: 'محظورة' })}</span>
                        <span>{stats.blockedDeps}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Constraints Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  {t({ en: 'Constraints', ar: 'القيود' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data.constraints || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t({ en: 'No constraints', ar: 'لا توجد قيود' })}</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {constraintTypes.map(ct => {
                        const count = (data.constraints || []).filter(c => c.type === ct.value).length;
                        if (count === 0) return null;
                        const Icon = ct.icon;
                        return (
                          <div key={ct.value} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("w-4 h-4", ct.color)} />
                              <span>{ct.label[language]}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</span>
                        <span>{stats.highImpactConstraints}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Assumptions Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  {t({ en: 'Assumptions', ar: 'الافتراضات' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data.assumptions || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t({ en: 'No assumptions', ar: 'لا توجد افتراضات' })}</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {assumptionCategories.map(ac => {
                        const count = (data.assumptions || []).filter(a => a.category === ac.value).length;
                        if (count === 0) return null;
                        const Icon = ac.icon;
                        return (
                          <div key={ac.value} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-amber-500" />
                              <span>{ac.label[language]}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-2 border-t space-y-1">
                      {confidenceOptions.map(co => {
                        const count = (data.assumptions || []).filter(a => a.confidence === co.value).length;
                        return (
                          <div key={co.value} className="flex justify-between text-sm">
                            <span>{co.label[language]} {t({ en: 'Confidence', ar: 'الثقة' })}</span>
                            <span>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Risk Alerts */}
          {(stats.blockedDeps > 0 || stats.highCritDeps > 0 || stats.lowConfidenceAssumptions > 0) && (
            <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  {t({ en: 'Attention Required', ar: 'يتطلب الاهتمام' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {stats.blockedDeps > 0 && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      {stats.blockedDeps} {t({ en: 'blocked dependencies need resolution', ar: 'تبعيات محظورة تحتاج إلى حل' })}
                    </li>
                  )}
                  {stats.highCritDeps > 0 && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      {stats.highCritDeps} {t({ en: 'critical dependencies to monitor', ar: 'تبعيات حرجة للمراقبة' })}
                    </li>
                  )}
                  {stats.lowConfidenceAssumptions > 0 && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      {stats.lowConfidenceAssumptions} {t({ en: 'low-confidence assumptions need validation', ar: 'افتراضات منخفضة الثقة تحتاج للتحقق' })}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t({ en: 'Dependencies Summary', ar: 'ملخص التبعيات' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                  <GitBranch className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{stats.totalDeps}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Dependencies', ar: 'التبعيات' })}</p>
                  <p className="text-xs text-green-600">{stats.resolvedDeps} {t({ en: 'resolved', ar: 'محلولة' })}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-600 mb-2" />
                  <p className="text-2xl font-bold text-amber-600">{stats.totalConstraints}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Constraints', ar: 'القيود' })}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                  <Lightbulb className="h-5 w-5 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{stats.totalAssumptions}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Assumptions', ar: 'الافتراضات' })}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-600">{stats.highCritDeps}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Critical', ar: 'حرجة' })}</p>
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="space-y-3">
                <h4 className="font-medium">{t({ en: 'Risk Indicators', ar: 'مؤشرات المخاطر' })}</h4>
                {stats.blockedDeps > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm">{stats.blockedDeps} {t({ en: 'blocked dependencies require attention', ar: 'تبعيات محظورة تتطلب الانتباه' })}</p>
                  </div>
                )}
                {stats.lowConfidenceAssumptions > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm">{stats.lowConfidenceAssumptions} {t({ en: 'low-confidence assumptions need validation', ar: 'افتراضات منخفضة الثقة تحتاج للتحقق' })}</p>
                  </div>
                )}
                {stats.blockedDeps === 0 && stats.lowConfidenceAssumptions === 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm">{t({ en: 'No critical blockers identified', ar: 'لم يتم تحديد عوائق حرجة' })}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
