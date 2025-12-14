import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useEnvironmentalFactors } from '@/hooks/strategy/useEnvironmentalFactors';
import { 
  Globe, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Building2,
  Scale,
  Leaf,
  Cpu,
  Users,
  DollarSign,
  Sparkles,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

const EnvironmentalScanWidget = ({ strategicPlanId, onSave }) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  // Database integration hook
  const { 
    factors: dbFactors, 
    loading: dbLoading, 
    saving: dbSaving, 
    saveFactor: saveToDb,
    deleteFactor: deleteFromDb 
  } = useEnvironmentalFactors(strategicPlanId);
  
  const pestleCategories = [
    { id: 'political', label: { en: 'Political', ar: 'سياسي' }, icon: Building2, color: 'bg-red-500' },
    { id: 'economic', label: { en: 'Economic', ar: 'اقتصادي' }, icon: DollarSign, color: 'bg-green-500' },
    { id: 'social', label: { en: 'Social', ar: 'اجتماعي' }, icon: Users, color: 'bg-blue-500' },
    { id: 'technological', label: { en: 'Technological', ar: 'تقني' }, icon: Cpu, color: 'bg-purple-500' },
    { id: 'legal', label: { en: 'Legal', ar: 'قانوني' }, icon: Scale, color: 'bg-amber-500' },
    { id: 'environmental', label: { en: 'Environmental', ar: 'بيئي' }, icon: Leaf, color: 'bg-emerald-500' }
  ];

  const [factors, setFactors] = useState([]);

  // Sync with database data when loaded
  useEffect(() => {
    if (dbFactors && !dbLoading && dbFactors.length > 0) {
      setFactors(dbFactors);
    }
  }, [dbFactors, dbLoading]);

  const [editingFactor, setEditingFactor] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    category: 'political',
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    impact_type: 'opportunity',
    impact_level: 'medium',
    trend: 'stable',
    source: ''
  });

  const handleAddFactor = () => {
    setEditingFactor(null);
    setFormData({
      category: 'political',
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      impact_type: 'opportunity',
      impact_level: 'medium',
      trend: 'stable',
      source: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditFactor = (factor) => {
    setEditingFactor(factor);
    setFormData({ ...factor });
    setIsDialogOpen(true);
  };

  const handleSaveFactor = async () => {
    const newFactor = {
      id: editingFactor?.id || `factor-${Date.now()}`,
      ...formData,
      date_identified: editingFactor?.date_identified || new Date().toISOString().split('T')[0]
    };

    // Save to database
    const result = await saveToDb(newFactor);
    if (result) {
      setFactors(prev => {
        const existingIndex = prev.findIndex(f => f.id === result.id);
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

  const handleDeleteFactor = async (id) => {
    const success = await deleteFromDb(id);
    if (success) {
      setFactors(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiFactors = [
      {
        id: `ai-${Date.now()}`,
        category: 'technological',
        title_en: 'Emerging Smart City Standards',
        title_ar: 'معايير المدن الذكية الناشئة',
        description_en: 'New international standards for smart city interoperability being adopted',
        description_ar: 'يتم اعتماد معايير دولية جديدة للتشغيل البيني للمدن الذكية',
        impact_type: 'opportunity',
        impact_level: 'medium',
        trend: 'increasing',
        source: 'AI Analysis',
        date_identified: new Date().toISOString().split('T')[0]
      }
    ];
    
    setFactors(prev => [...prev, ...aiFactors]);
    setIsGenerating(false);
    toast({
      title: t({ en: 'AI Analysis Complete', ar: 'اكتمل تحليل الذكاء الاصطناعي' }),
      description: t({ en: 'New environmental factors identified.', ar: 'تم تحديد عوامل بيئية جديدة.' })
    });
  };

  const filteredFactors = factors.filter(f => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      f.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.title_ar.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const getCategoryStats = () => {
    return pestleCategories.map(cat => ({
      ...cat,
      count: factors.filter(f => f.category === cat.id).length,
      opportunities: factors.filter(f => f.category === cat.id && f.impact_type === 'opportunity').length,
      threats: factors.filter(f => f.category === cat.id && f.impact_type === 'threat').length
    }));
  };

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      factors: factors,
      summary: {
        total: factors.length,
        opportunities: factors.filter(f => f.impact_type === 'opportunity').length,
        threats: factors.filter(f => f.impact_type === 'threat').length,
        byCategory: getCategoryStats()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environmental-scan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast({
      title: t({ en: 'Export Complete', ar: 'اكتمل التصدير' }),
      description: t({ en: 'Environmental scan exported.', ar: 'تم تصدير المسح البيئي.' })
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t({ en: 'Environmental Scan (PESTLE)', ar: 'المسح البيئي (PESTLE)' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Analyze Political, Economic, Social, Technological, Legal, and Environmental factors',
                  ar: 'تحليل العوامل السياسية والاقتصادية والاجتماعية والتقنية والقانونية والبيئية'
                })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAIGenerate} disabled={isGenerating}>
                <Sparkles className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {t({ en: 'AI Analyze', ar: 'تحليل ذكي' })}
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export', ar: 'تصدير' })}
              </Button>
              <Button onClick={handleAddFactor}>
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Factor', ar: 'إضافة عامل' })}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* PESTLE Category Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {getCategoryStats().map(cat => {
          const Icon = cat.icon;
          return (
            <Card 
              key={cat.id} 
              className={`cursor-pointer transition-all ${selectedCategory === cat.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-full ${cat.color} mx-auto mb-2 flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-medium text-sm">{t(cat.label)}</h4>
                <div className="flex justify-center gap-2 mt-1">
                  <span className="text-xs text-green-600">{cat.opportunities} ↑</span>
                  <span className="text-xs text-red-600">{cat.threats} ↓</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t({ en: 'Search factors...', ar: 'البحث في العوامل...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t({ en: 'All Categories', ar: 'جميع الفئات' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t({ en: 'All Categories', ar: 'جميع الفئات' })}</SelectItem>
            {pestleCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{t(cat.label)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Factors List */}
      <div className="grid gap-4">
        {filteredFactors.map(factor => {
          const category = pestleCategories.find(c => c.id === factor.category);
          const Icon = category?.icon || Globe;
          
          return (
            <Card key={factor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${category?.color || 'bg-gray-500'} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{isRTL ? factor.title_ar : factor.title_en}</h4>
                      <Badge variant={factor.impact_type === 'opportunity' ? 'default' : 'destructive'}>
                        {factor.impact_type === 'opportunity' ? (
                          <><Lightbulb className="h-3 w-3 mr-1" />{t({ en: 'Opportunity', ar: 'فرصة' })}</>
                        ) : (
                          <><AlertTriangle className="h-3 w-3 mr-1" />{t({ en: 'Threat', ar: 'تهديد' })}</>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {factor.impact_level === 'high' ? t({ en: 'High Impact', ar: 'تأثير عالي' }) :
                         factor.impact_level === 'medium' ? t({ en: 'Medium Impact', ar: 'تأثير متوسط' }) :
                         t({ en: 'Low Impact', ar: 'تأثير منخفض' })}
                      </Badge>
                      {factor.trend === 'increasing' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {factor.trend === 'decreasing' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {isRTL ? factor.description_ar : factor.description_en}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{t({ en: 'Source:', ar: 'المصدر:' })} {factor.source}</span>
                      <span>{t({ en: 'Identified:', ar: 'تاريخ التحديد:' })} {factor.date_identified}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditFactor(factor)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteFactor(factor.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFactor 
                ? t({ en: 'Edit Environmental Factor', ar: 'تعديل العامل البيئي' })
                : t({ en: 'Add Environmental Factor', ar: 'إضافة عامل بيئي' })
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pestleCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{t(cat.label)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Impact Type', ar: 'نوع التأثير' })}</Label>
                <Select value={formData.impact_type} onValueChange={(v) => setFormData({ ...formData, impact_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunity">{t({ en: 'Opportunity', ar: 'فرصة' })}</SelectItem>
                    <SelectItem value="threat">{t({ en: 'Threat', ar: 'تهديد' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                dir="rtl"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Impact Level', ar: 'مستوى التأثير' })}</Label>
                <Select value={formData.impact_level} onValueChange={(v) => setFormData({ ...formData, impact_level: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                    <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                    <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Trend', ar: 'الاتجاه' })}</Label>
                <Select value={formData.trend} onValueChange={(v) => setFormData({ ...formData, trend: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increasing">{t({ en: 'Increasing', ar: 'متزايد' })}</SelectItem>
                    <SelectItem value="stable">{t({ en: 'Stable', ar: 'مستقر' })}</SelectItem>
                    <SelectItem value="decreasing">{t({ en: 'Decreasing', ar: 'متناقص' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Source', ar: 'المصدر' })}</Label>
                <Input
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSaveFactor}>
              <Save className="h-4 w-4 mr-2" />
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnvironmentalScanWidget;
