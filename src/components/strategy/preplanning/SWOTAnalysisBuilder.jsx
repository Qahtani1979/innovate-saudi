import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Save,
  Shield,
  AlertTriangle,
  TrendingUp,
  Target,
  Loader2,
  GripVertical,
  Edit2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// SWOT Category Configuration
const SWOT_CATEGORIES = {
  strengths: {
    key: 'strengths',
    icon: Shield,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    labelEn: 'Strengths',
    labelAr: 'نقاط القوة',
    descEn: 'Internal capabilities and advantages',
    descAr: 'القدرات والمميزات الداخلية'
  },
  weaknesses: {
    key: 'weaknesses',
    icon: AlertTriangle,
    color: 'bg-rose-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    labelEn: 'Weaknesses',
    labelAr: 'نقاط الضعف',
    descEn: 'Internal limitations and challenges',
    descAr: 'القيود والتحديات الداخلية'
  },
  opportunities: {
    key: 'opportunities',
    icon: TrendingUp,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    labelEn: 'Opportunities',
    labelAr: 'الفرص',
    descEn: 'External factors to leverage',
    descAr: 'العوامل الخارجية للاستفادة منها'
  },
  threats: {
    key: 'threats',
    icon: Target,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    labelEn: 'Threats',
    labelAr: 'التهديدات',
    descEn: 'External risks and challenges',
    descAr: 'المخاطر والتحديات الخارجية'
  }
};

// Priority levels
const PRIORITY_LEVELS = [
  { value: 'high', labelEn: 'High', labelAr: 'عالية', color: 'bg-red-100 text-red-700' },
  { value: 'medium', labelEn: 'Medium', labelAr: 'متوسطة', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'low', labelEn: 'Low', labelAr: 'منخفضة', color: 'bg-green-100 text-green-700' }
];

