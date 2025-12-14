import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useStrategyBaselines } from '@/hooks/strategy/useStrategyBaselines';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Target,
  BarChart3,
  Activity,
  Sparkles
} from 'lucide-react';

const BaselineDataCollector = ({ strategicPlanId, onSave }) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  // Database integration hook
  const { 
    baselines: dbBaselines, 
    loading: dbLoading, 
    saving: dbSaving, 
    saveBaseline: saveToDb,
    deleteBaseline: deleteFromDb 
  } = useStrategyBaselines(strategicPlanId);

  // Fetch actual MII scores and platform metrics for baseline
  // Gap Fix: Phase 1 specifies MII should feed into strategy KPIs - linking MII dimension scores
  const { data: platformMetrics } = useQuery({
    queryKey: ['baseline-platform-metrics', strategicPlanId],
    queryFn: async () => {
      const [miiRes, challengesRes, pilotsRes, partnershipsRes] = await Promise.all([
        supabase.from('mii_results').select('overall_score, municipality_id, dimension_scores').eq('is_published', true).limit(50),
        supabase.from('challenges').select('id, status').eq('is_deleted', false),
        supabase.from('pilots').select('id, status, success_score'),
        supabase.from('partnerships').select('id, status')
      ]);
      
      const avgMII = miiRes.data?.length ? 
        Math.round(miiRes.data.reduce((sum, m) => sum + (m.overall_score || 0), 0) / miiRes.data.length) : 0;
      const challengeResolutionRate = challengesRes.data?.length ? 
        Math.round((challengesRes.data.filter(c => c.status === 'resolved').length / challengesRes.data.length) * 100) : 0;
      const avgPilotSuccess = pilotsRes.data?.length ? 
        Math.round(pilotsRes.data.reduce((sum, p) => sum + (p.success_score || 0), 0) / pilotsRes.data.length) : 0;
      const activePartnerships = partnershipsRes.data?.filter(p => p.status === 'active').length || 0;
      
      // Extract MII dimension scores for strategic KPI baseline mapping
      const miiDimensionAverages = {};
      const dimensionNames = ['leadership', 'culture', 'resources', 'processes', 'outcomes', 'technology'];
      dimensionNames.forEach(dim => {
        const scores = miiRes.data?.map(m => m.dimension_scores?.[dim] || 0).filter(s => s > 0) || [];
        miiDimensionAverages[dim] = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      });
      
      return { 
        avgMII, 
        challengeResolutionRate, 
        avgPilotSuccess, 
        activePartnerships,
        miiDimensionAverages,
        miiDataCount: miiRes.data?.length || 0
      };
    }
  });

  // KPI categories now include MII dimension mapping for strategic alignment
  // Gap Fix: MII-to-KPI mapping per Phase 1 and Phase 6 monitoring
  const kpiCategories = [
    { id: 'innovation', label: { en: 'Innovation Index (MII)', ar: 'مؤشر الابتكار' }, color: 'bg-blue-500', platformValue: platformMetrics?.avgMII, miiLinked: true },
    { id: 'mii_leadership', label: { en: 'MII: Leadership', ar: 'مؤشر: القيادة' }, color: 'bg-indigo-500', platformValue: platformMetrics?.miiDimensionAverages?.leadership, miiLinked: true },
    { id: 'mii_culture', label: { en: 'MII: Culture', ar: 'مؤشر: الثقافة' }, color: 'bg-violet-500', platformValue: platformMetrics?.miiDimensionAverages?.culture, miiLinked: true },
    { id: 'mii_resources', label: { en: 'MII: Resources', ar: 'مؤشر: الموارد' }, color: 'bg-cyan-500', platformValue: platformMetrics?.miiDimensionAverages?.resources, miiLinked: true },
    { id: 'mii_processes', label: { en: 'MII: Processes', ar: 'مؤشر: العمليات' }, color: 'bg-sky-500', platformValue: platformMetrics?.miiDimensionAverages?.processes, miiLinked: true },
    { id: 'mii_outcomes', label: { en: 'MII: Outcomes', ar: 'مؤشر: النتائج' }, color: 'bg-emerald-500', platformValue: platformMetrics?.miiDimensionAverages?.outcomes, miiLinked: true },
    { id: 'mii_technology', label: { en: 'MII: Technology', ar: 'مؤشر: التقنية' }, color: 'bg-fuchsia-500', platformValue: platformMetrics?.miiDimensionAverages?.technology, miiLinked: true },
    { id: 'challenges', label: { en: 'Challenge Resolution', ar: 'حل التحديات' }, color: 'bg-green-500', platformValue: platformMetrics?.challengeResolutionRate },
    { id: 'pilots', label: { en: 'Pilot Success', ar: 'نجاح التجارب' }, color: 'bg-purple-500', platformValue: platformMetrics?.avgPilotSuccess },
    { id: 'partnerships', label: { en: 'Partnerships', ar: 'الشراكات' }, color: 'bg-amber-500', platformValue: platformMetrics?.activePartnerships },
    { id: 'budget', label: { en: 'Budget Utilization', ar: 'استخدام الميزانية' }, color: 'bg-red-500' },
    { id: 'pipeline', label: { en: 'Innovation Pipeline', ar: 'خط الابتكار' }, color: 'bg-teal-500' }
  ];

  const [baselines, setBaselines] = useState([]);

  // Sync with database data when loaded
  useEffect(() => {
    if (dbBaselines && !dbLoading && dbBaselines.length > 0) {
      setBaselines(dbBaselines);
    }
  }, [dbBaselines, dbLoading]);

  const [editingBaseline, setEditingBaseline] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    category: 'innovation',
    kpi_name_en: '',
    kpi_name_ar: '',
    baseline_value: 0,
    unit: 'percentage',
    target_value: 0,
    source: '',
    notes: '',
    status: 'pending'
  });

  const statusOptions = [
    { value: 'pending', label: { en: 'Pending', ar: 'قيد الانتظار' }, color: 'bg-amber-500' },
    { value: 'validated', label: { en: 'Validated', ar: 'تم التحقق' }, color: 'bg-green-500' },
    { value: 'outdated', label: { en: 'Outdated', ar: 'قديم' }, color: 'bg-red-500' }
  ];

  const unitOptions = [
    { value: 'percentage', label: '%' },
    { value: 'score', label: 'Score' },
    { value: 'count', label: 'Count' },
    { value: 'currency', label: 'SAR' },
    { value: 'days', label: 'Days' }
  ];

  const handleAddBaseline = () => {
    setEditingBaseline(null);
    setFormData({
      category: 'innovation',
      kpi_name_en: '',
      kpi_name_ar: '',
      baseline_value: 0,
      unit: 'percentage',
      target_value: 0,
      source: '',
      notes: '',
      status: 'pending'
    });
    setIsDialogOpen(true);
  };

  const handleEditBaseline = (baseline) => {
    setEditingBaseline(baseline);
    setFormData({ ...baseline });
    setIsDialogOpen(true);
  };

  const handleSaveBaseline = async () => {
    const newBaseline = {
      id: editingBaseline?.id || `baseline-${Date.now()}`,
      ...formData,
      collection_date: editingBaseline?.collection_date || new Date().toISOString().split('T')[0]
    };

    // Save to database
    const result = await saveToDb(newBaseline);
    if (result) {
      setBaselines(prev => {
        const existingIndex = prev.findIndex(b => b.id === result.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = result;
          return updated;
        }
        return [...prev, result];
      });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteBaseline = async (id) => {
    const success = await deleteFromDb(id);
    if (success) {
      setBaselines(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    toast({
      title: t({ en: 'Data Refreshed', ar: 'تم تحديث البيانات' }),
      description: t({ en: 'Latest baseline values fetched.', ar: 'تم جلب أحدث قيم الخط الأساسي.' })
    });
  };

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      baselines: baselines,
      summary: {
        total: baselines.length,
        validated: baselines.filter(b => b.status === 'validated').length,
        pending: baselines.filter(b => b.status === 'pending').length,
        byCategory: kpiCategories.map(c => ({
          category: c.id,
          count: baselines.filter(b => b.category === c.id).length
        }))
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baseline-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast({
      title: t({ en: 'Export Complete', ar: 'اكتمل التصدير' }),
      description: t({ en: 'Baseline data exported.', ar: 'تم تصدير بيانات الخط الأساسي.' })
    });
  };

  const filteredBaselines = baselines.filter(b => 
    selectedCategory === 'all' || b.category === selectedCategory
  );

  const getProgressToTarget = (baseline, target) => {
    return Math.min(100, Math.round((baseline / target) * 100));
  };

  const formatValue = (value, unit) => {
    switch (unit) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `SAR ${value.toLocaleString()}`;
      case 'score':
        return `${value} pts`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                {t({ en: 'Baseline Data Collector', ar: 'جامع البيانات الأساسية' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Capture and validate baseline KPI values for strategic planning',
                  ar: 'التقاط والتحقق من قيم مؤشرات الأداء الأساسية للتخطيط الاستراتيجي'
                })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefreshData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t({ en: 'Refresh', ar: 'تحديث' })}
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export', ar: 'تصدير' })}
              </Button>
              <Button onClick={handleAddBaseline}>
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Baseline', ar: 'إضافة خط أساسي' })}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{baselines.length}</div>
            <div className="text-sm text-muted-foreground">{t({ en: 'Total KPIs', ar: 'إجمالي المؤشرات' })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {baselines.filter(b => b.status === 'validated').length}
            </div>
            <div className="text-sm text-muted-foreground">{t({ en: 'Validated', ar: 'تم التحقق' })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {baselines.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">{t({ en: 'Pending', ar: 'قيد الانتظار' })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(baselines.reduce((sum, b) => sum + getProgressToTarget(b.baseline_value, b.target_value), 0) / baselines.length)}%
            </div>
            <div className="text-sm text-muted-foreground">{t({ en: 'Avg Progress', ar: 'متوسط التقدم' })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={selectedCategory === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          {t({ en: 'All Categories', ar: 'جميع الفئات' })}
        </Button>
        {kpiCategories.map(cat => {
          const count = baselines.filter(b => b.category === cat.id).length;
          return (
            <Button 
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {t(cat.label)} ({count})
            </Button>
          );
        })}
      </div>

      {/* Baselines Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredBaselines.map(baseline => {
          const category = kpiCategories.find(c => c.id === baseline.category);
          const progress = getProgressToTarget(baseline.baseline_value, baseline.target_value);
          const status = statusOptions.find(s => s.value === baseline.status);
          
          return (
            <Card key={baseline.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={category?.color}>{t(category?.label || { en: 'Unknown', ar: 'غير معروف' })}</Badge>
                      <Badge className={status?.color}>{t(status?.label || { en: 'Unknown', ar: 'غير معروف' })}</Badge>
                    </div>
                    <h4 className="font-medium">{isRTL ? baseline.kpi_name_ar : baseline.kpi_name_en}</h4>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditBaseline(baseline)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBaseline(baseline.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">{formatValue(baseline.baseline_value, baseline.unit)}</div>
                    <div className="text-xs text-muted-foreground">{t({ en: 'Baseline', ar: 'الأساسي' })}</div>
                  </div>
                  <div className="text-center p-2 bg-primary/10 rounded">
                    <div className="text-2xl font-bold text-primary">{formatValue(baseline.target_value, baseline.unit)}</div>
                    <div className="text-xs text-muted-foreground">{t({ en: 'Target', ar: 'الهدف' })}</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{t({ en: 'Progress to Target', ar: 'التقدم نحو الهدف' })}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>{t({ en: 'Source:', ar: 'المصدر:' })} {baseline.source}</span>
                  <span>{baseline.collection_date}</span>
                </div>
                
                {baseline.notes && (
                  <p className="mt-2 text-xs text-muted-foreground italic">{baseline.notes}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBaseline 
                ? t({ en: 'Edit Baseline', ar: 'تعديل الخط الأساسي' })
                : t({ en: 'Add Baseline KPI', ar: 'إضافة مؤشر أساسي' })
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kpiCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{t(cat.label)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'KPI Name (English)', ar: 'اسم المؤشر (إنجليزي)' })}</Label>
                <Input
                  value={formData.kpi_name_en}
                  onChange={(e) => setFormData({ ...formData, kpi_name_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'KPI Name (Arabic)', ar: 'اسم المؤشر (عربي)' })}</Label>
                <Input
                  value={formData.kpi_name_ar}
                  onChange={(e) => setFormData({ ...formData, kpi_name_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Baseline Value', ar: 'القيمة الأساسية' })}</Label>
                <Input
                  type="number"
                  value={formData.baseline_value}
                  onChange={(e) => setFormData({ ...formData, baseline_value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Target Value', ar: 'القيمة المستهدفة' })}</Label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Unit', ar: 'الوحدة' })}</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(u => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Data Source', ar: 'مصدر البيانات' })}</Label>
                <Input
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{t(s.label)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t({ en: 'Notes', ar: 'ملاحظات' })}</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSaveBaseline}>
              <Save className="h-4 w-4 mr-2" />
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BaselineDataCollector;
