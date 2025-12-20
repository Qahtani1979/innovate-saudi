import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { STAKEHOLDER_ANALYSIS_SYSTEM_PROMPT, buildStakeholderAnalysisPrompt, STAKEHOLDER_ANALYSIS_SCHEMA } from '@/lib/ai/prompts/strategy/preplanning';
import { useStakeholderAnalysis } from '@/hooks/strategy/useStakeholderAnalysis';
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Save,
  Users,
  Loader2,
  Edit2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Fallback stakeholder types (used when taxonomy not loaded)
const FALLBACK_STAKEHOLDER_TYPES = [
  { value: 'GOVERNMENT', labelEn: 'Government', labelAr: 'حكومي', color: 'bg-blue-500' },
  { value: 'PRIVATE_SECTOR', labelEn: 'Private Sector', labelAr: 'القطاع الخاص', color: 'bg-green-500' },
  { value: 'ACADEMIC', labelEn: 'Academic', labelAr: 'أكاديمي', color: 'bg-purple-500' },
  { value: 'NGO', labelEn: 'NGO/Non-profit', labelAr: 'منظمة غير ربحية', color: 'bg-orange-500' },
  { value: 'CITIZENS', labelEn: 'Citizens', labelAr: 'المواطنون', color: 'bg-teal-500' },
  { value: 'INTERNATIONAL', labelEn: 'International', labelAr: 'دولي', color: 'bg-indigo-500' }
];

