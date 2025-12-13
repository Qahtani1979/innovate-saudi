import React, { useState } from 'react';
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

const BaselineDataCollector = ({ onSave }) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();

  const kpiCategories = [
    { id: 'innovation', label: { en: 'Innovation Index', ar: 'مؤشر الابتكار' }, color: 'bg-blue-500' },
    { id: 'challenges', label: { en: 'Challenge Resolution', ar: 'حل التحديات' }, color: 'bg-green-500' },
    { id: 'pilots', label: { en: 'Pilot Success', ar: 'نجاح التجارب' }, color: 'bg-purple-500' },
    { id: 'partnerships', label: { en: 'Partnerships', ar: 'الشراكات' }, color: 'bg-amber-500' },
    { id: 'budget', label: { en: 'Budget Utilization', ar: 'استخدام الميزانية' }, color: 'bg-red-500' },
    { id: 'pipeline', label: { en: 'Innovation Pipeline', ar: 'خط الابتكار' }, color: 'bg-teal-500' }
  ];

  const [baselines, setBaselines] = useState([
    {
      id: '1',
      category: 'innovation',
      kpi_name_en: 'National MII Average Score',
      kpi_name_ar: 'متوسط درجة مؤشر الابتكار البلدي',
      baseline_value: 68.5,
      unit: 'score',
      target_value: 85,
      collection_date: '2024-01-01',
      source: 'MII Dashboard',
      status: 'validated',
      notes: 'Based on Q4 2023 assessment'
    },
    {
      id: '2',
      category: 'challenges',
      kpi_name_en: 'Challenge Resolution Rate',
      kpi_name_ar: 'معدل حل التحديات',
      baseline_value: 42,
      unit: 'percentage',
      target_value: 75,
      collection_date: '2024-01-01',
      source: 'Challenge Registry',
      status: 'validated',
      notes: 'Challenges resolved within target timeframe'
    },
    {
      id: '3',
      category: 'pilots',
      kpi_name_en: 'Pilot to Scale Conversion',
      kpi_name_ar: 'تحويل التجارب إلى توسع',
      baseline_value: 28,
      unit: 'percentage',
      target_value: 50,
      collection_date: '2024-01-01',
      source: 'Pilot Management System',
      status: 'validated',
      notes: 'Pilots successfully scaled to full implementation'
    },
    {
      id: '4',
      category: 'partnerships',
      kpi_name_en: 'Active Strategic Partnerships',
      kpi_name_ar: 'الشراكات الاستراتيجية النشطة',
      baseline_value: 45,
      unit: 'count',
      target_value: 80,
      collection_date: '2024-01-01',
      source: 'Partnership Registry',
      status: 'validated',
      notes: 'Partnerships with defined deliverables'
    },
    {
      id: '5',
      category: 'budget',
      kpi_name_en: 'Innovation Budget Utilization',
      kpi_name_ar: 'استخدام ميزانية الابتكار',
      baseline_value: 72,
      unit: 'percentage',
      target_value: 90,
      collection_date: '2024-01-01',
      source: 'Finance System',
      status: 'pending',
      notes: 'Awaiting final Q4 reconciliation'
    },
    {
      id: '6',
      category: 'pipeline',
      kpi_name_en: 'Active Challenges in Pipeline',
      kpi_name_ar: 'التحديات النشطة في خط الأنابيب',
      baseline_value: 156,
      unit: 'count',
      target_value: 200,
      collection_date: '2024-01-01',
      source: 'Challenge Registry',
      status: 'validated',
      notes: 'Challenges in active processing stages'
    }
  ]);

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

  const handleSaveBaseline = () => {
    const newBaseline = {
      id: editingBaseline?.id || `baseline-${Date.now()}`,
      ...formData,
      collection_date: editingBaseline?.collection_date || new Date().toISOString().split('T')[0]
    };

    if (editingBaseline) {
      setBaselines(prev => prev.map(b => b.id === editingBaseline.id ? newBaseline : b));
      toast({
        title: t({ en: 'Baseline Updated', ar: 'تم تحديث الخط الأساسي' }),
        description: t({ en: 'Baseline data updated successfully.', ar: 'تم تحديث بيانات الخط الأساسي بنجاح.' })
      });
    } else {
      setBaselines(prev => [...prev, newBaseline]);
      toast({
        title: t({ en: 'Baseline Added', ar: 'تمت إضافة الخط الأساسي' }),
        description: t({ en: 'New baseline data collected.', ar: 'تم جمع بيانات خط أساسي جديدة.' })
      });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteBaseline = (id) => {
    setBaselines(prev => prev.filter(b => b.id !== id));
    toast({
      title: t({ en: 'Baseline Deleted', ar: 'تم حذف الخط الأساسي' }),
      description: t({ en: 'Baseline data removed.', ar: 'تم إزالة بيانات الخط الأساسي.' })
    });
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
