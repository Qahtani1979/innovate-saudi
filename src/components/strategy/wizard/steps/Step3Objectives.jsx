import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sparkles, Loader2, Plus, X, Target, ChevronDown, ChevronUp, Wand2, Check,
  RefreshCw, AlertTriangle, CheckCircle, List, BarChart3, Building2,
  Flag, Calendar
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { cn } from "@/lib/utils";
import { StepDashboardHeader, MainAIGeneratorCard } from '../shared';
import AIObjectivesAnalyzer from '../AIObjectivesAnalyzer';

export default function Step3Objectives({
  data,
  onChange,
  onGenerateAI,
  isGenerating,
  onGenerateSingleObjective,
  wizardData = {},
  sectors: propSectors,
  strategicThemes = [],
  isReadOnly = false
}) {
  const { language, t, isRTL } = useLanguage();
  const { sectors, getSectorName, isLoading: isTaxonomyLoading } = useTaxonomy();
  const [activeTab, setActiveTab] = useState('list');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [proposedObjective, setProposedObjective] = useState(null);
  const [differentiationScore, setDifferentiationScore] = useState(null);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [isGeneratingSingle, setIsGeneratingSingle] = useState(false);
  const [targetSector, setTargetSector] = useState('_any');

  const objectives = data.objectives || [];

  // Calculate stats
  const stats = useMemo(() => {
    const highPriority = objectives.filter(o => o.priority === 'high').length;
    const mediumPriority = objectives.filter(o => o.priority === 'medium').length;
    const lowPriority = objectives.filter(o => o.priority === 'low').length;

    const sectorsWithObjectives = new Set(objectives.filter(o => o.sector_code).map(o => o.sector_code)).size;
    const totalSectors = sectors.length;

    // Completeness calculation
    let completedFields = 0;
    let totalFields = 0;

    objectives.forEach(obj => {
      totalFields += 5; // name_en, name_ar, description, sector, priority
      if (obj.name_en) completedFields++;
      if (obj.name_ar) completedFields++;
      if (obj.description_en || obj.description_ar) completedFields++;
      if (obj.sector_code) completedFields++;
      if (obj.priority) completedFields++;
    });

    const completeness = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    return {
      total: objectives.length,
      highPriority,
      mediumPriority,
      lowPriority,
      sectorsWithObjectives,
      totalSectors,
      sectorCoverage: totalSectors > 0 ? Math.round((sectorsWithObjectives / totalSectors) * 100) : 0,
      completeness
    };
  }, [objectives, sectors]);

  // Priority order for sorting
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  // Sort objectives
  const sortedObjectives = useMemo(() => {
    return [...objectives].map((obj, originalIndex) => ({ ...obj, originalIndex }))
      .sort((a, b) => {
        const sectorA = a.sector_code || 'zzz';
        const sectorB = b.sector_code || 'zzz';
        if (sectorA !== sectorB) return sectorA.localeCompare(sectorB);
        return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      });
  }, [objectives]);

  // Group by sector
  const objectivesBySector = useMemo(() => {
    const grouped = {};
    objectives.forEach((obj, index) => {
      const sector = obj.sector_code || '_uncategorized';
      if (!grouped[sector]) grouped[sector] = [];
      grouped[sector].push({ ...obj, originalIndex: index });
    });
    return grouped;
  }, [objectives]);

  // Group by priority
  const objectivesByPriority = useMemo(() => {
    return {
      high: objectives.map((obj, idx) => ({ ...obj, originalIndex: idx })).filter(o => o.priority === 'high'),
      medium: objectives.map((obj, idx) => ({ ...obj, originalIndex: idx })).filter(o => o.priority === 'medium'),
      low: objectives.map((obj, idx) => ({ ...obj, originalIndex: idx })).filter(o => o.priority === 'low' || !o.priority)
    };
  }, [objectives]);

  // Calculate objective completeness
  const getObjectiveCompleteness = (obj) => {
    let filled = 0;
    if (obj.name_en) filled++;
    if (obj.name_ar) filled++;
    if (obj.description_en || obj.description_ar) filled++;
    if (obj.sector_code) filled++;
    if (obj.priority) filled++;
    return Math.round((filled / 5) * 100);
  };

  const addObjective = () => {
    if (isReadOnly) return;
    onChange({
      objectives: [...objectives, {
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        sector_code: '',
        priority: 'medium',
        target_year: data.end_year
      }]
    });
    setExpandedIndex(objectives.length);
  };

  const updateObjective = (index, updates) => {
    if (isReadOnly) return;
    const updated = objectives.map((obj, i) =>
      i === index ? { ...obj, ...updates } : obj
    );
    onChange({ objectives: updated });
  };

  const removeObjective = (index) => {
    if (isReadOnly) return;
    onChange({ objectives: objectives.filter((_, i) => i !== index) });
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-muted';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <Flag className="w-3 h-3 text-red-500" />;
      case 'medium': return <Flag className="w-3 h-3 text-amber-500" />;
      case 'low': return <Flag className="w-3 h-3 text-green-500" />;
      default: return <Flag className="w-3 h-3" />;
    }
  };

  // AI Single Objective Generation
  const handleGenerateSingleObjective = async (sectorOverride = null) => {
    if (isReadOnly) return;
    setIsGeneratingSingle(true);
    setShowProposalModal(true);
    setProposedObjective(null);
    setDifferentiationScore(null);
    setScoreDetails(null);

    try {
      if (onGenerateSingleObjective) {
        const selectedSector = sectorOverride || (targetSector !== '_any' ? targetSector : null);
        const result = await onGenerateSingleObjective(objectives, selectedSector);
        if (result?.objective) {
          setProposedObjective(result.objective);
          setDifferentiationScore(result.differentiation_score || 75);
          if (result.score_details) setScoreDetails(result.score_details);
          if (result.objective.sector_code) setTargetSector(result.objective.sector_code);
        }
      }
    } catch (error) {

    } finally {
      setIsGeneratingSingle(false);
    }
  };

  const handleApproveObjective = () => {
    if (proposedObjective && !isReadOnly) {
      onChange({
        objectives: [...objectives, { ...proposedObjective, target_year: data.end_year }]
      });
      setShowProposalModal(false);
      setProposedObjective(null);
      setExpandedIndex(objectives.length);
    }
  };

  const updateProposedField = (field, value) => {
    setProposedObjective(prev => ({ ...prev, [field]: value }));
  };

  // Render objective card
  const renderObjectiveCard = (obj, displayIndex) => {
    const originalIndex = obj.originalIndex;
    const isOpen = expandedIndex === originalIndex;
    const completeness = getObjectiveCompleteness(obj);

    return (
      <Collapsible key={originalIndex} open={isOpen} onOpenChange={(open) => !isReadOnly && setExpandedIndex(open ? originalIndex : null)}>
        <Card className={cn(
          "transition-all duration-200",
          isOpen && "ring-2 ring-primary",
          obj.priority === 'high' && "border-red-500/30"
        )}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">#{displayIndex + 1}</Badge>
                      {obj.sector_code && (
                        <Badge className="text-xs bg-primary/10 text-primary border-0">
                          {getSectorName(obj.sector_code, language)}
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm mt-1 line-clamp-1">
                      {language === 'ar'
                        ? (obj.name_ar || obj.name_en || t({ en: 'New Objective', ar: 'هدف جديد' }))
                        : (obj.name_en || t({ en: 'New Objective', ar: 'هدف جديد' }))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-xs", getPriorityColor(obj.priority))}>
                    {getPriorityIcon(obj.priority)}
                    <span className="ml-1">{obj.priority || 'medium'}</span>
                  </Badge>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{completeness}%</p>
                    <Progress value={completeness} className="w-16 h-1.5" />
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={cn(obj.name_en && "text-green-600 dark:text-green-400")}>
                    {t({ en: 'Objective Name (English)', ar: 'اسم الهدف (إنجليزي)' })}
                    {obj.name_en && <CheckCircle className="w-3 h-3 inline ml-1" />}
                  </Label>
                  <Input
                    value={obj.name_en || ''}
                    onChange={(e) => updateObjective(originalIndex, { name_en: e.target.value })}
                    placeholder={t({ en: 'Clear, actionable objective', ar: 'هدف واضح وقابل للتنفيذ' })}
                    dir="ltr"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(obj.name_ar && "text-green-600 dark:text-green-400")}>
                    {t({ en: 'Objective Name (Arabic)', ar: 'اسم الهدف (عربي)' })}
                    {obj.name_ar && <CheckCircle className="w-3 h-3 inline ml-1" />}
                  </Label>
                  <Input
                    value={obj.name_ar || ''}
                    onChange={(e) => updateObjective(originalIndex, { name_ar: e.target.value })}
                    dir="rtl"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={cn(obj.description_en && "text-green-600 dark:text-green-400")}>
                    {t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
                    {obj.description_en && <CheckCircle className="w-3 h-3 inline ml-1" />}
                  </Label>
                  <Textarea
                    value={obj.description_en || ''}
                    onChange={(e) => updateObjective(originalIndex, { description_en: e.target.value })}
                    rows={3}
                    dir="ltr"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(obj.description_ar && "text-green-600 dark:text-green-400")}>
                    {t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}
                    {obj.description_ar && <CheckCircle className="w-3 h-3 inline ml-1" />}
                  </Label>
                  <Textarea
                    value={obj.description_ar || ''}
                    onChange={(e) => updateObjective(originalIndex, { description_ar: e.target.value })}
                    rows={3}
                    dir="rtl"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Sector', ar: 'القطاع' })}</Label>
                  <Select
                    value={obj.sector_code || ''}
                    onValueChange={(v) => updateObjective(originalIndex, { sector_code: v })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger><SelectValue placeholder={t({ en: 'Select sector', ar: 'اختر القطاع' })} /></SelectTrigger>
                    <SelectContent>
                      {sectors.map(s => (
                        <SelectItem key={s.code} value={s.code}>
                          {language === 'ar' ? s.name_ar : s.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                  <Select
                    value={obj.priority || 'medium'}
                    onValueChange={(v) => updateObjective(originalIndex, { priority: v })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                      <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                      <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Target Year', ar: 'السنة المستهدفة' })}</Label>
                  <Select
                    value={String(obj.target_year || data.end_year)}
                    onValueChange={(v) => updateObjective(originalIndex, { target_year: parseInt(v) })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => removeObjective(originalIndex)} className="text-destructive hover:text-destructive">
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
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <StepDashboardHeader
        score={stats.completeness}
        title={t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}
        subtitle={`${stats.total} ${t({ en: 'Objectives', ar: 'أهداف' })}`}
        language={language}
        stats={[
          { icon: Flag, value: stats.highPriority, label: t({ en: 'High Priority', ar: 'أولوية عالية' }), iconColor: 'text-red-500' },
          { icon: Flag, value: stats.mediumPriority, label: t({ en: 'Medium Priority', ar: 'أولوية متوسطة' }), iconColor: 'text-amber-500' },
          { icon: Flag, value: stats.lowPriority, label: t({ en: 'Low Priority', ar: 'أولوية منخفضة' }), iconColor: 'text-green-500' },
          { icon: Building2, value: `${stats.sectorCoverage}%`, label: t({ en: 'Sector Coverage', ar: 'تغطية القطاعات' }), subValue: `${stats.sectorsWithObjectives}/${stats.totalSectors}` },
        ]}
        metrics={[
          { label: t({ en: 'Data Quality', ar: 'جودة البيانات' }), value: stats.completeness },
          { label: t({ en: 'Sector Coverage', ar: 'تغطية القطاعات' }), value: stats.sectorCoverage },
          { label: t({ en: 'Priority Balance', ar: 'توازن الأولويات' }), value: stats.total > 0 ? Math.min(100, Math.round((stats.highPriority / Math.max(1, stats.total)) * 100 + 50)) : 0 }
        ]}
      />

      {/* AI Generation Card */}
      {!isReadOnly && (
        <MainAIGeneratorCard
          title={{ en: 'AI-Powered Objectives', ar: 'الأهداف بالذكاء الاصطناعي' }}
          description={{ en: 'Generate sector-specific strategic objectives based on your plan context', ar: 'إنشاء أهداف قطاعية محددة بناءً على سياق خطتك' }}
          onGenerate={onGenerateAI}
          isGenerating={isGenerating}
          onGenerateSingle={() => {
            setTargetSector('_any');
            setShowSectorModal(true);
          }}
          isGeneratingSingle={isGeneratingSingle}
          showSingleButton={!!onGenerateSingleObjective}
          singleButtonLabel={{ en: 'AI Add One', ar: 'إضافة واحد بالذكاء' }}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'List', ar: 'قائمة' })}</span>
            </TabsTrigger>
            <TabsTrigger value="sectors" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'By Sector', ar: 'بالقطاع' })}</span>
            </TabsTrigger>
            <TabsTrigger value="priority" className="gap-2">
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'By Priority', ar: 'بالأولوية' })}</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'AI Analyzer', ar: 'محلل الذكاء' })}</span>
            </TabsTrigger>
          </TabsList>

          {!isReadOnly && (
            <Button onClick={addObjective} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t({ en: 'Add Objective', ar: 'إضافة هدف' })}
            </Button>
          )}
        </div>

        {/* List View */}
        <TabsContent value="list" className="space-y-3 mt-4">
          {objectives.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {t({ en: 'No objectives yet. Use AI generation or add manually.', ar: 'لا توجد أهداف بعد. استخدم الإنشاء بالذكاء الاصطناعي أو أضف يدوياً.' })}
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedObjectives.map((obj, idx) => renderObjectiveCard(obj, idx))
          )}
        </TabsContent>

        {/* By Sector View */}
        <TabsContent value="sectors" className="space-y-4 mt-4">
          {sectors.map(sector => {
            const sectorObjs = objectivesBySector[sector.code] || [];
            if (sectorObjs.length === 0) return null;

            return (
              <Card key={sector.code}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {language === 'ar' ? sector.name_ar : sector.name_en}
                    </CardTitle>
                    <Badge variant="secondary">{sectorObjs.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sectorObjs.map((obj, idx) => (
                    <div
                      key={obj.originalIndex}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => { setActiveTab('list'); setExpandedIndex(obj.originalIndex); }}
                    >
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", getPriorityColor(obj.priority))}>
                          {obj.priority || 'medium'}
                        </Badge>
                        <span className="text-sm">
                          {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={getObjectiveCompleteness(obj)} className="w-16 h-1.5" />
                        <span className="text-xs text-muted-foreground">{getObjectiveCompleteness(obj)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Uncategorized */}
          {objectivesBySector['_uncategorized']?.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  {t({ en: 'Uncategorized', ar: 'غير مصنف' })}
                  <Badge variant="outline">{objectivesBySector['_uncategorized'].length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objectivesBySector['_uncategorized'].map((obj) => (
                  <div
                    key={obj.originalIndex}
                    className="flex items-center justify-between p-3 rounded-lg border border-dashed hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => { setActiveTab('list'); setExpandedIndex(obj.originalIndex); }}
                  >
                    <span className="text-sm">{language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}</span>
                    <Badge variant="outline" className="text-xs">{t({ en: 'Needs Sector', ar: 'يحتاج قطاع' })}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty sectors hint */}
          {Object.keys(objectivesBySector).filter(k => k !== '_uncategorized').length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No objectives assigned to sectors yet', ar: 'لم يتم تعيين أهداف للقطاعات بعد' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* By Priority View */}
        <TabsContent value="priority" className="space-y-4 mt-4">
          {['high', 'medium', 'low'].map(priority => {
            const priorityObjs = objectivesByPriority[priority] || [];
            const colors = {
              high: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400' },
              medium: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400' },
              low: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400' }
            };

            return (
              <Card key={priority} className={cn(colors[priority].bg, colors[priority].border)}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn("text-base flex items-center gap-2", colors[priority].text)}>
                      {getPriorityIcon(priority)}
                      {t({ en: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`, ar: priority === 'high' ? 'أولوية عالية' : priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة' })}
                    </CardTitle>
                    <Badge className={getPriorityColor(priority)}>{priorityObjs.length}</Badge>
                  </div>
                </CardHeader>
                {priorityObjs.length > 0 && (
                  <CardContent className="space-y-2">
                    {priorityObjs.map((obj) => (
                      <div
                        key={obj.originalIndex}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/60 border hover:bg-background cursor-pointer transition-colors"
                        onClick={() => { setActiveTab('list'); setExpandedIndex(obj.originalIndex); }}
                      >
                        <div className="flex items-center gap-2">
                          {obj.sector_code && (
                            <Badge variant="outline" className="text-xs">
                              {getSectorName(obj.sector_code, language)}
                            </Badge>
                          )}
                          <span className="text-sm">{language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{obj.target_year}</span>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* Summary View */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sector Coverage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  {t({ en: 'Sector Coverage', ar: 'تغطية القطاعات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sectors.slice(0, 8).map(sector => {
                    const count = objectives.filter(o => o.sector_code === sector.code).length;
                    const percentage = objectives.length > 0 ? Math.round((count / objectives.length) * 100) : 0;
                    return (
                      <div key={sector.code} className="flex items-center gap-3">
                        <span className="text-xs w-24 truncate">{language === 'ar' ? sector.name_ar : sector.name_en}</span>
                        <Progress value={percentage} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flag className="w-4 h-4 text-primary" />
                  {t({ en: 'Priority Distribution', ar: 'توزيع الأولويات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['high', 'medium', 'low'].map(priority => {
                    const count = objectivesByPriority[priority]?.length || 0;
                    const percentage = objectives.length > 0 ? Math.round((count / objectives.length) * 100) : 0;
                    return (
                      <div key={priority} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {getPriorityIcon(priority)}
                            {t({ en: priority.charAt(0).toUpperCase() + priority.slice(1), ar: priority === 'high' ? 'عالي' : priority === 'medium' ? 'متوسط' : 'منخفض' })}
                          </span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Timeline Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {t({ en: 'Target Year Distribution', ar: 'توزيع السنوات المستهدفة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {[2025, 2026, 2027, 2028, 2029, 2030].map(year => {
                    const count = objectives.filter(o => o.target_year === year).length;
                    const maxCount = Math.max(...[2025, 2026, 2027, 2028, 2029, 2030].map(y => objectives.filter(o => o.target_year === y).length), 1);
                    const height = (count / maxCount) * 100;
                    return (
                      <div key={year} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-primary/20 rounded-t transition-all duration-300"
                          style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                        />
                        <span className="text-xs text-muted-foreground">{year}</span>
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warnings */}
          {(stats.total < 3 || stats.sectorCoverage < 50) && (
            <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  {t({ en: 'Recommendations', ar: 'توصيات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {stats.total < 3 && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      {t({ en: 'Add at least 3 objectives for a comprehensive plan', ar: 'أضف 3 أهداف على الأقل لخطة شاملة' })}
                    </li>
                  )}
                  {stats.sectorCoverage < 50 && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      {t({ en: 'Consider covering more sectors for balanced strategy', ar: 'فكر في تغطية المزيد من القطاعات لاستراتيجية متوازنة' })}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Analyzer Tab */}
        <TabsContent value="analyzer" className="mt-4">
          <AIObjectivesAnalyzer
            objectives={objectives}
            wizardData={wizardData}
            sectors={propSectors || sectors}
            strategicThemes={strategicThemes}
            onApplyRecommendation={(rec) => {
              // Handle applying recommendations if needed

            }}
          />
        </TabsContent>
      </Tabs>

      {/* AI Proposal Modal */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              {t({ en: 'AI Generated Objective', ar: 'هدف مولد بالذكاء الاصطناعي' })}
            </DialogTitle>
          </DialogHeader>

          {isGeneratingSingle ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">{t({ en: 'Generating unique objective...', ar: 'جاري إنشاء هدف فريد...' })}</p>
            </div>
          ) : proposedObjective ? (
            <div className="space-y-4">
              {differentiationScore && (
                <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <span className="text-sm">{t({ en: 'Uniqueness Score', ar: 'درجة التفرد' })}</span>
                  <Badge className={cn(
                    differentiationScore >= 80 ? 'bg-green-100 text-green-700' :
                      differentiationScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  )}>
                    {differentiationScore}%
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}</Label>
                  <Input
                    value={proposedObjective.name_en || ''}
                    onChange={(e) => updateProposedField('name_en', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                  <Input
                    dir="rtl"
                    value={proposedObjective.name_ar || ''}
                    onChange={(e) => updateProposedField('name_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                  <Textarea
                    value={proposedObjective.description_en || ''}
                    onChange={(e) => updateProposedField('description_en', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                  <Textarea
                    dir="rtl"
                    value={proposedObjective.description_ar || ''}
                    onChange={(e) => updateProposedField('description_ar', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Sector', ar: 'القطاع' })}</Label>
                  <Select
                    value={proposedObjective.sector_code || ''}
                    onValueChange={(v) => updateProposedField('sector_code', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sectors.map(s => (
                        <SelectItem key={s.code} value={s.code}>
                          {language === 'ar' ? s.name_ar : s.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                  <Select
                    value={proposedObjective.priority || 'medium'}
                    onValueChange={(v) => updateProposedField('priority', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                      <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                      <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleGenerateSingleObjective()} disabled={isGeneratingSingle}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t({ en: 'Regenerate', ar: 'إعادة الإنشاء' })}
            </Button>
            <Button variant="outline" onClick={() => setShowProposalModal(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleApproveObjective} disabled={!proposedObjective}>
              <Check className="w-4 h-4 mr-2" />
              {t({ en: 'Add Objective', ar: 'إضافة الهدف' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sector Selection Modal */}
      <Dialog open={showSectorModal} onOpenChange={setShowSectorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {t({ en: 'Select Target Sector', ar: 'اختر القطاع المستهدف' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Choose a sector for the AI to generate a unique objective, or let AI decide.', ar: 'اختر قطاعاً للذكاء الاصطناعي لإنشاء هدف فريد، أو دع الذكاء الاصطناعي يقرر.' })}
            </p>

            <div className="space-y-2">
              <Label>{t({ en: 'Sector', ar: 'القطاع' })}</Label>
              <Select value={targetSector} onValueChange={setTargetSector}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select sector...', ar: 'اختر القطاع...' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_any">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      {t({ en: 'Let AI Decide', ar: 'دع الذكاء الاصطناعي يقرر' })}
                    </span>
                  </SelectItem>
                  {sectors.map(s => (
                    <SelectItem key={s.code} value={s.code}>
                      {language === 'ar' ? s.name_ar : s.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSectorModal(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => {
                setShowSectorModal(false);
                handleGenerateSingleObjective(targetSector === '_any' ? null : targetSector);
              }}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {t({ en: 'Generate Objective', ar: 'إنشاء الهدف' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
