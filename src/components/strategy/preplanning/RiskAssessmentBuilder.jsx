import React, { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Save,
  AlertTriangle,
  Loader2,
  Edit2,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Risk categories
const RISK_CATEGORIES = [
  { value: 'strategic', labelEn: 'Strategic', labelAr: 'استراتيجي', color: 'bg-purple-500' },
  { value: 'operational', labelEn: 'Operational', labelAr: 'تشغيلي', color: 'bg-blue-500' },
  { value: 'financial', labelEn: 'Financial', labelAr: 'مالي', color: 'bg-green-500' },
  { value: 'compliance', labelEn: 'Compliance', labelAr: 'امتثال', color: 'bg-amber-500' },
  { value: 'reputational', labelEn: 'Reputational', labelAr: 'سمعة', color: 'bg-rose-500' },
  { value: 'technology', labelEn: 'Technology', labelAr: 'تقني', color: 'bg-cyan-500' },
  { value: 'political', labelEn: 'Political', labelAr: 'سياسي', color: 'bg-indigo-500' },
  { value: 'environmental', labelEn: 'Environmental', labelAr: 'بيئي', color: 'bg-teal-500' }
];

// Risk status
const RISK_STATUSES = [
  { value: 'identified', labelEn: 'Identified', labelAr: 'محدد', color: 'bg-gray-100 text-gray-700' },
  { value: 'analyzing', labelEn: 'Analyzing', labelAr: 'قيد التحليل', color: 'bg-blue-100 text-blue-700' },
  { value: 'mitigating', labelEn: 'Mitigating', labelAr: 'قيد التخفيف', color: 'bg-amber-100 text-amber-700' },
  { value: 'monitoring', labelEn: 'Monitoring', labelAr: 'مراقبة', color: 'bg-green-100 text-green-700' },
  { value: 'closed', labelEn: 'Closed', labelAr: 'مغلق', color: 'bg-gray-100 text-gray-500' }
];

// Calculate risk score and level
const getRiskLevel = (probability, impact) => {
  const score = probability * impact;
  if (score >= 20) return { level: 'critical', labelEn: 'Critical', labelAr: 'حرج', color: 'bg-red-500 text-white' };
  if (score >= 12) return { level: 'high', labelEn: 'High', labelAr: 'عالي', color: 'bg-orange-500 text-white' };
  if (score >= 6) return { level: 'medium', labelEn: 'Medium', labelAr: 'متوسط', color: 'bg-yellow-500 text-black' };
  return { level: 'low', labelEn: 'Low', labelAr: 'منخفض', color: 'bg-green-500 text-white' };
};

// Risk Matrix Component
function RiskMatrix({ risks, onSelectRisk, selectedId, language }) {
  // 5x5 probability/impact matrix
  const matrixCells = [];
  for (let impact = 5; impact >= 1; impact--) {
    for (let prob = 1; prob <= 5; prob++) {
      const cellRisks = risks.filter(r => r.probability === prob && r.impact === impact);
      const riskLevel = getRiskLevel(prob, impact);
      matrixCells.push({
        prob,
        impact,
        risks: cellRisks,
        level: riskLevel.level
      });
    }
  }

  const getCellColor = (prob, impact) => {
    const score = prob * impact;
    if (score >= 20) return 'bg-red-200 hover:bg-red-300';
    if (score >= 12) return 'bg-orange-200 hover:bg-orange-300';
    if (score >= 6) return 'bg-yellow-200 hover:bg-yellow-300';
    return 'bg-green-200 hover:bg-green-300';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{language === 'ar' ? 'الاحتمالية ←' : '← Probability'}</span>
        <span>{language === 'ar' ? '↑ التأثير' : 'Impact ↑'}</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {matrixCells.map((cell, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-md ${getCellColor(cell.prob, cell.impact)} flex items-center justify-center transition-colors cursor-pointer relative group`}
          >
            {cell.risks.length > 0 && (
              <div className="flex flex-wrap gap-0.5 justify-center p-1">
                {cell.risks.slice(0, 3).map((risk) => {
                  const category = RISK_CATEGORIES.find(c => c.value === risk.category);
                  return (
                    <motion.button
                      key={risk.id}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => onSelectRisk(risk)}
                      className={`w-4 h-4 rounded-full ${category?.color || 'bg-gray-400'} ${selectedId === risk.id ? 'ring-2 ring-white shadow-lg' : ''}`}
                      title={risk.name_en}
                    />
                  );
                })}
                {cell.risks.length > 3 && (
                  <span className="text-xs font-bold">+{cell.risks.length - 3}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
}

// Risk Dialog
function RiskDialog({ open, onOpenChange, risk, onSave, language, t }) {
  const [formData, setFormData] = useState(risk || {
    name_en: '',
    name_ar: '',
    description: '',
    category: 'operational',
    probability: 3,
    impact: 3,
    status: 'identified',
    owner: '',
    mitigation_strategy: '',
    contingency_plan: '',
    triggers: '',
    residual_probability: null,
    residual_impact: null
  });

  React.useEffect(() => {
    if (risk) {
      setFormData(risk);
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        description: '',
        category: 'operational',
        probability: 3,
        impact: 3,
        status: 'identified',
        owner: '',
        mitigation_strategy: '',
        contingency_plan: '',
        triggers: '',
        residual_probability: null,
        residual_impact: null
      });
    }
  }, [risk, open]);

  const handleSubmit = () => {
    if (!formData.name_en.trim()) {
      toast.error(t({ en: 'Please enter risk name', ar: 'يرجى إدخال اسم المخاطر' }));
      return;
    }
    onSave({
      ...formData,
      id: risk?.id || `risk-${Date.now()}`
    });
    onOpenChange(false);
  };

  const currentRiskLevel = getRiskLevel(formData.probability, formData.impact);
  const residualRiskLevel = formData.residual_probability && formData.residual_impact
    ? getRiskLevel(formData.residual_probability, formData.residual_impact)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {risk 
              ? t({ en: 'Edit Risk', ar: 'تعديل المخاطر' })
              : t({ en: 'Add Risk', ar: 'إضافة مخاطر' })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Risk Name (English)', ar: 'اسم المخاطر (إنجليزي)' })}</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder={t({ en: 'Enter risk name...', ar: 'أدخل اسم المخاطر...' })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Risk Name (Arabic)', ar: 'اسم المخاطر (عربي)' })}</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder={t({ en: 'Enter Arabic name...', ar: 'أدخل الاسم العربي...' })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t({ en: 'Describe the risk in detail...', ar: 'صف المخاطر بالتفصيل...' })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        {language === 'ar' ? cat.labelAr : cat.labelEn}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {language === 'ar' ? status.labelAr : status.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Owner', ar: 'المسؤول' })}</Label>
              <Input
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder={t({ en: 'Risk owner...', ar: 'مسؤول المخاطر...' })}
              />
            </div>
          </div>

          {/* Inherent Risk Assessment */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              {t({ en: 'Inherent Risk Assessment', ar: 'تقييم المخاطر الكامنة' })}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {t({ en: 'Probability', ar: 'الاحتمالية' })}
                  <Badge variant="outline">{formData.probability}/5</Badge>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t({ en: 'Rare', ar: 'نادر' })}</span>
                  <span>{t({ en: 'Certain', ar: 'مؤكد' })}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {t({ en: 'Impact', ar: 'التأثير' })}
                  <Badge variant="outline">{formData.impact}/5</Badge>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t({ en: 'Minimal', ar: 'ضئيل' })}</span>
                  <span>{t({ en: 'Severe', ar: 'شديد' })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">{t({ en: 'Risk Score:', ar: 'درجة المخاطر:' })}</span>
              <Badge className={currentRiskLevel.color}>
                {formData.probability * formData.impact} - {language === 'ar' ? currentRiskLevel.labelAr : currentRiskLevel.labelEn}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Mitigation Strategy', ar: 'استراتيجية التخفيف' })}</Label>
            <Textarea
              value={formData.mitigation_strategy}
              onChange={(e) => setFormData({ ...formData, mitigation_strategy: e.target.value })}
              placeholder={t({ en: 'How to reduce probability or impact...', ar: 'كيفية تقليل الاحتمالية أو التأثير...' })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Contingency Plan', ar: 'خطة الطوارئ' })}</Label>
            <Textarea
              value={formData.contingency_plan}
              onChange={(e) => setFormData({ ...formData, contingency_plan: e.target.value })}
              placeholder={t({ en: 'What to do if the risk occurs...', ar: 'ماذا تفعل إذا حدثت المخاطر...' })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Risk Triggers', ar: 'محفزات المخاطر' })}</Label>
            <Input
              value={formData.triggers}
              onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
              placeholder={t({ en: 'Warning signs that the risk is materializing...', ar: 'علامات تحذيرية...' })}
            />
          </div>

          {/* Residual Risk Assessment */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              {t({ en: 'Residual Risk (After Mitigation)', ar: 'المخاطر المتبقية (بعد التخفيف)' })}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {t({ en: 'Residual Probability', ar: 'الاحتمالية المتبقية' })}
                  <Badge variant="outline">{formData.residual_probability || '-'}/5</Badge>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.residual_probability || 1}
                  onChange={(e) => setFormData({ ...formData, residual_probability: parseInt(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {t({ en: 'Residual Impact', ar: 'التأثير المتبقي' })}
                  <Badge variant="outline">{formData.residual_impact || '-'}/5</Badge>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.residual_impact || 1}
                  onChange={(e) => setFormData({ ...formData, residual_impact: parseInt(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>
            </div>
            {residualRiskLevel && (
              <div className="flex items-center gap-3">
                <span className="text-sm">{t({ en: 'Residual Score:', ar: 'الدرجة المتبقية:' })}</span>
                <Badge className={residualRiskLevel.color}>
                  {formData.residual_probability * formData.residual_impact} - {language === 'ar' ? residualRiskLevel.labelAr : residualRiskLevel.labelEn}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button onClick={handleSubmit}>
            {risk ? t({ en: 'Update', ar: 'تحديث' }) : t({ en: 'Add', ar: 'إضافة' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function RiskAssessmentBuilder({
  strategicPlanId,
  initialData,
  onSave,
  className = ''
}) {
  const { language, t } = useLanguage();
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();
  
  const [risks, setRisks] = useState(initialData?.risks || []);
  const [dialogState, setDialogState] = useState({ open: false, risk: null });
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [contextInput, setContextInput] = useState('');

  // Handle save risk
  const handleSaveRisk = useCallback((risk) => {
    setRisks(prev => {
      const existingIndex = prev.findIndex(r => r.id === risk.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = risk;
        return updated;
      }
      return [...prev, risk];
    });
    toast.success(t({ en: 'Risk saved', ar: 'تم حفظ المخاطر' }));
  }, [t]);

  // Handle delete
  const handleDeleteRisk = useCallback((id) => {
    setRisks(prev => prev.filter(r => r.id !== id));
    setSelectedRisk(null);
    toast.success(t({ en: 'Risk deleted', ar: 'تم حذف المخاطر' }));
  }, [t]);

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    if (!contextInput.trim()) {
      toast.error(t({ en: 'Please provide context for risk identification', ar: 'يرجى تقديم سياق لتحديد المخاطر' }));
      return;
    }

    const result = await invokeAI({
      system_prompt: `You are a risk management expert. Identify potential risks for the given strategic initiative and provide probability/impact assessments.`,
      prompt: `Context: ${contextInput}

Identify 5-8 key risks for this initiative. For each, provide:
- name_en: Risk name in English
- name_ar: Risk name in Arabic
- description: Brief description
- category: One of strategic, operational, financial, compliance, reputational, technology, political, environmental
- probability: Probability score 1-5
- impact: Impact score 1-5
- mitigation_strategy: How to mitigate`,
      response_json_schema: {
        type: 'object',
        properties: {
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                probability: { type: 'number', minimum: 1, maximum: 5 },
                impact: { type: 'number', minimum: 1, maximum: 5 },
                mitigation_strategy: { type: 'string' }
              },
              required: ['name_en', 'category', 'probability', 'impact']
            }
          }
        },
        required: ['risks']
      }
    });

    if (result.success && result.data?.response?.risks) {
      const newRisks = result.data.response.risks.map((r, idx) => ({
        ...r,
        id: `risk-ai-${Date.now()}-${idx}`,
        status: 'identified'
      }));
      setRisks(prev => [...prev, ...newRisks]);
      toast.success(t({ en: 'AI suggestions added', ar: 'تمت إضافة اقتراحات الذكاء الاصطناعي' }));
    }
  };

  // Export
  const exportRisks = () => {
    const exportData = {
      risks,
      exportedAt: new Date().toISOString(),
      strategicPlanId
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(t({ en: 'Risk assessment exported', ar: 'تم تصدير تقييم المخاطر' }));
  };

  // Save
  const handleSave = () => {
    if (onSave) {
      onSave({ risks });
    }
    toast.success(t({ en: 'Risk assessment saved', ar: 'تم حفظ تقييم المخاطر' }));
  };

  // Statistics
  const stats = useMemo(() => {
    const byLevel = { critical: 0, high: 0, medium: 0, low: 0 };
    risks.forEach(r => {
      const level = getRiskLevel(r.probability, r.impact).level;
      byLevel[level]++;
    });
    return byLevel;
  }, [risks]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t({ en: 'Risk Assessment Builder', ar: 'منشئ تقييم المخاطر' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Identify, assess, and manage strategic risks using a probability-impact matrix',
                  ar: 'تحديد وتقييم وإدارة المخاطر الاستراتيجية'
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="destructive">{stats.critical} {t({ en: 'Critical', ar: 'حرج' })}</Badge>
              <Badge className="bg-orange-500">{stats.high} {t({ en: 'High', ar: 'عالي' })}</Badge>
              <Badge className="bg-yellow-500 text-black">{stats.medium} {t({ en: 'Medium', ar: 'متوسط' })}</Badge>
              <Badge className="bg-green-500">{stats.low} {t({ en: 'Low', ar: 'منخفض' })}</Badge>
              <Button variant="outline" size="sm" onClick={exportRisks}>
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
                en: 'Describe your initiative to identify potential risks with AI...',
                ar: 'صف مبادرتك لتحديد المخاطر المحتملة بالذكاء الاصطناعي...'
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
              {t({ en: 'Identify Risks with AI', ar: 'تحديد المخاطر بالذكاء الاصطناعي' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Matrix */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t({ en: 'Risk Matrix', ar: 'مصفوفة المخاطر' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskMatrix 
              risks={risks}
              onSelectRisk={setSelectedRisk}
              selectedId={selectedRisk?.id}
              language={language}
            />
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setDialogState({ open: true, risk: null })}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add Risk', ar: 'إضافة مخاطر' })}
            </Button>
          </CardContent>
        </Card>

        {/* Risk Register Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t({ en: 'Risk Register', ar: 'سجل المخاطر' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t({ en: 'Risk', ar: 'المخاطر' })}</TableHead>
                    <TableHead className="text-center">{t({ en: 'P', ar: 'ح' })}</TableHead>
                    <TableHead className="text-center">{t({ en: 'I', ar: 'ت' })}</TableHead>
                    <TableHead>{t({ en: 'Level', ar: 'المستوى' })}</TableHead>
                    <TableHead>{t({ en: 'Status', ar: 'الحالة' })}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {t({ en: 'No risks identified yet. Use AI or add manually.', ar: 'لم يتم تحديد مخاطر بعد. استخدم الذكاء الاصطناعي أو أضف يدويًا.' })}
                      </TableCell>
                    </TableRow>
                  ) : (
                    risks.map((risk) => {
                      const category = RISK_CATEGORIES.find(c => c.value === risk.category);
                      const riskLevel = getRiskLevel(risk.probability, risk.impact);
                      const status = RISK_STATUSES.find(s => s.value === risk.status);
                      
                      return (
                        <TableRow 
                          key={risk.id}
                          className={`cursor-pointer hover:bg-muted/50 ${selectedRisk?.id === risk.id ? 'bg-muted' : ''}`}
                          onClick={() => setSelectedRisk(risk)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${category?.color}`} />
                              <span className="font-medium">
                                {language === 'ar' && risk.name_ar ? risk.name_ar : risk.name_en}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{risk.probability}</TableCell>
                          <TableCell className="text-center">{risk.impact}</TableCell>
                          <TableCell>
                            <Badge className={riskLevel.color}>
                              {language === 'ar' ? riskLevel.labelAr : riskLevel.labelEn}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={status?.color}>
                              {language === 'ar' ? status?.labelAr : status?.labelEn}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDialogState({ open: true, risk });
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
                                  handleDeleteRisk(risk.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selected Risk Detail */}
      {selectedRisk && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {language === 'ar' && selectedRisk.name_ar ? selectedRisk.name_ar : selectedRisk.name_en}
                <Badge className={getRiskLevel(selectedRisk.probability, selectedRisk.impact).color}>
                  {getRiskLevel(selectedRisk.probability, selectedRisk.impact)[language === 'ar' ? 'labelAr' : 'labelEn']}
                </Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDialogState({ open: true, risk: selectedRisk })}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {t({ en: 'Edit', ar: 'تعديل' })}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t({ en: 'Description', ar: 'الوصف' })}</p>
                <p className="text-sm">{selectedRisk.description || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t({ en: 'Mitigation Strategy', ar: 'استراتيجية التخفيف' })}</p>
                <p className="text-sm">{selectedRisk.mitigation_strategy || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t({ en: 'Contingency Plan', ar: 'خطة الطوارئ' })}</p>
                <p className="text-sm">{selectedRisk.contingency_plan || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t({ en: 'Owner', ar: 'المسؤول' })}</p>
                <p className="text-sm">{selectedRisk.owner || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <RiskDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        risk={dialogState.risk}
        onSave={handleSaveRisk}
        language={language}
        t={t}
      />
    </div>
  );
}
