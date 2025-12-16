import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useSectorStrategies } from '@/hooks/strategy';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import {
  Layers,
  Plus,
  Trash2,
  Save,
  Target,
  BarChart3,
  Building2,
  Sparkles,
  Loader2,
  ChevronRight,
  Eye,
  Edit,
  CheckCircle2
} from 'lucide-react';

const SECTOR_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-amber-500', 'bg-red-500', 'bg-indigo-500'];

const SectorStrategyBuilder = ({ parentPlan, onSave }) => {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const strategicPlanId = parentPlan?.id;
  
  const {
    strategies: dbStrategies,
    isLoading,
    saveStrategy,
    saveBulkStrategies,
    deleteStrategy
  } = useSectorStrategies(strategicPlanId);

  // Use TaxonomyContext for sectors (cached globally)
  const { sectors: taxonomySectors, isLoading: taxonomyLoading } = useTaxonomy();
  
  // Add colors to sectors from taxonomy
  const SECTORS = taxonomySectors.map((s, idx) => ({
    ...s,
    color: SECTOR_COLORS[idx % SECTOR_COLORS.length]
  }));
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'

  const [sectorStrategies, setSectorStrategies] = useState([]);
  
  useEffect(() => {
    if (dbStrategies && dbStrategies.length > 0) {
      setSectorStrategies(dbStrategies);
    }
  }, [dbStrategies]);

  const createSectorStrategy = async (sectorId) => {
    const sector = SECTORS.find(s => s.id === sectorId);
    if (!sector) return;

    const newStrategy = {
      id: `ss-${Date.now()}`,
      sector_id: sectorId,
      sector_name_en: sector.name_en,
      sector_name_ar: sector.name_ar,
      sector_color: sector.color,
      name_en: `${sector.name_en} Innovation Strategy`,
      name_ar: `استراتيجية ابتكار ${sector.name_ar}`,
      vision_en: '',
      vision_ar: '',
      objectives: [],
      kpis: [],
      status: 'draft',
      owner_email: '',
      created_at: new Date().toISOString()
    };

    setSectorStrategies(prev => [...prev, newStrategy]);
    setSelectedSector(newStrategy.id);
    setViewMode('detail');
  };

  const updateStrategy = (strategyId, field, value) => {
    setSectorStrategies(prev => prev.map(s =>
      s.id === strategyId ? { ...s, [field]: value } : s
    ));
  };

  const addObjective = (strategyId) => {
    setSectorStrategies(prev => prev.map(s => {
      if (s.id !== strategyId) return s;
      return {
        ...s,
        objectives: [
          ...s.objectives,
          {
            id: `obj-${Date.now()}`,
            title_en: '',
            title_ar: '',
            description: '',
            target_value: 0,
            current_value: 0,
            unit: '%'
          }
        ]
      };
    }));
  };

  const updateObjective = (strategyId, objectiveId, field, value) => {
    setSectorStrategies(prev => prev.map(s => {
      if (s.id !== strategyId) return s;
      return {
        ...s,
        objectives: s.objectives.map(o =>
          o.id === objectiveId ? { ...o, [field]: value } : o
        )
      };
    }));
  };

  const removeObjective = (strategyId, objectiveId) => {
    setSectorStrategies(prev => prev.map(s => {
      if (s.id !== strategyId) return s;
      return {
        ...s,
        objectives: s.objectives.filter(o => o.id !== objectiveId)
      };
    }));
  };

  const addKPI = (strategyId) => {
    setSectorStrategies(prev => prev.map(s => {
      if (s.id !== strategyId) return s;
      return {
        ...s,
        kpis: [
          ...s.kpis,
          {
            id: `kpi-${Date.now()}`,
            name_en: '',
            name_ar: '',
            baseline: 0,
            target: 0,
            current: 0,
            unit: '%',
            frequency: 'quarterly'
          }
        ]
      };
    }));
  };

  const updateKPI = (strategyId, kpiId, field, value) => {
    setSectorStrategies(prev => prev.map(s => {
      if (s.id !== strategyId) return s;
      return {
        ...s,
        kpis: s.kpis.map(k =>
          k.id === kpiId ? { ...k, [field]: value } : k
        )
      };
    }));
  };

  const removeKPI = (strategyId, kpiId) => {
    setSectorStrategies(prev => prev.map(s => {
      if (s.id !== strategyId) return s;
      return {
        ...s,
        kpis: s.kpis.filter(k => k.id !== kpiId)
      };
    }));
  };

  const generateWithAI = async (strategyId) => {
    setIsGenerating(true);
    try {
      const strategy = sectorStrategies.find(s => s.id === strategyId);
      
      const { data, error } = await supabase.functions.invoke('strategy-sector-generator', {
        body: {
          sector_id: strategy.sector_id,
          sector_name_en: strategy.sector_name_en,
          sector_name_ar: strategy.sector_name_ar,
          strategic_plan_id: strategicPlanId,
          plan_vision: parentPlan?.vision_en,
          plan_objectives: parentPlan?.objectives
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      const { sector_strategy } = data;

      setSectorStrategies(prev => prev.map(s => {
        if (s.id !== strategyId) return s;
        return {
          ...s,
          vision_en: sector_strategy.vision_en,
          vision_ar: sector_strategy.vision_ar,
          objectives: [...s.objectives, ...sector_strategy.objectives],
          kpis: [...s.kpis, ...sector_strategy.kpis]
        };
      }));

      toast({
        title: t({ en: 'Content Generated', ar: 'تم إنشاء المحتوى' }),
        description: t({ en: 'AI has generated vision, objectives, and KPIs', ar: 'أنشأ الذكاء الاصطناعي الرؤية والأهداف ومؤشرات الأداء' })
      });
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      const success = await saveBulkStrategies(sectorStrategies);
      if (success && onSave) onSave(sectorStrategies);
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const currentStrategy = sectorStrategies.find(s => s.id === selectedSector);
  const availableSectors = SECTORS.filter(s => !sectorStrategies.some(ss => ss.sector_id === s.id));

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-900">
                  {t({ en: 'Sector Strategy Builder', ar: 'منشئ استراتيجية القطاع' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Create sector-specific sub-strategies aligned to the parent plan', ar: 'إنشاء استراتيجيات فرعية خاصة بالقطاع متوافقة مع الخطة الأم' })}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {viewMode === 'detail' && (
                <Button variant="outline" onClick={() => setViewMode('list')}>
                  <Eye className="h-4 w-4 mr-2" />
                  {t({ en: 'View All', ar: 'عرض الكل' })}
                </Button>
              )}
              <Button onClick={handleSave} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {t({ en: 'Save All', ar: 'حفظ الكل' })}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {viewMode === 'list' && (
        <>
          {/* Sector Selection */}
          {availableSectors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t({ en: 'Add Sector Strategy', ar: 'إضافة استراتيجية قطاع' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {availableSectors.map(sector => (
                    <Button
                      key={sector.id}
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => createSectorStrategy(sector.id)}
                    >
                      <div className={`w-8 h-8 rounded-full ${sector.color} flex items-center justify-center`}>
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium">
                        {language === 'ar' ? sector.name_ar : sector.name_en}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorStrategies.map(strategy => (
              <Card 
                key={strategy.id}
                className="cursor-pointer hover:shadow-md transition-all border-2"
                onClick={() => { setSelectedSector(strategy.id); setViewMode('detail'); }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${strategy.sector_color}`}>
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {language === 'ar' ? strategy.sector_name_ar : strategy.sector_name_en}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {strategy.status}
                      </Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>{t({ en: 'Objectives', ar: 'الأهداف' })}</span>
                      <span className="font-medium">{strategy.objectives.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t({ en: 'KPIs', ar: 'مؤشرات الأداء' })}</span>
                      <span className="font-medium">{strategy.kpis.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sectorStrategies.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="pt-8 pb-8 text-center">
                  <Layers className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="font-medium text-slate-700 mb-2">
                    {t({ en: 'No Sector Strategies Yet', ar: 'لا توجد استراتيجيات قطاعات بعد' })}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {t({ en: 'Select a sector above to create a sub-strategy', ar: 'اختر قطاعاً أعلاه لإنشاء استراتيجية فرعية' })}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {viewMode === 'detail' && currentStrategy && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentStrategy.sector_color}`}>
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    {language === 'ar' ? currentStrategy.sector_name_ar : currentStrategy.sector_name_en}
                  </CardTitle>
                  <CardDescription>
                    {t({ en: 'Sector Strategy', ar: 'استراتيجية القطاع' })}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => generateWithAI(currentStrategy.id)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                )}
                {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Vision (English)', ar: 'الرؤية (إنجليزي)' })}</Label>
                <Textarea
                  value={currentStrategy.vision_en}
                  onChange={(e) => updateStrategy(currentStrategy.id, 'vision_en', e.target.value)}
                  placeholder={t({ en: 'Enter sector vision...', ar: 'أدخل رؤية القطاع...' })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Vision (Arabic)', ar: 'الرؤية (عربي)' })}</Label>
                <Textarea
                  value={currentStrategy.vision_ar}
                  onChange={(e) => updateStrategy(currentStrategy.id, 'vision_ar', e.target.value)}
                  placeholder={t({ en: 'Enter Arabic vision...', ar: 'أدخل الرؤية بالعربية...' })}
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Objectives */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {t({ en: 'Sector Objectives', ar: 'أهداف القطاع' })}
                </h3>
                <Button variant="outline" size="sm" onClick={() => addObjective(currentStrategy.id)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t({ en: 'Add', ar: 'إضافة' })}
                </Button>
              </div>
              {currentStrategy.objectives.map((objective, index) => (
                <div key={objective.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeObjective(currentStrategy.id, objective.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
                      <Input
                        value={objective.title_en}
                        onChange={(e) => updateObjective(currentStrategy.id, objective.id, 'title_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                      <Input
                        value={objective.title_ar}
                        onChange={(e) => updateObjective(currentStrategy.id, objective.id, 'title_ar', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Current', ar: 'الحالي' })}</Label>
                      <Input
                        type="number"
                        value={objective.current_value}
                        onChange={(e) => updateObjective(currentStrategy.id, objective.id, 'current_value', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Target', ar: 'المستهدف' })}</Label>
                      <Input
                        type="number"
                        value={objective.target_value}
                        onChange={(e) => updateObjective(currentStrategy.id, objective.id, 'target_value', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Unit', ar: 'الوحدة' })}</Label>
                      <Input
                        value={objective.unit}
                        onChange={(e) => updateObjective(currentStrategy.id, objective.id, 'unit', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* KPIs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {t({ en: 'Sector KPIs', ar: 'مؤشرات أداء القطاع' })}
                </h3>
                <Button variant="outline" size="sm" onClick={() => addKPI(currentStrategy.id)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t({ en: 'Add', ar: 'إضافة' })}
                </Button>
              </div>
              {currentStrategy.kpis.map((kpi, index) => (
                <div key={kpi.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">KPI #{index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKPI(currentStrategy.id, kpi.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}</Label>
                      <Input
                        value={kpi.name_en}
                        onChange={(e) => updateKPI(currentStrategy.id, kpi.id, 'name_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                      <Input
                        value={kpi.name_ar}
                        onChange={(e) => updateKPI(currentStrategy.id, kpi.id, 'name_ar', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Baseline', ar: 'خط الأساس' })}</Label>
                      <Input
                        type="number"
                        value={kpi.baseline}
                        onChange={(e) => updateKPI(currentStrategy.id, kpi.id, 'baseline', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Current', ar: 'الحالي' })}</Label>
                      <Input
                        type="number"
                        value={kpi.current}
                        onChange={(e) => updateKPI(currentStrategy.id, kpi.id, 'current', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Target', ar: 'المستهدف' })}</Label>
                      <Input
                        type="number"
                        value={kpi.target}
                        onChange={(e) => updateKPI(currentStrategy.id, kpi.id, 'target', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Frequency', ar: 'التكرار' })}</Label>
                      <Select
                        value={kpi.frequency}
                        onValueChange={(val) => updateKPI(currentStrategy.id, kpi.id, 'frequency', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{t({ en: 'Monthly', ar: 'شهري' })}</SelectItem>
                          <SelectItem value="quarterly">{t({ en: 'Quarterly', ar: 'ربع سنوي' })}</SelectItem>
                          <SelectItem value="annually">{t({ en: 'Annually', ar: 'سنوي' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{t({ en: 'Progress', ar: 'التقدم' })}</span>
                      <span>{Math.round(((kpi.current - kpi.baseline) / (kpi.target - kpi.baseline)) * 100) || 0}%</span>
                    </div>
                    <Progress 
                      value={Math.min(100, Math.max(0, ((kpi.current - kpi.baseline) / (kpi.target - kpi.baseline)) * 100)) || 0}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SectorStrategyBuilder;