// Engagement strategies based on quadrant
const ENGAGEMENT_STRATEGIES = {
  'high-high': { 
    labelEn: 'Manage Closely', 
    labelAr: 'إدارة عن كثب',
    descEn: 'Key players - engage regularly and keep satisfied',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  'high-low': { 
    labelEn: 'Keep Satisfied', 
    labelAr: 'الحفاظ على الرضا',
    descEn: 'High power but low interest - keep informed',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  'low-high': { 
    labelEn: 'Keep Informed', 
    labelAr: 'إبقاء على اطلاع',
    descEn: 'High interest but low power - keep engaged',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  'low-low': { 
    labelEn: 'Monitor', 
    labelAr: 'مراقبة',
    descEn: 'Low priority - monitor with minimal effort',
    color: 'bg-gray-100 text-gray-800 border-gray-300'
  }
};

// Power/Interest Grid Component
function PowerInterestGrid({ stakeholders, onSelectStakeholder, selectedId, language, stakeholderTypes }) {
  const gridRef = React.useRef(null);
  
  // Calculate position based on power and interest (0-100 scale)
  const getPosition = (power, interest) => ({
    left: `${interest}%`,
    bottom: `${power}%`
  });

  const getQuadrant = (power, interest) => {
    const highPower = power >= 50;
    const highInterest = interest >= 50;
    return `${highPower ? 'high' : 'low'}-${highInterest ? 'high' : 'low'}`;
  };

  return (
    <div className="relative">
      <div 
        ref={gridRef}
        className="relative w-full aspect-square border-2 border-border rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden"
      >
        {/* Quadrant backgrounds */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="bg-amber-50/50 border-r border-b border-border/30" />
          <div className="bg-red-50/50 border-b border-border/30" />
          <div className="bg-gray-50/50 border-r border-border/30" />
          <div className="bg-blue-50/50" />
        </div>

        {/* Axis labels */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 text-xs font-medium text-muted-foreground">
          {language === 'ar' ? 'اهتمام عالي' : 'High Interest'}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 text-xs font-medium text-muted-foreground">
          {language === 'ar' ? 'اهتمام منخفض' : 'Low Interest'}
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground -rotate-90">
          {language === 'ar' ? 'قوة عالية' : 'High Power'}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground rotate-90">
          {language === 'ar' ? 'قوة منخفضة' : 'Low Power'}
        </div>

        {/* Quadrant labels */}
        <div className="absolute top-4 left-4 text-xs font-semibold text-amber-700">
          {language === 'ar' ? 'الحفاظ على الرضا' : 'Keep Satisfied'}
        </div>
        <div className="absolute top-4 right-4 text-xs font-semibold text-red-700">
          {language === 'ar' ? 'إدارة عن كثب' : 'Manage Closely'}
        </div>
        <div className="absolute bottom-4 left-4 text-xs font-semibold text-gray-600">
          {language === 'ar' ? 'مراقبة' : 'Monitor'}
        </div>
        <div className="absolute bottom-4 right-4 text-xs font-semibold text-blue-700">
          {language === 'ar' ? 'إبقاء على اطلاع' : 'Keep Informed'}
        </div>

        {/* Center lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/50" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50" />

        {/* Stakeholder points */}
        <TooltipProvider>
          {stakeholders.map((stakeholder) => {
            const typeConfig = stakeholderTypes.find(t => t.value === stakeholder.type || t.code === stakeholder.type);
            const position = getPosition(stakeholder.power, stakeholder.interest);
            const isSelected = selectedId === stakeholder.id;
            
            return (
              <Tooltip key={stakeholder.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => onSelectStakeholder(stakeholder)}
                    className={`absolute w-8 h-8 -ml-4 -mb-4 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer transition-all ${typeConfig?.color || 'bg-primary'} ${isSelected ? 'ring-4 ring-primary ring-offset-2' : ''}`}
                    style={position}
                  >
                    {stakeholder.name_en.charAt(0).toUpperCase()}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{language === 'ar' && stakeholder.name_ar ? stakeholder.name_ar : stakeholder.name_en}</p>
                    <p className="text-muted-foreground">{language === 'ar' ? (typeConfig?.labelAr || typeConfig?.name_ar) : (typeConfig?.labelEn || typeConfig?.name_en)}</p>
                    <p className="text-xs mt-1">
                      {language === 'ar' ? 'القوة' : 'Power'}: {stakeholder.power}% | {language === 'ar' ? 'الاهتمام' : 'Interest'}: {stakeholder.interest}%
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}

// Stakeholder Dialog
function StakeholderDialog({ open, onOpenChange, stakeholder, onSave, language, t, stakeholderTypes }) {
  const [formData, setFormData] = useState(stakeholder || {
    name_en: '',
    name_ar: '',
    type: 'government',
    power: 50,
    interest: 50,
    influence: '',
    expectations: '',
    engagement_strategy: '',
    contact_info: ''
  });

  React.useEffect(() => {
    if (stakeholder) {
      setFormData(stakeholder);
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        type: 'government',
        power: 50,
        interest: 50,
        influence: '',
        expectations: '',
        engagement_strategy: '',
        contact_info: ''
      });
    }
  }, [stakeholder, open]);

  const handleSubmit = () => {
    if (!formData.name_en.trim()) {
      toast.error(t({ en: 'Please enter stakeholder name', ar: 'يرجى إدخال اسم أصحاب المصلحة' }));
      return;
    }
    onSave({
      ...formData,
      id: stakeholder?.id || `stakeholder-${Date.now()}`
    });
    onOpenChange(false);
  };

  const getQuadrant = (power, interest) => {
    const highPower = power >= 50;
    const highInterest = interest >= 50;
    return `${highPower ? 'high' : 'low'}-${highInterest ? 'high' : 'low'}`;
  };

  const currentStrategy = ENGAGEMENT_STRATEGIES[getQuadrant(formData.power, formData.interest)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {stakeholder 
              ? t({ en: 'Edit Stakeholder', ar: 'تعديل أصحاب المصلحة' })
              : t({ en: 'Add Stakeholder', ar: 'إضافة أصحاب المصلحة' })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder={t({ en: 'Enter name...', ar: 'أدخل الاسم...' })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder={t({ en: 'Enter Arabic name...', ar: 'أدخل الاسم العربي...' })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Stakeholder Type', ar: 'نوع أصحاب المصلحة' })}</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stakeholderTypes.map((type) => (
                  <SelectItem key={type.value || type.code} value={type.value || type.code}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${type.color || 'bg-primary'}`} />
                      {language === 'ar' ? (type.labelAr || type.name_ar) : (type.labelEn || type.name_en)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {t({ en: 'Power Level', ar: 'مستوى القوة' })}
                <Badge variant="outline">{formData.power}%</Badge>
              </Label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: parseInt(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {t({ en: 'Interest Level', ar: 'مستوى الاهتمام' })}
                <Badge variant="outline">{formData.interest}%</Badge>
              </Label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: parseInt(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Suggested strategy based on position */}
          <div className={`p-3 rounded-lg border ${currentStrategy.color}`}>
            <p className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t({ en: 'Recommended Strategy:', ar: 'الاستراتيجية الموصى بها:' })} {language === 'ar' ? currentStrategy.labelAr : currentStrategy.labelEn}
            </p>
            <p className="text-xs mt-1">{currentStrategy.descEn}</p>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Influence Description', ar: 'وصف التأثير' })}</Label>
            <Textarea
              value={formData.influence}
              onChange={(e) => setFormData({ ...formData, influence: e.target.value })}
              placeholder={t({ en: 'How can this stakeholder influence the strategy...', ar: 'كيف يمكن لأصحاب المصلحة التأثير على الاستراتيجية...' })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Expectations', ar: 'التوقعات' })}</Label>
            <Textarea
              value={formData.expectations}
              onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
              placeholder={t({ en: 'What does this stakeholder expect...', ar: 'ما يتوقعه أصحاب المصلحة...' })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Engagement Strategy', ar: 'استراتيجية المشاركة' })}</Label>
            <Textarea
              value={formData.engagement_strategy}
              onChange={(e) => setFormData({ ...formData, engagement_strategy: e.target.value })}
              placeholder={t({ en: 'How to engage with this stakeholder...', ar: 'كيفية التعامل مع أصحاب المصلحة...' })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Contact Information', ar: 'معلومات الاتصال' })}</Label>
            <Input
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              placeholder={t({ en: 'Email, phone, or other contact...', ar: 'البريد الإلكتروني أو الهاتف...' })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button onClick={handleSubmit}>
            {stakeholder ? t({ en: 'Update', ar: 'تحديث' }) : t({ en: 'Add', ar: 'إضافة' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function StakeholderAnalysisWidget({
  strategicPlanId,
  initialData,
  onSave,
  className = ''
}) {
  const { language, t } = useLanguage();
  const { stakeholderTypes: taxonomyTypes } = useTaxonomy();
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();
  
  // Database integration hook
  const { 
    stakeholders: dbStakeholders, 
    loading: dbLoading, 
    saving: dbSaving, 
    saveStakeholder: saveToDb,
    deleteStakeholder: deleteFromDb 
  } = useStakeholderAnalysis(strategicPlanId);
  
  // Compute stakeholder types from taxonomy with fallback
  const stakeholderTypes = useMemo(() => {
    if (taxonomyTypes && taxonomyTypes.length > 0) {
      return taxonomyTypes.map(t => ({
        value: t.code,
        code: t.code,
        labelEn: t.name_en,
        labelAr: t.name_ar,
        name_en: t.name_en,
        name_ar: t.name_ar,
        color: 'bg-primary'
      }));
    }
    return FALLBACK_STAKEHOLDER_TYPES;
  }, [taxonomyTypes]);
  
  const [stakeholders, setStakeholders] = useState(initialData?.stakeholders || []);
  const [dialogState, setDialogState] = useState({ open: false, stakeholder: null });
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [contextInput, setContextInput] = useState('');

  // Sync with database data when loaded
  useEffect(() => {
    if (dbStakeholders && !dbLoading && dbStakeholders.length > 0) {
      // Map database fields to component fields
      const mapped = dbStakeholders.map(s => ({
        id: s.id,
        name_en: s.stakeholder_name_en,
        name_ar: s.stakeholder_name_ar,
        type: s.stakeholder_type,
        power: s.power_level,
        interest: s.interest_level,
        influence: s.influence_description,
        expectations: s.expectations,
        engagement_strategy: s.engagement_strategy,
        contact_info: s.contact_info
      }));
      setStakeholders(mapped);
    }
  }, [dbStakeholders, dbLoading]);

  // Handle add/edit stakeholder with database save
  const handleSaveStakeholder = useCallback(async (stakeholder) => {
    // Save to database
    const result = await saveToDb(stakeholder);
    if (result) {
      // Update local state with returned data
      setStakeholders(prev => {
        const mapped = {
          id: result.id,
          name_en: result.stakeholder_name_en,
          name_ar: result.stakeholder_name_ar,
          type: result.stakeholder_type,
          power: result.power_level,
          interest: result.interest_level,
          influence: result.influence_description,
          expectations: result.expectations,
          engagement_strategy: result.engagement_strategy,
          contact_info: result.contact_info
        };
        const existingIndex = prev.findIndex(s => s.id === result.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = mapped;
          return updated;
        }
        return [...prev, mapped];
      });
    }
  }, [saveToDb]);

  // Handle delete with database delete
  const handleDeleteStakeholder = useCallback(async (id) => {
    const success = await deleteFromDb(id);
    if (success) {
      setStakeholders(prev => prev.filter(s => s.id !== id));
      setSelectedStakeholder(null);
    }
  }, [deleteFromDb]);

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!contextInput.trim()) {
      toast.error(t({ en: 'Please provide context for AI analysis', ar: 'يرجى تقديم سياق للتحليل' }));
      return;
    }

    const result = await invokeAI({
      system_prompt: STAKEHOLDER_ANALYSIS_SYSTEM_PROMPT,
      prompt: buildStakeholderAnalysisPrompt(contextInput),
      response_json_schema: STAKEHOLDER_ANALYSIS_SCHEMA
    });

    if (result.success && result.data?.stakeholders) {
      const newStakeholders = result.data.stakeholders.map((s, idx) => ({
        ...s,
        id: `stakeholder-ai-${Date.now()}-${idx}`
      }));
      setStakeholders(prev => [...prev, ...newStakeholders]);
      toast.success(t({ en: 'AI suggestions added', ar: 'تمت إضافة اقتراحات الذكاء الاصطناعي' }));
    }
  };

  // Export analysis
  const exportAnalysis = () => {
    const exportData = {
      stakeholders,
      exportedAt: new Date().toISOString(),
      strategicPlanId
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stakeholder-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(t({ en: 'Analysis exported', ar: 'تم تصدير التحليل' }));
  };

  // Save analysis
  const handleSave = () => {
    if (onSave) {
      onSave({ stakeholders });
    }
    toast.success(t({ en: 'Analysis saved', ar: 'تم حفظ التحليل' }));
  };

  // Group stakeholders by quadrant
  const stakeholdersByQuadrant = useMemo(() => {
    const groups = {
      'high-high': [],
      'high-low': [],
      'low-high': [],
      'low-low': []
    };
    
    stakeholders.forEach(s => {
      const key = `${s.power >= 50 ? 'high' : 'low'}-${s.interest >= 50 ? 'high' : 'low'}`;
      groups[key].push(s);
    });
    
    return groups;
  }, [stakeholders]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t({ en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Map stakeholders by power and interest using the Power/Interest Grid',
                  ar: 'رسم خريطة أصحاب المصلحة حسب القوة والاهتمام'
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {t({ en: `${stakeholders.length} stakeholders`, ar: `${stakeholders.length} أصحاب المصلحة` })}
              </Badge>
              <Button variant="outline" size="sm" onClick={exportAnalysis}>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <Textarea
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              placeholder={t({ 
                en: 'Describe your initiative to identify key stakeholders with AI...',
                ar: 'صف مبادرتك لتحديد أصحاب المصلحة الرئيسيين بالذكاء الاصطناعي...'
              })}
              className="flex-1"
              rows={2}
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
              {t({ en: 'Identify with AI', ar: 'تحديد بالذكاء الاصطناعي' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Power/Interest Grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t({ en: 'Power/Interest Grid', ar: 'شبكة القوة/الاهتمام' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PowerInterestGrid 
              stakeholders={stakeholders}
              onSelectStakeholder={setSelectedStakeholder}
              selectedId={selectedStakeholder?.id}
              language={language}
              stakeholderTypes={stakeholderTypes}
            />
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setDialogState({ open: true, stakeholder: null })}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add Stakeholder', ar: 'إضافة أصحاب المصلحة' })}
            </Button>
          </CardContent>
        </Card>

        {/* Stakeholder List by Quadrant */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t({ en: 'Stakeholders by Strategy', ar: 'أصحاب المصلحة حسب الاستراتيجية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-3">
              <div className="space-y-4">
                {Object.entries(ENGAGEMENT_STRATEGIES).map(([key, strategy]) => (
                  <div key={key}>
                    <div className={`px-3 py-2 rounded-t-lg border ${strategy.color}`}>
                      <p className="text-sm font-medium">
                        {language === 'ar' ? strategy.labelAr : strategy.labelEn}
                      </p>
                      <p className="text-xs opacity-75">{strategy.descEn}</p>
                    </div>
                    <div className="border border-t-0 rounded-b-lg p-2 space-y-2">
                      {stakeholdersByQuadrant[key].length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          {t({ en: 'No stakeholders in this quadrant', ar: 'لا يوجد أصحاب مصلحة في هذا الربع' })}
                        </p>
                      ) : (
                        stakeholdersByQuadrant[key].map((s) => {
                          const typeConfig = stakeholderTypes.find(t => t.value === s.type || t.code === s.type);
                          return (
                            <div 
                              key={s.id}
                              className={`p-2 rounded-lg border bg-muted/30 flex items-center justify-between group cursor-pointer hover:bg-muted/50 ${selectedStakeholder?.id === s.id ? 'ring-2 ring-primary' : ''}`}
                              onClick={() => setSelectedStakeholder(s)}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${typeConfig?.color} flex items-center justify-center text-white text-xs font-bold`}>
                                  {s.name_en.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{language === 'ar' && s.name_ar ? s.name_ar : s.name_en}</p>
                                  <p className="text-xs text-muted-foreground">
                                    P: {s.power}% | I: {s.interest}%
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDialogState({ open: true, stakeholder: s });
                                  }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStakeholder(s.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selected Stakeholder Detail */}
      {selectedStakeholder && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {language === 'ar' && selectedStakeholder.name_ar ? selectedStakeholder.name_ar : selectedStakeholder.name_en}
                <Badge variant="secondary">
                  {(() => {
                    const typeConfig = stakeholderTypes.find(t => t.value === selectedStakeholder.type || t.code === selectedStakeholder.type);
                    return typeConfig ? (language === 'ar' ? (typeConfig.labelAr || typeConfig.name_ar) : (typeConfig.labelEn || typeConfig.name_en)) : selectedStakeholder.type;
                  })()}
                </Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDialogState({ open: true, stakeholder: selectedStakeholder })}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {t({ en: 'Edit', ar: 'تعديل' })}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t({ en: 'Influence', ar: 'التأثير' })}</p>
                <p className="text-sm">{selectedStakeholder.influence || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t({ en: 'Expectations', ar: 'التوقعات' })}</p>
                <p className="text-sm">{selectedStakeholder.expectations || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t({ en: 'Engagement Strategy', ar: 'استراتيجية المشاركة' })}</p>
                <p className="text-sm">{selectedStakeholder.engagement_strategy || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <StakeholderDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        stakeholder={dialogState.stakeholder}
        onSave={handleSaveStakeholder}
        language={language}
        t={t}
        stakeholderTypes={stakeholderTypes}
      />
    </div>
  );
}