// SWOT Item Component
function SWOTItem({ item, category, onEdit, onDelete, language, t }) {
  const config = SWOT_CATEGORIES[category];
  const priorityConfig = PRIORITY_LEVELS.find(p => p.value === item.priority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor} group`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {language === 'ar' && item.text_ar ? item.text_ar : item.text_en}
          </p>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {priorityConfig && (
              <Badge variant="secondary" className={`text-xs ${priorityConfig.color}`}>
                {language === 'ar' ? priorityConfig.labelAr : priorityConfig.labelEn}
              </Badge>
            )}
            {item.source && (
              <Badge variant="outline" className="text-xs">
                {item.source}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}>
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// SWOT Quadrant Component
function SWOTQuadrant({ category, items, onAddItem, onEditItem, onDeleteItem, language, t }) {
  const config = SWOT_CATEGORIES[category];
  const Icon = config.icon;

  return (
    <Card className={`h-full border-2 ${config.borderColor}`}>
      <CardHeader className={`py-3 ${config.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${config.color}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className={`text-base ${config.textColor}`}>
                {language === 'ar' ? config.labelAr : config.labelEn}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === 'ar' ? config.descAr : config.descEn}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={config.textColor}>
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((item) => (
                <SWOTItem
                  key={item.id}
                  item={item}
                  category={category}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  language={language}
                  t={t}
                />
              ))}
            </AnimatePresence>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={`w-full mt-3 border-dashed ${config.borderColor} ${config.textColor} hover:${config.bgColor}`}
            onClick={() => onAddItem(category)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Item', ar: 'إضافة عنصر' })}
          </Button>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Add/Edit Item Dialog
function ItemDialog({ open, onOpenChange, category, item, onSave, language, t }) {
  const [formData, setFormData] = useState(item || {
    text_en: '',
    text_ar: '',
    description: '',
    priority: 'medium',
    source: ''
  });

  React.useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        text_en: '',
        text_ar: '',
        description: '',
        priority: 'medium',
        source: ''
      });
    }
  }, [item, open]);

  const config = category ? SWOT_CATEGORIES[category] : null;

  const handleSubmit = () => {
    if (!formData.text_en.trim()) {
      toast.error(t({ en: 'Please enter item text', ar: 'يرجى إدخال نص العنصر' }));
      return;
    }
    onSave({
      ...formData,
      id: item?.id || `${category}-${Date.now()}`,
      category
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config && <config.icon className={`h-5 w-5 ${config.textColor}`} />}
            {item 
              ? t({ en: 'Edit Item', ar: 'تعديل العنصر' })
              : t({ en: 'Add New Item', ar: 'إضافة عنصر جديد' })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Text (English)', ar: 'النص (إنجليزي)' })}</Label>
            <Input
              value={formData.text_en}
              onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
              placeholder={t({ en: 'Enter item text...', ar: 'أدخل نص العنصر...' })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Text (Arabic)', ar: 'النص (عربي)' })}</Label>
            <Input
              value={formData.text_ar}
              onChange={(e) => setFormData({ ...formData, text_ar: e.target.value })}
              placeholder={t({ en: 'Enter Arabic text...', ar: 'أدخل النص العربي...' })}
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t({ en: 'Additional details...', ar: 'تفاصيل إضافية...' })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {language === 'ar' ? level.labelAr : level.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Source', ar: 'المصدر' })}</Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder={t({ en: 'e.g., Survey, Report', ar: 'مثال: استطلاع، تقرير' })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button onClick={handleSubmit}>
            {item ? t({ en: 'Update', ar: 'تحديث' }) : t({ en: 'Add', ar: 'إضافة' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main SWOTAnalysisBuilder Component
export default function SWOTAnalysisBuilder({
  strategicPlanId,
  initialData,
  onSave,
  className = ''
}) {
  const { language, t } = useLanguage();
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();
  
  const [swotData, setSwotData] = useState(initialData || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1
    }
  });
  
  const [dialogState, setDialogState] = useState({ open: false, category: null, item: null });
  const [contextInput, setContextInput] = useState('');
  const [activeView, setActiveView] = useState('grid');

  // Add item to category
  const handleAddItem = useCallback((category) => {
    setDialogState({ open: true, category, item: null });
  }, []);

  // Edit existing item
  const handleEditItem = useCallback((item) => {
    setDialogState({ open: true, category: item.category, item });
  }, []);

  // Delete item
  const handleDeleteItem = useCallback((category, itemId) => {
    setSwotData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== itemId),
      metadata: { ...prev.metadata, updated_at: new Date().toISOString() }
    }));
    toast.success(t({ en: 'Item deleted', ar: 'تم حذف العنصر' }));
  }, [t]);

  // Save item from dialog
  const handleSaveItem = useCallback((item) => {
    setSwotData(prev => {
      const category = item.category;
      const existingIndex = prev[category].findIndex(i => i.id === item.id);
      
      let updatedItems;
      if (existingIndex >= 0) {
        updatedItems = [...prev[category]];
        updatedItems[existingIndex] = item;
      } else {
        updatedItems = [...prev[category], item];
      }
      
      return {
        ...prev,
        [category]: updatedItems,
        metadata: { ...prev.metadata, updated_at: new Date().toISOString() }
      };
    });
    toast.success(t({ en: 'Item saved', ar: 'تم حفظ العنصر' }));
  }, [t]);

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!contextInput.trim()) {
      toast.error(t({ en: 'Please provide context for AI analysis', ar: 'يرجى تقديم سياق للتحليل بالذكاء الاصطناعي' }));
      return;
    }

    const result = await invokeAI({
      system_prompt: `You are a strategic planning expert. Generate a comprehensive SWOT analysis based on the provided context. Return suggestions for all four categories.`,
      prompt: `Context: ${contextInput}

Analyze this context and provide a SWOT analysis with 3-5 items per category. For each item, provide:
- text_en: English description
- text_ar: Arabic description
- priority: high, medium, or low
- description: brief explanation`,
      response_json_schema: {
        type: 'object',
        properties: {
          strengths: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text_en: { type: 'string' },
                text_ar: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                description: { type: 'string' }
              },
              required: ['text_en', 'priority']
            }
          },
          weaknesses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text_en: { type: 'string' },
                text_ar: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                description: { type: 'string' }
              },
              required: ['text_en', 'priority']
            }
          },
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text_en: { type: 'string' },
                text_ar: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                description: { type: 'string' }
              },
              required: ['text_en', 'priority']
            }
          },
          threats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text_en: { type: 'string' },
                text_ar: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                description: { type: 'string' }
              },
              required: ['text_en', 'priority']
            }
          }
        },
        required: ['strengths', 'weaknesses', 'opportunities', 'threats']
      }
    });

    if (result.success && result.data?.response) {
      const aiData = result.data.response;
      
      // Merge AI suggestions with existing data
      setSwotData(prev => {
        const newData = { ...prev };
        
        ['strengths', 'weaknesses', 'opportunities', 'threats'].forEach(category => {
          if (aiData[category]?.length > 0) {
            const newItems = aiData[category].map((item, idx) => ({
              ...item,
              id: `${category}-ai-${Date.now()}-${idx}`,
              category,
              source: 'AI Generated'
            }));
            newData[category] = [...prev[category], ...newItems];
          }
        });
        
        newData.metadata = { ...prev.metadata, updated_at: new Date().toISOString() };
        return newData;
      });
      
      toast.success(t({ en: 'AI suggestions added', ar: 'تمت إضافة اقتراحات الذكاء الاصطناعي' }));
    }
  };

  // Export SWOT analysis
  const exportSWOT = () => {
    const exportData = {
      ...swotData,
      exportedAt: new Date().toISOString(),
      strategicPlanId
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swot-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(t({ en: 'SWOT analysis exported', ar: 'تم تصدير تحليل SWOT' }));
  };

  // Save SWOT analysis
  const handleSave = () => {
    if (onSave) {
      onSave(swotData);
    }
    toast.success(t({ en: 'SWOT analysis saved', ar: 'تم حفظ تحليل SWOT' }));
  };

  // Calculate totals
  const totalItems = swotData.strengths.length + swotData.weaknesses.length + 
                     swotData.opportunities.length + swotData.threats.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t({ en: 'SWOT Analysis Builder', ar: 'منشئ تحليل SWOT' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
                  ar: 'تحليل نقاط القوة والضعف والفرص والتهديدات'
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {t({ en: `${totalItems} items`, ar: `${totalItems} عنصر` })}
              </Badge>
              <Button variant="outline" size="sm" onClick={exportSWOT}>
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export', ar: 'تصدير' })}
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Save', ar: 'حفظ' })}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* AI Context Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Textarea
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              placeholder={t({ 
                en: 'Describe your organization, project, or initiative for AI-powered SWOT suggestions...',
                ar: 'صف منظمتك أو مشروعك أو مبادرتك للحصول على اقتراحات SWOT بالذكاء الاصطناعي...'
              })}
              className="flex-1"
              rows={3}
            />
            <Button 
              onClick={generateAISuggestions} 
              disabled={aiLoading || !contextInput.trim()}
              className="sm:self-end"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate with AI', ar: 'توليد بالذكاء الاصطناعي' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="grid">{t({ en: 'Grid View', ar: 'عرض الشبكة' })}</TabsTrigger>
          <TabsTrigger value="list">{t({ en: 'List View', ar: 'عرض القائمة' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          {/* SWOT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(SWOT_CATEGORIES).map((category) => (
              <SWOTQuadrant
                key={category}
                category={category}
                items={swotData[category]}
                onAddItem={handleAddItem}
                onEditItem={handleEditItem}
                onDeleteItem={(id) => handleDeleteItem(category, id)}
                language={language}
                t={t}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          {/* List View */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-6">
                {Object.keys(SWOT_CATEGORIES).map((category) => {
                  const config = SWOT_CATEGORIES[category];
                  const Icon = config.icon;
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`p-1.5 rounded-md ${config.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <h3 className={`font-medium ${config.textColor}`}>
                          {language === 'ar' ? config.labelAr : config.labelEn}
                        </h3>
                        <Badge variant="secondary" className={config.textColor}>
                          {swotData[category].length}
                        </Badge>
                      </div>
                      <div className="space-y-2 ml-8">
                        {swotData[category].map((item) => (
                          <SWOTItem
                            key={item.id}
                            item={item}
                            category={category}
                            onEdit={handleEditItem}
                            onDelete={(id) => handleDeleteItem(category, id)}
                            language={language}
                            t={t}
                          />
                        ))}
                        {swotData[category].length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            {t({ en: 'No items yet', ar: 'لا توجد عناصر بعد' })}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className={`border-dashed ${config.borderColor} ${config.textColor}`}
                          onClick={() => handleAddItem(category)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t({ en: 'Add Item', ar: 'إضافة عنصر' })}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <ItemDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        category={dialogState.category}
        item={dialogState.item}
        onSave={handleSaveItem}
        language={language}
        t={t}
      />
    </div>
  );
}
