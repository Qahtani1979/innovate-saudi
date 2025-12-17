import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, AlertTriangle, Plus, X, Shield, ChevronDown, ChevronUp, 
  CheckCircle2, ListChecks, Grid3X3, BarChart3, User, FileText,
  TrendingUp, TrendingDown, Minus, Target
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useTaxonomy } from '@/contexts/TaxonomyContext';
import { useRiskAssessment } from '@/hooks/strategy/useRiskAssessment';
import { cn } from '@/lib/utils';

const LEVEL_OPTIONS = [
  { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'bg-green-100 text-green-800 border-green-300', score: 1 },
  { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', score: 2 },
  { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'bg-red-100 text-red-800 border-red-300', score: 3 }
];

const STATUS_OPTIONS = [
  { value: 'identified', label: { en: 'Identified', ar: 'محدد' }, icon: Target, color: 'text-blue-500' },
  { value: 'mitigating', label: { en: 'Mitigating', ar: 'قيد التخفيف' }, icon: TrendingDown, color: 'text-yellow-500' },
  { value: 'resolved', label: { en: 'Resolved', ar: 'تم الحل' }, icon: CheckCircle2, color: 'text-green-500' },
  { value: 'accepted', label: { en: 'Accepted', ar: 'مقبول' }, icon: Minus, color: 'text-gray-500' }
];

const RISK_APPETITE_OPTIONS = [
  { value: 'low', label: { en: 'Low (Risk Averse)', ar: 'منخفض (تجنب المخاطر)' }, description: { en: 'Minimize all risks', ar: 'تقليل جميع المخاطر' } },
  { value: 'moderate', label: { en: 'Moderate (Balanced)', ar: 'معتدل (متوازن)' }, description: { en: 'Accept calculated risks', ar: 'قبول المخاطر المحسوبة' } },
  { value: 'high', label: { en: 'High (Risk Tolerant)', ar: 'مرتفع (تحمل المخاطر)' }, description: { en: 'Embrace strategic risks', ar: 'تقبل المخاطر الاستراتيجية' } }
];

export default function Step7Risks({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly = false,
  strategicPlanId = null
}) {
  const { language, t, isRTL } = useLanguage();
  const { riskCategories } = useTaxonomy();
  const [activeTab, setActiveTab] = useState('register');
  const [expandedRisks, setExpandedRisks] = useState({});
  
  const {
    risks: dbRisks,
    loading: dbLoading,
    saving: dbSaving,
    saveRisk,
    deleteRisk
  } = useRiskAssessment(strategicPlanId);
  
  useEffect(() => {
    if (strategicPlanId && dbRisks?.length > 0 && !dbLoading && !data.risks?.length) {
      onChange({ risks: dbRisks });
    }
  }, [strategicPlanId, dbRisks, dbLoading]);

  // Calculate statistics
  const stats = useMemo(() => {
    const risks = data.risks || [];
    let highRisk = 0, mediumRisk = 0, lowRisk = 0;
    let mitigated = 0, resolved = 0;

    risks.forEach(r => {
      const score = r.risk_score || 0;
      if (score >= 6) highRisk++;
      else if (score >= 3) mediumRisk++;
      else lowRisk++;
      
      if (r.status === 'mitigating') mitigated++;
      if (r.status === 'resolved') resolved++;
    });

    return {
      total: risks.length,
      highRisk,
      mediumRisk,
      lowRisk,
      mitigated,
      resolved,
      withMitigation: risks.filter(r => r.mitigation_strategy_en || r.mitigation_strategy_ar || r.mitigation_strategy).length
    };
  }, [data.risks]);

  // Calculate completeness score
  const completenessScore = useMemo(() => {
    if (stats.total === 0) return 0;
    
    let score = 0;
    const risks = data.risks || [];
    
    // 30% for having risks identified
    score += Math.min((stats.total / 5) * 30, 30);
    
    // 30% for risk appetite defined
    if (data.risk_appetite) score += 30;
    
    // 40% for mitigation strategies
    score += (stats.withMitigation / Math.max(stats.total, 1)) * 40;
    
    return Math.round(Math.min(score, 100));
  }, [stats, data.risk_appetite]);

  // Risk Matrix data
  const riskMatrix = useMemo(() => ({
    high_high: (data.risks || []).filter(r => r.likelihood === 'high' && r.impact === 'high'),
    high_medium: (data.risks || []).filter(r => r.likelihood === 'high' && r.impact === 'medium'),
    high_low: (data.risks || []).filter(r => r.likelihood === 'high' && r.impact === 'low'),
    medium_high: (data.risks || []).filter(r => r.likelihood === 'medium' && r.impact === 'high'),
    medium_medium: (data.risks || []).filter(r => r.likelihood === 'medium' && r.impact === 'medium'),
    medium_low: (data.risks || []).filter(r => r.likelihood === 'medium' && r.impact === 'low'),
    low_high: (data.risks || []).filter(r => r.likelihood === 'low' && r.impact === 'high'),
    low_medium: (data.risks || []).filter(r => r.likelihood === 'low' && r.impact === 'medium'),
    low_low: (data.risks || []).filter(r => r.likelihood === 'low' && r.impact === 'low')
  }), [data.risks]);

  const toggleRisk = (id) => {
    setExpandedRisks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addRisk = () => {
    if (isReadOnly) return;
    const newRisk = {
      id: Date.now().toString(),
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      category: 'OPERATIONAL',
      likelihood: 'medium',
      impact: 'medium',
      risk_score: 4,
      mitigation_strategy_en: '',
      mitigation_strategy_ar: '',
      contingency_plan_en: '',
      contingency_plan_ar: '',
      owner: '',
      status: 'identified'
    };
    onChange({ risks: [...(data.risks || []), newRisk] });
    setExpandedRisks(prev => ({ ...prev, [newRisk.id]: true }));
  };

  const updateRisk = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...(data.risks || [])];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'likelihood' || field === 'impact') {
      const scores = { low: 1, medium: 2, high: 3 };
      const likelihood = field === 'likelihood' ? value : updated[index].likelihood;
      const impact = field === 'impact' ? value : updated[index].impact;
      updated[index].risk_score = scores[likelihood] * scores[impact];
    }
    
    onChange({ risks: updated });
  };

  const removeRisk = (index) => {
    if (isReadOnly) return;
    onChange({ risks: data.risks.filter((_, i) => i !== index) });
  };

  const getRiskColor = (score) => {
    if (score >= 6) return 'bg-red-500 text-white';
    if (score >= 3) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  const getDisplayTitle = (risk) => {
    if (risk.title_en || risk.title_ar) {
      return language === 'ar' ? (risk.title_ar || risk.title_en) : (risk.title_en || risk.title_ar);
    }
    return risk.title || t({ en: 'Untitled Risk', ar: 'خطر بدون عنوان' });
  };

  const isRiskComplete = (risk) => {
    return !!(risk.title_en || risk.title_ar) && 
           !!(risk.mitigation_strategy_en || risk.mitigation_strategy_ar || risk.mitigation_strategy);
  };

  // Circular Progress Component
  const CircularProgress = ({ value, size = 120 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted/20" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-primary transition-all duration-500" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
          <span className="text-xs text-muted-foreground">{t({ en: 'Complete', ar: 'مكتمل' })}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <Card className="bg-gradient-to-br from-background to-muted/30 border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <CircularProgress value={completenessScore} />
            
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Total Risks', ar: 'إجمالي المخاطر' })}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-red-500">{stats.highRisk}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'High Risk', ar: 'مخاطر عالية' })}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-yellow-500">{stats.mediumRisk}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Medium Risk', ar: 'مخاطر متوسطة' })}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-green-500">{stats.withMitigation}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'With Mitigation', ar: 'مع تخفيف' })}</div>
              </div>
            </div>

            {!isReadOnly && (
              <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2 shrink-0">
                <Sparkles className="w-4 h-4" />
                {isGenerating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Identify Risks', ar: 'تحديد المخاطر' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Appetite */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-primary" />
            {t({ en: 'Risk Appetite', ar: 'تحمل المخاطر' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.risk_appetite || 'moderate'}
            onValueChange={(v) => !isReadOnly && onChange({ risk_appetite: v })}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            disabled={isReadOnly}
          >
            {RISK_APPETITE_OPTIONS.map(opt => (
              <div 
                key={opt.value} 
                className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                  data.risk_appetite === opt.value ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                )}
                onClick={() => !isReadOnly && onChange({ risk_appetite: opt.value })}
              >
                <RadioGroupItem value={opt.value} id={opt.value} disabled={isReadOnly} />
                <div>
                  <Label htmlFor={opt.value} className="font-medium cursor-pointer">{opt.label[language]}</Label>
                  <p className="text-xs text-muted-foreground mt-1">{opt.description[language]}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="register" className="gap-2">
            <ListChecks className="w-4 h-4" />
            {t({ en: 'Risk Register', ar: 'سجل المخاطر' })}
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            {t({ en: 'Risk Matrix', ar: 'مصفوفة المخاطر' })}
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {t({ en: 'Summary', ar: 'الملخص' })}
          </TabsTrigger>
        </TabsList>

        {/* Register Tab */}
        <TabsContent value="register" className="space-y-4">
          {!isReadOnly && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={addRisk}>
                <Plus className="w-4 h-4 mr-1" />
                {t({ en: 'Add Risk', ar: 'إضافة خطر' })}
              </Button>
            </div>
          )}

          {(data.risks || []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">{t({ en: 'No risks identified yet', ar: 'لم يتم تحديد مخاطر بعد' })}</p>
                {!isReadOnly && (
                  <Button variant="link" onClick={addRisk} className="mt-2">
                    <Plus className="w-4 h-4 mr-1" />
                    {t({ en: 'Add your first risk', ar: 'أضف أول خطر' })}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.risks.map((risk, index) => {
                const isExpanded = expandedRisks[risk.id];
                const complete = isRiskComplete(risk);
                const StatusIcon = STATUS_OPTIONS.find(s => s.value === risk.status)?.icon || Target;
                const statusColor = STATUS_OPTIONS.find(s => s.value === risk.status)?.color || 'text-gray-500';

                return (
                  <Collapsible key={risk.id} open={isExpanded} onOpenChange={() => toggleRisk(risk.id)}>
                    <Card className={cn("border-2 transition-all", complete && "border-green-300")}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={getRiskColor(risk.risk_score)}>{risk.risk_score || 0}</Badge>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{getDisplayTitle(risk)}</span>
                                  {complete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    {riskCategories.find(c => c.code === risk.category)?.[`name_${language}`] || risk.category}
                                  </Badge>
                                  <StatusIcon className={cn("w-3 h-3", statusColor)} />
                                  <span>{STATUS_OPTIONS.find(s => s.value === risk.status)?.label[language]}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {risk.owner && (
                                <Badge variant="secondary" className="text-xs">
                                  <User className="w-3 h-3 mr-1" />
                                  {risk.owner}
                                </Badge>
                              )}
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                          {/* Title */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs">{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })} *</Label>
                              <Input
                                value={risk.title_en || risk.title || ''}
                                onChange={(e) => updateRisk(index, 'title_en', e.target.value)}
                                placeholder={t({ en: 'Brief risk title', ar: 'عنوان موجز' })}
                                className={cn(risk.title_en && "border-green-300")}
                                disabled={isReadOnly}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                              <Input
                                value={risk.title_ar || ''}
                                onChange={(e) => updateRisk(index, 'title_ar', e.target.value)}
                                placeholder={t({ en: 'Arabic title', ar: 'العنوان بالعربية' })}
                                dir="rtl"
                                className={cn(risk.title_ar && "border-green-300")}
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>

                          {/* Category, Likelihood, Impact */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-xs">{t({ en: 'Category', ar: 'الفئة' })}</Label>
                              <Select value={risk.category} onValueChange={(v) => updateRisk(index, 'category', v)} disabled={isReadOnly}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {riskCategories.map(cat => (
                                    <SelectItem key={cat.code} value={cat.code}>{cat[`name_${language}`]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">{t({ en: 'Likelihood', ar: 'الاحتمالية' })}</Label>
                              <Select value={risk.likelihood} onValueChange={(v) => updateRisk(index, 'likelihood', v)} disabled={isReadOnly}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {LEVEL_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <span className={cn("px-2 py-0.5 rounded text-xs", opt.color)}>{opt.label[language]}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">{t({ en: 'Impact', ar: 'التأثير' })}</Label>
                              <Select value={risk.impact} onValueChange={(v) => updateRisk(index, 'impact', v)} disabled={isReadOnly}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {LEVEL_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <span className={cn("px-2 py-0.5 rounded text-xs", opt.color)}>{opt.label[language]}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs">{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                              <Textarea
                                value={risk.description_en || risk.description || ''}
                                onChange={(e) => updateRisk(index, 'description_en', e.target.value)}
                                placeholder={t({ en: 'Describe the risk...', ar: 'وصف الخطر...' })}
                                rows={2}
                                disabled={isReadOnly}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                              <Textarea
                                value={risk.description_ar || ''}
                                onChange={(e) => updateRisk(index, 'description_ar', e.target.value)}
                                placeholder={t({ en: 'Arabic description', ar: 'الوصف بالعربية' })}
                                rows={2}
                                dir="rtl"
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>

                          {/* Mitigation & Contingency */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">{t({ en: 'Mitigation Strategy', ar: 'استراتيجية التخفيف' })}</Label>
                              <Input
                                value={risk.mitigation_strategy_en || risk.mitigation_strategy || ''}
                                onChange={(e) => updateRisk(index, 'mitigation_strategy_en', e.target.value)}
                                placeholder={t({ en: 'English...', ar: 'إنجليزي...' })}
                                className={cn((risk.mitigation_strategy_en || risk.mitigation_strategy) && "border-green-300")}
                                disabled={isReadOnly}
                              />
                              <Input
                                value={risk.mitigation_strategy_ar || ''}
                                onChange={(e) => updateRisk(index, 'mitigation_strategy_ar', e.target.value)}
                                placeholder={t({ en: 'Arabic...', ar: 'عربي...' })}
                                dir="rtl"
                                disabled={isReadOnly}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">{t({ en: 'Contingency Plan', ar: 'خطة الطوارئ' })}</Label>
                              <Input
                                value={risk.contingency_plan_en || risk.contingency_plan || ''}
                                onChange={(e) => updateRisk(index, 'contingency_plan_en', e.target.value)}
                                placeholder={t({ en: 'English...', ar: 'إنجليزي...' })}
                                disabled={isReadOnly}
                              />
                              <Input
                                value={risk.contingency_plan_ar || ''}
                                onChange={(e) => updateRisk(index, 'contingency_plan_ar', e.target.value)}
                                placeholder={t({ en: 'Arabic...', ar: 'عربي...' })}
                                dir="rtl"
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>

                          {/* Owner & Status */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs">{t({ en: 'Risk Owner', ar: 'مالك الخطر' })}</Label>
                              <Input
                                value={risk.owner}
                                onChange={(e) => updateRisk(index, 'owner', e.target.value)}
                                placeholder={t({ en: 'Name or role', ar: 'الاسم أو الدور' })}
                                disabled={isReadOnly}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t({ en: 'Status', ar: 'الحالة' })}</Label>
                              <Select value={risk.status} onValueChange={(v) => updateRisk(index, 'status', v)} disabled={isReadOnly}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <div className="flex items-center gap-2">
                                        <opt.icon className={cn("w-4 h-4", opt.color)} />
                                        {opt.label[language]}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Delete Button */}
                          {!isReadOnly && (
                            <div className="flex justify-end pt-2 border-t">
                              <Button variant="ghost" size="sm" onClick={() => removeRisk(index)} className="text-destructive hover:text-destructive">
                                <X className="w-4 h-4 mr-1" />
                                {t({ en: 'Remove Risk', ar: 'إزالة الخطر' })}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Matrix Tab */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                {t({ en: 'Risk Assessment Matrix', ar: 'مصفوفة تقييم المخاطر' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.total === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t({ en: 'Add risks to see the matrix', ar: 'أضف مخاطر لرؤية المصفوفة' })}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-1 text-xs">
                    <div className="p-2 text-center font-medium">{t({ en: 'Likelihood →', ar: 'الاحتمالية →' })}</div>
                    <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'Low Impact', ar: 'تأثير منخفض' })}</div>
                    <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'Medium', ar: 'متوسط' })}</div>
                    <div className="text-center font-medium p-2 bg-muted rounded">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</div>
                    
                    <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'High', ar: 'مرتفع' })}</div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded min-h-[80px]">
                      {riskMatrix.high_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded min-h-[80px]">
                      {riskMatrix.high_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded min-h-[80px]">
                      {riskMatrix.high_high.map(r => <Badge key={r.id} variant="destructive" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    
                    <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'Medium', ar: 'متوسط' })}</div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded min-h-[80px]">
                      {riskMatrix.medium_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded min-h-[80px]">
                      {riskMatrix.medium_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded min-h-[80px]">
                      {riskMatrix.medium_high.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    
                    <div className="font-medium p-2 bg-muted rounded text-center">{t({ en: 'Low', ar: 'منخفض' })}</div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded min-h-[80px]">
                      {riskMatrix.low_low.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded min-h-[80px]">
                      {riskMatrix.low_medium.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded min-h-[80px]">
                      {riskMatrix.low_high.map(r => <Badge key={r.id} variant="outline" className="text-[10px] m-0.5 block">{getDisplayTitle(r)}</Badge>)}
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-6 mt-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-200"></div> {t({ en: 'Low Risk', ar: 'خطر منخفض' })}</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-200"></div> {t({ en: 'Medium Risk', ar: 'خطر متوسط' })}</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-200"></div> {t({ en: 'High Risk', ar: 'خطر عالي' })}</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-200"></div> {t({ en: 'Critical', ar: 'حرج' })}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t({ en: 'Risk Distribution', ar: 'توزيع المخاطر' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t({ en: 'High Risk', ar: 'مخاطر عالية' })}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.total > 0 ? (stats.highRisk / stats.total) * 100 : 0} className="w-24 h-2" />
                    <span className="text-sm font-bold text-red-500">{stats.highRisk}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t({ en: 'Medium Risk', ar: 'مخاطر متوسطة' })}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.total > 0 ? (stats.mediumRisk / stats.total) * 100 : 0} className="w-24 h-2" />
                    <span className="text-sm font-bold text-yellow-500">{stats.mediumRisk}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t({ en: 'Low Risk', ar: 'مخاطر منخفضة' })}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={stats.total > 0 ? (stats.lowRisk / stats.total) * 100 : 0} className="w-24 h-2" />
                    <span className="text-sm font-bold text-green-500">{stats.lowRisk}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t({ en: 'Risk Status', ar: 'حالة المخاطر' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {STATUS_OPTIONS.map(status => {
                    const count = (data.risks || []).filter(r => r.status === status.value).length;
                    return (
                      <div key={status.value} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <status.icon className={cn("w-5 h-5", status.color)} />
                        <div>
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">{status.label[language]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t({ en: 'Risk Appetite Alignment', ar: 'توافق تحمل المخاطر' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "p-4 rounded-lg border-2 text-center",
                data.risk_appetite === 'low' && stats.highRisk > 0 ? "bg-red-50 border-red-300" :
                data.risk_appetite === 'moderate' && stats.highRisk > 2 ? "bg-yellow-50 border-yellow-300" :
                "bg-green-50 border-green-300"
              )}>
                <p className="text-sm">
                  {data.risk_appetite === 'low' && stats.highRisk > 0 
                    ? t({ en: `Warning: ${stats.highRisk} high risks exceed low risk appetite`, ar: `تحذير: ${stats.highRisk} مخاطر عالية تتجاوز تحمل المخاطر المنخفض` })
                    : data.risk_appetite === 'moderate' && stats.highRisk > 2
                    ? t({ en: 'Consider addressing high-risk items', ar: 'فكر في معالجة عناصر المخاطر العالية' })
                    : t({ en: 'Risk profile aligns with appetite', ar: 'ملف المخاطر متوافق مع التحمل' })
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
